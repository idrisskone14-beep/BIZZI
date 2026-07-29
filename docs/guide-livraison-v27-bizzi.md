# Guide livraison V27 - Bizzi

Date : 30 juin 2026

## Objectif

Cette version rend les actions Supabase plus visibles dans l'espace administrateur.

Le bouton `Importer public Supabase` fonctionnait, mais le message pouvait passer inaperçu. La V27 ajoute un retour immédiat sur le bouton et une zone de statut plus visible.

## Nouveautés V27

- Le bouton `Tester Supabase` affiche `Test en cours...`, puis `Connexion OK` ou `Erreur de connexion`.
- Le bouton `Importer public Supabase` affiche `Import en cours...`, puis `Import terminé` ou `Erreur import`.
- La zone `Supabase` devient plus visible et remonte automatiquement à l'écran.
- Si aucun prestataire actif n'est importé, Bizzi explique que c'est normal tant qu'aucun profil n'a été validé dans Supabase.

## Résultat attendu

Après un clic sur `Importer public Supabase`, un message doit apparaître :

- nombre de prestataires importés ;
- nombre de catégories importées ;
- nombre de publicités importées.

Si le message indique `0 prestataire`, cela ne veut pas dire que le bouton a échoué. Cela veut dire qu'aucun prestataire actif et visible n'existe encore dans Supabase.
