// Client LeTexto (Arolitec) : POST /v1/messages/send, cle en Bearer, expediteur valide par LeTexto
// (11 caracteres max), numero international sans "+". Reference : docs/guide-api-sms-letexto-zeyds.md
// Ne leve jamais d'exception et ne journalise jamais la cle.

export function letextoConfig(env = process.env) {
  const apiKey = String(env.LETEXTO_API_KEY || "").trim();
  if (!apiKey) return null;
  return {
    apiKey,
    sender: String(env.LETEXTO_SENDER || "ZEYDS").trim().slice(0, 11),
    baseUrl: String(env.LETEXTO_API_URL || "https://apis.letexto.com").trim().replace(/\/+$/, ""),
  };
}

export async function sendSms(config, to, content, fetchImpl = fetch) {
  try {
    const response = await fetchImpl(`${config.baseUrl}/v1/messages/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: config.sender, to, content }),
      signal: AbortSignal.timeout(10_000),
    });
    const raw = await response.text().catch(() => "");
    if (!response.ok) return { ok: false, error: `http_${response.status}`, detail: raw.slice(0, 300) };
    let payload = {};
    try { payload = JSON.parse(raw); } catch { /* 2xx sans JSON : envoi accepte */ }
    return { ok: true, id: String(payload.id ?? ""), parts: Number(payload.partCount) || 1 };
  } catch (error) {
    return { ok: false, error: "network", detail: String(error?.message || error).slice(0, 300) };
  }
}
