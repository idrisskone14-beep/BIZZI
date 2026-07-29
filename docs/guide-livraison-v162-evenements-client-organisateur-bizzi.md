# Bizzi V162 - Evenements client et organisateur separes

Date : 9 juillet 2026

## Correction produit

L'onglet `Evenements` est separe en deux parcours :

- `Acheter un billet` pour le client ;
- `Promouvoir votre spectacle` pour l'organisateur.

## Cote client

Le client voit uniquement les informations utiles :

- nom de l'evenement ;
- date ;
- lieu ;
- ville ;
- prix indicatif ;
- description ;
- choix de contact.

Quand il ouvre un evenement, Bizzi propose :

- `WhatsApp organisateur` ;
- `Site officiel / billet` si l'organisateur a renseigne un lien.

Chaque clic de contact ou de site est enregistre dans les statistiques Bizzi.

## Cote organisateur

L'organisateur dispose d'un espace separe pour :

- publier son evenement ;
- renseigner l'affiche ;
- indiquer la ville et le lieu ;
- choisir un forfait de visibilite ;
- envoyer la demande pour validation.

Le lien de billetterie est optionnel. Si l'organisateur n'a pas de site, le client peut passer par WhatsApp.

## Important

Bizzi ne vend pas les billets, n'encaisse pas l'argent des billets et ne gere pas les remboursements. Bizzi cree seulement la mise en relation et facture la visibilite.

## Publication

1. Uploader `bizzi-cloudflare-pages-v162-evenements-separes.zip`.
2. Faire `Purge everything` dans Cloudflare.
3. Ouvrir `Evenements`.
4. Verifier que le mode client n'affiche pas le formulaire organisateur.
5. Cliquer sur un evenement et tester WhatsApp ou Site officiel.
