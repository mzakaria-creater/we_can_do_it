import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Settings2,
  Zap,
  MoreVertical,
  Lock,
  AlertTriangle,
  X,
  Filter,
  Download,
  Sparkles,
  Crown,
  Gem,
  CircleDollarSign as Wallet,
  TrendingUp,
  Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey } from '../../lib/supabase';

interface WalletData {
  id: string;
  name: string;
  provider: string;
  walletNumber?: string;
  providerId?: string;
  limit: number;
  monthlyUsage: number;
  dailyUsage?: number;
  dailyLimit?: number;
  status: 'active' | 'inactive' | 'limited';
  balance?: number;
  priority?: number;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const PROVIDER_OPTIONS = [
  'Vodafone Cash',
  'Orange Money',
  'Etisalat Cash',
  'InstaPay',
  'Bank Account',
  'Fawry',
  'Meeza',
  'USDT'
];

export const WalletsNew = () => {
  const { t } = useTranslation();
  const { user, language } = useStore();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [newWallet, setNewWallet] = useState({
    provider: 'Vodafone Cash',
    name: '',
    walletNumber: '',
    limit: 200000,
    dailyLimit: 60000,
    status: 'active' as 'active' | 'inactive' | 'limited',
    priority: 1
  });

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const { data, error } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/wallets'
      });

      if (error) throw error;
      setWallets(data?.wallets || []);
    } catch (error: any) {
      console.error('Error fetching wallets:', error);
      toast.error(language === 'ar' ? 'فشل تحميل المحافظ' : 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBalances = async () => {
    setSyncing(true);
    setIsQuickActionsOpen(false);
    toast.info(language === 'ar' ? 'جاري مزامنة الأرصدة...' : 'Syncing balances...');
    
    setTimeout(() => {
      setSyncing(false);
      toast.success(language === 'ar' ? 'تم تحديث الأرصدة بنجاح' : 'Balances synced successfully');
      fetchWallets();
    }, 2000);
  };

  const handleAddWallet = async () => {
    if (!newWallet.name || !newWallet.provider || !newWallet.walletNumber) {
      toast.warning(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const walletData = {
        ...newWallet,
        id: crypto.randomUUID(),
        monthlyUsage: 0,
        dailyUsage: 0,
        balance: 0
      };

      const { data, error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/wallets',
        body: walletData
      });

      if (error) throw error;

      setWallets([...wallets, walletData]);
      setIsModalOpen(false);
      toast.success(language === 'ar' ? 'تم إنشاء المحفظة بنجاح' : 'Wallet created successfully');
      
      setNewWallet({
        provider: 'Vodafone Cash',
        name: '',
        walletNumber: '',
        limit: 200000,
        dailyLimit: 60000,
        status: 'active',
        priority: 1
      });
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      toast.error(language === 'ar' ? 'فشل إنشاء المحفظة' : 'Failed to create wallet');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const { data, error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/wallets/status',
        body: { id, status: newStatus }
      });

      if (error) throw error;

      setWallets(prev => prev.map(w => w.id === id ? { ...w, status: newStatus as any } : w));
      toast.success(language === 'ar' ? `تم تحديث حالة المحفظة إلى ${newStatus}` : `Wallet status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating wallet status:', error);
      toast.error(language === 'ar' ? 'فشل تحديث حالة المحفظة' : 'Failed to update wallet status');
    }
  };

  // Calculate System Capacity Stats
  const systemStats = useMemo(() => {
    const totalLimit = wallets.reduce((acc, w) => acc + w.limit, 0);
    const totalUsage = wallets.reduce((acc, w) => acc + w.monthlyUsage, 0);
    const utilization = totalLimit > 0 ? (totalUsage / totalLimit) * 100 : 0;
    const activeCount = wallets.filter(w => w.status === 'active').length;
    
    const providerData = wallets.reduce((acc: any, w) => {
      acc[w.provider] = (acc[w.provider] || 0) + w.monthlyUsage;
      return acc;
    }, {});
    
    const chartData = Object.keys(providerData).map(key => ({
      name: key,
      value: providerData[key]
    }));

    return { totalLimit, totalUsage, utilization, activeCount, chartData };
  }, [wallets]);

  const filteredWallets = wallets.filter(wallet => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      wallet.name.toLowerCase().includes(query) ||
      wallet.provider.toLowerCase().includes(query) ||
      wallet.id.toLowerCase().includes(query) ||
      wallet.walletNumber?.toLowerCase().includes(query)
    );
  });

  const canEdit = user?.role && ['owner', 'super_admin', 'finance', 'operations'].includes(user.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 md:mb-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Wallet className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {language === 'ar' ? 'إدارة المحافظ' : 'Wallet Pool Manager'}
            </h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة السيولة والحدود وقواعد التخصيص التلقائي' 
              : 'Manage liquidity, limits, and auto-allocation rules'}
          </p>
        </div>
      </div>

      {/* Capacity Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Capacity Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                  <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-white">
                  {language === 'ar' ? 'حالة السعة' : 'System Capacity Status'}
                </h3>
              </div>
              <p className="text-xs md:text-sm text-gray-400">
                {language === 'ar' 
                  ? 'سعة المعالجة الشهرية مقابل الاستخدام' 
                  : 'Total monthly processing capacity vs usage'}
              </p>
            </div>
            <div className="px-2 md:px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs md:text-sm font-medium text-primary">
              {systemStats.activeCount} {language === 'ar' ? 'نشط' : 'Active'}
            </div>
          </div>

          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-2 text-xs md:text-sm">
              <span className="font-semibold text-white">
                {systemStats.totalUsage.toLocaleString()} {language === 'ar' ? 'ج.م مستخدم' : 'EGP Used'}
              </span>
              <span className="text-gray-400">
                {systemStats.totalLimit.toLocaleString()} {language === 'ar' ? 'ج.م إجمالي السعة' : 'EGP Total Capacity'}
              </span>
            </div>
            <div className="h-2 md:h-3 bg-gray-800/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(systemStats.utilization, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  systemStats.utilization > 80 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`}
              />
            </div>
            <div className="mt-2 text-right">
              <span className={`text-xs md:text-sm font-semibold ${
                systemStats.utilization > 80 ? 'text-red-500' : 'text-emerald-500'
              }`}>
                {systemStats.utilization.toFixed(1)}% {language === 'ar' ? 'استخدام' : 'Utilization'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-4 pt-4 md:pt-6 border-t border-gray-800/50">
            <div>
              <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                {language === 'ar' ? 'السيولة المتاحة' : 'Available Liquidity'}
              </div>
              <div className="text-sm md:text-xl font-bold text-emerald-500">
                {(systemStats.totalLimit - systemStats.totalUsage).toLocaleString()} <span className="text-xs md:text-base">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                {language === 'ar' ? 'النفاذ المتوقع' : 'Projected Runout'}
              </div>
              <div className="text-sm md:text-xl font-bold text-white">
                12 <span className="text-xs md:text-base">{language === 'ar' ? 'يوم' : 'Days'}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                {language === 'ar' ? 'كفاءة التخصيص' : 'Allocation Efficiency'}
              </div>
              <div className="text-sm md:text-xl font-bold text-primary">94.2%</div>
            </div>
          </div>
        </div>

        {/* Provider Distribution Chart */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4">
            {language === 'ar' ? 'الاستخدام حسب المزود' : 'Usage by Provider'}
          </h3>
          <div className="h-40 md:h-48">
            {systemStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={systemStats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {systemStats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      borderColor: '#374151', 
                      color: '#fff',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                {language === 'ar' ? 'لا توجد بيانات' : 'No data available'}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
            {systemStats.chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[10px] md:text-xs">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wallet List Table */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'البحث في المحافظ...' : 'Search wallets by ID, name or provider...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 md:px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs md:text-sm text-blue-400">
              {language === 'ar' ? 'الكل' : 'All'}: {wallets.length}
            </span>
            <span className="px-2 md:px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs md:text-sm text-emerald-400">
              {language === 'ar' ? 'نشط' : 'Active'}: {wallets.filter(w => w.status === 'active').length}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800/30 border-b border-gray-800/50">
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'معرف المحفظة' : 'Wallet ID'}
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'الاسم / المزود' : 'Name / Provider'}
                </th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'السعة الشهرية' : 'Monthly Capacity'}
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                  {language === 'ar' ? 'الاستخدام / السعة' : 'Usage / Capacity'}
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'متاح' : 'Available'}
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                    {language === 'ar' ? 'لا توجد محافظ' : 'No wallets found'}
                  </td>
                </tr>
              ) : (
                filteredWallets.map((wallet, idx) => {
                  const usagePercent = wallet.limit > 0 ? (wallet.monthlyUsage / wallet.limit) * 100 : 0;
                  const available = wallet.limit - wallet.monthlyUsage;
                  const isCritical = usagePercent > 90;
                  
                  return (
                    <motion.tr
                      key={wallet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`hover:bg-gray-800/30 transition-colors ${isCritical ? 'bg-red-500/5' : ''}`}
                    >
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span className="font-mono text-xs md:text-sm font-semibold text-white">
                            {wallet.walletNumber || wallet.id.substring(0, 8)}
                          </span>
                          {isCritical && <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-red-500" />}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-xs md:text-sm">{wallet.name}</span>
                          <span className="text-[10px] md:text-xs text-gray-500">{wallet.provider}</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-white text-sm">
                        {wallet.limit.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="w-full">
                          <div className="flex items-center justify-between text-[10px] md:text-xs mb-1">
                            <span className="font-semibold text-white">{wallet.monthlyUsage.toLocaleString()}</span>
                            <span className={`${isCritical ? 'text-red-500' : 'text-gray-500'}`}>
                              {usagePercent.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-1.5 md:h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCritical 
                                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                  : usagePercent > 70 
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-600' 
                                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                              }`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <span className={`font-bold text-sm ${available < 10000 ? 'text-red-500' : 'text-white'}`}>
                          {available.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${
                          wallet.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                            : 'bg-red-500/10 text-red-500 border border-red-500/30'
                        }`}>
                          {wallet.status === 'active' 
                            ? (language === 'ar' ? 'نشط' : 'Active')
                            : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {canEdit ? (
                          <button 
                            onClick={() => handleStatusToggle(wallet.id, wallet.status)}
                            className="p-1.5 md:p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                          </button>
                        ) : (
                          <Lock className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-gray-950 via-gray-900 to-transparent backdrop-blur-xl border-t border-gray-800/50 px-4 py-3">
        <div className="flex items-center justify-around gap-2">
          <button 
            onClick={handleSyncBalances}
            disabled={syncing}
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-medium">{language === 'ar' ? 'مزامنة' : 'Sync'}</span>
          </button>
          
          {canEdit && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center gap-1 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/30"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-bold">{language === 'ar' ? 'إضافة' : 'Add'}</span>
            </button>
          )}
          
          <button 
            onClick={() => setIsQuickActionsOpen(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400 hover:text-primary transition-colors"
          >
            <Zap className="w-5 h-5" />
            <span className="text-[10px] font-medium">{language === 'ar' ? 'المزيد' : 'More'}</span>
          </button>
        </div>
      </div>

      {/* Desktop Quick Actions Button */}
      <button 
        onClick={() => setIsQuickActionsOpen(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-40 items-center gap-2 px-5 py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-full shadow-2xl shadow-primary/40 transition-all font-bold"
      >
        <Zap className="w-5 h-5" />
        {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
      </button>

      {/* Quick Actions Popup */}
      <AnimatePresence>
        {isQuickActionsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickActionsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                  </h3>
                  <button
                    onClick={() => setIsQuickActionsOpen(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {canEdit && (
                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl transition-all group"
                  >
                    <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">{language === 'ar' ? 'إضافة محفظة جديدة' : 'Add New Wallet'}</div>
                      <div className="text-xs text-gray-400">{language === 'ar' ? 'إنشاء محفظة دفع جديدة' : 'Create a new payment wallet'}</div>
                    </div>
                  </button>
                )}
                
                <button
                  onClick={handleSyncBalances}
                  disabled={syncing}
                  className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl transition-all group disabled:opacity-50"
                >
                  <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <RotateCcw className={`w-5 h-5 text-blue-400 ${syncing ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">{language === 'ar' ? 'مزامنة الأرصدة' : 'Sync Balances'}</div>
                    <div className="text-xs text-gray-400">{language === 'ar' ? 'تحديث أرصدة جميع المحافظ' : 'Refresh all wallet balances'}</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    toast.info(language === 'ar' ? 'قريباً' : 'Coming soon');
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl transition-all group"
                >
                  <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <Download className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">{language === 'ar' ? 'تصدير البيانات' : 'Export Data'}</div>
                    <div className="text-xs text-gray-400">{language === 'ar' ? 'تحميل بيانات المحافظ' : 'Download wallet data'}</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    toast.info(language === 'ar' ? 'قريباً' : 'Coming soon');
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl transition-all group"
                >
                  <div className="p-3 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                    <Settings2 className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">{language === 'ar' ? 'إعدادات التخصيص' : 'Allocation Settings'}</div>
                    <div className="text-xs text-gray-400">{language === 'ar' ? 'تكوين قواعد التخصيص التلقائي' : 'Configure auto-allocation rules'}</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Wallet Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {language === 'ar' ? 'إضافة محفظة جديدة' : 'Add New Wallet'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {language === 'ar' ? 'اسم المحفظة' : 'Wallet Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'مثال: VF Cash 010xxxx' : 'e.g. VF Cash 010xxxx'}
                    value={newWallet.name}
                    onChange={e => setNewWallet({...newWallet, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {language === 'ar' ? 'المزود' : 'Provider'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newWallet.provider}
                      onChange={e => setNewWallet({...newWallet, provider: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {PROVIDER_OPTIONS.map(provider => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {language === 'ar' ? 'رقم المحفظة' : 'Wallet Number'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? '01xxxxxxxxx' : '01xxxxxxxxx'}
                      value={newWallet.walletNumber}
                      onChange={e => setNewWallet({...newWallet, walletNumber: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {language === 'ar' ? 'الحد الشهري (ج.م)' : 'Monthly Limit (EGP)'}
                    </label>
                    <input
                      type="number"
                      value={newWallet.limit}
                      onChange={e => setNewWallet({...newWallet, limit: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {language === 'ar' ? 'الحد اليومي (ج.م)' : 'Daily Limit (EGP)'}
                    </label>
                    <input
                      type="number"
                      value={newWallet.dailyLimit}
                      onChange={e => setNewWallet({...newWallet, dailyLimit: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {language === 'ar' ? 'الحالة الأولية' : 'Initial Status'}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={newWallet.status === 'active'}
                        onChange={() => setNewWallet({...newWallet, status: 'active'})}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-full text-sm">
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={newWallet.status === 'inactive'}
                        onChange={() => setNewWallet({...newWallet, status: 'inactive'})}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/30 rounded-full text-sm">
                        {language === 'ar' ? 'غير نشط' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm md:text-base"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddWallet}
                  className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-lg font-bold shadow-lg shadow-primary/20 transition-all text-sm md:text-base"
                >
                  {language === 'ar' ? 'إنشاء المحفظة' : 'Create Wallet'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};