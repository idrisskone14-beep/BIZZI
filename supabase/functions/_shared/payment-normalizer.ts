export type NormalizedPayment = {
  reference: string;
  paymentType: string;
  status: "approved" | "pending" | "rejected";
  amount: number;
  method: string;
  providerPhone: string;
  raw: Record<string, unknown>;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizedStatus(value: unknown): NormalizedPayment["status"] {
  const status = text(value).toLowerCase();
  if (["approved", "success", "successful", "paid", "completed", "complete"].includes(status)) return "approved";
  if (["rejected", "failed", "failure", "cancelled", "canceled", "expired"].includes(status)) return "rejected";
  return "pending";
}

export function normalizePaymentPayload(raw: Record<string, unknown>): NormalizedPayment {
  const nested = raw.data && typeof raw.data === "object" ? raw.data as Record<string, unknown> : {};
  const metadata = raw.metadata && typeof raw.metadata === "object" ? raw.metadata as Record<string, unknown> : {};
  const amount = Number(raw.amount ?? nested.amount ?? 0);
  return {
    reference: text(raw.reference) || text(raw.transaction_reference) || text(nested.reference) || text(nested.transaction_reference),
    paymentType: text(raw.payment_type) || text(nested.payment_type) || text(metadata.payment_type) || "provider_subscription",
    status: normalizedStatus(raw.status ?? nested.status),
    amount: Number.isFinite(amount) && amount > 0 ? amount : 0,
    method: text(raw.method) || text(raw.provider) || text(nested.method),
    providerPhone: text(raw.provider_phone) || text(raw.customer_phone) || text(nested.provider_phone),
    raw,
  };
}
