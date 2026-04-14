-- Tie goal contributions to a period for ledger + settlement.

ALTER TABLE public.goal_contributions
  ADD COLUMN period_id uuid REFERENCES public.periods(id) ON DELETE SET NULL;

CREATE INDEX idx_goal_contributions_period ON public.goal_contributions(period_id);

-- Backfill: assign period where contribution date falls in period range for the goal's family.
UPDATE public.goal_contributions gc
SET period_id = sub.period_id
FROM (
  SELECT DISTINCT ON (gc2.id)
    gc2.id AS contribution_id,
    p.id AS period_id
  FROM public.goal_contributions gc2
  JOIN public.goals g ON g.id = gc2.goal_id
  JOIN public.periods p ON p.family_id = g.family_id
  WHERE gc2.period_id IS NULL
    AND (gc2.created_at AT TIME ZONE 'UTC')::date >= p.starts_at
    AND (gc2.created_at AT TIME ZONE 'UTC')::date <= p.ends_at
  ORDER BY gc2.id, p.starts_at DESC
) sub
WHERE gc.id = sub.contribution_id;

DROP POLICY IF EXISTS goal_contributions_member_insert ON public.goal_contributions;

CREATE POLICY goal_contributions_member_insert ON public.goal_contributions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND period_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_id
      AND public.is_family_member(g.family_id)
    )
    AND EXISTS (
      SELECT 1 FROM public.goals g
      JOIN public.periods p ON p.id = period_id
      WHERE g.id = goal_id
      AND p.family_id = g.family_id
    )
  );
