import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Plus,
  Search,
  Key,
  Copy,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Code2,
  Wallet,
  DollarSign,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey } from '../../lib/supabase';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboard';

interface Merchant {
  id: string;
  merchantCode: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  apiKey: string;
  apiSecret: string;
  status: 'verified' | 'suspended' | 'pending';
  monthlyVolume: number;
  joinedAt: string;
  logo: string;
}

export function MerchantsPortal() {
  const { t } = useTranslation();
  const { language, isAuthenticated } = useStore();
  
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState<Record<string, boolean>>({});
  
  // New merchant form
  const [newMerchant, setNewMerchant] = useState({
    name: '',
    category: 'retail',
    email: '',
    phone: ''
  });

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

      // Fetch merchants
      const { data: merchantsData } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/merchants'
      });

      setMerchants(merchantsData?.merchants || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (isAuthenticated) {
        toast.error(`${t('loadHistoryFailed')}: ${error.message || 'Server error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  // Create merchant
  const createMerchant = async () => {
    if (!newMerchant.name || !newMerchant.email) {
      toast.error(language === 'ar' ? 'الرجاء ملء جميع الحقول' : 'Please fill required fields');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/merchants/create',
        body: newMerchant
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(language === 'ar' ? 'تم إنشاء التاجر بنجاح' : 'Merchant created successfully');
        setShowAddMerchant(false);
        setNewMerchant({ name: '', category: 'retail', email: '', phone: '' });
        fetchData();
      }
    } catch (error: any) {
      console.error('Create merchant error:', error);
      toast.error(error.message || 'Failed to create merchant');
    }
  };

  // Copy to clipboard
  const copyText = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(t('copySuccess'));
    } else {
      toast.error(t('copyFailed') || 'Failed to copy');
    }
  };

  // Filter merchants
  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.merchantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryIcons: Record<string, string> = {
    retail: '🛍️',
    tech: '💻',
    grocery: '🍔',
    leisure: '✈️'
  };

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            {t('merchantsPortal')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('manageMerchants')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('refresh')}</span>
          </button>
          <button 
            onClick={() => setShowAddMerchant(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('addMerchant')}</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="relative">
          <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
          />
        </div>
      </div>

      {/* Merchants List */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center bg-card border border-border rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t('loadingHistory')}</p>
        </div>
      ) : filteredMerchants.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-xl">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('noReportsFound')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMerchants.map((merchant, idx) => (
            <motion.div
              key={merchant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center text-3xl">
                      {merchant.logo || categoryIcons[merchant.category] || '🏢'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{merchant.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{t(merchant.category)}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className={`text-sm font-medium ${
                          merchant.status === 'verified' ? 'text-emerald-500' :
                          merchant.status === 'suspended' ? 'text-red-500' : 'text-amber-500'
                        }`}>
                          {t(merchant.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-${language === 'ar' ? 'left' : 'right'}`}>
                    <p className="text-sm text-muted-foreground">{t('monthlyVol')}</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      ${(merchant.monthlyVolume / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>

              {/* Merchant Code Section */}
              <div className="p-6 bg-muted/30 border-t border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">{t('mid')}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Merchant Code */}
                  <div className="p-4 bg-background rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">{t('mid')}</label>
                      <button
                        onClick={() => copyText(merchant.merchantCode, 'Merchant Code')}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <code className="text-lg font-bold font-mono text-primary block">
                      {merchant.merchantCode}
                    </code>
                  </div>

                  {/* Contact Info */}
                  <div className="p-4 bg-background rounded-lg">
                    <label className="text-xs font-medium text-muted-foreground block mb-2 uppercase">{t('contact')}</label>
                    <div className="space-y-1">
                      <p className="text-sm">{merchant.email}</p>
                      <p className="text-sm text-muted-foreground">{merchant.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Credentials Section */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Key className="w-5 h-5 text-amber-500" />
                  <h4 className="font-semibold">{t('apiCredentials')}</h4>
                </div>

                <div className="space-y-3">
                  {/* API Key */}
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">{t('apiKey')}</label>
                      <button
                        onClick={() => copyText(merchant.apiKey, 'API Key')}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <code className="text-sm font-mono break-all">{merchant.apiKey}</code>
                  </div>

                  {/* API Secret */}
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">{t('apiSecret')}</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowApiSecret(prev => ({
                            ...prev,
                            [merchant.id]: !prev[merchant.id]
                          }))}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          {showApiSecret[merchant.id] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => copyText(merchant.apiSecret, 'API Secret')}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <code className="text-sm font-mono break-all">
                      {showApiSecret[merchant.id] 
                        ? merchant.apiSecret 
                        : '•'.repeat(merchant.apiSecret.length)}
                    </code>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-muted/30 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {t('created')}: {new Date(merchant.joinedAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
                    {t('transactions')}
                  </button>
                  <button className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                    {t('settings')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Merchant Modal */}
      {showAddMerchant && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddMerchant(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <h3 className="text-xl font-bold">{t('addMerchant')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('onboarding')}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('merchantName')} *</label>
                <input
                  type="text"
                  value={newMerchant.name}
                  onChange={(e) => setNewMerchant(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('merchantName')}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('category')}</label>
                <select
                  value={newMerchant.category}
                  onChange={(e) => setNewMerchant(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="retail">{t('retail')}</option>
                  <option value="tech">{t('tech')}</option>
                  <option value="grocery">{t('grocery')}</option>
                  <option value="leisure">{t('leisure')}</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('email')} *</label>
                <input
                  type="email"
                  value={newMerchant.email}
                  onChange={(e) => setNewMerchant(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="merchant@example.com"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="p-6 bg-muted/30 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddMerchant(false)}
                className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={createMerchant}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('create')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}