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

function mapRedeemRpcError(message: string): JoinFamilyError {
  const m = message || '';
  if (m.includes('JOIN_FAMILY_NOT_FOUND')) {
    return new JoinFamilyError('NOT_FOUND', 'This invite link is not valid.');
  }
  if (m.includes('JOIN_FAMILY_USED')) {
    return new JoinFamilyError('USED', 'This invite has already been used.');
  }
  if (m.includes('JOIN_FAMILY_EXPIRED')) {
    return new JoinFamilyError('EXPIRED', 'This invite has expired.');
  }
  if (m.includes('JOIN_FAMILY_ALREADY_IN_FAMILY')) {
    return new JoinFamilyError(
      'ALREADY_IN_FAMILY',
      'You already belong to a family. Leave it before joining another.',
    );
  }
  if (m.includes('JOIN_FAMILY_FAMILY_FULL')) {
    return new JoinFamilyError('FAMILY_FULL', 'This family is full and cannot accept new members.');
  }
  if (m.includes('JOIN_FAMILY_UNAUTHORIZED')) {
    return new JoinFamilyError('NOT_FOUND', 'Sign in to accept this invite.');
  }
  return new JoinFamilyError('NOT_FOUND', 'This invite link is not valid.');
}

/** Redeem an invite for the current session user (uses `auth.uid()` in the database). */
export async function joinFamily(inviteCode: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new JoinFamilyError('NOT_FOUND', 'Sign in to accept this invite.');
  }

  const { data, error } = await supabase.rpc('redeem_family_invite', {
    p_code: inviteCode.trim(),
  });

  if (error) {
    throw mapRedeemRpcError(error.message ?? '');
  }

  if (typeof data !== 'string') {
    throw new JoinFamilyError('NOT_FOUND', 'This invite link is not valid.');
  }

  return data;
}
