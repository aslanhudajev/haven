/**
 * Paid flow toggle (Apple / banking / temporary access).
 *
 * - `true`  → Welcome → Login → Onboarding → App (paywall never shown).
 * - `false` → Restores normal RevenueCat paywall gating.
 *
 * Flip only this value when you are ready to require subscriptions again.
 */
export const SKIP_PAYWALL = true;
