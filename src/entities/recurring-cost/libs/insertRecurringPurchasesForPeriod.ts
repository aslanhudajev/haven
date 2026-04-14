import { supabase } from '@shared/config/supabase';
import type { RecurringCost } from '../model/types';

/**
 * Creates one purchase per active recurring cost for a newly opened period.
 * Idempotent via unique index on (period_id, recurring_cost_id).
 */
export async function insertRecurringPurchasesForPeriod(params: {
  familyId: string;
  periodId: string;
  ownerId: string;
  costs: RecurringCost[];
}): Promise<void> {
  const { familyId, periodId, ownerId, costs } = params;
  const active = costs.filter((c) => c.is_active);
  if (active.length === 0) return;

  const rows = active.map((c) => ({
    family_id: familyId,
    period_id: periodId,
    user_id: c.default_payer_id ?? ownerId,
    amount_cents: c.amount_cents,
    description: c.description,
    category_id: c.category_id,
    is_recurring: true,
    recurring_cost_id: c.id,
  }));

  const { error } = await supabase.from('purchases').insert(rows);
  if (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = (error as { code: string }).code;
      if (code === '23505') return;
    }
    throw error;
  }
}
