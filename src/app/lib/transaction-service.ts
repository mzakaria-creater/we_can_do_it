// Transaction Service
// Manages transaction creation and tracking

export interface Transaction {
  id: string;
  msisdn: string;
  amount: number;
  merchantRef: string;
  formId?: string;
  formPrefixCode?: string;
  formData?: Record<string, string>;
  merchantAccount: string;
  paymentMethod: string;
  operator?: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

class TransactionService {
  private storageKey = 'press2pay_transactions';

  private getTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  private saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(transactions));
      window.dispatchEvent(new Event('transactions-updated'));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  createFormTransaction(data: {
    msisdn: string;
    amount: number;
    merchantRef: string;
    formId: string;
    formPrefixCode: string;
    formData: Record<string, string>;
    merchantAccount: string;
    paymentMethod: string;
    operator?: string;
  }): Transaction {
    const transaction: Transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      msisdn: data.msisdn,
      amount: data.amount,
      merchantRef: data.merchantRef,
      formId: data.formId,
      formPrefixCode: data.formPrefixCode,
      formData: data.formData,
      merchantAccount: data.merchantAccount,
      paymentMethod: data.paymentMethod,
      operator: data.operator,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);

    return transaction;
  }

  getTransactionById(id: string): Transaction | null {
    const transactions = this.getTransactions();
    return transactions.find(t => t.id === id) || null;
  }

  getAllTransactions(): Transaction[] {
    return this.getTransactions();
  }

  updateTransactionStatus(id: string, status: 'pending' | 'success' | 'failed'): boolean {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) return false;

    transactions[index].status = status;
    this.saveTransactions(transactions);

    return true;
  }
}

export const transactionService = new TransactionService();
