import { supabase } from '@shared/config/supabase';

export async function resolvePeriod(periodId: string, userId: string) {
  const { data: row, error: fetchError } = await supabase
    .from('periods')
    .select('id, status')
    .eq('id', periodId)
    .single();

  if (fetchError || !row) {
    throw new Error('Period not found');
  }

  if (row.status !== 'archived') {
    throw new Error('Only archived periods can be marked settled.');
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
