import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getProfile, type Profile } from '@entities/profile';
import { getFamily, joinFamily, type Family, type FamilyMember } from '@entities/family';
import {
  REVENUECAT_ENABLED,
  checkSubscription,
  configureRevenueCat,
  loginRevenueCat,
  syncRevenueCatSubscription,
} from '@entities/subscription';
import { supabase } from '@shared/config/supabase';
import {
  APP_STORAGE_PENDING_INVITE_KEY,
  loadWelcomedFlag,
  loadPendingInviteCode,
} from '@shared/lib/storage/appStorageKeys';

export type AppGateTarget =
  | '/(auth)/welcome'
  | '/paywall'
  | '/(auth)/login'
  | '/(onboarding)/profile'
  | '/(onboarding)/create-family'
  | '/(onboarding)/sub-expired'
  | '/(app)/(tabs)';

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

export function useAppGate(user: SupabaseUser | null): AppGateData {
  const [isLoading, setIsLoading] = useState(true);
  const [welcomed, setWelcomed] = useState<boolean | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [membership, setMembership] = useState<FamilyMember | null>(null);
  const [pendingInvite, setPendingInvite] = useState<string | null>(null);

  const prevUserId = useRef<string | null>(null);

  const loadLocalFlags = useCallback(async () => {
    const [welcomedVal, inviteVal] = await Promise.all([
      loadWelcomedFlag(),
      loadPendingInviteCode(),
    ]);
    setWelcomed(welcomedVal === 'true');
    setPendingInvite(inviteVal);
    return { welcomed: welcomedVal === 'true', inviteCode: inviteVal };
  }, []);

  const loadSubscription = useCallback(async () => {
    if (!REVENUECAT_ENABLED) {
      setHasSubscription(true);
      return;
    }
    await configureRevenueCat();
    const active = await checkSubscription();
    setHasSubscription(active);
  }, []);

  const loadUserData = useCallback(async (userId: string, inviteCode: string | null) => {
    if (inviteCode) {
      try {
        await joinFamily(inviteCode, userId);
        await AsyncStorage.removeItem(APP_STORAGE_PENDING_INVITE_KEY);
        setPendingInvite(null);
      } catch (err) {
        console.warn('Auto-join invite failed:', err);
        await AsyncStorage.removeItem(APP_STORAGE_PENDING_INVITE_KEY);
        setPendingInvite(null);
      }
    }

    const [profileData, familyData] = await Promise.all([
      getProfile(userId),
      getFamily(userId),
    ]);

    setProfile(profileData);

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

      if (REVENUECAT_ENABLED && memberRow?.role === 'owner') {
        await syncRevenueCatSubscription();
        nextFamily = await getFamily(userId);
      }
    }

    setFamily(nextFamily);
    setMembership(memberRow);
  }, []);

  const evaluate = useCallback(async () => {
    setIsLoading(true);
    try {
      const { inviteCode } = await loadLocalFlags();
      await loadSubscription();

      if (user) {
        if (prevUserId.current !== user.id) {
          await loginRevenueCat(user.id);
          const active = await checkSubscription();
          setHasSubscription(active);
          prevUserId.current = user.id;
        }
        await loadUserData(user.id, inviteCode);
      } else {
        setProfile(null);
        setFamily(null);
        setMembership(null);
      }
    } catch (err) {
      console.warn('AppGate evaluate error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, loadLocalFlags, loadSubscription, loadUserData]);

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
}): AppGateTarget {
  const { welcomed, hasSubscription, user, profile, family, isOwner } = state;

  if (welcomed === null || hasSubscription === null) return '/(app)/(tabs)';

  if (!welcomed) return '/(auth)/welcome';

  if (!hasSubscription && !user) return '/paywall';
  if (!hasSubscription && user && !family) return '/paywall';

  if (!user) return '/(auth)/login';

  if (!profile?.onboarding_completed) return '/(onboarding)/profile';

  if (!family) return '/(onboarding)/create-family';

  if (!family.is_active) {
    return isOwner ? '/paywall' : '/(onboarding)/sub-expired';
  }

  return '/(app)/(tabs)';
}
