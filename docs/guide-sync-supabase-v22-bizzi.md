# Guide synchronisation Supabase V22 - Bizzi

Date : 29 juin 2026

## But

Permettre à Bizzi de commencer à lire une vraie base Supabase tout en gardant une application utilisable localement.

## Configuration

Dans `bizzi-app/config.js`, renseigner :

```js
mode: "production",
supabase: {
  url: "https://votre-projet.supabase.co",
  anonKey: "votre-cle-anon-publique",
  publicProviderView: "public_provider_directory"
}
```

## Scripts SQL à exécuter avant test

1. `schema-bizzi.sql`
2. `supabase-production-bizzi.sql`
3. `supabase-seed-cote-ivoire-bizzi.sql`

## Bouton Tester Supabase

Ce bouton vérifie que l'application peut lire :

- `countries`
- `categories`

Si le test échoue, vérifier :

- URL Supabase ;
- clé anon ;
- connexion internet ;
- politiques RLS ;
- exécution des scripts SQL.

## Bouton Importer public Supabase

Ce bouton importe :

- `categories`
- `services`
- `public_provider_directory`
- `public_advertisements`

Les données importées remplacent les données locales publiques :

- catalogue de services ;
- liste des prestataires ;
- publicités actives.

Les données d'exploitation locales comme les exports, favoris et historiques restent sur l'appareil tant que l'écriture Supabase complète n'est pas branchée.

## Champs attendus pour les prestataires

La vue `public_provider_directory` doit exposer :

- `id`
- `full_name`
- `phone`
- `whatsapp`
- `photo_url`
- `description`
- `neighborhood`
- `latitude`
- `longitude`
- `visibility_status`
- `average_rating`
- `call_count`
- `is_verified`
- `city_name`
- `commune_name`
- `service_name`
- `category_name`
- `contact_visible`

## Champs attendus pour les publicités

La vue `public_advertisements` doit exposer :

- `id`
- `provider_id`
- `title`
- `body`
- `image_url`
- `starts_at`
- `ends_at`
- `city_name`
- `commune_name`
- `service_name`

## Règle de floutage

Si `visibility_status = 'expired_blurred'`, Bizzi garde visibles :

- photo ;
- métier ;
- ville ;
- note.

Bizzi masque :

- nom ;
- téléphone ;
- WhatsApp ;
- description détaillée ;
- lien direct vers le profil.

## Prochaine étape technique

Brancher l'écriture Supabase :

- création prestataire ;
- upload photo ;
- preuve de paiement ;
- validation paiement admin ;
- vérification prestataire ;
- signalements clients.
