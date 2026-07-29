# Bizzi V172 - Intégrations externes prêtes

Cette version prépare les branchements réels sans exposer de secrets dans l'application publique.

## Ordre SQL

Exécuter dans Supabase :

1. `71-socle-paiement-v169-complet.sql`
2. `72-v2-backend-admin-observability-v170.sql`
3. `73-live-dispatch-push-antifraude-v171.sql`
4. `74-integrations-externes-v172.sql`

## Clés à renseigner hors application publique

Push VAPID :

- public : `notifications.vapidPublicKey` dans `config.js`
- privé : `BIZZI_VAPID_PRIVATE_KEY` dans Supabase Secrets

Paiement :

- `BIZZI_AGGREGATOR_PROVIDER`
- `BIZZI_AGGREGATOR_CHECKOUT_URL`
- `BIZZI_AGGREGATOR_API_KEY`
- `BIZZI_PAYMENT_WEBHOOK_SECRET`

Cartographie :

- `MAPBOX_ACCESS_TOKEN` dans Supabase Secrets
- endpoint déjà configuré : `/functions/v1/map-geocode`

Monitoring :

- `BIZZI_MONITORING_FORWARD_URL`
- `BIZZI_MONITORING_FORWARD_KEY`

## Tests

Utiliser `checklist-tests-terrain-v172.md` pour les tests téléphones.

Pour simuler une charge locale sans toucher au serveur :

```bash
node outputs/load-tests/bizzi-load-scenarios.js
```
