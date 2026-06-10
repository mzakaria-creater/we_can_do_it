/**
 * 🎯 Press2Pay - Transaction Status Constants
 * نظام شامل لحالات المعاملات مع التكوينات الكاملة
 */

import {
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  XCircle,
  Ban,
  Timer,
  CircleCheck,
  CircleX,
  Settings,
  type LucideIcon,
} from 'lucide-react';

/**
 * 📋 Transaction Status Enum
 */
export enum TransactionStatus {
  // قيد الانتظار - في انتظار المعالجة
  PENDING = 'pending',
  
  // قيد المراجعة - تحت المراجعة اليدوية
  UNDERREVIEW = 'underreview',
  
  // مدفوع - تم الدفع بالكامل
  PAID = 'paid',
  
  // مدفوع جزئياً - المبلغ أقل من المطلوب
  UNDERPAID = 'underpaid',
  
  // مدفوع زائد - المبلغ أكثر من المطلوب
  OVERPAID = 'overpaid',
  
  // ملغي - تم الإلغاء من قبل المستخدم
  CANCELLED = 'cancelled',
  
  // مرفوض - تم الرفض من البوابة
  DECLINED = 'declined',
  
  // منتهي - انتهت صلاحية المعاملة
  EXPIRED = 'expired',
  
  // ناجح - تمت المعاملة بنجاح
  SUCCESS = 'success',
  
  // فشل - فشلت المعاملة
  FAILED = 'failed',
  
  // جاري المعالجة - تحت المعالجة الآن
  PROCESSING = 'processing',
}

/**
 * 🎨 Status Configuration Interface
 */
export interface StatusConfig {
  value: TransactionStatus;
  label: string;
  labelEn: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  className: string;
  description: string;
  descriptionEn: string;
  actionable: boolean;
  severity: 'info' | 'warning' | 'success' | 'error' | 'neutral';
  priority: number;
}

/**
 * 🎯 Transaction Status Configurations
 */
export const TRANSACTION_STATUS_CONFIG: Record<TransactionStatus, StatusConfig> = {
  [TransactionStatus.PENDING]: {
    value: TransactionStatus.PENDING,
    label: 'قيد الانتظار',
    labelEn: 'Pending',
    icon: Clock,
    color: '#FFA500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-500',
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    description: 'في انتظار المعالجة',
    descriptionEn: 'Waiting for processing',
    actionable: true,
    severity: 'info',
    priority: 1,
  },

  [TransactionStatus.UNDERREVIEW]: {
    value: TransactionStatus.UNDERREVIEW,
    label: 'قيد المراجعة',
    labelEn: 'Under Review',
    icon: Search,
    color: '#3B82F6',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-500',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    description: 'تحت المراجعة اليدوية',
    descriptionEn: 'Under manual review',
    actionable: true,
    severity: 'info',
    priority: 2,
  },

  [TransactionStatus.PAID]: {
    value: TransactionStatus.PAID,
    label: 'مدفوع',
    labelEn: 'Paid',
    icon: CheckCircle2,
    color: '#10B981',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-500',
    className: 'bg-green-500/10 text-green-500 border-green-500/30',
    description: 'تم الدفع بالكامل',
    descriptionEn: 'Fully paid',
    actionable: false,
    severity: 'success',
    priority: 10,
  },

  [TransactionStatus.UNDERPAID]: {
    value: TransactionStatus.UNDERPAID,
    label: 'مدفوع جزئياً',
    labelEn: 'Underpaid',
    icon: AlertTriangle,
    color: '#F59E0B',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-500',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    description: 'المبلغ المدفوع أقل من المطلوب',
    descriptionEn: 'Amount paid is less than required',
    actionable: true,
    severity: 'warning',
    priority: 5,
  },

  [TransactionStatus.OVERPAID]: {
    value: TransactionStatus.OVERPAID,
    label: 'مدفوع زائد',
    labelEn: 'Overpaid',
    icon: DollarSign,
    color: '#8B5CF6',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-500',
    className: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    description: 'المبلغ المدفوع أكثر من المطلوب',
    descriptionEn: 'Amount paid is more than required',
    actionable: true,
    severity: 'warning',
    priority: 6,
  },

  [TransactionStatus.CANCELLED]: {
    value: TransactionStatus.CANCELLED,
    label: 'ملغي',
    labelEn: 'Cancelled',
    icon: Ban,
    color: '#6B7280',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-500',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
    description: 'تم الإلغاء من قبل المستخدم',
    descriptionEn: 'Cancelled by user',
    actionable: false,
    severity: 'neutral',
    priority: 7,
  },

  [TransactionStatus.DECLINED]: {
    value: TransactionStatus.DECLINED,
    label: 'مرفوض',
    labelEn: 'Declined',
    icon: XCircle,
    color: '#EF4444',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-500',
    className: 'bg-red-500/10 text-red-500 border-red-500/30',
    description: 'تم الرفض من البوابة',
    descriptionEn: 'Declined by gateway',
    actionable: true,
    severity: 'error',
    priority: 8,
  },

  [TransactionStatus.EXPIRED]: {
    value: TransactionStatus.EXPIRED,
    label: 'منتهي',
    labelEn: 'Expired',
    icon: Timer,
    color: '#64748B',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-500',
    className: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
    description: 'انتهت صلاحية المعاملة',
    descriptionEn: 'Transaction expired',
    actionable: false,
    severity: 'neutral',
    priority: 9,
  },

  [TransactionStatus.SUCCESS]: {
    value: TransactionStatus.SUCCESS,
    label: 'ناجح',
    labelEn: 'Success',
    icon: CircleCheck,
    color: '#22C55E',
    bgColor: 'bg-green-600/10',
    borderColor: 'border-green-600/30',
    textColor: 'text-green-600',
    className: 'bg-green-600/10 text-green-600 border-green-600/30',
    description: 'تمت المعاملة بنجاح',
    descriptionEn: 'Transaction completed successfully',
    actionable: false,
    severity: 'success',
    priority: 11,
  },

  [TransactionStatus.FAILED]: {
    value: TransactionStatus.FAILED,
    label: 'فشل',
    labelEn: 'Failed',
    icon: CircleX,
    color: '#DC2626',
    bgColor: 'bg-red-600/10',
    borderColor: 'border-red-600/30',
    textColor: 'text-red-600',
    className: 'bg-red-600/10 text-red-600 border-red-600/30',
    description: 'فشلت المعاملة',
    descriptionEn: 'Transaction failed',
    actionable: true,
    severity: 'error',
    priority: 3,
  },

  [TransactionStatus.PROCESSING]: {
    value: TransactionStatus.PROCESSING,
    label: 'جاري المعالجة',
    labelEn: 'Processing',
    icon: Settings,
    color: '#06B6D4',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-500',
    className: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
    description: 'تحت المعالجة الآن',
    descriptionEn: 'Currently being processed',
    actionable: true,
    severity: 'info',
    priority: 4,
  },
};

/**
 * 📊 Helper Functions
 */

/**
 * Get status configuration by status value
 */
export const getStatusConfig = (status: TransactionStatus | string): StatusConfig => {
  return TRANSACTION_STATUS_CONFIG[status as TransactionStatus] || TRANSACTION_STATUS_CONFIG[TransactionStatus.PENDING];
};

/**
 * Get all statuses as array
 */
export const getAllStatuses = (): StatusConfig[] => {
  return Object.values(TRANSACTION_STATUS_CONFIG);
};

/**
 * Get statuses by severity
 */
export const getStatusesBySeverity = (severity: StatusConfig['severity']): StatusConfig[] => {
  return getAllStatuses().filter((status) => status.severity === severity);
};

/**
 * Get actionable statuses (that need user action)
 */
export const getActionableStatuses = (): StatusConfig[] => {
  return getAllStatuses().filter((status) => status.actionable);
};

/**
 * Get statuses sorted by priority
 */
export const getStatusesByPriority = (): StatusConfig[] => {
  return getAllStatuses().sort((a, b) => a.priority - b.priority);
};

/**
 * Check if status is successful
 */
export const isSuccessStatus = (status: TransactionStatus | string): boolean => {
  return [
    TransactionStatus.PAID,
    TransactionStatus.SUCCESS,
  ].includes(status as TransactionStatus);
};

/**
 * Check if status is failed
 */
export const isFailedStatus = (status: TransactionStatus | string): boolean => {
  return [
    TransactionStatus.FAILED,
    TransactionStatus.DECLINED,
    TransactionStatus.EXPIRED,
  ].includes(status as TransactionStatus);
};

/**
 * Check if status is pending/in-progress
 */
export const isPendingStatus = (status: TransactionStatus | string): boolean => {
  return [
    TransactionStatus.PENDING,
    TransactionStatus.PROCESSING,
    TransactionStatus.UNDERREVIEW,
  ].includes(status as TransactionStatus);
};

/**
 * Check if status needs attention
 */
export const needsAttention = (status: TransactionStatus | string): boolean => {
  return [
    TransactionStatus.UNDERREVIEW,
    TransactionStatus.UNDERPAID,
    TransactionStatus.OVERPAID,
    TransactionStatus.FAILED,
    TransactionStatus.DECLINED,
  ].includes(status as TransactionStatus);
};

/**
 * Get status emoji
 */
export const getStatusEmoji = (status: TransactionStatus | string): string => {
  const emojiMap: Record<TransactionStatus, string> = {
    [TransactionStatus.PENDING]: '⏳',
    [TransactionStatus.UNDERREVIEW]: '🔍',
    [TransactionStatus.PAID]: '✅',
    [TransactionStatus.UNDERPAID]: '⚠️',
    [TransactionStatus.OVERPAID]: '💰',
    [TransactionStatus.CANCELLED]: '🚫',
    [TransactionStatus.DECLINED]: '❌',
    [TransactionStatus.EXPIRED]: '⏰',
    [TransactionStatus.SUCCESS]: '✅',
    [TransactionStatus.FAILED]: '❌',
    [TransactionStatus.PROCESSING]: '⚙️',
  };

  return emojiMap[status as TransactionStatus] || '❓';
};

/**
 * Format status for display
 */
export const formatStatus = (status: TransactionStatus | string, locale: 'ar' | 'en' = 'ar'): string => {
  const config = getStatusConfig(status);
  return locale === 'ar' ? config.label : config.labelEn;
};

/**
 * Get status color
 */
export const getStatusColor = (status: TransactionStatus | string): string => {
  const config = getStatusConfig(status);
  return config.color;
};

/**
 * Get status badge classes
 */
export const getStatusBadgeClasses = (status: TransactionStatus | string): string => {
  const config = getStatusConfig(status);
  return config.className;
};

/**
 * 📋 Status Groups for Filtering
 */
export const STATUS_GROUPS = {
  all: {
    label: 'جميع الحالات',
    labelEn: 'All Statuses',
    statuses: getAllStatuses(),
  },
  successful: {
    label: 'ناجحة',
    labelEn: 'Successful',
    statuses: getAllStatuses().filter((s) => isSuccessStatus(s.value)),
  },
  failed: {
    label: 'فاشلة',
    labelEn: 'Failed',
    statuses: getAllStatuses().filter((s) => isFailedStatus(s.value)),
  },
  pending: {
    label: 'قيد الانتظار',
    labelEn: 'Pending',
    statuses: getAllStatuses().filter((s) => isPendingStatus(s.value)),
  },
  needsAttention: {
    label: 'تحتاج انتباه',
    labelEn: 'Needs Attention',
    statuses: getAllStatuses().filter((s) => needsAttention(s.value)),
  },
};

/**
 * 🎨 Status Colors Map (for charts/graphs)
 */
export const STATUS_COLORS_MAP: Record<TransactionStatus, string> = {
  [TransactionStatus.PENDING]: '#FFA500',
  [TransactionStatus.UNDERREVIEW]: '#3B82F6',
  [TransactionStatus.PAID]: '#10B981',
  [TransactionStatus.UNDERPAID]: '#F59E0B',
  [TransactionStatus.OVERPAID]: '#8B5CF6',
  [TransactionStatus.CANCELLED]: '#6B7280',
  [TransactionStatus.DECLINED]: '#EF4444',
  [TransactionStatus.EXPIRED]: '#64748B',
  [TransactionStatus.SUCCESS]: '#22C55E',
  [TransactionStatus.FAILED]: '#DC2626',
  [TransactionStatus.PROCESSING]: '#06B6D4',
};

/**
 * 🔔 Status Notifications Configuration
 */
export const STATUS_NOTIFICATIONS: Record<TransactionStatus, {
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  type: 'success' | 'error' | 'warning' | 'info';
}> = {
  [TransactionStatus.PENDING]: {
    title: 'معاملة جديدة',
    titleEn: 'New Transaction',
    message: 'تم استلام معاملة جديدة وهي الآن قيد الانتظار',
    messageEn: 'New transaction received and is now pending',
    type: 'info',
  },
  [TransactionStatus.UNDERREVIEW]: {
    title: 'قيد المراجعة',
    titleEn: 'Under Review',
    message: 'المعاملة تحت المراجعة اليدوية من قبل الفريق',
    messageEn: 'Transaction is under manual review by the team',
    type: 'warning',
  },
  [TransactionStatus.PAID]: {
    title: 'تم الدفع',
    titleEn: 'Payment Received',
    message: 'تم استلام الدفع بنجاح',
    messageEn: 'Payment received successfully',
    type: 'success',
  },
  [TransactionStatus.UNDERPAID]: {
    title: 'دفعة ناقصة',
    titleEn: 'Underpayment',
    message: 'المبلغ المدفوع أقل من المبلغ المطلوب',
    messageEn: 'Amount paid is less than required',
    type: 'warning',
  },
  [TransactionStatus.OVERPAID]: {
    title: 'دفعة زائدة',
    titleEn: 'Overpayment',
    message: 'المبلغ المدفوع أكثر من المبلغ المطلوب',
    messageEn: 'Amount paid is more than required',
    type: 'warning',
  },
  [TransactionStatus.CANCELLED]: {
    title: 'تم الإلغاء',
    titleEn: 'Cancelled',
    message: 'تم إلغاء المعاملة',
    messageEn: 'Transaction has been cancelled',
    type: 'info',
  },
  [TransactionStatus.DECLINED]: {
    title: 'تم الرفض',
    titleEn: 'Declined',
    message: 'تم رفض المعاملة من قبل البوابة',
    messageEn: 'Transaction declined by gateway',
    type: 'error',
  },
  [TransactionStatus.EXPIRED]: {
    title: 'انتهت الصلاحية',
    titleEn: 'Expired',
    message: 'انتهت صلاحية المعاملة',
    messageEn: 'Transaction has expired',
    type: 'error',
  },
  [TransactionStatus.SUCCESS]: {
    title: 'معاملة ناجحة',
    titleEn: 'Successful Transaction',
    message: 'تمت المعاملة بنجاح',
    messageEn: 'Transaction completed successfully',
    type: 'success',
  },
  [TransactionStatus.FAILED]: {
    title: 'فشلت المعاملة',
    titleEn: 'Transaction Failed',
    message: 'فشلت المعاملة، يرجى المحاولة مرة أخرى',
    messageEn: 'Transaction failed, please try again',
    type: 'error',
  },
  [TransactionStatus.PROCESSING]: {
    title: 'جاري المعالجة',
    titleEn: 'Processing',
    message: 'المعاملة قيد المعالجة الآن',
    messageEn: 'Transaction is being processed',
    type: 'info',
  },
};

/**
 * Export all for convenience
 */
export default {
  TransactionStatus,
  TRANSACTION_STATUS_CONFIG,
  STATUS_GROUPS,
  STATUS_COLORS_MAP,
  STATUS_NOTIFICATIONS,
  getStatusConfig,
  getAllStatuses,
  getStatusesBySeverity,
  getActionableStatuses,
  getStatusesByPriority,
  isSuccessStatus,
  isFailedStatus,
  isPendingStatus,
  needsAttention,
  getStatusEmoji,
  formatStatus,
  getStatusColor,
  getStatusBadgeClasses,
};
