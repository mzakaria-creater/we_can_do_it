/**
 * Dashboard Page Loader
 * Integrates with Press2pay backend via API loaders
 */

import type { LoaderFunctionArgs } from 'react-router';
import { getSafeSession } from '../components/AuthGuard';
import { loadDashboardStats, loadWallets } from './api-loaders';

export async function dashboardLoader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSafeSession();
    
    // Parallel fetch for optimal performance
    const [dashboardData, walletsData] = await Promise.all([
      loadDashboardStats(session),
      loadWallets(session)
    ]);

    return {
      dashboardData,
      wallets: walletsData.wallets || [],
      loadedAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[Dashboard Loader] Error:', error);
    return {
      dashboardData: {
        stats: { totalVolume: 0, transactionCount: 0, merchantCount: 0, successRate: 0 },
        recentTransactions: [],
        error: error.message
      },
      wallets: [],
      loadedAt: new Date().toISOString()
    };
  }
}
