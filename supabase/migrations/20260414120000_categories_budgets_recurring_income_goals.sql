-- Categories, category budgets, recurring costs, member income, goals, purchase extensions

-- ==================== categories ====================
CREATE TABLE public.categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  uuid REFERENCES public.families ON DELETE CASCADE,
  name       text NOT NULL,
  icon       text NOT NULL DEFAULT 'pricetag-outline',
  color      text NOT NULL DEFAULT '#208AEF',
  sort_order integer NOT NULL DEFAULT 0,
  is_system  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.categories.family_id IS
  'NULL = system default for all families; non-null = custom category for that family.';

CREATE UNIQUE INDEX categories_system_name_unique ON public.categories (name)
  WHERE family_id IS NULL;

CREATE UNIQUE INDEX categories_family_name_unique ON public.categories (family_id, name)
  WHERE family_id IS NOT NULL;

INSERT INTO public.categories (family_id, name, icon, color, sort_order, is_system) VALUES
  (NULL, 'Groceries', 'cart-outline', '#34C759', 0, true),
  (NULL, 'Transport', 'car-outline', '#FF9F0A', 1, true),
  (NULL, 'Entertainment', 'film-outline', '#AF52DE', 2, true),
  (NULL, 'Home', 'home-outline', '#208AEF', 3, true),
  (NULL, 'Dining Out', 'restaurant-outline', '#FF3B30', 4, true),
  (NULL, 'Health', 'fitness-outline', '#30D158', 5, true),
  (NULL, 'Shopping', 'bag-outline', '#FF6482', 6, true),
  (NULL, 'Other', 'ellipsis-horizontal-outline', '#8E8E93', 99, true);

ALTER TABLE public.purchases
  ADD COLUMN category_id uuid REFERENCES public.categories ON DELETE SET NULL;

CREATE INDEX idx_purchases_category ON public.purchases (category_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

CREATE POLICY categories_system_read ON public.categories
  FOR SELECT TO authenticated
  USING (family_id IS NULL);

CREATE POLICY categories_family_read ON public.categories
  FOR SELECT TO authenticated
  USING (family_id IS NOT NULL AND public.is_family_member(family_id));

CREATE POLICY categories_owner_insert ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (family_id IS NOT NULL AND public.is_family_owner(family_id));

CREATE POLICY categories_owner_update ON public.categories
  FOR UPDATE TO authenticated
  USING (family_id IS NOT NULL AND public.is_family_owner(family_id))
  WITH CHECK (family_id IS NOT NULL AND public.is_family_owner(family_id));

CREATE POLICY categories_owner_delete ON public.categories
  FOR DELETE TO authenticated
  USING (family_id IS NOT NULL AND public.is_family_owner(family_id));

-- ==================== category_budgets ====================
CREATE TABLE public.category_budgets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    uuid NOT NULL REFERENCES public.families ON DELETE CASCADE,
  category_id  uuid NOT NULL REFERENCES public.categories ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, category_id)
);

CREATE INDEX idx_category_budgets_family ON public.category_budgets (family_id);

ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets FORCE ROW LEVEL SECURITY;

CREATE POLICY category_budgets_member_read ON public.category_budgets
  FOR SELECT TO authenticated
  USING (public.is_family_member(family_id));

CREATE POLICY category_budgets_owner_manage ON public.category_budgets
  FOR ALL TO authenticated
  USING (public.is_family_owner(family_id))
  WITH CHECK (public.is_family_owner(family_id));

-- ==================== recurring_costs + purchase flags ====================
CREATE TABLE public.recurring_costs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id        uuid NOT NULL REFERENCES public.families ON DELETE CASCADE,
  category_id      uuid REFERENCES public.categories ON DELETE SET NULL,
  description      text NOT NULL,
  amount_cents     integer NOT NULL CHECK (amount_cents > 0),
  default_payer_id uuid REFERENCES auth.users ON DELETE SET NULL,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_recurring_costs_family ON public.recurring_costs (family_id)
  WHERE is_active;

ALTER TABLE public.recurring_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_costs FORCE ROW LEVEL SECURITY;

CREATE POLICY recurring_costs_member_read ON public.recurring_costs
  FOR SELECT TO authenticated
  USING (public.is_family_member(family_id));

CREATE POLICY recurring_costs_owner_manage ON public.recurring_costs
  FOR ALL TO authenticated
  USING (public.is_family_owner(family_id))
  WITH CHECK (public.is_family_owner(family_id));

ALTER TABLE public.purchases
  ADD COLUMN is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN recurring_cost_id uuid REFERENCES public.recurring_costs ON DELETE SET NULL;

CREATE UNIQUE INDEX purchases_period_recurring_unique ON public.purchases (period_id, recurring_cost_id)
  WHERE recurring_cost_id IS NOT NULL;

-- Allow any family member to claim a recurring purchase (reassign user_id)
CREATE POLICY purchases_recurring_claim ON public.purchases
  FOR UPDATE TO authenticated
  USING (is_recurring = true AND public.is_family_member(family_id))
  WITH CHECK (
    is_recurring = true
    AND public.is_family_member(family_id)
    AND user_id = auth.uid()
  );

-- ==================== member income ====================
ALTER TABLE public.family_members
  ADD COLUMN income_cents integer;

COMMENT ON COLUMN public.family_members.income_cents IS
  'Monthly income in cents; NULL = use even split in settlement.';

-- ==================== goals ====================
CREATE TABLE public.goals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id     uuid NOT NULL REFERENCES public.families ON DELETE CASCADE,
  name          text NOT NULL,
  target_cents  integer NOT NULL CHECK (target_cents > 0),
  icon          text NOT NULL DEFAULT 'flag-outline',
  color         text NOT NULL DEFAULT '#208AEF',
  created_by    uuid NOT NULL REFERENCES auth.users,
  created_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz
);

CREATE TABLE public.goal_contributions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id      uuid NOT NULL REFERENCES public.goals ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_goals_family ON public.goals (family_id);
CREATE INDEX idx_goal_contributions_goal ON public.goal_contributions (goal_id);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions FORCE ROW LEVEL SECURITY;

CREATE POLICY goals_member_read ON public.goals
  FOR SELECT TO authenticated
  USING (public.is_family_member(family_id));

CREATE POLICY goals_member_insert ON public.goals
  FOR INSERT TO authenticated
  WITH CHECK (public.is_family_member(family_id) AND created_by = auth.uid());

CREATE POLICY goals_creator_or_owner_update ON public.goals
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.is_family_owner(family_id))
  WITH CHECK (public.is_family_member(family_id));

CREATE POLICY goals_creator_or_owner_delete ON public.goals
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.is_family_owner(family_id));

CREATE POLICY goal_contributions_member_read ON public.goal_contributions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_id AND public.is_family_member(g.family_id)
    )
  );

CREATE POLICY goal_contributions_member_insert ON public.goal_contributions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_id AND public.is_family_member(g.family_id)
    )
  );

CREATE POLICY goal_contributions_own_delete ON public.goal_contributions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
