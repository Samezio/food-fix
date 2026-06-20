import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials with priority on environment variables
export const getSupabaseCredentials = () => {
  const metaEnv = (import.meta as any).env || {};
  
  // URL configurations
  const envUrl = 
    metaEnv.VITE_SUPABASE_URL || 
    metaEnv.VITE_SUPABASE_PROJECT_URL;

  // Anon / Publishable keys
  const envKey = 
    metaEnv.VITE_SUPABASE_ANON_KEY || 
    metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY || 
    metaEnv.VITE_SUPABASE_PUBLIC_KEY || 
    metaEnv.VITE_SUPABASE_KEY;

  if (envUrl && envKey) {
    return { url: envUrl.trim(), key: envKey.trim(), source: 'env' };
  }

  const localUrl = localStorage.getItem('local_supabase_url');
  const localKey = localStorage.getItem('local_supabase_key');

  if (localUrl && localKey) {
    return { url: localUrl.trim(), key: localKey.trim(), source: 'local' };
  }

  return null;
};

// Initialize the Supabase Client
export const getSupabaseClient = (): SupabaseClient | null => {
  const credentials = getSupabaseCredentials();
  if (!credentials || !credentials.url || !credentials.key) return null;
  try {
    return createClient(credentials.url, credentials.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

// Live client reference that can be refreshed dynamically
export let supabase = getSupabaseClient();

export const refreshSupabaseClient = (): SupabaseClient | null => {
  supabase = getSupabaseClient();
  return supabase;
};

// Credentials helpers
export const saveCredentialsToLocal = (url: string, key: string) => {
  localStorage.setItem('local_supabase_url', url);
  localStorage.setItem('local_supabase_key', key);
  refreshSupabaseClient();
};

export const clearCredentialsFromLocal = () => {
  localStorage.removeItem('local_supabase_url');
  localStorage.removeItem('local_supabase_key');
  refreshSupabaseClient();
};

export const isConfigured = () => {
  return getSupabaseCredentials() !== null;
};
