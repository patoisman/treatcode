-- The prior migration revoked EXECUTE from anon/authenticated, but Postgres grants
-- function EXECUTE to PUBLIC by default and both roles inherit it from there, so the
-- revoke was a no-op. Revoke from PUBLIC instead. expire_pending_redemptions() is a
-- server-only sweep (no internal auth check) invoked solely by the pg_cron job, which
-- runs as postgres; service_role retains its explicit grant for any backend use.
revoke execute on function public.expire_pending_redemptions() from public;
