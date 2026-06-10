import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Eye,
  User,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../lib/supabase';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  resourceType?: string;
  resourceId?: string;
  status: 'success' | 'failed' | 'pending';
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  changes?: any;
}

export const AuditLogs = () => {
  const { t } = useTranslation();
  const { language, user } = useStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/audit-logs`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch audit logs');

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast.error(language === 'ar' ? 'فشل تحميل سجلات التدقيق' : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('CREATE') || action.includes('ADD')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (action.includes('UPDATE') || action.includes('EDIT')) {
      return <Settings className="w-4 h-4 text-blue-500" />;
    }
    if (action.includes('DELETE') || action.includes('REMOVE')) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (action.includes('LOGIN') || action.includes('AUTH')) {
      return <User className="w-4 h-4 text-purple-500" />;
    }
    if (action.includes('SECURITY') || action.includes('RISK')) {
      return <Shield className="w-4 h-4 text-orange-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    return matchesSearch && matchesAction && matchesStatus;
  });

  const stats = {
    total: logs.length,
    today: logs.filter(l => {
      const today = new Date().toDateString();
      return new Date(l.timestamp).toDateString() === today;
    }).length,
    success: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
  };

  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#D4AF37]" />
            {language === 'ar' ? 'سجلات التدقيق' : 'Audit Logs'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'عرض وتتبع جميع الإجراءات والأحداث في النظام'
              : 'View and track all system actions and events'}
          </p>
        </div>
        <button
          onClick={() => toast.success(language === 'ar' ? 'قريباً' : 'Coming soon')}
          className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#C49F27] transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {language === 'ar' ? 'تصدير' : 'Export'}
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
                {language === 'ar' ? 'إجمالي السجلات' : 'Total Logs'}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#D4AF37]" />
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
                {language === 'ar' ? 'اليوم' : 'Today'}
              </p>
              <p className="text-2xl font-bold text-blue-500 mt-1">
                {stats.today}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
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
                {language === 'ar' ? 'ناجحة' : 'Success'}
              </p>
              <p className="text-2xl font-bold text-green-500 mt-1">
                {stats.success}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
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
                {language === 'ar' ? 'فاشلة' : 'Failed'}
              </p>
              <p className="text-2xl font-bold text-red-500 mt-1">
                {stats.failed}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="all">{language === 'ar' ? 'كل الإجراءات' : 'All Actions'}</option>
            <option value="CREATE">{language === 'ar' ? 'إنشاء' : 'Create'}</option>
            <option value="UPDATE">{language === 'ar' ? 'تحديث' : 'Update'}</option>
            <option value="DELETE">{language === 'ar' ? 'حذف' : 'Delete'}</option>
            <option value="LOGIN">{language === 'ar' ? 'تسجيل دخول' : 'Login'}</option>
            <option value="SECURITY">{language === 'ar' ? 'أمان' : 'Security'}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="all">{language === 'ar' ? 'كل الحالات' : 'All Status'}</option>
            <option value="success">{language === 'ar' ? 'ناجحة' : 'Success'}</option>
            <option value="failed">{language === 'ar' ? 'فاشلة' : 'Failed'}</option>
            <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="all">{language === 'ar' ? 'كل الأوقات' : 'All Time'}</option>
            <option value="today">{language === 'ar' ? 'اليوم' : 'Today'}</option>
            <option value="week">{language === 'ar' ? 'هذا الأسبوع' : 'This Week'}</option>
            <option value="month">{language === 'ar' ? 'هذا الشهر' : 'This Month'}</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'الوقت' : 'Timestamp'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'الإجراء' : 'Action'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'المستخدم' : 'User'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'المورد' : 'Resource'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {language === 'ar' ? 'لا توجد سجلات' : 'No logs found'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm text-foreground font-medium">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground">{log.userName || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{log.userEmail || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground">{log.resourceType || '-'}</p>
                        {log.resourceId && (
                          <p className="text-xs text-muted-foreground font-mono">{log.resourceId.slice(0, 8)}...</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(log.status)}`}>
                        {language === 'ar' 
                          ? log.status === 'success' ? 'ناجحة'
                            : log.status === 'failed' ? 'فاشلة'
                            : 'قيد الانتظار'
                          : log.status.charAt(0).toUpperCase() + log.status.slice(1)
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toast.success(language === 'ar' ? 'قريباً' : 'Coming soon')}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title={language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
