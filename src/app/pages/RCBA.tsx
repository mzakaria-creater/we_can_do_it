import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Search, 
  Filter, 
  Save, 
  ChevronDown, 
  ChevronRight,
  Lock,
  Unlock,
  Check,
  X,
  Users,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  AlertCircle,
  Crown,
  Star,
  Sparkles,
  Settings,
  RefreshCw,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey, projectId } from '../../lib/supabase';
import { toast } from 'sonner';

interface BackendRole {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  permissions: string[];
  status: 'active' | 'inactive';
  isSystem: boolean;
  createdAt: string;
}

interface BackendPermission {
  id: string;
  name: string;
  nameAr: string;
  resource: string;
  action: string;
  description: string;
}

export const RCBAPage = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  const [roles, setRoles] = useState<BackendRole[]>([]);
  const [permissionsList, setPermissionsList] = useState<BackendPermission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsLoadingSaving] = useState(false);
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set(['*']));

  const fetchRolesAndPermissions = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b`;

      const [rolesRes, permsRes] = await Promise.all([
        fetch(`${baseUrl}/roles`, { headers: { 'Authorization': authHeader } }),
        fetch(`${baseUrl}/roles/permissions/list`, { headers: { 'Authorization': authHeader } })
      ]);

      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();

      if (rolesData.success) {
        setRoles(rolesData.data);
        if (rolesData.data.length > 0 && !selectedRoleId) {
          setSelectedRoleId(rolesData.data[0].id);
        }
      }
      if (permsData.success) {
        setPermissionsList(permsData.data);
      }
    } catch (error) {
      console.error('Error fetching RBAC data:', error);
      toast.error(isRTL ? 'فشل في تحميل البيانات' : 'Failed to load RBAC data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const selectedRole = useMemo(() => 
    roles.find(r => r.id === selectedRoleId), 
  [roles, selectedRoleId]);

  const togglePermission = (permissionId: string) => {
    if (!selectedRole || selectedRole.isSystem) return;

    const newPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(p => p !== permissionId)
      : [...selectedRole.permissions, permissionId];

    // Update locally first for UI responsiveness
    setRoles(prev => prev.map(r => 
      r.id === selectedRoleId ? { ...r, permissions: newPermissions } : r
    ));
  };

  const handleSave = async () => {
    if (!selectedRole || selectedRole.isSystem) return;

    try {
      setIsLoadingSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/roles/${selectedRoleId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissions: selectedRole.permissions
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(isRTL ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(isRTL ? 'فشل في حفظ التغييرات' : `Failed to save: ${error.message}`);
    } finally {
      setIsLoadingSaving(false);
    }
  };

  const groupedPermissions = useMemo(() => {
    const filtered = permissionsList.filter(p => {
      const name = isRTL ? p.nameAr : p.name;
      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.resource.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isEnabled = selectedRole?.permissions.includes(p.id) || selectedRole?.permissions.includes('*');
      const matchesFilter = showOnlyEnabled ? isEnabled : true;
      
      return matchesSearch && matchesFilter;
    });

    return filtered.reduce((acc, perm) => {
      if (!acc[perm.resource]) acc[perm.resource] = [];
      acc[perm.resource].push(perm);
      return acc;
    }, {} as Record<string, BackendPermission[]>);
  }, [permissionsList, searchTerm, showOnlyEnabled, selectedRole, isRTL]);

  const stats = useMemo(() => {
    const total = permissionsList.length;
    const enabled = selectedRole?.permissions.includes('*') 
      ? total 
      : (selectedRole?.permissions.length || 0);
    const pages = Object.keys(groupedPermissions).length;
    
    return { total, enabled, disabled: total - enabled, pages };
  }, [permissionsList, groupedPermissions, selectedRole]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
        <p className="text-[#D4AF37] font-bold animate-pulse">
          {isRTL ? 'جاري تحميل الصلاحيات...' : 'Loading permissions...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1800px] mx-auto space-y-4 sm:space-y-6">
        
        {/* Luxury Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#14181D]/90 via-[#1A1F26]/90 to-[#14181D]/90 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8">
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#D4AF37]/30">
                <Shield className="w-8 h-8 text-[#0B0F14]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 flex items-center gap-3">
                  {isRTL ? 'التحكم بالصلاحيات' : 'Role-Based Access Control'}
                  <Sparkles className="w-6 h-6 text-[#D4AF37] animate-pulse" />
                </h1>
                <p className="text-gray-400 text-sm">
                  {isRTL ? 'إدارة صلاحيات الأدوار في النظام' : 'Manage system role permissions'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                {isRTL ? 'الدور:' : 'Role:'}
              </label>
              <div className="relative">
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="appearance-none bg-[#0B0F14]/80 backdrop-blur-md border-2 border-[#D4AF37]/30 rounded-xl px-6 py-3 pr-12 text-white text-sm font-bold focus:border-[#D4AF37] outline-none min-w-[220px] cursor-pointer transition-all"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{isRTL ? role.nameAr : role.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Luxury Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group overflow-hidden bg-gradient-to-br from-[#14181D]/60 to-[#1A1F26]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6 hover:border-[#D4AF37]/30 transition-all"
          >
            <div className="relative">
              <p className="text-2xl sm:text-3xl font-black text-white mb-1">{stats.total}</p>
              <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wide">
                {isRTL ? 'إجمالي الصلاحيات' : 'Total Permissions'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group overflow-hidden bg-gradient-to-br from-[#14181D]/60 to-[#1A1F26]/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 sm:p-6 hover:border-green-500/50 transition-all"
          >
            <div className="relative">
              <p className="text-2xl sm:text-3xl font-black text-green-400 mb-1">{stats.enabled}</p>
              <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wide">
                {isRTL ? 'مُفعّل' : 'Enabled'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group overflow-hidden bg-gradient-to-br from-[#14181D]/60 to-[#1A1F26]/60 backdrop-blur-xl border border-red-500/30 rounded-xl p-4 sm:p-6 hover:border-red-500/50 transition-all"
          >
            <div className="relative">
              <p className="text-2xl sm:text-3xl font-black text-red-400 mb-1">{stats.disabled}</p>
              <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wide">
                {isRTL ? 'مُعطّل' : 'Disabled'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group overflow-hidden bg-gradient-to-br from-[#14181D]/60 to-[#1A1F26]/60 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4 sm:p-6 hover:border-blue-500/50 transition-all"
          >
            <div className="relative">
              <p className="text-2xl sm:text-3xl font-black text-blue-400 mb-1">{stats.pages}</p>
              <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wide">
                {isRTL ? 'الموارد' : 'Resources'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Selected Role Info & Actions */}
        {selectedRole && (
          <div className="bg-[#14181D]/60 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${selectedRole.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <h3 className="text-white font-bold">{isRTL ? selectedRole.nameAr : selectedRole.name}</h3>
                <p className="text-xs text-gray-500">{isRTL ? selectedRole.descriptionAr : selectedRole.description}</p>
              </div>
              {selectedRole.isSystem && (
                <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-[#D4AF37]/20">
                  {isRTL ? 'نظام' : 'System'}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOnlyEnabled(!showOnlyEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold ${
                  showOnlyEnabled 
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Eye className="w-4 h-4" />
                {isRTL ? 'المفعلة فقط' : 'Only Enabled'}
              </button>

              {!selectedRole.isSystem && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0B0F14] px-6 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-[#D4AF37]/20"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isRTL ? 'حفظ الصلاحيات' : 'Save Permissions'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5`} />
          <input
            type="text"
            placeholder={isRTL ? 'بحث في الصلاحيات والموارد...' : 'Search permissions and resources...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-[#14181D]/40 border border-white/10 rounded-xl py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all`}
          />
        </div>

        {/* Permissions Grid */}
        <div className="space-y-4">
          {Object.entries(groupedPermissions).length === 0 ? (
            <div className="bg-[#14181D]/40 border border-white/10 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
              <Shield className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-500 font-bold">{isRTL ? 'لم يتم العثور على صلاحيات' : 'No permissions found'}</p>
            </div>
          ) : (
            Object.entries(groupedPermissions).map(([resource, perms]) => {
              const isExpanded = expandedResources.has(resource);
              const enabledCount = perms.filter(p => selectedRole?.permissions.includes(p.id) || selectedRole?.permissions.includes('*')).length;

              return (
                <div key={resource} className="bg-[#14181D]/40 border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => {
                      const next = new Set(expandedResources);
                      if (next.has(resource)) next.delete(resource);
                      else next.add(resource);
                      setExpandedResources(next);
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-[#D4AF37]">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-bold uppercase tracking-wider text-xs">{resource}</h3>
                        <p className="text-[10px] text-gray-500">
                          {enabledCount} / {perms.length} {isRTL ? 'صلاحيات مفعلة' : 'permissions enabled'}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className={`w-4 h-4 text-gray-500 ${isRTL ? 'rotate-180' : ''}`} />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-white/5"
                      >
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {perms.map(perm => {
                            const isEnabled = selectedRole?.permissions.includes(perm.id) || selectedRole?.permissions.includes('*');
                            const isLocked = selectedRole?.isSystem || selectedRole?.permissions.includes('*');

                            return (
                              <div
                                key={perm.id}
                                onClick={() => !isLocked && togglePermission(perm.id)}
                                className={`p-3 rounded-lg border transition-all flex items-center justify-between group ${
                                  isEnabled 
                                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' 
                                    : 'bg-white/5 border-white/5 opacity-60 hover:bg-white/10'
                                } ${!isLocked ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}`}
                              >
                                <div>
                                  <p className={`text-sm font-bold ${isEnabled ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                                    {isRTL ? perm.nameAr : perm.name}
                                  </p>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{perm.action}</p>
                                </div>
                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                  isEnabled 
                                    ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0B0F14]' 
                                    : 'border-white/20 text-transparent group-hover:border-white/40'
                                }`}>
                                  <Check size={12} strokeWidth={4} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
