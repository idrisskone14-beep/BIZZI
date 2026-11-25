# Migration vers une seule base Neon (zeyds-prod, Francfort)

Reunit dans `zeyds-prod` (Neon, aws-eu-central-1, projet `wispy-lake-57834776`) :

- tout `bizzi-db` (Neon, Oregon), la base vivante de l'app ;
- ce qui n'existait que sur Supabase (`bizzi-production`) : Zeyds Cash, Market, Ride, situations, reglages, push.

Etat au 2026-11-25 : premiere copie faite et verifiee (nombres de lignes identiques, Zeyds Cash identique au centime).
L'app utilise toujours bizzi-db et Supabase : il faudra rejouer les donnees le jour de la bascule.

## Prerequis

Fichier `.env` dans ce dossier (jamais commite, voir `.gitignore`), avec les chaines de connexion
directes (sans `-pooler`) donnees par la console Neon :

```text
SOURCE_URL=postgresql://...bizzi-db...?sslmode=verify-full
TARGET_URL=postgresql://...zeyds-prod...?sslmode=verify-full
```

Puis `npm install`.

## Jour de la bascule

Deroule complet, verifications et retour arriere : **[JOUR-J.md](JOUR-J.md)**.

- `node bascule.mjs --confirmer` enchaine : export Supabase frais (`export-supabase.mjs`), recopie
  de bizzi-db (`copy-neon.mjs data` + `verify`), donnees Supabase (`add-supabase.mjs data`),
  verification stricte (`verif-supabase.mjs`, Zeyds Cash compris), liaison des admins
  (`link-admins.mjs`), remise a zero des abonnements push. S'arrete au premier ecart.
- Repetition sans risque : `TARGET_URL=<branche Neon> node bascule.mjs --repetition`.
- Apres la bascule : `node rattrapage.mjs` recupere les lignes ecrites sur l'ancien systeme apres
  l'instantane (ajout seulement, jamais d'ecrasement).

## Data API et Neon Auth (en place depuis le 2026-11-25)

- Data API : `https://ep-dry-night-bgn2xvtv.apirest.c-9.eu-central-1.aws.neon.tech/neondb/rest/v1`.
  Chaque requete porte un JWT : visiteur = jeton anonyme (`/token/anonymous`, role `anonymous`,
  qui herite du role `anon` copie de Supabase) ; admin = jeton Neon Auth (role `authenticated`).
- Neon Auth : `https://ep-dry-night-bgn2xvtv.neonauth.c-9.eu-central-1.aws.neon.tech/neondb/auth`.
  Inscriptions publiques fermees, plugin organisations desactive. Comptes admin crees a la main
  (3, sans mot de passe) : chaque admin choisit le sien via « Premiere connexion » (code par e-mail).
- `auth.uid()` est celui de Neon (pg_session_jwt) : les 45 policies qui l'utilisent ont ete recreees
  (`auth-swap.mjs`), les droits du role `authenticated` copie de Supabase transferes au role Neon
  (`role-transfer.mjs`). `auth.role()` n'existe pas chez Neon : seule `process_market_expirations`
  l'utilisait, corrigee (`fix-market.mjs`).
- `link-admins.mjs` relie `admin_profiles.auth_user_id` aux comptes Neon Auth (par e-mail).
- Cote app : `js/zeyds-neon-auth.js` + `BizziConfig.neon`. Test sans bascule : `?backend=neon`.

## Reste a faire

- 12 cles etrangeres vers `auth.users` (tables Market, Ride, pricing_quotes, service_request_*,
  toutes vides) volontairement non recreees : `auth.users` n'existe pas chez Neon, et lier des tables
  a `neon_auth."user"` (geree par Neon) pourrait bloquer la suppression d'un compte. A revoir si ces
  modules sont actives.
- `private.zeyds_broadcast_ride_change` utilise Supabase Realtime : a remplacer (module Ride vide).
- Les policies Supabase « smart request » sur `express_requests` n'ont pas ete reprises : Neon garde
  les siennes, qui sont celles de l'app en production.
## Fonctions Vercel (dossier api/, region fra1) et Vercel Blob

| Route | Remplace | Base / stockage |
|---|---|---|
| `POST /api/upload` | Supabase Storage | Blob public `zeyds-photos` (photos), Blob prive `zeyds-justificatifs` (preuves) |
| `GET /api/private-file?path=` | (rien : pas de lecture des preuves avant) | Blob prive, admins Neon Auth seulement |
| `POST /api/map-geocode` | Render `bizzi-backend` + Supabase `map-geocode` | journal `map_lookup_events` |
| `POST /api/push-subscribe`, `/api/push-notify` | Supabase `push-*` | `push_subscriptions` |
| `POST /api/sms-notify` | (nouveau) | `sms_log`, LeTexto |

Actives seulement en mode Neon (`ZeydsNeon.endpoint()`), meme domaine que le site (pas de CORS).
Tests contre la vraie base : `node --test functions.test.mjs` (dans ce dossier).

Les 8 photos de Supabase Storage ne sont referencees par aucune ligne (ni Supabase ni Neon) :
aucune adresse a reecrire ; elles sont sauvegardees dans `backups/supabase-2026-11-25/photos`.

Variables Vercel deja posees : `DATABASE_URL` (secrete), `NEON_AUTH_JWKS_URL`, `NEON_AUTH_ISSUER`,
`VAPID_PUBLIC_KEY`, `BLOB_READ_WRITE_TOKEN` (stockage public). A poser par le proprietaire :
`PRIVATE_BLOB_READ_WRITE_TOKEN` (relier `zeyds-justificatifs` au projet avec le prefixe
`PRIVATE_BLOB`), `VAPID_PRIVATE_KEY`, `MAPBOX_ACCESS_TOKEN` (optionnel, sinon OpenStreetMap),
`LETEXTO_API_KEY` (+ `smsEnabled: true` dans config.js).

Pas encore portees : `payment-checkout` / `payment-webhook` (paiements desactives, aucun
prestataire choisi) et `ride-service` (module courses vide, depend de Supabase Realtime). Leur code
est conserve dans `supabase/functions/` pour reference.
