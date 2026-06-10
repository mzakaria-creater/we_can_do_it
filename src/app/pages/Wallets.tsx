import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Settings2, 
  History, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Users as UsersIcon,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLoaderData, useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export const Wallets = () => {
  const { t, i18n } = useTranslation();
  const loaderData = useLoaderData() as any;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isRTL = i18n.language === 'ar';

  const [walletsList, setWalletsList] = useState(loaderData?.walletsData?.wallets || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (loaderData?.walletsData?.wallets) {
      setWalletsList(loaderData.walletsData.wallets);
    }
  }, [loaderData]);

  useEffect(() => {
    const channel = supabase
      .channel('public:kv:wallet')
      .on('broadcast', { event: 'UPDATE' }, () => {
        navigate('.', { replace: true });
      })
      .on('broadcast', { event: 'INSERT' }, () => {
        navigate('.', { replace: true });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['wallets'] });
    navigate('.', { replace: true });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const filteredWallets = walletsList.filter((w: any) => 
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500';
      case 'warning': return 'bg-amber-500/10 text-amber-500';
      case 'maintenance': return 'bg-slate-500/10 text-slate-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{isRTL ? 'مدير محافظ الدفع' : 'Wallet Pool Manager'}</h2>
          <p className="text-muted-foreground">{isRTL ? 'حالة سعة النظام وتوزيع الأحمال.' : 'System capacity status and load balancing.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors uppercase tracking-wider"
          >
            {isRefreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {isRTL ? 'تحديث الأرصدة' : 'Sync Balances'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-bold shadow-lg shadow-[#D4AF37]/20 hover:opacity-90 transition-all uppercase tracking-wider">
            <Plus size={18} />
            {isRTL ? 'إنشاء محفظة' : 'Create Wallet'}
          </button>
        </div>
      </div>

      {/* Allocation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card p-6 rounded-xl border border-border shadow-sm border-emerald-500/20 bg-emerald-500/5"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Zap size={20} /></div>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <TrendingUp size={14} /> 94% {isRTL ? 'كفاءة التوزيع' : 'Efficiency'}
            </span>
          </div>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{isRTL ? 'الاستخدام حسب المزود' : 'Usage By Provider'}</h3>
          <div className="text-2xl font-bold mt-1 text-emerald-500 tracking-tight uppercase">Optimized</div>
          <p className="text-xs text-muted-foreground mt-2">{isRTL ? 'موازنة الحمل عبر المحافظ النشطة' : 'Load balanced across active pools'}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-xl border border-border shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg"><Settings2 size={20} /></div>
          </div>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{isRTL ? 'قواعد التوزيع العالمية' : 'Global Rules'}</h3>
          <div className="text-2xl font-bold mt-1">3 {isRTL ? 'قواعد نشطة' : 'Active'}</div>
          <p className="text-xs text-muted-foreground mt-2">{isRTL ? 'الحد الأقصى: ٩٠٪ | تفعيل Round-robin' : 'Max: 90% | Round-robin enabled'}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-xl border border-border shadow-sm border-amber-500/30 bg-amber-500/5"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg"><AlertTriangle size={20} /></div>
          </div>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{isRTL ? 'تحذيرات السعة' : 'Capacity Warnings'}</h3>
          <div className="text-2xl font-bold mt-1 text-amber-500">2 {isRTL ? 'في خطر' : 'At Risk'}</div>
          <p className="text-xs text-muted-foreground mt-2">{isRTL ? 'محفظة Orange و CIB تقترب من الحدود' : 'Orange & CIB approaching limits'}</p>
        </motion.div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground`} size={18} />
          <input 
            type="text" 
            placeholder={isRTL ? 'ابحث عن محفظة بالاسم أو النوع...' : 'Search wallets by name or type...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 outline-none shadow-sm transition-all`}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
            <Filter size={18} /> {isRTL ? 'تصفية' : 'Filters'}
          </button>
          <button className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
            <History size={18} /> {isRTL ? 'السجل' : 'History'}
          </button>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWallets.map((wallet: any, idx: number) => (
          <motion.div 
            key={wallet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(wallet.status)}`}>
                    {wallet.status}
                  </div>
                  <h4 className="text-lg font-bold group-hover:text-[#D4AF37] transition-colors">{wallet.name}</h4>
                  <span className="text-xs text-muted-foreground">{wallet.type}</span>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                  <Settings2 size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{isRTL ? 'نسبة الاستخدام' : 'Utilization'}</span>
                    <span className="font-bold">{wallet.usage}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${wallet.usage}%` }}
                      className={`h-full rounded-full ${
                        wallet.usage > 90 ? 'bg-rose-500' : 
                        wallet.usage > 75 ? 'bg-amber-500' : 
                        'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{isRTL ? 'الحد اليومي' : 'Daily Limit'}</div>
                    <div className="text-sm font-bold">EGP {(wallet.limit || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{isRTL ? 'المستخدم حالياً' : 'Current Used'}</div>
                    <div className="text-sm font-bold">EGP {(wallet.current || 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* Granular CBE Limits */}
                <div className="p-3 bg-muted/30 rounded-lg space-y-2 border border-border/50">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground font-medium uppercase tracking-tighter">
                      {isRTL ? 'الحد اليومي للمعاملات' : 'Daily Transaction Limit'}
                    </span>
                    <span className="font-bold text-[#D4AF37]">60,000 EGP</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground font-medium uppercase tracking-tighter">
                      {isRTL ? 'حد السحب النقدي (ATM)' : 'ATM Withdrawal Limit'}
                    </span>
                    <span className="font-bold text-[#D4AF37]">30,000 EGP</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground font-medium uppercase tracking-tighter">
                      {isRTL ? 'حد منافذ البيع' : 'Outlet Purchase Limit'}
                    </span>
                    <span className="font-bold text-[#D4AF37]">60,000 EGP</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UsersIcon size={14} />
                    {wallet.merchants} {isRTL ? 'تجار معينون' : 'Merchants'}
                  </div>
                  <button className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
                    {isRTL ? 'عرض التفاصيل' : 'View Details'} <CheckCircle2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Default export for lazy loading
export default Wallets;