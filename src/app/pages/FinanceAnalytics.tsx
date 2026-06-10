/**
 * Finance Analytics Page
 * Comprehensive financial analysis with 4 main sections:
 * 1. Executive Overview
 * 2. Cash Flow
 * 3. Wallets & Banks
 * 4. Profit & Loss
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLoaderData, useNavigate } from 'react-router';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  BarChart3,
  Download,
  Filter,
  Calendar,
  Sparkles,
  CreditCard,
  Banknote,
  Target,
  Trophy,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { StaggerContainer, StaggerItem } from '../components/transitions/PageTransition';

// Types
interface LoaderData {
  user: any;
  role: string;
  financeData: {
    executiveOverview: any;
    cashFlow: any;
    walletsAndBanks: any;
    profitAndLoss: any;
    loadedAt: string;
  };
  filters: any;
  serverRendered: boolean;
  renderedAt: string;
}

export const FinanceAnalytics = () => {
  const loaderData = useLoaderData() as LoaderData;
  const { language } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'cashflow' | 'wallets' | 'profit'>('overview');
  const [dateRange, setDateRange] = useState('6months');

  // Data from SSR
  const { executiveOverview, cashFlow, walletsAndBanks, profitAndLoss } = loaderData?.financeData || {};

  // Debug SSR
  useEffect(() => {
    if (loaderData?.serverRendered) {
      console.log('[Finance Analytics SSR] Loaded from server:', {
        renderedAt: loaderData.renderedAt,
        data: loaderData.financeData,
      });
      toast.success(isRTL ? '💰 تحليلات مالية من الخادم' : '💰 Finance data loaded from server');
    }
  }, [loaderData]);

  // Chart colors
  const COLORS = {
    primary: '#F59E0B', // Amber
    success: '#10B981', // Emerald
    danger: '#EF4444', // Red
    info: '#3B82F6', // Blue
    purple: '#A855F7',
    pink: '#EC4899',
  };

  const PIE_COLORS = [COLORS.primary, COLORS.info, COLORS.success, COLORS.purple, COLORS.pink];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format number
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US').format(value);
  };

  // Tabs
  const tabs = [
    { id: 'overview', label: isRTL ? 'نظرة عامة تنفيذية' : 'Executive Overview', icon: Target },
    { id: 'cashflow', label: isRTL ? 'التدفق النقدي' : 'Cash Flow', icon: Activity },
    { id: 'wallets', label: isRTL ? 'المحافظ والبنوك' : 'Wallets & Banks', icon: Wallet },
    { id: 'profit', label: isRTL ? 'الأرباح والخسائر' : 'Profit & Loss', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <StaggerContainer>
        <StaggerItem>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2">
                  {isRTL ? '💰 التحليلات المالية' : '💰 Finance Analytics'}
                </h1>
                <p className="text-muted-foreground">
                  {isRTL 
                    ? 'تحليل شامل للأداء المالي والتدفقات النقدية'
                    : 'Comprehensive financial performance and cash flow analysis'
                  }
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">{isRTL ? 'آخر 6 أشهر' : 'Last 6 Months'}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">{isRTL ? 'تصدير' : 'Export'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </StaggerItem>

        {/* SSR Indicator */}
        {loaderData?.serverRendered && (
          <StaggerItem>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
            >
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>
                  {isRTL 
                    ? `⚡ تم التحميل من الخادم (SSR) • ${new Date(loaderData.renderedAt).toLocaleTimeString('ar-EG')}`
                    : `⚡ Server-Side Rendered • ${new Date(loaderData.renderedAt).toLocaleTimeString()}`
                  }
                </span>
              </div>
            </motion.div>
          </StaggerItem>
        )}

        {/* Tabs */}
        <StaggerItem>
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </StaggerItem>

        {/* Content */}
        {activeTab === 'overview' && (
          <ExecutiveOverview 
            data={executiveOverview} 
            isRTL={isRTL}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            colors={COLORS}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashFlowSection 
            data={cashFlow} 
            isRTL={isRTL}
            formatCurrency={formatCurrency}
            colors={COLORS}
          />
        )}

        {activeTab === 'wallets' && (
          <WalletsAndBanksSection 
            data={walletsAndBanks} 
            isRTL={isRTL}
            formatCurrency={formatCurrency}
            colors={COLORS}
            pieColors={PIE_COLORS}
          />
        )}

        {activeTab === 'profit' && (
          <ProfitAndLossSection 
            data={profitAndLoss} 
            isRTL={isRTL}
            formatCurrency={formatCurrency}
            colors={COLORS}
          />
        )}
      </StaggerContainer>
    </div>
  );
};

// ==================== SECTION 1: Executive Overview ====================

interface ExecutiveOverviewProps {
  data: any;
  isRTL: boolean;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  colors: any;
}

const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({ 
  data, 
  isRTL, 
  formatCurrency, 
  formatNumber,
  colors 
}) => {
  const kpis = [
    {
      title: isRTL ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: formatCurrency(data?.totalRevenue || 0),
      change: `+${data?.growthRate || 0}%`,
      isPositive: true,
      icon: DollarSign,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
    },
    {
      title: isRTL ? 'صافي الربح' : 'Net Profit',
      value: formatCurrency(data?.netProfit || 0),
      change: `${data?.profitMargin || 0}%`,
      isPositive: true,
      icon: Trophy,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      title: isRTL ? 'إجمالي المصروفات' : 'Total Expenses',
      value: formatCurrency(data?.totalExpenses || 0),
      change: '+12%',
      isPositive: false,
      icon: CreditCard,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
    },
    {
      title: isRTL ? 'حجم المعاملات' : 'Transaction Volume',
      value: formatNumber(data?.transactionVolume || 0),
      change: '+18%',
      isPositive: true,
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      title: isRTL ? 'متوسط المعاملة' : 'Avg Transaction',
      value: formatCurrency(data?.averageTransaction || 0),
      change: '+5%',
      isPositive: true,
      icon: Banknote,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      title: isRTL ? 'التجار النشطين' : 'Active Merchants',
      value: formatNumber(data?.activeMerchants || 0),
      change: '+8%',
      isPositive: true,
      icon: Building2,
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {kpis.map((kpi, idx) => (
          <StaggerItem key={idx} index={idx}>
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl p-6"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg ${kpi.bgColor} flex items-center justify-center mb-4`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {kpi.value}
                  </h3>
                  <span className={`text-sm flex items-center gap-1 ${kpi.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {kpi.isPositive ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {kpi.change}
                  </span>
                </div>
              </div>

              {/* Border glow */}
              <div className="absolute inset-0 rounded-xl border border-amber-500/0 group-hover:border-amber-500/20 transition-all duration-500" />
            </motion.div>
          </StaggerItem>
        ))}
      </div>

      {/* Profit Margin Card */}
      <StaggerItem>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/5 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {isRTL ? '📊 هامش الربح' : '📊 Profit Margin'}
            </h3>
            <span className="text-3xl font-bold text-emerald-400">
              {data?.profitMargin || 0}%
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data?.profitMargin || 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
            />
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            {isRTL 
              ? 'نسبة صافي الربح من إجمالي الإيرادات'
              : 'Net profit as percentage of total revenue'
            }
          </p>
        </motion.div>
      </StaggerItem>
    </div>
  );
};

// ==================== SECTION 2: Cash Flow ====================

interface CashFlowSectionProps {
  data: any;
  isRTL: boolean;
  formatCurrency: (value: number) => string;
  colors: any;
}

const CashFlowSection: React.FC<CashFlowSectionProps> = ({ data, isRTL, formatCurrency, colors }) => {
  const summary = data?.summary || {};
  const chartData = data?.inflows?.map((inflow: any, idx: number) => ({
    month: inflow.month,
    inflow: inflow.amount,
    outflow: data?.outflows?.[idx]?.amount || 0,
    netFlow: data?.netFlow?.[idx]?.amount || 0,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StaggerItem>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{isRTL ? 'التدفقات الداخلة' : 'Total Inflows'}</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(summary.totalInflow || 0)}</p>
          </motion.div>
        </StaggerItem>

        <StaggerItem index={1}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{isRTL ? 'التدفقات الخارجة' : 'Total Outflows'}</span>
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(summary.totalOutflow || 0)}</p>
          </motion.div>
        </StaggerItem>

        <StaggerItem index={2}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{isRTL ? 'صافي التدفق' : 'Net Cash Flow'}</span>
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{formatCurrency(summary.netCashFlow || 0)}</p>
          </motion.div>
        </StaggerItem>
      </div>

      {/* Chart */}
      <StaggerItem>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/5 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {isRTL ? '📈 تحليل التدفق النقدي' : '📈 Cash Flow Analysis'}
          </h3>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.success} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.danger} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.danger} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNetFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="inflow"
                name={isRTL ? 'التدفقات الداخلة' : 'Inflows'}
                stroke={colors.success}
                fillOpacity={1}
                fill="url(#colorInflow)"
              />
              <Area
                type="monotone"
                dataKey="outflow"
                name={isRTL ? 'التدفقات الخارجة' : 'Outflows'}
                stroke={colors.danger}
                fillOpacity={1}
                fill="url(#colorOutflow)"
              />
              <Area
                type="monotone"
                dataKey="netFlow"
                name={isRTL ? 'صافي التدفق' : 'Net Flow'}
                stroke={colors.primary}
                fillOpacity={1}
                fill="url(#colorNetFlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </StaggerItem>
    </div>
  );
};

// ==================== SECTION 3: Wallets & Banks ====================

interface WalletsAndBanksSectionProps {
  data: any;
  isRTL: boolean;
  formatCurrency: (value: number) => string;
  colors: any;
  pieColors: string[];
}

const WalletsAndBanksSection: React.FC<WalletsAndBanksSectionProps> = ({ 
  data, 
  isRTL, 
  formatCurrency, 
  colors,
  pieColors 
}) => {
  const wallets = data?.wallets || [];
  const banks = data?.banks || [];
  const distribution = data?.distribution || [];

  return (
    <div className="space-y-6">
      {/* Total Balance */}
      <StaggerItem>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-transparent backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {isRTL ? 'إجمالي الرصيد' : 'Total Balance'}
              </p>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                {formatCurrency(data?.totalBalance || 0)}
              </h2>
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </motion.div>
      </StaggerItem>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <StaggerItem>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-white/5 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">
              {isRTL ? '📊 توزيع الأرصدة' : '📊 Balance Distribution'}
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </motion.div>
        </StaggerItem>

        {/* Wallets List */}
        <StaggerItem>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-white/5 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {isRTL ? '👛 المحافظ' : '👛 Wallets'}
            </h3>

            <div className="space-y-3">
              {wallets.map((wallet: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{wallet.name}</p>
                      <p className="text-sm text-muted-foreground">{wallet.currency}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-amber-400">
                    {formatCurrency(wallet.balance)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </StaggerItem>
      </div>

      {/* Banks List */}
      <StaggerItem>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/5 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {isRTL ? '🏦 الحسابات البنكية' : '🏦 Bank Accounts'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banks.map((bank: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-400/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{bank.name}</p>
                    <p className="text-xs text-muted-foreground">{bank.accountType}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{bank.currency}</span>
                  <span className="text-lg font-bold text-blue-400">
                    {formatCurrency(bank.balance)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </StaggerItem>
    </div>
  );
};

// ==================== SECTION 4: Profit & Loss ====================

interface ProfitAndLossSectionProps {
  data: any;
  isRTL: boolean;
  formatCurrency: (value: number) => string;
  colors: any;
}

const ProfitAndLossSection: React.FC<ProfitAndLossSectionProps> = ({ 
  data, 
  isRTL, 
  formatCurrency, 
  colors 
}) => {
  const chartData = data?.revenue?.map((rev: any, idx: number) => ({
    month: rev.month,
    revenue: rev.amount,
    expenses: data?.expenses?.[idx]?.amount || 0,
    profit: data?.profit?.[idx]?.amount || 0,
  })) || [];

  const breakdown = data?.breakdown || {};

  return (
    <div className="space-y-6">
      {/* Main Chart */}
      <StaggerItem>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/5 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {isRTL ? '📊 الإيرادات مقابل المصروفات' : '📊 Revenue vs Expenses'}
          </h3>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                name={isRTL ? 'الإيرادات' : 'Revenue'} 
                fill={colors.success} 
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                name={isRTL ? 'المصروفات' : 'Expenses'} 
                fill={colors.danger} 
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="profit" 
                name={isRTL ? 'الربح' : 'Profit'} 
                fill={colors.primary} 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </StaggerItem>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <StaggerItem>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-xl p-6"
          >
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">
              {isRTL ? '💰 تفصيل الإيرادات' : '💰 Revenue Breakdown'}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'رسوم المعاملات' : 'Transaction Fees'}</span>
                <span className="font-bold text-foreground">{formatCurrency(breakdown.transactionFees || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'الاشتراكات' : 'Subscriptions'}</span>
                <span className="font-bold text-foreground">{formatCurrency(breakdown.subscriptions || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'إيرادات أخرى' : 'Other Revenue'}</span>
                <span className="font-bold text-foreground">{formatCurrency(breakdown.otherRevenue || 0)}</span>
              </div>
            </div>
          </motion.div>
        </StaggerItem>

        {/* Expenses Breakdown */}
        <StaggerItem>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent backdrop-blur-xl p-6"
          >
            <h3 className="text-lg font-semibold text-red-400 mb-4">
              {isRTL ? '💸 تفصيل المصروفات' : '💸 Expenses Breakdown'}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'مصاريف تشغيلية' : 'Operating Expenses'}</span>
                <span className="font-bold text-foreground">{formatCurrency(breakdown.operatingExpenses || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'رسوم البوابات' : 'Gateway Fees'}</span>
                <span className="font-bold text-foreground">{formatCurrency(breakdown.gatewayFees || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'مصاريف أخرى' : 'Other Expenses'}</span>
                <span className="font-bold text-foreground">{formatCurrency(breakdown.otherExpenses || 0)}</span>
              </div>
            </div>
          </motion.div>
        </StaggerItem>
      </div>
    </div>
  );
};
