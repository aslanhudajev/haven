import { supabase } from '@shared/config/supabase';

export async function deleteRecurringCost(id: string): Promise<void> {
  const { error } = await supabase.from('recurring_costs').delete().eq('id', id);
  if (error) throw error;
}
