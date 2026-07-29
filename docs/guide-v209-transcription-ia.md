# Bizzi V209 — transcription vocale performante

## Architecture installée

Le bouton vocal utilise maintenant deux niveaux :

1. `MediaRecorder` capture une séquence audio légère avec réduction du bruit, suppression d’écho et contrôle automatique du gain.
2. La fonction Supabase `voice-transcribe` envoie l’audio à OpenAI avec le modèle `gpt-4o-mini-transcribe`.
3. Si le service distant est indisponible, Bizzi utilise la reconnaissance vocale du navigateur comme secours.

La clé OpenAI n’est jamais envoyée au navigateur. Elle doit rester dans les secrets de la fonction Supabase.

## Correction de sécurité indispensable

La V208 contenait `Permissions-Policy: microphone=()`, qui interdisait complètement le microphone. La V209 utilise `microphone=(self)` : seul le domaine Bizzi peut demander l’accès au micro.

## Activation sur Supabase

Depuis un poste authentifié avec la CLI Supabase :

```bash
supabase secrets set OPENAI_API_KEY=VOTRE_CLE_OPENAI --project-ref hqqppxnvorcnvksulhna
supabase functions deploy voice-transcribe --project-ref hqqppxnvorcnvksulhna
```

Ne jamais placer la valeur de `OPENAI_API_KEY` dans `config.js`, le HTML ou le dépôt.

## Publication

Téléverser ensuite l’archive Cloudflare Pages V209. Vérifier dans les en-têtes de la page publiée que `Permissions-Policy` contient `microphone=(self)`.

## Recette

1. Ouvrir `https://bizzi-africa.com/?v=209#search`.
2. Autoriser le microphone pour `bizzi-africa.com`.
3. Dicter « Je cherche un plombier à Cocody aujourd’hui ».
4. Vérifier les états « J’écoute avec l’IA » puis « Transcription IA ».
5. Vérifier que le texte reconnu remplit le champ et lance le bon parcours.
6. Couper temporairement la fonction Supabase et confirmer que le moteur du navigateur prend le relais.

## Fichiers concernés

- `js/ai-voice.js`
- `js/voice-access.js`
- `app.js`
- `config.js`
- `_headers`
- `supabase/functions/voice-transcribe/index.ts`
