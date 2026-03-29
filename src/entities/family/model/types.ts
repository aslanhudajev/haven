import type { Cadence } from '@shared/lib/period';

export type Family = {
  id: string;
  name: string;
  budget_cents: number | null;
  currency: string;
  owner_id: string;
  is_active: boolean;
  max_members: number;
  period_cadence: Cadence;
  period_anchor_day: number;
  created_at: string;
};

export type FamilyMember = {
  id: string;
  family_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type FamilyInvite = {
  id: string;
  family_id: string;
  code: string;
  created_by: string;
  expires_at: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
};
