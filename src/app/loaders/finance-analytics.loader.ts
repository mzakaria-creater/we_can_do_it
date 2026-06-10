/**
 * Finance Analytics Page Loader
 * Simplified for client-side rendering in Figma Make
 */

import type { LoaderFunctionArgs } from 'react-router';

export async function financeAnalyticsLoader({ request }: LoaderFunctionArgs) {
  console.log('[Finance Analytics Loader] Skipping SSR - client will fetch data');
  return null;
}