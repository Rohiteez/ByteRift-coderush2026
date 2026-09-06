import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    (!!supabaseServiceRoleKey || !!supabaseAnonKey)
  );
};

// Use service role key if available for administrative DB operations, otherwise anon key
const keyToUse = supabaseServiceRoleKey || supabaseAnonKey;

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, keyToUse, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

if (isSupabaseConfigured()) {
  console.log(`[Supabase] Successfully configured client connected to: ${supabaseUrl}`);
} else {
  console.warn('[Supabase] Warning: SUPABASE_URL or API keys are not set in .env. Running in integrated memory-persistence fallback mode.');
}
