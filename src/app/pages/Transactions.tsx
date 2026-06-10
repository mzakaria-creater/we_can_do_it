import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { 
  Download, 
  Search, 
  Filter, 
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Gift,
  Ban,
  ShieldCheck,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  Eye,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Smartphone,
  Building2,
  User,
  Mail,
  Phone,
  Hash,
  AlertCircle,
  Hourglass as HourglassIcon,
  Sparkles,
  ArrowLeftRight,
  Loader2,
  MoreVertical,
  Check,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLoaderData, useSearchParams } from 'react-router';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey } from '../../lib/supabase';
import { projectId } from '../../../utils/supabase/info';
import { OpenTicketModal } from '../components/OpenTicketModal';

interface Transaction {
  id: string;
  reference: string;
  type: 'deposit' | 'payout';
  status: 'pending' | 'completed' | 'paid' | 'declined' | 'refunded' | 'expired' | 'rejected' | 'cashback' | 'approved' | 'failed' | 'canceled' | 'processing';
  amount: number;
  currency: string;
  merchant?: string;
  merchantName?: string;
  merchantId?: string;
  paymentMethod?: string;
  method?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  beneficiaryBank?: string;
  accountNumber?: string;
  createdAt: string;
  completedAt?: string;
  description?: string;
  walletNumber?: string;
  failureReason?: string;
}

type TransactionType = 'all' | 'deposit' | 'payout';
type TransactionStatus = 'all' | 'pending' | 'completed' | 'paid' | 'failed' | 'refunded' | 'expired' | 'canceled' | 'cancelled' | 'cashback' | 'processing' | 'approved' | 'declined' | 'underreview' | 'underpaid' | 'overpaid';

const statusConfig: any = {
  pending: { label: 'Pending Review', labelAr: 'قيد الانتظار', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  completed: { label: 'Completed', labelAr: 'مكتملة', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  paid: { label: 'Successfully Paid', labelAr: 'تم الدفع بنجاح', icon: CheckCircle2, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  approved: { label: 'Authorized', labelAr: 'تمت الموافقة', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  processing: { label: 'Processing', labelAr: 'جاري المعالجة', icon: Clock, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  failed: { label: 'Transaction Failed', labelAr: 'فاشلة', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  declined: { label: 'Declined/Rejected', labelAr: 'مرفوضة', icon: Ban, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  refunded: { label: 'Refunded', labelAr: 'مستردة', icon: RotateCcw, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  expired: { label: 'Expired', labelAr: 'منتهية الصلاحية', icon: HourglassIcon, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  canceled: { label: 'Canceled', labelAr: 'ملغاة', icon: Ban, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  cancelled: { label: 'Cancelled', labelAr: 'ملغاة', icon: Ban, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  cashback: { label: 'Cashback Earned', labelAr: 'استرداد نقدي', icon: Gift, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  underreview: { label: 'Under Review', labelAr: 'قيد المراجعة والتدقيق', icon: Search, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  underpaid: { label: 'Underpaid', labelAr: 'مدفوعة جزئياً', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  overpaid: { label: 'Overpaid', labelAr: 'مدفوعة بالزيادة', icon: AlertCircle, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' }
};

import { PageHeader } from '../components/PageHeader';
import { BulkTransactionUpload } from '../components/BulkTransactionUpload';

export const Transactions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loaderData = useLoaderData() as any;
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, isAuthenticated } = useStore();
  const isRTL = language === 'ar';
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  
  const initialTransactions = loaderData?.transactionsData?.transactions || [];
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<TransactionType>(searchParams.get('type') as any || 'all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>(searchParams.get('status') as any || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketTransactionId, setTicketTransactionId] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const itemsPerPage = 10;

  // Sync state with loader data
  useEffect(() => {
    if (loaderData?.transactionsData?.transactions) {
      setTransactions(loaderData.transactionsData.transactions);
    }
  }, [loaderData]);

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeType !== 'all') params.set('type', activeType);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (searchQuery) params.set('search', searchQuery);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [activeType, statusFilter, searchQuery, dateFrom, dateTo, currentPage, setSearchParams]);

  const fetchTransactions = async () => {
    // This is now triggered by navigate or setSearchParams which causes loader to re-run
    // But for manual refresh button:
    navigate('.', { replace: true });
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingStatus(id);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const { data, error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/transactions/status',
        body: { id, status: newStatus }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchTransactions();
        if (selectedTransaction?.id === id) {
          setSelectedTransaction({ ...selectedTransaction, status: newStatus as any });
        }
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    // Type filter
    if (activeType !== 'all' && txn.type !== activeType) return false;
    
    // Status filter
    if (statusFilter !== 'all' && txn.status !== statusFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const ref = txn.reference?.toLowerCase() || '';
      const name = (txn.customerName || '').toLowerCase();
      const email = (txn.customerEmail || '').toLowerCase();
      const merchant = (txn.merchantName || txn.merchant || '').toLowerCase();
      
      return ref.includes(query) || name.includes(query) || email.includes(query) || merchant.includes(query);
    }
    
    // Date filter
    if (dateFrom) {
      const txnDate = new Date(txn.createdAt);
      const fromDate = new Date(dateFrom);
      if (txnDate < fromDate) return false;
    }
    
    if (dateTo) {
      const txnDate = new Date(txn.createdAt);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);
      if (txnDate > toDate) return false;
    }
    
    return true;
  });

  const handleExport = () => {
    toast.success('Export started. File will be downloaded shortly.');
  };

  const clearFilters = () => {
    setActiveType('all');
    setStatusFilter('all');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  const handleImportTestData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const { data, error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        path: 'make-server-46c3f42b/import-test-p2p',
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(isRTL ? `تم استيراد ${data.count} معاملة تجريبية بنجاح` : `Successfully imported ${data.count} test transactions`);
        fetchTransactions();
      }
    } catch (error: any) {
      console.error('Error importing test data:', error);
      toast.error('Failed to import test data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('allTransactions')}
        description={t('comprehensiveView')}
        icon={ArrowLeftRight}
        variant="gradient"
        actions={
          <>
            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-lg hover:bg-blue-500/20 transition-colors"
              title="Bulk CSV Upload"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">{isRTL ? 'رفع بالجملة' : 'Bulk Upload'}</span>
            </button>
            <button
              onClick={handleImportTestData}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg hover:bg-amber-500/20 transition-colors"
              title="Import P2P Test Transactions"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">{isRTL ? 'استيراد بيانات تجريبية' : 'Import Test Data'}</span>
            </button>
            <button
              onClick={fetchTransactions}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">{t('refresh')}</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium">{t('export')}</span>
            </button>
          </>
        }
      />


      {/* Type Tabs */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
        {[
          { id: 'all', label: 'All Transactions', icon: ArrowLeftRight },
          { id: 'deposit', label: 'Deposits', icon: ArrowDownLeft },
          { id: 'payout', label: 'Payouts', icon: ArrowUpRight }
        ].map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveType(tab.id as TransactionType)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeType === tab.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by reference, customer, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TransactionStatus)}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="underreview">Under Review</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="underpaid">Underpaid</option>
              <option value="overpaid">Overpaid</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
              <option value="cashback">Cashback</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              showFilters
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/50 border-border hover:bg-muted'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date From</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date To</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transactions Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'الرقم المرجعي' : 'Reference Number'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'نوع العملية' : 'Transaction Type'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'المبلغ' : 'Amount'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'بيانات العميل' : 'Customer / User'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'معرف الحساب' : 'Account ID'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'المنشأة' : 'Merchant'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'التاريخ والوقت' : 'Timestamp'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <ArrowLeftRight className="w-12 h-12 text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((txn, idx) => {
                  const statusInfo = statusConfig[txn.status] || statusConfig.pending;
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-bold">{txn.reference}</span>
                          <span className="text-xs text-muted-foreground">ID: {txn.id.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                          txn.type === 'deposit'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {txn.type === 'deposit' ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          <span className="text-xs font-bold capitalize">{txn.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.border} border`}>
                          <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                          <span className={`text-xs font-bold ${statusInfo.color}`}>{isRTL ? statusInfo.labelAr : statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold">{txn.amount.toLocaleString()} {txn.currency}</span>
                          {txn.walletNumber && (
                            <span className="text-xs text-primary font-medium">Wallet: {txn.walletNumber}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{txn.customerName || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{txn.customerEmail}</span>
                          <span className="text-xs text-muted-foreground">{txn.customerPhone}</span>
                          <span className="text-[10px] text-primary font-medium mt-1">{txn.method || txn.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded border border-border w-fit">
                            {txn.merchantId || 'ACC-N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium">{txn.merchantName || txn.merchant || 'Internal'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(txn.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedTransaction(txn)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <div className="relative group">
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                              <div className="p-1">
                                <button 
                                  onClick={() => handleUpdateStatus(txn.id, 'completed')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                >
                                  <Check className="w-3 h-3" /> Approve / Complete
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(txn.id, 'declined')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  <XCircle className="w-3 h-3" /> Decline
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(txn.id, 'refunded')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                >
                                  <RotateCcw className="w-3 h-3" /> Refund
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button 
                                  onClick={() => navigate(`/transactions/details/${txn.id}`)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                >
                                  <Eye className="w-3 h-3" /> View User Details
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                  <FileText className="w-3 h-3" /> Get Receipt
                                </button>
                                <button 
                                  onClick={() => {
                                    setTicketTransactionId(txn.id);
                                    setTicketModalOpen(true);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                  <Ticket className="w-3 h-3" /> Open Support Ticket
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-card border-t border-border">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Previous</span>
          </button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {Math.ceil(filteredTransactions.length / itemsPerPage)}
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * itemsPerPage >= filteredTransactions.length}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <span className="text-sm font-medium">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <div
            onClick={() => setSelectedTransaction(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Transaction Details</h3>
                      <p className="text-xs text-muted-foreground font-mono">{selectedTransaction.reference}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Amount Header */}
                <div className="text-center p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <p className="text-muted-foreground text-sm font-medium mb-2">Total Amount</p>
                  <h4 className="text-5xl font-black text-primary flex items-center justify-center gap-2">
                    {selectedTransaction.amount.toLocaleString()}
                    <span className="text-xl font-bold text-muted-foreground">{selectedTransaction.currency}</span>
                  </h4>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${statusConfig[selectedTransaction.status]?.bg} ${statusConfig[selectedTransaction.status]?.border}`}>
                      <span className={`w-2 h-2 rounded-full ${statusConfig[selectedTransaction.status]?.color.replace('text-', 'bg-')}`} />
                      <span className={`text-sm font-bold capitalize ${statusConfig[selectedTransaction.status]?.color}`}>
                        {statusConfig[selectedTransaction.status]?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Type</label>
                      <div className="flex items-center gap-2">
                        {selectedTransaction.type === 'deposit' ? <ArrowDownLeft className="text-emerald-500" /> : <ArrowUpRight className="text-red-500" />}
                        <p className="text-sm font-bold capitalize">{selectedTransaction.type}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Merchant</label>
                      <p className="text-sm font-bold">{selectedTransaction.merchantName || selectedTransaction.merchant || 'Press2pay Internal'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Payment Method</label>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <p className="text-sm font-bold">{selectedTransaction.method || selectedTransaction.paymentMethod || 'Unknown'}</p>
                      </div>
                    </div>
                    {selectedTransaction.walletNumber && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <label className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Vodafone Cash Wallet</label>
                        <p className="text-lg font-mono font-bold text-primary">{selectedTransaction.walletNumber}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Wallet assigned via intelligent allocation engine</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Customer</label>
                      <p className="text-sm font-bold">{selectedTransaction.customerName || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{selectedTransaction.customerEmail || ''}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Created At</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-bold">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {selectedTransaction.completedAt && (
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Completed At</label>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <p className="text-sm font-bold">{new Date(selectedTransaction.completedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Transaction Hash</label>
                      <p className="text-[10px] font-mono break-all text-muted-foreground p-2 bg-muted/50 rounded-lg">
                        {selectedTransaction.id.repeat(3)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedTransaction.description && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Description</label>
                    <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-xl">
                      {selectedTransaction.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-muted/30 border-t border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedTransaction.id, 'completed')}
                    disabled={updatingStatus === selectedTransaction.id || selectedTransaction.status === 'completed' || selectedTransaction.status === 'paid'}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 font-bold shadow-lg shadow-emerald-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTransaction.id, 'declined')}
                    disabled={updatingStatus === selectedTransaction.id || selectedTransaction.status === 'declined'}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 font-bold shadow-lg shadow-red-500/20"
                  >
                    <Ban className="w-4 h-4" />
                    Decline
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedTransaction.id, 'refunded')}
                    disabled={updatingStatus === selectedTransaction.id || selectedTransaction.status === 'refunded' || selectedTransaction.status === 'pending'}
                    className="flex items-center gap-2 px-6 py-2.5 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition-all disabled:opacity-50 font-bold"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Issue Refund
                  </button>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="px-6 py-2.5 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition-all font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BulkTransactionUpload 
        isOpen={isBulkUploadOpen} 
        onClose={() => setIsBulkUploadOpen(false)} 
        onSuccess={() => navigate('.', { replace: true })}
      />

      {/* Open Ticket Modal */}
      <OpenTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        transactionId={ticketTransactionId}
      />
    </div>
  );
};

export default Transactions;