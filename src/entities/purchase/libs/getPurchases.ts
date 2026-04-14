import { supabase } from '@shared/config/supabase';
import type { Purchase } from '../model/types';

export async function getPurchases(periodId: string): Promise<Purchase[]> {
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('period_id', periodId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!purchases?.length) return [];

  const userIds = [...new Set(purchases.map((p) => p.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, { full_name: p.full_name }]));

  return purchases.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      ...row,
      category_id: (r.category_id as string | null | undefined) ?? null,
      is_recurring: Boolean(r.is_recurring),
      recurring_cost_id: (r.recurring_cost_id as string | null | undefined) ?? null,
      profile: profileMap.get(row.user_id) ?? null,
    } as Purchase;
  });
}
