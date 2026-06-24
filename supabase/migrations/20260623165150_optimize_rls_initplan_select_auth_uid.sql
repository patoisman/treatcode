-- Phase 9 hardening: performance advisor lint 0003 (auth_rls_initplan).
-- Wrap auth.uid() in a scalar subquery so Postgres evaluates it ONCE per query
-- (InitPlan) instead of once per row. Behaviour is identical; only the query plan
-- changes. is_admin() is left as-is (not flagged; it is a stable helper). Each
-- policy below is recreated byte-identical except for the (select auth.uid()) wrap.

drop policy profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to public
  using (((select auth.uid()) = id) or is_admin());

drop policy gc_customers_select on public.gc_customers;
create policy gc_customers_select on public.gc_customers for select to public
  using (((select auth.uid()) = user_id) or is_admin());

drop policy gc_mandates_select on public.gc_mandates;
create policy gc_mandates_select on public.gc_mandates for select to public
  using (((select auth.uid()) = user_id) or is_admin());

drop policy gc_billing_requests_select on public.gc_billing_requests;
create policy gc_billing_requests_select on public.gc_billing_requests for select to public
  using (((select auth.uid()) = user_id) or is_admin());

drop policy gc_subscriptions_select on public.gc_subscriptions;
create policy gc_subscriptions_select on public.gc_subscriptions for select to public
  using (((select auth.uid()) = user_id) or is_admin());

drop policy gc_payments_select on public.gc_payments;
create policy gc_payments_select on public.gc_payments for select to public
  using (((select auth.uid()) = user_id) or is_admin());

drop policy ledger_select on public.ledger_entries;
create policy ledger_select on public.ledger_entries for select to public
  using (((select auth.uid()) = user_id) or is_admin());

drop policy balance_cache_select on public.user_balance_cache;
create policy balance_cache_select on public.user_balance_cache for select to public
  using (((select auth.uid()) = user_id) or is_admin());

drop policy redemption_requests_select on public.redemption_requests;
create policy redemption_requests_select on public.redemption_requests for select to public
  using (((select auth.uid()) = user_id) or is_admin());

drop policy redemption_fulfillments_select on public.redemption_fulfillments;
create policy redemption_fulfillments_select on public.redemption_fulfillments for select to public
  using (
    is_admin() or (exists (
      select 1 from redemption_requests r
      where r.id = redemption_fulfillments.request_id
        and r.user_id = (select auth.uid())
    ))
  );
