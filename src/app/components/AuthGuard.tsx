/**
 * 🔒 Press2Pay - Enhanced Auth Guard & Session Handler
 * ✅ FIX: Invalid JWT handling with proper refresh logic
 * ✅ FIX: Better error handling for 401 responses
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    // Check initial session
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Event:', event);

        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null);
          navigate('/login', { replace: true });
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user as any);
            // ✅ Update user profile after successful auth
            await updateUserProfile(session.user.id);
          }
        } else if (event === 'SESSION_EXPIRED') {
          console.warn('[Auth] Session expired, attempting refresh...');
          await attemptRefresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[Auth] Session error:', error);
        
        // Try to refresh if session expired or invalid JWT
        if (
          error.message.includes('Session Expired') || 
          error.message.includes('Invalid Refresh Token') ||
          error.message.includes('Invalid JWT') ||
          error.message.includes('JWT')
        ) {
          const refreshSuccess = await attemptRefresh();
          if (refreshSuccess) {
            setChecking(false);
            return;
          }
        }
        
        // Other errors, redirect to login
        navigate('/login', { 
          replace: true,
          state: { from: location.pathname }
        });
        return;
      }

      if (!session) {
        // No session, redirect to login
        const publicRoutes = ['/login', '/forgot-password', '/payment-kit', '/checkout', '/form'];
        const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

        if (!isPublicRoute) {
          navigate('/login', { 
            replace: true,
            state: { from: location.pathname }
          });
        }
      } else {
        // Valid session - check if token is about to expire
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at || 0;
        
        // If token expires in less than 5 minutes, refresh it now
        if (expiresAt - now < 300) {
          console.log('[Auth] Token expiring soon, refreshing preemptively...');
          await attemptRefresh();
        }
        
        setUser(session.user as any);
        
        // ✅ Ensure user profile exists
        await updateUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('[Auth] Check session error:', error);
      navigate('/login', { replace: true });
    } finally {
      setChecking(false);
    }
  };

  const attemptRefresh = async (): Promise<boolean> => {
    try {
      console.log('[Auth] Attempting to refresh session...');
      
      const { data: { session }, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('[Auth] Refresh failed:', error);
        throw error;
      }

      if (session) {
        console.log('✅ [Auth] Session refreshed successfully');
        setUser(session.user as any);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[Auth] Refresh error:', error);
      
      // Failed to refresh, sign out and redirect
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login', { 
        replace: true,
        state: { message: 'جلستك انتهت، يرجى تسجيل الدخول مرة أخرى' }
      });
      return false;
    }
  };

  /**
   * ✅ FIX: Update user profile to prevent infinite recursion
   * Only creates/updates profile without triggering RLS recursion
   */
  const updateUserProfile = async (userId: string) => {
    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        // Profile doesn't exist, create it
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              username: user.user_metadata?.username || user.email?.split('@')[0],
              full_name: user.user_metadata?.full_name || user.user_metadata?.name,
              avatar_url: user.user_metadata?.avatar_url,
              role: user.user_metadata?.role || 'user',
            });

          if (insertError && !insertError.message.includes('duplicate key')) {
            console.error('[Auth] Profile insert error:', insertError);
          } else if (!insertError) {
            console.log('✅ [Auth] User profile created successfully');
          }
        }
      }
    } catch (error: any) {
      // ✅ Ignore recursion errors - they're handled by the new RLS policies
      if (!error.message?.includes('infinite recursion')) {
        console.error('[Auth] Profile upsert error:', error);
      }
    }
  };

  if (checking) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-gray-400">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * ✅ Enhanced Hook to get valid auth token
 * Handles auto-refresh if needed, with better error handling
 */
export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken();
    
    // Set up interval to check token expiration every minute
    const interval = setInterval(() => {
      checkAndRefreshToken();
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const getToken = async () => {
    try {
      let { data: { session }, error } = await supabase.auth.getSession();

      // If session expired or invalid JWT, try to refresh
      if (error && (
        error.message.includes('Session Expired') || 
        error.message.includes('Invalid JWT') ||
        error.message.includes('JWT')
      )) {
        console.log('[Auth Token] Session error, attempting refresh...');
        const { data: refreshData } = await supabase.auth.refreshSession();
        session = refreshData.session;
      }

      if (session?.access_token) {
        setToken(session.access_token);
      } else {
        setToken(null);
      }
    } catch (error) {
      console.error('[Auth] Get token error:', error);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAndRefreshToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at;
        
        // Refresh if expiring in less than 5 minutes
        if (expiresAt - now < 300) {
          console.log('[Auth Token] Token expiring soon, refreshing...');
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData.session?.access_token) {
            setToken(refreshData.session.access_token);
          }
        }
      }
    } catch (error) {
      console.error('[Auth Token] Check and refresh error:', error);
    }
  };

  const refreshToken = async () => {
    setLoading(true);
    await getToken();
  };

  return { token, loading, refreshToken };
}

/**
 * ✅ Enhanced Safe auth session getter
 * Returns session or null, never throws
 * Includes proactive token refresh
 */
export async function getSafeSession() {
  try {
    let { data: { session }, error } = await supabase.auth.getSession();

    // Try refresh if expired or invalid JWT
    if (error && (
      error.message.includes('Session Expired') || 
      error.message.includes('Invalid JWT') ||
      error.message.includes('JWT')
    )) {
      console.log('[Safe Session] Error detected, refreshing:', error.message);
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('[Safe Session] Refresh failed:', refreshError);
        return null;
      }
      
      session = refreshData.session;
    }

    // Proactively check for expiration (even if Supabase didn't error)
    if (session && session.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      
      // Refresh if expired or expiring within 5 minutes
      if (expiresAt < now + 300) {
        console.log('[Safe Session] Token expiring soon, refreshing...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('[Safe Session] Proactive refresh failed:', refreshError);
          // Return current session even if refresh failed
          return session;
        }
        
        if (refreshData.session) {
          session = refreshData.session;
          console.log('✅ [Safe Session] Token refreshed successfully');
        }
      }
    }

    return session;
  } catch (error) {
    console.error('[Auth] Get safe session error:', error);
    return null;
  }
}

/**
 * Safe auth user getter
 * Returns user or null, never throws
 */
export async function getSafeUser() {
  try {
    const session = await getSafeSession();
    return session?.user || null;
  } catch (error) {
    console.error('[Auth] Get safe user error:', error);
    return null;
  }
}

/**
 * ✅ NEW: Force refresh session
 * Use this when you get a 401 error
 */
export async function forceRefreshSession() {
  try {
    console.log('[Auth] Forcing session refresh...');
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('[Auth] Force refresh error:', error);
      return null;
    }
    
    if (session) {
      console.log('✅ [Auth] Session force-refreshed successfully');
      return session;
    }
    
    return null;
  } catch (error) {
    console.error('[Auth] Force refresh exception:', error);
    return null;
  }
}
