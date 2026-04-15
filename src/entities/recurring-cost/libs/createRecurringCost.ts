import { supabase } from '@shared/config/supabase';
import type { BillingFrequency, FixedCostType, RecurringCost } from '../model/types';

type Input = {
  familyId: string;
  description: string;
  amountCents: number;
  costType: FixedCostType;
  billingFrequency?: BillingFrequency;
  defaultPayerId?: string | null;
};

export async function createRecurringCost(input: Input): Promise<RecurringCost> {
  const { data, error } = await supabase
    .from('recurring_costs')
    .insert({
      family_id: input.familyId,
      description: input.description.trim(),
      amount_cents: input.amountCents,
      cost_type: input.costType,
      billing_frequency: input.billingFrequency ?? 'monthly',
      default_payer_id: input.defaultPayerId ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as RecurringCost;
}
