import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  AlertTriangle, 
  History, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Cpu,
  Server,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey } from '../../lib/supabase';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  metadata: any;
}

interface MerchantApplication {
  id: string;
  businessName: string;
  email: string;
  status: 'pending' | 'active' | 'rejected' | 'under_review';
  appliedAt: string;
  riskScore: number;
}

export const Operations = () => {
  const { t } = useTranslation();
  const { language, isAuthenticated } = useStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [applications, setApplications] = useState<MerchantApplication[]>([
    { id: '1', businessName: 'Al-Khaleej Tech', email: 'contact@alkhaleej.com', status: 'pending', appliedAt: '2024-02-14T10:00:00Z', riskScore: 12 },
    { id: '2', businessName: 'Riyadh Retailers', email: 'admin@riyadh.sa', status: 'under_review', appliedAt: '2024-02-13T14:30:00Z', riskScore: 45 },
    { id: '3', businessName: 'Dubai Fashion Hub', email: 'owner@dfh.ae', status: 'pending', appliedAt: '2024-02-15T09:00:00Z', riskScore: 8 },
  ]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/audit-logs'
      });

      if (error) {
        console.error('Audit logs error:', error);
        setLogs([]);
        setLoading(false);
        return;
      }
      
      setLogs(data?.logs || []);
    } catch (err: any) {
      console.error('Failed to fetch logs:', err);
      setLogs([]);
      if (isAuthenticated && !err.message?.includes('401') && !err.message?.includes('Forbidden')) {
        toast.error('Failed to load audit logs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Subscribe to real-time merchant updates
    const channel = supabase.channel('kv:merchant', { 
      config: { private: true } 
    });
    
    supabase.realtime.setAuth().then(() => {
      channel
        .on('broadcast', { event: 'INSERT' }, ({ payload }) => {
          console.log('[Realtime] Merchant inserted:', payload.new);
          toast.success(language === 'ar' ? 'تاجر جديد مضاف' : 'New merchant added');
          // Refresh data
          fetchLogs();
        })
        .on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
          console.log('[Realtime] Merchant updated:', payload.new);
          toast.info(language === 'ar' ? 'تم تحديث التاجر' : 'Merchant updated');
          // Refresh data
          fetchLogs();
        })
        .on('broadcast', { event: 'DELETE' }, ({ payload }) => {
          console.log('[Realtime] Merchant deleted:', payload.old);
          toast.warning(language === 'ar' ? 'تم حذف التاجر' : 'Merchant deleted');
          // Refresh data
          fetchLogs();
        })
        .subscribe((status) => {
          console.log('[Realtime] kv:merchant channel status:', status);
        });
    });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, language]);

  const handleStatusChange = async (id: string, newStatus: 'active' | 'rejected') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/operations/merchants',
        body: { id, status: newStatus }
      });

      if (error) throw error;

      toast.success(newStatus === 'active' ? (language === 'ar' ? 'تمت الموافقة على التاجر' : 'Merchant approved') : (language === 'ar' ? 'تم رفض التاجر' : 'Merchant rejected'));
      setApplications(apps => apps.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err: any) {
      console.error('Status change error:', err);
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {language === 'ar' ? 'العمليات والتحكم' : 'Operations & Control'}
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            {language === 'ar' ? 'مراقبة أداء النظام، إدارة طلبات التجار وسجلات التدقيق' : 'Monitor system performance, manage merchant applications, and audit logs'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-sm font-bold">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            {t('systemLive')}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold">
            <Activity size={16} />
            99.9% {t('uptime')}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: language === 'ar' ? 'الموافقات المعلقة' : 'Pending Approvals', value: applications.filter(a => a.status === 'pending').length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: t('healthy'), value: language === 'ar' ? 'سليم' : 'Healthy', icon: Server, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: language === 'ar' ? 'تأخير الـ API' : 'API Latency', value: '42ms', icon: Cpu, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: language === 'ar' ? 'تنبيهات (24 ساعة)' : 'Alerts (24h)', value: '0', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <TrendingUp className="text-muted-foreground opacity-30" size={20} />
            </div>
            <div className="text-sm text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</div>
            <div className="text-2xl font-bold mt-1 text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Merchant Onboarding Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                {t('onboarding')}
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="text" 
                    placeholder={t('search')} 
                    className="ps-9 pe-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-48 transition-all"
                  />
                </div>
                <button className="p-2 border border-border rounded-xl hover:bg-muted transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead className="bg-muted/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-start">{language === 'ar' ? 'التاجر / جهة الاتصال' : 'Merchant / Contact'}</th>
                    <th className="px-6 py-4 text-center">{language === 'ar' ? 'تاريخ التقديم' : 'Applied'}</th>
                    <th className="px-6 py-4 text-center">{t('riskScore')}</th>
                    <th className="px-6 py-4 text-center">{t('status')}</th>
                    <th className="px-6 py-4 text-end">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.filter(a => a.status !== 'active' && a.status !== 'rejected').map((app) => (
                    <tr key={app.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors">{app.businessName}</span>
                          <span className="text-xs text-muted-foreground">{app.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                        {new Date(app.appliedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                          app.riskScore > 30 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                        }`}>
                          {app.riskScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                          app.status === 'under_review' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                        }`}>
                          {app.status === 'under_review' ? t('underReview') : t('pending')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleStatusChange(app.id, 'active')}
                            className="p-2 bg-success text-success-foreground rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm"
                            title={t('approved')}
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="p-2 bg-destructive text-destructive-foreground rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm"
                            title={t('rejected')}
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border bg-muted/20 text-center">
              <button className="text-sm font-bold text-primary flex items-center justify-center gap-2 mx-auto hover:underline transition-all">
                {language === 'ar' ? 'عرض جميع الطلبات' : 'View All Applications'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs Sidebar */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1 max-h-[600px]">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <History className="text-primary" size={20} />
                {language === 'ar' ? 'سجل التدقيق المباشر' : 'Live Audit Feed'}
              </h3>
              <button className="text-xs text-primary font-bold hover:underline">{t('viewAll')}</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {logs.length === 0 ? (
                <>
                  {[
                    { id: 'm1', action: 'KYC_VERIFIED', time: '2 mins ago', msg: language === 'ar' ? 'تم التحقق من هوية تاجر Dubai Fashion Hub.' : 'Merchant Dubai Fashion Hub passed auto-KYC check.' },
                    { id: 'm2', action: 'WALLET_FUNDED', time: '15 mins ago', msg: language === 'ar' ? 'تم شحن محفظة النظام بـ 50,000 درهم.' : 'System wallet [AE-01] topped up with 50,000 AED.' },
                    { id: 'm3', action: 'API_KEY_REVOKED', time: '1 hour ago', msg: language === 'ar' ? 'قام المشرف بإلغاء مفتاح الإ��تاج للتطبيق.' : 'Admin [ID: 829] revoked production key for App-72.' },
                    { id: 'm4', action: 'RISK_ALERT', time: '2 hours ago', msg: language === 'ar' ? 'تم اكتشاف تردد عالي في المعاملات لتاجر في الرياض.' : 'High transaction frequency detected for Merchant Riyadh.' }
                  ].map(mock => (
                    <div key={mock.id} className="p-4 bg-muted/30 border border-border rounded-2xl group hover:border-primary/30 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          mock.action === 'RISK_ALERT' ? 'text-destructive' : 'text-primary'
                        }`}>{mock.action}</span>
                        <span className="text-[10px] text-muted-foreground">{mock.time}</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{mock.msg}</p>
                    </div>
                  ))}
                </>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-4 bg-muted/30 border border-border rounded-2xl relative group hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{log.action}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                      {language === 'ar' ? `قام المستخدم ${log.userId.substring(0, 8)} بتنفيذ إجراء على إعدادات النظام.` : `User ${log.userId.substring(0, 8)} performed action on system settings.`}
                    </p>
                    <button className="absolute inset-inline-end-2 bottom-2 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
            <h4 className="font-bold mb-2 flex items-center gap-2 relative z-10">
              <ShieldCheck size={20} />
              {language === 'ar' ? 'بروتوكول الأمان' : 'Security Protocol'}
            </h4>
            <p className="text-xs opacity-90 leading-relaxed mb-4 relative z-10">
              {language === 'ar' 
                ? 'المصادقة الثنائية مطلوبة لجميع الإجراءات الإدارية. يراقب النظام حالياً أي سلوك شاذ في منطقة الشرق الأوسط.'
                : 'Multi-factor authentication is required for all administrative actions. System is currently monitoring for anomalous behavior in the MENA region.'
              }
            </p>
            <div className="p-4 bg-white/10 rounded-xl flex items-center justify-between relative z-10 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest">{language === 'ar' ? 'حالة 2FA' : '2FA Status'}</span>
              <span className="text-[10px] bg-white text-primary px-3 py-1 rounded-lg font-bold shadow-sm">{t('enforced')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};