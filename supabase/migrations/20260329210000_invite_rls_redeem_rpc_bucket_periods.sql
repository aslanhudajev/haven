-- 1) Atomic invite redemption (no global SELECT on family_invites for arbitrary users)
-- 2) Remove permissive authenticated read on family_invites
-- 3) Ensure receipts storage bucket exists
-- 4) Split periods policies: members read/insert/update; only owner may DELETE

CREATE OR REPLACE FUNCTION public.redeem_family_invite(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  r_inv public.family_invites%ROWTYPE;
  v_fam public.families%ROWTYPE;
  v_count integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'JOIN_FAMILY_UNAUTHORIZED';
  END IF;

  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RAISE EXCEPTION 'JOIN_FAMILY_NOT_FOUND';
  END IF;

  SELECT * INTO r_inv
  FROM public.family_invites
  WHERE code = trim(p_code)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'JOIN_FAMILY_NOT_FOUND';
  END IF;

  IF r_inv.used_by IS NOT NULL THEN
    IF r_inv.used_by = v_uid THEN
      IF EXISTS (
        SELECT 1 FROM public.family_members fm
        WHERE fm.user_id = v_uid AND fm.family_id = r_inv.family_id
      ) THEN
        RETURN r_inv.family_id;
      END IF;
    END IF;
    RAISE EXCEPTION 'JOIN_FAMILY_USED';
  END IF;

  IF r_inv.expires_at <= now() THEN
    RAISE EXCEPTION 'JOIN_FAMILY_EXPIRED';
  END IF;

  SELECT * INTO v_fam FROM public.families WHERE id = r_inv.family_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'JOIN_FAMILY_NOT_FOUND';
  END IF;

  IF EXISTS (SELECT 1 FROM public.family_members WHERE user_id = v_uid) THEN
    IF EXISTS (
      SELECT 1 FROM public.family_members
      WHERE user_id = v_uid AND family_id = r_inv.family_id
    ) THEN
      RETURN r_inv.family_id;
    END IF;
    RAISE EXCEPTION 'JOIN_FAMILY_ALREADY_IN_FAMILY';
  END IF;

  SELECT count(*)::integer INTO v_count
  FROM public.family_members
  WHERE family_id = r_inv.family_id;

  IF v_count >= v_fam.max_members THEN
    RAISE EXCEPTION 'JOIN_FAMILY_FAMILY_FULL';
  END IF;

  BEGIN
    INSERT INTO public.family_members (family_id, user_id, role)
    VALUES (r_inv.family_id, v_uid, 'member');
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'JOIN_FAMILY_ALREADY_IN_FAMILY';
    WHEN OTHERS THEN
      IF SQLERRM LIKE '%member limit%' OR SQLERRM LIKE '%Family member limit%' THEN
        RAISE EXCEPTION 'JOIN_FAMILY_FAMILY_FULL';
      END IF;
      RAISE;
  END;

  UPDATE public.family_invites
  SET used_by = v_uid, used_at = now()
  WHERE id = r_inv.id;

  RETURN r_inv.family_id;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_family_invite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_family_invite(text) TO authenticated;

DROP POLICY IF EXISTS family_invites_authenticated_read ON public.family_invites;

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS periods_member_manage ON public.periods;

CREATE POLICY periods_member_select ON public.periods
  FOR SELECT TO authenticated
  USING (public.is_family_member(family_id));

CREATE POLICY periods_member_insert ON public.periods
  FOR INSERT TO authenticated
  WITH CHECK (public.is_family_member(family_id));

CREATE POLICY periods_member_update ON public.periods
  FOR UPDATE TO authenticated
  USING (public.is_family_member(family_id))
  WITH CHECK (public.is_family_member(family_id));

CREATE POLICY periods_owner_delete ON public.periods
  FOR DELETE TO authenticated
  USING (public.is_family_owner(family_id));
