import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { RightSidebar } from './RightSidebar';
import { QuickActionButton } from './QuickActionModal';
import { PageTransition } from './transitions/PageTransition';
import { SystemStatusBanner } from './SystemStatusBanner';
import { NotificationCenter } from './NotificationCenter';

const NavItem = ({ icon: Icon, label, path, active, onClick, collapsed }: any) => (
  <button
    onClick={() => onClick(path)}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full group relative overflow-hidden ${
      active 
        ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4E5C3] text-black shadow-lg shadow-[#D4AF37]/20 font-bold' 
        : 'text-gray-400 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37]'
    }`}
  >
    <Icon size={18} className={`${active ? 'text-black' : 'group-hover:text-[#D4AF37] transition-colors'}`} />
    {!collapsed && <span className="text-sm tracking-wide whitespace-nowrap">{label}</span>}
    {active && !collapsed && (
      <motion.div 
        layoutId="active-pill"
        className="absolute inset-0 bg-white/10"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      />
    )}
  </button>
);

export const Layout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, language, setLanguage, sidebarOpen, setSidebarOpen, logout, user, isAuthenticated } = useStore();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Close right sidebar when navigating to settings page
  useEffect(() => {
    if (location.pathname === '/settings') {
      setRightSidebarOpen(false);
    }
  }, [location.pathname]);

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: ArrowLeftRight, label: t('transactions'), path: '/transactions' },
    { icon: Activity, label: t('advancedTransactions'), path: '/transactions/advanced' },
    { icon: Wallet, label: t('wallets'), path: '/wallets' },
    { icon: Split, label: t('walletAllocation'), path: '/wallet-allocation' },
    { icon: Users, label: t('merchants'), path: '/merchants' },
    { icon: Users, label: t('userManagement'), path: '/users' },
    { icon: Building2, label: t('merchantsPortal'), path: '/merchants-portal' },
    { icon: Users, label: t('crm'), path: '/crm' },
    { icon: Hash, label: t('codesRegistry'), path: '/codes-registry' },
    { icon: CreditCard, label: t('payMethodTypes'), path: '/pay-method-types' },
    { icon: FileText, label: t('formBuilder'), path: '/forms-table' },
    { icon: CreditCard, label: t('paymentLinks'), path: '/payment-links' },
    { icon: Smartphone, label: t('vodafoneCash'), path: '/vodafone-cash-payment' },
    { icon: Layers, label: t('gatewayConfig'), path: '/gateway-config' },
    { icon: Code, label: t('apiManagement'), path: '/api-management' },
    { icon: Terminal, label: t('apiConsole'), path: '/api-console' },
    { icon: Zap, label: t('apiTester'), path: '/api-tester' },
    { icon: Activity, label: t('backendTester'), path: '/backend-tester' },
    { icon: Database, label: t('supabaseExample'), path: '/supabase-example' },
    { icon: FileText, label: t('depositPayoutReport'), path: '/deposit-payout-report' },
    { icon: Shield, label: t('hashSecurity'), path: '/hash-security' },
    { icon: Key, label: t('oauthSettings'), path: '/oauth-settings' },
    { icon: Workflow, label: t('n8nWorkflows'), path: '/n8n-workflows' },
    { icon: Ticket, label: t('supportTickets'), path: '/support-tickets' },
    { icon: Search, label: t('webhooks'), path: '/webhooks' },
    { icon: Book, label: t('apiDocs'), path: '/api-docs' },
    { icon: Banknote, label: t('settlements'), path: '/settlements' },
    { icon: DollarSign, label: t('pricingFeesEngine'), path: '/pricing-fees-engine' },
    { icon: Shield, label: t('rcba'), path: '/rcba' },
    { icon: Code, label: t('developers'), path: '/developers' },
    { icon: ShieldAlert, label: t('riskAml'), path: '/risk-aml' },
    { icon: BarChart3, label: t('analytics'), path: '/analytics' },
    { icon: FileText, label: t('reports'), path: '/reports' },
    { icon: ShieldCheck, label: t('securityAudit'), path: '/security-audit' },
    { icon: SettingsIcon, label: t('settings'), path: '/settings' },
  ];

  const bottomNavItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: ArrowLeftRight, label: t('transactions'), path: '/transactions' },
    { icon: ShieldAlert, label: t('riskAml'), path: '/risk-aml' },
    { icon: User, label: t('profile'), path: '/profile' },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  const handleNav = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className={`min-h-screen bg-background text-foreground flex ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col border-e border-[#D4AF37]/10 bg-[#050505] transition-all duration-300 z-50 sticky top-0 h-screen ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-8 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#F4E5C3] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#D4AF37]/20">
                <span className="text-black font-black text-xl">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">Press2Pay</span>
                <span className="text-[10px] font-bold text-[#D4AF37] tracking-[0.2em] uppercase mt-1">Portal VIP</span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#F4E5C3] rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-[#D4AF37]/20">
              <span className="text-black font-black text-xl">P</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-none py-2">
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={location.pathname.startsWith(item.path)}
              onClick={handleNav}
              collapsed={!sidebarOpen}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-[#D4AF37]/10 space-y-3 bg-black/40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-400 hover:text-[#D4AF37] transition-all group"
          >
            <Menu size={18} className={!sidebarOpen ? 'mx-auto' : 'group-hover:rotate-90 transition-transform duration-300'} />
            {sidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">{t('collapseMenu')}</span>}
          </button>
          <button
            onClick={isAuthenticated ? logout : () => navigate('/login')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-bold text-sm ${
              isAuthenticated 
                ? 'text-red-400 hover:bg-red-400/10' 
                : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'
            }`}
          >
            {isAuthenticated ? (
              <LogOut size={18} className={!sidebarOpen ? 'mx-auto' : ''} />
            ) : (
              <User size={18} className={!sidebarOpen ? 'mx-auto' : ''} />
            )}
            {sidebarOpen && <span className="tracking-wide">{isAuthenticated ? t('logout') : t('signIn')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 bg-black">
        {/* Top Header */}
        <header className="h-20 border-b border-[#D4AF37]/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              className="lg:hidden p-2 hover:bg-[#D4AF37]/10 rounded-xl text-[#D4AF37]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-white lg:text-2xl tracking-tight">
                {menuItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Secure Connection</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            <QuickActionButton />
            <NotificationCenter />
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
              <button onClick={handleLanguageToggle} className="p-2 hover:bg-[#D4AF37]/10 rounded-full transition-colors text-gray-400 hover:text-[#D4AF37]">
                <Globe size={18} />
              </button>
              <button onClick={toggleTheme} className="p-2 hover:bg-[#D4AF37]/10 rounded-full transition-colors text-gray-400 hover:text-[#D4AF37]">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={() => setRightSidebarOpen(true)}
                className="p-2 hover:bg-[#D4AF37]/10 rounded-full transition-colors text-gray-400 hover:text-[#D4AF37]"
              >
                <SettingsIcon size={18} />
              </button>
            </div>
            
            <div className="h-10 w-[1px] bg-[#D4AF37]/10 mx-1" />
            
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-black text-white group-hover:text-[#D4AF37] transition-colors">{user?.name || (isAuthenticated ? 'Ahmed Hassan' : t('guest'))}</span>
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-tighter opacity-70">{user?.role?.replace('_', ' ') || (isAuthenticated ? 'Super Admin' : t('visitor'))}</span>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center border border-[#D4AF37]/30 shadow-lg group-hover:border-[#D4AF37] transition-all relative">
                <User size={20} className="text-[#D4AF37]" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full" />
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
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">P</span>
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
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-none">
                {menuItems.map((item) => (
                  <NavItem
                    key={item.path}
                    {...item}
                    active={location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))}
                    onClick={handleNav}
                    collapsed={false}
                  />
                ))}
              </nav>
              <div className="p-6 border-t border-sidebar-border bg-muted/20">
                <button
                  onClick={isAuthenticated ? logout : () => handleNav('/login')}
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
    </div>
  );
};