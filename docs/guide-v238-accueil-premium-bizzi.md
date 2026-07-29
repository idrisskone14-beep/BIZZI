# Bizzi V238 — Accueil premium

## Objectif

Donner à Bizzi une vitrine plus haut de gamme sans retirer ni réécrire les parcours déjà intégrés.

## Évolutions visibles

- Hero noir et orange inspiré de la nouvelle direction visuelle Bizzi.
- Commande vocale mise au premier plan avec accès direct au micro existant.
- Maquettes mobiles créées en CSS, sans nouvelle image lourde.
- Accès immédiat aux Services, Livraisons, Food, Événements et Emplois.
- Mise en avant de la sélection IA limitée à trois candidats.
- Présentation de la confiance : voix adaptée, précision, suivi et PWA légère.
- Contenus dynamiques existants conservés : services, prestataires, restaurants et événements.

## Performance et mobile

- Aucun débordement horizontal contrôlé à 1280 px et sur Android 360 × 740.
- Bouton « Parler à Bizzi » visible dès le premier écran mobile.
- Les maquettes décoratives sont retirées automatiquement en mode connexion lente.
- Le nouveau contrôleur d’accueil pèse moins de 1 Ko.
- Le cache PWA précache la V238 et le module d’accueil premium.

## Compatibilité des données

- Clé des prestataires conservée : `bizzi-provider-registry-v233`.
- Identifiants de données test conservés : `test-v234-`.
- Aucun profil, service ou historique local n’est migré ni supprimé par cette mise à jour.
