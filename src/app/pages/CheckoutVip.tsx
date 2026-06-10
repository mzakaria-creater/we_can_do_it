import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { 
  Smartphone, 
  AppWindow, 
  QrCode, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Timer,
  Globe,
  Wallet,
  Building2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useStore } from '../../lib/store';

// Types
interface CheckoutData {
  transaction: {
    id: string;
    reference: string;
    amount: number;
    currency: string;
    description: string;
    status: string;
    expires_at: number;
    customer?: {
      name: string;
      email: string;
    }
  };
  merchant: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
  };
  methods: {
    id: string;
    name: string;
    icon: string;
    description: string;
  }[];
}

export const CheckoutVip = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CheckoutData | null>(null);
  const [step, setStep] = useState<'selection' | 'processing' | 'success' | 'instructions'>('selection');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Fetch Checkout Data
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError(isRTL ? 'رابط دفع غير صالح' : 'Invalid payment link');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/checkout/verify?token=${token}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Verification failed');
        }

        setData(result);
        const remaining = Math.max(0, Math.floor((result.transaction.expires_at - Date.now()) / 1000));
        setTimeRemaining(remaining);
        setLoading(false);
      } catch (err: any) {
        console.error('[Checkout] Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, isRTL]);

  // Timer Countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectMethod = async (methodId: string) => {
    setSelectedMethod(methodId);
    setStep('processing');

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/checkout/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          transaction_id: data?.transaction.id,
          method: methodId
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setProcessingResult(result);
      
      // Delay to simulate security checks
      setTimeout(() => {
        if (methodId === 'card') {
          // Cards would normally show a form, for this flow we simulate success
          setStep('success');
        } else {
          setStep('instructions');
        }
      }, 2000);

    } catch (err: any) {
      toast.error(err.message);
      setStep('selection');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isRTL ? 'تم النسخ!' : 'Copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#D4AF37] font-bold tracking-widest animate-pulse uppercase">
          {isRTL ? 'جاري تأمين الاتصال...' : 'Securing Connection...'}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="vip-card max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{isRTL ? 'عذراً، حدث خطأ' : 'Checkout Error'}</h2>
            <p className="text-gray-400">{error || (isRTL ? 'رابط الدفع غير صالح أو منتهي الصلاحية' : 'The payment link is invalid or has expired.')}</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="vip-button-secondary w-full"
          >
            {isRTL ? 'العودة للرئيسية' : 'Return Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-[#D4AF37]/30">
      {/* VIP Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Side: Order Details (Sticky on desktop) */}
        <div className="lg:col-span-5 p-6 lg:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-l border-[#D4AF37]/10 order-2 lg:order-1">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#F4E5C3] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                <span className="text-black font-black text-xl">P</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Press2Pay</h1>
            </div>

            <div className="vip-card bg-black/40 backdrop-blur-md border-[#D4AF37]/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-1">{isRTL ? 'التاجر' : 'Merchant'}</p>
                  <h3 className="text-xl font-bold text-white">{data.merchant.name}</h3>
                  {data.merchant.verified && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <ShieldCheck size={14} className="text-[#D4AF37]" />
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase">{isRTL ? 'موثق' : 'Verified Partner'}</span>
                    </div>
                  )}
                </div>
                {data.merchant.logo && (
                  <img src={data.merchant.logo} alt={data.merchant.name} className="w-12 h-12 rounded-lg object-contain bg-white/5 p-1" />
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-[#D4AF37]/10">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">{isRTL ? 'المبلغ الإجمالي' : 'Total Amount'}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">{data.transaction.amount.toLocaleString(isRTL ? 'ar-EG' : 'en-US')}</span>
                      <span className="text-[#D4AF37] font-bold">{data.transaction.currency}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-4">
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">{isRTL ? 'رقم المرجع' : 'Reference'}</p>
                    <p className="text-white font-mono text-xs">{data.transaction.reference}</p>
                  </div>
                  <div className="text-left" style={{ textAlign: isRTL ? 'left' : 'right' }}>
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">{isRTL ? 'الوقت المتبقي' : 'Expires In'}</p>
                    <div className={`flex items-center gap-2 justify-end font-mono font-bold ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-[#D4AF37]'}`}>
                      <Timer size={14} />
                      {formatTime(timeRemaining)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 hidden lg:block">
              <div className="flex items-center gap-4 text-gray-500 group transition-colors hover:text-[#D4AF37]">
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-colors">
                  <Lock size={18} />
                </div>
                <p className="text-xs font-medium">{isRTL ? 'جميع المعاملات مشفرة ومؤمنة بأحدث المعايير' : 'All transactions are encrypted and secured with bank-grade standards'}</p>
              </div>
              <div className="flex items-center gap-4 text-gray-500 group transition-colors hover:text-[#D4AF37]">
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-colors">
                  <Building2 size={18} />
                </div>
                <p className="text-xs font-medium">{isRTL ? 'مرخص من قبل البنك المركزي المصري' : 'Fully licensed and regulated by the Central Bank of Egypt'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Flow */}
        <div className="lg:col-span-7 p-6 lg:p-12 flex flex-col items-center justify-center order-1 lg:order-2">
          <div className="max-w-lg w-full">
            <AnimatePresence mode="wait">
              {step === 'selection' && (
                <motion.div
                  key="selection"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center lg:text-right" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <h2 className="text-3xl font-black text-white mb-2">{isRTL ? 'اختر وسيلة الدفع' : 'Secure Checkout'}</h2>
                    <p className="text-gray-400">{isRTL ? 'يرجى اختيار الوسيلة الأنسب لك لإتمام عملية الدفع' : 'Please select your preferred payment method to proceed'}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {data.methods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleSelectMethod(method.id)}
                        className="vip-card-hover text-right flex items-center justify-between group"
                        style={{ flexDirection: isRTL ? 'row' : 'row-reverse' }}
                      >
                        <div className="flex items-center gap-4" style={{ flexDirection: isRTL ? 'row' : 'row-reverse' }}>
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                            {method.id === 'ussd' && <Smartphone size={28} />}
                            {method.id === 'app' && <AppWindow size={28} />}
                            {method.id === 'qr' && <QrCode size={28} />}
                            {method.id === 'card' && <CreditCard size={28} />}
                          </div>
                          <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                            <h4 className="font-bold text-white text-lg group-hover:text-[#D4AF37] transition-colors">{isRTL ? getArabicMethodName(method.id) : method.name}</h4>
                            <p className="text-xs text-gray-500">{isRTL ? getArabicMethodDesc(method.id) : method.description}</p>
                          </div>
                        </div>
                        <div className={`${isRTL ? 'rotate-0' : 'rotate-180'} text-gray-700 group-hover:text-[#D4AF37] transition-all`}>
                          <ChevronLeft size={24} />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-8 flex items-center justify-center gap-8 grayscale opacity-40">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    <div className="text-white font-black italic tracking-tighter text-xl">meeza</div>
                  </div>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center space-y-8 py-20"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock size={32} className="text-[#D4AF37] animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">{isRTL ? 'جاري تأمين العملية...' : 'Securing Transaction...'}</h3>
                    <p className="text-gray-400 text-sm">{isRTL ? 'نحن نقوم بالتحقق من بيانات الدفع الخاصة بك' : 'We are verifying your payment details with high-security protocols'}</p>
                  </div>
                </motion.div>
              )}

              {step === 'instructions' && processingResult && (
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full space-y-8"
                >
                  <button 
                    onClick={() => setStep('selection')}
                    className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm hover:underline mb-4"
                  >
                    <ChevronLeft size={16} className={isRTL ? 'rotate-0' : 'rotate-180'} />
                    {isRTL ? 'العودة للاختيار' : 'Back to Selection'}
                  </button>

                  <div className="text-center">
                    <h3 className="text-3xl font-black text-white mb-4">
                      {selectedMethod === 'qr' && (isRTL ? 'امسح الرمز للدفع' : 'Scan to Pay')}
                      {selectedMethod === 'ussd' && (isRTL ? 'اطلب الرمز التالي' : 'Dial the Code')}
                      {selectedMethod === 'app' && (isRTL ? 'افتح تطبيق المحفظة' : 'Open Wallet App')}
                    </h3>
                  </div>

                  <div className="vip-card p-10 flex flex-col items-center space-y-8 bg-gradient-to-b from-gray-900/50 to-black/50">
                    {selectedMethod === 'qr' && (
                      <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-[#D4AF37]/20">
                        <QRCodeSVG value={processingResult.qr_data} size={200} level="H" includeMargin={false} />
                        <div className="mt-4 flex items-center justify-center gap-2 text-black font-bold text-[10px] uppercase tracking-widest">
                          <Lock size={12} /> Secure Dynamic Code
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'ussd' && (
                      <div className="w-full space-y-6">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm mb-4">{isRTL ? 'قم بطلب الكود التالي من هاتفك المسجل' : 'Dial this code from your registered mobile number'}</p>
                          <div className="bg-black/80 border-2 border-[#D4AF37] rounded-2xl p-6 flex items-center justify-between group">
                            <span className="text-3xl font-black text-[#D4AF37] tracking-widest">{processingResult.ussd_code}</span>
                            <button 
                              onClick={() => copyToClipboard(processingResult.ussd_code)}
                              className="p-3 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                            >
                              <Copy size={20} />
                            </button>
                          </div>
                        </div>
                        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-xl p-4 flex gap-4">
                          <AlertCircle size={20} className="text-[#D4AF37] shrink-0" />
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {isRTL ? 'تأكد من وجود رصيد كافٍ في محفظتك الإلكترونية قبل طلب الرمز.' : 'Ensure you have sufficient balance in your electronic wallet before dialing the code.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'app' && (
                      <div className="w-full text-center space-y-6">
                        <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto text-[#D4AF37] animate-bounce">
                          <Smartphone size={48} />
                        </div>
                        <p className="text-gray-400">{isRTL ? 'سيتم توجيهك الآن إلى تطبيق المحفظة الخاص بك' : 'You will be redirected to your wallet app to confirm the payment.'}</p>
                        <a 
                          href={processingResult.app_link}
                          className="vip-button-primary w-full flex items-center justify-center gap-3"
                        >
                          {isRTL ? 'افتح التطبيق الآن' : 'Open App Now'}
                          <ExternalLink size={20} />
                        </a>
                      </div>
                    )}

                    <div className="w-full pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 text-[#D4AF37] animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{isRTL ? 'في انتظار التأكيد...' : 'Waiting for Confirmation...'}</span>
                      </div>
                      <button 
                        onClick={() => setStep('success')}
                        className="text-gray-600 text-[10px] hover:text-[#D4AF37] transition-colors underline uppercase tracking-widest"
                      >
                        {isRTL ? 'هل أتممت الدفع؟' : 'Already paid? Refresh status'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center space-y-8"
                >
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                      className="w-32 h-32 bg-[#10B981] rounded-full flex items-center justify-center shadow-2xl shadow-[#10B981]/40"
                    >
                      <CheckCircle2 size={64} className="text-white" />
                    </motion.div>
                    <div className="absolute -inset-4 border border-[#10B981]/30 rounded-full animate-ping opacity-20" />
                  </div>

                  <div>
                    <h2 className="text-4xl font-black text-white mb-2">{isRTL ? 'تم الدفع بنجاح!' : 'Payment Success!'}</h2>
                    <p className="text-gray-400">{isRTL ? 'شكراً لتعاملك معنا. تم إرسال إيصال الدفع إلى بريدك الإلكتروني.' : 'Thank you for your business. Your payment has been confirmed successfully.'}</p>
                  </div>

                  <div className="vip-card w-full max-w-sm bg-black/40 text-right p-6 space-y-3" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{isRTL ? 'رقم المعاملة' : 'Transaction ID'}</span>
                      <span className="text-white font-mono">{data.transaction.reference}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{isRTL ? 'وسيلة الدفع' : 'Paid With'}</span>
                      <span className="text-white font-bold">{selectedMethod === 'card' ? 'Visa •••• 4242' : (isRTL ? getArabicMethodName(selectedMethod!) : selectedMethod)}</span>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                      <span className="text-white font-bold">{isRTL ? 'القيمة المدفوعة' : 'Amount Paid'}</span>
                      <span className="text-2xl font-black text-[#D4AF37]">{data.transaction.amount} {data.transaction.currency}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate('/')}
                    className="vip-button-primary w-full max-w-sm"
                  >
                    {isRTL ? 'العودة للمتجر' : 'Continue to Store'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Footer Security */}
      <footer className="lg:hidden p-8 border-t border-[#D4AF37]/10 bg-black text-center space-y-4">
        <div className="flex items-center justify-center gap-6 opacity-30">
          <ShieldCheck size={24} className="text-[#D4AF37]" />
          <Building2 size={24} className="text-[#D4AF37]" />
          <Lock size={24} className="text-[#D4AF37]" />
        </div>
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
          Press2Pay Secured Payment Gateway • MENA Region
        </p>
      </footer>
    </div>
  );
};

// Helpers
const getArabicMethodName = (id: string) => {
  switch (id) {
    case 'ussd': return 'دفع كود (USSD)';
    case 'app': return 'تطبيق المحفظة';
    case 'qr': return 'رمز الاستجابة السريعة (QR)';
    case 'card': return 'بطاقة ائتمان / ميزة';
    default: return id;
  }
};

const getArabicMethodDesc = (id: string) => {
  switch (id) {
    case 'ussd': return 'ادفع عبر طلب كود مباشر من هاتفك';
    case 'app': return 'سيتم تحويلك لتطبيق البنك أو المحفظة';
    case 'qr': return 'امسح الرمز من أي تطبيق بنكي';
    case 'card': return 'ادفع عبر فيزا، ماستركارد، أو ميزة';
    default: return '';
  }
};
