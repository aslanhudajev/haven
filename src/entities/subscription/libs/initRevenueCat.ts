import { Env } from '@shared/lib/env';

const REVENUECAT_KEY = Env.EXPO_PUBLIC_REVENUECAT_API_KEY;

export const REVENUECAT_ENABLED = !!REVENUECAT_KEY;

/** Store product id → max family members. Only Duo (2) and Family (5) tiers. */
const TIER_MAX_MEMBERS: Record<string, number> = {
  fiftyfifty_duo: 2,
  fiftyfifty_family: 5,
  fiftyfifty_small_monthly: 2,
  fiftyfifty_small_yearly: 2,
  fiftyfifty_medium_monthly: 5,
  fiftyfifty_medium_yearly: 5,
};
const DEFAULT_MAX_MEMBERS = 2;

let configured = false;

async function getPurchases() {
  return (await import('react-native-purchases')).default;
}

export async function configureRevenueCat() {
  if (!REVENUECAT_KEY || configured) return;
  try {
    const Purchases = await getPurchases();
    Purchases.configure({ apiKey: REVENUECAT_KEY });
    configured = true;
  } catch (err) {
    console.warn('RevenueCat configure failed:', err);
  }
}

export async function loginRevenueCat(userId: string) {
  if (!REVENUECAT_KEY) return;
  if (!configured) await configureRevenueCat();
  try {
    const Purchases = await getPurchases();
    await Purchases.logIn(userId);
  } catch (err) {
    console.warn('RevenueCat logIn failed:', err);
  }
}

export async function checkSubscription(): Promise<boolean> {
  if (!REVENUECAT_KEY) return true;
  if (!configured) await configureRevenueCat();
  try {
    const Purchases = await getPurchases();
    const info = await Purchases.getCustomerInfo();
    return Object.keys(info.entitlements.active).length > 0;
  } catch {
    return false;
  }
}

export async function getSubscriptionTier(): Promise<{
  maxMembers: number;
  productId: string | null;
}> {
  if (!REVENUECAT_KEY) return { maxMembers: 5, productId: null };
  if (!configured) await configureRevenueCat();
  try {
    const Purchases = await getPurchases();
    const info = await Purchases.getCustomerInfo();
    const active = info.entitlements.active;
    const entitlement = active['pro_access'] ?? Object.values(active)[0];
    if (!entitlement) return { maxMembers: DEFAULT_MAX_MEMBERS, productId: null };

    const productId = entitlement.productIdentifier;
    const maxMembers = TIER_MAX_MEMBERS[productId] ?? DEFAULT_MAX_MEMBERS;
    return { maxMembers, productId };
  } catch {
    return { maxMembers: DEFAULT_MAX_MEMBERS, productId: null };
  }
}
