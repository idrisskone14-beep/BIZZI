# Guide correction RLS V29 - Bizzi

Date : 30 juin 2026

## Pourquoi ce fichier existe

Après exécution du correctif V28, le test minimal Supabase répond encore :

`new row violates row-level security policy for table "providers"`

Cela signifie que la règle d'insertion publique sur `providers` n'est toujours pas reconnue par Supabase.

## Correction V29

Exécuter dans Supabase SQL Editor le fichier :

`sql-copie-bizzi/09-correction-rls-provider-simple.sql`

Cette correction autorise seulement la création publique d'un prestataire avec :

- `status = pending`
- `visibility_status = trial`

Elle n'autorise pas un visiteur public à créer directement un profil approuvé.

## Étapes

1. Ouvrir Supabase.
2. Aller dans `SQL Editor`.
3. Créer une nouvelle requête.
4. Copier-coller tout le fichier `09-correction-rls-provider-simple.sql`.
5. Cliquer sur `Run`.
6. Me dire quand Supabase affiche `Success`.

Ensuite je relance le test minimal, puis le test complet.

