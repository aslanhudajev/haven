import { supabase } from '@shared/config/supabase';
import type { GoalContribution } from '../model/types';

export type GoalContributionWithGoal = GoalContribution & {
  goal: { name: string; icon: string; color: string };
};

type RawRow = {
  id: string;
  goal_id: string;
  user_id: string;
  period_id: string | null;
  amount_cents: number;
  note: string | null;
  created_at: string;
  goals: { name: string; icon: string; color: string } | null;
};

export async function getGoalContributionsForPeriod(
  periodId: string,
): Promise<GoalContributionWithGoal[]> {
  const { data: rows, error } = await supabase
    .from('goal_contributions')
    .select('*, goals(name, icon, color)')
    .eq('period_id', periodId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!rows?.length) return [];

  const typed = rows as unknown as RawRow[];
  const userIds = [...new Set(typed.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, { full_name: p.full_name }]));

  return typed.map((row) => {
    const { goals: g, ...base } = row;
    return {
      ...base,
      period_id: base.period_id ?? null,
      goal: g ?? { name: 'Goal', icon: 'flag-outline', color: '#208AEF' },
      profile: profileMap.get(base.user_id) ?? undefined,
    };
  });
}
