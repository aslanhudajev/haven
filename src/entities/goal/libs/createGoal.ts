import { supabase } from '@shared/config/supabase';
import type { Goal } from '../model/types';

type Input = {
  familyId: string;
  userId: string;
  name: string;
  targetCents: number;
  icon?: string;
  color?: string;
};

export async function createGoal(input: Input): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      family_id: input.familyId,
      name: input.name.trim(),
      target_cents: input.targetCents,
      icon: input.icon ?? 'flag-outline',
      color: input.color ?? '#208AEF',
      created_by: input.userId,
    })
    .select()
    .single();

  if (error) throw error;
  return { ...(data as Goal), current_cents: 0 };
}
