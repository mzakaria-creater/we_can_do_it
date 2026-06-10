import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { getFormById, incrementFormUsage } from '../lib/form-service';
import { transactionService } from '../lib/transaction-service';
import type { PaymentForm } from '../lib/form-service';

export const StandaloneForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<PaymentForm | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    if (id) {
      const foundForm = getFormById(id);
      if (foundForm) {
        setForm(foundForm);
        // Initialize with default values
        const initialData: Record<string, string> = {};
        foundForm.fields.forEach(field => {
          if (field.mapping?.assignmentMethod === 'prefilled' && field.mapping.defaultValue) {
            initialData[field.id] = field.mapping.defaultValue;
          }
        });
        setFormData(initialData);
      }
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;

    const missingFields = form.fields.filter(field => 
      field.required && !formData[field.id]?.trim()
    );

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const mappedData: Record<string, any> = {};
      form.fields.forEach(field => {
        if (field.mapping && field.mapping.paymentFormField !== 'custom') {
          mappedData[field.mapping.paymentFormField] = formData[field.id];
        }
      });

      const merchantRef = mappedData.merchant_reference || `${form.prefixCode}-${Date.now()}`;

      const transaction = transactionService.createFormTransaction({
        msisdn: mappedData.customer_phone || '01000000000',
        amount: parseFloat(mappedData.amount || '0'),
        merchantRef,
        formId: form.id,
        formPrefixCode: form.prefixCode,
        formData,
        merchantAccount: form.merchantAccount,
        paymentMethod: form.paymentMethod,
        operator: mappedData.wallet_operator,
      });

      incrementFormUsage(form.id);

      setTransactionId(transaction.id);
      setIsSubmitted(true);
      toast.success('Payment form submitted successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F14] via-[#14181D] to-[#0B0F14] flex items-center justify-center p-4">
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 max-w-2xl w-full">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading payment form...</p>
          </div>
        </div>
      </div>
    );
  }

  // Inactive form state
  if (!form.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F14] via-[#14181D] to-[#0B0F14] flex items-center justify-center p-4">
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 max-w-2xl w-full">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Form Inactive
            </h2>
            <p className="text-gray-400">
              This payment form is currently inactive. Please contact the merchant for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F14] via-[#14181D] to-[#0B0F14] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 max-w-2xl w-full"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Payment Submitted!
            </h2>
            <p className="text-gray-400 mb-6">
              Your payment form has been submitted successfully.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 w-full">
              <p className="text-sm text-blue-400 mb-2">Transaction ID</p>
              <code className="text-lg font-mono font-bold text-blue-300">
                {transactionId}
              </code>
            </div>
            <div className="space-y-2 text-sm text-gray-400 mb-8">
              <p>✓ Form: {form.name}</p>
              <p>✓ Merchant: {form.merchantAccount}</p>
              <p>✓ Reference: {form.prefixCode}</p>
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({});
                setTransactionId("");
              }}
              className="bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-8 py-4 rounded-lg transition-all"
            >
              Submit Another Payment
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F14] via-[#14181D] to-[#0B0F14]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#14181D]/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            {/* Form Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xl">💳</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-white truncate">{form.name}</h1>
                <p className="text-xs text-gray-500 font-mono truncate">
                  {form.merchantAccount}
                </p>
              </div>
            </div>

            {/* Form Code */}
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500">Form Code</p>
              <code className="text-xs font-mono font-semibold text-white">
                {form.prefixCode}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {form.description && (
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <p className="text-gray-300">{form.description}</p>
            </div>
          )}
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {form.fields.map((field) => {
                // Skip hidden fields
                if (field.mapping?.assignmentType === 'hidden') {
                  return null;
                }

                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                      {field.mapping && field.mapping.paymentFormField !== 'custom' && (
                        <span className="ml-2 text-xs text-gray-500">
                          {field.mapping.assignmentMethod === 'auto' && '🤖 Auto-generated'}
                          {field.mapping.assignmentMethod === 'prefilled' && '📝 Pre-filled'}
                        </span>
                      )}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder}
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        rows={4}
                        disabled={field.mapping?.assignmentMethod === 'auto'}
                        className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        required={field.required}
                        disabled={field.mapping?.assignmentMethod === 'auto'}
                        className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{field.placeholder || 'Select an option'}</option>
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
                        disabled={field.mapping?.assignmentMethod === 'auto'}
                        className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    )}
                  </div>
                );
              })}

              <div className="pt-4 border-t border-white/10">
                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-4 rounded-lg text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Payment
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  🔒 Secure Payment Gateway
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};