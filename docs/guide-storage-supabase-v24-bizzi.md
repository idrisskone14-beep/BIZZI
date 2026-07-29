# Guide Storage Supabase V24 - Bizzi

Date : 29 juin 2026

## But

Préparer le stockage des fichiers nécessaires à Bizzi.

## Scripts à exécuter

Dans Supabase SQL Editor, exécuter ou réexécuter :

1. `schema-bizzi.sql`
2. `supabase-production-bizzi.sql`
3. `supabase-seed-cote-ivoire-bizzi.sql`

Le fichier `supabase-production-bizzi.sql` crée les buckets Storage et les politiques nécessaires.

## Buckets créés

| Bucket | Public | Utilité |
| --- | --- | --- |
| `provider-photos` | oui | Photos visibles des prestataires |
| `advertisements` | oui | Images des publicités locales |
| `provider-proofs` | non | Justificatifs pour badge vérifié |
| `payment-proofs` | non | Preuves de paiement |

## Configuration app

Dans `bizzi-app/config.js`, vérifier :

```js
supabase: {
  url: "https://votre-projet.supabase.co",
  anonKey: "votre-cle-anon-publique",
  publicProviderView: "public_provider_directory",
  storage: {
    providerPhotos: "provider-photos",
    verificationProofs: "provider-proofs",
    paymentProofs: "payment-proofs",
    advertisements: "advertisements"
  }
}
```

## Tests à faire

1. Ouvrir `bizzi-app/admin.html`.
2. Cliquer sur `Tester Supabase`.
3. Aller dans `Proposer vos services`.
4. Créer un prestataire avec une photo.
5. Ajouter un justificatif badge.
6. Ajouter une image de publicité courte.
7. Envoyer un paiement avec preuve.
8. Vérifier dans Supabase Storage que les fichiers sont bien créés.
9. Vérifier dans les tables que les chemins/URLs sont enregistrés.

## Règle de confidentialité

Les buckets publics ne doivent contenir que des images destinées à être vues par les clients.

Les preuves et justificatifs doivent rester privés.

## Limite actuelle

La lecture des preuves privées par l'admin depuis l'application demande une vraie authentification admin Supabase. En attendant, les preuves peuvent être vérifiées depuis le tableau de bord Supabase.
