# Procédures intégrations externes V173

## VAPID / push

1. Générer une paire de clés :

```bash
node outputs/tools/generate-vapid-keys.js
```

2. Copier la clé publique dans `config.js`, champ `notifications.vapidPublicKey`.
3. Copier la clé privée dans Supabase Secrets uniquement :

```bash
supabase secrets set BIZZI_VAPID_PRIVATE_KEY="CLE_PRIVEE"
```

4. Mettre `notifications.enabled` à `true` seulement après test.

## Mapbox

1. Créer une clé Mapbox.
2. Restreindre la clé au projet Bizzi si possible.
3. La placer côté Supabase Secrets :

```bash
supabase secrets set MAPBOX_ACCESS_TOKEN="TOKEN"
```

4. Tester une livraison avec deux quartiers.

## Agrégateur paiement

1. Obtenir le compte marchand.
2. Demander l'URL checkout, la clé API et la configuration webhook.
3. Renseigner Supabase Secrets :

```bash
supabase secrets set BIZZI_AGGREGATOR_PROVIDER="NOM"
supabase secrets set BIZZI_AGGREGATOR_CHECKOUT_URL="URL"
supabase secrets set BIZZI_AGGREGATOR_API_KEY="CLE"
supabase secrets set BIZZI_PAYMENT_WEBHOOK_SECRET="SECRET"
```

4. Donner à l'agrégateur l'URL webhook :

`https://hqqppxnvorcnvksulhna.supabase.co/functions/v1/payment-webhook`

## Monitoring

1. Créer un compte Sentry, Better Stack ou Logtail.
2. Copier l'URL d'ingestion.
3. Renseigner :

```bash
supabase secrets set BIZZI_MONITORING_FORWARD_URL="URL"
supabase secrets set BIZZI_MONITORING_FORWARD_KEY="CLE_OPTIONNELLE"
```

4. Déclencher un test erreur puis appeler `monitoring-forwarder`.
