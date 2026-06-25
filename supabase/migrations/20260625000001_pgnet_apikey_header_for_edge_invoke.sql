-- Migrate pg_net → edge function call from legacy Authorization: Bearer header
-- to the new apikey header, required by Supabase's new publishable/secret key system.
--
-- Background: new Supabase keys (sb_publishable_..., sb_secret_...) are not JWTs
-- and therefore cannot be sent in `Authorization: Bearer`. The correct header for
-- server-to-server (pg_net) calls is `apikey`. The edge_invoke_key stored in Vault
-- remains the same publishable key value — it now goes into `apikey` instead.
--
-- The corresponding edge function (redemption-notifications) is redeployed with
-- verify_jwt = false so the gateway accepts the request without a user JWT in the
-- Authorization header. Browser-side callers (useRequestRedemption, useCancelRedemption)
-- continue to work unchanged — the gateway skips JWT verification and the function
-- handles its own logic.

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
      'apikey', v_key
    )
  );

  return new;
end;
$$;
