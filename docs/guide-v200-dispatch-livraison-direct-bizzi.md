# Bizzi V202 - Dispatch livraison direct

## Objectif

La livraison locale ne doit plus dépendre d'une validation admin normale.

Le parcours attendu est :

1. Le client renseigne départ, arrivée, colis, ville et téléphone.
2. Bizzi calcule automatiquement la distance estimée et le prix.
3. La commande est validée comme payée côté application.
4. Bizzi ouvre directement la course aux livreurs Bizzi Livraison proches.
5. Le premier livreur compatible accepte la mission.
6. Le client ne voit le contact du livreur qu'après attribution.

## Règles V202

- Le dispatch se fait dans la même ville.
- Le livreur doit être dans le rayon Bizzi de 5 km autour du départ.
- Si aucun livreur n'est trouvé immédiatement, la course reste ouverte.
- L'admin sert de surveillance et de secours, pas de passage obligatoire.
- Les détails de commission restent côté admin/prestataire, pas côté client.

## Test rapide

1. Ouvrir l'onglet Livraison.
2. Créer une commande locale avec un départ et une arrivée.
3. Vérifier que le montant est calculé.
4. Valider la commande livraison.
5. Ouvrir un profil livreur Bizzi Livraison dans la même ville.
6. Vérifier que la mission apparaît dans les livraisons à accepter.
7. Cliquer sur Accepter cette livraison.

Si aucun livreur n'apparaît, vérifier que le prestataire est actif, visible, dans le métier Bizzi Livraison, dans la même ville et proche du point de départ.
