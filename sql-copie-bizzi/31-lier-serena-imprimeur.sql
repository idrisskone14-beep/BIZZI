-- Bizzi - Lier Serena au service Imprimeur V74
-- Objectif : retrouver le prestataire Serena, le lier a Imprimeur,
-- et le rendre visible cote client en essai gratuit si besoin.
--
-- A executer dans Supabase > SQL Editor > New query.

begin;

-- S'assurer que la categorie et le service existent.
insert into public.categories (name, sort_order)
values ('Evénementiel', 50)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into public.services (category_id, name, sort_order)
select c.id, 'Imprimeur', 15
from public.categories c
where c.name = 'Evénementiel'
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;

do $$
declare
  target_provider_id uuid;
  target_service_id uuid;
  match_count integer;
begin
  -- Recherche robuste : Serena, SERENA, Serena Print, etc.
  select count(*)
  into match_count
  from public.providers p
  where regexp_replace(lower(coalesce(p.full_name, '')), '[^a-z0-9]+', '', 'g') like '%serena%';

  if match_count = 0 then
    raise exception 'Aucun prestataire trouve avec le nom Serena. Verifiez le nom exact dans providers.';
  end if;

  if match_count > 1 then
    raise exception 'Plusieurs prestataires Serena trouves. Utilisez le numero de telephone pour eviter une mauvaise affectation.';
  end if;

  select p.id
  into target_provider_id
  from public.providers p
  where regexp_replace(lower(coalesce(p.full_name, '')), '[^a-z0-9]+', '', 'g') like '%serena%'
  limit 1;

  select s.id
  into target_service_id
  from public.services s
  where lower(s.name) = lower('Imprimeur')
  limit 1;

  update public.provider_services
  set is_primary = false
  where provider_id = target_provider_id;

  insert into public.provider_services (provider_id, service_id, is_primary)
  values (target_provider_id, target_service_id, true)
  on conflict (provider_id, service_id) do update
  set is_primary = true;

  update public.providers
  set status = 'approved',
      visibility_status = case
        when visibility_status in ('trial', 'active') then visibility_status
        else 'trial'
      end,
      trial_started_at = coalesce(trial_started_at, now()),
      trial_ends_at = coalesce(trial_ends_at, now() + interval '30 days'),
      updated_at = now()
  where id = target_provider_id;
end $$;

commit;

-- Controle final : Serena doit ressortir avec le service Imprimeur.
select
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  p.trial_ends_at,
  s.name as service_name
from public.providers p
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
where regexp_replace(lower(coalesce(p.full_name, '')), '[^a-z0-9]+', '', 'g') like '%serena%';
