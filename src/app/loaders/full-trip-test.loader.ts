/**
 * Full Trip Test Page Loader
 * Simplified for client-side rendering in Figma Make
 */

import type { LoaderFunctionArgs } from 'react-router';

export async function fullTripTestLoader({ request }: LoaderFunctionArgs) {
  console.log('[Full Trip Test Loader] Skipping SSR - client will fetch data');
  return null;
}