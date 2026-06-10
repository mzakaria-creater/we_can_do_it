import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Link as LinkIcon,
  Copy,
  Shield,
  AlertCircle,
  Loader2,
  DollarSign,
  Building2,
  CreditCard
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { supabase, publicAnonKey } from '../../lib/supabase';
import { copyToClipboard } from '../../lib/clipboard';

type PaymentStatus = 'IDLE' | 'SENDING' | 'SENT' | 'COMPLETED' | 'FAILED';

interface PaymentData {
  walletNumber: string;
  amount: string;
  merchantCode: string;
  platformName: string;
  currency: string;
  paymentMethod: string;
}

export const VodafoneCashPayment = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [status, setStatus] = useState<PaymentStatus>('IDLE');
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [allocatedWallet, setAllocatedWallet] = useState<any>(null);
  const [fetchingWallet, setFetchingWallet] = useState(false);
  const [formData, setFormData] = useState<PaymentData>({
    walletNumber: '',
    amount: '1500',
    merchantCode: 'HFM',
    platformName: 'Goldex PSP',
    currency: 'EGP',
    paymentMethod: 'Vodafone Cash'
  });

  const fetchAllocatedWallet = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    try {
      setFetchingWallet(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const { data, error } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: { 'Authorization': authHeader },
        path: `make-server-46c3f42b/allocate-wallet?amount=${amount}&provider=Vodafone Cash`
      });

      if (!error && data?.success) {
        setAllocatedWallet(data.wallet);
      } else {
        setAllocatedWallet(null);
      }
    } catch (err) {
      console.error('Failed to fetch allocated wallet');
    } finally {
      setFetchingWallet(false);
    }
  };

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'amount') {
      fetchAllocatedWallet(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.walletNumber || formData.walletNumber.length < 11) {
      toast.error(isRTL ? 'رقم المحفظة غير صحيح' : 'Invalid wallet number');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error(isRTL ? 'المبلغ غير صحيح' : 'Invalid amount');
      return;
    }

    setStatus('SENDING');

    // Simulate API call
    setTimeout(() => {
      const generatedLink = `https://pay.goldexpsp.com/link/${Math.random().toString(36).substr(2, 9)}`;
      setPaymentLink(generatedLink);
      setStatus('SENT');
      toast.success(isRTL ? 'تم إرسال طلب الدفع بنجاح!' : 'Payment request sent successfully!');
    }, 2000);
  };

  const handleReset = () => {
    setFormData({
      walletNumber: '',
      amount: '1500',
      merchantCode: 'HFM',
      platformName: 'Goldex PSP',
      currency: 'EGP',
      paymentMethod: 'Vodafone Cash'
    });
    setStatus('IDLE');
    setPaymentLink('');
  };

  const handleCopyLink = async () => {
    if (paymentLink) {
      const success = await copyToClipboard(paymentLink);
      if (success) {
        toast.success(isRTL ? 'تم نسخ الرابط!' : 'Link copied!');
      } else {
        toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
      }
    }
  };

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'IDLE':
        return { 
          icon: Clock, 
          color: 'text-gray-400', 
          bg: 'bg-gray-500/20', 
          border: 'border-gray-500/30',
          label: isRTL ? 'في الانتظار' : 'Idle' 
        };
      case 'SENDING':
        return { 
          icon: Loader2, 
          color: 'text-blue-400', 
          bg: 'bg-blue-500/20', 
          border: 'border-blue-500/30',
          label: isRTL ? 'جاري الإرسال...' : 'Sending...',
          spin: true
        };
      case 'SENT':
        return { 
          icon: CheckCircle2, 
          color: 'text-green-400', 
          bg: 'bg-green-500/20', 
          border: 'border-green-500/30',
          label: isRTL ? 'تم الإرسال' : 'Sent' 
        };
      case 'COMPLETED':
        return { 
          icon: CheckCircle2, 
          color: 'text-green-400', 
          bg: 'bg-green-500/20', 
          border: 'border-green-500/30',
          label: isRTL ? 'مكتمل' : 'Completed' 
        };
      case 'FAILED':
        return { 
          icon: AlertCircle, 
          color: 'text-red-400', 
          bg: 'bg-red-500/20', 
          border: 'border-red-500/30',
          label: isRTL ? 'فشل' : 'Failed' 
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              {isRTL ? 'طلب دفع عبر Vodafone Cash' : 'Vodafone Cash Payment Request'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL 
                ? 'أدخل رقم المحفظة وسيتم إرسال طلب الدفع للعميل للتأكيد داخل تطبيق فودافون' 
                : 'Enter wallet number and a payment request will be sent to the customer for confirmation in the Vodafone app'
              }
            </p>
          </div>
          
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.border}`}
          >
            <StatusIcon className={`w-5 h-5 ${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''}`} />
            <span className={`text-sm font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6"
            >
              {/* Security Notice */}
              <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg flex items-start gap-3">
                <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-success">
                    {isRTL ? 'آمن • OTP/Pin داخل فودافون' : 'Secure • OTP/Pin inside Vodafone'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL 
                      ? 'التأكيد يتم داخل تطبيق فودافون بالرقم السري الخاص بالعميل' 
                      : 'Confirmation is done inside Vodafone app with customer\'s PIN'
                    }
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Wallet Number */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    {isRTL ? 'رقم المحفظة (Vodafone Cash)' : 'Wallet Number (Vodafone Cash)'}
                  </label>
                  <div className="relative">
                    <Smartphone className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <input
                      type="tel"
                      value={formData.walletNumber}
                      onChange={(e) => handleInputChange('walletNumber', e.target.value)}
                      placeholder={isRTL ? 'مثال: 01012345678' : 'Example: 01012345678'}
                      className={`w-full bg-input-background border border-border rounded-lg py-3 text-foreground placeholder:text-muted-foreground focus:border-destructive/50 focus:ring-2 focus:ring-destructive/10 outline-none transition-all ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      disabled={status === 'SENDING'}
                      maxLength={11}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? 'مثال: 01012345678' : 'Example: 01012345678'}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    {isRTL ? 'المبلغ' : 'Amount'}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="1500"
                      className={`w-full bg-input-background border border-border rounded-lg py-3 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      disabled={status === 'SENDING'}
                      min="1"
                    />
                  </div>
                  
                  {/* Assigned Wallet Display */}
                  <AnimatePresence>
                    {allocatedWallet && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">
                            {isRTL ? 'محفظة الاستقبال المخصصة' : 'Assigned Receiving Wallet'}
                          </p>
                          <p className="text-xl font-mono font-black text-primary">{allocatedWallet.number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">
                            {isRTL ? 'متاحة حالياً' : 'Currently Available'}
                          </p>
                          <p className="text-xs font-bold text-success">
                            {allocatedWallet.available.toLocaleString()} EGP
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Merchant Code */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    {isRTL ? 'كود الشركة / Merchant Code' : 'Merchant Code'}
                  </label>
                  <div className="relative">
                    <Building2 className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <input
                      type="text"
                      value={formData.merchantCode}
                      onChange={(e) => handleInputChange('merchantCode', e.target.value)}
                      placeholder="HFM"
                      className={`w-full bg-input-background border border-border rounded-lg py-3 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      disabled={status === 'SENDING'}
                    />
                  </div>
                </div>

                {/* Platform Name */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    {isRTL ? 'اسم المنصة' : 'Platform Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.platformName}
                    onChange={(e) => handleInputChange('platformName', e.target.value)}
                    className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    disabled={status === 'SENDING'}
                  />
                </div>

                {/* Currency & Payment Method (Read-only) */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">
                      {isRTL ? 'العملة' : 'Currency'}
                    </label>
                    <input
                      type="text"
                      value={formData.currency}
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-muted-foreground"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">
                      {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                    </label>
                    <input
                      type="text"
                      value={formData.paymentMethod}
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-muted-foreground"
                      disabled
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={status === 'SENDING'}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold px-6 py-3 rounded-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {status === 'SENDING' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{isRTL ? 'جاري الإرسال...' : 'Sending...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>{isRTL ? 'إرسال طلب الدفع' : 'Send Payment Request'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={status === 'SENDING'}
                    className="flex items-center gap-2 bg-muted/30 hover:bg-muted border border-border text-foreground px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span className="hidden sm:inline">{isRTL ? 'إعادة تعيين' : 'Reset'}</span>
                  </button>
                </div>
              </form>

              {/* Payment Link Result */}
              <AnimatePresence>
                {paymentLink && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-success/10 border border-success/30 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <LinkIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-success mb-2">
                          {isRTL ? 'رابط الدفع جاهز!' : 'Payment Link Ready!'}
                        </p>
                        <div className="flex items-center gap-2 bg-muted border border-border rounded px-3 py-2">
                          <code className="text-xs text-foreground flex-1 truncate">{paymentLink}</code>
                          <button
                            onClick={handleCopyLink}
                            className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* How it Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                {isRTL ? 'كيف يعمل؟' : 'How it Works?'}
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">1</span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      {isRTL 
                        ? 'بعد الإرسال سيتم إنشاء Payment Link' 
                        : 'After sending, a Payment Link will be created'
                      }
                    </p>
                    <code className="text-xs text-muted-foreground mt-1 block">
                      https://pay.press2pay.com/link/xxxx
                    </code>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">2</span>
                  </div>
                  <p className="text-sm text-foreground">
                    {isRTL 
                      ? 'العميل يفتح اللينك → يتحول لتطبيق فودافون' 
                      : 'Customer opens link → redirects to Vodafone app'
                    }
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">3</span>
                  </div>
                  <p className="text-sm text-foreground">
                    {isRTL 
                      ? 'يدخل الرقم السري → الدفع يتم' 
                      : 'Enters PIN → payment is completed'
                    }
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">4</span>
                  </div>
                  <p className="text-sm text-foreground">
                    {isRTL 
                      ? 'النظام يحدث تلقائياً' 
                      : 'System updates automatically'
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Current Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">
                {isRTL ? 'الحالة الحالية' : 'Current Status'}
              </h3>
              
              <div className={`p-4 rounded-lg ${statusConfig.bg} ${statusConfig.border} border`}>
                <div className="flex items-center gap-3 mb-3">
                  <StatusIcon className={`w-8 h-8 ${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''}`} />
                  <span className={`text-xl font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? 'الطلبات اليوم:' : 'Today\'s Requests:'}</span>
                    <span className="text-foreground font-bold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? 'معدل النجاح:' : 'Success Rate:'}</span>
                    <span className="text-success font-bold">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? 'متوسط الوقت:' : 'Avg Time:'}</span>
                    <span className="text-foreground font-bold">2.3s</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};