
create table public.brands (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  slug                  text not null unique,
  logo_url              text,
  description           text,
  min_redemption_pence  integer not null,
  max_redemption_pence  integer not null,
  allowed_denominations integer[],
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (max_redemption_pence > min_redemption_pence)
);

create table public.redemption_requests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id),
  brand_id       uuid not null references public.brands(id),
  amount_pence   integer not null check (amount_pence > 0),
  status         text not null default 'requested'
    check (status in ('requested','fulfilling','fulfilled','failed','expired')),
  claimed_by     uuid references public.profiles(id),
  expires_at     timestamptz not null default (now() + interval '7 days'),
  requested_at   timestamptz not null default now(),
  fulfilling_at  timestamptz,
  fulfilled_at   timestamptz,
  failed_at      timestamptz,
  failure_reason text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index on public.redemption_requests (user_id, status);
create index on public.redemption_requests (status, requested_at)
  where status in ('requested','fulfilling');

create table public.redemption_fulfillments (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references public.redemption_requests(id) unique,
  voucher_code text not null,
  voucher_pin  text,
  instructions text,
  admin_notes  text,
  created_at   timestamptz not null default now(),
  created_by   uuid references public.profiles(id)
);
