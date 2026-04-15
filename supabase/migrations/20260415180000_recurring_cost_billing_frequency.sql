-- Add billing frequency to recurring costs so amounts can be prorated
-- to match the household's budget period cadence.
-- Values: weekly, biweekly, monthly, quarterly, yearly.

ALTER TABLE public.recurring_costs
  ADD COLUMN billing_frequency text NOT NULL DEFAULT 'monthly';

UPDATE public.recurring_costs SET billing_frequency = 'monthly';
