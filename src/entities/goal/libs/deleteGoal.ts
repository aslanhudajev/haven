import { supabase } from '@shared/config/supabase';

export async function deleteGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) throw error;
}
