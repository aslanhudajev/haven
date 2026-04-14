-- Aggregated period totals: purchases + goal contributions in a single view.
-- PostgREST auto-exposes this as a queryable resource.
-- Underlying table RLS filters rows; the view-level policy gates access.

CREATE VIEW public.period_totals
  WITH (security_invoker = true)
AS
SELECT
  p.id AS period_id,
  p.family_id,
  COALESCE(pur.total, 0)::integer AS purchase_cents,
  COALESCE(gc.total, 0)::integer AS goal_cents,
  (COALESCE(pur.total, 0) + COALESCE(gc.total, 0))::integer AS total_cents
FROM public.periods p
LEFT JOIN (
  SELECT period_id, SUM(amount_cents) AS total
  FROM public.purchases
  GROUP BY period_id
) pur ON pur.period_id = p.id
LEFT JOIN (
  SELECT period_id, SUM(amount_cents) AS total
  FROM public.goal_contributions
  WHERE period_id IS NOT NULL
  GROUP BY period_id
) gc ON gc.period_id = p.id;
