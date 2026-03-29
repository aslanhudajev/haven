import { supabase } from '@shared/config/supabase';

/** Removes the current user from their family. Owners cannot use this — transfer ownership first. */
export async function leaveFamily(userId: string): Promise<void> {
  const { data: row, error: readError } = await supabase
    .from('family_members')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (readError) throw readError;

  if (row?.role === 'owner') {
    throw new Error(
      'Family owners cannot leave this way. Transfer ownership in family settings, or delete the family.',
    );
  }

  const { error } = await supabase.from('family_members').delete().eq('user_id', userId);

  if (error) throw error;
}
