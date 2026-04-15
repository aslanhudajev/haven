import { supabase } from '@shared/config/supabase';
import type { BillingFrequency, FixedCostType, RecurringCost } from '../model/types';

type Patch = Partial<{
  description: string;
  amount_cents: number;
  cost_type: FixedCostType;
  billing_frequency: BillingFrequency;
  default_payer_id: string | null;
  is_active: boolean;
}>;

export async function updateRecurringCost(id: string, patch: Patch): Promise<RecurringCost> {
  const { data, error } = await supabase
    .from('recurring_costs')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as RecurringCost;
}
