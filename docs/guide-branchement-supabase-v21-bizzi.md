# Guide branchement Supabase V21 - Bizzi

Date : 29 juin 2026

## But

Remplacer progressivement le stockage local du prototype par une vraie base Supabase.

## Prérequis

- Compte Supabase.
- Nouveau projet Supabase.
- Accès à SQL Editor.
- URL du projet.
- Clé anon publique.
- Clé service role gardée uniquement côté serveur.

## Etape 1 - Créer la base

Dans SQL Editor, exécuter :

1. `schema-bizzi.sql`
2. `supabase-production-bizzi.sql`
3. `supabase-seed-cote-ivoire-bizzi.sql`

Après exécution, vérifier la présence des tables :

- `countries`
- `cities`
- `communes`
- `categories`
- `services`
- `providers`
- `provider_services`
- `subscription_plans`
- `payments`
- `advertisements`
- `reports`
- `admin_profiles`

## Etape 2 - Configurer les fichiers

Dans `bizzi-app/config.js`, passer :

```js
mode: "production"
```

Puis renseigner :

```js
supabase: {
  url: "https://votre-projet.supabase.co",
  anonKey: "votre-cle-anon-publique"
}
```

## Etape 3 - Préparer le stockage images

Créer ces buckets dans Supabase Storage :

- `provider-photos`
- `provider-proofs`
- `advertisements`

Règle recommandée :

- lecture publique uniquement pour les images validées ;
- écriture réservée aux prestataires authentifiés ou à l'admin ;
- preuves de paiement visibles seulement par le prestataire concerné et l'admin.

## Etape 4 - Brancher les lectures publiques

Le client doit lire sans compte :

- les catégories ;
- les services ;
- les villes ;
- les publicités actives ;
- les prestataires approuvés via `public_provider_cards` ou `public_provider_directory`.

Les fiches expirées doivent rester visibles de façon limitée :

- métier visible ;
- photo visible ;
- coordonnées masquées ;
- nom et détails de contact masqués.

## Etape 5 - Brancher le prestataire

Le prestataire doit pouvoir :

- créer son profil ;
- ajouter une photo ;
- choisir ses services ;
- envoyer une preuve de paiement ;
- consulter son statut ;
- renouveler son abonnement.

Le client, lui, ne doit pas être obligé de créer un compte.

## Etape 6 - Brancher l'admin

L'admin doit pouvoir :

- valider ou refuser les prestataires ;
- vérifier un prestataire ;
- valider ou refuser les paiements ;
- traiter les signalements ;
- activer, flouter ou suspendre une fiche ;
- exporter les données.

## Etape 7 - Paiements

Pour le lancement :

1. Garder `manual_validation`.
2. Recevoir les paiements sur Wave, Orange Money ou MTN Money.
3. L'admin valide le paiement.
4. La base appelle `approve_payment(payment_uuid)`.

Quand les API sont disponibles :

1. Passer en `provider_api`.
2. Recevoir les callbacks de paiement.
3. Valider automatiquement la transaction.
4. Prolonger automatiquement l'abonnement.

## Tests de validation

- Un client voit les prestataires sans compte.
- Un prestataire expiré apparaît flouté.
- Un prestataire actif affiche téléphone et WhatsApp.
- Un paiement validé prolonge l'abonnement.
- Un paiement refusé ne change pas la visibilité.
- Les publicités expirées disparaissent.
- L'admin ne peut être ouvert que par l'entrée réservée.
