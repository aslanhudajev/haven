import { supabase } from '@shared/config/supabase';

export type PeriodTotal = {
  period_id: string;
  purchase_cents: number;
  goal_cents: number;
  total_cents: number;
};

export async function getPeriodTotals(periodIds: string[]): Promise<Map<string, PeriodTotal>> {
  if (periodIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('period_totals')
    .select('period_id, purchase_cents, goal_cents, total_cents')
    .in('period_id', periodIds);

  if (error) throw error;

  const map = new Map<string, PeriodTotal>();
  for (const row of data ?? []) {
    map.set(row.period_id, {
      period_id: row.period_id,
      purchase_cents: row.purchase_cents,
      goal_cents: row.goal_cents,
      total_cents: row.total_cents,
    });
  }
  return map;
}
