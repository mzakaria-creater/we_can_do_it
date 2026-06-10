import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  MapPin, 
  Clock, 
  Filter, 
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const volumeData = [
  { hour: '00:00', volume: 12000 },
  { hour: '04:00', volume: 8000 },
  { hour: '08:00', volume: 45000 },
  { hour: '12:00', volume: 82000 },
  { hour: '16:00', volume: 95000 },
  { hour: '20:00', volume: 68000 },
  { hour: '23:59', volume: 34000 },
];

const methodData = [
  { name: 'Vodafone Cash', value: 45, color: '#E60000' },
  { name: 'Etisalat Cash', value: 25, color: '#7FB13A' },
  { name: 'InstaPay', value: 15, color: '#D4AF37' },
  { name: 'Credit Card', value: 10, color: '#6c5ce7' },
  { name: 'Other', value: 5, color: '#16c784' },
];

const regionalData = [
  { city: 'Cairo', volume: 450000, growth: 12.5 },
  { city: 'Alexandria', volume: 280000, growth: 8.2 },
  { city: 'Giza', volume: 190000, growth: -2.1 },
  { city: 'Mansoura', volume: 120000, growth: 15.8 },
  { city: 'Tanta', volume: 95000, growth: 4.3 },
];

const merchantPerformance = [
  { name: 'MegaStore Cairo', transactions: 1240, volume: 145000, rate: 98.2 },
  { name: 'TechHub Online', transactions: 850, volume: 92000, rate: 94.5 },
  { name: 'FashionLine', transactions: 620, volume: 48000, rate: 89.1 },
  { name: 'GroceryDirect', transactions: 2100, volume: 210000, rate: 96.8 },
];

import { PageHeader } from '../components/PageHeader';
import { LuxuryCard, LuxuryStatCard } from '../components/LuxuryCard';

export const Analytics = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title={t('analytics')}
        description={isRTL ? 'نظرة متعمقة على أداء منظومة الدفع الخاصة بك والتحليلات المتقدمة.' : 'Deep dive into your payment ecosystem performance and advanced analytics.'}
        icon={BarChart3}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar size={16} />
              <span>Feb 01 - Feb 15, 2026</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter size={16} />
              <span>{t('filters')}</span>
            </Button>
            <Button variant="luxury" size="sm" className="gap-2">
              <Download size={16} />
              <span>{t('export')}</span>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LuxuryStatCard
          title={isRTL ? 'متوسط قيمة المعاملة' : 'Avg. Transaction Value'}
          value="EGP 1,420"
          change="5.2%"
          trend="up"
          icon={TrendingUp}
          description={isRTL ? 'بالمقارنة مع الشهر الماضي' : 'vs last month'}
        />
        <LuxuryStatCard
          title={isRTL ? 'نسبة استرداد المدفوعات' : 'Chargeback Ratio'}
          value="0.42%"
          change="0.1%"
          trend="down"
          icon={PieChartIcon}
          description={isRTL ? 'انخفاض في نسبة المخاطر' : 'Decrease in risk ratio'}
        />
        <LuxuryStatCard
          title={isRTL ? 'كفاءة التسوية' : 'Settlement Efficiency'}
          value="T+1 Avg."
          icon={Clock}
          description={isRTL ? 'أداء مستقر للنظام' : 'Stable system performance'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Volume */}
        <LuxuryCard className="overflow-hidden">
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-8">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock className="text-primary" size={20} />
                {isRTL ? 'نشاط الحجم خلال اليوم' : 'Intraday Volume Activity'}
              </h3>
              <Select defaultValue="today">
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="colorVolumeAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-card)', 
                      borderColor: 'var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="var(--color-primary)" 
                    fillOpacity={1} 
                    fill="url(#colorVolumeAnalytics)" 
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </LuxuryCard>

        {/* Method Distribution */}
        <LuxuryCard>
          <div className="p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-8">
              <PieChartIcon className="text-primary" size={20} />
              {isRTL ? 'مزيج طرق الدفع' : 'Payment Method Mix'}
            </h3>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-card)', 
                      borderColor: 'var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </LuxuryCard>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Performance */}
        <Card className="lg:col-span-1 bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MapPin className="text-primary" size={20} />
              Regional Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {regionalData.map((item) => (
                <div key={item.city} className="flex flex-col gap-1">
                  <div className="flex justify-between items-end">
                    <span className="font-medium text-sm">{item.city}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">EGP {(item.volume / 1000).toFixed(0)}k</span>
                      <span className={`text-[10px] font-bold ${item.growth > 0 ? 'text-success' : 'text-destructive'}`}>
                        {item.growth > 0 ? '+' : ''}{item.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.volume / 450000) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Merchant Leaderboard */}
        <Card className="lg:col-span-2 bg-card border-border shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              Top Merchants
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-primary">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Merchant Name</th>
                    <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Transactions</th>
                    <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Volume</th>
                    <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Approval Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {merchantPerformance.map((merchant) => (
                    <tr key={merchant.name} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold">{merchant.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm">{merchant.transactions.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold">EGP {(merchant.volume / 1000).toFixed(0)}k</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-sm font-bold ${merchant.rate > 95 ? 'text-success' : 'text-warning'}`}>
                            {merchant.rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
