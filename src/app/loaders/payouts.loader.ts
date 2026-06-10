/**
 * Payouts Page Loader
 * Fetches payouts data for the management portal
 */

import type { LoaderFunctionArgs } from 'react-router';
import { getSafeSession } from '../components/AuthGuard';
import { loadPayouts } from './api-loaders';

export async function payoutsLoader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSafeSession();
    const url = new URL(request.url);
    const params = {
      status: url.searchParams.get('status') || undefined,
      searchTerm: url.searchParams.get('search') || undefined,
    };
    
    const payoutsData = await loadPayouts(session, params);
    
    return {
      payoutsData,
      loadedAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[Payouts Loader] Page Loader Error:', error);
    return {
      payoutsData: { payouts: [], error: error.message },
      loadedAt: new Date().toISOString()
    };
  }
}
