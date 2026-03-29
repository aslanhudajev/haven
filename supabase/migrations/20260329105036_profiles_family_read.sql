-- Allow family members to read each other's profiles.
-- Uses a SECURITY DEFINER helper to bypass RLS on family_members
-- when resolving the "shares a family" check.

CREATE OR REPLACE FUNCTION public.shares_family_with(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.family_members me
    JOIN public.family_members them ON me.family_id = them.family_id
    WHERE me.user_id = auth.uid()
      AND them.user_id = target_user_id
  );
$$;

CREATE POLICY profiles_family_read ON public.profiles
  FOR SELECT TO authenticated
  USING (public.shares_family_with(id));
