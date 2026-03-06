import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

const supabaseUrl = typeof process !== 'undefined'
  ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  : (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : '') || '';

const supabaseAnonKey = typeof process !== 'undefined'
  ? process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  : (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : '') || '';

export const createClient = (url, key, options = {}) => {
  return supabaseCreateClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    ...options,
  });
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
