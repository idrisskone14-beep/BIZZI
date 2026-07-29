# Checklist publication Play Store / App Store V240

Ne cocher un point qu'après vérification réelle. La présence de ce document ne signifie pas que la publication est déjà autorisée.

## Configuration indispensable

- [ ] Domaine `bizzi-africa.com` chargé en HTTPS.
- [ ] Version visible : V240.
- [ ] Cache Cloudflare purgé après l'envoi du ZIP V240.
- [ ] Comptes Wave, Orange Money et MTN Money réels renseignés, ou paiements réels désactivés.
- [ ] Accès admin Supabase contrôlé avec un compte autorisé.
- [ ] Clés secrètes absentes des fichiers publics.
- [ ] Endpoints Supabase nécessaires déployés et testés.
- [ ] Support officiel joignable.

## Visuels et textes stores

- [ ] Icône 512 x 512 vérifiée.
- [ ] Captures Android sur la version V240.
- [ ] Captures iPhone sur la version V240.
- [ ] Accueil, recherche vocale, livraison, Food et profil prestataire illustrés.
- [ ] Description courte et description longue relues.
- [ ] Coordonnées support et URL de confidentialité vérifiées.
- [ ] Déclarations de collecte de données alignées avec la politique V240.

## Parcours produit

- [ ] Recherche texte sans compte.
- [ ] Recherche micro avec autorisation acceptée puis refusée.
- [ ] Accents ivoirien, sénégalais, malien, burkinabè, guinéen, béninois, togolais, camerounais et congolais testés avec des locuteurs volontaires.
- [ ] Mêmes phrases vocales testées avec voix grave, aiguë, rapide et posée.
- [ ] Fonction Supabase `voice-transcribe` V240 déployée avec le secret `OPENAI_API_KEY`.
- [ ] Aucun faux métier affiché pour une transcription incertaine.
- [ ] Trois candidats maximum, disponibles et cohérents avec la zone.
- [ ] Kilométrage contrôlé depuis GPS et depuis une commune dictée.
- [ ] Création de plusieurs profils avec des numéros différents.
- [ ] Ajout de plusieurs services sur une même identité prestataire.
- [ ] Un numéro principal n'ouvre qu'un seul profil.
- [ ] Formulaire prestataire vidé après validation.
- [ ] Livraison passée absente des résultats actifs.
- [ ] Livraison complète avec ETA, étapes et preuve de remise.
- [ ] Prix de course ou livraison jamais inférieur à 500 FCFA.
- [ ] Food, emploi et événement testés.

## Appareils et réseau

- [ ] Android économique.
- [ ] Android récent.
- [ ] iPhone Safari.
- [ ] PWA installée puis mise à jour.
- [ ] Connexion lente et économie de données.
- [ ] Mode hors connexion puis reconnexion.

## Décision

Soumettre uniquement si l'administration affiche `PRÊT OUVERTURE CONTRÔLÉE`, si la checklist publique est complète et si aucun incident bloquant n'est ouvert.



