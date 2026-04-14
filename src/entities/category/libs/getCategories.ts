import { supabase } from '@shared/config/supabase';
import type { Category } from '../model/types';

/** System defaults (family_id null) plus custom categories for this family. */
export async function getCategories(familyId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`family_id.is.null,family_id.eq.${familyId}`)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Category[];
}
