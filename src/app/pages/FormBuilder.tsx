import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  Settings, 
  Code, 
  Trash2, 
  Plus, 
  Eye 
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { 
  saveForm, 
  generatePrefixCode, 
  type PaymentMethod, 
  type FormField,
  type PaymentFormFieldType,
  type AssignmentMethod,
  type AssignmentType,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  PAYMENT_FORM_FIELD_LABELS,
  ASSIGNMENT_METHOD_LABELS,
  ASSIGNMENT_TYPE_LABELS
} from '../lib/form-service';

export const FormBuilder = () => {
  const navigate = useNavigate();
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [merchantAccount, setMerchantAccount] = useState("MERC1234");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ussd");
  const [fields, setFields] = useState<FormField[]>([
    {
      id: `field-${Date.now()}`,
      label: "Customer Name",
      type: "text",
      placeholder: "Enter name",
      required: true,
    }
  ]);
  
  const [previewPrefix, setPreviewPrefix] = useState("");

  const updatePrefixPreview = (account: string, method: PaymentMethod) => {
    const prefix = generatePrefixCode(account, method);
    setPreviewPrefix(prefix);
  };

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      label: "",
      type: "text",
      placeholder: "",
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    if (fields.length === 1) {
      toast.error(isRTL ? "يجب أن يحتوي النموذج على حقل واحد على الأقل" : "Form must have at least one field");
      return;
    }
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast.error(isRTL ? "الرجاء إدخال اسم النموذج" : "Please enter form name");
      return;
    }
    if (!merchantAccount.trim()) {
      toast.error(isRTL ? "الرجاء إدخال حساب التاجر" : "Please enter merchant account");
      return;
    }
    if (fields.some(f => !f.label.trim())) {
      toast.error(isRTL ? "يجب أن يحتوي كل حقل على عنوان" : "All fields must have a label");
      return;
    }

    try {
      const newForm = saveForm({
        name: formName,
        description: formDescription,
        merchantAccount,
        paymentMethod,
        fields,
        isActive: true,
      });

      toast.success(isRTL ? `تم إنشاء النموذج! الكود: ${newForm.prefixCode}` : `Form created! Code: ${newForm.prefixCode}`);
      navigate('/forms-table');
    } catch (error) {
      toast.error(isRTL ? "فشل حفظ النموذج" : "Failed to save form");
      console.error(error);
    }
  };

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
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#0B0F14]" />
                </div>
                {isRTL ? 'منشئ النماذج' : 'Form Builder'}
              </h1>
              <p className="text-gray-400 text-sm">
                {isRTL ? 'إنشاء نماذج دفع قابلة للمشاركة' : 'Create shareable payment forms with custom fields'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all"
          >
            <Save className="w-5 h-5" />
            <span>{isRTL ? 'حفظ النموذج' : 'Save Form'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Form Configuration */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Form Details */}
            <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-bold text-white">{isRTL ? 'تفاصيل النموذج' : 'Form Details'}</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isRTL ? 'اسم النموذج *' : 'Form Name *'}
                  </label>
                  <input
                    type="text"
                    placeholder={isRTL ? 'مثال: نموذج الدفع القياسي' : 'e.g., Standard Payment Form'}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isRTL ? 'الوصف' : 'Description'}
                  </label>
                  <textarea
                    placeholder={isRTL ? 'وصف موجز لغرض النموذج' : 'Brief description of the form purpose'}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'حساب التاجر *' : 'Merchant Account *'}
                    </label>
                    <input
                      type="text"
                      placeholder="MERC1234"
                      value={merchantAccount}
                      onChange={(e) => {
                        setMerchantAccount(e.target.value);
                        updatePrefixPreview(e.target.value, paymentMethod);
                      }}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'طريقة الدفع *' : 'Payment Method *'}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => {
                        const method = e.target.value as PaymentMethod;
                        setPaymentMethod(method);
                        updatePrefixPreview(merchantAccount, method);
                      }}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                    >
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {PAYMENT_METHOD_ICONS[key as PaymentMethod]} {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Prefix Preview */}
                {merchantAccount && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Code className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-300 mb-1">
                          {isRTL ? 'كود البادئة (معاينة)' : 'Generated Prefix Code (Preview)'}
                        </p>
                        <code className="text-xs font-mono font-bold text-blue-200">
                          {previewPrefix || generatePrefixCode(merchantAccount, paymentMethod)}
                        </code>
                        <p className="text-xs text-blue-400 mt-1">
                          {merchantAccount.substring(0, 4).toUpperCase()}-{paymentMethod.substring(0, 3).toUpperCase()}-TIMESTAMP-RANDOM
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="text-lg font-bold text-white">{isRTL ? 'حقول النموذج' : 'Form Fields'}</h2>
                </div>
                <span className="text-sm text-gray-400">{fields.length} {isRTL ? 'حقل' : 'fields'}</span>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">
                        {isRTL ? 'الحقل' : 'Field'} {index + 1}
                      </h4>
                      <button
                        onClick={() => deleteField(field.id)}
                        disabled={fields.length === 1}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          {isRTL ? 'عنوان الحقل *' : 'Field Label *'}
                        </label>
                        <input
                          type="text"
                          placeholder={isRTL ? 'مثال: اسم العميل' : 'e.g., Customer Name'}
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:border-[#D4AF37]/50 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          {isRTL ? 'نوع الحقل' : 'Field Type'}
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#D4AF37]/50 outline-none"
                        >
                          <option value="text">{isRTL ? 'نص' : 'Text'}</option>
                          <option value="number">{isRTL ? 'رقم' : 'Number'}</option>
                          <option value="email">{isRTL ? 'بريد إلكتروني' : 'Email'}</option>
                          <option value="tel">{isRTL ? 'هاتف' : 'Phone'}</option>
                          <option value="textarea">{isRTL ? 'نص طويل' : 'Textarea'}</option>
                          <option value="select">{isRTL ? 'قائمة منسدلة' : 'Select'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          {isRTL ? 'النص التوضيحي' : 'Placeholder'}
                        </label>
                        <input
                          type="text"
                          placeholder={isRTL ? 'مثال: أدخل اسمك' : 'e.g., Enter your name'}
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:border-[#D4AF37]/50 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          {isRTL ? 'إلزامي' : 'Required'}
                        </label>
                        <select
                          value={field.required ? "yes" : "no"}
                          onChange={(e) => updateField(field.id, { required: e.target.value === "yes" })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#D4AF37]/50 outline-none"
                        >
                          <option value="yes">{isRTL ? 'نعم' : 'Yes'}</option>
                          <option value="no">{isRTL ? 'لا' : 'No'}</option>
                        </select>
                      </div>
                    </div>

                    {field.type === 'select' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          {isRTL ? 'الخيارات (مفصولة بفواصل)' : 'Options (comma-separated)'}
                        </label>
                        <input
                          type="text"
                          placeholder={isRTL ? 'خيار 1, خيار 2, خيار 3' : 'Option 1, Option 2, Option 3'}
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => updateField(field.id, { 
                            options: e.target.value.split(',').map(o => o.trim()).filter(o => o) 
                          })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:border-[#D4AF37]/50 outline-none"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}

                <button
                  onClick={addField}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-lg px-4 py-3 text-white transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>{isRTL ? 'إضافة حقل' : 'Add Field'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="text-lg font-bold text-white">{isRTL ? 'معاينة' : 'Preview'}</h2>
                </div>

                {formName && (
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">{formName}</h3>
                    {formDescription && (
                      <p className="text-sm text-gray-400 mt-1">{formDescription}</p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-300">
                        {field.label || (isRTL ? 'حقل بدون عنوان' : 'Untitled Field')}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          placeholder={field.placeholder}
                          disabled
                          rows={3}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-gray-500 text-sm resize-none"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          disabled
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-gray-500 text-sm"
                        >
                          <option>{field.placeholder || (isRTL ? 'اختر خيار' : 'Select option')}</option>
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          disabled
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-gray-500 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {fields.length === 0 && (
                  <div className="text-center py-8 text-gray-600">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-700" />
                    <p className="text-sm">{isRTL ? 'لم تتم إضافة حقول بعد' : 'No fields added yet'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};