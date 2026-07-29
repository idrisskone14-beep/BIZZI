-- Bizzi - Diagnostic prestataire Aly Kouassi
-- Objectif : retrouver Aly Kouassi dans Supabase meme s'il n'est pas visible cote client.
--
-- A executer dans Supabase > SQL Editor > New query si la recherche admin ne suffit pas.

select
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  p.trial_ends_at,
  p.subscription_ends_at,
  s.name as service_name,
  c.name as category_name,
  p.created_at,
  p.updated_at
from public.providers p
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
left join public.categories c on c.id = s.category_id
where regexp_replace(lower(coalesce(p.full_name, '')), '[^a-z0-9]+', '', 'g') like '%aly%'
   or regexp_replace(lower(coalesce(p.full_name, '')), '[^a-z0-9]+', '', 'g') like '%kouassi%'
   or coalesce(p.phone, '') like '%aly%'
order by p.created_at desc;

