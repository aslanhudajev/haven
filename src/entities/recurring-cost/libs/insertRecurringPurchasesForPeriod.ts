import { supabase } from '@shared/config/supabase';
import { prorateCost } from './prorateCost';
import type { BillingFrequency, RecurringCost } from '../model/types';

function daysBetween(startsAt: string, endsAt: string): number {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  return Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1;
}

/**
 * Creates one purchase per active recurring cost for a period.
 * Amounts are prorated when the cost's billing frequency differs from
 * the period length. Idempotent via unique index on (period_id, recurring_cost_id).
 */
export async function insertRecurringPurchasesForPeriod(params: {
  familyId: string;
  periodId: string;
  periodStartsAt: string;
  periodEndsAt: string;
  ownerId: string;
  costs: RecurringCost[];
}): Promise<void> {
  const { familyId, periodId, periodStartsAt, periodEndsAt, ownerId, costs } = params;
  const active = costs.filter((c) => c.is_active);
  if (active.length === 0) return;

  const periodDays = daysBetween(periodStartsAt, periodEndsAt);

  const rows = active.map((c) => ({
    family_id: familyId,
    period_id: periodId,
    user_id: c.default_payer_id ?? ownerId,
    amount_cents: prorateCost(
      c.amount_cents,
      (c.billing_frequency as BillingFrequency) || 'monthly',
      periodDays,
    ),
    description: c.description,
    category_id: null,
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
