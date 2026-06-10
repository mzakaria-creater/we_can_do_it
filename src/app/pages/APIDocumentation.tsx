/**
 * 📚 Press2Pay - Professional API Documentation
 * Full-featured developer documentation with code examples
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Code,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Book,
  Key,
  Zap,
  AlertCircle,
  Webhook,
  Download,
  ExternalLink,
  Shield,
  Clock,
  Package,
  Menu,
  X,
} from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

function CodeBlock({ code, language = 'json', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="vip-card bg-black/80 border border-[#D4AF37]/20 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#D4AF37]/10">
          <span className="text-xs font-bold text-[#D4AF37] uppercase">{title}</span>
          <span className="text-xs text-gray-500">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm text-gray-300 vip-scrollbar">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 rounded-lg transition-all"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-[#D4AF37]" />
          )}
        </button>
      </div>
    </div>
  );
}

interface EndpointProps {
  method: string;
  path: string;
  title: string;
  description: string;
  auth?: boolean;
  requestExample?: string;
  responseExample?: string;
  errorExample?: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

function Endpoint({
  method,
  path,
  title,
  description,
  auth = true,
  requestExample,
  responseExample,
  errorExample,
  parameters,
}: EndpointProps) {
  const [selectedTab, setSelectedTab] = useState('request');

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    POST: 'bg-green-500/10 text-green-400 border-green-500/30',
    PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-6" id={path.replace(/\//g, '-')}>
      {/* Endpoint Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold border ${
              methodColors[method] || methodColors.GET
            }`}
          >
            {method}
          </span>
          <code className="text-white font-mono text-sm bg-black/50 px-3 py-1 rounded-lg">
            {path}
          </code>
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-gray-400">{description}</p>
      </div>

      {/* Authentication Notice */}
      {auth && (
        <div className="flex items-start gap-3 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
          <Shield className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-bold text-[#D4AF37]">Authentication Required</div>
            <div className="text-xs text-gray-400">
              This endpoint requires authentication headers. See{' '}
              <a href="#authentication" className="text-[#D4AF37] hover:underline">
                Authentication
              </a>{' '}
              section.
            </div>
          </div>
        </div>
      )}

      {/* Parameters */}
      {parameters && parameters.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white">Parameters</h3>
          <div className="vip-table-container">
            <table className="vip-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((param) => (
                  <tr key={param.name}>
                    <td>
                      <code className="text-[#D4AF37]">{param.name}</code>
                    </td>
                    <td>
                      <span className="text-blue-400">{param.type}</span>
                    </td>
                    <td>
                      {param.required ? (
                        <span className="vip-badge-error">Required</span>
                      ) : (
                        <span className="vip-badge">Optional</span>
                      )}
                    </td>
                    <td className="text-gray-400">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Examples */}
      <Tabs.Root value={selectedTab} onValueChange={setSelectedTab}>
        <Tabs.List className="flex gap-2 mb-4">
          {requestExample && (
            <Tabs.Trigger
              value="request"
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white"
            >
              Request
            </Tabs.Trigger>
          )}
          {responseExample && (
            <Tabs.Trigger
              value="response"
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white"
            >
              Response
            </Tabs.Trigger>
          )}
          {errorExample && (
            <Tabs.Trigger
              value="error"
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white"
            >
              Error
            </Tabs.Trigger>
          )}
        </Tabs.List>

        {requestExample && (
          <Tabs.Content value="request">
            <CodeBlock code={requestExample} title="Request Example" />
          </Tabs.Content>
        )}

        {responseExample && (
          <Tabs.Content value="response">
            <CodeBlock code={responseExample} title="Response Example" />
          </Tabs.Content>
        )}

        {errorExample && (
          <Tabs.Content value="error">
            <CodeBlock code={errorExample} title="Error Response" />
          </Tabs.Content>
        )}
      </Tabs.Root>
    </div>
  );
}

export default function APIDocumentation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('introduction');

  const navigation = [
    { id: 'introduction', label: 'Introduction', icon: Book },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'base-url', label: 'Base URL', icon: Zap },
    {
      id: 'endpoints',
      label: 'Endpoints',
      icon: Code,
      children: [
        { id: 'create-transaction', label: 'Create Transaction' },
        { id: 'get-transaction', label: 'Get Transaction' },
        { id: 'create-withdrawal', label: 'Create Withdrawal' },
      ],
    },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'errors', label: 'Error Codes', icon: AlertCircle },
    { id: 'rate-limits', label: 'Rate Limits', icon: Clock },
    { id: 'sdks', label: 'SDKs & Libraries', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#D4AF37]/20 bg-black/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#D4AF37]">Press2Pay API</h1>
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/press2pay/api"
              target="_blank"
              rel="noopener noreferrer"
              className="vip-button-secondary flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Postman Collection
            </a>
            <a
              href="/dashboard"
              className="vip-button-primary flex items-center gap-2 text-sm"
            >
              Dashboard
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className="fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-[280px] border-r border-[#D4AF37]/20 bg-black overflow-y-auto vip-scrollbar z-20"
            >
              <nav className="p-4 space-y-2">
                {navigation.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    active={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                  />
                ))}
              </nav>

              {/* Quick Links */}
              <div className="p-4 border-t border-[#D4AF37]/20">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Resources</h3>
                <div className="space-y-2">
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    <Book className="w-4 h-4" />
                    Getting Started Guide
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    <Code className="w-4 h-4" />
                    Code Examples
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    <Webhook className="w-4 h-4" />
                    Webhook Tester
                  </a>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-12 max-w-5xl">
          <div className="space-y-16">
            {/* Introduction */}
            <section id="introduction">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">
                    Press2Pay API Documentation
                  </h1>
                  <p className="text-xl text-gray-400">
                    Enterprise-grade payment processing for the MENA region
                  </p>
                </div>

                <div className="vip-card bg-gradient-to-br from-[#D4AF37]/10 to-transparent">
                  <h2 className="text-xl font-bold text-white mb-3">Welcome to Press2Pay</h2>
                  <p className="text-gray-400 mb-4">
                    Press2Pay provides a powerful, RESTful API for processing payments across
                    multiple channels including credit cards, mobile wallets, bank transfers, and
                    local payment methods.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-400">99.9% Uptime</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-400">PCI-DSS Level 1</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-400">CBE Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Authentication</h2>
                <p className="text-gray-400">
                  Press2Pay uses API keys with HMAC-SHA256 signature verification to authenticate
                  requests.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="vip-card">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Test Environment</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Public Key:</span>
                      <code className="block mt-1 p-2 bg-black/50 rounded text-green-400">
                        pk_test_abc123...
                      </code>
                    </div>
                  </div>
                </div>

                <div className="vip-card">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Live Environment</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Public Key:</span>
                      <code className="block mt-1 p-2 bg-black/50 rounded text-red-400">
                        pk_live_xyz789...
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              <CodeBlock
                title="Required Headers"
                code={`Content-Type: application/json
X-Public-Key: pk_test_abc123...
X-Signature: hmac_sha256_hash
Idempotency-Key: unique_request_id`}
                language="http"
              />

              <div className="vip-card bg-blue-500/10 border-blue-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-blue-400">Signature Generation</h3>
                    <p className="text-xs text-gray-400">
                      Generate HMAC-SHA256 signature using your secret key and request body:
                    </p>
                    <code className="block text-xs bg-black/50 p-3 rounded text-gray-300">
                      signature = HMAC_SHA256(secret_key, request_body)
                    </code>
                  </div>
                </div>
              </div>
            </section>

            {/* Base URL */}
            <section id="base-url" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Base URL</h2>
              </div>

              <div className="space-y-3">
                <div className="vip-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#D4AF37] mb-1">Test Environment</h3>
                      <code className="text-white">https://api-sandbox.press2pay.com/v1</code>
                    </div>
                    <Copy className="w-4 h-4 text-gray-500 cursor-pointer hover:text-[#D4AF37]" />
                  </div>
                </div>

                <div className="vip-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#D4AF37] mb-1">Production</h3>
                      <code className="text-white">https://api.press2pay.com/v1</code>
                    </div>
                    <Copy className="w-4 h-4 text-gray-500 cursor-pointer hover:text-[#D4AF37]" />
                  </div>
                </div>
              </div>
            </section>

            {/* Endpoints */}
            <section id="create-transaction">
              <Endpoint
                method="POST"
                path="/v1/transactions"
                title="Create Transaction"
                description="Create a new payment transaction. Returns a checkout URL for the customer to complete payment."
                auth={true}
                parameters={[
                  {
                    name: 'merchant_id',
                    type: 'string',
                    required: true,
                    description: 'Your merchant identifier',
                  },
                  {
                    name: 'amount',
                    type: 'number',
                    required: true,
                    description: 'Transaction amount (min: 10, max: 1000000)',
                  },
                  {
                    name: 'currency',
                    type: 'string',
                    required: true,
                    description: 'Currency code (EGP, USD, EUR, SAR, AED)',
                  },
                  {
                    name: 'type',
                    type: 'string',
                    required: true,
                    description: 'Transaction type: deposit, payout',
                  },
                  {
                    name: 'callback_url',
                    type: 'string',
                    required: true,
                    description: 'Webhook URL for transaction updates',
                  },
                  {
                    name: 'customer_email',
                    type: 'string',
                    required: false,
                    description: 'Customer email address',
                  },
                  {
                    name: 'customer_phone',
                    type: 'string',
                    required: false,
                    description: 'Customer phone number',
                  },
                ]}
                requestExample={`{
  "merchant_id": "MID12345",
  "amount": 500.00,
  "currency": "EGP",
  "type": "deposit",
  "callback_url": "https://merchant.com/webhook",
  "customer_email": "customer@example.com",
  "customer_phone": "+201234567890",
  "metadata": {
    "order_id": "ORD-12345",
    "product": "Premium Plan"
  }
}`}
                responseExample={`{
  "success": true,
  "transaction_id": "TXN-1234567890",
  "reference": "MERCH-REF-123",
  "status": "pending",
  "amount": 500.00,
  "currency": "EGP",
  "checkout_url": "https://checkout.press2pay.com/abc123",
  "expires_at": "2026-02-19T14:30:00Z",
  "created_at": "2026-02-19T14:15:00Z"
}`}
                errorExample={`{
  "success": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Amount must be between 10 and 1000000",
    "field": "amount"
  }
}`}
              />
            </section>

            <div className="vip-divider"></div>

            <section id="get-transaction">
              <Endpoint
                method="GET"
                path="/v1/transactions/{transaction_id}"
                title="Get Transaction"
                description="Retrieve the current status and details of a transaction."
                auth={true}
                parameters={[
                  {
                    name: 'transaction_id',
                    type: 'string',
                    required: true,
                    description: 'Transaction ID to retrieve',
                  },
                ]}
                responseExample={`{
  "success": true,
  "transaction": {
    "id": "TXN-1234567890",
    "reference": "MERCH-REF-123",
    "merchant_id": "MID12345",
    "status": "approved",
    "type": "deposit",
    "amount": 500.00,
    "fee_amount": 12.50,
    "net_amount": 487.50,
    "currency": "EGP",
    "method": "card",
    "provider": "paymob",
    "provider_reference": "PAYMOB-123456",
    "customer_email": "customer@example.com",
    "created_at": "2026-02-19T14:15:00Z",
    "completed_at": "2026-02-19T14:16:30Z"
  }
}`}
                errorExample={`{
  "success": false,
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "Transaction not found"
  }
}`}
              />
            </section>

            <div className="vip-divider"></div>

            <section id="create-withdrawal">
              <Endpoint
                method="POST"
                path="/v1/withdrawals"
                title="Create Withdrawal"
                description="Create a payout/withdrawal request to send funds to a customer."
                auth={true}
                parameters={[
                  {
                    name: 'merchant_id',
                    type: 'string',
                    required: true,
                    description: 'Your merchant identifier',
                  },
                  {
                    name: 'amount',
                    type: 'number',
                    required: true,
                    description: 'Withdrawal amount',
                  },
                  {
                    name: 'currency',
                    type: 'string',
                    required: true,
                    description: 'Currency code',
                  },
                  {
                    name: 'destination',
                    type: 'object',
                    required: true,
                    description: 'Destination account details',
                  },
                ]}
                requestExample={`{
  "merchant_id": "MID12345",
  "amount": 1000.00,
  "currency": "EGP",
  "destination": {
    "type": "bank_account",
    "account_number": "1234567890",
    "account_holder": "Ahmed Mohamed",
    "bank_code": "NBEG"
  },
  "callback_url": "https://merchant.com/webhook"
}`}
                responseExample={`{
  "success": true,
  "withdrawal_id": "WTH-1234567890",
  "status": "pending",
  "amount": 1000.00,
  "currency": "EGP",
  "estimated_arrival": "2026-02-20T14:00:00Z",
  "created_at": "2026-02-19T14:15:00Z"
}`}
                errorExample={`{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance for withdrawal"
  }
}`}
              />
            </section>

            {/* Webhooks */}
            <section id="webhooks" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Webhooks</h2>
                <p className="text-gray-400">
                  Press2Pay sends webhook notifications for transaction status changes.
                </p>
              </div>

              <div className="vip-card bg-[#D4AF37]/10">
                <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Webhook Events</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
                    <code className="text-white">transaction.approved</code> - Transaction approved
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
                    <code className="text-white">transaction.completed</code> - Payment completed
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
                    <code className="text-white">transaction.failed</code> - Payment failed
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
                    <code className="text-white">transaction.refunded</code> - Payment refunded
                  </li>
                </ul>
              </div>

              <CodeBlock
                title="Webhook Payload"
                code={`{
  "event": "transaction.approved",
  "transaction_id": "TXN-1234567890",
  "merchant_id": "MID12345",
  "reference": "MERCH-REF-123",
  "status": "approved",
  "amount": 500.00,
  "currency": "EGP",
  "timestamp": "2026-02-19T14:16:30Z",
  "signature": "hmac_sha256_signature"
}`}
              />

              <div className="vip-card bg-blue-500/10 border-blue-500/30">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-blue-400">Verify Webhook Signature</h3>
                    <p className="text-xs text-gray-400">
                      Always verify the webhook signature to ensure it came from Press2Pay:
                    </p>
                    <CodeBlock
                      code={`const crypto = require('crypto');

const signature = req.headers['x-signature'];
const payload = JSON.stringify(req.body);
const expectedSignature = crypto
  .createHmac('sha256', YOUR_SECRET_KEY)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid signature');
}`}
                      language="javascript"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Error Codes */}
            <section id="errors" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Error Codes</h2>
                <p className="text-gray-400">
                  Press2Pay uses standard HTTP response codes and provides detailed error messages.
                </p>
              </div>

              <div className="vip-table-container">
                <table className="vip-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Error</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code className="text-green-400">200</code>
                      </td>
                      <td>Success</td>
                      <td className="text-gray-400">Request completed successfully</td>
                    </tr>
                    <tr>
                      <td>
                        <code className="text-yellow-400">400</code>
                      </td>
                      <td>Bad Request</td>
                      <td className="text-gray-400">Invalid request parameters</td>
                    </tr>
                    <tr>
                      <td>
                        <code className="text-yellow-400">401</code>
                      </td>
                      <td>Unauthorized</td>
                      <td className="text-gray-400">Invalid or missing API key</td>
                    </tr>
                    <tr>
                      <td>
                        <code className="text-yellow-400">403</code>
                      </td>
                      <td>Forbidden</td>
                      <td className="text-gray-400">API key lacks required permissions</td>
                    </tr>
                    <tr>
                      <td>
                        <code className="text-red-400">404</code>
                      </td>
                      <td>Not Found</td>
                      <td className="text-gray-400">Resource not found</td>
                    </tr>
                    <tr>
                      <td>
                        <code className="text-red-400">429</code>
                      </td>
                      <td>Too Many Requests</td>
                      <td className="text-gray-400">Rate limit exceeded</td>
                    </tr>
                    <tr>
                      <td>
                        <code className="text-red-400">500</code>
                      </td>
                      <td>Internal Server Error</td>
                      <td className="text-gray-400">Something went wrong on our end</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <CodeBlock
                title="Error Response Structure"
                code={`{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Signature verification failed",
    "field": "signature",
    "documentation_url": "https://docs.press2pay.com/errors/invalid-signature"
  }
}`}
              />
            </section>

            {/* Rate Limits */}
            <section id="rate-limits" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Rate Limits</h2>
                <p className="text-gray-400">
                  API requests are rate-limited to ensure fair usage and system stability.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="vip-card text-center">
                  <div className="text-3xl font-bold text-[#D4AF37] mb-2">100</div>
                  <div className="text-sm text-gray-400">Requests per minute</div>
                </div>
                <div className="vip-card text-center">
                  <div className="text-3xl font-bold text-[#D4AF37] mb-2">10,000</div>
                  <div className="text-sm text-gray-400">Requests per day</div>
                </div>
                <div className="vip-card text-center">
                  <div className="text-3xl font-bold text-[#D4AF37] mb-2">∞</div>
                  <div className="text-sm text-gray-400">Enterprise plan</div>
                </div>
              </div>

              <div className="vip-card bg-yellow-500/10 border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-yellow-400">Rate Limit Headers</h3>
                    <p className="text-xs text-gray-400">
                      Check these response headers to monitor your usage:
                    </p>
                    <code className="block text-xs bg-black/50 p-3 rounded text-gray-300">
                      X-RateLimit-Limit: 100{'\n'}
                      X-RateLimit-Remaining: 95{'\n'}
                      X-RateLimit-Reset: 1645284000
                    </code>
                  </div>
                </div>
              </div>
            </section>

            {/* SDKs */}
            <section id="sdks" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">SDKs & Libraries</h2>
                <p className="text-gray-400">
                  Official SDKs to integrate Press2Pay in your preferred language.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="vip-card-hover cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">Node.js</h3>
                    <Package className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <code className="block text-sm text-gray-400 mb-3">
                    npm install @press2pay/node
                  </code>
                  <a
                    href="#"
                    className="text-sm text-[#D4AF37] hover:underline flex items-center gap-2"
                  >
                    View Documentation
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="vip-card-hover cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">PHP</h3>
                    <Package className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <code className="block text-sm text-gray-400 mb-3">
                    composer require press2pay/php
                  </code>
                  <a
                    href="#"
                    className="text-sm text-[#D4AF37] hover:underline flex items-center gap-2"
                  >
                    View Documentation
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="vip-card-hover cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">Python</h3>
                    <Package className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <code className="block text-sm text-gray-400 mb-3">
                    pip install press2pay
                  </code>
                  <a
                    href="#"
                    className="text-sm text-[#D4AF37] hover:underline flex items-center gap-2"
                  >
                    View Documentation
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="vip-card-hover cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">Ruby</h3>
                    <Package className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <code className="block text-sm text-gray-400 mb-3">
                    gem install press2pay
                  </code>
                  <a
                    href="#"
                    className="text-sm text-[#D4AF37] hover:underline flex items-center gap-2"
                  >
                    View Documentation
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-[#D4AF37]/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                © 2026 Press2Pay. All rights reserved. | API Version 1.0.0
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-sm text-gray-400 hover:text-[#D4AF37]">
                  Terms
                </a>
                <a href="#" className="text-sm text-gray-400 hover:text-[#D4AF37]">
                  Privacy
                </a>
                <a href="#" className="text-sm text-gray-400 hover:text-[#D4AF37]">
                  Support
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function NavItem({ item, active, onClick }: any) {
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#D4AF37]/10 rounded-lg transition-all"
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            <span>{item.label}</span>
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-6 mt-1 space-y-1"
            >
              {item.children.map((child: any) => (
                <a
                  key={child.id}
                  href={`#${child.id}`}
                  className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#D4AF37]/10 rounded-lg transition-all"
                >
                  {child.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <a
      href={`#${item.id}`}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
        active
          ? 'bg-[#D4AF37] text-black font-bold'
          : 'text-gray-400 hover:text-white hover:bg-[#D4AF37]/10'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{item.label}</span>
    </a>
  );
}
