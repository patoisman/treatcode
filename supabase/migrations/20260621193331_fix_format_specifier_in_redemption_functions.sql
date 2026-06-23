
-- PostgreSQL format() only supports %s / %I / %L — not printf-style %.2f.
-- Convert pence to a formatted text value before passing to format().

create or replace function public.request_redemption(
  p_brand_id    uuid,
  p_amount_pence integer
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_user_id  uuid := auth.uid();
  v_brand    record;
  v_balance  integer;
  v_req_id   uuid;
begin
  if v_user_id is null then raise exception 'not_authenticated'; end if;

  select * into v_brand from public.brands
  where id = p_brand_id and is_active = true;
  if not found then raise exception 'brand_not_found'; end if;

  if p_amount_pence < v_brand.min_redemption_pence or
     p_amount_pence > v_brand.max_redemption_pence then
    raise exception 'amount_outside_brand_limits';
  end if;

  if v_brand.allowed_denominations is not null and
     not (p_amount_pence = any(v_brand.allowed_denominations)) then
    raise exception 'amount_not_in_allowed_denominations';
  end if;

  select balance_pence into v_balance
  from public.user_balance_cache
  where user_id = v_user_id
  for update;

  if v_balance is null or v_balance < p_amount_pence then
    raise exception 'insufficient_balance';
  end if;

  insert into public.redemption_requests (user_id, brand_id, amount_pence)
  values (v_user_id, p_brand_id, p_amount_pence)
  returning id into v_req_id;

  insert into public.ledger_entries (
    user_id, entry_type, amount_pence,
    source_type, source_id, idempotency_key, description
  ) values (
    v_user_id,
    'redemption_debit',
    p_amount_pence,
    'redemption_request',
    v_req_id::text,
    'redemption_debit:' || v_req_id::text,
    format('Voucher redemption — £%s %s',
      (p_amount_pence / 100.0)::numeric(10,2)::text,
      v_brand.name)
  );

  return v_req_id;
end;
$$;

create or replace function public.transition_redemption(
  p_request_id   uuid,
  p_new_status   text,
  p_failure_reason text default null,
  p_actor        uuid default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_req record;
begin
  select * into v_req from public.redemption_requests
  where id = p_request_id for update;

  if not found then raise exception 'redemption_request_not_found'; end if;

  if not (
    (v_req.status = 'requested'  and p_new_status in ('fulfilling','failed','expired')) or
    (v_req.status = 'fulfilling' and p_new_status in ('fulfilled','failed'))
  ) then
    raise exception 'invalid_transition: % -> %', v_req.status, p_new_status;
  end if;

  update public.redemption_requests set
    status         = p_new_status,
    claimed_by     = case when p_new_status = 'fulfilling' then p_actor    else claimed_by    end,
    fulfilling_at  = case when p_new_status = 'fulfilling' then now()      else fulfilling_at end,
    fulfilled_at   = case when p_new_status = 'fulfilled'  then now()      else fulfilled_at  end,
    failed_at      = case when p_new_status in ('failed','expired') then now() else failed_at end,
    failure_reason = case when p_new_status in ('failed','expired') then p_failure_reason else failure_reason end,
    updated_at     = now()
  where id = p_request_id;

  if p_new_status in ('failed','expired') then
    insert into public.ledger_entries (
      user_id, entry_type, amount_pence,
      source_type, source_id, idempotency_key, description
    ) values (
      v_req.user_id,
      'redemption_refund',
      v_req.amount_pence,
      'redemption_request',
      p_request_id::text,
      'redemption_refund:' || p_request_id::text,
      format('Voucher refund — £%s (%s)',
        (v_req.amount_pence / 100.0)::numeric(10,2)::text,
        p_new_status)
    );
  end if;
end;
$$;
