-- Bizzi - Diagnostic prestataire Imprimeur V70
-- Objectif : comprendre pourquoi un prestataire imprimeur n'apparait pas dans l'admin ou cote client.
--
-- A executer dans Supabase > SQL Editor > New query.
-- Ce fichier ne modifie rien : il affiche seulement des resultats.

-- 1. Verifier que le service Imprimeur existe et est actif.
select
  s.id,
  s.name,
  s.is_active,
  s.sort_order,
  c.name as category_name
from public.services s
left join public.categories c on c.id = s.category_id
where lower(s.name) = lower('Imprimeur');

-- 2. Voir tous les prestataires relies au service Imprimeur.
select
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  p.trial_ends_at,
  p.subscription_ends_at,
  p.created_at,
  s.name as service_name
from public.providers p
join public.provider_services ps on ps.provider_id = p.id
join public.services s on s.id = ps.service_id
where lower(s.name) = lower('Imprimeur')
order by p.created_at desc;

-- 3. Voir les 20 derniers prestataires crees, avec leur metier si lie.
select
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  p.created_at,
  s.name as service_name
from public.providers p
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
order by p.created_at desc
limit 20;

-- 4. Voir les prestataires recents qui n'ont aucun metier principal lie.
select
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  p.created_at
from public.providers p
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
where ps.id is null
order by p.created_at desc
limit 20;
