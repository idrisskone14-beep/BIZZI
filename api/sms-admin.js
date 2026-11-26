// /api/sms-admin : suivi des SMS LeTexto pour la console admin (admins actifs uniquement).
// GET  -> configuration, solde LeTexto, compteurs 24 h et 40 derniers envois.
// POST { action: "test", to }      -> SMS de test (5 par 24 h).
// POST { action: "sender", name }  -> demande de validation d'un nom d'expediteur.
import { verifyAdmin } from "./_lib/admin-auth.js";
import { json, normalizeIvorianPhone, sql, text } from "./_lib/http.js";
import { createSender, dlrUrlFor, getBalance, letextoConfig, sendSms } from "./_lib/letexto.js";

const TEST_LIMIT = 5;
const TEST_MESSAGE = "Zeyds : SMS de test. Si vous recevez ce message, les notifications SMS fonctionnent.";

const positiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export async function GET(request) {
  if (!(await verifyAdmin(request))) return json({ error: "Acces reserve aux admins." }, 403);
  const config = letextoConfig();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [stats, recent, balance] = await Promise.all([
    sql()`select
        count(*) filter (where status = 'sent')::int as sent,
        count(*) filter (where status = 'failed')::int as failed,
        count(*) filter (where delivery_status = 'DELIVERED')::int as delivered,
        coalesce(sum(parts) filter (where status = 'sent'), 0)::int as parts
      from public.sms_log where created_at >= ${since}::timestamptz`,
    sql()`select l.id, l.event, l.phone, l.status, l.delivery_status, l.delivered_at, l.parts, l.error, l.created_at,
        p.full_name as provider_name
      from public.sms_log l
      left join public.providers p on p.id::text = l.provider_id
      order by l.created_at desc limit 40`,
    config ? getBalance(config) : Promise.resolve(null),
  ]);
  return json({
    configured: Boolean(config),
    sender: config?.sender || "",
    limits: {
      daily: positiveInt(process.env.SMS_DAILY_LIMIT, 200),
      perProvider: positiveInt(process.env.SMS_PER_PROVIDER_DAILY, 3),
      tests: TEST_LIMIT,
    },
    balance,
    last24h: stats[0],
    recent,
  });
}

export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return json({ error: "Acces reserve aux admins." }, 403);
  const config = letextoConfig();
  if (!config) return json({ error: "Cle LeTexto absente : ajoutez LETEXTO_API_KEY dans Vercel puis redeployez." }, 503);
  const body = (await request.json().catch(() => null)) || {};

  if (body.action === "sender") {
    const name = text(String(body.name || ""));
    if (!/^[A-Za-z0-9 ]{2,11}$/.test(name)) return json({ error: "Nom d'expediteur : 2 a 11 lettres ou chiffres." }, 400);
    const result = await createSender(config, name);
    return result.ok ? json({ ok: true, result: result.result }) : json({ error: result.error }, 502);
  }

  if (body.action === "test") {
    const phone = normalizeIvorianPhone(body.to);
    if (!phone) return json({ error: "Numero ivoirien invalide (10 chiffres, ex. 07 00 00 00 00)." }, 400);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [{ n }] = await sql()`select count(*)::int as n from public.sms_log where event = 'test' and created_at >= ${since}::timestamptz`;
    if (n >= TEST_LIMIT) return json({ error: `Limite de ${TEST_LIMIT} SMS de test par 24 h atteinte.` }, 429);
    const result = await sendSms(config, phone, TEST_MESSAGE, fetch, { dlrUrl: dlrUrlFor(request, config) });
    await sql()`insert into public.sms_log (event, provider_id, phone, status, letexto_id, parts, error)
      values ('test', ${`admin:${admin.id}`}, ${phone}, ${result.ok ? "sent" : "failed"}, ${result.ok ? result.id || null : null},
        ${result.ok ? result.parts : null}, ${result.ok ? null : String(result.error || "").slice(0, 300)})`;
    return result.ok ? json({ ok: true, id: result.id, parts: result.parts }) : json({ error: `LeTexto a refuse l'envoi : ${result.error}` }, 502);
  }

  return json({ error: "Action inconnue." }, 400);
}
