import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  X, 
  Store, 
  Building2, 
  Eye,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';

interface Merchant {
  id: string;
  name: string;
  logo: string;
  subMerchantCount: number;
  status: 'Active' | 'Inactive';
}

export function MerchantHierarchy() {
  const { masterId } = useParams();
  const { t } = useTranslation();
  const { language } = useStore();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [merchants] = useState<Merchant[]>([
    { id: 'Test-Acs-01-02', name: 'Test ACS Merchant 02', logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=80&h=80&fit=crop', subMerchantCount: 2, status: 'Active' },
    { id: 'Test-Acs-01-03', name: 'Test ACS Merchant 03', logo: 'https://images.unsplash.com/photo-1556740758-90de2929e759?w=80&h=80&fit=crop', subMerchantCount: 3, status: 'Active' },
    { id: 'Test-Acs-01-04', name: 'Test ACS Merchant 04', logo: 'https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?w=80&h=80&fit=crop', subMerchantCount: 1, status: 'Inactive' },
    { id: 'NGPay-1Win-Prod', name: 'NGPay 1Win Production', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=80&fit=crop', subMerchantCount: 5, status: 'Active' },
    { id: 'NGPay-1Win-Test', name: 'NGPay 1Win Test', logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop', subMerchantCount: 2, status: 'Active' },
  ]);

  const [formData, setFormData] = useState({
    masterMerchantName: 'LuckyPari-Prod',
    merchantName: '',
    merchantCode: 'AUTO-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    aliasName: '',
    shortName: '',
    referralBy: '',
    midCode: 'MID-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    midSecretApi: '44e5c713-cdc4-4d19-806c-a54ae17ca2d3',
    merchantEmail: 'na@na.com',
    notes: 'NA',
    isActive: true,
  });

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete ${id}?`)) {
      toast.success(`Merchant ${id} deleted successfully`);
    }
  };

  const handleEdit = (merchant: Merchant) => {
    setIsEditMode(true);
    setFormData(prev => ({ ...prev, merchantName: merchant.name }));
    setShowModal(true);
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setFormData({
      ...formData,
      merchantName: '',
      merchantCode: 'AUTO-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      midCode: 'MID-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    });
    setShowModal(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const filteredMerchants = merchants.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-[#D4AF37] to-[#F5D061] bg-clip-text text-transparent mb-2">
            {t('nav.merchant') || (isRTL ? 'إدارة التجار' : 'Merchant Management')}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{t('nav.section.merchants') || (isRTL ? 'التاجر الرئيسي' : 'Master Merchant')}:</span>
            <span className="px-2 py-0.5 bg-muted rounded font-mono text-foreground font-bold">{masterId || 'LuckyPari-Prod'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/master-merchants" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors font-medium">
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            {t('cancel') || (isRTL ? 'رجوع' : 'Back')}
          </Link>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-2 bg-[#D4AF37] text-black rounded-xl font-bold shadow-lg shadow-[#D4AF37]/20 hover:bg-[#F5D061] transition-all"
          >
            <Plus size={18} />
            {t('payment.add_method') || (isRTL ? 'إضافة تاجر' : 'Add Merchant')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground`} size={18} />
            <input 
              type="text" 
              placeholder={isRTL ? 'بحث عن تاجر...' : 'Search merchants...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-muted/50 border border-border rounded-xl py-2.5 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} focus:ring-2 focus:ring-[#D4AF37]/50 outline-none transition-all`}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <Filter size={18} />
            <span>{isRTL ? 'تصفية' : 'Filter'}</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className={`px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('transaction.id') || 'Merchant ID'}
                </th>
                <th className={`px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('transaction.merchant') || 'Merchant Details'}
                </th>
                <th className={`px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('payment.sub_merchant') || 'Sub-Merchants'}
                </th>
                <th className={`px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center`}>
                  {t('transaction.status') || 'Status'}
                </th>
                <th className={`px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>
                  {t('velocity.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-muted-foreground">
                    {merchant.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                        <img src={merchant.logo} alt={merchant.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-sm text-foreground">{merchant.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      to={`/sub-merchant/${merchant.id}`} 
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                    >
                      <Eye size={14} />
                      {t('view') || (isRTL ? 'عرض' : 'View')} ({merchant.subMerchantCount})
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      merchant.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {merchant.status === 'Active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {merchant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 ${isRTL ? 'justify-end' : 'justify-end'}`}>
                      <button 
                        onClick={() => handleEdit(merchant)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(merchant.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-lg font-bold">
                {isEditMode 
                  ? (isRTL ? 'تعديل بيانات التاجر' : 'Edit Merchant Details') 
                  : (isRTL ? 'إضافة تاجر جديد' : 'Add New Merchant')
                }
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="mb-8">
                <h4 className="flex items-center gap-2 text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-6 pb-2 border-b border-border/50">
                  <Store size={16} />
                  {t('nav.section.merchants') || (isRTL ? 'معلومات التاجر' : 'Merchant Information')}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {isRTL ? 'اسم التاجر *' : 'Merchant Name *'}
                    </label>
                    <input 
                      type="text" 
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none transition-all"
                      value={formData.merchantName}
                      onChange={(e) => handleInputChange('merchantName', e.target.value)}
                      placeholder={isRTL ? 'أدخل اسم التاجر' : 'Enter merchant name'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {isRTL ? 'البريد الإلكتروني' : 'Merchant Email'}
                    </label>
                    <input 
                      type="email" 
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none transition-all"
                      value={formData.merchantEmail}
                      onChange={(e) => handleInputChange('merchantEmail', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {isRTL ? 'كود التاجر (تلقائي)' : 'Merchant Code (Auto)'}
                    </label>
                    <input 
                      type="text" 
                      disabled
                      className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-muted-foreground font-mono cursor-not-allowed"
                      value={formData.merchantCode}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      MID Code
                    </label>
                    <input 
                      type="text" 
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 font-mono focus:ring-2 focus:ring-[#D4AF37]/50 outline-none transition-all"
                      value={formData.midCode}
                      onChange={(e) => handleInputChange('midCode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    {isRTL ? 'رابط الشعار' : 'Merchant Logo URL'}
                  </label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none transition-all"
                      placeholder="https://..."
                    />
                    <div className="w-11 h-11 bg-muted border border-border rounded-xl flex items-center justify-center shrink-0">
                      <Building2 size={20} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-6 pb-2 border-b border-border/50">
                  <CheckCircle2 size={16} />
                  {isRTL ? 'الإعدادات والصلاحيات' : 'Settings & Permissions'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'isActive', label: isRTL ? 'حساب نشط' : 'Active Account' },
                    { key: 'allowRefund', label: isRTL ? 'السماح بالاسترداد' : 'Allow Refunds' },
                    { key: 'enableDeposit', label: isRTL ? 'تفعيل الإيداع' : 'Enable Deposits' },
                    { key: 'enablePayout', label: isRTL ? 'تفعيل السحب' : 'Enable Payouts' },
                    { key: 'enableGeoIp', label: isRTL ? 'التحقق الجغرافي (GeoIP)' : 'Enable GeoIP Check' },
                    { key: 'offlineProcessing', label: isRTL ? 'معالجة غير متصلة' : 'Offline Processing' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                      <input 
                        type="checkbox"
                        checked={!!formData[item.key as keyof typeof formData]}
                        onChange={(e) => handleInputChange(item.key, e.target.checked)}
                        className="w-5 h-5 rounded border-border text-[#D4AF37] focus:ring-[#D4AF37] bg-card"
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl border border-border font-bold hover:bg-muted transition-colors"
              >
                {t('cancel') || (isRTL ? 'إلغاء' : 'Cancel')}
              </button>
              <button 
                onClick={() => {
                  toast.success(isEditMode ? 'Merchant updated successfully' : 'Merchant created successfully');
                  setShowModal(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold shadow-lg shadow-[#D4AF37]/20 hover:bg-[#F5D061] transition-all"
              >
                {t('save') || (isRTL ? 'حفظ' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MasterMerchantList() {
  const { t } = useTranslation();
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const masters = [
    { id: 'LuckyPari-Prod', name: 'LuckyPari Production', count: 12, status: 'Active' },
    { id: 'LuckyPari-Test', name: 'LuckyPari Test', count: 4, status: 'Active' },
    { id: 'OneWin-Prod', name: '1Win Production', count: 8, status: 'Active' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black bg-gradient-to-r from-[#D4AF37] to-[#F5D061] bg-clip-text text-transparent">
          {isRTL ? 'التجار الرئيسيين (L1)' : 'Master Merchants (L1)'}
        </h1>
        <Link to="/merchants/new" className="px-6 py-2 bg-[#D4AF37] text-black rounded-xl font-bold hover:bg-[#F5D061] transition-all flex items-center gap-2">
          <Plus size={18} />
          {isRTL ? 'إضافة جديد' : 'Add New'}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masters.map(master => (
          <Link to={`/master-merchant/${master.id}`} key={master.id} className="block group">
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all shadow-sm hover:shadow-lg hover:shadow-[#D4AF37]/5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-colors">
                  <Building2 size={24} />
                </div>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-lg uppercase">
                  {master.status}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">{master.name}</h3>
              <p className="text-sm text-muted-foreground font-mono mb-4">{master.id}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  {master.count} {isRTL ? 'تاجر فرعي' : 'Merchants'}
                </span>
                <ChevronRight className={`text-muted-foreground group-hover:text-[#D4AF37] transition-colors ${isRTL ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SubMerchantHierarchy() {
  const { merchantId } = useParams();
  const { t } = useTranslation();
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const subMerchants = [
    { id: 'SM-001', name: 'Cairo Branch 1', type: 'Terminal', status: 'Active' },
    { id: 'SM-002', name: 'Alexandria Branch', type: 'Online', status: 'Active' },
    { id: 'SM-003', name: 'Mobile App POS', type: 'Mobile', status: 'Inactive' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-[#D4AF37] to-[#F5D061] bg-clip-text text-transparent mb-2">
            {isRTL ? 'التجار الفرعيين (L3)' : 'Sub-Merchants (L3)'}
          </h1>
          <p className="text-muted-foreground font-mono font-bold text-sm">Parent: {merchantId}</p>
        </div>
        <button onClick={() => window.history.back()} className="px-4 py-2 border border-border rounded-xl hover:bg-muted font-bold">
          {isRTL ? 'رجوع' : 'Back'}
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">{isRTL ? 'المعرف' : 'ID'}</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">{isRTL ? 'الاسم' : 'Name'}</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">{isRTL ? 'النوع' : 'Type'}</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-center">{isRTL ? 'الحالة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subMerchants.map(sm => (
              <tr key={sm.id} className="hover:bg-muted/20">
                <td className="px-6 py-4 font-mono text-sm">{sm.id}</td>
                <td className="px-6 py-4 font-bold">{sm.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{sm.type}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sm.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {sm.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
