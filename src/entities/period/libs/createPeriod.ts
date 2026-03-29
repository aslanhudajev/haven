import { supabase } from '@shared/config/supabase';
import { formatPeriodName, toISODate } from '@shared/lib/format';
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
    cadence === 'monthly'
      ? formatPeriodName(startsAt)
      : formatPeriodName(startsAt, endsAt);

  const { data, error } = await supabase
    .from('periods')
    .insert({
      family_id: familyId,
      name,
      starts_at: toISODate(startsAt),
      ends_at: toISODate(endsAt),
    })
    .select()
    .single();

  if (error) throw error;
  return data as Period;
}
