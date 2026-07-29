-- Bizzi V100 - Rattrapage Sere Die / Jardinier Paysagiste
-- A executer dans Supabase SQL Editor si Sere Die a ete cree mais n'apparait pas cote client.
--
-- Ce script :
-- - cree le service officiel "Jardinier / Paysagiste" si absent ;
-- - cherche le prestataire Sere Die ;
-- - le rattache au bon metier ;
-- - active son mois gratuit si le profil etait encore bloque.

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.services to anon, authenticated;

alter table public.providers
  add column if not exists requested_service_name text;

alter table public.providers
  add column if not exists requested_category_name text;

alter table public.providers
  add column if not exists review_count integer not null default 0;

do $$
declare
  category_uuid uuid;
  service_uuid uuid;
  provider_uuid uuid;
begin
  insert into public.categories (name, sort_order, is_active)
  values ('Maison & Travaux', 10, true)
  on conflict (name) do update
  set is_active = true,
      updated_at = now()
  returning id into category_uuid;

  insert into public.services (category_id, name, sort_order, is_active)
  values (category_uuid, 'Jardinier / Paysagiste', 150, true)
  on conflict (category_id, name) do update
  set is_active = true,
      updated_at = now()
  returning id into service_uuid;

  select p.id
  into provider_uuid
  from public.providers p
  where lower(p.full_name) like '%sere die%'
     or lower(p.full_name) like '%séré dié%'
     or (lower(p.full_name) like '%sere%' and lower(p.full_name) like '%die%')
     or (lower(p.full_name) like '%séré%' and lower(p.full_name) like '%dié%')
  order by p.created_at desc
  limit 1;

  if provider_uuid is null then
    raise notice 'Aucun prestataire Sere Die trouve dans public.providers. Il est probablement reste en local dans le navigateur : utilisez Envoyer vers Supabase dans l admin.';
    return;
  end if;

  update public.providers p
  set requested_service_name = 'Jardinier / Paysagiste',
      requested_category_name = 'Maison & Travaux',
      status = 'approved'::provider_status,
      visibility_status = case
        when p.visibility_status = 'active'::provider_visibility_status then p.visibility_status
        else 'trial'::provider_visibility_status
      end,
      trial_started_at = coalesce(p.trial_started_at, now()),
      trial_ends_at = case
        when p.visibility_status = 'active'::provider_visibility_status then p.trial_ends_at
        when p.trial_ends_at is null or p.trial_ends_at <= now() then now() + interval '30 days'
        else p.trial_ends_at
      end,
      updated_at = now()
  where p.id = provider_uuid;

  update public.provider_services
  set is_primary = false
  where provider_id = provider_uuid;

  insert into public.provider_services (provider_id, service_id, is_primary)
  values (provider_uuid, service_uuid, true)
  on conflict (provider_id, service_id) do update
  set is_primary = true;

  update public.advertisements a
  set status = 'active'::advertisement_status,
      updated_at = now()
  where a.provider_id = provider_uuid
    and a.status = 'pending'::advertisement_status;
end $$;

notify pgrst, 'reload schema';

select
  'rattrapage_sere_die_paysagiste_v100' as verification,
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  coalesce(s.name, p.requested_service_name, 'Metier non lie') as service_name,
  coalesce(cat.name, p.requested_category_name, 'Categorie non liee') as category_name,
  p.trial_ends_at,
  p.updated_at
from public.providers p
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
left join public.categories cat on cat.id = s.category_id
where lower(p.full_name) like '%sere die%'
   or lower(p.full_name) like '%séré dié%'
   or (lower(p.full_name) like '%sere%' and lower(p.full_name) like '%die%')
   or (lower(p.full_name) like '%séré%' and lower(p.full_name) like '%dié%')
order by p.updated_at desc;

select
  id,
  full_name,
  phone,
  service_name,
  category_name,
  visibility_status
from public.public_provider_directory
where lower(full_name) like '%sere die%'
   or lower(full_name) like '%séré dié%'
   or (lower(full_name) like '%sere%' and lower(full_name) like '%die%')
   or (lower(full_name) like '%séré%' and lower(full_name) like '%dié%');
