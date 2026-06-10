import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  CheckCircle, 
  XCircle, 
  Download, 
  Plus, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  Power, 
  PowerOff, 
  Trash2, 
  Copy, 
  Check,
  DollarSign
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboard';
import wePayLogo from 'figma:asset/40b59f47a7a911cf6720a29e0f927f19cd79b1c2.png';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface PayMethodType {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  category: 'Mobile Money' | 'Bank Transfer' | 'Digital Payment' | 'Card Payment';
  provider: string;
  status: 'active' | 'inactive';
  minAmount: number;
  maxAmount: number;
  currency: string;
  processingFee: number;
  icon?: string;
}

const MOCK_PAY_METHODS: PayMethodType[] = [
  { 
    id: 'PM001', 
    code: 'VODAFONE_CASH', 
    name: 'Vodafone Cash', 
    nameAr: 'فودافون كاش', 
    category: 'Mobile Money', 
    provider: 'Vodafone Egypt', 
    status: 'active', 
    minAmount: 10, 
    maxAmount: 50000, 
    currency: 'EGP', 
    processingFee: 1.5 
  },
  { 
    id: 'PM002', 
    code: 'ORANGE_MONEY', 
    name: 'Orange Money', 
    nameAr: 'أورانج موني', 
    category: 'Mobile Money', 
    provider: 'Orange Egypt', 
    status: 'active', 
    minAmount: 10, 
    maxAmount: 30000, 
    currency: 'EGP', 
    processingFee: 1.5 
  },
  { 
    id: 'PM003', 
    code: 'INSTAPAY', 
    name: 'InstaPay', 
    nameAr: 'إنستاباي', 
    category: 'Bank Transfer', 
    provider: 'Central Bank of Egypt', 
    status: 'active', 
    minAmount: 1, 
    maxAmount: 1000000, 
    currency: 'EGP', 
    processingFee: 0.5 
  },
  { 
    id: 'PM004', 
    code: 'FAWRY', 
    name: 'Fawry', 
    nameAr: 'فوري', 
    category: 'Digital Payment', 
    provider: 'Fawry', 
    status: 'active', 
    minAmount: 10, 
    maxAmount: 100000, 
    currency: 'EGP', 
    processingFee: 2.0 
  },
  { 
    id: 'PM005', 
    code: 'ETISALAT_CASH', 
    name: 'Etisalat Cash', 
    nameAr: 'اتصالات كاش', 
    category: 'Mobile Money', 
    provider: 'Etisalat Egypt', 
    status: 'inactive', 
    minAmount: 10, 
    maxAmount: 25000, 
    currency: 'EGP', 
    processingFee: 1.5 
  },
  { 
    id: 'PM006', 
    code: 'BANK_TRANSFER', 
    name: 'Bank Transfer', 
    nameAr: 'حوالة بنكية', 
    category: 'Bank Transfer', 
    provider: 'Multiple Banks', 
    status: 'active', 
    minAmount: 1, 
    maxAmount: 5000000, 
    currency: 'EGP', 
    processingFee: 0.3 
  },
  { 
    id: 'PM007', 
    code: 'WE_PAY', 
    name: 'WE Pay', 
    nameAr: 'وي باي', 
    category: 'Mobile Money', 
    provider: 'WE (Telecom Egypt)', 
    status: 'active', 
    minAmount: 10, 
    maxAmount: 40000, 
    currency: 'EGP', 
    processingFee: 1.5,
    icon: wePayLogo
  },
  { 
    id: 'PM008', 
    code: 'MEEZA_CARD', 
    name: 'Meeza Card', 
    nameAr: 'كارت ميزة', 
    category: 'Card Payment', 
    provider: 'Egyptian Banks', 
    status: 'active', 
    minAmount: 1, 
    maxAmount: 100000, 
    currency: 'EGP', 
    processingFee: 1.2 
  },
];

export const PayMethodTypes = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [payMethods, setPayMethods] = useState<PayMethodType[]>(MOCK_PAY_METHODS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'Mobile Money' | 'Bank Transfer' | 'Digital Payment' | 'Card Payment'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PayMethodType | null>(null);
  const [copiedCode, setCopiedCode] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const categoryConfig = {
    'Mobile Money': { 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-500/30',
      icon: Smartphone,
      label: isRTL ? 'محافظ الموبايل' : 'Mobile Money'
    },
    'Bank Transfer': { 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/20', 
      border: 'border-purple-500/30',
      icon: Building2,
      label: isRTL ? 'تحويل بنكي' : 'Bank Transfer'
    },
    'Digital Payment': { 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/20', 
      border: 'border-cyan-500/30',
      icon: Wallet,
      label: isRTL ? 'دفع رقمي' : 'Digital Payment'
    },
    'Card Payment': { 
      color: 'text-orange-400', 
      bg: 'bg-orange-500/20', 
      border: 'border-orange-500/30',
      icon: CreditCard,
      label: isRTL ? 'بطاقات' : 'Card Payment'
    }
  };

  const statusConfig = {
    active: { 
      color: 'text-green-400', 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/30',
      icon: CheckCircle,
      label: isRTL ? 'نشط' : 'Active'
    },
    inactive: { 
      color: 'text-gray-400', 
      bg: 'bg-gray-500/20', 
      border: 'border-gray-500/30',
      icon: XCircle,
      label: isRTL ? 'غير نشط' : 'Inactive'
    }
  };

  const filteredMethods = payMethods.filter(method => {
    const matchSearch = method.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       method.nameAr.includes(searchQuery) ||
                       method.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       method.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'all' || method.category === filterCategory;
    const matchStatus = filterStatus === 'all' || method.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const stats = {
    total: payMethods.length,
    active: payMethods.filter(m => m.status === 'active').length,
    mobileMoney: payMethods.filter(m => m.category === 'Mobile Money').length,
    bankTransfer: payMethods.filter(m => m.category === 'Bank Transfer').length
  };

  const toggleStatus = (id: string) => {
    setPayMethods(payMethods.map(m => {
      if (m.id === id) {
        const newStatus = m.status === 'active' ? 'inactive' : 'active';
        toast.success(`${m.name} ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        return { ...m, status: newStatus };
      }
      return m;
    }));
  };

  const deleteMethod = (id: string) => {
    setPayMethods(payMethods.filter(m => m.id !== id));
    toast.success(isRTL ? 'تم حذف طريقة الدفع' : 'Payment method deleted');
  };

  const copyCode = async (code: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(code);
      toast.success(isRTL ? 'تم النسخ!' : 'Copied!');
      setTimeout(() => setCopiedCode(''), 2000);
    } else {
      toast.error(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMethods.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredMethods.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'أنواع طرق الدفع' : 'Payment Method Types'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL ? 'إدارة طرق الدفع المتاحة وإعدادتها' : 'Manage available payment methods and their configurations'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info('Export feature')}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg transition-all"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">{isRTL ? 'تصدير' : 'Export'}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-4 sm:px-6 py-3 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>{isRTL ? 'إضافة طريقة دفع' : 'Add Method'}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <CreditCard className="w-8 h-8 text-gray-400" />
              <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white mb-1">{stats.total}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'إجمالي الطرق' : 'Total Methods'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <Power className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-green-400 mb-1">{stats.active}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'نشطة' : 'Active'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Smartphone className="w-8 h-8 text-blue-400" />
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-blue-400 mb-1">{stats.mobileMoney}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'محافظ الموبايل' : 'Mobile Money'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Building2 className="w-8 h-8 text-purple-400" />
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-purple-400 mb-1">{stats.bankTransfer}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-bold text-white">{isRTL ? 'البحث والتصفية' : 'Search & Filter'}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'البحث بالاسم، الكود، المزود...' : 'Search by name, code, provider...'}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            >
              <option value="all">{isRTL ? 'كل الفئات' : 'All Categories'}</option>
              <option value="Mobile Money">{isRTL ? 'محافظ الموبايل' : 'Mobile Money'}</option>
              <option value="Bank Transfer">{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</option>
              <option value="Digital Payment">{isRTL ? 'دفع رقمي' : 'Digital Payment'}</option>
              <option value="Card Payment">{isRTL ? 'بطاقات' : 'Card Payment'}</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            >
              <option value="all">{isRTL ? 'كل الحالات' : 'All Status'}</option>
              <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
              <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
                setFilterStatus('all');
              }}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>{isRTL ? 'إعادة تعيين' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Payment Methods Table (Desktop) */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {isRTL ? 'الشعار' : 'Logo'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {isRTL ? 'الكود' : 'Code'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {isRTL ? 'الاسم' : 'Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {isRTL ? 'الفئة' : 'Category'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {isRTL ? 'المزود' : 'Provider'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {isRTL ? 'الرسوم (%)' : 'Fee (%)'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {currentItems.map((method, idx) => {
                  const CategoryIcon = categoryConfig[method.category].icon;
                  const StatusIcon = statusConfig[method.status].icon;
                  
                  return (
                    <motion.tr
                      key={method.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {method.icon ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 p-1 border border-white/5">
                            <ImageWithFallback src={method.icon} alt={method.name} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-[#0B0F14]" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-bold text-white">{method.code}</code>
                          <button
                            onClick={() => copyCode(method.code)}
                            className="p-1 hover:bg-white/10 rounded transition-all"
                          >
                            {copiedCode === method.code ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-semibold">{method.name}</p>
                          <p className="text-xs text-gray-400">{method.nameAr}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 ${categoryConfig[method.category].bg} ${categoryConfig[method.category].border} border rounded-lg text-xs font-medium ${categoryConfig[method.category].color} flex items-center gap-1 w-fit`}>
                          <CategoryIcon className="w-3 h-3" />
                          {categoryConfig[method.category].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{method.provider}</td>
                      <td className="px-6 py-4 text-[#D4AF37] font-bold">{method.processingFee}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 ${statusConfig[method.status].bg} ${statusConfig[method.status].border} border rounded-lg text-xs font-medium ${statusConfig[method.status].color} flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[method.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleStatus(method.id)}
                            className={`p-2 rounded-lg border transition-all ${
                              method.status === 'active'
                                ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                : 'bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20'
                            }`}
                          >
                            {method.status === 'active' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteMethod(method.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              {isRTL ? 'عرض' : 'Showing'}{' '}
              <span className="font-bold text-white">{indexOfFirstItem + 1}</span>{' '}
              {isRTL ? 'إلى' : 'to'}{' '}
              <span className="font-bold text-white">{Math.min(indexOfLastItem, filteredMethods.length)}</span>{' '}
              {isRTL ? 'من' : 'of'}{' '}
              <span className="font-bold text-white">{filteredMethods.length}</span>{' '}
              {isRTL ? 'طريقة دفع' : 'methods'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  currentPage === 1
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                }`}
              >
                {isRTL ? 'السابق' : 'Previous'}
              </button>
              {getPageNumbers().map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    page === currentPage
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14] font-bold shadow-lg shadow-[#D4AF37]/20'
                      : page === '...'
                      ? 'bg-transparent text-gray-400 cursor-default'
                      : 'bg-white/5 hover:bg-[#D4AF37]/10 border border-white/10 text-white hover:border-[#D4AF37]/30'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  currentPage === totalPages
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                }`}
              >
                {isRTL ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};