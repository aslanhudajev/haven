import { supabase } from '@shared/config/supabase';
import { periodLog } from '@shared/lib/debug';
import { toLocalCalendarISODate } from '@shared/lib/format';
import type { Cadence } from '@shared/lib/period';
import { getRecurringCosts } from '../../recurring-cost/libs/getRecurringCosts';
import { insertRecurringPurchasesForPeriod } from '../../recurring-cost/libs/insertRecurringPurchasesForPeriod';
import { archivePeriod } from './archivePeriod';
import { createPeriod } from './createPeriod';
import { getActivePeriod } from './getPeriods';
import type { Period } from '../model/types';

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === '23505'
  );
}

/**
 * Single-writer path for dashboard: rotate expired actives or create first active.
 * Call inside `runSerialized(\`dashboard-period:${familyId}\`, ...)` only.
 */
export async function ensureActivePeriodForDashboard(params: {
  familyId: string;
  cadence: Cadence;
  anchorDay: number;
}): Promise<Period | null> {
  const { familyId, cadence, anchorDay } = params;
  const today = toLocalCalendarISODate(new Date());

  let current = await getActivePeriod(familyId);
  let createdNewPeriod = false;

  periodLog('ensure.enter', {
    familyId,
    cadence,
    anchorDay,
    todayLocal: today,
    activeId: current?.id ?? null,
    activeEnds: current?.ends_at ?? null,
    expired: current ? current.ends_at < today : false,
  });

  if (current && current.ends_at < today) {
    const endedAt = current.ends_at;
    periodLog('ensure.rotate_expired', { familyId, archiveId: current.id, endedAt, today });
    await archivePeriod(current.id);
    try {
      current = await createPeriod({
        familyId,
        cadence,
        anchorDay,
        afterEndsAt: endedAt,
      });
      createdNewPeriod = true;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      periodLog('ensure.rotate_unique_race', { familyId });
      current = await getActivePeriod(familyId);
    }
  } else if (!current) {
    periodLog('ensure.no_active_creating', { familyId });
    try {
      current = await createPeriod({ familyId, cadence, anchorDay });
      createdNewPeriod = true;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      periodLog('ensure.create_unique_race', { familyId });
      current = await getActivePeriod(familyId);
    }
  } else {
    periodLog('ensure.keep_active', { familyId, periodId: current.id });
  }

  if (createdNewPeriod && current) {
    try {
      const { data: fam } = await supabase
        .from('families')
        .select('owner_id')
        .eq('id', familyId)
        .single();
      const ownerId = fam?.owner_id;
      if (ownerId) {
        const costs = await getRecurringCosts(familyId);
        await insertRecurringPurchasesForPeriod({
          familyId,
          periodId: current.id,
          periodStartsAt: current.starts_at,
          periodEndsAt: current.ends_at,
          ownerId,
          costs,
        });
      }
    } catch (e) {
      periodLog('ensure.recurring_insert_failed', { familyId, err: String(e) });
    }
  }

  return current;
}
