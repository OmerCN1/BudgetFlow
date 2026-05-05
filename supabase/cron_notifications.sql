-- Supabase Dashboard → Database → Extensions → pg_cron aktif edilmeli
-- pg_net de HTTP çağrıları için gereklidir.
-- Ardından app.settings değerlerini proje URL'niz ve service-role key'inizle ayarlayıp bu SQL'i çalıştırın.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Örnek:
-- alter database postgres set app.settings.supabase_url = 'https://your-project-ref.supabase.co';
-- alter database postgres set app.settings.service_role_key = 'your-service-role-key';

-- Haftalık özet: Her Pazartesi sabah 09:00 (Europe/Istanbul → UTC+3 = 06:00 UTC)
select cron.schedule(
  'weekly-notification-summary',
  '0 6 * * 1',
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{"type":"weekly"}'::jsonb
  )
  $$
);

-- Günlük uyarı taraması: Her gün sabah 08:00 UTC (11:00 Istanbul)
select cron.schedule(
  'daily-alert-scan',
  '0 8 * * *',
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{"type":"alert"}'::jsonb
  )
  $$
);

-- Zamanlanmış görevleri görüntüle
-- select * from cron.job;

-- Zamanlanmış görevleri kaldır (gerekirse)
-- select cron.unschedule('weekly-notification-summary');
-- select cron.unschedule('daily-alert-scan');
