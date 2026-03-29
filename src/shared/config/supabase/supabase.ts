import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseStorage } from '@shared/storage/supabase-storage';
import { Env } from '@shared/lib/env';
import type { Database } from './database';

const projectUrl = Env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = Env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!projectUrl || !anonKey) {
  console.warn(
    'Supabase not initialized: missing environment variables.\n' +
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local',
  );
}

export const supabase =
  projectUrl && anonKey
    ? createClient<Database>(projectUrl, anonKey, {
        auth: {
          storage: supabaseStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : (null as unknown as SupabaseClient<Database>);
