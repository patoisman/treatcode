
create table public.ledger_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id),
  entry_type      text not null
    check (entry_type in (
      'deposit_ibp',
      'deposit_bacs',
      'redemption_debit',
      'redemption_refund',
      'chargeback_reversal'
    )),
  amount_pence    integer not null check (amount_pence > 0),
  is_credit       boolean not null generated always as (
    entry_type in ('deposit_ibp', 'deposit_bacs', 'redemption_refund')
  ) stored,
  source_type     text not null check (source_type in ('gc_payment', 'redemption_request')),
  source_id       text not null,
  idempotency_key text not null unique,
  description     text not null,
  created_at      timestamptz not null default now()
);

create index on public.ledger_entries (user_id, created_at desc);

create view public.user_balances as
select
  user_id,
  coalesce(sum(case when is_credit then amount_pence else -amount_pence end), 0)::integer
    as balance_pence
from public.ledger_entries
group by user_id;

create table public.user_balance_cache (
  user_id         uuid primary key references public.profiles(id),
  balance_pence   integer not null default 0 check (balance_pence >= 0),
  last_entry_id   uuid references public.ledger_entries(id),
  updated_at      timestamptz not null default now()
);

create or replace function public.update_balance_cache()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_delta integer;
begin
  v_delta := case when new.is_credit then new.amount_pence else -new.amount_pence end;
  insert into public.user_balance_cache (user_id, balance_pence, last_entry_id, updated_at)
  values (new.user_id, greatest(0, v_delta), new.id, now())
  on conflict (user_id) do update
    set balance_pence = greatest(0, user_balance_cache.balance_pence + v_delta),
        last_entry_id = new.id,
        updated_at    = now();
  return new;
end;
$$;

create trigger after_ledger_insert
  after insert on public.ledger_entries
  for each row execute function public.update_balance_cache();
