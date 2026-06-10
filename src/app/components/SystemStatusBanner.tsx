import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, CheckCircle, AlertTriangle, Wifi, WifiOff, X } from 'lucide-react';
import api from '../../lib/api';

export const SystemStatusBanner = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [dismissed, setDismissed] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);

  useEffect(() => {
    checkBackendStatus();
    
    // Check every 60 seconds (reduced frequency)
    const interval = setInterval(checkBackendStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    try {
      console.log('[SystemStatus] Checking backend health...');
      await api.health();
      console.log('[SystemStatus] Backend is online');
      setStatus('online');
      setCheckAttempts(0);
    } catch (error: any) {
      console.error('[SystemStatus] Backend check failed:', error.message);
      // Silently increment attempts - only show banner after multiple failures
      setCheckAttempts(prev => prev + 1);
      
      // Only set offline after 2 failed attempts to avoid false positives
      if (checkAttempts >= 1) {
        setStatus('offline');
      }
    }
  };

  // Don't show banner if still checking or if online
  if (dismissed || status === 'checking' || status === 'online') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full px-4"
      >
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-amber-500/40 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-amber-400 font-bold text-sm">
                  ⚠️ Edge Function Not Deployed
                </h3>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Mock Mode</span>
                </div>
              </div>
              
              <p className="text-sm text-amber-200/90 leading-relaxed mb-3">
                Backend server is not reachable. The app is using mock data for demonstration. Deploy the Supabase Edge Function to enable full functionality.
              </p>
              
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/DEPLOYMENT_INSTRUCTIONS.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all"
                >
                  <Wifi className="w-3 h-3" />
                  View Deployment Guide
                </a>
                
                <button
                  onClick={checkBackendStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all"
                >
                  <CheckCircle className="w-3 h-3" />
                  Check Again
                </button>
                
                <button
                  onClick={() => setDismissed(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium rounded-lg transition-all ml-auto"
                >
                  Dismiss
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};