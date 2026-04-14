export type RecurringCost = {
  id: string;
  family_id: string;
  category_id: string | null;
  description: string;
  amount_cents: number;
  default_payer_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
