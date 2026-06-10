import { projectId } from '../../utils/supabase/info';

/**
 * API Configuration for Press2Pay
 * Centralized API endpoints to prevent URL mismatches
 */

// Correct Edge Function name is 'server', not 'make-server-46c3f42b'
// The '/make-server-46c3f42b' is the route prefix INSIDE the function
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b`;

// Alternative: if you're running locally
export const API_BASE_URL_LOCAL = 'http://localhost:54321/functions/v1/make-server-46c3f42b';

// Use this in your components
export const getApiUrl = (endpoint: string) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Export for backward compatibility
export { projectId };
