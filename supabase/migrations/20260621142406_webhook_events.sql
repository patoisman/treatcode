
create table public.gc_webhook_events (
  id               text primary key,
  resource_type    text not null,
  action           text not null,
  cause            text,
  resource_id      text,
  payload          jsonb not null,
  received_at      timestamptz not null default now(),
  processed_at     timestamptz,
  processing_error text,
  retry_count      integer not null default 0
);

create index on public.gc_webhook_events (resource_type, action);
create index on public.gc_webhook_events (resource_id);
create index on public.gc_webhook_events (processed_at) where processed_at is null;
