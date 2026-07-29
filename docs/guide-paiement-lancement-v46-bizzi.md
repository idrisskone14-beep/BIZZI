# Guide V46 - Paiement de lancement Bizzi

## Objectif

La V46 clarifie le paiement manuel pendant le lancement.

Le fonctionnement reste simple :

1. Le prestataire choisit un forfait.
2. Il paie par Wave, Orange Money ou MTN Money.
3. Il saisit la reference de transaction.
4. Il ajoute une preuve si possible.
5. L'admin valide le paiement.
6. Bizzi rend le prestataire visible.

## Compte prive ou compte professionnel ?

Pour tester, un compte prive peut suffire.

Pour publier serieusement, il faut au minimum un numero dedie a Bizzi, et idealement un compte marchand/professionnel.

Raison :

- ne pas melanger ton argent personnel et l'argent Bizzi ;
- limiter les risques de blocage en cas de volume ;
- rassurer les prestataires avec un compte clair ;
- faciliter le suivi des paiements ;
- preparer l'automatisation future.

## A renseigner dans l'application

Dans `bizzi-app/config.js`, modifier les comptes :

```js
accounts: {
  "Wave": "+225 XX XX XX XX XX",
  "Orange Money": "+225 XX XX XX XX XX",
  "MTN Money": "+225 XX XX XX XX XX",
}
```

Conseil : utiliser un numero dedie Bizzi, pas ton numero personnel principal.

## Ce qui a ete ajoute dans la V46

- affichage plus clair du compte Bizzi selectionne ;
- pastille `Compte prêt` ou `À renseigner` ;
- bouton `Copier compte` ;
- bouton `Copier instruction` ;
- rappel que la validation est manuelle par l'admin ;
- checklist production plus adaptee au lancement manuel.

## Test rapide

1. Ouvrir `bizzi-app/index.html`.
2. Aller dans `Prestataire`.
3. Choisir un forfait.
4. Choisir Wave, Orange Money ou MTN Money.
5. Verifier que le bloc de paiement affiche le compte Bizzi.
6. Cliquer sur `Copier instruction`.
7. Faire un paiement test puis valider dans l'espace admin.

## Etape suivante recommandee

Quand Bizzi commence a recevoir plusieurs paiements par jour, passer a :

- un compte marchand Wave ;
- un compte marchand Orange Money ;
- un compte marchand MTN Money ;
- ou un agregateur de paiement compatible Côte d'Ivoire.
