import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { CreditCard, Smartphone, Building2, CheckCircle, AlertCircle, QrCode, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import wePayLogo from 'figma:asset/40b59f47a7a911cf6720a29e0f927f19cd79b1c2.png';

export function CheckoutTemplate2() {
  const { merchantId } = useParams();
  const [searchParams] = useSearchParams();
  
  const amount = searchParams.get('amount') || '1000';
  const currency = searchParams.get('currency') || 'EGP';
  const integration = searchParams.get('integration') || '';

  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      // Send message to parent window
      window.parent.postMessage({
        type: 'PAYMENT_SUCCESS',
        transaction: {
          id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          amount,
          currency,
          merchantId,
          timestamp: new Date().toISOString()
        }
      }, '*');

      toast.success('تم الدفع بنجاح! / Payment processed successfully!');
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#161b22] to-[#0b0f14] flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative bg-card/80 backdrop-blur-2xl border border-primary/20 rounded-3xl shadow-2xl shadow-primary/10 p-8 max-w-md w-full">
          {/* Success Icon with Glow */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-success/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center shadow-lg shadow-success/30">
              <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="text-center space-y-3 mb-6">
            <h2 className="text-3xl font-black bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
              Payment Successful!
            </h2>
            <p className="text-xl font-bold text-muted-foreground">
              تم الدفع بنجاح
            </p>
            <p className="text-foreground/80">
              Your payment of{' '}
              <span className="font-black text-primary text-xl">
                {amount} {currency}
              </span>{' '}
              has been processed.
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-muted/50 backdrop-blur-sm border border-primary/10 rounded-2xl p-5 mb-6">
            <p className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
              Transaction ID
            </p>
            <p className="font-mono text-base font-black text-foreground">
              TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
          </div>

          {/* Merchant Info */}
          {merchantId && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Merchant</p>
              <p className="font-bold text-foreground">{merchantId}</p>
            </div>
          )}

          <button
            onClick={() => window.close()}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-black rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            Close / إغلاق
          </button>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span className="font-medium">Secured by Press2Pay</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#161b22] to-[#0b0f14] flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative bg-card/80 backdrop-blur-2xl border border-primary/20 rounded-3xl shadow-2xl shadow-primary/10 p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Press2Pay
              </h1>
              <p className="text-sm font-bold text-muted-foreground mt-1">Secure Checkout</p>
            </div>
            {merchantId && (
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Merchant
                </p>
                <p className="font-black text-foreground">{merchantId}</p>
              </div>
            )}
          </div>

          {/* Amount Display with Glassmorphism */}
          <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-2xl p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div className="relative">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Amount Due / المبلغ المستحق
              </p>
              <p className="text-5xl font-black text-primary mb-1">
                {amount}
              </p>
              <p className="text-xl font-bold text-primary/80">{currency}</p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="text-xl font-black text-foreground mb-4">
            Select Payment Method / اختر طريقة الدفع
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                paymentMethod === 'card'
                  ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/20'
                  : 'border-border hover:border-primary/50 bg-muted/30'
              }`}
            >
              <CreditCard
                className={`w-10 h-10 mx-auto mb-3 transition-all duration-300 ${
                  paymentMethod === 'card' ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary'
                }`}
              />
              <p
                className={`text-sm font-bold transition-all ${
                  paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                Card
              </p>
              <p className="text-xs text-muted-foreground mt-1">بطاقة</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('mobile')}
              className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                paymentMethod === 'mobile'
                  ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/20'
                  : 'border-border hover:border-primary/50 bg-muted/30'
              }`}
            >
              <Smartphone
                className={`w-10 h-10 mx-auto mb-3 transition-all duration-300 ${
                  paymentMethod === 'mobile' ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary'
                }`}
              />
              <p
                className={`text-sm font-bold transition-all ${
                  paymentMethod === 'mobile' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                Mobile
              </p>
              <p className="text-xs text-muted-foreground mt-1">محفظة</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                paymentMethod === 'bank'
                  ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/20'
                  : 'border-border hover:border-primary/50 bg-muted/30'
              }`}
            >
              <Building2
                className={`w-10 h-10 mx-auto mb-3 transition-all duration-300 ${
                  paymentMethod === 'bank' ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary'
                }`}
              />
              <p
                className={`text-sm font-bold transition-all ${
                  paymentMethod === 'bank' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                Bank
              </p>
              <p className="text-xs text-muted-foreground mt-1">بنك</p>
            </button>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {paymentMethod === 'card' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Card Number / رقم البطاقة
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Cardholder Name / اسم حامل البطاقة
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Expiry / الصلاحية
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'mobile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center justify-center p-8 bg-muted/30 border-2 border-dashed border-primary/30 rounded-2xl">
                <p className="text-sm font-bold text-foreground mb-5">
                  Scan to Pay / امسح للدفع
                </p>
                <div className="bg-white p-4 rounded-2xl shadow-lg relative overflow-hidden group">
                  <QRCodeGenerator
                    value={`PRESS2PAY:PAY?amount=${amount}&ref=P2P-${Math.random().toString(36).substr(2, 6).toUpperCase()}`}
                    size={200}
                    showDownload={false}
                    showCopy={false}
                    fgColor="#0b0f14"
                  />
                  {/* Subtle WePay Branding in scan area */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white p-1 rounded-lg shadow-sm border border-border">
                    <ImageWithFallback src={wePayLogo} alt="WE Pay" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      <div className="w-6 h-6 rounded overflow-hidden">
                        <ImageWithFallback src={wePayLogo} alt="WE Pay" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-xs font-bold text-foreground/80">WE Pay</span>
                   </div>
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      <span className="text-xs font-bold text-foreground/80">Vodafone Cash</span>
                   </div>
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      <span className="text-xs font-bold text-foreground/80">Fawry Pay</span>
                   </div>
                </div>
                <p className="text-xs text-muted-foreground mt-5 text-center max-w-sm">
                  Works with WE Pay, Vodafone Cash, Fawry, and all Egyptian mobile wallets.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-bold">
                    Or enter number / أو أدخل الرقم
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Mobile Wallet Number / رقم المحفظة
                </label>
                <div className="relative group">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01X XXXX XXXX"
                    className="w-full pl-12 pr-4 py-3.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'bank' && (
            <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-sm font-bold text-accent mb-3">
                Bank Transfer Instructions / تعليمات التحويل البنكي
              </p>
              <p className="text-sm text-foreground/80">
                Please transfer <span className="font-black text-primary">{amount} {currency}</span> to the
                account details that will be provided after clicking "Proceed to Payment".
              </p>
            </div>
          )}

          {paymentMethod && (
            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:from-muted disabled:to-muted text-white font-black rounded-xl shadow-lg shadow-primary/30 disabled:shadow-none transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing... / جاري المعالجة
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay {amount} {currency} / ادفع الآن
                </>
              )}
            </button>
          )}
        </form>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span className="font-medium">Secured by Press2Pay • 256-bit SSL Encryption</span>
        </div>
      </div>
    </div>
  );
}
