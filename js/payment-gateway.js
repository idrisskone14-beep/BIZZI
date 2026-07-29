(function () {
  "use strict";

  function config() {
    return globalThis.BizziConfig?.payments?.aggregator || {};
  }

  function enabled() {
    const cfg = config();
    return Boolean(cfg.enabled && cfg.checkoutEndpoint);
  }

  function publicStatus() {
    const cfg = config();
    if (!cfg.enabled) return "manual_validation";
    if (!cfg.checkoutEndpoint) return "checkout_endpoint_missing";
    return "checkout_ready";
  }

  function normalizePayload(payload = {}) {
    return {
      payment_type: payload.paymentType || payload.payment_type || "provider_subscription",
      reference: String(payload.reference || payload.transaction_reference || "").trim(),
      amount: Number(payload.amount || 0),
      currency: payload.currency || "FCFA",
      method: payload.method || "",
      customer_phone: payload.customerPhone || payload.customer_phone || "",
      provider_phone: payload.providerPhone || payload.provider_phone || "",
      return_url: payload.returnUrl || globalThis.location?.href || "",
      metadata: payload.metadata || {},
    };
  }

  async function createCheckout(payload = {}) {
    if (!enabled()) {
      return { ok: false, mode: "manual_validation", reason: "aggregator_disabled" };
    }
    const cfg = config();
    const body = normalizePayload(payload);
    if (!body.reference || !body.amount) {
      return { ok: false, reason: "missing_reference_or_amount" };
    }
    const response = await fetch(cfg.checkoutEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.error || `Paiement ${response.status}`);
    }
    return { ok: true, ...data };
  }

  globalThis.BizziPayments = Object.freeze({
    enabled,
    status: publicStatus,
    normalizePayload,
    createCheckout,
  });
})();
