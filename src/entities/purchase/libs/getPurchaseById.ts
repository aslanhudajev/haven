import { supabase } from '@shared/config/supabase';
import type { Purchase } from '../model/types';

export async function getPurchaseById(purchaseId: string): Promise<Purchase | null> {
  const { data: row, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('id', purchaseId)
    .maybeSingle();

  if (error) throw error;
  if (!row) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', row.user_id)
    .maybeSingle();

  return {
    ...row,
    profile: profile ? { full_name: profile.full_name } : undefined,
  } as Purchase;
}
