/**
 * SSR Wrapper Component
 * Provides SSR data to components via useLoaderData
 * Falls back to client-side rendering if no loader data exists
 */

import React from 'react';
import { useLoaderData } from 'react-router';

interface SSRWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wraps components to provide SSR support
 * Renders children if loader data exists, otherwise renders fallback
 */
export const SSRWrapper: React.FC<SSRWrapperProps> = ({ children, fallback }) => {
  const loaderData = useLoaderData();

  // If we have loader data, render with SSR
  if (loaderData) {
    return <>{children}</>;
  }

  // Otherwise fall back to client-side rendering
  return <>{fallback || children}</>;
};

/**
 * Hook to safely access loader data
 * Returns null if no loader data exists (client-side only mode)
 */
export function useSSRData<T = any>(): T | null {
  try {
    const data = useLoaderData() as T;
    return data || null;
  } catch {
    return null;
  }
}

/**
 * Check if component is being rendered with SSR data
 */
export function useIsSSR(): boolean {
  try {
    const data = useLoaderData();
    return !!data && typeof data === 'object' && 'serverRendered' in data;
  } catch {
    return false;
  }
}
