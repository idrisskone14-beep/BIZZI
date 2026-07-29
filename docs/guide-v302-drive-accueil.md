# Bizzi V302 — Drive sur l’accueil

## Objectif

Le parcours Course devient un accès prioritaire de l’application.

## Accueil

Une grande bannière **Drive** apparaît immédiatement sous la barre **Trouver**. Elle comprend :

- une icône de voiture clairement identifiable ;
- le libellé **Drive** ;
- l’action **Commander une course** ;
- un bouton visuel **Maintenant →**.

## Parcours

1. Le client touche la bannière Drive.
2. Bizzi prépare automatiquement le type **Course**.
3. Si nécessaire, le client renseigne son prénom ou pseudo et son téléphone.
4. Le formulaire Course affiche directement **Lieu de départ** et **Destination**.
5. L’itinéraire et le tarif restent calculés automatiquement.
6. Le client choisit son paiement puis valide.

Le clic ne bascule jamais vers le formulaire Livraison.

## Position précise

- Bizzi collecte plusieurs relevés GPS et retient le meilleur ;
- la précision cible est de 15 mètres et la précision obtenue est affichée au client ;
- une position de plus de 60 mètres d’incertitude est refusée au lieu de produire un faux tarif ;
- les coordonnées réelles sont envoyées directement au calcul d’itinéraire, sans convertir « Ma position actuelle » en adresse approximative ;
- la fonction `map-geocode` est déployée sur Supabase avec authentification JWT.

## Assistant vocal et lieux de référence

- « course », « taxi », « VTC », « chauffeur » et « trajet » ouvrent **Course** ;
- « je vais à… », « je veux aller à… », « emmène-moi à… », « conduis-moi à… » et « direction… » ouvrent aussi **Course** ;
- lorsqu’une seule destination est annoncée, Bizzi propose automatiquement **Ma position actuelle** comme départ ;
- « livrer », « livraison », « colis », « paquet » et « document » ouvrent **Livraison** ;
- les noms de lieux sont conservés comme départ et destination ;
- les champs proposent 156 écritures utiles couvrant les lieux de référence, quartiers et villes déjà répertoriés ;
- le moteur cartographique en ligne reste utilisé pour les adresses qui ne sont pas encore dans le catalogue local.

## Validation

- écran mobile vérifié à 390 px ;
- icône véhicule et textes lisibles ;
- type interne `ride` sélectionné ;
- onglet Course actif ;
- aucun débordement horizontal ;
- aucune erreur navigateur ;
- suite complète de tests Bizzi réussie.
