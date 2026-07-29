# Checklist lancement Bizzi V174

## Avant ouverture publique

- Uploader le ZIP V174 sur Cloudflare Pages.
- Faire `Purge everything` dans Cloudflare.
- Ouvrir `https://bizzi-africa.com/?admin=1#admin` et vérifier la connexion admin.
- Cliquer sur `Importer public Supabase`.
- Cliquer sur `Charger validations Supabase`.
- Vérifier le tableau `Santé de l'application`.
- Vérifier le tableau `Mode lancement`.
- Vérifier le tableau `Revenus et conversions`.
- Vérifier le tableau `Livraisons`.

## Supabase

- Exécuter les scripts SQL dans l'ordre indiqué par `00-ordre-copie-sql-bizzi.md`.
- Exécuter `77-rapports-revenus-livraisons-v174.sql`.
- Tester `select public.bizzi_admin_finance_delivery_report();` depuis une session admin.
- Vérifier qu'aucune clé secrète n'est placée dans `config.js`.

## Tests indispensables

- Créer un prestataire neuf.
- Vérifier qu'il devient visible côté client.
- Tenter une deuxième inscription avec le même téléphone.
- Créer un paiement forfait.
- Valider le paiement dans l'admin.
- Créer une livraison locale.
- Copier les messages client/livreur depuis l'admin.
- Créer une offre emploi.
- Créer un événement et vérifier sa ville.

## Go / No-Go

Ouvrir publiquement seulement si :

- l'admin charge sans erreur ;
- les prestataires visibles apparaissent côté client ;
- les paiements manuels restent traçables ;
- les livraisons ont une référence claire ;
- les tests Android/iPhone passent ;
- les règles de modération sont comprises par l'équipe.
