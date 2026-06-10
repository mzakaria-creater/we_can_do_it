/**
 * 💳 Press2Pay - Transaction Database Helpers
 * Supabase transaction operations with proper error handling
 */

import { supabase } from './supabase';

// ============================================
// TRANSACTION STATUS UPDATES
// ============================================

/**
 * Update transaction status
 * Example: updateTransactionStatus('TXN-123', 'approved')
 */
export async function updateTransactionStatus(
  trxId: string,
  status: 'pending' | 'processing' | 'approved' | 'completed' | 'failed' | 'cancelled' | 'expired' | 'refunded',
  errorMessage?: string
) {
  const updateData: any = { 
    status,
    updated_at: new Date().toISOString(),
  };

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', trxId)
    .select();

  if (error) {
    console.error('[DB] Update status error:', error);
    return { success: false, error: error.message, data: null };
  }

  console.log('[DB] Transaction status updated:', trxId, '→', status);
  return { success: true, error: null, data: data[0] };
}

/**
 * Approve transaction
 */
export async function approveTransaction(trxId: string, providerReference?: string) {
  const updateData: any = {
    status: 'approved',
    completed_at: new Date().toISOString(),
  };

  if (providerReference) {
    updateData.provider_reference = providerReference;
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', trxId)
    .select();

  if (error) {
    console.error('[DB] Approve error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data: data[0] };
}

/**
 * Fail transaction
 */
export async function failTransaction(trxId: string, reason: string) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      status: 'failed',
      error_message: reason,
      failure_reason: reason,
    })
    .eq('id', trxId)
    .select();

  if (error) {
    console.error('[DB] Fail error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data: data[0] };
}

/**
 * Cancel transaction
 */
export async function cancelTransaction(trxId: string, reason?: string) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      error_message: reason,
    })
    .eq('id', trxId)
    .select();

  if (error) {
    console.error('[DB] Cancel error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data: data[0] };
}

// ============================================
// TRANSACTION QUERIES
// ============================================

/**
 * Get transaction by ID
 */
export async function getTransaction(trxId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', trxId)
    .single();

  if (error) {
    console.error('[DB] Get transaction error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data };
}

/**
 * Get transaction by reference
 */
export async function getTransactionByReference(reference: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('reference', reference)
    .single();

  if (error) {
    console.error('[DB] Get by reference error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data };
}

/**
 * Get transactions by merchant
 */
export async function getMerchantTransactions(
  merchantId: string,
  filters?: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }
) {
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[DB] Get merchant transactions error:', error);
    return { success: false, error: error.message, data: null, count: 0 };
  }

  return { success: true, error: null, data, count };
}

/**
 * Search transactions
 */
export async function searchTransactions(searchTerm: string, filters?: {
  merchantId?: string;
  status?: string;
  limit?: number;
}) {
  let query = supabase
    .from('transactions')
    .select('*')
    .or(`id.ilike.%${searchTerm}%,reference.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (filters?.merchantId) {
    query = query.eq('merchant_id', filters.merchantId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[DB] Search error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data };
}

// ============================================
// TRANSACTION CREATION
// ============================================

/**
 * Create new transaction
 */
export async function createTransaction(transaction: {
  id: string;
  reference: string;
  merchant_id: string;
  type: 'deposit' | 'payout' | 'refund';
  amount: number;
  currency?: string;
  method: string;
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
  description?: string;
  metadata?: any;
  callback_url?: string;
  webhook_url?: string;
  expires_at?: string;
}) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      ...transaction,
      status: 'pending',
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    console.error('[DB] Create transaction error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data };
}

// ============================================
// TRANSACTION UPDATES
// ============================================

/**
 * Update transaction metadata
 */
export async function updateTransactionMetadata(trxId: string, metadata: any) {
  const { data, error } = await supabase
    .from('transactions')
    .update({ metadata })
    .eq('id', trxId)
    .select();

  if (error) {
    console.error('[DB] Update metadata error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data: data[0] };
}

/**
 * Allocate wallet to transaction
 */
export async function allocateWalletToTransaction(trxId: string, walletId: string, walletNumber: string) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      allocated_wallet_id: walletId,
      wallet_number: walletNumber,
      status: 'processing',
    })
    .eq('id', trxId)
    .select();

  if (error) {
    console.error('[DB] Allocate wallet error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data: data[0] };
}

/**
 * Set provider reference
 */
export async function setProviderReference(trxId: string, provider: string, providerReference: string) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      provider,
      provider_reference: providerReference,
    })
    .eq('id', trxId)
    .select();

  if (error) {
    console.error('[DB] Set provider reference error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data: data[0] };
}

// ============================================
// TRANSACTION STATISTICS
// ============================================

/**
 * Get transaction statistics for merchant
 */
export async function getMerchantStats(merchantId: string, dateFrom?: string, dateTo?: string) {
  let query = supabase
    .from('transaction_stats')
    .select('*')
    .eq('merchant_id', merchantId);

  if (dateFrom) {
    query = query.gte('date', dateFrom);
  }

  if (dateTo) {
    query = query.lte('date', dateTo);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[DB] Get stats error:', error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, error: null, data };
}

/**
 * Get transaction count by status
 */
export async function getTransactionCountByStatus(merchantId?: string) {
  let query = supabase
    .from('transactions')
    .select('status', { count: 'exact', head: false });

  if (merchantId) {
    query = query.eq('merchant_id', merchantId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[DB] Get count error:', error);
    return { success: false, error: error.message, data: null };
  }

  // Group by status
  const statusCounts: Record<string, number> = {};
  data?.forEach((row: any) => {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  });

  return { success: true, error: null, data: statusCounts };
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to transaction changes
 */
export function subscribeToTransaction(trxId: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel(`transaction:${trxId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: `id=eq.${trxId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to merchant transactions
 */
export function subscribeToMerchantTransactions(merchantId: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel(`merchant:${merchantId}:transactions`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `merchant_id=eq.${merchantId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from channel
 */
export async function unsubscribe(channel: any) {
  await supabase.removeChannel(channel);
}
