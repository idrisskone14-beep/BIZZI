-- Zeyds V305 - ZEYDS CASH : donnees de demonstration (section 30 de la
-- demande produit). A executer sur SUPABASE, apres
-- 112-zeyds-cash-config-v305.sql. Optionnel / environnement de demo
-- uniquement - ne pas executer en production reelle sans adapter les
-- numeros de telephone factices.

with ins as (
  insert into public.cash_missions (
    requester_phone, requester_name, title, description, category, area,
    deadline_type, deadline_at, reward_amount, service_budget_hint,
    status, secured, expires_at, created_at
  )
  values
    ('0700000001', 'Aïcha K.', 'Trouve-moi 2 places pour Côte d''Ivoire – Cameroun', 'Match au stade Charles Konan Banny, si possible en tribune couverte.', 'Événements', 'Abidjan', 'cette_semaine', now() + interval '17 hours', 10000, null, 'published', true, now() + interval '17 hours', now() - interval '2 hours'),
    ('0700000002', 'Serge A.', 'Appartement 2 pièces à Cocody', 'Meublé de préférence, proche des Deux Plateaux.', 'Logement', 'Cocody', 'cette_semaine', now() + interval '5 days', 25000, 350000, 'published', true, now() + interval '5 days', now() - interval '1 day'),
    ('0700000003', 'Nadège Y.', 'Ce modèle de chaussures en taille 43 à Abidjan', 'Sneakers precises, photo en pièce jointe si besoin.', 'Vente', 'Abidjan', 'cette_semaine', now() + interval '4 days', 5000, null, 'published', true, now() + interval '4 days', now() - interval '3 hours'),
    ('0700000004', 'Boubacar T.', 'Mécanicien disponible maintenant à Cocody', 'Panne moteur, voiture immobilisée sur place.', 'Services', 'Cocody', 'urgent', now() + interval '6 hours', 7000, null, 'published', true, now() + interval '6 hours', now() - interval '30 minutes'),
    ('0700000005', 'Fatou D.', 'Photographe disponible samedi', 'Mariage, disponibilité toute la journée samedi.', 'Services', 'Marcory', 'cette_semaine', now() + interval '3 days', 10000, 150000, 'published', true, now() + interval '3 days', now() - interval '6 hours'),
    ('0700000006', 'Josué K.', 'Cuisinier expérimenté disponible immédiatement à Marcory', 'Restauration événementielle, contrat court terme.', 'Emploi', 'Marcory', 'urgent', now() + interval '12 hours', 20000, null, 'published', true, now() + interval '12 hours', now() - interval '4 hours'),
    ('0700000007', 'Marie-Claire O.', 'Où acheter 100 cartons d''emballage à Abidjan au meilleur prix', 'Déménagement d''entreprise, besoin rapide.', 'Autre', 'Abidjan', 'cette_semaine', now() + interval '2 days', 4000, null, 'published', true, now() + interval '2 days', now() - interval '10 hours')
  returning id, requester_phone, reward_amount
)
insert into public.cash_transactions (mission_id, user_phone, type, amount, status, payment_reference, payment_method)
select id, requester_phone, 'mission_escrow', reward_amount, 'confirmed', 'DEMO-' || left(id::text, 8), 'Wave'
from ins;

select 'Zeyds V305 Cash donnees de demo installees' as statut, count(*) as missions_demo
from public.cash_missions where requester_phone like '07000000%';
