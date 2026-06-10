import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLoaderData } from 'react-router';
import { Users as UsersIcon, Plus, Edit, Trash2, Search, Shield, Mail, Phone, User, Camera, X, Check, AlertCircle, Crown, Lock, Unlock, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey, projectId } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  role: 'owner' | 'super_admin' | 'admin' | 'operations' | 'finance' | 'risk' | 'support' | 'developer';
  status: 'active' | 'suspended' | 'pending';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

const ROLES = [
  { value: 'owner', label: 'Owner', icon: '👑', color: 'text-amber-500', bgColor: 'bg-amber-500/10', description: 'Full system access' },
  { value: 'super_admin', label: 'Super Admin', icon: '⚡', color: 'text-purple-500', bgColor: 'bg-purple-500/10', description: 'Administrative access' },
  { value: 'admin', label: 'Admin', icon: '🛡️', color: 'text-blue-500', bgColor: 'bg-blue-500/10', description: 'Admin operations' },
  { value: 'operations', label: 'Operations', icon: '⚙️', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', description: 'Operations management' },
  { value: 'finance', label: 'Finance', icon: '💰', color: 'text-green-500', bgColor: 'bg-green-500/10', description: 'Financial operations' },
  { value: 'risk', label: 'Risk & AML', icon: '🔍', color: 'text-orange-500', bgColor: 'bg-orange-500/10', description: 'Risk assessment' },
  { value: 'support', label: 'Support', icon: '🎧', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', description: 'Customer support' },
  { value: 'developer', label: 'Developer', icon: '💻', color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', description: 'Technical access' },
];

import { PageHeader } from '../components/PageHeader';
import { LuxuryCard, LuxuryStatCard } from '../components/LuxuryCard';

export const Users = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loaderData = useLoaderData() as any;
  const { language, user: currentUser } = useStore();
  const isRTL = language === 'ar';

  const [users, setUsers] = useState<User[]>(loaderData?.usersData?.users || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    phone: '',
    password: '',
    role: 'admin' as User['role'],
    status: 'active' as User['status'],
    avatar: '',
  });

  // Sync state with loader data
  useEffect(() => {
    if (loaderData?.usersData?.users) {
      setUsers(loaderData.usersData.users);
    }
  }, [loaderData]);

  const fetchUsers = async () => {
    navigate('.', { replace: true });
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      name: '',
      username: '',
      phone: '',
      password: '',
      role: 'admin',
      status: 'active',
      avatar: '',
    });
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      username: user.username || '',
      phone: user.phone || '',
      password: '',
      role: user.role,
      status: user.status,
      avatar: user.avatar || '',
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isRTL ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(isRTL ? 'يرجى اختيار صورة صالحة' : 'Please select a valid image');
      return;
    }

    try {
      setUploadingImage(true);

      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);

      toast.success(isRTL ? 'تم تحميل الصورة' : 'Image uploaded');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(isRTL ? 'فشل تحميل الصورة' : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get session - fallback to anon key if no session exists
      const { data: { session } } = await supabase.auth.getSession();
      
      // Use session token if available, otherwise use anon key
      const authHeader = session 
        ? `Bearer ${session.access_token}` 
        : `Bearer ${publicAnonKey}`;

      console.log('[Users] Auth method:', session ? 'Session Token' : 'Anon Key');
      console.log('[Users] Project ID:', projectId);
      console.log('[Users] Has Auth Header:', !!authHeader);

      const endpoint = editingUser
        ? `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/users/${editingUser.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/users`;

      console.log('[Users] Endpoint:', endpoint);

      const method = editingUser ? 'PUT' : 'POST';

      const payload: any = {
        email: formData.email,
        name: formData.name,
        username: formData.username,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        avatar: formData.avatar,
      };

      // Only include password for new users or if changed
      if (!editingUser || formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[Users] Response status:', response.status);

      const result = await response.json();

      if (!response.ok) {
        console.error('[Users] Error response:', result);
        
        // Special handling for duplicate email
        if (response.status === 409 && result.existingUserId) {
          // Reload users to ensure we have the latest data
          await fetchUsers();
          
          const shouldUpdate = confirm(
            isRTL 
              ? `المستخدم بالبري ${formData.email} موجود بالفعل.\n\nهل تريد تحديث المستخدم الموجود بدلاً من ذلك؟`
              : `User with email ${formData.email} already exists.\n\nWould you like to update the existing user instead?`
          );
          
          if (shouldUpdate) {
            // Find the existing user and open edit modal
            const existingUser = users.find(u => u.id === result.existingUserId || u.email === formData.email);
            if (existingUser) {
              handleEditUser(existingUser);
              toast.info(
                isRTL 
                  ? 'تم فتح نافذة تعديل المستخدم الموجود'
                  : 'Opening edit modal for existing user'
              );
              return; // Don't throw error
            } else {
              // Retry after fetching
              const allUsers = await (await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/users`,
                {
                  headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                  },
                }
              )).json();
              
              const foundUser = (allUsers.data || []).find((u: any) => u.id === result.existingUserId || u.email === formData.email);
              if (foundUser) {
                handleEditUser(foundUser);
                toast.info(
                  isRTL 
                    ? 'تم فتح نافذة تعديل المستخدم الموجود'
                    : 'Opening edit modal for existing user'
                );
                return;
              }
            }
          }
          
          const message = isRTL 
            ? `المستخدم بالبريد ${formData.email} موجود بالفعل. يرجى استخدام زر التعديل.`
            : `User with email ${formData.email} already exists. Please use the edit button instead.`;
          throw new Error(message);
        }
        
        throw new Error(result.error || 'Failed to save user');
      }

      toast.success(
        editingUser
          ? (isRTL ? `تم تحديث المستخدم ${formData.name} بنجاح` : `User ${formData.name} updated successfully`)
          : (isRTL ? `تم إنشاء المستخدم ${formData.name} بنجح` : `User ${formData.name} created successfully`)
      );

      setShowModal(false);
      fetchUsers();

      console.log('✅ User saved:', result.user);
    } catch (error: any) {
      console.error('❌ Error saving user:', error);
      toast.error(error.message || (isRTL ? 'فشل حفظ المستخدم' : 'Failed to save user'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success(isRTL ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(isRTL ? 'فشل حذف المستخدم' : 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/users/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(
        newStatus === 'active'
          ? (isRTL ? 'تم تفعيل المستخدم' : 'User activated')
          : (isRTL ? 'تم تعليق المستخدم' : 'User suspended')
      );
      fetchUsers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(isRTL ? 'فشل تحديث الحالة' : 'Failed to update status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleInfo = (role: string) => {
    return ROLES.find(r => r.value === role) || ROLES[2];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'suspended': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Backend Status Alert */}
      {users.length > 0 && users[0]?.id?.startsWith('demo-') && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-bold text-amber-500 mb-1">
              {isRTL ? '⚠️ وضع التجريبي' : '⚠️ Demo Mode'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'تعذر الاتصال بالـ Backend. يتم عرض بيانات تجريبية محلية. لتفعيل جميع الميزات، تأكد من تشغيل Supabase Edge Functions.'
                : 'Backend unavailable. Showing local demo data. To activate all features, make sure Supabase Edge Functions are deployed.'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <PageHeader 
        title={isRTL ? 'إدارة المستخدمين' : 'User Management'}
        description={isRTL ? 'إنشاء وإدارة حسابات المستخدمين والصلاحيات والوصول إلى النظام.' : 'Create and manage user accounts, roles, and system access permissions.'}
        icon={UsersIcon}
        actions={
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus size={20} />
            {isRTL ? 'إضافة مستخدم' : 'Add User'}
          </button>
        }
      />

      {/* Filters */}
      <LuxuryCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground`} size={20} />
            <input
              type="text"
              placeholder={isRTL ? 'بحث عن مستخدم...' : 'Search users...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">{isRTL ? 'جميع الأدوار' : 'All Roles'}</option>
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>
                {role.icon} {role.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
            <option value="suspended">{isRTL ? 'معلق' : 'Suspended'}</option>
            <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
          </select>
        </div>
      </LuxuryCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LuxuryStatCard 
          title={isRTL ? 'إجمالي المستخدمين' : 'Total Users'}
          value={users.length}
          icon={User}
        />
        <LuxuryStatCard 
          title={isRTL ? 'نشط' : 'Active'}
          value={users.filter(u => u.status === 'active').length}
          icon={Check}
          trend="up"
        />
        <LuxuryStatCard 
          title={isRTL ? 'معلق' : 'Suspended'}
          value={users.filter(u => u.status === 'suspended').length}
          icon={Lock}
          trend="down"
        />
        <LuxuryStatCard 
          title={isRTL ? 'قيد الانتظار' : 'Pending'}
          value={users.filter(u => u.status === 'pending').length}
          icon={Clock}
        />
      </div>


      {/* Users Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground mt-4">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <UsersIcon size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{isRTL ? 'لا توجد مستخدمين' : 'No users found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => {
            const roleInfo = getRoleInfo(user.role);
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                {/* Avatar & Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20">
                        <User className="text-primary" size={28} />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card ${
                      user.status === 'active' ? 'bg-emerald-500' : user.status === 'suspended' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                  </div>

                  <button
                    onClick={() => handleToggleStatus(user)}
                    className={`p-2 rounded-lg transition-all ${
                      user.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    }`}
                    title={user.status === 'active' ? 'Suspend' : 'Activate'}
                  >
                    {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                </div>

                {/* User Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground mb-1">{user.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                  {user.username && (
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  )}
                </div>

                {/* Role Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold mb-4 ${roleInfo.bgColor} ${roleInfo.color}`}>
                  <span>{roleInfo.icon}</span>
                  <span>{roleInfo.label}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all text-sm"
                  >
                    <Edit size={14} />
                    {isRTL ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-bold hover:bg-destructive/20 transition-all text-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit User Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {editingUser ? <Edit className="text-primary" /> : <Plus className="text-primary" />}
                  {editingUser
                    ? (isRTL ? 'تعديل المستخدم' : 'Edit User')
                    : (isRTL ? 'إضافة مستخدم جديد' : 'Add New User')}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-primary/20">
                        <User className="text-primary" size={40} />
                      </div>
                    )}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg"
                    >
                      <Camera size={16} />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {uploadingImage && (
                    <div className="text-sm text-muted-foreground">{isRTL ? 'جاري التحميل...' : 'Uploading...'}</div>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">{isRTL ? 'الاسم الكامل' : 'Full Name'} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={isRTL ? 'أدخل الاسم الكامل' : 'Enter full name'}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">{isRTL ? 'البريد الإلكتروني' : 'Email'} *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={isRTL ? 'user@press2pay.com' : 'user@press2pay.com'}
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">{isRTL ? 'اسم المستخدم' : 'Username'}</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={isRTL ? 'اسم المستخدم' : 'username'}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">{isRTL ? 'رقم الهاتف' : 'Phone Number'}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={isRTL ? '+966xxxxxxxxx' : '+966xxxxxxxxx'}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">
                    {isRTL ? 'كلمة المرور' : 'Password'} {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={editingUser ? (isRTL ? 'اتركها فارغة للإبقاء على الحالية' : 'Leave empty to keep current') : '••••••••'}
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">{isRTL ? 'الدور' : 'Role'} *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map(role => (
                      <label
                        key={role.value}
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.role === role.value
                            ? `${role.bgColor} ${role.color} border-current`
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                          className="hidden"
                        />
                        <span className="text-2xl">{role.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-sm">{role.label}</div>
                          <div className="text-xs opacity-70">{role.description}</div>
                        </div>
                        {formData.role === role.value && <Check size={20} />}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">{isRTL ? 'الحالة' : 'Status'} *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                    <option value="suspended">{isRTL ? 'معلق' : 'Suspended'}</option>
                    <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
                  >
                    {editingUser ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إنشاء' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Default export for lazy loading
export default Users;