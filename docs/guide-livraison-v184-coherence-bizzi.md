# Bizzi V184 - Coherence livraison

## Logique retenue

La livraison locale Bizzi doit rester separee du service "Transport de colis international".

Pour une livraison locale :

1. Le client renseigne depart, arrivee, colis, ville et contact.
2. Bizzi calcule le tarif selon distance, heure, urgence et conditions.
3. Le paiement Bizzi est trace avec une reference.
4. La mission devient visible pour les livreurs proches.
5. Le client ne voit pas le profil ni le contact du livreur avant acceptation.
6. Le livreur accepte la mission.
7. Le contact client/livreur est affiche apres attribution.
8. L'admin suit les commissions, les livraisons bloquees et les parts livreurs.

## Correction V184

- Le statut de dispatch est conserve apres import Supabase.
- "Livreurs alertes" ne signifie plus "livreur attribue".
- "Acceptée par un livreur" est affiche seulement apres acceptation.
- Le choix par defaut n'est plus "Maintenant" mais "Aujourd'hui".
- L'admin peut relancer la recherche livreur sans casser une livraison existante.
- Le SQL V184 ajoute une vue de diagnostic : `bizzi_delivery_coherence_v184`.

## Test conseille

1. Creer ou selectionner un prestataire avec le metier `Bizzi Livraison`.
2. Creer une livraison locale avec deux quartiers connus.
3. Verifier que le tarif se calcule.
4. Valider la commande.
5. Verifier que le statut indique `Livreurs alertes` ou `Aucun livreur disponible`.
6. Aller dans le profil livreur.
7. Cliquer `Accepter cette livraison`.
8. Verifier que le client voit alors le livreur attribue.
9. Dans l'admin, verifier le tableau livraison et le rapport financier.

## Script Supabase

Executer si besoin :

`sql-copie-bizzi/82-coherence-livraison-v184.sql`
