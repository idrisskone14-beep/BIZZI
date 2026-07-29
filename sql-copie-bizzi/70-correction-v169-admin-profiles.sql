-- Bizzi - Correction V169 admin_profiles
-- A executer si le script 69 a affiche :
-- ERROR: relation "public.admin_users" does not exist
--
-- Cause : Bizzi utilise public.admin_profiles + public.is_admin(),
-- pas une table public.admin_users.

do $$
begin
  if to_regclass('public.admin_profiles') is null then
    raise exception 'La table public.admin_profiles est introuvable. Executez d''abord le schema admin Bizzi.';
  end if;

  if to_regprocedure('public.is_admin()') is null then
    raise exception 'La fonction public.is_admin() est introuvable. Executez d''abord le script admin Bizzi.';
  end if;
end $$;

drop policy if exists "admin read payment transactions" on public.payment_transactions;
create policy "admin read payment transactions"
on public.payment_transactions for select
to authenticated
using (public.is_admin());

drop policy if exists "admin read payment webhook events" on public.payment_webhook_events;
create policy "admin read payment webhook events"
on public.payment_webhook_events for select
to authenticated
using (public.is_admin());

grant select on public.payment_transactions to authenticated;
grant select on public.payment_webhook_events to authenticated;

select
  'Correction V169 admin_profiles OK' as statut,
  count(*) as transactions_tracees
from public.payment_transactions;
