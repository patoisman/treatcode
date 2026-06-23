
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text not null,
  email               text not null,
  pledge_amount_pence integer check (pledge_amount_pence >= 2500),
  is_admin            boolean not null default false,
  onboarding_status   text not null default 'new'
    check (onboarding_status in ('new', 'pledge_set', 'setup_complete')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.update_my_pledge(p_amount_pence integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_amount_pence < 2500 then
    raise exception 'pledge_below_minimum';
  end if;
  update public.profiles set
    pledge_amount_pence = p_amount_pence,
    onboarding_status   = case when onboarding_status = 'new' then 'pledge_set' else onboarding_status end,
    updated_at          = now()
  where id = auth.uid();
end;
$$;
