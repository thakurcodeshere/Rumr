import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
}

export function validateProductionSupabaseConfig(): void {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  if (isProd) {
    if (!process.env.SUPABASE_URL) {
      throw new Error('[FATAL_CONFIG_ERROR] SUPABASE_URL environment variable is required in production.');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('[FATAL_CONFIG_ERROR] SUPABASE_SERVICE_ROLE_KEY is required in production to authorize backend database operations under RLS.');
    }
  }
}

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  validateProductionSupabaseConfig();
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  const supabaseUrl = process.env.SUPABASE_URL || (!isProd ? 'https://hjqkfxwkfctrivfftmwv.supabase.co' : '');
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || (!isProd ? 'sb_publishable_9rLauMh7QrTGWzhRs9ALTA_oS04TtkZ' : '');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('[FATAL_CONFIG_ERROR] Cannot initialize Supabase client: missing SUPABASE_URL or key.');
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return client;
}

export const supabase = getSupabaseClient();
