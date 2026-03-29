-- ============================================================
-- Onboarding flag, subscription-derived columns, member limit
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;

ALTER TABLE public.families
  ADD COLUMN is_active boolean NOT NULL DEFAULT false,
  ADD COLUMN max_members integer NOT NULL DEFAULT 2;

-- Prevent adding members beyond the family's plan limit.
-- RevenueCat webhook keeps max_members in sync with the subscription tier.
CREATE OR REPLACE FUNCTION public.check_family_member_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  max_allowed integer;
BEGIN
  SELECT f.max_members INTO max_allowed
  FROM public.families f
  WHERE f.id = NEW.family_id;

  SELECT count(*) INTO current_count
  FROM public.family_members
  WHERE family_id = NEW.family_id;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Family member limit reached (% of % allowed)',
      current_count, max_allowed;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_family_member_limit
  BEFORE INSERT ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_family_member_limit();
