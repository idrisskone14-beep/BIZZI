-- Bizzi - Correction RLS soumission publique
-- A executer dans Supabase SQL Editor si l'application affiche :
-- "new row violates row-level security policy for table providers"
--
-- Objectif :
-- autoriser la creation publique d'un prestataire en attente,
-- puis l'ajout de son service, de son paiement et de sa publicite en attente.

grant usage on schema public to anon, authenticated;
grant select on countries, cities, communes, categories, services, subscription_plans to anon, authenticated;
grant select on public_provider_directory, public_advertisements to anon, authenticated;
grant insert on providers, provider_services, payments, advertisements, reports to anon, authenticated;

drop policy if exists "public submit pending provider" on providers;
create policy "public submit pending provider"
on providers for insert
to anon, authenticated
with check (
  auth_user_id is null
  and status = 'pending'
  and visibility_status = 'trial'
);

create or replace function public_can_use_pending_provider(provider_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from providers
    where id = provider_uuid
    and auth_user_id is null
    and status in ('pending', 'approved')
  );
$$;

revoke all on function public_can_use_pending_provider(uuid) from public;
grant execute on function public_can_use_pending_provider(uuid) to anon, authenticated;

drop policy if exists "public attach service to pending provider" on provider_services;
create policy "public attach service to pending provider"
on provider_services for insert
to anon, authenticated
with check (
  public_can_use_pending_provider(provider_id)
);

drop policy if exists "public submit pending payment" on payments;
create policy "public submit pending payment"
on payments for insert
to anon, authenticated
with check (
  status = 'pending'
  and public_can_use_pending_provider(provider_id)
);

drop policy if exists "public submit pending advertisement" on advertisements;
create policy "public submit pending advertisement"
on advertisements for insert
to anon, authenticated
with check (
  status = 'pending'
  and public_can_use_pending_provider(provider_id)
);

drop policy if exists "public submit report" on reports;
create policy "public submit report"
on reports for insert
to anon, authenticated
with check (
  status = 'open'
  and public_can_use_pending_provider(provider_id)
);

