import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Activity, 
  Terminal, 
  FileCode, 
  RefreshCw, 
  Copy, 
  Eye, 
  EyeOff,
  Zap,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Fingerprint,
  Code2,
  CheckCircle2,
  XCircle,
  Hash,
  Globe
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboard';

// Helper for HMAC-SHA256 using Web Crypto API
async function calculateHMAC(secret: string, message: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, msgData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const SecurityAudit = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  // --- API Configuration State ---
  const [showSecret, setShowSecret] = useState(false);
  const [apiKey] = useState('p2p_live_pk_mjgbclgrketomyfscbba_2026');
  const [apiSecret] = useState('p2p_live_sk_89f2d1e5a7c3b9d0e1f2a3b4c5d6e7f8');

  // --- Signature Debugger State ---
  const [debugTimestamp, setDebugTimestamp] = useState(Date.now().toString());
  const [debugMethod, setDebugMethod] = useState('POST');
  const [debugPath, setDebugPath] = useState('/api/v1/transactions/deposit');
  const [debugBody, setDebugBody] = useState('{"amount": 100, "currency": "EGP"}');
  const [debugSecret, setDebugSecret] = useState(apiSecret);
  const [calculatedSignature, setCalculatedSignature] = useState('');
  const [payloadString, setPayloadString] = useState('');

  // --- Idempotency Check State ---
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [isCheckingIdempotency, setIsCheckingIdempotency] = useState(false);
  const [idempotencyResult, setIdempotencyResult] = useState<any>(null);

  // Calculate signature whenever inputs change
  useEffect(() => {
    const updateSignature = async () => {
      const payload = `${debugTimestamp}.${debugMethod}.${debugPath}.${debugBody}`;
      setPayloadString(payload);
      try {
        const sig = await calculateHMAC(debugSecret, payload);
        setCalculatedSignature(sig);
      } catch (e) {
        setCalculatedSignature('Error calculating signature');
      }
    };
    updateSignature();
  }, [debugTimestamp, debugMethod, debugPath, debugBody, debugSecret]);

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text);
    toast.success(`${label} ${isRTL ? 'تم النسخ' : 'copied'}`);
  };

  const checkIdempotency = () => {
    if (!idempotencyKey) {
      toast.error(isRTL ? 'برجاء إدخال المفتاح' : 'Please enter a key');
      return;
    }
    setIsCheckingIdempotency(true);
    // Simulate API call
    setTimeout(() => {
      setIsCheckingIdempotency(false);
      const isUsed = Math.random() > 0.5;
      setIdempotencyResult(isUsed ? {
        status: 'USED',
        timestamp: new Date().toISOString(),
        response_code: 200,
        message: isRTL ? 'المفتاح مستخدم مسبقاً' : 'Key already used'
      } : {
        status: 'AVAILABLE',
        message: isRTL ? 'المفتاح متاح للاستخدام' : 'Key is available'
      });
    }, 1000);
  };

  const refreshTimestamp = () => setDebugTimestamp(Date.now().toString());

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#F4E5C3] rounded-2xl flex items-center justify-center shadow-xl shadow-[#D4AF37]/20">
              <ShieldCheck size={32} className="text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                {isRTL ? 'التدقيق الأمني والربط' : 'Security Audit & Integration'}
                <span className="vip-badge ml-2 text-[10px]">VIP LEVEL</span>
              </h1>
              <p className="text-gray-400 font-medium text-sm">
                {isRTL ? 'أدوات متقدمة للتحقق من التوقيع الرقمي ومعايير الأمان' : 'Advanced tools for digital signature verification and security standards'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                {isRTL ? 'نظام الأمان نشط' : 'Security Shield Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: API Config & Integration Status */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* API Credentials Card */}
            <section className="vip-card space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Key size={20} className="text-[#D4AF37]" />
                  {isRTL ? 'بيانات الربط (API Keys)' : 'API Credentials'}
                </h2>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Production Environment</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'مفتاح الـ API العام' : 'Public API Key'}</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/50 border border-[#D4AF37]/20 rounded-lg p-3 text-xs font-mono text-[#D4AF37] break-all">
                      {apiKey}
                    </code>
                    <button onClick={() => handleCopy(apiKey, 'API Key')} className="p-3 bg-white/5 rounded-lg hover:bg-[#D4AF37]/10 text-gray-400 hover:text-[#D4AF37] transition-all">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'المفتاح السري (Secret Key)' : 'API Secret Key'}</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/50 border border-[#D4AF37]/20 rounded-lg p-3 text-xs font-mono text-[#D4AF37] break-all flex items-center justify-between">
                      <code>{showSecret ? apiSecret : '••••••••••••••••••••••••••••••••'}</code>
                      <button onClick={() => setShowSecret(!showSecret)} className="text-gray-500 hover:text-[#D4AF37]">
                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button onClick={() => handleCopy(apiSecret, 'API Secret')} className="p-3 bg-white/5 rounded-lg hover:bg-[#D4AF37]/10 text-gray-400 hover:text-[#D4AF37] transition-all">
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-red-400 font-bold italic">
                    <AlertTriangle size={10} className="inline mr-1" />
                    {isRTL ? 'لا تشارك هذا المفتاح أبداً مع أي شخص' : 'Never share this secret key in client-side code.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Security Health Metrics */}
            <section className="vip-card space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity size={20} className="text-blue-400" />
                {isRTL ? 'مؤشرات الأمان' : 'Security Health'}
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{isRTL ? 'محاولات فاشلة' : 'Failed Attempts'}</p>
                  <p className="text-2xl font-black text-white">12</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-green-500">
                    <ShieldCheck size={10} />
                    {isRTL ? 'تم الحظر تلقائياً' : 'Auto-blocked'}
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{isRTL ? 'تكرار الطلب' : 'Idempotency Hits'}</p>
                  <p className="text-2xl font-black text-white">1,402</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400">
                    <Zap size={10} />
                    {isRTL ? 'تم التوفير' : 'Redundancy saved'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{isRTL ? 'صحة التوقيع الرقمي' : 'Signature Validity Rate'}</span>
                  <span className="text-green-500 font-bold">99.8%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[99.8%]" />
                </div>
              </div>
            </section>

            {/* IP Whitelist Simulator */}
            <section className="vip-card bg-gradient-to-br from-gray-900 to-black">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Globe size={20} className="text-purple-400" />
                {isRTL ? 'القائمة البيضاء للعناوين' : 'IP Whitelist'}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 group hover:border-[#D4AF37]/50 transition-all">
                  <div className="flex items-center gap-3">
                    <Terminal size={14} className="text-gray-500" />
                    <code className="text-xs text-white">192.168.1.105</code>
                  </div>
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{isRTL ? 'نشط' : 'Active'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 group hover:border-[#D4AF37]/50 transition-all">
                  <div className="flex items-center gap-3">
                    <Terminal size={14} className="text-gray-500" />
                    <code className="text-xs text-white">45.12.89.230</code>
                  </div>
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{isRTL ? 'نشط' : 'Active'}</span>
                </div>
                <button className="w-full py-3 border border-dashed border-white/20 rounded-lg text-[10px] font-bold text-gray-500 uppercase hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                  + {isRTL ? 'إضافة عنوان جديد' : 'Add New IP Address'}
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Signature Debugger & Idempotency */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Signature Debugger Card */}
            <section className="vip-card overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Fingerprint size={24} className="text-[#D4AF37]" />
                  {isRTL ? 'مصحح التوقيع الرقمي (HMAC)' : 'HMAC Signature Debugger'}
                </h2>
                <button 
                  onClick={refreshTimestamp}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                  title="Refresh Timestamp"
                >
                  <RefreshCw size={16} className="text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'الطابع الزمني (X-Timestamp)' : 'Timestamp (X-Timestamp)'}</label>
                    <input 
                      type="text" 
                      value={debugTimestamp}
                      onChange={(e) => setDebugTimestamp(e.target.value)}
                      className="vip-input font-mono text-xs" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'الطريقة (Method)' : 'HTTP Method'}</label>
                    <select 
                      value={debugMethod}
                      onChange={(e) => setDebugMethod(e.target.value)}
                      className="vip-select w-full"
                    >
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>PATCH</option>
                      <option>DELETE</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'المسار (Path)' : 'API Path'}</label>
                    <input 
                      type="text" 
                      value={debugPath}
                      onChange={(e) => setDebugPath(e.target.value)}
                      className="vip-input font-mono text-xs" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'محتوى الطلب (Request Body)' : 'Request Body'}</label>
                    <textarea 
                      value={debugBody}
                      onChange={(e) => setDebugBody(e.target.value)}
                      className="vip-textarea font-mono text-[10px] h-[142px]"
                      placeholder='{"key": "value"}'
                    />
                  </div>
                </div>
              </div>

              {/* Payload Preview */}
              <div className="mt-8 space-y-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'البيانات المجمعة للتوقيع' : 'Payload String'}</span>
                    <span className="text-[10px] text-gray-600 font-mono">Format: timestamp.method.path.body</span>
                  </div>
                  <code className="block text-[10px] text-blue-400 font-mono break-all bg-black/60 p-3 rounded-lg">
                    {payloadString}
                  </code>
                </div>

                <div className="p-6 bg-[#D4AF37]/5 border-2 border-[#D4AF37]/20 rounded-2xl relative group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                      <Hash size={16} />
                      {isRTL ? 'التوقيع المتوقع (X-Signature)' : 'Expected X-Signature'}
                    </h3>
                    <button 
                      onClick={() => handleCopy(calculatedSignature, 'Signature')}
                      className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <code className="block text-sm font-black text-white font-mono break-all selection:bg-[#D4AF37]/30">
                    {calculatedSignature}
                  </code>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 p-1 opacity-10">
                    <ShieldCheck size={80} className="text-[#D4AF37]" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <FileCode size={20} className="text-blue-400 shrink-0" />
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {isRTL 
                    ? 'استخدم خوارزمية HMAC-SHA256 مع المفتاح السري الخاص بك لإنتاج هذا التوقيع. يجب إرساله في ترويسة X-Signature.'
                    : 'Use the HMAC-SHA256 algorithm with your Secret Key to generate this signature. It must be sent in the X-Signature header.'
                  }
                </p>
              </div>
            </section>

            {/* Idempotency Verifier */}
            <section className="vip-card relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <RepeatIcon size={24} className="text-emerald-400" />
                  <h2 className="text-xl font-bold">{isRTL ? 'فاحص مفتاح تكرار الطلب' : 'Idempotency Key Verifier'}</h2>
                </div>

                <p className="text-sm text-gray-400">
                  {isRTL 
                    ? 'تحقق مما إذا كان مفتاح تكرار الطلب قد تم استخدامه مسبقاً في الـ 24 ساعة الماضية.'
                    : 'Check if an Idempotency-Key has already been processed in the last 24 hours.'
                  }
                </p>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder={isRTL ? 'أدخل المفتاح هنا...' : 'Enter Idempotency-Key...'}
                      className="vip-input"
                      value={idempotencyKey}
                      onChange={(e) => setIdempotencyKey(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={checkIdempotency}
                    disabled={isCheckingIdempotency}
                    className="vip-button-primary flex items-center justify-center gap-2 min-w-[150px]"
                  >
                    {isCheckingIdempotency ? <RefreshCw size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                    {isRTL ? 'فحص المفتاح' : 'Verify Key'}
                  </button>
                </div>

                <AnimatePresence>
                  {idempotencyResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-6 rounded-2xl border flex items-start gap-4 ${
                        idempotencyResult.status === 'USED' 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : 'bg-green-500/10 border-green-500/30'
                      }`}
                    >
                      {idempotencyResult.status === 'USED' ? (
                        <XCircle size={24} className="text-red-500 shrink-0 mt-1" />
                      ) : (
                        <CheckCircle2 size={24} className="text-green-500 shrink-0 mt-1" />
                      )}
                      
                      <div className="flex-1 space-y-2">
                        <h4 className={`font-bold ${idempotencyResult.status === 'USED' ? 'text-red-500' : 'text-green-500'}`}>
                          {idempotencyResult.message}
                        </h4>
                        {idempotencyResult.status === 'USED' && (
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase">{isRTL ? 'وقت المعالجة' : 'Processed At'}</p>
                              <p className="text-xs text-white font-mono">{new Date(idempotencyResult.timestamp).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase">{isRTL ? 'رمز الاستجابة' : 'Response Code'}</p>
                              <p className="text-xs text-white font-mono">{idempotencyResult.response_code}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Background Icon */}
              <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12">
                <Code2 size={240} className="text-white" />
              </div>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .vip-card {
          @apply bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl;
        }
        .vip-input {
          @apply w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 placeholder:text-gray-600;
        }
        .vip-textarea {
          @apply w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 placeholder:text-gray-600 resize-none;
        }
        .vip-select {
          @apply bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20;
        }
        .vip-button-primary {
          @apply bg-gradient-to-r from-[#D4AF37] to-[#F4E5C3] text-black font-black text-sm px-6 py-3 rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all;
        }
        .vip-button-secondary {
          @apply bg-white/5 border border-white/10 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-all;
        }
        .vip-badge {
          @apply inline-flex items-center px-2 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-black;
        }
      `}</style>
    </div>
  );
};

const RepeatIcon = (props: any) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

export default SecurityAudit;
