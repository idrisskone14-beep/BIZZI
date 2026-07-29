-- Bizzi - Lier Coco Gauff au service immobilier V76
-- Objectif : corriger le profil Coco Gauff visible sans metier lie.
-- Le profil indique : "Vous propose des biens immobiliers".
-- Il est donc relie au service "Vendeur de terrains et biens immobiliers".
--
-- A executer dans Supabase > SQL Editor > New query.

begin;

insert into public.categories (name, sort_order)
values ('Commerce & Immobilier', 60)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into public.services (category_id, name, sort_order)
select c.id, 'Vendeur de terrains et biens immobiliers', 15
from public.categories c
where c.name = 'Commerce & Immobilier'
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;

do $$
declare
  target_provider_id uuid;
  target_service_id uuid;
begin
  select p.id
  into target_provider_id
  from public.providers p
  where p.phone = '+2250909090909'
     or regexp_replace(lower(coalesce(p.full_name, '')), '[^a-z0-9]+', '', 'g') like '%cocogauff%'
  order by
    case when p.phone = '+2250909090909' then 0 else 1 end,
    p.created_at desc
  limit 1;

  if target_provider_id is null then
    raise exception 'Aucun prestataire Coco Gauff trouve. Verifiez le nom exact ou le numero de telephone dans providers.';
  end if;

  select s.id
  into target_service_id
  from public.services s
  join public.categories c on c.id = s.category_id
  where lower(s.name) = lower('Vendeur de terrains et biens immobiliers')
    and c.name = 'Commerce & Immobilier'
  limit 1;

  if target_service_id is null then
    raise exception 'Service Vendeur de terrains et biens immobiliers introuvable.';
  end if;

  update public.provider_services
  set is_primary = false
  where provider_id = target_provider_id;

  insert into public.provider_services (provider_id, service_id, is_primary)
  values (target_provider_id, target_service_id, true)
  on conflict (provider_id, service_id) do update
  set is_primary = true;

  update public.providers
  set status = 'approved',
      visibility_status = 'trial',
      trial_started_at = coalesce(trial_started_at, now()),
      trial_ends_at = case
        when trial_ends_at is null or trial_ends_at < now() then now() + interval '30 days'
        else trial_ends_at
      end,
      updated_at = now()
  where id = target_provider_id;
end $$;

commit;

-- Controle final : Coco Gauff doit ressortir avec le service immobilier.
select
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  p.trial_ends_at,
  s.name as service_name,
  c.name as category_name
from public.providers p
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
left join public.categories c on c.id = s.category_id
where p.phone = '+2250909090909'
   or regexp_replace(lower(coalesce(p.full_name, '')), '[^a-z0-9]+', '', 'g') like '%cocogauff%';
