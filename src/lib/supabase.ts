import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://fwkcwfmrfwkgydpmxaig.supabase.co';
const ANON_PLACEHOLDER = 'ADD_PUBLIC_ANON_KEY_HERE';
const PUBLISHABLE_PLACEHOLDER = 'ADD_PUBLIC_PUBLISHABLE_KEY_HERE';

const rawSupabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const rawAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
const rawPublishableKey = String(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''
).trim();

export const supabaseUrl = rawSupabaseUrl || FALLBACK_SUPABASE_URL;
export const publicAnonKey =
  rawAnonKey && rawAnonKey !== ANON_PLACEHOLDER
    ? rawAnonKey
    : rawPublishableKey && rawPublishableKey !== PUBLISHABLE_PLACEHOLDER
      ? rawPublishableKey
      : '';

export const getProjectIdFromUrl = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('.supabase.co', '');
  } catch {
    return '';
  }
};

export const projectId = getProjectIdFromUrl(supabaseUrl);

export const getSupabaseConfigIssues = () => {
  const issues: string[] = [];

  if (!rawSupabaseUrl) {
    issues.push('VITE_SUPABASE_URL is missing.');
  } else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(rawSupabaseUrl)) {
    issues.push('VITE_SUPABASE_URL must look like https://your-project.supabase.co');
  }

  const hasAnonKey = rawAnonKey && rawAnonKey !== ANON_PLACEHOLDER;
  const hasPublishableKey =
    rawPublishableKey && rawPublishableKey !== PUBLISHABLE_PLACEHOLDER;

  if (!hasAnonKey && !hasPublishableKey) {
    issues.push(
      'Provide VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  return issues;
};

export const isSupabaseConfigured = getSupabaseConfigIssues().length === 0;

export const requiredFrontendEnv = [
  {
    key: 'VITE_SUPABASE_URL',
    example: FALLBACK_SUPABASE_URL,
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    example: ANON_PLACEHOLDER,
  },
  {
    key: 'VITE_SUPABASE_PUBLISHABLE_KEY',
    example: PUBLISHABLE_PLACEHOLDER,
  },
];

export const supabase = createClient(
  supabaseUrl,
  publicAnonKey || 'missing-public-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'p2p-auth-token',
    },
  }
);
