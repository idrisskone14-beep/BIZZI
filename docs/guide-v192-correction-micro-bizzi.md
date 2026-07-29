# Bizzi V207 - Microphone IA fiabilisé

## Ce qui change

Le bouton Micro de la recherche Bizzi est plus robuste :

- il affiche clairement quand le micro écoute ;
- il revient toujours à son état normal après une erreur ;
- il explique si le navigateur bloque la voix ;
- il garde la saisie texte comme secours immédiat ;
- il évite plusieurs écoutes lancées en même temps.

## Test conseillé

Tester la voix depuis l'adresse HTTPS publique :

```text
https://bizzi-africa.com/#search
```

Le test en fichier local peut bloquer le micro selon le navigateur.

## Exemples à dicter

- "Je cherche une nounou à Cocody"
- "Plombier urgent à Yopougon"
- "Livrer un colis de Cocody à Marcory maintenant"
- "Transitaire pour envoyer un colis en France"

## Limite connue

La reconnaissance vocale dépend du navigateur. Si Safari ou Chrome mobile refuse le micro, Bizzi affiche une explication et laisse le client écrire son besoin.
