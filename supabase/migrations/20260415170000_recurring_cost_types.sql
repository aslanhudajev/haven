-- Replace spending-category on recurring costs with a dedicated cost_type system.
-- Values: rent, utilities, insurance, subscriptions, loans, other.

ALTER TABLE public.recurring_costs
  ADD COLUMN cost_type text NOT NULL DEFAULT 'other';

-- Backfill all existing rows to 'other'
UPDATE public.recurring_costs SET cost_type = 'other';

-- Null out category_id on recurring_costs (no longer used for fixed costs)
UPDATE public.recurring_costs SET category_id = NULL;

-- Null out category_id on all existing recurring purchases
UPDATE public.purchases SET category_id = NULL WHERE is_recurring = true;
