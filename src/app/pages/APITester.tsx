import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Send,
  Code,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Key,
  Settings,
  Terminal,
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboard';

interface TestRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  headers: Record<string, string>;
  body?: string;
}

interface TestResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  duration: number;
}

const presetEndpoints = [
  {
    name: 'Create Transaction',
    method: 'POST' as const,
    endpoint: '/transactions',
    body: JSON.stringify({
      merchant_id: "uuid",
      amount: 10000,
      currency: "EGP",
      payment_method_id: "uuid",
      customer_phone: "01012345678",
      customer_email: "customer@example.com",
      callback_url: "https://merchant.com/callback",
      metadata: {
        order_id: "ORDER-123"
      }
    }, null, 2)
  },
  {
    name: 'Get Transaction',
    method: 'GET' as const,
    endpoint: '/transactions/TX-918273',
    body: ''
  },
  {
    name: 'List Transactions',
    method: 'GET' as const,
    endpoint: '/transactions?status=COMPLETED&limit=10',
    body: ''
  },
  {
    name: 'Create Refund',
    method: 'POST' as const,
    endpoint: '/refunds',
    body: JSON.stringify({
      transaction_id: "TX-918273",
      amount: 10000,
      reason: "Customer request",
      notes: "Full refund"
    }, null, 2)
  },
  {
    name: 'Get Settlement',
    method: 'GET' as const,
    endpoint: '/settlements/SETTLE-2026-01-23',
    body: ''
  }
];

const testScenarios = [
  {
    name: 'Successful Transaction',
    description: 'Test a successful transaction flow',
    icon: CheckCircle,
    color: 'green',
    test: async () => {
      return {
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json' },
        body: {
          success: true,
          data: {
            transaction_id: 'TX-918273',
            status: 'PENDING',
            payment_url: 'https://pay.press2pay.com/tx/TX-918273',
            expires_at: new Date(Date.now() + 3600000).toISOString()
          }
        },
        duration: 142
      };
    }
  },
  {
    name: 'Failed Transaction',
    description: 'Test insufficient funds scenario',
    icon: XCircle,
    color: 'red',
    test: async () => {
      return {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
        body: {
          success: false,
          error: {
            code: 'INSUFFICIENT_FUNDS',
            message: 'Insufficient wallet balance',
            details: 'Customer wallet balance is too low'
          }
        },
        duration: 89
      };
    }
  },
  {
    name: 'Rate Limit',
    description: 'Test rate limiting behavior',
    icon: AlertCircle,
    color: 'yellow',
    test: async () => {
      return {
        status: 429,
        statusText: 'Too Many Requests',
        headers: { 
          'content-type': 'application/json',
          'x-ratelimit-limit': '100',
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60)
        },
        body: {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded',
            retry_after: 60
          }
        },
        duration: 12
      };
    }
  },
  {
    name: 'Invalid API Key',
    description: 'Test authentication error',
    icon: Key,
    color: 'orange',
    test: async () => {
      return {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'content-type': 'application/json' },
        body: {
          success: false,
          error: {
            code: 'INVALID_API_KEY',
            message: 'API key is invalid or missing'
          }
        },
        duration: 45
      };
    }
  }
];

export const APITester = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [baseUrl, setBaseUrl] = useState('https://staging-api.press2pay.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [endpoint, setEndpoint] = useState('/transactions');
  const [requestBody, setRequestBody] = useState(presetEndpoints[0].body);
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  const loadPreset = (preset: typeof presetEndpoints[0]) => {
    setMethod(preset.method);
    setEndpoint(preset.endpoint);
    setRequestBody(preset.body);
  };

  const executeRequest = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));

      const mockResponse: TestResponse = {
        status: 201,
        statusText: 'Created',
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'req_' + Math.random().toString(36).substring(7),
          'x-ratelimit-limit': '100',
          'x-ratelimit-remaining': '99'
        },
        body: {
          success: true,
          data: {
            transaction_id: 'TX-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            status: 'PENDING',
            amount: 10000,
            currency: 'EGP',
            created_at: new Date().toISOString()
          }
        },
        duration: Date.now() - startTime
      };

      setResponse(mockResponse);
      toast.success('Request executed successfully');
    } catch (error) {
      toast.error('Request failed');
    } finally {
      setLoading(false);
    }
  };

  const runTestScenario = async (scenario: typeof testScenarios[0]) => {
    setLoading(true);
    toast.info(`Running test: ${scenario.name}`);

    try {
      const result = await scenario.test();
      setResponse(result);
      
      if (result.status >= 200 && result.status < 300) {
        toast.success(`Test passed: ${scenario.name}`);
      } else {
        toast.error(`Test failed: ${scenario.name}`);
      }
    } catch (error) {
      toast.error('Test execution failed');
    } finally {
      setLoading(false);
    }
  };

  const generateCurl = () => {
    let curl = `curl -X ${method} ${baseUrl}${endpoint} \\\n`;
    curl += `  -H "Authorization: Bearer ${apiKey}" \\\n`;
    curl += `  -H "Content-Type: application/json"`;
    
    if (method !== 'GET' && requestBody) {
      curl += ` \\\n  -d '${requestBody.replace(/\n/g, ' ')}'`;
    }
    
    return curl;
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                <Terminal className="w-6 h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'اختبار وتصحيح API' : 'API Testing & Debugging'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL ? 'مختبر API تفاعلي مع فحص الطلب/الاستجابة المباشر' : 'Interactive API tester with live request/response inspection'}
            </p>
          </div>
        </div>

        {/* Test Environment Alert */}
        <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#C49F27]/20 border border-[#D4AF37]/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#D4AF37] mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">
                {isRTL ? 'بيئة الاختبار' : 'Test Environment'}
              </p>
              <p className="text-gray-300 text-sm">
                {isRTL ? 'استخدام API التجريبي مع بيانات الاختبار. لن يتم إنشاء معاملات حقيقية.' : 'Using staging API with test credentials. No real transactions will be created.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Builder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#D4AF37]" />
                    {isRTL ? 'بناء الطلب' : 'Request Builder'}
                  </h2>
                  <button
                    onClick={executeRequest}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Clock className="w-5 h-5 animate-spin" />
                        <span>{isRTL ? 'جاري الإرسال...' : 'Sending...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>{isRTL ? 'إرسال الطلب' : 'Send Request'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Base URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{isRTL ? 'عنوان URL الأساسي' : 'Base URL'}</label>
                  <input
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                  />
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{isRTL ? 'مفتاح API' : 'API Key'}</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1 bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                    />
                    <button
                      onClick={() => handleCopy(apiKey)}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Method & Endpoint */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">{isRTL ? 'الطريقة' : 'Method'}</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value as any)}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div className="col-span-3 space-y-2">
                    <label className="text-sm font-medium text-gray-400">{isRTL ? 'النقطة النهائية' : 'Endpoint'}</label>
                    <input
                      value={endpoint}
                      onChange={(e) => setEndpoint(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                      placeholder="/transactions"
                    />
                  </div>
                </div>

                {/* Preset Endpoints */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{isRTL ? 'تحميل سريع' : 'Quick Load'}</label>
                  <div className="flex flex-wrap gap-2">
                    {presetEndpoints.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => loadPreset(preset)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-all"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Request Body */}
                {method !== 'GET' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">{isRTL ? 'نص الطلب (JSON)' : 'Request Body (JSON)'}</label>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm h-64 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                      placeholder="{}"
                    />
                  </div>
                )}

                {/* cURL Command */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{isRTL ? 'أمر cURL' : 'cURL Command'}</label>
                  <div className="relative group">
                    <button
                      onClick={() => handleCopy(generateCurl())}
                      className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                    <pre className="bg-[#0B0F14] border border-white/10 rounded-lg p-4 overflow-x-auto text-xs">
                      <code className="text-gray-300 font-mono">{generateCurl()}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Response */}
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Code className="w-5 h-5 text-[#D4AF37]" />
                      {isRTL ? 'الاستجابة' : 'Response'}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        response.status >= 200 && response.status < 300
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {response.status} {response.statusText}
                      </span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400">
                        {response.duration}ms
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-2 mb-6 bg-[#0B0F14] p-1 rounded-lg border border-white/10">
                    <button
                      onClick={() => setActiveTab('body')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'body'
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {isRTL ? 'نص الاستجابة' : 'Response Body'}
                    </button>
                    <button
                      onClick={() => setActiveTab('headers')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'headers'
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {isRTL ? 'الرؤوس' : 'Headers'}
                    </button>
                  </div>

                  {activeTab === 'body' && (
                    <div className="relative group">
                      <button
                        onClick={() => handleCopy(JSON.stringify(response.body, null, 2))}
                        className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                      <pre className="bg-[#0B0F14] border border-white/10 rounded-lg p-4 overflow-x-auto text-sm max-h-[400px]">
                        <code className="text-gray-300 font-mono">{JSON.stringify(response.body, null, 2)}</code>
                      </pre>
                    </div>
                  )}

                  {activeTab === 'headers' && (
                    <div className="bg-[#0B0F14] border border-white/10 rounded-lg p-4">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <span className="text-sm font-mono text-gray-400">{key}:</span>
                          <span className="text-sm font-mono text-gray-300">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Test Scenarios */}
          <div className="space-y-4">
            <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden sticky top-6">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#D4AF37]" />
                  {isRTL ? 'سيناريوهات الاختبار' : 'Test Scenarios'}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {isRTL ? 'حالات اختبار محددة مسبقاً' : 'Pre-configured test cases'}
                </p>
              </div>

              <div className="p-4 space-y-2">
                {testScenarios.map((scenario, idx) => (
                  <button
                    key={idx}
                    onClick={() => runTestScenario(scenario)}
                    disabled={loading}
                    className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-start gap-3">
                      <scenario.icon className={`w-5 h-5 mt-0.5 ${
                        scenario.color === 'green' ? 'text-green-400' :
                        scenario.color === 'red' ? 'text-red-400' :
                        scenario.color === 'yellow' ? 'text-yellow-400' :
                        'text-orange-400'
                      }`} />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm mb-1">{scenario.name}</h3>
                        <p className="text-gray-400 text-xs">{scenario.description}</p>
                      </div>
                      <Play className="w-4 h-4 text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">{isRTL ? 'إحصائيات الطلبات' : 'Request Stats'}</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">{isRTL ? 'إجمالي الطلبات' : 'Total Requests'}</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">{isRTL ? 'معدل النجاح' : 'Success Rate'}</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded text-xs font-bold">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">{isRTL ? 'متوسط وقت الاستجابة' : 'Avg Response Time'}</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                    {response ? `${response.duration}ms` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};