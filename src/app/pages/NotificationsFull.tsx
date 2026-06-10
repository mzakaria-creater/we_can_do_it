import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Filter, 
  Search, 
  CheckCircle,
  Trash2,
  Archive,
  Settings,
  DollarSign,
  UserPlus,
  Shield,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'transaction' | 'user' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

export const NotificationsFull = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');

  useEffect(() => {
    // Load notifications from localStorage
    const stored = localStorage.getItem('press2pay_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'transaction':
        return <DollarSign className="w-5 h-5 text-[#D4AF37]" />;
      case 'user':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'security':
        return <Shield className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'transaction':
        return 'bg-[#D4AF37]/10 border-[#D4AF37]/20';
      case 'user':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'security':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('press2pay_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('press2pay_notifications', JSON.stringify(updated));
    toast.success(language === 'ar' ? 'تم تحديد الكل كمقروء' : 'All marked as read');
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('press2pay_notifications', JSON.stringify(updated));
    toast.success(language === 'ar' ? 'تم حذف الإشعار' : 'Notification deleted');
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('press2pay_notifications');
    toast.success(language === 'ar' ? 'تم مسح جميع الإشعارات' : 'All notifications cleared');
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesRead = readFilter === 'all' || 
      (readFilter === 'unread' && !notification.read) ||
      (readFilter === 'read' && notification.read);
    
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-7 h-7 text-[#D4AF37]" />
            {language === 'ar' ? 'الإشعارات' : 'Notifications'}
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'إدارة ومراقبة جميع الإشعارات'
              : 'Manage and monitor all notifications'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark All Read'}
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {language === 'ar' ? 'مسح الكل' : 'Clear All'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase">
            {language === 'ar' ? 'الإجمالي' : 'Total'}
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {notifications.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase">
            {language === 'ar' ? 'غير مقروءة' : 'Unread'}
          </p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {unreadCount}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase">
            {language === 'ar' ? 'مقروءة' : 'Read'}
          </p>
          <p className="text-2xl font-bold text-green-500 mt-1">
            {notifications.length - unreadCount}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase">
            {language === 'ar' ? 'اليوم' : 'Today'}
          </p>
          <p className="text-2xl font-bold text-blue-500 mt-1">
            {notifications.filter(n => {
              const today = new Date().toDateString();
              return new Date(n.timestamp).toDateString() === today;
            }).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              className={`w-full bg-background border border-border rounded-lg ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20`}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="all">{language === 'ar' ? 'كل الأنواع' : 'All Types'}</option>
            <option value="transaction">{language === 'ar' ? 'معاملات' : 'Transactions'}</option>
            <option value="user">{language === 'ar' ? 'مستخدمين' : 'Users'}</option>
            <option value="security">{language === 'ar' ? 'أمان' : 'Security'}</option>
            <option value="success">{language === 'ar' ? 'نجاح' : 'Success'}</option>
            <option value="warning">{language === 'ar' ? 'تحذير' : 'Warning'}</option>
            <option value="error">{language === 'ar' ? 'خطأ' : 'Error'}</option>
          </select>

          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
            <option value="unread">{language === 'ar' ? 'غير مقروءة' : 'Unread'}</option>
            <option value="read">{language === 'ar' ? 'مقروءة' : 'Read'}</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications found'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-card border rounded-xl p-4 transition-all ${
                notification.read 
                  ? 'border-border opacity-70' 
                  : 'border-[#D4AF37]/20 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg border ${getTypeColor(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.timestamp).toLocaleString(
                          language === 'ar' ? 'ar-EG' : 'en-US'
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title={language === 'ar' ? 'تحديد كمقروء' : 'Mark as read'}
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
