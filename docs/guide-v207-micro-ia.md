# Bizzi V207 — microphone de l’IA fiabilisé

## Problème corrigé

La V206 ouvrait un flux audio avec `getUserMedia`, le fermait, puis lançait une seconde session avec l’API de reconnaissance vocale. Sur certains téléphones, ce double démarrage pouvait produire une coupure, un refus, une attente ou une nouvelle demande d’autorisation.

## Fonctionnement V207

- une seule session de reconnaissance est lancée après le geste de l’utilisateur ;
- une autorisation déjà refusée est détectée avant le démarrage ;
- les événements d’une ancienne session sont ignorés ;
- les résultats intermédiaires restent visibles pendant que la personne parle ;
- un silence de 2,2 secondes termine proprement une phrase ;
- la durée maximale passe de 9 à 15 secondes ;
- une transcription déjà captée est conservée même si la fin remonte `no-speech` ou `aborted` ;
- le bouton expose clairement ses états « démarrer » et « arrêter » aux technologies d’assistance ;
- la dictée du clavier reste disponible sur les navigateurs sans Web Speech.

## Test de recette sur le site HTTPS

1. Ouvrir `https://bizzi-africa.com/?v=207#search`.
2. Renseigner un numéro client valide.
3. Appuyer sur « Parler » et autoriser le microphone si demandé.
4. Dicter : « Je cherche un plombier à Cocody aujourd’hui ».
5. Vérifier que le texte apparaît progressivement, puis que la recherche démarre.
6. Recommencer avec : « Livrer un colis de Cocody à Marcory maintenant ».
7. Appuyer une seconde fois sur « Stop » pendant une écoute et vérifier le retour à « Parler ».

Sur iPhone/Safari et Android/Chrome, tester également le refus puis la réactivation de l’autorisation dans les réglages du site.
