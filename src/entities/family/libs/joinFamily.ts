import { supabase } from '@shared/config/supabase';

export type JoinFamilyErrorCode =
  | 'NOT_FOUND'
  | 'USED'
  | 'EXPIRED'
  | 'ALREADY_IN_FAMILY'
  | 'FAMILY_FULL';

export class JoinFamilyError extends Error {
  readonly code: JoinFamilyErrorCode;

  constructor(code: JoinFamilyErrorCode, message: string) {
    super(message);
    this.name = 'JoinFamilyError';
    this.code = code;
  }
}

export function isJoinFamilyError(e: unknown): e is JoinFamilyError {
  return e instanceof JoinFamilyError;
}

export async function joinFamily(inviteCode: string, userId: string) {
  const { data: invite, error: lookupError } = await supabase
    .from('family_invites')
    .select('*')
    .eq('code', inviteCode)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (!invite) {
    throw new JoinFamilyError('NOT_FOUND', 'This invite link is not valid.');
  }

  if (invite.used_by) {
    if (invite.used_by === userId) {
      const { data: mem } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (mem?.family_id === invite.family_id) {
        return invite.family_id;
      }
    }
    throw new JoinFamilyError('USED', 'This invite has already been used.');
  }

  if (new Date(invite.expires_at) <= new Date()) {
    throw new JoinFamilyError('EXPIRED', 'This invite has expired.');
  }

  const { data: existingMembership } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingMembership) {
    if (existingMembership.family_id === invite.family_id) {
      return invite.family_id;
    }
    throw new JoinFamilyError(
      'ALREADY_IN_FAMILY',
      'You already belong to a family. Leave it before joining another.',
    );
  }

  const { data: fam, error: famError } = await supabase
    .from('families')
    .select('max_members')
    .eq('id', invite.family_id)
    .single();

  if (famError || !fam) {
    throw new JoinFamilyError('NOT_FOUND', 'This invite link is not valid.');
  }

  const { count, error: countError } = await supabase
    .from('family_members')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', invite.family_id);

  if (countError) throw countError;

  if ((count ?? 0) >= fam.max_members) {
    throw new JoinFamilyError(
      'FAMILY_FULL',
      'This family is full and cannot accept new members.',
    );
  }

  const { error: memberError } = await supabase.from('family_members').insert({
    family_id: invite.family_id,
    user_id: userId,
    role: 'member',
  });

  if (memberError) {
    if (memberError.code === '23505') {
      throw new JoinFamilyError(
        'ALREADY_IN_FAMILY',
        'You already belong to a family. Leave it before joining another.',
      );
    }
    if (memberError.message?.includes('member limit')) {
      throw new JoinFamilyError(
        'FAMILY_FULL',
        'This family is full and cannot accept new members.',
      );
    }
    throw memberError;
  }

  const usedAt = new Date().toISOString();
  const { error: inviteUpdateError } = await supabase
    .from('family_invites')
    .update({ used_by: userId, used_at: usedAt })
    .eq('id', invite.id);

  if (inviteUpdateError) throw inviteUpdateError;

  return invite.family_id;
}
