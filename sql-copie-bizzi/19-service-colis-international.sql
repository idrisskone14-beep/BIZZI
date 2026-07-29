-- Bizzi - Service colis international V59
-- Objectif : ajouter le service "Transport de colis international"
-- sans supprimer ni modifier les autres services.

insert into categories (name, sort_order)
values ('Transports & Logistique', 30)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into services (category_id, name, sort_order)
select c.id, 'Transport de colis international', 95
from categories c
where c.name = 'Transports & Logistique'
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;
