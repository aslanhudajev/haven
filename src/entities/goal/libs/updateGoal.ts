import { supabase } from '@shared/config/supabase';
import type { Goal } from '../model/types';

type Patch = Partial<Pick<Goal, 'name' | 'target_cents' | 'icon' | 'color' | 'completed_at'>>;

export async function updateGoal(goalId: string, patch: Patch): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update(patch)
    .eq('id', goalId)
    .select()
    .single();

  if (error) throw error;
  return data as Goal;
}
