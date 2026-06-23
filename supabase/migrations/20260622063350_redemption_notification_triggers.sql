
-- Shared trigger function: POSTs the row event to the redemption-notifications Edge Function
create or replace function public.notify_redemption_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_payload jsonb;
begin
  v_payload := jsonb_build_object(
    'type',       TG_OP,
    'table',      TG_TABLE_NAME,
    'record',     row_to_json(NEW),
    'old_record', case when TG_OP = 'UPDATE' then row_to_json(OLD) else null end
  );

  perform net.http_post(
    url     := 'https://iipitqtwhfdpqrluoasp.supabase.co/functions/v1/redemption-notifications',
    body    := v_payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  return NEW;
end;
$$;

-- Fires on every new redemption request → admin notification email
create trigger notify_admin_on_new_redemption
after insert on public.redemption_requests
for each row
execute function public.notify_redemption_event();

-- Fires only when status transitions INTO failed/expired → user refund email
create trigger notify_user_on_redemption_failed
after update on public.redemption_requests
for each row
when (
  old.status not in ('failed', 'expired') and
  new.status in ('failed', 'expired')
)
execute function public.notify_redemption_event();
