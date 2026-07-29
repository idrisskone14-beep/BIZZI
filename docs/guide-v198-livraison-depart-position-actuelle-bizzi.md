# Bizzi V198 - Livraison depuis la position actuelle

## Objectif

Le client peut créer une livraison dont le départ est sa position GPS actuelle.

## Parcours client

1. Ouvrir Bizzi Livraison.
2. Cliquer sur **Départ = ma position actuelle**.
3. Autoriser la position du téléphone.
4. Renseigner la destination, le colis, le contact et valider la commande.

## Logique technique

Bizzi garde les coordonnées GPS du point de départ dans la commande. Les livreurs disponibles sont ensuite comparés au vrai point de récupération, dans le rayon Bizzi de 5 km.

Si la destination correspond à un quartier connu, Bizzi calcule une distance estimée automatiquement. Sinon, le client peut compléter ou ajuster la distance.
