import { supabase } from '@shared/config/supabase';
import type { FamilyMember } from '../model/types';

export async function getMembers(familyId: string): Promise<FamilyMember[]> {
  const { data: members, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  if (!members?.length) return [];

  const userIds = members.map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }]),
  );

  return members.map((row) => ({
    ...row,
    profile: profileMap.get(row.user_id) ?? null,
  })) as FamilyMember[];
}
