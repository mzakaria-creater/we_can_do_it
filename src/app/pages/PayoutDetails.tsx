import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { 
  X,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  Printer,
  Share2,
  Copy,
  ExternalLink,
  Calendar,
  Building2,
  User,
  CreditCard,
  Banknote,
  DollarSign,
  FileText,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { copyToClipboard } from '../../lib/clipboard';

interface PayoutData {
  id: string;
  batchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  merchant: string;
  merchantId: string;
  beneficiary: string;
  beneficiaryEmail?: string;
  beneficiaryPhone?: string;
  amount: number;
  currency: string;
  processor: string;
  account: string;
  iban: string;
  bank: string;
  bankCode?: string;
  date: string;
  time: string;
  completedAt?: string;
  reference?: string;
  notes?: string;
  fee?: number;
  netAmount?: number;
}

const PayoutDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [payout, setPayout] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string>('');

  // Mock data - في الواقع، سيتم جلبها من API
  useEffect(() => {
    const loadPayout = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockPayout: PayoutData = {
        id: id || 'PAYOUT-2024-7001',
        batchId: 'BATCH-890',
        status: 'completed',
        merchant: 'ElectroMart Store',
        merchantId: 'MERCH-001',
        beneficiary: 'Ahmed Hassan',
        beneficiaryEmail: 'ahmed.hassan@electromart.com',
        beneficiaryPhone: '+20 100 123 4567',
        amount: 15000,
        currency: 'EGP',
        processor: 'TransFi',
        account: '****8923',
        iban: 'EG***********8923',
        bank: 'Commercial International Bank',
        bankCode: 'CIBEEGCX',
        date: '2024-02-04',
        time: '15:20:10',
        completedAt: '2024-02-04 15:25:30',
        reference: 'TXN-REF-2024-7001',
        notes: 'Monthly settlement payout',
        fee: 75,
        netAmount: 14925
      };
      
      setPayout(mockPayout);
      setLoading(false);
    };

    loadPayout();
  }, [id]);

  const getStatusConfig = (status: PayoutData['status']) => {
    const configs = {
      pending: {
        label: isRTL ? 'قيد الانتظار' : 'Pending',
        labelAr: 'قيد الانتظار',
        icon: Clock,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/20'
      },
      processing: {
        label: isRTL ? 'جارٍ المعالجة' : 'Processing',
        labelAr: 'جارٍ المعالجة',
        icon: RefreshCw,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/20'
      },
      completed: {
        label: isRTL ? 'مكتمل' : 'Completed',
        labelAr: 'مكتمل',
        icon: CheckCircle2,
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        border: 'border-green-400/20'
      },
      failed: {
        label: isRTL ? 'فشل' : 'Failed',
        labelAr: 'فشل',
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/20'
      },
      cancelled: {
        label: isRTL ? 'ملغى' : 'Cancelled',
        labelAr: 'ملغى',
        icon: AlertCircle,
        color: 'text-gray-400',
        bg: 'bg-gray-400/10',
        border: 'border-gray-400/20'
      }
    };
    return configs[status];
  };

  const handleCopy = async (text: string, fieldName: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldName);
      toast.success(isRTL ? `تم نسخ ${fieldName}` : `${fieldName} copied`);
      setTimeout(() => setCopiedField(''), 2000);
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const handleDownloadPDF = () => {
    toast.success(isRTL ? 'جارٍ تحميل PDF...' : 'Downloading PDF...');
    // Implement PDF download logic
  };

  const handlePrint = () => {
    window.print();
    toast.success(isRTL ? 'جارٍ الطباعة...' : 'Printing...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Payout Details - ${payout?.id}`,
        text: `Payout of ${payout?.amount} ${payout?.currency} to ${payout?.beneficiary}`,
        url: window.location.href
      });
    } else {
      handleCopy(window.location.href, isRTL ? 'الرابط' : 'Link');
    }
  };

  const handleSendEmail = () => {
    toast.success(isRTL ? 'جارٍ إرسال البريد...' : 'Sending email...');
    // Implement email sending logic
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 font-arabic">
            {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2 font-arabic">
            {isRTL ? 'لم يتم العثور على الدفعة' : 'Payout Not Found'}
          </h2>
          <button
            onClick={() => navigate('/payouts')}
            className="mt-4 px-6 py-2 bg-[#D4AF37] text-[#0B0F14] rounded-lg font-bold hover:bg-[#E5C158] transition-all"
          >
            {isRTL ? 'العودة للقائمة' : 'Back to List'}
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(payout.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F14] via-[#1a1f2e] to-[#0B0F14] py-8 px-4 font-arabic" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Actions */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <ArrowLeft className={`w-5 h-5 group-hover:-translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
            <span className="font-medium">{isRTL ? 'رجوع' : 'Back'}</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Download PDF */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadPDF}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
              title={isRTL ? 'تحميل PDF' : 'Download PDF'}
            >
              <Download className="w-5 h-5 text-white/60 group-hover:text-[#D4AF37]" />
            </motion.button>

            {/* Print */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
              title={isRTL ? 'طباعة' : 'Print'}
            >
              <Printer className="w-5 h-5 text-white/60 group-hover:text-[#D4AF37]" />
            </motion.button>

            {/* Share */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
              title={isRTL ? 'مشاركة' : 'Share'}
            >
              <Share2 className="w-5 h-5 text-white/60 group-hover:text-[#D4AF37]" />
            </motion.button>

            {/* Send Email */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendEmail}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
              title={isRTL ? 'إرسال بريد' : 'Send Email'}
            >
              <Mail className="w-5 h-5 text-white/60 group-hover:text-[#D4AF37]" />
            </motion.button>

            {/* Close */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all group"
              title={isRTL ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5 text-red-400" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Card */}
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D4AF37]/20 via-[#E5C158]/10 to-transparent border-b border-white/10 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Banknote className="w-8 h-8 text-[#D4AF37]" />
                  {isRTL ? 'تفاصيل الدفعة' : 'Payout Details'}
                </h1>
                <p className="text-white/60">
                  {isRTL ? 'معلومات كاملة عن عملية السحب' : 'Complete information about the payout transaction'}
                </p>
              </div>

              {/* Status Badge */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig.bg} ${statusConfig.border} border`}>
                <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                <span className={`font-bold ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Payout ID */}
                <div className="group">
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {isRTL ? 'معرف الدفعة' : 'Payout ID'}
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono text-lg font-bold">{payout.id}</p>
                    <button
                      onClick={() => handleCopy(payout.id, 'Payout ID')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded"
                    >
                      {copiedField === 'Payout ID' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/40" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    {isRTL ? 'الحالة' : 'Status'}
                  </label>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                    <span className={`font-bold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Merchant */}
                <div className="group">
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {isRTL ? 'التاجر' : 'Merchant'}
                  </label>
                  <p className="text-white text-lg font-bold">{payout.merchant}</p>
                  <p className="text-white/40 text-sm mt-1">{payout.merchantId}</p>
                </div>

                {/* Beneficiary */}
                <div className="group">
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {isRTL ? 'المستفيد' : 'Beneficiary'}
                  </label>
                  <p className="text-white text-lg font-bold">{payout.beneficiary}</p>
                  {payout.beneficiaryEmail && (
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="w-4 h-4 text-white/40" />
                      <p className="text-white/60 text-sm">{payout.beneficiaryEmail}</p>
                    </div>
                  )}
                  {payout.beneficiaryPhone && (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-white/40" />
                      <p className="text-white/60 text-sm">{payout.beneficiaryPhone}</p>
                    </div>
                  )}
                </div>

                {/* Bank */}
                <div className="group">
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {isRTL ? 'البنك' : 'Bank'}
                  </label>
                  <p className="text-white text-lg font-bold">{payout.bank}</p>
                  {payout.bankCode && (
                    <p className="text-white/40 text-sm mt-1">
                      {isRTL ? 'رمز SWIFT: ' : 'SWIFT Code: '}{payout.bankCode}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {isRTL ? 'التاريخ' : 'Date'}
                  </label>
                  <p className="text-white text-lg font-bold">{payout.date}</p>
                  {payout.completedAt && (
                    <p className="text-white/40 text-sm mt-1">
                      {isRTL ? 'اكتمل في: ' : 'Completed at: '}{payout.completedAt}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Batch ID */}
                <div className="group">
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {isRTL ? 'معرف الدفعة الجماعية' : 'Batch ID'}
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono text-lg font-bold">{payout.batchId}</p>
                    <button
                      onClick={() => handleCopy(payout.batchId, 'Batch ID')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded"
                    >
                      {copiedField === 'Batch ID' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/40" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl p-4">
                  <label className="text-[#D4AF37]/80 text-sm mb-2 block flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {isRTL ? 'المبلغ' : 'Amount'}
                  </label>
                  <p className="text-[#D4AF37] text-3xl font-bold">
                    {payout.amount.toLocaleString()} {payout.currency}
                  </p>
                  {payout.fee && (
                    <div className="mt-3 pt-3 border-t border-[#D4AF37]/20 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">{isRTL ? 'الرسوم:' : 'Fee:'}</span>
                        <span className="text-white/60">-{payout.fee} {payout.currency}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-[#D4AF37]">{isRTL ? 'الصافي:' : 'Net:'}</span>
                        <span className="text-[#D4AF37]">{payout.netAmount?.toLocaleString()} {payout.currency}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Processor */}
                <div>
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {isRTL ? 'المعالج' : 'Processor'}
                  </label>
                  <p className="text-white text-lg font-bold">{payout.processor}</p>
                </div>

                {/* Account */}
                <div className="group">
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {isRTL ? 'الحساب' : 'Account'}
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-lg font-bold font-mono">{payout.account}</p>
                    <button
                      onClick={() => handleCopy(payout.account, 'Account')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded"
                    >
                      {copiedField === 'Account' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/40" />
                      )}
                    </button>
                  </div>
                </div>

                {/* IBAN */}
                <div className="group">
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    {isRTL ? 'رقم الآيبان' : 'IBAN'}
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-lg font-bold font-mono">{payout.iban}</p>
                    <button
                      onClick={() => handleCopy(payout.iban, 'IBAN')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded"
                    >
                      {copiedField === 'IBAN' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/40" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {isRTL ? 'الوقت' : 'Time'}
                  </label>
                  <p className="text-white text-lg font-bold font-mono">{payout.time}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {(payout.reference || payout.notes) && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {payout.reference && (
                    <div className="group">
                      <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {isRTL ? 'الرقم المرجعي' : 'Reference'}
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-mono">{payout.reference}</p>
                        <button
                          onClick={() => handleCopy(payout.reference!, 'Reference')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded"
                        >
                          {copiedField === 'Reference' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {payout.notes && (
                    <div>
                      <label className="text-white/40 text-sm mb-2 block flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {isRTL ? 'ملاحظات' : 'Notes'}
                      </label>
                      <p className="text-white/60">{payout.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-white/5 border-t border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Clock className="w-4 h-4" />
                <span>
                  {isRTL ? 'آخر تحديث: ' : 'Last updated: '}
                  {new Date().toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0F14] font-bold rounded-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  {isRTL ? 'تحميل PDF' : 'Download PDF'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-lg transition-all"
                >
                  <Printer className="w-4 h-4" />
                  {isRTL ? 'طباعة' : 'Print'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { PayoutDetails };
export default PayoutDetails;