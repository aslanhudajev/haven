import { supabase } from '@shared/config/supabase';
import type { CategoryBudget } from '../model/types';

export async function upsertCategoryBudget(input: {
  familyId: string;
  categoryId: string;
  amountCents: number;
}): Promise<CategoryBudget> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('category_budgets')
    .upsert(
      {
        family_id: input.familyId,
        category_id: input.categoryId,
        amount_cents: input.amountCents,
        updated_at: now,
      },
      { onConflict: 'family_id,category_id' },
    )
    .select()
    .single();

  if (error) throw error;
  return data as CategoryBudget;
}
