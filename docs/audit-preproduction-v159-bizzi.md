# Audit preproduction Bizzi - V159

Date : 8 juillet 2026

## Statut

Bizzi est proche d'un pilote reel. La V159 sert a verrouiller les points minimum avant de communiquer largement.

## Points deja en place

- application publique sans inscription client ;
- parcours prestataire avec essai gratuit ;
- validation admin Supabase ;
- retrait et reactivation d'un prestataire cote client ;
- forfaits prestataires et boosts ;
- livraison locale avec prix estime, heures de pointe et commission Bizzi de 15% ;
- separation entre livraison locale et colis international ;
- emplois / missions avec validation ;
- evenements avec promotion, geolocalisation par ville, date de debut et date de fin ;
- documents legaux de base ;
- cache mobile et en-tetes de securite Cloudflare.

## Points a verifier avant ouverture publique

1. Paiements reels

   Brancher un compte marchand ou agregateur pour Wave, Orange Money et MTN Money. Eviter de lancer une vente large avec un compte personnel.

2. Images et contenus

   Refuser les photos floues, fausses identites, contenus offensants ou images sans rapport avec le metier.

3. Livraison

   Confirmer manuellement les premiers livreurs. Pour le lancement, ne pas automatiser l'affectation finale sans verification humaine.

4. Evenements

   Publier uniquement les evenements dont le lien officiel, la date, le lieu et le contact organisateur sont coherents.

5. Admin

   Garder l'acces admin discret. Utiliser uniquement le lien admin dedie et ne pas l'afficher dans l'interface publique.

6. Donnees

   Exporter les prestataires, paiements, demandes, avis et contacts une fois par semaine pendant la phase pilote.

## Risques restants

- Une API cartographique reelle n'est pas encore branchee pour toutes les distances.
- Les paiements restent en validation manuelle tant que l'agregateur n'est pas connecte.
- Les notifications push dependent de l'autorisation du telephone et ne doivent pas etre considerees comme garanties.
- Les documents legaux doivent etre relus par un professionnel avant un lancement commercial massif.

## Recommandation

Lancer d'abord un pilote controle dans une ville, avec 10 a 20 prestataires, puis elargir apres 7 jours de retours.
