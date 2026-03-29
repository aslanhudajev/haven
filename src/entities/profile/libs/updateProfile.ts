import { supabase } from '@shared/config/supabase';
import type { Profile } from '../model/types';

type UpdateProfileInput = {
  full_name?: string;
  avatar_url?: string | null;
  onboarding_completed?: boolean;
};

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}
