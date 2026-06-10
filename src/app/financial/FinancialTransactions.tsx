import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Upload, 
  Clipboard, 
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  X,
  CreditCard,
  Building2,
  Mail,
  Smartphone
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const FinancialTransactions = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- Real-time Subscription ---
  useEffect(() => {
    const channel = supabase
      .channel('public:kv:transaction_list')
      .on('broadcast', { event: 'INSERT' }, () => {
        queryClient.invalidateQueries({ queryKey: ['financial-transactions-list'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // --- Data Fetching ---
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['financial-transactions-list'],
    queryFn: async () => {
      const resp = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/transactions`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch transactions');
      return resp.json();
    }
  });

  const demoTransactions = [
    { id: 'TRX-9821', merchantName: 'Grand Hotel Cairo', method: 'Stripe', amount: 12500, status: 'completed', createdAt: new Date().toISOString(), customerEmail: 'ahmed@email.com' },
    { id: 'TRX-9822', merchantName: 'Desert Safaris Ltd', method: 'PayPal', amount: 3200, status: 'pending', createdAt: new Date().toISOString(), customerEmail: 'john.doe@web.com' },
    { id: 'TRX-9823', merchantName: 'Oasis Market Square', method: 'PayMob', amount: 840, status: 'completed', createdAt: new Date().toISOString(), customerEmail: 'mary@domain.me' },
    { id: 'TRX-9824', merchantName: 'Luxury Cars Rental', method: 'Stripe', amount: 45000, status: 'failed', createdAt: new Date().toISOString(), customerEmail: 'yassin@rent.com' },
  ];

  const transactions = (transactionsData?.transactions || demoTransactions);
  
  const filteredTransactions = transactions.filter((tx: any) => 
    (tx.merchantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    toast.success(isRTL ? 'جاري تصدير المعاملات...' : 'Exporting transactions to CSV...');
  };

  return (
    <div className="space-y-8 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            {isRTL ? 'إدارة المعاملات' : 'Transaction Management'}
          </h1>
          <p className="text-slate-500 font-medium">
            {isRTL ? 'سجل مفصل لجميع أنشطة الشبكة' : 'Detailed log of all network activity'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1F26] border border-slate-800 rounded-xl text-slate-300 font-bold text-sm shadow-sm hover:border-[#D4AF37]/50 transition-all"
          >
            <Download size={18} />
            <span>{isRTL ? 'تصدير' : 'Export'}</span>
          </button>
          <div className="w-[1px] h-8 bg-slate-800 mx-2 hidden lg:block" />
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] text-black rounded-xl font-bold text-sm shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span>{isRTL ? 'إضافة معاملة' : 'Add Transaction'}</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={20} />
          <input 
            type="text" 
            placeholder={isRTL ? 'البحث عن طريق المعرف، التاجر، العميل...' : 'Search by ID, merchant, customer...'}
            className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-[#14181F] border border-slate-800 rounded-2xl shadow-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white placeholder-slate-600 transition-all`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl border font-bold text-sm transition-all ${showFilters ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]' : 'bg-[#14181F] border-slate-800 text-slate-400 hover:bg-slate-800'}`}
        >
          <Filter size={20} />
          <span>{isRTL ? 'الفلاتر' : 'Filters'}</span>
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-[#1A1F26] rounded-3xl border border-slate-800 shadow-2xl">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'الحالة' : 'Status'}</label>
                  <select className="w-full bg-[#14181F] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 appearance-none">
                    <option>{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
                    <option>{isRTL ? 'مكتمل' : 'Completed'}</option>
                    <option>{isRTL ? 'معلق' : 'Pending'}</option>
                    <option>{isRTL ? 'فاشل' : 'Failed'}</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'البوابة' : 'Gateway'}</label>
                  <select className="w-full bg-[#14181F] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 appearance-none">
                    <option>{isRTL ? 'كل البوابات' : 'All Gateways'}</option>
                    <option>Stripe</option>
                    <option>PayPal</option>
                    <option>PayMob</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'من تاريخ' : 'Date From'}</label>
                  <input type="date" className="w-full bg-[#14181F] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'إلى تاريخ' : 'Date To'}</label>
                  <input type="date" className="w-full bg-[#14181F] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20" />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table */}
      <div className="bg-[#14181F] rounded-[2rem] border border-slate-800/50 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-slate-900/50">
                <th className={`px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center gap-2">ID <ArrowUpDown size={12} /></div>
                </th>
                <th className={`px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'التاجر' : 'Merchant'}
                </th>
                <th className={`px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'العميل' : 'Customer'}
                </th>
                <th className={`px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'البوابة' : 'Gateway'}
                </th>
                <th className={`px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'المبلغ' : 'Amount'}
                </th>
                <th className={`px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center`}>
                  {isRTL ? 'الحالة' : 'Status'}
                </th>
                <th className={`px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>
                   {isRTL ? 'التاريخ' : 'Date'}
                </th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {isRTL ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                   <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="w-10 h-10 text-[#D4AF37] animate-spin" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Transactions...</p>
                      </div>
                   </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                   <td colSpan={8} className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest">
                     No records found in this block
                   </td>
                </tr>
              ) : (
                filteredTransactions.map((tx: any, idx: number) => (
                  <motion.tr 
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group hover:bg-slate-800/20 transition-all"
                  >
                    <td className="px-6 py-5 font-mono font-bold text-[#D4AF37] text-xs">{tx.id.slice(0, 10)}...</td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-white text-sm">{tx.merchantName || 'Press2Pay Store'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-bold text-xs">{tx.customerEmail || 'anonymous@user.com'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-800/50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-700">{tx.method || 'GATEWAY'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-black text-white text-sm">{(tx.amount || 0).toLocaleString()} {tx.currency || 'EGP'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-tighter ${
                          ['completed', 'paid', 'approved', 'success'].includes(tx.status) ? 'bg-emerald-500/10 text-emerald-500' : 
                          ['pending', 'processing'].includes(tx.status) ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            ['completed', 'paid', 'approved', 'success'].includes(tx.status) ? 'bg-emerald-500' : 
                            ['pending', 'processing'].includes(tx.status) ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {isRTL ? (
                            tx.status === 'completed' ? 'مكتمل' :
                            tx.status === 'pending' ? 'معلق' : 'فاشل'
                          ) : tx.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                         <span className="text-slate-500 font-bold text-[10px]">{new Date(tx.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
                         <span className="text-slate-600 font-bold text-[9px]">{new Date(tx.createdAt).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-[#D4AF37] transition-all"><Eye size={18} /></button>
                        <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"><MoreVertical size={18} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-10 py-8 bg-slate-900/30 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <span className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">
             {isRTL ? 'عرض' : 'Showing'} <span className="text-white">1-{filteredTransactions.length}</span> {isRTL ? 'من أصل' : 'of'} <span className="text-white">{transactions.length}</span> {isRTL ? 'سجل' : 'records'}
           </span>
           <div className="flex items-center gap-3">
              <button className="p-2.5 text-slate-600 hover:text-[#D4AF37] disabled:opacity-20 transition-all" disabled><ChevronLeft size={24} /></button>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((p, i) => (
                  <button key={i} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${p === 1 ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>{p}</button>
                ))}
              </div>
              <button className="p-2.5 text-slate-600 hover:text-[#D4AF37] transition-all"><ChevronRight size={24} /></button>
           </div>
        </div>
      </div>

      {/* Add Modal Placeholder */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-[#14181F] rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800"
             >
                <div className="p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase">{isRTL ? 'معاملة جديدة' : 'New Transaction'}</h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manual node entry</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all text-slate-400">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'اسم التاجر' : 'Merchant Name'}</label>
                      <div className="relative">
                        <Building2 className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-600`} size={18} />
                        <input type="text" className={`w-full ${isRTL ? 'pr-12' : 'pl-12'} px-4 py-3.5 bg-[#0B0F14] border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white transition-all`} placeholder="e.g. Nile Fashion" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'المبلغ (ج.م)' : 'Amount (EGP)'}</label>
                      <div className="relative">
                        <CreditCard className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-600`} size={18} />
                        <input type="number" className={`w-full ${isRTL ? 'pr-12' : 'pl-12'} px-4 py-3.5 bg-[#0B0F14] border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white transition-all`} placeholder="0.00" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'البوابة' : 'Gateway'}</label>
                      <select className="w-full px-4 py-3.5 bg-[#0B0F14] border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white appearance-none">
                        <option>Stripe</option>
                        <option>PayPal</option>
                        <option>PayMob</option>
                        <option>Vodafone Cash</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'البريد الإلكتروني للعميل' : 'Customer Email'}</label>
                      <div className="relative">
                        <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-600`} size={18} />
                        <input type="email" className={`w-full ${isRTL ? 'pr-12' : 'pl-12'} px-4 py-3.5 bg-[#0B0F14] border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white transition-all`} placeholder="customer@email.com" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button onClick={() => setIsAddModalOpen(false)} className="flex-1 px-8 py-4 bg-[#0B0F14] border border-slate-800 rounded-2xl font-black text-slate-500 hover:text-white hover:bg-slate-800 transition-all uppercase text-xs tracking-[0.2em]">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                    <button 
                      onClick={() => {
                        toast.success(isRTL ? 'تمت إضافة المعاملة بنجاح!' : 'Transaction added successfully!');
                        setIsAddModalOpen(false);
                      }}
                      className="flex-1 px-8 py-4 bg-[#D4AF37] text-black rounded-2xl font-black shadow-xl shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-[0.2em]"
                    >
                      {isRTL ? 'حفظ المعاملة' : 'Commit Entry'}
                    </button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};