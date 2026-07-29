# Bizzi V269 — parcours simplifiés et recherche exacte

La V269 concentre chaque parcours sur l’action utile et conserve les calculs techniques en arrière-plan.

## Corrections livrées

- accueil : suppression du texte éditorial sous « Événements à ne pas manquer » ;
- lieux d’exception : suppression des numéros, cartes sans bande colorée et images recadrées en plein espace ;
- livraison et courses : deux onglets séparés, départ et destination visibles, tarif automatique, paiement puis validation ;
- Bizzi Food : contact direct ou commande avec menu, destination et tarif de livraison automatique ;
- commande Food : montant restaurant séparé, montant livraison séparé, commission Bizzi de 15 % sur la livraison et part livreur de 85 % ;
- persistance Food : total client et ventilation financière synchronisés dans Supabase ; migration `sql-copie-bizzi/97-commandes-food-v269.sql` fournie dans la sauvegarde maître ;
- proposition Food : bouton visible, formulaire affiché seulement après le clic ;
- événements : actions directes « Acheter billet » et « Contacter », sans bouton de détail ;
- promotion événement : formulaire affiché seulement après le clic et publication publique uniquement après validation Bizzi ;
- recherche : filtre avancé ouvert et mis en évidence ;
- emplois : offres 1 jour à 999 FCFA, 1 semaine à 5 000 FCFA et 1 mois à 14 900 FCFA ; suppression du pack de cinq emplois ;
- expiration : une offre emploi publiée disparaît automatiquement quand son échéance est atteinte ;
- services : recherche effectuée sur les 105 métiers, avec priorité à la correspondance exacte et sans diagnostic technique côté client.

## Vérifications effectuées

- tests fonctionnels complets réussis ;
- 105 métiers et 105 images métiers contrôlés ;
- anti-doublons validé sur 499 fichiers uniques ;
- architecture annuaire 100 000 prestataires validée ;
- sécurité, backend, inscription, renouvellement, boosts et formulaires mobiles validés ;
- budget de performance respecté ;
- contrôle réel en 390 × 844 px : accueil, livraison, Food, événements, emplois et recherche ;
- recherche « plombier » : un seul métier affiché et uniquement les prestataires correspondants ;
- aucune erreur ni alerte détectée dans le navigateur.

## Publication Cloudflare

Décompressez `BIZZI-V269-CLOUDFLARE-UPLOAD-ONLY.zip`, puis envoyez uniquement le contenu du dossier décompressé dans Cloudflare Pages.

Ce paquet ne contient ni TypeScript ni processus de compilation.

## Avant l’ouverture commerciale

La configuration reste en mode prélancement. Renseignez les vrais comptes Wave, Orange Money et MTN Money, puis activez le mode production après la recette terrain.
