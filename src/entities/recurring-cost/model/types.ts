export type FixedCostType =
  | 'rent'
  | 'utilities'
  | 'insurance'
  | 'subscriptions'
  | 'loans'
  | 'other';

export const FIXED_COST_TYPES: { value: FixedCostType; label: string; icon: string }[] = [
  { value: 'rent', label: 'Rent', icon: 'home-outline' },
  { value: 'utilities', label: 'Utilities', icon: 'flash-outline' },
  { value: 'insurance', label: 'Insurance', icon: 'shield-checkmark-outline' },
  { value: 'subscriptions', label: 'Subscriptions', icon: 'card-outline' },
  { value: 'loans', label: 'Loans', icon: 'cash-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export type BillingFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export const BILLING_FREQUENCIES: { value: BillingFrequency; label: string; short: string }[] = [
  { value: 'weekly', label: 'Weekly', short: '/wk' },
  { value: 'biweekly', label: 'Biweekly', short: '/2wk' },
  { value: 'monthly', label: 'Monthly', short: '/mo' },
  { value: 'quarterly', label: 'Quarterly', short: '/qtr' },
  { value: 'yearly', label: 'Yearly', short: '/yr' },
];

export type RecurringCost = {
  id: string;
  family_id: string;
  category_id: string | null;
  cost_type: FixedCostType;
  billing_frequency: BillingFrequency;
  description: string;
  amount_cents: number;
  default_payer_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
