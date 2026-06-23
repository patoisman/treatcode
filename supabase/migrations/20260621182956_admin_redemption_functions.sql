
-- Admin-only wrappers around transition_redemption.
-- Direct calls to transition_redemption from the browser are blocked by these
-- enforcing the is_admin() check before delegating to the underlying function.

create or replace function public.admin_claim_redemption(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'unauthorized';
  end if;
  perform public.transition_redemption(p_request_id, 'fulfilling', null, auth.uid());
end;
$$;

create or replace function public.admin_fail_redemption(
  p_request_id     uuid,
  p_failure_reason text
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'unauthorized';
  end if;
  perform public.transition_redemption(p_request_id, 'failed', p_failure_reason, auth.uid());
end;
$$;
