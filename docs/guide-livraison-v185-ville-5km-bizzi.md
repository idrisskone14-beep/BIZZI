# Bizzi V185 - Livraison par ville et rayon 5 km

## Regle metier

Un livreur Bizzi Livraison s'inscrit simplement avec sa ville.

Ensuite, lorsqu'il veut recevoir des courses, il active sa disponibilite live. Bizzi utilise alors sa position actuelle pour lui proposer uniquement les livraisons :

- deja payees / confirmees ;
- dans sa ville d'inscription ;
- dont le point de recuperation est a moins de 5 km ;
- non encore acceptees par un autre livreur.

## Pourquoi cette logique

La ville seule est utile pour limiter la zone generale, mais elle n'est pas assez precise. Le rayon de 5 km evite qu'un livreur trop loin recoive une course peu rentable ou difficile a realiser rapidement.

Pour Abidjan, Bizzi regroupe les communes principales dans une meme zone metropolitaine, puis applique quand meme le rayon de 5 km autour du depart.

## Parcours livreur

1. Creer un profil prestataire.
2. Choisir le metier `Bizzi Livraison`.
3. Renseigner la ville.
4. Ouvrir l'espace prestataire.
5. Activer la disponibilite live.
6. Recevoir les missions proches.
7. Accepter une mission si elle est realisable.

## Parcours client

1. Creer une livraison locale.
2. Renseigner depart, arrivee, colis, ville et contact.
3. Bizzi calcule le prix.
4. Le paiement Bizzi est confirme.
5. Les livreurs proches de la ville voient la course.
6. Le client voit le contact du livreur uniquement apres acceptation.

## Script Supabase

Executer :

`sql-copie-bizzi/83-livraison-ville-rayon-5km-v185.sql`
