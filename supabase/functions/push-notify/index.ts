// Zeyds V304 - Edge Function push-notify
//
// Envoie une vraie notification push a un prestataire (par provider_id) ou un client (par
// phone) via les abonnements stockes dans public.push_subscriptions. Appelee depuis le
// frontend juste apres qu'une action reussisse (nouvelle opportunite, nouvelle proposition) -
// voir app.js (submitExpressRequestToSupabase / submitProviderProposal).
// A deployer sur Supabase avec le secret VAPID_PRIVATE_KEY (jamais commite dans le depot).

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizePhone(value: string): string {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("00225")) return "225" + digits.slice(5);
  if (digits.length === 10) return "225" + digits;
  return digits;
}

const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails("mailto:support@bizzi-africa.com", vapidPublicKey, vapidPrivateKey);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  if (!vapidPublicKey || !vapidPrivateKey) {
    return new Response(JSON.stringify({ error: "Cles VAPID non configurees" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const ownerType = body.owner_type === "client" ? "client" : "provider";
    const providerId = String(body.provider_id || "").trim();
    const phone = normalizePhone(body.phone || "");
    const title = String(body.title || "Zeyds").slice(0, 80);
    const messageBody = String(body.body || "").slice(0, 200);
    const url = String(body.url || "./index.html");

    if (!providerId && !phone) {
      return new Response(JSON.stringify({ error: "provider_id ou phone requis" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = supabase
      .from("push_subscriptions")
      .select("id, endpoint, subscription")
      .eq("owner_type", ownerType);
    query = providerId ? query.eq("provider_id", providerId) : query.eq("phone", phone);
    const { data: subscriptions, error } = await query;
    if (error) throw error;

    const payload = JSON.stringify({ title, body: messageBody, url });
    const results = await Promise.allSettled(
      (subscriptions || []).map(async (row) => {
        try {
          await webpush.sendNotification(row.subscription, payload);
        } catch (sendError) {
          const statusCode = (sendError as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await supabase.from("push_subscriptions").delete().eq("id", row.id);
          }
          throw sendError;
        }
      }),
    );

    const sent = results.filter((result) => result.status === "fulfilled").length;
    return new Response(
      JSON.stringify({ ok: true, sent, total: (subscriptions || []).length }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String((error as Error)?.message || error) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
