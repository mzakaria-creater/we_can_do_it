/**
 * Deposits Page Loader
 * Fetches deposits data for the management portal
 */

import type { LoaderFunctionArgs } from 'react-router';
import { getSafeSession } from '../components/AuthGuard';
import { loadDeposits } from './api-loaders';

export async function depositsLoader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSafeSession();
    const depositsData = await loadDeposits(session);
    
    return {
      depositsData,
      loadedAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[Deposits Loader] Page Loader Error:', error);
    return {
      depositsData: { deposits: [], error: error.message },
      loadedAt: new Date().toISOString()
    };
  }
}
