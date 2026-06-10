import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Activity, 
  Lock, 
  Eye,
  CheckCircle,
  BarChart2,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../../lib/store';

const alerts = [
  { id: 1, type: 'velocity', merchant: 'MegaStore Cairo', risk: 'high', description: 'User 0x123 attempted 15 transactions in 2 mins', time: '12m ago', status: 'pending' },
  { id: 2, type: 'duplicate', merchant: 'Nile Electronics', risk: 'medium', description: 'Same amount (EGP 850) and method detected 3 times', time: '45m ago', status: 'investigating' },
  { id: 3, type: 'amlFlag', merchant: 'Global Trade', risk: 'critical', description: 'Cumulative volume exceeded threshold (EGP 500k/day)', time: '2h ago', status: 'flagged' },
  { id: 4, type: 'ipMismatch', merchant: 'low', risk: 'low', description: 'Transaction IP location (Russia) differs from profile', time: '5h ago', status: 'resolved' },
];

export const RiskAML = () => {
  const { t } = useTranslation();
  const { language } = useStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Risk Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-destructive" size={32} />
            {t('riskOverview')}
          </h2>
          <p className="text-muted-foreground text-lg">{t('monitorSuspicious')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
            <Activity size={18} />
            <span className="text-sm font-bold">12 {t('activeAlerts')}</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <BarChart2 size={18} /> {t('analytics')}
          </button>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: t('riskScore'), value: '18.4', sub: t('low'), color: 'text-success' },
          { label: t('blockedToday'), value: '42', sub: language === 'ar' ? 'عمليات احتيال تم منعها' : 'Prevented Fraud', color: 'text-destructive' },
          { label: t('underReview'), value: '8', sub: t('pending'), color: 'text-warning' },
          { label: t('falsePositives'), value: '2.1%', sub: language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days', color: 'text-muted-foreground' },
        ].map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm"
          >
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{metric.label}</div>
            <div className={`text-3xl font-bold mt-2 ${metric.color}`}>{metric.value}</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase font-bold">{metric.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Alerts Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <h3 className="font-bold text-lg">{t('activeAlerts')}</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder={t('search')} 
                className="ps-9 pe-4 py-2 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-64 transition-all" 
              />
            </div>
            <button className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>
        
        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-border">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.risk === 'critical' ? 'bg-destructive animate-pulse' :
                    alert.risk === 'high' ? 'bg-destructive' :
                    alert.risk === 'medium' ? 'bg-warning' : 'bg-success'
                  }`} />
                  <span className="text-sm font-bold uppercase">{t(alert.type)}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  alert.risk === 'critical' ? 'bg-destructive/20 text-destructive' :
                  alert.risk === 'high' ? 'bg-destructive/10 text-destructive' :
                  alert.risk === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                }`}>
                  {t(alert.risk)}
                </span>
              </div>
              <div className="text-sm font-bold">{alert.merchant}</div>
              <p className="text-xs text-muted-foreground">{alert.description}</p>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                <div className="flex gap-2">
                  <button className="p-2 bg-muted rounded-lg text-primary"><Eye size={14} /></button>
                  <button className="p-2 bg-muted rounded-lg text-success"><CheckCircle size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-start">{t('alertType')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-start">{t('merchant')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-start">{t('riskLevel')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-start">{t('description')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-start">{t('time')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-end">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alerts.map((alert, idx) => (
                <motion.tr 
                  key={alert.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.risk === 'critical' ? 'bg-destructive animate-pulse' :
                        alert.risk === 'high' ? 'bg-destructive' :
                        alert.risk === 'medium' ? 'bg-warning' : 'bg-success'
                      }`} />
                      <span className="text-sm font-bold uppercase">{t(alert.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{alert.merchant}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alert.risk === 'critical' ? 'bg-destructive/20 text-destructive' :
                      alert.risk === 'high' ? 'bg-destructive/10 text-destructive' :
                      alert.risk === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      {t(alert.risk)}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                      {language === 'ar' && alert.type === 'velocity' 
                        ? 'قام المستخدم 0x123 بمحاولة 15 معاملة في دقيقتين' 
                        : alert.description}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">{alert.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-end">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 hover:bg-muted rounded-lg text-primary" title={language === 'ar' ? 'عرض التفاصيل' : 'View Details'}><Eye size={16} /></button>
                      <button className="p-1.5 hover:bg-muted rounded-lg text-success" title={language === 'ar' ? 'حل التنبيه' : 'Resolve'}><CheckCircle size={16} /></button>
                      <button className="p-1.5 hover:bg-muted rounded-lg text-destructive" title={language === 'ar' ? 'حظر' : 'Block'}><Lock size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Rule Configuration Section */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">{t('riskRuleEngine')}</h3>
          <button className="text-sm text-primary font-bold flex items-center gap-1 hover:underline transition-all">
            <Settings size={14} /> {t('configureRules')}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: t('velocity'), status: true, desc: language === 'ar' ? 'حظر المستخدمين بأكثر من 5 معاملات في 5 دقائق' : 'Block users with >5 tx in 5 mins' },
            { name: language === 'ar' ? 'التسوير الجغرافي' : 'Geo-Fencing', status: true, desc: language === 'ar' ? 'تقييد المعاملات من خارج منطقة MENA' : 'Restrict tx from non-MENA IPs' },
            { name: language === 'ar' ? 'حظر BIN' : 'Bin Blocking', status: false, desc: language === 'ar' ? 'حظر نطاقات البطاقات عالية المخاطر' : 'Block high-risk card ranges' },
            { name: language === 'ar' ? 'عتبة المبلغ' : 'Amount Threshold', status: true, desc: language === 'ar' ? 'مراجعة يدوية للمبالغ التي تزيد عن 50 ألف جنيه' : 'Manual review for > EGP 50k' },
            { name: t('duplicate'), status: true, desc: language === 'ar' ? 'كشف إعادة محاولات نفس المستخدم' : 'Catch same-user re-attempts' },
            { name: language === 'ar' ? 'انتهاء KYC' : 'KYC Expiry', status: false, desc: language === 'ar' ? 'تنبيه عند انتهاء وثائق التاجر' : 'Flag expired merchant documents' },
          ].map((rule, i) => (
            <div key={i} className="p-4 rounded-xl border border-border flex items-start justify-between group hover:border-primary/50 transition-all bg-muted/20">
              <div>
                <div className="text-sm font-bold">{rule.name}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{rule.desc}</div>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${rule.status ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rule.status ? 'inset-inline-end-1' : 'inset-inline-start-1'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskAML;