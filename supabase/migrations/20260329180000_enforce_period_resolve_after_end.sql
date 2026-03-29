-- Block marking a period "resolved" until its inclusive end date has passed (UTC calendar day).

CREATE OR REPLACE FUNCTION public.enforce_period_resolve_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  utc_today date;
BEGIN
  utc_today := (now() AT TIME ZONE 'UTC')::date;

  IF NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved' THEN
    IF OLD.status <> 'archived' THEN
      RAISE EXCEPTION 'Only archived periods can be marked settled';
    END IF;
    IF OLD.ends_at >= utc_today THEN
      RAISE EXCEPTION 'Cannot mark a period settled before it has ended';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS periods_enforce_resolve ON public.periods;

CREATE TRIGGER periods_enforce_resolve
  BEFORE UPDATE ON public.periods
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_period_resolve_rules();
