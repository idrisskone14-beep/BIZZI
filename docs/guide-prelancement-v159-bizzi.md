# Guide pre-lancement Bizzi - V159

Date : 8 juillet 2026

## Objectif

Mettre Bizzi en condition de test reel sans ouvrir trop vite a tout le public.

## Etape 1 - Publier la V159

1. Aller dans Cloudflare.
2. Ouvrir le Worker ou le projet qui sert Bizzi.
3. Uploader le fichier `bizzi-cloudflare-pages-v159-prelancement.zip`.
4. Aller dans Caching.
5. Faire `Purge everything`.
6. Ouvrir `https://bizzi-africa.com` sur telephone.

## Etape 2 - Tester le public

1. Ouvrir Bizzi sans compte.
2. Chercher un service.
3. Changer de ville.
4. Ouvrir une fiche prestataire.
5. Tester appel ou WhatsApp.
6. Tester une demande express.

## Etape 3 - Tester prestataire

1. Creer un prestataire test avec un vrai metier.
2. Verifier qu'il devient visible.
3. Verifier son metier cote client.
4. Creer un paiement forfait.
5. Valider le paiement dans l'admin.
6. Verifier la date d'abonnement.

## Etape 4 - Tester livraison

1. Ouvrir Bizzi Livraison.
2. Saisir quartier depart et quartier arrivee.
3. Verifier que le prix se calcule.
4. Verifier que les heures de pointe sont detectees automatiquement.
5. Verifier que la commission Bizzi de 15% apparait dans la logique admin.

## Etape 5 - Tester emplois et evenements

1. Creer une offre emploi ou mission.
2. Valider son affichage.
3. Creer un evenement avec ville, date debut, date fin et lien externe.
4. Verifier que l'evenement apparait dans la bonne ville.
5. Verifier que le bouton billet redirige hors de Bizzi.

## Etape 6 - Decision

Si tout fonctionne sur telephone pendant 24 a 48 heures, commencer le test terrain avec quelques prestataires reels.
