import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Filter,
  Settings
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { subscribeToChannel, broadcastToChannel, unsubscribeFromChannel } from '../../lib/realtime';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const NotificationCenter: React.FC = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'success',
      title: 'Payment Received',
      titleAr: 'تم استلام الدفع',
      message: 'Payment of EGP 1,250 received successfully',
      messageAr: 'تم استلام دفعة بقيمة 1,250 جنيه مصري بنجاح',
      timestamp: Date.now() - 300000,
      read: false
    },
    {
      id: 'notif-2',
      type: 'warning',
      title: 'API Rate Limit Warning',
      titleAr: 'تحذير حد الاستخدام',
      message: 'You are approaching your API rate limit (85% used)',
      messageAr: 'أنت تقترب من حد استخدام API (85% مستخدم)',
      timestamp: Date.now() - 600000,
      read: false
    },
    {
      id: 'notif-3',
      type: 'info',
      title: 'New Merchant Onboarded',
      titleAr: 'تاجر جديد تم تسجيله',
      message: 'Merchant "Tech Store" has been successfully onboarded',
      messageAr: 'تم تسجيل التاجر "متجر التقنية" بنجاح',
      timestamp: Date.now() - 1200000,
      read: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // الاشتراك في قناة الإشعارات
  useEffect(() => {
    const channelName = 'notifications:global';
    
    subscribeToChannel(channelName, {
      onBroadcast: (event, payload) => {
        if (event === 'NEW_NOTIFICATION') {
          const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: payload.type || 'info',
            title: payload.title,
            titleAr: payload.titleAr,
            message: payload.message,
            messageAr: payload.messageAr,
            timestamp: Date.now(),
            read: false,
            actionUrl: payload.actionUrl,
            metadata: payload.metadata
          };

          setNotifications(prev => [newNotification, ...prev]);

          // عرض toast notification
          const title = isRTL ? newNotification.titleAr : newNotification.title;
          const message = isRTL ? newNotification.messageAr : newNotification.message;

          switch (newNotification.type) {
            case 'success':
              toast.success(title, { description: message });
              break;
            case 'error':
              toast.error(title, { description: message });
              break;
            case 'warning':
              toast.warning(title, { description: message });
              break;
            default:
              toast.info(title, { description: message });
          }

          // تشغيل صوت إشعار (اختياري)
          playNotificationSound();
        }
      }
    }, {
      private: false, // جعل القناة عامة
      broadcast: { ack: false, self: true }
    }).catch(error => {
      console.warn('[NotificationCenter] Could not subscribe to notifications. Realtime features disabled:', error);
    });

    return () => {
      unsubscribeFromChannel(channelName).catch(() => {
        // Silent fail on cleanup
      });
    };
  }, [isRTL]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      // Silent fail
    }
  };

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success(isRTL ? 'تم تحديد الكل كمقروء' : 'All marked as read');
  }, [isRTL]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success(isRTL ? 'تم حذف الإشعار' : 'Notification deleted');
  }, [isRTL]);

  const clearAll = useCallback(() => {
    if (confirm(isRTL ? 'هل تريد حذف جميع الإشعارات؟' : 'Delete all notifications?')) {
      setNotifications([]);
      toast.success(isRTL ? 'تم حذف جميع الإشعارات' : 'All notifications cleared');
    }
  }, [isRTL]);

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}${isRTL ? ' يوم' : 'd ago'}`;
    if (hours > 0) return `${hours}${isRTL ? ' ساعة' : 'h ago'}`;
    if (minutes > 0) return `${minutes}${isRTL ? ' دقيقة' : 'm ago'}`;
    return isRTL ? 'الآن' : 'Just now';
  };

  return (
    <>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-400" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -400 : 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? -400 : 400 }}
              className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-[450px] bg-[#14181D] border-${isRTL ? 'r' : 'l'} border-white/10 shadow-2xl z-50 flex flex-col`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-[#0B0F14]" />
                    </div>
                    {isRTL ? 'الإشعارات' : 'Notifications'}
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      filter === 'all'
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {isRTL ? 'الكل' : 'All'} ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      filter === 'unread'
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {isRTL ? 'غير مقروء' : 'Unread'} ({unreadCount})
                  </button>

                  <div className="flex-1" />

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title={isRTL ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                    >
                      <Check className="w-4 h-4 text-gray-400" />
                    </button>
                  )}

                  <button
                    onClick={clearAll}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={isRTL ? 'حذف الكل' : 'Clear all'}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <Bell className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">
                      {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredNotifications.map((notification, idx) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-white/5' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-white">
                                {isRTL ? notification.titleAr : notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-[#D4AF37] rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>

                            <p className="text-xs text-gray-400 mb-2">
                              {isRTL ? notification.messageAr : notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(notification.timestamp)}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * دالة مساعدة لإرسال إشعار جديد
 */
export const sendNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  try {
    await broadcastToChannel('notifications:global', 'NEW_NOTIFICATION', notification);
    console.log('[NotificationCenter] Notification sent successfully');
  } catch (error) {
    console.error('[NotificationCenter] Send error:', error);
  }
};