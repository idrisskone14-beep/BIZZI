# Bizzi V191 - Assistant de recherche vocale

## Objectif

La recherche Bizzi devient plus directe : le client peut écrire ou dicter son besoin, puis l'application ouvre automatiquement le bon parcours.

## Recherche de service

Quand le client demande un métier, Bizzi :

- détecte le service le plus probable ;
- sélectionne automatiquement la catégorie ;
- applique la ville reconnue si elle est mentionnée ;
- affiche directement les prestataires visibles dans le rayon choisi.

Exemples :

- "Je cherche une nounou à Cocody"
- "Plombier urgent à Yopougon"
- "Transitaire pour envoyer un colis en France"

## Livraison locale

Quand Bizzi détecte une livraison locale, l'application ouvre directement l'onglet Livraison et prépare la commande.

Exemple :

```text
Je veux livrer un colis de Cocody à Marcory maintenant.
```

Bizzi préremplit :

- lieu de récupération ;
- lieu de livraison ;
- type de colis ;
- ville si elle est reconnue ;
- urgence ;
- notes de la demande.

Le client vérifie le tarif calculé, puis valide la commande.

## Colis international et transitaires

Quand la demande parle d'Europe, France, diaspora, fret, douane ou transitaire, Bizzi reste strictement sur :

- Transport de colis international ;
- Transitaire.

Les livreurs locaux ne sont pas mélangés à ce parcours.

## Recherche vocale

La reconnaissance vocale dépend du navigateur du téléphone. Si le navigateur ne la permet pas, Bizzi affiche une alternative texte sans bloquer le parcours.

## Limites actuelles

La compréhension reste basée sur les mots-clés du catalogue Bizzi. Une vraie IA distante pourra plus tard améliorer la précision, mais cette V191 fonctionne déjà sans coût API supplémentaire.
