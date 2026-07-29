-- =========================================================
-- Seed : forfaits
-- =========================================================

insert into subscription_plans (name, duration_months, price, currency)
values
  ('1 mois', 1, 999, 'FCFA'),
  ('6 mois', 6, 4900, 'FCFA'),
  ('12 mois', 12, 9900, 'FCFA')
on conflict (name) do update
set duration_months = excluded.duration_months,
    price = excluded.price,
    currency = excluded.currency,
    is_active = true;

-- =========================================================
-- Seed : pays et villes pilote
-- =========================================================

insert into countries (name, iso_code, currency)
values ('Côte d''Ivoire', 'CI', 'FCFA')
on conflict (name) do update
set iso_code = excluded.iso_code,
    currency = excluded.currency,
    is_active = true;

with ci as (
  select id from countries where name = 'Côte d''Ivoire'
)
insert into cities (country_id, name)
select ci.id, city_name
from ci
cross join (values
  ('Abidjan'),
  ('Bouaké'),
  ('Yamoussoukro'),
  ('San Pedro')
) as v(city_name)
on conflict (country_id, name) do update
set is_active = true;

with abidjan as (
  select id from cities where name = 'Abidjan'
)
insert into communes (city_id, name)
select abidjan.id, commune_name
from abidjan
cross join (values
  ('Cocody'),
  ('Yopougon'),
  ('Marcory'),
  ('Treichville'),
  ('Abobo'),
  ('Plateau')
) as v(commune_name)
on conflict (city_id, name) do update
set is_active = true;

-- =========================================================
-- Seed : categories
-- =========================================================

insert into categories (name, sort_order)
values
  ('Maison & Travaux', 10),
  ('Services à la personne', 20),
  ('Transports & Logistique', 30),
  ('Education & Formation', 40),
  ('Evénementiel', 50),
  ('Commerce & Immobilier', 60),
  ('Digital & Dépannage', 70),
  ('Santé & Assistance', 80),
  ('Agriculture & Rural', 90)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

-- =========================================================
-- Seed : services
-- =========================================================

insert into services (category_id, name, sort_order)
select c.id, v.service_name, v.sort_order
from categories c
join (values
  ('Maison & Travaux', 'Déménageur', 10),
  ('Maison & Travaux', 'Electricien', 20),
  ('Maison & Travaux', 'Peintre', 30),
  ('Maison & Travaux', 'Plombier', 40),
  ('Maison & Travaux', 'Vidangeur', 50),
  ('Maison & Travaux', 'Ramassage d''ordures', 60),
  ('Maison & Travaux', 'Soudeur / Métallier', 70),
  ('Maison & Travaux', 'Menuisier', 80),
  ('Maison & Travaux', 'Frigoriste / Climatisation', 90),
  ('Maison & Travaux', 'Serrurier', 100),
  ('Maison & Travaux', 'Maçon', 110),
  ('Maison & Travaux', 'Carreleur', 120),
  ('Maison & Travaux', 'Couvreur / Étanchéité', 130),
  ('Maison & Travaux', 'Vitrier / Aluminium', 140),
  ('Maison & Travaux', 'Jardinier / Paysagiste', 150),
  ('Maison & Travaux', 'Nettoyage maison / bureau', 160),
  ('Maison & Travaux', 'Nettoyage canapé / tapis / matelas', 170),
  ('Maison & Travaux', 'Désinsectisation / Dératisation', 180),
  ('Maison & Travaux', 'Technicien électroménager', 190),
  ('Maison & Travaux', 'Installateur solaire / groupe électrogène', 200),
  ('Maison & Travaux', 'Antenniste / TV satellite', 210),
  ('Services à la personne', 'Aide à domicile', 10),
  ('Services à la personne', 'Nounou', 20),
  ('Services à la personne', 'Gardiennage', 30),
  ('Services à la personne', 'Détective privé(e)', 40),
  ('Services à la personne', 'Coach sportif', 50),
  ('Services à la personne', 'Masseur / Masseuse', 60),
  ('Services à la personne', 'Esthéticienne', 70),
  ('Services à la personne', 'Maquilleuse / Maquilleur', 80),
  ('Services à la personne', 'Tresse / Coiffure', 90),
  ('Services à la personne', 'Couturier / Retoucheur', 100),
  ('Services à la personne', 'Conciergerie', 110),
  ('Services à la personne', 'Pressing / Blanchisserie', 120),
  ('Services à la personne', 'Courses / achats à domicile', 130),
  ('Transports & Logistique', 'Chauffeur', 10),
  ('Transports & Logistique', 'Livreur de gaz en bouteille', 20),
  ('Transports & Logistique', 'Location de véhicules', 30),
  ('Transports & Logistique', 'Mécanicien', 40),
  ('Transports & Logistique', 'Remorquage / Dépannage auto', 50),
  ('Transports & Logistique', 'Vulcanisateur / Pneus', 60),
  ('Transports & Logistique', 'Carrossier / Peintre auto', 70),
  ('Transports & Logistique', 'Lavage auto / moto', 80),
  ('Transports & Logistique', 'Transport de marchandises', 90),
  ('Transports & Logistique', 'Conducteur moto-taxi', 100),
  ('Education & Formation', 'Cours à domicile', 10),
  ('Education & Formation', 'Formateur / Coach', 20),
  ('Education & Formation', 'Secrétaire virtuelle / Assistante administrative', 30),
  ('Education & Formation', 'Traducteur / Interprète', 40),
  ('Education & Formation', 'Formation informatique', 50),
  ('Evénementiel', 'Photographe', 10),
  ('Evénementiel', 'Location d''articles d''événements', 20),
  ('Evénementiel', 'DJ / Animateur', 30),
  ('Evénementiel', 'Serveur / Serveuse', 40),
  ('Evénementiel', 'Barman / Barmaid', 50),
  ('Evénementiel', 'Designer d''intérieur', 60),
  ('Evénementiel', 'Traiteur / Cuisinier à domicile', 70),
  ('Evénementiel', 'Décorateur événementiel', 80),
  ('Evénementiel', 'Location sonorisation / lumière', 90),
  ('Commerce & Immobilier', 'Agent immobilier', 10),
  ('Commerce & Immobilier', 'Location type Airbnb', 20),
  ('Commerce & Immobilier', 'Hôtels', 30),
  ('Commerce & Immobilier', 'Restaurants', 40),
  ('Commerce & Immobilier', 'Aide démarches administratives', 50),
  ('Commerce & Immobilier', 'Comptable / Fiscaliste', 60),
  ('Commerce & Immobilier', 'Juriste / Conseil légal', 70),
  ('Commerce & Immobilier', 'Courtier assurance', 80),
  ('Commerce & Immobilier', 'Aide visa / voyage', 90),
  ('Digital & Dépannage', 'Réparateur téléphone', 10),
  ('Digital & Dépannage', 'Réparateur ordinateur / imprimante', 20),
  ('Digital & Dépannage', 'Installation Wi-Fi / caméra', 30),
  ('Digital & Dépannage', 'Assistance informatique', 40),
  ('Digital & Dépannage', 'Création site web / design', 50),
  ('Digital & Dépannage', 'Community manager', 60),
  ('Santé & Assistance', 'Infirmier à domicile', 10),
  ('Santé & Assistance', 'Garde-malade', 20),
  ('Santé & Assistance', 'Kinésithérapeute', 30),
  ('Santé & Assistance', 'Sage-femme', 40),
  ('Santé & Assistance', 'Ambulance privée', 50),
  ('Santé & Assistance', 'Livraison médicaments', 60),
  ('Agriculture & Rural', 'Technicien pompe / forage', 10),
  ('Agriculture & Rural', 'Réparateur groupe électrogène', 20),
  ('Agriculture & Rural', 'Tractoriste / Labour', 30),
  ('Agriculture & Rural', 'Ouvrier agricole', 40),
  ('Agriculture & Rural', 'Transport de récoltes', 50),
  ('Agriculture & Rural', 'Vétérinaire / soins animaux', 60),
  ('Agriculture & Rural', 'Technicien irrigation', 70),
  ('Agriculture & Rural', 'Réparateur chambre froide', 80)
) as v(category_name, service_name, sort_order)
on c.name = v.category_name
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;
