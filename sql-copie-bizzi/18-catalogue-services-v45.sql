-- Bizzi - Catalogue services elargi V45
-- Objectif : ajouter les services manquants sans supprimer la liste existante.
-- A executer apres 07-seed-services-cote-ivoire.sql.

insert into categories (name, sort_order)
values
  ('Digital & Dépannage', 70),
  ('Santé & Assistance', 80),
  ('Agriculture & Rural', 90)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into services (category_id, name, sort_order)
select c.id, v.service_name, v.sort_order
from categories c
join (values
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
  ('Services à la personne', 'Pressing / Blanchisserie', 120),
  ('Services à la personne', 'Courses / achats à domicile', 130),
  ('Transports & Logistique', 'Remorquage / Dépannage auto', 50),
  ('Transports & Logistique', 'Vulcanisateur / Pneus', 60),
  ('Transports & Logistique', 'Carrossier / Peintre auto', 70),
  ('Transports & Logistique', 'Lavage auto / moto', 80),
  ('Transports & Logistique', 'Transport de marchandises', 90),
  ('Transports & Logistique', 'Conducteur moto-taxi', 100),
  ('Education & Formation', 'Formation informatique', 50),
  ('Evénementiel', 'Traiteur / Cuisinier à domicile', 70),
  ('Evénementiel', 'Décorateur événementiel', 80),
  ('Evénementiel', 'Location sonorisation / lumière', 90),
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
