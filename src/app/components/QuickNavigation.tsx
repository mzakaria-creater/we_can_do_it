import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, Command, ArrowRight, ArrowLeft, Star, Clock, TrendingUp } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { routesMetadata, type RouteMetadata } from '../routes';
import { userHasRouteAccess, buildPath } from '../lib/navigation';

interface QuickNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickNavigation: React.FC<QuickNavProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { language, user } = useStore();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const [favoritePages, setFavoritePages] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Load recent and favorite pages from localStorage
  useEffect(() => {
    if (isOpen) {
      const recent = localStorage.getItem('press2pay-recent-pages');
      const favorites = localStorage.getItem('press2pay-favorite-pages');
      
      if (recent) setRecentPages(JSON.parse(recent));
      if (favorites) setFavoritePages(JSON.parse(favorites));
      
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  // Filter routes based on search and access
  const filteredRoutes = Object.values(routesMetadata).filter(route => {
    // Skip auth routes
    if (route.path === 'login' || route.path === 'forgot-password') return false;
    
    // Check access
    if (!user) return false;
    if (route.roles && route.roles.length > 0 && !route.roles.includes(user.role)) {
      return false;
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = t(route.titleKey).toLowerCase().includes(query);
      const pathMatch = route.path.toLowerCase().includes(query);
      return titleMatch || pathMatch;
    }
    
    return true;
  });
  
  // Sort: Favorites first, then recent, then alphabetically
  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    const aIsFavorite = favoritePages.includes(a.path);
    const bIsFavorite = favoritePages.includes(b.path);
    const aIsRecent = recentPages.includes(a.path);
    const bIsRecent = recentPages.includes(b.path);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    if (aIsRecent && !bIsRecent) return -1;
    if (!aIsRecent && bIsRecent) return 1;
    
    return t(a.titleKey).localeCompare(t(b.titleKey), language);
  });
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, sortedRoutes.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (sortedRoutes[selectedIndex]) {
          handleNavigate(sortedRoutes[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, sortedRoutes, onClose]);
  
  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);
  
  const handleNavigate = (route: RouteMetadata) => {
    // Save to recent pages
    const updated = [route.path, ...recentPages.filter(p => p !== route.path)].slice(0, 10);
    localStorage.setItem('press2pay-recent-pages', JSON.stringify(updated));
    
    // Navigate
    const fullPath = buildPath(route.path as any, undefined, language);
    navigate(fullPath);
    
    // Close
    onClose();
    setSearchQuery('');
  };
  
  const toggleFavorite = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favoritePages.includes(path)
      ? favoritePages.filter(p => p !== path)
      : [...favoritePages, path];
    
    localStorage.setItem('press2pay-favorite-pages', JSON.stringify(updated));
    setFavoritePages(updated);
  };
  
  const getCategoryBadge = (category?: string) => {
    const colors: Record<string, string> = {
      main: 'bg-blue-500/20 text-blue-400',
      financial: 'bg-emerald-500/20 text-emerald-400',
      operations: 'bg-purple-500/20 text-purple-400',
      merchant: 'bg-orange-500/20 text-orange-400',
      developer: 'bg-cyan-500/20 text-cyan-400',
      admin: 'bg-rose-500/20 text-rose-400',
    };
    
    if (!category) return null;
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded ${colors[category] || 'bg-gray-500/20 text-gray-400'}`}>
        {t(`category_${category}`)}
      </span>
    );
  };
  
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-[#0D1117] border border-[#D4AF37]/20 rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-[#D4AF37]/10">
            <Search className="w-5 h-5 text-[#D4AF37]" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('quick_nav_search_placeholder', 'Search pages...')}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <kbd className="px-2 py-1 bg-[#1C2128] border border-[#D4AF37]/10 rounded">↑↓</kbd>
              <kbd className="px-2 py-1 bg-[#1C2128] border border-[#D4AF37]/10 rounded">↵</kbd>
              <kbd className="px-2 py-1 bg-[#1C2128] border border-[#D4AF37]/10 rounded">Esc</kbd>
            </div>
          </div>
          
          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {sortedRoutes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('no_results_found', 'No pages found')}</p>
              </div>
            ) : (
              <div className="p-2">
                {sortedRoutes.map((route, index) => {
                  const isFavorite = favoritePages.includes(route.path);
                  const isRecent = recentPages.includes(route.path);
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <motion.button
                      key={route.path}
                      onClick={() => handleNavigate(route)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg transition-all
                        ${isSelected 
                          ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30' 
                          : 'hover:bg-[#1C2128] border border-transparent'
                        }
                      `}
                    >
                      {/* Favorite Star */}
                      <button
                        onClick={(e) => toggleFavorite(route.path, e)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`w-4 h-4 ${isFavorite ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600'}`}
                        />
                      </button>
                      
                      {/* Content */}
                      <div className="flex-1 text-left" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            {t(route.titleKey)}
                          </span>
                          {getCategoryBadge(route.category)}
                          {isRecent && (
                            <Clock className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <code>/{route.path}</code>
                          {route.roles && route.roles.length > 0 && (
                            <span className="text-[#D4AF37]/60">• {route.roles.join(', ')}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <ArrowIcon className={`w-5 h-5 text-[#D4AF37] transition-transform ${isSelected ? 'scale-125' : ''}`} />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-[#D4AF37]/10 bg-[#0B0F14] text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                <span>{favoritePages.length} {t('favorites', 'favorites')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{recentPages.length} {t('recent', 'recent')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Command className="w-3 h-3" />
              <span>{t('quick_navigation', 'Quick Navigation')}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickNavigation;
