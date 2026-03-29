import { supabase } from '@shared/config/supabase';
import type { Cadence } from '@shared/lib/period';
import type { Family } from '../model/types';

type CreateFamilyInput = {
  name: string;
  budget_cents?: number | null;
  currency?: string;
  period_cadence?: Cadence;
  period_anchor_day?: number;
};

export async function createFamily(input: CreateFamilyInput, userId: string): Promise<Family> {
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      name: input.name,
      budget_cents: input.budget_cents ?? null,
      currency: input.currency ?? 'SEK',
      owner_id: userId,
      period_cadence: input.period_cadence ?? 'monthly',
      period_anchor_day: input.period_anchor_day ?? 1,
    })
    .select()
    .single();

  if (familyError) throw familyError;

  const { error: memberError } = await supabase.from('family_members').insert({
    family_id: family.id,
    user_id: userId,
    role: 'owner',
  });

  if (memberError) throw memberError;

  return family as Family;
}
