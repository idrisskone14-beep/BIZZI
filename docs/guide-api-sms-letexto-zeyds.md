# Guide Zeyds - API SMS LeTexto (Arolitec)

Reference de l'API client LeTexto v1 : envoi de SMS unitaires, campagnes SMS et email, noms d'expediteur, solde et suivi des statuts.

Source : "LeTexto Client API" (Arolitec, 2023). Exemples de code officiels : https://github.com/Arolitec/letexto-v3-api-examples

## 0. Avant de commencer

- URL de base : `https://apis.letexto.com/v1`
- Cle API : generee dans l'application LeTexto, section **API developpeur**.
- Authentification : en-tete `Authorization: Bearer <cle>` pour les requetes POST et la campagne ; parametre `?token=<cle>` pour le solde et le statut d'un message.
- Corps des requetes : JSON, avec `Content-Type: application/json`.
- Numeros : format international, **sans le "+"** (ex. `2250585743342` pour la Cote d'Ivoire).
- Nom d'expediteur (`from` / `sender`) : **11 caracteres maximum**, et il doit avoir ete valide par LeTexto avant de pouvoir envoyer.

### Securite de la cle

La cle donne acces au credit SMS du compte. Elle ne doit **jamais** aller dans `config.js` ni dans aucun fichier envoye au navigateur. Les appels a LeTexto se font cote serveur uniquement (`backend/` ou une fonction dans `supabase/functions/`), avec la cle dans une variable d'environnement, par exemple :

```text
LETEXTO_API_KEY=...
LETEXTO_SENDER=ZEYDS
```

## Branchement dans Zeyds : SMS "nouvelle demande" aux prestataires

Quand un client envoie une demande express, Zeyds previent deja les prestataires retenus par push. L'Edge Function `sms-notify` leur envoie aussi un SMS (les 5 premiers retenus au plus) :

> Zeyds : nouvelle demande "Plombier" à Abidjan. Ouvrez Zeyds pour répondre au client.

Fichiers :

- `supabase/functions/_shared/letexto.ts` : client LeTexto (envoi, format des numeros).
- `supabase/functions/sms-notify/handler.ts` : logique et garde-fous ; `index.ts` : branchement Supabase.
- `sql-copie-bizzi/121-sms-log-v306.sql` : table `sms_log` (journal + compteurs).
- `app.js` (`sendOpportunitySms`) : appel apres `submitExpressRequestToSupabase`.

Garde-fous (l'appel vient d'un navigateur anonyme) :

- le navigateur n'envoie que des identifiants de prestataires ; les numeros sont lus par le serveur dans `public_provider_directory` (prestataires approuves et visibles uniquement) ;
- le texte est un modele fixe ; le service et la ville n'y apparaissent que s'ils existent tels quels dans les tables `services` / `cities` ;
- plafonds sur 24 h glissantes : 3 SMS par prestataire (`SMS_PER_PROVIDER_DAILY`) et 200 SMS au total (`SMS_DAILY_LIMIT`).

### Activation

1. Faire valider le nom d'expediteur `ZEYDS` (ou un autre, 11 caracteres max) dans LeTexto.
2. Sur Supabase, SQL Editor : executer `sql-copie-bizzi/121-sms-log-v306.sql`.
3. Definir les secrets de la fonction :

   ```bash
   supabase secrets set LETEXTO_API_KEY=... LETEXTO_SENDER=ZEYDS \
     REST_BACKEND_URL=https://bizzi-gateway.onrender.com REST_BACKEND_ANON_KEY=...
   ```

   `REST_BACKEND_ANON_KEY` est la meme valeur que `restBackend.anonKey` dans `config.js`.
4. Deployer : `supabase functions deploy sms-notify`.
5. Dans `config.js`, passer `notifications.smsEnabled` a `true`, puis publier le site.
6. Verifier : envoyer une demande express de test, puis regarder la table `sms_log` (statut `sent` ou `failed` avec la raison).

Pour couper les SMS : remettre `smsEnabled: false`, ou supprimer le secret `LETEXTO_API_KEY` (la fonction repond alors 503 sans rien envoyer).

## 1. Envoi d'un message unique

`POST https://apis.letexto.com/v1/messages/send`

| Ou | Cle | Requis | Exemple | Description |
|---|---|---|---|---|
| Header | `Authorization` | oui | `Bearer <cle>` | Cle API |
| Header | `Content-Type` | oui | `application/json` | |
| Body | `from` | oui | `SMS INFO` | Nom d'expediteur (11 car. max) |
| Body | `to` | oui | `2250585743342` | Numero du destinataire |
| Body | `content` | oui | `Hello API!` | Texte du SMS |
| Body | `dlrUrl` | non | `https://mydomain.com:4444/dlr` | Adresse qui recoit l'accuse de reception (DLR) |
| Body | `dlrMethod` | non | `GET` ou `POST` | Methode d'appel de `dlrUrl` (en POST : JSON) |
| Body | `customData` | non | `commande-123` | Chaine libre renvoyee avec le DLR |

Exemple :

```bash
curl -X POST https://apis.letexto.com/v1/messages/send \
  -H "Authorization: Bearer $LETEXTO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"ZEYDS","to":"2250585743342","content":"Hello API!"}'
```

Reponse en cas de succes :

```json
{
  "statut": "submitted",
  "id": "aze135dfr-aze135fr-aze135fr-aze135fr-aze135fr",
  "partCount": 4
}
```

`partCount` = nombre de SMS factures (un long message est decoupe en plusieurs parties).

Reponses en cas d'erreur :

```json
{ "statusCode": 400, "message": ["from must be shorter than or equal to 11 characters"], "errors": "Bad Request" }
```

```json
{ "statusCode": 400, "message": ["to contains invalid phone number(s): 2250585743342.\n Phone numbet must be in international format."], "errors": "Bad Request" }
```

```json
{ "statusCode": 401, "message": "Invalid username/ password", "error": "Unauthorized" }
```

### Accuse de reception (DLR)

Si `dlrUrl` est fourni, LeTexto appelle cette adresse a chaque changement de statut avec :

| Cle | Type | Description |
|---|---|---|
| `id` | string | Identifiant unique du message |
| `statuts` | string | `PENDING` (en attente), `SENT` (envoye), `DELIVERED` (delivre), `FAILED` (echoue) |

Note : la documentation ecrit bien `statuts` pour le DLR, mais `statut` dans la reponse d'envoi. Verifier le nom reel du champ lors du premier test.

## 2. Creation d'une campagne SMS

`POST https://apis.letexto.com/v1/campaigns/sms`

| Ou | Cle | Requis | Exemple | Description |
|---|---|---|---|---|
| Header | `Authorization` | oui | `Bearer <cle>` | Cle API |
| Header | `Content-Type` | oui | `application/json` | |
| Body | `label` | oui | `Ma campagne_1` | Libelle de la campagne |
| Body | `sender` | oui | `SMS Info` | Nom d'expediteur |
| Body | `contacts` | oui | voir ci-dessous | Liste d'objets ; le numero est obligatoire, tout autre champ = champ personnalise |
| Body | `content` | oui | `Hello SMS` | Message de la campagne |

Exemple de corps. **A verifier** : le PDF ne montre pas le format de `contacts` ; le nom de cle `phone` ci-dessous est une supposition, le format exact est dans le depot d'exemples Arolitec :

```json
{
  "label": "Ma campagne_1",
  "sender": "ZEYDS",
  "contacts": [
    { "phone": "2250585743342", "nom": "Awa" },
    { "phone": "2250700000000", "nom": "Kone" }
  ],
  "content": "Hello SMS"
}
```

Reponse en cas de succes :

```json
{
  "label": "My campaign publipostage",
  "sender": "MYSENDERID",
  "id": 233223433,
  "contactCount": 4,
  "statut": "CREATED",
  "partCount": 4
}
```

Reponse en cas d'erreur :

```json
{ "statusCode": 400, "message": "Unexpected Token in JSON at position 345", "error": "bad Request" }
```

## 3. Creation d'une campagne email

`POST https://apis.letexto.com/v1/campaigns/emails`

| Ou | Cle | Requis | Exemple | Description |
|---|---|---|---|---|
| Header | `Authorization` | oui | `Bearer <cle>` | Cle API |
| Header | `Content-Type` | oui | `application/json` | |
| Body | `label` | oui | `Ma campagne_1` | Libelle de la campagne |
| Body | `from` | oui | `sender@email.com` | Email expediteur |
| Body | `recipients` | oui | voir exemples Arolitec | Liste des emails destinataires |
| Body | `subject` | oui | `Objet du mail` | Objet du mail |
| Body | `content` | oui | `Hello email` | Message de la campagne |

Note : la documentation PDF ecrit `From`, `Recipients`, `Subject` avec une majuscule ; les reponses utilisent `from` en minuscule. Verifier la casse attendue lors du premier test.

Reponse en cas de succes :

```json
{
  "id": 11,
  "label": "My Campaign publipostage",
  "subject": "subject",
  "from": "sender@mail.com",
  "recipientsCount": 3,
  "status": "CREATED"
}
```

Reponse en cas d'erreur :

```json
{ "statusCode": 400, "message": "Unexpected Token in JSON at position 345", "error": "bad Request" }
```

## 4. Statut d'une campagne SMS

`GET https://apis.letexto.com/v1/campaigns/sms/{id}/status`

| Cle | Requis | Description |
|---|---|---|
| `id` (dans l'URL) | oui | ID de la campagne |
| `Authorization` | oui | `Bearer <cle>` |

Reponse en cas de succes :

```json
{ "status": "SENT", "sender": "MYSENDERID", "id": 354667687, "label": "My Campaign publipostage" }
```

Reponse en cas d'erreur :

```json
{ "statusCode": 404, "message": "campaign not found", "error": "Not Found" }
```

## 5. Creation d'un nom d'expediteur (sender)

`POST https://apis.letexto.com/v1/senders/create`

| Ou | Cle | Requis | Exemple | Description |
|---|---|---|---|---|
| Header | `Authorization` | oui | `Bearer <cle>` | Cle API |
| Header | `Content-Type` | oui | `application/json` | |
| Body | `name` | oui | `Mon Sender` | Nom d'expediteur a faire valider |

Le nom doit etre valide par LeTexto avant de pouvoir etre utilise dans `from` / `sender`.

## 6. Recuperation du solde

`GET https://apis.letexto.com/v1/users/balance?token=<cle>`

| Cle | Requis | Description |
|---|---|---|
| `token` | oui | Cle API |

Le format de la reponse n'est pas decrit dans la documentation.

## 7. Statut d'un message

`GET https://apis.letexto.com/v1/messages/{id}/status?token=<cle>`

| Cle | Requis | Description |
|---|---|---|
| `id` (dans l'URL) | oui | `id` renvoye par l'envoi du message |
| `token` | oui | Cle API |

Statuts possibles : `PENDING`, `SENT`, `DELIVERED`, `FAILED`.

Attention : avec `?token=`, la cle apparait dans l'URL et peut finir dans des journaux. Ne jamais journaliser l'URL complete de ces deux appels.
