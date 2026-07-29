-- Bizzi - Service imprimeur V69
-- Objectif : ajouter le service Imprimeur sans effacer le catalogue existant.
--
-- A executer dans Supabase > SQL Editor > New query.

insert into public.categories (name, sort_order)
values
  ('Evénementiel', 50)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into public.services (category_id, name, sort_order)
select c.id, v.service_name, v.sort_order
from public.categories c
join (values
  ('Evénementiel', 'Imprimeur', 15)
) as v(category_name, service_name, sort_order)
on c.name = v.category_name
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;
