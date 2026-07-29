# Bizzi V210 — micro fonctionnel même sans fonction IA

## Cause de l’échec V209

La fonction Supabase `voice-transcribe` répondait `404 NOT_FOUND`. Elle n’était pas déployée. La V209 pouvait donc enregistrer la voix avant de découvrir que le service de transcription n’existait pas.

Le serveur local était également lié à IPv6 alors que la page utilisait `127.0.0.1` en IPv4, ce qui rendait l’application locale inaccessible.

## Correction V210

- Bizzi teste `voice-transcribe` au chargement avec une requête `OPTIONS` sans audio.
- Le moteur OpenAI est utilisé uniquement si la fonction répond correctement.
- Si elle est absente, Bizzi utilise immédiatement la reconnaissance vocale du navigateur.
- Aucun audio n’est enregistré ni envoyé vers une fonction inexistante.
- La politique de sécurité reste `microphone=(self)`.
- Le serveur local de test est explicitement lié à `127.0.0.1`.

## Adresse locale

`http://127.0.0.1:4173/?v=210#search`

## Activation future du moteur OpenAI

Déployer `supabase/functions/voice-transcribe/index.ts` et enregistrer `OPENAI_API_KEY` comme secret Supabase. La V210 détectera ensuite automatiquement la fonction, sans autre changement du navigateur.
