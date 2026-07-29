-- Bizzi - Correction admin Supabase vide V62
-- Objectif :
-- - rattacher l'email admin contact@bizzi-africa.com au profil admin Bizzi
-- - recreer les droits et politiques RLS qui permettent a l'admin de voir
--   les prestataires, paiements, publicites et demandes en attente.
--
-- A executer dans Supabase > SQL Editor > New query.

do $$
declare
  admin_email text := 'contact@bizzi-africa.com';
  admin_uid uuid;
begin
  select id
  into admin_uid
  from auth.users
  where lower(email) = lower(admin_email)
  order by created_at desc
  limit 1;

  if admin_uid is null then
    raise exception 'Aucun utilisateur Supabase Auth trouve pour %', admin_email;
  end if;

  insert into public.admin_profiles (auth_user_id, full_name, role, is_active)
  values (admin_uid, 'Admin Bizzi', 'admin', true)
  on conflict (auth_user_id) do update
  set full_name = excluded.full_name,
      role = excluded.role,
      is_active = true,
      updated_at = now();
end $$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where auth_user_id = auth.uid()
      and is_active = true
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant select on public.admin_profiles to authenticated;

drop policy if exists "admin profile self read" on public.admin_profiles;
create policy "admin profile self read"
on public.admin_profiles for select
to authenticated
using (auth.uid() = auth_user_id);

grant select, update on public.providers to authenticated;
grant select, update on public.payments to authenticated;
grant select, update on public.advertisements to authenticated;
grant select on public.provider_services, public.subscription_plans, public.cities, public.communes, public.services, public.categories to authenticated;

drop policy if exists "admin full providers" on public.providers;
create policy "admin full providers"
on public.providers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin full payments" on public.payments;
create policy "admin full payments"
on public.payments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin full advertisements" on public.advertisements;
create policy "admin full advertisements"
on public.advertisements for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

do $$
begin
  if to_regclass('public.reports') is not null then
    grant select, update on public.reports to authenticated;
    execute 'drop policy if exists "admin full reports" on public.reports';
    execute 'create policy "admin full reports" on public.reports for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;

  if to_regclass('public.express_requests') is not null then
    grant select, update on public.express_requests to authenticated;
    execute 'drop policy if exists "admin full express requests" on public.express_requests';
    execute 'create policy "admin full express requests" on public.express_requests for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;

  if to_regclass('public.provider_reviews') is not null then
    grant select, update on public.provider_reviews to authenticated;
    execute 'drop policy if exists "admin full provider reviews" on public.provider_reviews';
    execute 'create policy "admin full provider reviews" on public.provider_reviews for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
end $$;

select
  u.email,
  u.id as auth_user_id,
  ap.role,
  ap.is_active
from auth.users u
left join public.admin_profiles ap on ap.auth_user_id = u.id
where lower(u.email) = lower('contact@bizzi-africa.com');

