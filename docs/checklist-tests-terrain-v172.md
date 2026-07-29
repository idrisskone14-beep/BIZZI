# Checklist tests terrain Bizzi V172

## Téléphones

- Android récent, Chrome, 4G.
- Android entrée de gamme, Chrome, réseau faible.
- iPhone Safari, 4G.
- iPhone Safari en Wi-Fi.
- PWA installée depuis l'écran d'accueil.

## Scénarios client

- Ouvrir Bizzi depuis `https://bizzi-africa.com`.
- Rechercher un prestataire par métier et par ville.
- Ouvrir une fiche prestataire.
- Tester appel, WhatsApp si présent, avis client.
- Créer une demande express.
- Créer une demande livraison avec deux quartiers.
- Vérifier que la distance et le tarif s'affichent.

## Scénarios prestataire

- Créer un nouveau prestataire.
- Vérifier l'activation automatique du mois gratuit.
- Vérifier l'apparition côté client.
- Créer une demande de renouvellement forfait.
- Vérifier la référence de paiement.

## Scénarios admin

- Ouvrir le lien admin protégé.
- Se connecter à Supabase.
- Charger les validations.
- Valider un paiement forfait.
- Retirer puis réactiver un prestataire.
- Vérifier que le bouton change bien d'état.

## Scénarios événements

- Publier un événement standard.
- Vérifier l'affichage par ville.
- Vérifier la disparition après la date de fin.
- Tester le bouton externe d'achat billet.

## Qualité réseau

- Tester en 4G normale.
- Tester en réseau faible.
- Tester après purge Cloudflare.
- Tester après fermeture complète puis réouverture de la PWA.
