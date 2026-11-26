import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requiredText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function checkoutReference(payload: Record<string, unknown>) {
  return requiredText(payload.reference) || requiredText(payload.transaction_reference);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: "missing_backend_env" }, 500);
  }

  const payload = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload) return jsonResponse({ ok: false, error: "invalid_json" }, 400);

  const reference = checkoutReference(payload);
  const amount = Number(payload.amount || 0);
  const paymentType = requiredText(payload.payment_type) || "provider_subscription";
  if (!reference || !Number.isFinite(amount) || amount <= 0) {
    return jsonResponse({ ok: false, error: "missing_reference_or_amount" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await supabase.from("payment_transactions").upsert({
    payment_type: paymentType,
    transaction_reference: reference,
    status: "pending",
    amount,
    method: requiredText(payload.method) || "aggregateur",
    provider_phone: requiredText(payload.provider_phone) || null,
    raw_payload: payload,
    updated_at: new Date().toISOString(),
  }, { onConflict: "transaction_reference" });

  await supabase.from("payment_checkout_sessions").upsert({
    transaction_reference: reference,
    payment_type: paymentType,
    amount,
    currency: requiredText(payload.currency) || "FCFA",
    customer_phone: requiredText(payload.customer_phone),
    status: "created",
    payload,
    updated_at: new Date().toISOString(),
  }, { onConflict: "transaction_reference" });

  const provider = Deno.env.get("BIZZI_AGGREGATOR_PROVIDER") || "manual";
  const checkoutUrl = Deno.env.get("BIZZI_AGGREGATOR_CHECKOUT_URL") || "";
  const apiKey = Deno.env.get("BIZZI_AGGREGATOR_API_KEY") || "";

  if (!checkoutUrl || provider === "manual") {
    return jsonResponse({
      ok: true,
      mode: "manual_validation",
      reference,
      message: "Checkout agrégateur non configuré. Paiement manuel conservé.",
    });
  }

  const aggregatorResponse = await fetch(checkoutUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      reference,
      amount,
      currency: requiredText(payload.currency) || "XOF",
      customer_phone: requiredText(payload.customer_phone),
      return_url: requiredText(payload.return_url),
      metadata: payload.metadata || {},
    }),
  });

  const aggregatorPayload = await aggregatorResponse.json().catch(() => ({}));
  if (!aggregatorResponse.ok) {
    await supabase.from("payment_checkout_sessions")
      .update({ status: "failed", aggregator_response: aggregatorPayload, updated_at: new Date().toISOString() })
      .eq("transaction_reference", reference);
    return jsonResponse({ ok: false, error: "aggregator_checkout_failed", detail: aggregatorPayload }, 502);
  }

  const paymentUrl = requiredText(aggregatorPayload.payment_url) ||
    requiredText(aggregatorPayload.checkout_url) ||
    requiredText(aggregatorPayload.url);

  await supabase.from("payment_checkout_sessions")
    .update({ status: "redirect_ready", aggregator_response: aggregatorPayload, payment_url: paymentUrl, updated_at: new Date().toISOString() })
    .eq("transaction_reference", reference);

  return jsonResponse({
    ok: true,
    mode: "aggregator_checkout",
    provider,
    reference,
    payment_url: paymentUrl,
    raw: aggregatorPayload,
  });
});
