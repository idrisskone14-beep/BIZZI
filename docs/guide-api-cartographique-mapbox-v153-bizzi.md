# Guide Bizzi - API cartographique Mapbox

Objectif : permettre a Bizzi Livraison de calculer une vraie distance de trajet entre deux quartiers ou adresses, au lieu d'utiliser seulement l'estimation interne.

## 1. Creer un compte Mapbox

Allez sur https://account.mapbox.com/ puis creez un compte Mapbox.

## 2. Creer un token public dedie a Bizzi

Dans Mapbox, ouvrez Access tokens puis creez un nouveau token public.

Important : ne pas utiliser le token public par defaut. Creez un token dedie a Bizzi.

## 3. Restreindre le token au domaine Bizzi

Ajoutez une restriction d'URL pour :

```text
https://bizzi-africa.com/*
https://www.bizzi-africa.com/*
```

Cela evite qu'une autre personne utilise votre token depuis un autre site.

## 4. Ajouter le token dans Bizzi

Dans `outputs/bizzi-app/config.js`, remplacez :

```js
mapboxAccessToken: "",
```

par :

```js
mapboxAccessToken: "VOTRE_TOKEN_PUBLIC_MAPBOX",
```

Gardez :

```js
provider: "mapbox",
country: "ci",
language: "fr",
```

## 5. Recharger la version sur Cloudflare

Apres modification de `config.js`, creez un nouveau ZIP de l'application et uploadez-le sur Cloudflare Pages.

## 6. Tester

Dans Bizzi Livraison, testez par exemple :

- Recuperation : Cocody Riviera 2
- Livraison : Marcory Zone 4

Si le token est actif, le resume du tarif affichera `Distance API carte`.
Si l'API ne repond pas, Bizzi garde l'estimation interne automatiquement.
