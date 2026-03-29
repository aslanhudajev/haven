import { supabase } from '@shared/config/supabase';
import { isLocalCalendarDateAfterInclusiveEnd } from '@shared/lib/format';

export async function resolvePeriod(periodId: string, userId: string) {
  const { data: row, error: fetchError } = await supabase
    .from('periods')
    .select('id, status, ends_at')
    .eq('id', periodId)
    .single();

  if (fetchError || !row) {
    throw new Error('Period not found');
  }

  if (row.status !== 'archived') {
    throw new Error('Only archived periods can be marked settled.');
  }

  if (!isLocalCalendarDateAfterInclusiveEnd(row.ends_at)) {
    throw new Error('You can mark this period settled only after it has ended.');
  }

  const { error } = await supabase
    .from('periods')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
    })
    .eq('id', periodId)
    .eq('status', 'archived');

  if (error) throw error;
}
