import React from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { routesMetadata } from '../routes';

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

export const Breadcrumbs: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useStore();
  const location = useLocation();
  const isRTL = language === 'ar';
  
  // Parse current path
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  // Remove language prefix
  if (pathParts[0] === 'ar' || pathParts[0] === 'en') {
    pathParts.shift();
  }
  
  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Add home
  breadcrumbs.push({
    label: t('dashboard'),
    path: `/${language}/dashboard`,
    isLast: pathParts.length === 0 || pathParts[0] === 'dashboard',
  });
  
  // Skip if only dashboard
  if (pathParts.length === 0 || pathParts[0] === 'dashboard') {
    return null;
  }
  
  // Build path progressively
  let currentPath = '';
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    const fullPath = `/${language}${currentPath}`;
    
    // Find metadata for this path segment
    const metadata = Object.values(routesMetadata).find(route => {
      const routePath = route.path.split('/');
      const currentSegments = pathParts.slice(0, index + 1);
      
      // Check if path matches (including dynamic params)
      if (routePath.length !== currentSegments.length) return false;
      
      return routePath.every((segment, i) => {
        if (segment.startsWith(':')) return true; // Dynamic param
        return segment === currentSegments[i];
      });
    });
    
    // Determine label
    let label = part;
    if (metadata) {
      label = t(metadata.titleKey);
    } else if (part.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // UUID detected
      label = part.slice(0, 8);
    } else {
      // Capitalize and replace hyphens
      label = part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    breadcrumbs.push({
      label,
      path: fullPath,
      isLast: index === pathParts.length - 1,
    });
  });
  
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm mb-4 px-1"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronIcon 
                className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            
            {index === 0 && (
              <Home 
                className="w-4 h-4 text-[#D4AF37] flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            
            {crumb.isLast ? (
              <span 
                className="text-[#D4AF37] font-medium max-w-[200px] truncate"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-gray-400 dark:text-gray-500 hover:text-[#D4AF37] 
                         transition-colors max-w-[200px] truncate"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </motion.nav>
  );
};

export default Breadcrumbs;
