-- User-configurable period cadence
-- monthly: anchor_day = day of month (1-28)
-- weekly / biweekly: anchor_day = day of week (1=Mon … 7=Sun)

ALTER TABLE public.families
  ADD COLUMN period_cadence text NOT NULL DEFAULT 'monthly',
  ADD COLUMN period_anchor_day integer NOT NULL DEFAULT 1;
