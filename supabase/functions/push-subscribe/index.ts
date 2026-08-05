// Zeyds V304 - Edge Function push-subscribe
//
// Recoit un abonnement Web Push cree cote navigateur (js/push-client.js) et l'enregistre dans
// public.push_subscriptions (table Supabase, cf. sql-copie-bizzi/108-push-notifications-v304.sql).
// A deployer sur Supabase (tableau de bord Edge Functions ou `supabase functions deploy`).

import { createClient } from "npm:@supabase/supabase-js@2";

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

  try {
    const body = await req.json();
    const ownerType = body.owner_type === "client" ? "client" : "provider";
    const providerId = String(body.provider_id || "").trim();
    const phone = normalizePhone(body.phone || "");
    const subscription = body.subscription;
    const endpoint = subscription?.endpoint;

    if (!subscription || !endpoint) {
      return new Response(JSON.stringify({ error: "Abonnement push invalide" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
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

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        owner_type: ownerType,
        provider_id: providerId || null,
        phone: phone || null,
        endpoint,
        subscription,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String((error as Error)?.message || error) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
