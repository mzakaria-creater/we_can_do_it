import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Code2,
  Search,
  Filter,
  Copy,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Building2,
  Wallet,
  Receipt,
  Key,
  Shield,
  Calendar,
  Hash,
  Download,
  Eye,
  Clock
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey } from '../../lib/supabase';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboard';

interface CodeRecord {
  id: string;
  type: 'merchant' | 'wallet' | 'transaction' | 'api_key' | 'api_secret';
  code: string;
  entity: string;
  entityId: string;
  generatedAt: string;
  status: 'active' | 'expired' | 'used';
  expiresAt?: string;
  metadata?: any;
}

export function CodesRegistry() {
  const { t } = useTranslation();
  const { language, isAuthenticated } = useStore();
  
  const [codes, setCodes] = useState<CodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string>('');

  // Fetch all codes from different sources
  const fetchAllCodes = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const allCodes: CodeRecord[] = [];

      // Fetch Merchants (Merchant Codes + API Keys + Secrets)
      const { data: merchantsData } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/merchants'
      });

      if (merchantsData?.merchants) {
        merchantsData.merchants.forEach((merchant: any) => {
          // Merchant Code
          allCodes.push({
            id: `mc-${merchant.id}`,
            type: 'merchant',
            code: merchant.merchantCode,
            entity: merchant.name,
            entityId: merchant.id,
            generatedAt: merchant.joinedAt,
            status: merchant.status === 'verified' ? 'active' : merchant.status === 'suspended' ? 'expired' : 'used',
            metadata: {
              category: merchant.category,
              email: merchant.email,
              logo: merchant.logo
            }
          });

          // API Key
          allCodes.push({
            id: `ak-${merchant.id}`,
            type: 'api_key',
            code: merchant.apiKey,
            entity: merchant.name,
            entityId: merchant.id,
            generatedAt: merchant.joinedAt,
            status: 'active',
            metadata: {
              type: 'public',
              category: merchant.category
            }
          });

          // API Secret
          allCodes.push({
            id: `as-${merchant.id}`,
            type: 'api_secret',
            code: merchant.apiSecret,
            entity: merchant.name,
            entityId: merchant.id,
            generatedAt: merchant.joinedAt,
            status: 'active',
            metadata: {
              type: 'secret',
              category: merchant.category
            }
          });
        });
      }

      // Fetch Transactions (would include wallet codes in real implementation)
      const { data: transactionsData } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/transactions'
      });

      if (transactionsData?.transactions) {
        transactionsData.transactions.slice(0, 20).forEach((tx: any) => {
          // Generate sample wallet codes for existing transactions
          const walletCode = `ETX-${Math.floor(Math.random() * 90000 + 10000)}`;
          allCodes.push({
            id: `wc-${tx.id}`,
            type: 'wallet',
            code: walletCode,
            entity: tx.merchantName || 'Unknown',
            entityId: tx.id,
            generatedAt: tx.createdAt,
            status: tx.status === 'completed' || tx.status === 'paid' ? 'used' : tx.status === 'failed' || tx.status === 'declined' || tx.status === 'expired' || tx.status === 'cancelled' ? 'expired' : 'active',
            expiresAt: tx.status === 'pending' ? new Date(new Date(tx.createdAt).getTime() + 15 * 60000).toISOString() : undefined,
            metadata: {
              amount: tx.amount,
              method: tx.method,
              currency: tx.currency
            }
          });
        });
      }

      // Fetch Master Transactions (Transaction References)
      const { data: mastersData } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/master-transactions'
      });

      if (mastersData?.masters) {
        mastersData.masters.forEach((master: any) => {
          allCodes.push({
            id: `tx-${master.id}`,
            type: 'transaction',
            code: master.reference,
            entity: 'Master Transaction',
            entityId: master.id,
            generatedAt: master.createdAt,
            status: master.status === 'paid' ? 'used' : 'active',
            metadata: {
              amount: master.totalAmount,
              status: master.status,
              splits: master.splits?.length || 0
            }
          });
        });
      }

      setCodes(allCodes);
    } catch (error: any) {
      console.error('Error fetching codes:', error);
      if (isAuthenticated) {
        toast.error(`Failed to load codes: ${error.message || 'Server error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCodes();
  }, [isAuthenticated]);

  // Copy to clipboard
  const copyCode = async (code: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(code);
      toast.success(language === 'ar' ? 'تم نسخ الكود' : 'Code copied');
      setTimeout(() => setCopiedCode(''), 2000);
    } else {
      toast.error(language === 'ar' ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  // Filter codes
  const filteredCodes = codes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.entity.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || code.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || code.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: codes.length,
    merchant: codes.filter(c => c.type === 'merchant').length,
    wallet: codes.filter(c => c.type === 'wallet').length,
    transaction: codes.filter(c => c.type === 'transaction').length,
    apiKey: codes.filter(c => c.type === 'api_key').length,
    apiSecret: codes.filter(c => c.type === 'api_secret').length,
    active: codes.filter(c => c.status === 'active').length,
    used: codes.filter(c => c.status === 'used').length,
    expired: codes.filter(c => c.status === 'expired').length
  };

  const typeConfig = {
    merchant: { 
      label: 'Merchant Code', 
      icon: Building2, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      format: 'GDX-ET-XX-XXXX'
    },
    wallet: { 
      label: 'Wallet Code', 
      icon: Wallet, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      format: 'ETX-XXXXX'
    },
    transaction: { 
      label: 'Transaction Ref', 
      icon: Receipt, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10',
      format: 'TXN-YYYYMMDD-XXXXXX'
    },
    api_key: { 
      label: 'API Key', 
      icon: Key, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      format: 'pk_live_xxx'
    },
    api_secret: { 
      label: 'API Secret', 
      icon: Shield, 
      color: 'text-red-500', 
      bg: 'bg-red-500/10',
      format: 'sk_live_xxx'
    }
  };

  const statusConfig = {
    active: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Active' },
    used: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Used' },
    expired: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Expired' }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Type', 'Code', 'Entity', 'Status', 'Generated At', 'Expires At'];
    const rows = filteredCodes.map(code => [
      typeConfig[code.type].label,
      code.code,
      code.entity,
      statusConfig[code.status].label,
      new Date(code.generatedAt).toLocaleString(),
      code.expiresAt ? new Date(code.expiresAt).toLocaleString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codes-registry-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success(language === 'ar' ? 'تم تصدير البيانات' : 'Data exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            Codes Registry
          </h1>
          <p className="text-muted-foreground mt-1">Centralized registry of all generated codes</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchAllCodes}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button 
            onClick={exportToCSV}
            disabled={filteredCodes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Merchants</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{stats.merchant}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">Wallets</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{stats.wallet}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-muted-foreground">Transactions</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">{stats.transaction}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">API Keys</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">{stats.apiKey}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-muted-foreground">Secrets</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.apiSecret}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by code or entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="all">All Types</option>
            <option value="merchant">Merchant Codes</option>
            <option value="wallet">Wallet Codes</option>
            <option value="transaction">Transaction Refs</option>
            <option value="api_key">API Keys</option>
            <option value="api_secret">API Secrets</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Codes Table */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center bg-card border border-border rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading codes...</p>
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-xl">
          <Code2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No codes found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">Type</th>
                  <th className="text-left p-4 font-semibold text-sm">Code</th>
                  <th className="text-left p-4 font-semibold text-sm">Entity</th>
                  <th className="text-left p-4 font-semibold text-sm">Status</th>
                  <th className="text-left p-4 font-semibold text-sm">Generated</th>
                  <th className="text-left p-4 font-semibold text-sm">Expires</th>
                  <th className="text-right p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map((code, idx) => {
                  const TypeIcon = typeConfig[code.type].icon;
                  const isExpiringSoon = code.expiresAt && 
                    new Date(code.expiresAt).getTime() - Date.now() < 5 * 60000;
                  
                  return (
                    <motion.tr
                      key={code.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${typeConfig[code.type].bg}`}>
                          <TypeIcon className={`w-4 h-4 ${typeConfig[code.type].color}`} />
                          <span className={`text-xs font-medium ${typeConfig[code.type].color}`}>
                            {typeConfig[code.type].label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                          {code.type === 'api_secret' && code.code.length > 20
                            ? `${code.code.slice(0, 12)}...${code.code.slice(-4)}`
                            : code.code}
                        </code>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {code.metadata?.logo && <span>{code.metadata.logo}</span>}
                          <span className="text-sm">{code.entity}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig[code.status].bg}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[code.status].color}`} />
                          <span className={`text-xs font-medium ${statusConfig[code.status].color}`}>
                            {statusConfig[code.status].label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(code.generatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        {code.expiresAt ? (
                          <div className={`flex items-center gap-2 text-sm ${isExpiringSoon ? 'text-red-500' : 'text-muted-foreground'}`}>
                            <Clock className="w-4 h-4" />
                            {new Date(code.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyCode(code.code)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === code.code ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {filteredCodes.map((code, idx) => {
              const TypeIcon = typeConfig[code.type].icon;
              
              return (
                <motion.div
                  key={code.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${typeConfig[code.type].bg}`}>
                      <TypeIcon className={`w-4 h-4 ${typeConfig[code.type].color}`} />
                      <span className={`text-xs font-medium ${typeConfig[code.type].color}`}>
                        {typeConfig[code.type].label}
                      </span>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig[code.status].bg}`}>
                      <span className={`text-xs font-medium ${statusConfig[code.status].color}`}>
                        {statusConfig[code.status].label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Code</label>
                    <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded block">
                      {code.type === 'api_secret' && code.code.length > 20
                        ? `${code.code.slice(0, 12)}...${code.code.slice(-4)}`
                        : code.code}
                    </code>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Entity</label>
                    <div className="flex items-center gap-2">
                      {code.metadata?.logo && <span>{code.metadata.logo}</span>}
                      <span className="text-sm">{code.entity}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Generated</label>
                      <span className="text-sm">{new Date(code.generatedAt).toLocaleDateString()}</span>
                    </div>
                    {code.expiresAt && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Expires</label>
                        <span className="text-sm">{new Date(code.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => copyCode(code.code)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {copiedCode === code.code ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm font-medium">Copy Code</span>
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredCodes.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredCodes.length} of {codes.length} codes
        </div>
      )}
    </div>
  );
}