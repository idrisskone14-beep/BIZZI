# Guide production réelle - Bizzi

Date : 29 juin 2026

## Réponse courte

Oui, je peux préparer la production de Bizzi : code, configuration, documents, structure de base de données, checklist, paquet de livraison et accompagnement étape par étape.

La publication réelle demandera quand même tes comptes officiels : Google Play, Apple Developer, Supabase, domaine, comptes marchands Wave, Orange Money et MTN Money. Sans ces accès, je peux préparer le terrain, mais je ne peux pas publier légalement l'application à ta place.

## Production recommandée pour Bizzi

Pour lancer vite en Côte d'Ivoire, la meilleure approche est :

1. PWA web installable pour test terrain.
2. Base Supabase/PostgreSQL pour centraliser les données.
3. Paiement manuel vérifié par admin au démarrage.
4. Paiement API mobile money quand les comptes marchands sont validés.
5. Publication Android en priorité.
6. Publication iOS ensuite.

## Architecture cible

- Frontend : PWA Bizzi actuelle, puis emballage mobile Android/iOS.
- Base de données : Supabase PostgreSQL.
- Stockage : Supabase Storage pour photos prestataires, preuves et publicités.
- Authentification : client sans compte, prestataire avec téléphone, admin protégé.
- Paiements : Wave, Orange Money, MTN Money.
- Géolocalisation : GPS client + villes/communes de Côte d'Ivoire.
- Admin : validation prestataire, abonnement, floutage, signalements, exports.
- Légal : confidentialité, conditions d'utilisation, modération, suppression des données.

## Phases de production

### Phase 1 - Pré-production

- Finaliser le design et les textes.
- Tester tous les parcours localement.
- Vérifier le floutage après expiration.
- Valider les forfaits : 999 FCFA, 4 900 FCFA, 9 900 FCFA.
- Valider les catégories et services.

### Phase 2 - Backend réel

- Créer le projet Supabase.
- Exécuter les scripts SQL livrés.
- Créer les buckets images.
- Brancher l'application à Supabase.
- Remplacer les données locales par des données serveur.

### Phase 3 - Paiements

- Démarrer avec validation manuelle admin.
- Ajouter les numéros ou comptes marchands officiels.
- Préparer les reçus et références de paiement.
- Brancher les API quand elles sont disponibles.
- Automatiser la prolongation d'abonnement.

### Phase 4 - Test terrain

- Tester avec vrais prestataires dans plusieurs zones.
- Vérifier que les clients trouvent bien les prestataires proches.
- Vérifier les contacts générés par Bizzi.
- Mesurer les services les plus recherchés.
- Corriger les blocages avant publication nationale.

### Phase 5 - Publication

- Préparer les captures d'écran.
- Finaliser la politique de confidentialité.
- Préparer la fiche Google Play.
- Préparer la fiche App Store.
- Soumettre Android.
- Soumettre iOS.

## Ce que je peux faire sans accès externe

- Continuer l'application PWA.
- Préparer les fichiers de configuration.
- Préparer les scripts Supabase.
- Préparer les documents de publication.
- Préparer les textes Google Play et App Store.
- Générer les archives livrables.
- Vérifier la cohérence produit.

## Ce qui demande tes accès

- Créer et configurer le vrai projet Supabase.
- Recevoir les clés API de paiement.
- Créer les comptes Google Play et Apple Developer.
- Acheter ou configurer le domaine.
- Valider les informations légales de l'entreprise.
- Publier officiellement sur les stores.

## Décision recommandée

Lancer d'abord une version pilote PWA en Côte d'Ivoire, avec paiement manuel. Cette étape permet de recruter les premiers prestataires, tester la demande réelle, puis automatiser les paiements et publier sur les stores avec moins de risque.
