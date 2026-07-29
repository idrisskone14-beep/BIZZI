# Bizzi V169 - V2 technique prudente

Objectif : commencer la vraie phase technique sans casser la version stable deja en ligne.

## Ajouts

- Module separe `js/storage-safe.js` pour le stockage navigateur.
- Tests automatiques avec `npm test`.
- Webhook Supabase Edge Function pret pour un agregateur de paiement.
- Tables de trace paiement : `payment_webhook_events` et `payment_transactions`.
- Aucun secret backend dans les fichiers publics.

## Prochaine bascule paiement

1. Choisir l'agregateur.
2. Executer `sql-copie-bizzi/71-socle-paiement-v169-complet.sql`.
3. Deployer `outputs/supabase/functions/payment-webhook`.
4. Configurer les variables d'environnement backend.
5. Faire un paiement test avec une reference Bizzi.
