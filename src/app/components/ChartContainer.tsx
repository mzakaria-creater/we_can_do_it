import React from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * Recharts Container Wrapper
 * Fixes the "width(0) and height(0)" error by ensuring proper dimensions
 */

interface ChartContainerProps {
  children: React.ReactNode;
  height?: number | string;
  width?: string;
  minHeight?: number;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
  height = 300,
  width = '100%',
  minHeight = 300,
  className = ''
}) => {
  return (
    <div 
      className={className}
      style={{ 
        width: width,
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: minHeight ? `${minHeight}px` : undefined,
        position: 'relative'
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartContainer;
