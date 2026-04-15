-- Add recurring/discretionary breakdown to the period_totals view.
-- Budget tracking uses discretionary_cents; settlement uses total_cents.

DROP VIEW IF EXISTS public.period_totals;

CREATE VIEW public.period_totals
  WITH (security_invoker = true)
AS
SELECT
  p.id AS period_id,
  p.family_id,
  COALESCE(pur.total, 0)::integer AS purchase_cents,
  COALESCE(pur.recurring, 0)::integer AS recurring_cents,
  COALESCE(pur.discretionary, 0)::integer AS discretionary_cents,
  COALESCE(gc.total, 0)::integer AS goal_cents,
  (COALESCE(pur.total, 0) + COALESCE(gc.total, 0))::integer AS total_cents
FROM public.periods p
LEFT JOIN (
  SELECT
    period_id,
    SUM(amount_cents) AS total,
    SUM(CASE WHEN is_recurring THEN amount_cents ELSE 0 END) AS recurring,
    SUM(CASE WHEN NOT is_recurring THEN amount_cents ELSE 0 END) AS discretionary
  FROM public.purchases
  GROUP BY period_id
) pur ON pur.period_id = p.id
LEFT JOIN (
  SELECT period_id, SUM(amount_cents) AS total
  FROM public.goal_contributions
  WHERE period_id IS NOT NULL
  GROUP BY period_id
) gc ON gc.period_id = p.id;
