/**
 * Press2Pay Routes Configuration
 * مركز التحكم في المسارات - نظام موحد لإدارة جميع صفحات المنصة
 */

import type { RouteObject } from 'react-router';

/**
 * Route Metadata للصفحات
 * يحتوي على معلومات إضافية لكل صفحة (الصلاحيات، الأيقونة، الترجمة، إلخ)
 */
export interface RouteMetadata {
  path: string;
  titleKey: string;
  icon?: string;
  roles?: string[];
  requiresAuth?: boolean;
  hasLoader?: boolean;
  category?: 'main' | 'financial' | 'operations' | 'developer' | 'admin' | 'merchant';
}

/**
 * جميع صفحات النظام مع البيانات الوصفية
 */
export const routesMetadata: Record<string, RouteMetadata> = {
  // Main Dashboard
  dashboard: {
    path: 'dashboard',
    titleKey: 'dashboard',
    icon: 'LayoutDashboard',
    requiresAuth: true,
    hasLoader: true,
    category: 'main',
  },

  // Transactions
  transactions: {
    path: 'transactions',
    titleKey: 'transactions',
    icon: 'ArrowLeftRight',
    requiresAuth: true,
    hasLoader: true,
    category: 'main',
  },
  transactionsAdvanced: {
    path: 'transactions/advanced',
    titleKey: 'transactions_advanced',
    icon: 'Filter',
    requiresAuth: true,
    category: 'main',
  },
  transactionDetails: {
    path: 'transactions/details/:id',
    titleKey: 'transaction_details',
    icon: 'Eye',
    requiresAuth: true,
    category: 'main',
  },

  // Wallets
  wallets: {
    path: 'wallets',
    titleKey: 'wallets',
    icon: 'Wallet',
    roles: ['owner', 'super_admin', 'finance', 'operations'],
    requiresAuth: true,
    hasLoader: true,
    category: 'financial',
  },
  walletsNew: {
    path: 'wallets-new',
    titleKey: 'wallets_new',
    icon: 'Wallet',
    requiresAuth: true,
    category: 'financial',
  },
  walletAllocation: {
    path: 'wallet-allocation',
    titleKey: 'wallet_allocation',
    icon: 'PieChart',
    requiresAuth: true,
    category: 'financial',
  },

  // Merchants
  merchants: {
    path: 'merchants',
    titleKey: 'merchants',
    icon: 'Store',
    roles: ['owner', 'super_admin', 'operations', 'risk'],
    requiresAuth: true,
    hasLoader: true,
    category: 'main',
  },
  merchantsNew: {
    path: 'merchants/new',
    titleKey: 'merchant_new',
    icon: 'Plus',
    requiresAuth: true,
    category: 'main',
  },
  merchantsPortal: {
    path: 'merchants-portal',
    titleKey: 'merchants_portal',
    icon: 'Building2',
    requiresAuth: true,
    category: 'merchant',
  },
  // Merchant Hierarchy
  masterMerchants: {
    path: 'master-merchants',
    titleKey: 'master_merchants',
    icon: 'Building',
    roles: ['owner', 'super_admin'],
    requiresAuth: true,
    category: 'admin',
  },
  merchantHierarchy: {
    path: 'master-merchant/:masterId',
    titleKey: 'merchant_hierarchy',
    icon: 'ListTree',
    roles: ['owner', 'super_admin', 'operations'],
    requiresAuth: true,
    category: 'operations',
  },
  subMerchantHierarchy: {
    path: 'sub-merchant/:merchantId',
    titleKey: 'sub_merchant_hierarchy',
    icon: 'GitCommit',
    roles: ['owner', 'super_admin', 'operations'],
    requiresAuth: true,
    category: 'operations',
  },

  // Users & Agents
  users: {
    path: 'users',
    titleKey: 'users',
    icon: 'Users',
    roles: ['owner', 'super_admin'],
    requiresAuth: true,
    hasLoader: true,
    category: 'admin',
  },
  usersCreate: {
    path: 'users/create',
    titleKey: 'create_user',
    icon: 'UserPlus',
    roles: ['owner', 'super_admin'],
    requiresAuth: true,
    category: 'admin',
  },
  agents: {
    path: 'agents',
    titleKey: 'agents',
    icon: 'Users',
    roles: ['owner', 'super_admin', 'operations'],
    requiresAuth: true,
    category: 'operations',
  },

  // Payment System
  paymentProviders: {
    path: 'payment-providers',
    titleKey: 'payment_providers',
    icon: 'CreditCard',
    requiresAuth: true,
    hasLoader: true,
    category: 'operations',
  },
  gatewayConfig: {
    path: 'gateway-config',
    titleKey: 'gateway_config',
    icon: 'Settings',
    requiresAuth: true,
    category: 'operations',
  },
  payMethodTypes: {
    path: 'pay-method-types',
    titleKey: 'pay_method_types',
    icon: 'CreditCard',
    requiresAuth: true,
    category: 'operations',
  },
  paymentFormsConfig: {
    path: 'payment-forms-config',
    titleKey: 'payment_forms_config',
    icon: 'FileText',
    requiresAuth: true,
    category: 'operations',
  },
  paymentLinks: {
    path: 'payment-links',
    titleKey: 'payment_links',
    icon: 'Link',
    requiresAuth: true,
    category: 'operations',
  },
  pspConnection: {
    path: 'psp-connection',
    titleKey: 'psp_connection',
    icon: 'Plug',
    roles: ['owner', 'super_admin', 'developer'],
    requiresAuth: true,
    category: 'developer',
  },
  pricingFeesEngine: {
    path: 'pricing-fees-engine',
    titleKey: 'pricing_fees',
    icon: 'Calculator',
    requiresAuth: true,
    category: 'financial',
  },

  // Financial Operations
  deposits: {
    path: 'deposits',
    titleKey: 'deposits',
    icon: 'ArrowDownRight',
    roles: ['owner', 'super_admin', 'finance', 'operations'],
    requiresAuth: true,
    hasLoader: true,
    category: 'financial',
  },
  payouts: {
    path: 'payouts',
    titleKey: 'payouts',
    icon: 'ArrowUpRight',
    roles: ['owner', 'super_admin', 'finance'],
    requiresAuth: true,
    hasLoader: true,
    category: 'financial',
  },
  payoutDetails: {
    path: 'payout-details/:id',
    titleKey: 'payout_details',
    icon: 'Eye',
    roles: ['owner', 'super_admin', 'finance'],
    requiresAuth: true,
    category: 'financial',
  },
  settlements: {
    path: 'settlements',
    titleKey: 'settlements',
    icon: 'FileCheck',
    roles: ['owner', 'super_admin', 'finance'],
    requiresAuth: true,
    hasLoader: true,
    category: 'financial',
  },

  // Reports & Analytics
  reports: {
    path: 'reports',
    titleKey: 'reports',
    icon: 'BarChart',
    requiresAuth: true,
    hasLoader: true,
    category: 'main',
  },
  depositPayoutReport: {
    path: 'deposit-payout-report',
    titleKey: 'deposit_payout_report',
    icon: 'FileText',
    requiresAuth: true,
    category: 'financial',
  },
  analytics: {
    path: 'analytics',
    titleKey: 'analytics',
    icon: 'TrendingUp',
    roles: ['owner', 'super_admin', 'finance', 'operations', 'viewer'],
    requiresAuth: true,
    category: 'main',
  },
  financeAnalytics: {
    path: 'finance-analytics',
    titleKey: 'finance_analytics',
    icon: 'LineChart',
    roles: ['owner', 'super_admin', 'finance'],
    requiresAuth: true,
    hasLoader: true,
    category: 'financial',
  },

  // Risk & Compliance
  riskAml: {
    path: 'risk-aml',
    titleKey: 'risk_aml',
    icon: 'Shield',
    roles: ['owner', 'super_admin', 'risk'],
    requiresAuth: true,
    category: 'operations',
  },
  rcba: {
    path: 'rcba',
    titleKey: 'rcba',
    icon: 'ShieldCheck',
    roles: ['owner', 'super_admin'],
    requiresAuth: true,
    category: 'admin',
  },
  auditLogs: {
    path: 'audit-logs',
    titleKey: 'audit_logs',
    icon: 'FileText',
    roles: ['owner', 'super_admin'],
    requiresAuth: true,
    category: 'admin',
  },

  // Developer Tools
  apiDocs: {
    path: 'api-docs',
    titleKey: 'api_docs',
    icon: 'Book',
    requiresAuth: true,
    category: 'developer',
  },
  apiManagement: {
    path: 'api-management',
    titleKey: 'api_management',
    icon: 'Code',
    requiresAuth: true,
    category: 'developer',
  },
  apiConsole: {
    path: 'api-console',
    titleKey: 'api_console',
    icon: 'Terminal',
    requiresAuth: true,
    category: 'developer',
  },
  apiTester: {
    path: 'api-tester',
    titleKey: 'api_tester',
    icon: 'TestTube',
    requiresAuth: true,
    category: 'developer',
  },
  apiAuthentication: {
    path: 'api-authentication',
    titleKey: 'api_authentication',
    icon: 'Key',
    requiresAuth: true,
    category: 'developer',
  },
  developers: {
    path: 'developers',
    titleKey: 'developers',
    icon: 'Code',
    requiresAuth: true,
    category: 'developer',
  },
  webhooks: {
    path: 'webhooks',
    titleKey: 'webhooks',
    icon: 'Webhook',
    roles: ['owner', 'super_admin', 'developer'],
    requiresAuth: true,
    category: 'developer',
  },
  hashSecurity: {
    path: 'hash-security',
    titleKey: 'hash_security',
    icon: 'Lock',
    requiresAuth: true,
    category: 'developer',
  },
  securityAudit: {
    path: 'security-audit',
    titleKey: 'security_audit',
    icon: 'ShieldCheck',
    requiresAuth: true,
    category: 'developer',
  },
  oauthSettings: {
    path: 'oauth-settings',
    titleKey: 'oauth_settings',
    icon: 'Key',
    requiresAuth: true,
    category: 'developer',
  },

  // Operations & Automation
  operations: {
    path: 'operations',
    titleKey: 'operations',
    icon: 'Cog',
    roles: ['owner', 'super_admin', 'operations'],
    requiresAuth: true,
    category: 'operations',
  },
  n8nWorkflows: {
    path: 'n8n-workflows',
    titleKey: 'n8n_workflows',
    icon: 'GitBranch',
    requiresAuth: true,
    category: 'operations',
  },
  dataAutomation: {
    path: 'data-automation',
    titleKey: 'data_automation',
    icon: 'Bot',
    requiresAuth: true,
    category: 'operations',
  },

  // CRM & Support
  crm: {
    path: 'crm',
    titleKey: 'crm',
    icon: 'Users',
    requiresAuth: true,
    category: 'operations',
  },
  conversations: {
    path: 'conversations',
    titleKey: 'conversations',
    icon: 'MessageCircle',
    requiresAuth: true,
    category: 'operations',
  },
  supportTickets: {
    path: 'support-tickets',
    titleKey: 'support_tickets',
    icon: 'Ticket',
    requiresAuth: true,
    category: 'operations',
  },

  // Forms & Templates
  forms: {
    path: 'forms',
    titleKey: 'forms',
    icon: 'FileText',
    requiresAuth: true,
    category: 'operations',
  },
  formBuilder: {
    path: 'forms/builder',
    titleKey: 'form_builder',
    icon: 'Plus',
    requiresAuth: true,
    category: 'operations',
  },
  formPreview: {
    path: 'forms/preview/:id',
    titleKey: 'form_preview',
    icon: 'Eye',
    requiresAuth: true,
    category: 'operations',
  },
  standaloneForm: {
    path: 'forms/standalone/:id',
    titleKey: 'standalone_form',
    icon: 'FileText',
    requiresAuth: false,
    category: 'operations',
  },

  // Code Registry & System
  codesRegistry: {
    path: 'codes-registry',
    titleKey: 'codes_registry',
    icon: 'Database',
    requiresAuth: true,
    category: 'admin',
  },
  categories: {
    path: 'categories',
    titleKey: 'categories',
    icon: 'FolderTree',
    requiresAuth: true,
    category: 'operations',
  },
  enterpriseArchitecture: {
    path: 'enterprise-architecture',
    titleKey: 'enterprise_architecture',
    icon: 'Network',
    roles: ['owner', 'super_admin'],
    requiresAuth: true,
    category: 'admin',
  },
  boardingReview: {
    path: 'boarding-review',
    titleKey: 'boarding_review',
    icon: 'ClipboardCheck',
    roles: ['owner', 'super_admin'],
    requiresAuth: true,
    category: 'admin',
  },

  // System & Settings
  profile: {
    path: 'profile',
    titleKey: 'profile',
    icon: 'User',
    requiresAuth: true,
    category: 'main',
  },
  settings: {
    path: 'settings',
    titleKey: 'settings',
    icon: 'Settings',
    roles: ['owner', 'super_admin'],
    requiresAuth: true,
    category: 'admin',
  },
  teamManagement: {
    path: 'team-management',
    titleKey: 'team_management',
    icon: 'Users',
    roles: ['owner', 'super_admin'],
    requiresAuth: true,
    category: 'admin',
  },
  notifications: {
    path: 'notifications',
    titleKey: 'notifications',
    icon: 'Bell',
    requiresAuth: true,
    category: 'main',
  },

  // Testing & Examples
  checkoutDemo: {
    path: 'payment-kit',
    titleKey: 'payment_kit',
    icon: 'ShoppingCart',
    requiresAuth: false,
    category: 'developer',
  },
  vodafoneCashPayment: {
    path: 'vodafone-cash-payment',
    titleKey: 'vodafone_cash',
    icon: 'Smartphone',
    requiresAuth: true,
    category: 'operations',
  },
  checkoutTemplate2: {
    path: 'checkout-template2',
    titleKey: 'checkout_template2',
    icon: 'ShoppingCart',
    requiresAuth: true,
    category: 'operations',
  },
  realtimeDemo: {
    path: 'realtime-demo',
    titleKey: 'realtime_demo',
    icon: 'Zap',
    requiresAuth: true,
    category: 'developer',
  },
  backendTester: {
    path: 'backend-tester',
    titleKey: 'backend_tester',
    icon: 'TestTube',
    requiresAuth: true,
    category: 'developer',
  },
  supabaseExample: {
    path: 'supabase-example',
    titleKey: 'supabase_example',
    icon: 'Database',
    requiresAuth: true,
    category: 'developer',
  },
  fullTripTest: {
    path: 'full-trip-test',
    titleKey: 'full_trip_test',
    icon: 'Route',
    roles: ['owner', 'super_admin'],
    requiresAuth: true,
    hasLoader: true,
    category: 'developer',
  },

  // Financial VIP Portal
  financial: {
    path: 'financial',
    titleKey: 'financial_portal',
    icon: 'TrendingUp',
    requiresAuth: true,
    category: 'financial',
  },

  // Auth Routes (Public)
  login: {
    path: 'login',
    titleKey: 'login',
    icon: 'LogIn',
    requiresAuth: false,
    category: 'main',
  },
  forgotPassword: {
    path: 'forgot-password',
    titleKey: 'forgot_password',
    icon: 'Key',
    requiresAuth: false,
    category: 'main',
  },
};

/**
 * Helper Functions
 */

// Get routes by category
export const getRoutesByCategory = (category: RouteMetadata['category']) => {
  return Object.values(routesMetadata).filter(route => route.category === category);
};

// Get routes by role
export const getRoutesByRole = (userRole: string) => {
  return Object.values(routesMetadata).filter(route => {
    if (!route.roles || route.roles.length === 0) return true;
    return route.roles.includes(userRole);
  });
};

// Get route metadata by path
export const getRouteMetadata = (path: string): RouteMetadata | undefined => {
  return Object.values(routesMetadata).find(route => route.path === path);
};

// Check if route requires loader
export const routeHasLoader = (path: string): boolean => {
  const metadata = getRouteMetadata(path);
  return metadata?.hasLoader || false;
};

// Check if user has access to route
export const userHasRouteAccess = (path: string, userRole: string): boolean => {
  const metadata = getRouteMetadata(path);
  if (!metadata) return false;
  if (!metadata.roles || metadata.roles.length === 0) return true;
  return metadata.roles.includes(userRole);
};

/**
 * Navigation Categories for Sidebar
 */
export const navigationCategories = {
  main: {
    title: { ar: 'الرئيسية', en: 'Main' },
    order: 1,
  },
  financial: {
    title: { ar: 'العمليات المالية', en: 'Financial' },
    order: 2,
  },
  operations: {
    title: { ar: 'العمليات', en: 'Operations' },
    order: 3,
  },
  merchant: {
    title: { ar: 'بوابة التجار', en: 'Merchant Portal' },
    order: 4,
  },
  developer: {
    title: { ar: 'المطورين', en: 'Developers' },
    order: 5,
  },
  admin: {
    title: { ar: 'الإدارة', en: 'Administration' },
    order: 6,
  },
};

export default routesMetadata;