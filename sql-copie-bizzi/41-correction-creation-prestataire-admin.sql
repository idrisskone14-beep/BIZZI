-- Bizzi - Correction creation prestataire + apparition admin V88
-- Objectif :
-- - un nouveau prestataire cree depuis l'application publique doit etre insere avec status=pending ;
-- - son metier doit pouvoir etre lie dans provider_services ;
-- - l'admin Supabase doit pouvoir lire la table providers et voir le profil en attente.
--
-- A executer dans Supabase > SQL Editor > New query si un nouveau prestataire
-- n'apparait pas dans l'admin apres creation.

grant usage on schema public to anon, authenticated;
grant insert on public.providers to anon, authenticated;
grant insert on public.provider_services to anon, authenticated;
grant select on public.cities, public.communes, public.categories, public.services to anon, authenticated;
grant select, update on public.providers to authenticated;
grant select on public.provider_services, public.services, public.categories to authenticated;

drop policy if exists "public submit pending provider" on public.providers;
drop policy if exists "public submit pending provider simple" on public.providers;
create policy "public submit pending provider"
on public.providers
as permissive
for insert
to anon, authenticated
with check (
  auth_user_id is null
  and status = 'pending'::provider_status
  and visibility_status = 'trial'::provider_visibility_status
);

create or replace function public.public_can_use_pending_provider(provider_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.providers p
    where p.id = provider_uuid
      and p.auth_user_id is null
      and p.status in ('pending', 'approved')
  );
$$;

revoke all on function public.public_can_use_pending_provider(uuid) from public;
grant execute on function public.public_can_use_pending_provider(uuid) to anon, authenticated;

drop policy if exists "public attach service to pending provider" on public.provider_services;
create policy "public attach service to pending provider"
on public.provider_services
as permissive
for insert
to anon, authenticated
with check (
  public.public_can_use_pending_provider(provider_id)
);

drop policy if exists "admin read providers" on public.providers;
create policy "admin read providers"
on public.providers
as permissive
for select
to authenticated
using (public.is_admin());

drop policy if exists "admin full providers" on public.providers;
create policy "admin full providers"
on public.providers
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

notify pgrst, 'reload schema';

-- Controle : les policies importantes doivent apparaitre.
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in ('providers', 'provider_services')
order by tablename, policyname;

