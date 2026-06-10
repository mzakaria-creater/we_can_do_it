import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  FileText, 
  Wallet, 
  Settings, 
  HelpCircle,
  LogOut,
  Bell,
  Search,
  User,
  ChevronRight,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate, useParams } from 'react-router';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import '../../styles/financial-theme.css';

export const FinancialLayout = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage, user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const isRTL = language === 'ar';

  const menuItems = [
    { icon: LayoutDashboard, label: isRTL ? 'لوحة التحكم' : 'Dashboard', path: `/${language}/financial` },
    { icon: ArrowLeftRight, label: isRTL ? 'المعاملات' : 'Transactions', path: `/${language}/financial/transactions` },
    { icon: FileText, label: isRTL ? 'التقارير' : 'Reports', path: `/${language}/financial/reports` },
    { icon: Wallet, label: isRTL ? 'المحافظ' : 'Wallets', path: `/${language}/financial/wallets` },
    { icon: User, label: isRTL ? 'الملف الشخصي' : 'Profile', path: `/${language}/financial/profile` },
    { icon: Settings, label: isRTL ? 'الإعدادات' : 'Settings', path: `/${language}/financial/settings` },
  ];

  const handleLanguageToggle = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    const newPath = location.pathname.replace(`/${language}`, `/${newLang}`);
    navigate(newPath);
  };

  const handleLogout = async () => {
    logout();
    navigate(`/${language}/login`);
  };

  return (
    <div className="bg-[#0B0F14] text-white flex h-screen overflow-hidden font-['Cairo',_sans-serif]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar - Desktop */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden lg:flex bg-[#14181F] border-r border-slate-800 flex-col z-50 h-full relative shadow-2xl"
      >
        {/* Logo Section */}
        <div className="h-24 flex items-center px-6 gap-3 overflow-hidden whitespace-nowrap">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#D4AF37]/20">
            <Wallet className="text-black" size={24} />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#D4AF37] tracking-tight leading-none uppercase">Press2Pay</span>
              <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1">VIP Portal</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 pt-8">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === `/${language}/financial` && (location.pathname === `/${language}/financial/` || location.pathname === `/${language}/financial`));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/10' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
              >
                <item.icon size={22} className="flex-shrink-0" />
                {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="px-4 pb-8 space-y-2">
          <button 
            onClick={handleLanguageToggle}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
          >
            <Globe size={22} />
            {isSidebarOpen && <span className="font-bold text-sm">{isRTL ? 'English' : 'العربية'}</span>}
          </button>
          
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-bold text-sm">{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute -right-3 top-28 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center text-black shadow-md z-50 transition-transform ${isSidebarOpen && isRTL ? 'rotate-180' : ''}`}
        >
          {isSidebarOpen ? <ChevronRight size={14} className={isRTL ? '' : 'rotate-180'} /> : <ChevronRight size={14} />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-[#0B0F14]/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 lg:px-10 flex-shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden p-2 text-slate-400"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="relative w-full max-w-md group hidden sm:block">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#D4AF37] transition-colors`} size={18} />
              <input 
                type="text" 
                placeholder={isRTL ? 'البحث في المعاملات...' : 'Search financial records...'} 
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-2.5 bg-[#14181F] border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:bg-[#1A1F26] transition-all text-sm text-white placeholder-slate-600`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <button className="relative p-2.5 text-slate-400 bg-slate-800/50 rounded-xl hover:bg-slate-800 hover:text-white transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#D4AF37] rounded-full border-2 border-[#0B0F14]"></span>
            </button>
            
            <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white">{user?.name || 'Mina VIP'}</p>
                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">{user?.role === 'owner' ? 'Master Admin' : 'Premium Merchant'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 shadow-sm overflow-hidden flex items-center justify-center">
                 {user?.name ? (
                   <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=D4AF37&color=000`} alt="User" />
                 ) : (
                   <User className="text-slate-500" size={20} />
                 )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#0B0F14] p-6 lg:p-10 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              className="fixed top-0 bottom-0 left-0 right-0 w-[80%] max-w-sm bg-[#14181F] z-[101] lg:hidden p-6 flex flex-col"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center">
                    <Wallet className="text-black" size={20} />
                  </div>
                  <span className="text-lg font-black text-[#D4AF37]">Press2Pay</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${
                        isActive ? 'bg-[#D4AF37] text-black' : 'text-slate-400'
                      }`}
                    >
                      <item.icon size={22} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-slate-800 space-y-2">
                 <button onClick={handleLanguageToggle} className="w-full flex items-center gap-4 px-4 py-4 text-slate-400 font-bold">
                    <Globe size={22} />
                    <span>{isRTL ? 'English' : 'العربية'}</span>
                 </button>
                 <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-rose-400 font-bold">
                    <LogOut size={22} />
                    <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
