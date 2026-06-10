import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap,
  X,
  Search,
  Bell,
  BellOff,
  Settings,
  CreditCard,
  Users,
  Shield,
  FileText,
  DollarSign,
  Layers,
  Key,
  Webhook,
  BarChart3,
  Clock,
  ChevronRight,
  Check,
  Link2,
  Code,
  Terminal,
  Database
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  category: 'settings' | 'transactions' | 'merchants' | 'system' | 'reports' | 'developers';
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'payment-forms',
    title: 'Payment Forms',
    description: 'Configure payment form types',
    icon: CreditCard,
    path: '/payment-forms-config',
    color: 'blue',
    category: 'settings'
  },
  {
    id: 'pricing-fees',
    title: 'Pricing & Fees',
    description: 'Manage pricing engine',
    icon: DollarSign,
    path: '/pricing-fees-engine',
    color: 'green',
    category: 'settings'
  },
  {
    id: 'payment-links',
    title: 'Payment Links',
    description: 'Create shareable links',
    icon: Link2,
    path: '/payment-links',
    color: 'cyan',
    category: 'settings'
  },
  {
    id: 'api-management',
    title: 'API Management',
    description: 'Manage API keys',
    icon: Code,
    path: '/api-management',
    color: 'indigo',
    category: 'developers'
  },
  {
    id: 'api-console',
    title: 'API Console',
    description: 'Test API endpoints',
    icon: Terminal,
    path: '/api-console',
    color: 'blue',
    category: 'developers'
  },
  {
    id: 'api-tester',
    title: 'API Tester',
    description: 'Debug API calls',
    icon: Zap,
    path: '/api-tester',
    color: 'yellow',
    category: 'developers'
  },
  {
    id: 'supabase-example',
    title: 'Supabase Example',
    description: 'Learn Supabase integration',
    icon: Database,
    path: '/supabase-example',
    color: 'emerald',
    category: 'developers'
  },
  {
    id: 'hash-security',
    title: 'Hash & Security',
    description: 'Cryptographic tools',
    icon: Shield,
    path: '/hash-security',
    color: 'red',
    category: 'developers'
  },
  {
    id: 'oauth-settings',
    title: 'OAuth Settings',
    description: 'Social authentication',
    icon: Key,
    path: '/oauth-settings',
    color: 'purple',
    category: 'developers'
  },
  {
    id: 'support-tickets',
    title: 'Support Tickets',
    description: 'Customer support',
    icon: FileText,
    path: '/support-tickets',
    color: 'blue',
    category: 'system'
  },
  {
    id: 'gateway-config',
    title: 'Gateway Config',
    description: 'Add/Update gateways',
    icon: Layers,
    path: '/gateway-config',
    color: 'purple',
    category: 'system'
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    description: 'Configure webhooks',
    icon: Webhook,
    path: '/developers',
    color: 'pink',
    category: 'system'
  },
  {
    id: 'merchants',
    title: 'Merchants',
    description: 'Manage merchant accounts',
    icon: Users,
    path: '/merchants',
    color: 'indigo',
    category: 'merchants'
  },
  {
    id: 'rcba',
    title: 'Permissions',
    description: 'Role-based access control',
    icon: Shield,
    path: '/rcba',
    color: 'red',
    category: 'system'
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'Generate reports',
    icon: FileText,
    path: '/reports',
    color: 'cyan',
    category: 'reports'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'View analytics dashboard',
    icon: BarChart3,
    path: '/analytics',
    color: 'orange',
    category: 'reports'
  }
];

const COLORS = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  yellow: 'from-yellow-500 to-yellow-600',
  pink: 'from-pink-500 to-pink-600',
  indigo: 'from-indigo-500 to-indigo-600',
  red: 'from-red-500 to-red-600',
  cyan: 'from-cyan-500 to-cyan-600',
  orange: 'from-orange-500 to-orange-600',
  emerald: 'from-emerald-500 to-emerald-600'
};

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const { language } = useStore();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleNotificationToggle = async () => {
    if (!('Notification' in window)) {
      toast.error(isRTL ? 'المتصفح لا يدعم الإشعارات' : 'Browser does not support notifications');
      return;
    }

    if (Notification.permission === 'denied') {
      toast.error(isRTL ? 'تم رفض الإشعارات. يرجى تفعيلها من إعدادات المتصفح' : 'Notifications denied. Please enable in browser settings');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(false);
      toast.info(isRTL ? 'تم تعطيل الإشعارات' : 'Notifications disabled');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('Press2Pay', {
          body: isRTL ? 'تم تفعيل الإشعارات بنجاح! ✨' : 'Notifications enabled successfully! ✨',
          icon: '/favicon.ico'
        });
        toast.success(isRTL ? 'تم تفعيل الإشعارات' : 'Notifications enabled');
      }
    } catch (error) {
      console.error('Notification error:', error);
      toast.error(isRTL ? 'فشل تفعيل الإشعارات' : 'Failed to enable notifications');
    }
  };

  const filteredActions = QUICK_ACTIONS.filter(action => {
    const matchesSearch = 
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? action.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'settings', name: isRTL ? 'الإعدادات' : 'Settings', icon: Settings },
    { id: 'system', name: isRTL ? 'النظام' : 'System', icon: Layers },
    { id: 'merchants', name: isRTL ? 'التجار' : 'Merchants', icon: Users },
    { id: 'reports', name: isRTL ? 'التقارير' : 'Reports', icon: FileText },
    { id: 'developers', name: isRTL ? 'المطورين' : 'Developers', icon: Code }
  ];

  const handleActionClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-4xl max-h-[90vh] bg-[#14181D] border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#0B0F14] border-b border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#0B0F14]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}</h2>
                    <p className="text-sm text-gray-400">{isRTL ? 'اختصارات سريعة للإعدادات الرئيسية' : 'Quick shortcuts to key settings'}</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Search & Notifications */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500`} />
                  <input
                    type="text"
                    placeholder={isRTL ? 'بحث...' : 'Search...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full bg-[#0B0F14] border border-white/5 rounded-lg py-2.5 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-white text-sm focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none`}
                  />
                </div>

                <button
                  onClick={handleNotificationToggle}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    notificationsEnabled
                      ? 'bg-green-500/10 border-green-500/30 text-green-500'
                      : 'bg-[#0B0F14] border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {notificationsEnabled ? (
                    <>
                      <Bell className="w-5 h-5" />
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <BellOff className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="px-6 py-4 border-b border-white/10 bg-[#0B0F14]/40">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === null
                      ? 'bg-[#D4AF37] text-[#0B0F14]'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {isRTL ? 'الكل' : 'All'}
                </button>
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#D4AF37] text-[#0B0F14]'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      onClick={() => handleActionClick(action.path)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group bg-[#0B0F14]/60 hover:bg-[#0B0F14] border border-white/10 hover:border-[#D4AF37]/30 rounded-xl p-4 text-left transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${COLORS[action.color as keyof typeof COLORS]} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
                      </div>

                      <h3 className="text-white font-bold text-sm mb-1">{action.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">{action.description}</p>
                    </motion.button>
                  );
                })}
              </div>

              {filteredActions.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">
                    {isRTL ? 'لا توجد نتائج' : 'No results found'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-4 bg-[#0B0F14]/60">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{isRTL ? 'آخر تحديث: اليوم' : 'Last updated: Today'}</span>
                </div>
                <span>{filteredActions.length} {isRTL ? 'إجراء متاح' : 'actions available'}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Quick Action Button Component for Header
export const QuickActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative group flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-[#D4AF37]/20"
      >
        <Zap className="w-5 h-5" />
        <span className="text-sm">Quick Actions</span>
        
        {/* Pulse Animation */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]"></span>
        </span>
      </button>

      <QuickActionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};