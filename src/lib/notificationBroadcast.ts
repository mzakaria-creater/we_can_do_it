import { supabase } from '../../lib/supabase';

/**
 * Notification Utilities for Press2Pay
 * 
 * These utilities help broadcast notifications using Supabase Realtime
 * with proper INSERT, UPDATE, DELETE events.
 */

export interface NotificationPayload {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'transaction' | 'user' | 'security';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

/**
 * Broadcast a new notification (INSERT event)
 * 
 * @param userId - Target user ID
 * @param notification - Notification payload
 */
export const broadcastInsert = async (userId: string, notification: NotificationPayload) => {
  const topic = `notifications:${userId}`;
  const channel = supabase.channel(topic, {
    config: { broadcast: { self: true, ack: true } }
  });

  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      const payload = {
        id: notification.id || crypto.randomUUID(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: new Date().toISOString(),
        actionUrl: notification.actionUrl,
        metadata: notification.metadata,
      };

      await channel.send({
        type: 'broadcast',
        event: 'INSERT',
        payload: payload
      });

      console.log('✅ Notification broadcast (INSERT):', payload);
      
      // Cleanup after sending
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);
    }
  });
};

/**
 * Broadcast a notification update (UPDATE event)
 * 
 * @param userId - Target user ID
 * @param notificationId - Notification ID to update
 * @param updates - Fields to update
 */
export const broadcastUpdate = async (
  userId: string, 
  notificationId: string, 
  updates: Partial<NotificationPayload>
) => {
  const topic = `notifications:${userId}`;
  const channel = supabase.channel(topic, {
    config: { broadcast: { self: true, ack: true } }
  });

  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.send({
        type: 'broadcast',
        event: 'UPDATE',
        payload: {
          id: notificationId,
          ...updates
        }
      });

      console.log('✅ Notification broadcast (UPDATE):', notificationId, updates);
      
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);
    }
  });
};

/**
 * Broadcast a notification deletion (DELETE event)
 * 
 * @param userId - Target user ID
 * @param notificationId - Notification ID to delete
 */
export const broadcastDelete = async (userId: string, notificationId: string) => {
  const topic = `notifications:${userId}`;
  const channel = supabase.channel(topic, {
    config: { broadcast: { self: true, ack: true } }
  });

  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.send({
        type: 'broadcast',
        event: 'DELETE',
        payload: {
          id: notificationId
        }
      });

      console.log('✅ Notification broadcast (DELETE):', notificationId);
      
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);
    }
  });
};

/**
 * Broadcast to multiple users at once
 * 
 * @param userIds - Array of user IDs
 * @param notification - Notification payload
 */
export const broadcastToMultiple = async (userIds: string[], notification: NotificationPayload) => {
  const promises = userIds.map(userId => broadcastInsert(userId, notification));
  await Promise.all(promises);
  console.log(`✅ Broadcast sent to ${userIds.length} users`);
};

/**
 * Broadcast to all admins
 * 
 * @param notification - Notification payload
 * @param adminRoles - Admin roles to target (default: owner, super_admin)
 */
export const broadcastToAdmins = async (
  notification: NotificationPayload,
  adminRoles: string[] = ['owner', 'super_admin', 'admin']
) => {
  // Note: In production, you'd fetch admin users from database
  // For now, this is a placeholder
  console.log('📢 Broadcasting to admins with roles:', adminRoles);
  
  // Example implementation:
  // const { data: admins } = await supabase
  //   .from('users')
  //   .select('id')
  //   .in('role', adminRoles);
  // 
  // if (admins) {
  //   await broadcastToMultiple(admins.map(a => a.id), notification);
  // }
};

/**
 * Send transaction notification
 */
export const notifyTransaction = (userId: string, transactionData: {
  transactionId: string;
  amount: number;
  currency: string;
  status?: string;
}) => {
  return broadcastInsert(userId, {
    type: 'transaction',
    title: 'Payment Received',
    message: `Transaction #${transactionData.transactionId} for ${transactionData.amount} ${transactionData.currency}`,
    actionUrl: `/transactions/${transactionData.transactionId}`,
    metadata: transactionData
  });
};

/**
 * Send user registration notification
 */
export const notifyNewUser = (userId: string, userData: {
  userName: string;
  userEmail: string;
  userId: string;
}) => {
  return broadcastInsert(userId, {
    type: 'user',
    title: 'New User Registered',
    message: `${userData.userName} (${userData.userEmail}) has joined the platform`,
    actionUrl: `/users/${userData.userId}`,
    metadata: userData
  });
};

/**
 * Send security alert
 */
export const notifySecurityAlert = (userId: string, alertData: {
  alertType: string;
  message: string;
  ipAddress?: string;
  location?: string;
}) => {
  return broadcastInsert(userId, {
    type: 'security',
    title: 'Security Alert',
    message: alertData.message,
    metadata: alertData
  });
};

/**
 * Send success notification
 */
export const notifySuccess = (userId: string, title: string, message: string, actionUrl?: string) => {
  return broadcastInsert(userId, {
    type: 'success',
    title,
    message,
    actionUrl
  });
};

/**
 * Send error notification
 */
export const notifyError = (userId: string, title: string, message: string, actionUrl?: string) => {
  return broadcastInsert(userId, {
    type: 'error',
    title,
    message,
    actionUrl
  });
};

/**
 * Send warning notification
 */
export const notifyWarning = (userId: string, title: string, message: string, actionUrl?: string) => {
  return broadcastInsert(userId, {
    type: 'warning',
    title,
    message,
    actionUrl
  });
};

/**
 * Send info notification
 */
export const notifyInfo = (userId: string, title: string, message: string, actionUrl?: string) => {
  return broadcastInsert(userId, {
    type: 'info',
    title,
    message,
    actionUrl
  });
};

/**
 * Mark notification as read (broadcast UPDATE)
 */
export const markNotificationAsRead = (userId: string, notificationId: string) => {
  return broadcastUpdate(userId, notificationId, {
    metadata: { read: true, read_at: new Date().toISOString() }
  });
};

/**
 * Delete notification (broadcast DELETE)
 */
export const deleteNotification = (userId: string, notificationId: string) => {
  return broadcastDelete(userId, notificationId);
};

// Export all functions
export default {
  broadcastInsert,
  broadcastUpdate,
  broadcastDelete,
  broadcastToMultiple,
  broadcastToAdmins,
  notifyTransaction,
  notifyNewUser,
  notifySecurityAlert,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  markNotificationAsRead,
  deleteNotification,
};
