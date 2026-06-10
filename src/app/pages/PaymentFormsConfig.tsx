import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Zap, 
  Wallet, 
  Smartphone, 
  Link2,
  Settings,
  Save,
  Copy,
  Eye,
  QrCode,
  Phone,
  Split,
  CheckCircle
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';

type PaymentFormType = 'standard' | 'automation' | 'wallet_allocate' | 'ussd_qr' | 'payment_link';

interface PaymentFormConfig {
  id: string;
  type: PaymentFormType;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  settings: Record<string, any>;
}

const FORM_TYPES: Omit<PaymentFormConfig, 'id' | 'enabled' | 'settings'>[] = [
  {
    type: 'standard',
    name: 'Standard Form',
    description: 'Manual confirmation required - Full control over transaction approval',
    icon: CreditCard
  },
  {
    type: 'automation',
    name: 'Automation Form',
    description: 'Auto-confirm via workflow callbacks - Seamless integration with n8n',
    icon: Zap
  },
  {
    type: 'wallet_allocate',
    name: 'Wallet Allocate Form',
    description: 'Auto-split amount across multiple wallets based on capacity rules',
    icon: Split
  },
  {
    type: 'ussd_qr',
    name: 'USSD/QR Form',
    description: 'Generate QR code + "Press to Dial" USSD button for mobile payments',
    icon: QrCode
  },
  {
    type: 'payment_link',
    name: 'Payment Link Form',
    description: 'Hosted payment link - Share via SMS, Email, or WhatsApp',
    icon: Link2
  }
];

export const PaymentFormsConfig = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [selectedMerchant, setSelectedMerchant] = useState('merchant_001');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [forms, setForms] = useState<PaymentFormConfig[]>(
    FORM_TYPES.map((form, idx) => ({
      ...form,
      id: `form_${idx}`,
      enabled: idx < 3, // Enable first 3 by default
      settings: {}
    }))
  );

  const toggleForm = (id: string) => {
    setForms(prev => prev.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const handleSave = () => {
    toast.success(isRTL ? 'تم حفظ إعدادات نماذج الدفع بنجاح' : 'Payment forms configuration saved successfully');
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'تكوين نماذج الدفع' : 'Payment Forms Configuration'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL 
                ? 'إدارة أنواع نماذج الدفع المتاحة لكل تاجر وطريقة دفع'
                : 'Manage available payment form types per merchant and payment method'
              }
            </p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all"
          >
            <Save className="w-5 h-5" />
            <span>{isRTL ? 'حفظ التغييرات' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 font-medium mb-2 block">
                {isRTL ? 'التاجر' : 'Merchant'}
              </label>
              <select
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/5 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
              >
                <option value="merchant_001">Merchant 001 - Cairo Traders</option>
                <option value="merchant_002">Merchant 002 - Alexandria Shop</option>
                <option value="merchant_003">Merchant 003 - Giza Mall</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 font-medium mb-2 block">
                {isRTL ? 'طريقة الدفع' : 'Payment Method'}
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/5 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
              >
                <option value="card">💳 Card Payment</option>
                <option value="fawry">🇪🇬 Fawry</option>
                <option value="vodafone_cash">🇪🇬 Vodafone Cash</option>
                <option value="orange_money">🇪🇬 Orange Money</option>
                <option value="etisalat_cash">🇪🇬 Etisalat Cash</option>
                <option value="instapay">🇪🇬 InstaPay</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="usdt">₮ USDT (TRC20)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {forms.map((form) => {
            const Icon = form.icon;
            return (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#14181D]/40 backdrop-blur-xl border rounded-xl p-6 transition-all ${
                  form.enabled 
                    ? 'border-[#D4AF37]/30 shadow-lg shadow-[#D4AF37]/5' 
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      form.enabled 
                        ? 'bg-gradient-to-br from-[#D4AF37] to-[#C49F27]' 
                        : 'bg-[#0B0F14] border border-white/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${form.enabled ? 'text-[#0B0F14]' : 'text-gray-500'}`} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{form.name}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{form.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleForm(form.id)}
                    className={`w-12 h-6 rounded-full transition-all flex items-center ${
                      form.enabled
                        ? 'bg-green-500 justify-end'
                        : 'bg-gray-600 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 bg-white rounded-full mx-0.5 shadow-lg" />
                  </button>
                </div>

                {form.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-4 border-t border-white/10"
                  >
                    {form.type === 'standard' && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Manual approval required</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>3D Secure enabled</span>
                        </div>
                      </>
                    )}

                    {form.type === 'automation' && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Zap className="w-4 h-4 text-[#D4AF37]" />
                          <span>Connected to n8n workflow</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Webhook URL"
                          className="w-full bg-[#0B0F14] border border-white/5 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </>
                    )}

                    {form.type === 'wallet_allocate' && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Split className="w-4 h-4 text-blue-400" />
                          <span>Auto-split enabled (3 wallets)</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Wallet numbers masked for security
                        </div>
                      </>
                    )}

                    {form.type === 'ussd_qr' && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <QrCode className="w-4 h-4 text-purple-400" />
                          <span>QR code generation enabled</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>USSD dial button enabled</span>
                        </div>
                      </>
                    )}

                    {form.type === 'payment_link' && (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value="https://pay.press2pay.com/link/abc123"
                            readOnly
                            className="flex-1 bg-[#0B0F14] border border-white/5 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <button className="p-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg transition-colors">
                            <Copy className="w-4 h-4 text-[#D4AF37]" />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
          <Eye className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-blue-400 font-bold text-sm mb-1">
              {isRTL ? 'ملاحظة' : 'Note'}
            </h3>
            <p className="text-blue-300/80 text-xs leading-relaxed">
              {isRTL
                ? 'يمكن تفعيل أنواع متعددة من نماذج الدفع لنفس التاجر وطريقة الدفع. سيتم عرض جميع النماذج المفعلة للعميل عند الدفع.'
                : 'Multiple payment form types can be enabled for the same merchant and payment method. All enabled forms will be available to customers during checkout.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
