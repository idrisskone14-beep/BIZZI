# Guide écriture Supabase V23 - Bizzi

Date : 29 juin 2026

## But

Permettre aux parcours prestataire et client d'envoyer des données vers Supabase, tout en gardant un fonctionnement local si la base n'est pas encore prête.

## Fichiers concernés

- `bizzi-app/app.js`
- `bizzi-app/config.js`
- `supabase-production-bizzi.sql`
- `schema-bizzi.sql`
- `supabase-seed-cote-ivoire-bizzi.sql`

## Préparation Supabase

Exécuter dans cet ordre :

1. `schema-bizzi.sql`
2. `supabase-production-bizzi.sql`
3. `supabase-seed-cote-ivoire-bizzi.sql`

Puis renseigner dans `bizzi-app/config.js` :

```js
mode: "production",
supabase: {
  url: "https://votre-projet.supabase.co",
  anonKey: "votre-cle-anon-publique",
  publicProviderView: "public_provider_directory"
}
```

## Données envoyées

### Inscription prestataire

Tables :

- `providers`
- `provider_services`
- `advertisements` si une publicité est renseignée

Statuts :

- prestataire : `pending`
- visibilité : `trial`
- publicité : `pending`

### Paiement

Table :

- `payments`

Statut :

- `pending`

Le paiement est validé plus tard par l'admin.

### Signalement client

Table :

- `reports`

Statut :

- `open`

## Politiques RLS MVP

La V23 ajoute des politiques de soumission publique limitées :

- le public peut proposer un prestataire en `pending` ;
- le public peut joindre un service à ce prestataire ;
- le public peut envoyer un paiement en `pending` ;
- le public peut proposer une publicité en `pending` ;
- le public peut envoyer un signalement en `open`.

Ces politiques ne donnent pas accès aux validations admin.

## À vérifier après configuration

1. Ouvrir `bizzi-app/admin.html`.
2. Cliquer sur `Tester Supabase`.
3. Créer un prestataire depuis l'onglet `Pro`.
4. Vérifier dans Supabase que le prestataire apparaît en `pending`.
5. Envoyer un paiement.
6. Vérifier que le paiement apparaît en `pending`.
7. Ouvrir une fiche prestataire importée depuis Supabase.
8. Envoyer un signalement.
9. Vérifier que le signalement apparaît en `open`.

## Prochaine étape

Brancher Supabase Storage pour :

- photo prestataire ;
- justificatif badge vérifié ;
- preuve de paiement ;
- image publicitaire.
