import React from 'react';
import { cn } from './ui/utils';
import { motion } from 'motion/react';

interface LuxuryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: boolean;
  withPattern?: boolean;
}

export const LuxuryCard: React.FC<LuxuryCardProps> = ({ 
  children, 
  className, 
  gradient = false,
  withPattern = true,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        "bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden relative group shadow-2xl transition-all",
        gradient && "bg-gradient-to-br from-black to-zinc-900",
        withPattern && "royal-pattern",
        className
      )}
      {...props}
    >
      {/* Premium Border Overlay */}
      <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none group-hover:border-[#D4AF37]/20 transition-colors" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

interface LuxuryStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  description?: string;
}

export const LuxuryStatCard: React.FC<LuxuryStatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description
}) => {
  return (
    <LuxuryCard className="p-8 bg-zinc-950 border border-white/5 hover:border-[#D4AF37]/40 transition-all group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="p-3.5 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-2xl shadow-lg shadow-[#D4AF37]/20 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-black" />
        </div>
        {change && (
          <div className={cn(
            "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
            trend === 'up' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
          )}>
            {change}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
          {title}
        </h3>
        <p className="text-3xl font-black tracking-tighter text-white">
          {value}
        </p>
        {description && (
          <p className="text-[10px] text-gray-600 font-bold mt-3 border-t border-white/5 pt-3">
            {description}
          </p>
        )}
      </div>

      {/* Decorative accent */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-3xl group-hover:bg-[#D4AF37]/10 transition-colors" />
    </LuxuryCard>
  );
};
