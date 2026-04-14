import { supabase } from '@shared/config/supabase';

export async function deleteCategoryBudget(budgetId: string): Promise<void> {
  const { error } = await supabase.from('category_budgets').delete().eq('id', budgetId);
  if (error) throw error;
}
