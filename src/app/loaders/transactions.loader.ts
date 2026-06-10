/**
 * Transactions Page Loader
 * Simplified for client-side rendering in Figma Make
 */

import type { LoaderFunctionArgs } from 'react-router';

export async function transactionsLoader({ request }: LoaderFunctionArgs) {
  console.log('[Transactions Loader] Skipping SSR - client will fetch data');
  return null;
}