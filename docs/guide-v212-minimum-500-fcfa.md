# Bizzi V212 — courses et livraisons à partir de 500 FCFA

Le tarif minimum calculé par Bizzi est fixé à **500 FCFA** pour les courses et livraisons locales.

## Application

- minimum global du moteur tarifaire : 500 FCFA ;
- palier de 0 à 2 km : 500 à 1 000 FCFA ;
- formulaire client : minimum technique de 500 FCFA ;
- majorations d’urgence, d’heure de pointe et de météo calculées ensuite selon les règles existantes ;
- commission Bizzi inchangée à 15 %.

## Base Supabase

Exécuter `supabase/migrations/212_delivery_min_500.sql` dans l’éditeur SQL Supabase afin que la base accepte les commandes à partir de 500 FCFA. Sans cette migration, une ancienne contrainte serveur peut encore refuser les montants inférieurs à 800 FCFA.
