/**
 * Settlements Page Loader
 * Simplified for client-side rendering in Figma Make
 */

import type { LoaderFunctionArgs } from 'react-router';

export async function settlementsLoader({ request }: LoaderFunctionArgs) {
  console.log('[Settlements Loader] Skipping SSR - client will fetch data');
  return null;
}