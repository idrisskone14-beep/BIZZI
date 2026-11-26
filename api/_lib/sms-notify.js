// Logique de /api/sms-notify, isolee pour les tests (les acces base sont injectes).
//
// SMS « nouvelle demande » aux prestataires retenus pour une demande express. Le navigateur
// n'envoie que l'identifiant de la demande ; tout le reste est lu en base :
// - la demande doit exister et dater de moins de 15 minutes ;
// - destinataires = matched_provider_ids de la demande, 5 au plus, prestataires approuves et
//   visibles uniquement (public_provider_directory), numeros lus en base ;
// - texte = modele fixe ; service et ville viennent des tables services / cities ;
// - une seule salve par demande, 3 SMS par prestataire et 200 au total sur 24 h glissantes.
import { normalizeIvorianPhone } from "./http.js";
import { dlrUrlFor, letextoConfig, sendSms } from "./letexto.js";

export const MAX_RECIPIENTS = 5;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

const positiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export function opportunityMessage(service, city) {
  const what = service ? `nouvelle demande "${String(service).slice(0, 40)}"` : "nouvelle demande de service";
  const where = city ? ` à ${String(city).slice(0, 40)}` : "";
  return `Zeyds : ${what}${where}. Ouvrez Zeyds pour répondre au client.`;
}

/**
 * deps : {
 *   env, fetch, now?,
 *   getRequest(id) -> { id, created_at, service, city, matched_provider_ids } | null,
 *   listProviders(ids) -> [{ id, phone }],
 *   alreadyNotified(requestId) -> boolean,
 *   countSent({ since, providerId? }) -> number,
 *   record(row),
 * }
 */
export async function handleSmsNotify(request, deps) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const sms = letextoConfig(deps.env);
  if (!sms) return json({ error: "sms_not_configured" }, 503);

  const body = await request.json().catch(() => null);
  if (!body || body.event !== "new_opportunity") return json({ error: "unknown_event" }, 400);
  const requestId = String(body.request_id ?? "").trim();
  if (!UUID.test(requestId)) return json({ error: "request_id_required" }, 400);

  const now = deps.now ? deps.now() : new Date();
  try {
    const demand = await deps.getRequest(requestId);
    if (!demand) return json({ error: "request_not_found" }, 404);
    if (now.getTime() - new Date(demand.created_at).getTime() > 15 * 60 * 1000) return json({ error: "request_too_old" }, 409);
    if (await deps.alreadyNotified(requestId)) return json({ ok: true, sent: 0, failed: 0, skipped: 0, already: true });

    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    if (await deps.countSent({ since }) >= positiveInt(deps.env.SMS_DAILY_LIMIT, 200)) return json({ error: "daily_limit_reached" }, 429);
    const perProviderLimit = positiveInt(deps.env.SMS_PER_PROVIDER_DAILY, 3);

    const ids = [...new Set((demand.matched_provider_ids || []).map(String).filter((id) => UUID.test(id)))].slice(0, MAX_RECIPIENTS);
    const providers = ids.length ? await deps.listProviders(ids) : [];
    const content = opportunityMessage(demand.service, demand.city);
    const dlrUrl = dlrUrlFor(request, sms);

    let sent = 0;
    let failed = 0;
    let skipped = ids.length - providers.length;
    for (const provider of providers) {
      const providerId = String(provider.id);
      const phone = normalizeIvorianPhone(provider.phone);
      if (!ids.includes(providerId) || !phone || await deps.countSent({ since, providerId }) >= perProviderLimit) {
        skipped += 1;
        continue;
      }
      const result = await sendSms(sms, phone, content, deps.fetch, { dlrUrl });
      await deps.record({
        event: "new_opportunity",
        request_id: requestId,
        provider_id: providerId,
        phone,
        status: result.ok ? "sent" : "failed",
        letexto_id: result.ok ? result.id || null : null,
        parts: result.ok ? result.parts : null,
        error: result.ok ? null : String(result.error || "").slice(0, 300),
      });
      if (result.ok) sent += 1;
      else failed += 1;
    }
    return json({ ok: true, sent, failed, skipped });
  } catch (error) {
    console.error(JSON.stringify({ where: "sms-notify", message: String(error?.message || error).slice(0, 200) }));
    return json({ error: "sms_failed" }, 502);
  }
}
