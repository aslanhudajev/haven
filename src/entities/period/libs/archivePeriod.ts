import { supabase } from '@shared/config/supabase';
import { periodLog } from '@shared/lib/debug';

export async function archivePeriod(periodId: string) {
  periodLog('archivePeriod', { periodId });
  const { error } = await supabase
    .from('periods')
    .update({ status: 'archived' })
    .eq('id', periodId);

  if (error) throw error;
}
