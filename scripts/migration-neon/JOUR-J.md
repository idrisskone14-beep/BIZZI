# Jour J : bascule de Zeyds vers Vercel + Neon

Duree totale : environ 15 minutes, dont 3 a 5 minutes de maintenance visible.
Repetition faite le 2026-11-25 sur une branche Neon : recopie complete en 2 min 20 s, 0 ecart.

## La veille (J-1)

- [ ] Vercel : stockage `zeyds-justificatifs` relie au projet `bizzi` (prefixe `PRIVATE_BLOB`).
      Verification : la variable `PRIVATE_BLOB_READ_WRITE_TOKEN` apparait dans Settings > Environment Variables.
- [ ] Facultatif : `LETEXTO_API_KEY` dans Vercel (sinon les SMS restent coupes, rien ne casse).
- [ ] Sur le poste qui lance la bascule : `scripts/migration-neon/.env` present, `npm install` fait
      dans ce dossier, et `npx.cmd supabase projects list` repond (sinon `npx.cmd supabase login`).
- [ ] Choisir un creneau calme (par exemple 23 h).

## Deroule

| Heure | Etape | Qui | Duree |
|---|---|---|---|
| H | Promouvoir la page de maintenance | Claude (ou Vercel > Deployments > `jour-j-maintenance` > Promote) | 30 s |
| H+2 | Attendre que les onglets ouverts se calment | - | 2 min |
| H+2 | `node bascule.mjs --confirmer` (dans `scripts/migration-neon`) | Claude | 2 min 30 |
| H+5 | Commit `neon.enabled: true` sur `migration-neon-vercel`, puis fusion dans `main` | Claude | 1 min (deploiement) |
| H+6 | Data API : CORS limite aux domaines de production ; Neon Auth : localhost refuse | Claude | 1 min |
| H+7 | Verifications en ligne (liste ci-dessous) | Claude + vous | 5 min |
| H+12 | `node rattrapage.mjs` | Claude | 1 min |
| H+13 | Render : mettre en pause les 4 services (Suspend) | Vous | 2 min |

Le deploiement de `main` remplace automatiquement la page de maintenance.

### Si `bascule.mjs` s'arrete (message « ARRET »)

Rien n'est bascule : l'app ancienne fonctionne toujours. Re-promouvoir le deploiement de
production precedent (Vercel > Deployments > dernier deploiement `main` > Promote, ou « Instant
Rollback »), puis analyser le message avant de recommencer un autre jour.

## Verifications apres bascule

- [ ] La page d'accueil et l'annuaire s'affichent ; le navigateur ne contacte plus ni `supabase.co`
      ni `onrender.com` (outils de developpement > Reseau).
- [ ] Une demande express de test s'enregistre (puis la supprimer depuis l'admin).
- [ ] Connexion admin : « Premiere connexion ou mot de passe oublie » > code recu par e-mail >
      nouveau mot de passe > connexion. A faire par chacun des 3 admins.
- [ ] Zeyds Cash (admin) : la liste des missions et le solde (9 000 au 25/11) s'affichent.
- [ ] Envoi d'une photo de profil prestataire.
- [ ] Calcul de distance d'une livraison.
- [ ] Notifications : reactiver sur un telephone, puis declencher une nouvelle opportunite.

## Retour arriere apres bascule (en cas de probleme grave)

Re-promouvoir le deploiement de production d'avant le jour J : l'app repasse sur Render + Supabase.
Attention : ce qui a ete ecrit sur Neon entre-temps n'existe pas dans l'ancien systeme ; ne le
faire que dans les premieres heures et recopier a la main les lignes importantes.

## Une semaine apres (J+7), si tout va bien

- Supprimer les services Render, le projet Supabase et la base Neon `bizzi-db` (sauvegardes dans
  `backups/` et ce depot).
- Supprimer la branche Neon `repetition-jour-j` et la branche git `jour-j-maintenance`.
- Nettoyer le code : retirer les chemins « ancien systeme » (restBackend, appels Supabase).
