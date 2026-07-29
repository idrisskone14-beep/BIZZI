# Guide V45 - Catalogue services elargi Bizzi

## Objectif

La V45 ajoute les services indispensables identifies pour la Cote d'Ivoire et l'Afrique, sans supprimer la liste existante.

## Categories ajoutees

- `Digital & Dépannage`
- `Santé & Assistance`
- `Agriculture & Rural`

## Services ajoutes dans les categories existantes

Maison & Travaux :

- Frigoriste / Climatisation
- Serrurier
- Maçon
- Carreleur
- Couvreur / Étanchéité
- Vitrier / Aluminium
- Jardinier / Paysagiste
- Nettoyage maison / bureau
- Nettoyage canapé / tapis / matelas
- Désinsectisation / Dératisation
- Technicien électroménager
- Installateur solaire / groupe électrogène
- Antenniste / TV satellite

Services à la personne :

- Pressing / Blanchisserie
- Courses / achats à domicile

Transports & Logistique :

- Remorquage / Dépannage auto
- Vulcanisateur / Pneus
- Carrossier / Peintre auto
- Lavage auto / moto
- Transport de marchandises
- Conducteur moto-taxi

Education & Formation :

- Formation informatique

Evénementiel :

- Traiteur / Cuisinier à domicile
- Décorateur événementiel
- Location sonorisation / lumière

Commerce & Immobilier :

- Aide démarches administratives
- Comptable / Fiscaliste
- Juriste / Conseil légal
- Courtier assurance
- Aide visa / voyage

## Services ajoutes dans les nouvelles categories

Digital & Dépannage :

- Réparateur téléphone
- Réparateur ordinateur / imprimante
- Installation Wi-Fi / caméra
- Assistance informatique
- Création site web / design
- Community manager

Santé & Assistance :

- Infirmier à domicile
- Garde-malade
- Kinésithérapeute
- Sage-femme
- Ambulance privée
- Livraison médicaments

Agriculture & Rural :

- Technicien pompe / forage
- Réparateur groupe électrogène
- Tractoriste / Labour
- Ouvrier agricole
- Transport de récoltes
- Vétérinaire / soins animaux
- Technicien irrigation
- Réparateur chambre froide

## SQL a copier dans Supabase

Dans Supabase SQL Editor :

1. Cliquer sur `New query`.
2. Copier le fichier `sql-copie-bizzi/18-catalogue-services-v45.sql`.
3. Cliquer sur `Run`.
4. Le resultat attendu peut etre `Success. No rows returned`.
5. Revenir dans Bizzi admin et cliquer sur `Importer public Supabase`.

Le fichier est non destructif : il ajoute ou reactive les services, mais ne supprime pas les anciens.
