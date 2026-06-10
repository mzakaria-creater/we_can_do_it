/**
 * Routes Configuration with SSR Loaders
 * Hybrid architecture: SSR for initial data + Client-side for real-time features
 */

import type { RouteObject } from 'react-router';
import { Navigate } from 'react-router';

// Loaders
import {
  dashboardLoader,
  transactionsLoader,
  reportsLoader,
  fullTripTestLoader,
} from './loaders';

// Pages (will be imported in App.tsx)
export const routesWithLoaders: Partial<RouteObject>[] = [
  // Dashboard - SSR initial stats
  {
    path: 'dashboard',
    loader: dashboardLoader,
    // Component will be added in App.tsx
  },

  // Transactions - SSR transaction list
  {
    path: 'transactions',
    loader: transactionsLoader,
    // Component will be added in App.tsx
  },

  // Reports - SSR heavy analytics
  {
    path: 'reports',
    loader: reportsLoader,
    // Component will be added in App.tsx
  },

  // Full Trip Test - SSR (Owner/Admin only)
  {
    path: 'full-trip-test',
    loader: fullTripTestLoader,
    // Component will be added in App.tsx with RoleGuard
  },
];

/**
 * Pages that DON'T need SSR loaders (client-side only)
 * These rely on real-time features or are lightweight
 */
export const clientOnlyRoutes = [
  'live-chat',
  'notifications',
  'realtime-demo',
  'settings',
  'profile',
  'api-console',
  'api-tester',
];

/**
 * Public routes (no auth required)
 */
export const publicRoutes = [
  '/login',
  '/signup',
  '/payment-kit',
  '/checkout/*',
  '/form/*',
  '/vodafone-cash-payment',
];
