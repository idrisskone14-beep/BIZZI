# Bizzi V215 — performance terrain, suivi livraison et confiance

## Téléphones et connexions modestes

- détection automatique du mode économie de données, 2G et connexion lente ;
- réduction des animations et effets graphiques ;
- chargement différé et décodage asynchrone des images ;
- fonctionnement PWA et cache hors ligne conservés ;
- état connexion normale, données réduites ou hors ligne visible.

## Langues

- français simple par défaut ;
- premier sélecteur Nouchi bêta pour les libellés essentiels ;
- architecture prête à recevoir progressivement d’autres langues locales.

## Suivi de livraison

- ETA estimée selon la distance, l’étape et la circulation ;
- carte légère du trajet adaptée aux connexions faibles ;
- position GPS du livreur actualisée quand le mode live est actif ;
- étapes : accepté, récupéré, en route, livré ;
- code de remise à quatre chiffres ;
- preuve photo possible ;
- confirmation de livraison acceptée avec le bon code ou une photo ;
- boutons SOS Bizzi et contact du support.

## Confiance

Chaque carte prestataire résume désormais : identité contrôlée ou à confirmer, avis vérifiés, taux d’acceptation estimé et nombre d’annulations. Les badges de vérification et le score de fiabilité existants sont conservés.

## Limite backend

La migration `supabase/migrations/215_delivery_tracking.sql` active la synchronisation des étapes, du code de remise et de la position du livreur entre plusieurs téléphones. La photo reste conservée localement dans cette version : un stockage privé Supabase devra être activé avant de synchroniser les photos, afin de ne jamais les exposer publiquement.
