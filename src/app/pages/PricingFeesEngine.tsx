import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Calculator,
  Save,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Info
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';

interface FeeTier {
  id: string;
  minVolume: number;
  maxVolume: number;
  percentage: number;
  fixedFee: number;
}

interface FeeSplit {
  platformFee: number; // %
  providerFee: number; // %
  brokerCommission: number; // %
  merchantNet: number; // % (calculated)
}

interface ConversionRule {
  currency: string;
  rate: number;
  enabled: boolean;
}

interface PricingConfig {
  merchantId: string;
  merchantName: string;
  feeTiers: FeeTier[];
  feeSplit: FeeSplit;
  conversionRules: ConversionRule[];
}

export const PricingFeesEngine = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [selectedMerchant, setSelectedMerchant] = useState('merchant_001');
  const [config, setConfig] = useState<PricingConfig>({
    merchantId: 'merchant_001',
    merchantName: 'Cairo Traders',
    feeTiers: [
      { id: '1', minVolume: 0, maxVolume: 10000, percentage: 3.5, fixedFee: 5 },
      { id: '2', minVolume: 10001, maxVolume: 50000, percentage: 3.0, fixedFee: 5 },
      { id: '3', minVolume: 50001, maxVolume: 100000, percentage: 2.5, fixedFee: 5 },
      { id: '4', minVolume: 100001, maxVolume: 999999999, percentage: 2.0, fixedFee: 5 },
    ],
    feeSplit: {
      platformFee: 1.0,
      providerFee: 1.5,
      brokerCommission: 0.5,
      merchantNet: 97.0
    },
    conversionRules: [
      { currency: 'EGP', rate: 1.0, enabled: true },
      { currency: 'USDT', rate: 30.5, enabled: true }
    ]
  });

  const addTier = () => {
    const lastTier = config.feeTiers[config.feeTiers.length - 1];
    const newTier: FeeTier = {
      id: Date.now().toString(),
      minVolume: lastTier.maxVolume + 1,
      maxVolume: lastTier.maxVolume + 50000,
      percentage: 2.0,
      fixedFee: 5
    };
    setConfig(prev => ({
      ...prev,
      feeTiers: [...prev.feeTiers, newTier]
    }));
  };

  const removeTier = (id: string) => {
    if (config.feeTiers.length <= 1) {
      toast.error(isRTL ? 'يجب أن يكون هناك مستوى واحد على الأقل' : 'At least one tier must exist');
      return;
    }
    setConfig(prev => ({
      ...prev,
      feeTiers: prev.feeTiers.filter(t => t.id !== id)
    }));
  };

  const updateTier = (id: string, field: keyof FeeTier, value: number) => {
    setConfig(prev => ({
      ...prev,
      feeTiers: prev.feeTiers.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const updateFeeSplit = (field: keyof FeeSplit, value: number) => {
    setConfig(prev => {
      const newSplit = { ...prev.feeSplit, [field]: value };
      // Auto-calculate merchant net
      if (field !== 'merchantNet') {
        newSplit.merchantNet = 100 - (newSplit.platformFee + newSplit.providerFee + newSplit.brokerCommission);
      }
      return { ...prev, feeSplit: newSplit };
    });
  };

  const updateConversionRate = (currency: string, rate: number) => {
    setConfig(prev => ({
      ...prev,
      conversionRules: prev.conversionRules.map(r => 
        r.currency === currency ? { ...r, rate } : r
      )
    }));
  };

  const toggleConversion = (currency: string) => {
    setConfig(prev => ({
      ...prev,
      conversionRules: prev.conversionRules.map(r => 
        r.currency === currency ? { ...r, enabled: !r.enabled } : r
      )
    }));
  };

  const calculateExampleFee = (amount: number) => {
    const tier = config.feeTiers.find(t => amount >= t.minVolume && amount <= t.maxVolume);
    if (!tier) return { total: 0, breakdown: {} };

    const percentageFee = (amount * tier.percentage) / 100;
    const totalFee = percentageFee + tier.fixedFee;
    
    return {
      total: totalFee,
      breakdown: {
        percentage: percentageFee,
        fixed: tier.fixedFee,
        platformFee: (totalFee * config.feeSplit.platformFee) / 100,
        providerFee: (totalFee * config.feeSplit.providerFee) / 100,
        brokerCommission: (totalFee * config.feeSplit.brokerCommission) / 100,
        merchantNet: amount - totalFee
      }
    };
  };

  const handleSave = () => {
    toast.success(isRTL ? 'تم حفظ إعدادات التسعير والرسوم بنجاح' : 'Pricing & fees configuration saved successfully');
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'محرك التسعير والرسوم' : 'Pricing & Fees Engine'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL 
                ? 'إدارة التسعير المتدرج والرسوم وتوزيع العمولات لكل تاجر'
                : 'Manage tiered pricing, fees, and commission splits per merchant'
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

        {/* Merchant Selector */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <label className="text-sm text-gray-400 font-medium mb-2 block">
            {isRTL ? 'التاجر' : 'Merchant'}
          </label>
          <select
            value={selectedMerchant}
            onChange={(e) => setSelectedMerchant(e.target.value)}
            className="w-full md:w-96 bg-[#0B0F14] border border-white/5 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
          >
            <option value="merchant_001">Merchant 001 - Cairo Traders</option>
            <option value="merchant_002">Merchant 002 - Alexandria Shop</option>
            <option value="merchant_003">Merchant 003 - Giza Mall</option>
          </select>
        </div>

        {/* Tiered Pricing */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
              <div>
                <h2 className="text-xl font-bold text-white">{isRTL ? 'التسعير المتدرج' : 'Tiered Pricing'}</h2>
                <p className="text-sm text-gray-400">{isRTL ? 'رسوم مرنة حسب حجم المعاملات' : 'Flexible fees based on transaction volume'}</p>
              </div>
            </div>
            <button
              onClick={addTier}
              className="flex items-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-2 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">{isRTL ? 'إضافة مستوى' : 'Add Tier'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0B0F14]/60">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'الحد الأدنى' : 'Min Volume'}</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'الحد الأقصى' : 'Max Volume'}</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'النسبة المئوية' : 'Percentage'}</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'رسوم ثابتة' : 'Fixed Fee'}</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {config.feeTiers.map((tier, idx) => (
                  <tr key={tier.id} className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-[#0B0F14]/20' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={tier.minVolume}
                        onChange={(e) => updateTier(tier.id, 'minVolume', parseFloat(e.target.value))}
                        className="w-32 bg-[#0B0F14] border border-white/5 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={tier.maxVolume}
                        onChange={(e) => updateTier(tier.id, 'maxVolume', parseFloat(e.target.value))}
                        className="w-32 bg-[#0B0F14] border border-white/5 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={tier.percentage}
                          onChange={(e) => updateTier(tier.id, 'percentage', parseFloat(e.target.value))}
                          className="w-20 bg-[#0B0F14] border border-white/5 rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <span className="text-gray-400">%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">EGP</span>
                        <input
                          type="number"
                          step="0.1"
                          value={tier.fixedFee}
                          onChange={(e) => updateTier(tier.id, 'fixedFee', parseFloat(e.target.value))}
                          className="w-20 bg-[#0B0F14] border border-white/5 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => removeTier(tier.id)}
                          disabled={config.feeTiers.length <= 1}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fee Split */}
          <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-6 h-6 text-[#D4AF37]" />
              <div>
                <h2 className="text-xl font-bold text-white">{isRTL ? 'توزيع الرسوم' : 'Fee Split'}</h2>
                <p className="text-sm text-gray-400">{isRTL ? 'توزيع العمولات بين الأطراف' : 'Commission distribution'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">{isRTL ? 'رسوم المنصة' : 'Platform Fee'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={config.feeSplit.platformFee}
                    onChange={(e) => updateFeeSplit('platformFee', parseFloat(e.target.value))}
                    className="flex-1 bg-[#0B0F14] border border-white/5 rounded-lg px-4 py-3 text-white text-sm"
                  />
                  <span className="text-gray-400 text-sm font-medium">%</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">{isRTL ? 'رسوم المزود' : 'Provider Fee'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={config.feeSplit.providerFee}
                    onChange={(e) => updateFeeSplit('providerFee', parseFloat(e.target.value))}
                    className="flex-1 bg-[#0B0F14] border border-white/5 rounded-lg px-4 py-3 text-white text-sm"
                  />
                  <span className="text-gray-400 text-sm font-medium">%</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">{isRTL ? 'عمولة الوسيط' : 'Broker Commission'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={config.feeSplit.brokerCommission}
                    onChange={(e) => updateFeeSplit('brokerCommission', parseFloat(e.target.value))}
                    className="flex-1 bg-[#0B0F14] border border-white/5 rounded-lg px-4 py-3 text-white text-sm"
                  />
                  <span className="text-gray-400 text-sm font-medium">%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="text-sm text-gray-400 font-medium mb-2 block">{isRTL ? 'صافي التاجر' : 'Merchant Net'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.feeSplit.merchantNet.toFixed(2)}
                    readOnly
                    className="flex-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-[#D4AF37] text-sm font-bold"
                  />
                  <span className="text-[#D4AF37] text-sm font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Rules */}
          <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-6 h-6 text-[#D4AF37]" />
              <div>
                <h2 className="text-xl font-bold text-white">{isRTL ? 'قواعد التحويل' : 'Conversion Rules'}</h2>
                <p className="text-sm text-gray-400">{isRTL ? 'أسعار تحويل العملات' : 'Currency conversion rates'}</p>
              </div>
            </div>

            <div className="space-y-4">
              {config.conversionRules.map((rule) => (
                <div key={rule.currency} className={`p-4 rounded-lg border ${rule.enabled ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20' : 'bg-[#0B0F14]/40 border-white/5'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{rule.currency}</span>
                      <span className="text-xs text-gray-500 px-2 py-1 bg-[#0B0F14] rounded">
                        {rule.currency === 'EGP' ? '🇪🇬' : '₮'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleConversion(rule.currency)}
                      className={`w-12 h-6 rounded-full transition-all flex items-center ${
                        rule.enabled
                          ? 'bg-green-500 justify-end'
                          : 'bg-gray-600 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 bg-white rounded-full mx-0.5 shadow-lg" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1 block">{isRTL ? 'سعر الصرف' : 'Exchange Rate'}</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">1 USD =</span>
                      <input
                        type="number"
                        step="0.01"
                        value={rule.rate}
                        onChange={(e) => updateConversionRate(rule.currency, parseFloat(e.target.value))}
                        disabled={!rule.enabled}
                        className="flex-1 bg-[#0B0F14] border border-white/5 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-400">{rule.currency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fee Calculator Example */}
        <div className="bg-gradient-to-br from-[#D4AF37]/10 via-[#0B0F14] to-[#0B0F14] border border-[#D4AF37]/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-[#D4AF37]" />
            <h3 className="text-lg font-bold text-white">{isRTL ? 'مثال على حساب الرسوم' : 'Fee Calculation Example'}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[1000, 25000, 75000].map(amount => {
              const calc = calculateExampleFee(amount);
              return (
                <div key={amount} className="bg-[#14181D]/60 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <div className="text-[#D4AF37] font-bold text-lg mb-3">{amount.toLocaleString()} EGP</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Fee:</span>
                      <span className="text-white font-medium">{calc.total.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform:</span>
                      <span className="text-white">{calc.breakdown.platformFee?.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Provider:</span>
                      <span className="text-white">{calc.breakdown.providerFee?.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Broker:</span>
                      <span className="text-white">{calc.breakdown.brokerCommission?.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-[#D4AF37] font-medium">Merchant Net:</span>
                      <span className="text-[#D4AF37] font-bold">{calc.breakdown.merchantNet?.toFixed(2)} EGP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
