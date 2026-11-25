// POST /api/push-notify : envoie une notification push a un prestataire (provider_id) ou un client
// (phone). Portee depuis l'Edge Function Supabase push-notify. Secrets : VAPID_PUBLIC_KEY,
// VAPID_PRIVATE_KEY (variables d'environnement Vercel, jamais dans le depot).
import webpush from "web-push";
import { json, normalizeIvorianPhone, sql, text } from "./_lib/http.js";

let vapidReady = false;

function setupVapid() {
  if (vapidReady) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails("mailto:support@bizzi-africa.com", publicKey, privateKey);
  vapidReady = true;
  return true;
}

export async function POST(request) {
  if (!setupVapid()) return json({ error: "Cles VAPID non configurees" }, 503);
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: "JSON invalide" }, 400);
  const ownerType = body.owner_type === "client" ? "client" : "provider";
  const providerId = text(body.provider_id);
  const phone = normalizeIvorianPhone(body.phone);
  if (!providerId && !phone) return json({ error: "provider_id ou phone requis" }, 400);

  // Texte limite et lien force vers l'app : le push ne peut pas servir a envoyer des liens externes.
  const payload = JSON.stringify({
    title: text(body.title).slice(0, 80) || "Zeyds",
    body: text(body.body).slice(0, 200),
    url: /^\.\/[\w#?=&.-]*$/.test(text(body.url)) ? text(body.url) : "./index.html",
  });

  try {
    const rows = providerId
      ? await sql()`select id, subscription from public.push_subscriptions where owner_type = ${ownerType} and provider_id = ${providerId}`
      : await sql()`select id, subscription from public.push_subscriptions where owner_type = ${ownerType} and phone = ${phone}`;
    const results = await Promise.allSettled(rows.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, payload, { TTL: 60 * 60 * 24 });
      } catch (error) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await sql()`delete from public.push_subscriptions where id = ${row.id}`;
        }
        throw error;
      }
    }));
    return json({ ok: true, sent: results.filter((r) => r.status === "fulfilled").length, total: rows.length });
  } catch (error) {
    console.error(JSON.stringify({ where: "push-notify", message: String(error?.message || error).slice(0, 200) }));
    return json({ error: "Envoi impossible" }, 500);
  }
}
