/**
 * Merchants Page Loader
 * Fetches merchants data for the management portal
 */

import type { LoaderFunctionArgs } from 'react-router';
import { getSafeSession } from '../components/AuthGuard';
import { loadMerchants } from './api-loaders';

export async function merchantsLoader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSafeSession();
    const merchantsData = await loadMerchants(session);
    
    return {
      merchantsData,
      loadedAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[Merchants Loader] Page Loader Error:', error);
    return {
      merchantsData: { merchants: [], error: error.message },
      loadedAt: new Date().toISOString()
    };
  }
}
