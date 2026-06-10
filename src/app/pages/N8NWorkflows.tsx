import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Workflow,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  GitBranch,
  RefreshCw,
  Copy,
  ExternalLink,
  Calendar,
  Timer,
  Database,
  AlertCircle,
  ChevronRight,
  Code2,
  Loader2,
  BarChart3,
  TrendingDown,
  Info
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { supabase, publicAnonKey } from '../../lib/supabase';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error';
  trigger: string;
  actions: number;
  lastRun: string;
  nextRun?: string;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  enabled: boolean;
  configuration: {
    timeout: number;
    retries: number;
    errorHandling: 'stop' | 'continue' | 'retry';
  };
}

export function N8NWorkflows() {
  const { t } = useTranslation();
  const { language, isAuthenticated } = useStore();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // Fetch workflows
  const fetchWorkflows = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('server', {
        method: 'GET',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/workflows'
      });

      if (error) throw error;
      setWorkflows(data?.workflows || []);
    } catch (error: any) {
      console.error('Error fetching workflows:', error);
      if (isAuthenticated) {
        toast.error(`Failed to load workflows: ${error.message || 'Server error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [isAuthenticated]);

  // Toggle workflow
  const toggleWorkflow = async (workflowId: string, currentStatus: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/workflows/toggle',
        body: { id: workflowId, enabled: !currentStatus }
      });

      if (error) throw error;
      
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, enabled: !currentStatus, status: !currentStatus ? 'active' : 'paused' } : w
      ));
      
      toast.success(language === 'ar' 
        ? `تم ${!currentStatus ? 'تفعيل' : 'إيقاف'} التدفق بنجاح` 
        : `Workflow ${!currentStatus ? 'enabled' : 'disabled'} successfully`
      );
    } catch (error: any) {
      console.error('Error toggling workflow:', error);
      toast.error(error.message || 'Failed to toggle workflow');
    }
  };

  // Execute workflow manually
  const executeWorkflow = async (workflowId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('server', {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
        },
        path: 'make-server-46c3f42b/workflows/execute',
        body: { id: workflowId }
      });

      if (error) throw error;
      
      toast.success(language === 'ar' 
        ? 'تم تشغيل التدفق بنجاح' 
        : 'Workflow executed successfully'
      );
      
      fetchWorkflows();
    } catch (error: any) {
      console.error('Error executing workflow:', error);
      toast.error(error.message || 'Failed to execute workflow');
    }
  };

  const statusConfig = {
    active: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Active', icon: CheckCircle2 },
    paused: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Paused', icon: Pause },
    error: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Error', icon: XCircle }
  };

  // Calculate summary metrics
  const summary = {
    total: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    paused: workflows.filter(w => w.status === 'paused').length,
    errors: workflows.filter(w => w.status === 'error').length,
    totalExecutions: workflows.reduce((sum, w) => sum + w.totalExecutions, 0),
    avgSuccessRate: workflows.length > 0 
      ? workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length 
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Workflow className="w-6 h-6 text-primary" />
            </div>
            n8n Workflow Automation
          </h1>
          <p className="text-muted-foreground mt-1">Manage and monitor automated workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchWorkflows}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Workflow className="w-4 h-4" />
            <span className="hidden sm:inline">New Workflow</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <Workflow className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">{summary.total} total</span>
          </div>
          <p className="text-sm text-muted-foreground">Active Workflows</p>
          <p className="text-3xl font-bold text-emerald-500">{summary.active}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-medium text-blue-500">Real-time</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Executions</p>
          <p className="text-3xl font-bold">{summary.totalExecutions.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-500">+5.2%</span>
          </div>
          <p className="text-sm text-muted-foreground">Success Rate</p>
          <p className="text-3xl font-bold">{summary.avgSuccessRate.toFixed(1)}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-xs font-medium text-red-500">{summary.errors > 0 ? 'Active' : 'None'}</span>
          </div>
          <p className="text-sm text-muted-foreground">Error Count</p>
          <p className="text-3xl font-bold text-red-500">{summary.errors}</p>
        </motion.div>
      </div>

      {/* Workflows List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center bg-card border border-border rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="p-12 text-center bg-card border border-border rounded-xl">
            <Workflow className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No workflows configured yet</p>
            <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Create Your First Workflow
            </button>
          </div>
        ) : (
          workflows.map((workflow, idx) => {
            const StatusIcon = statusConfig[workflow.status].icon;
            
            return (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{workflow.name}</h3>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig[workflow.status].bg}`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${statusConfig[workflow.status].color}`} />
                          <span className={`text-xs font-medium ${statusConfig[workflow.status].color}`}>
                            {statusConfig[workflow.status].label}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleWorkflow(workflow.id, workflow.enabled)}
                        className={`p-2 rounded-lg transition-colors ${
                          workflow.enabled 
                            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={workflow.enabled ? 'Pause' : 'Activate'}
                      >
                        {workflow.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => executeWorkflow(workflow.id)}
                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                        title="Execute Now"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setShowConfig(true);
                        }}
                        className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        title="Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Workflow Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Trigger</span>
                      </div>
                      <p className="text-sm font-medium">{workflow.trigger}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Executions</span>
                      </div>
                      <p className="text-sm font-medium">{workflow.totalExecutions.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Success Rate</span>
                      </div>
                      <p className="text-sm font-medium text-emerald-500">{workflow.successRate}%</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Avg Time</span>
                      </div>
                      <p className="text-sm font-medium">{workflow.avgExecutionTime}ms</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Last run: {new Date(workflow.lastRun).toLocaleString()}</span>
                    </div>
                    {workflow.nextRun && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Next run: {new Date(workflow.nextRun).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuration Preview */}
                <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{workflow.actions} actions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{workflow.configuration.retries} retries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{workflow.configuration.timeout}s timeout</span>
                    </div>
                  </div>
                  
                  <button className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Configuration Modal */}
      {showConfig && selectedWorkflow && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowConfig(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedWorkflow.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Workflow Configuration</p>
                </div>
                <button
                  onClick={() => setShowConfig(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Timeout (seconds)</label>
                  <input
                    type="number"
                    value={selectedWorkflow.configuration.timeout}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    readOnly
                  />
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Max Retries</label>
                  <input
                    type="number"
                    value={selectedWorkflow.configuration.retries}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    readOnly
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Error Handling</label>
                <select
                  value={selectedWorkflow.configuration.errorHandling}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  disabled
                >
                  <option value="stop">Stop on Error</option>
                  <option value="continue">Continue on Error</option>
                  <option value="retry">Retry on Error</option>
                </select>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-500 mb-1">Advanced Configuration</p>
                    <p className="text-xs text-muted-foreground">
                      To modify workflow settings, please access the n8n editor directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-muted/30 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Open in n8n
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}