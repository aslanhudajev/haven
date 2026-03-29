import { supabase } from '@shared/config/supabase';

/** Family owner removes another member (RLS must allow the delete). */
export async function removeFamilyMember(memberRowId: string): Promise<void> {
  const { error } = await supabase.from('family_members').delete().eq('id', memberRowId);

  if (error) throw error;
}
