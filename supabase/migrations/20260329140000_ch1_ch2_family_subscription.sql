-- Chapter 1–2: one membership per user, invite audit, ownership transfer

ALTER TABLE public.family_invites
  ADD COLUMN IF NOT EXISTS used_at timestamptz;

-- At most one family per user (prevents multi-family membership)
ALTER TABLE public.family_members
  ADD CONSTRAINT family_members_user_id_key UNIQUE (user_id);

CREATE OR REPLACE FUNCTION public.transfer_family_ownership(p_new_owner_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id uuid;
BEGIN
  SELECT id INTO v_family_id FROM public.families WHERE owner_id = auth.uid();

  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'not_family_owner' USING ERRCODE = 'P0001';
  END IF;

  IF p_new_owner_user_id = auth.uid() THEN
    RAISE EXCEPTION 'already_owner' USING ERRCODE = 'P0001';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = v_family_id AND user_id = p_new_owner_user_id
  ) THEN
    RAISE EXCEPTION 'new_owner_not_in_family' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.families SET owner_id = p_new_owner_user_id WHERE id = v_family_id;

  UPDATE public.family_members SET role = 'member'
  WHERE family_id = v_family_id AND user_id = auth.uid();

  UPDATE public.family_members SET role = 'owner'
  WHERE family_id = v_family_id AND user_id = p_new_owner_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_family_ownership(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_family_ownership(uuid) TO authenticated;
