/**
 * Reports Page Loader
 * Simplified for client-side rendering in Figma Make
 */

import type { LoaderFunctionArgs } from 'react-router';

export async function reportsLoader({ request }: LoaderFunctionArgs) {
  console.log('[Reports Loader] Skipping SSR - client will fetch data');
  return null;
}