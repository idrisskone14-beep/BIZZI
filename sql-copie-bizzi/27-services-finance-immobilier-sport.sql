-- Bizzi - Services finance, immobilier et sport V68
-- Objectif : ajouter de nouveaux services sans effacer le catalogue existant.
--
-- Services ajoutes :
-- - Pret financier
-- - Vendeur de terrains et biens immobiliers
-- - Clubs de foot
--
-- A executer dans Supabase > SQL Editor > New query.

insert into public.categories (name, sort_order)
values
  ('Commerce & Immobilier', 60),
  ('Sports & Loisirs', 95)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into public.services (category_id, name, sort_order)
select c.id, v.service_name, v.sort_order
from public.categories c
join (values
  ('Commerce & Immobilier', 'Vendeur de terrains et biens immobiliers', 11),
  ('Commerce & Immobilier', 'Prêt financier', 12),
  ('Sports & Loisirs', 'Clubs de foot', 1)
) as v(category_name, service_name, sort_order)
on c.name = v.category_name
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;
