import { supabase } from '@shared/config/supabase';
import type { Goal } from '../model/types';

export async function getGoal(goalId: string): Promise<Goal | null> {
  const { data, error } = await supabase.from('goals').select('*').eq('id', goalId).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: sums, error: sumErr } = await supabase
    .from('goal_contributions')
    .select('amount_cents')
    .eq('goal_id', goalId);

  if (sumErr) throw sumErr;
  const current_cents = (sums ?? []).reduce((s, r) => s + r.amount_cents, 0);

  return { ...(data as Goal), current_cents };
}
