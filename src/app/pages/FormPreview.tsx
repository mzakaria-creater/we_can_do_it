import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Copy, CheckCircle, Code, Download, Eye, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { getFormById, incrementFormUsage, type PaymentForm, PAYMENT_METHOD_LABELS, PAYMENT_METHOD_ICONS } from '../lib/form-service';
import { copyToClipboard } from '../../lib/clipboard';

export const FormPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [form, setForm] = useState<PaymentForm | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      const foundForm = getFormById(id);
      if (foundForm) {
        setForm(foundForm);
      } else {
        toast.error(isRTL ? 'لم يتم العثور على النموذج' : 'Form not found');
        navigate('/forms-table');
      }
    }
  }, [id, navigate, isRTL]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = form?.fields.filter(field => 
      field.required && !formData[field.id]?.trim()
    );

    if (missingFields && missingFields.length > 0) {
      toast.error(isRTL ? `الرجاء ملء الحقول المطلوبة: ${missingFields.map(f => f.label).join(', ')}` : `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    if (form) {
      incrementFormUsage(form.id);
      toast.success(isRTL ? 'تم إرسال النموذج بنجاح!' : 'Form submitted successfully!');
      setFormData({});
    }
  };

  const copyShareLink = async () => {
    const link = `${window.location.origin}/standalone-form/${form?.id}`;
    const success = await copyToClipboard(link);
    if (success) {
      toast.success(isRTL ? 'تم نسخ الرابط' : 'Share link copied to clipboard');
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const copyEmbedCode = async () => {
    const embedCode = `<iframe src="${window.location.origin}/standalone-form/${form?.id}" width="100%" height="600" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>`;
    const success = await copyToClipboard(embedCode);
    if (success) {
      toast.success(isRTL ? 'تم نسخ كود التضمين' : 'Embed code copied to clipboard');
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  if (!form) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">{isRTL ? 'جاري التحميل...' : 'Loading form...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/forms-table')}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyShareLink}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg transition-all"
            >
              <Copy className="w-5 h-5" />
              <span>{isRTL ? 'نسخ الرابط' : 'Copy Link'}</span>
            </button>
            <button
              onClick={copyEmbedCode}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg transition-all"
            >
              <Code className="w-5 h-5" />
              <span>{isRTL ? 'كود التضمين' : 'Embed Code'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Form Preview/Fill */}
          <div className="lg:col-span-2">
            <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{form.name}</h2>
                    {form.description && (
                      <p className="text-gray-400">{form.description}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    form.isActive
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                      : 'bg-gray-500/20 border border-gray-500/30 text-gray-400'
                  }`}>
                    {form.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {form.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'textarea' ? (
                        <textarea
                          placeholder={field.placeholder}
                          required={field.required}
                          value={formData[field.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          rows={4}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none resize-none"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          required={field.required}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                        >
                          <option value="">{field.placeholder || (isRTL ? 'اختر خيار' : 'Select an option')}</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          required={field.required}
                          value={formData[field.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                        />
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={!form.isActive}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{form.isActive ? (isRTL ? 'إرسال نموذج الدفع' : 'Submit Payment Form') : (isRTL ? 'النموذج غير نشط' : 'Form Inactive')}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Form Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              {/* Form Details */}
              <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">{isRTL ? 'تفاصيل النموذج' : 'Form Details'}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{isRTL ? 'كود البادئة' : 'Prefix Code'}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white/10 px-2 py-1 rounded font-mono text-gray-300 flex-1">
                        {form.prefixCode}
                      </code>
                      <button
                        onClick={async () => {
                          const success = await copyToClipboard(form.prefixCode);
                          if (success) {
                            toast.success(isRTL ? 'تم النسخ' : 'Prefix copied');
                          } else {
                            toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
                          }
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-all"
                      >
                        <Copy className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">{isRTL ? 'حساب التاجر' : 'Merchant Account'}</p>
                    <p className="font-mono text-sm font-semibold text-white">{form.merchantAccount}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</p>
                    <div className="flex items-center gap-2">
                      <span>{PAYMENT_METHOD_ICONS[form.paymentMethod]}</span>
                      <span className="text-sm font-semibold text-white">{PAYMENT_METHOD_LABELS[form.paymentMethod]}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">{isRTL ? 'إجمالي الحقول' : 'Total Fields'}</p>
                    <p className="text-sm font-semibold text-white">{form.fields.length}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">{isRTL ? 'عدد الاستخدام' : 'Usage Count'}</p>
                    <p className="text-sm font-semibold text-white">{form.usageCount} {isRTL ? 'إرسال' : 'submissions'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">{isRTL ? 'تاريخ الإنشاء' : 'Created'}</p>
                    <p className="text-sm text-gray-300">
                      {new Date(form.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Field Summary */}
              <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">{isRTL ? 'ملخص الحقول' : 'Field Summary'}</h3>
                <div className="space-y-2">
                  {form.fields.map((field) => (
                    <div 
                      key={field.id} 
                      className="flex items-center justify-between text-sm py-2 border-b border-white/10 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white">{field.label}</span>
                        {field.required && (
                          <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400">
                            {isRTL ? 'مطلوب' : 'Required'}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400">
                        {field.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};