import { supabase } from '@shared/config/supabase';
import { Env } from '@shared/lib/env';

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
}
