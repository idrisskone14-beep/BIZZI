# Guide test Supabase connecté V25 - Bizzi

Date : 30 juin 2026

## Avant de commencer

Vérifier que les scripts SQL Bizzi ont bien été exécutés dans Supabase.

La V25 utilise :

- le projet Supabase officiel ;
- une clé publique `publishable` ;
- les règles RLS pour protéger les données ;
- les buckets Storage déjà préparés.

## Test 1 : ouvrir l'admin

1. Ouvrir `bizzi-app/admin.html`.
2. Entrer le code admin de démonstration : `2026`.
3. Aller dans `Données & production`.
4. Cliquer sur `Tester Supabase`.

Résultat attendu :

- un message indique que la connexion fonctionne ;
- la checklist admin affiche que la base de données Supabase est configurée.

## Test 2 : importer les données publiques

1. Dans le même écran admin, cliquer sur `Importer public Supabase`.
2. Attendre le message de fin.
3. Revenir dans l'onglet `Services`.

Résultat attendu :

- les catégories et services viennent de Supabase ;
- les prestataires actifs et non expirés peuvent apparaître côté client ;
- les informations sensibles restent masquées selon les règles prévues.

## Test 3 : créer un prestataire

1. Aller dans `Prestataire`.
2. Remplir un profil simple.
3. Ajouter une photo.
4. Choisir un forfait.
5. Envoyer le profil.

Résultat attendu :

- le profil est créé localement ;
- l'application tente aussi l'envoi vers Supabase ;
- l'admin peut ensuite valider le prestataire dans la base.

## Si une erreur apparaît

- `relation does not exist` : un script SQL manque.
- `permission denied` : une politique RLS manque ou bloque l'action.
- `bucket not found` : les buckets Storage n'ont pas été créés.
- `Failed to fetch` : vérifier la connexion internet, l'URL Supabase ou le navigateur.

## Règle simple

Si `Tester Supabase` fonctionne, on peut passer au test terrain avec quelques prestataires réels.
