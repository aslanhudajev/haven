import {createClient, type SupabaseClient} from '@supabase/supabase-js'
import {supabaseStorage} from '@shared/storage/supabase-storage'
import {Database} from './database'
import {Env} from '@shared/lib/env'

const projectUrl = Env.EXPO_PUBLIC_SUPABASE_PROJECT_URL
const anonKey = Env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!projectUrl || !anonKey) {
  console.warn(
    '❌ Supabase not initialized: missing environment variables.\n' +
    'Please set EXPO_PUBLIC_SUPABASE_PROJECT_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.\n' +
    'The app will continue to work, but Supabase functionality will be unavailable.'
  )
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
    : (null as unknown as SupabaseClient<Database>)
