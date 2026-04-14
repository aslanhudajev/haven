import { supabase } from '@shared/config/supabase';

export async function claimRecurringPurchase(purchaseId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .eq('id', purchaseId)
    .eq('is_recurring', true);

  if (error) throw error;
}
