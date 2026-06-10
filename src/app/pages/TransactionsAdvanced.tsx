import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  MoreVertical,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  User,
  Shield,
  Calendar,
  Eye,
  Trash2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';

type TransactionStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'EXPIRED' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'REFUNDED' 
  | 'UNDERPAID' 
  | 'OVERPAID';

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: 'DEPOSIT' | 'PAYOUT';
  method: string;
  merchantName: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
}

export const TransactionsAdvanced = () => {
  const navigate = useNavigate();
  const { language } = useStore();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('30_DAYS');

  // Sample Mock Data including all 11 states
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      transactionId: 'TXN-7721-001',
      amount: 1500,
      currency: 'EGP',
      status: 'PAID',
      type: 'DEPOSIT',
      method: 'Vodafone Cash',
      merchantName: 'Premium Fashion Store',
      customerName: 'Ahmed Mahmoud',
      createdAt: '2026-02-19 10:30:00',
      updatedAt: '2026-02-19 10:35:00'
    },
    {
      id: '2',
      transactionId: 'TXN-7721-002',
      amount: 450.50,
      currency: 'EGP',
      status: 'PENDING',
      type: 'DEPOSIT',
      method: 'Fawry',
      merchantName: 'Tech Hub Egypt',
      customerName: 'Sarah Ali',
      createdAt: '2026-02-19 11:15:00',
      updatedAt: '2026-02-19 11:15:00'
    },
    {
      id: '3',
      transactionId: 'TXN-7721-003',
      amount: 2000,
      currency: 'EGP',
      status: 'UNDER_REVIEW',
      type: 'PAYOUT',
      method: 'Bank Transfer',
      merchantName: 'Gourmet Catering',
      customerName: 'Restaurant Alpha',
      createdAt: '2026-02-18 09:00:00',
      updatedAt: '2026-02-18 09:30:00'
    },
    {
      id: '4',
      transactionId: 'TXN-7721-004',
      amount: 120,
      currency: 'EGP',
      status: 'FAILED',
      type: 'DEPOSIT',
      method: 'InstaPay',
      merchantName: 'Local Groceries',
      customerName: 'Omar Hassan',
      createdAt: '2026-02-18 14:20:00',
      updatedAt: '2026-02-18 14:21:00'
    },
    {
      id: '5',
      transactionId: 'TXN-7721-005',
      amount: 5000,
      currency: 'EGP',
      status: 'UNDERPAID',
      type: 'DEPOSIT',
      method: 'Mobile Wallet',
      merchantName: 'Electronics Egypt',
      customerName: 'Mona Ibrahim',
      createdAt: '2026-02-17 16:45:00',
      updatedAt: '2026-02-17 17:00:00'
    },
    {
      id: '6',
      transactionId: 'TXN-7721-006',
      amount: 300,
      currency: 'EGP',
      status: 'OVERPAID',
      type: 'DEPOSIT',
      method: 'Card Payment',
      merchantName: 'Gift Shop',
      customerName: 'Yasmine Ahmed',
      createdAt: '2026-02-17 12:10:00',
      updatedAt: '2026-02-17 12:15:00'
    },
    {
      id: '7',
      transactionId: 'TXN-7721-007',
      amount: 800,
      currency: 'EGP',
      status: 'REFUNDED',
      type: 'PAYOUT',
      method: 'InstaPay',
      merchantName: 'Fashion Center',
      customerName: 'Heba Mostafa',
      createdAt: '2026-02-16 10:00:00',
      updatedAt: '2026-02-17 09:00:00'
    },
    {
      id: '8',
      transactionId: 'TXN-7721-008',
      amount: 150,
      currency: 'EGP',
      status: 'EXPIRED',
      type: 'DEPOSIT',
      method: 'Fawry',
      merchantName: 'Daily Needs',
      customerName: 'Karim Zayed',
      createdAt: '2026-02-15 15:30:00',
      updatedAt: '2026-02-16 15:30:00'
    },
    {
      id: '9',
      transactionId: 'TXN-7721-009',
      amount: 10000,
      currency: 'EGP',
      status: 'APPROVED',
      type: 'PAYOUT',
      method: 'Bank Transfer',
      merchantName: 'Large Corp',
      customerName: 'Branch 05',
      createdAt: '2026-02-15 08:00:00',
      updatedAt: '2026-02-15 10:00:00'
    },
    {
      id: '10',
      transactionId: 'TXN-7721-010',
      amount: 250,
      currency: 'EGP',
      status: 'REJECTED',
      type: 'DEPOSIT',
      method: 'Vodafone Cash',
      merchantName: 'E-Shop',
      customerName: 'Samer Fouad',
      createdAt: '2026-02-14 20:00:00',
      updatedAt: '2026-02-14 20:10:00'
    },
    {
      id: '11',
      transactionId: 'TXN-7721-011',
      amount: 500,
      currency: 'EGP',
      status: 'CANCELLED',
      type: 'DEPOSIT',
      method: 'Orange Money',
      merchantName: 'Subscription Service',
      customerName: 'Laila Gamal',
      createdAt: '2026-02-14 11:00:00',
      updatedAt: '2026-02-14 11:15:00'
    }
  ]);

  const getStatusStyle = (status: TransactionStatus) => {
    const styles: Record<TransactionStatus, { label: string; color: string; bg: string; icon: any }> = {
      PAID: { label: isRTL ? 'مدفوع' : 'PAID', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle },
      APPROVED: { label: isRTL ? 'مقبول' : 'APPROVED', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', icon: CheckCircle },
      PENDING: { label: isRTL ? 'انتظار' : 'PENDING', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock },
      UNDER_REVIEW: { label: isRTL ? 'مراجعة' : 'UNDER REVIEW', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', icon: Shield },
      FAILED: { label: isRTL ? 'فشل' : 'FAILED', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle },
      CANCELLED: { label: isRTL ? 'ملغي' : 'CANCELLED', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)', icon: XCircle },
      EXPIRED: { label: isRTL ? 'منتهي' : 'EXPIRED', color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)', icon: AlertTriangle },
      REJECTED: { label: isRTL ? 'مرفوض' : 'REJECTED', color: '#B91C1C', bg: 'rgba(185, 28, 28, 0.1)', icon: XCircle },
      REFUNDED: { label: isRTL ? 'مسترجع' : 'REFUNDED', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.1)', icon: RefreshCw },
      UNDERPAID: { label: isRTL ? 'دفع ناقص' : 'UNDERPAID', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)', icon: AlertTriangle },
      OVERPAID: { label: isRTL ? 'دفع زائد' : 'OVERPAID', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)', icon: AlertTriangle },
    };
    return styles[status] || styles.PENDING;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchQuery, statusFilter, typeFilter]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(isRTL ? 'تم تحديث البيانات' : 'Data refreshed');
    }, 1000);
  };

  const handleExport = () => {
    toast.success(isRTL ? 'بدأ تصدير التقرير' : 'Exporting report...');
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col gap-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
            <DollarSign className="text-[#D4AF37]" size={32} />
            {isRTL ? 'المعاملات المتقدمة' : 'Advanced Transactions'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isRTL ? 'نظام تتبع المعاملات المالي عالي الدقة' : 'High-precision financial transaction tracking system'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="p-3 bg-gray-900 border border-[#D4AF37]/20 rounded-xl hover:border-[#D4AF37]/50 transition-all group relative"
          >
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
          </button>
          <button 
            onClick={handleExport}
            className="vip-button-secondary flex items-center gap-2"
          >
            <Download size={18} />
            <span className="hidden sm:inline">{isRTL ? 'تصدير' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Search & Filters */}
      <div className="vip-card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors`} size={20} />
            <input 
              type="text" 
              placeholder={isRTL ? 'البحث بالمعرف، التاجر، أو العميل...' : 'Search by ID, merchant, or customer...'}
              className="vip-input py-3 !pl-12 !pr-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all ${showFilters ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-black text-[#D4AF37] border-[#D4AF37]/30 hover:border-[#D4AF37]'}`}
          >
            <Filter size={20} />
            <span className="font-bold">{isRTL ? 'الفلاتر' : 'Filters'}</span>
            <ChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} size={16} />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#D4AF37]/10">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'الحالة' : 'Status'}</label>
                  <select 
                    className="vip-select w-full"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="FAILED">FAILED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="UNDERPAID">UNDERPAID</option>
                    <option value="OVERPAID">OVERPAID</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'النوع' : 'Type'}</label>
                  <select 
                    className="vip-select w-full"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="ALL">{isRTL ? 'الكل' : 'All Types'}</option>
                    <option value="DEPOSIT">{isRTL ? 'إيداع' : 'Deposit'}</option>
                    <option value="PAYOUT">{isRTL ? 'سحب' : 'Payout'}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'الفترة الزمنية' : 'Date Range'}</label>
                  <select 
                    className="vip-select w-full"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="TODAY">{isRTL ? 'اليوم' : 'Today'}</option>
                    <option value="7_DAYS">{isRTL ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
                    <option value="30_DAYS">{isRTL ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
                    <option value="CUSTOM">{isRTL ? 'مخصص' : 'Custom Range'}</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transactions List */}
      <div className="vip-table-container">
        <div className="overflow-x-auto vip-scrollbar">
          <table className="vip-table">
            <thead>
              <tr>
                <th>{isRTL ? 'المعرف' : 'ID'}</th>
                <th>{isRTL ? 'النوع' : 'Type'}</th>
                <th>{isRTL ? 'المبلغ' : 'Amount'}</th>
                <th>{isRTL ? 'الحالة' : 'Status'}</th>
                <th>{isRTL ? 'التاجر / العميل' : 'Merchant / Customer'}</th>
                <th>{isRTL ? 'طريقة الدفع' : 'Method'}</th>
                <th>{isRTL ? 'التاريخ' : 'Date'}</th>
                <th>{isRTL ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const status = getStatusStyle(tx.status);
                const StatusIcon = status.icon;
                return (
                  <motion.tr 
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <td className="font-mono text-[10px] text-[#D4AF37]">{tx.transactionId}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={14} className="text-green-500" /> : <ArrowUpRight size={14} className="text-red-500" />}
                        <span className="text-[10px] font-black">{tx.type}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-black text-lg">{tx.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-500 ml-1">{tx.currency}</span>
                    </td>
                    <td>
                      <div 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border"
                        style={{ borderColor: status.color, color: status.color, backgroundColor: status.bg }}
                      >
                        <StatusIcon size={12} />
                        {status.label}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{tx.merchantName}</span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <User size={10} />
                          {tx.customerName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-gray-500" />
                        <span className="text-xs text-gray-300">{tx.method}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-xs text-white">{tx.createdAt.split(' ')[0]}</span>
                        <span className="text-[10px] text-gray-500">{tx.createdAt.split(' ')[1]}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/:lang/transactions/details/${tx.transactionId}`.replace(':lang', language))}
                          className="p-2 bg-gray-900 border border-[#D4AF37]/20 rounded-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="p-2 bg-gray-900 border border-red-900/20 rounded-lg hover:border-red-500 hover:text-red-500 transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination / Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-2 border-t border-[#D4AF37]/10">
        <p className="text-sm text-gray-500 font-medium">
          {isRTL 
            ? `عرض ${filteredTransactions.length} معاملة من أصل ${transactions.length}`
            : `Showing ${filteredTransactions.length} of ${transactions.length} transactions`
          }
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-gray-900 border border-[#D4AF37]/20 rounded-lg text-xs font-bold disabled:opacity-50" disabled>
            {isRTL ? 'السابق' : 'Previous'}
          </button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 bg-[#D4AF37] text-black rounded-lg text-xs font-bold">1</button>
            <button className="w-8 h-8 bg-gray-900 border border-[#D4AF37]/20 text-gray-400 rounded-lg text-xs font-bold hover:text-[#D4AF37] transition-colors">2</button>
            <button className="w-8 h-8 bg-gray-900 border border-[#D4AF37]/20 text-gray-400 rounded-lg text-xs font-bold hover:text-[#D4AF37] transition-colors">3</button>
          </div>
          <button className="px-4 py-2 bg-gray-900 border border-[#D4AF37]/20 rounded-lg text-xs font-bold">
            {isRTL ? 'التالي' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsAdvanced;
