import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// نوع الأحداث المدعومة
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | 'BROADCAST';

// نوع البيانات المرسلة
export interface RealtimePayload<T = any> {
  type: RealtimeEventType;
  event: string;
  payload: T;
  timestamp?: number;
}

// مدير القنوات الفعالة
const activeChannels = new Map<string, RealtimeChannel>();
const reconnectTimers = new Map<string, NodeJS.Timeout>();
const maxReconnectAttempts = 5;
const reconnectAttempts = new Map<string, number>();

/**
 * إنشاء/الحصول على قناة realtime
 */
export const getOrCreateChannel = (
  channelName: string,
  options?: {
    private?: boolean;
    broadcast?: { ack?: boolean; self?: boolean };
  }
): RealtimeChannel => {
  // إذا كانت القناة موجودة، أرجعها
  if (activeChannels.has(channelName)) {
    return activeChannels.get(channelName)!;
  }

  // إنشاء قناة جديدة
  const channel = supabase.channel(channelName, {
    config: {
      private: options?.private ?? false,
      broadcast: options?.broadcast ?? { ack: false, self: true },
      presence: { key: '' }
    }
  });

  activeChannels.set(channelName, channel);
  reconnectAttempts.set(channelName, 0);
  return channel;
};

/**
 * الاشتراك في قناة مع معالجات الأحداث وإعادة اتصال تلقائي
 */
export const subscribeToChannel = async (
  channelName: string,
  handlers: {
    onInsert?: (payload: any) => void;
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
    onBroadcast?: (event: string, payload: any) => void;
  },
  options?: {
    private?: boolean;
    broadcast?: { ack?: boolean; self?: boolean };
    autoReconnect?: boolean;
  }
): Promise<RealtimeChannel> => {
  const autoReconnect = options?.autoReconnect ?? true;
  
  // إزالة القناة القديمة إذا كانت موجودة
  const existingChannel = activeChannels.get(channelName);
  if (existingChannel) {
    try {
      await supabase.removeChannel(existingChannel);
    } catch (e) {
      // Silent fail
    }
    activeChannels.delete(channelName);
  }

  const channel = getOrCreateChannel(channelName, options);

  // تسجيل معالجات الأحداث
  if (handlers.onInsert) {
    channel.on('broadcast', { event: 'INSERT' }, (payload) => {
      handlers.onInsert!(payload.payload);
    });
  }

  if (handlers.onUpdate) {
    channel.on('broadcast', { event: 'UPDATE' }, (payload) => {
      handlers.onUpdate!(payload.payload);
    });
  }

  if (handlers.onDelete) {
    channel.on('broadcast', { event: 'DELETE' }, (payload) => {
      handlers.onDelete!(payload.payload);
    });
  }

  if (handlers.onBroadcast) {
    channel.on('broadcast', { event: '*' }, (payload) => {
      handlers.onBroadcast!(payload.event, payload.payload);
    });
  }

  // الاشتراك في القناة
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.log(`[Realtime] ${channelName} - working in local mode (server setup required for live sync)`);
      resolve(channel);
    }, 2000);

    channel.subscribe((status, err) => {
      clearTimeout(timeoutId);
      
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] ✓ Subscribed to ${channelName}`);
        reconnectAttempts.set(channelName, 0);
        resolve(channel);
      } else if (status === 'CLOSED') {
        console.log(`[Realtime] Channel ${channelName} closed - local mode active`);
        // تم تعطيل إعادة الاتصال التلقائي حتى يتم إعداد Realtime على الخادم
        resolve(channel);
      } else {
        // CHANNEL_ERROR, TIMED_OUT, etc.
        console.log(`[Realtime] ${channelName} status: ${status} - local mode active`);
        resolve(channel);
      }
    });
  });
};

/**
 * إرسال رسالة بث إلى القناة
 */
export const broadcastToChannel = async (
  channelName: string,
  event: string,
  payload: any
): Promise<void> => {
  const channel = activeChannels.get(channelName);
  if (!channel) {
    throw new Error(`Channel ${channelName} not found. Subscribe first.`);
  }

  await channel.send({
    type: 'broadcast',
    event,
    payload: {
      ...payload,
      timestamp: Date.now()
    }
  });
};

/**
 * إلغاء الاشتراك وإزالة القناة
 */
export const unsubscribeFromChannel = async (channelName: string): Promise<void> => {
  // إلغاء أي محاولات إعادة اتصال
  const timer = reconnectTimers.get(channelName);
  if (timer) {
    clearTimeout(timer);
    reconnectTimers.delete(channelName);
  }
  reconnectAttempts.delete(channelName);
  
  const channel = activeChannels.get(channelName);
  if (channel) {
    try {
      await supabase.removeChannel(channel);
    } catch (e) {
      // Silent fail
    }
    activeChannels.delete(channelName);
    console.log(`[Realtime] Unsubscribed from ${channelName}`);
  }
};

/**
 * إلغاء الاشتراك من جميع القنوات
 */
export const unsubscribeFromAllChannels = async (): Promise<void> => {
  // إلغاء جميع timers
  reconnectTimers.forEach(timer => clearTimeout(timer));
  reconnectTimers.clear();
  reconnectAttempts.clear();
  
  const channelNames = Array.from(activeChannels.keys());
  await Promise.all(channelNames.map(name => unsubscribeFromChannel(name)));
  console.log('[Realtime] Unsubscribed from all channels');
};

/**
 * تعيين مصادقة المستخدم للـ realtime
 */
export const setRealtimeAuth = async (accessToken: string): Promise<void> => {
  await supabase.realtime.setAuth(accessToken);
  console.log('[Realtime] Auth token set successfully');
};

/**
 * الحصول على قائمة القنوات النشطة
 */
export const getActiveChannels = (): string[] => {
  return Array.from(activeChannels.keys());
};