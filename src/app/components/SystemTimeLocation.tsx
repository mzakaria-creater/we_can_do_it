import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { useStore } from '../../lib/store';
import { motion } from 'motion/react';

export const SystemTimeLocation: React.FC = () => {
  const { language } = useStore();
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState({ city: 'Cairo', country: 'Egypt' });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Simulate fetching location based on IP (In a real app, this would use a GeoIP API)
    // For now, we use a fixed location suitable for Press2Pay's target market
    const EgyptLocations = [
      { city: 'Cairo', country: 'Egypt' },
      { city: 'Alexandria', country: 'Egypt' },
      { city: 'Giza', country: 'Egypt' },
      { city: 'Dubai', country: 'UAE' },
      { city: 'Riyadh', country: 'KSA' }
    ];
    
    // Pick one randomly or just stay with Cairo
    setLocation(EgyptLocations[0]);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-sidebar-accent/30 rounded-full border border-border/50 backdrop-blur-sm">
      {/* Date */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar size={14} className="text-[#D4AF37]" />
        <span className="text-[11px] font-medium whitespace-nowrap">
          {formatDate(time)}
        </span>
      </div>

      <div className="w-[1px] h-3 bg-border" />

      {/* Time */}
      <div className="flex items-center gap-2 text-foreground font-bold">
        <Clock size={14} className="text-[#D4AF37] animate-pulse" />
        <span className="text-[12px] tabular-nums whitespace-nowrap">
          {formatTime(time)}
        </span>
      </div>

      <div className="w-[1px] h-3 bg-border" />

      {/* Location */}
      <motion.div 
        className="flex items-center gap-2 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <MapPin size={14} className="text-red-500" />
        <span className="text-[11px] font-medium">
          {language === 'ar' ? (
            location.city === 'Cairo' ? 'القاهرة، مصر' : `${location.city}، ${location.country}`
          ) : (
            `${location.city}, ${location.country}`
          )}
        </span>
      </motion.div>
    </div>
  );
};
