-- At most one active period per family (prevents duplicate rotation races).

WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY family_id ORDER BY created_at DESC
    ) AS rn
  FROM public.periods
  WHERE status = 'active'
)
UPDATE public.periods p
SET status = 'archived'
FROM ranked r
WHERE p.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX periods_one_active_per_family
ON public.periods (family_id)
WHERE status = 'active';
