import { supabase } from '@shared/config/supabase';

export async function transferFamilyOwnership(newOwnerUserId: string): Promise<void> {
  const { error } = await supabase.rpc('transfer_family_ownership', {
    p_new_owner_user_id: newOwnerUserId,
  });

  if (error) throw error;
}
