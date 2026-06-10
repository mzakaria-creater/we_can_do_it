import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { supabase, publicAnonKey } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { Shield, Mail, ArrowRight, Loader2, Globe, CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router';

// MENA Region Countries Flags (Emoji)
const MENA_FLAGS = [
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt' },
  { code: 'QA', flag: '🇶🇦', name: 'Qatar' },
  { code: 'KW', flag: '🇰🇼', name: 'Kuwait' },
  { code: 'BH', flag: '🇧🇭', name: 'Bahrain' },
  { code: 'OM', flag: '🇴🇲', name: 'Oman' },
  { code: 'JO', flag: '🇯🇴', name: 'Jordan' },
  { code: 'LB', flag: '🇱🇧', name: 'Lebanon' },
  { code: 'MA', flag: '🇲🇦', name: 'Morocco' },
  { code: 'DZ', flag: '🇩🇿', name: 'Algeria' },
  { code: 'TN', flag: '🇹🇳', name: 'Tunisia' },
  { code: 'IQ', flag: '🇮🇶', name: 'Iraq' },
  { code: 'YE', flag: '🇾🇪', name: 'Yemen' },
  { code: 'PS', flag: '🇵🇸', name: 'Palestine' },
];

export const ForgotPassword = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { language, setLanguage } = useStore();
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast.error(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم' : 'Please enter your email or username');
      return;
    }

    setIsLoading(true);
    try {
      // Logic for password reset
      // In a real scenario with username/phone, we'd first resolve it to an email via backend
      let emailToReset = identifier;
      
      if (!identifier.includes('@')) {
        // Try to resolve identifier to email via server
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/auth/resolve-identifier`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ identifier: identifier.trim() })
        });

        if (response.ok) {
          const data = await response.json();
          emailToReset = data.email;
        } else {
          throw new Error(language === 'ar' ? 'لم يتم العثور على الحساب' : 'Account not found');
        }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(emailToReset.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      toast.success(language === 'ar' ? 'تم إرسال تعليمات الاستعادة إلى بريدك الإلكتروني' : 'Recovery instructions sent to your email');
      setTimeout(() => navigate(`/${language}/login`), 3000);
    } catch (error: any) {
      console.error('Reset error:', error);
      toast.error(language === 'ar' ? 'فشل إرسال الطلب: ' + error.message : 'Failed to send request: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    i18nInstance.changeLanguage(newLang);
    navigate(`/${newLang}/forgot-password`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col lg:flex-row font-sans selection:bg-[#D4AF37]/30 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Left Side: Branded Visual Content (Copied from Login) */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden bg-[#0B0F14]">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1657106251952-2d584ebdf886?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdWJhaSUyMHNreWxpbmUlMjBuaWdodCUyMGJ1cmolMjBraGFsaWZhfGVufDF8fHx8MTc3MTI1NDUwMnww&ixlib=rb-4.1.0&q=80&w=1080')`,
          }}
        />
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_#0B0F14_0%,_#1a1f2e_50%,_#0B0F14_100%)] opacity-40 animate-[gradient_8s_ease_infinite]" 
               style={{ backgroundSize: '200% 200%' }} />
        </div>
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent z-10" />
        
        {/* Animated MENA Flags */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {MENA_FLAGS.map((country, index) => (
            <motion.div
              key={country.code}
              className="absolute text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.6, 0],
                y: [50, -50],
                rotate: [0, 20, -20, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            >
              {country.flag}
            </motion.div>
          ))}
        </div>

        <div className="relative z-30 flex flex-col justify-between p-12 w-full h-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <Shield className="text-[#0B0F14] w-7 h-7" />
            </div>
            <span className="text-2xl font-bold text-white tracking-widest uppercase">Press2Pay</span>
          </div>

          <div className="max-w-xl">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              {language === 'ar' ? 'استعادة الوصول إلى حسابك' : 'Recover Your Account Access'}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {language === 'ar' 
                ? 'نحن هنا لمساعدتك في العودة إلى لوحة تحكم مدفوعاتك بأمان وسرعة.'
                : 'We are here to help you get back into your payments dashboard securely and quickly.'}
            </p>
          </div>

          <div className="flex items-center gap-6 text-gray-400 text-sm bg-black/40 backdrop-blur-md p-4 rounded-full w-fit uppercase tracking-[0.2em]">
            <span>{t('copyrightNotice')}</span>
          </div>
        </div>
      </div>

      {/* Right Side: Reset Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative bg-[#0B0F14]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Back to Login */}
          <Link 
            to={`/${language}/login`} 
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#E5C158] transition-colors mb-8 text-sm font-bold uppercase tracking-wider group"
          >
            <ArrowLeft className={`w-4 h-4 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
            {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">
              {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </h2>
            <p className="text-gray-500 text-sm">
              {language === 'ar' 
                ? 'أدخل بيانات حسابك وسنرسل لك رابطاً لاستعادة الوصول.'
                : 'Enter your account details and we\'ll send you a link to recover access.'}
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">
                {t('emailUsernamePhone')}
              </label>
              <div className="relative group">
                <Mail className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors w-5 h-5`} />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('emailUsernamePlaceholder')}
                  className={`w-full bg-[#14181D] border border-white/5 rounded-lg py-3.5 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white text-sm focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all placeholder:text-gray-700`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] disabled:opacity-50 text-[#0B0F14] font-bold py-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(212,175,55,0.2)] transition-all active:scale-[0.98] mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-sm">
                    {language === 'ar' ? 'إرسال رابط الاستعادة' : 'Send Reset Link'}
                  </span>
                  <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-8">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
            <div className="flex items-center gap-2 bg-[#11151A] px-3 py-1 rounded-full border border-white/5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                {t('systemOnline')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;