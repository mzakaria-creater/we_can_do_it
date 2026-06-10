import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Link2, Plus, Copy, CheckCircle2, QrCode, Trash2, DollarSign,
  Users, TrendingUp, Calendar, Settings, ExternalLink, Clock, Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { copyToClipboard } from '../../lib/clipboard';

interface PaymentLink {
  id: string;
  title: string;
  amount: number | null;
  currency: string;
  status: 'active' | 'expired' | 'paused';
  uses: number;
  maxUses: number | null;
  created: string;
  expires: string | null;
  methods: string[];
  customizable: boolean;
}

export const PaymentLinks = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [links, setLinks] = useState<PaymentLink[]>([
    { 
      id: 'PL-001', 
      title: 'Premium Package', 
      amount: 2500, 
      currency: 'EGP', 
      status: 'active', 
      uses: 45, 
      maxUses: 100, 
      created: '2026-02-05', 
      expires: '2026-03-05',
      methods: ['vodafone_cash', 'card', 'fawry'],
      customizable: false
    },
    { 
      id: 'PL-002', 
      title: 'Monthly Subscription', 
      amount: 199, 
      currency: 'EGP', 
      status: 'active', 
      uses: 128, 
      maxUses: null, 
      created: '2026-01-15', 
      expires: null,
      methods: ['vodafone_cash', 'orange_money', 'card'],
      customizable: false
    },
    { 
      id: 'PL-003', 
      title: 'Custom Donation', 
      amount: null, 
      currency: 'EGP', 
      status: 'active', 
      uses: 23, 
      maxUses: null, 
      created: '2026-02-01', 
      expires: '2026-02-28',
      methods: ['card', 'fawry', 'instapay'],
      customizable: true
    },
    { 
      id: 'PL-004', 
      title: 'Event Ticket', 
      amount: 750, 
      currency: 'EGP', 
      status: 'expired', 
      uses: 50, 
      maxUses: 50, 
      created: '2026-01-20', 
      expires: '2026-01-25',
      methods: ['vodafone_cash', 'card'],
      customizable: false
    },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewLink, setPreviewLink] = useState<PaymentLink | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    currency: 'EGP',
    maxUses: '',
    expires: '',
    methods: ['vodafone_cash', 'card', 'fawry'],
    customizable: false
  });

  const stats = {
    activeLinks: links.filter(l => l.status === 'active').length,
    totalPayments: links.reduce((acc, l) => acc + l.uses, 0),
    revenue: 245000
  };

  const copyLink = async (id: string) => {
    const url = `https://pay.press2pay.com/link/${id}`;
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedId(id);
      toast.success(isRTL ? 'تم نسخ الرابط' : 'Link copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy link');
    }
  };

  const handleCreateLink = () => {
    if (!formData.title) {
      toast.error(isRTL ? 'الرجاء إدخال عنوان الرابط' : 'Please enter link title');
      return;
    }

    const newLink: PaymentLink = {
      id: `PL-${String(links.length + 1).padStart(3, '0')}`,
      title: formData.title,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      currency: formData.currency,
      status: 'active',
      uses: 0,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      created: new Date().toISOString().split('T')[0],
      expires: formData.expires || null,
      methods: formData.methods,
      customizable: formData.customizable
    };

    setLinks([newLink, ...links]);
    setIsCreateModalOpen(false);
    toast.success(isRTL ? 'تم إنشاء رابط الدفع بنجاح' : 'Payment link created successfully');
    
    // Reset form
    setFormData({
      title: '',
      amount: '',
      currency: 'EGP',
      maxUses: '',
      expires: '',
      methods: ['vodafone_cash', 'card', 'fawry'],
      customizable: false
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(isRTL ? 'هل تريد حذف هذا الرابط؟' : 'Delete this payment link?')) {
      setLinks(links.filter(l => l.id !== id));
      toast.success(isRTL ? 'تم حذف الرابط' : 'Link deleted');
    }
  };

  const downloadQR = (id: string) => {
    toast.success(isRTL ? 'جاري تحميل رمز QR' : 'Downloading QR code...');
  };

  const paymentMethods = [
    { id: 'vodafone_cash', name: 'Vodafone Cash', icon: '📱' },
    { id: 'orange_money', name: 'Orange Money', icon: '🟠' },
    { id: 'etisalat_cash', name: 'Etisalat Cash', icon: '💚' },
    { id: 'card', name: 'Credit Card', icon: '💳' },
    { id: 'fawry', name: 'Fawry', icon: '🔵' },
    { id: 'instapay', name: 'InstaPay', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F14] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                <Link2 className="w-6 h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'روابط الدفع' : 'Payment Links'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL 
                ? 'إنشاء روابط دفع قابلة للمشاركة مع صفحة دفع مستضافة'
                : 'Create shareable payment links with hosted checkout page'
              }
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-[#D4AF37]/20"
          >
            <Plus className="w-5 h-5" />
            <span>{isRTL ? 'إنشاء رابط دفع' : 'Create Payment Link'}</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Link2 className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-gray-500 bg-[#0B0F14] px-2 py-1 rounded">
                {isRTL ? 'نشط' : 'Active'}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.activeLinks}</h3>
            <p className="text-sm text-gray-400">{isRTL ? 'روابط نشطة' : 'Active Links'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalPayments.toLocaleString()}</h3>
            <p className="text-sm text-gray-400">{isRTL ? 'إجمالي المدفوعا' : 'Total Payments'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#D4AF37]/10 to-[#0B0F14] border border-[#D4AF37]/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <span className="text-xs text-green-500 font-medium">+12.5%</span>
            </div>
            <h3 className="text-3xl font-bold text-[#D4AF37] mb-1">
              {stats.revenue.toLocaleString()} EGP
            </h3>
            <p className="text-sm text-gray-400">{isRTL ? 'الإيرادات عبر الروابط' : 'Revenue via Links'}</p>
          </motion.div>
        </div>

        {/* Links Table */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0B0F14]/60">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'تفاصيل الرابط' : 'Link Details'}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'الاستخدام' : 'Usage'}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'تاريخ الانتهاء' : 'Expires'}
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, idx) => (
                  <motion.tr
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Link2 className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{link.title}</div>
                          <div className="text-xs text-gray-500 font-mono">{link.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-bold">
                        {link.amount 
                          ? `${link.amount.toLocaleString()} ${link.currency}`
                          : <span className="text-[#D4AF37]">{isRTL ? 'مخصص' : 'Custom'}</span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{link.uses}</span>
                        {link.maxUses && (
                          <>
                            <span className="text-gray-600">/</span>
                            <span className="text-gray-400">{link.maxUses}</span>
                          </>
                        )}
                        {!link.maxUses && (
                          <span className="text-gray-500 text-xs ml-1">
                            ({isRTL ? 'غير محدود' : 'unlimited'})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        link.status === 'active' 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                          : link.status === 'expired'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                          : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                      }`}>
                        {link.status === 'active' ? (isRTL ? 'نشط' : 'Active') :
                         link.status === 'expired' ? (isRTL ? 'منتهي' : 'Expired') :
                         (isRTL ? 'متوقف' : 'Paused')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-400 text-sm flex items-center gap-2">
                        {link.expires ? (
                          <>
                            <Calendar className="w-4 h-4" />
                            {link.expires}
                          </>
                        ) : (
                          <span className="text-gray-600">{isRTL ? 'بدون انتهاء' : 'Never'}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => copyLink(link.id)}
                          className={`p-2 rounded-lg transition-all ${
                            copiedId === link.id
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                          }`}
                          title={isRTL ? 'نسخ الرابط' : 'Copy Link'}
                        >
                          {copiedId === link.id ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setShowQR(link.id)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                          title={isRTL ? 'رمز QR' : 'QR Code'}
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setPreviewLink(link)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                          title={isRTL ? 'معاينة' : 'Preview'}
                        >
                          <Link2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(link.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all text-red-500"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl bg-[#14181D] border border-white/10 rounded-2xl shadow-2xl z-51 max-h-[90vh] overflow-y-auto"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-[#0B0F14]" />
                    </div>
                    {isRTL ? 'إنشاء رابط دفع' : 'Create Payment Link'}
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
                    {isRTL ? 'عنوان الرابط *' : 'Link Title *'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={isRTL ? 'مثال: باقة مميزة' : 'e.g. Premium Package'}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      {isRTL ? 'المبلغ (اتركه فارغاً للمبلغ المخصص)' : 'Amount (leave empty for custom)'}
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      {isRTL ? 'العملة' : 'Currency'}
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                    >
                      <option value="EGP">EGP - Egyptian Pound</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="USDT">USDT - Tether</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-3 block">
                    {isRTL ? 'طرق الدفع' : 'Payment Methods'}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {paymentMethods.map(method => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.methods.includes(method.id)
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30'
                            : 'bg-[#0B0F14] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.methods.includes(method.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, methods: [...formData.methods, method.id] });
                            } else {
                              setFormData({ ...formData, methods: formData.methods.filter(m => m !== method.id) });
                            }
                          }}
                          className="w-4 h-4 accent-[#D4AF37]"
                        />
                        <span className="text-sm">{method.icon}</span>
                        <span className="text-sm text-white font-medium">{method.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      {isRTL ? 'الحد الأقصى للاستخدامات (اختياري)' : 'Max Uses (optional)'}
                    </label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      placeholder={isRTL ? 'غير محدود' : 'Unlimited'}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      {isRTL ? 'تاريخ الانتهاء (اختياري)' : 'Expiry Date (optional)'}
                    </label>
                    <input
                      type="date"
                      value={formData.expires}
                      onChange={(e) => setFormData({ ...formData, expires: e.target.value })}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 bg-[#0B0F14] rounded-lg border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.customizable}
                    onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                    className="w-5 h-5 accent-[#D4AF37]"
                  />
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {isRTL ? 'السماح بالمبلغ المخصص' : 'Allow Custom Amount'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {isRTL 
                        ? 'السماح للعملاء بإدخال المبلغ الخاص بهم'
                        : 'Let customers enter their own amount'
                      }
                    </div>
                  </div>
                </label>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition-all"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleCreateLink}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all"
                >
                  <Link2 className="w-5 h-5" />
                  <span>{isRTL ? 'إنشاء الرابط' : 'Create Link'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preview Modal (Hosted Checkout) */}
      <AnimatePresence>
        {previewLink && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewLink(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md bg-white rounded-2xl shadow-2xl z-51 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#0B0F14] p-8 text-center border-b border-gray-800">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-[#0B0F14] font-bold text-2xl">P2P</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-1">{previewLink.title}</h3>
                <p className="text-gray-400 text-sm">{isRTL ? 'ادفع لـ Press2Pay' : 'Pay to Press2Pay Merchant'}</p>
                
                <div className="mt-6">
                  <span className="text-4xl font-bold text-[#D4AF37]">
                    {previewLink.amount ? previewLink.amount.toLocaleString() : '---'}
                  </span>
                  <span className="text-gray-400 ml-2">{previewLink.currency}</span>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 bg-gray-50">
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    {isRTL ? 'البريد الإلكتروني' : 'Customer Email'}
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    {isRTL ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-4 py-3 border-2 border-[#D4AF37] bg-[#D4AF37]/5 rounded-lg text-center font-semibold text-sm text-gray-900 cursor-pointer">
                      💳 Card
                    </div>
                    <div className="px-4 py-3 border border-gray-300 bg-white rounded-lg text-center text-sm text-gray-900 cursor-pointer hover:border-gray-400">
                      📱 Vodafone
                    </div>
                    <div className="px-4 py-3 border border-gray-300 bg-white rounded-lg text-center text-sm text-gray-900 cursor-pointer hover:border-gray-400">
                      🔵 Fawry
                    </div>
                    <div className="px-4 py-3 border border-gray-300 bg-white rounded-lg text-center text-sm text-gray-900 cursor-pointer hover:border-gray-400">
                      ⚡ InstaPay
                    </div>
                  </div>
                </div>

                <button className="w-full py-4 bg-[#0B0F14] hover:bg-[#14181D] text-[#D4AF37] font-bold rounded-lg text-base transition-all">
                  {isRTL ? 'ادفع' : 'Pay'} {previewLink.amount ? `${previewLink.amount.toLocaleString()} ${previewLink.currency}` : ''}
                </button>

                <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  {isRTL ? 'محمي بواسطة Press2Pay' : 'Secured by Press2Pay'}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQR(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-sm bg-[#14181D] border border-white/10 rounded-2xl shadow-2xl z-51 p-6 text-center"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {isRTL ? 'رمز QR للدفع' : 'Payment QR Code'}
              </h3>

              <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                <QrCode className="w-36 h-36 text-[#0B0F14]" />
              </div>

              <p className="text-sm text-gray-400 font-mono mb-4">
                pay.press2pay.com/link/{showQR}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => copyLink(showQR)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-semibold transition-all"
                >
                  <Copy className="w-4 h-4" />
                  {isRTL ? 'نسخ' : 'Copy'}
                </button>
                <button
                  onClick={() => downloadQR(showQR)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14] py-3 rounded-lg font-bold transition-all"
                >
                  <Download className="w-4 h-4" />
                  {isRTL ? 'تحميل' : 'Download'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};