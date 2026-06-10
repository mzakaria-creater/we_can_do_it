import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Activity,
  Wallet, 
  Users, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Bell,
  Search,
  Globe,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  Sparkles,
  Building2,
  Split,
  Hash,
  CreditCard,
  FileText,
  FileSearch,
  Smartphone,
  Layers,
  Code,
  Terminal,
  Zap,
  Database,
  Shield,
  Key,
  Workflow,
  Ticket,
  Book,
  Banknote,
  DollarSign,
  ShieldAlert,
  BarChart3,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  UserPlus,
  FileCode,
  Package,
  Lock,
  Headphones,
  BarChart2,
  GitBranch,
  UserCheck,
  ClipboardList,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey } from '../../lib/supabase';
import { projectId } from '../../../utils/supabase/info';
import { RightSidebar } from './RightSidebar';

// Icon Map for Dynamic Menu
const iconMap: Record<string, any> = {
  LayoutDashboard,
  ArrowLeftRight,
  Activity,
  Wallet,
  Users,
  Settings,
  Bell,
  Search,
  Globe,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  Sparkles,
  Building2,
  Split,
  Hash,
  CreditCard,
  FileText,
  FileSearch,
  Smartphone,
  Layers,
  Code,
  Terminal,
  Zap,
  Database,
  Shield,
  Key,
  Workflow,
  Ticket,
  Book,
  Banknote,
  DollarSign,
  ShieldAlert,
  BarChart3,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  UserPlus,
  FileCode,
  Package,
  Lock,
  Headphones,
  BarChart2,
  GitBranch,
  UserCheck,
  ClipboardList,
  ChevronDown
};
import { QuickActionButton } from './QuickActionModal';
import { PageTransition } from './transitions/PageTransition';
import { SystemStatusBanner } from './SystemStatusBanner';
import { NotificationCenter } from './NotificationCenter';
import { LiveChat } from './LiveChat'; // NEW
import { UserPresence } from './UserPresence'; // NEW
import { SystemTimeLocation } from './SystemTimeLocation'; // NEW

// Menu categories with icons and items
const menuCategories = [
  {
    id: 'core',
    label: { en: 'Core Ecosystem', ar: 'النظام الأساسي' },
    icon: LayoutDashboard,
    color: '#D4AF37',
    items: [
      { icon: LayoutDashboard, label: { en: 'Control Center', ar: 'مركز التحكم' }, path: '/dashboard' },
      { icon: Activity, label: { en: 'Live Monitor', ar: 'المراقب المباشر' }, path: '/realtime-demo' },
      { icon: Globe, label: { en: 'Global Ecosystem', ar: 'النظام العالمي' }, path: '/analytics' },
      { icon: BarChart3, label: { en: 'Performance Insights', ar: 'رؤى الأداء' }, path: '/finance-analytics', badge: 'VIP' },
    ]
  },
  {
    id: 'financial',
    label: { en: 'Financial Engine', ar: 'المحرك المالي' },
    icon: DollarSign,
    color: '#10B981',
    items: [
      { icon: Layers, label: { en: 'Payment Gateways', ar: 'بوابات الدفع' }, path: '/payment-providers' },
      { icon: Wallet, label: { en: 'Wallets & Entities', ar: 'المحافظ والكيانات' }, path: '/wallets' },
      { icon: ArrowLeftRight, label: { en: 'Financial Ledger', ar: 'السجل المالي' }, path: '/transactions' },
      { icon: Smartphone, label: { en: 'P2P Terminal', ar: 'محطة P2P' }, path: '/vodafone-cash-payment' },
      { icon: Banknote, label: { en: 'Settlements', ar: 'التسويات النقدية' }, path: '/settlements' },
    ]
  },
  {
    id: 'security',
    label: { en: 'Security & Compliance', ar: 'الأمان والامتثال' },
    icon: Shield,
    color: '#EF4444',
    items: [
      { icon: Zap, label: { en: 'Fraud AI Engine', ar: 'محرك احتيال AI' }, path: '/risk-aml' },
      { icon: ShieldAlert, label: { en: 'Security Audit', ar: 'التدقيق الأمني' }, path: '/security-audit', badge: 'SECURE' },
      { icon: Lock, label: { en: 'Hash Security', ar: 'أمان التشفير' }, path: '/hash-security' },
      { icon: ClipboardList, label: { en: 'Audit Logs', ar: 'سجلات التدقيق' }, path: '/audit-logs' },
    ]
  },
  {
    id: 'developers',
    label: { en: 'Developer Suite', ar: 'جناح المطورين' },
    icon: Code,
    color: '#06B6D4',
    items: [
      { icon: Book, label: { en: 'API Documentation', ar: 'وثائق API' }, path: '/api-docs' },
      { icon: Key, label: { en: 'Auth Keys', ar: 'مفاتيح الربط' }, path: '/api-authentication' },
      { icon: Terminal, label: { en: 'Debug Console', ar: 'منصة التصحيح' }, path: '/api-console' },
      { icon: GitBranch, label: { en: 'Webhook Web', ar: 'ويب هوكس' }, path: '/webhooks' },
      { icon: Zap, label: { en: 'Full Trip Test', ar: 'اختبار كامل' }, path: '/full-trip-test' },
    ]
  },
  {
    id: 'management',
    label: { en: 'Business Management', ar: 'إدارة الأعمال' },
    icon: Building2,
    color: '#F59E0B',
    items: [
      { icon: Building2, label: { en: 'Merchants Hub', ar: 'مركز التجار' }, path: '/merchants' },
      { icon: Users, label: { en: 'CRM & Relations', ar: 'إدارة العلاقات' }, path: '/crm' },
      { icon: UserCheck, label: { en: 'Agents Network', ar: 'شبكة الوكلاء' }, path: '/agents' },
      { icon: Headphones, label: { en: 'Support Desk', ar: 'مكتب الدعم' }, path: '/support-tickets' },
    ]
  },
  {
    id: 'system',
    label: { en: 'System Settings', ar: 'إعدادات النظام' },
    icon: SettingsIcon,
    color: '#6B7280',
    items: [
      { icon: User, label: { en: 'User Profile', ar: 'الملف الشخصي' }, path: '/profile' },
      { icon: Bell, label: { en: 'Smart Notifications', ar: 'الإشعارات الذكية' }, path: '/notifications' },
      { icon: SettingsIcon, label: { en: 'Platform Settings', ar: 'إعدادات المنصة' }, path: '/settings' },
      { icon: Database, label: { en: 'Cloud Services', ar: 'خدمات سحابية' }, path: '/supabase-example' },
    ]
  }
];

const CategorySection = ({ category, language, location, handleNav, collapsed }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isActive = category.items.some((item: any) => location.pathname.startsWith(item.path));
  const CategoryIcon = typeof category.icon === 'string' ? (iconMap[category.icon] || LayoutDashboard) : category.icon;

  return (
    <div className="mb-3">
      <button
        onClick={() => !collapsed && setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
          isActive 
            ? 'bg-[#D4AF37]/5 text-[#D4AF37] border border-[#D4AF37]/20 shadow-lg shadow-[#D4AF37]/5' 
            : 'text-gray-400 hover:bg-[#D4AF37]/10 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-[#D4AF37] text-black' : 'bg-gray-900 group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37]'}`}>
            <CategoryIcon size={16} />
          </div>
          {!collapsed && (
            <span className="text-[11px] font-black uppercase tracking-[0.1em]">
              {category.label[language]}
            </span>
          )}
        </div>
        {!collapsed && (
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isActive ? 'text-[#D4AF37]' : 'text-gray-600'}`}
          />
        )}
      </button>
      
      <AnimatePresence>
        {(isExpanded || collapsed) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'circOut' }}
            className={`overflow-hidden ${collapsed ? 'mt-2' : 'mt-1 ml-4 border-l border-[#D4AF37]/10 pl-2'}`}
          >
            {category.items.map((item: any) => {
              const isItemActive = location.pathname.startsWith(item.path);
              const ItemIcon = typeof item.icon === 'string' ? (iconMap[item.icon] || LayoutDashboard) : item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 w-full group mb-1 relative overflow-hidden ${
                    isItemActive
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4E5C3] text-black font-black shadow-lg shadow-[#D4AF37]/20'
                      : 'text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
                  }`}
                  title={collapsed ? item.label[language] : ''}
                >
                  <ItemIcon
                    size={16}
                    className={`${collapsed ? 'mx-auto' : ''} ${
                      isItemActive ? 'text-black' : 'group-hover:text-[#D4AF37] transition-colors'
                    }`}
                  />
                  {!collapsed && (
                    <>
                      <span className="text-xs font-bold whitespace-nowrap flex-1 tracking-tight">
                        {item.label[language]}
                      </span>
                      {item.badge && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter ${
                          item.badge === 'VIP' ? 'bg-black text-[#D4AF37]' :
                          item.badge === 'NEW' ? 'bg-emerald-500 text-white' :
                          item.badge === 'DEMO' ? 'bg-sky-500 text-white' :
                          'bg-zinc-700 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isItemActive && !collapsed && (
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Layout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();
  const { theme, toggleTheme, language, setLanguage, sidebarOpen, setSidebarOpen, logout, user, isAuthenticated } = useStore();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Handle route-based language sync
  useEffect(() => {
    if (lang && (lang === 'en' || lang === 'ar') && lang !== language) {
      setLanguage(lang as 'en' | 'ar');
    }
  }, [lang, language, setLanguage]);

  // Initialize menu - set loading to false after mount
  useEffect(() => {
    setLoadingMenu(false);
  }, []);

  const handleNav = (path: string) => {
    const targetPath = path.startsWith('/') ? `/${language}${path}` : `/${language}/${path}`;
    navigate(targetPath);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    
    // Update URL to reflect new language
    const currentPathWithoutLang = location.pathname.replace(/^\/(en|ar)/, '');
    navigate(`/${newLang}${currentPathWithoutLang}${location.search}${location.hash}`, { replace: true });
    
    toast.success(newLang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English');
  };

  const handleLogout = async () => {
    try {
      // Show loading state if needed, but toast is sufficient
      toast.info(language === 'ar' ? 'جاري تسجيل الخروج...' : 'Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local store
      logout();
      
      // Explicitly navigate to login
      navigate('/login', { replace: true });
      
      console.log('[Auth] Logout successful');
      toast.success(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully');
    } catch (err: any) {
      console.error('[Auth] Logout failed:', err.message);
      // Fallback: clear store anyway
      logout();
      navigate('/login', { replace: true });
    }
  };

  const bottomNavItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: ArrowLeftRight, label: t('transactions'), path: '/transactions' },
    { icon: ShieldAlert, label: t('riskAml'), path: '/risk-aml' },
    { icon: User, label: t('profile'), path: '/profile' },
  ];

  return (
    <div className={`min-h-screen bg-background text-foreground flex ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col border-e border-[#D4AF37]/10 bg-black transition-all duration-500 z-50 sticky top-0 h-screen ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
        onMouseEnter={() => sidebarCollapsed && setSidebarCollapsed(false)}
        onMouseLeave={() => !sidebarOpen && setSidebarCollapsed(true)}
      >
        {/* Logo */}
        <div className="p-8 flex items-center justify-between border-b border-[#D4AF37]/10 bg-black/50 backdrop-blur-md">
          {sidebarCollapsed ? (
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#F4E5C3] rounded-xl flex items-center justify-center mx-auto shadow-xl shadow-[#D4AF37]/10 group">
              <span className="text-black font-black text-xl group-hover:scale-110 transition-transform">P</span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#F4E5C3] rounded-xl flex items-center justify-center shadow-xl shadow-[#D4AF37]/20">
                <span className="text-black font-black text-xl">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                  Press2Pay
                </span>
                <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] uppercase mt-1 opacity-80">
                  Luxury Portal
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation with Categories */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-none">
          {loadingMenu ? (
            <div className="space-y-6 p-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-white/5 animate-pulse rounded-xl border border-white/5" />
              ))}
            </div>
          ) : (
            (menuItems.length > 0 ? menuItems : menuCategories).map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                language={language}
                location={location}
                handleNav={handleNav}
                collapsed={sidebarCollapsed}
              />
            ))
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#D4AF37]/10 bg-black/40 space-y-3">
          <button
            onClick={() => {
              setSidebarCollapsed(!sidebarCollapsed);
              setSidebarOpen(!sidebarCollapsed);
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} className="mx-auto" />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>{t('collapse')}</span>
              </>
            )}
          </button>
          <button
            onClick={isAuthenticated ? handleLogout : () => navigate('/login')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-black text-sm ${
              isAuthenticated 
                ? 'text-red-400 hover:bg-red-400/10' 
                : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'
            }`}
          >
            {isAuthenticated ? (
              <LogOut size={18} className={sidebarCollapsed ? 'mx-auto' : ''} />
            ) : (
              <User size={18} className={sidebarCollapsed ? 'mx-auto' : ''} />
            )}
            {!sidebarCollapsed && (
              <span className="tracking-wide">{isAuthenticated ? t('logout') : t('signIn')}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 bg-black">
        {/* Top Header */}
        <header className="h-20 border-b border-[#D4AF37]/10 bg-black/90 backdrop-blur-2xl flex items-center justify-between px-6 lg:px-12 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              className="lg:hidden p-3 hover:bg-[#D4AF37]/10 rounded-xl text-[#D4AF37] border border-[#D4AF37]/20"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-white lg:text-3xl tracking-tighter">
                {(menuItems.length > 0 ? menuItems : menuCategories)
                  .flatMap(cat => cat.items)
                  .find(item => location.pathname.startsWith(item.path))?.label[language] || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-2 mt-1 xl:mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Systems Integrity: Secured</span>
              </div>
            </div>
            <div className="hidden 2xl:block ml-8 border-l border-white/5 pl-8">
              <SystemTimeLocation />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden md:flex items-center gap-3">
              <QuickActionButton />
              <NotificationCenter />
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="relative p-3 bg-white/5 hover:bg-[#D4AF37]/10 rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-all text-gray-400 hover:text-[#D4AF37]"
                title={language === 'ar' ? 'الدردشة المباشرة' : 'Live Chat'}
              >
                <MessageSquare size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
              <button onClick={handleLanguageToggle} className="p-2.5 hover:bg-[#D4AF37]/10 rounded-xl transition-all text-gray-400 hover:text-[#D4AF37]">
                <Globe size={18} />
              </button>
              <button onClick={toggleTheme} className="p-2.5 hover:bg-[#D4AF37]/10 rounded-xl transition-all text-gray-400 hover:text-[#D4AF37]">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            
            <div className="h-10 w-[1px] bg-[#D4AF37]/10 mx-1" />
            
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/${language}/profile`)}>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-white group-hover:text-[#D4AF37] transition-colors">{user?.name || 'Ahmed Hassan'}</span>
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest opacity-60">
                  {user?.role?.replace('_', ' ') || 'Super Admin'}
                </span>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-zinc-800 to-black rounded-2xl flex items-center justify-center border border-[#D4AF37]/30 shadow-xl group-hover:border-[#D4AF37] transition-all overflow-hidden">
                  <User size={22} className="text-[#D4AF37]" />
                  <div className="absolute inset-0 bg-[#D4AF37]/5 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <div className="max-w-[1600px] mx-auto p-4 lg:p-8 w-full">
            <SystemStatusBanner />
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around px-2 z-50">
        {bottomNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNav(item.path)}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
              location.pathname.startsWith(item.path) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 start-0 w-[280px] bg-sidebar z-[70] shadow-2xl flex flex-col border-e border-sidebar-border"
            >
              <div className="p-6 flex items-center justify-between border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight">Press2Pay</span>
                </div>
                <button 
                  onClick={() => setSidebarOpen(false)} 
                  className="p-2 hover:bg-sidebar-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none">
                {loadingMenu ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-10 bg-sidebar-accent/50 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : (
                  (menuItems.length > 0 ? menuItems : menuCategories).map((category) => (
                    <CategorySection
                      key={category.id}
                      category={category}
                      language={language}
                      location={location}
                      handleNav={handleNav}
                      collapsed={false}
                    />
                  ))
                )}
              </nav>
              <div className="p-6 border-t border-sidebar-border bg-muted/20">
                <button
                  onClick={isAuthenticated ? handleLogout : () => handleNav('/login')}
                  className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-bold ${
                    isAuthenticated ? 'text-destructive hover:bg-destructive/10' : 'text-primary hover:bg-primary/10'
                  }`}
                >
                  {isAuthenticated ? <LogOut size={20} /> : <User size={20} />}
                  <span>{isAuthenticated ? t('logout') : t('signIn')}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Right Sidebar */}
      <RightSidebar isOpen={rightSidebarOpen} onClose={() => setRightSidebarOpen(false)} />

      {/* Live Chat */}
      <LiveChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export { Layout as LayoutNew };
export default Layout;