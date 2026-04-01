import AsyncStorage from '@react-native-async-storage/async-storage';

/** Current onboarding / invite keys (URL scheme: fiftyfifty). */
export const APP_STORAGE_WELCOMED_KEY = 'fiftyfifty:welcomed';
export const APP_STORAGE_PENDING_INVITE_KEY = 'fiftyfifty:pending_invite';
export const APP_STORAGE_HOUSEHOLD_INTENT_KEY = 'fiftyfifty:household_intent';

/** Post-welcome path: payer creates household vs member joins via invite. */
export type HouseholdIntent = 'create' | 'join';

const LEGACY_WELCOMED = 'haven:welcomed';
const LEGACY_PENDING_INVITE = 'haven:pending_invite';

export const APP_URL_SCHEME = 'fiftyfifty';

export function inviteDeepLink(code: string) {
  return `${APP_URL_SCHEME}://invite/${code}`;
}

/** Reads welcomed flag; migrates legacy `haven:` key once if present. */
export async function loadWelcomedFlag(): Promise<string | null> {
  const v = await AsyncStorage.getItem(APP_STORAGE_WELCOMED_KEY);
  if (v !== null) return v;
  const old = await AsyncStorage.getItem(LEGACY_WELCOMED);
  if (old !== null) {
    await AsyncStorage.setItem(APP_STORAGE_WELCOMED_KEY, old);
    await AsyncStorage.removeItem(LEGACY_WELCOMED);
    return old;
  }
  return null;
}

/** Reads pending invite code; migrates legacy `haven:` key once if present. */
export async function loadPendingInviteCode(): Promise<string | null> {
  const v = await AsyncStorage.getItem(APP_STORAGE_PENDING_INVITE_KEY);
  if (v !== null) return v;
  const old = await AsyncStorage.getItem(LEGACY_PENDING_INVITE);
  if (old !== null) {
    await AsyncStorage.setItem(APP_STORAGE_PENDING_INVITE_KEY, old);
    await AsyncStorage.removeItem(LEGACY_PENDING_INVITE);
    return old;
  }
  return null;
}

export async function loadHouseholdIntent(): Promise<HouseholdIntent | null> {
  const v = await AsyncStorage.getItem(APP_STORAGE_HOUSEHOLD_INTENT_KEY);
  if (v === 'create' || v === 'join') return v;
  return null;
}

export async function saveHouseholdIntent(intent: HouseholdIntent): Promise<void> {
  await AsyncStorage.setItem(APP_STORAGE_HOUSEHOLD_INTENT_KEY, intent);
}

export async function clearHouseholdIntent(): Promise<void> {
  await AsyncStorage.removeItem(APP_STORAGE_HOUSEHOLD_INTENT_KEY);
}

/** Clears invite + household intent so the next session re-chooses path (e.g. after sign out). */
export async function clearOnboardingSessionKeys(): Promise<void> {
  await AsyncStorage.multiRemove([
    APP_STORAGE_PENDING_INVITE_KEY,
    APP_STORAGE_HOUSEHOLD_INTENT_KEY,
  ]);
}
