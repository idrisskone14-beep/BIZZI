# Guide V48 - Heberger Bizzi sur Cloudflare Pages

## Situation

Le domaine `bizzi-africa.com` est maintenant actif dans Cloudflare.

La prochaine etape consiste a publier l'application Bizzi sur Cloudflare Pages.

## Fichier a utiliser

Utiliser le ZIP :

`bizzi-cloudflare-pages-v48.zip`

Ce ZIP contient directement les fichiers du site a la racine, ce qui est adapte a l'upload Cloudflare Pages.

## Etapes Cloudflare Pages

1. Aller dans Cloudflare.
2. Ouvrir `Workers & Pages`.
3. Cliquer sur `Create`.
4. Choisir `Pages`.
5. Choisir `Upload assets` ou `Direct Upload`.
6. Nom du projet conseille : `bizzi-africa`.
7. Envoyer le fichier `bizzi-cloudflare-pages-v48.zip`.
8. Attendre le deploiement.
9. Ouvrir l'adresse temporaire fournie par Cloudflare.
10. Tester l'accueil, les services, le parcours prestataire, l'admin et le legal.

## Connecter le domaine

Apres le premier deploiement :

1. Aller dans le projet Pages `bizzi-africa`.
2. Ouvrir `Custom domains`.
3. Ajouter `bizzi-africa.com`.
4. Ajouter aussi `www.bizzi-africa.com` si Cloudflare le propose.
5. Attendre que Cloudflare indique que le domaine est actif.

## Fichiers Cloudflare ajoutes

`_headers` :

- ajoute des entetes de securite simples ;
- evite de trop cacher `config.js` ;
- laisse les images et icones en cache long.

`_redirects` :

- permet d'ouvrir l'admin via `/admin`.

## Tests a faire apres publication

- `https://bizzi-africa.com` ouvre Bizzi.
- `https://bizzi-africa.com/admin` ouvre l'entree admin.
- `contact@bizzi-africa.com` continue d'envoyer et recevoir.
- L'import Supabase fonctionne depuis l'admin.
- Les inscriptions prestataires continuent d'arriver dans Supabase.
- La demande express fonctionne.

## Important

Ne pas supprimer les DNS email dans Cloudflare :

- MX Google ;
- SPF ;
- DKIM ;
- DMARC.
