# Bizzi V67 - Offres emploi payantes

## Principe retenu

- Le chercheur d'emploi reste gratuit.
- L'entreprise ou le prestataire peut remplir l'offre.
- L'offre n'est envoyee en validation Bizzi qu'avec un forfait choisi et une reference de paiement.
- L'admin valide le paiement puis publie l'offre.

## Tarifs integres

- Offre simple 15 jours : 999 FCFA
- Offre standard 30 jours : 1 900 FCFA
- Offre boostee 30 jours : 4 900 FCFA
- Pack entreprise 5 offres : 9 900 FCFA

## Parcours de test

1. Uploader `bizzi-cloudflare-pages-v67.zip` sur Cloudflare.
2. Dans Supabase SQL Editor, executer `sql-copie-bizzi/26-emplois-payants-supabase.sql`.
3. Ouvrir `https://bizzi-africa.com`.
4. Aller dans `Emplois`.
5. Remplir une offre, choisir un forfait, choisir Wave / Orange Money / MTN Money.
6. Saisir une reference de paiement test.
7. Envoyer l'offre.
8. Aller dans l'admin : `https://bizzi-africa.com/admin-access`.
9. Cliquer sur `Charger validations Supabase`.
10. Dans `Offres emploi Supabase en attente`, cliquer sur `Valider paiement et publier`.
11. Cliquer sur `Importer public Supabase`.
12. Revenir dans `Emplois` et verifier que l'offre est visible.

## Logique de rentabilite

Le formulaire reste facile a remplir, mais Bizzi ne donne pas de visibilite gratuite aux recruteurs. Le paiement filtre les fausses annonces et cree une nouvelle source de revenu sans faire payer les candidats.
