-- Daily job at 10:00 server time (UTC on Supabase hosted) → Edge Function notify-period-end-push.
-- Local Supabase: Postgres resolves `kong` inside Docker; Bearer must match secrets CRON_SECRET on the function.
-- Hosted production: after deploy, either (1) run this migration’s schedule block edited with
--     https://<project-ref>.supabase.co/functions/v1/notify-period-end-push
--   or (2) unschedule this job and create a Dashboard cron with the public URL.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$
DECLARE
  jid int;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'notify-period-end-push-daily' LIMIT 1;
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;
END $$;

-- 0 10 * * * = 10:00 every day (pg_cron uses database server timezone; typically UTC on Supabase).
SELECT cron.schedule(
  'notify-period-end-push-daily',
  '0 10 * * *',
  $cron$
  SELECT net.http_post(
    url := 'http://kong:8000/functions/v1/notify-period-end-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer local-cron-dev-secret'
    ),
    body := '{}'::jsonb
  );
  $cron$
);
