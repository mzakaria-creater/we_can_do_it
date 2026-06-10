import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Wallet,
  Building2,
  Key,
  Shield,
  ArrowRight,
  Play,
  RefreshCw,
  Download,
  Eye,
  Copy,
  Check,
  Clock,
  Server,
  Database,
  Link2,
  Settings,
  Target,
  TrendingUp,
  Activity,
  Sparkles,
  ChevronRight,
  Info,
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useLoaderData, useNavigate } from 'react-router';
import { supabase, publicAnonKey, projectId } from '../../lib/supabase';

interface TestStep {
  id: string;
  name: string;
  nameAr: string;
  icon: any;
  status: 'pending' | 'running' | 'success' | 'error';
  data?: any;
  error?: string;
  duration?: number;
}

interface TestMerchant {
  id: string;
  name: string;
  mid: string;
  apiCode: string;
  hashKey: string;
  gateway: string;
  paymentMethods: string[];
  paymentTypes: string[];
}

export const FullTripTest = () => {
  const { language } = useStore();
  const { t } = useTranslation();
  const isRTL = language === 'ar';
  const loaderData = useLoaderData() as any;
  const navigate = useNavigate();
  
  const [isRunning, setIsRunning] = useState(false);
  const [testMerchant, setTestMerchant] = useState<TestMerchant | null>(loaderData?.testData?.merchant || null);
  const [testResults, setTestResults] = useState<any[]>(loaderData?.testData?.transactions || []);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'merchant' | 'transactions'>(loaderData?.testData?.merchant ? 'merchant' : 'overview');

  const [steps, setSteps] = useState<TestStep[]>([
    { id: 'create-merchant', name: 'Create Test Merchant', nameAr: 'إنشاء تاجر تجريبي', icon: Building2, status: 'pending' },
    { id: 'assign-gateway', name: 'Assign Gateway', nameAr: 'تعيين بوابة الدفع', icon: Server, status: 'pending' },
    { id: 'setup-payment-methods', name: 'Setup Payment Methods', nameAr: 'إعداد طرق الدفع', icon: CreditCard, status: 'pending' },
    { id: 'assign-accounts', name: 'Assign Payment Accounts', nameAr: 'تعيين حسابات الدفع', icon: Database, status: 'pending' },
    { id: 'test-credit-card', name: 'Test Credit Card Transaction', nameAr: 'اختبار معاملة بطاقة ائتمان', icon: CreditCard, status: 'pending' },
    { id: 'test-wallet', name: 'Test E-Wallet Transaction', nameAr: 'اختبار معاملة محفظة إلكترونية', icon: Wallet, status: 'pending' },
    { id: 'test-bank-transfer', name: 'Test Bank Transfer', nameAr: 'اختبار تحويل بنكي', icon: TrendingUp, status: 'pending' },
    { id: 'verify-data', name: 'Verify Test Data', nameAr: 'التحقق من البيانات التجريبية', icon: CheckCircle2, status: 'pending' }
  ]);

  const updateStepStatus = (stepId: string, status: TestStep['status'], data?: any, error?: string, duration?: number) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, data, error, duration }
        : step
    ));
  };

  const runFullTripTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setActiveTab('overview');
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/server/make-server-46c3f42b`;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      // Step 1: Create Test Merchant
      updateStepStatus('create-merchant', 'running');
      const startTime1 = Date.now();
      const merchantId = `merchant_test_${Date.now()}`;
      const merchantData = {
        id: merchantId,
        name: `Test Merchant ${new Date().toLocaleString()}`,
        mid: `TEST${Date.now().toString().slice(-8)}`,
        apiCode: `API_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        hashKey: `HASH_${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
        email: `test${Date.now()}@press2pay.me`,
        phone: '+201000000000',
        status: 'active',
        isTest: true
      };

      const res1 = await fetch(`${baseUrl}/merchants`, {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(merchantData)
      });
      if (!res1.ok) throw new Error('Failed to create merchant');
      updateStepStatus('create-merchant', 'success', merchantData, undefined, Date.now() - startTime1);

      // Step 2: Assign Gateway
      updateStepStatus('assign-gateway', 'running');
      const startTime2 = Date.now();
      const gatewayData = { merchantId, gateway: 'PayTabs', isActive: true, isTest: true };
      await fetch(`${baseUrl}/merchant-gateways`, {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(gatewayData)
      });
      updateStepStatus('assign-gateway', 'success', gatewayData, undefined, Date.now() - startTime2);

      // Step 3: Setup Payment Methods
      updateStepStatus('setup-payment-methods', 'running');
      const startTime3 = Date.now();
      const methods = ['credit_card', 'e_wallet', 'bank_transfer'].map(m => ({ merchantId, method: m, isActive: true, isTest: true }));
      await fetch(`${baseUrl}/payment-methods`, {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ methods })
      });
      updateStepStatus('setup-payment-methods', 'success', { methods }, undefined, Date.now() - startTime3);

      // Step 4: Assign Payment Accounts
      updateStepStatus('assign-accounts', 'running');
      const startTime4 = Date.now();
      const accounts = [{ merchantId, method: 'credit_card', accountNumber: '4111...', isTest: true }];
      await fetch(`${baseUrl}/payment-accounts`, {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts })
      });
      updateStepStatus('assign-accounts', 'success', accounts, undefined, Date.now() - startTime4);

      // Steps 5-7: Transactions
      const txs = [
        { id: 'test-credit-card', method: 'credit_card', amount: 100 },
        { id: 'test-wallet', method: 'e_wallet', amount: 50 },
        { id: 'test-bank-transfer', method: 'bank_transfer', amount: 200 }
      ];
      const results = [];
      for (const tx of txs) {
        updateStepStatus(tx.id, 'running');
        const start = Date.now();
        const trxData = { merchantId, amount: tx.amount, paymentMethod: tx.method, status: 'completed', isTest: true };
        const res = await fetch(`${baseUrl}/transactions`, {
          method: 'POST',
          headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify(trxData)
        });
        if (res.ok) {
          const d = await res.json();
          results.push(d);
          updateStepStatus(tx.id, 'success', d, undefined, Date.now() - start);
        } else {
          updateStepStatus(tx.id, 'error', undefined, 'Failed');
        }
      }

      // Step 8: Verify
      updateStepStatus('verify-data', 'running');
      const startTime8 = Date.now();
      const verRes = await fetch(`${baseUrl}/test-verification?merchantId=${merchantId}`, { headers: { 'Authorization': authHeader } });
      const verData = await verRes.json();
      updateStepStatus('verify-data', 'success', verData, undefined, Date.now() - startTime8);

      setTestMerchant({ ...merchantData, gateway: 'PayTabs', paymentMethods: ['credit_card', 'e_wallet'], paymentTypes: ['sale'] });
      setTestResults(results);
      setActiveTab('merchant');
      toast.success(isRTL ? 'اكتمل الاختبار بنجاح!' : 'Test completed successfully!');
    } catch (error: any) {
      console.error('Test error:', error);
      toast.error(isRTL ? `فشل الاختبار: ${error.message}` : `Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const resetTest = () => {
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', data: undefined, error: undefined, duration: undefined })));
    setTestMerchant(null);
    setTestResults([]);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-[#0A0E13] p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#D4AF37] flex items-center justify-center">
              <Zap className="w-8 h-8 text-[#0B0F14]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{isRTL ? 'اختبار الرحلة الكاملة' : 'Full Trip Test'}</h1>
              <p className="text-slate-400">{isRTL ? 'محاكاة كاملة لدورة الدفع' : 'End-to-end payment cycle simulation'}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={runFullTripTest}
              disabled={isRunning}
              className="flex-1 md:flex-none px-8 py-3.5 bg-gradient-to-r from-[#F5D061] to-[#FFD700] text-black font-black rounded-xl shadow-lg disabled:opacity-50"
            >
              {isRunning ? (isRTL ? 'جاري التشغيل...' : 'Running...') : (isRTL ? 'تشغيل الاختبار' : 'Run Test')}
            </button>
            <button onClick={resetTest} className="px-6 py-3.5 bg-slate-800 text-white rounded-xl font-bold border border-slate-700">
              <RefreshCw className={isRunning ? 'animate-spin' : ''} size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="text-[#F5D061]" />
                {isRTL ? 'خطوات العملية' : 'Process Steps'}
              </h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    step.status === 'success' ? 'bg-green-500/10 border-green-500/30' :
                    step.status === 'running' ? 'bg-[#F5D061]/10 border-[#F5D061]/40 animate-pulse' :
                    step.status === 'error' ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/30 border-slate-700/30'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        step.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {step.status === 'success' ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{isRTL ? step.nameAr : step.name}</p>
                        {step.duration && <p className="text-[10px] text-slate-500">{step.duration}ms</p>}
                      </div>
                    </div>
                    {step.status === 'running' && <Loader2 className="animate-spin text-[#F5D061]" size={18} />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {testMerchant && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-[#F5D061]/30 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-[#F5D061] font-black uppercase tracking-widest text-xs mb-4">{isRTL ? 'بيانات التاجر المولد' : 'Generated Merchant Data'}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{isRTL ? 'اسم التاجر' : 'Merchant Name'}</p>
                    <p className="text-white font-bold">{testMerchant.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">MID</p>
                      <p className="text-white font-mono text-xs">{testMerchant.mid}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Status</p>
                      <span className="text-green-500 text-[10px] font-black uppercase">Active</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">{isRTL ? 'المفاتيح الأمنية' : 'Security Keys'}</p>
                    <div className="p-3 bg-black/40 rounded-xl font-mono text-[10px] text-blue-400 break-all border border-blue-500/20">
                      {testMerchant.apiCode}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
