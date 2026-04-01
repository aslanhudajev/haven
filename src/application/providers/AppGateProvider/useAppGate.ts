import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getFamily, joinFamily, type Family, type FamilyMember } from '@entities/family';
import { getProfile, type Profile } from '@entities/profile';
import {
  DEV_DEFAULT_MAX_MEMBERS,
  REVENUECAT_ENABLED,
  checkSubscription,
  configureRevenueCat,
  getSubscriptionTier,
  loginRevenueCat,
  resolveMaxMembersForTier,
  syncRevenueCatSubscription,
} from '@entities/subscription';
import { SKIP_PAYWALL } from '@shared/config/billingGate';
import { supabase } from '@shared/config/supabase';
import {
  APP_STORAGE_PENDING_INVITE_KEY,
  loadWelcomedFlag,
  loadPendingInviteCode,
} from '@shared/lib/storage';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const GATE_LOG = '[Haven:gate]';

function gateLog(...args: unknown[]) {
  if (__DEV__) console.log(GATE_LOG, ...args);
}

export type AppGateTarget =
  | '/(auth)/welcome'
  | '/paywall'
  | '/(auth)/login'
  | '/(onboarding)/profile'
  | '/(onboarding)/create-family'
  | '/(onboarding)/sub-expired'
  | '/(app)/(tabs)'
  | 'invite-pending';

export type AppGateData = {
  targetRoute: AppGateTarget;
  isLoading: boolean;
  profile: Profile | null;
  family: Family | null;
  membership: FamilyMember | null;
  isOwner: boolean;
  pendingInvite: string | null;
  refresh: () => void;
};

async function readLocalFlags(): Promise<{ welcomed: boolean; inviteCode: string | null }> {
  const [welcomedVal, inviteVal] = await Promise.all([loadWelcomedFlag(), loadPendingInviteCode()]);
  return { welcomed: welcomedVal === 'true', inviteCode: inviteVal };
}

async function readHasSubscription(): Promise<boolean> {
  if (SKIP_PAYWALL) return true;
  if (!REVENUECAT_ENABLED) return true;
  await configureRevenueCat();
  return checkSubscription();
}

async function resolveUserData(
  userId: string,
  inviteCode: string | null,
): Promise<{
  profile: Profile | null;
  family: Family | null;
  membership: FamilyMember | null;
  pendingInvite: string | null;
}> {
  if (inviteCode) {
    try {
      await joinFamily(inviteCode);
      await AsyncStorage.removeItem(APP_STORAGE_PENDING_INVITE_KEY);
    } catch (err) {
      console.warn('Auto-join invite failed:', err);
    }
  }

  const pendingInvite = await loadPendingInviteCode();

  const [profileData, familyData] = await Promise.all([getProfile(userId), getFamily(userId)]);

  let nextFamily = familyData;
  let memberRow: FamilyMember | null = null;

  if (nextFamily) {
    const { data: m } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', nextFamily.id)
      .eq('user_id', userId)
      .single();
    memberRow = m as FamilyMember | null;

    if (memberRow?.role === 'owner') {
      if (SKIP_PAYWALL) {
        if (!nextFamily.is_active) {
          const { error: bypassPatchErr } = await supabase
            .from('families')
            .update({ is_active: true, max_members: DEV_DEFAULT_MAX_MEMBERS })
            .eq('id', nextFamily.id);
          gateLog('resolveUserData: SKIP_PAYWALL owner inactive → patch family', {
            patchErr: bypassPatchErr?.message ?? null,
          });
          if (!bypassPatchErr) {
            nextFamily = await getFamily(userId);
          }
        }
      } else if (REVENUECAT_ENABLED) {
        gateLog('resolveUserData: owner → syncRevenueCatSubscription + refresh family', {
          familyId: nextFamily.id,
          is_active_before_sync: nextFamily.is_active,
        });
        await syncRevenueCatSubscription();
        nextFamily = await getFamily(userId);
        gateLog('resolveUserData: after edge sync', {
          familyId: nextFamily?.id,
          is_active: nextFamily?.is_active,
        });
        if (nextFamily && !nextFamily.is_active) {
          const rcActive = await checkSubscription();
          gateLog('resolveUserData: family still inactive; SDK checkSubscription', { rcActive });
          if (rcActive) {
            const tier = await getSubscriptionTier();
            const { count, error: countErr } = await supabase
              .from('family_members')
              .select('*', { count: 'exact', head: true })
              .eq('family_id', nextFamily.id);
            if (!countErr) {
              const maxMembers = resolveMaxMembersForTier(tier.maxMembers, count ?? 0);
              const { error: patchErr } = await supabase
                .from('families')
                .update({ is_active: true, max_members: maxMembers })
                .eq('id', nextFamily.id);
              gateLog('resolveUserData: client reconciliation patch family', {
                maxMembers,
                patchErr: patchErr?.message ?? null,
              });
              if (!patchErr) {
                nextFamily = await getFamily(userId);
              }
            }
          }
        }
      }
    }
  }

  return {
    profile: profileData,
    family: nextFamily,
    membership: memberRow,
    pendingInvite,
  };
}

export function useAppGate(user: SupabaseUser | null): AppGateData {
  const [isLoading, setIsLoading] = useState(true);
  const [welcomed, setWelcomed] = useState<boolean | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [membership, setMembership] = useState<FamilyMember | null>(null);
  const [pendingInvite, setPendingInvite] = useState<string | null>(null);

  const prevUserId = useRef<string | null>(null);

  const evaluate = useCallback(async () => {
    setIsLoading(true);
    gateLog('evaluate start', { userId: user?.id ?? null });
    try {
      const { welcomed: w, inviteCode } = await readLocalFlags();
      const hasSubAnon = await readHasSubscription();

      let nextProfile: Profile | null = null;
      let nextFamily: Family | null = null;
      let nextMembership: FamilyMember | null = null;
      let nextPending = inviteCode;
      let nextHasSub = hasSubAnon;

      if (user) {
        if (prevUserId.current !== user.id) {
          await loginRevenueCat(user.id);
          prevUserId.current = user.id;
        }
        const resolved = await resolveUserData(user.id, inviteCode);
        nextProfile = resolved.profile;
        nextFamily = resolved.family;
        nextMembership = resolved.membership;
        nextPending = resolved.pendingInvite;
        nextHasSub = SKIP_PAYWALL ? true : await checkSubscription();
      } else {
        prevUserId.current = null;
        nextPending = await loadPendingInviteCode();
        nextHasSub = hasSubAnon;
      }

      setWelcomed(w);
      setPendingInvite(nextPending);
      setHasSubscription(nextHasSub);
      setProfile(nextProfile);
      setFamily(nextFamily);
      setMembership(nextMembership);

      const target = computeTarget({
        welcomed: w,
        hasSubscription: nextHasSub,
        user,
        profile: nextProfile,
        family: nextFamily,
        isOwner: nextMembership?.role === 'owner',
        pendingInvite: nextPending,
      });
      gateLog('evaluate done', {
        userId: user?.id ?? null,
        welcomed: w,
        hasSubscriptionSdk: nextHasSub,
        familyId: nextFamily?.id ?? null,
        familyIsActive: nextFamily?.is_active ?? null,
        isOwner: nextMembership?.role === 'owner',
        pendingInvite: nextPending,
        targetRoute: target,
      });
    } catch (err) {
      console.warn('AppGate evaluate error:', err);
      try {
        const { welcomed: w, inviteCode } = await readLocalFlags();
        setWelcomed(w);
        setPendingInvite(inviteCode);
      } catch {
        setWelcomed(false);
        setPendingInvite(null);
      }
      setHasSubscription(SKIP_PAYWALL || !REVENUECAT_ENABLED);
      setProfile(null);
      setFamily(null);
      setMembership(null);
      prevUserId.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    evaluate();
  }, [evaluate]);

  const isOwner = membership?.role === 'owner';

  const targetRoute = computeTarget({
    welcomed,
    hasSubscription,
    user,
    profile,
    family,
    isOwner,
    pendingInvite,
  });

  return {
    targetRoute,
    isLoading,
    profile,
    family,
    membership,
    isOwner,
    pendingInvite,
    refresh: evaluate,
  };
}

function computeTarget(state: {
  welcomed: boolean | null;
  hasSubscription: boolean | null;
  user: SupabaseUser | null;
  profile: Profile | null;
  family: Family | null;
  isOwner: boolean;
  pendingInvite: string | null;
}): AppGateTarget {
  const { welcomed, hasSubscription, user, profile, family, isOwner, pendingInvite } = state;
  const subOk = SKIP_PAYWALL || !!hasSubscription;

  if (welcomed === null || hasSubscription === null) {
    return '/(auth)/welcome';
  }

  if (!welcomed) return '/(auth)/welcome';

  if (!subOk && !user) return '/paywall';
  if (!subOk && user && !family && !pendingInvite) return '/paywall';

  if (!user) return '/(auth)/login';

  if (!profile?.onboarding_completed) return '/(onboarding)/profile';

  if (!family && pendingInvite) return 'invite-pending';

  if (!family) return '/(onboarding)/create-family';

  if (!family.is_active && !SKIP_PAYWALL) {
    return isOwner ? '/paywall' : '/(onboarding)/sub-expired';
  }

  return '/(app)/(tabs)';
}
