# Bizzi V188 - Renouvellement prive prestataire

Cette version separe clairement l'ecran client et l'espace prestataire.

## Regle client

- Un client voit uniquement les prestataires `approved` avec une visibilite `active`.
- Les prestataires expires ou a renouveler ne sont plus listes dans les resultats client.
- Les livreurs locaux restent proteges : le client cree une demande livraison, puis Bizzi presente un livreur disponible apres paiement valide.

## Regle prestataire

- Un prestataire doit s'identifier avec son telephone ou WhatsApp.
- Apres identification, il voit seulement son profil.
- Les forfaits, boosts et livraisons a accepter sont rattaches uniquement a ce profil.
- Le prestataire peut changer de numero avec le bouton `Changer`.

## Supabase

Executer le script suivant dans Supabase SQL Editor :

`sql-copie-bizzi/87-catalogue-client-actif-renouvellement-prive-v188.sql`

Le script ne supprime aucun prestataire. Il retire seulement les profils expires de la vue publique client. Le renouvellement par telephone reste possible via `public_find_provider_for_renewal`.
