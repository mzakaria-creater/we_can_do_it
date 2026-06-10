// Payment Form Service
// Manages dynamic payment forms with field mapping

export type PaymentMethod = 'ussd' | 'card' | 'wallet' | 'bank_transfer' | 'mobile_money' | 'qr_code';

export type PaymentFormFieldType = 
  | 'customer_name'
  | 'customer_email'
  | 'customer_phone'
  | 'amount'
  | 'merchant_reference'
  | 'description'
  | 'wallet_operator'
  | 'card_number'
  | 'card_expiry'
  | 'card_cvv'
  | 'bank_account'
  | 'custom';

export type AssignmentMethod = 'manual' | 'auto' | 'prefilled';
export type AssignmentType = 'required' | 'optional' | 'hidden';

export interface FormFieldMapping {
  paymentFormField: PaymentFormFieldType;
  assignmentMethod: AssignmentMethod;
  assignmentType: AssignmentType;
  defaultValue?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required: boolean;
  options?: string[];
  mapping?: FormFieldMapping;
}

export interface PaymentForm {
  id: string;
  name: string;
  description?: string;
  prefixCode: string;
  merchantAccount: string;
  paymentMethod: PaymentMethod;
  fields: FormField[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Constants
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  ussd: 'USSD',
  card: 'Card Payment',
  wallet: 'Mobile Wallet',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  qr_code: 'QR Code',
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  ussd: '📱',
  card: '💳',
  wallet: '👛',
  bank_transfer: '🏦',
  mobile_money: '📲',
  qr_code: '📊',
};

export const PAYMENT_FORM_FIELD_LABELS: Record<PaymentFormFieldType, string> = {
  customer_name: 'Customer Name',
  customer_email: 'Customer Email',
  customer_phone: 'Customer Phone',
  amount: 'Amount',
  merchant_reference: 'Merchant Reference',
  description: 'Description',
  wallet_operator: 'Wallet Operator',
  card_number: 'Card Number',
  card_expiry: 'Card Expiry',
  card_cvv: 'Card CVV',
  bank_account: 'Bank Account',
  custom: 'Custom Field',
};

export const ASSIGNMENT_METHOD_LABELS: Record<AssignmentMethod, string> = {
  manual: 'Manual (User fills)',
  auto: 'Auto-generated',
  prefilled: 'Pre-filled',
};

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  required: 'Required',
  optional: 'Optional',
  hidden: 'Hidden',
};

// Local Storage Keys
const STORAGE_KEY = 'press2pay_payment_forms';

// Generate unique prefix code
export function generatePrefixCode(merchantAccount: string, paymentMethod: PaymentMethod): string {
  const merchantPrefix = merchantAccount.substring(0, 4).toUpperCase();
  const methodPrefix = paymentMethod.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${merchantPrefix}-${methodPrefix}-${timestamp}-${random}`;
}

// Get all forms
export function getAllForms(): PaymentForm[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading forms:', error);
    return [];
  }
}

// Get form by ID
export function getFormById(id: string): PaymentForm | null {
  const forms = getAllForms();
  return forms.find(f => f.id === id) || null;
}

// Save new form
export function saveForm(formData: Omit<PaymentForm, 'id' | 'prefixCode' | 'usageCount' | 'createdAt' | 'updatedAt'>): PaymentForm {
  const forms = getAllForms();
  
  const newForm: PaymentForm = {
    id: `form-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    prefixCode: generatePrefixCode(formData.merchantAccount, formData.paymentMethod),
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...formData,
  };

  forms.push(newForm);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));

  // Dispatch event for real-time updates
  window.dispatchEvent(new Event('forms-updated'));

  return newForm;
}

// Update form
export function updateForm(id: string, updates: Partial<PaymentForm>): PaymentForm | null {
  const forms = getAllForms();
  const index = forms.findIndex(f => f.id === id);
  
  if (index === -1) return null;

  forms[index] = {
    ...forms[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  window.dispatchEvent(new Event('forms-updated'));

  return forms[index];
}

// Delete form
export function deleteForm(id: string): boolean {
  const forms = getAllForms();
  const filtered = forms.filter(f => f.id !== id);
  
  if (filtered.length === forms.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('forms-updated'));

  return true;
}

// Toggle form active status
export function toggleFormActive(id: string): boolean {
  const form = getFormById(id);
  if (!form) return false;

  const newStatus = !form.isActive;
  updateForm(id, { isActive: newStatus });
  
  return newStatus;
}

// Increment form usage
export function incrementFormUsage(id: string): boolean {
  const form = getFormById(id);
  if (!form) return false;

  updateForm(id, { usageCount: form.usageCount + 1 });
  return true;
}

// Get form embed codes
export function getFormEmbedCodes(id: string): {
  link: string;
  iframe: string;
  html: string;
  react: string;
} {
  const baseUrl = window.location.origin;
  const link = `${baseUrl}/standalone-form/${id}`;

  const iframe = `<iframe src="${link}" width="100%" height="600" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>`;

  const html = `<!-- Press2Pay Payment Form -->
<div id="press2pay-form-${id}"></div>
<script>
  (function() {
    const container = document.getElementById('press2pay-form-${id}');
    const iframe = document.createElement('iframe');
    iframe.src = '${link}';
    iframe.width = '100%';
    iframe.height = '600';
    iframe.frameBorder = '0';
    iframe.style.border = '1px solid #e2e8f0';
    iframe.style.borderRadius = '8px';
    container.appendChild(iframe);
  })();
</script>`;

  const react = `import React from 'react';

export function Press2PayForm() {
  return (
    <div className="press2pay-form-container">
      <iframe
        src="${link}"
        width="100%"
        height="600"
        frameBorder="0"
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
        }}
        title="Press2Pay Payment Form"
      />
    </div>
  );
}`;

  return { link, iframe, html, react };
}

// Initialize with sample forms (for demo purposes)
export function initializeSampleForms() {
  const forms = getAllForms();
  if (forms.length > 0) return; // Already initialized

  const sampleForms: Omit<PaymentForm, 'id' | 'prefixCode' | 'usageCount' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Standard Payment Form',
      description: 'Basic payment form for general transactions',
      merchantAccount: 'MERC1234',
      paymentMethod: 'card',
      isActive: true,
      fields: [
        {
          id: 'field-1',
          label: 'Customer Name',
          type: 'text',
          placeholder: 'Enter your full name',
          required: true,
          mapping: {
            paymentFormField: 'customer_name',
            assignmentMethod: 'manual',
            assignmentType: 'required',
          },
        },
        {
          id: 'field-2',
          label: 'Email Address',
          type: 'email',
          placeholder: 'your@email.com',
          required: true,
          mapping: {
            paymentFormField: 'customer_email',
            assignmentMethod: 'manual',
            assignmentType: 'required',
          },
        },
        {
          id: 'field-3',
          label: 'Amount',
          type: 'number',
          placeholder: '0.00',
          required: true,
          mapping: {
            paymentFormField: 'amount',
            assignmentMethod: 'manual',
            assignmentType: 'required',
          },
        },
      ],
    },
    {
      name: 'Mobile Wallet Payment',
      description: 'Form for mobile wallet transactions',
      merchantAccount: 'MERC5678',
      paymentMethod: 'mobile_money',
      isActive: true,
      fields: [
        {
          id: 'field-1',
          label: 'Phone Number',
          type: 'tel',
          placeholder: '01XXXXXXXXX',
          required: true,
          mapping: {
            paymentFormField: 'customer_phone',
            assignmentMethod: 'manual',
            assignmentType: 'required',
          },
        },
        {
          id: 'field-2',
          label: 'Wallet Provider',
          type: 'select',
          placeholder: 'Select provider',
          required: true,
          options: ['Vodafone Cash', 'Orange Money', 'Etisalat Cash', 'WE Pay'],
          mapping: {
            paymentFormField: 'wallet_operator',
            assignmentMethod: 'manual',
            assignmentType: 'required',
          },
        },
        {
          id: 'field-3',
          label: 'Amount',
          type: 'number',
          placeholder: '0.00',
          required: true,
          mapping: {
            paymentFormField: 'amount',
            assignmentMethod: 'manual',
            assignmentType: 'required',
          },
        },
      ],
    },
  ];

  sampleForms.forEach(formData => saveForm(formData));
}

// Auto-initialize on first load
if (typeof window !== 'undefined') {
  // Check if we should initialize sample data
  const shouldInit = localStorage.getItem('press2pay_forms_initialized');
  if (!shouldInit) {
    // Don't auto-initialize, let user create forms manually
    localStorage.setItem('press2pay_forms_initialized', 'true');
  }
}
