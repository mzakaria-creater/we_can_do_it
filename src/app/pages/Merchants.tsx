import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Settings, 
  ShieldCheck, 
  Building2,
  Mail,
  Phone,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLoaderData, useNavigate } from 'react-router';
import { useStore } from '../../lib/store';
import { PageHeader } from '../components/PageHeader';

export const Merchants = () => {
  const { t } = useTranslation();
  const { language, isAuthenticated } = useStore();
  const loaderData = useLoaderData() as any;
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const initialMerchants = loaderData?.merchantsData?.merchants || [];

  const [merchantsList, setMerchantsList] = useState<any[]>(initialMerchants);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (loaderData?.merchantsData?.merchants) {
      setMerchantsList(loaderData.merchantsData.merchants);
    }
  }, [loaderData]);

  const filteredMerchants = merchantsList.filter((m: any) => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title={isRTL ? 'إدارة المنشآت والشركاء' : 'Merchant & Partner Management'}
        description={isRTL ? 'إدارة شركاء الأعمال، الكيانات التجارية والمنضمين حديثاً للمنظومة.' : 'Comprehensive management of business partners, merchant entities, and ecosystem newcomers.'}
        icon={Building2}
        actions={
          isAuthenticated && (
            <button 
              onClick={() => navigate('/merchants/new')}
              className="flex items-center justify-center gap-2 bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wider"
            >
              <Plus size={20} />
              <span>{isRTL ? 'إضافة منشأة جديدة' : 'Add New Merchant'}</span>
            </button>
          )
        }
      />

      {merchantsList.length > 0 ? (
        <>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder={isRTL ? 'بحث برقم التعريف، اسم المنشأة، أو البريد الإلكتروني...' : 'Search by Merchant ID, entity name, or official email...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full ps-10 pe-4 py-3 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/50 outline-none shadow-sm transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select className="bg-card border border-border rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4AF37]/50 cursor-pointer shadow-sm min-w-[140px]">
                <option>{isRTL ? 'كافة القطاعات' : 'All Sectors'}</option>
                <option value="retail">{t('retail')}</option>
                <option value="tech">{t('tech')}</option>
                <option value="grocery">{t('grocery')}</option>
                <option value="logistics">{t('logistics')}</option>
              </select>
              <select className="bg-card border border-border rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4AF37]/50 cursor-pointer shadow-sm min-w-[140px]">
                <option>{isRTL ? 'كافة حالات الامتثال' : 'All Compliance Statuses'}</option>
                <option value="verified">{t('verified')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="suspended">{t('suspended')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMerchants.map((m: any, idx: number) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-2xl border border-border shadow-sm hover:border-primary/50 transition-all overflow-hidden group flex flex-col"
              >
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{m.name}</h4>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t(m.category || 'retail')}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      m.status === 'verified' ? 'bg-success/10 text-success' : 
                      m.status === 'pending' ? 'bg-warning/10 text-warning' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {t(m.status || 'pending')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-muted/30 rounded-2xl border border-transparent group-hover:border-border transition-colors">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1 tracking-tight">{t('monthlyVol')}</div>
                      <div className="text-base font-bold text-foreground">{m.monthlyVolume || 'EGP 0'}</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl border border-transparent group-hover:border-border transition-colors">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1 tracking-tight">{t('apiStatus')}</div>
                      <div className="flex items-center gap-1.5 text-base font-bold text-success">
                        <ShieldCheck size={14} /> {t('active')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail size={14} className="text-primary/70" /> {m.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={14} className="text-primary/70" /> {m.phone || '+20 123 456 789'}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted/20 border-t border-border flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-card rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm">
                      <Settings size={18} />
                    </button>
                    <button className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-primary/20">
                      <ExternalLink size={14} /> {isRTL ? 'الملف الشخصي' : 'Profile'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-dashed border-border rounded-3xl space-y-6">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground opacity-50">
            <Building2 size={40} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">{isRTL ? 'لا يوجد تجار بعد' : 'No merchants added yet.'}</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              {isRTL 
                ? 'ابدأ بإضافة أول تاجر لك لتفعيل خدمات الدفع والتحصيل الملكية.' 
                : 'Start by adding your first merchant to activate royal payment and collection services.'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/merchants/new')}
            className="bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.05] transition-all"
          >
            {isRTL ? 'ابدأ الآن' : 'Start Now'}
          </button>
        </div>
      )}

      <footer className="pt-10 border-t border-border flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 text-[#D4AF37]/40">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Press2Pay Compliance Standard</span>
        </div>
        <div className="text-slate-600 text-xs space-y-1">
          <p>© 2026 Press2Pay Gateway. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <p className="opacity-50">Version 93</p>
        </div>
      </footer>
    </div>
  );
};

// Default export for lazy loading
export default Merchants;