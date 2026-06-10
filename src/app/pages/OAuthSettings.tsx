import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink, 
  Save, 
  CheckCircle, 
  Info, 
  Plus, 
  X, 
  Sparkles,
  Globe,
  Trash2
} from 'lucide-react';

// Provider logos
const providerLogos = {
  google: (
    <svg className="w-8 h-8" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  facebook: (
    <svg className="w-8 h-8" fill="#1877F2" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  github: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
};

interface OAuthProvider {
  id: string;
  name: string;
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  setupUrl: string;
}

export const OAuthSettings = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [providers, setProviders] = useState<OAuthProvider[]>([
    {
      id: 'google',
      name: 'Google',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: `${window.location.origin}/auth/callback`,
      scopes: ['openid', 'profile', 'email'],
      setupUrl: 'https://console.cloud.google.com/apis/credentials',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: `${window.location.origin}/auth/callback`,
      scopes: ['email', 'public_profile'],
      setupUrl: 'https://developers.facebook.com/apps',
    },
    {
      id: 'github',
      name: 'GitHub',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: `${window.location.origin}/auth/callback`,
      scopes: ['read:user', 'user:email'],
      setupUrl: 'https://github.com/settings/developers',
    },
  ]);

  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProvider, setNewProvider] = useState<Partial<OAuthProvider>>({
    id: '',
    name: '',
    enabled: false,
    clientId: '',
    clientSecret: '',
    redirectUri: `${window.location.origin}/auth/callback`,
    scopes: [],
    setupUrl: ''
  });
  const [scopeInput, setScopeInput] = useState('');

  const handleToggleProvider = (id: string) => {
    setProviders(providers.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const handleUpdateProvider = (id: string, field: keyof OAuthProvider, value: any) => {
    setProviders(providers.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSave = async () => {
    console.log('Saving OAuth settings:', providers);
    setSaveSuccess(true);
    toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyToClipboard = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(isRTL ? 'تم النسخ' : 'Copied to clipboard');
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const handleAddProvider = () => {
    if (newProvider.id && newProvider.name && newProvider.redirectUri && newProvider.setupUrl) {
      setProviders([...providers, newProvider as OAuthProvider]);
      setShowAddModal(false);
      setNewProvider({
        id: '',
        name: '',
        enabled: false,
        clientId: '',
        clientSecret: '',
        redirectUri: `${window.location.origin}/auth/callback`,
        scopes: [],
        setupUrl: ''
      });
      setScopeInput('');
    } else {
      toast.error(isRTL ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              {isRTL ? 'إعدادات OAuth' : 'OAuth Settings'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL 
                ? 'تكوين موفري المصادقة الاجتماعية (OAuth 2.0 مع PKCE)'
                : 'Configure social authentication providers (OAuth 2.0 with PKCE)'
              }
            </p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-[#D4AF37]/20"
          >
            <Save className="w-5 h-5" />
            <span>{isRTL ? 'حفظ التغييرات' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-green-500">{isRTL ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!'}</span>
          </motion.div>
        )}

        {/* Important Notice */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Info className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-3">
                ⚠️ {isRTL ? 'تعليمات الإعداد المهمة' : 'Important Setup Instructions'}
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  1. {isRTL ? 'يجب تكوين كل موفر OAuth في وحدات التحكم الخاصة بالمطورين' : 'You must configure each OAuth provider in their respective developer consoles'}
                </p>
                <p>
                  2. {isRTL ? 'أضف رابط إعادة التوجيه إلى إعدادات تطبيق OAuth:' : 'Add the redirect URI to your OAuth app settings:'}{' '}
                  <code className="px-2 py-1 bg-white/5 rounded text-[#D4AF37]">{window.location.origin}/auth/callback</code>
                </p>
                <p>
                  3. {isRTL ? 'للتكامل مع Supabase، اتبع الأدلة الرسمية:' : 'For Supabase integration, follow the official guides:'}
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1 mt-2">
                  <li>
                    <a href="https://supabase.com/docs/guides/auth/social-login/auth-google" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">
                      Google OAuth Setup <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a href="https://supabase.com/docs/guides/auth/social-login/auth-facebook" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">
                      Facebook OAuth Setup <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a href="https://supabase.com/docs/guides/auth/social-login/auth-github" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">
                      GitHub OAuth Setup <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
                <p className="mt-3 text-yellow-400 font-semibold">
                  ⚡ {isRTL ? 'بدون الإعداد الصحيح، ستظهر أخطاء "provider is not enabled"!' : 'Without proper setup, you will see "provider is not enabled" errors!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* OAuth Providers */}
        <div className="space-y-4">
          {providers.map((provider, idx) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <div className="space-y-6">
                {/* Provider Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-white">
                      {providerLogos[provider.id as keyof typeof providerLogos]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {provider.name} OAuth
                      </h3>
                      <p className="text-sm text-gray-400">
                        {isRTL ? `المصادقة عبر ${provider.name}` : `Social authentication via ${provider.name}`}
                      </p>
                    </div>
                  </div>

                  {/* Enable/Disable Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={provider.enabled}
                      onChange={() => handleToggleProvider(provider.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D4AF37]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                    <span className="ms-3 text-sm font-medium text-white">
                      {provider.enabled ? (isRTL ? 'مفعّل' : 'Enabled') : (isRTL ? 'معطّل' : 'Disabled')}
                    </span>
                  </label>
                </div>

                {/* Configuration Fields */}
                {provider.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    {/* Client ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client ID
                      </label>
                      <div className="relative">
                        <Key className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" style={{ left: isRTL ? 'auto' : '0.75rem', right: isRTL ? '0.75rem' : 'auto' }} />
                        <input
                          type="text"
                          value={provider.clientId}
                          onChange={(e) => handleUpdateProvider(provider.id, 'clientId', e.target.value)}
                          placeholder="Enter your OAuth Client ID"
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                          style={{ paddingLeft: isRTL ? '3rem' : '2.5rem', paddingRight: isRTL ? '2.5rem' : '3rem' }}
                        />
                        <button
                          onClick={() => handleCopyToClipboard(provider.clientId)}
                          className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          style={{ right: isRTL ? 'auto' : '0.75rem', left: isRTL ? '0.75rem' : 'auto' }}
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Client Secret */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client Secret
                      </label>
                      <div className="relative">
                        <Shield className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" style={{ left: isRTL ? 'auto' : '0.75rem', right: isRTL ? '0.75rem' : 'auto' }} />
                        <input
                          type={showSecrets[provider.id] ? 'text' : 'password'}
                          value={provider.clientSecret}
                          onChange={(e) => handleUpdateProvider(provider.id, 'clientSecret', e.target.value)}
                          placeholder="Enter your OAuth Client Secret"
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                          style={{ paddingLeft: isRTL ? '6rem' : '2.5rem', paddingRight: isRTL ? '2.5rem' : '6rem' }}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2" style={{ right: isRTL ? 'auto' : '0.75rem', left: isRTL ? '0.75rem' : 'auto' }}>
                          <button
                            onClick={() => handleCopyToClipboard(provider.clientSecret)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setShowSecrets({ ...showSecrets, [provider.id]: !showSecrets[provider.id] })}
                            className="text-gray-400 hover:text-white"
                          >
                            {showSecrets[provider.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Redirect URI */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {isRTL ? 'رابط إعادة التوجيه (انسخه إلى تطبيق OAuth)' : 'Redirect URI (Copy this to your OAuth app)'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={provider.redirectUri}
                          readOnly
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-lg py-3 text-white pr-12"
                        />
                        <button
                          onClick={() => handleCopyToClipboard(provider.redirectUri)}
                          className="absolute top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300"
                          style={{ right: isRTL ? 'auto' : '0.75rem', left: isRTL ? '0.75rem' : 'auto' }}
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Scopes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        OAuth Scopes
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {provider.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Setup Link */}
                    <a
                      href={provider.setupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {isRTL ? `فتح وحدة تحكم ${provider.name}` : `Open ${provider.name} Developer Console`}
                    </a>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add New Provider Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-[#D4AF37]/30 border-2 border-[#D4AF37]/50"
        >
          <Plus className="w-6 h-6" />
          <span className="text-lg">{isRTL ? 'إضافة موفر OAuth جديد' : 'Add New OAuth Provider'}</span>
          <Sparkles className="w-5 h-5" />
        </motion.button>

        {/* Add New Provider Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#14181D] to-[#1A1F26] border-2 border-[#D4AF37]/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 text-[#0B0F14]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {isRTL ? 'إضافة موفر OAuth جديد' : 'Add New OAuth Provider'}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {isRTL ? 'أضف موفر مصادقة اجتماعية جديد' : 'Add a new social authentication provider'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="space-y-5">
                  {/* Provider ID */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#D4AF37]" />
                      {isRTL ? 'معرف الموفر (ID)' : 'Provider ID'}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newProvider.id}
                      onChange={(e) => setNewProvider({ ...newProvider, id: e.target.value.toLowerCase() })}
                      placeholder={isRTL ? 'مثال: twitter, linkedin' : 'e.g., twitter, linkedin'}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Provider Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#D4AF37]" />
                      {isRTL ? 'اسم الموفر' : 'Provider Name'}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newProvider.name}
                      onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                      placeholder={isRTL ? 'مثال: Twitter, LinkedIn' : 'e.g., Twitter, LinkedIn'}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Client ID */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4 text-blue-400" />
                      {isRTL ? 'معرف العميل (Client ID)' : 'Client ID'}
                    </label>
                    <input
                      type="text"
                      value={newProvider.clientId}
                      onChange={(e) => setNewProvider({ ...newProvider, clientId: e.target.value })}
                      placeholder={isRTL ? 'أدخل Client ID من وحدة تحكم الموفر' : 'Enter Client ID from provider console'}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Client Secret */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      {isRTL ? 'المفتاح السري (Client Secret)' : 'Client Secret'}
                    </label>
                    <input
                      type="password"
                      value={newProvider.clientSecret}
                      onChange={(e) => setNewProvider({ ...newProvider, clientSecret: e.target.value })}
                      placeholder={isRTL ? 'أدخل Client Secret من وحدة تحكم الموفر' : 'Enter Client Secret from provider console'}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Redirect URI */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                      {isRTL ? 'رابط إعادة التوجيه' : 'Redirect URI'}
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newProvider.redirectUri}
                        onChange={(e) => setNewProvider({ ...newProvider, redirectUri: e.target.value })}
                        className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                      />
                      <button
                        onClick={() => handleCopyToClipboard(newProvider.redirectUri || '')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Scopes */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      {isRTL ? 'الصلاحيات (Scopes)' : 'OAuth Scopes'}
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={scopeInput}
                        onChange={(e) => setScopeInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && scopeInput) {
                            setNewProvider({ ...newProvider, scopes: [...(newProvider.scopes || []), scopeInput] });
                            setScopeInput('');
                          }
                        }}
                        placeholder={isRTL ? 'أدخل scope واضغط Enter' : 'Enter scope and press Enter'}
                        className="flex-1 bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                      />
                      <button
                        onClick={() => {
                          if (scopeInput) {
                            setNewProvider({ ...newProvider, scopes: [...(newProvider.scopes || []), scopeInput] });
                            setScopeInput('');
                          }
                        }}
                        className="bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/50 text-[#D4AF37] font-bold px-5 py-2.5 rounded-xl transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    {newProvider.scopes && newProvider.scopes.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-[#0B0F14] border border-white/5 rounded-xl">
                        {newProvider.scopes.map((scope, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-400 font-medium"
                          >
                            {scope}
                            <button
                              onClick={() => {
                                setNewProvider({
                                  ...newProvider,
                                  scopes: newProvider.scopes?.filter((_, i) => i !== idx)
                                });
                              }}
                              className="hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Setup URL */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-orange-400" />
                      {isRTL ? 'رابط وحدة التحكم' : 'Developer Console URL'}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newProvider.setupUrl}
                      onChange={(e) => setNewProvider({ ...newProvider, setupUrl: e.target.value })}
                      placeholder={isRTL ? 'https://developer.example.com' : 'https://developer.example.com'}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={handleAddProvider}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-[#D4AF37]/30"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{isRTL ? 'إضافة الموفر' : 'Add Provider'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewProvider({
                        id: '',
                        name: '',
                        enabled: false,
                        clientId: '',
                        clientSecret: '',
                        redirectUri: `${window.location.origin}/auth/callback`,
                        scopes: [],
                        setupUrl: ''
                      });
                      setScopeInput('');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold px-6 py-3.5 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                    <span>{isRTL ? 'إلغاء' : 'Cancel'}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PKCE Information */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">
                🔐 PKCE (Proof Key for Code Exchange) - RFC 7636
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  {isRTL 
                    ? 'يستخدم هذا التنفيذ PKCE لتعزيز الأمان ضد هجمات اعتراض رمز التفويض.'
                    : 'This implementation uses PKCE for enhanced security against authorization code interception attacks.'
                  }
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>Code Verifier: 128-character random string (96 bytes)</li>
                  <li>Code Challenge Method: S256 (SHA-256 hashing)</li>
                  <li>Automatic token refresh every 50 minutes</li>
                  <li>Secure session management via Supabase Auth</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};