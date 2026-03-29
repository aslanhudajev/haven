import { REVENUECAT_ENABLED } from '@entities/subscription';
import { supabase } from '@shared/config/supabase';

export async function logout() {
  if (REVENUECAT_ENABLED) {
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
