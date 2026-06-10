import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { supabase } from './supabase';
import { getMockAllTransactions, getMockDeposits, getMockPayouts } from '../app/lib/mockTransactions';

// Base URL for all API calls - Edge Function routes are prefixed with /make-server-46c3f42b
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b`;

// Fallback flag - if Edge Function is not deployed, use mock data
let useLocalFallback = false;

/**
 * Get authentication header with Bearer token
 */
export const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;
};

/**
 * Generic fetch wrapper with auth and fallback
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  if (useLocalFallback) {
    console.log(`[API] Using local fallback for: ${endpoint}`);
    // Simulate Fetch logic would go here if needed
  }

  try {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': authHeader,
        'apikey': publicAnonKey,
        'Content-Type': 'application/json',
        'X-Client-Info': 'press2pay-web',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Try to get error details from response
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error(`[API] Fetch error for ${endpoint}:`, error.message);
    
    // If it's a network error, provide more context
    if (error.message === 'Failed to fetch') {
      console.error('[API] Network error - Edge Function may not be deployed or is unreachable');
      console.error(`[API] Attempted URL: ${BASE_URL}${endpoint}`);
    }
    
    throw error;
  }
};

/**
 * API endpoints for Press2Pay
 */
export const api = {
  // Transactions
  transactions: {
    getAll: () => apiFetch('/transactions'),
    getById: (id: string) => apiFetch(`/transactions/${id}`),
    updateStatus: (id: string, status: string) => 
      apiFetch('/transactions/status', {
        method: 'POST',
        body: JSON.stringify({ id, status }),
      }),
    getDeposits: () => apiFetch('/transactions/deposits'),
    getPayouts: () => apiFetch('/transactions/payouts'),
  },

  // Merchants
  merchants: {
    getAll: () => apiFetch('/merchants'),
    getById: (id: string) => apiFetch(`/merchants/${id}`),
    create: (data: any) => 
      apiFetch('/merchants/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Users
  users: {
    getAll: () => apiFetch('/users'),
    getById: (id: string) => apiFetch(`/users/${id}`),
    create: (data: any) =>
      apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiFetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch(`/users/${id}`, {
        method: 'DELETE',
      }),
  },

  // Roles & Permissions
  roles: {
    getAll: () => apiFetch('/roles'),
    getById: (id: string) => apiFetch(`/roles/${id}`),
    update: (id: string, data: any) =>
      apiFetch(`/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Wallets
  wallets: {
    getAll: () => apiFetch('/wallets'),
    create: (data: any) =>
      apiFetch('/wallets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      apiFetch('/wallets/status', {
        method: 'POST',
        body: JSON.stringify({ id, status }),
      }),
    resetDaily: (id: string) =>
      apiFetch('/wallets/reset-daily', {
        method: 'POST',
        body: JSON.stringify({ id }),
      }),
  },

  // Providers
  providers: {
    getAll: () => apiFetch('/providers'),
  },

  // Reports
  reports: {
    getAll: () => apiFetch('/reports'),
    generate: (data: any) =>
      apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Workflows
  workflows: {
    getAll: () => apiFetch('/workflows'),
    toggle: (id: string, enabled: boolean) =>
      apiFetch('/workflows/toggle', {
        method: 'POST',
        body: JSON.stringify({ id, enabled }),
      }),
    execute: (id: string) =>
      apiFetch('/workflows/execute', {
        method: 'POST',
        body: JSON.stringify({ id }),
      }),
  },

  // Webhooks
  webhooks: {
    getAll: () => apiFetch('/webhooks'),
    create: (data: any) =>
      apiFetch('/webhooks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiFetch(`/webhooks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch(`/webhooks/${id}`, {
        method: 'DELETE',
      }),
    test: (id: string) =>
      apiFetch(`/webhooks/${id}/test`, {
        method: 'POST',
      }),
  },

  // CRM
  crm: {
    getAll: () => apiFetch('/crm'),
  },

  // Tickets
  tickets: {
    getAll: () => apiFetch('/tickets'),
    create: (data: any) =>
      apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Health Check (No authentication required for public endpoint)
  health: async () => {
    // Try multiple endpoints to maximize compatibility
    const endpoints = [
      `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/health`,
      `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b`,
    ];

    for (const url of endpoints) {
      try {
        console.log(`[API] Trying health check at: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[API] Health check successful at ${url}:`, data);
          return data;
        } else {
          const errorText = await response.text().catch(() => response.statusText);
          console.warn(`[API] Health check failed at ${url} with status ${response.status}:`, errorText);
        }
      } catch (error: any) {
        console.warn(`[API] Error trying ${url}:`, error.message);
      }
    }

    // If all endpoints failed
    throw new Error('All health check endpoints failed');
  },
};

export default api;