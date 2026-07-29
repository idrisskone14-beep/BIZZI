# Tests terrain Bizzi V241

## Préparation

- Noter l'appareil, le navigateur, le réseau, la ville et l'heure.
- Vérifier que V241 est affichée.
- Conserver une capture avant et après chaque anomalie.
- Utiliser des données marquées `TEST BIZZI` pour les essais non réels.

## Appareils et réseaux

- Android économique en connexion lente.
- Android récent en 4G ou Wi-Fi.
- iPhone Safari.
- PWA installée sur l'écran d'accueil.
- Mode avion, retour réseau, fermeture et réouverture.

## Recherche texte et voix

- Faire lire les mêmes phrases par plusieurs locuteurs et accents, sans caricature ni imitation.
- Tester une voix rapide, une voix basse, une voix aiguë et un environnement modérément bruyant.
- Vérifier `plonbier à coquody`, `esteticienne à coumassi`, `garba à yopou gon` et leurs prononciations naturelles.
- Rechercher un métier exact et vérifier trois candidats maximum.
- Dicter `esthéticienne` et vérifier qu'aucun tatoueur n'est sélectionné.
- Dicter `escargot` et vérifier l'orientation vers Food, jamais vers cargo.
- Dicter un mot sans rapport et vérifier la demande de reformulation.
- Refuser le microphone et vérifier que la saisie texte reste utilisable.
- Tester une phrase complète avec métier, commune et urgence.

## Kilométrage

- Autoriser le GPS puis comparer une distance connue.
- Refuser le GPS et dicter `plombier à Cocody` puis `plombier à Yopougon` ; la distance du même profil doit changer.
- Tester `livrer un colis de Cocody à Marcory maintenant` ; départ et arrivée doivent rester distincts.
- Vérifier si le résultat annonce une distance routière vérifiée ou une estimation géographique.
- En cas d'absence d'origine, vérifier que l'application demande la position ou la zone.

## Profils prestataires

- Créer au moins trois profils avec trois numéros distincts.
- Vérifier que chaque numéro retrouve uniquement son profil.
- Ajouter deux services au même numéro et retrouver les deux services.
- Vérifier que le formulaire est entièrement vidé après validation.
- Actualiser la page et vérifier que les profils locaux existent encore.
- Importer Supabase et vérifier que les profils locaux ne disparaissent pas.

## Livraison

- Vérifier le minimum de 500 FCFA.
- Comparer un trajet en journée et entre 22 h et 8 h.
- Suivre accepté, récupéré, en route et livré.
- Confirmer la remise par PIN ou photo selon le parcours.
- Vérifier le bouton SOS et le contact support.
- Terminer une mission puis vérifier qu'elle n'apparaît plus dans les livraisons actives proposées par l'IA.

## Food, emplois et événements

- Rechercher une spécialité Food et ouvrir une fiche.
- Créer puis retrouver une offre d'emploi test.
- Créer puis retrouver un événement test.
- Vérifier qu'un événement terminé n'est plus présenté comme actif.

## Administration et publication

- Vérifier que le badge Stores commence par `À valider` si la checklist est incomplète.
- Contrôler tous les liens V241 de la section Stores.
- Compléter réellement la checklist et vérifier que le statut évolue.
- Exporter les données avant un test de suppression.
- Installer puis supprimer le jeu de données test.

## Rapport d'anomalie

Indiquer : appareil, navigateur, réseau, ville/quartier, phrase dictée ou saisie, résultat obtenu, résultat attendu, capture, heure et version V241.


