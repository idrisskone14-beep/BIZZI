-- Bizzi - Correction Maabio Nounou V74
-- Objectif :
-- 1. Lier Maabio au service Nounou.
-- 2. Garder le mois gratuit actif sur le bon profil.
-- 3. Masquer les doublons Maabio crees par erreur pour qu'ils ne restent plus en attente.
--
-- A executer dans Supabase > SQL Editor > New query.

begin;

-- S'assurer que la categorie et le service existent.
insert into public.categories (name, sort_order)
values ('Services à la personne', 20)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into public.services (category_id, name, sort_order)
select c.id, 'Nounou', 20
from public.categories c
where c.name = 'Services à la personne'
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;

do $$
declare
  target_provider_id uuid;
  target_service_id uuid;
begin
  -- On garde en priorite le profil Maabio deja visible publiquement.
  select p.id
  into target_provider_id
  from public.providers p
  where p.phone = '+2250101010101'
     or regexp_replace(lower(coalesce(p.full_name, '')), '[^a-z0-9]+', '', 'g') like '%maabio%'
  order by
    case when p.phone = '+2250101010101' then 0 else 1 end,
    case when p.status = 'approved' then 0 else 1 end,
    p.created_at desc
  limit 1;

  if target_provider_id is null then
    raise exception 'Aucun prestataire Maabio trouve. Verifiez le nom exact ou le numero de telephone dans providers.';
  end if;

  select s.id
  into target_service_id
  from public.services s
  where lower(s.name) = lower('Nounou')
  limit 1;

  if target_service_id is null then
    raise exception 'Service Nounou introuvable.';
  end if;

  -- Le bon profil devient Nounou en service principal.
  update public.provider_services
  set is_primary = false
  where provider_id = target_provider_id;

  insert into public.provider_services (provider_id, service_id, is_primary)
  values (target_provider_id, target_service_id, true)
  on conflict (provider_id, service_id) do update
  set is_primary = true;

  -- Le bon profil reste actif en mois gratuit.
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

  -- Les doublons Maabio sont masques pour ne plus apparaitre dans les validations en attente.
  update public.providers
  set status = 'rejected',
      visibility_status = 'hidden',
      verification_note = concat_ws(
        E'\n',
        nullif(verification_note, ''),
        'Doublon masque automatiquement le ' || to_char(now(), 'YYYY-MM-DD HH24:MI')
      ),
      updated_at = now()
  where id <> target_provider_id
    and regexp_replace(lower(coalesce(full_name, '')), '[^a-z0-9]+', '', 'g') like '%maabio%';
end $$;

commit;

-- Controle final :
-- Le profil principal Maabio doit etre approved / trial avec le service Nounou.
-- Les doublons Maabio, s'ils existent, doivent etre rejected / hidden.
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
where regexp_replace(lower(coalesce(p.full_name, '')), '[^a-z0-9]+', '', 'g') like '%maabio%'
order by p.status, p.created_at desc;
