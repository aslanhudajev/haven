-- ============================================================
-- FiftyFifty initial schema
-- Tables: profiles, families, family_members, family_invites,
--         periods, purchases
--
-- Order: tables → helper functions → RLS policies → triggers
-- (SQL-language functions are validated at CREATE time, so
--  the referenced tables must already exist.)
-- ============================================================

-- pgcrypto lives in `extensions` on Supabase; qualify gen_random_bytes for DEFAULT resolution.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ==================== 1. TABLES ====================

CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name  text,
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.families (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  budget_cents integer,
  currency     text NOT NULL DEFAULT 'SEK',
  owner_id     uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.family_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id)
);

CREATE TABLE public.family_invites (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  uuid NOT NULL REFERENCES public.families ON DELETE CASCADE,
  code       text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  created_by uuid NOT NULL REFERENCES auth.users,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_by    uuid REFERENCES auth.users,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.periods (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  uuid NOT NULL REFERENCES public.families ON DELETE CASCADE,
  name       text NOT NULL,
  starts_at  date NOT NULL,
  ends_at    date NOT NULL,
  status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.purchases (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    uuid NOT NULL REFERENCES public.families ON DELETE CASCADE,
  period_id    uuid NOT NULL REFERENCES public.periods ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  description  text,
  receipt_url  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);


-- ==================== 2. HELPER FUNCTIONS ====================

CREATE OR REPLACE FUNCTION public.is_family_member(fam_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = fam_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_family_owner(fam_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.families
    WHERE id = fam_id AND owner_id = auth.uid()
  );
$$;


-- ==================== 3. ENABLE + FORCE RLS ====================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.families       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invites FORCE ROW LEVEL SECURITY;
ALTER TABLE public.periods        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods        FORCE ROW LEVEL SECURITY;
ALTER TABLE public.purchases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases      FORCE ROW LEVEL SECURITY;


-- ==================== 4. RLS POLICIES ====================

-- profiles: own row only
CREATE POLICY profiles_own ON public.profiles
  FOR ALL TO authenticated
  USING  (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- families: owner has full CRUD, any member can read
CREATE POLICY families_owner_manage ON public.families
  FOR ALL TO authenticated
  USING  (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY families_member_read ON public.families
  FOR SELECT TO authenticated
  USING (public.is_family_member(id));

-- family_members: any member can read the roster; a user can
-- insert/update/delete their own row; the family owner can also delete
-- any member (USING is OR'd, WITH CHECK restricts inserts to self).
CREATE POLICY family_members_member_read ON public.family_members
  FOR SELECT TO authenticated
  USING (public.is_family_member(family_id));

CREATE POLICY family_members_write ON public.family_members
  FOR ALL TO authenticated
  USING  (user_id = auth.uid() OR public.is_family_owner(family_id))
  WITH CHECK (user_id = auth.uid());

-- family_invites: owner manages, any authenticated user can look up by code
CREATE POLICY family_invites_owner_manage ON public.family_invites
  FOR ALL TO authenticated
  USING  (public.is_family_owner(family_id))
  WITH CHECK (public.is_family_owner(family_id));

CREATE POLICY family_invites_authenticated_read ON public.family_invites
  FOR SELECT TO authenticated
  USING (true);

-- periods: any family member has full CRUD
CREATE POLICY periods_member_manage ON public.periods
  FOR ALL TO authenticated
  USING  (public.is_family_member(family_id))
  WITH CHECK (public.is_family_member(family_id));

-- purchases: any member can read; only the author can write
CREATE POLICY purchases_member_read ON public.purchases
  FOR SELECT TO authenticated
  USING (public.is_family_member(family_id));

CREATE POLICY purchases_own_manage ON public.purchases
  FOR ALL TO authenticated
  USING  (user_id = auth.uid() AND public.is_family_member(family_id))
  WITH CHECK (user_id = auth.uid() AND public.is_family_member(family_id));

-- storage: family members can upload/read receipts under their family path
CREATE POLICY receipts_member_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND public.is_family_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY receipts_member_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND public.is_family_member((storage.foldername(name))[1]::uuid)
  );


-- ==================== 5. TRIGGERS ====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
