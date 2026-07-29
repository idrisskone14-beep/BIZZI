# Bizzi V171 - Temps réel livraison

Cette version prépare la livraison temps réel :

- position live livreur ;
- dispatch automatique ;
- push notifications ;
- anti-fraude ;
- centre opérationnel admin ;
- alertes serveur.

## SQL à exécuter

1. `71-socle-paiement-v169-complet.sql`
2. `72-v2-backend-admin-observability-v170.sql`
3. `73-live-dispatch-push-antifraude-v171.sql`

## Fonctions Supabase à déployer

- `location-live`
- `delivery-dispatch`
- `push-subscribe`
- `push-notify`
- `server-alerts`

## Points encore dépendants d'API

- vraie clé VAPID pour push réel ;
- fournisseur push ou envoi Web Push complet ;
- agrégateur paiement officiel ;
- API cartographique complète.

En attendant, Bizzi garde les alertes locales et prépare toutes les données côté Supabase.
