-- Phase 8 (Notifications): auto-expiry refund email + scheduler.
--
-- Context: expire_pending_redemptions() transitions pending requests (>7 days) to
-- 'expired' and posts the redemption_refund ledger entry, but (a) nothing ever
-- called it (no scheduler) and (b) the user got no email, because the client-side
-- best-effort notifier only runs when a browser is present and expiry is server-side.
--
-- This migration:
--   1. Enables pg_cron and schedules the expiry sweep hourly.
--   2. Adds an AFTER UPDATE trigger scoped ONLY to the `-> expired` transition that
--      asynchronously (pg_net) POSTs to the existing `redemption-notifications` edge
--      function with the `request_failed` event (which already renders "expired" copy).
--      Async => an email failure can never roll back the financial refund.
--      Scoped to `expired` only => no overlap with the client-side new_request /
--      admin-cancel(->failed) emails, so no duplicate emails.
--   3. Revokes public EXECUTE on expire_pending_redemptions (cron/postgres only) to
--      clear the security-advisor finding (anon/authenticated could otherwise call it).
--
-- Vault config consumed at runtime (created out-of-band, never committed):
--   project_url      -> https://<ref>.supabase.co
--   edge_invoke_key  -> publishable key used as the Authorization Bearer

create extension if not exists pg_cron;

-- Trigger: notify the owner when their pending redemption auto-expires.
create or replace function public.notify_redemption_expired()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base_url text;
  v_key      text;
begin
  select decrypted_secret into v_base_url
  from vault.decrypted_secrets where name = 'project_url';

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'edge_invoke_key';

  -- Missing config must never block the refund — skip the email silently.
  if v_base_url is null or v_key is null then
    return new;
  end if;

  perform net.http_post(
    url     := v_base_url || '/functions/v1/redemption-notifications',
    body    := jsonb_build_object('event', 'request_failed', 'requestId', new.id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    )
  );

  return new;
end;
$$;

drop trigger if exists notify_user_on_redemption_expired on public.redemption_requests;
create trigger notify_user_on_redemption_expired
after update on public.redemption_requests
for each row
when (old.status <> 'expired' and new.status = 'expired')
execute function public.notify_redemption_expired();

-- Only the scheduler (postgres) should sweep expiries.
revoke execute on function public.expire_pending_redemptions() from anon, authenticated;

-- Hourly expiry sweep (idempotent: schedule() upserts by job name).
select cron.schedule(
  'expire-pending-redemptions',
  '0 * * * *',
  $cron$ select public.expire_pending_redemptions(); $cron$
);
