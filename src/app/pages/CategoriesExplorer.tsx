import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Folder, 
  FolderOpen, 
  Search, 
  Filter, 
  ChevronRight, 
  LayoutGrid, 
  List,
  Building2,
  ShoppingCart,
  Cpu,
  Truck,
  Gamepad2,
  Briefcase,
  Stethoscope,
  GraduationCap,
  ArrowRight,
  MoreVertical,
  Star,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/PageHeader';
import { LuxuryCard } from '../components/LuxuryCard';
import { useStore } from '../../lib/store';

const CATEGORIES_DATA = [
  { id: 'retail', icon: ShoppingCart, color: '#D4AF37', count: 124, growth: '+12%', lastActivity: '2 mins ago', keyAr: 'التجزئة', keyEn: 'Retail', descriptionEn: 'Department stores, fashion, and retail chains.', descriptionAr: 'المتاجر الكبرى وبيوت الأزياء وسلاسل التجزئة.' },
  { id: 'tech', icon: Cpu, color: '#3B82F6', count: 85, growth: '+24%', lastActivity: '15 mins ago', keyAr: 'التكنولوجيا', keyEn: 'Technology', descriptionEn: 'Software, hardware, and digital services.', descriptionAr: 'البرمجيات والأجهزة والخدمات الرقمية.' },
  { id: 'grocery', icon: ShoppingCart, color: '#10B981', count: 42, growth: '+5%', lastActivity: '1 hour ago', keyAr: 'البقالة', keyEn: 'Grocery', descriptionEn: 'Supermarkets and food distribution.', descriptionAr: 'السوبر ماركت وتوزيع المواد الغذائية.' },
  { id: 'logistics', icon: Truck, color: '#F59E0B', count: 31, growth: '-2%', lastActivity: '3 hours ago', keyAr: 'الخدمات اللوجستية', keyEn: 'Logistics', descriptionEn: 'Shipping, transport, and delivery services.', descriptionAr: 'خدمات الشحن والنقل والتوصيل.' },
  { id: 'leisure', icon: Gamepad2, color: '#8B5CF6', count: 56, growth: '+18%', lastActivity: '5 mins ago', keyAr: 'الترفيه', keyEn: 'Leisure & Entertainment', descriptionEn: 'Gaming, tourism, and entertainment venues.', descriptionAr: 'الألعاب والسياحة وأماكن الترفيه.' },
  { id: 'services', icon: Briefcase, color: '#6366F1', count: 92, growth: '+15%', lastActivity: '12 mins ago', keyAr: 'الخدمات', keyEn: 'Professional Services', descriptionEn: 'Consulting, legal, and business services.', descriptionAr: 'الخدمات الاستشارية والقانونية والتجارية.' },
  { id: 'health', icon: Stethoscope, color: '#EF4444', count: 18, growth: '+8%', lastActivity: '45 mins ago', keyAr: 'الرعاية الصحية', keyEn: 'Healthcare', descriptionEn: 'Medical clinics, pharmacies, and wellness.', descriptionAr: 'العيادات الطبية والصيدليات والعافية.' },
  { id: 'education', icon: GraduationCap, color: '#EC4899', count: 24, growth: '+10%', lastActivity: '2 days ago', keyAr: 'التعليم', keyEn: 'Education', descriptionEn: 'Schools, universities, and training centers.', descriptionAr: 'المدارس والجامعات ومراكز التدريب.' },
];

import { useNavigate, useParams } from 'react-router';

export const CategoriesExplorer = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = CATEGORIES_DATA.filter(cat => 
    (isRTL ? cat.keyAr : cat.keyEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (isRTL ? cat.descriptionAr : cat.descriptionEn).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCategory = (id: string) => {
    navigate(`/categories/${id}`);
  };

  const handleBack = () => {
    navigate('/categories');
  };

  const currentCategory = CATEGORIES_DATA.find(c => c.id === categoryId);
  const isDetailView = !!categoryId && currentCategory;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <PageHeader 
        title={isRTL ? 'مستكشف الفئات' : 'Categories Explorer'}
        description={isRTL ? 'إدارة وتصنيف التجار والمعاملات بناءً على قطاعات العمل.' : 'Manage and classify merchants and transactions based on business sectors.'}
        icon={FolderTree}
        actions={
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <List size={18} />
            </button>
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {!isDetailView ? (
          <motion.div 
            key="explorer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <LuxuryCard className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground`} size={20} />
                  <input
                    type="text"
                    placeholder={isRTL ? 'بحث في الفئات...' : 'Search categories...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl font-bold hover:bg-muted transition-all">
                    <Filter size={18} />
                    <span>{isRTL ? 'تصفية' : 'Filter'}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg">
                    <FolderTree size={18} />
                    <span>{isRTL ? 'فئة جديدة' : 'New Category'}</span>
                  </button>
                </div>
              </div>
            </LuxuryCard>

            {/* Folders Grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCategories.map((cat, idx) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleOpenCategory(cat.id)}
                    className="group cursor-pointer"
                  >
                    <LuxuryCard className="h-full hover:border-primary/50 transition-all overflow-visible">
                      {/* Folder Top Tab */}
                      <div className={`absolute -top-3 ${isRTL ? 'right-4' : 'left-4'} w-16 h-4 rounded-t-lg transition-colors group-hover:bg-primary`} style={{ backgroundColor: cat.color + '40' }} />
                      
                      <div className="p-6 pt-8 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="p-3 rounded-xl transition-all group-hover:scale-110" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                            <cat.icon size={28} />
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black">{cat.count}</span>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                              {isRTL ? 'تاجر' : 'Merchants'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                            {isRTL ? cat.keyAr : cat.keyEn}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {isRTL ? cat.descriptionAr : cat.descriptionEn}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className={`text-xs font-bold ${cat.growth.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                            {cat.growth} {isRTL ? 'نمو' : 'Growth'}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} />
                            {cat.lastActivity}
                          </div>
                        </div>
                      </div>
                    </LuxuryCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <LuxuryCard>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'الفئة' : 'Category'}</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'الوصف' : 'Description'}</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">{isRTL ? 'التجار' : 'Merchants'}</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">{isRTL ? 'النمو' : 'Growth'}</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">{isRTL ? 'آخر نشاط' : 'Last Activity'}</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => handleOpenCategory(cat.id)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                                <cat.icon size={20} />
                              </div>
                              <span className="font-bold">{isRTL ? cat.keyAr : cat.keyEn}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground line-clamp-1">{isRTL ? cat.descriptionAr : cat.descriptionEn}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold">{cat.count}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-sm font-bold ${cat.growth.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{cat.growth}</span>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span className="text-xs text-muted-foreground">{cat.lastActivity}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <ChevronRight size={18} className={`text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </LuxuryCard>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="category-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Breadcrumbs / Back */}
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-primary font-bold hover:underline mb-4"
            >
              {isRTL ? <ArrowRight className="rotate-180" size={18} /> : <ArrowRight className="rotate-180" size={18} />}
              {isRTL ? 'العودة للمستكشف' : 'Back to Explorer'}
            </button>

            {/* Category Header Card */}
            <LuxuryCard className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-6 rounded-3xl shadow-xl animate-pulse" style={{ backgroundColor: currentCategory?.color + '20', color: currentCategory?.color }}>
                    {currentCategory && <currentCategory.icon size={48} />}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight mb-2">
                      {isRTL ? currentCategory?.keyAr : currentCategory?.keyEn}
                    </h2>
                    <p className="text-muted-foreground max-w-xl text-lg">
                      {isRTL ? currentCategory?.descriptionAr : currentCategory?.descriptionEn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-2xl border border-border min-w-[120px]">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">{isRTL ? 'إجمالي الحجم' : 'Total Volume'}</p>
                    <p className="text-2xl font-black text-primary">EGP 2.4M</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-2xl border border-border min-w-[120px]">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">{isRTL ? 'تجار نشطون' : 'Active Merchants'}</p>
                    <p className="text-2xl font-black text-primary">{currentCategory?.count}</p>
                  </div>
                </div>
              </div>
            </LuxuryCard>

            {/* Mock Sub-folders / Sub-categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { titleEn: 'Documents', titleAr: 'المستندات', count: 12, icon: Folder },
                { titleEn: 'Compliance', titleAr: 'الامتثال', count: 5, icon: Folder },
                { titleEn: 'Analytics', titleAr: 'التحليلات', count: 8, icon: Folder },
              ].map((sub, idx) => (
                <LuxuryCard key={idx} className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <sub.icon size={32} className="text-primary group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="font-bold">{isRTL ? sub.titleAr : sub.titleEn}</h4>
                        <p className="text-xs text-muted-foreground">{sub.count} {isRTL ? 'ملف' : 'files'}</p>
                      </div>
                    </div>
                    <MoreVertical size={18} className="text-muted-foreground" />
                  </div>
                </LuxuryCard>
              ))}
            </div>

            {/* Mock Merchant List for this Category */}
            <LuxuryCard className="overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tight">
                  {isRTL ? 'أهم التجار في هذه الفئة' : 'Top Merchants in this Category'}
                </h3>
                <button className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                  {isRTL ? 'عرض الكل' : 'View All'}
                  <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>
              <div className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-muted/20 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        M{i}
                      </div>
                      <div>
                        <h4 className="font-bold group-hover:text-primary transition-colors">Merchant Name {i}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star size={10} className="fill-amber-500 text-amber-500" /> 4.8
                          </span>
                          <span className="text-xs text-muted-foreground">Joined Oct 2025</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div className="hidden sm:block">
                        <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Monthly Volume</p>
                        <p className="font-black">EGP 145,000</p>
                      </div>
                      <button className="p-3 bg-muted rounded-xl hover:bg-primary hover:text-primary-foreground transition-all">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </LuxuryCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { FolderTree } from 'lucide-react';
