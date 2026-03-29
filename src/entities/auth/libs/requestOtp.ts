import { supabase } from '@shared/config/supabase';

export async function requestOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) throw error;
}
