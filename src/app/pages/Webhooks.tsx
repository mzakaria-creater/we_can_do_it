import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Webhook, Plus, Edit, Trash2, Copy, Check, AlertCircle, CheckCircle, XCircle, Clock, Play, RefreshCw, Eye, Code, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey, projectId } from '../../lib/supabase';

interface WebhookEndpoint {
  id: string;
  merchantId: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  response?: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attempts: number;
  createdAt: string;
}

const WEBHOOK_EVENTS = [
  { value: 'transaction.created', label: 'Transaction Created', icon: '💳', color: 'text-blue-500' },
  { value: 'transaction.completed', label: 'Transaction Completed', icon: '✅', color: 'text-green-500' },
  { value: 'transaction.failed', label: 'Transaction Failed', icon: '❌', color: 'text-red-500' },
  { value: 'transaction.refunded', label: 'Transaction Refunded', icon: '↩️', color: 'text-amber-500' },
  { value: 'settlement.completed', label: 'Settlement Completed', icon: '💰', color: 'text-emerald-500' },
  { value: 'settlement.failed', label: 'Settlement Failed', icon: '⚠️', color: 'text-orange-500' },
  { value: 'chargeback.created', label: 'Chargeback Created', icon: '⚡', color: 'text-purple-500' },
  { value: 'merchant.updated', label: 'Merchant Updated', icon: '🏢', color: 'text-cyan-500' },
  { value: 'wallet.balance_updated', label: 'Wallet Balance Updated', icon: '💼', color: 'text-indigo-500' },
  { value: 'kyc.approved', label: 'KYC Approved', icon: '✓', color: 'text-green-500' },
  { value: 'kyc.rejected', label: 'KYC Rejected', icon: '✗', color: 'text-red-500' },
  { value: 'dispute.created', label: 'Dispute Created', icon: '⚖️', color: 'text-amber-500' },
];

export const Webhooks = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    url: '',
    events: [] as string[],
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/webhooks`,
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast.error(isRTL ? 'فشل تحميل الويب هوكس' : 'Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookEvents = async (webhookId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/webhooks/${webhookId}/events`,
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching webhook events:', error);
    }
  };

  const handleCreateWebhook = () => {
    setEditingWebhook(null);
    setFormData({
      url: '',
      events: [],
      status: 'active',
    });
    setShowModal(true);
  };

  const handleEditWebhook = (webhook: WebhookEndpoint) => {
    setEditingWebhook(webhook);
    setFormData({
      url: webhook.url,
      events: webhook.events,
      status: webhook.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url || formData.events.length === 0) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const endpoint = editingWebhook
        ? `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/webhooks/${editingWebhook.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/webhooks`;

      const method = editingWebhook ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save webhook');
      }

      toast.success(
        editingWebhook
          ? (isRTL ? 'تم تحديث الويب هوك بنجاح' : 'Webhook updated successfully')
          : (isRTL ? 'تم إنشاء الويب هوك بنجاح' : 'Webhook created successfully')
      );

      setShowModal(false);
      fetchWebhooks();
    } catch (error: any) {
      console.error('Error saving webhook:', error);
      toast.error(isRTL ? 'فشل حفظ الويب هوك' : 'Failed to save webhook');
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا الويب هوك؟' : 'Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/webhooks/${webhookId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete webhook');
      }

      toast.success(isRTL ? 'تم حذف الويب هوك بنجاح' : 'Webhook deleted successfully');
      fetchWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error(isRTL ? 'فشل حذف الويب هوك' : 'Failed to delete webhook');
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/webhooks/${webhookId}/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        toast.success(isRTL ? 'تم إرسال اختبار الويب هوك' : 'Test webhook sent successfully');
      } else {
        throw new Error('Failed to test webhook');
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error(isRTL ? 'فشل اختبار الويب هوك' : 'Failed to test webhook');
    }
  };

  const handleViewEvents = (webhookId: string) => {
    setSelectedWebhook(webhookId);
    fetchWebhookEvents(webhookId);
    setShowEventsModal(true);
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(secret);
    toast.success(isRTL ? 'تم نسخ السر' : 'Secret copied');
    setTimeout(() => setCopiedSecret(null), 2000);
  };

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Webhook className="text-primary" />
            {isRTL ? 'إدارة الويب هوكس' : 'Webhook Management'}
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            {isRTL
              ? 'إعداد وإدارة نقاط نهاية الويب هوك للأحداث'
              : 'Configure and manage webhook endpoints for events'}
          </p>
        </div>
        <button
          onClick={handleCreateWebhook}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          {isRTL ? 'إضافة ويب هوك' : 'Add Webhook'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-foreground">{webhooks.length}</div>
          <div className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الويب هوكس' : 'Total Webhooks'}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-500">{webhooks.filter(w => w.status === 'active').length}</div>
          <div className="text-sm text-muted-foreground">{isRTL ? 'نشط' : 'Active'}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-green-500">
            {webhooks.reduce((acc, w) => acc + w.successCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">{isRTL ? 'نجاحات' : 'Successes'}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-red-500">
            {webhooks.reduce((acc, w) => acc + w.failureCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">{isRTL ? 'فشل' : 'Failures'}</div>
        </div>
      </div>

      {/* Webhooks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground mt-4">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      ) : webhooks.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <Webhook size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{isRTL ? 'لا توجد ويب هوكس' : 'No webhooks configured'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${webhook.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                    <h3 className="text-lg font-bold text-foreground">{webhook.url}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.map(event => {
                      const eventInfo = WEBHOOK_EVENTS.find(e => e.value === event);
                      return (
                        <span
                          key={event}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-muted ${eventInfo?.color}`}
                        >
                          <span>{eventInfo?.icon}</span>
                          <span>{eventInfo?.label || event}</span>
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span>{webhook.successCount} {isRTL ? 'نجاحات' : 'successes'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-500" />
                      <span>{webhook.failureCount} {isRTL ? 'فشل' : 'failures'}</span>
                    </div>
                    {webhook.lastTriggered && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{isRTL ? 'آخر تشغيل' : 'Last triggered'}: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs font-mono">
                      <Shield size={14} className="text-primary" />
                      <span className="blur-sm hover:blur-none transition-all cursor-pointer">{webhook.secret}</span>
                      <button
                        onClick={() => copySecret(webhook.secret)}
                        className="p-1 hover:bg-primary/10 rounded transition-colors"
                      >
                        {copiedSecret === webhook.secret ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewEvents(webhook.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg font-bold hover:bg-blue-500/20 transition-all text-sm"
                  >
                    <Eye size={16} />
                    {isRTL ? 'الأحداث' : 'Events'}
                  </button>
                  <button
                    onClick={() => handleTestWebhook(webhook.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-500 rounded-lg font-bold hover:bg-purple-500/20 transition-all text-sm"
                  >
                    <Play size={16} />
                    {isRTL ? 'اختبار' : 'Test'}
                  </button>
                  <button
                    onClick={() => handleEditWebhook(webhook)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all text-sm"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-bold hover:bg-destructive/20 transition-all text-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Webhook Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">
                  {editingWebhook
                    ? (isRTL ? 'تعديل الويب هوك' : 'Edit Webhook')
                    : (isRTL ? 'إضافة ويب هوك جديد' : 'Add New Webhook')}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">{isRTL ? 'عنوان URL للويب هوك' : 'Webhook URL'} *</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://your-domain.com/webhooks"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">{isRTL ? 'الأحداث' : 'Events'} *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {WEBHOOK_EVENTS.map(event => (
                      <label
                        key={event.value}
                        className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.events.includes(event.value)
                            ? 'bg-primary/10 border-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event.value)}
                          onChange={() => toggleEvent(event.value)}
                          className="hidden"
                        />
                        <span className="text-xl">{event.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-sm">{event.label}</div>
                          <div className="text-xs text-muted-foreground">{event.value}</div>
                        </div>
                        {formData.events.includes(event.value) && <Check size={20} className="text-primary" />}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">{isRTL ? 'الحالة' : 'Status'} *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                    <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
                  >
                    {editingWebhook ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إنشاء' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Events Modal */}
      <AnimatePresence>
        {showEventsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">{isRTL ? 'سجل الأحداث' : 'Event Log'}</h3>
                <button onClick={() => setShowEventsModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {isRTL ? 'لا توجد أحداث' : 'No events yet'}
                  </div>
                ) : (
                  events.map(event => (
                    <div key={event.id} className="bg-muted/30 border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{WEBHOOK_EVENTS.find(e => e.value === event.event)?.icon}</span>
                          <span className="font-bold">{event.event}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {event.status === 'success' && <CheckCircle size={20} className="text-green-500" />}
                          {event.status === 'failed' && <XCircle size={20} className="text-red-500" />}
                          {event.status === 'retrying' && <RefreshCw size={20} className="text-amber-500 animate-spin" />}
                          <span className="text-sm text-muted-foreground">{event.attempts} attempts</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Webhooks;