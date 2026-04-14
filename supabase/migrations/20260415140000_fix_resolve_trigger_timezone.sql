-- Fix: the resolve trigger used UTC date, but period dates are calendar dates
-- evaluated in the user's local timezone. A user at UTC+2 on "April 15 00:06"
-- is still "April 14" in UTC, so the trigger rejected valid settle attempts.
--
-- Since archival already enforces that the period has ended (dashboard rotation
-- uses local time), the trigger only needs to verify archived status — not
-- re-check the date with a different timezone assumption.

CREATE OR REPLACE FUNCTION public.enforce_period_resolve_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved' THEN
    IF OLD.status <> 'archived' THEN
      RAISE EXCEPTION 'Only archived periods can be marked settled';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
