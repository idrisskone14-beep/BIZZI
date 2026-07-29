# Procédures intégrations Bizzi V174

## Push VAPID

1. Générer les clés avec :

```bash
node outputs/tools/generate-vapid-keys.js
```

2. Mettre la clé publique dans `config.js`, champ `notifications.vapidPublicKey`.
3. Mettre la clé privée uniquement dans Supabase Secrets :

```bash
supabase secrets set BIZZI_VAPID_PRIVATE_KEY="CLE_PRIVEE"
```

4. Activer `notifications.enabled` après un test sur Android et iPhone.

## Agrégateur paiement

1. Ouvrir un compte marchand chez l'agrégateur choisi.
2. Demander : clé API, URL checkout, secret webhook, documentation callback.
3. Renseigner côté Supabase seulement :

```bash
supabase secrets set BIZZI_AGGREGATOR_PROVIDER="NOM_AGREGATEUR"
supabase secrets set BIZZI_AGGREGATOR_CHECKOUT_URL="URL_CHECKOUT"
supabase secrets set BIZZI_AGGREGATOR_API_KEY="CLE_API"
supabase secrets set BIZZI_PAYMENT_WEBHOOK_SECRET="SECRET_WEBHOOK"
```

4. Transmettre cette URL webhook à l'agrégateur :

`https://hqqppxnvorcnvksulhna.supabase.co/functions/v1/payment-webhook`

5. Tester un paiement de faible montant avant ouverture.

## Cartographie Mapbox

1. Créer une clé Mapbox.
2. Restreindre la clé au projet Bizzi si possible.
3. Renseigner :

```bash
supabase secrets set MAPBOX_ACCESS_TOKEN="TOKEN_MAPBOX"
```

4. Tester deux quartiers connus d'Abidjan, puis Bouaké et Yamoussoukro.

## Monitoring

1. Créer un compte Sentry, Better Stack ou Logtail.
2. Copier l'URL d'ingestion.
3. Renseigner :

```bash
supabase secrets set BIZZI_MONITORING_FORWARD_URL="URL_INGESTION"
supabase secrets set BIZZI_MONITORING_FORWARD_KEY="CLE_OPTIONNELLE"
```

4. Déclencher une erreur test et vérifier qu'elle apparaît dans le dashboard du fournisseur.

## Tests de charge

Le test local préparé ne touche pas le serveur :

```bash
node outputs/load-tests/bizzi-load-scenarios.js
```

Un vrai test de charge externe doit être fait seulement après validation Cloudflare/Supabase pour éviter un blocage automatique.
