import { supabase } from '@shared/config/supabase';
import type { CategoryBudget } from '../model/types';

export async function getCategoryBudgets(familyId: string): Promise<CategoryBudget[]> {
  const { data, error } = await supabase
    .from('category_budgets')
    .select('*')
    .eq('family_id', familyId);

  if (error) throw error;
  return (data ?? []) as CategoryBudget[];
}
