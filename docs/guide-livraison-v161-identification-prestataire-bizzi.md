# Bizzi V161 - Identification prestataire et anti-doublon

Date : 9 juillet 2026

## Correction produit

L'onglet `Prestataire` affiche maintenant une question claire :

- `Je m'inscris`
- `Deja prestataire`

Un prestataire deja inscrit peut saisir son telephone ou WhatsApp pour retrouver son profil et renouveler son abonnement.

## Anti-doublon

Avant de creer un nouveau profil, Bizzi verifie :

- le telephone saisi ;
- le WhatsApp saisi ;
- les prestataires deja importes localement ;
- les prestataires publics Supabase disponibles.

Si le numero existe deja, Bizzi bloque la creation et redirige vers le renouvellement.

## Protection Supabase recommandee

Executer dans Supabase SQL Editor :

`sql-copie-bizzi/68-anti-doublon-prestataires-v161.sql`

Ce script bloque les futurs doublons meme si le numero est ecrit avec espaces, tirets ou sans le signe `+`.

Il ajoute aussi une fonction de recherche de renouvellement, afin qu'un prestataire puisse retrouver son profil par telephone meme lorsque ses coordonnees publiques sont masquees.

## Limite normale

Une personne qui utilise volontairement un autre numero peut encore essayer de contourner le mois gratuit. Pour reduire ce risque, demander progressivement :

- une piece justificative ;
- un numero WhatsApp verifie ;
- une validation admin en cas de doute ;
- un badge verifie pour les prestataires importants.

## Publication

1. Uploader `bizzi-cloudflare-pages-v161-identification-prestataire.zip`.
2. Faire `Purge everything` dans Cloudflare.
3. Tester un ancien numero prestataire.
4. Verifier que Bizzi propose le renouvellement au lieu d'un nouveau compte.
