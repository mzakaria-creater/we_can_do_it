import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  Activity,
  RefreshCw,
  Plus,
  Ban,
  Check,
  AlertCircle,
  DollarSign,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
  ShoppingCart,
  Split,
  Search,
  ShieldCheck,
  X
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey } from '../../lib/supabase';
import { toast } from 'sonner';

interface Provider {
  id: string;
  name: string;
  type: string;
  logo: string;
  status: string;
}

interface WalletData {
  id: string;
  providerId: string;
  providerName: string;
  walletNumber: string;
  dailyLimit: number;
  dailyUsed: number;
  status: 'active' | 'blocked';
  createdAt: string;
}

interface MasterTransaction {
  id: string;
  providerId: string;
  totalAmount: number;
  status: 'created' | 'pending' | 'partial' | 'paid';
  reference: string;
  createdAt: string;
  splits: SplitTransaction[];
}

interface SplitTransaction {
  id: string;
  masterId: string;
  walletId: string;
  walletNumber: string;
  amount: number;
  status: 'pending' | 'approved';
  createdAt: string;
  approvedAt?: string;
}

export function WalletAllocation() {
  const { t } = useTranslation();
  const { language, isAuthenticated } = useStore();
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [masterTransactions, setMasterTransactions] = useState<MasterTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Allocation form state
  const [selectedProvider, setSelectedProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [allocating, setAllocating] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentAllocation, setCurrentAllocation] = useState<MasterTransaction | null>(null);

  // Quick Extraction State
  const [lookupAmount, setLookupAmount] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedWallet, setExtractedWallet] = useState<any>(null);

  const handleQuickExtract = async () => {
    if (!lookupAmount || parseFloat(lookupAmount) <= 0) return;
    
    try {
      setExtracting(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const { data, error } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: { 'Authorization': authHeader },
        path: `make-server-46c3f42b/allocate-wallet?amount=${lookupAmount}&provider=Vodafone Cash`
      });

      if (error) throw error;
      setExtractedWallet(data);
      if (data.requiresSplit) {
        toast.info('Amount exceeds single wallet limit. Multiple wallets suggested.');
      } else {
        toast.success(`Wallet found: ${data.wallet.number}`);
      }
    } catch (err: any) {
      toast.error('Failed to extract wallet');
    } finally {
      setExtracting(false);
    }
  };

  // Fetch data
  const fetchData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      // Fetch providers
      const { data: providersData } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/providers'
      });

      // Fetch wallets
      const { data: walletsData } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/wallets'
      });

      // Fetch master transactions
      const { data: mastersData } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/master-transactions'
      });

      setProviders(providersData?.providers || []);
      setWallets(walletsData?.wallets || []);
      setMasterTransactions(mastersData?.masters || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (isAuthenticated) {
        toast.error(`Failed to load data: ${error.message || 'Server error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  // Create allocation
  const handleAllocate = async () => {
    if (!selectedProvider || !amount) {
      toast.error(language === 'ar' ? 'الرجاء ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(language === 'ar' ? 'المبلغ غير صحيح' : 'Invalid amount');
      return;
    }

    try {
      setAllocating(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/master-transactions',
        body: {
          providerId: selectedProvider,
          amount: amountNum
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || 'Allocation successful');
        setCurrentAllocation({ ...data.master, splits: data.allocations });
        setShowCheckout(true);
        setAmount('');
        setSelectedProvider('');
        fetchData();
      } else {
        throw new Error(data?.error || 'Allocation failed');
      }
    } catch (error: any) {
      console.error('Allocation error:', error);
      toast.error(error.message || 'Failed to allocate');
    } finally {
      setAllocating(false);
    }
  };

  // Approve split
  const approveSplit = async (splitId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/splits/approve',
        body: { id: splitId }
      });

      if (error) throw error;

      toast.success(language === 'ar' ? 'تم التأكيد بنجاح' : 'Payment confirmed');
      fetchData();
      
      // Update current allocation if in checkout
      if (currentAllocation && data?.master) {
        setCurrentAllocation(data.master);
      }
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error(error.message || 'Failed to approve');
    }
  };

  // Update wallet status
  const updateWalletStatus = async (walletId: string, status: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/wallets/status',
        body: { id: walletId, status }
      });

      if (error) throw error;

      toast.success(language === 'ar' ? 'تم تحديث المحفظة' : 'Wallet updated');
      fetchData();
    } catch (error: any) {
      console.error('Update wallet error:', error);
      toast.error(error.message || 'Failed to update wallet');
    }
  };

  // Reset wallet daily usage
  const resetWalletDaily = async (walletId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/wallets/reset-daily',
        body: { id: walletId }
      });

      if (error) throw error;

      toast.success(language === 'ar' ? 'تم إعادة التعيين' : 'Daily usage reset');
      fetchData();
    } catch (error: any) {
      console.error('Reset error:', error);
      toast.error(error.message || 'Failed to reset');
    }
  };

  // Calculate wallet stats
  const getWalletsByProvider = (providerId: string) => {
    return wallets.filter(w => w.providerId === providerId);
  };

  const getTotalCapacity = (providerId: string) => {
    const providerWallets = getWalletsByProvider(providerId);
    return providerWallets.reduce((sum, w) => sum + (w.dailyLimit - w.dailyUsed), 0);
  };

  const statusConfig: any = {
    created: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Created' },
    pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pending' },
    partial: { color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Partial' },
    paid: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Paid' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            Wallet Allocation System
          </h1>
          <p className="text-muted-foreground mt-1">Intelligent multi-wallet distribution engine</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Allocation Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Create New Allocation</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Provider Select */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              disabled={allocating}
            >
              <option value="">Select Provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.logo} {provider.name} - Available: {getTotalCapacity(provider.id).toLocaleString()} EGP
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Amount (EGP)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={allocating}
              />
            </div>
          </div>

          {/* Allocate Button */}
          <div className="flex items-end">
            <button
              onClick={handleAllocate}
              disabled={allocating || !selectedProvider || !amount}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {allocating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Allocating...</span>
                </>
              ) : (
                <>
                  <Split className="w-5 h-5" />
                  <span>Allocate Wallets</span>
                </>
              )}
            </button>
          </div>
        </div>

        {selectedProvider && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-500">
              <Activity className="w-4 h-4 inline mr-2" />
              Available capacity: <strong>{getTotalCapacity(selectedProvider).toLocaleString()} EGP</strong> across{' '}
              <strong>{getWalletsByProvider(selectedProvider).filter(w => w.status === 'active').length}</strong> active wallets
            </p>
          </div>
        )}
      </div>

      {/* Quick Wallet Extraction */}
      <div className="bg-card border border-border rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Vodafone Cash Quick Lookup</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="number"
              value={lookupAmount}
              onChange={(e) => setLookupAmount(e.target.value)}
              placeholder="Enter amount to check allocation..."
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={handleQuickExtract}
            disabled={extracting || !lookupAmount}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {extracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Extract Wallet
          </button>
        </div>

        {extractedWallet && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 border border-border rounded-2xl bg-muted/30"
          >
            {extractedWallet.requiresSplit ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-bold">Split Required</p>
                </div>
                <p className="text-sm text-muted-foreground">This amount exceeds the individual limits of available wallets. Suggested distribution:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {extractedWallet.suggestedWallets.map((w: any) => (
                    <div key={w.id} className="p-3 bg-card border border-border rounded-xl">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Wallet Number</p>
                      <p className="font-mono font-bold text-primary">{w.number}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Avail: {w.available.toLocaleString()} EGP</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Allocated Wallet Number</p>
                    <h4 className="text-3xl font-black font-mono tracking-tighter text-primary">{extractedWallet.wallet.number}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Available Capacity</p>
                  <p className="text-xl font-bold">{extractedWallet.wallet.available.toLocaleString()} EGP</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Wallets Overview by Provider */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider, idx) => {
          const providerWallets = getWalletsByProvider(provider.id);
          const totalLimit = providerWallets.reduce((sum, w) => sum + w.dailyLimit, 0);
          const totalUsed = providerWallets.reduce((sum, w) => sum + w.dailyUsed, 0);
          const usagePercent = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
          
          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{provider.logo}</span>
                  <div>
                    <h3 className="font-bold">{provider.name}</h3>
                    <p className="text-xs text-muted-foreground">{providerWallets.length} wallets</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Daily Usage</span>
                    <span className="font-medium">{usagePercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Limit</p>
                    <p className="text-sm font-bold">{totalLimit.toLocaleString()} EGP</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Available</p>
                    <p className="text-sm font-bold text-emerald-500">{(totalLimit - totalUsed).toLocaleString()} EGP</p>
                  </div>
                </div>
              </div>

              {/* Wallets List */}
              <div className="mt-4 space-y-2">
                {providerWallets.map(wallet => {
                  const available = wallet.dailyLimit - wallet.dailyUsed;
                  const usedPercent = (wallet.dailyUsed / wallet.dailyLimit) * 100;
                  
                  return (
                    <div key={wallet.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono">{wallet.walletNumber}</span>
                        <div className="flex items-center gap-1">
                          {wallet.status === 'active' ? (
                            <button
                              onClick={() => updateWalletStatus(wallet.id, 'blocked')}
                              className="p-1 hover:bg-red-500/20 rounded transition-colors"
                              title="Block"
                            >
                              <Ban className="w-3 h-3 text-red-500" />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateWalletStatus(wallet.id, 'active')}
                              className="p-1 hover:bg-emerald-500/20 rounded transition-colors"
                              title="Activate"
                            >
                              <Check className="w-3 h-3 text-emerald-500" />
                            </button>
                          )}
                          <button
                            onClick={() => resetWalletDaily(wallet.id)}
                            className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                            title="Reset Daily"
                          >
                            <RefreshCw className="w-3 h-3 text-blue-500" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={wallet.status === 'active' ? 'text-emerald-500' : 'text-red-500'}>
                          {available.toLocaleString()} / {wallet.dailyLimit.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">{usedPercent.toFixed(0)}% used</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Master Transactions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Recent Allocations</h2>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading allocations...</p>
          </div>
        ) : masterTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No allocations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {masterTransactions.slice(0, 5).map((master, idx) => (
              <motion.div
                key={master.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{master.reference}</p>
                    <p className="text-2xl font-bold">{master.totalAmount.toLocaleString()} EGP</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full ${statusConfig[master.status]?.bg || 'bg-muted'}`}>
                    <span className={`text-xs font-medium ${statusConfig[master.status]?.color || 'text-muted-foreground'}`}>
                      {statusConfig[master.status]?.label || master.status}
                    </span>
                  </div>
                </div>

                {master.splits && master.splits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Split Transactions ({master.splits.length})</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {master.splits.map(split => (
                        <div key={split.id} className="flex items-center justify-between p-2 bg-background rounded">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-mono">{split.walletNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{split.amount.toLocaleString()}</span>
                            {split.status === 'approved' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && currentAllocation && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCheckout(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Payment Allocation</h3>
                    <p className="text-sm text-muted-foreground mt-1">Complete payment for each wallet</p>
                  </div>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-primary">{currentAllocation.totalAmount.toLocaleString()} EGP</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusConfig[currentAllocation.status]?.bg.replace('/10', '')}`} />
                      <p className="font-bold">{statusConfig[currentAllocation.status]?.label}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Split className="w-4 h-4" />
                    Split Payments
                  </h4>
                  <div className="space-y-3">
                    {currentAllocation.splits.map((split, i) => (
                      <div key={split.id} className="p-4 bg-background border border-border rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase">Send to number</p>
                            <p className="font-mono font-bold text-lg">{split.walletNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground font-bold uppercase">Amount</p>
                            <p className="font-black text-xl">{split.amount.toLocaleString()} EGP</p>
                          </div>
                          {split.status === 'approved' ? (
                            <div className="flex items-center gap-2 text-emerald-500 font-bold bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
                              <CheckCircle2 className="w-5 h-5" />
                              Confirmed
                            </div>
                          ) : (
                            <button
                              onClick={() => approveSplit(split.id)}
                              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                            >
                              Confirm Payment
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/30 border-t border-border flex justify-end">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="px-8 py-3 bg-card border border-border rounded-xl font-bold hover:bg-muted transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
