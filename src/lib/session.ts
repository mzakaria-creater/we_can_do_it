/**
 * 🔒 Press2Pay - Session Management
 * Handles session refresh and auth errors gracefully
 */

import { supabase } from './supabase';

/**
 * Get valid session with auto-refresh
 */
export async function getValidSession() {
  try {
    let { data: { session }, error } = await supabase.auth.getSession();

    // If session expired, try to refresh
    if (error && error.message.includes('Session Expired')) {
      console.log('[Session] Attempting to refresh expired session...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('[Session] Refresh failed:', refreshError);
        return null;
      }
      
      session = refreshData.session;
      console.log('[Session] Session refreshed successfully');
    }

    return session;
  } catch (error) {
    console.error('[Session] Error getting session:', error);
    return null;
  }
}

/**
 * Get auth token with auto-refresh
 */
export async function getAuthToken() {
  const session = await getValidSession();
  return session?.access_token || null;
}

/**
 * Handle auth errors gracefully
 * @returns true if error was handled, false otherwise
 */
export function handleAuthError(error: any): boolean {
  const errorMessage = error?.message || String(error);
  
  // Session expired errors
  if (errorMessage.includes('Session Expired') || errorMessage.includes('Invalid Refresh Token')) {
    console.warn('[Auth] Session expired:', errorMessage);
    // Handled by auto-refresh
    return true;
  }
  
  // Invalid token errors
  if (errorMessage.includes('Invalid token') || errorMessage.includes('JWT')) {
    console.warn('[Auth] Invalid token:', errorMessage);
    // Will be handled by auth state change
    return true;
  }
  
  // Network errors
  if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
    console.warn('[Auth] Network error:', errorMessage);
    // Temporary error, don't logout
    return true;
  }
  
  return false;
}

/**
 * Safe API call with auth token
 */
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
) {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('No valid auth token');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}
