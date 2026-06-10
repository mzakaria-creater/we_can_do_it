import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ChevronRight, 
  Settings, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Cpu,
  CreditCard,
  Layers,
  UserCheck,
  Percent,
  Wallet,
  LayoutTemplate,
  ArrowRight,
  Save,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// --- API Helpers ---
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/payment-system`;
const MERCHANTS_URL = `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/merchants`;

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || publicAnonKey;
  return { Authorization: `Bearer ${token}` };
};

const fetchEntities = async (path: string) => {
  const url = path === '../merchants' ? MERCHANTS_URL : `${API_URL}/${path}`;
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, { headers });
  
  if (!res.ok) {
    console.error(`Failed to fetch ${path}:`, res.status, res.statusText);
    return [];
  }
  
  const json = await res.json();
  return json.data || json.merchant || [];
};

const saveEntity = async (path: string, data: any) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/${path}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

const EnterpriseArchitecture = () => {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  
  // Data Fetching
  const { data: merchants = [] } = useQuery({ queryKey: ['merchants'], queryFn: () => fetchEntities('../merchants') });
  const { data: gateways = [] } = useQuery({ queryKey: ['gateways'], queryFn: () => fetchEntities('gateways') });
  const { data: paymentMethods = [] } = useQuery({ queryKey: ['payment-methods'], queryFn: () => fetchEntities('payment-methods') });
  const { data: paymentTypes = [] } = useQuery({ queryKey: ['payment-types'], queryFn: () => fetchEntities('payment-types') });
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: () => fetchEntities('accounts') });
  const { data: feesGroups = [] } = useQuery({ queryKey: ['fees-groups'], queryFn: () => fetchEntities('fees-groups') });
  const { data: walletPools = [] } = useQuery({ queryKey: ['wallet-pools'], queryFn: () => fetchEntities('wallet-pools') });
  const { data: checkoutTemplates = [] } = useQuery({ queryKey: ['checkout-templates'], queryFn: () => fetchEntities('checkout-templates') });

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [chainData, setChainData] = useState<any>(null);
  const [loadingChain, setLoadingChain] = useState(false);

  // Architecture Steps Definition with Dynamic Data
  const steps = [
    { id: 'merchants', label: 'التجار', icon: Building2, color: 'border-amber-500', data: merchants },
    { id: 'gateways', label: 'البوابات', icon: Cpu, color: 'border-blue-500', data: gateways },
    { id: 'payment-methods', label: 'وسائل الدفع', icon: CreditCard, color: 'border-purple-500', data: paymentMethods },
    { id: 'payment-types', label: 'أنواع الدفع', icon: Layers, color: 'border-green-500', data: paymentTypes },
    { id: 'accounts', label: 'الحسابات', icon: UserCheck, color: 'border-pink-500', data: accounts },
    { id: 'fees-groups', label: 'مجموعات الرسوم', icon: Percent, color: 'border-orange-500', data: feesGroups },
    { id: 'wallet-pools', label: 'محافظ الأموال', icon: Wallet, color: 'border-teal-500', data: walletPools },
    { id: 'templates', label: 'قوالب الدفع', icon: LayoutTemplate, color: 'border-rose-500', data: checkoutTemplates }
  ];

  const fetchChain = async (type: string, id: string) => {
    setLoadingChain(true);
    try {
      const res = await fetch(`${API_URL}/chain/${type}/${id}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      const json = await res.json();
      setChainData(json.data);
    } catch (err) {
      toast.error('فشل في جلب السلسلة');
    } finally {
      setLoadingChain(false);
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    const typeMap: any = {
      'gateways': 'gateway',
      'payment-methods': 'method',
      'payment-types': 'ptype',
      'accounts': 'account',
      'fees-groups': 'fees',
      'wallet-pools': 'pool',
      'templates': 'template'
    };
    const type = typeMap[steps[activeStep].id];
    if (type) {
      fetchChain(type, item.id);
    } else if (steps[activeStep].id === 'merchants') {
      setChainData({ 'merchant': item });
    }
  };

  const handleCreate = async (stepId: string) => {
    const name = prompt(`أدخل اسم ${steps[activeStep].label} الجديد:`);
    if (!name) return;

    let parentId = '';
    if (activeStep > 0) {
      // Logic to select parent would go here, for now just simple mock
    }

    const payload = { 
      name, 
      status: 'active',
      // Dynamic parent link based on step
      ...(activeStep === 1 && { merchantId: selectedMerchantId }),
      ...(activeStep === 2 && { gatewayId: gateways[0]?.id }), // Mocking first one for demo
    };

    const path = stepId === 'templates' ? 'checkout-templates' : stepId;
    const result = await saveEntity(path, payload);
    
    if (result.success) {
      toast.success(`${steps[activeStep].label} تم الحفظ بنجاح`);
      queryClient.invalidateQueries({ queryKey: [stepId] });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
            هيكلية المؤسسة المتقدمة
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            إدارة تدفق البيانات المالية: التاجر ← البوابة ← الوسيلة ← النوع ← الحساب ← الرسوم ← المحفظة ← القالب
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => queryClient.invalidateQueries()}
            className="p-3 bg-[#1a1a1a] rounded-xl border border-amber-900/30 text-amber-500 hover:bg-amber-900/10 transition-colors"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
          <div className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-900/20">
            <Shield className="w-5 h-5" />
            <span>نظام RBAC نشط</span>
          </div>
        </div>
      </div>

      {/* Architecture Chain Visualization */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            onClick={() => setActiveStep(index)}
            className={`cursor-pointer group relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 ${
              activeStep === index 
              ? `bg-gradient-to-b from-amber-900/20 to-black ${step.color} border-2 shadow-lg shadow-amber-900/10` 
              : 'bg-[#111] border-gray-800 hover:border-amber-900/50'
            }`}
          >
            <div className={`p-3 rounded-xl mb-3 ${activeStep === index ? 'bg-amber-500 text-black' : 'bg-[#1a1a1a] text-amber-500 group-hover:scale-110 transition-transform'}`}>
              <step.icon className="w-6 h-6" />
            </div>
            <span className={`text-sm font-bold text-center ${activeStep === index ? 'text-amber-400' : 'text-gray-500'}`}>
              {step.label}
            </span>
            
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 z-10">
                <ChevronRight className="w-5 h-5 text-amber-900/30" />
              </div>
            )}
            
            <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-[#1a1a1a] rounded-full text-[10px] text-amber-500 border border-amber-900/30">
              {step.data?.length || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entity List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111] border border-amber-900/20 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-amber-900/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  {React.createElement(steps[activeStep].icon, { className: "w-6 h-6 text-amber-500" })}
                </div>
                <h2 className="text-xl font-bold">قائمة {steps[activeStep].label}</h2>
              </div>
              <button 
                onClick={() => handleCreate(steps[activeStep].id)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-black transition-all font-bold"
              >
                <Plus className="w-4 h-4" />
                إضافة جديد
              </button>
            </div>
            
            <div className="p-0">
              {steps[activeStep].data.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="w-12 h-12 mb-4 animate-spin text-amber-900/20" />
                  <p>لا يوجد بيانات متوفرة حالياً</p>
                </div>
              ) : (
                <div className="divide-y divide-amber-900/5">
                  {steps[activeStep].data.map((item: any) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleItemClick(item)}
                      className={`p-6 flex items-center justify-between hover:bg-amber-900/5 transition-colors group cursor-pointer ${selectedItem?.id === item.id ? 'bg-amber-900/10 border-r-4 border-amber-500' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-amber-500 font-bold border border-amber-900/10">
                          {item.name?.charAt(0) || 'N'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 font-mono">{item.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-500 hover:text-amber-500 transition-colors">
                          <Settings className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details & Rule Engine */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#111] to-black border border-amber-500/20 rounded-3xl p-8 relative overflow-hidden min-h-[500px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
            
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Settings className="w-6 h-6 text-amber-500" />
              سلسلة الربط والقواعد
            </h2>
            
            {loadingChain ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <p className="mt-4 text-gray-500">جاري تحليل السلسلة...</p>
              </div>
            ) : selectedItem ? (
              <div className="space-y-6">
                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                  <h3 className="font-bold text-amber-500 text-sm mb-1 uppercase">العنصر المختار</h3>
                  <p className="text-xl font-bold">{selectedItem.name}</p>
                </div>

                <div className="relative space-y-4">
                  {chainData ? (
                    Object.entries(chainData).reverse().map(([key, val]: any, i) => (
                      <div key={key} className="flex items-center gap-4 animate-in fade-in slide-in-from-right duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xs shrink-0 shadow-lg shadow-amber-900/40">
                          {i + 1}
                        </div>
                        <div className="flex-1 p-3 bg-[#1a1a1a] rounded-xl border border-amber-900/10 hover:border-amber-500/30 transition-colors">
                          <span className="text-[10px] text-amber-500 uppercase font-bold tracking-tighter block">{key}</span>
                          <span className="text-sm font-medium">{val.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 border border-dashed border-amber-900/20 rounded-2xl text-center text-gray-600 italic text-sm">
                      لا توجد علاقات مرتبطة حالياً
                    </div>
                  )}
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-500 text-sm">التحقق من الصحة</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        السلسلة مكتملة وتتبع القواعد المالية المعتمدة.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Shield className="w-12 h-12 text-amber-900/20 mb-4" />
                <p className="text-gray-500">اختر عنصراً من القائمة لعرض سلسلة الارتباط والقواعد الخاصة به</p>
              </div>
            )}

            <button className="w-full mt-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl font-bold text-black flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-amber-900/20 transition-all active:scale-95">
              <Save className="w-5 h-5" />
              تحديث القواعد
            </button>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-3xl p-8">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-[0.2em] mb-6">التدفق النشط</h3>
            <div className="space-y-4">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i <= activeStep ? 'bg-amber-500 text-black' : 'bg-[#1a1a1a] text-gray-600'}`}>
                    {i + 1}
                  </div>
                  <div className={`text-sm ${i <= activeStep ? 'text-white' : 'text-gray-600'}`}>
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 border-t border-dashed border-gray-800"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseArchitecture;