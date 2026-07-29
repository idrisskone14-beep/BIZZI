# Bizzi V190 - Colis international et transitaires visibles cote livraison

Cette version clarifie la separation livraison locale / colis international.

## Livraison locale Bizzi

- Les profils `Bizzi Livraison` restent masques cote client.
- Le client cree une demande locale.
- Le paiement Bizzi valide la demande.
- Les livreurs proches et disponibles peuvent accepter.
- Le contact direct est evite avant attribution.

## Colis international et transitaires

- Les profils `Transport de colis international` restent visibles cote client.
- Les profils `Transitaire` restent visibles cote client dans la meme section.
- Ils apparaissent dans l'onglet Livraison, bloc `Colis international`.
- Ils apparaissent aussi dans la recherche service.
- Bizzi ne fixe pas le tarif international : destination, poids, delai, agence et formalites peuvent varier.
- Bizzi sert de mise en relation et peut monetiser la visibilite/boost du prestataire, sans imposer de prix final.

## Regle technique

- `isLocalDeliveryProvider()` masque uniquement le metier `Bizzi Livraison`.
- `isInternationalParcelProvider()` identifie uniquement `Transport de colis international` et `Transitaire`.
- `providerVisibleInClientSearch()` garde les colis internationaux visibles.
- `serviceMatchGroup()` ne regroupe plus tous les livreurs quand le client choisit colis international.
