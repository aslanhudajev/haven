import { supabase } from '@shared/config/supabase';
import type { Family } from '../model/types';

type UpdateFamilyInput = Partial<
  Pick<Family, 'name' | 'budget_cents' | 'currency' | 'period_cadence' | 'period_anchor_day'>
>;

export async function updateFamily(familyId: string, updates: UpdateFamilyInput): Promise<Family> {
  const { data, error } = await supabase
    .from('families')
    .update(updates)
    .eq('id', familyId)
    .select()
    .single();

  if (error) throw error;
  return data as Family;
}
