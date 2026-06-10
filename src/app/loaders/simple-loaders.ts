/**
 * Simplified Client-Side Loaders for Figma Make
 * These loaders return null and let components handle their own data fetching
 */

import type { LoaderFunctionArgs } from 'react-router';

// Simple null loaders - components will handle their own data fetching
export async function dashboardLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function transactionsLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function reportsLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function payoutsLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function merchantsLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function usersLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function walletsLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function settlementsLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function depositsLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function fullTripTestLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function financeAnalyticsLoader({ request }: LoaderFunctionArgs) {
  return null;
}

export async function paymentProvidersLoader({ request }: LoaderFunctionArgs) {
  // ✅ FIX: Return object with empty transactions instead of null
  return { transactions: [] };
}