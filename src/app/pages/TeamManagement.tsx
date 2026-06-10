import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'super_admin' | 'admin' | 'finance' | 'operations' | 'risk' | 'support' | 'developer' | 'viewer';
  department?: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  joinedAt: string;
  lastActive?: string;
  permissions?: string[];
}

export const TeamManagement = () => {
  const { t } = useTranslation();
  const { language, user } = useStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/users`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch team members');

      const data = await response.json();
      setMembers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast.error(language === 'ar' ? 'فشل تحميل أعضاء الفريق' : 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'super_admin':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'admin':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'finance':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'operations':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'risk':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'developer':
        return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const translateRole = (role: string) => {
    if (language === 'ar') {
      const translations: Record<string, string> = {
        'owner': 'مالك',
        'super_admin': 'مدير متقدم',
        'admin': 'مدير',
        'finance': 'مالية',
        'operations': 'عمليات',
        'risk': 'مخاطر',
        'support': 'دعم',
        'developer': 'مطور',
        'viewer': 'مشاهد'
      };
      return translations[role] || role;
    }
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    inactive: members.filter(m => m.status === 'inactive').length,
    pending: members.filter(m => m.status === 'pending').length,
  };

  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UsersIcon className="w-7 h-7 text-[#D4AF37]" />
            {language === 'ar' ? 'إدارة الفريق' : 'Team Management'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'إدارة أعضاء الفريق والصلاحيات والأدوار'
              : 'Manage team members, permissions and roles'}
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/users/create'}
          className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#C49F27] transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {language === 'ar' ? 'إضافة عضو' : 'Add Member'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                {language === 'ar' ? 'إجمالي الأعضاء' : 'Total Members'}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                {language === 'ar' ? 'نشط' : 'Active'}
              </p>
              <p className="text-2xl font-bold text-green-500 mt-1">
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                {language === 'ar' ? 'غير نشط' : 'Inactive'}
              </p>
              <p className="text-2xl font-bold text-gray-500 mt-1">
                {stats.inactive}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-500/10 rounded-lg flex items-center justify-center">
              <X className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
              </p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              className={`w-full bg-background border border-border rounded-lg ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20`}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="all">{language === 'ar' ? 'كل الأدوار' : 'All Roles'}</option>
            <option value="owner">{translateRole('owner')}</option>
            <option value="super_admin">{translateRole('super_admin')}</option>
            <option value="admin">{translateRole('admin')}</option>
            <option value="finance">{translateRole('finance')}</option>
            <option value="operations">{translateRole('operations')}</option>
            <option value="risk">{translateRole('risk')}</option>
            <option value="developer">{translateRole('developer')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="all">{language === 'ar' ? 'كل الحالات' : 'All Status'}</option>
            <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
            <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
            <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
          </select>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {language === 'ar' ? 'لا يوجد أعضاء' : 'No members found'}
          </div>
        ) : (
          filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C49F27] flex items-center justify-center text-white font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.role)} mt-1`}>
                      <Shield className="w-3 h-3" />
                      {translateRole(member.role)}
                    </span>
                  </div>
                </div>
                <button className="p-1 hover:bg-muted rounded transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.department && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UsersIcon className="w-3 h-3" />
                    <span>{member.department}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(member.status)}`}>
                  {language === 'ar' 
                    ? member.status === 'active' ? 'نشط'
                      : member.status === 'inactive' ? 'غير نشط'
                      : 'قيد الانتظار'
                    : member.status.charAt(0).toUpperCase() + member.status.slice(1)
                  }
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toast.success(language === 'ar' ? 'قريباً' : 'Coming soon')}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title={language === 'ar' ? 'تعديل' : 'Edit'}
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => toast.success(language === 'ar' ? 'قريباً' : 'Coming soon')}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title={language === 'ar' ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
