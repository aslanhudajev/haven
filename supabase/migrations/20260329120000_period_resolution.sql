-- Add period resolution tracking.
-- Status flow: active -> archived -> resolved

ALTER TABLE public.periods
  DROP CONSTRAINT IF EXISTS periods_status_check;

ALTER TABLE public.periods
  ADD CONSTRAINT periods_status_check
  CHECK (status IN ('active', 'archived', 'resolved'));

ALTER TABLE public.periods
  ADD COLUMN resolved_at timestamptz,
  ADD COLUMN resolved_by uuid REFERENCES auth.users;
