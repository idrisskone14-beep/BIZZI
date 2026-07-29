# Bizzi V187 - Livraison verrouillee et penalite livreur

## Regle appliquee

- Une livraison acceptee est verrouillee pour le livreur.
- Le livreur ne peut pas annuler directement depuis l'application.
- Le livreur peut signaler un probleme avec motif.
- Le client peut annuler avec motif et confirmation telephone ou reference.
- L'admin examine les signalements livreur.
- Si l'annulation livreur est injustifiee, Bizzi applique 18% de commission sur les 3 prochaines courses ou pendant 7 jours.

## Parcours client

1. Le client cree une livraison.
2. Le paiement est confirme.
3. Un livreur proche accepte.
4. Si le client annule, il doit donner un motif : attente trop longue, erreur d'adresse, changement d'avis, livreur injoignable ou autre.

## Parcours livreur

1. Le livreur voit les courses de sa ville a moins de 5 km du depart.
2. Il accepte seulement s'il peut realiser la mission.
3. Apres acceptation, il ne peut plus annuler librement.
4. En cas de probleme grave, il clique sur `Signaler un probleme`.

## Parcours admin

- `Liberer sans penalite` : la course repart aux livreurs proches.
- `Penaliser 18%` : la course repart aux livreurs proches et le livreur fautif passe a 18% de commission Bizzi temporairement.

## SQL requis

Executer une fois :

`sql-copie-bizzi/84-livraison-verrouillage-annulation-penalite-v187.sql`
