-- Configure once per environment with real values:
-- replace <PROJECT_REF> and <SERVICE_ROLE_OR_FUNCTION_SECRET>.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select
  cron.schedule(
    'family-tracker-quarter-hour-sync',
    '*/15 * * * *',
    $$
    select
      net.http_post(
        url := 'https://<PROJECT_REF>.supabase.co/functions/v1/sync-all',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', '<SERVICE_ROLE_OR_FUNCTION_SECRET>'
        ),
        body := '{"source":"pg_cron"}'::jsonb
      );
    $$
  );
