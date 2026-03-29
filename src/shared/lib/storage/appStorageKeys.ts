import AsyncStorage from '@react-native-async-storage/async-storage';

/** Current onboarding / invite keys (URL scheme: fiftyfifty). */
export const APP_STORAGE_WELCOMED_KEY = 'fiftyfifty:welcomed';
export const APP_STORAGE_PENDING_INVITE_KEY = 'fiftyfifty:pending_invite';

const LEGACY_WELCOMED = 'haven:welcomed';
const LEGACY_PENDING_INVITE = 'haven:pending_invite';

export const APP_URL_SCHEME = 'fiftyfifty';

export function inviteDeepLink(code: string) {
  return `${APP_URL_SCHEME}://invite/${code}`;
}

/** Reads welcomed flag; migrates legacy `haven:` key once if present. */
export async function loadWelcomedFlag(): Promise<string | null> {
  let v = await AsyncStorage.getItem(APP_STORAGE_WELCOMED_KEY);
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
  let v = await AsyncStorage.getItem(APP_STORAGE_PENDING_INVITE_KEY);
  if (v !== null) return v;
  const old = await AsyncStorage.getItem(LEGACY_PENDING_INVITE);
  if (old !== null) {
    await AsyncStorage.setItem(APP_STORAGE_PENDING_INVITE_KEY, old);
    await AsyncStorage.removeItem(LEGACY_PENDING_INVITE);
    return old;
  }
  return null;
}
