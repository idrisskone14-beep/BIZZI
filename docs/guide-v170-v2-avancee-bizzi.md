# Bizzi V170 - V2 technique avancee

Cette version ajoute les premiers modules techniques separés et le socle backend pour paiement, admin et erreurs.

## Ajouts

- Modules frontend :
  - `js/error-monitor.js`
  - `js/performance-monitor.js`
  - `js/payment-gateway.js`
  - `js/admin-guard.js`
- Backend Supabase :
  - `payment-checkout`
  - `payment-webhook`
  - `admin-actions`
  - `error-ingest`
- SQL :
  - `71-socle-paiement-v169-complet.sql`
  - `72-v2-backend-admin-observability-v170.sql`
- Tests :
  - smoke test
  - backend test
  - budget performance

## Marche a suivre

1. Uploader le ZIP V170 sur Cloudflare.
2. Purger le cache Cloudflare.
3. Executer le SQL 71 si necessaire.
4. Executer le SQL 72.
5. Deployer les Edge Functions Supabase.
6. Ajouter les variables d'environnement de l'agregateur.
7. Activer l'agregateur uniquement apres paiement test reussi.
