
create table public.gc_customers (
  id         text primary key,
  user_id    uuid not null references public.profiles(id),
  email      text not null,
  created_at timestamptz not null default now()
);

create table public.gc_mandates (
  id                      text primary key,
  user_id                 uuid not null references public.profiles(id),
  customer_id             text not null references public.gc_customers(id),
  scheme                  text not null default 'bacs',
  status                  text not null
    check (status in ('pending_submission','submitted','active','failed',
                      'cancelled','expired','consumed','blocked')),
  next_possible_charge_date date,
  replaced_by_mandate_id  text,
  raw                     jsonb not null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index on public.gc_mandates (user_id, status);

create table public.gc_billing_requests (
  id             text primary key,
  user_id        uuid not null references public.profiles(id),
  purpose        text not null default 'initial_setup'
    check (purpose in ('initial_setup')),
  status         text not null
    check (status in ('pending','fulfilling','fulfilled','cancelled','failed')),
  mandate_id     text,
  ibp_payment_id text,
  flow_id        text,
  raw            jsonb not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.gc_subscriptions (
  id            text primary key,
  user_id       uuid not null references public.profiles(id),
  mandate_id    text not null references public.gc_mandates(id),
  amount_pence  integer not null,
  currency      text not null default 'GBP',
  interval_unit text not null default 'monthly',
  day_of_month  integer,
  start_date    date,
  status        text not null
    check (status in ('pending_customer_approval','active','paused',
                      'cancelled','finished','customer_approval_denied')),
  raw           jsonb not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.gc_payouts (
  id           text primary key,
  amount_pence integer not null,
  currency     text not null default 'GBP',
  status       text not null,
  arrival_date date,
  raw          jsonb not null,
  created_at   timestamptz not null default now()
);

create table public.gc_payments (
  id              text primary key,
  user_id         uuid not null references public.profiles(id),
  subscription_id text references public.gc_subscriptions(id),
  mandate_id      text references public.gc_mandates(id),
  scheme          text not null,
  amount_pence    integer not null,
  currency        text not null default 'GBP',
  status          text not null
    check (status in ('pending_submission','submitted','confirmed',
                      'paid_out','failed','charged_back','cancelled')),
  charge_date     date,
  payout_id       text references public.gc_payouts(id),
  raw             jsonb not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index on public.gc_payments (user_id, status);
create index on public.gc_payments (subscription_id) where subscription_id is not null;
