import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  Database,
  Shield,
  Users,
  CreditCard,
  FileText,
  Link,
  BarChart,
  Ticket,
  Settings,
  Zap,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useStore } from '../../lib/store';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface TestResult {
  id: string;
  category: string;
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error' | 'running';
  duration?: number;
  timestamp?: string;
  statusCode?: number;
  response?: any;
  error?: string;
}

interface TestCase {
  id: string;
  category: string;
  name: string;
  endpoint: string;
  method: string;
  requiresAuth: boolean;
  payload?: any;
  icon: any;
  color: string;
}

const testCases: TestCase[] = [
  // System Setup - يجب تشغيله أولاً
  {
    id: 'seed-admin',
    category: 'system',
    name: '⚡ إنشاء مستخدم Admin افتراضي',
    endpoint: '/seed-admin',
    method: 'POST',
    requiresAuth: false,
    icon: Shield,
    color: 'text-green-400'
  },

  // Authentication Tests
  {
    id: 'auth-signup',
    category: 'auth',
    name: 'تسجيل مستخدم جديد',
    endpoint: '/auth/signup',
    method: 'POST',
    requiresAuth: false,
    payload: {
      email: `test${Date.now()}@press2pay.test`,
      password: 'Test@123456',
      full_name: 'Test User',
      phone: '+201234567890'
    },
    icon: Shield,
    color: 'text-blue-400'
  },
  {
    id: 'auth-login',
    category: 'auth',
    name: 'تسجيل الدخول',
    endpoint: '/auth/login',
    method: 'POST',
    requiresAuth: false,
    payload: {
      email: 'admin@press2pay.com',
      password: 'Admin@123'
    },
    icon: Shield,
    color: 'text-blue-400'
  },
  {
    id: 'auth-session',
    category: 'auth',
    name: 'التحقق من الجلسة',
    endpoint: '/auth/verify',
    method: 'GET',
    requiresAuth: true,
    icon: Shield,
    color: 'text-blue-400'
  },

  // Users Tests
  {
    id: 'users-list',
    category: 'users',
    name: 'قائمة المستخدمين',
    endpoint: '/users',
    method: 'GET',
    requiresAuth: true,
    icon: Users,
    color: 'text-purple-400'
  },
  {
    id: 'users-create',
    category: 'users',
    name: 'إنشاء مستخدم',
    endpoint: '/users',
    method: 'POST',
    requiresAuth: true,
    payload: {
      email: `user${Date.now()}@press2pay.test`,
      password: 'User@123456',
      full_name: 'Test User API',
      role_id: 'role_user',
      phone: '+201234567891'
    },
    icon: Users,
    color: 'text-purple-400'
  },

  // Merchants Tests
  {
    id: 'merchants-list',
    category: 'merchants',
    name: 'قائمة التجار',
    endpoint: '/merchants',
    method: 'GET',
    requiresAuth: true,
    icon: CreditCard,
    color: 'text-amber-400'
  },
  {
    id: 'merchants-create',
    category: 'merchants',
    name: 'إنشاء تاجر',
    endpoint: '/merchants',
    method: 'POST',
    requiresAuth: true,
    payload: {
      business_name: `Test Merchant ${Date.now()}`,
      business_name_ar: `تاجر تجريبي ${Date.now()}`,
      email: `merchant${Date.now()}@test.com`,
      phone: '+201234567892',
      business_type: 'ecommerce',
      country: 'EG'
    },
    icon: CreditCard,
    color: 'text-amber-400'
  },

  // Wallets Tests
  {
    id: 'wallets-list',
    category: 'wallets',
    name: 'قائمة المحافظ',
    endpoint: '/wallets',
    method: 'GET',
    requiresAuth: true,
    icon: Database,
    color: 'text-green-400'
  },

  // Transactions Tests
  {
    id: 'transactions-list',
    category: 'transactions',
    name: 'قائمة المعاملات',
    endpoint: '/transactions',
    method: 'GET',
    requiresAuth: true,
    icon: Activity,
    color: 'text-rose-400'
  },
  {
    id: 'transactions-create',
    category: 'transactions',
    name: 'إنشاء معاملة',
    endpoint: '/transactions',
    method: 'POST',
    requiresAuth: true,
    payload: {
      merchant_id: 'merchant_1',
      amount: 100.00,
      currency: 'EGP',
      payment_method: 'card',
      customer_email: 'customer@test.com'
    },
    icon: Activity,
    color: 'text-rose-400'
  },

  // Forms Tests
  {
    id: 'forms-list',
    category: 'forms',
    name: 'قائمة النماذج',
    endpoint: '/forms',
    method: 'GET',
    requiresAuth: true,
    icon: FileText,
    color: 'text-cyan-400'
  },
  {
    id: 'forms-create',
    category: 'forms',
    name: 'إنشاء نموذج',
    endpoint: '/forms',
    method: 'POST',
    requiresAuth: true,
    payload: {
      name: `Test Form ${Date.now()}`,
      name_ar: `نموذج تجريبي ${Date.now()}`,
      type: 'payment',
      fields: []
    },
    icon: FileText,
    color: 'text-cyan-400'
  },

  // Payment Links Tests
  {
    id: 'payment-links-list',
    category: 'payment-links',
    name: 'قائمة روابط الدفع',
    endpoint: '/payment-links',
    method: 'GET',
    requiresAuth: true,
    icon: Link,
    color: 'text-indigo-400'
  },
  {
    id: 'payment-links-create',
    category: 'payment-links',
    name: 'إنشاء رابط دفع',
    endpoint: '/payment-links',
    method: 'POST',
    requiresAuth: true,
    payload: {
      title: `Test Link ${Date.now()}`,
      amount: 100.00,
      currency: 'EGP',
      merchant_id: 'merchant_1'
    },
    icon: Link,
    color: 'text-indigo-400'
  },

  // Reports Tests
  {
    id: 'reports-dashboard',
    category: 'reports',
    name: 'تقرير لوحة التحكم',
    endpoint: '/reports/dashboard',
    method: 'GET',
    requiresAuth: true,
    icon: BarChart,
    color: 'text-orange-400'
  },
  {
    id: 'reports-transactions',
    category: 'reports',
    name: 'تقرير المعاملات',
    endpoint: '/reports/transactions',
    method: 'GET',
    requiresAuth: true,
    icon: BarChart,
    color: 'text-orange-400'
  },

  // Tickets Tests
  {
    id: 'tickets-list',
    category: 'tickets',
    name: 'قائمة التذاكر',
    endpoint: '/tickets',
    method: 'GET',
    requiresAuth: true,
    icon: Ticket,
    color: 'text-pink-400'
  },
  {
    id: 'tickets-create',
    category: 'tickets',
    name: 'إنشاء تذكرة',
    endpoint: '/tickets',
    method: 'POST',
    requiresAuth: true,
    payload: {
      subject: `Test Ticket ${Date.now()}`,
      description: 'This is a test ticket',
      priority: 'medium',
      category: 'technical'
    },
    icon: Ticket,
    color: 'text-pink-400'
  },

  // Payment System Tests
  {
    id: 'gateways-list',
    category: 'payment-system',
    name: 'قائمة البوابات',
    endpoint: '/gateways',
    method: 'GET',
    requiresAuth: true,
    icon: Settings,
    color: 'text-violet-400'
  },
  {
    id: 'payment-methods-list',
    category: 'payment-system',
    name: 'قائمة طرق الدفع',
    endpoint: '/payment-methods',
    method: 'GET',
    requiresAuth: true,
    icon: Settings,
    color: 'text-violet-400'
  },

  // Roles Tests
  {
    id: 'roles-list',
    category: 'roles',
    name: 'قائمة الأدوار',
    endpoint: '/roles',
    method: 'GET',
    requiresAuth: true,
    icon: Shield,
    color: 'text-teal-400'
  },
  {
    id: 'permissions-list',
    category: 'roles',
    name: 'قائمة الصلاحيات',
    endpoint: '/permissions',
    method: 'GET',
    requiresAuth: true,
    icon: Shield,
    color: 'text-teal-400'
  },

  // Seed Data Test
  {
    id: 'seed-initial',
    category: 'system',
    name: 'تهيئة البيانات الأولية',
    endpoint: '/seed/initial',
    method: 'POST',
    requiresAuth: true,
    icon: Database,
    color: 'text-emerald-400'
  },
  {
    id: 'seed-sample',
    category: 'system',
    name: 'تهيئة البيانات التجريبية',
    endpoint: '/seed/sample',
    method: 'POST',
    requiresAuth: true,
    icon: Database,
    color: 'text-emerald-400'
  }
];

export function BackendTester() {
  const { user, lang } = useStore();
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');

  useEffect(() => {
    // Initialize results
    const initialResults = testCases.map(test => ({
      id: test.id,
      category: test.category,
      endpoint: test.endpoint,
      method: test.method,
      status: 'pending' as const
    }));
    setResults(initialResults);

    // Get access token from Supabase session
    const getAccessToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
      }
    };
    getAccessToken();
  }, [user]);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b`;

  const runTest = async (test: TestCase): Promise<TestResult> => {
    // Update status to running
    setResults(prev => 
      prev.map(r => r.id === test.id ? { ...r, status: 'running' as const } : r)
    );

    const startTime = Date.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      };

      // إذا كان الاختبار يتطلب مصادقة، أضف access_token
      if (test.requiresAuth) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const url = `${API_URL}${test.endpoint}`;
      const options: RequestInit = {
        method: test.method,
        headers,
      };

      if (test.payload && (test.method === 'POST' || test.method === 'PUT')) {
        options.body = JSON.stringify(test.payload);
      }

      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      const data = await response.json();

      // إذا كان اختبار تسجيل دخول ناجح، احفظ التوكن
      if (test.id === 'auth-login' && response.ok && data.session?.access_token) {
        // استخدم Supabase client لتعيين الجلسة
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        toast.success('✅ تم حفظ التوكن للاختبارات القادمة');
      }

      const result: TestResult = {
        id: test.id,
        category: test.category,
        endpoint: test.endpoint,
        method: test.method,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        duration,
        timestamp: new Date().toISOString(),
        response: data,
        error: response.ok ? undefined : data.error || 'Request failed'
      };

      // Update results array
      setResults(prev => 
        prev.map(r => r.id === test.id ? result : r)
      );

      if (response.ok) {
        toast.success(`✅ ${test.name} نجح`);
      } else {
        toast.error(`❌ ${test.name} فشل`);
      }

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        id: test.id,
        category: test.category,
        endpoint: test.endpoint,
        method: test.method,
        status: 'error',
        duration,
        timestamp: new Date().toISOString(),
        error: error.message
      };

      setResults(prev => 
        prev.map(r => r.id === test.id ? result : r)
      );

      toast.error(`❌ ${test.name} فشل: ${error.message}`);
      return result;
    }
  };

  const handleRunTest = async (testCase: TestCase) => {
    await runTest(testCase);
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    
    const filteredTests = selectedCategory === 'all' 
      ? testCases 
      : testCases.filter(t => t.category === selectedCategory);

    for (const testCase of filteredTests) {
      await handleRunTest(testCase);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunningAll(false);
    toast.success('✅ اكتملت جميع الاختبارات');
  };

  const handleExportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backend-test-results-${Date.now()}.json`;
    link.click();
    toast.success('تم تصدير النتائج');
  };

  const categories = [
    { id: 'all', name: 'الك��', icon: Activity },
    { id: 'auth', name: 'المصادقة', icon: Shield },
    { id: 'users', name: 'المستخدمين', icon: Users },
    { id: 'merchants', name: 'التجار', icon: CreditCard },
    { id: 'wallets', name: 'المحافظ', icon: Database },
    { id: 'transactions', name: 'المعاملات', icon: Activity },
    { id: 'forms', name: 'النماذج', icon: FileText },
    { id: 'payment-links', name: 'روابط الدفع', icon: Link },
    { id: 'reports', name: 'التقارير', icon: BarChart },
    { id: 'tickets', name: 'التذاكر', icon: Ticket },
    { id: 'payment-system', name: 'نظام الدفع', icon: Settings },
    { id: 'roles', name: 'الأدوار', icon: Shield },
    { id: 'system', name: 'النظام', icon: Database }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'running': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'running': return <RefreshCw className="w-5 h-5 animate-spin" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const stats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    error: results.filter(r => r.status === 'error').length,
    pending: results.filter(r => r.status === 'pending').length,
    running: results.filter(r => r.status === 'running').length
  };

  const filteredResults = selectedCategory === 'all'
    ? results
    : results.filter(r => r.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        {/* Important Notice */}
        <Card className="mb-6 bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-400 mb-2 flex items-center gap-2">
                🔐 إعداد النظام السريع
              </h3>
              <div className="space-y-2 text-green-300/90">
                <p className="font-semibold">
                  لتشغيل الاختبارات، اتبع هذه الخطوات بالترتيب:
                </p>
                <ol className="list-decimal list-inside space-y-1 mr-4">
                  <li>شغّل اختبار "⚡ إنشاء مستخدم Admin افتراضي" أولاً (في فئة النظام)</li>
                  <li>⚡ <strong>سيتم تحديث كلمة المرور تلقائياً</strong> إذا كان المستخدم موجود</li>
                  <li>ثم شغّل اختبار "تسجيل الدخول" (في فئة المصادقة)</li>
                  <li>بعد نجاح تسجيل الدخول، يمكنك تشغيل باقي الاختبارات</li>
                </ol>
                <div className="mt-3 p-3 bg-black/30 rounded border border-green-500/20">
                  <p className="text-sm font-mono">
                    📧 البريد: <span className="text-white">admin@press2pay.com</span><br/>
                    🔑 الرقم السري: <span className="text-white">Admin@123</span>
                  </p>
                </div>
                <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                  <p className="text-xs text-amber-300 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span><strong>ميزة جديدة:</strong> الاختبار الأول سيحدث كلمة المرور تلقائياً لضمان عمل تسجيل الدخول!</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent mb-2">
              🧪 اختبار Backend الشامل
            </h1>
            <p className="text-gray-400">
              اختبر جميع APIs ووظائف Press2Pay Backend
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleExportResults}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير النتائج
            </Button>
            
            <Button
              onClick={handleRunAll}
              disabled={isRunningAll}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              {isRunningAll ? (
                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 ml-2" />
              )}
              تشغيل جميع الاختبارات
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">إجمالي الاختبارات</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">نجح</p>
                <p className="text-2xl font-bold text-green-400">{stats.success}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">فشل</p>
                <p className="text-2xl font-bold text-red-400">{stats.error}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm">قيد التشغيل</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.running}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-600/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">قيد الانتظار</p>
                <p className="text-2xl font-bold text-gray-400">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className={selectedCategory === cat.id 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' 
                  : 'border-gray-700 hover:border-amber-500/50'}
              >
                <Icon className="w-4 h-4 ml-2" />
                {cat.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Test Cases Grid */}
      <div className="grid gap-4">
        {testCases
          .filter(test => selectedCategory === 'all' || test.category === selectedCategory)
          .map(test => {
            const result = results.find(r => r.id === test.id);
            const Icon = test.icon;

            return (
              <Card
                key={test.id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-amber-500/50 transition-all p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg bg-gray-800/50 border border-gray-700 ${test.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{test.name}</h3>
                        <Badge variant="outline" className="text-gray-400 border-gray-600">
                          {test.method}
                        </Badge>
                        {test.requiresAuth && (
                          <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                            <Shield className="w-3 h-3 ml-1" />
                            يتطلب مصادقة
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-400 mb-3 font-mono">
                        {test.endpoint}
                      </p>

                      {result?.status !== 'pending' && result && (
                        <div className="space-y-2 mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">الحالة:</span>
                            <Badge className={getStatusColor(result.status)}>
                              {getStatusIcon(result.status)}
                              <span className="mr-2">
                                {result.status === 'success' ? 'نجح' : 
                                 result.status === 'error' ? 'فشل' : 
                                 result.status === 'running' ? 'قيد التشغيل' : 'قيد الانتظار'}
                              </span>
                            </Badge>
                          </div>

                          {result.statusCode && (
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">كود الحالة:</span>
                              <Badge variant="outline" className={
                                result.statusCode < 300 ? 'text-green-400 border-green-500/30' :
                                result.statusCode < 400 ? 'text-yellow-400 border-yellow-500/30' :
                                'text-red-400 border-red-500/30'
                              }>
                                {result.statusCode}
                              </Badge>
                            </div>
                          )}

                          {result.duration && (
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">المدة:</span>
                              <span className="text-white">{result.duration}ms</span>
                            </div>
                          )}

                          {result.timestamp && (
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">الوقت:</span>
                              <span className="text-white">
                                {new Date(result.timestamp).toLocaleString('ar-EG')}
                              </span>
                            </div>
                          )}

                          {result.error && (
                            <div className="mt-2">
                              <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                                {result.error}
                              </p>
                            </div>
                          )}

                          {result.response && (
                            <details className="mt-2">
                              <summary className="text-sm text-amber-400 cursor-pointer hover:text-amber-300">
                                عرض الاستجابة
                              </summary>
                              <pre className="mt-2 text-xs text-gray-300 bg-black/50 p-3 rounded overflow-x-auto border border-gray-700">
                                {JSON.stringify(result.response, null, 2)}
                              </pre>
                            </details>
                          )}

                          {test.payload && (
                            <details className="mt-2">
                              <summary className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">
                                عرض البيانات المرسلة
                              </summary>
                              <pre className="mt-2 text-xs text-gray-300 bg-black/50 p-3 rounded overflow-x-auto border border-gray-700">
                                {JSON.stringify(test.payload, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRunTest(test)}
                    disabled={result?.status === 'running' || isRunningAll}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  >
                    {result?.status === 'running' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
      </div>

      {/* Warning if not authenticated */}
      {!accessToken && (
        <Card className="mt-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30 p-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-1">
                ⚠️ تحذير: غير مصادق
              </h3>
              <p className="text-yellow-300/80">
                بعض الاختبارات تتطلب المصادقة. يرجى تسجيل الدخول أولاً لتشغيل جميع الاختبارات.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default BackendTester;