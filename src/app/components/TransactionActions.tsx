/**
 * 💳 Transaction Actions Component
 * Example usage of transaction database helpers
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Ban,
  RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';
import {
  updateTransactionStatus,
  approveTransaction,
  failTransaction,
  cancelTransaction,
  getTransaction,
  subscribeToTransaction,
} from '../../lib/transactions-db';
import { supabase } from '../../lib/supabase';

interface TransactionActionsProps {
  transactionId: string;
  onUpdate?: () => void;
}

export function TransactionActions({ transactionId, onUpdate }: TransactionActionsProps) {
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadTransaction();
    
    // Subscribe to real-time updates
    const channel = subscribeToTransaction(transactionId, (payload) => {
      console.log('Transaction updated:', payload.new);
      setTransaction(payload.new);
      
      // Show toast on status change
      if (payload.new.status !== payload.old.status) {
        toast.success(`Status updated: ${payload.new.status}`);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId]);

  const loadTransaction = async () => {
    setLoading(true);
    const result = await getTransaction(transactionId);
    
    if (result.success) {
      setTransaction(result.data);
    } else {
      toast.error('Failed to load transaction');
    }
    
    setLoading(false);
  };

  const handleApprove = async () => {
    setActionLoading('approve');
    
    const result = await approveTransaction(transactionId, 'MANUAL-APPROVAL');
    
    if (result.success) {
      toast.success('Transaction approved!');
      setTransaction(result.data);
      onUpdate?.();
    } else {
      toast.error(`Failed to approve: ${result.error}`);
    }
    
    setActionLoading(null);
  };

  const handleFail = async () => {
    const reason = prompt('Enter failure reason:');
    if (!reason) return;

    setActionLoading('fail');
    
    const result = await failTransaction(transactionId, reason);
    
    if (result.success) {
      toast.error('Transaction failed');
      setTransaction(result.data);
      onUpdate?.();
    } else {
      toast.error(`Failed to update: ${result.error}`);
    }
    
    setActionLoading(null);
  };

  const handleCancel = async () => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    setActionLoading('cancel');
    
    const result = await cancelTransaction(transactionId, reason);
    
    if (result.success) {
      toast.info('Transaction cancelled');
      setTransaction(result.data);
      onUpdate?.();
    } else {
      toast.error(`Failed to cancel: ${result.error}`);
    }
    
    setActionLoading(null);
  };

  const handleRefresh = async () => {
    await loadTransaction();
    toast.success('Refreshed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-4 text-gray-400">
        Transaction not found
      </div>
    );
  }

  const canApprove = ['pending', 'processing'].includes(transaction.status);
  const canFail = ['pending', 'processing'].includes(transaction.status);
  const canCancel = ['pending', 'processing'].includes(transaction.status);

  return (
    <div className="bg-gray-900 rounded-lg border border-gold-500/30 p-6 space-y-4">
      {/* Transaction Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Transaction ID</span>
          <span className="text-white font-mono text-sm">{transaction.id}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Status</span>
          <StatusBadge status={transaction.status} />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Amount</span>
          <span className="text-white font-bold">
            {transaction.amount.toFixed(2)} {transaction.currency}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Method</span>
          <span className="text-white">{transaction.method}</span>
        </div>

        {transaction.error_message && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Error</span>
            <span className="text-red-500 text-sm">{transaction.error_message}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-800">
        <button
          onClick={handleApprove}
          disabled={!canApprove || actionLoading !== null}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {actionLoading === 'approve' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Approve
        </button>

        <button
          onClick={handleFail}
          disabled={!canFail || actionLoading !== null}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {actionLoading === 'fail' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Fail
        </button>

        <button
          onClick={handleCancel}
          disabled={!canCancel || actionLoading !== null}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {actionLoading === 'cancel' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Ban className="w-4 h-4" />
          )}
          Cancel
        </button>

        <button
          onClick={handleRefresh}
          disabled={actionLoading !== null}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Timestamps */}
      <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-800">
        <div>Created: {new Date(transaction.created_at).toLocaleString()}</div>
        {transaction.completed_at && (
          <div>Completed: {new Date(transaction.completed_at).toLocaleString()}</div>
        )}
        {transaction.cancelled_at && (
          <div>Cancelled: {new Date(transaction.cancelled_at).toLocaleString()}</div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500',
    processing: 'bg-blue-500/10 text-blue-500',
    approved: 'bg-green-500/10 text-green-500',
    completed: 'bg-green-600/10 text-green-600',
    failed: 'bg-red-500/10 text-red-500',
    cancelled: 'bg-gray-500/10 text-gray-500',
    expired: 'bg-orange-500/10 text-orange-500',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[status] || 'bg-gray-500/10 text-gray-500'}`}>
      {status}
    </span>
  );
}

// ============================================
// Usage Example in a Page
// ============================================

export function TransactionDetailsPage({ transactionId }: { transactionId: string }) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gold-500 mb-6">
        Transaction Details
      </h1>
      
      <TransactionActions
        transactionId={transactionId}
        onUpdate={() => {
          console.log('Transaction updated, refresh data...');
        }}
      />
    </div>
  );
}

// ============================================
// Batch Operations Example
// ============================================

export function BatchTransactionActions({ transactionIds }: { transactionIds: string[] }) {
  const [processing, setProcessing] = useState(false);

  const handleBatchApprove = async () => {
    setProcessing(true);
    
    const results = await Promise.all(
      transactionIds.map(id => approveTransaction(id))
    );

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    toast.success(`Approved: ${succeeded}, Failed: ${failed}`);
    setProcessing(false);
  };

  return (
    <button
      onClick={handleBatchApprove}
      disabled={processing}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
    >
      {processing ? (
        <>
          <Loader2 className="inline w-4 h-4 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        `Approve ${transactionIds.length} Transactions`
      )}
    </button>
  );
}
