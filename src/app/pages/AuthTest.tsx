import React, { useState } from 'react';
import { Shield, Key, Lock, Unlock, CheckCircle2, XCircle, Loader2, User } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase, publicAnonKey, projectId } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';

export const AuthTest = () => {
  const { user, isAuthenticated, language } = useStore();
  const isRTL = language === 'ar';
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testType, setTestType] = useState<'anon' | 'session'>('anon');

  const testAnonAccess = async () => {
    try {
      setLoading(true);
      setTestType('anon');
      setResult(null);

      // Testing access with public anon key
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-46c3f42b/users`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (response.ok) {
        toast.success('Anon access test successful');
      } else {
        toast.error(`Anon access test failed: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Anon test error:', error);
      setResult({ error: error.message });
      toast.error('Anon access test failed');
    } finally {
      setLoading(false);
    }
  };

  const testSessionAccess = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first to test session access');
      return;
    }

    try {
      setLoading(true);
      setTestType('session');
      setResult(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session found');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-46c3f42b/users`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (response.ok) {
        toast.success('Session access test successful');
      } else {
        toast.error(`Session access test failed: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Session test error:', error);
      setResult({ error: error.message });
      toast.error('Session access test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-white flex items-center justify-center gap-3">
          <Shield className="text-[#D4AF37]" size={32} />
          {isRTL ? 'اختبار المصادقة' : 'Authentication Test'}
        </h2>
        <p className="text-gray-400">
          {isRTL ? 'اختبار الوصول إلى النهاية الخلفية بمستويات مختلفة' : 'Test backend endpoint access with different levels'}
        </p>
      </div>

      {/* Current User Status */}
      <div className="bg-[#14181D] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isAuthenticated ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {isAuthenticated ? <Unlock size={24} /> : <Lock size={24} />}
            </div>
            <div>
              <h3 className="text-white font-bold">{isRTL ? 'حالة الجلسة' : 'Session Status'}</h3>
              <p className="text-sm text-gray-400">
                {isAuthenticated ? (isRTL ? 'متصل حالياً' : 'Authenticated') : (isRTL ? 'غير متصل' : 'Guest Mode')}
              </p>
            </div>
          </div>
          {isAuthenticated && user && (
            <div className="text-right">
              <p className="text-white font-bold">{user.name}</p>
              <p className="text-xs text-[#D4AF37] font-mono">{user.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Test Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={testAnonAccess}
          disabled={loading}
          className="p-6 bg-[#1A1F26] border border-white/5 rounded-2xl text-left hover:border-[#D4AF37]/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Key size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded">Level 1</span>
          </div>
          <h4 className="text-white font-bold mb-1">{isRTL ? 'اختبار مفتاح Anon' : 'Test Anon Key'}</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            {isRTL ? 'الوصول باستخدام المفتاح العام فقط. يجب أن يسمح بالعمليات المحدودة.' : 'Access using only the public anon key. Should allow limited operations.'}
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={testSessionAccess}
          disabled={loading}
          className="p-6 bg-[#1A1F26] border border-white/5 rounded-2xl text-left hover:border-green-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-colors">
              <User size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-1 rounded">Level 2</span>
          </div>
          <h4 className="text-white font-bold mb-1">{isRTL ? 'اختبار توكن الجلسة' : 'Test Session Token'}</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            {isRTL ? 'الوصول باستخدام توكن المستخدم المسجل. يسمح بجميع صلاحيات الدور.' : 'Access using authenticated user JWT. Allows all role permissions.'}
          </p>
        </motion.button>
      </div>

      {/* Results Area */}
      {(loading || result) && (
        <div className="bg-[#0B0F14] border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : result.ok ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {loading ? (isRTL ? 'جاري الاختبار...' : 'Testing...') : (isRTL ? 'النتيجة' : 'Result')}
              </span>
            </div>
            {result && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${result.ok ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                HTTP {result.status}
              </span>
            )}
          </div>
          <div className="p-6">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="text-[#D4AF37] animate-spin" size={40} />
                <p className="text-sm text-gray-500 animate-pulse">{isRTL ? 'يتم الاتصال بالخادم...' : 'Connecting to Edge Function...'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                  {result.ok ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                  <div>
                    <p className="text-white font-bold text-sm">
                      {result.ok ? (isRTL ? 'تم التحقق من الوصول' : 'Access Verified') : (isRTL ? 'تم رفض الوصول' : 'Access Denied')}
                    </p>
                    <p className="text-xs text-gray-500">{testType === 'anon' ? 'Tested via Public Key' : 'Tested via User Session'}</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 size={14} className="text-gray-600" />
                  </div>
                  <pre className="bg-black/50 p-4 rounded-xl text-[10px] font-mono text-blue-400 overflow-x-auto border border-white/5 max-h-[300px]">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
