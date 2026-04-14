import { supabase } from '@shared/config/supabase';
import type { GoalContribution } from '../model/types';

export async function getGoalContributions(goalId: string): Promise<GoalContribution[]> {
  const { data: rows, error } = await supabase
    .from('goal_contributions')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!rows?.length) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, { full_name: p.full_name }]));

  return rows.map((r) => ({
    ...r,
    profile: profileMap.get(r.user_id) ?? null,
  })) as GoalContribution[];
}
