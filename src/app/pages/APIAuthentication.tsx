import React from 'react';
import { Copy, Check, ChevronRight, Lock, Code, Key as KeyIcon, ExternalLink, Shield, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../lib/store';
import { copyToClipboard } from '../../lib/clipboard';
import { motion } from 'motion/react';

export const APIAuthentication = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const isRTL = language === 'ar';
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyText = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(label);
      toast.success(isRTL ? 'تم النسخ!' : 'Copied!');
      setTimeout(() => setCopied(null), 2000);
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const examples = [
    {
      title: isRTL ? 'طلب أساسي مع مفتاح API' : 'Basic Request with API Key',
      language: 'bash',
      code: `curl https://YOUR_PROJECT.supabase.co/functions/v1/server/make-server-46c3f42b/merchants \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    },
    {
      title: isRTL ? 'إنشاء معاملة' : 'Create Transaction',
      language: 'bash',
      code: `curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/server/make-server-46c3f42b/transactions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000,
    "currency": "EGP",
    "method": "Vodafone Cash",
    "merchantId": "merchant-123"
  }'`
    },
    {
      title: isRTL ? 'JavaScript / TypeScript (Fetch)' : 'JavaScript / TypeScript (Fetch)',
      language: 'javascript',
      code: `const response = await fetch(
  'https://YOUR_PROJECT.supabase.co/functions/v1/server/make-server-46c3f42b/merchants',
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log(data);`
    },
    {
      title: isRTL ? 'React مع Supabase Client' : 'React with Supabase Client',
      language: 'typescript',
      code: `import { supabase } from './lib/supabase';

const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(
  'https://YOUR_PROJECT.supabase.co/functions/v1/server/make-server-46c3f42b/merchants',
  {
    headers: {
      'Authorization': \`Bearer \${session.access_token}\`,
      'Content-Type': 'application/json'
    }
  }
);

const merchants = await response.json();`
    },
    {
      title: isRTL ? 'Python' : 'Python',
      language: 'python',
      code: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://YOUR_PROJECT.supabase.co/functions/v1/server/make-server-46c3f42b/merchants',
    headers=headers
)

data = response.json()
print(data)`
    },
    {
      title: isRTL ? 'اشتراك Realtime' : 'Realtime Subscription',
      language: 'typescript',
      code: `import { supabase } from './lib/supabase';

// Must authenticate first
await supabase.realtime.setAuth();

const channel = supabase.channel('kv:merchant', { 
  config: { private: true } 
});

channel
  .on('broadcast', { event: 'INSERT' }, ({ payload }) => {
    console.log('merchant inserted', payload.new);
  })
  .on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
    console.log('merchant updated', payload.new);
  })
  .on('broadcast', { event: 'DELETE' }, ({ payload }) => {
    console.log('merchant deleted', payload.old);
  })
  .subscribe();`
    }
  ];

  const authTypes = [
    {
      type: isRTL ? 'Public Anon Key' : 'Public Anon Key',
      icon: '🔓',
      description: isRTL 
        ? 'مفتاح عام للوصول إلى الموارد العامة (محدود)'
        : 'Public key for accessing public resources (limited)',
      example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      usage: isRTL ? 'القراءة فقط للموارد العامة' : 'Read-only public resources'
    },
    {
      type: isRTL ? 'Session Token' : 'Session Token',
      icon: '👤',
      description: isRTL 
        ? 'رمز جلسة المستخدم بعد تسجيل الدخول عبر Supabase Auth'
        : 'User session token after Supabase Auth login',
      example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (from session.access_token)',
      usage: isRTL ? 'وصول المستخدم المصادق عليه' : 'Authenticated user access'
    },
    {
      type: isRTL ? 'Merchant API Key' : 'Merchant API Key',
      icon: '🔑',
      description: isRTL 
        ? 'مفتاح API خاص للتجار للوصول إلى الموارد الخاصة بهم'
        : 'Merchant-specific API key for accessing their resources',
      example: 'Bearer pk_test_abc123xyz...',
      usage: isRTL ? 'عمليات API للتجار' : 'Merchant API operations'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Shield className="text-primary" />
            {isRTL ? 'المصادقة ��بر API' : 'API Authentication'}
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            {isRTL 
              ? 'كيفية استخدام Bearer Token للمصادقة على طلبات API' 
              : 'How to use Bearer Tokens for API request authentication'}
          </p>
        </div>
      </div>

      {/* Authentication Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {authTypes.map((auth, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{auth.icon}</span>
              <h3 className="font-bold text-lg">{auth.type}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {auth.description}
            </p>
            <div className="bg-muted/50 rounded-xl p-3 mb-3">
              <code className="text-xs font-mono break-all text-foreground">
                {auth.example}
              </code>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Key size={14} className="text-primary" />
              <span className="font-medium text-muted-foreground">{auth.usage}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Shield className="text-amber-500 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-bold text-lg mb-2 text-foreground">
              {isRTL ? '⚠️ تنسيق الرأس مطلوب' : '⚠️ Required Header Format'}
            </h4>
            <p className="text-sm text-foreground/80 mb-3">
              {isRTL 
                ? 'يجب أن يحتوي رأس Authorization على البادئة "Bearer" متبوعة بمسافة ثم مفتاح API أو رمز الجلسة:'
                : 'The Authorization header MUST contain the "Bearer" prefix followed by a space and then your API key or session token:'}
            </p>
            <div className="bg-background/80 rounded-xl p-4 border border-amber-500/20">
              <code className="text-sm font-mono text-foreground">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {isRTL 
                ? '❌ خطأ: Authorization: YOUR_API_KEY (بدون Bearer)'
                : '❌ Wrong: Authorization: YOUR_API_KEY (missing Bearer)'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isRTL 
                ? '✅ صحيح: Authorization: Bearer YOUR_API_KEY'
                : '✅ Correct: Authorization: Bearer YOUR_API_KEY'}
            </p>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Code className="text-primary" />
          {isRTL ? 'أمثلة التعليمات البرمجية' : 'Code Examples'}
        </h3>

        {examples.map((example, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h4 className="font-bold text-foreground">{example.title}</h4>
              <button
                onClick={() => copyText(example.code, example.title)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all text-sm font-medium"
              >
                {copied === example.title ? (
                  <>
                    <Check size={16} />
                    {isRTL ? 'تم النسخ' : 'Copied'}
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    {isRTL ? 'نسخ' : 'Copy'}
                  </>
                )}
              </button>
            </div>
            <div className="p-4 bg-background/50">
              <pre className="text-sm font-mono overflow-x-auto">
                <code className="text-foreground">{example.code}</code>
              </pre>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Error Handling */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="text-destructive" size={20} />
          {isRTL ? 'معالجة الأخطاء' : 'Error Handling'}
        </h3>
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <p className="font-bold text-sm mb-2">
              <span className="text-destructive">401 Unauthorized</span>
            </p>
            <code className="text-xs font-mono text-muted-foreground">
              {`{ "error": "Missing Authorization header" }`}
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              {isRTL ? '→ أضف رأس Authorization' : '→ Add Authorization header'}
            </p>
          </div>

          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <p className="font-bold text-sm mb-2">
              <span className="text-destructive">401 Unauthorized</span>
            </p>
            <code className="text-xs font-mono text-muted-foreground">
              {`{ "error": "Invalid Authorization header format. Use: Bearer YOUR_API_KEY" }`}
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              {isRTL 
                ? '→ تأكد من إضافة البادئة "Bearer" قبل المفتاح'
                : '→ Ensure "Bearer" prefix before the key'}
            </p>
          </div>

          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <p className="font-bold text-sm mb-2">
              <span className="text-destructive">401 Unauthorized</span>
            </p>
            <code className="text-xs font-mono text-muted-foreground">
              {`{ "error": "Invalid API key" }`}
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              {isRTL 
                ? '→ المفتاح منتهي الصلاحية أو غير صحيح'
                : '→ Key expired or invalid'}
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Check className="text-emerald-500" size={20} />
          {isRTL ? 'أفضل الممارسات' : 'Best Practices'}
        </h3>
        <ul className="space-y-3 text-sm text-foreground/80">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              {isRTL 
                ? 'قم بتخزين مفاتيح API في متغيرات البيئة، وليس في الكود المصدري'
                : 'Store API keys in environment variables, not in source code'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              {isRTL 
                ? 'استخدم HTTPS دائماً عند إرسال رؤوس Authorization'
                : 'Always use HTTPS when sending Authorization headers'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              {isRTL 
                ? 'قم بتدوير مفاتيح API بانتظام للأمان'
                : 'Rotate API keys regularly for security'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              {isRTL 
                ? 'تحقق من رمز الاستجابة قبل معالجة البيانات'
                : 'Check response status code before processing data'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              {isRTL 
                ? 'لا تشارك مفاتيح API أبداً في السجلات أو منتديات الدعم'
                : 'Never share API keys in logs or support forums'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};