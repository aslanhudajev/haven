import { supabase } from '@shared/config/supabase';

export async function updateMemberIncome(
  memberId: string,
  incomeCents: number | null,
): Promise<void> {
  const { error } = await supabase
    .from('family_members')
    .update({ income_cents: incomeCents })
    .eq('id', memberId);

  if (error) throw error;
}
