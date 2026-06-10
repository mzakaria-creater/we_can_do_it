/**
 * Press2Pay Routes Types & Helpers
 * نظام Type-Safe للتنقل بين الصفحات
 */

import { useNavigate, useParams } from 'react-router';
import { useStore } from '../../lib/store';
import { routesMetadata, type RouteMetadata } from './routes';

/**
 * Route Paths - Type-Safe
 */
export type RoutePath = 
  // Main
  | 'dashboard'
  | 'transactions'
  | 'transactions/advanced'
  | 'transactions/details/:id'
  | 'analytics'
  | 'reports'
  | 'profile'
  | 'notifications'
  
  // Financial
  | 'wallets'
  | 'wallets-new'
  | 'wallet-allocation'
  | 'deposits'
  | 'payouts'
  | 'payout-details/:id'
  | 'settlements'
  | 'deposit-payout-report'
  | 'finance-analytics'
  | 'pricing-fees-engine'
  | 'financial'
  | 'financial/transactions'
  | 'financial/reports'
  
  // Merchants
  | 'merchants'
  | 'merchants/new'
  | 'merchants/:id'
  | 'merchants-portal'
  
  // Users & Agents
  | 'users'
  | 'users/create'
  | 'agents'
  | 'team-management'
  | 'rcba'
  
  // Payment System
  | 'payment-providers'
  | 'gateway-config'
  | 'pay-method-types'
  | 'payment-forms-config'
  | 'payment-links'
  | 'payment-kit'
  | 'vodafone-cash-payment'
  | 'checkout-template2'
  
  // Developer Tools
  | 'api-docs'
  | 'api-management'
  | 'api-console'
  | 'api-tester'
  | 'api-authentication'
  | 'developers'
  | 'webhooks'
  | 'hash-security'
  | 'oauth-settings'
  | 'backend-tester'
  | 'supabase-example'
  
  // Operations
  | 'operations'
  | 'n8n-workflows'
  | 'data-automation'
  | 'crm'
  | 'support-tickets'
  | 'risk-aml'
  | 'categories'
  | 'categories/:categoryId'
  
  // Forms
  | 'forms'
  | 'forms/builder'
  | 'forms/preview/:id'
  | 'forms/standalone/:id'
  | 'form-builder'
  | 'forms-table'
  | 'form-preview/:id'
  | 'standalone-form/:id'
  
  // Administration
  | 'settings'
  | 'audit-logs'
  | 'codes-registry'
  | 'enterprise-architecture'
  | 'boarding-review'
  | 'full-trip-test'
  
  // Testing
  | 'realtime-demo'
  
  // Auth (Public)
  | 'login'
  | 'forgot-password';

/**
 * Build Full Path with Language
 */
export const buildPath = (
  path: RoutePath,
  params?: Record<string, string>,
  lang?: 'ar' | 'en'
): string => {
  let fullPath = path as string;
  
  // Replace params in path
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      fullPath = fullPath.replace(`:${key}`, value);
    });
  }
  
  // Add language prefix
  const language = lang || 'ar';
  return `/${language}/${fullPath}`;
};

/**
 * Custom Hook: Type-Safe Navigation
 */
export const useTypedNavigate = () => {
  const navigate = useNavigate();
  const { language } = useStore();
  
  return (
    path: RoutePath,
    params?: Record<string, string>,
    options?: { replace?: boolean; state?: any }
  ) => {
    const fullPath = buildPath(path, params, language);
    navigate(fullPath, options);
  };
};

/**
 * Custom Hook: Get Current Route Metadata
 */
export const useCurrentRoute = (): RouteMetadata | undefined => {
  const { lang, '*': wildcard } = useParams();
  const currentPath = wildcard || '';
  
  // Find matching route metadata
  const metadata = Object.values(routesMetadata).find(route => {
    // Exact match
    if (route.path === currentPath) return true;
    
    // Match with params (e.g., transactions/details/:id)
    const pathParts = route.path.split('/');
    const currentParts = currentPath.split('/');
    
    if (pathParts.length !== currentParts.length) return false;
    
    return pathParts.every((part, index) => {
      if (part.startsWith(':')) return true; // Param placeholder
      return part === currentParts[index];
    });
  });
  
  return metadata;
};

/**
 * Custom Hook: Check if User Can Access Route
 */
export const useRouteAccess = (path: RoutePath): boolean => {
  const { user } = useStore();
  
  if (!user) return false;
  
  const metadata = Object.values(routesMetadata).find(r => r.path === path);
  if (!metadata) return false;
  
  // No role restrictions = accessible to all authenticated users
  if (!metadata.roles || metadata.roles.length === 0) return true;
  
  // Check if user role is in allowed roles
  return metadata.roles.includes(user.role);
};

/**
 * Get Breadcrumbs for Current Route
 */
export const useBreadcrumbs = () => {
  const { lang, '*': wildcard } = useParams();
  const currentPath = wildcard || '';
  
  const parts = currentPath.split('/').filter(Boolean);
  
  return parts.map((part, index) => {
    const path = parts.slice(0, index + 1).join('/') as RoutePath;
    const metadata = Object.values(routesMetadata).find(r => r.path === path);
    
    return {
      path: buildPath(path, undefined, lang as 'ar' | 'en'),
      label: metadata?.titleKey || part,
      isLast: index === parts.length - 1,
    };
  });
};

/**
 * Route Groups for Navigation Menu
 */
export const getNavigationGroups = (userRole?: string) => {
  const groups: Record<string, RouteMetadata[]> = {
    main: [],
    financial: [],
    operations: [],
    merchant: [],
    developer: [],
    admin: [],
  };
  
  Object.values(routesMetadata).forEach(route => {
    // Skip auth routes
    if (route.path === 'login' || route.path === 'forgot-password') return;
    
    // Check role access
    if (userRole && route.roles && route.roles.length > 0) {
      if (!route.roles.includes(userRole)) return;
    }
    
    // Add to appropriate group
    if (route.category && groups[route.category]) {
      groups[route.category].push(route);
    }
  });
  
  return groups;
};

/**
 * Quick Navigation Helpers
 */
export const navigation = {
  // Main
  toDashboard: () => buildPath('dashboard'),
  toTransactions: () => buildPath('transactions'),
  toTransaction: (id: string) => buildPath('transactions/details/:id', { id }),
  toAnalytics: () => buildPath('analytics'),
  toReports: () => buildPath('reports'),
  
  // Financial
  toWallets: () => buildPath('wallets'),
  toDeposits: () => buildPath('deposits'),
  toPayouts: () => buildPath('payouts'),
  toPayout: (id: string) => buildPath('payout-details/:id', { id }),
  toSettlements: () => buildPath('settlements'),
  toFinanceAnalytics: () => buildPath('finance-analytics'),
  
  // Merchants
  toMerchants: () => buildPath('merchants'),
  toMerchant: (id: string) => buildPath('merchants/:id', { id }),
  toNewMerchant: () => buildPath('merchants/new'),
  toMerchantsPortal: () => buildPath('merchants-portal'),
  
  // Users
  toUsers: () => buildPath('users'),
  toNewUser: () => buildPath('users/create'),
  toAgents: () => buildPath('agents'),
  
  // Operations
  toOperations: () => buildPath('operations'),
  toCRM: () => buildPath('crm'),
  toTickets: () => buildPath('support-tickets'),
  
  // Developer
  toAPIDocs: () => buildPath('api-docs'),
  toAPIConsole: () => buildPath('api-console'),
  toWebhooks: () => buildPath('webhooks'),
  
  // Settings
  toProfile: () => buildPath('profile'),
  toSettings: () => buildPath('settings'),
  toTeamManagement: () => buildPath('team-management'),
  
  // Auth
  toLogin: () => buildPath('login'),
};

export default {
  buildPath,
  useTypedNavigate,
  useCurrentRoute,
  useRouteAccess,
  useBreadcrumbs,
  getNavigationGroups,
  navigation,
};
