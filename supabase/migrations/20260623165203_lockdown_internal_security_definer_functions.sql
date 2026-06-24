-- Phase 9 hardening: security advisor lints 0028/0029 — SECURITY DEFINER functions
-- directly callable via PostgREST by anon/authenticated. These are internal state-
-- machine / trigger helpers, not client endpoints. Revoke the implicit PUBLIC grant
-- plus the explicit anon/authenticated grants. service_role (edge functions) and the
-- postgres owner keep EXECUTE, so all server-side callers keep working; trigger
-- functions fire as their definer regardless of caller EXECUTE.

-- Called only by admin-fulfilment via the service-role client (never client-side).
revoke execute on function public.transition_redemption(uuid, text, text, uuid) from public, anon, authenticated;

-- Unused (admin-fulfilment transitions inline); guarded by is_admin() if ever revived.
revoke execute on function public.admin_claim_redemption(uuid) from public, anon, authenticated;

-- Unused: the client-side onboarding RPC was removed (it raced session restore);
-- completion is now done by edge functions via the service-role/admin client.
revoke execute on function public.complete_onboarding() from public, anon, authenticated;

-- Trigger functions: invoked by triggers as the definer; never a client endpoint.
revoke execute on function public.update_balance_cache() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.notify_redemption_expired() from public, anon, authenticated;

-- admin_fail_redemption IS called client-side by admins (admin cancel/refund) and
-- guards via is_admin() internally — same posture as request_redemption. Keep
-- `authenticated`; only strip anon + the implicit PUBLIC grant.
revoke execute on function public.admin_fail_redemption(uuid, text) from public, anon;
