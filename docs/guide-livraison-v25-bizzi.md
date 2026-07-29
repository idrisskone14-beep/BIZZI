# Guide livraison V25 - Bizzi

Date : 30 juin 2026

## Objectif

Cette version branche l'application Bizzi sur le projet Supabase officiel fourni.

La V24 préparait le stockage des fichiers. La V25 ajoute la configuration réelle Supabase et adapte l'application au nouveau format de clé publique Supabase `sb_publishable_...`.

## Nouveautés V25

- Passage de `bizzi-app/config.js` en mode `production`.
- Ajout de l'URL du projet Supabase.
- Ajout de la clé publique `publishable`.
- Mise à jour du cache PWA en `bizzi-v25`.
- Adaptation des appels API Supabase : la clé `sb_publishable_...` est envoyée comme `apikey`.
- Conservation de la compatibilité avec les anciennes clés `anon` JWT si besoin.
- Ajout des guides V25 dans l'espace administrateur.

## Point de sécurité important

La clé intégrée est une clé publique, prévue pour une application web ou mobile.

Ne jamais placer la clé `service_role` dans l'application, dans un fichier public ou dans un téléphone. La clé `service_role` doit rester uniquement côté serveur.

La sécurité dépend des politiques RLS déjà créées dans Supabase.

## Ce qui est prêt

- Le client peut consulter sans inscription.
- Le prestataire peut créer son profil.
- Les données peuvent être envoyées vers Supabase.
- Les photos, preuves et publicités peuvent être envoyées vers Supabase Storage.
- L'admin peut tester la connexion depuis `bizzi-app/admin.html`.

## Prochaine étape

Ouvrir l'admin, tester Supabase, puis importer les données publiques pour vérifier que la base répond correctement.
