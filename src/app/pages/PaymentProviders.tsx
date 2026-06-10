import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Smartphone, 
  Building2, 
  Zap, 
  Ban, 
  Edit3,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  CreditCard,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLoaderData } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { useStore } from '../../lib/store';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  method?: string;
  paymentMethod?: string;
  createdAt: string;
}

interface Processor {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  logo: React.ReactNode;
  currency: string;
  successRate: number;
  transactions: number;
  dailyLimit: {
    used: number;
    total: number;
  };
  monthlyLimit: {
    used: number;
    total: number;
  };
  lastTransaction: string;
  color: string;
}

export const PaymentProviders = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const loaderData = useLoaderData() as { transactions?: Transaction[] } | null;
  const transactions = loaderData?.transactions || []; // ✅ FIX: Safe default
  const isRTL = language === 'ar';
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  // Real-time Data Aggregation
  const processorsData: Processor[] = [
    {
      id: '1',
      name: 'Orange Money',
      type: 'Mobile Wallet',
      status: 'active',
      logo: <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">O</div>,
      currency: 'EGP',
      successRate: 97.8,
      transactions: 0,
      dailyLimit: { used: 0, total: 100000 },
      monthlyLimit: { used: 0, total: 1000000 },
      lastTransaction: 'Never',
      color: 'orange'
    },
    {
      id: '2',
      name: 'InstaPay',
      type: 'Bank Transfer',
      status: 'active',
      logo: <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white"><Building2 className="w-5 h-5" /></div>,
      currency: 'EGP',
      successRate: 99.2,
      transactions: 0,
      dailyLimit: { used: 0, total: 200000 },
      monthlyLimit: { used: 0, total: 5000000 },
      lastTransaction: 'Never',
      color: 'emerald'
    },
    {
      id: '3',
      name: 'Vodafone Cash',
      type: 'Mobile Wallet',
      status: 'active',
      logo: <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">V</div>,
      currency: 'EGP',
      successRate: 98.5,
      transactions: 0,
      dailyLimit: { used: 0, total: 100000 },
      monthlyLimit: { used: 0, total: 1000000 },
      lastTransaction: 'Never',
      color: 'red'
    },
    {
      id: '4',
      name: 'Fawry Pay',
      type: 'Retail / Card',
      status: 'active',
      logo: <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-blue-900 font-black italic">F</div>,
      currency: 'EGP',
      successRate: 96.5,
      transactions: 0,
      dailyLimit: { used: 0, total: 500000 },
      monthlyLimit: { used: 0, total: 10000000 },
      lastTransaction: 'Never',
      color: 'yellow'
    },
    {
      id: '5',
      name: 'Etisalat Cash',
      type: 'Mobile Wallet',
      status: 'active',
      logo: <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">E</div>,
      currency: 'EGP',
      successRate: 95.0,
      transactions: 0,
      dailyLimit: { used: 0, total: 100000 },
      monthlyLimit: { used: 0, total: 1000000 },
      lastTransaction: 'Never',
      color: 'green'
    }
  ];

  // Update processors with real transaction data
  const updatedProcessors = processorsData.map(processor => {
    const processorTxns = transactions.filter(tx => {
      const method = (tx.method || tx.paymentMethod || '').toLowerCase();
      return method.includes(processor.name.toLowerCase()) || 
             (processor.name === 'Fawry Pay' && method.includes('fawry'));
    });

    const totalTxns = processorTxns.length;
    const successfulTxns = processorTxns.filter(tx => ['completed', 'paid', 'approved'].includes(tx.status)).length;
    const successRate = totalTxns > 0 ? (successfulTxns / totalTxns) * 100 : 0;
    
    // Calculate limits (used today and this month)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyUsed = processorTxns
      .filter(tx => new Date(tx.createdAt) >= today && ['completed', 'paid', 'approved'].includes(tx.status))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const monthlyUsed = processorTxns
      .filter(tx => new Date(tx.createdAt) >= firstOfMonth && ['completed', 'paid', 'approved'].includes(tx.status))
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Last transaction time
    let lastTime = 'Never';
    if (totalTxns > 0) {
      const sorted = [...processorTxns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastTxDate = new Date(sorted[0].createdAt);
      const diffMs = now.getTime() - lastTxDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) lastTime = isRTL ? 'الآن' : 'Just now';
      else if (diffMins < 60) lastTime = isRTL ? `${diffMins} دقيقة` : `${diffMins}m ago`;
      else if (diffMins < 1440) lastTime = isRTL ? `${Math.floor(diffMins/60)} ساعة` : `${Math.floor(diffMins/60)}h ago`;
      else lastTime = lastTxDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
    }

    return {
      ...processor,
      transactions: totalTxns,
      successRate: parseFloat(successRate.toFixed(1)),
      dailyLimit: { ...processor.dailyLimit, used: dailyUsed },
      monthlyLimit: { ...processor.monthlyLimit, used: monthlyUsed },
      lastTransaction: lastTime
    };
  });

  const filteredProcessors = updatedProcessors.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalSuccessful = transactions.filter(tx => ['completed', 'paid', 'approved'].includes(tx.status)).length;
  const avgSuccessRate = transactions.length > 0 ? (totalSuccessful / transactions.length) * 100 : 0;

  const stats = [
    { label: isRTL ? 'متوسط نسبة النجاح' : 'Avg Success Rate', value: `${avgSuccessRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: isRTL ? 'غير نشط' : 'Inactive', value: updatedProcessors.filter(p => p.status === 'inactive').length.toString(), icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: isRTL ? 'نشط' : 'Active', value: updatedProcessors.filter(p => p.status === 'active').length.toString(), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: isRTL ? 'إجمالي المزودين' : 'Total Processors', value: updatedProcessors.length.toString(), icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Custom Header from Image */}
      <div className="bg-[#0D2137] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <button className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95">
          <Plus className="w-5 h-5" />
          <span>{isRTL ? 'إضافة معالج دفع' : 'Add Processor'}</span>
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-white mb-1">{isRTL ? 'معالجي الدفع' : 'Payment Processors'}</h1>
          <p className="text-gray-400 text-sm">{isRTL ? 'تهيئة وإدارة معالجي الدفع' : 'Configure and manage payment processors'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0D2137] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0D2137] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="flex bg-black/20 p-1 rounded-xl w-full md:w-auto">
          {['inactive', 'active', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={`flex-1 px-8 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                filter === t ? 'bg-[#124158] text-cyan-400 shadow-inner' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder={isRTL ? 'البحث في المعالجات...' : 'Search processors...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-700"
          />
        </div>
      </div>

      {/* Processor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProcessors.map((p, idx) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#0D2137] border border-white/5 rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/5 transition-all"
            >
              {/* Card Header */}
              <div className="p-6 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                    p.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    <Activity className="w-3 h-3" />
                    {p.status}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    {p.logo}
                  </div>
                  <span className="text-xs text-gray-500">{p.type}</span>
                </div>
              </div>

              {/* Badges Bar */}
              <div className="px-6 flex justify-end gap-2 mb-6">
                 <div className="bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-500/20">{p.currency}</div>
                 <div className="bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-500/20"><Globe className="w-3 h-3" /></div>
              </div>

              {/* Main Stats */}
              <div className="px-6 grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <div className="text-emerald-500 text-sm font-black">{p.successRate}%</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">{isRTL ? 'معدل النجاح' : 'Success Rate'}</div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-white text-sm font-black">{p.transactions}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">{isRTL ? 'المعاملات' : 'Transactions'}</div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="px-6 space-y-4 mb-6">
                {/* Daily Limit */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-300 uppercase">{isRTL ? 'الحد اليومي' : 'Daily Limit'}</span>
                    <span className="text-[10px] font-black text-white">{(p.dailyLimit.used / p.dailyLimit.total * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${p.dailyLimit.used / p.dailyLimit.total * 100}%` }}
                      className={`h-full rounded-full ${
                        (p.dailyLimit.used / p.dailyLimit.total) > 0.9 ? 'bg-rose-500' : 
                        (p.dailyLimit.used / p.dailyLimit.total) > 0.7 ? 'bg-orange-500' : 'bg-cyan-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-gray-600">
                    <span>{p.currency} {p.dailyLimit.total.toLocaleString()} /</span>
                    <span>{p.currency} {p.dailyLimit.used.toLocaleString()}</span>
                  </div>
                </div>

                {/* Monthly Limit */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-300 uppercase">{isRTL ? 'الحد الشهري' : 'Monthly Limit'}</span>
                    <span className="text-[10px] font-black text-white">{(p.monthlyLimit.used / p.monthlyLimit.total * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${p.monthlyLimit.used / p.monthlyLimit.total * 100}%` }}
                      className={`h-full rounded-full ${
                        (p.monthlyLimit.used / p.monthlyLimit.total) > 0.9 ? 'bg-rose-500' : 
                        (p.monthlyLimit.used / p.monthlyLimit.total) > 0.7 ? 'bg-orange-500' : 'bg-cyan-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-gray-600">
                    <span>{p.currency} {p.monthlyLimit.total.toLocaleString()} /</span>
                    <span>{p.currency} {p.monthlyLimit.used.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-black/20 flex flex-col gap-3">
                <div className="flex items-center justify-center gap-1.5 text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">
                    {isRTL ? 'آخر معاملة:' : 'Last transaction:'} <span className="text-cyan-500">{p.lastTransaction}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all active:scale-95">
                    <Ban className="w-3 h-3" />
                    {isRTL ? 'إلغاء التنشيط' : 'Deactivate'}
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-white border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
                    <Edit3 className="w-3 h-3" />
                    {isRTL ? 'تعديل' : 'Edit'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};