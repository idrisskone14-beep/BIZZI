# Sécurité et stabilité Bizzi V236

## Administration

- L'admin reste absent de la navigation publique.
- Les actions sensibles utilisent un compte Supabase autorisé.
- Le PIN de démonstration reste vide en production.
- Les exports sont conservés hors de l'espace public.

## Données et identités

- Un téléphone principal identifie un seul profil prestataire.
- Plusieurs services peuvent être associés à ce profil sans dupliquer l'identité.
- La synchronisation distante fusionne les données sans effacer les profils locaux durables.
- Les photos lourdes et justificatifs sensibles ne sont pas conservés inutilement dans le stockage local.
- Les données `TEST BIZZI` sont identifiables et supprimables.

## Microphone et IA

- Le micro exige une action et une autorisation explicites.
- La recherche texte reste disponible en cas de refus ou d'échec.
- L'audio destiné à la transcription distante passe par le backend configuré ; aucune clé privée IA ne doit être exposée dans le navigateur.
- Une intention incertaine déclenche une reformulation au lieu d'un métier arbitraire.

## Localisation et livraison

- La position GPS n'est utilisée qu'après autorisation.
- Le résultat précise si la distance est routière ou estimée.
- Les livraisons terminées sont exclues des missions actives.
- Une remise sensible utilise un PIN ou une preuve photo selon le parcours.
- Les accès aux positions et preuves doivent être limités aux personnes autorisées.

## Paiements

- Aucun paiement réel lorsque les comptes affichent `A renseigner`.
- Chaque paiement conserve une référence et un statut.
- Aucun code secret Mobile Money n'est demandé ou stocké.
- Les webhooks et validations sensibles restent côté backend.

## Cache et mises à jour

- Chaque version utilise un nouveau nom de cache PWA.
- Après l'envoi du ZIP, purger Cloudflare puis ouvrir `?v=236&refresh=1`.
- Vérifier la version affichée après mise à jour.
- Conserver une sauvegarde avant toute migration ou nettoyage.

## Surveillance

- Contrôler le panneau des erreurs après chaque déploiement.
- Tester les endpoints backend et la synchronisation Supabase.
- Surveiller le poids initial, le temps de démarrage et les erreurs sur réseau faible.
- Ne déclarer `Prêt à publier` qu'après validation complète de la checklist réelle.
