-- Allow the family owner to update any member row (e.g. income_cents).
-- The existing family_members_write policy's WITH CHECK restricts updates
-- to the user's own row, which blocks the owner from editing other members.

CREATE POLICY family_members_owner_update ON public.family_members
  FOR UPDATE TO authenticated
  USING  (public.is_family_owner(family_id))
  WITH CHECK (public.is_family_owner(family_id));
