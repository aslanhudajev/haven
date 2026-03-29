-- Device push tokens (Expo) for server-triggered notifications.
-- periods.period_end_push_sent_at: idempotency for daily "period ended" push job.

CREATE TABLE public.push_tokens (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  expo_push_token text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.periods
  ADD COLUMN IF NOT EXISTS period_end_push_sent_at timestamptz;

COMMENT ON COLUMN public.periods.period_end_push_sent_at IS
  'Set after a successful period-end push for this period; prevents duplicate daily sends.';

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens FORCE ROW LEVEL SECURITY;

CREATE POLICY push_tokens_own ON public.push_tokens
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
