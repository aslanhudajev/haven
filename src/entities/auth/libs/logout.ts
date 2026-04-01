import { supabase } from '@shared/config/supabase';
import { Env } from '@shared/lib/env';
import { clearOnboardingSessionKeys } from '@shared/lib/storage';

export async function logout() {
  if (Env.EXPO_PUBLIC_REVENUECAT_API_KEY) {
    try {
      const Purchases = (await import('react-native-purchases')).default;
      await Purchases.logOut();
    } catch {
      /* non-fatal */
    }
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  // Fresh sign-in should re-choose create vs join and not reuse stale invite codes.
  await clearOnboardingSessionKeys();
}
