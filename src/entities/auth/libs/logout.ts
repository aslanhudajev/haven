import { supabase } from '@shared/config/supabase';

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
