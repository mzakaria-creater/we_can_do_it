import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Shield,
  Phone,
  Mail,
  Building2,
  CreditCard,
  Landmark,
  Info,
  Sparkles
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string;
  sub_merchant_id?: string;
  sub_merchant_name?: string;
  role_type: string;
  payment_type?: string;
  banks?: string[];
  is_active: boolean;
  created_at: string;
  created_by?: string;
  modified_at?: string;
  modified_by?: string;
}

interface SubMerchant {
  id: string;
  name: string;
}

export const Agents = () => {
  const { language, isAuthenticated } = useStore();
  const isRTL = language === 'ar';

  const [agents, setAgents] = useState<Agent[]>([]);
  const [subMerchants, setSubMerchants] = useState<SubMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    sub_merchant_id: '',
    role_type: 'Operator',
    payment_type: '',
    banks: [] as string[],
    is_active: true
  });

  // Role types
  const roleTypes = [
    { value: 'Operator', label: isRTL ? 'مشغل' : 'Operator' },
    { value: 'Admin', label: isRTL ? 'مدير' : 'Admin' },
    { value: 'Supervisor', label: isRTL ? 'مشرف' : 'Supervisor' },
    { value: 'Agent', label: isRTL ? 'وكيل' : 'Agent' }
  ];

  // Payment types
  const paymentTypes = [
    { value: 'InstaPay', label: 'InstaPay' },
    { value: 'Mobile Wallet', label: 'Mobile Wallet' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Cash', label: 'Cash' }
  ];

  // Banks list
  const banks = [
    { value: 'NBE', label: 'National Bank of Egypt' },
    { value: 'Banque_Misr', label: 'Banque Misr' },
    { value: 'CIB', label: 'Commercial International Bank' },
    { value: 'QNB', label: 'QNB AlAhli' },
    { value: 'Alex_Bank', label: 'Bank of Alexandria' },
    { value: 'AAIB', label: 'Arab African International Bank' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadAgents();
      loadSubMerchants();
    }
  }, [isAuthenticated]);

  const loadAgents = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with actual API call
      const mockAgents: Agent[] = [
        {
          id: '17',
          first_name: 'mz',
          last_name: 'mzakaria',
          username: 'ontarget_user1',
          email: 'minafx2@gmail.com',
          phone: '+201234567890',
          sub_merchant_id: '1',
          sub_merchant_name: 'Main Merchant',
          role_type: 'Operator',
          payment_type: 'InstaPay, Mobile Wallet',
          banks: ['NBE', 'CIB'],
          is_active: true,
          created_at: '13-10-2025 23:44:53',
          created_by: 'Hicham'
        }
      ];
      setAgents(mockAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast.error(isRTL ? 'فشل تحميل الوكلاء' : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const loadSubMerchants = async () => {
    try {
      // Simulated data - replace with actual API call
      const mockSubMerchants: SubMerchant[] = [
        { id: '1', name: 'Main Merchant' },
        { id: '2', name: 'Sub Merchant A' },
        { id: '3', name: 'Sub Merchant B' }
      ];
      setSubMerchants(mockSubMerchants);
    } catch (error) {
      console.error('Error loading sub merchants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get access token first
      const loginResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'admin@press2pay.com',
            password: 'your-password' // Should come from secure storage
          })
        }
      );

      if (!loginResponse.ok) {
        throw new Error('Authentication failed');
      }

      const { access_token } = await loginResponse.json();

      // Create or update agent
      const endpoint = editingAgent
        ? `https://${projectId}.supabase.co/functions/v1/upsert-user`
        : `https://${projectId}.supabase.co/functions/v1/signup`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`
        },
        body: JSON.stringify({
          ...formData,
          id: editingAgent?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save agent');
      }

      toast.success(
        editingAgent
          ? isRTL
            ? 'تم تحديث الوكيل بنجاح'
            : 'Agent updated successfully'
          : isRTL
          ? 'تم إضافة الوكيل بنجاح'
          : 'Agent added successfully'
      );

      setShowModal(false);
      resetForm();
      loadAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
      toast.error(isRTL ? 'فشل حفظ الوكيل' : 'Failed to save agent');
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      first_name: agent.first_name,
      last_name: agent.last_name,
      username: agent.username,
      password: '',
      email: agent.email,
      phone: agent.phone || '',
      sub_merchant_id: agent.sub_merchant_id || '',
      role_type: agent.role_type,
      payment_type: agent.payment_type || '',
      banks: agent.banks || [],
      is_active: agent.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا الوكيل؟' : 'Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      // Implement delete API call
      toast.success(isRTL ? 'تم حذف الوكيل بنجاح' : 'Agent deleted successfully');
      loadAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error(isRTL ? 'فشل حذف الوكيل' : 'Failed to delete agent');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      sub_merchant_id: '',
      role_type: 'Operator',
      payment_type: '',
      banks: [],
      is_active: true
    });
    setEditingAgent(null);
    setShowPassword(false);
  };

  const filteredAgents = agents.filter(agent =>
    agent.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F14] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'قائمة الوكلاء' : 'Agent Operator List'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL
                ? 'إدارة وكلاء النظام ومشغلي الدفع'
                : 'Manage system agents and payment operators'}
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-[#D4AF37]/20"
          >
            <UserPlus className="w-5 h-5" />
            <span>{isRTL ? 'إضافة وكيل جديد' : 'Create Agent Operator'}</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" style={{ left: isRTL ? 'auto' : '1rem', right: isRTL ? '1rem' : 'auto' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isRTL ? 'بحث...' : 'Search...'}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
                style={{ paddingLeft: isRTL ? '1rem' : '3rem', paddingRight: isRTL ? '3rem' : '1rem' }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={loadAgents}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="hidden lg:inline">{isRTL ? 'تحديث' : 'Refresh'}</span>
              </button>

              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg transition-all">
                <Download className="w-5 h-5" />
                <span className="hidden lg:inline">{isRTL ? 'تصدير' : 'Export'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{isRTL ? 'المعرف' : 'ID'}</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{isRTL ? 'الاسم الأول' : 'First Name'}</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{isRTL ? 'الاسم الأخير' : 'Last Name'}</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{isRTL ? 'اسم المستخدم' : 'Username'}</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{isRTL ? 'الدور' : 'Role'}</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{isRTL ? 'الحالة' : 'Active'}</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{isRTL ? 'تاريخ الإنشاء' : 'Created At'}</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{isRTL ? 'تم الإنشاء بواسطة' : 'Created By'}</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="flex items-center justify-center gap-3">
                        <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin" />
                        <span className="text-gray-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Shield className="w-12 h-12 text-gray-600" />
                        <span className="text-gray-400">{isRTL ? 'لا توجد وكلاء' : 'No agents found'}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent, idx) => (
                    <motion.tr
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-all"
                    >
                      <td className="p-4 text-white font-mono">{agent.id}</td>
                      <td className="p-4 text-white">{agent.first_name}</td>
                      <td className="p-4 text-white">{agent.last_name}</td>
                      <td className="p-4 text-white font-mono">{agent.username}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400">
                          {agent.role_type}
                        </span>
                      </td>
                      <td className="p-4">
                        {agent.is_active ? (
                          <span className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">{isRTL ? 'نشط' : 'Active'}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">{isRTL ? 'غير نشط' : 'Inactive'}</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{agent.created_at}</td>
                      <td className="p-4 text-gray-400 text-sm">{agent.created_by}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(agent)}
                            className="p-2 hover:bg-blue-500/10 rounded-lg transition-all text-blue-400"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(agent.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <span className="text-sm text-gray-400">
              {isRTL
                ? `عرض ${filteredAgents.length} من ${agents.length} سجل`
                : `Showing ${filteredAgents.length} of ${agents.length} entries`}
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all">
                {isRTL ? 'السابق' : 'Previous'}
              </button>
              <button className="px-4 py-2 bg-[#D4AF37] text-[#0B0F14] font-bold rounded-lg">
                1
              </button>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all">
                {isRTL ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Agent Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-[#14181D] to-[#1A1F26] border-2 border-[#D4AF37]/30 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl overflow-hidden group/modal"
            >
              {/* Background Shape Effects */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
                
                {/* Decorative Geometric Shapes */}
                <div className="absolute top-12 left-8 w-24 h-24 border border-[#D4AF37]/10 rounded-full -rotate-12 opacity-50" />
                <div className="absolute bottom-24 right-12 w-32 h-32 border border-white/5 rounded-[32px] rotate-45 opacity-30" />
                
                {/* Subtle Grid Pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />
              </div>

              {/* Modal Header */}
              <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <UserPlus className="w-6 h-6 text-[#0B0F14] relative z-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingAgent
                        ? isRTL
                          ? 'تعديل الوكيل'
                          : 'Agent Operator UPDATE'
                        : isRTL
                        ? 'إضافة وكيل جديد'
                        : 'Agent Operator ADD'}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {isRTL ? 'املأ جميع الحقول المطلوبة' : 'Fill in all required fields'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white relative z-10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="relative space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      {isRTL ? 'الاسم الأول' : 'Operator First Name'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="mz"
                      required
                      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      {isRTL ? 'الاسم الأخير' : 'Operator Last Name'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="mzakaria"
                      required
                      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Username & Password */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      {isRTL ? 'اسم المستخدم' : 'User Name'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="ontarget_user1"
                      required
                      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      {isRTL ? 'كلمة المرور' : 'Password'} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group/input">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="MALTIjy51^Bxd%"
                        required={!editingAgent}
                        className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D4AF37] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SubMerchant & Role Type */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#D4AF37]" />
                      {isRTL ? 'التاجر الفرعي' : 'SubMerchant'} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.sub_merchant_id}
                        onChange={(e) => setFormData({ ...formData, sub_merchant_id: e.target.value })}
                        required
                        className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#0B0F14]">None selected</option>
                        {subMerchants.map(sm => (
                          <option key={sm.id} value={sm.id} className="bg-[#0B0F14]">{sm.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      {isRTL ? 'نوع الدور' : 'Role Type'} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role_type}
                        onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
                        required
                        className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all appearance-none cursor-pointer"
                      >
                        {roleTypes.map(rt => (
                          <option key={rt.value} value={rt.value} className="bg-[#0B0F14]">{rt.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                      <Info className="w-3 h-3 text-gray-500" />
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+201234567890"
                      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-400" />
                      {isRTL ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="minafx2@gmail.com"
                      required
                      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Payment Type & Banks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-400" />
                      {isRTL ? 'نوع الدفع' : 'Payment Type'} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.payment_type}
                        onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                        required
                        className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#0B0F14]">InstaPay, Mobile Wallet</option>
                        {paymentTypes.map(pt => (
                          <option key={pt.value} value={pt.value} className="bg-[#0B0F14]">{pt.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-yellow-400" />
                      {isRTL ? 'البنوك' : 'Banks'} <span className="text-red-400">*</span>
                    </label>
                    <select
                      multiple
                      value={formData.banks}
                      onChange={(e) => setFormData({ ...formData, banks: Array.from(e.target.selectedOptions, option => option.value) })}
                      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                      size={3}
                    >
                      <option value="" className="bg-[#0B0F14]">None selected</option>
                      {banks.map(bank => (
                        <option key={bank.value} value={bank.value} className="bg-[#0B0F14]">{bank.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group/active">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#D4AF37] focus:ring-[#D4AF37]/20 transition-all cursor-pointer"
                  />
                  <label htmlFor="is_active" className="text-white font-medium cursor-pointer group-hover/active:text-[#D4AF37] transition-colors">
                    {isRTL ? 'الحساب نشط' : 'Is Active'}
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-white/10">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-[#D4AF37]/30 active:scale-95"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{isRTL ? 'حفظ' : 'Submit'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold px-6 py-3.5 rounded-xl transition-all active:scale-95"
                  >
                    <X className="w-5 h-5" />
                    <span>{isRTL ? 'إلغاء' : 'Close'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
