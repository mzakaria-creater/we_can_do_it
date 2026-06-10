import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  CreditCard, 
  Briefcase, 
  Info,
  ChevronLeft,
  Save,
  Loader2,
  Sparkles,
  Banknote,
  ShieldCheck,
  Landmark,
  Calculator
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { LuxuryCard } from '../components/LuxuryCard';
import { PageHeader } from '../components/PageHeader';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { projectId } from '../../../utils/supabase/info';

export const MerchantsNew = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    legalName: '',
    businessType: 'Corporation',
    industry: '',
    taxId: '',
    registrationNumber: '',
    
    // Contact Info
    contactName: '',
    contactPosition: '',
    email: '',
    phone: '',
    supportEmail: '',
    supportPhone: '',
    
    // Business Details
    websiteUrl: '',
    monthlyVolume: '',
    avgTransactionSize: '',
    estTransactionsMonth: '',
    
    // Address
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Egypt',
    
    // Banking
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    iban: '',
    swiftCode: '',
    bankBranch: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(isRTL ? 'يجب تسجيل الدخول أولاً' : 'You must be logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/merchants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create merchant');
      }

      toast.success(isRTL ? 'تمت إضافة التاجر بنجاح' : 'Merchant added successfully');
      navigate('/merchants');
    } catch (error: any) {
      console.error('Error creating merchant:', error);
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إضافة التاجر' : 'An error occurred while adding the merchant'));
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all";
  const labelClasses = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1";

  const SectionTitle = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-gradient-to-br from-[#D4AF37]/20 to-[#AA8B2E]/5 border border-[#D4AF37]/30 rounded-2xl text-[#D4AF37]">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F14] pb-20">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <PageHeader 
          title={isRTL ? 'إضافة تاجر جديد' : 'Add New Merchant'}
          description={isRTL ? 'تكامل تاجر جديد في نظام Press2Pay الملكي.' : 'Integrate a new merchant into the Press2Pay royal ecosystem.'}
          icon={Building2}
          actions={
            <button 
              onClick={() => navigate('/merchants')}
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 px-6 py-3 rounded-xl font-bold border border-slate-700/50 transition-all"
            >
              <ChevronLeft size={18} className={isRTL ? 'rotate-180' : ''} />
              <span>{isRTL ? 'رجوع' : 'Back'}</span>
            </button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Information */}
          <LuxuryCard className="p-8">
            <SectionTitle 
              icon={Info} 
              title={isRTL ? '📋 المعلومات الأساسية' : '📋 Basic Information'} 
              subtitle={isRTL ? 'بيانات العمل القانونية والرسمية.' : 'Legal business and official data.'}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'اسم التاجر *' : 'Merchant Name *'}</label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={isRTL ? 'اسم العلامة التجارية' : 'Brand Name'}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'الاسم التجاري القانوني *' : 'Legal Business Name *'}</label>
                <input 
                  required
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleChange}
                  placeholder={isRTL ? 'الاسم المسجل رسمياً' : 'Officially Registered Name'}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'نوع العمل *' : 'Business Type *'}</label>
                <select 
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="Corporation">Corporation</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLC">LLC</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'القطاع الصناعي *' : 'Industry *'}</label>
                <input 
                  required
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder={isRTL ? 'مثال: التجزئة، التكنولوجيا' : 'e.g., Retail, Tech'}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'الرقم الضريبي *' : 'Tax ID / VAT Number *'}</label>
                <input 
                  required
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="999-999-999"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'رقم السجل التجاري *' : 'Registration Number *'}</label>
                <input 
                  required
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="REG-123456"
                  className={inputClasses}
                />
              </div>
            </div>
          </LuxuryCard>

          {/* Section 2: Contact Information */}
          <LuxuryCard className="p-8">
            <SectionTitle 
              icon={Phone} 
              title={isRTL ? '📞 معلومات الاتصال' : '📞 Contact Information'} 
              subtitle={isRTL ? 'كيف نتواصل مع الشخص المسؤول.' : 'How we reach the person in charge.'}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'اسم جهة الاتصال الرئيسية *' : 'Primary Contact Name *'}</label>
                <input 
                  required
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder={isRTL ? 'الاسم الكامل' : 'Full Name'}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'المسمى الوظيفي *' : 'Contact Position *'}</label>
                <input 
                  required
                  name="contactPosition"
                  value={formData.contactPosition}
                  onChange={handleChange}
                  placeholder={isRTL ? 'المدير التنفيذي، مدير العمليات' : 'CEO, Ops Manager'}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'البريد الإلكتروني للاتصال *' : 'Contact Email *'}</label>
                <input 
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@merchant.com"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'رقم الهاتف *' : 'Phone Number *'}</label>
                <input 
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+20 1XX XXX XXXX"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'بريد الدعم الفني' : 'Support Email'}</label>
                <input 
                  type="email"
                  name="supportEmail"
                  value={formData.supportEmail}
                  onChange={handleChange}
                  placeholder="support@merchant.com"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'هاتف الدعم الفني' : 'Support Phone'}</label>
                <input 
                  name="supportPhone"
                  value={formData.supportPhone}
                  onChange={handleChange}
                  placeholder="+20 1XX XXX XXXX"
                  className={inputClasses}
                />
              </div>
            </div>
          </LuxuryCard>

          {/* Section 3: Business Details */}
          <LuxuryCard className="p-8">
            <SectionTitle 
              icon={Calculator} 
              title={isRTL ? '🏢 تفاصيل العمل' : '🏢 Business Details'} 
              subtitle={isRTL ? 'تقديرات المعاملات والأحجام المالية.' : 'Transaction estimates and financial volumes.'}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'رابط الموقع الإلكتروني *' : 'Website URL *'}</label>
                <input 
                  required
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://www.merchant.com"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'الحجم الشهري المتوقع (ج.م) *' : 'Expected Monthly Volume (EGP) *'}</label>
                <input 
                  required
                  type="number"
                  name="monthlyVolume"
                  value={formData.monthlyVolume}
                  onChange={handleChange}
                  placeholder="100,000"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'متوسط حجم المعاملة (ج.م) *' : 'Average Transaction Size (EGP) *'}</label>
                <input 
                  required
                  type="number"
                  name="avgTransactionSize"
                  value={formData.avgTransactionSize}
                  onChange={handleChange}
                  placeholder="500"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'المعاملات المتوقعة/شهر *' : 'Estimated Transactions/Month *'}</label>
                <input 
                  required
                  type="number"
                  name="estTransactionsMonth"
                  value={formData.estTransactionsMonth}
                  onChange={handleChange}
                  placeholder="200"
                  className={inputClasses}
                />
              </div>
            </div>
          </LuxuryCard>

          {/* Section 4: Address Information */}
          <LuxuryCard className="p-8">
            <SectionTitle 
              icon={MapPin} 
              title={isRTL ? '📍 معلومات العنوان' : '📍 Address Information'} 
              subtitle={isRTL ? 'المقر الرئيسي للعمل.' : 'Business headquarters.'}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className={labelClasses}>{isRTL ? 'عنوان الشارع *' : 'Street Address *'}</label>
                <input 
                  required
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder={isRTL ? 'اسم الشارع، رقم المبنى' : 'Street name, Building no.'}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'المدينة *' : 'City *'}</label>
                <input 
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={isRTL ? 'القاهرة، الإسكندرية' : 'Cairo, Alex'}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'الولاية/المنطقة *' : 'State/Region *'}</label>
                <input 
                  required
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder={isRTL ? 'الجيزة، المعادي' : 'Giza, Maadi'}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'الرمز البريدي *' : 'Postal Code *'}</label>
                <input 
                  required
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="12345"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'الدولة *' : 'Country *'}</label>
                <select 
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="Egypt">Egypt</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="UAE">UAE</option>
                  <option value="Jordan">Jordan</option>
                </select>
              </div>
            </div>
          </LuxuryCard>

          {/* Section 5: Banking Information */}
          <LuxuryCard className="p-8">
            <SectionTitle 
              icon={Landmark} 
              title={isRTL ? '🏦 المعلومات البنكية' : '🏦 Banking Information'} 
              subtitle={isRTL ? 'بيانات تسوية المستحقات المالية.' : 'Financial settlement data.'}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'اسم البنك *' : 'Bank Name *'}</label>
                <input 
                  required
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder={isRTL ? 'بنك مصر، البنك الأهلي' : 'Bank Misr, CIB'}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'اسم صاحب الحساب *' : 'Account Holder Name *'}</label>
                <input 
                  required
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  placeholder={isRTL ? 'الاسم كما يظهر في البنك' : 'Name as per bank records'}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'رقم الحساب *' : 'Account Number *'}</label>
                <input 
                  required
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="000000000000"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'رقم IBAN *' : 'IBAN *'}</label>
                <input 
                  required
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  placeholder="EG00000000000000000000000"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'كود SWIFT/BIC' : 'SWIFT/BIC Code'}</label>
                <input 
                  name="swiftCode"
                  value={formData.swiftCode}
                  onChange={handleChange}
                  placeholder="ABCDEGEG"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>{isRTL ? 'فرع البنك' : 'Bank Branch'}</label>
                <input 
                  name="bankBranch"
                  value={formData.bankBranch}
                  onChange={handleChange}
                  placeholder={isRTL ? 'فرع مدينة نصر' : 'Nasr City Branch'}
                  className={inputClasses}
                />
              </div>
            </div>
          </LuxuryCard>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-800/50">
            <button
              type="button"
              onClick={() => navigate('/merchants')}
              className="px-8 py-4 bg-slate-900 border border-slate-700/50 text-slate-400 font-bold rounded-2xl hover:bg-slate-800 transition-all"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-[#0B0F14] px-12 py-4 rounded-2xl font-black shadow-xl shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
              <span>{isRTL ? 'إضافة التاجر' : 'Add Merchant'}</span>
            </button>
          </div>
        </form>

        <footer className="text-center py-10 space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#D4AF37]/40">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Onboarding System</span>
          </div>
          <p className="text-slate-600 text-xs">
            © 2026 Press2Pay Gateway. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
        </footer>
      </div>
    </div>
  );
};
