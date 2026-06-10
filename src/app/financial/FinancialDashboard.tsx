import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  Wallet,
  Calendar,
  Filter,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const FinancialDashboard = () => {
  const { t } = useTranslation();
  const { language, user } = useStore();
  const queryClient = useQueryClient();
  const isRTL = language === 'ar';

  // --- Real-time Subscription ---
  useEffect(() => {
    const channelTransactions = supabase
      .channel('public:kv:transaction')
      .on('broadcast', { event: 'INSERT' }, (payload) => {
        console.log('[Realtime] New transaction:', payload);
        queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
        queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
        toast.info(isRTL ? 'معاملة جديدة تم رصدها' : 'New transaction detected');
      })
      .subscribe();

    const channelSettlements = supabase
      .channel('public:kv:settlement')
      .on('broadcast', { event: 'UPDATE' }, (payload) => {
        console.log('[Realtime] Settlement updated:', payload);
        queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
        queryClient.invalidateQueries({ queryKey: ['financial-settlements'] });
        toast.success(isRTL ? 'تم تحديث حالة التسوية' : 'Settlement status updated');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelTransactions);
      supabase.removeChannel(channelSettlements);
    };
  }, [queryClient, isRTL]);

  // --- Data Fetching ---
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['financial-stats'],
    queryFn: async () => {
      const resp = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/stats`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch stats');
      return resp.json();
    },
    enabled: true
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['financial-transactions'],
    queryFn: async () => {
      const resp = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/transactions`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch transactions');
      return resp.json();
    },
    enabled: true
  });

  // Mock data for demo mode or fallbacks
  const demoKpis = [
    { label: isRTL ? 'إجمالي التدفق الوارد' : 'Total Inflow', value: '$84,250.00', trend: '+12.5%', isUp: true, icon: TrendingUp, color: '#D4AF37' },
    { label: isRTL ? 'إجمالي التدفق الصادر' : 'Total Outflow', value: '$32,120.00', trend: '-2.4%', isUp: false, icon: TrendingDown, color: '#ef4444' },
    { label: isRTL ? 'صافي الرصيد' : 'Net Balance', value: '$52,130.00', trend: '+8.2%', isUp: true, icon: DollarSign, color: '#10b981' },
    { label: isRTL ? 'تحت التصفية' : 'Pending Clear', value: '$12,400.00', trend: '+5.1%', isUp: true, icon: Activity, color: '#f59e0b' },
    { label: isRTL ? 'بوابات نشطة' : 'Active Gates', value: '5', trend: 'Stable', isUp: true, icon: Wallet, color: '#764ba2' },
  ];

  const liveKpis = stats ? [
    { label: isRTL ? 'حجم العمليات' : 'Total Volume', value: `EGP ${stats.totalVolume.toLocaleString()}`, trend: 'Live', isUp: true, icon: TrendingUp, color: '#D4AF37' },
    { label: isRTL ? 'عدد المعاملات' : 'Transaction Count', value: stats.transactionCount.toString(), trend: 'Live', isUp: true, icon: Activity, color: '#667eea' },
    { label: isRTL ? 'بوابات الدفع' : 'Active Wallets', value: stats.activeWallets.toString(), trend: 'Stable', isUp: true, icon: Wallet, color: '#764ba2' },
    { label: isRTL ? 'نسبة النجاح' : 'Success Rate', value: `${stats.successRate.toFixed(1)}%`, trend: stats.successRate > 90 ? '+2%' : '-1%', isUp: stats.successRate > 90, icon: CheckCircle, color: '#10b981' },
    { label: isRTL ? 'عدد التجار' : 'Merchant Count', value: stats.merchantCount.toString(), trend: 'Growing', isUp: true, icon: DollarSign, color: '#f59e0b' },
  ] : demoKpis;

  const currentKpis = stats ? liveKpis : demoKpis;

  const chartData = (transactionsData?.transactions || []).slice(0, 10).map((t: any) => ({
    name: new Date(t.createdAt).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    value: t.amount
  })).reverse();

  const transactions = (transactionsData?.transactions || []).slice(0, 5);

  return (
    <div className="space-y-8 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {isRTL ? 'نظرة عامة مالية' : 'Financial Overview'}
          </h1>
          <p className="text-slate-400 font-medium">
            {isRTL ? 'مراقبة شبكة المعاملات المتميزة الخاصة بك' : 'Monitoring your premium transaction network'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1F26] border border-slate-700 rounded-xl text-slate-300 font-bold text-sm shadow-sm hover:border-[#D4AF37]/50 transition-all">
            <Calendar size={18} />
            <span>{isRTL ? 'فبراير ٢٠٢٦' : 'Feb 2026'}</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] text-black rounded-xl font-bold text-sm shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all">
            <Download size={18} />
            <span>{isRTL ? 'تصدير البيانات' : 'Export Data'}</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <AnimatePresence mode="popLayout">
          {currentKpis.map((kpi, idx) => (
            <motion.div 
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#1A1F26] border border-slate-800 p-5 rounded-2xl shadow-xl hover:border-[#D4AF37]/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-slate-800/50 text-[#D4AF37] group-hover:scale-110 transition-transform">
                  <kpi.icon size={22} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${kpi.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {kpi.trend}
                  <ArrowUpRight size={14} className={kpi.isUp ? '' : 'rotate-90'} />
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
              <h3 className="text-xl font-black text-white">{kpi.value}</h3>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-[#1A1F26] border border-slate-800 rounded-3xl p-6 h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">{isRTL ? 'تحليلات حجم العمليات' : 'Volume Analytics'}</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/10 rounded-full text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                {isRTL ? 'بث حي للعمليات' : 'Live Transaction Stream'}
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [
                { name: 'Mon', value: 12500 },
                { name: 'Tue', value: 15400 },
                { name: 'Wed', value: 11200 },
                { name: 'Thu', value: 18900 },
                { name: 'Fri', value: 22000 },
              ]}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#718096" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  reversed={isRTL}
                />
                <YAxis 
                  stroke="#718096" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  orientation={isRTL ? 'right' : 'left'}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1F26', border: '1px solid #2D3748', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart - Simulation */}
        <div className="bg-[#1A1F26] border border-slate-800 rounded-3xl p-6 h-[450px] flex flex-col">
          <h3 className="text-xl font-bold text-white mb-8">{isRTL ? 'توزيع القطاعات' : 'Sector Breakdown'}</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Retail', value: 45 },
                    { name: 'Food', value: 25 },
                    { name: 'Services', value: 20 },
                    { name: 'Tech', value: 10 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#D4AF37" />
                  <Cell fill="#764ba2" />
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { name: isRTL ? 'تجارة التجزئة' : 'Retail', value: 45, color: '#D4AF37' },
              { name: isRTL ? 'مطاعم' : 'Food & Bev', value: 25, color: '#764ba2' },
              { name: isRTL ? 'خدمات' : 'Services', value: 20, color: '#10b981' },
              { name: isRTL ? 'تقنية' : 'Tech', value: 10, color: '#ef4444' },
            ].map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-400 font-bold">{cat.name}</span>
                </div>
                <span className="text-white font-black">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div className="bg-[#1A1F26] border border-slate-800 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">{isRTL ? 'سجل العمليات الأخير' : 'Recent Transaction History'}</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{isRTL ? 'محدث في الوقت الفعلي' : 'Live stream of network activities'}</p>
          </div>
          <div className="flex gap-2">
             <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
               <Filter size={18} />
             </button>
             <button className="text-sm font-bold text-[#D4AF37] hover:underline uppercase tracking-tighter">
               {isRTL ? 'عرض الكل' : 'View Global Feed'}
             </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {transactionsLoading ? (
             <div className="flex flex-col items-center justify-center py-12 gap-4">
                <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Syncing nodes...</p>
             </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No transactions found in block</p>
            </div>
          ) : (
            transactions.map((tx: any, idx: number) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-5 bg-[#21262E] rounded-2xl border border-slate-700 hover:border-[#D4AF37]/50 hover:bg-[#252B35] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-[#D4AF37] border border-slate-700 group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                    {tx.type === 'deposit' || tx.type === 'settlement' ? <TrendingUp size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{tx.merchantName || 'External Gateway'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">REF: {tx.reference || tx.id.slice(0, 8)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {new Date(tx.createdAt).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-white">{tx.amount.toLocaleString()} {tx.currency || 'EGP'}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                       ['completed', 'paid', 'approved', 'success'].includes(tx.status) ? 'bg-emerald-500' :
                       ['pending', 'processing'].includes(tx.status) ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      ['completed', 'paid', 'approved', 'success'].includes(tx.status) ? 'text-emerald-500' : 
                      ['pending', 'processing'].includes(tx.status) ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {isRTL ? (
                        tx.status === 'completed' ? 'مكتمل' :
                        tx.status === 'pending' ? 'معلق' : 'فاشل'
                      ) : tx.status}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};