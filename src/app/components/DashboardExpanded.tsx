import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  ArrowLeftRight, 
  FileText, 
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../lib/store';
import { LuxuryCard, LuxuryStatCard } from '../components/LuxuryCard';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { toast } from 'sonner';

// --- KPI Section ---
const DashboardOverview = ({ stats, chartData, wallets, isRTL }: any) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LuxuryStatCard
          title={isRTL ? 'إجمالي الحجم' : 'Gross Volume'}
          value={`$${(stats.totalVolume || 0).toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={DollarSign}
          description={isRTL ? 'آخر 30 يوم' : 'Last 30 days'}
        />
        <LuxuryStatCard
          title={isRTL ? 'المعاملات' : 'Transactions'}
          value={(stats.transactionCount || 0).toLocaleString()}
          change="+8.2%"
          trend="up"
          icon={ArrowLeftRight}
          description={isRTL ? 'حجم العمليات' : 'Transaction volume'}
        />
        <LuxuryStatCard
          title={isRTL ? 'معدل النجاح' : 'Success Rate'}
          value={`${(stats.successRate || 98.2).toFixed(1)}%`}
          progress={stats.successRate || 98.2}
          icon={TrendingUp}
          description={isRTL ? 'الأداء التشغيلي' : 'Operational performance'}
        />
        <LuxuryStatCard
          title={isRTL ? 'التجار النشطون' : 'Active Merchants'}
          value={(stats.merchantCount || 0).toLocaleString()}
          change="+3"
          trend="up"
          icon={BarChart3}
          description={isRTL ? 'نمو الشركاء' : 'Partner growth'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <LuxuryCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{isRTL ? 'تحليل التدفقات المالية' : 'Financial Flow Analytics'}</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/10 rounded-full text-[10px] font-black text-[#D4AF37] uppercase tracking-widest border border-[#D4AF37]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                {isRTL ? 'إيداع' : 'Deposit'}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                {isRTL ? 'سحب' : 'Payout'}
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F4E5C3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F4E5C3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="deposit" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorDeposit)" />
                <Area type="monotone" dataKey="payout" stroke="#F4E5C3" strokeWidth={3} fillOpacity={1} fill="url(#colorPayout)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </LuxuryCard>

        <LuxuryCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">{isRTL ? 'أرصدة المحافظ' : 'Wallet Balances'}</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {(wallets || []).map((wallet: any, idx: number) => (
              <div key={wallet.id || idx} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-[#D4AF37]/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{wallet.name || 'Main Wallet'}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{wallet.provider || 'Gateway'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#D4AF37]">${(wallet.balance || 0).toLocaleString()}</p>
                    <p className="text-[9px] text-slate-500 uppercase">USD</p>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden mt-3">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (wallet.balance / (wallet.limit || 100000)) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-primary to-primary-foreground"
                   />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm font-bold hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2">
            <Plus size={16} />
            {isRTL ? 'إضافة محفظة' : 'Add Wallet'}
          </button>
        </LuxuryCard>
      </div>
    </div>
  );
};

// --- Transactions Manager ---
const TransactionsManager = ({ recentTransactions, isRTL }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const displayTransactions = recentTransactions && recentTransactions.length > 0 
    ? recentTransactions 
    : [
        { id: 'TRX-9821', merchant: 'Grand Hotel', type: 'deposit', amount: 12500, status: 'completed', date: '2026-02-17 14:20' },
        { id: 'TRX-9822', merchant: 'Desert Safaris', type: 'payout', amount: 3200, status: 'pending', date: '2026-02-17 13:45' },
        { id: 'TRX-9823', merchant: 'Oasis Market', type: 'deposit', amount: 840, status: 'completed', date: '2026-02-17 12:10' },
        { id: 'TRX-9824', merchant: 'Luxury Cars', type: 'deposit', amount: 45000, status: 'failed', date: '2026-02-17 11:30' },
        { id: 'TRX-9825', merchant: 'Tech Hub', type: 'payout', amount: 1500, status: 'completed', date: '2026-02-17 10:15' },
        { id: 'TRX-9826', merchant: 'Sky Dine', type: 'deposit', amount: 2100, status: 'completed', date: '2026-02-16 19:40' },
      ];

  const filteredTransactions = displayTransactions.filter((tx: any) => 
    (tx.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.merchantName || tx.merchant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.reference || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.success(isRTL ? `جاري تصدير الملف بصيغة ${format.toUpperCase()}...` : `Exporting ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
          <input 
            type="text" 
            placeholder={isRTL ? 'البحث في المعاملات...' : 'Search transactions...'}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white'}`}
          >
            <Filter size={18} />
            {isRTL ? 'التصفية' : 'Filters'}
          </button>
          <div className="h-6 w-[1px] bg-slate-700 hidden md:block" />
          <div className="flex items-center gap-2">
            <button onClick={() => handleExport('csv')} className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-primary transition-all" title="Export CSV">
              <FileSpreadsheet size={18} />
            </button>
            <button onClick={() => handleExport('pdf')} className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-primary transition-all" title="Export PDF">
              <FileDown size={18} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <PlusCircle size={18} />
            {isRTL ? 'إضافة معاملة' : 'New Transaction'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <LuxuryCard className="p-6 bg-slate-800/30 border-slate-700/50">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isRTL ? 'الحالة' : 'Status'}</label>
                    <select className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50">
                      <option>{isRTL ? 'الكل' : 'All Statuses'}</option>
                      <option>{isRTL ? 'مكتمل' : 'Completed'}</option>
                      <option>{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                      <option>{isRTL ? 'فاشل' : 'Failed'}</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isRTL ? 'النوع' : 'Type'}</label>
                    <select className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50">
                      <option>{isRTL ? 'الكل' : 'All Types'}</option>
                      <option>{isRTL ? 'إيداع' : 'Deposit'}</option>
                      <option>{isRTL ? 'سحب' : 'Payout'}</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isRTL ? 'التاريخ من' : 'Date From'}</label>
                    <input type="date" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isRTL ? 'التاريخ إلى' : 'Date To'}</label>
                    <input type="date" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" />
                 </div>
               </div>
            </LuxuryCard>
          </motion.div>
        )}
      </AnimatePresence>

      <LuxuryCard className="overflow-hidden border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-start">{isRTL ? 'معرف المعاملة' : 'Transaction ID'}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-start">{isRTL ? 'التاجر' : 'Merchant'}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-start">{isRTL ? 'النوع' : 'Type'}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-start">{isRTL ? 'المبلغ' : 'Amount'}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-start">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-start">{isRTL ? 'التاريخ' : 'Date'}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredTransactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-white font-mono">{tx.reference || tx.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300 font-medium">{tx.merchantName || tx.merchant || 'Press2Pay User'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${tx.type === 'deposit' || tx.type === 'payment' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {(tx.type === 'deposit' || tx.type === 'payment') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {(tx.type === 'deposit' || tx.type === 'payment') ? (isRTL ? 'إيداع' : 'Deposit') : (isRTL ? 'سحب' : 'Payout')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-white">${(tx.amount || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      ['completed', 'paid', 'approved', 'success'].includes(tx.status) ? 'bg-green-500/10 text-green-500' : 
                      tx.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        ['completed', 'paid', 'approved', 'success'].includes(tx.status) ? 'bg-green-500' : 
                        tx.status === 'pending' ? 'bg-amber-500' : 
                        'bg-red-500'
                      }`} />
                      {isRTL 
                        ? (['completed', 'paid', 'approved', 'success'].includes(tx.status) ? 'مكتمل' : tx.status === 'pending' ? 'معلق' : 'فاشل') 
                        : tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500">{new Date(tx.createdAt || tx.date).toLocaleString(isRTL ? 'ar-EG' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50 flex items-center justify-between">
           <span className="text-xs text-slate-500">{isRTL ? 'عرض 1-6 من 248 معاملة' : 'Showing 1-6 of 248 transactions'}</span>
           <div className="flex items-center gap-2">
              <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30" disabled>
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {[1, 2, 3, '...', 12].map((p, i) => (
                  <button key={i} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-800 text-slate-400'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </LuxuryCard>
    </div>
  );
};

// --- Financial Reports ---
const FinancialReports = ({ isRTL }: any) => {
  const pnlData = [
    { month: 'Oct', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: 'Nov', revenue: 52000, expenses: 35000, profit: 17000 },
    { month: 'Dec', revenue: 61000, expenses: 38000, profit: 23000 },
    { month: 'Jan', revenue: 58000, expenses: 40000, profit: 18000 },
    { month: 'Feb', revenue: 65000, expenses: 42000, profit: 23000 },
  ];

  const cashflowData = [
    { name: 'Direct Sales', value: 45 },
    { name: 'Subscription', value: 30 },
    { name: 'Affiliate', value: 15 },
    { name: 'Other', value: 10 },
  ];

  const COLORS = ['#D4AF37', '#8B5CF6', '#10B981', '#64748B'];

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LuxuryCard className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">{isRTL ? 'تقرير الأرباح والخسائر' : 'P&L Statement'}</h3>
            <button className="text-xs font-bold text-primary hover:underline">{isRTL ? 'تحميل التقرير الكامل' : 'Download Full Report'}</button>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="revenue" name={isRTL ? 'الإيرادات' : 'Revenue'} fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name={isRTL ? 'المصروفات' : 'Expenses'} fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name={isRTL ? 'صافي الربح' : 'Net Profit'} fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </LuxuryCard>

        <LuxuryCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-8">{isRTL ? 'توزيع مصادر الدخل' : 'Revenue Distribution'}</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="h-[300px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cashflowData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {cashflowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
              {cashflowData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-medium text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-white">{item.value}%</span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-700/50 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</span>
                  <span className="text-lg font-black text-[#D4AF37]">$1,245,000</span>
                </div>
              </div>
            </div>
          </div>
        </LuxuryCard>
      </div>

      <LuxuryCard className="p-8 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">{isRTL ? 'أتمتة التقارير الأسبوعية' : 'Automated Weekly Insights'}</h3>
            <p className="text-slate-400 text-sm max-w-xl">
              {isRTL 
                ? 'نظامنا القائم على الذكاء الاصطناعي يقوم بتحليل بياناتك المالية كل أسبوع لتوفير فرص تحسين التدفق النقدي.' 
                : 'Our AI-driven engine analyzes your financial data every week to provide cashflow optimization opportunities.'}
            </p>
          </div>
          <button className="px-8 py-3 bg-[#D4AF37] text-[#0B0F14] rounded-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all whitespace-nowrap">
            {isRTL ? 'تفعيل التنبيهات الذكية' : 'Activate Smart Insights'}
          </button>
        </div>
      </LuxuryCard>
    </div>
  );
};

export const DashboardExpanded = ({ stats, chartData, wallets, recentTransactions, isRTL }: any) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: BarChart3 },
    { id: 'transactions', label: isRTL ? 'المعاملات' : 'Transactions', icon: ArrowLeftRight },
    { id: 'reports', label: isRTL ? 'التقارير' : 'Reports', icon: FileText },
  ];

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex items-center p-1.5 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/50 w-fit">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${isActive ? 'text-[#D4AF37]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon size={18} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Rendering */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <DashboardOverview stats={stats} chartData={chartData} wallets={wallets} isRTL={isRTL} />
          )}
          {activeTab === 'transactions' && (
            <TransactionsManager recentTransactions={recentTransactions} isRTL={isRTL} />
          )}
          {activeTab === 'reports' && (
            <FinancialReports isRTL={isRTL} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
