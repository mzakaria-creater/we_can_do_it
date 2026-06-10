import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { useStore } from '../../lib/store';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  variant?: 'simple' | 'luxury' | 'gradient';
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  actions,
  variant = 'luxury'
}) => {
  const { language } = useStore();
  const isRTL = language === 'ar';

  if (variant === 'simple') {
    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-black tracking-tight mb-2"
          >
            {title}
          </motion.h1>
          {description && (
            <p className="text-muted-foreground font-medium">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-4">
            {actions}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden border border-[#D4AF37]/10 rounded-3xl p-8 lg:p-12 mb-10 ${
      variant === 'gradient' 
        ? 'bg-gradient-to-br from-[#D4AF37]/10 to-black' 
        : 'bg-zinc-950/40 backdrop-blur-3xl'
    }`}>
      {/* Premium Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-start gap-6">
          {Icon && (
            <div className="p-4 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-2xl shadow-xl shadow-[#D4AF37]/20 mt-1">
              <Icon className="w-8 h-8 text-black" />
            </div>
          )}
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl lg:text-4xl font-black tracking-tighter mb-2 text-white"
            >
              {title}
            </motion.h1>
            {description && (
              <p className="text-gray-500 text-base lg:text-lg max-w-2xl leading-relaxed font-medium">
                {description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-4">
               <div className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full">
                  <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">VIP Member Access</span>
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Connection Live</span>
            </div>
          </div>
        </div>
        
        {actions && (
          <div className="flex flex-wrap items-center gap-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
