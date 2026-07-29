# Bizzi V66 - Emplois & Missions

## Ce qui est ajoute

- Nouvel onglet `Emplois` dans l'application publique.
- Recherche d'offres par metier, ville et mot-cle.
- Formulaire pour qu'une entreprise ou un prestataire publie une recherche d'employe, apprenti, stagiaire ou mission.
- Assistant Bizzi capable de reconnaitre une demande d'emploi et de rediriger vers les offres.
- Validation admin Supabase des offres avant affichage public.

## Apres upload sur Cloudflare

1. Ouvrir `https://bizzi-africa.com`.
2. Aller dans `Emplois`.
3. Publier une offre test.
4. Aller dans l'admin : `https://bizzi-africa.com/admin-access`.
5. Si Supabase n'a pas encore la table emploi, copier-coller `sql-copie-bizzi/25-emplois-missions-supabase.sql` dans Supabase SQL Editor puis cliquer sur `Run`.
6. Dans l'admin Bizzi, cliquer sur `Charger validations Supabase`.
7. Dans `Offres emploi Supabase en attente`, cliquer sur `Publier l'offre`.
8. Cliquer sur `Importer public Supabase`.
9. Revenir dans `Emplois` et verifier que l'offre est visible.

## Utilisation intelligente

Dans `Assistant Bizzi`, tester par exemple :

`Je cherche un emploi de chauffeur a Abidjan ou une mission reguliere`

L'assistant doit comprendre qu'il s'agit d'une recherche d'emploi et proposer d'ouvrir la section `Emplois`.
