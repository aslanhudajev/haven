import { supabase } from '@shared/config/supabase';

export async function deletePurchase(purchaseId: string) {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', purchaseId);

  if (error) throw error;
}
