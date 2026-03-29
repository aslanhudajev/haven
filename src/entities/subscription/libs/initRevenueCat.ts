import { Env } from '@shared/lib/env';

const REVENUECAT_KEY = Env.EXPO_PUBLIC_REVENUECAT_API_KEY;

export const REVENUECAT_ENABLED = !!REVENUECAT_KEY;

/** Must match RevenueCat dashboard entitlement identifier and Paywall `requiredEntitlementIdentifier`. */
export const REQUIRED_ENTITLEMENT_ID = 'FiftyFifty Pro';

/** When RevenueCat is disabled, `families.max_members` for new families (dev). */
export const DEV_DEFAULT_MAX_MEMBERS = 5;

/** Store product id → max family members. Only Duo (2) and Family (5) tiers. */
const TIER_MAX_MEMBERS: Record<string, number> = {
  fiftyfifty_duo: 2,
  fiftyfifty_family: 5,
  fiftyfifty_small_monthly: 2,
  fiftyfifty_small_yearly: 2,
  fiftyfifty_medium_monthly: 5,
  fiftyfifty_medium_yearly: 5,
  duo_monthly: 2,
  duo_yearly: 2,
  family_monthly: 5,
  family_yearly: 5,
};
const DEFAULT_MAX_MEMBERS = 2;

let configured = false;

const LOG = '[Haven:RC]';

function rcLog(...args: unknown[]) {
  if (__DEV__) console.log(LOG, ...args);
}

async function getPurchases() {
  return (await import('react-native-purchases')).default;
}

function summarizeEntitlements(info: {
  entitlements: {
    active: Record<string, { expirationDate?: string | null; productIdentifier?: string }>;
    all: Record<string, { isActive?: boolean; expirationDate?: string | null; productIdentifier?: string }>;
  };
}) {
  const { active, all } = info.entitlements;
  const allSummary: Record<string, { isActive?: boolean; expirationDate?: string | null; productIdentifier?: string | null }> =
    {};
  for (const key of Object.keys(all)) {
    const e = all[key];
    allSummary[key] = {
      isActive: e.isActive,
      expirationDate: e.expirationDate ?? null,
      productIdentifier: e.productIdentifier ?? null,
    };
  }
  return {
    requiredEntitlementId: REQUIRED_ENTITLEMENT_ID,
    activeEntitlementKeys: Object.keys(active),
    requiredInActive: !!active[REQUIRED_ENTITLEMENT_ID],
    allEntitlements: allSummary,
  };
}

export async function configureRevenueCat() {
  if (!REVENUECAT_KEY) {
    rcLog('configureRevenueCat skipped (no EXPO_PUBLIC_REVENUECAT_API_KEY)');
    return;
  }
  if (configured) {
    rcLog('configureRevenueCat skipped (already configured)');
    return;
  }
  try {
    const RNP = await import('react-native-purchases');
    const Purchases = RNP.default;
    if (__DEV__) {
      void Purchases.setLogLevel(RNP.LOG_LEVEL.WARN);
    }
    Purchases.configure({ apiKey: REVENUECAT_KEY });
    configured = true;
    rcLog('configureRevenueCat ok');
  } catch (err) {
    const msg = String(err instanceof Error ? err.message : err);
    if (/already configured|singleton/i.test(msg)) {
      configured = true;
      rcLog('configureRevenueCat treated as ok (already configured)', msg);
      return;
    }
    console.warn(LOG, 'configureRevenueCat failed:', err);
  }
}

export async function loginRevenueCat(userId: string) {
  if (!REVENUECAT_KEY) return;
  if (!configured) await configureRevenueCat();
  try {
    const Purchases = await getPurchases();
    rcLog('loginRevenueCat calling logIn', { userId });
    const { customerInfo } = await Purchases.logIn(userId);
    rcLog('loginRevenueCat done', {
      userId,
      ...summarizeEntitlements({ entitlements: customerInfo.entitlements }),
    });
  } catch (err) {
    console.warn(LOG, 'loginRevenueCat failed:', err);
  }
}

export async function checkSubscription(): Promise<boolean> {
  if (!REVENUECAT_KEY) return true;
  if (!configured) await configureRevenueCat();
  try {
    const Purchases = await getPurchases();
    const info = await Purchases.getCustomerInfo();
    const ok = !!info.entitlements.active[REQUIRED_ENTITLEMENT_ID];
    rcLog('checkSubscription', {
      result: ok,
      originalAppUserId: info.originalAppUserId,
      firstSeen: info.firstSeen,
      ...summarizeEntitlements({ entitlements: info.entitlements }),
    });
    return ok;
  } catch (e) {
    rcLog('checkSubscription error, returning false', e);
    return false;
  }
}

export async function getSubscriptionTier(): Promise<{
  maxMembers: number;
  productId: string | null;
}> {
  if (!REVENUECAT_KEY) return { maxMembers: DEV_DEFAULT_MAX_MEMBERS, productId: null };
  if (!configured) await configureRevenueCat();
  try {
    const Purchases = await getPurchases();
    const info = await Purchases.getCustomerInfo();
    const active = info.entitlements.active;
    const entitlement = active[REQUIRED_ENTITLEMENT_ID];
    if (!entitlement) {
      rcLog('getSubscriptionTier: required entitlement not in active', summarizeEntitlements({ entitlements: info.entitlements }));
      return { maxMembers: DEFAULT_MAX_MEMBERS, productId: null };
    }

    const productId = entitlement.productIdentifier;
    const maxMembers = TIER_MAX_MEMBERS[productId] ?? DEFAULT_MAX_MEMBERS;
    rcLog('getSubscriptionTier', { maxMembers, productId, expirationDate: entitlement.expirationDate });
    return { maxMembers, productId };
  } catch (e) {
    rcLog('getSubscriptionTier error', e);
    return { maxMembers: DEFAULT_MAX_MEMBERS, productId: null };
  }
}
