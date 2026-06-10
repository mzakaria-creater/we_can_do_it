/**
 * Wallets Page Loader
 * Fetches wallets data for the management portal
 */

import type { LoaderFunctionArgs } from 'react-router';
import { getSafeSession } from '../components/AuthGuard';
import { loadWallets } from './api-loaders';

export async function walletsLoader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSafeSession();
    const walletsData = await loadWallets(session);
    
    return {
      walletsData,
      loadedAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[Wallets Loader] Page Loader Error:', error);
    return {
      walletsData: { wallets: [], error: error.message },
      loadedAt: new Date().toISOString()
    };
  }
}
