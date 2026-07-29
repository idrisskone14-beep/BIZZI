# Pack lancement Bizzi V238

## Objectif

Ouvrir Bizzi progressivement avec des utilisateurs réels, mesurer les erreurs et protéger les données avant toute ouverture large.

## Ordre de déploiement

1. Sauvegarder les données et exports admin disponibles.
2. Envoyer le ZIP `BIZZI-V238-CLOUDFLARE-UPLOAD-ONLY.zip` sur Cloudflare Pages.
3. Purger le cache Cloudflare.
4. Ouvrir `https://bizzi-africa.com/?v=238&refresh=1` sur un téléphone de test.
5. Vérifier que l'interface et l'administration affichent V238.
6. Vérifier les migrations Supabase, fonctions backend et vues publiques nécessaires.
7. Déployer la fonction Supabase `voice-transcribe` V238 ; le ZIP Cloudflare ne déploie pas ce fichier serveur.
8. Contrôler les comptes de paiement. Ne pas accepter de paiement réel lorsqu'ils indiquent `A renseigner`.
9. Importer le catalogue public Supabase depuis l'administration.
10. Exécuter tous les scénarios du document `tests-terrain-v238.md`.
11. Compléter la checklist de publication V238.
12. Ouvrir d'abord à un groupe pilote limité.

## Contrôles spécifiques V238

- Le backend vocal utilise `gpt-4o-transcribe`, le contexte Afrique francophone et la langue `fr`.
- Le navigateur demande jusqu'à cinq hypothèses puis privilégie celle qui contient un métier ou un lieu Bizzi cohérent.
- Une transcription corrigée conserve le sens ; aucun mot incertain n'est remplacé par simple sous-chaîne.
- Le badge Stores affiche `À valider` tant que tous les contrôles ne sont pas terminés.
- La recherche vocale ne propose jamais plus de trois prestataires.
- Une zone dictée ou la position GPS modifie réellement le kilométrage affiché.
- Une intention inconnue demande une reformulation au lieu de choisir un métier approximatif.
- Les profils locaux ne disparaissent pas lors d'une synchronisation Supabase.
- Un même profil peut conserver plusieurs services sans créer plusieurs identités pour le même numéro.
- Les données de test sont clairement marquées `TEST BIZZI` et supprimables depuis l'admin.

## Indicateurs du pilote

- recherches abouties et recherches sans résultat ;
- erreurs de transcription et reformulations ;
- exactitude des distances sur des trajets connus ;
- prestataires visibles et réellement disponibles ;
- contacts, acceptations et délais de réponse ;
- livraisons actives, terminées ou annulées ;
- paiements en attente et validés ;
- erreurs visibles dans l'administration ;
- poids et temps de chargement sur réseau faible.

## Règle d'ouverture

Le pack documentaire est prêt à être utilisé, mais l'application n'est prête à publier que lorsque l'administration affiche `PRÊT OUVERTURE CONTRÔLÉE` après tests réels.
