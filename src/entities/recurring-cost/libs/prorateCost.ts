import type { BillingFrequency } from '../model/types';

const BILLING_DAYS: Record<BillingFrequency, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30.44,
  quarterly: 91.31,
  yearly: 365.25,
};

/**
 * Prorates a fixed cost amount to fit a budget period of `periodDays` length.
 * When the billing cycle roughly matches the period length, the exact amount
 * is returned to avoid rounding drift.
 */
export function prorateCost(
  amountCents: number,
  billingFrequency: BillingFrequency,
  periodDays: number,
): number {
  const billingDays = BILLING_DAYS[billingFrequency];
  if (Math.abs(billingDays - periodDays) < 1) return amountCents;
  return Math.round((amountCents / billingDays) * periodDays);
}
