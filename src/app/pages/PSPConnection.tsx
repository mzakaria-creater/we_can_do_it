/**
 * PSP Connection Setup - صفحة إعداد اتصال مزود خدمة الدفع
 * بوابة دفع فاخرة Press2Pay - تكوين متعدد التبويبات لربط PSP
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Webhook,
  FileText,
  Code,
  Shield,
  Check,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  TestTube,
  Save,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Zap,
  Lock,
  Key,
  Globe,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';

interface ConnectionConfig {
  merchantId: string;
  apiPublicKey: string;
  secretKey: string;
  environment: 'sandbox' | 'production';
  timeout: number;
  baseUrl: string;
}

interface WebhookConfig {
  endpointUrl: string;
  signingSecret: string;
  events: string[];
}

interface WebFormConfig {
  logoUrl: string;
  primaryColor: string;
  language: 'ar' | 'en';
  successUrl: string;
  failureUrl: string;
  cancelUrl: string;
}

export const PSPConnection = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const isRTL = language === 'ar';

  // States for different configurations
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
    merchantId: '',
    apiPublicKey: '',
    secretKey: '',
    environment: 'sandbox',
    timeout: 30,
    baseUrl: 'https://sandbox-api.goldex-psp.com/v1',
  });

  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    endpointUrl: '',
    signingSecret: '',
    events: [],
  });

  const [webFormConfig, setWebFormConfig] = useState<WebFormConfig>({
    logoUrl: '',
    primaryColor: '#D4AF37',
    language: 'ar',
    successUrl: '',
    failureUrl: '',
    cancelUrl: '',
  });

  const [showSecrets, setShowSecrets] = useState({
    apiKey: false,
    secretKey: false,
    webhookSecret: false,
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('connection');

  // Available webhook events
  const webhookEvents = [
    { id: 'payment.captured', label: { ar: 'تم استلام الدفعة', en: 'Payment Captured' } },
    { id: 'payment.failed', label: { ar: 'فشل الدفع', en: 'Payment Failed' } },
    { id: 'refund.processed', label: { ar: 'تمت معالجة الاسترداد', en: 'Refund Processed' } },
    { id: 'payout.initiated', label: { ar: 'بدأ السحب', en: 'Payout Initiated' } },
    { id: 'payout.completed', label: { ar: 'اكتمل السحب', en: 'Payout Completed' } },
    { id: 'dispute.opened', label: { ar: 'فتح نزاع', en: 'Dispute Opened' } },
    { id: 'settlement.completed', label: { ar: 'اكتملت التسوية', en: 'Settlement Completed' } },
  ];

  // Handle connection test
  const handleTestConnection = async () => {
    setTestStatus('testing');
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    if (connectionConfig.merchantId && connectionConfig.apiPublicKey && connectionConfig.secretKey) {
      setTestStatus('success');
      toast.success(
        isRTL ? 'تم الاتصال بنجاح!' : 'Connection successful!',
        { description: isRTL ? 'تم التحقق من بيانات الاعتماد' : 'Credentials verified' }
      );
    } else {
      setTestStatus('error');
      toast.error(
        isRTL ? 'فشل الاتصال' : 'Connection failed',
        { description: isRTL ? 'يرجى التحقق من بيانات الاعتماد' : 'Please check your credentials' }
      );
    }
  };

  // Handle save configuration
  const handleSaveConnection = () => {
    toast.success(
      isRTL ? 'تم حفظ الإعدادات' : 'Settings saved',
      { description: isRTL ? 'تم حفظ تكوين الاتصال بنجاح' : 'Connection configuration saved successfully' }
    );
  };

  const handleSaveWebhook = () => {
    toast.success(
      isRTL ? 'تم حفظ Webhook' : 'Webhook saved',
      { description: isRTL ? 'تم حفظ إعدادات الـ Webhook بنجاح' : 'Webhook settings saved successfully' }
    );
  };

  const handleSaveWebForm = () => {
    toast.success(
      isRTL ? 'تم حفظ النموذج' : 'Form saved',
      { description: isRTL ? 'تم حفظ إعدادات النموذج بنجاح' : 'Form settings saved successfully' }
    );
  };

  // Copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isRTL ? 'تم النسخ!' : 'Copied!');
  };

  // Generate signing secret
  const generateSecret = () => {
    const secret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setWebhookConfig({ ...webhookConfig, signingSecret: secret });
    toast.success(isRTL ? 'تم إنشاء المفتاح السري' : 'Secret generated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <PageHeader
        title={isRTL ? 'إعداد اتصال PSP' : 'PSP Connection Setup'}
        subtitle={isRTL ? 'تكوين اتصال مزود خدمة الدفع الخاص بك' : 'Configure your Payment Service Provider connection'}
        icon={<Settings className="w-6 h-6" />}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-2 border-amber-200/50 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent mb-2">
                    {isRTL ? '🪙 بوابة Goldex PSP الفاخرة' : '🪙 Goldex PSP Premium Gateway'}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {isRTL
                      ? 'قم بإعداد اتصال آمن ومحمي مع بوابة الدفع الأكثر موثوقية في منطقة الشرق الأوسط وشمال أفريقيا. معالجة فورية، حماية متقدمة، ودعم متعدد العملات.'
                      : 'Set up a secure and protected connection with the most reliable payment gateway in the MENA region. Instant processing, advanced protection, and multi-currency support.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {isRTL ? 'معتمد من PCI-DSS' : 'PCI-DSS Certified'}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                      <Shield className="w-3 h-3 mr-1" />
                      {isRTL ? 'تشفير 256-bit' : '256-bit Encryption'}
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
                      <Zap className="w-3 h-3 mr-1" />
                      {isRTL ? 'معالجة فورية' : 'Real-time Processing'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 gap-4 bg-slate-100/50 p-2 rounded-xl">
            <TabsTrigger
              value="connection"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              {isRTL ? 'الاتصال الأساسي' : 'Custom Connection'}
            </TabsTrigger>
            <TabsTrigger
              value="webhooks"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Webhook className="w-4 h-4 mr-2" />
              {isRTL ? 'الإشعارات الواردة' : 'Incoming Webhooks'}
            </TabsTrigger>
            <TabsTrigger
              value="webforms"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isRTL ? 'نماذج الويب' : 'Web Forms'}
            </TabsTrigger>
            <TabsTrigger
              value="api"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Code className="w-4 h-4 mr-2" />
              {isRTL ? 'استخدام API' : 'API Usage'}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Custom Connection */}
          <TabsContent value="connection" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-purple-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-200">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    {isRTL ? '🔵 إعداد الاتصال الأساسي' : '🔵 Custom Connection Setup'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL
                      ? 'قم بتكوين معلمات الاتصال الأساسية لتكامل Goldex PSP الخاص بك'
                      : 'Configure the core connection parameters for your Goldex PSP integration'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Step 1: Basic Authentication */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                        1
                      </span>
                      {isRTL ? 'المصادقة الأساسية' : 'Basic Authentication'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {isRTL
                        ? 'املأ بيانات الاعتماد المقدمة في لوحة تحكم تاجر Goldex الخاصة بك.'
                        : 'Fill in the credentials provided in your Goldex Merchant Dashboard.'}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Merchant ID */}
                      <div className="space-y-2">
                        <Label htmlFor="merchantId" className="flex items-center gap-2">
                          {isRTL ? 'معرف التاجر' : 'Merchant ID'}
                          <Badge variant="destructive" className="text-xs">
                            {isRTL ? 'مطلوب' : 'Required'}
                          </Badge>
                        </Label>
                        <Input
                          id="merchantId"
                          value={connectionConfig.merchantId}
                          onChange={(e) =>
                            setConnectionConfig({ ...connectionConfig, merchantId: e.target.value })
                          }
                          placeholder={isRTL ? 'مثال: MCH_1234567890' : 'e.g., MCH_1234567890'}
                          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        />
                        <p className="text-xs text-slate-500">
                          {isRTL ? 'معرّفك الفريد في Goldex' : 'Your unique Goldex identifier'}
                        </p>
                      </div>

                      {/* Environment */}
                      <div className="space-y-2">
                        <Label htmlFor="environment" className="flex items-center gap-2">
                          {isRTL ? 'البيئة' : 'Environment'}
                          <Badge variant="destructive" className="text-xs">
                            {isRTL ? 'مطلوب' : 'Required'}
                          </Badge>
                        </Label>
                        <Select
                          value={connectionConfig.environment}
                          onValueChange={(value: 'sandbox' | 'production') => {
                            setConnectionConfig({
                              ...connectionConfig,
                              environment: value,
                              baseUrl:
                                value === 'sandbox'
                                  ? 'https://sandbox-api.goldex-psp.com/v1'
                                  : 'https://api.goldex-psp.com/v1',
                            });
                          }}
                        >
                          <SelectTrigger className="border-purple-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">
                              🧪 {isRTL ? 'بيئة الاختبار (Sandbox)' : 'Sandbox (Testing)'}
                            </SelectItem>
                            <SelectItem value="production">
                              🚀 {isRTL ? 'البيئة الحقيقية (Production)' : 'Production (Live)'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                          {isRTL
                            ? 'استخدم Sandbox للاختبار، Production للمباشر'
                            : 'Use Sandbox for testing, Production for live'}
                        </p>
                      </div>

                      {/* API Public Key */}
                      <div className="space-y-2">
                        <Label htmlFor="apiKey" className="flex items-center gap-2">
                          {isRTL ? 'مفتاح API العام' : 'API Public Key'}
                          <Badge variant="destructive" className="text-xs">
                            {isRTL ? 'مطلوب' : 'Required'}
                          </Badge>
                        </Label>
                        <div className="relative">
                          <Input
                            id="apiKey"
                            type={showSecrets.apiKey ? 'text' : 'password'}
                            value={connectionConfig.apiPublicKey}
                            onChange={(e) =>
                              setConnectionConfig({ ...connectionConfig, apiPublicKey: e.target.value })
                            }
                            placeholder="pk_live_••••••••••••••••"
                            className="border-purple-200 focus:border-purple-400 pr-20"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSecrets({ ...showSecrets, apiKey: !showSecrets.apiKey })}
                            >
                              {showSecrets.apiKey ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          {isRTL ? 'يستخدم للتشفير من جانب العميل' : 'Used for client-side encryption'}
                        </p>
                      </div>

                      {/* Secret Key */}
                      <div className="space-y-2">
                        <Label htmlFor="secretKey" className="flex items-center gap-2">
                          {isRTL ? 'المفتاح السري' : 'Secret Key'}
                          <Badge variant="destructive" className="text-xs">
                            {isRTL ? 'مطلوب' : 'Required'}
                          </Badge>
                        </Label>
                        <div className="relative">
                          <Input
                            id="secretKey"
                            type={showSecrets.secretKey ? 'text' : 'password'}
                            value={connectionConfig.secretKey}
                            onChange={(e) =>
                              setConnectionConfig({ ...connectionConfig, secretKey: e.target.value })
                            }
                            placeholder="sk_live_••••••••••••••••"
                            className="border-purple-200 focus:border-purple-400 pr-20"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setShowSecrets({ ...showSecrets, secretKey: !showSecrets.secretKey })
                              }
                            >
                              {showSecrets.secretKey ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          {isRTL
                            ? 'احتفظ بهذا خاصًا. يُستخدم للمكالمات من الخادم إلى الخادم'
                            : 'Keep this private. Used for server-to-server calls'}
                        </p>
                      </div>

                      {/* Base URL */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="baseUrl" className="flex items-center gap-2">
                          {isRTL ? 'عنوان URL الأساسي' : 'Base Endpoint URL'}
                          <Badge variant="secondary" className="text-xs">
                            {isRTL ? 'تلقائي' : 'Auto'}
                          </Badge>
                        </Label>
                        <Input
                          id="baseUrl"
                          value={connectionConfig.baseUrl}
                          readOnly
                          className="border-purple-200 bg-slate-50"
                        />
                        <p className="text-xs text-slate-500">
                          {isRTL
                            ? 'يتم تعيينه تلقائيًا بناءً على البيئة المحددة'
                            : 'Automatically set based on selected environment'}
                        </p>
                      </div>

                      {/* Timeout */}
                      <div className="space-y-2">
                        <Label htmlFor="timeout">{isRTL ? 'مهلة الطلب (بالثواني)' : 'Request Timeout (seconds)'}</Label>
                        <Input
                          id="timeout"
                          type="number"
                          min="5"
                          max="120"
                          value={connectionConfig.timeout}
                          onChange={(e) =>
                            setConnectionConfig({ ...connectionConfig, timeout: parseInt(e.target.value) })
                          }
                          className="border-purple-200"
                        />
                        <p className="text-xs text-slate-500">
                          {isRTL
                            ? 'المدة التي يجب انتظارها للحصول على استجابة قبل انتهاء المهلة'
                            : 'How long to wait for a response before timing out'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Step 2: Test Connection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                        2
                      </span>
                      {isRTL ? 'اختبار الاتصال' : 'Test Connection'}
                    </h3>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">
                          {isRTL
                            ? 'انقر فوق "اختبار الاتصال" للتحقق من صحة بيانات الاعتماد وإمكانية الوصول. سيؤدي هذا إلى إجراء مكالمة آمنة إلى Goldex PSP.'
                            : 'Click "Test Connection" to validate credentials and reachability. This will make a secure call to Goldex PSP.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleTestConnection}
                        disabled={testStatus === 'testing'}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                      >
                        {testStatus === 'testing' ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            {isRTL ? 'جاري الاختبار...' : 'Testing...'}
                          </>
                        ) : (
                          <>
                            <TestTube className="w-4 h-4 mr-2" />
                            {isRTL ? 'اختبار الاتصال' : 'Test Connection'}
                          </>
                        )}
                      </Button>

                      <AnimatePresence mode="wait">
                        {testStatus === 'success' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 text-emerald-600"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">
                              {isRTL ? 'الاتصال ناجح!' : 'Connection successful!'}
                            </span>
                          </motion.div>
                        )}
                        {testStatus === 'error' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">{isRTL ? 'فشل الاتصال' : 'Connection failed'}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Step 3: Save Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                        3
                      </span>
                      {isRTL ? 'حفظ التكوين' : 'Save Configuration'}
                    </h3>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveConnection}
                        disabled={testStatus !== 'success'}
                        size="lg"
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isRTL ? 'حفظ الاتصال' : 'Save Connection'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tab 2: Incoming Webhooks */}
          <TabsContent value="webhooks" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-indigo-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b border-indigo-200">
                  <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                      <Webhook className="w-5 h-5 text-white" />
                    </div>
                    {isRTL ? '🟣 تكوين الإشعارات الواردة' : '🟣 Incoming Webhooks Configuration'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL
                      ? 'قم بإعداد نقاط النهاية الآمنة لتلقي إشعارات الأحداث في الوقت الفعلي من Goldex'
                      : 'Set up secure endpoints to receive real-time event notifications from Goldex'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Info Banner */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-indigo-900 mb-1">
                          {isRTL ? '💡 المفهوم الأساسي' : '💡 Key Concept'}
                        </h4>
                        <p className="text-sm text-indigo-700">
                          {isRTL
                            ? 'تتيح الـ Webhooks لـ Goldex إخطار نظامك فورًا بشأن الأحداث مثل المدفوعات الناجحة أو عمليات رد المبالغ المدفوعة أو التسويات، مما يلغي الحاجة إلى الاستقصاء المستمر.'
                            : 'Webhooks allow Goldex to notify your system immediately about events like successful payments, chargebacks, or settlements, eliminating the need for constant polling.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Define Target URL */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                        1
                      </span>
                      {isRTL ? 'تحديد عنوان URL المستهدف' : 'Define Target URL'}
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhookUrl" className="flex items-center gap-2">
                          {isRTL ? 'عنوان URL لمستمع الـ Webhook' : 'Webhook Listener URL'}
                          <Badge variant="destructive" className="text-xs">
                            {isRTL ? 'مطلوب' : 'Required'}
                          </Badge>
                        </Label>
                        <Input
                          id="webhookUrl"
                          type="url"
                          value={webhookConfig.endpointUrl}
                          onChange={(e) => setWebhookConfig({ ...webhookConfig, endpointUrl: e.target.value })}
                          placeholder="https://yourdomain.com/goldex/listener"
                          className="border-indigo-200 focus:border-indigo-400"
                        />
                        <p className="text-xs text-slate-500">
                          {isRTL
                            ? 'أدخل عنوان URL العام حيث سيستمع الخادم الخاص بك لطلبات POST من Goldex'
                            : 'Enter the public URL where your server will listen for POST requests from Goldex'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="webhookSecret" className="flex items-center gap-2">
                          {isRTL ? 'مفتاح توقيع الـ Webhook' : 'Webhook Signing Secret'}
                          <Badge variant="destructive" className="text-xs">
                            {isRTL ? 'مطلوب' : 'Required'}
                          </Badge>
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="webhookSecret"
                              type={showSecrets.webhookSecret ? 'text' : 'password'}
                              value={webhookConfig.signingSecret}
                              onChange={(e) =>
                                setWebhookConfig({ ...webhookConfig, signingSecret: e.target.value })
                              }
                              placeholder="whsec_••••••••••••••••"
                              className="border-indigo-200 focus:border-indigo-400 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute inset-y-0 right-0"
                              onClick={() =>
                                setShowSecrets({ ...showSecrets, webhookSecret: !showSecrets.webhookSecret })
                              }
                            >
                              {showSecrets.webhookSecret ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <Button onClick={generateSecret} variant="outline" className="border-indigo-300">
                            <Key className="w-4 h-4 mr-2" />
                            {isRTL ? 'توليد' : 'Generate'}
                          </Button>
                          {webhookConfig.signingSecret && (
                            <Button
                              onClick={() => handleCopy(webhookConfig.signingSecret)}
                              variant="outline"
                              className="border-indigo-300"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {isRTL
                            ? 'قم بإنشاء وإدخال المفتاح السري المشترك الخاص بك'
                            : 'Generate and enter your shared secret'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Step 2: Select Event Types */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                        2
                      </span>
                      {isRTL ? 'تحديد أنواع الأحداث' : 'Select Event Types'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {isRTL
                        ? 'اختر أحداث الدفع التي تريد الاشتراك فيها:'
                        : 'Choose which payment events you want to subscribe to:'}
                    </p>

                    <div className="grid md:grid-cols-2 gap-3">
                      {webhookEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start space-x-2 space-x-reverse border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                        >
                          <Checkbox
                            id={event.id}
                            checked={webhookConfig.events.includes(event.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setWebhookConfig({
                                  ...webhookConfig,
                                  events: [...webhookConfig.events, event.id],
                                });
                              } else {
                                setWebhookConfig({
                                  ...webhookConfig,
                                  events: webhookConfig.events.filter((e) => e !== event.id),
                                });
                              }
                            }}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={event.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {event.label[language]}
                            </Label>
                            <p className="text-xs text-slate-500 mt-1">{event.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Step 3: Verify Signature */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                        3
                      </span>
                      {isRTL ? 'التحقق من التوقيع' : 'Verify Signature'}
                    </h3>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-900 mb-1">
                            {isRTL ? 'تنبيه أمني' : 'Security Alert'}
                          </h4>
                          <p className="text-sm text-red-700">
                            {isRTL
                              ? 'تأكد من أن تطبيق الخادم الخاص بك يتحقق من ترويسة X-Goldex-Signature مقابل مفتاح التوقيع الخاص بك لتأكيد الأصالة. لا تقم أبدًا بمعالجة webhook دون التحقق من التوقيع التشفيري.'
                              : 'Ensure your server implementation verifies the X-Goldex-Signature header against your Signing Secret to confirm authenticity. Never process a webhook without verifying the cryptographic signature.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {isRTL ? 'مثال على كود التحقق (Node.js):' : 'Verification Code Example (Node.js):'}
                      </h4>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                        {`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return hmac === signature;
}`}
                      </pre>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveWebhook}
                      size="lg"
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isRTL ? 'حفظ إعدادات Webhook' : 'Save Webhook Configuration'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tab 3: Web Forms */}
          <TabsContent value="webforms" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-teal-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100/50 border-b border-teal-200">
                  <CardTitle className="flex items-center gap-2 text-teal-900">
                    <div className="p-2 bg-teal-500 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    {isRTL ? '🟢 تكوين نماذج الويب' : '🟢 Web Forms Configuration'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL
                      ? 'تخصيص مظهر وسلوك صفحات الدفع المستضافة التي توفرها Goldex'
                      : 'Customize the look and behavior of the hosted payment pages provided by Goldex'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Info Banner */}
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-teal-500 rounded-lg">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-teal-900 mb-1">
                          {isRTL ? '💡 المفهوم الأساسي' : '💡 Key Concept'}
                        </h4>
                        <p className="text-sm text-teal-700">
                          {isRTL
                            ? 'توفر نماذج الويب طريقة آمنة ومتوافقة مع PCI للعملاء لإدخال تفاصيل الدفع دون أن تلمس البيانات الحساسة خوادمك.'
                            : 'Web Forms offer a secure, PCI-compliant way for customers to enter payment details without sensitive data ever touching your servers.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Styling Customization */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-sm">
                        1
                      </span>
                      {isRTL ? 'تخصيص الهوية البصرية' : 'Styling Customization'}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="formLogo" className="flex items-center gap-2">
                          {isRTL ? 'تحميل شعار النموذج' : 'Upload Form Logo'}
                          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                            {isRTL ? 'اختياري' : 'Optional'}
                          </Badge>
                        </Label>
                        <Input
                          id="formLogo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setWebFormConfig({ ...webFormConfig, logoUrl: event.target?.result as string });
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                          className="border-teal-200"
                        />
                        {webFormConfig.logoUrl && (
                          <div className="mt-2 p-2 border border-teal-200 rounded-lg bg-white">
                            <img
                              src={webFormConfig.logoUrl}
                              alt="Logo preview"
                              className="h-12 object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {/* Primary Color */}
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">
                          {isRTL ? 'اللون الأساسي (الأزرار / التمييزات)' : 'Primary Color (Buttons/Highlights)'}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={webFormConfig.primaryColor}
                            onChange={(e) => setWebFormConfig({ ...webFormConfig, primaryColor: e.target.value })}
                            className="w-20 h-10 border-teal-200"
                          />
                          <Input
                            type="text"
                            value={webFormConfig.primaryColor}
                            onChange={(e) => setWebFormConfig({ ...webFormConfig, primaryColor: e.target.value })}
                            className="flex-1 border-teal-200"
                          />
                        </div>
                      </div>

                      {/* Default Language */}
                      <div className="space-y-2">
                        <Label htmlFor="formLanguage">{isRTL ? 'اللغة الافتراضية' : 'Default Language'}</Label>
                        <Select
                          value={webFormConfig.language}
                          onValueChange={(value: 'ar' | 'en') =>
                            setWebFormConfig({ ...webFormConfig, language: value })
                          }
                        >
                          <SelectTrigger className="border-teal-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ar">🇸🇦 العربية (Arabic)</SelectItem>
                            <SelectItem value="en">🇬🇧 English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Step 2: Redirect Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-sm">
                        2
                      </span>
                      {isRTL ? 'تكوين إعادة التوجيه' : 'Redirect Configuration'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {isRTL ? 'حدد أين يتم إرسال العميل بعد الدفع:' : 'Define where the customer is sent after payment:'}
                    </p>

                    <div className="space-y-4">
                      {/* Success URL */}
                      <div className="space-y-2">
                        <Label htmlFor="successUrl" className="flex items-center gap-2">
                          {isRTL ? 'عنوان URL لإعادة التوجيه عند النجاح' : 'Success Redirect URL'}
                          <Badge variant="destructive" className="text-xs">
                            {isRTL ? 'مطلوب' : 'Required'}
                          </Badge>
                        </Label>
                        <Input
                          id="successUrl"
                          type="url"
                          value={webFormConfig.successUrl}
                          onChange={(e) => setWebFormConfig({ ...webFormConfig, successUrl: e.target.value })}
                          placeholder="https://yourdomain.com/payment/success"
                          className="border-teal-200 focus:border-teal-400"
                        />
                        <p className="text-xs text-slate-500">
                          {isRTL ? 'عنوان URL بعد الدفع الناجح' : 'URL after successful payment'}
                        </p>
                      </div>

                      {/* Failure URL */}
                      <div className="space-y-2">
                        <Label htmlFor="failureUrl" className="flex items-center gap-2">
                          {isRTL ? 'عنوان URL لإعادة التوجيه عند الفشل' : 'Failure Redirect URL'}
                          <Badge variant="destructive" className="text-xs">
                            {isRTL ? 'مطلوب' : 'Required'}
                          </Badge>
                        </Label>
                        <Input
                          id="failureUrl"
                          type="url"
                          value={webFormConfig.failureUrl}
                          onChange={(e) => setWebFormConfig({ ...webFormConfig, failureUrl: e.target.value })}
                          placeholder="https://yourdomain.com/payment/failed"
                          className="border-teal-200 focus:border-teal-400"
                        />
                        <p className="text-xs text-slate-500">
                          {isRTL ? 'عنوان URL بعد فشل الدفع' : 'URL after failed payment'}
                        </p>
                      </div>

                      {/* Cancel URL */}
                      <div className="space-y-2">
                        <Label htmlFor="cancelUrl" className="flex items-center gap-2">
                          {isRTL ? 'عنوان URL لإعادة التوجيه عند الإلغاء' : 'Cancel Redirect URL'}
                          <Badge variant="secondary" className="text-xs bg-slate-100">
                            {isRTL ? 'اختياري' : 'Optional'}
                          </Badge>
                        </Label>
                        <Input
                          id="cancelUrl"
                          type="url"
                          value={webFormConfig.cancelUrl}
                          onChange={(e) => setWebFormConfig({ ...webFormConfig, cancelUrl: e.target.value })}
                          placeholder="https://yourdomain.com/payment/cancelled"
                          className="border-teal-200 focus:border-teal-400"
                        />
                        <p className="text-xs text-slate-500">
                          {isRTL ? 'عنوان URL عندما يلغي المستخدم العملية' : 'URL when user cancels the process'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Step 3: Integration Code */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-sm">
                        3
                      </span>
                      {isRTL ? 'كود التكامل' : 'Integration Code'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {isRTL
                        ? 'انسخ المقتطف أدناه والصقه قبل علامة الإغلاق </body> لصفحة الدفع الخاصة بك:'
                        : 'Copy the snippet below and paste it before the closing </body> tag of your checkout page:'}
                    </p>

                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                        {`<script src="https://checkout.goldex-psp.com/v1/sdk.js" 
        data-merchant-id="${connectionConfig.merchantId || 'YOUR_MERCHANT_ID'}"
        data-environment="${connectionConfig.environment}">
</script>

<script>
  GoldexCheckout.init({
    primaryColor: '${webFormConfig.primaryColor}',
    language: '${webFormConfig.language}',
    successUrl: '${webFormConfig.successUrl}',
    failureUrl: '${webFormConfig.failureUrl}',
    cancelUrl: '${webFormConfig.cancelUrl}'
  });
</script>`}
                      </pre>
                      <Button
                        onClick={() =>
                          handleCopy(
                            `<script src="https://checkout.goldex-psp.com/v1/sdk.js" data-merchant-id="${connectionConfig.merchantId || 'YOUR_MERCHANT_ID'}" data-environment="${connectionConfig.environment}"></script>`
                          )
                        }
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-white"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {isRTL ? 'نسخ' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveWebForm}
                      size="lg"
                      className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isRTL ? 'حفظ إعدادات النموذج' : 'Save Form Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tab 4: API Usage */}
          <TabsContent value="api" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-orange-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-orange-200">
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    {isRTL ? '🟠 دليل استخدام API' : '🟠 API Usage Guide'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL
                      ? 'تعليمات التكامل المباشر من الخادم إلى الخادم باستخدام Goldex REST API'
                      : 'Instructions for direct server-to-server integration using the Goldex REST API'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Info Banner */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-1">
                          {isRTL ? '💡 المفهوم الأساسي' : '💡 Key Concept'}
                        </h4>
                        <p className="text-sm text-orange-700">
                          {isRTL
                            ? 'يتطلب التكامل المباشر لـ API منك التعامل مع جميع بيانات البطاقة بشكل آمن (الامتثال لـ PCI) أو استخدام خدمة tokenization قبل إرسال الطلب إلى Goldex.'
                            : 'Direct API integration requires you to handle all card data capture securely (PCI compliance) or utilize a tokenization service before sending the request to Goldex.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Authentication */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                        1
                      </span>
                      {isRTL ? 'المصادقة' : 'Authentication'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {isRTL
                        ? 'يجب مصادقة جميع الطلبات باستخدام مفتاح API والمفتاح السري (من علامة تبويب الاتصال الأساسي) في ترويسة التفويض كرمز Bearer.'
                        : 'All requests must be authenticated using your API Key and Secret Key (from the Custom Connection tab) in the Authorization header as a Bearer token.'}
                    </p>

                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                        {`Authorization: Bearer ${connectionConfig.secretKey || 'YOUR_SECRET_KEY'}
Content-Type: application/json`}
                      </pre>
                      <Button
                        onClick={() => handleCopy(`Authorization: Bearer ${connectionConfig.secretKey}`)}
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-white"
                        disabled={!connectionConfig.secretKey}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {isRTL ? 'نسخ' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Step 2: Create Payment Request */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                        2
                      </span>
                      {isRTL ? 'إنشاء طلب دفع' : 'Create Payment Request'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {isRTL ? 'قم بإنشاء حمولة JSON للمعاملة:' : 'Construct a JSON payload for the transaction:'}
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {isRTL ? 'حقول الحمولة المطلوبة:' : 'Required Payload Fields:'}
                      </h4>
                      <ul className="space-y-1 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <code className="px-2 py-0.5 bg-slate-200 rounded text-xs">amount</code>
                          <span>{isRTL ? '(رقمي، مطلوب)' : '(Numeric, Required)'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <code className="px-2 py-0.5 bg-slate-200 rounded text-xs">currency</code>
                          <span>{isRTL ? '(كود ISO 4217، مطلوب)' : '(ISO 4217 Code, Required)'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <code className="px-2 py-0.5 bg-slate-200 rounded text-xs">order_id</code>
                          <span>{isRTL ? '(مرجع فريد، مطلوب)' : '(Unique reference, Required)'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <code className="px-2 py-0.5 bg-slate-200 rounded text-xs">customer_email</code>
                          <span>{isRTL ? '(للإيصالات)' : '(For receipts)'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <code className="px-2 py-0.5 bg-slate-200 rounded text-xs">payment_method</code>
                          <span>
                            {isRTL ? '(بيانات موثقة أو تفاصيل البطاقة المباشرة)' : '(Tokenized data or direct card details)'}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                        {`POST ${connectionConfig.baseUrl}/payments/charge

{
  "amount": 5000,
  "currency": "EGP",
  "order_id": "ORD_${Date.now()}",
  "customer_email": "customer@example.com",
  "payment_method": {
    "type": "card",
    "token": "tok_xxxxxxxxxx"
  },
  "metadata": {
    "merchant_ref": "INV-2025-001"
  }
}`}
                      </pre>
                      <Button
                        onClick={() =>
                          handleCopy(
                            `{\n  "amount": 5000,\n  "currency": "EGP",\n  "order_id": "ORD_${Date.now()}",\n  "customer_email": "customer@example.com"\n}`
                          )
                        }
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-white"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {isRTL ? 'نسخ' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Step 3: Send Request */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                        3
                      </span>
                      {isRTL ? 'إرسال الطلب' : 'Send Request'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {isRTL
                        ? 'أرسل طلب POST إلى نقطة النهاية ذات الصلة باستخدام عنوان URL الأساسي المكون مسبقًا:'
                        : 'Send a POST request to the relevant endpoint using the configured Base URL:'}
                    </p>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                        <h4 className="font-semibold text-sm mb-1">{isRTL ? 'إنشاء دفعة' : 'Create Payment'}</h4>
                        <code className="text-xs text-slate-600">POST /payments/charge</code>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                        <h4 className="font-semibold text-sm mb-1">{isRTL ? 'الحصول على حالة الدفع' : 'Get Payment Status'}</h4>
                        <code className="text-xs text-slate-600">GET /payments/:id</code>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                        <h4 className="font-semibold text-sm mb-1">{isRTL ? 'استرداد المبلغ' : 'Refund Payment'}</h4>
                        <code className="text-xs text-slate-600">POST /payments/:id/refund</code>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                        <h4 className="font-semibold text-sm mb-1">{isRTL ? 'قائمة المعاملات' : 'List Transactions'}</h4>
                        <code className="text-xs text-slate-600">GET /transactions</code>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Step 4: Handle Response */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                        4
                      </span>
                      {isRTL ? 'معالجة الاستجابة' : 'Handle Response'}
                    </h3>

                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                        {`// Success Response (200 OK)
{
  "status": "success",
  "transaction_id": "txn_abc123xyz",
  "amount": 5000,
  "currency": "EGP",
  "order_id": "ORD_1234567890",
  "payment_status": "captured",
  "created_at": "2026-02-20T15:30:00Z"
}

// Error Response (400/401/500)
{
  "status": "error",
  "error_code": "INVALID_CARD",
  "message": "The card number is invalid",
  "details": {
    "field": "payment_method.card_number"
  }
}`}
                      </pre>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        {isRTL
                          ? '✅ تحقق من حقل status للنجاح أو الفشل أو الحالة المعلقة، وسجل transaction_id لعمليات البحث المستقبلية.'
                          : '✅ Check the status field for success, failure, or pending status, and log the transaction_id for future lookups.'}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Full API Reference Link */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-1">
                          {isRTL ? '📚 مرجع API الكامل' : '📚 Full API Reference'}
                        </h4>
                        <p className="text-sm text-orange-700">
                          {isRTL
                            ? 'استكشف الوثائق الكاملة مع أمثلة التعليمات البرمجية والمعلمات والاستجابات'
                            : 'Explore the complete documentation with code examples, parameters, and responses'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-orange-300 hover:bg-orange-100"
                        onClick={() => window.open('https://docs.goldex-psp.com/api', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {isRTL ? 'عرض الوثائق' : 'View Documentation'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {isRTL ? '🆘 هل تحتاج إلى مساعدة؟' : '🆘 Need Help?'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold mb-2">{isRTL ? 'الوثائق الفنية' : 'Technical Docs'}</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    {isRTL ? 'متاح على مدار الساعة طوال أيام الأسبوع' : '24/7 Available'}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    {isRTL ? 'عرض الوثائق →' : 'View Documentation →'}
                  </Button>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold mb-2">{isRTL ? 'Slack المطورين' : 'Developer Slack'}</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    {isRTL ? 'الإثنين-الجمعة' : 'Mon-Fri'}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ArrowRight className="w-3 h-3 mr-2" />
                    {isRTL ? 'انضم إلى القناة →' : 'Join Channel →'}
                  </Button>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold mb-2">{isRTL ? 'دعم البريد الإلكتروني' : 'Email Support'}</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    {isRTL ? 'استجابة أقل من 4 ساعات' : '< 4hr response'}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ArrowRight className="w-3 h-3 mr-2" />
                    {isRTL ? 'اتصل بالدعم →' : 'Contact Support →'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
