import React, { useState, useEffect } from 'react';
import { Copy, Check, Plus, Loader2, Key, Trash2, Code2, Globe, User, Lock, Bell, BookOpen, ExternalLink, Webhook } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboard';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../lib/store';
import { motion, AnimatePresence } from 'motion/react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix?: string;
  created_at: string;
  last_used_at: string | null;
  status: 'active' | 'revoked';
}

interface ApiKeyWithValue extends ApiKey {
  plaintext_value?: string;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive';
}

type TabType = 'general' | 'org' | 'security' | 'api' | 'alerts';

export const Developers = () => {
  const { t } = useTranslation();
  const { language, isAuthenticated, user } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('api');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKeyValue, setShowKeyValue] = useState(false);

  useEffect(() => {
    if (activeTab === 'api') {
      fetchKeys();
      fetchWebhooks();
    }
  }, [activeTab]);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      // Mock API keys for demo
      setKeys([
        {
          id: 'key_prod_123',
          name: 'Production Key',
          key_prefix: 'p2p_live_sk_',
          created_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 'key_test_456',
          name: 'Test Key',
          key_prefix: 'p2p_test_sk_',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          last_used_at: new Date(Date.now() - 3600000).toISOString(),
          status: 'active'
        }
      ]);
    } catch (err: any) {
      console.error('Failed to fetch API keys:', err);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhooks = () => {
    // Mock webhooks for now
    setWebhooks([
      {
        id: 'wh_1',
        name: 'Main Automation Hub',
        url: 'https://n8n.press2pay.com/webhook/primary',
        status: 'active'
      }
    ]);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'org', label: 'Org', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'api', label: 'API & Hooks', icon: Code2 },
    { id: 'alerts', label: 'Alerts', icon: Bell }
  ];

  const copyCode = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    
    try {
      setIsCreating(true);
      
      // Mock API key creation
      const newKey = {
        id: 'key_' + Math.random().toString(36).substring(2, 15),
        name: newKeyName,
        key_prefix: 'p2p_live_sk_',
        created_at: new Date().toISOString(),
        last_used_at: null,
        status: 'active' as const
      };
      
      const fullKey = newKey.key_prefix + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      setNewlyCreatedKey(fullKey);
      setShowKeyValue(true);
      setKeys([newKey, ...keys]);
      setNewKeyName('');
      setShowNewKeyModal(false);
      toast.success('API key generated successfully');
    } catch (err: any) {
      console.error('Failed to create API key:', err);
      toast.error(err.message || 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this key? This action cannot be undone.')) return;
    
    try {
      // Mock key deletion
      setKeys(keys.filter(key => key.id !== id));
      toast.success('Key revoked successfully');
    } catch (err: any) {
      console.error('Failed to revoke key:', err);
      toast.error('Failed to revoke key');
    }
  };

  const closeKeyModal = () => {
    setShowNewKeyModal(false);
    setNewKeyName('');
    setNewlyCreatedKey(null);
    setShowKeyValue(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, organization, and API integrations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'api' && (
        <div className="space-y-8">
          {/* API Keys Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">API Keys</h2>
                <p className="text-muted-foreground text-sm">
                  Use these keys to authenticate your server-side requests.
                </p>
              </div>
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Generate Key
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No API keys yet. Generate your first key to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {keys.map((key) => (
                  <div key={key.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{key.name}</span>
                        {key.last_used_at && (
                          <span className="text-xs text-muted-foreground">
                            Last used {new Date(key.last_used_at).toLocaleDateString()}
                          </span>
                        )}
                        {!key.last_used_at && (
                          <span className="text-xs text-muted-foreground">
                            Never used
                          </span>
                        )}
                        {key.status === 'revoked' && (
                          <span className="text-xs text-destructive font-medium">
                            Revoked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {key.status === 'active' && (
                          <button
                            onClick={() => handleDeleteKey(key.id)}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                            title="Revoke"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-muted/50 px-4 py-3 rounded-lg border border-border">
                      <span className="flex-1 font-mono text-sm text-muted-foreground">
                        {key.key_prefix || 'pp_live_••••'}••••••••••••••••••••
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (Hidden for security)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Webhook Endpoints Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">n8n Webhook Endpoints</h2>
              <p className="text-muted-foreground text-sm">
                Configure URLs where you want to receive transaction events.
              </p>
            </div>

            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-center gap-3 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border transition-colors group"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-0.5">{webhook.name}</h3>
                    <a
                      href={webhook.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {webhook.url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-4 flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors">
              <Plus className="w-4 h-4" />
              Add Webhook Endpoint
            </button>
          </div>

          {/* Documentation Link */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Webhook className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Need help getting started?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Check out our comprehensive API documentation and integration guides.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  View API Documentation
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs Placeholder */}
      {activeTab !== 'api' && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Globe, {
                className: 'w-8 h-8 text-muted-foreground'
              })}
            </div>
            <h3 className="text-xl font-bold mb-2 capitalize">{activeTab} Settings</h3>
            <p className="text-muted-foreground">
              This section is under development. Configure your {activeTab} settings here.
            </p>
          </div>
        </div>
      )}

      {/* New Key Modal */}
      <AnimatePresence>
        {showNewKeyModal && (
          <div
            onClick={() => setShowNewKeyModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl"
            >
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold">Generate New API Key</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new API key for your integration
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Mobile App Production"
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    autoFocus
                  />
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
                  <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-600 dark:text-amber-500 mb-1">
                      Keep your key secure
                    </p>
                    <p className="text-muted-foreground">
                      Make sure to copy your key now. You won't be able to see it again!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/30 flex gap-3">
                <button
                  onClick={() => setShowNewKeyModal(false)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim() || isCreating}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate Key
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Key Value Modal */}
      <AnimatePresence>
        {showKeyValue && (
          <div
            onClick={() => closeKeyModal()}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl"
            >
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold">New API Key Generated</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your new API key has been generated. Make sure to copy it now.
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
                  <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-600 dark:text-amber-500 mb-1">
                      Keep your key secure
                    </p>
                    <p className="text-muted-foreground">
                      Make sure to copy your key now. You won't be able to see it again!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-muted/50 px-4 py-3 rounded-lg border border-border font-mono text-sm">
                  <span className="flex-1">{newlyCreatedKey}</span>
                  <button
                    onClick={() => copyCode(newlyCreatedKey || '', 'new_key')}
                    className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                    title="Copy Key"
                  >
                    {copiedId === 'new_key' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-muted/30 flex gap-3">
                <button
                  onClick={() => closeKeyModal()}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};