-- Phase 9 hardening: close the SECURITY DEFINER RLS-bypass on the legacy
-- public.user_balances view (security advisor lint 0010, ERROR level).
--
-- The app never reads this view (it uses public.user_balance_cache); the view is
-- a per-user ledger aggregate kept for ad-hoc/SQL use. As a SECURITY DEFINER view
-- it ignored the caller's RLS and could expose every user's balance via PostgREST.
-- security_invoker = on makes it enforce the querying user's ledger_entries RLS
-- (own rows only, or all rows for admins) — identical safe semantics, no bypass.
alter view public.user_balances set (security_invoker = on);
