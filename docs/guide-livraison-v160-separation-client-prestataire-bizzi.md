# Bizzi V160 - Separation fiche client et espace prestataire

Date : 9 juillet 2026

## Correction

Le bouton `Renouveler forfait` a ete retire de la fiche publique prestataire vue par les clients.

## Pourquoi

La fiche publique doit rester orientee client :

- appeler le prestataire ;
- contacter sur WhatsApp ;
- copier le contact ;
- partager la fiche ;
- donner un avis ;
- signaler un probleme.

Le paiement et le renouvellement de forfait doivent rester dans l'espace `Prestataire`, afin de ne pas melanger les parcours.

## Publication

1. Uploader `bizzi-cloudflare-pages-v160-separation-client-prestataire.zip`.
2. Faire `Purge everything` dans Cloudflare.
3. Ouvrir une fiche prestataire cote client.
4. Verifier que `Renouveler forfait` n'apparait plus.
5. Aller dans `Prestataire` pour verifier que les forfaits restent bien accessibles.
