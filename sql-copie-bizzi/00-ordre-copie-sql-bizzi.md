# Ordre de copie SQL - Bizzi

Copier un seul fichier à la fois dans Supabase SQL Editor, puis cliquer sur `Run`.

## Ordre exact

1. `01-schema-types-et-tables.sql`
2. `02-schema-triggers-fonctions-index.sql`
3. `03-schema-donnees-de-base.sql`
4. `04-production-securite-vues.sql`
5. `05-production-storage-admin.sql`
6. `06-seed-villes-cote-ivoire.sql`
7. `07-seed-services-cote-ivoire.sql`
8. `08-correction-rls-soumission-publique.sql`
9. `09-correction-rls-provider-simple.sql`
10. `11-admin-validation-supabase.sql`
11. `12-template-creer-admin-bizzi.sql`
12. `13-creer-admin-bizzi-rempli.sql`
13. `14-activer-essai-gratuit-admin.sql`
14. `15-avis-clients-supabase.sql`
15. `16-demandes-express-supabase.sql`
16. `17-priorite-demandes-express.sql`
17. `18-catalogue-services-v45.sql`
18. `19-service-colis-international.sql`
19. `25-emplois-missions-supabase.sql`
20. `26-emplois-payants-supabase.sql`
21. `27-services-finance-immobilier-sport.sql`
22. `28-service-imprimeur.sql`
23. `29-diagnostic-prestataire-imprimeur.sql`
24. `30-lier-jeanlou-imprimeur.sql`
25. `31-lier-serena-imprimeur.sql`
26. `32-correction-maabio-nounou.sql`
27. `33-fusion-categorie-services-personne.sql`
28. `34-correction-demandes-express.sql`
29. `35-lier-coco-gauff-immobilier.sql`
30. `41-correction-creation-prestataire-admin.sql`
31. `42-correction-activation-mois-gratuit-v89.sql`
32. `43-correction-doublons-paiements-v90.sql`
33. `44-diagnostic-amad-diallo-detective-v91.sql`
34. `45-rattrapage-madame-adicko-v93.sql`
35. `46-auto-activation-nouveaux-prestataires-v95.sql`
36. `47-auto-activation-et-rattrapage-v96.sql`
37. `48-liaison-metier-creation-v97.sql`
38. `49-socle-definitif-activation-metier-v98.sql`

## Validation du prestataire test

Apres le test complet, executer uniquement si Codex le demande :

Test. `10-valider-test-prestataire-bizzi.sql`

## Si Supabase affiche une erreur

Arrêter à l'étape où l'erreur apparaît et envoyer le message exact.

## Après succès

Aller dans `Table Editor` et vérifier que les tables Bizzi existent :

- `providers`
- `services`
- `categories`
- `payments`
- `advertisements`
- `reports`
- `cities`
- `provider_reviews`
- `express_requests`
- `job_offers`

Le fichier `17-priorite-demandes-express.sql` ajoute les colonnes de priorite sur `express_requests`.

Le fichier `18-catalogue-services-v45.sql` ajoute les nouveaux services indispensables sans effacer les services existants.

Le fichier `19-service-colis-international.sql` ajoute le service `Transport de colis international` dans `Transports & Logistique`.

Le fichier `25-emplois-missions-supabase.sql` ajoute les offres d'emploi et missions avec validation admin.

Le fichier `26-emplois-payants-supabase.sql` rend le paiement obligatoire avant validation d'une offre emploi.

Le fichier `27-services-finance-immobilier-sport.sql` ajoute `Prêt financier`, `Vendeur de terrains et biens immobiliers` et `Clubs de foot`.

Le fichier `28-service-imprimeur.sql` ajoute `Imprimeur` dans `Evénementiel`.

Le fichier `29-diagnostic-prestataire-imprimeur.sql` aide a retrouver un prestataire imprimeur dans Supabase sans modifier la base.

Le fichier `30-lier-jeanlou-imprimeur.sql` lie Jeanlou au service `Imprimeur` et active son mois gratuit si besoin.

Le fichier `31-lier-serena-imprimeur.sql` lie Serena au service `Imprimeur` et active son mois gratuit si besoin.

Le fichier `32-correction-maabio-nounou.sql` lie Maabio au service `Nounou`, garde le mois gratuit actif et masque les doublons Maabio crees par erreur.

Le fichier `33-fusion-categorie-services-personne.sql` fusionne le doublon `Services à la Personne` vers `Services à la personne` si la categorie existe deux fois.

Le fichier `34-correction-demandes-express.sql` complete la table `express_requests` et fiabilise le traitement admin des demandes express.

Le fichier `35-lier-coco-gauff-immobilier.sql` lie Coco Gauff au service `Vendeur de terrains et biens immobiliers` et garde son mois gratuit actif.

Le fichier `41-correction-creation-prestataire-admin.sql` fiabilise l'apparition des nouveaux prestataires dans l'admin Supabase.

Le fichier `42-correction-activation-mois-gratuit-v89.sql` fiabilise le bouton `Activer mois gratuit Supabase`.

Le fichier `43-correction-doublons-paiements-v90.sql` rejette les doublons de paiements en attente apres validation.

Le fichier `44-diagnostic-amad-diallo-detective-v91.sql` rattrape Amad Diallo et le service `Détective privé(e)`.

Le fichier `45-rattrapage-madame-adicko-v93.sql` rattrape Madame Adicko si l'activation reste bloquee apres la V93.

Le fichier `46-auto-activation-nouveaux-prestataires-v95.sql` active automatiquement le mois gratuit des nouveaux prestataires, sans validation admin initiale.

Le fichier `47-auto-activation-et-rattrapage-v96.sql` installe l'auto-activation et rattrape les prestataires deja bloques en attente.

Le fichier `48-liaison-metier-creation-v97.sql` fiabilise la liaison du metier choisi lors de la creation d'un nouveau prestataire.

Le fichier `49-socle-definitif-activation-metier-v98.sql` remplace les scripts 47 et 48 : il installe l'activation definitive, le rattrapage et la liaison metier fiable.

## Socle technique recent

Executer ces scripts dans l'ordre si la base doit recevoir les fonctions modernes :

1. `71-socle-paiement-v169-complet.sql`
2. `72-v2-backend-admin-observability-v170.sql`
3. `73-live-dispatch-push-antifraude-v171.sql`
4. `74-integrations-externes-v172.sql`
5. `75-diagnostic-global-rapports-v173.sql`
6. `76-nettoyage-doublons-prestataires-v173.sql`
7. `77-rapports-revenus-livraisons-v174.sql`

Le fichier `74-integrations-externes-v172.sql` prepare les tables de suivi pour VAPID/push, cartographie reelle, monitoring, tests terrain et montee en charge.

Le fichier `75-diagnostic-global-rapports-v173.sql` ajoute le rapport admin global.

Le fichier `76-nettoyage-doublons-prestataires-v173.sql` ajoute le diagnostic doublons et un nettoyage prudent en mode aperçu par défaut.

Le fichier `77-rapports-revenus-livraisons-v174.sql` ajoute les rapports revenus, livraisons, commissions et snapshots financiers.

## Modules recents a ajouter selon les fonctions actives

- `90-services-confiance-sos-v203.sql` ajoute les services confiance, SOS et les nouveaux metiers.
- `91-bizzi-food-v204.sql` ajoute Bizzi Food : bonnes adresses, specialites, vue publique et bucket `food-photos`.

## Si la creation prestataire affiche une erreur RLS

Executer uniquement le fichier `08-correction-rls-soumission-publique.sql`, puis refaire le test dans Bizzi.

Si le blocage RLS persiste sur `providers`, executer ensuite `09-correction-rls-provider-simple.sql`.
