import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { 
  TrendingDown, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowDownRight,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLoaderData, useSearchParams } from 'react-router';
import { getMockPayouts } from '../lib/mockTransactions';

interface Payout {
  id: string;
  merchantId: string;
  merchantName?: string;
  merchant?: string;
  amount: number;
  currency: string;
  method?: string;
  status: 'pending' | 'approved' | 'paid' | 'failed' | 'processing' | 'underreview' | 'cancelled' | 'declined' | 'expired';
  reference: string;
  bankAccount?: string;
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export const Payouts = () => {
  const { language } = useStore();
  const navigate = useNavigate();
  const loaderData = useLoaderData() as any;
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use data from loader or fallback to mock data if error
  const initialPayouts = loaderData?.payoutsData?.payouts;
  const isActuallyAvailable = initialPayouts && initialPayouts.length > 0;
  
  const [payouts, setPayouts] = useState<Payout[]>(isActuallyAvailable ? initialPayouts : getMockPayouts());
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(isActuallyAvailable);
  
  // Sync state with URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || 'all');

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (dateFilter !== 'all') params.set('date', dateFilter);
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, dateFilter, setSearchParams]);

  // Update payouts when loader data changes
  useEffect(() => {
    if (loaderData?.payoutsData?.payouts && loaderData.payoutsData.payouts.length > 0) {
      setPayouts(loaderData.payoutsData.payouts);
      setBackendAvailable(true);
    } else {
      setBackendAvailable(false);
      setPayouts(getMockPayouts());
    }
  }, [loaderData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
      case 'underreview':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
      case 'declined':
      case 'expired':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'approved':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
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
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = 
      (payout.merchantName || payout.merchant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payout.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payout.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payouts.reduce((sum, p) => sum + p.amount, 0),
    paid: payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pending: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    count: payouts.length,
  };

  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {!backendAvailable && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="vip-card bg-amber-500/5 border-[#D4AF37]/30 flex items-start gap-4 relative overflow-hidden group py-4"
        >
          <div className="absolute inset-0 gold-gradient opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="p-2 bg-[#D4AF37]/20 rounded-lg relative z-10">
            <Zap className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="text-[#D4AF37] text-xs font-black uppercase tracking-tighter mb-0.5">
              {language === 'ar' ? 'وضعية المعاينة الفاخرة' : 'Premium Preview Mode'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {language === 'ar' 
                ? 'يتم عرض سحوبات افتراضية للتأكد من تناسق الواجهة. جارٍ تحديث البيانات من الخزينة...' 
                : 'Displaying virtual payouts to ensure interface harmony. Syncing with treasury vault...'}
            </p>
          </div>
        </motion.div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="w-7 h-7 text-[#D4AF37]" />
            {language === 'ar' ? 'السحوبات' : 'Payouts'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'إدارة ومراقبة جميع السحوبات والمدفوعات'
              : 'Manage and monitor all payouts and withdrawals'}
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
                {language === 'ar' ? 'إجمالي السحوبات' : 'Total Payouts'}
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
                {language === 'ar' ? 'مدفوعة' : 'Paid'}
              </p>
              <p className="text-2xl font-bold text-green-500 mt-1">
                {stats.paid.toLocaleString()}
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
              <ArrowDownRight className="w-6 h-6 text-blue-500" />
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
            <option value="paid">{language === 'ar' ? 'مدفوعة' : 'Paid'}</option>
            <option value="approved">{language === 'ar' ? 'موافق عليها' : 'Approved'}</option>
            <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="underreview">{language === 'ar' ? 'قيد المراجعة' : 'Under Review'}</option>
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

      {/* Payouts Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'المرجع' : 'Reference'}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'التاجر' : 'Merchant'}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'المستفيد' : 'Beneficiary'}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'معرف الحساب' : 'Account ID'}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'المبلغ' : 'Amount'}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'الطريقة' : 'Method'}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase">
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
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {language === 'ar' ? 'لا توجد سحوبات' : 'No payouts found'}
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-foreground">{payout.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{payout.merchantName || payout.merchant}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{payout.customerName || 'N/A'}</span>
                        <span className="text-[10px] text-muted-foreground">{payout.customerEmail}</span>
                        <span className="text-[10px] text-muted-foreground">{payout.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
                        {payout.merchantId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-foreground">
                        {payout.amount.toLocaleString()} {payout.currency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{payout.method}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        {language === 'ar' 
                          ? payout.status === 'paid' ? 'مدفوعة'
                            : payout.status === 'approved' ? 'موافق عليها'
                            : payout.status === 'pending' ? 'قيد الانتظار'
                            : payout.status === 'underreview' ? 'قيد المراجعة'
                            : payout.status === 'declined' ? 'مرفوضة'
                            : payout.status === 'expired' ? 'منتهية'
                            : payout.status === 'cancelled' ? 'ملغاة'
                            : 'فاشلة'
                          : payout.status.charAt(0).toUpperCase() + payout.status.slice(1).replace('underreview', 'Under Review')
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {new Date(payout.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/payout-details/${payout.id}`)}
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