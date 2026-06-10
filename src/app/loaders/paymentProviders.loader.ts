import type { LoaderFunctionArgs } from 'react-router';

/**
 * Payment Providers Page Loader
 * Simplified for client-side rendering in Figma Make
 */

export async function paymentProvidersLoader({ request }: LoaderFunctionArgs) {
  console.log('[Payment Providers Loader] Returning empty transactions array for safe defaults');
  // ✅ FIX: Return object with empty transactions array instead of null
  return { transactions: [] };
}