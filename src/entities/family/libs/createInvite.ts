import { supabase } from '@shared/config/supabase';
import type { FamilyInvite } from '../model/types';

export async function createInvite(familyId: string, userId: string): Promise<FamilyInvite> {
  const { data, error } = await supabase
    .from('family_invites')
    .insert({ family_id: familyId, created_by: userId })
    .select()
    .single();

  if (error) throw error;
  return data as FamilyInvite;
}
