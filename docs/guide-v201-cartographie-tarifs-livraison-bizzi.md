# Bizzi V202 - Cartographie Côte d'Ivoire et tarifs livraison

## Ce qui change

Bizzi utilise maintenant une base cartographique interne plus large pour la Côte d'Ivoire.

Elle contient :

- les grandes villes du pays ;
- les communes importantes d'Abidjan ;
- plusieurs quartiers utiles à Abidjan, Bouaké, Yamoussoukro, San Pedro, Daloa, Korhogo et Man ;
- un calcul de distance routière estimée quand aucune API cartographique réelle n'est encore branchée.

## Nouvelle grille plus abordable

- Minimum : 500 FCFA.
- 0 à 2 km : 500 à 1 000 FCFA.
- 2 à 5 km : 1 000 à 1 600 FCFA.
- 5 à 8 km : 1 600 à 2 200 FCFA.
- 8 à 12 km : 2 200 à 3 200 FCFA.
- Après 12 km : 3 200 FCFA + 250 FCFA par km supplémentaire.

## Majorations

- Heure de pointe matin : +15%.
- Heure de pointe soir : +15%.
- Circulation fluide de 22h à 8h : aucune majoration de circulation.
- Urgence : +15%.
- Pluie / trafic difficile : +10%.
- Majorations plafonnées à 35%.

## Marge Bizzi

La commission Bizzi reste à 15% sur chaque livraison.

Le client voit seulement le prix total.
La répartition Bizzi / livreur reste visible côté admin et prestataire.

## À faire dans Supabase

Exécuter :

`sql-copie-bizzi/89-tarifs-livraison-abordables-v201.sql`

La migration V212 aligne Supabase sur le minimum 500 FCFA et conserve la commission Bizzi à 15%.
