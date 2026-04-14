import { supabase } from '@shared/config/supabase';
import type { Category } from '../model/types';

type Input = {
  familyId: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
};

export async function createCategory(input: Input): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      family_id: input.familyId,
      name: input.name.trim(),
      icon: input.icon ?? 'pricetag-outline',
      color: input.color ?? '#208AEF',
      sort_order: input.sortOrder ?? 50,
      is_system: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}
