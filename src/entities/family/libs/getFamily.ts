import { supabase } from '@shared/config/supabase';
import type { Family } from '../model/types';

export async function getFamily(userId: string): Promise<Family | null> {
  const { data: membership } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (!membership) return null;

  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('id', membership.family_id)
    .single();

  if (error) throw error;
  return data as Family;
}
