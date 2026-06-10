/**
 * Users Page Loader
 * Fetches users data for the management portal
 */

import type { LoaderFunctionArgs } from 'react-router';
import { getSafeSession } from '../components/AuthGuard';
import { loadUsers } from './api-loaders';

export async function usersLoader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSafeSession();
    const usersData = await loadUsers(session);
    
    return {
      usersData,
      loadedAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[Users Loader] Page Loader Error:', error);
    return {
      usersData: { users: [], error: error.message },
      loadedAt: new Date().toISOString()
    };
  }
}
