# Guide correction RLS V28 - Bizzi

Date : 30 juin 2026

## Problème détecté

Le test réel Supabase a répondu :

`new row violates row-level security policy for table "providers"`

Cela veut dire que Bizzi est bien connecté à Supabase, mais que la règle RLS qui autorise un prestataire public à créer son profil en attente n'est pas active ou pas complète.

## Correction

Dans Supabase :

1. Ouvrir `SQL Editor`.
2. Cliquer sur `Create new query`.
3. Coller tout le contenu de :

`sql-copie-bizzi/08-correction-rls-soumission-publique.sql`

4. Cliquer sur `Run`.
5. Le résultat attendu peut être : `Success. No rows returned`.

## Après correction

Revenir dans Bizzi et refaire le test :

1. Aller dans `Prestataire`.
2. Créer un prestataire test.
3. Vérifier que le message indique que le profil est envoyé vers Supabase.
4. Aller dans Supabase pour valider le paiement ou exécuter :

```sql
select approve_payment('ID_DU_PAIEMENT'::uuid);
```

## Important

La soumission publique crée uniquement des données en attente. Le client ne doit voir le prestataire qu'après validation admin.

