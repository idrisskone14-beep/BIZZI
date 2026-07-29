-- Bizzi V91 - Diagnostic et rattrapage Amad Diallo / Detective prive(e)
-- A executer dans Supabase > SQL Editor > New query si Amad Diallo
-- n'apparait pas apres Importer public Supabase.
--
-- Ce script :
-- - retrouve Amad Diallo dans providers ;
-- - cree/verifie le service "Detective prive(e)" ;
-- - lie le metier au prestataire ;
-- - active le mois gratuit si le profil est encore pending ;
-- - affiche le resultat final et la vue publique.

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.categories to authenticated;
grant select, insert, update on public.services to authenticated;
grant select, insert, update on public.provider_services to authenticated;
grant select, update on public.providers to authenticated;

do $$
declare
  category_uuid uuid;
  service_uuid uuid;
  provider_uuid uuid;
begin
  insert into public.categories (name, sort_order, is_active)
  values ('Services à la personne', 20, true)
  on conflict (name) do update
  set is_active = true,
      updated_at = now()
  returning id into category_uuid;

  insert into public.services (category_id, name, sort_order, is_active)
  values (category_uuid, 'Détective privé(e)', 40, true)
  on conflict (category_id, name) do update
  set is_active = true,
      updated_at = now()
  returning id into service_uuid;

  select p.id
  into provider_uuid
  from public.providers p
  where lower(p.full_name) like '%amad%'
    and lower(p.full_name) like '%diallo%'
  order by p.created_at desc
  limit 1;

  if provider_uuid is null then
    raise exception 'Aucun prestataire Amad Diallo trouve dans Supabase. Verifiez que le formulaire a bien affiche "Profil envoye vers Supabase".';
  end if;

  update public.provider_services
  set is_primary = false
  where provider_id = provider_uuid;

  insert into public.provider_services (provider_id, service_id, is_primary)
  values (provider_uuid, service_uuid, true)
  on conflict (provider_id, service_id) do update
  set is_primary = true;

  update public.providers
  set status = case
        when status = 'pending'::provider_status then 'approved'::provider_status
        else status
      end,
      visibility_status = case
        when visibility_status in ('trial'::provider_visibility_status, 'active'::provider_visibility_status)
          then visibility_status
        else 'trial'::provider_visibility_status
      end,
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

-- Diagnostic table brute.
select
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  p.trial_ends_at,
  s.name as service_name,
  cat.name as category_name,
  p.created_at,
  p.updated_at
from public.providers p
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
left join public.categories cat on cat.id = s.category_id
where lower(p.full_name) like '%amad%'
  and lower(p.full_name) like '%diallo%'
order by p.updated_at desc;

-- Diagnostic vue publique : cette requete doit retourner Amad Diallo.
select
  id,
  full_name,
  phone,
  service_name,
  category_name,
  visibility_status
from public.public_provider_directory
where lower(full_name) like '%amad%'
  and lower(full_name) like '%diallo%';
