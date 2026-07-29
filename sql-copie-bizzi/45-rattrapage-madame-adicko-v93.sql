-- Bizzi V93 - Rattrapage Madame Adicko
-- A utiliser seulement si le bouton "Activer mois gratuit Supabase" affiche encore
-- "The string did not match the expected pattern" apres upload de la V93.
--
-- Ce script :
-- - retrouve le dernier profil contenant "Adicko" ;
-- - active le mois gratuit ;
-- - affiche le diagnostic table + vue publique.

grant usage on schema public to anon, authenticated;
grant select, update on public.providers to authenticated;
grant select on public.provider_services, public.services, public.categories to authenticated;

do $$
declare
  provider_uuid uuid;
begin
  select p.id
  into provider_uuid
  from public.providers p
  where lower(p.full_name) like '%adicko%'
  order by p.created_at desc
  limit 1;

  if provider_uuid is null then
    raise exception 'Aucun prestataire contenant Adicko trouve dans Supabase.';
  end if;

  update public.providers
  set status = 'approved'::provider_status,
      visibility_status = 'trial'::provider_visibility_status,
      trial_started_at = coalesce(trial_started_at, now()),
      trial_ends_at = case
        when trial_ends_at is null or trial_ends_at <= now()
          then now() + interval '30 days'
        else trial_ends_at
      end,
      updated_at = now()
  where id = provider_uuid;
end $$;

notify pgrst, 'reload schema';

select
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  p.trial_ends_at,
  coalesce(s.name, 'Metier non lie') as service_name,
  coalesce(cat.name, 'Categorie non liee') as category_name,
  p.created_at,
  p.updated_at
from public.providers p
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
left join public.categories cat on cat.id = s.category_id
where lower(p.full_name) like '%adicko%'
order by p.updated_at desc;

select
  id,
  full_name,
  phone,
  service_name,
  category_name,
  visibility_status
from public.public_provider_directory
where lower(full_name) like '%adicko%';
