# Guide V44 - Priorite des demandes express Bizzi

## Objectif

La V44 aide l'administrateur a traiter les demandes express dans le bon ordre.

Chaque demande recoit automatiquement :

- un libelle : `Urgent`, `Priorite haute`, `A suivre` ou `Normal` ;
- un score de 10 a 100 ;
- le nombre de prestataires proposes par Bizzi.

## Ce qui change dans l'application

- L'ecran `Demande express` affiche une pastille de priorite apres l'envoi.
- L'espace admin trie les demandes ouvertes par priorite.
- Le bloc `Pilotage commercial` indique combien de demandes sont prioritaires.
- L'export CSV des demandes contient la priorite, le score et le nombre de prestataires proposes.
- Supabase peut stocker ces informations si le SQL V44 est execute.

## SQL a copier dans Supabase

Dans Supabase SQL Editor :

1. Cliquer sur `New query`.
2. Copier le fichier `sql-copie-bizzi/17-priorite-demandes-express.sql`.
3. Cliquer sur `Run`.
4. Le resultat attendu peut etre `Success. No rows returned`.

Ce SQL doit etre execute apres `16-demandes-express-supabase.sql`.

## Test rapide

1. Ouvrir `bizzi-app/index.html`.
2. Aller dans `Demande express`.
3. Creer une demande urgente, par exemple `Plombier`, ville `Abidjan`, urgence `Aujourd'hui`.
4. Verifier que la reponse Bizzi affiche une pastille de priorite.
5. Aller dans l'admin.
6. Cliquer sur `Charger validations Supabase`.
7. Verifier que la demande affiche une priorite et le nombre de prestataires proposes.

## Important

Si le SQL V44 n'est pas encore execute, l'application continue de sauvegarder les demandes express comme en V43. La priorite locale reste visible dans l'application, mais Supabase ne la stockera completement qu'apres le SQL V44.
