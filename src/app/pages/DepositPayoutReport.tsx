import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Download, 
  Share2, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Smartphone,
  CreditCard,
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { getMockDeposits, getMockPayouts, getMockStats } from '../lib/mockTransactions';

interface StatusData {
  status: string;
  count: number;
  amount: number;
  percentage: number;
}

interface PaymentMethodData {
  method: string;
  statuses: StatusData[];
  total: {
    count: number;
    amount: number;
  };
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  subMerchant: string;
  country: string;
  currency: string;
}

const DEPOSIT_STATUSES = [
  'PENDING',
  'UNDERREVIEW',
  'PAID',
  'UNDERPAID',
  'OVERPAID',
  'CANCELLED',
  'DECLINED',
  'EXPIRED'
];

const PAYOUT_STATUSES = [
  'PENDING',
  'APPROVED',
  'DECLINED'
];

const PAYMENT_METHODS = [
  { value: 'WireTransfer', label: 'Wire Transfer', icon: Building2, color: 'text-blue-500' },
  { value: 'MobileWallet', label: 'Mobile Wallet', icon: Smartphone, color: 'text-emerald-500' },
  { value: 'InstaPay', label: 'InstaPay', icon: CreditCard, color: 'text-purple-500' },
];

export const DepositPayoutReport = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    subMerchant: '',
    country: '',
    currency: 'EGP',
  });

  const [depositData, setDepositData] = useState<PaymentMethodData[]>([]);
  const [payoutData, setPayoutData] = useState<PaymentMethodData[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Use centralized mock data
      const deposits = getMockDeposits();
      const payouts = getMockPayouts();
      const stats = getMockStats();

      // Generate deposit data by payment method
      const depositMethodData: PaymentMethodData[] = PAYMENT_METHODS.map(method => {
        const methodDeposits = deposits.filter(d => d.method === method.label);
        const statusData = DEPOSIT_STATUSES.map(status => {
          const statusDeposits = methodDeposits.filter(d => {
            // Map our status to report status format
            if (status === 'PAID' && d.status === 'completed') return true;
            if (status === 'PENDING' && (d.status === 'pending' || d.status === 'processing')) return true;
            if (status === 'DECLINED' && d.status === 'failed') return true;
            return false;
          });
          return {
            status,
            count: statusDeposits.length,
            amount: statusDeposits.reduce((sum, d) => sum + d.amount, 0),
            percentage: methodDeposits.length > 0 ? (statusDeposits.length / methodDeposits.length) * 100 : 0,
          };
        });
        return {
          method: method.value,
          statuses: statusData,
          total: {
            count: methodDeposits.length,
            amount: methodDeposits.reduce((sum, d) => sum + d.amount, 0),
          },
        };
      });

      // Generate payout data by payment method
      const payoutMethodData: PaymentMethodData[] = PAYMENT_METHODS.map(method => {
        const methodPayouts = payouts.filter(p => p.method === method.label || p.method === 'Bank Transfer');
        const statusData = PAYOUT_STATUSES.map(status => {
          const statusPayouts = methodPayouts.filter(p => {
            // Map our status to report status format
            if (status === 'APPROVED' && (p.status === 'paid' || p.status === 'approved')) return true;
            if (status === 'PENDING' && (p.status === 'pending' || p.status === 'processing')) return true;
            if (status === 'DECLINED' && p.status === 'failed') return true;
            return false;
          });
          return {
            status,
            count: statusPayouts.length,
            amount: statusPayouts.reduce((sum, p) => sum + p.amount, 0),
            percentage: methodPayouts.length > 0 ? (statusPayouts.length / methodPayouts.length) * 100 : 0,
          };
        });
        return {
          method: method.value,
          statuses: statusData,
          total: {
            count: methodPayouts.length,
            amount: methodPayouts.reduce((sum, p) => sum + p.amount, 0),
          },
        };
      });

      setDepositData(depositMethodData);
      setPayoutData(payoutMethodData);
      toast.success(isRTL ? 'تم تحميل التقرير بنجاح' : 'Report loaded successfully');
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(isRTL ? 'فشل تحميل التقرير' : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    toast.success(
      isRTL 
        ? `جاري تصدير التقرير بصيغة ${format.toUpperCase()}...`
        : `Exporting report as ${format.toUpperCase()}...`
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: filters.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'APPROVED':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'PENDING':
        return 'text-amber-500 bg-amber-500/10';
      case 'UNDERREVIEW':
        return 'text-blue-500 bg-blue-500/10';
      case 'DECLINED':
      case 'CANCELLED':
        return 'text-red-500 bg-red-500/10';
      case 'UNDERPAID':
        return 'text-orange-500 bg-orange-500/10';
      case 'OVERPAID':
        return 'text-purple-500 bg-purple-500/10';
      case 'EXPIRED':
        return 'text-gray-500 bg-gray-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const renderPaymentMethodTable = (
    data: PaymentMethodData,
    type: 'deposit' | 'payout'
  ) => {
    const method = PAYMENT_METHODS.find(m => m.value === data.method);
    if (!method) return null;

    const Icon = method.icon;
    const statuses = type === 'deposit' ? DEPOSIT_STATUSES : PAYOUT_STATUSES;

    return (
      <motion.div
        key={data.method}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-card ${method.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <h4 className="font-bold text-foreground">{method.label}</h4>
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'إجمالي المعاملات' : 'Total Transactions'}: {data.total.count}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">
                  {isRTL ? 'الحالة' : 'Status'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase">
                  {isRTL ? 'عدد المعاملات' : 'Txn Count'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase">
                  {isRTL ? 'المبلغ' : 'Txn Amount'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase">
                  {isRTL ? 'النسبة %' : 'Amount %'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {statuses.map((status) => {
                const statusData = data.statuses.find(s => s.status === status) || {
                  status,
                  count: 0,
                  amount: 0,
                  percentage: 0,
                };

                return (
                  <tr key={status} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {statusData.count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold">
                      {formatCurrency(statusData.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">
                      {statusData.percentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-primary/5 font-bold">
                <td className="px-4 py-3 text-primary">
                  {isRTL ? 'الإجمالي' : 'Total'}
                </td>
                <td className="px-4 py-3 text-right text-primary font-mono">
                  {data.total.count.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-primary font-mono text-base">
                  {formatCurrency(data.total.amount)}
                </td>
                <td className="px-4 py-3 text-right text-primary font-mono">
                  100.00%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FileText className="text-primary" />
            {isRTL ? 'تقرير الإيداعات والسحوبات' : 'Deposit & Payout Report'}
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            {isRTL
              ? 'تقرير تفصيلي لجميع معاملات الإيداع والسحب حسب طريقة الدفع'
              : 'Detailed report of all deposit and payout transactions by payment method'}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all"
          >
            <Download size={16} />
            CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all"
          >
            <Download size={16} />
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
          >
            <Download size={16} />
            PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="text-primary" size={20} />
          <h3 className="text-xl font-bold text-foreground">
            {isRTL ? 'الفلاتر' : 'Filters'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar size={14} />
              {isRTL ? 'من تاريخ' : 'Start Date'}
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar size={14} />
              {isRTL ? 'إلى تاريخ' : 'End Date'}
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Sub Merchant */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">
              {isRTL ? 'التاجر الفرعي' : 'Sub Merchant'}
            </label>
            <input
              type="text"
              value={filters.subMerchant}
              onChange={(e) => setFilters({ ...filters, subMerchant: e.target.value })}
              placeholder={isRTL ? 'الكل' : 'All'}
              className="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">
              {isRTL ? 'الدولة' : 'Country'}
            </label>
            <select
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">{isRTL ? 'الكل' : 'All'}</option>
              <option value="EG">🇪🇬 Egypt</option>
              <option value="SA">🇸🇦 Saudi Arabia</option>
              <option value="AE">🇦🇪 UAE</option>
              <option value="KW">🇰🇼 Kuwait</option>
            </select>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">
              {isRTL ? 'العملة' : 'Currency'}
            </label>
            <select
              value={filters.currency}
              onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
              className="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="EGP">EGP - Egyptian Pound</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="USD">USD - US Dollar</option>
            </select>
          </div>
        </div>

        {/* Date Range Display */}
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-sm font-bold text-primary">
            {isRTL ? '📅 نطاق التاريخ: ' : '📅 Date Range: '}
            <span className="font-mono">
              {formatDateTime(filters.startDate + 'T00:00:00')} - {formatDateTime(filters.endDate + 'T23:59:59')}
            </span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="text-emerald-500" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-500">
                {depositData.reduce((sum, d) => sum + d.total.count, 0)}
              </div>
              <div className="text-xs text-muted-foreground">{isRTL ? 'إجمالي الإيداعات' : 'Total Deposits'}</div>
            </div>
          </div>
          <div className="text-sm font-bold text-foreground">
            {formatCurrency(depositData.reduce((sum, d) => sum + d.total.amount, 0))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingDown className="text-blue-500" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-500">
                {payoutData.reduce((sum, d) => sum + d.total.count, 0)}
              </div>
              <div className="text-xs text-muted-foreground">{isRTL ? 'إجمالي السحوبات' : 'Total Payouts'}</div>
            </div>
          </div>
          <div className="text-sm font-bold text-foreground">
            {formatCurrency(payoutData.reduce((sum, d) => sum + d.total.amount, 0))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="text-amber-500" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-500">
                {depositData.reduce((sum, d) => sum + d.statuses.find(s => s.status === 'PENDING')?.count || 0, 0)}
              </div>
              <div className="text-xs text-muted-foreground">{isRTL ? 'قيد الانتظار' : 'Pending'}</div>
            </div>
          </div>
          <div className="text-sm font-bold text-foreground">
            {formatCurrency(depositData.reduce((sum, d) => sum + (d.statuses.find(s => s.status === 'PENDING')?.amount || 0), 0))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="text-purple-500" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-500">
                {((depositData.reduce((sum, d) => sum + d.total.amount, 0) - payoutData.reduce((sum, d) => sum + d.total.amount, 0)) / depositData.reduce((sum, d) => sum + d.total.amount, 1) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">{isRTL ? 'هامش الربح' : 'Net Margin'}</div>
            </div>
          </div>
          <div className="text-sm font-bold text-foreground">
            {formatCurrency(depositData.reduce((sum, d) => sum + d.total.amount, 0) - payoutData.reduce((sum, d) => sum + d.total.amount, 0))}
          </div>
        </div>
      </div>

      {/* Deposit Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <TrendingUp className="text-emerald-500" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              {isRTL ? 'تفاصيل معاملات الإيداع' : 'Deposit Tx Details'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'تحليل شامل لجميع عمليات الإيداع' : 'Comprehensive analysis of all deposit transactions'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="inline-block w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground mt-4">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {depositData.map(data => renderPaymentMethodTable(data, 'deposit'))}
          </div>
        )}
      </div>

      {/* Payout Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <TrendingDown className="text-blue-500" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              {isRTL ? 'تفاصيل معاملات السحب' : 'Payout Tx Details'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'تحليل شامل لجميع عمليات السحب (بناءً على تاريخ التعديل)' : 'Comprehensive analysis of all payout transactions (as per Modified date)'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="inline-block w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground mt-4">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {payoutData.map(data => renderPaymentMethodTable(data, 'payout'))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} <span className="font-bold text-primary">Press2Pay</span> - {isRTL ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}
        </p>
      </div>
    </div>
  );
};