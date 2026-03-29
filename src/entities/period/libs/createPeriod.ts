import { supabase } from '@shared/config/supabase';
import { periodLog } from '@shared/lib/debug';
import { formatPeriodName, toLocalCalendarISODate } from '@shared/lib/format';
import {
  computeCurrentPeriodDates,
  computeNextPeriodDates,
  type Cadence,
} from '@shared/lib/period';
import type { Period } from '../model/types';

type CreatePeriodInput = {
  familyId: string;
  cadence: Cadence;
  anchorDay: number;
  afterEndsAt?: Date | string;
};

export async function createPeriod(input: CreatePeriodInput): Promise<Period> {
  const { familyId, cadence, anchorDay, afterEndsAt } = input;

  const { startsAt, endsAt } = afterEndsAt
    ? computeNextPeriodDates(cadence, anchorDay, afterEndsAt)
    : computeCurrentPeriodDates(cadence, anchorDay);

  const name =
    cadence === 'monthly' ? formatPeriodName(startsAt) : formatPeriodName(startsAt, endsAt);

  const starts_at = toLocalCalendarISODate(startsAt);
  const ends_at = toLocalCalendarISODate(endsAt);

  periodLog('createPeriod.insert', {
    familyId,
    cadence,
    anchorDay,
    afterEndsAt: afterEndsAt ?? null,
    starts_at,
    ends_at,
    name,
  });

  const { data, error } = await supabase
    .from('periods')
    .insert({
      family_id: familyId,
      name,
      starts_at,
      ends_at,
    })
    .select()
    .single();

  if (error) {
    periodLog('createPeriod.error', {
      familyId,
      code: (error as { code?: string }).code,
      message: error.message,
    });
    throw error;
  }

  periodLog('createPeriod.ok', { periodId: data.id, familyId, starts_at, ends_at });
  return data as Period;
}
