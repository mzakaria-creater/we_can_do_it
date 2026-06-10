import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Bell, 
  X, 
  Check,
  Trash2,
  CheckCheck,
  Circle,
  CircleCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  DollarSign,
  CheckCircle2,
  XCircle,
  Palette,
  Moon,
  Sun,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Layout
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../lib/store';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'transaction' | 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

type TabType = 'customize' | 'notifications';

interface CustomizeSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'ar';
  compactMode: boolean;
  animations: boolean;
  soundEffects: boolean;
  autoRefresh: boolean;
  showBalance: boolean;
  currencyFormat: 'SAR' | 'USD' | 'AED';
}

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { language } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('customize');
  
  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'transaction',
      title: 'New Payment Received',
      message: 'Payment of SAR 2,450.00 from Customer #1234',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Settlement Completed',
      message: 'Your settlement of SAR 45,230.50 has been processed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'API Rate Limit Warning',
      message: 'You have used 85% of your API quota this month',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '4',
      type: 'error',
      title: 'Payment Failed',
      message: 'Transaction #TXN-8765 failed due to insufficient funds',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '5',
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Jan 20, 2026 from 2:00 AM - 4:00 AM',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true
    }
  ]);

  const [settings, setSettings] = useState<CustomizeSettings>({
    theme: 'dark',
    language: 'en',
    compactMode: false,
    animations: true,
    soundEffects: false,
    autoRefresh: true,
    showBalance: true,
    currencyFormat: 'SAR'
  });

  const [originalSettings, setOriginalSettings] = useState<CustomizeSettings>(settings);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'transaction': return <DollarSign className="w-4 h-4" />;
      case 'success': return <CheckCircle2 className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'transaction': return 'bg-primary/10 text-primary border-primary/20';
      case 'success': return 'bg-success/10 text-success border-success/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'info': return 'bg-accent/10 text-accent border-accent/20';
    }
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: language === 'ar' ? ar : enUS
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const handleSettingChange = (key: keyof CustomizeSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setOriginalSettings(settings);
    // TODO: Save to backend/localStorage
    console.log('Settings saved:', settings);
  };

  const handleReset = () => {
    setSettings(originalSettings);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: language === 'ar' ? -400 : 400 }}
            animate={{ x: 0 }}
            exit={{ x: language === 'ar' ? -400 : 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${language === 'ar' ? 'left-0' : 'right-0'} h-full w-[420px] bg-card/95 backdrop-blur-xl border-${language === 'ar' ? 'r' : 'l'} border-border shadow-2xl z-50 flex flex-col`}
            style={{
              background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.95) 0%, rgba(11, 15, 20, 0.98) 100%)'
            }}
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  {language === 'ar' ? 'الإعدادات' : 'Settings'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('customize')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'customize'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  {language === 'ar' ? 'تخصيص' : 'Customize'}
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all relative ${
                    activeTab === 'notifications'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'customize' ? (
                <div className="p-6 space-y-6">
                  {/* Theme */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      {language === 'ar' ? 'المظهر' : 'Theme'}
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 'light', icon: Sun, label: language === 'ar' ? 'فاتح' : 'Light' },
                        { value: 'dark', icon: Moon, label: language === 'ar' ? 'داكن' : 'Dark' },
                        { value: 'auto', icon: Zap, label: language === 'ar' ? 'تلقائي' : 'Auto' }
                      ].map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => handleSettingChange('theme', value)}
                          className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                            settings.theme === value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      {language === 'ar' ? 'اللغة' : 'Language'}
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 'en', label: 'English', flag: '🇬🇧' },
                        { value: 'ar', label: 'العربية', flag: '🇸🇦' }
                      ].map(({ value, label, flag }) => (
                        <button
                          key={value}
                          onClick={() => handleSettingChange('language', value)}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                            settings.language === value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="text-xl">{flag}</span>
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Currency Format */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      {language === 'ar' ? 'العملة' : 'Currency'}
                    </label>
                    <div className="flex gap-2">
                      {['SAR', 'USD', 'AED'].map((currency) => (
                        <button
                          key={currency}
                          onClick={() => handleSettingChange('currencyFormat', currency)}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all font-mono font-bold ${
                            settings.currencyFormat === currency
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {currency}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle Settings */}
                  <div className="space-y-3">
                    {[
                      { key: 'compactMode', icon: Layout, label: language === 'ar' ? 'الوضع المضغوط' : 'Compact Mode' },
                      { key: 'animations', icon: Zap, label: language === 'ar' ? 'الرسوم المتحركة' : 'Animations' },
                      { key: 'soundEffects', icon: Bell, label: language === 'ar' ? 'المؤثرات الصوتية' : 'Sound Effects' },
                      { key: 'autoRefresh', icon: BarChart3, label: language === 'ar' ? 'التحديث التلقائي' : 'Auto Refresh' },
                      { key: 'showBalance', icon: Shield, label: language === 'ar' ? 'إظهار الرصيد' : 'Show Balance' }
                    ].map(({ key, icon: Icon, label }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 rounded-lg border border-border/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{label}</span>
                        </div>
                        <button
                          onClick={() => handleSettingChange(key as keyof CustomizeSettings, !settings[key as keyof CustomizeSettings])}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings[key as keyof CustomizeSettings] ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <motion.div
                            animate={{ x: settings[key as keyof CustomizeSettings] ? 24 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {/* Actions */}
                  {notifications.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={markAllAsRead}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors text-sm font-medium"
                      >
                        <CheckCheck className="w-4 h-4" />
                        {language === 'ar' ? 'قراءة الكل' : 'Mark All Read'}
                      </button>
                      <button
                        onClick={clearAll}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                      </button>
                    </div>
                  )}

                  {/* Notifications List */}
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">
                        {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: language === 'ar' ? -100 : 100 }}
                          className={`relative p-4 rounded-lg border transition-all ${
                            notification.read
                              ? 'bg-muted/20 border-border/50 opacity-60'
                              : 'bg-card border-border shadow-sm'
                          }`}
                        >
                          {/* Unread Indicator */}
                          {!notification.read && (
                            <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} w-2 h-2 bg-primary rounded-full`} />
                          )}

                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className={`p-2 rounded-lg border shrink-0 ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm mb-1">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-3">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                {language === 'ar' ? 'قراءة' : 'Read'}
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              {language === 'ar' ? 'حذف' : 'Remove'}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer (only for Customize tab) */}
            {activeTab === 'customize' && (
              <div className="p-6 border-t border-border/50 bg-muted/10">
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {language === 'ar' ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
