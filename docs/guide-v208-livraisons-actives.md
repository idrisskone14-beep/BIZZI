# Bizzi V208 — filtrage des livraisons actives

## Correction

Les parcours publics n’affichent plus les anciennes livraisons lorsque l’utilisateur ouvre la rubrique Livraison ou lorsque l’IA reconnaît une intention de livraison.

## Règle commune

- statuts `closed`, `cancelled` et `completed` : toujours masqués ;
- statut `open` avec horaire programmé : masqué deux heures après cet horaire ;
- statut `open` sans horaire : masqué 24 heures après sa création ;
- statut `assigned` : conservé jusqu’à la clôture, car la course peut être réellement en cours.

La même fonction de filtrage est utilisée pour la liste client, les compteurs, les missions proposées aux livreurs, les alertes et l’écran ouvert par l’assistant IA.

L’historique reste disponible dans l’administration pour le suivi et la comptabilité.
