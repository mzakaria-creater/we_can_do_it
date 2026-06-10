import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Book, Download, Code, Key, Shield, Zap, FileText, Globe, CreditCard, Webhook, CheckCircle, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const APIDocs = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const isRTL = language === 'ar';
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success(isRTL ? 'تم النسخ' : 'Copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Add logo and title
    doc.setFontSize(24);
    doc.setTextColor(212, 175, 55); // Gold
    doc.text('Press2Pay', 20, yPos);
    yPos += 10;

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Gateway API Documentation', 20, yPos);
    yPos += 15;

    // Overview
    doc.setFontSize(14);
    doc.setTextColor(212, 175, 55);
    doc.text('1. Overview', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const overviewText = 'Press2Pay provides a comprehensive RESTful API for payment processing across the MENA region. Our API allows merchants to accept payments, manage transactions, and handle settlements securely.';
    const splitOverview = doc.splitTextToSize(overviewText, 170);
    doc.text(splitOverview, 20, yPos);
    yPos += splitOverview.length * 5 + 10;

    doc.save('press2pay-api-documentation.pdf');
    toast.success(isRTL ? 'تم تصدير PDF بنجاح' : 'PDF exported successfully');
  };

  const sections = [
    { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: Book },
    { id: 'authentication', label: isRTL ? 'المصادقة' : 'Authentication', icon: Key },
    { id: 'quickstart', label: isRTL ? 'البدء السريع' : 'Quick Start', icon: Zap },
    { id: 'endpoints', label: isRTL ? 'نقاط النهاية' : 'Endpoints', icon: Code },
    { id: 'webhooks', label: isRTL ? 'الويب هوكس' : 'Webhooks', icon: Webhook },
    { id: 'security-advanced', label: isRTL ? 'الأمان المتقدم' : 'Advanced Security', icon: Shield },
    { id: 'integration', label: isRTL ? 'دليل التكامل' : 'Integration Guide', icon: Globe },
    { id: 'merchant', label: isRTL ? 'إعداد التاجر' : 'Merchant Setup', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Sidebar Navigation */}
      <div className="lg:w-64 shrink-0">
        <div className="sticky top-24 space-y-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">{isRTL ? 'المحتويات' : 'Contents'}</h3>
            <button
              onClick={exportToPDF}
              className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
              title={isRTL ? 'تصدير PDF' : 'Export PDF'}
            >
              <Download size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-1 gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <section.icon size={20} />
                <span className="font-medium text-sm lg:text-base">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Book className="text-[#D4AF37]" />
              {isRTL ? 'توثيق API' : 'API Documentation'}
            </h2>
            <p className="text-muted-foreground mt-1 text-lg">
              {isRTL
                ? 'دليل شامل لتكامل بوابة الدفع Press2Pay'
                : 'Complete guide for Press2Pay payment gateway integration'}
            </p>
          </div>
        </div>

        {/* Section Content */}
        {activeSection === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Book className="text-[#D4AF37]" />
                {isRTL ? 'نظرة عامة' : 'Overview'}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {isRTL
                  ? 'توفر Press2Pay واجهة برمجة تطبيقات RESTful شاملة لمعالجة المدفوعات عبر منطقة الشرق الأوسط وشمال أفريقيا. تتيح واجهة برمجة التطبيقات للتجار قبول المدفوعات وإدارة المعاملات والتسويات بشكل آمن.'
                  : 'Press2Pay provides a comprehensive RESTful API for payment processing across the MENA region. Our API allows merchants to accept payments, manage transactions, and handle settlements securely.'}
              </p>
            </div>
          </motion.div>
        )}

        {activeSection === 'authentication' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Key className="text-[#D4AF37]" />
                {isRTL ? 'المصادقة' : 'Authentication'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {isRTL ? 'تستخدم Press2Pay مفاتيح API للمصادقة. قم بتضمين مفتاح API الخاص بك في رأس Authorization لجميع الطلبات.' : 'Press2Pay uses API keys to authenticate requests. Include your API key in the Authorization header for all requests.'}
              </p>
              <div className="bg-muted rounded-xl p-4 font-mono text-sm text-foreground">
                <code>Authorization: Bearer sk_live_xxxxxxxxxxxxxxxx</code>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'security-advanced' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="text-[#D4AF37]" />
                {isRTL ? 'الأمان المتقدم' : 'Advanced Security'}
              </h3>
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Zap size={18} className="text-[#D4AF37]" />
                    {isRTL ? 'مفاتيح Idempotency' : 'Idempotency Keys'}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isRTL ? 'لمنع تكرار العمليات في حالة انقطاع الاتصال، يجب إرسال رأس Idempotency-Key فريد.' : 'To prevent duplicate transactions, a unique Idempotency-Key header must be sent.'}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Shield size={18} className="text-[#D4AF37]" />
                    {isRTL ? 'التحقق من التوقيع (HMAC)' : 'Signature Verification (HMAC)'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {isRTL ? 'نقوم بتوقيع كل إشعار ويب هوك باستخدام خوارزمية HMAC-SHA256.' : 'We sign every webhook notification using HMAC-SHA256.'}
                  </p>
                  <div className="bg-black rounded-xl p-6 font-mono text-xs text-green-400 overflow-x-auto">
                    <pre>
{`const crypto = require('crypto');
const verify = (payload, sig, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  return crypto.timingSafeEqual(
    Buffer.from(hmac.update(payload).digest('hex')),
    Buffer.from(sig)
  );
};`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'endpoints' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Code className="text-[#D4AF37]" />
                {isRTL ? 'نقاط النهاية' : 'API Endpoints'}
              </h3>
              <div className="space-y-4">
                {[
                  { method: 'POST', endpoint: '/transactions', desc: isRTL ? 'إنشاء معاملة' : 'Create transaction', color: 'bg-green-500' },
                  { method: 'GET', endpoint: '/transactions/:id', desc: isRTL ? 'تفاصيل المعاملة' : 'Get transaction', color: 'bg-blue-500' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/30 rounded-xl">
                    <span className={`w-fit px-3 py-1 ${item.color} text-white rounded-lg text-xs font-bold`}>{item.method}</span>
                    <code className="font-mono text-sm text-foreground">{item.endpoint}</code>
                    <span className="text-sm text-muted-foreground sm:ms-auto">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ... Other sections could be added here similarly ... */}
        
      </div>
    </div>
  );
};

export default APIDocs;
