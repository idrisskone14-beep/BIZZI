# Guide livraison V26 - Bizzi

Date : 30 juin 2026

## Objectif

Cette version active la clé publique `anon` Supabase fournie pour Bizzi.

La V25 utilisait la nouvelle clé `publishable`. La V26 utilise la clé `anon` JWT du même projet Supabase, ce qui reste compatible avec les appels classiques Supabase REST et Storage.

## Clé intégrée

La clé fournie indique :

- projet Supabase : `hqqppxnvorcnvksulhna` ;
- rôle : `anon` ;
- usage : application publique avec RLS actif.

## Sécurité

Cette clé n'est pas une clé `service_role`.

Elle peut être utilisée côté application uniquement si les politiques RLS restent activées et correctement configurées.

Ne jamais mettre la clé `service_role` dans Bizzi, dans un site public ou dans une application mobile.

## Ce qui change

- `bizzi-app/config.js` passe en `version: "V26"`.
- La clé active devient la clé `anon` JWT.
- Le cache PWA passe en `bizzi-v26`.
- Les appels Supabase envoient `apikey` et `Authorization: Bearer ...`, comme attendu avec une clé anon JWT.

## Test conseillé

1. Ouvrir `bizzi-app/admin.html`.
2. Entrer le code `2026`.
3. Cliquer sur `Tester Supabase`.
4. Si le test réussit, cliquer sur `Importer public Supabase`.
5. Créer ensuite un prestataire test avec photo pour vérifier l'écriture et Storage.
