import { supabase } from '@shared/config/supabase';

export async function resolvePeriod(periodId: string, userId: string) {
  const { error } = await supabase
    .from('periods')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
    })
    .eq('id', periodId);

  if (error) throw error;
}
