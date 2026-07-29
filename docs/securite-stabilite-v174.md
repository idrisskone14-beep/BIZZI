# Sécurité et stabilité Bizzi V174

## Règles admin

- L'onglet admin reste masqué au public.
- Les validations réelles se font côté Supabase.
- Les actions sensibles doivent être confirmées dans l'admin.
- Les exports CSV doivent être gardés hors espace public.

## Anti-doublon

- Un même téléphone ne doit pas recréer plusieurs essais gratuits.
- Un même appareil avec inscription récente doit être orienté vers renouvellement.
- Les doublons Supabase doivent être inspectés avant nettoyage.

## Paiements

- Paiement manuel possible au lancement.
- Agrégateur requis avant grande ouverture.
- Chaque paiement doit avoir une référence.
- Les livraisons ne sont proposées aux livreurs qu'après paiement validé.

## Monitoring

- Garder l'ingestion erreurs active.
- Activer le monitoring externe dès qu'un compte est disponible.
- Vérifier les erreurs après chaque upload Cloudflare.

## Cache

- Après chaque ZIP Cloudflare, faire Purge Everything.
- Sur téléphone, fermer et rouvrir la PWA.
- Vérifier la version affichée dans l'admin.
