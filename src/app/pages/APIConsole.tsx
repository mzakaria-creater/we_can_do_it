import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Terminal, 
  Copy, 
  Check, 
  Send, 
  Zap,
  BookOpen,
  Key,
  Server,
  Database,
  Globe,
  AlertCircle,
  RefreshCw,
  FileText,
  Lock,
  Filter
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboard';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  requestBody?: string;
  responseExample?: string;
  curlExample?: string;
}

const endpoints: Endpoint[] = [
  {
    method: 'POST',
    path: '/transactions',
    description: 'Create a new transaction',
    category: 'Transactions',
    requestBody: `{
  "merchant_id": "uuid",
  "amount": 10000,
  "currency": "EGP",
  "payment_method_id": "uuid",
  "customer_phone": "01012345678",
  "customer_email": "customer@example.com",
  "callback_url": "https://merchant.com/callback",
  "metadata": {
    "order_id": "ORDER-123",
    "description": "Product purchase"
  }
}`,
    responseExample: `{
  "success": true,
  "data": {
    "transaction_id": "TX-918273",
    "status": "PENDING",
    "payment_url": "https://pay.press2pay.com/tx/TX-918273",
    "expires_at": "2026-01-24T04:00:00Z"
  }
}`,
    curlExample: `curl -X POST https://api.press2pay.com/v1/transactions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"merchant_id": "uuid", "amount": 10000, "currency": "EGP", "customer_phone": "01012345678"}'`
  },
  {
    method: 'GET',
    path: '/transactions/{transaction_id}',
    description: 'Get transaction status and details',
    category: 'Transactions',
    responseExample: `{
  "success": true,
  "data": {
    "transaction_id": "TX-918273",
    "status": "COMPLETED",
    "amount": 10000,
    "currency": "EGP",
    "fee_amount": 150,
    "net_amount": 9850,
    "payment_method": "VODAFONE_CASH",
    "customer_phone": "01012345678",
    "created_at": "2026-01-23T19:45:00Z",
    "completed_at": "2026-01-23T19:47:00Z",
    "metadata": {
      "order_id": "ORDER-123"
    }
  }
}`,
    curlExample: `curl -X GET https://api.press2pay.com/v1/transactions/TX-918273 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  },
  {
    method: 'GET',
    path: '/transactions',
    description: 'List transactions with filters',
    category: 'Transactions',
    responseExample: `{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "total": 1250,
      "limit": 50,
      "offset": 0,
      "has_more": true
    }
  }
}`,
    curlExample: `curl -X GET "https://api.press2pay.com/v1/transactions?status=COMPLETED&from=2026-01-01&to=2026-01-31&limit=50" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  },
  {
    method: 'POST',
    path: '/refunds',
    description: 'Create a refund for a transaction',
    category: 'Refunds',
    requestBody: `{
  "transaction_id": "TX-918273",
  "amount": 10000,
  "reason": "Customer request",
  "notes": "Full refund"
}`,
    responseExample: `{
  "success": true,
  "data": {
    "refund_id": "REF-123456",
    "status": "PENDING",
    "amount": 10000,
    "created_at": "2026-01-23T20:00:00Z"
  }
}`,
    curlExample: `curl -X POST https://api.press2pay.com/v1/refunds \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"transaction_id": "TX-918273", "amount": 10000, "reason": "Customer request"}'`
  },
  {
    method: 'GET',
    path: '/settlements/{settlement_id}',
    description: 'Get settlement details',
    category: 'Settlements',
    responseExample: `{
  "success": true,
  "data": {
    "settlement_id": "SETTLE-2026-01-23",
    "merchant_id": "uuid",
    "period_from": "2026-01-23T00:00:00Z",
    "period_to": "2026-01-23T23:59:59Z",
    "total_transactions": 1250,
    "total_volume": 1500000,
    "total_fees": 22500,
    "total_refunds": 5000,
    "total_chargebacks": 0,
    "net_settlement": 1472500,
    "status": "COMPLETED",
    "settled_at": "2026-01-24T00:00:00Z"
  }
}`,
    curlExample: `curl -X GET https://api.press2pay.com/v1/settlements/SETTLE-2026-01-23 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  },
  {
    method: 'POST',
    path: '/webhooks',
    description: 'Configure webhook endpoints',
    category: 'Webhooks',
    requestBody: `{
  "url": "https://your-server.com/webhooks/press2pay",
  "event_types": [
    "transaction.completed",
    "transaction.failed",
    "refund.completed",
    "settlement.ready"
  ],
  "secret": "your_webhook_secret"
}`,
    responseExample: `{
  "success": true,
  "data": {
    "webhook_id": "WH-123456",
    "url": "https://your-server.com/webhooks/press2pay",
    "event_types": ["transaction.completed", "transaction.failed"],
    "status": "ACTIVE",
    "created_at": "2026-01-23T20:00:00Z"
  }
}`,
    curlExample: `curl -X POST https://api.press2pay.com/v1/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://your-server.com/webhooks/press2pay", "event_types": ["transaction.completed"]}'`
  }
];

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = 'json' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="relative group">
      <button
        className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        onClick={handleCopy}
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
      </button>
      <pre className="bg-[#0B0F14] border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
        <code className={`language-${language} text-gray-300 font-mono`}>{code}</code>
      </pre>
    </div>
  );
};

const MethodBadge: React.FC<{ method: string }> = ({ method }) => {
  const colors = {
    GET: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    POST: 'bg-green-500/10 text-green-400 border-green-500/30',
    PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
    PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  };

  return (
    <span className={`${colors[method as keyof typeof colors]} font-mono font-bold px-3 py-1 border rounded-lg text-xs`}>
      {method}
    </span>
  );
};

export const APIConsole = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(endpoints[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'curl' | 'request' | 'response'>('curl');

  const categories = ['All', ...Array.from(new Set(endpoints.map(e => e.category)))];
  const filteredEndpoints = activeCategory === 'All' 
    ? endpoints 
    : endpoints.filter(e => e.category === activeCategory);

  const stats = [
    { label: isRTL ? 'النقاط النهائية' : 'Total Endpoints', value: endpoints.length, icon: Server, color: 'blue' },
    { label: isRTL ? 'الفئات' : 'Categories', value: categories.length - 1, icon: Database, color: 'green' },
    { label: isRTL ? 'إصدار API' : 'API Version', value: 'v1.0.0', icon: Globe, color: 'yellow' },
    { label: isRTL ? 'وقت التشغيل' : 'Uptime', value: '99.9%', icon: Zap, color: 'purple' }
  ];

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
              {isRTL ? 'وحدة التحكم API' : 'API Console'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL ? 'مرجع API الكامل وبيئة الاختبار' : 'Complete API reference and testing environment'}
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-all border border-white/10">
              <FileText className="w-5 h-5" />
              <span>{isRTL ? 'التوثيق' : 'Documentation'}</span>
            </button>
          </div>
        </div>

        {/* Environment Alert */}
        <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#C49F27]/20 border border-[#D4AF37]/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#D4AF37] mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">
                {isRTL ? 'بيئات API' : 'API Environments'}
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-[#D4AF37]">{isRTL ? 'إنتاج' : 'Production'}:</strong> https://api.press2pay.com/v1 • 
                <strong className="text-[#D4AF37] ml-4">{isRTL ? 'تجريبي' : 'Staging'}:</strong> https://staging-api.press2pay.com/v1
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${
                stat.color === 'blue' ? 'from-blue-500/20 to-blue-600/20 border-blue-500/30' :
                stat.color === 'green' ? 'from-green-500/20 to-green-600/20 border-green-500/30' :
                stat.color === 'yellow' ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' :
                'from-purple-500/20 to-purple-600/20 border-purple-500/30'
              } border rounded-xl p-6 flex items-center justify-between`}
            >
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-10 h-10 opacity-20 ${
                stat.color === 'blue' ? 'text-blue-400' :
                stat.color === 'green' ? 'text-green-400' :
                stat.color === 'yellow' ? 'text-yellow-400' :
                'text-purple-400'
              }`} />
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <div className="lg:col-span-1">
            <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden sticky top-6">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                  {isRTL ? 'النقاط النهائية' : 'Endpoints'}
                </h2>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeCategory === cat
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14]'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoints */}
              <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                {filteredEndpoints.map((endpoint, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedEndpoint === endpoint
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <MethodBadge method={endpoint.method} />
                      <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10">
                        {endpoint.category}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-gray-300 mt-2">{endpoint.path}</p>
                    <p className="text-xs text-gray-500 mt-1">{endpoint.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Endpoint Details */}
          <div className="lg:col-span-2">
            {selectedEndpoint ? (
              <motion.div
                key={selectedEndpoint.path}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <MethodBadge method={selectedEndpoint.method} />
                    <code className="text-lg font-mono text-white">{selectedEndpoint.path}</code>
                  </div>
                  <p className="text-gray-400">{selectedEndpoint.description}</p>
                </div>

                <div className="p-6">
                  {/* Tabs */}
                  <div className="flex gap-2 mb-6 bg-[#0B0F14] p-1 rounded-lg border border-white/10">
                    <button
                      onClick={() => setActiveTab('curl')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'curl'
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      cURL
                    </button>
                    {selectedEndpoint.requestBody && (
                      <button
                        onClick={() => setActiveTab('request')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab === 'request'
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {isRTL ? 'الطلب' : 'Request'}
                      </button>
                    )}
                    {selectedEndpoint.responseExample && (
                      <button
                        onClick={() => setActiveTab('response')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab === 'response'
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {isRTL ? 'الاستجابة' : 'Response'}
                      </button>
                    )}
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-4">
                    {activeTab === 'curl' && selectedEndpoint.curlExample && (
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                          <Terminal className="w-4 h-4" />
                          <span>{isRTL ? 'سطر الأوامر' : 'Command Line'}</span>
                        </div>
                        <CodeBlock code={selectedEndpoint.curlExample} language="bash" />
                      </div>
                    )}

                    {activeTab === 'request' && selectedEndpoint.requestBody && (
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                          <Send className="w-4 h-4" />
                          <span>{isRTL ? 'نص الطلب' : 'Request Body'}</span>
                        </div>
                        <CodeBlock code={selectedEndpoint.requestBody} language="json" />
                      </div>
                    )}

                    {activeTab === 'response' && selectedEndpoint.responseExample && (
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                          <Check className="w-4 h-4 text-green-400" />
                          <span>{isRTL ? 'مثال الاستجابة' : 'Response Example'}</span>
                        </div>
                        <CodeBlock code={selectedEndpoint.responseExample} language="json" />
                      </div>
                    )}
                  </div>

                  {/* Authentication Info */}
                  <div className="mt-6 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Key className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                      <div>
                        <p className="text-white font-semibold mb-2">
                          {isRTL ? 'المصادقة' : 'Authentication'}
                        </p>
                        <p className="text-gray-300 text-sm mb-2">
                          {isRTL ? 'جميع الطلبات تتطلب مفتاح API في رأس التفويض:' : 'All requests require an API key in the Authorization header:'}
                        </p>
                        <code className="block bg-[#0B0F14] border border-white/10 p-3 rounded-lg text-sm text-gray-300 font-mono">
                          Authorization: Bearer YOUR_API_KEY
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl h-full flex items-center justify-center p-20">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    {isRTL ? 'لم يتم اختيار نقطة نهاية' : 'No Endpoint Selected'}
                  </h3>
                  <p className="text-gray-500">
                    {isRTL ? 'اختر نقطة نهاية من القائمة لعرض التفاصيل' : 'Select an endpoint from the list to view its details'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: FileText, title: isRTL ? 'التوثيق الكامل' : 'Full Documentation', desc: isRTL ? 'مرجع API الكامل' : 'Complete API reference' },
            { icon: Code, title: isRTL ? 'أمثلة الكود' : 'Code Examples', desc: isRTL ? 'عينات التكامل' : 'Sample integrations' },
            { icon: RefreshCw, title: isRTL ? 'حالة API' : 'API Status', desc: isRTL ? 'صحة النظام ووقت التشغيل' : 'System health & uptime' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/30 rounded-xl p-6 transition-all cursor-pointer group">
              <item.icon className="w-8 h-8 text-[#D4AF37] group-hover:scale-110 transition-transform mb-3" />
              <h3 className="text-white font-semibold mb-1">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};