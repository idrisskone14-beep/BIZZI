-- Bizzi V133 - Service Vendeur / Vendeuse
-- Objectif : ajouter un métier utile aux commerces qui recrutent un vendeur ou une vendeuse.
--
-- A executer dans Supabase > SQL Editor > New query.

insert into public.categories (name, sort_order, is_active)
values
  ('Commerce & Immobilier', 60, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into public.services (category_id, name, sort_order, is_active)
select c.id, v.service_name, v.sort_order, true
from public.categories c
join (values
  ('Commerce & Immobilier', 'Vendeur / Vendeuse', 1)
) as v(category_name, service_name, sort_order)
on c.name = v.category_name
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;

notify pgrst, 'reload schema';

select
  'service_vendeur_vendeuse_v133_installe' as verification,
  c.name as categorie,
  s.name as service,
  s.is_active
from public.services s
join public.categories c on c.id = s.category_id
where s.name = 'Vendeur / Vendeuse';
