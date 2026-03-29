import { supabase } from '@shared/config/supabase';
import type { Purchase } from '../model/types';

type AddPurchaseInput = {
  family_id: string;
  period_id: string;
  user_id: string;
  amount_cents: number;
  description?: string;
  receipt_url?: string;
};

export async function addPurchase(input: AddPurchaseInput): Promise<Purchase> {
  const { data, error } = await supabase
    .from('purchases')
    .insert({
      family_id: input.family_id,
      period_id: input.period_id,
      user_id: input.user_id,
      amount_cents: input.amount_cents,
      description: input.description ?? null,
      receipt_url: input.receipt_url ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Purchase;
}
