/**
 * Supabase SSR Utilities for React Router 7
 * Provides server-side authentication and data fetching
 */

import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase as browserSupabase } from '../../lib/supabase';

// Type definitions
export interface SSRSupabaseClient {
  supabase: any;
  headers: Headers;
  response: {
    headers: Headers;
  };
}

export interface UserSession {
  authenticated: boolean;
  user: any | null;
  role: string | null;
  session: any | null;
}

/**
 * Creates a Supabase client for server-side rendering
 * Handles cookie parsing and serialization automatically
 * On client side, returns the shared browser client
 */
export function createSSRSupabaseClient(request: Request): SSRSupabaseClient {
  const headers = new Headers();

  // If we are in the browser, return the singleton browser client
  if (typeof window !== 'undefined') {
    return {
      supabase: browserSupabase,
      headers,
      response: { headers },
    };
  }

  const supabaseUrl = `https://${projectId}.supabase.co`;
  const supabaseAnonKey = publicAnonKey;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '');
      },
      setAll(cookiesToSet) {
        // Forward new/updated cookies to the client
        for (const { name, value, options } of cookiesToSet) {
          headers.append('Set-Cookie', serializeCookieHeader(name, value, options));
        }
      },
    },
  });

  return {
    supabase,
    headers,
    response: { headers },
  };
}

/**
 * Gets the current user session from the request
 * Returns session details including profile from KV store
 */
export async function getServerSession(request: Request): Promise<UserSession & { profile: any }> {
  const { supabase } = createSSRSupabaseClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      authenticated: false,
      user: null,
      role: null,
      session: null,
      profile: null
    };
  }

  const { data: { session } } = await supabase.auth.getSession();
  
  // Standard role from metadata
  const role = user.user_metadata?.role ?? 'user';

  // Fetch full profile from our server (which manages the KV store)
  // This is the source of truth for Press2Pay
  let profile = null;
  try {
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/auth/session`;
    
    const response = await fetch(serverUrl, {
      headers: {
        'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      profile = data.profile;
    }
  } catch (err) {
    console.warn('[Session] Failed to fetch profile from KV store, using metadata fallback:', err);
    profile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name,
      username: user.user_metadata?.username,
      avatar_url: user.user_metadata?.avatar_url
    };
  }

  return {
    authenticated: true,
    user: { id: user.id, email: user.email },
    role,
    profile,
    session,
    accessToken: session?.access_token
  } as any;
}

/**
 * Alias for getServerSession for backward compatibility
 */
export const getSession = getServerSession;

/**
 * Validates user has required role
 * Throws 403 error if role check fails
 */
export function validateRole(userRole: string | null, allowedRoles: string[]): void {
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Requires authentication for a route
 * Redirects to /login if not authenticated
 */
export async function requireAuth(request: Request) {
  const session = await getSession(request);

  if (!session.authenticated) {
    throw new Response(null, {
      status: 302,
      headers: {
        Location: '/login',
      },
    });
  }

  return session;
}

/**
 * Requires specific role for a route
 * Returns 403 if user doesn't have required role
 */
export async function requireRole(request: Request, allowedRoles: string[]) {
  const session = await requireAuth(request);
  validateRole(session.role, allowedRoles);
  return session;
}
