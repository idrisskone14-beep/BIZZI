// Client LeTexto (Arolitec) : POST /v1/messages/send, cle en Bearer, expediteur valide par LeTexto
// (11 caracteres max), numero international sans "+". Reference : docs/guide-api-sms-letexto-zeyds.md
// Ne leve jamais d'exception et ne journalise jamais la cle (ni les URL ?token= qui la contiennent).
import { createHmac, timingSafeEqual } from "node:crypto";

export function letextoConfig(env = process.env) {
  const apiKey = String(env.LETEXTO_API_KEY || "").trim();
  if (!apiKey) return null;
  return {
    apiKey,
    sender: String(env.LETEXTO_SENDER || "ZEYDS").trim().slice(0, 11),
    baseUrl: String(env.LETEXTO_API_URL || "https://apis.letexto.com").trim().replace(/\/+$/, ""),
  };
}

async function readJson(response) {
  const raw = await response.text().catch(() => "");
  try { return { raw, data: JSON.parse(raw) }; } catch { return { raw, data: null }; }
}

/** Message d'erreur LeTexto lisible (sans la cle). */
function letextoError(status, data, raw) {
  const message = Array.isArray(data?.message) ? data.message.join(" ") : data?.message || raw || "";
  return `http_${status}${message ? ` ${String(message).slice(0, 240)}` : ""}`;
}

/** Secret de l'URL d'accuse de reception, derive de la cle (pas de variable de plus a gerer). */
export function dlrSecret(config) {
  return createHmac("sha256", config.apiKey).update("zeyds-letexto-dlr").digest("hex").slice(0, 32);
}

export function checkDlrSecret(config, candidate) {
  const expected = Buffer.from(dlrSecret(config));
  const given = Buffer.from(String(candidate || ""));
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Adresse a laquelle LeTexto signale la livraison (meme domaine que la requete d'origine). */
export function dlrUrlFor(request, config) {
  try {
    const origin = new URL(request.url).origin;
    if (!/^https:\/\//.test(origin)) return "";
    return `${origin}/api/sms-dlr?k=${dlrSecret(config)}`;
  } catch {
    return "";
  }
}

export async function sendSms(config, to, content, fetchImpl = fetch, { dlrUrl = "" } = {}) {
  try {
    const body = { from: config.sender, to, content };
    if (dlrUrl) Object.assign(body, { dlrUrl, dlrMethod: "POST" });
    const response = await fetchImpl(`${config.baseUrl}/v1/messages/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    const { raw, data } = await readJson(response);
    if (!response.ok) return { ok: false, error: letextoError(response.status, data, raw) };
    return { ok: true, id: String(data?.id ?? ""), parts: Number(data?.partCount) || 1 };
  } catch (error) {
    return { ok: false, error: `network ${String(error?.message || error).slice(0, 200)}` };
  }
}

/** Solde du compte (format non documente par LeTexto : renvoye tel quel). */
export async function getBalance(config, fetchImpl = fetch) {
  try {
    const response = await fetchImpl(`${config.baseUrl}/v1/users/balance?token=${encodeURIComponent(config.apiKey)}`, {
      signal: AbortSignal.timeout(8_000),
    });
    const { raw, data } = await readJson(response);
    if (!response.ok) return { ok: false, error: letextoError(response.status, data, raw) };
    return { ok: true, balance: data ?? raw.slice(0, 200) };
  } catch (error) {
    return { ok: false, error: `network ${String(error?.message || error).slice(0, 200)}` };
  }
}

/** Demande de validation d'un nom d'expediteur (11 caracteres max). */
export async function createSender(config, name, fetchImpl = fetch) {
  try {
    const response = await fetchImpl(`${config.baseUrl}/v1/senders/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
      signal: AbortSignal.timeout(10_000),
    });
    const { raw, data } = await readJson(response);
    if (!response.ok) return { ok: false, error: letextoError(response.status, data, raw) };
    return { ok: true, result: data ?? raw.slice(0, 200) };
  } catch (error) {
    return { ok: false, error: `network ${String(error?.message || error).slice(0, 200)}` };
  }
}
