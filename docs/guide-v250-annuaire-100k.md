# Bizzi V250 — annuaire de 100 000 prestataires

## Résultat

La V250 supprime le préchargement global des prestataires. L’application demande désormais à Supabase des pages de 30 profils, filtrées par ville, métier, recherche et vérification.

Cette architecture permet d’enregistrer 100 000 prestataires sans charger les 100 000 profils dans le téléphone. Elle ne signifie pas que 100 000 utilisateurs peuvent se connecter simultanément : la concurrence réelle dépend du forfait et du dimensionnement Supabase.

## Installation obligatoire dans Supabase

La base actuellement reliée à Bizzi ne possède pas encore la fonction V250. Avant de publier l’application :

1. Ouvrir Supabase, puis **SQL Editor**.
2. Ouvrir le fichier `sql-copie-bizzi/92-annuaire-prestataires-100k-v250.sql` du paquet maître.
3. Copier tout son contenu dans une nouvelle requête Supabase.
4. Cliquer sur **Run**.
5. Vérifier que le résultat affiche `bizzi_v250_annuaire_100k_installe`.

Le script installe :

- la fonction `bizzi_search_public_providers` ;
- un curseur stable pour charger les pages suivantes ;
- une limite serveur maximale de 50 profils par requête ;
- les index de statut, ville, métier, téléphone, nom et ordre public ;
- la fonction de comptage public utilisée par l’administration.

## Publication Cloudflare

Téléverser uniquement le contenu du paquet `BIZZI-V250-CLOUDFLARE-UPLOAD-ONLY`. Ce paquet ne contient ni TypeScript, ni dépendances Node, ni processus de compilation.

Après publication, forcer une actualisation de l’application ou vider l’ancien cache PWA V249.

## Vérification fonctionnelle

1. Ouvrir **Services**.
2. Choisir un métier et une ville.
3. Vérifier que les résultats arrivent par groupes de 30.
4. Si plus de résultats existent, vérifier la présence de **Voir les suivants**.
5. Rechercher un prestataire par nom.
6. Vérifier que l’avertissement « Annuaire 100 000 non activé » a disparu.
7. Créer un prestataire test et vérifier son apparition dans l’administration Supabase.

## Tests réalisés

- suite complète Bizzi : réussie ;
- test synthétique : 100 000 profils, 3 334 pages, aucun doublon et aucun profil manquant ;
- budget des fichiers : respecté ;
- rendu navigateur : aucune erreur JavaScript ;
- mode de secours vérifié lorsque le SQL V250 n’est pas encore installé.

Le test synthétique n’envoie pas 100 000 écritures vers la base réelle. Après installation du SQL, une campagne de charge Supabase progressive reste nécessaire avant un lancement massif.
