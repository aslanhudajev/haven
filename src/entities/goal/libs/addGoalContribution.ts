import { supabase } from '@shared/config/supabase';

export async function addGoalContribution(input: {
  goalId: string;
  userId: string;
  amountCents: number;
  note?: string | null;
}): Promise<void> {
  const { error } = await supabase.from('goal_contributions').insert({
    goal_id: input.goalId,
    user_id: input.userId,
    amount_cents: input.amountCents,
    note: input.note ?? null,
  });
  if (error) throw error;
}
