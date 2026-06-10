import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  Smartphone, 
  Lock, 
  ChevronRight, 
  CheckCircle2, 
  Wallet,
  ShieldCheck,
  Building2,
  Globe,
  ArrowLeft,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { useNavigate } from 'react-router';

// Payment Method Interface
interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  type: 'card' | 'wallet' | 'local';
}

export const CheckoutDemo = () => {
  const { language, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<'selection' | 'details' | 'processing' | 'success'>('selection');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  
  const paymentMethods: PaymentMethod[] = [
    { id: 'visa', name: 'Credit Card', logo: '💳', type: 'card' },
    { id: 'apple', name: 'Apple Pay', logo: '🍎', type: 'wallet' },
    { id: 'mada', name: 'MADA', logo: '🇸🇦', type: 'local' },
    { id: 'knet', name: 'KNET', logo: '🇰🇼', type: 'local' },
  ];

  const handleSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method.type === 'wallet') {
      setStep('processing');
      setTimeout(() => setStep('success'), 3000);
    } else {
      setStep('details');
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setTimeout(() => setStep('success'), 3000);
  };

  const reset = () => {
    setStep('selection');
    setSelectedMethod(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">P</span>
          </div>
          <span className="text-lg font-bold">Press2Pay</span>
          <span className="text-sm text-muted-foreground hidden sm:inline">Payment Kit Demo</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium hidden sm:flex"
          >
            Go to Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col items-center justify-center p-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {language === 'ar' ? 'تجربة الدفع الفاخرة' : 'Premium Checkout Kit'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'جرب واجهة الدفع المتكاملة الخاصة بنا' : 'Explore our high-end, conversion-optimized payment UI'}
            </p>
          </div>

          {/* The Checkout Box */}
          <div className="bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {step === 'selection' && (
                <motion.div 
                  key="selection"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-8 flex-1 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">P</span>
                      </div>
                      <span className="font-bold">Press2Pay</span>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">Order #88219</div>
                  </div>

                  <div className="mb-8">
                    <div className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-1">Payable Amount</div>
                    <div className="text-4xl font-black text-foreground">1,250.00 <span className="text-lg font-bold text-primary">AED</span></div>
                  </div>

                  <div className="space-y-3 flex-1">
                    <p className="text-sm font-bold text-muted-foreground mb-4">Select Payment Method</p>
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleSelect(method)}
                        className="w-full flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl hover:bg-primary/5 hover:border-primary/50 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                            {method.logo}
                          </div>
                          <span className="font-bold">{method.name}</span>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-4 opacity-50">
                    <Lock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure 256-bit SSL Encryption</span>
                  </div>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div 
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 flex-1 flex flex-col"
                >
                  <button onClick={() => setStep('selection')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back to selection
                  </button>

                  <div className="flex items-center gap-4 mb-8 p-4 bg-muted/30 border border-border rounded-2xl">
                    <div className="w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center text-2xl">
                      {selectedMethod?.logo}
                    </div>
                    <div>
                      <div className="font-bold">{selectedMethod?.name}</div>
                      <div className="text-xs text-muted-foreground">Safe & encrypted checkout</div>
                    </div>
                  </div>

                  <form onSubmit={handlePayment} className="space-y-4 flex-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Cardholder Name</label>
                      <input 
                        required
                        placeholder="e.g. Abdullah Ahmed"
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Card Number</label>
                      <div className="relative">
                        <input 
                          required
                          placeholder="•••• •••• •••• ••••"
                          className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3.5 pl-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Expiry</label>
                        <input required placeholder="MM/YY" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3.5 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">CVV</label>
                        <input required type="password" placeholder="•••" maxLength={3} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3.5 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 flex items-center justify-center gap-2"
                    >
                      <span>Complete Payment</span>
                      <Lock size={18} />
                    </button>
                  </form>

                  <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
                    <div className="flex items-center gap-1 font-bold text-[10px]">PCI <ShieldCheck size={12} /></div>
                    <div className="flex items-center gap-1 font-bold text-[10px]">SSL <Lock size={12} /></div>
                  </div>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck size={32} className="text-primary animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Securing your payment</h3>
                  <p className="text-muted-foreground text-sm max-w-[200px]">
                    Please do not refresh the page or click back button.
                  </p>
                  <div className="mt-12 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Globe size={14} className="animate-bounce" />
                    Connecting to {selectedMethod?.name}...
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 flex-1 flex flex-col items-center justify-center text-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20"
                  >
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2 text-emerald-500">Payment Successful!</h3>
                  <p className="text-muted-foreground mb-8">
                    Thank you for your business. Your receipt has been sent to your email.
                  </p>
                  
                  <div className="w-full bg-muted/30 border border-border rounded-2xl p-6 mb-8 text-left space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-mono font-bold">#PTX-7712904</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid with</span>
                      <span className="font-bold">{selectedMethod?.name} •••• 4242</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-border pt-3 mt-3">
                      <span>Total Amount</span>
                      <span className="text-primary">1,250.00 AED</span>
                    </div>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full bg-foreground text-background py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Features list */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => {
                const testToken = `TXN-${Date.now()}`;
                // For demo purposes, we'll just redirect to the VIP checkout with a dummy token
                // In a real app, this token would be generated by the backend
                navigate(`/ar/pay?token=${testToken}`);
              }}
              className="col-span-2 vip-button-primary flex items-center justify-center gap-2 mb-4"
            >
              <ShieldCheck size={20} />
              <span>{language === 'ar' ? 'فتح بوابة الدفع الـ VIP' : 'Open VIP Payment Gateway'}</span>
            </button>
            {[
              { icon: Smartphone, label: 'Mobile Optimized' },
              { icon: Building2, label: 'Bank-grade Security' },
              { icon: Wallet, label: 'Wallet Integration' },
              { icon: Globe, label: 'MENA Multi-currency' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <feature.icon size={16} />
                </div>
                <span className="text-xs font-bold">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};