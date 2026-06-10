export type UserRole = 
  | 'owner' 
  | 'super_admin' 
  | 'finance' 
  | 'operations' 
  | 'risk' 
  | 'merchant' 
  | 'sub_merchant' 
  | 'viewer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  merchantId?: string;
}

export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'failed' | 'processing';
export type PaymentMethod = 'vodafone_cash' | 'orange_money' | 'etisalat_cash' | 'fawry' | 'meeza' | 'bank_transfer' | 'card' | 'usdt';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  method: PaymentMethod;
  merchantId: string;
  merchantName: string;
  walletId?: string;
  customerReference: string;
  createdAt: string;
  updatedAt: string;
  type: 'deposit' | 'payout';
}

export interface Wallet {
  id: string;
  name: string;
  method: PaymentMethod;
  dailyLimit: number;
  monthlyLimit: number;
  currentDaily: number;
  currentMonthly: number;
  status: 'active' | 'inactive' | 'limited';
  priority: number;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  balance: number;
  apiKey: string;
  webhookUrl: string;
  settlementConfig: {
    type: 'T+1' | 'T+2' | 'T+3' | 'custom';
    feePercent: number;
  };
}

export interface Settlement {
  id: string;
  merchantId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
}
