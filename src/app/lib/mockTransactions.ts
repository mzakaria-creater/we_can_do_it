// Mock Transaction Data - Unified source for all transaction tables
// This ensures consistency across Deposits, Payouts, Transactions, and Dashboard pages

export interface MockTransaction {
  id: string;
  reference: string;
  type: 'deposit' | 'payout';
  status: 'pending' | 'completed' | 'paid' | 'declined' | 'refunded' | 'expired' | 'rejected' | 'cashback' | 'approved' | 'failed' | 'canceled' | 'processing' | 'underreview' | 'underpaid' | 'overpaid';
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  merchant?: string;
  method?: string;
  paymentMethod?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  beneficiaryBank?: string;
  bankAccount?: string;
  accountNumber?: string;
  walletNumber?: string;
  createdAt: string;
  completedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  description?: string;
  notes?: string;
  failureReason?: string;
}

// Mock Deposit Transactions
export const mockDepositTransactions: MockTransaction[] = [
  {
    id: 'DEP-001',
    reference: 'VF-2024-001',
    type: 'deposit',
    status: 'completed',
    amount: 5000,
    currency: 'EGP',
    merchantId: 'MERCH-001',
    merchantName: 'ElectroMart Store',
    merchant: 'ElectroMart Store',
    method: 'Vodafone Cash',
    paymentMethod: 'Vodafone Cash',
    customerName: 'Ahmed Hassan',
    customerEmail: 'ahmed.hassan@email.com',
    customerPhone: '+20 100 123 4567',
    walletNumber: '01001234567',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    description: 'Payment for Order #12345'
  },
  {
    id: 'DEP-002',
    reference: 'CC-2024-002',
    type: 'deposit',
    status: 'pending',
    amount: 12500,
    currency: 'EGP',
    merchantId: 'MERCH-002',
    merchantName: 'Fashion Hub',
    merchant: 'Fashion Hub',
    method: 'Credit Card',
    paymentMethod: 'Credit Card',
    customerName: 'Sara Mohamed',
    customerEmail: 'sara.m@email.com',
    customerPhone: '+20 112 987 6543',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    description: 'Payment for Order #12346'
  },
  {
    id: 'DEP-003',
    reference: 'FW-2024-003',
    type: 'deposit',
    status: 'completed',
    amount: 8750,
    currency: 'EGP',
    merchantId: 'MERCH-001',
    merchantName: 'ElectroMart Store',
    merchant: 'ElectroMart Store',
    method: 'Fawry',
    paymentMethod: 'Fawry',
    customerName: 'Omar Ali',
    customerEmail: 'omar.ali@email.com',
    customerPhone: '+20 120 555 7890',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    description: 'Payment for Order #12347'
  },
  {
    id: 'DEP-004',
    reference: 'VF-2024-004',
    type: 'deposit',
    status: 'completed',
    amount: 3250,
    currency: 'EGP',
    merchantId: 'MERCH-003',
    merchantName: 'Food Delivery Co',
    merchant: 'Food Delivery Co',
    method: 'Vodafone Cash',
    paymentMethod: 'Vodafone Cash',
    customerName: 'Fatima Khaled',
    customerEmail: 'fatima.k@email.com',
    customerPhone: '+20 101 444 3333',
    walletNumber: '01014443333',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    description: 'Food order payment'
  },
  {
    id: 'DEP-005',
    reference: 'CC-2024-005',
    type: 'deposit',
    status: 'processing',
    amount: 15000,
    currency: 'EGP',
    merchantId: 'MERCH-002',
    merchantName: 'Fashion Hub',
    merchant: 'Fashion Hub',
    method: 'Credit Card',
    paymentMethod: 'Credit Card',
    customerName: 'Youssef Ibrahim',
    customerEmail: 'youssef.i@email.com',
    customerPhone: '+20 115 222 1111',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    description: 'Premium fashion order'
  },
  {
    id: 'DEP-006',
    reference: 'OC-2024-006',
    type: 'deposit',
    status: 'completed',
    amount: 7500,
    currency: 'EGP',
    merchantId: 'MERCH-004',
    merchantName: 'Tech Gadgets',
    merchant: 'Tech Gadgets',
    method: 'Orange Cash',
    paymentMethod: 'Orange Cash',
    customerName: 'Mona Salah',
    customerEmail: 'mona.salah@email.com',
    customerPhone: '+20 122 777 8888',
    walletNumber: '01227778888',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    description: 'Smartphone purchase'
  },
  {
    id: 'DEP-007',
    reference: 'VF-2024-007',
    type: 'deposit',
    status: 'failed',
    amount: 2000,
    currency: 'EGP',
    merchantId: 'MERCH-005',
    merchantName: 'Book Store',
    merchant: 'Book Store',
    method: 'Vodafone Cash',
    paymentMethod: 'Vodafone Cash',
    customerName: 'Karim Adel',
    customerEmail: 'karim.adel@email.com',
    customerPhone: '+20 100 999 8888',
    walletNumber: '01009998888',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    failureReason: 'Insufficient balance',
    description: 'Books order'
  },
  {
    id: 'DEP-008',
    reference: 'CC-2024-008',
    type: 'deposit',
    status: 'completed',
    amount: 20000,
    currency: 'EGP',
    merchantId: 'MERCH-001',
    merchantName: 'ElectroMart Store',
    merchant: 'ElectroMart Store',
    method: 'Credit Card',
    paymentMethod: 'Credit Card',
    customerName: 'Nour Hassan',
    customerEmail: 'nour.hassan@email.com',
    customerPhone: '+20 111 333 4444',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    description: 'Laptop purchase'
  },
  {
    id: 'DEP-009',
    reference: 'FW-2024-009',
    type: 'deposit',
    status: 'completed',
    amount: 4500,
    currency: 'EGP',
    merchantId: 'MERCH-003',
    merchantName: 'Food Delivery Co',
    merchant: 'Food Delivery Co',
    method: 'Fawry',
    paymentMethod: 'Fawry',
    customerName: 'Laila Ahmed',
    customerEmail: 'laila.ahmed@email.com',
    customerPhone: '+20 128 666 5555',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    description: 'Catering service'
  },
  {
    id: 'DEP-010',
    reference: 'VF-2024-010',
    type: 'deposit',
    status: 'pending',
    amount: 6800,
    currency: 'EGP',
    merchantId: 'MERCH-002',
    merchantName: 'Fashion Hub',
    merchant: 'Fashion Hub',
    method: 'Vodafone Cash',
    paymentMethod: 'Vodafone Cash',
    customerName: 'Hassan Mahmoud',
    customerEmail: 'hassan.m@email.com',
    customerPhone: '+20 106 222 3333',
    walletNumber: '01062223333',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    description: 'Fashion accessories'
  },
  {
    id: 'DEP-011',
    reference: 'CC-2024-011',
    type: 'deposit',
    status: 'completed',
    amount: 11000,
    currency: 'EGP',
    merchantId: 'MERCH-004',
    merchantName: 'Tech Gadgets',
    merchant: 'Tech Gadgets',
    method: 'Credit Card',
    paymentMethod: 'Credit Card',
    customerName: 'Amira Youssef',
    customerEmail: 'amira.y@email.com',
    customerPhone: '+20 113 888 9999',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    description: 'Tablet and accessories'
  },
  {
    id: 'DEP-012',
    reference: 'OC-2024-012',
    type: 'deposit',
    status: 'completed',
    amount: 3900,
    currency: 'EGP',
    merchantId: 'MERCH-005',
    merchantName: 'Book Store',
    merchant: 'Book Store',
    method: 'Orange Cash',
    paymentMethod: 'Orange Cash',
    customerName: 'Tamer Said',
    customerEmail: 'tamer.said@email.com',
    customerPhone: '+20 125 111 2222',
    walletNumber: '01251112222',
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 6.5 * 60 * 60 * 1000).toISOString(),
    description: 'Educational books'
  }
];

// Mock Payout Transactions
export const mockPayoutTransactions: MockTransaction[] = [
  {
    id: 'PAYOUT-001',
    reference: 'PO-2024-001',
    type: 'payout',
    status: 'paid',
    amount: 45000,
    currency: 'EGP',
    merchantId: 'MERCH-001',
    merchantName: 'ElectroMart Store',
    merchant: 'ElectroMart Store',
    method: 'Bank Transfer',
    paymentMethod: 'Bank Transfer',
    beneficiaryName: 'ElectroMart Trading LLC',
    beneficiaryBank: 'National Bank of Egypt',
    bankAccount: 'NBE-****-1234',
    accountNumber: '12345678901234',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    description: 'Weekly settlement',
    notes: 'All invoices cleared'
  },
  {
    id: 'PAYOUT-002',
    reference: 'PO-2024-002',
    type: 'payout',
    status: 'approved',
    amount: 32500,
    currency: 'EGP',
    merchantId: 'MERCH-002',
    merchantName: 'Fashion Hub',
    merchant: 'Fashion Hub',
    method: 'Bank Transfer',
    paymentMethod: 'Bank Transfer',
    beneficiaryName: 'Fashion Hub Ltd',
    beneficiaryBank: 'Commercial International Bank',
    bankAccount: 'CIB-****-5678',
    accountNumber: '56789012345678',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    description: 'Bi-weekly settlement'
  },
  {
    id: 'PAYOUT-003',
    reference: 'PO-2024-003',
    type: 'payout',
    status: 'pending',
    amount: 18750,
    currency: 'EGP',
    merchantId: 'MERCH-003',
    merchantName: 'Food Delivery Co',
    merchant: 'Food Delivery Co',
    method: 'Bank Transfer',
    paymentMethod: 'Bank Transfer',
    beneficiaryName: 'Food Delivery Company',
    beneficiaryBank: 'Banque Misr',
    bankAccount: 'BM-****-9012',
    accountNumber: '90123456789012',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    description: 'Weekly settlement'
  },
  {
    id: 'PAYOUT-004',
    reference: 'PO-2024-004',
    type: 'payout',
    status: 'paid',
    amount: 27000,
    currency: 'EGP',
    merchantId: 'MERCH-004',
    merchantName: 'Tech Gadgets',
    merchant: 'Tech Gadgets',
    method: 'Bank Transfer',
    paymentMethod: 'Bank Transfer',
    beneficiaryName: 'Tech Gadgets Inc',
    beneficiaryBank: 'HSBC Egypt',
    bankAccount: 'HSBC-****-3456',
    accountNumber: '34567890123456',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString(),
    description: 'Monthly settlement',
    notes: 'Includes Q1 bonus'
  },
  {
    id: 'PAYOUT-005',
    reference: 'PO-2024-005',
    type: 'payout',
    status: 'processing',
    amount: 15500,
    currency: 'EGP',
    merchantId: 'MERCH-005',
    merchantName: 'Book Store',
    merchant: 'Book Store',
    method: 'Bank Transfer',
    paymentMethod: 'Bank Transfer',
    beneficiaryName: 'Book Store LLC',
    beneficiaryBank: 'Arab African International Bank',
    bankAccount: 'AAIB-****-7890',
    accountNumber: '78901234567890',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    description: 'Bi-weekly settlement'
  },
  {
    id: 'PAYOUT-006',
    reference: 'PO-2024-006',
    type: 'payout',
    status: 'failed',
    amount: 22000,
    currency: 'EGP',
    merchantId: 'MERCH-001',
    merchantName: 'ElectroMart Store',
    merchant: 'ElectroMart Store',
    method: 'Bank Transfer',
    paymentMethod: 'Bank Transfer',
    beneficiaryName: 'ElectroMart Trading LLC',
    beneficiaryBank: 'National Bank of Egypt',
    bankAccount: 'NBE-****-1234',
    accountNumber: '12345678901234',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(),
    failureReason: 'Invalid account details',
    description: 'Weekly settlement - Failed'
  },
  {
    id: 'PAYOUT-007',
    reference: 'PO-2024-007',
    type: 'payout',
    status: 'paid',
    amount: 38500,
    currency: 'EGP',
    merchantId: 'MERCH-002',
    merchantName: 'Fashion Hub',
    merchant: 'Fashion Hub',
    method: 'Bank Transfer',
    paymentMethod: 'Bank Transfer',
    beneficiaryName: 'Fashion Hub Ltd',
    beneficiaryBank: 'Commercial International Bank',
    bankAccount: 'CIB-****-5678',
    accountNumber: '56789012345678',
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 94 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 92 * 60 * 60 * 1000).toISOString(),
    description: 'Weekly settlement'
  },
  {
    id: 'PAYOUT-008',
    reference: 'PO-2024-008',
    type: 'payout',
    status: 'pending',
    amount: 12300,
    currency: 'EGP',
    merchantId: 'MERCH-003',
    merchantName: 'Food Delivery Co',
    merchant: 'Food Delivery Co',
    method: 'Bank Transfer',
    paymentMethod: 'Bank Transfer',
    beneficiaryName: 'Food Delivery Company',
    beneficiaryBank: 'Banque Misr',
    bankAccount: 'BM-****-9012',
    accountNumber: '90123456789012',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    description: 'Ad-hoc settlement'
  }
];

// All Transactions Combined
export const mockAllTransactions: MockTransaction[] = [
  ...mockDepositTransactions,
  ...mockPayoutTransactions
].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// Helper functions
export const getMockDeposits = () => mockDepositTransactions;
export const getMockPayouts = () => mockPayoutTransactions;
export const getMockAllTransactions = () => mockAllTransactions;

export const getMockTransactionsByType = (type: 'deposit' | 'payout' | 'all') => {
  if (type === 'deposit') return mockDepositTransactions;
  if (type === 'payout') return mockPayoutTransactions;
  return mockAllTransactions;
};

export const getMockTransactionById = (id: string) => {
  return mockAllTransactions.find(txn => txn.id === id);
};

// Statistics helpers
export const getMockStats = () => {
  const deposits = mockDepositTransactions;
  const payouts = mockPayoutTransactions;
  
  return {
    deposits: {
      total: deposits.reduce((sum, d) => sum + d.amount, 0),
      completed: deposits.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0),
      pending: deposits.filter(d => d.status === 'pending' || d.status === 'processing').reduce((sum, d) => sum + d.amount, 0),
      count: deposits.length,
      completedCount: deposits.filter(d => d.status === 'completed').length,
      pendingCount: deposits.filter(d => d.status === 'pending' || d.status === 'processing').length,
    },
    payouts: {
      total: payouts.reduce((sum, p) => sum + p.amount, 0),
      paid: payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      pending: payouts.filter(p => p.status === 'pending' || p.status === 'processing').reduce((sum, p) => sum + p.amount, 0),
      approved: payouts.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0),
      count: payouts.length,
      paidCount: payouts.filter(p => p.status === 'paid').length,
      pendingCount: payouts.filter(p => p.status === 'pending' || p.status === 'processing').length,
    },
    transactions: {
      total: mockAllTransactions.length,
      totalAmount: mockAllTransactions.reduce((sum, t) => sum + t.amount, 0),
      completed: mockAllTransactions.filter(t => 
        t.status === 'completed' || t.status === 'paid'
      ).length,
    }
  };
};
