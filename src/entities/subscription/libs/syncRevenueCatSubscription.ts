import { supabase } from '@shared/config/supabase';
import { REVENUECAT_ENABLED } from './initRevenueCat';

/** Server-side sync from RevenueCat → `families` for the authenticated owner. */
export async function syncRevenueCatSubscription(): Promise<void> {
  if (!REVENUECAT_ENABLED) return;

  const { error } = await supabase.functions.invoke('sync-revenuecat-subscription', {
    method: 'POST',
  });

  if (error) {
    console.warn('syncRevenueCatSubscription:', error.message);
  }
}
