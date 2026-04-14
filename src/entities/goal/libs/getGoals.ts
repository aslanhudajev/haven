import { supabase } from '@shared/config/supabase';
import type { Goal } from '../model/types';

export async function getGoals(familyId: string): Promise<Goal[]> {
  const { data: goals, error } = await supabase
    .from('goals')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!goals?.length) return [];

  const ids = goals.map((g) => g.id);
  const { data: sums } = await supabase
    .from('goal_contributions')
    .select('goal_id, amount_cents')
    .in('goal_id', ids);

  const sumMap = new Map<string, number>();
  (sums ?? []).forEach((row) => {
    sumMap.set(row.goal_id, (sumMap.get(row.goal_id) ?? 0) + row.amount_cents);
  });

  return goals.map((g) => ({
    ...g,
    current_cents: sumMap.get(g.id) ?? 0,
  })) as Goal[];
}
