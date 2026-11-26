import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizePaymentPayload } from "../_shared/payment-normalizer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bizzi-webhook-secret",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function recordPaymentStatus(status: string) {
  return status === "approved" ? "approved" : status === "pending" ? "pending" : "rejected";
}

async function updateByReference(supabase: ReturnType<typeof createClient>, table: string, reference: string, patch: Record<string, unknown>) {
  const { data, error } = await supabase
    .from(table)
    .update(patch)
    .eq("transaction_reference", reference)
    .select("id")
    .limit(10);

  if (error) {
    return { table, count: 0, error: error.message };
  }

  return { table, count: Array.isArray(data) ? data.length : 0 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  const webhookSecret = Deno.env.get("BIZZI_PAYMENT_WEBHOOK_SECRET") || "";
  const receivedSecret = req.headers.get("x-bizzi-webhook-secret") || "";
  if (webhookSecret && receivedSecret !== webhookSecret) {
    return jsonResponse({ ok: false, error: "invalid_webhook_secret" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: "missing_backend_env" }, 500);
  }

  let rawPayload: Record<string, unknown>;
  try {
    rawPayload = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "invalid_json" }, 400);
  }

  const payment = normalizePaymentPayload(rawPayload);
  if (!payment.reference) {
    return jsonResponse({ ok: false, error: "missing_reference" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await supabase.from("payment_webhook_events").insert({
    provider_name: payment.method || "aggregateur",
    payment_type: payment.paymentType,
    transaction_reference: payment.reference,
    normalized_status: payment.status,
    amount: payment.amount,
    payload: payment.raw,
  });

  await supabase.from("payment_transactions").upsert({
    payment_type: payment.paymentType,
    transaction_reference: payment.reference,
    status: payment.status,
    amount: payment.amount,
    method: payment.method || "aggregateur",
    provider_phone: payment.providerPhone || null,
    raw_payload: payment.raw,
    updated_at: new Date().toISOString(),
  }, { onConflict: "transaction_reference" });

  if (payment.paymentType === "ride_wallet_recharge") {
    const { data: checkout } = await supabase
      .from("payment_checkout_sessions")
      .select("payload")
      .eq("transaction_reference", payment.reference)
      .maybeSingle();
    const metadata = (checkout?.payload?.metadata || payment.raw?.metadata || {}) as Record<string, unknown>;
    const driverId = typeof metadata.driver_id === "string" ? metadata.driver_id : "";
    let walletResult: unknown = null;
    if (payment.status === "approved" && driverId && payment.amount > 0) {
      const { data, error } = await supabase.rpc("credit_driver_wallet", {
        driver_uuid: driverId,
        amount_input: Math.round(payment.amount),
        payment_reference: payment.reference,
      });
      if (error) return jsonResponse({ ok: false, error: "wallet_credit_failed", detail: error.message }, 500);
      walletResult = data;
    }
    return jsonResponse({
      ok: true,
      reference: payment.reference,
      status: payment.status,
      payment_type: payment.paymentType,
      wallet: walletResult,
    });
  }

  const now = new Date().toISOString();
  const tableUpdates = payment.paymentType.includes("delivery")
    ? [{
      table: "delivery_requests",
      patch: {
        payment_status: recordPaymentStatus(payment.status),
        paid_at: payment.status === "approved" ? now : null,
        updated_at: now,
      },
    }]
    : payment.paymentType.includes("job")
      ? [{
        table: "job_offers",
        patch: {
          payment_status: recordPaymentStatus(payment.status),
          paid_at: payment.status === "approved" ? now : null,
          updated_at: now,
        },
      }]
      : payment.paymentType.includes("event")
        ? [{
          table: "event_promotions",
          patch: {
            payment_status: recordPaymentStatus(payment.status),
            paid_at: payment.status === "approved" ? now : null,
            updated_at: now,
          },
        }]
        : [{
          table: "payments",
          patch: {
            status: recordPaymentStatus(payment.status),
            paid_at: payment.status === "approved" ? now : null,
            approved_at: payment.status === "approved" ? now : null,
            updated_at: now,
          },
        }];

  const updates = [];
  for (const target of tableUpdates) {
    updates.push(await updateByReference(supabase, target.table, payment.reference, target.patch));
  }

  return jsonResponse({
    ok: true,
    reference: payment.reference,
    status: payment.status,
    payment_type: payment.paymentType,
    updates,
  });
});
