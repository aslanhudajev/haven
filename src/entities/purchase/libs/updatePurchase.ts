import { supabase } from '@shared/config/supabase';
import type { Purchase } from '../model/types';

type UpdatePurchasePatch = {
  amount_cents?: number;
  description?: string | null;
  receipt_url?: string | null;
  category_id?: string | null;
};

export async function updatePurchase(
  purchaseId: string,
  patch: UpdatePurchasePatch,
): Promise<Purchase> {
  const { data, error } = await supabase
    .from('purchases')
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchaseId)
    .select()
    .single();

  if (error) throw error;
  return data as Purchase;
}
