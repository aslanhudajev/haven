import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import type { CustomerInfo } from 'react-native-purchases';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '';
const ENTITLEMENT_ID = 'Haven Pro';

let configured = false;

export function initRevenueCat() {
  if (configured) return;
  configured = true;

  if (!API_KEY) {
    if (__DEV__) {
      console.warn(
        '[RevenueCat] No API key set. Add EXPO_PUBLIC_REVENUECAT_API_KEY to .env.local',
      );
    }
    return;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);

  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Purchases.configure({ apiKey: API_KEY });
  }
}

export async function checkEntitlement(): Promise<boolean> {
  if (!API_KEY) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  } catch {
    return false;
  }
}

export function useSubscriptionStatus() {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    if (!API_KEY) {
      setIsSubscribed(false);
      return;
    }
    try {
      const info = await Purchases.getCustomerInfo();
      setIsSubscribed(
        typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined',
      );
    } catch {
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    check();

    if (!API_KEY) return;

    const listener = (info: CustomerInfo) => {
      setIsSubscribed(
        typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined',
      );
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [check]);

  return { isSubscribed, refresh: check };
}
