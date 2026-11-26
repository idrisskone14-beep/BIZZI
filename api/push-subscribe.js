// POST /api/push-subscribe : enregistre l'abonnement Web Push d'un appareil (js/push-client.js).
// Portee depuis l'Edge Function Supabase push-subscribe ; table public.push_subscriptions (Neon).
import { json, normalizeIvorianPhone, sql, text } from "./_lib/http.js";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: "JSON invalide" }, 400);
  const ownerType = body.owner_type === "client" ? "client" : "provider";
  const providerId = text(body.provider_id).slice(0, 80);
  const phone = normalizeIvorianPhone(body.phone);
  const subscription = body.subscription;
  const endpoint = text(subscription?.endpoint);

  if (!endpoint || !/^https:\/\//.test(endpoint) || endpoint.length > 1000) return json({ error: "Abonnement push invalide" }, 400);
  if (!subscription?.keys?.p256dh || !subscription?.keys?.auth) return json({ error: "Abonnement push invalide" }, 400);
  if (!providerId && !phone) return json({ error: "provider_id ou phone requis" }, 400);

  try {
    await sql()`insert into public.push_subscriptions (owner_type, provider_id, phone, endpoint, subscription, updated_at)
      values (${ownerType}, ${providerId || null}, ${phone || null}, ${endpoint}, ${JSON.stringify(subscription)}::jsonb, now())
      on conflict (endpoint) do update set owner_type = excluded.owner_type, provider_id = excluded.provider_id,
        phone = excluded.phone, subscription = excluded.subscription, updated_at = now()`;
    return json({ ok: true });
  } catch (error) {
    console.error(JSON.stringify({ where: "push-subscribe", message: String(error?.message || error).slice(0, 200) }));
    return json({ error: "Enregistrement impossible" }, 500);
  }
}
