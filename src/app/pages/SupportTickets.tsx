import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ticket, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  User, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Download,
  RefreshCw,
  Send,
  Loader2
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { supabase, publicAnonKey } from '../../lib/supabase';
import { projectId } from '../../../utils/supabase/info';

interface SupportTicket {
  id: string;
  subject: string;
  customer: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'high' | 'medium' | 'low';
  date: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SupportTickets = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  // State
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch tickets from backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/tickets/tickets`,
          {
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
            },
          }
        );

        const result = await response.json();
        console.log('Tickets response:', result);
        
        if (result.success && result.data) {
          const formattedTickets = result.data.map((ticket: any) => ({
            id: ticket.id || ticket.ticketId || `TKT-${Date.now()}`,
            subject: ticket.subject || ticket.title || 'No Subject',
            customer: ticket.customerName || ticket.customer || 'Unknown',
            status: ticket.status || 'open',
            priority: ticket.priority || 'medium',
            date: ticket.createdAt ? new Date(ticket.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: ticket.description || ticket.message || 'No description',
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt
          }));
          setAllTickets(formattedTickets);
        } else {
          // Empty state - no error
          setAllTickets([]);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error(isRTL ? 'فشل في تحميل التذاكر' : 'Failed to load tickets');
        setAllTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isRTL]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return allTickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = useMemo(() => filteredTickets.slice(startIndex, endIndex), [filteredTickets, startIndex, endIndex]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Generate page numbers array
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'closed': return 'bg-green-500/10 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const stats = [
    { label: isRTL ? 'تذاكر مفتوحة' : 'Open Tickets', value: allTickets.filter(t => t.status === 'open').length, icon: AlertCircle, color: 'red' },
    { label: isRTL ? 'قيد المعالجة' : 'Pending', value: allTickets.filter(t => t.status === 'pending').length, icon: Clock, color: 'yellow' },
    { label: isRTL ? 'تم حلها' : 'Resolved', value: allTickets.filter(t => t.status === 'closed').length, icon: CheckCircle2, color: 'green' },
    { label: isRTL ? 'متوسط الرد' : 'Avg Response', value: '2h', icon: MessageCircle, color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F14] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              {isRTL ? 'تذاكر الدعم' : 'Support Tickets'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL ? 'إدارة استفسارات العملاء والمشاكل التقنية' : 'Manage customer inquiries and technical issues'}
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-all border border-white/10">
              <Download className="w-5 h-5" />
              <span>{isRTL ? 'تصدير' : 'Export'}</span>
            </button>
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-all border border-white/10">
              <RefreshCw className="w-5 h-5" />
              <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
            </button>
            <button className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-[#D4AF37]/20">
              <Plus className="w-5 h-5" />
              <span>{isRTL ? 'تذكرة جديدة' : 'New Ticket'}</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${
                stat.color === 'red' ? 'from-red-500/20 to-red-600/20 border-red-500/30' :
                stat.color === 'yellow' ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' :
                stat.color === 'green' ? 'from-green-500/20 to-green-600/20 border-green-500/30' :
                'from-blue-500/20 to-blue-600/20 border-blue-500/30'
              } border rounded-xl p-6 flex items-center gap-4`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'red' ? 'bg-red-500/20' :
                stat.color === 'yellow' ? 'bg-yellow-500/20' :
                stat.color === 'green' ? 'bg-green-500/20' :
                'bg-blue-500/20'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'red' ? 'text-red-400' :
                  stat.color === 'yellow' ? 'text-yellow-400' :
                  stat.color === 'green' ? 'text-green-400' :
                  'text-blue-400'
                }`} />
              </div>
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" style={{ left: isRTL ? 'auto' : '0.75rem', right: isRTL ? '0.75rem' : 'auto' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'بحث في التذاكر...' : 'Search tickets...'}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                style={{ paddingLeft: isRTL ? '1rem' : '2.5rem', paddingRight: isRTL ? '2.5rem' : '1rem' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            >
              <option value="all">{isRTL ? 'كل الحالات' : 'All Status'}</option>
              <option value="open">{isRTL ? 'مفتوح' : 'Open'}</option>
              <option value="pending">{isRTL ? 'قيد المعالجة' : 'Pending'}</option>
              <option value="closed">{isRTL ? 'مغلق' : 'Closed'}</option>
            </select>

            <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-all border border-white/10">
              <Filter className="w-5 h-5" />
              <span>{isRTL ? 'فلاتر متقدمة' : 'Advanced Filters'}</span>
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
            </div>
          ) : currentTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Ticket className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">
                  {isRTL ? 'لا توجد تذاكر' : 'No Tickets Found'}
                </h3>
                <p className="text-gray-500">
                  {isRTL ? 'لم يتم العثور على أي تذاكر دعم حتى الآن' : 'No support tickets have been created yet'}
                </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0B0F14]/60">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'رقم التذكرة' : 'Ticket ID'}</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'الموضوع' : 'Subject'}</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'العميل' : 'Customer'}</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'الحالة' : 'Status'}</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'الأولوية' : 'Priority'}</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'التاريخ' : 'Date'}</th>
                      <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTickets.map((ticket, idx) => (
                      <motion.tr
                        key={ticket.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedTicket(ticket.id)}
                      >
                        <td className="px-6 py-4 font-mono text-sm text-gray-300">{ticket.id}</td>
                        <td className="px-6 py-4 font-semibold text-white">{ticket.subject}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-300">{ticket.customer}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold uppercase ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{ticket.date}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-[#0B0F14]/60 border-t border-white/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Results Info */}
                  <div className="text-sm text-gray-400">
                    {isRTL ? (
                      <>
                        عرض <span className="font-bold text-white">{startIndex + 1}</span> إلى{' '}
                        <span className="font-bold text-white">{Math.min(endIndex, filteredTickets.length)}</span> من{' '}
                        <span className="font-bold text-white">{filteredTickets.length}</span> نتيجة
                      </>
                    ) : (
                      <>
                        Showing <span className="font-bold text-white">{startIndex + 1}</span> to{' '}
                        <span className="font-bold text-white">{Math.min(endIndex, filteredTickets.length)}</span> of{' '}
                        <span className="font-bold text-white">{filteredTickets.length}</span> results
                      </>
                    )}
                  </div>

                  {/* Items Per Page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {isRTL ? 'عرض' : 'Show'}:
                    </span>
                    <select
                      className="px-3 py-2 bg-[#0B0F14] border border-white/10 rounded-lg text-sm text-white focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-400">
                      {isRTL ? 'لكل صفحة' : 'per page'}
                    </span>
                  </div>

                  {/* Page Navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                        currentPage === 1
                          ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                          : 'bg-white/5 border border-white/10 text-white hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/30'
                      }`}
                    >
                      {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                      <span className="hidden sm:inline">{isRTL ? 'السابق' : 'Previous'}</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-1">
                      {getPageNumbers().map((page, idx) => (
                        <button
                          key={idx}
                          onClick={() => typeof page === 'number' && handlePageChange(page)}
                          disabled={page === '...'}
                          className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14] shadow-lg shadow-[#D4AF37]/20'
                              : page === '...'
                              ? 'bg-transparent text-gray-400 cursor-default'
                              : 'bg-white/5 border border-white/10 text-white hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <div className="sm:hidden px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white">
                      {currentPage} / {totalPages}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                        currentPage === totalPages
                          ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                          : 'bg-white/5 border border-white/10 text-white hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/30'
                      }`}
                    >
                      <span className="hidden sm:inline">{isRTL ? 'التالي' : 'Next'}</span>
                      {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedTicket(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl bg-[#14181D] border border-white/10 rounded-2xl shadow-2xl z-51 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {(() => {
                const ticket = allTickets.find(t => t.id === selectedTicket);
                if (!ticket) return null;

                return (
                  <>
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-white" />
                          </div>
                          {isRTL ? 'تفاصيل التذكرة' : 'Ticket Details'}
                        </h2>
                        <button
                          className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
                          onClick={() => setSelectedTicket(null)}
                        >
                          <X className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#0B0F14]/60 rounded-lg">
                          <label className="text-xs text-gray-400 uppercase font-bold">{isRTL ? 'رقم التذكرة' : 'Ticket ID'}</label>
                          <p className="text-sm font-mono text-white mt-1">{ticket.id}</p>
                        </div>
                        <div className="p-4 bg-[#0B0F14]/60 rounded-lg">
                          <label className="text-xs text-gray-400 uppercase font-bold">{isRTL ? 'الحالة' : 'Status'}</label>
                          <p className="mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-[#0B0F14]/60 rounded-lg">
                        <label className="text-xs text-gray-400 uppercase font-bold">{isRTL ? 'الموضوع' : 'Subject'}</label>
                        <p className="text-sm text-white mt-1">{ticket.subject}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#0B0F14]/60 rounded-lg">
                          <label className="text-xs text-gray-400 uppercase font-bold">{isRTL ? 'العميل' : 'Customer'}</label>
                          <p className="text-sm text-white mt-1">{ticket.customer}</p>
                        </div>
                        <div className="p-4 bg-[#0B0F14]/60 rounded-lg">
                          <label className="text-xs text-gray-400 uppercase font-bold">{isRTL ? 'الأولوية' : 'Priority'}</label>
                          <p className={`text-sm mt-1 font-bold uppercase ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-[#0B0F14]/60 rounded-lg">
                        <label className="text-xs text-gray-400 uppercase font-bold">{isRTL ? 'التاريخ' : 'Date'}</label>
                        <p className="text-sm text-white mt-1">{ticket.date}</p>
                      </div>

                      <div className="p-4 bg-[#0B0F14]/60 rounded-lg">
                        <label className="text-xs text-gray-400 uppercase font-bold">{isRTL ? 'الوصف' : 'Description'}</label>
                        <p className="text-sm text-gray-300 mt-2 leading-relaxed">{ticket.description}</p>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all">
                          <Send className="w-5 h-5" />
                          <span>{isRTL ? 'إرسال رد' : 'Send Reply'}</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-lg transition-all">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>{isRTL ? 'إغلاق' : 'Close'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};