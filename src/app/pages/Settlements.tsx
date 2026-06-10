import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Filter,
  Search,
  Upload,
  Play,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLoaderData, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { SettlementFileUpload } from '../components/SettlementFileUpload';
import { toast } from 'sonner';
import { supabase, projectId, publicAnonKey } from '../../lib/supabase';

export const Settlements = () => {
  const { t, i18n } = useTranslation();
  const loaderData = useLoaderData() as any;
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:kv:settlement')
      .on('broadcast', { event: 'INSERT' }, () => {
        queryClient.invalidateQueries({ queryKey: ['settlements'] });
        navigate('.', { replace: true });
      })
      .on('broadcast', { event: 'UPDATE' }, () => {
        queryClient.invalidateQueries({ queryKey: ['settlements'] });
        navigate('.', { replace: true });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, navigate]);

  const handleProcess = async (id: string) => {
    setProcessingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/process-settlement/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Processing failed');
      }

      const result = await response.json();
      toast.success(isRTL 
        ? `تمت المعالجة بنجاح: ${result.processedCount} عملية` 
        : `Processed successfully: ${result.processedCount} transactions`
      );
      
      navigate('.', { replace: true });
    } catch (err: any) {
      console.error('[Process] Error:', err);
      toast.error(isRTL ? `فشل المعالجة: ${err.message}` : `Processing failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const initialSettlements = [
    { id: '1', merchant: 'MegaStore Cairo', date: '2026-02-14', amount: 84500, fee: 1690, net: 82810, status: 'processed', method: 'Bank Transfer (CIB)' },
    { id: '2', merchant: 'Zad Mart', date: '2026-02-14', amount: 12400, fee: 248, net: 12152, status: 'pending', method: 'Vodafone Cash' },
    { id: '3', merchant: 'Cairo Mall', date: '2026-02-13', amount: 145000, fee: 2900, net: 142100, status: 'processed', method: 'Bank Transfer (HSBC)' },
    { id: '4', merchant: 'Nile Electronics', date: '2026-02-15', amount: 4500, fee: 90, net: 4410, status: 'failed', method: 'Orange Money' },
  ];

  const [settlementsList, setSettlementsList] = useState(initialSettlements);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (loaderData?.settlementsData?.settlements) {
      setSettlementsList(loaderData.settlementsData.settlements);
    }
  }, [loaderData]);

  const filteredSettlements = settlementsList.filter((s: any) => 
    s.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isRTL = i18n.language === 'ar';

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('settlements')}</h2>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة التسويات المالية وصرف العمولات للمنشآت.' : 'Comprehensive management of merchant settlements and fee distributions.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg text-sm font-bold hover:bg-[#D4AF37]/10 uppercase tracking-wider transition-all"
          >
            <Upload size={18} /> {isRTL ? 'رفع ملف PSP' : 'Upload PSP File'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted uppercase tracking-wider">
            <Calendar size={18} /> {isRTL ? 'جدولة تسوية' : 'Schedule'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-bold shadow-lg shadow-[#D4AF37]/20 uppercase tracking-wider transition-all hover:opacity-90 active:scale-95">
            {isRTL ? 'معالجة الدفعة' : 'Process Batch'}
          </button>
        </div>
      </div>

      <SettlementFileUpload 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => navigate('.', { replace: true })}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: isRTL ? 'التسوية القادمة' : 'Next Settlement', value: isRTL ? '٠ ج.م' : 'EGP 0', sub: isRTL ? 'مجدولة للغد' : 'Scheduled for tomorrow', icon: Clock, color: 'text-[#D4AF37]' },
          { label: isRTL ? 'تمت معالجته اليوم' : 'Processed Today', value: isRTL ? '٢.٤ مليون ج.م' : 'EGP 2.4M', sub: isRTL ? 'لـ ١٢ منشأة' : 'Across 12 merchants', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: isRTL ? 'فاشلة / معلقة' : 'Failed/Pending', value: isRTL ? '٨,٢٠٠ ج.م' : 'EGP 8,200', sub: isRTL ? '٣ عمليات تتطلب تدخل' : '3 items require action', icon: AlertCircle, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-5 rounded-xl border border-border flex items-center gap-4 shadow-sm">
            <div className={`p-3 bg-muted rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <h3 className="font-bold text-lg uppercase tracking-tight">{isRTL ? 'سجل التسويات المالية' : 'Settlement Transaction History'}</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground`} size={16} />
              <input 
                type="text" 
                placeholder={isRTL ? 'بحث بالمنشأة...' : 'Search by merchant...'} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`ps-9 pe-4 py-1.5 bg-muted rounded-lg text-sm outline-none w-full border border-transparent focus:border-[#D4AF37]/50 transition-all ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`} 
              />
            </div>
            <button className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border">
          {filteredSettlements.map((s: any) => (
            <div key={s.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-sm font-bold">{s.merchant}</div>
                  <div className="text-xs text-muted-foreground">{s.date}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    s.status === 'processed' ? 'bg-success/10 text-success' :
                    s.status === 'pending' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {s.status}
                  </span>
                  {s.status === 'pending' && (
                    <button
                      onClick={() => handleProcess(s.id)}
                      disabled={processingId === s.id}
                      className="flex items-center gap-1 px-2 py-1 bg-[#D4AF37] text-black rounded text-[10px] font-bold uppercase hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {processingId === s.id ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                      {isRTL ? 'معالجة' : 'Process'}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-xs text-muted-foreground">{s.method}</div>
                <div className="text-right">
                  <div className="text-sm font-bold">EGP {s.net.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">Fee: EGP {s.fee}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-start">Merchant</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-start">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-start">Method</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-end">Net Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSettlements.map((s: any) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm">{s.merchant}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{s.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs">
                      <CreditCard size={14} className="text-muted-foreground" />
                      {s.method}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="text-sm font-bold">EGP {s.net.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">Fee: EGP {s.fee}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        s.status === 'processed' ? 'bg-success/10 text-success' :
                        s.status === 'pending' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {s.status}
                      </span>
                      {s.status === 'pending' && (
                        <button
                          onClick={() => handleProcess(s.id)}
                          disabled={processingId === s.id}
                          className="flex items-center gap-1 px-3 py-1 bg-[#D4AF37] text-black rounded text-[10px] font-bold uppercase hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                          {processingId === s.id ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                          {isRTL ? 'معالجة' : 'Process'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settlements;