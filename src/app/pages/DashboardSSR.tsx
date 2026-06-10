/**
 * Dashboard with SSR Support
 * Uses loader data for initial render, then switches to real-time updates
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLoaderData } from 'react-router';
import { 
  Sparkles,
  CircleDollarSign,
  TrendingUp,
  ArrowUpRight,
  Crown,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { StaggerContainer, StaggerItem } from '../components/transitions/PageTransition';
import { supabase } from '../../lib/supabase';

// Types for loader data
interface LoaderData {
  user: any;
  role: string;
  dashboardData: {
    stats: any;
    recentTransactions: any[];
    loadedAt: string;
  };
  serverRendered: boolean;
  renderedAt: string;
}

export const DashboardSSR = () => {
  const loaderData = useLoaderData() as LoaderData;
  const { language, user } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  // State initialized from SSR data
  const [stats, setStats] = useState(loaderData?.dashboardData?.stats || {
    totalTransactions: 0,
    activeMerchants: 0,
    successRate: 0,
    totalRevenue: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState(
    loaderData?.dashboardData?.recentTransactions || []
  );

  const [loading, setLoading] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Debug SSR
  useEffect(() => {
    if (loaderData?.serverRendered) {
      console.log('[Dashboard SSR] Loaded from server:', {
        renderedAt: loaderData.renderedAt,
        stats: loaderData.dashboardData?.stats,
        transactions: loaderData.dashboardData?.recentTransactions?.length,
      });
      toast.success(isRTL ? '✨ تم التحميل من الخادم' : '✨ Loaded from server', {
        description: isRTL 
          ? `البيانات محملة من الخادم في ${new Date(loaderData.renderedAt).toLocaleTimeString('ar-EG')}`
          : `Server-rendered at ${new Date(loaderData.renderedAt).toLocaleTimeString()}`,
      });
    }
  }, [loaderData]);

  // Setup real-time updates (client-side enhancement)
  useEffect(() => {
    if (!realtimeEnabled) return;

    console.log('[Dashboard] Setting up real-time updates...');

    // Subscribe to transaction changes
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kv_store_46c3f42b',
          filter: 'key=like.transaction:%',
        },
        (payload) => {
          console.log('[Dashboard] Real-time update:', payload);
          // Refresh stats (in production, you'd update incrementally)
          fetchLatestStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtimeEnabled]);

  // Fetch latest stats (progressive enhancement)
  const fetchLatestStats = async () => {
    // Implementation would call your API
    console.log('[Dashboard] Fetching latest stats...');
  };

  // Enable real-time after initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setRealtimeEnabled(true);
      console.log('[Dashboard] Real-time updates enabled');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Stats cards data
  const statsCards = [
    {
      title: isRTL ? 'إجمالي المعاملات' : 'Total Transactions',
      value: stats?.totalTransactions?.toLocaleString() || '0',
      change: '+12%',
      icon: CircleDollarSign,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
    },
    {
      title: isRTL ? 'التجار النشطين' : 'Active Merchants',
      value: stats?.activeMerchants?.toLocaleString() || '0',
      change: '+8%',
      icon: Crown,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      title: isRTL ? 'معدل النجاح' : 'Success Rate',
      value: `${stats?.successRate || 0}%`,
      change: '+2%',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      title: isRTL ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: '+15%',
      icon: Sparkles,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* SSR Indicator */}
      {loaderData?.serverRendered && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
        >
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>
              {isRTL 
                ? `⚡ تم التحميل من الخادم (SSR) • ${realtimeEnabled ? 'التحديثات المباشرة نشطة' : 'جاري تفعيل التحديثات المباشرة...'}`
                : `⚡ Server-Side Rendered • ${realtimeEnabled ? 'Real-time updates active' : 'Enabling real-time updates...'}`
              }
            </span>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <StaggerContainer>
        <StaggerItem>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2">
              {isRTL ? '🏠 لوحة القيادة' : '🏠 Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? `مرحباً ${user?.name || 'Admin'} 👋`
                : `Welcome back, ${user?.name || 'Admin'} 👋`
              }
            </p>
          </motion.div>
        </StaggerItem>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <StaggerItem key={idx} index={idx}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl p-6 cursor-pointer"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                      {stat.value}
                    </h3>
                    <span className="text-emerald-400 text-sm flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      {stat.change}
                    </span>
                  </div>
                </div>

                {/* Border glow */}
                <div className="absolute inset-0 rounded-xl border border-amber-500/0 group-hover:border-amber-500/20 transition-all duration-500" />
              </motion.div>
            </StaggerItem>
          ))}
        </div>

        {/* Recent Transactions */}
        <StaggerItem>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/5 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {isRTL ? '📊 المعاملات الأخيرة' : '📊 Recent Transactions'}
              </h2>
              <button
                onClick={() => navigate('/transactions')}
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                {isRTL ? 'عرض الكل ←' : 'View All →'}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((tx: any, idx: number) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => navigate(`/transactions/details/${tx.id}`)}
                  >
                    <div>
                      <p className="font-medium text-foreground">{tx.merchantName}</p>
                      <p className="text-sm text-muted-foreground">{tx.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        ${tx.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {isRTL ? 'لا توجد معاملات حديثة' : 'No recent transactions'}
              </div>
            )}
          </motion.div>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
};
