# Guide demandes express Supabase V43 - Bizzi

La V43 connecte la demande express a Supabase.

## Objectif

Les demandes clients ne restent plus seulement dans le navigateur. Elles peuvent etre sauvegardees dans Supabase, puis chargees dans l'espace admin avec un compte admin.

## Etape SQL

Dans Supabase SQL Editor, creer une nouvelle query et copier :

`sql-copie-bizzi/16-demandes-express-supabase.sql`

Puis cliquer sur `Run`.

Le script cree la table `express_requests`, active la securite RLS, autorise les clients anonymes a creer une demande, et autorise uniquement les admins a lire ou traiter les demandes.

## Test cote client

1. Ouvrir `bizzi-app/index.html`.
2. Aller sur `Demande express`.
3. Choisir un service.
4. Entrer une ville ou commune.
5. Envoyer la demande.

Si Supabase est pret, l'application indique que la demande est sauvegardee en ligne.

## Test cote admin

1. Ouvrir `bizzi-app/admin.html`.
2. Se connecter a Supabase dans `Validation Supabase`.
3. Cliquer sur `Charger validations Supabase`.
4. Verifier le bloc `Demandes express Supabase ouvertes`.
5. Tester `Voir matches` puis `Marquer traité Supabase`.

## Si une erreur apparait

Si l'application dit que la table manque ou que la demande reste locale, executer le fichier SQL V43 puis reessayer.

## Pourquoi c'est important

Cette version transforme les demandes express en vraie donnee business. Bizzi peut voir quels services sont demandes, dans quelles zones il faut recruter, et quelles demandes doivent etre traitees en priorite.
