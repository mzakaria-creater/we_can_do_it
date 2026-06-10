import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key,
  Code,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Activity,
  Lock,
  Unlock,
  FileText,
  Download,
  Zap,
  Globe,
  Shield,
  X,
  Search,
  Filter,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboard';

interface APIKey {
  id: string;
  name: string;
  key: string;
  environment: 'production' | 'staging' | 'development';
  status: 'active' | 'inactive' | 'revoked';
  permissions: string[];
  requests: {
    total: number;
    today: number;
    limit: number;
  };
  createdAt: string;
  lastUsed?: string;
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  descriptionAr: string;
  authenticated: boolean;
  rateLimit: number;
  avgResponseTime: number;
}

export const APIManagement = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: 'key-001',
      name: 'Production API Key',
      key: 'p2p_live_sk_abc123xyz789def456ghi',
      environment: 'production',
      status: 'active',
      permissions: ['read', 'write', 'delete'],
      requests: { total: 125000, today: 450, limit: 10000 },
      createdAt: '2024-01-15',
      lastUsed: new Date().toISOString()
    },
    {
      id: 'key-002',
      name: 'Staging API Key',
      key: 'p2p_test_sk_xyz789abc123def456ghi',
      environment: 'staging',
      status: 'active',
      permissions: ['read', 'write'],
      requests: { total: 8500, today: 125, limit: 5000 },
      createdAt: '2024-01-10',
      lastUsed: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'key-003',
      name: 'Development Key',
      key: 'p2p_dev_sk_def456xyz789abc123ghi',
      environment: 'development',
      status: 'active',
      permissions: ['read'],
      requests: { total: 2300, today: 45, limit: 1000 },
      createdAt: '2024-01-20',
      lastUsed: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'key-004',
      name: 'Old Production Key',
      key: 'p2p_live_sk_old123old456old789old',
      environment: 'production',
      status: 'revoked',
      permissions: ['read', 'write'],
      requests: { total: 85000, today: 0, limit: 10000 },
      createdAt: '2023-12-01',
      lastUsed: new Date(Date.now() - 172800000).toISOString()
    },
  ]);

  const [endpoints] = useState<APIEndpoint[]>([
    { method: 'POST', path: '/api/v1/transactions/deposit', description: 'Create deposit transaction', descriptionAr: 'إنشاء معاملة إيداع', authenticated: true, rateLimit: 100, avgResponseTime: 245 },
    { method: 'POST', path: '/api/v1/transactions/payout', description: 'Create payout transaction', descriptionAr: 'إنشاء معاملة سحب', authenticated: true, rateLimit: 50, avgResponseTime: 380 },
    { method: 'GET', path: '/api/v1/transactions/:id', description: 'Get transaction details', descriptionAr: 'الحصول على تفاصيل المعاملة', authenticated: true, rateLimit: 500, avgResponseTime: 120 },
    { method: 'GET', path: '/api/v1/transactions', description: 'List all transactions', descriptionAr: 'عرض جميع المعاملات', authenticated: true, rateLimit: 200, avgResponseTime: 180 },
    { method: 'PUT', path: '/api/v1/transactions/:id/status', description: 'Update transaction status', descriptionAr: 'تحديث حالة المعاملة', authenticated: true, rateLimit: 100, avgResponseTime: 210 },
    { method: 'POST', path: '/api/v1/webhooks', description: 'Receive webhook notifications', descriptionAr: 'استقبال إشعارات webhook', authenticated: true, rateLimit: 1000, avgResponseTime: 95 },
    { method: 'GET', path: '/api/v1/merchants', description: 'List merchants', descriptionAr: 'عرض التجار', authenticated: true, rateLimit: 200, avgResponseTime: 150 },
    { method: 'DELETE', path: '/api/v1/transactions/:id', description: 'Delete transaction', descriptionAr: 'حذف معاملة', authenticated: true, rateLimit: 50, avgResponseTime: 190 },
  ]);

  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    environment: 'development' as 'production' | 'staging' | 'development',
    permissions: [] as string[],
    rateLimit: 1000
  });

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const copyKey = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(isRTL ? 'تم نسخ المفتاح' : 'API key copied to clipboard');
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return key;
    return key.substring(0, 12) + '••••••••••••••••••••' + key.substring(key.length - 4);
  };

  const handleCreateKey = () => {
    if (!newKeyForm.name) {
      toast.error(isRTL ? 'الرجاء إدخال اسم المفتاح' : 'Please enter key name');
      return;
    }

    const newKey: APIKey = {
      id: `key-${String(apiKeys.length + 1).padStart(3, '0')}`,
      name: newKeyForm.name,
      key: `p2p_${newKeyForm.environment === 'production' ? 'live' : newKeyForm.environment === 'staging' ? 'test' : 'dev'}_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      environment: newKeyForm.environment,
      status: 'active',
      permissions: newKeyForm.permissions,
      requests: { total: 0, today: 0, limit: newKeyForm.rateLimit },
      createdAt: new Date().toISOString().split('T')[0]
    };

    setApiKeys([newKey, ...apiKeys]);
    setIsCreateModalOpen(false);
    toast.success(isRTL ? 'تم إنشاء مفتاح API بنجاح' : 'API key created successfully');
    
    // Reset form
    setNewKeyForm({
      name: '',
      environment: 'development',
      permissions: [],
      rateLimit: 1000
    });
  };

  const handleRevokeKey = (id: string) => {
    if (confirm(isRTL ? 'هل تريد إلغاء هذا المفتاح؟' : 'Revoke this API key?')) {
      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, status: 'revoked' as const } : key
      ));
      toast.success(isRTL ? 'تم إلغاء المفتاح' : 'API key revoked');
    }
  };

  const handleRegenerateKey = (id: string) => {
    if (confirm(isRTL ? 'هل تريد إعادة إنشاء هذا المفتاح؟' : 'Regenerate this API key?')) {
      setApiKeys(apiKeys.map(key => {
        if (key.id === id) {
          const prefix = key.environment === 'production' ? 'live' : key.environment === 'staging' ? 'test' : 'dev';
          return {
            ...key,
            key: `p2p_${prefix}_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
          };
        }
        return key;
      }));
      toast.success(isRTL ? 'تم إعادة إنشاء المفتاح' : 'API key regenerated');
    }
  };

  // Filter keys
  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         key.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnvironment = environmentFilter === 'all' || key.environment === environmentFilter;
    const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
    return matchesSearch && matchesEnvironment && matchesStatus;
  });

  const stats = {
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.filter(k => k.status === 'active').length,
    totalRequests: apiKeys.reduce((sum, k) => sum + k.requests.today, 0),
    avgResponseTime: Math.round(endpoints.reduce((sum, e) => sum + e.avgResponseTime, 0) / endpoints.length),
  };

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}${isRTL ? ' يوم' : 'd ago'}`;
    if (hours > 0) return `${hours}${isRTL ? ' ساعة' : 'h ago'}`;
    return isRTL ? 'الآن' : 'Just now';
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'إدارة API' : 'API Management'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL 
                ? 'إدارة المفاتيح والوصول إلى API'
                : 'Manage API keys and access'
              }
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsDocsModalOpen(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-all border border-white/10"
            >
              <FileText className="w-5 h-5" />
              <span>{isRTL ? 'الوثائق' : 'Documentation'}</span>
            </button>
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-all border border-white/10">
              <Download className="w-5 h-5" />
              <span>{isRTL ? 'تصدير' : 'Export'}</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-[#D4AF37]/20"
            >
              <Plus className="w-5 h-5" />
              <span>{isRTL ? 'مفتاح جديد' : 'New API Key'}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalKeys}</h3>
            <p className="text-sm text-gray-400">{isRTL ? 'إجمالي المفاتيح' : 'Total Keys'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-green-400 mb-1">{stats.activeKeys}</h3>
            <p className="text-sm text-gray-400">{isRTL ? 'مفاتيح نشطة' : 'Active Keys'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-purple-400 mb-1">{stats.totalRequests.toLocaleString()}</h3>
            <p className="text-sm text-gray-400">{isRTL ? 'الطلبات اليوم' : 'Requests Today'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#D4AF37]/10 to-[#0B0F14] border border-[#D4AF37]/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#D4AF37] mb-1">{stats.avgResponseTime}ms</h3>
            <p className="text-sm text-gray-400">{isRTL ? 'متوسط الاستجابة' : 'Avg Response'}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" style={{ left: isRTL ? 'auto' : '0.75rem', right: isRTL ? '0.75rem' : 'auto' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'البحث في المفاتيح...' : 'Search API keys...'}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-10 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                style={{ paddingLeft: isRTL ? '1rem' : '2.5rem', paddingRight: isRTL ? '2.5rem' : '1rem' }}
              />
            </div>

            <select
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            >
              <option value="all">{isRTL ? 'كل البيئات' : 'All Environments'}</option>
              <option value="production">{isRTL ? 'الإنتاج' : 'Production'}</option>
              <option value="staging">{isRTL ? 'التجريبي' : 'Staging'}</option>
              <option value="development">{isRTL ? 'التطوير' : 'Development'}</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            >
              <option value="all">{isRTL ? 'كل الحالات' : 'All Status'}</option>
              <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
              <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
              <option value="revoked">{isRTL ? 'ملغي' : 'Revoked'}</option>
            </select>

            <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-all border border-white/10">
              <Filter className="w-5 h-5" />
              <span>{isRTL ? 'مزيد من الفلاتر' : 'More Filters'}</span>
            </button>
          </div>
        </div>

        {/* API Keys Table */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0B0F14]/60">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'مفتاح API' : 'API Key'}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'البيئة' : 'Environment'}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'الصلاحيات' : 'Permissions'}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'الاستخدام' : 'Usage'}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'آخر استخدام' : 'Last Used'}
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map((key, idx) => (
                  <motion.tr
                    key={key.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-white font-semibold">{key.name}</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-gray-400 bg-[#0B0F14] px-2 py-1 rounded">
                            {showKeys.has(key.id) ? key.key : maskKey(key.key)}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            {showKeys.has(key.id) ? 
                              <EyeOff className="w-4 h-4 text-gray-500" /> : 
                              <Eye className="w-4 h-4 text-gray-500" />
                            }
                          </button>
                          <button
                            onClick={() => copyKey(key.key)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        key.environment === 'production'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                          : key.environment === 'staging'
                          ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                      }`}>
                        {key.environment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${
                        key.status === 'active'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                          : key.status === 'inactive'
                          ? 'bg-gray-500/10 text-gray-500 border border-gray-500/30'
                          : 'bg-red-500/10 text-red-500 border border-red-500/30'
                      }`}>
                        {key.status === 'active' && <CheckCircle className="w-3.5 h-3.5" />}
                        {key.status === 'inactive' && <Lock className="w-3.5 h-3.5" />}
                        {key.status === 'revoked' && <XCircle className="w-3.5 h-3.5" />}
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map(perm => (
                          <span 
                            key={perm}
                            className="px-2 py-0.5 text-xs rounded bg-purple-500/10 text-purple-400 border border-purple-500/30"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {key.requests.today.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            / {key.requests.limit.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              (key.requests.today / key.requests.limit) * 100 >= 80
                                ? 'bg-red-500'
                                : (key.requests.today / key.requests.limit) * 100 >= 60
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((key.requests.today / key.requests.limit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">
                        {getRelativeTime(key.lastUsed)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {key.status === 'active' && (
                          <button
                            onClick={() => handleRegenerateKey(key.id)}
                            className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg transition-all text-yellow-500"
                            title={isRTL ? 'تجديد' : 'Regenerate'}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        
                        {key.status !== 'revoked' && (
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all text-red-500"
                            title={isRTL ? 'إلغاء' : 'Revoke'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              {isRTL ? 'نقاط النهاية المتاحة' : 'Available Endpoints'}
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {endpoints.map((endpoint, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-mono font-semibold rounded ${
                      endpoint.method === 'GET' ? 'bg-green-500/10 text-green-500 border border-green-500/30' :
                      endpoint.method === 'POST' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' :
                      endpoint.method === 'PUT' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                      endpoint.method === 'DELETE' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                      'bg-purple-500/10 text-purple-500 border border-purple-500/30'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-white">
                      {endpoint.path}
                    </code>
                    {endpoint.authenticated && (
                      <Shield className="w-4 h-4 text-yellow-500" title="Requires authentication" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{endpoint.avgResponseTime}ms</span>
                    <span>{endpoint.rateLimit}/min</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {isRTL ? endpoint.descriptionAr : endpoint.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl bg-[#14181D] border border-white/10 rounded-2xl shadow-2xl z-51"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-[#0B0F14]" />
                    </div>
                    {isRTL ? 'إنشاء مفتاح API جديد' : 'Create New API Key'}
                  </h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    {isRTL ? 'اسم المفتاح *' : 'Key Name *'}
                  </label>
                  <input
                    type="text"
                    value={newKeyForm.name}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                    placeholder={isRTL ? 'مثال: Production API Key' : 'e.g. Production API Key'}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      {isRTL ? 'البيئة' : 'Environment'}
                    </label>
                    <select
                      value={newKeyForm.environment}
                      onChange={(e) => setNewKeyForm({ ...newKeyForm, environment: e.target.value as any })}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                    >
                      <option value="development">{isRTL ? 'التطوير' : 'Development'}</option>
                      <option value="staging">{isRTL ? 'التجريبي' : 'Staging'}</option>
                      <option value="production">{isRTL ? 'الإنتاج' : 'Production'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      {isRTL ? 'الحد الأقصى للطلبات (يومياً)' : 'Rate Limit (per day)'}
                    </label>
                    <input
                      type="number"
                      value={newKeyForm.rateLimit}
                      onChange={(e) => setNewKeyForm({ ...newKeyForm, rateLimit: parseInt(e.target.value) })}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-3 block">
                    {isRTL ? 'الصلاحيات' : 'Permissions'}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['read', 'write', 'delete'].map(perm => (
                      <label
                        key={perm}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          newKeyForm.permissions.includes(perm)
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30'
                            : 'bg-[#0B0F14] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newKeyForm.permissions.includes(perm)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKeyForm({ ...newKeyForm, permissions: [...newKeyForm.permissions, perm] });
                            } else {
                              setNewKeyForm({ ...newKeyForm, permissions: newKeyForm.permissions.filter(p => p !== perm) });
                            }
                          }}
                          className="w-4 h-4 accent-[#D4AF37]"
                        />
                        <span className="text-sm text-white font-medium capitalize">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {newKeyForm.environment === 'production' && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-500 font-semibold mb-1">
                        {isRTL ? 'تحذير: بيئة الإنتاج' : 'Warning: Production Environment'}
                      </p>
                      <p className="text-xs text-red-400">
                        {isRTL 
                          ? 'سيتم استخدام هذا المفتاح في بيئة الإنتاج. يرجى التعامل معه بحذر.'
                          : 'This key will be used in production. Please handle with care.'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition-all"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleCreateKey}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all"
                >
                  <Key className="w-5 h-5" />
                  <span>{isRTL ? 'إنشاء المفتاح' : 'Create Key'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Documentation Modal */}
      <AnimatePresence>
        {isDocsModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDocsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl max-h-[85vh] bg-[#14181D] border border-white/10 rounded-2xl shadow-2xl z-51 flex flex-col"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#0B0F14]" />
                    </div>
                    {isRTL ? 'وثائق API' : 'API Documentation'}
                  </h2>
                  <button
                    onClick={() => setIsDocsModalOpen(false)}
                    className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* Base URL */}
                  <div className="bg-[#0B0F14]/60 border border-white/10 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#D4AF37]" />
                      {isRTL ? 'عنوان URL الأساسي' : 'Base URL'}
                    </h3>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-green-400">
                        https://api.press2pay.com
                      </code>
                      <button
                        onClick={() => copyKey('https://api.press2pay.com')}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Authentication */}
                  <div className="bg-[#0B0F14]/60 border border-white/10 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-yellow-500" />
                      {isRTL ? 'المصادقة' : 'Authentication'}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {isRTL 
                        ? 'جميع طلبات API تتطلب مفتاح API في header:' 
                        : 'All API requests require an API key in the header:'}
                    </p>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-blue-400">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                      <button
                        onClick={() => copyKey('Authorization: Bearer YOUR_API_KEY')}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Endpoints */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-400" />
                      {isRTL ? 'نقاط النهاية المتاحة' : 'Available Endpoints'}
                    </h3>
                    <div className="space-y-4">
                      {endpoints.map((endpoint, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-[#0B0F14]/60 border border-white/10 rounded-xl p-5 hover:border-[#D4AF37]/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`px-3 py-1 text-xs font-mono font-bold rounded-lg ${
                                endpoint.method === 'GET' ? 'bg-green-500/10 text-green-500 border border-green-500/30' :
                                endpoint.method === 'POST' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' :
                                endpoint.method === 'PUT' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                                endpoint.method === 'DELETE' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                                'bg-purple-500/10 text-purple-500 border border-purple-500/30'
                              }`}>
                                {endpoint.method}
                              </span>
                              <code className="text-sm font-mono text-white bg-[#0B0F14] px-3 py-1 rounded border border-white/10">
                                {endpoint.path}
                              </code>
                              {endpoint.authenticated && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded border border-yellow-500/30">
                                  <Lock className="w-3 h-3" />
                                  {isRTL ? 'يتطلب مصادقة' : 'Auth Required'}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => copyKey(`${endpoint.method} ${endpoint.path}`)}
                              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-3">
                            {isRTL ? endpoint.descriptionAr : endpoint.description}
                          </p>

                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Zap className="w-4 h-4 text-[#D4AF37]" />
                              <span>{isRTL ? 'متوسط الاستجابة:' : 'Avg Response:'}</span>
                              <span className="text-white font-semibold">{endpoint.avgResponseTime}ms</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Activity className="w-4 h-4 text-purple-400" />
                              <span>{isRTL ? 'الحد الأقصى:' : 'Rate Limit:'}</span>
                              <span className="text-white font-semibold">{endpoint.rateLimit}/min</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Example Request */}
                  <div className="bg-[#0B0F14]/60 border border-white/10 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Code className="w-5 h-5 text-green-400" />
                      {isRTL ? 'مثال على الطلب' : 'Example Request'}
                    </h3>
                    <div className="bg-[#0B0F14] border border-white/10 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs font-mono text-gray-300">
<code>{`curl -X POST https://api.press2pay.com/api/v1/transactions/deposit \\
  -H "Authorization: Bearer p2p_live_sk_abc123xyz789def456ghi" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 100.00,
    "currency": "EGP",
    "customer": {
      "email": "customer@example.com",
      "phone": "+201234567890"
    }
  }'`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => {
                    const docsContent = endpoints.map(e => 
                      `${e.method} ${e.path} - ${isRTL ? e.descriptionAr : e.description}`
                    ).join('\n');
                    copyKey(docsContent);
                  }}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  <Copy className="w-5 h-5" />
                  <span>{isRTL ? 'نسخ الكل' : 'Copy All'}</span>
                </button>
                <button
                  onClick={() => setIsDocsModalOpen(false)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all"
                >
                  <span>{isRTL ? 'إغلاق' : 'Close'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
