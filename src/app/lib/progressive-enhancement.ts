/**
 * Progressive Enhancement Utilities
 * Enables hybrid SSR + Client-side rendering
 */

import { useState, useEffect } from 'react';
import { useSSRData } from '../components/SSRWrapper';

/**
 * Hook for progressive data loading
 * Uses SSR data initially, then switches to client-side updates
 */
export function useProgressiveData<T>(
  fetchFn: () => Promise<T>,
  options: {
    ssrKey?: string;
    revalidate?: boolean;
    interval?: number;
  } = {}
) {
  const { ssrKey = 'data', revalidate = true, interval } = options;
  const ssrData = useSSRData<any>();
  
  // Get initial data from SSR or undefined
  const initialData = ssrData?.[ssrKey];
  
  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isSSR, setIsSSR] = useState(!!initialData);

  // Fetch data client-side
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      setError(null);
      setIsSSR(false);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have SSR data and don't want to revalidate, skip fetch
    if (initialData && !revalidate) {
      console.log('[Progressive Enhancement] Using SSR data only');
      return;
    }

    // If we have SSR data, wait a bit before revalidating
    if (initialData && revalidate) {
      console.log('[Progressive Enhancement] Revalidating SSR data...');
      const timer = setTimeout(() => {
        fetchData();
      }, 1000);
      return () => clearTimeout(timer);
    }

    // If no SSR data, fetch immediately
    if (!initialData) {
      console.log('[Progressive Enhancement] No SSR data, fetching client-side...');
      fetchData();
    }
  }, []);

  // Setup polling if interval is provided
  useEffect(() => {
    if (!interval) return;

    const timer = setInterval(() => {
      fetchData();
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return {
    data,
    loading,
    error,
    isSSR,
    refetch: fetchData,
  };
}

/**
 * Hook for real-time data with SSR fallback
 * Combines SSR initial data with Supabase real-time subscriptions
 */
export function useRealtimeData<T>(
  ssrKey: string,
  subscribeFn: (callback: (data: T) => void) => () => void,
  options: {
    enabled?: boolean;
  } = {}
) {
  const { enabled = true } = options;
  const ssrData = useSSRData<any>();
  
  const initialData = ssrData?.[ssrKey];
  const [data, setData] = useState<T | null>(initialData || null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    console.log('[Realtime Enhancement] Setting up subscription...');
    setIsSubscribed(true);

    const unsubscribe = subscribeFn((newData: T) => {
      console.log('[Realtime Enhancement] Received update');
      setData(newData);
    });

    return () => {
      console.log('[Realtime Enhancement] Cleaning up subscription');
      setIsSubscribed(false);
      unsubscribe();
    };
  }, [enabled]);

  return {
    data,
    isSubscribed,
    isSSR: !!initialData && !isSubscribed,
  };
}

/**
 * Hybrid data fetching strategy
 * Automatically chooses between SSR, client fetch, or real-time
 */
export function useHybridData<T>(config: {
  ssrKey: string;
  fetchFn?: () => Promise<T>;
  subscribeFn?: (callback: (data: T) => void) => () => void;
  strategy: 'ssr-only' | 'ssr-then-fetch' | 'ssr-then-realtime' | 'client-only';
  revalidateInterval?: number;
}) {
  const {
    ssrKey,
    fetchFn,
    subscribeFn,
    strategy,
    revalidateInterval,
  } = config;

  const ssrData = useSSRData<any>();
  const initialData = ssrData?.[ssrKey];

  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [mode, setMode] = useState<'ssr' | 'client' | 'realtime'>(
    initialData ? 'ssr' : 'client'
  );

  // SSR only
  if (strategy === 'ssr-only') {
    return { data, loading: false, mode: 'ssr' as const };
  }

  // SSR then fetch
  if (strategy === 'ssr-then-fetch' && fetchFn) {
    const progressive = useProgressiveData(fetchFn, {
      ssrKey,
      revalidate: true,
      interval: revalidateInterval,
    });

    return {
      data: progressive.data,
      loading: progressive.loading,
      mode: progressive.isSSR ? ('ssr' as const) : ('client' as const),
      refetch: progressive.refetch,
    };
  }

  // SSR then realtime
  if (strategy === 'ssr-then-realtime' && subscribeFn) {
    const realtime = useRealtimeData(ssrKey, subscribeFn, { enabled: true });

    return {
      data: realtime.data,
      loading: false,
      mode: realtime.isSSR ? ('ssr' as const) : ('realtime' as const),
    };
  }

  // Client only
  if (strategy === 'client-only' && fetchFn) {
    const progressive = useProgressiveData(fetchFn, {
      ssrKey,
      revalidate: false,
    });

    return {
      data: progressive.data,
      loading: progressive.loading,
      mode: 'client' as const,
      refetch: progressive.refetch,
    };
  }

  return { data, loading, mode };
}

/**
 * Performance monitoring for SSR vs Client rendering
 */
export function useRenderMetrics(pageName: string) {
  const ssrData = useSSRData<any>();
  const isSSR = !!ssrData?.serverRendered;

  useEffect(() => {
    const metrics = {
      page: pageName,
      renderType: isSSR ? 'SSR' : 'Client',
      timestamp: new Date().toISOString(),
    };

    if (isSSR && ssrData?.renderedAt) {
      const serverTime = new Date(ssrData.renderedAt).getTime();
      const clientTime = new Date().getTime();
      const hydrationTime = clientTime - serverTime;

      console.log(`[Performance] ${pageName}:`, {
        ...metrics,
        hydrationTime: `${hydrationTime}ms`,
        serverRenderedAt: ssrData.renderedAt,
      });
    } else {
      console.log(`[Performance] ${pageName}:`, metrics);
    }
  }, []);

  return { isSSR };
}
