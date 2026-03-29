import { supabase } from '@shared/config/supabase';

export async function joinFamily(inviteCode: string, userId: string) {
  const { data: invite, error: lookupError } = await supabase
    .from('family_invites')
    .select('*')
    .eq('code', inviteCode)
    .is('used_by', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (lookupError || !invite) {
    throw new Error('Invite is invalid or expired');
  }

  const { error: memberError } = await supabase.from('family_members').insert({
    family_id: invite.family_id,
    user_id: userId,
    role: 'member',
  });

  if (memberError) throw memberError;

  await supabase
    .from('family_invites')
    .update({ used_by: userId })
    .eq('id', invite.id);

  return invite.family_id;
}
