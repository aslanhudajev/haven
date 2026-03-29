import { supabase } from '@shared/config/supabase';
import type { Period } from '../model/types';

export async function getActivePeriod(familyId: string): Promise<Period | null> {
  const { data, error } = await supabase
    .from('periods')
    .select('*')
    .eq('family_id', familyId)
    .eq('status', 'active')
    .order('starts_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as Period | null;
}

export async function getFinishedPeriods(familyId: string): Promise<Period[]> {
  const { data, error } = await supabase
    .from('periods')
    .select('*')
    .eq('family_id', familyId)
    .in('status', ['archived', 'resolved'])
    .order('ends_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Period[];
}

/** Active period first (if any), then archived and resolved by `ends_at` descending. */
export async function getLedgerPeriods(familyId: string): Promise<Period[]> {
  const [active, finished] = await Promise.all([
    getActivePeriod(familyId),
    getFinishedPeriods(familyId),
  ]);
  const out: Period[] = [];
  if (active) out.push(active);
  out.push(...finished);
  return out;
}

export function countArchivedUnsettledPeriods(periods: Period[]): number {
  return periods.filter((p) => p.status === 'archived').length;
}
