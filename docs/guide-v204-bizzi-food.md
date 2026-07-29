# Bizzi V206 - Bizzi Food

## Objectif

Bizzi Food permet aux clients de trouver une bonne adresse précise selon un plat ou une spécialité :

- garba ;
- attiéké poisson ;
- poulet braisé ;
- alloco ;
- placali ;
- kedjenou ;
- grillades ;
- restaurant, maquis, fast-food, traiteur ou vendeuse de plats.

## Règle importante

Bizzi ne vend pas encore les repas et n'encaisse pas l'argent des repas.

Dans cette version, Bizzi sert de plateforme de visibilité :

- le client voit les bonnes adresses ;
- il contacte l'adresse par WhatsApp ou téléphone ;
- si livraison possible, Bizzi peut préparer une demande de livraison ;
- le restaurant reste responsable du prix, du plat et de la disponibilité.

## Parcours client

1. Ouvrir l'onglet Food.
2. Choisir une ville.
3. Rechercher un plat ou une spécialité.
4. Ouvrir le contact WhatsApp de l'adresse.
5. Si l'adresse livre, cliquer sur `Livrer ce plat` pour pré-remplir Bizzi Livraison.

## Parcours restaurateur

1. Ouvrir l'onglet Food.
2. Remplir `Proposer une adresse Food`.
3. Indiquer la spécialité principale, le quartier, le contact, les horaires et le budget.
4. Envoyer l'adresse.
5. L'adresse reste en attente jusqu'à validation Bizzi.

## Supabase

Exécuter :

`sql-copie-bizzi/91-bizzi-food-v204.sql`

Ce script crée :

- `food_places` ;
- `public_food_places` ;
- les règles RLS ;
- le bucket public `food-photos`.

## Idée économique

Démarrer sans paiement repas :

- inscription Food standard gratuite ou essai ;
- boost `Plat du jour` ;
- mise en avant par ville/quartier ;
- badge `Adresse vérifiée Bizzi` ;
- liaison avec Bizzi Livraison quand le modèle est stable.
