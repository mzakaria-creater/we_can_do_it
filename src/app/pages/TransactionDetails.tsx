import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  Download,
  Shield,
  User,
  CreditCard,
  Building,
  ExternalLink,
  MessageSquare,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';

interface TransactionDetailsData {
  // Tx Details
  guid: string;
  transactionId: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'UNDER_REVIEW' | 'REFUNDED' | 'REJECTED' | 'APPROVED';
  amount: number;
  currency: string;
  createdDate: string;
  modifiedDate: string;
  createdDateUtc: string;
  modifiedDateUtc: string;

  // User Details
  name: string;
  email: string;
  phoneNumber: string;
  city: string;
  state: string;
  country: string;
  ipAddress: string;
  userCategory: string;

  // Payment Info
  payBy: string;
  iPayInfo: string;
  requestType: string;

  // Processor Detail
  gatewayName: string;
  descriptorName: string;

  // MBS Details
  merchantName: string;
  retailerName: string;
  siteName: string;
  whitelabel: string;

  // Gateway Response Details
  description: string;
  gatewayResponse: string;
  gatewayResponseId: string;
  rpnNumber: string;
  comment: string;

  // Random User Details
  randomName: string;
  randomEmail: string;
  randomPhone: string;

  // Custom Fields
  merchantRefId1: string;
  reference2: string;
  reference3: string;
  reference4: string;
}

export const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useStore();
  const isRTL = language === 'ar';
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sample transaction data (Mock for now, but following the structure provided)
  const [transaction] = useState<TransactionDetailsData>({
    guid: '83a1567f-107a-4014-af85-a017987a6e6b',
    transactionId: id || '13588418',
    status: 'PAID',
    amount: 500,
    currency: 'EGP',
    createdDate: '2/13/2026 6:40:30 AM',
    modifiedDate: '2/13/2026 6:53:03 AM',
    createdDateUtc: '2026-02-13 05:40:30',
    modifiedDateUtc: '2026-02-13 05:53:03',

    name: 'Ahmed Handy',
    email: 'ahmed.handy@example.com',
    phoneNumber: '01017185662',
    city: 'Cairo',
    state: 'Cairo',
    country: 'EG',
    ipAddress: '196.156.3.117',
    userCategory: 'VIP',

    payBy: 'P2P',
    iPayInfo: 'Mobile Wallet',
    requestType: 'Seamless',

    gatewayName: 'Press2Pay Gateway',
    descriptorName: 'P2P-EGYPT-2026',

    merchantName: 'Premium Merchant Co.',
    retailerName: 'Retailer Alpha',
    siteName: 'Main Store EGP',
    whitelabel: 'NO',

    description: 'Txn is approved and paid by user',
    gatewayResponse: 'SUCCESS',
    gatewayResponseId: 'GR-992831',
    rpnNumber: 'RPN-7721',
    comment: 'Your payment has been successfully received. Thank you!',

    randomName: '',
    randomEmail: '',
    randomPhone: '',

    merchantRefId1: '1770961229972464389',
    reference2: 'NA',
    reference3: 'NA',
    reference4: 'NA',
  });

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(isRTL ? `تم نسخ ${fieldName} إلى الحافظة` : `${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any; bg: string }> = {
      PAID: { 
        label: isRTL ? 'مدفوع' : 'PAID', 
        color: '#10B981', 
        icon: CheckCircle,
        bg: 'rgba(16, 185, 129, 0.1)'
      },
      APPROVED: { 
        label: isRTL ? 'مقبول' : 'APPROVED', 
        color: '#3B82F6', 
        icon: CheckCircle,
        bg: 'rgba(59, 130, 246, 0.1)'
      },
      PENDING: { 
        label: isRTL ? 'قيد الانتظار' : 'PENDING', 
        color: '#F59E0B', 
        icon: Clock,
        bg: 'rgba(245, 158, 11, 0.1)'
      },
      UNDER_REVIEW: { 
        label: isRTL ? 'قيد المراجعة' : 'UNDER REVIEW', 
        color: '#8B5CF6', 
        icon: Shield,
        bg: 'rgba(139, 92, 246, 0.1)'
      },
      FAILED: { 
        label: isRTL ? 'فشل' : 'FAILED', 
        color: '#EF4444', 
        icon: XCircle,
        bg: 'rgba(239, 68, 68, 0.1)'
      },
      CANCELLED: { 
        label: isRTL ? 'ملغي' : 'CANCELLED', 
        color: '#6B7280', 
        icon: XCircle,
        bg: 'rgba(107, 114, 128, 0.1)'
      },
      EXPIRED: { 
        label: isRTL ? 'منتهي' : 'EXPIRED', 
        color: '#F97316', 
        icon: AlertTriangle,
        bg: 'rgba(249, 115, 22, 0.1)'
      },
      REJECTED: { 
        label: isRTL ? 'مرفوض' : 'REJECTED', 
        color: '#B91C1C', 
        icon: XCircle,
        bg: 'rgba(185, 28, 28, 0.1)'
      },
    };
    return configs[status] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;

  const renderField = (label: string, value: string, copyable: boolean = false, icon?: any) => {
    if (!value || value === 'NA' || value === '') return null;

    const Icon = icon;

    return (
      <div className="group flex flex-col gap-1 py-3 border-b border-[#D4AF37]/10 last:border-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </span>
          {copyable && (
            <button
              onClick={() => handleCopy(value, label)}
              className="p-1.5 hover:bg-[#D4AF37]/10 rounded-md transition-colors text-gray-500 hover:text-[#D4AF37]"
            >
              {copiedField === label ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-[#D4AF37]/70" />}
          <span className="text-sm font-semibold text-white break-all font-mono">
            {value}
          </span>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, icon: any, children: React.ReactNode) => {
    const SectionIcon = icon;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="vip-card overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#D4AF37]/20">
          <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
            <SectionIcon size={18} className="text-[#D4AF37]" />
          </div>
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest">
            {title}
          </h3>
        </div>
        <div className="flex flex-col">
          {children}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20 text-[#D4AF37] transition-all"
          >
            <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-black text-white">
                {isRTL ? 'تفاصيل المعاملة' : 'Transaction Details'}
              </h1>
              <div 
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border"
                style={{ borderColor: statusConfig.color, color: statusConfig.color, backgroundColor: statusConfig.bg }}
              >
                <StatusIcon size={12} />
                {statusConfig.label}
              </div>
            </div>
            <p className="text-gray-500 font-mono text-xs">
              ID: {transaction.transactionId} • GUID: {transaction.guid}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="vip-button-secondary py-2 text-xs flex items-center gap-2">
            <Download size={14} />
            {isRTL ? 'تنزيل التقرير' : 'Download PDF'}
          </button>
          <button className="vip-button-primary py-2 text-xs flex items-center gap-2">
            <ExternalLink size={14} />
            {isRTL ? 'عرض في الشبكة' : 'View on Explorer'}
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: isRTL ? 'المبلغ' : 'Amount', value: `${transaction.amount} ${transaction.currency}`, icon: CreditCard },
          { label: isRTL ? 'تاريخ الإنشاء' : 'Created', value: transaction.createdDate, icon: Clock },
          { label: isRTL ? 'طريقة الدفع' : 'Payment Method', value: transaction.iPayInfo, icon: Shield },
          { label: isRTL ? 'التاجر' : 'Merchant', value: transaction.merchantName, icon: Building },
        ].map((stat, i) => (
          <div key={i} className="vip-card flex items-center gap-4">
            <div className="p-3 bg-[#D4AF37]/10 rounded-xl">
              <stat.icon size={20} className="text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{stat.label}</p>
              <p className="text-lg font-black text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          {renderSection(isRTL ? 'تفاصيل العملية' : 'Transaction Info', CreditCard, <>
            {renderField('Guid', transaction.guid, true)}
            {renderField('Transaction ID', transaction.transactionId, true)}
            {renderField('Amount', `${transaction.amount} ${transaction.currency}`)}
            {renderField('Currency', transaction.currency)}
            {renderField('Status', transaction.status)}
            {renderField('Created (Local)', transaction.createdDate)}
            {renderField('Created (UTC)', transaction.createdDateUtc)}
          </>)}

          {renderSection(isRTL ? 'معلومات الدفع' : 'Payment Info', Shield, <>
            {renderField('PayBy', transaction.payBy)}
            {renderField('Method Info', transaction.iPayInfo)}
            {renderField('Request Type', transaction.requestType)}
          </>)}
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {renderSection(isRTL ? 'معلومات العميل' : 'User Details', User, <>
            {renderField('Name', transaction.name)}
            {renderField('Email', transaction.email, true)}
            {renderField('Phone', transaction.phoneNumber, true)}
            {renderField('IP Address', transaction.ipAddress, true)}
            {renderField('Location', `${transaction.city}, ${transaction.country}`)}
            {renderField('User Category', transaction.userCategory)}
          </>)}

          {renderSection(isRTL ? 'تفاصيل المعالج' : 'Processor Info', Building, <>
            {renderField('Gateway Name', transaction.gatewayName)}
            {renderField('Descriptor', transaction.descriptorName)}
          </>)}
        </div>

        {/* Column 3 */}
        <div className="space-y-6">
          {renderSection(isRTL ? 'تفاصيل التاجر' : 'MBS Details', Building, <>
            {renderField('Merchant Name', transaction.merchantName)}
            {renderField('Retailer', transaction.retailerName)}
            {renderField('Site Name', transaction.siteName)}
            {renderField('Whitelabel', transaction.whitelabel)}
          </>)}

          {renderSection(isRTL ? 'رد البوابة' : 'Gateway Response', MessageSquare, <>
            {renderField('Description', transaction.description)}
            {renderField('Response ID', transaction.gatewayResponseId, true)}
            {renderField('RPN Number', transaction.rpnNumber, true)}
            {renderField('Comment', transaction.comment)}
          </>)}

          {renderSection(isRTL ? 'حقول مخصصة' : 'Custom Fields', FileText, <>
            {renderField('Merchant Ref ID 1', transaction.merchantRefId1, true)}
            {renderField('Reference 2', transaction.reference2)}
            {renderField('Reference 3', transaction.reference3)}
          </>)}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-8 gap-4">
        <button 
          onClick={() => navigate('/transactions')}
          className="vip-button-secondary border-gray-800 text-gray-400 hover:text-white"
        >
          {isRTL ? 'العودة للقائمة' : 'Back to List'}
        </button>
        <button 
          onClick={() => {
            toast.success(isRTL ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
          }}
          className="vip-button-primary px-10"
        >
          {isRTL ? 'تصدير البيانات' : 'Export Transaction'}
        </button>
      </div>
    </div>
  );
};

export default TransactionDetails;
