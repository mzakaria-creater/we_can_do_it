import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock,
  Unlock,
  Key,
  Hash,
  Shield,
  Copy,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Code,
  FileText,
  Zap,
  Download,
  Check,
  X
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { copyToClipboard as copyText } from '../../lib/clipboard';

type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512' | 'bcrypt';
type EncryptionMode = 'aes-256' | 'rsa' | 'base64';

export const HashSecurity = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [activeTab, setActiveTab] = useState<'hash' | 'encrypt' | 'verify'>('hash');
  
  // Hash Tab State
  const [hashInput, setHashInput] = useState('');
  const [hashAlgorithm, setHashAlgorithm] = useState<HashAlgorithm>('sha256');
  const [hashOutput, setHashOutput] = useState('');
  
  // Encryption Tab State
  const [encryptInput, setEncryptInput] = useState('');
  const [encryptMode, setEncryptMode] = useState<EncryptionMode>('aes-256');
  const [encryptKey, setEncryptKey] = useState('');
  const [encryptOutput, setEncryptOutput] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  // Verify Tab State
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<'match' | 'mismatch' | null>(null);

  // Mock hash function
  const generateHash = () => {
    if (!hashInput) {
      toast.error(isRTL ? 'الرجاء إدخال نص' : 'Please enter text');
      return;
    }
    
    const mockHash = btoa(hashInput + hashAlgorithm).substring(0, 64);
    setHashOutput(mockHash);
    toast.success(isRTL ? 'تم إنشاء التجزئة بنجاح' : 'Hash generated successfully');
  };

  // Mock encryption function
  const encryptData = () => {
    if (!encryptInput || !encryptKey) {
      toast.error(isRTL ? 'الرجاء إدخال النص والمفتاح' : 'Please enter text and key');
      return;
    }
    
    const mockEncrypted = btoa(encryptInput + encryptKey + encryptMode);
    setEncryptOutput(mockEncrypted);
    toast.success(isRTL ? 'تم التشفير بنجاح' : 'Encrypted successfully');
  };

  // Mock decryption function
  const decryptData = () => {
    if (!encryptOutput || !encryptKey) {
      toast.error(isRTL ? 'الرجاء إدخال البيانات المشفرة والمفتاح' : 'Please enter encrypted data and key');
      return;
    }
    
    try {
      const mockDecrypted = atob(encryptOutput).replace(encryptKey + encryptMode, '');
      setEncryptInput(mockDecrypted);
      toast.success(isRTL ? 'تم فك التشفير بنجاح' : 'Decrypted successfully');
    } catch {
      toast.error(isRTL ? 'فشل فك التشفير' : 'Decryption failed');
    }
  };

  // Mock verify function
  const verifyHashMatch = () => {
    if (!verifyInput || !verifyHash) {
      toast.error(isRTL ? 'الرجاء إدخال النص والتجزئة' : 'Please enter text and hash');
      return;
    }
    
    const generatedHash = btoa(verifyInput + 'sha256').substring(0, 64);
    setVerifyResult(generatedHash === verifyHash ? 'match' : 'mismatch');
  };

  const copyToClipboard = async (text: string) => {
    const success = await copyText(text);
    if (success) {
      toast.success(isRTL ? 'تم النسخ' : 'Copied to clipboard');
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEncryptKey(key);
    toast.success(isRTL ? 'تم إنشاء مفتاح عشوائي' : 'Random key generated');
  };

  const tabs = [
    { id: 'hash', icon: Hash, label: isRTL ? 'التجزئة' : 'Hash', color: 'blue' },
    { id: 'encrypt', icon: Lock, label: isRTL ? 'التشفير' : 'Encrypt', color: 'green' },
    { id: 'verify', icon: CheckCircle, label: isRTL ? 'التحقق' : 'Verify', color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F14] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              {isRTL ? 'التشفير والأمان' : 'Hash & Security'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL 
                ? 'أدوات التشفير والتحقق الأمني'
                : 'Cryptographic tools and security utilities'
              }
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-all border border-white/10">
              <FileText className="w-5 h-5" />
              <span>{isRTL ? 'دليل الأمان' : 'Security Guide'}</span>
            </button>
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-all border border-white/10">
              <Download className="w-5 h-5" />
              <span>{isRTL ? 'تصدير' : 'Export'}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Hash className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-blue-400 mb-1">5</h3>
            <p className="text-sm text-gray-400">{isRTL ? 'خوارزميات التجزئة' : 'Hash Algorithms'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-green-400 mb-1">3</h3>
            <p className="text-sm text-gray-400">{isRTL ? 'طرق التشفير' : 'Encryption Modes'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-purple-400 mb-1">12</h3>
            <p className="text-sm text-gray-400">{isRTL ? 'المفاتيح النشطة' : 'Active Keys'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#D4AF37]/10 to-[#0B0F14] border border-[#D4AF37]/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#D4AF37] mb-1">256-bit</h3>
            <p className="text-sm text-gray-400">{isRTL ? 'مستوى الأمان' : 'Security Level'}</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-[#14181D]/60 backdrop-blur-xl border border-white/10 rounded-xl p-2 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#D4AF37] text-[#0B0F14]'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Hash Tab */}
        {activeTab === 'hash' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Hash className="w-6 h-6 text-blue-400" />
                {isRTL ? 'إنشاء التجزئة' : 'Generate Hash'}
              </h3>
              
              <div className="space-y-5">
                {/* Algorithm Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    {isRTL ? 'الخوارزمية' : 'Algorithm'}
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {(['md5', 'sha1', 'sha256', 'sha512', 'bcrypt'] as HashAlgorithm[]).map(algo => (
                      <button
                        key={algo}
                        onClick={() => setHashAlgorithm(algo)}
                        className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
                          hashAlgorithm === algo
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {algo.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {isRTL ? 'النص المدخل' : 'Input Text'}
                  </label>
                  <textarea
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder={isRTL ? 'أدخل النص للتجزئة...' : 'Enter text to hash...'}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none resize-none"
                    rows={4}
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateHash}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-4 rounded-lg transition-all shadow-lg shadow-blue-500/20"
                >
                  <Zap className="w-5 h-5" />
                  <span>{isRTL ? 'إنشاء التجزئة' : 'Generate Hash'}</span>
                </button>

                {/* Output */}
                {hashOutput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      {isRTL ? 'الناتج' : 'Output'}
                    </label>
                    <div className="relative">
                      <code className="block w-full bg-[#0B0F14] border border-green-500/30 rounded-lg px-4 py-3 text-green-400 font-mono text-sm break-all">
                        {hashOutput}
                      </code>
                      <button
                        onClick={() => copyToClipboard(hashOutput)}
                        className="absolute top-2 right-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        style={{ right: isRTL ? 'auto' : '0.5rem', left: isRTL ? '0.5rem' : 'auto' }}
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Hash Information */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {isRTL ? 'معلومات مهمة' : 'Important Information'}
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• MD5 and SHA1 are considered weak and should not be used for security-critical applications</li>
                <li>• SHA256 and SHA512 are recommended for secure hashing</li>
                <li>• BCrypt is recommended for password hashing (includes salting)</li>
                <li>• Hash functions are one-way - you cannot reverse them to get the original input</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Encrypt Tab */}
        {activeTab === 'encrypt' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-green-400" />
              {isRTL ? 'التشفير / فك التشفير' : 'Encrypt / Decrypt'}
            </h3>
            
            <div className="space-y-5">
              {/* Encryption Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  {isRTL ? 'وضع التشفير' : 'Encryption Mode'}
                </label>
                <div className="flex gap-3">
                  {(['aes-256', 'rsa', 'base64'] as EncryptionMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setEncryptMode(mode)}
                      className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
                        encryptMode === mode
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Encryption Key */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {isRTL ? 'مفتاح التشفير' : 'Encryption Key'}
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={encryptKey}
                      onChange={(e) => setEncryptKey(e.target.value)}
                      placeholder={isRTL ? 'أدخل مفتاح التشفير...' : 'Enter encryption key...'}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                      style={{ paddingRight: isRTL ? '1rem' : '3rem', paddingLeft: isRTL ? '3rem' : '1rem' }}
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="absolute top-1/2 -translate-y-1/2"
                      style={{ right: isRTL ? 'auto' : '0.75rem', left: isRTL ? '0.75rem' : 'auto' }}
                    >
                      {showKey ? 
                        <EyeOff className="w-5 h-5 text-gray-400" /> : 
                        <Eye className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                  </div>
                  <button
                    onClick={generateRandomKey}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>{isRTL ? 'عشوائي' : 'Random'}</span>
                  </button>
                </div>
              </div>

              {/* Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {isRTL ? 'النص المدخل' : 'Input Text'}
                </label>
                <textarea
                  value={encryptInput}
                  onChange={(e) => setEncryptInput(e.target.value)}
                  placeholder={isRTL ? 'أدخل النص للتشفير...' : 'Enter text to encrypt...'}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none resize-none"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={encryptData}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-6 py-4 rounded-lg transition-all shadow-lg shadow-green-500/20"
                >
                  <Lock className="w-5 h-5" />
                  <span>{isRTL ? 'تشفير' : 'Encrypt'}</span>
                </button>
                <button
                  onClick={decryptData}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-6 py-4 rounded-lg transition-all shadow-lg shadow-yellow-500/20"
                >
                  <Unlock className="w-5 h-5" />
                  <span>{isRTL ? 'فك التشفير' : 'Decrypt'}</span>
                </button>
              </div>

              {/* Output */}
              {encryptOutput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {isRTL ? 'النص المشفر' : 'Encrypted Output'}
                  </label>
                  <div className="relative">
                    <code className="block w-full bg-[#0B0F14] border border-green-500/30 rounded-lg px-4 py-3 text-green-400 font-mono text-sm break-all">
                      {encryptOutput}
                    </code>
                    <button
                      onClick={() => copyToClipboard(encryptOutput)}
                      className="absolute top-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      style={{ right: isRTL ? 'auto' : '0.5rem', left: isRTL ? '0.5rem' : 'auto' }}
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              {isRTL ? 'التحقق من التجزئة' : 'Verify Hash'}
            </h3>
            
            <div className="space-y-5">
              {/* Original Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {isRTL ? 'النص الأصلي' : 'Original Text'}
                </label>
                <textarea
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder={isRTL ? 'أدخل النص الأصلي...' : 'Enter original text...'}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Hash to Verify */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {isRTL ? 'التجزئة للتحقق' : 'Hash to Verify'}
                </label>
                <input
                  type="text"
                  value={verifyHash}
                  onChange={(e) => setVerifyHash(e.target.value)}
                  placeholder={isRTL ? 'أدخل التجزئة...' : 'Enter hash...'}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 font-mono focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                />
              </div>

              {/* Verify Button */}
              <button
                onClick={verifyHashMatch}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold px-6 py-4 rounded-lg transition-all shadow-lg shadow-purple-500/20"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{isRTL ? 'التحقق' : 'Verify'}</span>
              </button>

              {/* Result */}
              {verifyResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-xl border flex items-center gap-4 ${
                    verifyResult === 'match' 
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  {verifyResult === 'match' ? (
                    <>
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Check className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-400 text-lg mb-1">
                          {isRTL ? '✓ تطابق التجزئة' : '✓ Hash Match'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {isRTL ? 'التجزئة تطابق النص الأصلي' : 'The hash matches the original text'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <X className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-400 text-lg mb-1">
                          {isRTL ? '✗ عدم تطابق التجزئة' : '✗ Hash Mismatch'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {isRTL ? 'التجزئة لا تطابق النص الأصلي' : 'The hash does not match the original text'}
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};