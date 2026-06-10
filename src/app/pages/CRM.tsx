import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  X,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  MessageSquare,
  FileText,
  Loader2
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { supabase, publicAnonKey } from '../../lib/supabase';
import { projectId } from '../../../utils/supabase/info';

interface CRMEntry {
  id: string;
  clientName: string;
  company: string;
  email: string;
  phone: string;
  transactionType: 'Card' | 'Bank Transfer' | 'Wallet' | 'Crypto';
  status: 'Active' | 'Pending' | 'Inactive';
  lastActivity?: string;
  totalTransactions: number;
  totalValue: number | string;
  avatar?: string;
  country?: string;
  city?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const CRM = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [entries, setEntries] = useState<CRMEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Card' | 'Bank Transfer' | 'Wallet' | 'Crypto'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Pending' | 'Inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CRMEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Generate mock CRM data
  const generateMockData = (): CRMEntry[] => {
    const firstNames = isRTL 
      ? ['أحمد', 'محمد', 'فاطمة', 'عائشة', 'علي', 'سارة', 'عمر', 'مريم']
      : ['Ahmed', 'Mohamed', 'Fatima', 'Aisha', 'Ali', 'Sarah', 'Omar', 'Mariam'];
    const lastNames = isRTL
      ? ['الشرقاوي', 'حسن', 'العمري', 'المصري', 'السعودي', 'الخليلي']
      : ['Al-Sharkawy', 'Hassan', 'Al-Omari', 'Al-Masri', 'Al-Saudi', 'Al-Khalili'];
    const companies = isRTL
      ? ['مجموعة النخبة', 'شركة التقنية', 'مؤسسة الأعمال', 'المتجر الذكي', 'الحلول الرقمية']
      : ['Elite Group', 'Tech Corp', 'Business Hub', 'Smart Store', 'Digital Solutions'];
    const statuses: ('Active' | 'Pending' | 'Inactive')[] = ['Active', 'Pending', 'Inactive'];
    const types: ('Card' | 'Bank Transfer' | 'Wallet' | 'Crypto')[] = ['Card', 'Bank Transfer', 'Wallet', 'Crypto'];

    return Array.from({ length: 25 }, (_, i) => ({
      id: `crm-${i + 1}`,
      clientName: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      company: companies[i % companies.length],
      email: `client${i + 1}@example.com`,
      phone: `+20 ${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      transactionType: types[i % types.length],
      status: statuses[i % statuses.length],
      totalValue: Math.floor(Math.random() * 100000) + 5000,
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      notes: isRTL ? 'عميل مميز' : 'Premium client'
    }));
  };

  // Fetch CRM entries from backend
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      // Create abort controller with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/crm`,
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setEntries(result.data);
          setBackendAvailable(true);
          if (result.data.length > 0) {
            toast.success(isRTL ? `تم تحميل ${result.data.length} عميل` : `Loaded ${result.data.length} clients`);
          }
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching CRM entries:', error);
      setBackendAvailable(false);
      
      // Use mock data as fallback
      const mockData = generateMockData();
      setEntries(mockData);
      toast.info(isRTL ? 'يتم عرض بيانات تجريبية محلية' : 'Showing local demo data');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    Active: { 
      color: 'text-green-400', 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/30', 
      icon: CheckCircle,
      label: isRTL ? 'نشط' : 'Active'
    },
    Pending: { 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/20', 
      border: 'border-yellow-500/30', 
      icon: Clock,
      label: isRTL ? 'قيد الانتظار' : 'Pending'
    },
    Inactive: { 
      color: 'text-gray-400', 
      bg: 'bg-gray-500/20', 
      border: 'border-gray-500/30', 
      icon: AlertCircle,
      label: isRTL ? 'غير نشط' : 'Inactive'
    }
  };

  const typeConfig = {
    Card: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: isRTL ? 'بطاقة' : 'Card' },
    'Bank Transfer': { color: 'text-purple-400', bg: 'bg-purple-500/20', label: isRTL ? 'تحويل بنكي' : 'Bank Transfer' },
    Wallet: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: isRTL ? 'محفظة' : 'Wallet' },
    Crypto: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: isRTL ? 'عملة رقمية' : 'Crypto' }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = 
      entry.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || entry.transactionType === filterType;
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    toast.success(isRTL ? 'تم حذف العميل' : 'Client deleted');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        
        {/* Backend Warning Banner */}
        {!backendAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex items-start gap-4"
          >
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-amber-400 font-bold mb-1">
                {isRTL ? '⚠️ وضع البيانات المحلية' : '⚠️ Local Data Mode'}
              </h3>
              <p className="text-sm text-amber-300/80">
                {isRTL 
                  ? 'لا يمكن الاتصال بالخادم. يتم عرض بيانات تجريبية محلية.' 
                  : 'Unable to connect to server. Showing local demo data.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'نظام CRM' : 'CRM System'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL ? 'إدارة علاقات العملاء والتفاعلات' : 'Manage customer relationships and interactions'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEntries}
              disabled={loading}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRTL ? 'تحديث' : 'Refresh'}</span>
            </button>
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
              <span>{isRTL ? 'إضافة عميل' : 'Add Client'}</span>
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
              <Users className="w-8 h-8 text-gray-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white mb-1">{entries.length}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'إجمالي العملاء' : 'Total Clients'}</p>
            <p className="text-xs text-green-400 mt-2">+12% {isRTL ? 'هذا الشهر' : 'this month'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-green-400 mb-1">{entries.filter(e => e.status === 'Active').length}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'عملاء نشطون' : 'Active Clients'}</p>
            <p className="text-xs text-gray-500 mt-2">
              {entries.length > 0 ? `${((entries.filter(e => e.status === 'Active').length / entries.length) * 100).toFixed(1)}%` : '0%'} {isRTL ? 'معدل النشاط' : 'active rate'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-blue-400 mb-1">
              {entries.reduce((sum, e) => sum + (typeof e.totalValue === 'number' ? e.totalValue : 0), 0).toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'القيمة الإجمالية' : 'Total Value'}</p>
            <p className="text-xs text-blue-400 mt-2">+8.5% {isRTL ? 'هذا الشهر' : 'this month'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#14181D]/40 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-yellow-400 mb-1">{entries.filter(e => e.status === 'Pending').length}</p>
            <p className="text-xs sm:text-sm text-gray-400">{isRTL ? 'متابعات معلقة' : 'Pending Follow-ups'}</p>
            <p className="text-xs text-yellow-400 mt-2">{isRTL ? 'تحتاج اهتمام' : 'Requires attention'}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-bold text-white">{isRTL ? 'البحث والتصفية' : 'Search & Filter'}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'البحث بالاسم، الشركة، البريد...' : 'Search by name, company, email...'}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            >
              <option value="all">{isRTL ? 'كل الأنواع' : 'All Types'}</option>
              <option value="Card">{isRTL ? 'بطاقة' : 'Card'}</option>
              <option value="Bank Transfer">{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</option>
              <option value="Wallet">{isRTL ? 'محفظة' : 'Wallet'}</option>
              <option value="Crypto">{isRTL ? 'عملة رقمية' : 'Crypto'}</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            >
              <option value="all">{isRTL ? 'كل الحالات' : 'All Status'}</option>
              <option value="Active">{isRTL ? 'نشط' : 'Active'}</option>
              <option value="Pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="Inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>{isRTL ? 'إعادة تعيين' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* CRM Entries */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-white/10">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {isRTL ? 'سجلات العملاء' : 'Client Entries'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isRTL ? 'عرض' : 'Showing'} {filteredEntries.length} {isRTL ? 'من' : 'of'} {entries.length} {isRTL ? 'عميل' : 'clients'}
            </p>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" />
                <p className="text-gray-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
              </div>
            ) : currentEntries.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">
                  {isRTL ? 'لا توجد بيانات' : 'No Data Available'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {isRTL ? 'لم يتم العثور على أي عملاء' : 'No clients found'}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>{isRTL ? 'إضافة عميل جديد' : 'Add New Client'}</span>
                </button>
              </div>
            ) : (
              currentEntries.map((entry, idx) => {
                const StatusIcon = statusConfig[entry.status].icon;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#0B0F14] font-bold">{getInitials(entry.clientName)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold truncate">{entry.clientName}</h3>
                          <p className="text-xs text-gray-500">{entry.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300">{entry.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300 truncate">{entry.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300">{entry.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 ${statusConfig[entry.status].bg} ${statusConfig[entry.status].border} border rounded-lg text-xs font-medium ${statusConfig[entry.status].color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[entry.status].label}
                      </span>
                      <span className={`px-2 py-1 ${typeConfig[entry.transactionType].bg} rounded-lg text-xs font-medium ${typeConfig[entry.transactionType].color}`}>
                        {typeConfig[entry.transactionType].label}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">{isRTL ? 'المعاملات' : 'Transactions'}</p>
                        <p className="text-white font-bold">{entry.totalTransactions}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{isRTL ? 'القيمة' : 'Value'}</p>
                        <p className="text-[#D4AF37] font-bold">{entry.totalValue}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" />
                <p className="text-gray-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
              </div>
            ) : currentEntries.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">
                  {isRTL ? 'لا توجد بيانات' : 'No Data Available'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {isRTL ? 'لم يتم العثور على أي عملاء' : 'No clients found'}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>{isRTL ? 'إضافة عميل جديد' : 'Add New Client'}</span>
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'العميل' : 'Client'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'الشركة' : 'Company'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'التواصل' : 'Contact'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'النوع' : 'Type'}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'المعاملات' : 'Transactions'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'القيمة' : 'Value'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {isRTL ? 'آخر تفاعل' : 'Last Interaction'}
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
                  {currentEntries.map((entry, idx) => {
                    const StatusIcon = statusConfig[entry.status].icon;
                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-[#0B0F14] font-bold text-sm">{getInitials(entry.clientName)}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{entry.clientName}</p>
                              <p className="text-xs text-gray-500">{entry.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-300">{entry.company}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-300">{entry.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-300">{entry.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 ${typeConfig[entry.transactionType].bg} rounded-lg text-xs font-medium ${typeConfig[entry.transactionType].color}`}>
                            {typeConfig[entry.transactionType].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-white font-bold">{entry.totalTransactions}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[#D4AF37] font-bold">{entry.totalValue}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {entry.lastActivity}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 ${statusConfig[entry.status].bg} ${statusConfig[entry.status].border} border rounded-lg text-xs font-medium ${statusConfig[entry.status].color} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[entry.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedEntry(entry)}
                              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toast.info('Edit feature')}
                              className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteEntry(entry.id)}
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
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredEntries.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                {isRTL ? 'عرض' : 'Showing'} {startIndex + 1}-{Math.min(endIndex, filteredEntries.length)} {isRTL ? 'من' : 'of'} {filteredEntries.length} {isRTL ? 'عميل' : 'clients'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
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
                  onClick={handleNextPage}
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
          )}
        </div>

        {/* Add Modal Placeholder */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#14181D] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {isRTL ? 'إضافة عميل جديد' : 'Add New Client'}
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {isRTL ? 'نموذج الإضافة قيد التطوير...' : 'Add form coming soon...'}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedEntry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedEntry(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#14181D] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {isRTL ? 'تفاصيل العميل' : 'Client Details'}
                  </h2>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-full flex items-center justify-center">
                      <span className="text-[#0B0F14] font-bold text-xl">{getInitials(selectedEntry.clientName)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedEntry.clientName}</h3>
                      <p className="text-sm text-gray-400">{selectedEntry.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 bg-white/5 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'الشركة' : 'Company'}</p>
                      <p className="text-white font-medium">{selectedEntry.company}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                      <p className="text-white font-medium text-sm">{selectedEntry.email}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'الهاتف' : 'Phone'}</p>
                      <p className="text-white font-medium">{selectedEntry.phone}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'نوع المعاملة' : 'Transaction Type'}</p>
                      <span className={`inline-block px-2 py-1 ${typeConfig[selectedEntry.transactionType].bg} rounded-lg text-xs font-medium ${typeConfig[selectedEntry.transactionType].color} mt-1`}>
                        {typeConfig[selectedEntry.transactionType].label}
                      </span>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">{isRTL ? 'الحالة' : 'Status'}</p>
                      <span className={`inline-block px-2 py-1 ${statusConfig[selectedEntry.status].bg} ${statusConfig[selectedEntry.status].border} border rounded-lg text-xs font-medium ${statusConfig[selectedEntry.status].color} mt-1`}>
                        {statusConfig[selectedEntry.status].label}
                      </span>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-xs text-blue-400 mb-1">{isRTL ? 'إجمالي المعاملات' : 'Total Transactions'}</p>
                      <p className="text-white font-bold text-xl">{selectedEntry.totalTransactions}</p>
                    </div>

                    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-4">
                      <p className="text-xs text-[#D4AF37] mb-1">{isRTL ? 'القيمة الإجمالية' : 'Total Value'}</p>
                      <p className="text-white font-bold text-xl">{selectedEntry.totalValue}</p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      onClick={() => {
                        toast.info('Edit feature');
                        setSelectedEntry(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-lg transition-all"
                    >
                      <Edit className="w-5 h-5" />
                      <span>{isRTL ? 'تعديل' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => {
                        toast.info('Message feature');
                        setSelectedEntry(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg transition-all"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{isRTL ? 'رسالة' : 'Message'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};