-- Bizzi V203 - Services confiance + Bizzi SOS
-- Objectif : ajouter les nouveaux metiers demandes et aligner le catalogue Supabase.
--
-- A executer dans Supabase > SQL Editor > New query.

insert into public.categories (name, sort_order, is_active)
values
  ('Maison & Travaux', 10, true),
  ('Services à la personne', 20, true),
  ('Transports & Logistique', 30, true),
  ('Evénementiel', 50, true),
  ('Commerce & Immobilier', 60, true),
  ('Sports & Loisirs', 70, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into public.services (category_id, name, sort_order, is_active)
select c.id, v.service_name, v.sort_order, true
from public.categories c
join (values
  ('Maison & Travaux', 'Architecte / décorateur professionnel', 220),
  ('Services à la personne', 'Aide ménage / agence de placement', 210),
  ('Services à la personne', 'Tatouage', 220),
  ('Transports & Logistique', 'Dépannage moto', 125),
  ('Evénementiel', 'Agence événementielle / organisateur événements', 30),
  ('Evénementiel', 'Fleuriste', 160),
  ('Commerce & Immobilier', 'Achat Or et pierre', 80),
  ('Sports & Loisirs', 'Coach tennis', 20),
  ('Sports & Loisirs', 'Coach Golf', 30),
  ('Sports & Loisirs', 'Guide touristique', 40)
) as v(category_name, service_name, sort_order)
on c.name = v.category_name
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;

notify pgrst, 'reload schema';

select
  'services_confiance_sos_v203_installes' as verification,
  c.name as categorie,
  s.name as service,
  s.is_active
from public.services s
join public.categories c on c.id = s.category_id
where s.name in (
  'Architecte / décorateur professionnel',
  'Aide ménage / agence de placement',
  'Tatouage',
  'Dépannage moto',
  'Agence événementielle / organisateur événements',
  'Fleuriste',
  'Achat Or et pierre',
  'Coach tennis',
  'Coach Golf',
  'Guide touristique'
)
order by c.sort_order, s.sort_order, s.name;
