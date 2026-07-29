# Guide Admin Supabase V30 - Bizzi

Date : 30 juin 2026

## Objectif

La V30 ajoute une validation admin Supabase directement dans Bizzi.

Avant, il fallait copier un SQL pour valider un paiement. Maintenant, Bizzi peut charger les paiements en attente et les valider depuis l'espace admin, avec un vrai compte Supabase.

## Étape 1 : exécuter le SQL admin

Dans Supabase SQL Editor, exécuter :

`sql-copie-bizzi/11-admin-validation-supabase.sql`

## Étape 2 : créer un utilisateur admin

Dans Supabase :

1. Aller dans `Authentication`.
2. Aller dans `Users`.
3. Créer un utilisateur avec email et mot de passe.
4. Copier son `User UID`.

## Étape 3 : créer le profil admin

Ouvrir :

`sql-copie-bizzi/12-template-creer-admin-bizzi.sql`

Remplacer :

`AUTH_USER_ID_ICI`

par le `User UID` copié dans Supabase.

Puis exécuter le SQL.

## Étape 4 : utiliser Bizzi

1. Ouvrir `bizzi-app/admin.html`.
2. Entrer le code `2026`.
3. Dans `Validation Supabase`, saisir l'email et le mot de passe admin.
4. Cliquer sur `Charger validations Supabase`.
5. Cliquer sur `Valider Supabase` pour approuver un paiement.

Le prestataire devient alors visible côté client après import public Supabase.

