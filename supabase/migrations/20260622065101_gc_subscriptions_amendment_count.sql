alter table public.gc_subscriptions
  add column if not exists amendment_count integer not null default 0;