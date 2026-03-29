import { periodLog } from '@shared/lib/debug';
import { toLocalCalendarISODate } from '@shared/lib/format';
import type { Cadence } from '@shared/lib/period';
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
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      periodLog('ensure.rotate_unique_race', { familyId });
      current = await getActivePeriod(familyId);
    }
  } else if (!current) {
    periodLog('ensure.no_active_creating', { familyId });
    try {
      current = await createPeriod({ familyId, cadence, anchorDay });
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      periodLog('ensure.create_unique_race', { familyId });
      current = await getActivePeriod(familyId);
    }
  } else {
    periodLog('ensure.keep_active', { familyId, periodId: current.id });
  }

  return current;
}
