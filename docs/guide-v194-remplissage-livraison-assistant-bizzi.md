# Bizzi V194 - Remplissage livraison par assistant

## Objectif

L'assistant de recherche comprend mieux les phrases naturelles pour créer une course livraison.

## Exemple

```text
Recherche livreur de Cocody au Plateau
```

Bizzi doit préparer :

- lieu de récupération : Cocody ;
- lieu de livraison : Plateau ;
- ville : Abidjan si les quartiers sont reconnus ;
- colis/course : à préciser ;
- distance et tarif : calculés automatiquement par Bizzi.

Le client remplit ensuite son téléphone manuellement, vérifie le tarif, puis valide la commande.

## Phrases prises en charge

- Livreur de Cocody au Plateau
- Livraison de Yopougon vers Marcory
- Coursier de Riviera à Zone 4 maintenant
- Colis de Treichville pour Koumassi

## Limite

Sans API cartographique réelle, Bizzi utilise l'estimation locale déjà intégrée. Quand Mapbox ou OpenStreetMap sera branché, le même parcours utilisera une distance plus précise.
