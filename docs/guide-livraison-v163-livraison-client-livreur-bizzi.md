# Bizzi V163 - Livraison client et livreur

## Objectif

La section Livraison est maintenant séparée en deux parcours visibles :

- **Se faire livrer** : le client crée une demande locale, paie via Bizzi, puis un livreur est présenté après validation.
- **Créer profil livreur** : le livreur est renvoyé vers l'espace prestataire avec le métier **Bizzi Livraison**.

## Ce qui change

1. Ouvrir l'onglet **Livraison**.
2. Choisir **Se faire livrer** pour créer une demande de livraison locale.
3. Choisir **Créer profil livreur** pour inscrire un livreur.
4. Le profil livreur passe par le parcours prestataire existant.
5. Le client ne voit pas directement le profil du livreur local avant paiement et attribution.

## Test client

1. Aller dans **Livraison**.
2. Cliquer **Se faire livrer**.
3. Remplir récupération, livraison, colis, ville, téléphone.
4. Laisser Bizzi calculer le tarif.
5. Choisir Wave, Orange Money ou MTN Money.
6. Envoyer pour validation paiement.

## Test livreur

1. Aller dans **Livraison**.
2. Cliquer **Créer profil livreur**.
3. Cliquer **Créer mon profil livreur**.
4. Vérifier que l'application ouvre **Proposer vos services**.
5. Vérifier que le métier **Bizzi Livraison** est sélectionné.
6. Remplir le profil puis créer le compte.

## Mise en ligne

1. Uploader le ZIP **V163** sur Cloudflare.
2. Dans Cloudflare, faire **Purge everything**.
3. Sur le téléphone, fermer puis rouvrir Bizzi.
4. Vérifier que l'écran affiche **Bizzi V163** dans le menu latéral.

