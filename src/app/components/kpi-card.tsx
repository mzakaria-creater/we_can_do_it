import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Activity, Wallet, MoreVertical } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  color?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, change, isPositive, icon: Icon, color = "primary" }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card p-5 rounded-2xl border shadow-sm"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl bg-${color}/10 text-${color}`}>
          <Icon size={24} />
        </div>
        <button className="text-muted-foreground hover:bg-muted rounded p-1">
          <MoreVertical size={18} />
        </button>
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-bold">{value}</h3>
          {change && (
            <span className={`text-xs font-semibold flex items-center mb-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
              {change}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
