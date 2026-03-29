import { supabase } from '@shared/config/supabase';
import { removeReceiptFromStorage } from './receiptStorage';

export async function deletePurchase(purchaseId: string) {
  const { data: row } = await supabase
    .from('purchases')
    .select('receipt_url')
    .eq('id', purchaseId)
    .maybeSingle();

  if (row?.receipt_url) {
    try {
      await removeReceiptFromStorage(row.receipt_url);
    } catch {
      /* best-effort; row delete still runs */
    }
  }

  const { error } = await supabase.from('purchases').delete().eq('id', purchaseId);
  if (error) throw error;
}
