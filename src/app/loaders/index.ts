/**
 * Loaders Index
 * Exports all page loaders for Press2pay
 */

// SSR Utilities (kept for potential future use)
export * from './supabase-ssr';
export * from './api-loaders';

// Simplified Page Loaders (client-side only for Figma Make)
export { dashboardLoader } from './dashboard.loader';
export { transactionsLoader } from './transactions.loader';
export { reportsLoader } from './reports.loader';
export { payoutsLoader } from './payouts.loader';
export { merchantsLoader } from './merchants.loader';
export { usersLoader } from './users.loader';
export { walletsLoader } from './wallets.loader';
export { settlementsLoader } from './settlements.loader';
export { depositsLoader } from './deposits.loader';
export { fullTripTestLoader } from './full-trip-test.loader';
export { financeAnalyticsLoader } from './finance-analytics.loader';
export { paymentProvidersLoader } from './paymentProviders.loader';