# Bizzi V203 - Confiance, téléphone client et Bizzi SOS

## Ce qui change

- Le client ne crée toujours pas de compte.
- Son WhatsApp ou téléphone est demandé avant une recherche utile, l'ouverture d'une fiche ou une demande.
- Le numéro est ajouté aux demandes afin que les prestataires puissent rappeler le client si nécessaire.
- Les nouveaux services sont ajoutés au catalogue local et au script Supabase V203.
- Le filtre Bizzi SOS isole les métiers d'urgence : fuite, électricité, serrure, dépannage auto/moto, livraison, santé à domicile.

## Nouveaux services ajoutés

- Agence événementielle / organisateur événements
- Fleuriste
- Coach tennis
- Coach Golf
- Guide touristique
- Achat Or et pierre
- Tatouage
- Aide ménage / agence de placement
- Architecte / décorateur professionnel
- Dépannage moto

## Script Supabase

Exécuter dans Supabase SQL Editor :

`sql-copie-bizzi/90-services-confiance-sos-v203.sql`

Ce script ajoute ou réactive les services dans les bonnes catégories.

## Logique produit recommandée

La promesse Bizzi doit rester simple :

**Trouver le bon professionnel près de chez soi en moins de 2 minutes.**

Les priorités à renforcer avant ouverture large :

- badge Prestataire vérifié Bizzi ;
- numéro vérifié ;
- avis certifiés ;
- délai moyen de réponse ;
- nombre de missions réalisées ;
- niveaux Bronze, Argent, Or et Diamant ;
- Bizzi SOS pour les urgences dans un rayon proche.

## À tester

1. Ouvrir l'onglet Services.
2. Saisir un besoin sans téléphone : Bizzi doit demander le numéro.
3. Saisir un téléphone valide puis rechercher `fleuriste`, `coach golf`, `architecte`, `tatouage` ou `dépannage moto`.
4. Activer le filtre Bizzi SOS et vérifier que les services d'urgence restent prioritaires.
5. Ouvrir une fiche prestataire : le message WhatsApp doit inclure le contact client.
