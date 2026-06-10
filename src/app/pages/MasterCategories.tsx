import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, Building2, Store, ShoppingBag, Wallet, 
  CreditCard, UserPlus, Users, Shield, List, Repeat, FileCheck,
  FileText, FileBarChart, Ban, Activity, ArrowLeftRight, BarChart3,
  FolderTree, Landmark, Server, Link2, ArrowRightLeft, Database,
  Zap, Search, ShieldCheck, ShieldAlert, AlertCircle, Clock, Globe, Target,
  Bell, Mail, Map, MessagesSquare, Calendar, Bot, MapPin,
  Workflow, UserCheck, ShoppingCart, TrendingUp, Receipt, FileX,
  AlertTriangle, ChevronRight, Grid3x3, Layers, Smartphone
} from 'lucide-react';
import { useStore } from '../../lib/store';

interface SubPage {
  path: string;
  label: string;
  icon: any;
  color: string;
  description?: string;
}

interface Category {
  id: string;
  title: string;
  icon: any;
  color: string;
  bgGradient: string;
  description: string;
  pages: SubPage[];
}

export const MasterCategories = () => {
  const navigate = useNavigate();
  const { language } = useStore();
  const isRTL = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Category[] = [
    {
      id: 'dashboard',
      title: isRTL ? 'لوحة التحكم' : 'Dashboard & Overview',
      icon: LayoutDashboard,
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      description: isRTL ? 'لوحات التحكم والإحصائيات الرئيسية' : 'Main dashboards and analytics',
      pages: [
        { path: `/${language}/dashboard`, label: isRTL ? 'الرئيسية' : 'Main Dashboard', icon: LayoutDashboard, color: '#3b82f6', description: isRTL ? 'لوحة التحكم الرئيسية' : 'Main overview dashboard' },
        { path: `/${language}/realtime-demo`, label: isRTL ? 'البيانات اللحظية' : 'Realtime Demo', icon: Activity, color: '#06b6d4', description: isRTL ? 'تجربة البيانات اللحظية' : 'Realtime data demo' },
        { path: `/${language}/smart-routing`, label: isRTL ? 'التوجيه الذكي' : 'Smart Routing', icon: Zap, color: '#f59e0b', description: isRTL ? 'نظام التوجيه الذكي' : 'Intelligent routing system' },
      ]
    },
    {
      id: 'merchants',
      title: isRTL ? 'إدارة التجار' : 'Merchant Management',
      icon: Building2,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      description: isRTL ? 'إدارة التجار الرئيسيين والفرعيين' : 'Manage master and sub merchants',
      pages: [
        { path: `/${language}/merchants`, label: isRTL ? 'قائمة التجار' : 'Merchants List', icon: Building2, color: '#10b981', description: isRTL ? 'إدارة جميع التجار' : 'Manage all merchants' },
        { path: `/${language}/merchants/new`, label: isRTL ? 'تاجر جديد' : 'New Merchant', icon: UserPlus, color: '#14b8a6', description: isRTL ? 'إضافة تاجر جديد' : 'Add new merchant' },
        { path: `/${language}/merchants-portal`, label: isRTL ? 'بوابة التجار' : 'Merchants Portal', icon: Store, color: '#06b6d4', description: isRTL ? 'بوابة التاجر الخاصة' : 'Private merchant portal' },
        { path: `/${language}/analytics`, label: isRTL ? 'تحليلات التجار' : 'Merchant Analytics', icon: BarChart3, color: '#a855f7', description: isRTL ? 'تحليلات الأداء' : 'Performance analytics' },
      ]
    },
    {
      id: 'financial',
      title: isRTL ? 'المالية والمحافظ' : 'Financial & Wallets',
      icon: Wallet,
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      description: isRTL ? 'إدارة الأموال والمحافظ والتسعير' : 'Money, wallets, and pricing management',
      pages: [
        { path: `/${language}/wallets`, label: isRTL ? 'المحافظ' : 'Wallets', icon: Wallet, color: '#8b5cf6', description: isRTL ? 'إدارة المحافظ' : 'Wallet management' },
        { path: `/${language}/wallets-new`, label: isRTL ? 'المحافظ الجديدة' : 'New Wallets', icon: Wallet, color: '#10b981', description: isRTL ? 'نظام المحافظ الحديث' : 'Modern wallet system' },
        { path: `/${language}/wallet-allocation`, label: isRTL ? 'تخصيص المحافظ' : 'Wallet Allocation', icon: Zap, color: '#f59e0b', description: isRTL ? 'توزيع المحافظ الذكي' : 'Smart wallet distribution' },
        { path: `/${language}/pricing-fees-engine`, label: isRTL ? 'محرك الرسوم' : 'Fees Engine', icon: TrendingUp, color: '#3b82f6', description: isRTL ? 'إدارة الرسوم والعمولات' : 'Manage fees and commissions' },
        { path: `/${language}/finance-analytics`, label: isRTL ? 'تحليلات مالية' : 'Finance Analytics', icon: BarChart3, color: '#a855f7', description: isRTL ? 'تحليلات مالية متقدمة' : 'Advanced finance analytics' },
      ]
    },
    {
      id: 'transactions',
      title: isRTL ? 'المعاملات' : 'Transactions',
      icon: ArrowLeftRight,
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      description: isRTL ? 'إدارة جميع المعاملات' : 'Manage all transactions',
      pages: [
        { path: `/${language}/transactions`, label: isRTL ? 'جميع المعاملات' : 'All Transactions', icon: ArrowLeftRight, color: '#06b6d4', description: isRTL ? 'قائمة المعاملات' : 'Transactions list' },
        { path: `/${language}/transactions/advanced`, label: isRTL ? 'بحث متقدم' : 'Advanced Search', icon: Search, color: '#8b5cf6', description: isRTL ? 'بحث متقدم في المعاملات' : 'Advanced transactions search' },
        { path: `/${language}/deposits`, label: isRTL ? 'الإيداعات' : 'Deposits', icon: ArrowRightLeft, color: '#10b981', description: isRTL ? 'إدارة الإيداعات' : 'Manage deposits' },
        { path: `/${language}/payouts`, label: isRTL ? 'السحوبات' : 'Payouts', icon: Wallet, color: '#f59e0b', description: isRTL ? 'إدارة السحوبات' : 'Manage payouts' },
      ]
    },
    {
      id: 'reports',
      title: isRTL ? 'التقارير والتحليلات' : 'Reports & Analytics',
      icon: BarChart3,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      description: isRTL ? 'تقارير وتحليلات شاملة' : 'Comprehensive reports and analytics',
      pages: [
        { path: `/${language}/reports`, label: isRTL ? 'التقارير الرئيسية' : 'Main Reports', icon: BarChart3, color: '#f59e0b', description: isRTL ? 'تقارير الأداء' : 'Performance reports' },
        { path: `/${language}/deposit-payout-report`, label: isRTL ? 'تقرير الإيداع والسحب' : 'Deposit/Payout Report', icon: FileText, color: '#3b82f6', description: isRTL ? 'مقارنة الإيداعات بالسحوبات' : 'Compare deposits vs payouts' },
        { path: `/${language}/audit-logs`, label: isRTL ? 'سجلات المراجعة' : 'Audit Logs', icon: FileCheck, color: '#10b981', description: isRTL ? 'سجل العمليات الإدارية' : 'Admin operation logs' },
      ]
    },
    {
      id: 'boarding',
      title: isRTL ? 'التسجيل والمراجعة' : 'Boarding & Review',
      icon: FileCheck,
      color: '#ec4899',
      bgGradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      description: isRTL ? 'مراجعة التسجيل والموافقات' : 'Registration review and approvals',
      pages: [
        { path: `/${language}/boarding-review`, label: isRTL ? 'مراجعة التسجيل' : 'Boarding Review', icon: FileCheck, color: '#ec4899', description: isRTL ? 'مراجعة طلبات التسجيل' : 'Review registration requests' },
        { path: `/${language}/rcba`, label: isRTL ? 'تقييم المخاطر' : 'RCBA', icon: Shield, color: '#8b5cf6', description: isRTL ? 'تقييم مخاطر التجار' : 'Merchant risk assessment' },
        { path: `/${language}/risk-aml`, label: isRTL ? 'مكافحة غسل الأموال' : 'AML/Risk', icon: AlertTriangle, color: '#ef4444', description: isRTL ? 'إدارة المخاطر والامتثال' : 'Risk and compliance' },
      ]
    },
    {
      id: 'users',
      title: isRTL ? 'المستخدمين والأدوار' : 'Users & Roles',
      icon: Users,
      color: '#14b8a6',
      bgGradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      description: isRTL ? 'إدارة المستخدمين والصلاحيات' : 'User and permission management',
      pages: [
        { path: `/${language}/users`, label: isRTL ? 'قائمة المستخدمين' : 'Users List', icon: Users, color: '#14b8a6', description: isRTL ? 'إدارة مستخدمي النظام' : 'Manage system users' },
        { path: `/${language}/team-management`, label: isRTL ? 'إدارة الفرق' : 'Team Management', icon: Users, color: '#8b5cf6', description: isRTL ? 'إدارة فرق العمل' : 'Manage work teams' },
        { path: `/${language}/agents`, label: isRTL ? 'الوكلاء' : 'Agents', icon: UserCheck, color: '#3b82f6', description: isRTL ? 'إدارة وكلاء الدفع' : 'Manage payment agents' },
      ]
    },
    {
      id: 'api',
      title: isRTL ? 'المطورين والربط' : 'Developers & API',
      icon: Server,
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      description: isRTL ? 'إدارة الربط التقني والتوثيق' : 'Technical integration and documentation',
      pages: [
        { path: `/${language}/api-docs`, label: isRTL ? 'توثيق الـ API' : 'API Docs', icon: FileText, color: '#6366f1', description: isRTL ? 'دليل المطورين' : 'Developer documentation' },
        { path: `/${language}/api-management`, label: isRTL ? 'إدارة المفاتيح' : 'API Management', icon: ShieldCheck, color: '#8b5cf6', description: isRTL ? 'إدارة مفاتيح الربط' : 'Manage API keys' },
        { path: `/${language}/security-audit`, label: isRTL ? 'التدقيق الأمني' : 'Security Audit', icon: ShieldAlert, color: '#ef4444', description: isRTL ? 'فحص HMAC والأمان' : 'Check HMAC & security' },
        { path: `/${language}/api-console`, label: isRTL ? 'منصة الاختبار' : 'API Console', icon: Terminal, color: '#14b8a6', description: isRTL ? 'اختبار الـ API' : 'Test the API' },
        { path: `/${language}/webhooks`, label: isRTL ? 'الويب هوكس' : 'Webhooks', icon: Workflow, color: '#10b981', description: isRTL ? 'إدارة التنبيهات البرمجية' : 'Manage webhook notifications' },
      ]
    },
    {
      id: 'solutions',
      title: isRTL ? 'حلول الدفع' : 'Payment Solutions',
      icon: CreditCard,
      color: '#a855f7',
      bgGradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
      description: isRTL ? 'حلول الدفع والخدمات' : 'Payment solutions and services',
      pages: [
        { path: `/${language}/payment-kit`, label: isRTL ? 'مجموعة الدفع' : 'Payment Kit', icon: ShoppingBag, color: '#a855f7', description: isRTL ? 'عرض أدوات الدفع' : 'Show payment tools' },
        { path: `/${language}/payment-links`, label: isRTL ? 'روابط الدفع' : 'Payment Links', icon: Link2, color: '#10b981', description: isRTL ? 'إنشاء روابط دفع سريعة' : 'Create quick payment links' },
        { path: `/${language}/vodafone-cash-payment`, label: isRTL ? 'فودافون كاش' : 'Vodafone Cash', icon: Smartphone, color: '#ef4444', description: isRTL ? 'دفع عبر فودافون كاش' : 'Vodafone Cash payment' },
        { path: `/${language}/pay`, label: isRTL ? 'صفحة الـ VIP' : 'VIP Checkout', icon: ShieldCheck, color: '#D4AF37', description: isRTL ? 'تجربة دفع فاخرة' : 'Luxury checkout experience' },
      ]
    },
    {
      id: 'support',
      title: isRTL ? 'الدعم والعملاء' : 'Support & CRM',
      icon: MessagesSquare,
      color: '#f472b6',
      bgGradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
      description: isRTL ? 'خدمات الدعم وإدارة العملاء' : 'Support services and customer management',
      pages: [
        { path: `/${language}/support-tickets`, label: isRTL ? 'تذاكر الدعم' : 'Support Tickets', icon: FileText, color: '#f472b6', description: isRTL ? 'تذاكر الدعم الفني' : 'Technical support tickets' },
        { path: `/${language}/crm`, label: isRTL ? 'إدارة العملاء' : 'CRM', icon: UserCheck, color: '#10b981', description: isRTL ? 'نظام إدارة العملاء' : 'Customer relationship management' },
        { path: `/${language}/conversations`, label: isRTL ? 'المحادثات' : 'Conversations', icon: MessagesSquare, color: '#8b5cf6', description: isRTL ? 'مركز المحادثات المباشرة' : 'Live conversation center' },
      ]
    },
    {
      id: 'advanced',
      title: isRTL ? 'الميزات المتقدمة' : 'Advanced Features',
      icon: Bot,
      color: '#22d3ee',
      bgGradient: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
      description: isRTL ? 'ميزات متقدمة وأدوات ذكية' : 'Advanced features and smart tools',
      pages: [
        { path: `/${language}/n8n-workflows`, label: isRTL ? 'سير العمل (n8n)' : 'n8n Workflows', icon: Workflow, color: '#8b5cf6', description: isRTL ? 'أتمتة العمليات الخارجية' : 'External process automation' },
        { path: `/${language}/data-automation`, label: isRTL ? 'أتمتة البيانات' : 'Data Automation', icon: Database, color: '#10b981', description: isRTL ? 'أتمتة معالجة البيانات' : 'Data processing automation' },
        { path: `/${language}/enterprise-architecture`, label: isRTL ? 'بنية المؤسسة' : 'Architecture', icon: Layers, color: '#3b82f6', description: isRTL ? 'مخطط بنية النظام' : 'System architecture diagram' },
      ]
    },
  ];

  const filteredCategories = categories.filter(cat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cat.title.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query) ||
      cat.pages.some(page => 
        page.label.toLowerCase().includes(query) ||
        page.description?.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div className="flex flex-col gap-8 min-h-full pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-start gap-4">
          <div 
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--primary)',
              boxShadow: '0 8px 16px rgba(245, 158, 11, 0.2)'
            }}
          >
            <Grid3x3 size={32} color="#fff" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold mb-2 text-foreground">
              {isRTL ? 'الفئات الرئيسية' : 'Master Categories'}
            </h1>
            <p className="text-base text-muted-foreground">
              {isRTL ? 'استعرض جميع وحدات وصفحات النظام' : 'Browse all system modules and pages'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-auto lg:min-w-[350px]">
          <input
            type="text"
            placeholder={isRTL ? 'ابحث عن صفحة أو فئة...' : 'Search for a page or category...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isRTL ? 'pr-12' : 'pl-12'} px-4 py-3 text-[15px] rounded-xl border border-border bg-card text-foreground transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
          />
          <Search 
            size={20} 
            className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? 'right-4' : 'left-4'}`}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: isRTL ? 'إجمالي الفئات' : 'Total Categories', value: categories.length, icon: Layers, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
          { label: isRTL ? 'إجمالي ��لصفحات' : 'Total Pages', value: categories.reduce((sum, cat) => sum + cat.pages.length, 0), icon: FileText, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { label: isRTL ? 'مرئية' : 'Visible', value: filteredCategories.length, icon: Activity, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
          { label: isRTL ? 'البحث نشط' : 'Search Active', value: searchQuery ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No'), icon: Search, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' }
        ].map((stat, i) => (
          <div 
            key={i}
            className="p-6 rounded-xl border border-border flex items-center gap-4 bg-card"
          >
            <div 
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: stat.bg,
              }}
            >
              <stat.icon size={28} color={stat.color} />
            </div>
            <div>
              <div className="text-sm mb-1 text-muted-foreground">
                {stat.label}
              </div>
              <div className="text-3xl font-extrabold text-foreground">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = selectedCategory === category.id;
          
          return (
            <div
              key={category.id}
              className={`rounded-xl border border-border overflow-hidden transition-all duration-300 bg-card ${isExpanded ? 'ring-2 ring-primary/50' : ''}`}
            >
              {/* Category Header */}
              <div 
                onClick={() => setSelectedCategory(isExpanded ? null : category.id)}
                className="p-6 cursor-pointer relative overflow-hidden group"
                style={{
                  background: category.bgGradient,
                }}
              >
                {/* Decorative Circle */}
                <div 
                  className="absolute rounded-full pointer-events-none transition-transform duration-500 group-hover:scale-110"
                  style={{
                    top: '-20%',
                    [isRTL ? 'left' : 'right']: '-10%',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }} 
                />
                
                <div className="relative flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 flex items-center justify-center shadow-lg"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Icon size={32} color="#fff" />
                  </div>
                  
                  <div className="flex-1 min-w-0 text-white">
                    <h3 className="text-xl font-bold mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  <ChevronRight 
                    size={24} 
                    color="#fff"
                    className={`flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-90' : (isRTL ? 'rotate-180' : 'rotate-0')}`}
                  />
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-white font-bold">
                  <FileText size={18} />
                  {category.pages.length} {isRTL ? 'صفحة' : 'pages'}
                </div>
              </div>

              {/* Pages Grid */}
              {isExpanded && (
                <div 
                  className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fadeIn bg-muted/30"
                >
                  {category.pages.map((page) => {
                    const PageIcon = page.icon;
                    
                    return (
                      <button
                        key={page.path}
                        onClick={() => navigate(page.path)}
                        className="p-4 rounded-lg border border-border cursor-pointer transition-all duration-200 flex flex-col items-center gap-3 text-center hover:border-primary hover:shadow-lg bg-card"
                      >
                        <div 
                          className="flex items-center justify-center"
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: 'var(--radius-lg)',
                            background: `${page.color}15`,
                          }}
                        >
                          <PageIcon size={26} color={page.color} />
                        </div>
                        
                        <div 
                          className="text-[13px] font-bold leading-tight text-foreground"
                        >
                          {page.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <div className="flex justify-center mb-6">
            <div 
              className="flex items-center justify-center bg-primary/10 w-20 h-20 rounded-full"
            >
              <AlertCircle size={40} className="text-primary opacity-70" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-foreground">
            {isRTL ? 'لا توجد نتائج' : 'No Results Found'}
          </h3>
          <p className="text-muted-foreground">
            {isRTL ? 'جرب البحث بكلمات مختلفة' : 'Try searching with different keywords'}
          </p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 text-primary font-bold hover:underline"
          >
            {isRTL ? 'عرض جميع الفئات' : 'View all categories'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
};

const Terminal = (props: any) => (
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
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export default MasterCategories;
