-- Bizzi V190 - Ajouter le service Transitaire
-- Objectif : permettre aux transitaires de se publier a cote des prestataires
-- Transport de colis international, sans afficher les livreurs locaux.

insert into public.categories (name, sort_order, is_active)
values
  ('Transports & Logistique', 30, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into public.services (category_id, name, sort_order, is_active)
select c.id, v.service_name, v.sort_order, true
from public.categories c
join (values
  ('Transports & Logistique', 'Transport de colis international', 95),
  ('Transports & Logistique', 'Transitaire', 96)
) as v(category_name, service_name, sort_order)
on c.name = v.category_name
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;

notify pgrst, 'reload schema';

select
  'service_transitaire_v190_installe' as verification,
  c.name as categorie,
  s.name as service,
  s.sort_order,
  s.is_active
from public.services s
join public.categories c on c.id = s.category_id
where s.name in ('Transport de colis international', 'Transitaire')
order by s.sort_order;
