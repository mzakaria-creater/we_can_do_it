import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { useLoaderData, useNavigate } from 'react-router';
import { getMockDeposits } from '../lib/mockTransactions';

interface Deposit {
  id: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'processing' | 'underreview' | 'underpaid' | 'overpaid' | 'expired' | 'cancelled' | 'paid';
  reference: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export const Deposits = () => {
  const { t } = useTranslation();
  const { language, user } = useStore();
  const loaderData = useLoaderData() as any;
  const navigate = useNavigate();

  const [deposits, setDeposits] = useState<Deposit[]>(loaderData?.depositsData?.deposits || getMockDeposits());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (loaderData?.depositsData?.deposits) {
      setDeposits(loaderData.depositsData.deposits);
    }
  }, [loaderData]);

  const fetchDeposits = async () => {
    navigate('.', { replace: true });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
      case 'underreview':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'failed':
      case 'declined':
      case 'expired':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'underpaid':
      case 'overpaid':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing':
      case 'underreview':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'failed':
      case 'declined':
      case 'expired':
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'underpaid':
      case 'overpaid':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = 
      deposit.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: deposits.reduce((sum, d) => sum + d.amount, 0),
    completed: deposits.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0),
    pending: deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0),
    count: deposits.length,
  };

  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-[#D4AF37]" />
            {language === 'ar' ? 'عمليات الإيداع' : 'Deposit Transactions'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'إدارة ومراقبة جميع التدفقات النقدية الواردة'
              : 'Comprehensive management of incoming cash flows'}
          </p>
        </div>
        <button
          onClick={() => toast.success(language === 'ar' ? 'قريباً' : 'Coming soon')}
          className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#C49F27] transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {language === 'ar' ? 'تصدير' : 'Export'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                {language === 'ar' ? 'إجمالي الإيداعات' : 'Total Deposits'}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats.total.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                {language === 'ar' ? 'مكتملة' : 'Completed'}
              </p>
              <p className="text-2xl font-bold text-green-500 mt-1">
                {stats.completed.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
              </p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">
                {stats.pending.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                {language === 'ar' ? 'العدد' : 'Count'}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats.count}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              className={`w-full bg-background border border-border rounded-lg ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="all">{language === 'ar' ? 'كل الحالات' : 'All Status'}</option>
            <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="underreview">{language === 'ar' ? 'قيد المراجعة' : 'Under Review'}</option>
            <option value="completed">{language === 'ar' ? 'مكتملة' : 'Completed'}</option>
            <option value="paid">{language === 'ar' ? 'مدفوعة' : 'Paid'}</option>
            <option value="underpaid">{language === 'ar' ? 'مدفوع جزئياً' : 'Underpaid'}</option>
            <option value="overpaid">{language === 'ar' ? 'مدفوع بالزيادة' : 'Overpaid'}</option>
            <option value="declined">{language === 'ar' ? 'مرفوضة' : 'Declined'}</option>
            <option value="expired">{language === 'ar' ? 'منتهية' : 'Expired'}</option>
            <option value="cancelled">{language === 'ar' ? 'ملغاة' : 'Cancelled'}</option>
            <option value="failed">{language === 'ar' ? 'فاشلة' : 'Failed'}</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="all">{language === 'ar' ? 'كل الأوقات' : 'All Time'}</option>
            <option value="today">{language === 'ar' ? 'اليوم' : 'Today'}</option>
            <option value="week">{language === 'ar' ? 'هذا الأسبوع' : 'This Week'}</option>
            <option value="month">{language === 'ar' ? 'هذا الشهر' : 'This Month'}</option>
          </select>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'المرجع' : 'Reference'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'التاجر' : 'Merchant'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'العميل' : 'Customer'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'معرف الحساب' : 'Account ID'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'ا��مبلغ' : 'Amount'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'الطريقة' : 'Method'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'التاريخ' : 'Date'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </td>
                </tr>
              ) : filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {language === 'ar' ? 'لا توجد إيداعات' : 'No deposits found'}
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-foreground">{deposit.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{deposit.merchantName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{deposit.customerName || 'N/A'}</span>
                        <span className="text-[10px] text-muted-foreground">{deposit.customerEmail}</span>
                        <span className="text-[10px] text-muted-foreground">{deposit.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
                        {deposit.merchantId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-foreground">
                        {deposit.amount.toLocaleString()} {deposit.currency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{deposit.method}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deposit.status)}`}>
                        {getStatusIcon(deposit.status)}
                        {language === 'ar' 
                          ? deposit.status === 'completed' ? 'مكتملة'
                            : deposit.status === 'paid' ? 'مدفوعة'
                            : deposit.status === 'pending' ? 'قيد الانتظار'
                            : deposit.status === 'underreview' ? 'قيد المراجعة'
                            : deposit.status === 'underpaid' ? 'مدفوع جزئياً'
                            : deposit.status === 'overpaid' ? 'مدفوع بالزيادة'
                            : deposit.status === 'declined' ? 'مرفوضة'
                            : deposit.status === 'expired' ? 'منتهية'
                            : deposit.status === 'cancelled' ? 'ملغاة'
                            : 'فاشلة'
                          : deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1).replace('underreview', 'Under Review').replace('underpaid', 'Underpaid').replace('overpaid', 'Overpaid')
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {new Date(deposit.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toast.success(language === 'ar' ? 'قريباً' : 'Coming soon')}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title={language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};