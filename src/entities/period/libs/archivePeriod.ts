import { supabase } from '@shared/config/supabase';

export async function archivePeriod(periodId: string) {
  const { error } = await supabase
    .from('periods')
    .update({ status: 'archived' })
    .eq('id', periodId);

  if (error) throw error;
}
