import React, { useState } from 'react';
import { X, Ticket, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';

interface OpenTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string;
  merchantId?: string;
}

export const OpenTicketModal: React.FC<OpenTicketModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  merchantId,
}) => {
  const user = useStore((state) => state.user);
  const language = useStore((state) => state.language);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'general' as 'general' | 'transaction' | 'technical' | 'billing' | 'account',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      return;
    }

    if (!formData.subject || !formData.description) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/tickets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            subject: formData.subject,
            description: formData.description,
            priority: formData.priority,
            category: formData.category,
            transactionId: transactionId || null,
            merchantId: merchantId || null,
            createdBy: user.id,
            createdByName: user.name,
            createdByEmail: user.email,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(
          language === 'ar' 
            ? `تم إنشاء التذكرة ${result.data.ticketNumber} بنجاح` 
            : `Ticket ${result.data.ticketNumber} created successfully`
        );
        setFormData({
          subject: '',
          description: '',
          priority: 'medium',
          category: 'general',
        });
        onClose();
      } else {
        throw new Error(result.error || 'Failed to create ticket');
      }
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error(
        language === 'ar' 
          ? 'فشل في إنشاء التذكرة' 
          : 'Failed to create ticket'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-primary/20 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {language === 'ar' ? 'فتح تذكرة دعم' : 'Open Support Ticket'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'سيتم تعيين تذكرتك تلقائيًا لأحد موظفي الدعم'
                      : 'Your ticket will be auto-assigned to a support agent'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Transaction/Merchant Info */}
            {(transactionId || merchantId) && (
              <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  {transactionId && (
                    <p>
                      <span className="font-medium">
                        {language === 'ar' ? 'معرف المعاملة: ' : 'Transaction ID: '}
                      </span>
                      <span className="text-muted-foreground">{transactionId}</span>
                    </p>
                  )}
                  {merchantId && (
                    <p>
                      <span className="font-medium">
                        {language === 'ar' ? 'معرف التاجر: ' : 'Merchant ID: '}
                      </span>
                      <span className="text-muted-foreground">{merchantId}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ar' ? 'الموضوع' : 'Subject'} *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={language === 'ar' ? 'أدخل موضوع التذكرة...' : 'Enter ticket subject...'}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'الفئة' : 'Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="general">{language === 'ar' ? 'عام' : 'General'}</option>
                  <option value="transaction">{language === 'ar' ? 'معاملة' : 'Transaction'}</option>
                  <option value="technical">{language === 'ar' ? 'تقني' : 'Technical'}</option>
                  <option value="billing">{language === 'ar' ? 'فواتير' : 'Billing'}</option>
                  <option value="account">{language === 'ar' ? 'حساب' : 'Account'}</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'الأولوية' : 'Priority'}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="low">{language === 'ar' ? 'منخفضة' : 'Low'}</option>
                  <option value="medium">{language === 'ar' ? 'متوسطة' : 'Medium'}</option>
                  <option value="high">{language === 'ar' ? 'عالية' : 'High'}</option>
                  <option value="urgent">{language === 'ar' ? 'عاجلة' : 'Urgent'}</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ar' ? 'الوصف' : 'Description'} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'ar' ? 'اشرح المشكلة بالتفصيل...' : 'Describe your issue in detail...'}
                rows={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors"
                disabled={loading}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...')
                  : (language === 'ar' ? 'إنشاء التذكرة' : 'Create Ticket')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
