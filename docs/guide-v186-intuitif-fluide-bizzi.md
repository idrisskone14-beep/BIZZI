# Bizzi V186 - Interface plus intuitive et fluide

## Objectif

Rendre l'application plus facile a comprendre au premier geste, plus rapide pendant la recherche, et plus agreable sur telephone sans modifier la logique metier deja validee.

## Ce qui change

- Ajout du bloc `Prochain geste` sur l'accueil.
- Les actions proposees s'adaptent a l'etat de l'application : livraison a creer, livraison payee a attribuer, recherche service, espace prestataire, evenements, emplois ou demande express.
- Les recherches services, emplois et evenements sont temporisees pour eviter des rendus trop frequents pendant la saisie.
- Le calcul du prix livraison pendant la saisie est temporise pour limiter les micro-blocages sur mobile.
- Les actions rapides passent en colonne sur petit ecran pour rendre les clics plus precis.

## Deploiement

1. Uploader le ZIP V186 sur Cloudflare Pages.
2. Purger le cache Cloudflare si l'ancien affichage reste visible.
3. Tester sur telephone : accueil, recherche service, livraison, prestataire, evenements.

## SQL

Aucun nouveau script SQL n'est necessaire pour cette version.
