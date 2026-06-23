
-- Drop the broken triggers that were rolling back redemption transactions
drop trigger if exists notify_admin_on_new_redemption on public.redemption_requests;
drop trigger if exists notify_user_on_redemption_failed on public.redemption_requests;
drop function if exists public.notify_redemption_event();

-- Enable pg_net for future async HTTP use from PostgreSQL
create extension if not exists pg_net;
