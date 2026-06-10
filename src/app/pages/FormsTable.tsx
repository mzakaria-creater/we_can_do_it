import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Code, 
  Code2,
  ExternalLink, 
  Share2, 
  Power, 
  PowerOff,
  TrendingUp, 
  ToggleRight, 
  Search,
  Download,
  Copy,
  X,
  Filter
} from 'lucide-react';
import { 
  getAllForms, 
  deleteForm, 
  toggleFormActive,
  getFormEmbedCodes,
  type PaymentForm,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS
} from '../lib/form-service';
import { copyToClipboard } from '../../lib/clipboard';

export const FormsTable = () => {
  const navigate = useNavigate();
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [forms, setForms] = useState<PaymentForm[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState<PaymentForm | null>(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedCodes, setEmbedCodes] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'link' | 'iframe' | 'html' | 'react'>('link');

  const loadForms = () => {
    const allForms = getAllForms();
    setForms(allForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadForms();

    const handleUpdate = () => {
      loadForms();
    };

    window.addEventListener('forms-updated', handleUpdate);
    return () => {
      window.removeEventListener('forms-updated', handleUpdate);
    };
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (confirm(isRTL ? `هل أنت متأكد من حذف النموذج "${name}"؟` : `Are you sure you want to delete form "${name}"?`)) {
      if (deleteForm(id)) {
        toast.success(isRTL ? 'تم حذف النموذج' : 'Form deleted successfully');
        loadForms();
      } else {
        toast.error(isRTL ? 'فشل حذف النموذج' : 'Failed to delete form');
      }
    }
  };

  const handleToggleActive = (id: string) => {
    const newStatus = toggleFormActive(id);
    toast.success(isRTL ? `تم ${newStatus ? 'تفعيل' : 'تعطيل'} النموذج` : `Form ${newStatus ? 'activated' : 'deactivated'} successfully`);
    loadForms();
  };

  const handleCopyPrefix = async (prefix: string) => {
    const success = await copyToClipboard(prefix);
    if (success) {
      toast.success(isRTL ? 'تم نسخ الكود' : 'Prefix code copied to clipboard');
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Form ID', 'Name', 'Prefix Code', 'Merchant Account', 'Payment Method', 'Status', 'Usage Count', 'Created At'].join(','),
      ...filteredForms.map(f => [
        f.id,
        f.name,
        f.prefixCode,
        f.merchantAccount,
        PAYMENT_METHOD_LABELS[f.paymentMethod],
        f.isActive ? 'Active' : 'Inactive',
        f.usageCount,
        new Date(f.createdAt).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-forms-${Date.now()}.csv`;
    a.click();
    toast.success(isRTL ? 'تم تصدير النماذج' : 'Forms exported successfully');
  };

  const filteredForms = forms.filter(form => 
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.prefixCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.merchantAccount.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEmbedCodes = (form: PaymentForm) => {
    setSelectedForm(form);
    const codes = getFormEmbedCodes(form.id);
    setEmbedCodes(codes);
    setShowEmbedModal(true);
  };

  const stats = {
    total: forms.length,
    active: forms.filter(f => f.isActive).length,
    totalUsage: forms.reduce((sum, f) => sum + f.usageCount, 0),
    methods: new Set(forms.map(f => f.paymentMethod)).size
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'نماذج الدفع' : 'Payment Forms'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL ? 'إدارة ومشاركة نماذج الدفع' : 'Manage and share payment forms'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={forms.length === 0}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg transition-all disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">{isRTL ? 'تصدير' : 'Export'}</span>
            </button>
            <button
              onClick={() => navigate('/form-builder')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-4 sm:px-6 py-3 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>{isRTL ? 'إنشاء نموذج' : 'Create Form'}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white mb-1">{stats.total}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'إجمالي النماذج' : 'Total Forms'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <ToggleRight className="w-8 h-8 text-green-400" />
              <Power className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-green-400 mb-1">{stats.active}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'نماذج نشطة' : 'Active Forms'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Eye className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-purple-400 mb-1">{stats.totalUsage}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'إجمالي الاستخدام' : 'Total Usage'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-orange-500/30 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Copy className="w-8 h-8 text-orange-400" />
              <Filter className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-orange-400 mb-1">{stats.methods}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'طرق الدفع' : 'Payment Methods'}</p>
          </motion.div>
        </div>

        {/* Search */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'البحث بالاسم، الكود، أو حساب التاجر...' : 'Search by name, prefix code, or merchant account...'}
              className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            />
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-white/10">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {isRTL ? 'جميع النماذج' : 'All Forms'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isRTL ? 'عرض' : 'Showing'} {filteredForms.length} {isRTL ? 'من' : 'of'} {forms.length} {isRTL ? 'نموذج' : 'forms'}
            </p>
          </div>

          {filteredForms.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                {forms.length === 0 
                  ? (isRTL ? 'لا توجد نماذج' : 'No forms found')
                  : (isRTL ? 'لا توجد نتائج' : 'No results found')}
              </h3>
              <p className="text-gray-500 mb-4">
                {forms.length === 0 
                  ? (isRTL ? 'أنشئ أول نموذج دفع للبدء' : 'Create your first payment form to get started')
                  : (isRTL ? 'حاول تغيير معايير البحث' : 'Try adjusting your search criteria')}
              </p>
              {forms.length === 0 && (
                <button
                  onClick={() => navigate('/form-builder')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>{isRTL ? 'إنشاء نموذج' : 'Create Form'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      {isRTL ? 'اسم النموذج' : 'Form Name'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      {isRTL ? 'الكود' : 'Code'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      {isRTL ? 'التاجر' : 'Merchant'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      {isRTL ? 'الطريقة' : 'Method'}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">
                      {isRTL ? 'الحقول' : 'Fields'}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">
                      {isRTL ? 'الاستخدام' : 'Usage'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      {isRTL ? 'الحالة' : 'Status'}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredForms.map((form, idx) => (
                    <motion.tr
                      key={form.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">{form.name}</p>
                          {form.description && (
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{form.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white/10 px-2 py-1 rounded font-mono text-gray-300">
                            {form.prefixCode}
                          </code>
                          <button
                            onClick={() => handleCopyPrefix(form.prefixCode)}
                            className="p-1 hover:bg-white/10 rounded transition-all"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-300">{form.merchantAccount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span>{PAYMENT_METHOD_ICONS[form.paymentMethod]}</span>
                          <span className="text-sm text-gray-300">{PAYMENT_METHOD_LABELS[form.paymentMethod]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-400">
                          {form.fields.length} {isRTL ? 'حقل' : 'fields'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-white">{form.usageCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                          form.isActive
                            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                            : 'bg-gray-500/20 border border-gray-500/30 text-gray-400'
                        }`}>
                          {form.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/form-preview/${form.id}`)}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 transition-all"
                            title={isRTL ? 'عرض' : 'View'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEmbedCodes(form)}
                            className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 transition-all"
                            title={isRTL ? 'كود التضمين' : 'Embed'}
                          >
                            <Code2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(form.id)}
                            className={`p-2 rounded-lg border transition-all ${
                              form.isActive
                                ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                : 'bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20'
                            }`}
                            title={form.isActive ? (isRTL ? 'تعطيل' : 'Deactivate') : (isRTL ? 'تفعيل' : 'Activate')}
                          >
                            {form.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(form.id, form.name)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all"
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
          )}
        </div>

        {/* Embed Modal */}
        {showEmbedModal && selectedForm && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEmbedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#14181D] border border-white/10 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isRTL ? 'أكواد التضمين' : 'Embed Codes'} - {selectedForm.name}
                </h2>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <span className="text-2xl text-gray-400">×</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {(['link', 'iframe', 'html', 'react'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-[#D4AF37] text-[#0B0F14]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'link' && (isRTL ? 'رابط' : 'Link')}
                    {tab === 'iframe' && 'iFrame'}
                    {tab === 'html' && 'HTML'}
                    {tab === 'react' && 'React'}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {activeTab === 'link' && (isRTL ? 'الرابط المباشر' : 'Direct Link')}
                    {activeTab === 'iframe' && (isRTL ? 'كود iFrame' : 'iFrame Code')}
                    {activeTab === 'html' && (isRTL ? 'كود HTML' : 'HTML Code')}
                    {activeTab === 'react' && (isRTL ? 'مكون React' : 'React Component')}
                  </label>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={embedCodes[activeTab] || ''}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-xs resize-none focus:border-[#D4AF37]/50 outline-none"
                      rows={activeTab === 'link' ? 2 : activeTab === 'react' ? 12 : 8}
                    />
                    <button
                      onClick={async () => {
                        const success = await copyToClipboard(embedCodes[activeTab] || '');
                        if (success) {
                          toast.success(isRTL ? 'تم النسخ!' : 'Copied!');
                        } else {
                          toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
                        }
                      }}
                      className="absolute top-2 right-2 flex items-center gap-2 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0F14] font-bold px-3 py-1.5 rounded-lg text-xs transition-all"
                    >
                      <Copy className="w-3 h-3" />
                      {isRTL ? 'نسخ' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Form Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {isRTL ? 'معلومات النموذج' : 'Form Information'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-400">{isRTL ? 'معرف النموذج:' : 'Form ID:'}</span>
                      <p className="font-mono text-white">{selectedForm.id}</p>
                    </div>
                    <div>
                      <span className="text-blue-400">{isRTL ? 'كود البادئة:' : 'Prefix Code:'}</span>
                      <p className="font-mono text-white">{selectedForm.prefixCode}</p>
                    </div>
                    <div>
                      <span className="text-blue-400">{isRTL ? 'حساب التاجر:' : 'Merchant Account:'}</span>
                      <p className="font-mono text-white">{selectedForm.merchantAccount}</p>
                    </div>
                    <div>
                      <span className="text-blue-400">{isRTL ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                      <p className="text-white">
                        {PAYMENT_METHOD_ICONS[selectedForm.paymentMethod]} {PAYMENT_METHOD_LABELS[selectedForm.paymentMethod]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};