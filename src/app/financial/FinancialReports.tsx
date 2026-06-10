import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  FileDown, 
  Calendar,
  Layers,
  Activity,
  PieChart as PieChartIcon,
  Filter,
  DollarSign,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const FinancialReports = () => {
  const { t, i18n } = useTranslation();
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [activeReport, setActiveReport] = useState('pnl');
  const [dateRange, setDateRange] = useState('Month');

  const reportTypes = [
    { id: 'pnl', label: isRTL ? 'الأرباح والخسائر' : 'Profit & Loss', icon: TrendingUp, color: '#D4AF37' },
    { id: 'cashflow', label: isRTL ? 'التدفق النقدي' : 'Cashflow', icon: Activity, color: '#764ba2' },
    { id: 'balance', label: isRTL ? 'الميزانية العمومية' : 'Balance Sheet', icon: Layers, color: '#10b981' },
    { id: 'expense', label: isRTL ? 'توزيع المصروفات' : 'Expense Breakdown', icon: PieChartIcon, color: '#ef4444' },
    { id: 'category', label: isRTL ? 'ملخص الفئات' : 'Category Summary', icon: BarChart3, color: '#f59e0b' },
  ];

  const pnlData = [
    { month: isRTL ? 'سبتمبر' : 'Sep', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: isRTL ? 'أكتوبر' : 'Oct', revenue: 52000, expenses: 35000, profit: 17000 },
    { month: isRTL ? 'نوفمبر' : 'Nov', revenue: 48000, expenses: 31000, profit: 17000 },
    { month: isRTL ? 'ديسمبر' : 'Dec', revenue: 61000, expenses: 38000, profit: 23000 },
    { month: isRTL ? 'يناير' : 'Jan', revenue: 58000, expenses: 40000, profit: 18000 },
    { month: isRTL ? 'فبراير' : 'Feb', revenue: 72000, expenses: 45000, profit: 27000 },
  ];

  const handleExport = () => {
    toast.success(isRTL ? 'جاري إنشاء تقرير PDF...' : 'Generating PDF report...');
  };

  return (
    <div className="space-y-8 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            {isRTL ? 'الذكاء المالي' : 'Financial Intelligence'}
          </h1>
          <p className="text-slate-500 font-medium">
            {isRTL ? 'تحليل عميق لأداء مؤسستك' : 'Deep dive into your organization\'s performance'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-[#14181F] p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            {['Week', 'Month', 'Quarter', 'Year'].map((range) => (
              <button 
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === range ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-slate-500 hover:text-white'}`}
              >
                {isRTL ? (
                  range === 'Week' ? 'أسبوع' :
                  range === 'Month' ? 'شهر' :
                  range === 'Quarter' ? 'ربع سنوي' : 'سنة'
                ) : range}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <FileDown size={18} />
            <span>{isRTL ? 'تصدير PDF' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {reportTypes.map((report) => {
          const isActive = activeReport === report.id;
          return (
            <button 
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex flex-col items-center gap-4 p-8 rounded-3xl border transition-all ${isActive ? 'bg-[#1A1F26] border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/5 ring-1 ring-[#D4AF37]/20' : 'bg-[#14181F] border-slate-800 hover:border-slate-700'}`}
            >
              <div className={`p-3.5 rounded-2xl transition-all ${isActive ? 'bg-[#D4AF37] text-black rotate-3' : 'bg-slate-800 text-slate-500'}`}>
                <report.icon size={28} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-center ${isActive ? 'text-[#D4AF37]' : 'text-slate-500'}`}>{report.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeReport}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeReport === 'pnl' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-[#14181F] border border-slate-800/50 rounded-[2.5rem] p-8 lg:p-12 h-[550px] shadow-2xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{isRTL ? 'تحليل الأرباح والخسائر' : 'Profit & Loss Analysis'}</h3>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'الإيرادات' : 'Revenue'}</span></div>
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'المصروفات' : 'Expenses'}</span></div>
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRTL ? 'الأرباح' : 'Profit'}</span></div>
                    </div>
                  </div>
                  <div className="h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pnlData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                        <XAxis dataKey="month" stroke="#4A5568" fontSize={10} tickLine={false} axisLine={false} reversed={isRTL} />
                        <YAxis stroke="#4A5568" fontSize={10} tickLine={false} axisLine={false} orientation={isRTL ? 'right' : 'left'} />
                        <Tooltip 
                          cursor={{ fill: '#2D3748', opacity: 0.1 }}
                          contentStyle={{ backgroundColor: '#1A1F26', border: '1px solid #2D3748', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} 
                        />
                        <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} barSize={20} />
                        <Bar dataKey="expenses" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={20} />
                        <Bar dataKey="profit" fill="#10B981" radius={[6, 6, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               
               <div className="bg-[#14181F] border border-slate-800/50 rounded-[2.5rem] p-8 h-[550px] flex flex-col shadow-2xl">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-10">{isRTL ? 'ملخص تنفيذي' : 'Executive Summary'}</h3>
                  <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    {[
                      { label: isRTL ? 'متوسط الإيراد الشهري' : 'Avg Monthly Revenue', value: 'EGP 56,000', trend: '+14%', isUp: true },
                      { label: isRTL ? 'معدل الحرق' : 'Burn Rate', value: 'EGP 38,200', trend: '-2%', isUp: false },
                      { label: isRTL ? 'الهامش الربحي' : 'Margin', value: '32.5%', trend: '+5%', isUp: true },
                      { label: isRTL ? 'توقع شهر مارس' : 'Projected Mar', value: 'EGP 85,000', trend: 'Forecast', isUp: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-[#1A1F26] rounded-3xl border border-slate-800 group hover:border-[#D4AF37]/30 transition-all">
                        <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                          <p className="text-xl font-black text-white">{item.value}</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${item.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {item.trend}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {activeReport === 'cashflow' && (
            <div className="bg-[#14181F] border border-slate-800/50 rounded-[2.5rem] p-12 h-[550px] shadow-2xl">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">{isRTL ? 'حركة التدفق النقدي' : 'Cashflow Movement'}</h3>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pnlData}>
                    <defs>
                      <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2}/><stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                    <XAxis dataKey="month" stroke="#4A5568" fontSize={10} tickLine={false} axisLine={false} reversed={isRTL} />
                    <YAxis stroke="#4A5568" fontSize={10} tickLine={false} axisLine={false} orientation={isRTL ? 'right' : 'left'} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1F26', border: 'none', borderRadius: '16px' }} />
                    <Area type="monotone" dataKey="revenue" name={isRTL ? 'الوارد' : 'Inflow'} stroke="#10B981" fillOpacity={1} fill="url(#colorInflow)" strokeWidth={4} />
                    <Area type="monotone" dataKey="expenses" name={isRTL ? 'الصادر' : 'Outflow'} stroke="#F43F5E" fillOpacity={1} fill="url(#colorOutflow)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeReport === 'expense' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#14181F] border border-slate-800/50 rounded-[2.5rem] p-12 flex flex-col items-center shadow-2xl">
                 <h3 className="text-xl font-bold text-white uppercase tracking-tight self-start mb-12">{isRTL ? 'توزيع المصروفات' : 'Expense Distribution'}</h3>
                 <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Gateway', value: 35 },
                            { name: 'Infrastructure', value: 25 },
                            { name: 'Marketing', value: 20 },
                            { name: 'Ops', value: 20 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={130}
                          paddingAngle={10}
                          dataKey="value"
                        >
                          <Cell fill="#D4AF37" />
                          <Cell fill="#764ba2" />
                          <Cell fill="#10B981" />
                          <Cell fill="#F43F5E" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="space-y-4">
                 {[
                   { name: isRTL ? 'رسوم البوابة' : 'Gateway Fees', value: 35, color: '#D4AF37' },
                   { name: isRTL ? 'البنية التحتية' : 'Infrastructure', value: 25, color: '#764ba2' },
                   { name: isRTL ? 'التسويق' : 'Marketing', value: 20, color: '#10B981' },
                   { name: isRTL ? 'العمليات' : 'Operations', value: 20, color: '#F43F5E' },
                 ].map((item, i) => (
                   <div key={i} className="bg-[#14181F] border border-slate-800/50 rounded-3xl p-8 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all">
                     <div className="flex items-center gap-6">
                       <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}40` }} />
                       <div>
                         <p className="text-base font-bold text-white">{item.name}</p>
                         <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Operational node expense</p>
                       </div>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-black text-white">{item.value}%</p>
                        <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mt-1">EGP {(item.value * 1250).toLocaleString()}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeReport === 'balance' && (
            <div className="bg-[#14181F] border border-slate-800/50 rounded-[3rem] p-16 text-center space-y-8 shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37] shadow-[0_0_20px_#D4AF37]" />
               <DollarSign size={80} className="mx-auto text-[#D4AF37] opacity-10" />
               <div className="space-y-4">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tight">{isRTL ? 'الميزانية العمومية الديناميكية' : 'Dynamic Balance Sheet'}</h3>
                 <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                   {isRTL ? 'يوفر هذا التقرير لمحة سريعة في الوقت الفعلي لأصولك والتزاماتك وحقوق الملكية. يتم حالياً جلب كشوف الحسابات البنكية المصالحة لشهر فبراير ٢٠٢٦.' : 'This report provides a real-time snapshot of your assets, liabilities, and equity. Currently fetching reconciled bank statements for February 2026.'}
                 </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-12">
                  <div className="text-center p-8 bg-[#1A1F26] rounded-[2rem] border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{isRTL ? 'إجمالي الأصول' : 'Total Assets'}</p>
                    <p className="text-4xl font-black text-[#D4AF37]">EGP 1.2M</p>
                  </div>
                  <div className="text-center p-8 bg-[#1A1F26] rounded-[2rem] border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{isRTL ? 'إجمالي الالتزامات' : 'Total Liabilities'}</p>
                    <p className="text-4xl font-black text-rose-500">EGP 450k</p>
                  </div>
                  <div className="text-center p-8 bg-[#1A1F26] rounded-[2rem] border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{isRTL ? 'حقوق الملكية' : 'Net Equity'}</p>
                    <p className="text-4xl font-black text-emerald-500">EGP 750k</p>
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
