# Bizzi V270 — images métiers intégrales

Cette version réorganise les résultats de recherche afin que toute l’image représentative du métier reste visible.

## Nouvelle organisation

- plusieurs métiers : grille mobile claire sur deux colonnes ;
- chaque image utilise désormais une zone carrée correspondant au format source ;
- recherche exacte : une grande carte horizontale affiche l’image carrée complète à gauche et le métier à droite ;
- affichage `contain`, centré à 50 % / 50 % ;
- suppression du zoom au survol pour éviter toute nouvelle découpe ;
- fond neutre derrière l’image en cas de différence de proportions.

## Vérifications effectuées

- 105 métiers et 105 images présents ;
- sources contrôlées en 640 × 640 px ;
- grille mobile contrôlée en 390 × 844 px ;
- images de grille affichées en 159 × 159 px ;
- recherche exacte « plombier » : une seule carte métier, image complète en 132 × 132 px et uniquement le prestataire Plombier correspondant ;
- tests fonctionnels, sécurité, anti-doublons, backend, annuaire 100 000 prestataires et performance validés ;
- aucune erreur ni alerte dans le navigateur.

## Publication Cloudflare

Décompressez `BIZZI-V270-CLOUDFLARE-UPLOAD-ONLY.zip`, puis envoyez uniquement le contenu du dossier décompressé dans Cloudflare Pages.

Ce paquet ne contient ni TypeScript ni processus de compilation.
