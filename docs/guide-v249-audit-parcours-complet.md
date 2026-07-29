# Bizzi V249 — audit complet des parcours

## Contrôles exécutés

- syntaxe de tous les fichiers JavaScript ;
- tests voix, sécurité, backend, performances, profils mobiles, inscriptions, renouvellements, boosts et formulaires mobiles ;
- validation des ressources HTML, du manifeste PWA et du précache hors ligne ;
- parcours bureau et mobile : accueil, livraison, Food, événements, services, emplois, demande express, prestataire et légal ;
- création d’événement en trois étapes ;
- inscription prestataire en trois étapes ;
- fiche Fally, affiche, tarif, Premium, boost et administration ;
- contrôle des images cassées, débordements horizontaux et erreurs navigateur.

## Corrections V249

1. Les liens opérationnels de l’administration ne sortent plus du dossier Cloudflare. Les guides et SQL référencés sont maintenant inclus avec le déploiement.
2. Le formulaire Livraison ne calcule plus automatiquement une fausse distance « ville vers ville » lorsque les lieux de départ et d’arrivée sont vides.
3. Les protections V248 du parcours Fally restent actives : migration locale automatique, affiche précachée, boost de 30 jours non renouvelé artificiellement et suppression de l’ancien Concert pilote.

Le paquet `CLOUDFLARE-UPLOAD-ONLY` reste statique, sans TypeScript ni étape de build.
