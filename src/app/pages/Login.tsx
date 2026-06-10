import image_52941f2639474635ccafac760a833b221aa1fa5b from 'figma:asset/52941f2639474635ccafac760a833b221aa1fa5b.png'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useStore } from '../../lib/store';
import { Shield, Lock, Mail, ArrowRight, Loader2, Globe, CheckCircle2, Sparkles, Eye, EyeOff, ArrowRightLeft, ShieldCheck, Layers, Cpu, Globe2, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

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

// Content Rotation Component for the Luxury Intro
const ContentRotation = ({ language, t }: { language: string, t: any }) => {
  const [index, setIndex] = useState(0);
  
  const contents = [
    {
      id: 'flow',
      title: language === 'ar' ? 'دورة حياة المعاملة المالية' : 'Transaction Lifecycle Flow',
      items: language === 'ar' ? [
        'يبدأ العميل عملية الدفع عبر واجهة المتجر بسلاسة',
        'يرسل النظام طلباً مشفراً وآمناً إلى بوابة Press2pay',
        'توجيه العملية ذكياً إلى أفضل قناة دفع محلية أو دولية',
        'التحقق من هوية العميل عبر معايير (3DS) والمحافظ',
        'إتمام التسوية المالية وإرسال إشعارات فورية للنظام'
      ] : [
        'Customer initiates payment on your platform seamlessly',
        'Encrypted and secure request sent to Press2pay Gateway',
        'Smart routing to the optimal local or international channel',
        'Customer authentication via 3DS or Mobile Wallet protocols',
        'Real-time financial settlement and instant API webhooks'
      ],
      icon: ArrowRightLeft
    },
    {
      id: 'security',
      title: language === 'ar' ? 'منظومة الأمان والامتثال' : 'Security & Compliance',
      description: language === 'ar' ? 
        'تشفير بيانات من البداية للنهاية وفق أعلى المعايير. معلومات البطاقات الحساسة لا تلمس خوادمك أبداً، حيث نضمن التزامك بمعايير PCI-DSS عالمياً.' :
        'Advanced end-to-end encryption. Sensitive card data never touches your infrastructure, ensuring global PCI-DSS compliance by design.',
      items: language === 'ar' ? [
        'تشفير وترميز بيانات البطاقات (PCI-DSS Level 1)',
        'نظام متطور لمكافحة الاحتيال والعمليات المشبوهة',
        'التوافق التام مع متطلبات البنك المركزي المصري (CBE)'
      ] : [
        'Full Card Tokenization (PCI-DSS Level 1)',
        'AI-driven fraud prevention and risk monitoring',
        'Strict Central Bank of Egypt (CBE) regulatory compliance'
      ],
      icon: ShieldCheck
    },
    {
      id: 'integration',
      title: language === 'ar' ? 'خيارات التكامل التقني' : 'Technical Integration',
      items: [
        { label: language === 'ar' ? 'الـ API الموحد' : 'Unified Gateway API', desc: language === 'ar' ? 'تحكم كامل ومباشر عبر الربط البرمجي' : 'Full programmatic control via REST API', icon: Cpu },
        { label: language === 'ar' ? 'روابط الدفع' : 'Smart Payment Links', desc: language === 'ar' ? 'حلول دفع سريعة بدون برمجة' : 'No-code payment solutions for social commerce', icon: Zap },
        { label: language === 'ar' ? 'نموذج الدفع الجاهز' : 'Hosted Checkout', desc: language === 'ar' ? 'صفحة دفع آمنة وسريعة الإعداد' : 'Ready-to-use secure checkout experience', icon: Layers },
        { label: language === 'ar' ? 'الربط المباشر' : 'Server-to-Server', desc: language === 'ar' ? 'أقصى درجات الأمان والخصوصية' : 'Maximum backend-to-backend security', icon: Globe2 }
      ],
      icon: Layers,
      isGrid: true
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % contents.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = contents[index];
  const Icon = current.icon;

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 text-[#D4AF37] mb-2">
        <div className="p-2 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold tracking-wide uppercase">{current.title}</h3>
      </div>

      {current.description && (
        <p className="text-gray-300 text-sm leading-relaxed mb-4">{current.description}</p>
      )}

      {current.isGrid ? (
        <div className="grid grid-cols-2 gap-3">
          {(current.items as any[]).map((item, i) => (
            <div key={i} className="bg-black/40 p-3 rounded-lg border border-white/5 backdrop-blur-sm group hover:border-[#D4AF37]/30 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-xs font-bold text-white uppercase tracking-tighter">{item.label}</span>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-1">{item.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {(current.items as string[]).map((item, i) => (
            <div key={i} className="flex items-start gap-3 group">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0 group-hover:scale-125 transition-transform" />
              <p className="text-gray-300 font-medium leading-relaxed group-hover:text-white transition-colors text-[15px]">{item}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progress indicators */}
      <div className="flex gap-2 pt-4 bg-[#000000]">
        {contents.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/10'}`} 
          />
        ))}
      </div>
    </motion.div>
  );
};

export const Login = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [identifier, setIdentifier] = useState(''); // Changed from email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth, language, setLanguage, isAuthenticated } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const savedIdentifier = localStorage.getItem('press2pay_remembered_identifier');
    const savedPassword = localStorage.getItem('press2pay_remembered_password');
    if (savedIdentifier && savedPassword) {
      setIdentifier(savedIdentifier);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/${language}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, navigate, language]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try correct endpoint
      const endpoint = `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/auth/login`;
      
      console.log(`[Auth] Attempting login with project ID:`, projectId);
      console.log(`[Auth] Using anon key:`, publicAnonKey?.substring(0, 20) + '...');
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'apikey': publicAnonKey,
        'X-Client-Info': 'press2pay-web'
      };
      
      console.log('[Auth] Request headers:', Object.keys(headers));
      console.log(`[Auth] Trying endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim()
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('[Auth] Login failure details:', error);
        
        // Use a more descriptive message for the user
        let message = error.message || error.error || 'Login failed';
        if (message === 'Invalid login credentials') {
          message = language === 'ar' 
            ? 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.' 
            : 'Invalid login credentials. Please check your email and password.';
        }
        
        throw new Error(message);
      }

      const authResult = await response.json();

      const { user, session } = authResult;
      
      if (!user || !session) {
        throw new Error('Authentication failed: Missing user or session data');
      }

      // CRITICAL: Synchronize the frontend Supabase client with the session returned from the server
      // This ensures that AuthProvider in App.tsx doesn't clear the auth state
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });

      if (sessionError) {
        console.error('[Auth] Error setting frontend session:', sessionError.message);
        // We still proceed as we have the user data, but this might cause redirection issues
      }
      
      if (rememberMe) {
        localStorage.setItem('press2pay_remembered_identifier', identifier);
        localStorage.setItem('press2pay_remembered_password', password);
      } else {
        localStorage.removeItem('press2pay_remembered_identifier');
        localStorage.removeItem('press2pay_remembered_password');
      }

      setAuth({
        id: user.id,
        email: user.email || '',
        name: user.name || user.user_metadata?.name || user.user_metadata?.username || 'Press2Pay Admin',
        role: user.role || user.user_metadata?.role || 'owner'
      });
      
      // ✅ Create/Update user profile in database
      try {
        const userId = user.id;
        const { error: profileError } = await supabase.from('user_profiles').upsert({
          id: userId,
          username: user.user_metadata?.username || identifier.split('@')[0],
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || user.name,
          avatar_url: user.user_metadata?.avatar_url,
          phone: user.user_metadata?.phone,
          company: user.user_metadata?.company,
          role: user.role || user.user_metadata?.role || 'user',
        }, {
          onConflict: 'id'
        });

        if (profileError) {
          console.error('[Auth] Profile upsert error:', profileError);
          // Don't throw, just log - profile creation is not critical for login
        } else {
          console.log('[Auth] User profile created/updated successfully');
        }
      } catch (profileErr) {
        console.error('[Auth] Profile creation failed:', profileErr);
      }
      
      toast.success(language === 'ar' ? `مرحباً ${user.name || 'Admin'}!` : `Welcome ${user.name || 'Admin'}!`);
      
      // Force navigation if the useEffect doesn't catch it fast enough
      setTimeout(() => navigate(`/${language}/dashboard`, { replace: true }), 100);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(language === 'ar' ? 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.' : error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    i18nInstance.changeLanguage(newLang);
    navigate(`/${newLang}/login`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col lg:flex-row font-sans selection:bg-[#D4AF37]/30 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Left Side: Branded Visual Content */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden bg-[#0B0F14]">
        {/* Static Dubai Night Background Image (Fallback & Initial) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1657106251952-2d584ebdf886?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdWJhaSUyMHNreWxpbmUlMjBuaWdodCUyMGJ1cmolMjBraGFsaWZhfGVufDF8fHx8MTc3MTI1NDUwMnww&ixlib=rb-4.1.0&q=80&w=1080')`,
          }}
        />
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_#0B0F14_0%,_#1a1f2e_50%,_#0B0F14_100%)] opacity-40 animate-[gradient_8s_ease_infinite]" 
               style={{ backgroundSize: '200% 200%' }} />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </div>
        
        {/* Video Background (Optional Enhancement) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-[1] opacity-0 transition-opacity duration-1000"
          onCanPlay={(e) => {
            e.currentTarget.style.opacity = '0.7'; // Blend with static image
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none'; // Hide if fails to load
          }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-lights-of-dubai-skyscrapers-at-night-4063-large.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay for Better Text Contrast */}
        <div className="absolute inset-0 bg-black/50 z-10" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent z-10" />
        
        {/* Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_#D4AF37/5_0%,_transparent_50%)] z-10" />

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-20">
          <div className={`absolute top-0 ${language === 'ar' ? 'right-[20%]' : 'left-[20%]'} w-[1px] h-full bg-[#D4AF37]`} />
          <div className={`absolute top-0 ${language === 'ar' ? 'right-[40%]' : 'left-[40%]'} w-[1px] h-full bg-[#D4AF37]`} />
          <div className={`absolute top-0 ${language === 'ar' ? 'right-[60%]' : 'left-[60%]'} w-[1px] h-full bg-[#D4AF37]`} />
        </div>

        {/* Animated MENA Flags - Floating Effect */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {MENA_FLAGS.map((country, index) => {
            const randomDelay = Math.random() * 5;
            const randomDuration = 15 + Math.random() * 10;
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            const randomSize = 2.5 + Math.random() * 1.5;
            
            return (
              <motion.div
                key={country.code}
                className="absolute"
                style={{
                  left: `${randomX}%`,
                  top: `${randomY}%`,
                  fontSize: `${randomSize}rem`,
                }}
                initial={{ opacity: 0, y: 100 }}
                animate={{
                  opacity: [0, 0.7, 0.9, 0.7, 0],
                  y: [100, -20, -100],
                  x: [0, 30, 0, -30, 0],
                  rotate: [0, 10, -10, 0],
                  scale: [0.8, 1.2, 1, 1.1, 0.9],
                }}
                transition={{
                  duration: randomDuration,
                  repeat: Infinity,
                  delay: randomDelay,
                  ease: "easeInOut",
                }}
              >
                <div 
                  className="relative drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                  style={{
                    filter: 'drop-shadow(0 4px 20px rgba(212, 175, 55, 0.2))'
                  }}
                >
                  {country.flag}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Luxury Gold Sparkles */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {[...Array(20)].map((_, i) => {
            const randomDelay = Math.random() * 3;
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            
            return (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute"
                style={{
                  left: `${randomX}%`,
                  top: `${randomY}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: randomDelay,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="text-[#D4AF37] w-3 h-3" />
              </motion.div>
            );
          })}
        </div>

        {/* Content Overlay */}
        <div className="relative z-30 flex flex-col justify-between w-full h-full bg-[#0e0e0e9c] px-[60px] py-[48px]">
          {/* Header/Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] overflow-hidden">
              <ImageWithFallback 
                src={image_52941f2639474635ccafac760a833b221aa1fa5b} 
                className="w-8 h-8 object-contain" 
                alt="Press2Pay"
              />
            </div>
            <span className="font-bold text-white tracking-widest uppercase text-[32px]">Press2Pay</span>
          </div>

          {/* Main Message */}
          <div className="max-w-xl">
            <motion.h2 
              initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
            >
              {language === 'ar' ? (
                <>
                  حل الدفع الإلكتروني P2P <br />
                  <span className="text-[#D4AF37]">لمنطقة الشرق الأوسط</span>
                </>
              ) : (
                <>
                  Payment Solution for <br />
                  <span className="text-[#D4AF37]">MENA Region</span>
                </>
              )}
            </motion.h2>

            <div className="min-h-[160px] mb-10">
              <AnimatePresence mode="wait">
                <ContentRotation key={language} language={language} t={t} />
              </AnimatePresence>
            </div>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md"
              >
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <CheckCircle2 size={18} />
                  <span className="font-bold">99.9% {t('uptime')}</span>
                </div>
                <p className="text-sm text-gray-300">{t('enterpriseReliability')}</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md"
              >
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <CheckCircle2 size={18} />
                  <span className="font-bold">PCI-DSS L1</span>
                </div>
                <p className="text-sm text-gray-300">{t('pciCompliance')}</p>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-6 text-gray-400 text-sm bg-black/40 backdrop-blur-md p-4 rounded-full w-fit uppercase tracking-[0.2em]">
            <span>{t('copyrightNotice')}</span>
            <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
            <span>{t('regulatedBy')}</span>
          </div>
          
          {/* MENA Flags Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex items-center gap-3 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-[#D4AF37]/20 overflow-hidden relative"
          >
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider shrink-0">
              <Globe className="w-4 h-4" />
              <span>{t('servingMENA')}</span>
            </div>
            <div className="flex items-center gap-2 overflow-hidden">
              <motion.div
                className="flex items-center gap-2"
                animate={{ x: [-20, -1000] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {[...MENA_FLAGS, ...MENA_FLAGS].map((country, index) => (
                  <div
                    key={`${country.code}-${index}`}
                    className="text-2xl flex-shrink-0 drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]"
                    title={country.name}
                  >
                    {country.flag}
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative m-[0px] bg-[#19191787]">
        {/* Subtle Background Glow for Form */}
        <div className="lg:hidden absolute top-[10%] left-1/2 -translate-x-1/2 -translate-y-[10%] w-[80%] h-[80%] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-[#D4AF37] rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(212,175,55,0.3)] border border-[#D4AF37]/20">
              <Shield className="text-[#0B0F14] w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-widest">PRESS2PAY</h1>
            <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mt-1">{t('paymentGateway')}</p>
          </div>

          {/* Form Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">{t('welcome')}</h2>
            <p className="text-gray-500 text-sm">{language === 'ar' ? 'يرجى إدخال بيانات الاعتماد الخاصة بك' : 'Please enter your credentials'}</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Identifier Field (Email/Username/Phone) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider px-1 text-[#f7f9fdba]">
                {t('emailUsernamePhone')}
              </label>
              <div className="relative group">
                <Mail className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors w-5 h-5`} />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && identifier.trim() && password.trim()) {
                      handleLogin(e as any);
                    } else if (e.key === 'Enter' && identifier.trim()) {
                      // Focus password field if identifier is filled but password is not
                      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                      if (passwordInput) passwordInput.focus();
                    }
                  }}
                  placeholder={t('emailUsernamePlaceholder')}
                  className={`w-full border border-white/5 rounded-lg py-3.5 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white text-sm focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all placeholder:text-gray-700 bg-[#b9c2c2ed] pl-[40px] pr-[48px] py-[14px]`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between px-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#eff1f6c2]">{t('password')}</label>
                <Link 
                  to="/forgot-password"
                  className="text-[10px] text-[#D4AF37] hover:text-[#C49F27] uppercase tracking-wider font-bold transition-colors"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative group">
                <Lock className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors w-5 h-5`} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && identifier.trim() && password.trim()) {
                      handleLogin(e as any);
                    }
                  }}
                  placeholder="••••••••••••"
                  className={`w-full border border-white/5 rounded-lg py-3.5 ${language === 'ar' ? 'pr-12 pl-12' : 'pl-12 pr-12'} text-white text-sm focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all placeholder:text-gray-700 bg-[#afb0b3]`}
                />
                <button
                  type="button"
                  title={showPassword ? t('hidePassword') : t('showPassword')}
                  className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#D4AF37] transition-colors`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Note under password */}
              <div className="px-1 pt-1">
                <p className="text-[10px] text-gray-600 mt-2">
                  {language === 'ar' ? (
                    <>
                      💡 <span className="font-semibold">تلميح:</span> استخدم بيانات الاعتماد المسجلة للوصول إلى النظام.
                    </>
                  ) : (
                    <>
                      💡 <span className="font-semibold">Note:</span> Use your registered credentials to access the portal.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${
                  rememberMe ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-[#14181D] border-white/10 group-hover:border-[#D4AF37]/50'
                }`}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 text-[#0B0F14] stroke-[3]" />}
                </div>
                <span className="text-sm group-hover:text-gray-400 transition-colors text-[#f5f8ff]">
                  {t('rememberMe')}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !identifier.trim() || !password.trim()}
              className="relative overflow-hidden w-full gold-gradient hover:gold-glow border border-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-[#0B0F14] font-black py-5 rounded-xl flex items-center justify-center gap-3 shadow-[0_20px_50px_-10px_rgba(212,175,55,0.5)] transition-all duration-500 active:scale-[0.97] mt-6 group"
            >
              {/* Dynamic Shining Sweep Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.6)_50%,transparent_65%)] bg-[length:200%_100%] animate-[shimmer_2s_infinite] mix-blend-overlay" />
              
              {/* Glossy top edge light */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10 uppercase tracking-[0.25em] text-sm drop-shadow-md font-black">{t('signIn')}</span>
                  <ArrowRight className={`relative z-10 w-6 h-6 transition-transform group-hover:translate-x-1.5 ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1.5' : ''}`} />
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
              <span className="text-[#f0f4fc] text-[#f0f4fc] text-[#f0f4fc]">{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
            <div className="flex items-center gap-2 bg-[#11151A] px-3 py-1 rounded-full border border-white/5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">{t('systemOnline')}</span>
            </div>
          </div>
          
          {/* Plugin Attribution */}
          <div className="mt-8 flex justify-center">
            <p className="text-[9px] text-gray-700 uppercase tracking-[0.2em] font-medium opacity-50 hover:opacity-100 transition-opacity">
              Built with <span className="text-[#D4AF37]">Anima</span> - Figma to Code React & Tailwind
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;