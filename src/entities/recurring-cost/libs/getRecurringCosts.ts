import { supabase } from '@shared/config/supabase';
import type { RecurringCost } from '../model/types';

export async function getRecurringCosts(familyId: string): Promise<RecurringCost[]> {
  const { data, error } = await supabase
    .from('recurring_costs')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as RecurringCost[];
}
