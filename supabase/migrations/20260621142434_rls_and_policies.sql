
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

alter table public.profiles             enable row level security;
alter table public.gc_customers         enable row level security;
alter table public.gc_mandates          enable row level security;
alter table public.gc_billing_requests  enable row level security;
alter table public.gc_subscriptions     enable row level security;
alter table public.gc_payments          enable row level security;
alter table public.gc_payouts           enable row level security;
alter table public.ledger_entries       enable row level security;
alter table public.user_balance_cache   enable row level security;
alter table public.brands               enable row level security;
alter table public.redemption_requests  enable row level security;
alter table public.redemption_fulfillments enable row level security;
alter table public.gc_webhook_events    enable row level security;

create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or is_admin());

create policy "gc_customers_select"        on public.gc_customers        for select using (auth.uid() = user_id or is_admin());
create policy "gc_mandates_select"         on public.gc_mandates         for select using (auth.uid() = user_id or is_admin());
create policy "gc_billing_requests_select" on public.gc_billing_requests for select using (auth.uid() = user_id or is_admin());
create policy "gc_subscriptions_select"    on public.gc_subscriptions    for select using (auth.uid() = user_id or is_admin());
create policy "gc_payments_select"         on public.gc_payments         for select using (auth.uid() = user_id or is_admin());
create policy "gc_payouts_admin"           on public.gc_payouts          for select using (is_admin());

create policy "ledger_select"        on public.ledger_entries     for select using (auth.uid() = user_id or is_admin());
create policy "balance_cache_select" on public.user_balance_cache for select using (auth.uid() = user_id or is_admin());

create policy "brands_select" on public.brands
  for select using (is_active = true or is_admin());
create policy "brands_admin_write" on public.brands
  for all using (is_admin());

create policy "redemption_requests_select" on public.redemption_requests
  for select using (auth.uid() = user_id or is_admin());

create policy "redemption_fulfillments_select" on public.redemption_fulfillments
  for select using (
    is_admin() or
    exists (
      select 1 from public.redemption_requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );
