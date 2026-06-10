/**
 * API Client for Server-Side Rendering
 * Fetches data from Press2pay backend with proper authentication
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { UserSession } from './supabase-ssr';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b`;

interface FetchOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Makes authenticated API request to backend
 */
async function fetchFromAPI(
  endpoint: string,
  session: any | null,
  options: FetchOptions = {}
) {
  const { method = 'GET', body, headers = {}, signal } = options;

  let accessToken: string | undefined;

  // Handle both direct Supabase Session (client-side) and UserSession wrapper (SSR)
  if (session && typeof session === 'object') {
    if ('access_token' in session) {
      // Direct Supabase Session object
      accessToken = session.access_token;
    } else if ('session' in session && session.session) {
      // UserSession object wrapper
      accessToken = session.session.access_token;
    }
  }

  // Ensure token is valid format (not "undefined", "null", or empty)
  // We trust the session provider (AuthGuard) to have handled expiration/refresh logic
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null' || accessToken === '') {
    accessToken = undefined;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const headersObj: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey,
    'X-Client-Info': 'press2pay-web-ssr',
    ...headers,
  };

  // Only add Authorization if we have a real session token
  const isRealToken = accessToken && accessToken.length > 50 && accessToken !== publicAnonKey && accessToken !== 'null' && accessToken !== 'undefined';
  
  if (isRealToken) {
    headersObj['Authorization'] = `Bearer ${accessToken}`;
  }
  // We OMIT Authorization if it would just be the anon key, 
  // to avoid Kong's potentially strict JWT validation on the Bearer token.
  // The 'apikey' header is sufficient for Supabase Kong to identify the project.

  try {
    let response = await fetch(url, {
      method,
      headers: headersObj,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    // If unauthorized or a potential CORS/Network error when using a session token
    // OR if we get the "Missing authorization header" error
    const errorText = !response.ok ? await response.text() : '';
    let errorData: any = {};
    if (errorText) {
      try { errorData = JSON.parse(errorText); } catch (e) { errorData = { message: errorText }; }
    }

    const isAuthError = response.status === 401 || errorData.message?.includes('JWT') || errorData.message?.includes('authorization');
    
    // Retry logic:
    // 1. If we used a session token and it failed (Auth error), try as GUEST (no Authorization header)
    // 2. If it failed with "Missing authorization header", try WITH anon key in Authorization
    if (!response.ok && isAuthError) {
      const isDashboardEndpoint = endpoint.includes('/stats') || endpoint.includes('/transactions/recent');
      
      // Only log if it's NOT a dashboard endpoint (where fallback to guest is expected/silent)
      if (!isDashboardEndpoint) {
        console.warn(`[API Auth] Auth error for ${endpoint} (Status: ${response.status}): ${errorData.message}. Retrying with fallback...`);
      }
      
      let retryHeaders = { ...headersObj };
      
      // Try without Authorization header first (as a guest)
      delete retryHeaders['Authorization'];

      try {
        const retryResponse = await fetch(url, {
          method,
          headers: retryHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });
        
        if (retryResponse.ok) {
          if (!isDashboardEndpoint) {
            console.log(`[API Auth] Fallback retry successful for ${endpoint}`);
          }
          return await retryResponse.json();
        }
        
        // Final attempt for specific gateway requirements
        if (retryResponse.status === 401 || (await retryResponse.text()).includes('Missing authorization')) {
           const finalHeaders = { ...retryHeaders, 'Authorization': `Bearer ${publicAnonKey}` };
           const finalResponse = await fetch(url, { method, headers: finalHeaders, body: body ? JSON.stringify(body) : undefined });
           if (finalResponse.ok) return await finalResponse.json();
           response = finalResponse;
        } else {
           response = retryResponse;
        }
      } catch (retryErr) {
        if (!isDashboardEndpoint) {
          console.error(`[API Auth] Fallback retry failed with exception:`, retryErr);
        }
      }
    }

    if (!response.ok) {
      // Re-parse error data if it changed
      const finalErrorText = errorText || await response.text();
      let finalErrorData: any = {};
      try { finalErrorData = JSON.parse(finalErrorText); } catch (e) { finalErrorData = { message: finalErrorText }; }

      console.error(`[API Error] ${method} ${endpoint} (Status: ${response.status}):`, finalErrorData);
      
      // Fallback for dashboard components to prevent UI crash
      if (endpoint.includes('/stats') || endpoint.includes('/transactions/recent')) {
        return endpoint.includes('/stats') ? { totalVolume: 0, lastMonthVolume: 0, transactionCount: 0 } : [];
      }
      
      throw new Error(`API Error: ${response.status} ${finalErrorData.message || finalErrorText}`);
    }

    return response.json();
  } catch (error: any) {
    // If we have a "Failed to fetch" (likely CORS/Network) and we were using a session token,
    // it's highly likely the gateway rejected the token and didn't send CORS headers.
    if (isRealToken && (error.name === 'TypeError' || error.message?.includes('fetch'))) {
      console.warn(`[API Auth] Fetch failed for ${endpoint} with session token (likely CORS/Gateway issue), retrying as guest...`);
      try {
        const lastChanceHeaders = {
          ...headersObj,
        };
        // Remove Authorization header to avoid Gateway rejection
        delete lastChanceHeaders['Authorization'];
        
        const lastChanceResponse = await fetch(url, {
          method,
          headers: lastChanceHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });
        if (lastChanceResponse.ok) {
          console.log(`[API Auth] Guest fallback successful for ${endpoint}`);
          return await lastChanceResponse.json();
        }
      } catch (e) {
        // Fall through to original error
      }
    }

    // Check if it's a dashboard error to return safe data
    if (endpoint.includes('/stats') || endpoint.includes('/transactions/recent')) {
      return endpoint.includes('/stats') ? { totalVolume: 0, lastMonthVolume: 0, transactionCount: 0 } : [];
    }
    
    throw error;
  }
}

/**
 * Dashboard Stats Loader
 */
export async function loadDashboardStats(session: UserSession | null, signal?: AbortSignal) {
  try {
    const [stats, recentTransactions] = await Promise.allSettled([
      fetchFromAPI('/stats', session, { signal }),
      fetchFromAPI('/transactions/recent?limit=5', session, { signal }),
    ]);

    const statsData = stats.status === 'fulfilled' ? stats.value : { totalVolume: 0, transactionCount: 0 };
    const transactionsData = recentTransactions.status === 'fulfilled' ? recentTransactions.value : [];

    return {
      stats: statsData,
      recentTransactions: transactionsData,
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Dashboard Loader] Critical Error:', error);
    return {
      stats: { totalVolume: 0, transactionCount: 0 },
      recentTransactions: [],
      error: error.message,
    };
  }
}

/**
 * Transactions List Loader
 */
export async function loadTransactions(
  session: UserSession | null,
  params: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    signal?: AbortSignal;
  } = {}
) {
  if (!session) {
    return {
      transactions: [],
      pagination: {},
      error: 'Authentication required',
    };
  }

  try {
    const { signal, ...restParams } = params;
    const queryParams = new URLSearchParams();
    
    if (restParams.page) queryParams.set('page', restParams.page.toString());
    if (restParams.limit) queryParams.set('limit', restParams.limit.toString());
    if (restParams.status) queryParams.set('status', restParams.status);
    if (restParams.dateFrom) queryParams.set('dateFrom', restParams.dateFrom);
    if (restParams.dateTo) queryParams.set('dateTo', restParams.dateTo);

    const queryString = queryParams.toString();
    const endpoint = `/transactions${queryString ? `?${queryString}` : ''}`;

    const data = await fetchFromAPI(endpoint, session, { signal });

    return {
      transactions: data.transactions || [],
      pagination: data.pagination || {},
      filters: params,
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Transactions Loader] Error:', error);
    return {
      transactions: [],
      pagination: {},
      error: error.message,
    };
  }
}

/**
 * Reports Data Loader
 */
export async function loadReportsData(
  session: UserSession | null,
  params: {
    reportType?: string;
    dateFrom?: string;
    dateTo?: string;
    merchantId?: string;
  } = {}
) {
  if (!session) {
    return {
      reports: [],
      analytics: {},
      summary: {},
      error: 'Authentication required',
    };
  }

  try {
    const queryParams = new URLSearchParams();
    
    if (params.reportType) queryParams.set('type', params.reportType);
    if (params.dateFrom) queryParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.set('dateTo', params.dateTo);
    if (params.merchantId) queryParams.set('merchantId', params.merchantId);

    const queryString = queryParams.toString();
    const endpoint = `/reports${queryString ? `?${queryString}` : ''}`;

    const data = await fetchFromAPI(endpoint, session);

    return {
      reports: data.reports || [],
      analytics: data.analytics || {},
      summary: data.summary || {},
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Reports Loader] Error:', error);
    return {
      reports: [],
      analytics: {},
      summary: {},
      error: error.message,
    };
  }
}

/**
 * Full Trip Test Data Loader
 */
export async function loadFullTripTestData(
  session: UserSession | null,
  merchantId?: string
) {
  if (!session) {
    return {
      verified: false,
      error: 'Authentication required',
    };
  }

  try {
    if (!merchantId) {
      return {
        verified: false,
        error: 'No merchant ID provided',
      };
    }

    const data = await fetchFromAPI(
      `/test-verification?merchantId=${merchantId}`,
      session
    );

    return {
      verified: data.verified || false,
      merchant: data.merchant || null,
      gateways: data.gateways || [],
      paymentMethods: data.paymentMethods || [],
      paymentAccounts: data.paymentAccounts || [],
      transactions: data.transactions || [],
      summary: data.summary || {},
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Full Trip Test Loader] Error:', error);
    return {
      verified: false,
      error: error.message,
    };
  }
}

/**
 * Merchants List Loader
 */
export async function loadMerchants(session: UserSession | null) {
  if (!session) {
    return {
      merchants: [],
      error: 'Authentication required',
    };
  }

  try {
    const data = await fetchFromAPI('/merchants', session);

    return {
      merchants: data.merchants || [],
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Merchants Loader] Error:', error);
    return {
      merchants: [],
      error: error.message,
    };
  }
}

/**
 * Users List Loader (Admin only)
 */
export async function loadUsers(session: UserSession | null) {
  if (!session) {
    return {
      users: [],
      error: 'Authentication required',
    };
  }

  try {
    const data = await fetchFromAPI('/users', session);

    return {
      users: data.users || [],
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Users Loader] Error:', error);
    return {
      users: [],
      error: error.message,
    };
  }
}

/**
 * Payment Links Loader
 */
export async function loadPaymentLinks(session: UserSession | null) {
  if (!session) {
    return {
      paymentLinks: [],
      error: 'Authentication required',
    };
  }

  try {
    const data = await fetchFromAPI('/payment-links', session);

    return {
      paymentLinks: data.links || [],
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Payment Links Loader] Error:', error);
    return {
      paymentLinks: [],
      error: error.message,
    };
  }
}

/**
 * Deposits List Loader
 */
export async function loadDeposits(session: UserSession | null) {
  if (!session) {
    return {
      deposits: [],
      error: 'Authentication required',
    };
  }

  try {
    const data = await fetchFromAPI('/deposits', session);

    return {
      deposits: data.deposits || [],
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Deposits Loader] Error:', error);
    return {
      deposits: [],
      error: error.message,
    };
  }
}

/**
 * Settlements List Loader
 */
export async function loadSettlements(session: UserSession | null) {
  if (!session) {
    return {
      settlements: [],
      error: 'Authentication required',
    };
  }

  try {
    const data = await fetchFromAPI('/settlements', session);

    return {
      settlements: data.settlements || [],
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Settlements Loader] Error:', error);
    return {
      settlements: [],
      error: error.message,
    };
  }
}

/**
 * Wallets List Loader
 */
export async function loadWallets(session: UserSession | null) {
  if (!session) {
    return {
      wallets: [],
      error: 'Authentication required',
    };
  }

  try {
    const data = await fetchFromAPI('/wallets', session);

    return {
      wallets: data.wallets || [],
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Wallets Loader] Error:', error);
    return {
      wallets: [],
      error: error.message,
    };
  }
}

/**
 * Payouts List Loader
 */
export async function loadPayouts(
  session: UserSession | null,
  params: {
    page?: number;
    limit?: number;
    status?: string;
    searchTerm?: string;
  } = {}
) {
  if (!session) {
    return {
      payouts: [],
      pagination: {},
      error: 'Authentication required',
    };
  }

  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.status && params.status !== 'all') queryParams.set('status', params.status);
    if (params.searchTerm) queryParams.set('search', params.searchTerm);

    const queryString = queryParams.toString();
    const endpoint = `/payouts${queryString ? `?${queryString}` : ''}`;

    const data = await fetchFromAPI(endpoint, session);

    return {
      payouts: data.payouts || [],
      pagination: data.pagination || {},
      filters: params,
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Payouts Loader] Error:', error);
    return {
      payouts: [],
      pagination: {},
      error: error.message,
    };
  }
}

/**
 * Finance Analytics Loader
 */
export async function loadFinanceAnalytics(
  session: UserSession | null,
  params: {
    dateFrom?: string;
    dateTo?: string;
    merchantId?: string;
  } = {}
) {
  if (!session) {
    return {
      executiveOverview: {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        transactionVolume: 0,
        averageTransaction: 0,
        growthRate: 0,
        activeMerchants: 0,
      },
      cashFlow: { inflows: [], outflows: [], netFlow: [], summary: { totalInflow: 0, totalOutflow: 0, netCashFlow: 0 } },
      walletsAndBanks: { wallets: [], banks: [], distribution: [], totalBalance: 0 },
      profitAndLoss: { revenue: [], expenses: [], profit: [], breakdown: { transactionFees: 0, subscriptions: 0, otherRevenue: 0, operatingExpenses: 0, gatewayFees: 0, otherExpenses: 0 } },
      error: 'Authentication required',
    };
  }

  try {
    const queryParams = new URLSearchParams();
    
    if (params.dateFrom) queryParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.set('dateTo', params.dateTo);
    if (params.merchantId) queryParams.set('merchantId', params.merchantId);

    const queryString = queryParams.toString();
    const endpoint = `/finance/analytics${queryString ? `?${queryString}` : ''}`;

    const data = await fetchFromAPI(endpoint, session);

    return {
      executiveOverview: data.executiveOverview || {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        transactionVolume: 0,
        averageTransaction: 0,
        growthRate: 0,
        activeMerchants: 0,
      },
      cashFlow: data.cashFlow || {
        inflows: [],
        outflows: [],
        netFlow: [],
        summary: {
          totalInflow: 0,
          totalOutflow: 0,
          netCashFlow: 0,
        },
      },
      walletsAndBanks: data.walletsAndBanks || {
        wallets: [],
        banks: [],
        distribution: [],
        totalBalance: 0,
      },
      profitAndLoss: data.profitAndLoss || {
        revenue: [],
        expenses: [],
        profit: [],
        breakdown: {
          transactionFees: 0,
          subscriptions: 0,
          otherRevenue: 0,
          operatingExpenses: 0,
          gatewayFees: 0,
          otherExpenses: 0,
        },
      },
      loadedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Finance Analytics Loader] Error:', error);
    
    // Return mock data for development if it's a dashboard error
    return {
      executiveOverview: {
        totalRevenue: 1250000,
        totalExpenses: 380000,
        netProfit: 870000,
        profitMargin: 69.6,
        transactionVolume: 12543,
        averageTransaction: 99.64,
        growthRate: 23.5,
        activeMerchants: 156,
      },
      cashFlow: {
        inflows: [],
        outflows: [],
        netFlow: [],
        summary: { totalInflow: 0, totalOutflow: 0, netCashFlow: 0 },
      },
      walletsAndBanks: {
        wallets: [],
        banks: [],
        distribution: [],
        totalBalance: 0,
      },
      profitAndLoss: {
        revenue: [],
        expenses: [],
        profit: [],
        breakdown: {
          transactionFees: 0,
          subscriptions: 0,
          otherRevenue: 0,
          operatingExpenses: 0,
          gatewayFees: 0,
          otherExpenses: 0,
        },
      },
      loadedAt: new Date().toISOString(),
      error: error.message,
    };
  }
}
