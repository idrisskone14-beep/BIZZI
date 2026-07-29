# Guide V47 - Domaine et email officiel Bizzi

## Domaine choisi

Le domaine officiel retenu est :

`bizzi-africa.com`

Le site public cible sera :

`https://bizzi-africa.com`

## Emails configures dans Bizzi

Par defaut, Bizzi utilise :

- `contact@bizzi-africa.com`
- `support@bizzi-africa.com`
- `paiement@bizzi-africa.com`
- `prestataires@bizzi-africa.com`

Si l'email réellement cree est different, modifier `bizzi-app/config.js`, section `official`.

## Ce qui a ete ajoute dans la V47

- domaine officiel dans `config.js` ;
- email principal et emails de service dans `config.js` ;
- lien de partage Bizzi vers `https://bizzi-africa.com` ;
- bloc `Contact officiel` dans l'ecran Legal ;
- checklist production avec domaine et email officiel.

## Prochaine etape : hebergement

1. Creer ou ouvrir un compte Cloudflare.
2. Ajouter le domaine `bizzi-africa.com`.
3. Creer un projet Cloudflare Pages.
4. Envoyer le dossier `bizzi-app`.
5. Connecter le domaine au projet.
6. Tester `https://bizzi-africa.com`.

## DNS email

Ne pas supprimer les enregistrements email deja fournis par ton fournisseur de mail.

Pour que l'email fonctionne correctement, conserver :

- MX ;
- SPF ;
- DKIM ;
- DMARC si disponible.

## Verification finale

- Le site ouvre bien `https://bizzi-africa.com`.
- L'email recoit et envoie correctement.
- Les emails n'arrivent pas en spam.
- Les liens Bizzi partagent le domaine officiel, pas le fichier local.
