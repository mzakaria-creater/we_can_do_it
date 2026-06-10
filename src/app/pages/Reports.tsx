import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar, 
  FileText, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useLoaderData, useNavigate } from 'react-router';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey } from '../../lib/supabase';

interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'completed' | 'failed';
  url?: string;
  createdAt: string;
  generatedByName: string;
}

const reportTemplates = [
  { id: 'settlement', title: 'Daily Settlement Report', description: 'Consolidated report of all successful settlements for the last 24 hours.', type: 'Financial', icon: BarChart3 },
  { id: 'merchant-perf', title: 'Merchant Performance', description: 'Overview of transaction volume and success rates by merchant.', type: 'Analytics', icon: FileText },
  { id: 'risk-aml', title: 'Risk & Compliance Log', description: 'Detailed log of flagged transactions and AML alerts.', type: 'Security', icon: FileText },
  { id: 'payout-recon', title: 'Payout Reconciliation', description: 'Comparison between requested payouts and bank confirmations.', type: 'Financial', icon: BarChart3 },
];

export function Reports() {
  const { t } = useTranslation();
  const { isAuthenticated } = useStore();
  const loaderData = useLoaderData() as any;
  const navigate = useNavigate();
  
  const [history, setHistory] = useState<GeneratedReport[]>(loaderData?.reportsData?.reports || []);
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync state with loader data
  useEffect(() => {
    if (loaderData?.reportsData?.reports) {
      setHistory(loaderData.reportsData.reports);
    }
  }, [loaderData]);

  const fetchHistory = async () => {
    // Navigate to current path to trigger re-fetch via loader
    navigate('.', { replace: true });
  };

  const handleGenerate = async (template: typeof reportTemplates[0]) => {
    if (!isAuthenticated) {
      toast.error(t('Please sign in to generate reports'));
      return;
    }
    
    setGeneratingId(template.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/reports',
        body: {
          title: template.title,
          type: template.type,
          filters: { templateId: template.id }
        }
      });

      if (error) {
        console.error('Generation error:', error);
        throw error;
      }

      setHistory(prev => [data, ...prev]);
      toast.success(t('Report generated successfully'));
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(`${t('Failed to generate report')}: ${error.message || 'Server error'}`);
    } finally {
      setGeneratingId(null);
    }
  };

  const filteredHistory = history.filter(report => 
    t(report.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('reports')}</h1>
          <p className="text-muted-foreground">{t('reportsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={t('searchReports')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{t('filters')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'totalReports', value: history.length.toString(), change: '+12%', icon: FileText },
          { label: 'pendingGeneration', value: '0', change: 'None', icon: BarChart3 },
          { label: 'autoScheduled', value: '8', change: 'Active', icon: Calendar },
          { label: 'downloadsMtd', value: '842', change: '+18%', icon: Download },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-card border border-border rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 text-primary" />
              <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-success' : 'text-muted-foreground'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{t(stat.label)}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">{t('availableReportTemplates')}</h2>
            </div>
            <div className="divide-y divide-border">
              {reportTemplates.map((report) => (
                <div key={report.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <report.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{t(report.title)}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {t(report.type)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md">{t(report.description)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleGenerate(report)}
                      disabled={generatingId !== null}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {generatingId === report.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{t('generate')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('recentHistory')}</h2>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-border">
              {loading ? (
                <div className="p-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm">{t('loadingHistory')}</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">{t('noReportsFound')}</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredHistory.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{t(report.title)}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {report.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin text-warning" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          {report.generatedByName}
                        </span>
                        <a 
                          href={report.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
            {filteredHistory.length > 0 && (
              <button 
                onClick={fetchHistory}
                className="p-4 text-sm text-primary hover:bg-muted/50 transition-colors border-t border-border"
              >
                {t('refreshHistory')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
