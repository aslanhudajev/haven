import { supabase } from '@shared/config/supabase';
import { REVENUECAT_ENABLED } from './initRevenueCat';

const LOG = '[Haven:RC:sync-fn]';

/** Server-side sync from RevenueCat → `families` for the authenticated owner. */
export async function syncRevenueCatSubscription(): Promise<void> {
  if (!REVENUECAT_ENABLED) {
    if (__DEV__) console.log(LOG, 'skipped (RevenueCat disabled)');
    return;
  }

  if (__DEV__) console.log(LOG, 'invoke sync-revenuecat-subscription start');
  const { data, error } = await supabase.functions.invoke('sync-revenuecat-subscription', {
    method: 'POST',
  });

  if (__DEV__) {
    console.log(LOG, 'invoke done', {
      error: error?.message ?? null,
      data: data ?? null,
    });
  }

  if (error) {
    console.warn(LOG, 'invoke error:', error.message);
  }
}
