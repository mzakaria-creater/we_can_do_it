import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  DollarSign,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Settings,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  X
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { copyToClipboard as copyText } from '../../lib/clipboard';

interface Gateway {
  id: string;
  name: string;
  provider: string;
  type: 'card' | 'wallet' | 'bank' | 'crypto';
  status: 'active' | 'inactive' | 'testing';
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  currency: string[];
  countries: string[];
  features: string[];
  dailyLimit: number;
  monthlyLimit: number;
  feePercentage: number;
  fixedFee: number;
  createdAt: string;
  lastUsed?: string;
}

const MOCK_GATEWAYS: Gateway[] = [
  {
    id: 'gw-1',
    name: 'Fawry Production',
    provider: 'Fawry',
    type: 'wallet',
    status: 'active',
    merchantId: 'FWR-MER-12345',
    apiKey: 'pk_live_fawry_***',
    apiSecret: 'sk_live_fawry_***',
    webhookUrl: 'https://press2pay.com/webhooks/fawry',
    currency: ['EGP'],
    countries: ['EG'],
    features: ['instant', 'refunds', 'cashback'],
    dailyLimit: 1000000,
    monthlyLimit: 30000000,
    feePercentage: 2.5,
    fixedFee: 0,
    createdAt: '2024-01-15',
    lastUsed: '2024-02-14'
  },
  {
    id: 'gw-2',
    name: 'Stripe MENA',
    provider: 'Stripe',
    type: 'card',
    status: 'active',
    merchantId: 'acct_stripe_mena_001',
    apiKey: 'pk_live_stripe_***',
    apiSecret: 'sk_live_stripe_***',
    webhookUrl: 'https://press2pay.com/webhooks/stripe',
    currency: ['USD', 'EUR', 'SAR', 'AED'],
    countries: ['SA', 'AE', 'EG', 'JO'],
    features: ['3ds', 'recurring', 'refunds'],
    dailyLimit: 5000000,
    monthlyLimit: 150000000,
    feePercentage: 2.9,
    fixedFee: 0.3,
    createdAt: '2024-01-10',
    lastUsed: '2024-02-15'
  },
  {
    id: 'gw-3',
    name: 'Vodafone Cash Sandbox',
    provider: 'Vodafone',
    type: 'wallet',
    status: 'testing',
    merchantId: 'VF-TEST-001',
    apiKey: 'pk_test_vodafone_***',
    apiSecret: 'sk_test_vodafone_***',
    webhookUrl: 'https://press2pay.com/webhooks/vodafone',
    currency: ['EGP'],
    countries: ['EG'],
    features: ['instant', 'qr'],
    dailyLimit: 100000,
    monthlyLimit: 3000000,
    feePercentage: 2.0,
    fixedFee: 0,
    createdAt: '2024-02-01'
  },
  {
    id: 'gw-4',
    name: 'PayPal MENA (Inactive)',
    provider: 'PayPal',
    type: 'wallet',
    status: 'inactive',
    merchantId: 'paypal_mer_inactive',
    apiKey: 'pk_paypal_***',
    apiSecret: 'sk_paypal_***',
    webhookUrl: 'https://press2pay.com/webhooks/paypal',
    currency: ['USD', 'EUR'],
    countries: ['SA', 'AE', 'BH', 'KW'],
    features: ['refunds', 'recurring'],
    dailyLimit: 2000000,
    monthlyLimit: 60000000,
    feePercentage: 3.5,
    fixedFee: 0.5,
    createdAt: '2023-12-20'
  }
];

export const GatewayConfig = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [gateways, setGateways] = useState<Gateway[]>(MOCK_GATEWAYS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'card' | 'wallet' | 'bank' | 'crypto'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'testing'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string>('');

  const statusConfig = {
    active: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: CheckCircle, label: isRTL ? 'نشط' : 'Active' },
    inactive: { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30', icon: PowerOff, label: isRTL ? 'معطل' : 'Inactive' },
    testing: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', icon: AlertCircle, label: isRTL ? 'تجريبي' : 'Testing' }
  };

  const typeConfig = {
    card: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: CreditCard, label: isRTL ? 'بطاقة' : 'Card' },
    wallet: { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Globe, label: isRTL ? 'محفظة' : 'Wallet' },
    bank: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: DollarSign, label: isRTL ? 'بنك' : 'Bank' },
    crypto: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Shield, label: isRTL ? 'عملة رقمية' : 'Crypto' }
  };

  const filteredGateways = gateways.filter(gw => {
    const matchSearch = gw.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       gw.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || gw.type === filterType;
    const matchStatus = filterStatus === 'all' || gw.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const copyToClipboard = async (text: string, field: string) => {
    const success = await copyText(text);
    if (success) {
      setCopiedField(field);
      toast.success(isRTL ? 'تم النسخ!' : 'Copied!');
      setTimeout(() => setCopiedField(''), 2000);
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const toggleGatewayStatus = (id: string) => {
    setGateways(gateways.map(gw => {
      if (gw.id === id) {
        const newStatus = gw.status === 'active' ? 'inactive' : 'active';
        toast.success(`Gateway ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        return { ...gw, status: newStatus };
      }
      return gw;
    }));
  };

  const deleteGateway = (id: string) => {
    setGateways(gateways.filter(gw => gw.id !== id));
    toast.success(isRTL ? 'تم حذف البوابة' : 'Gateway deleted');
  };

  const stats = {
    total: gateways.length,
    active: gateways.filter(gw => gw.status === 'active').length,
    inactive: gateways.filter(gw => gw.status === 'inactive').length,
    testing: gateways.filter(gw => gw.status === 'testing').length
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'إعدادات البوابات' : 'Gateway Configuration'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL ? 'إدارة بوابات الدفع والاتصالات' : 'Manage payment gateways and connections'}
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>{isRTL ? 'إضافة بوابة' : 'Add Gateway'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Layers className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-white">{stats.total}</span>
            </div>
            <p className="text-sm text-gray-400">{isRTL ? 'إجمالي البوابات' : 'Total Gateways'}</p>
          </div>

          <div className="bg-[#14181D]/40 backdrop-blur-xl border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">{stats.active}</span>
            </div>
            <p className="text-sm text-gray-400">{isRTL ? 'نشطة' : 'Active'}</p>
          </div>

          <div className="bg-[#14181D]/40 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{stats.testing}</span>
            </div>
            <p className="text-sm text-gray-400">{isRTL ? 'تجريبية' : 'Testing'}</p>
          </div>

          <div className="bg-[#14181D]/40 backdrop-blur-xl border border-gray-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <PowerOff className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-400">{stats.inactive}</span>
            </div>
            <p className="text-sm text-gray-400">{isRTL ? 'معطلة' : 'Inactive'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'البحث عن بوابة...' : 'Search gateways...'}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            >
              <option value="all">{isRTL ? 'كل الأنواع' : 'All Types'}</option>
              <option value="card">{isRTL ? 'بطاقات' : 'Cards'}</option>
              <option value="wallet">{isRTL ? 'محافظ' : 'Wallets'}</option>
              <option value="bank">{isRTL ? 'بنوك' : 'Banks'}</option>
              <option value="crypto">{isRTL ? 'عملات رقمية' : 'Crypto'}</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            >
              <option value="all">{isRTL ? 'كل الحالات' : 'All Status'}</option>
              <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
              <option value="testing">{isRTL ? 'تجريبي' : 'Testing'}</option>
              <option value="inactive">{isRTL ? 'معطل' : 'Inactive'}</option>
            </select>

            <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white transition-all flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="hidden sm:inline">{isRTL ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Gateways List */}
        <div className="space-y-3">
          {filteredGateways.map((gateway, idx) => {
            const StatusIcon = statusConfig[gateway.status].icon;
            const TypeIcon = typeConfig[gateway.type].icon;
            
            return (
              <motion.div
                key={gateway.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-[#D4AF37]/30 transition-all"
              >
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-6 h-6 text-[#0B0F14]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1">{gateway.name}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-1 ${statusConfig[gateway.status].bg} ${statusConfig[gateway.status].border} border rounded-lg text-xs font-medium ${statusConfig[gateway.status].color} flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[gateway.status].label}
                          </span>
                          <span className={`px-2 py-1 ${typeConfig[gateway.type].bg} rounded-lg text-xs font-medium ${typeConfig[gateway.type].color}`}>
                            {typeConfig[gateway.type].label}
                          </span>
                          <span className="text-xs text-gray-500">{gateway.provider}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleGatewayStatus(gateway.id)}
                        className={`p-2 rounded-lg border transition-all ${
                          gateway.status === 'active'
                            ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                            : 'bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20'
                        }`}
                      >
                        {gateway.status === 'active' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setSelectedGateway(gateway)}
                        className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGateway(gateway.id)}
                        className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'معرف التاجر' : 'Merchant ID'}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-white font-mono truncate">{gateway.merchantId}</p>
                        <button
                          onClick={() => copyToClipboard(gateway.merchantId, `merchant-${gateway.id}`)}
                          className="p-1 hover:bg-white/10 rounded transition-all"
                        >
                          {copiedField === `merchant-${gateway.id}` ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'العملات' : 'Currencies'}</p>
                      <p className="text-sm text-white">{gateway.currency.join(', ')}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'الدول' : 'Countries'}</p>
                      <p className="text-sm text-white">{gateway.countries.join(', ')}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'الرسوم' : 'Fees'}</p>
                      <p className="text-sm text-white">{gateway.feePercentage}% + ${gateway.fixedFee}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'الحد اليومي' : 'Daily Limit'}</p>
                      <p className="text-sm text-white">${(gateway.dailyLimit / 1000).toFixed(0)}K</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'آخر استخدام' : 'Last Used'}</p>
                      <p className="text-sm text-white">{gateway.lastUsed || (isRTL ? 'لم يستخدم' : 'Never')}</p>
                    </div>
                  </div>

                  {/* API Keys */}
                  <div className="space-y-2">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-blue-400 font-medium">{isRTL ? 'مفتاح API' : 'API Key'}</p>
                        <button
                          onClick={() => setShowKeys({ ...showKeys, [`key-${gateway.id}`]: !showKeys[`key-${gateway.id}`] })}
                          className="p-1 hover:bg-blue-500/20 rounded transition-all"
                        >
                          {showKeys[`key-${gateway.id}`] ? (
                            <EyeOff className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-blue-400" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-white font-mono truncate">
                          {showKeys[`key-${gateway.id}`] ? gateway.apiKey : '•••••••••••••••'}
                        </p>
                        <button
                          onClick={() => copyToClipboard(gateway.apiKey, `key-${gateway.id}`)}
                          className="p-1 hover:bg-blue-500/20 rounded transition-all"
                        >
                          {copiedField === `key-${gateway.id}` ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-blue-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-purple-400 font-medium">{isRTL ? 'المفتاح السري' : 'API Secret'}</p>
                        <button
                          onClick={() => setShowKeys({ ...showKeys, [`secret-${gateway.id}`]: !showKeys[`secret-${gateway.id}`] })}
                          className="p-1 hover:bg-purple-500/20 rounded transition-all"
                        >
                          {showKeys[`secret-${gateway.id}`] ? (
                            <EyeOff className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-purple-400" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-white font-mono truncate">
                          {showKeys[`secret-${gateway.id}`] ? gateway.apiSecret : '•••••••••••••••'}
                        </p>
                        <button
                          onClick={() => copyToClipboard(gateway.apiSecret, `secret-${gateway.id}`)}
                          className="p-1 hover:bg-purple-500/20 rounded transition-all"
                        >
                          {copiedField === `secret-${gateway.id}` ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-purple-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                      <p className="text-xs text-cyan-400 font-medium mb-2">{isRTL ? 'عنوان Webhook' : 'Webhook URL'}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-white font-mono truncate">{gateway.webhookUrl}</p>
                        <button
                          onClick={() => copyToClipboard(gateway.webhookUrl, `webhook-${gateway.id}`)}
                          className="p-1 hover:bg-cyan-500/20 rounded transition-all"
                        >
                          {copiedField === `webhook-${gateway.id}` ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-cyan-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-2">{isRTL ? 'المميزات' : 'Features'}</p>
                    <div className="flex flex-wrap gap-2">
                      {gateway.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg text-xs text-[#D4AF37] font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredGateways.length === 0 && (
          <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
            <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              {isRTL ? 'لا توجد بوابات' : 'No Gateways Found'}
            </h3>
            <p className="text-gray-500">
              {isRTL ? 'حاول تغيير الفلاتر أو إضافة بوابة جديدة' : 'Try changing filters or add a new gateway'}
            </p>
          </div>
        )}

        {/* Add Modal Placeholder */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#14181D] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {isRTL ? 'إضافة بوابة جديدة' : 'Add New Gateway'}
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-400">
                    {isRTL ? 'نموذج الإضافة قيد التطوير...' : 'Add form coming soon...'}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};