/**
 * 📡 Press2Pay - Enterprise Realtime Status System
 * Supabase Realtime + WebSocket for live transaction status updates
 */

import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

// ✅ Transaction Status Types
export type TransactionStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'expired' 
  | 'refunded'
  | 'cancelled';

export type TransactionEvent = 
  | 'transaction.created'
  | 'transaction.updated'
  | 'transaction.completed'
  | 'transaction.failed'
  | 'transaction.expired'
  | 'transaction.refunded';

export interface RealtimeTransaction {
  id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  method: string;
  customer_email?: string;
  customer_phone?: string;
  metadata?: any;
  created_at: number;
  updated_at: number;
  expires_at?: number;
}

export interface RealtimeUpdate {
  event: TransactionEvent;
  transaction: RealtimeTransaction;
  previous_status?: TransactionStatus;
  timestamp: number;
}

// ✅ Realtime Manager Class
class RealtimeStatusManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private listeners: Map<string, ((update: RealtimeUpdate) => void)[]> = new Map();

  /**
   * Subscribe to transaction updates
   * @param transactionId - Transaction ID to subscribe to
   * @param callback - Callback function for updates
   */
  subscribeToTransaction(
    transactionId: string, 
    callback: (update: RealtimeUpdate) => void
  ): () => void {
    // Add listener
    if (!this.listeners.has(transactionId)) {
      this.listeners.set(transactionId, []);
    }
    this.listeners.get(transactionId)!.push(callback);

    // Create channel if doesn't exist
    if (!this.channels.has(transactionId)) {
      this.createTransactionChannel(transactionId);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromTransaction(transactionId, callback);
    };
  }

  /**
   * Subscribe to merchant transactions
   * @param merchantId - Merchant ID
   * @param callback - Callback function for updates
   */
  subscribeToMerchant(
    merchantId: string,
    callback: (update: RealtimeUpdate) => void
  ): () => void {
    const channelName = `merchant:${merchantId}`;
    
    if (!this.listeners.has(channelName)) {
      this.listeners.set(channelName, []);
    }
    this.listeners.get(channelName)!.push(callback);

    if (!this.channels.has(channelName)) {
      this.createMerchantChannel(merchantId);
    }

    return () => {
      this.unsubscribeFromMerchant(merchantId, callback);
    };
  }

  /**
   * Subscribe to all transactions (Admin only)
   */
  subscribeToAll(callback: (update: RealtimeUpdate) => void): () => void {
    const channelName = 'all-transactions';
    
    if (!this.listeners.has(channelName)) {
      this.listeners.set(channelName, []);
    }
    this.listeners.get(channelName)!.push(callback);

    if (!this.channels.has(channelName)) {
      this.createAllTransactionsChannel();
    }

    return () => {
      const listeners = this.listeners.get(channelName);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Publish transaction update
   */
  async publishUpdate(update: RealtimeUpdate): Promise<void> {
    const { transaction } = update;
    
    // Publish to transaction-specific channel
    await this.publishToChannel(transaction.id, update);
    
    // Publish to merchant channel
    await this.publishToChannel(`merchant:${transaction.merchant_id}`, update);
    
    // Publish to all transactions channel
    await this.publishToChannel('all-transactions', update);
  }

  /**
   * Create transaction-specific channel
   */
  private createTransactionChannel(transactionId: string) {
    const channel = supabase.channel(`transaction:${transactionId}`)
      .on(
        'broadcast',
        { event: 'transaction-update' },
        (payload) => {
          const update = payload.payload as RealtimeUpdate;
          this.notifyListeners(transactionId, update);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Subscribed to transaction ${transactionId}`);
        }
      });

    this.channels.set(transactionId, channel);
  }

  /**
   * Create merchant-specific channel
   */
  private createMerchantChannel(merchantId: string) {
    const channelName = `merchant:${merchantId}`;
    const channel = supabase.channel(channelName)
      .on(
        'broadcast',
        { event: 'merchant-transaction-update' },
        (payload) => {
          const update = payload.payload as RealtimeUpdate;
          this.notifyListeners(channelName, update);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Subscribed to merchant ${merchantId}`);
        }
      });

    this.channels.set(channelName, channel);
  }

  /**
   * Create all transactions channel
   */
  private createAllTransactionsChannel() {
    const channelName = 'all-transactions';
    const channel = supabase.channel(channelName)
      .on(
        'broadcast',
        { event: 'all-transactions-update' },
        (payload) => {
          const update = payload.payload as RealtimeUpdate;
          this.notifyListeners(channelName, update);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Subscribed to all transactions`);
        }
      });

    this.channels.set(channelName, channel);
  }

  /**
   * Publish to specific channel
   */
  private async publishToChannel(channelId: string, update: RealtimeUpdate) {
    const channel = this.channels.get(channelId);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'transaction-update',
        payload: update,
      });
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(key: string, update: RealtimeUpdate) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => callback(update));
    }
  }

  /**
   * Unsubscribe from transaction
   */
  private unsubscribeFromTransaction(
    transactionId: string,
    callback: (update: RealtimeUpdate) => void
  ) {
    const listeners = this.listeners.get(transactionId);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }

      // If no more listeners, remove channel
      if (listeners.length === 0) {
        const channel = this.channels.get(transactionId);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(transactionId);
        }
        this.listeners.delete(transactionId);
      }
    }
  }

  /**
   * Unsubscribe from merchant
   */
  private unsubscribeFromMerchant(
    merchantId: string,
    callback: (update: RealtimeUpdate) => void
  ) {
    const channelName = `merchant:${merchantId}`;
    const listeners = this.listeners.get(channelName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }

      if (listeners.length === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
        }
        this.listeners.delete(channelName);
      }
    }
  }

  /**
   * Cleanup all channels
   */
  cleanup() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.listeners.clear();
  }
}

// ✅ Singleton instance
export const realtimeManager = new RealtimeStatusManager();

// ✅ React Hook for transaction status
export function useTransactionStatus(transactionId: string) {
  const [status, setStatus] = React.useState<RealtimeTransaction | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!transactionId) return;

    setIsConnected(true);

    const unsubscribe = realtimeManager.subscribeToTransaction(
      transactionId,
      (update) => {
        setStatus(update.transaction);
      }
    );

    // Fetch initial status
    fetch(`/api/v1/transactions/${transactionId}`)
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(console.error);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [transactionId]);

  return { status, isConnected };
}

// ✅ React Hook for merchant transactions
export function useMerchantTransactions(merchantId: string) {
  const [transactions, setTransactions] = React.useState<RealtimeTransaction[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!merchantId) return;

    setIsConnected(true);

    const unsubscribe = realtimeManager.subscribeToMerchant(
      merchantId,
      (update) => {
        setTransactions(prev => {
          const index = prev.findIndex(t => t.id === update.transaction.id);
          if (index > -1) {
            // Update existing
            const updated = [...prev];
            updated[index] = update.transaction;
            return updated;
          } else {
            // Add new
            return [update.transaction, ...prev];
          }
        });
      }
    );

    // Fetch initial data
    fetch(`/api/v1/merchants/${merchantId}/transactions`)
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(console.error);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [merchantId]);

  return { transactions, isConnected };
}

// ✅ Status Badge Component
export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const statusConfig = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
    processing: { label: 'قيد المعالجة', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
    completed: { label: 'مكتملة', color: 'bg-green-500/10 text-green-500 border-green-500/30' },
    failed: { label: 'فاشلة', color: 'bg-red-500/10 text-red-500 border-red-500/30' },
    expired: { label: 'منتهية الصلاحية', color: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
    refunded: { label: 'مستردة', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
    cancelled: { label: 'ملغاة', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      <span className="relative flex h-2 w-2 mr-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" 
              style={{ backgroundColor: 'currentColor' }}></span>
        <span className="relative inline-flex rounded-full h-2 w-2" 
              style={{ backgroundColor: 'currentColor' }}></span>
      </span>
      {config.label}
    </span>
  );
}

// ✅ Real-time Transaction Card
export function RealtimeTransactionCard({ transactionId }: { transactionId: string }) {
  const { status, isConnected } = useTransactionStatus(transactionId);

  if (!status) {
    return <div className="animate-pulse">جاري التحميل...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gold-500/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gold-500">معاملة #{transactionId}</h3>
        <div className="flex items-center gap-2">
          <TransactionStatusBadge status={status.status} />
          {isConnected && (
            <span className="text-xs text-green-500">● متصل</span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-400">المبلغ</div>
          <div className="text-2xl font-bold text-gold-500">
            {status.amount.toLocaleString('ar-EG')} {status.currency}
          </div>
        </div>
        <div>
          <div className="text-gray-400">طريقة الدفع</div>
          <div className="font-semibold">{status.method}</div>
        </div>
        {status.customer_email && (
          <div className="col-span-2">
            <div className="text-gray-400">العميل</div>
            <div>{status.customer_email}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export for use in other components
export default realtimeManager;

// Import React for hooks
import React from 'react';
