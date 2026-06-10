import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLoaderData, useLocation } from 'react-router';
import { 
  Crown,
  Zap
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { OpenTicketModal } from '../components/OpenTicketModal';
import { supabase } from '../../lib/supabase';
import { getMockAllTransactions } from '../lib/mockTransactions';

import { PageHeader } from '../components/PageHeader';
import { Stories } from '../components/Stories';
import { DashboardExpanded } from '../components/DashboardExpanded';

export const Dashboard = () => {
  const { language, user, setLanguage } = useStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const loaderData = useLoaderData() as any;
  const isRTL = language === 'ar';
  
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [stats, setStats] = useState({
    totalVolume: 0,
    transactionCount: 0,
    merchantCount: 0,
    successRate: 0,
  });

  // Fallback mock data
  const generateMockData = () => {
    const monthNames = isRTL 
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو']
      : ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'];

    const mockChartData = monthNames.map((name, idx) => ({
      name,
      deposit: 40000 + Math.floor(Math.random() * 20000),
      payout: 30000 + Math.floor(Math.random() * 15000),
    }));

    const allMockTransactions = getMockAllTransactions();

    return {
      chartData: mockChartData,
      stats: {
        totalVolume: allMockTransactions.reduce((sum, tx) => sum + tx.amount, 0),
        transactionCount: allMockTransactions.length,
        merchantCount: 12,
        successRate: 98.4,
      }
    };
  };

  useEffect(() => {
    if (loaderData?.dashboardData) {
      const { stats: backendStats, error, loadedAt } = loaderData.dashboardData;
      
      // Check if data is actually from backend or just the fallback 0s
      const isActuallyAvailable = !error && backendStats && (backendStats.totalVolume > 0 || backendStats.transactionCount > 0);

      if (!isActuallyAvailable) {
        setBackendAvailable(false);
        const mockData = generateMockData();
        setChartData(mockData.chartData);
        setStats(mockData.stats);
      } else {
        setBackendAvailable(true);
        setStats({
          totalVolume: backendStats.totalVolume || 0,
          transactionCount: backendStats.transactionCount || 0,
          merchantCount: backendStats.merchantCount || 0,
          successRate: backendStats.successRate || 0,
        });
        
        // Use real chart data from backend if available
        if (backendStats.chartData && backendStats.chartData.length > 0) {
          setChartData(backendStats.chartData.map((d: any) => ({
            name: isRTL ? d.nameAr || d.name : d.name,
            deposit: d.deposit,
            payout: d.payout
          })));
        } else {
          setChartData(generateMockData().chartData);
        }
      }
    } else {
      setBackendAvailable(false);
      const mockData = generateMockData();
      setChartData(mockData.chartData);
      setStats(mockData.stats);
    }
  }, [loaderData, isRTL]);

  useEffect(() => {
    const channel = supabase.channel('dashboard:transactions', {
      config: { broadcast: { self: false } }
    });

    channel
      .on('broadcast', { event: 'transaction_update' }, (payload) => {
        navigate('.', { replace: true });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const location = useLocation();
  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    
    // Update URL to reflect new language
    const currentPathWithoutLang = location.pathname.replace(/^\/(en|ar)/, '');
    navigate(`/${newLang}${currentPathWithoutLang}${location.search}${location.hash}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-[1600px] mx-auto p-4 sm:p-8 space-y-8">
        
        {!backendAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="vip-card bg-amber-500/5 border-[#D4AF37]/30 flex items-start gap-4 mb-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 gold-gradient opacity-5 group-hover:opacity-10 transition-opacity" />
            <div className="p-3 bg-[#D4AF37]/20 rounded-xl relative z-10">
              <Zap className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="flex-1 relative z-10">
              <h3 className="text-[#D4AF37] font-black uppercase tracking-tighter mb-1">
                {isRTL ? 'وضعية المحاكاة الذهبية' : 'Golden Simulation Mode'}
              </h3>
              <p className="text-sm text-slate-400">
                {isRTL 
                  ? 'يتم عرض بيانات فاخرة معدة مسبقاً لأغراض العرض التقديمي. الاتصال بالخادم الرئيسي جارٍ...' 
                  : 'Displaying premium pre-curated data for presentation purposes. Reconnecting to primary vault...'}
              </p>
            </div>
          </motion.div>
        )}

        <PageHeader
          title={isRTL ? `مرحباً، ${user?.name?.split(' ')[0] || 'مدير'}` : `Welcome, ${user?.name?.split(' ')[0] || 'Admin'}`}
          description={isRTL ? 'إليك ملخص أداء النظام لليوم.' : "Here's your system performance summary for today."}
          icon={Crown}
          actions={
            <>
              <button 
                onClick={handleLanguageToggle}
                className="bg-slate-800/50 hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm border border-slate-700/50 backdrop-blur-md transition-all font-bold uppercase tracking-widest"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
              <button 
                onClick={() => setIsTicketModalOpen(true)}
                className="bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] px-8 py-2.5 rounded-xl font-black shadow-xl shadow-[#D4AF37]/20 transition-all active:scale-95"
              >
                {isRTL ? 'فتح تذكرة دعم' : 'Open Support Ticket'}
              </button>
            </>
          }
        />

        <div className="mb-8">
          <Stories />
        </div>

        <DashboardExpanded 
          stats={stats} 
          chartData={chartData} 
          wallets={loaderData?.wallets || []} 
          recentTransactions={loaderData?.dashboardData?.recentTransactions || []}
          isRTL={isRTL} 
        />
      </div>
      <OpenTicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} />
    </div>
  );
};

export default Dashboard;