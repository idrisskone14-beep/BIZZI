(function (root) {
  "use strict";

  const STORAGE_KEY = "bizzi-client-device-token-v1";
  const CASH_LABEL = "Espèces";

  function valid(value) {
    return /^[A-Za-z0-9_-]{32,160}$/.test(String(value || ""));
  }

  function randomToken() {
    const cryptoApi = root.crypto;
    if (cryptoApi?.getRandomValues) {
      const bytes = new Uint8Array(32);
      cryptoApi.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    }
    const parts = [];
    for (let index = 0; index < 8; index += 1) {
      parts.push(Math.random().toString(36).slice(2).padEnd(8, "0"));
    }
    return parts.join("").slice(0, 64);
  }

  function token() {
    try {
      const stored = root.localStorage?.getItem(STORAGE_KEY);
      if (valid(stored)) return stored;
      const created = randomToken();
      root.localStorage?.setItem(STORAGE_KEY, created);
      return created;
    } catch {
      if (!valid(root.__bizziPrivateDeviceToken)) root.__bizziPrivateDeviceToken = randomToken();
      return root.__bizziPrivateDeviceToken;
    }
  }

  function owns(value) {
    return valid(value) && value === token();
  }

  function paymentMethods(configured = []) {
    return [...new Set([...(Array.isArray(configured) ? configured : []), CASH_LABEL])];
  }

  function choosePayment(current, configured = [], allowCash = false) {
    const methods = allowCash ? paymentMethods(configured) : configured;
    return methods.includes(current) ? current : methods[0] || "Wave";
  }

  function isCash(method) {
    return String(method || "").trim().toLowerCase() === CASH_LABEL.toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[character]));
  }

  function cashInstruction(amountText) {
    return `Paiement en espèces\nMontant à remettre : ${amountText}.\nPayez directement au chauffeur ou au livreur à la fin de la course ou de la livraison. Aucun paiement Mobile Money n'est demandé.`;
  }

  function paymentPanel({ method, amountText, account, accountReady }) {
    const cash = isCash(method);
    return `
      <div class="payment-head">
        <strong>Montant à payer</strong>
        <span class="tag ${accountReady ? "ok" : "pending"}">${escapeHtml(amountText)}</span>
      </div>
      <p>${cash ? "Vous paierez en espèces au chauffeur ou au livreur à la fin de la prestation." : "Après paiement, Bizzis ouvre la demande aux livreurs proches. Le contact du livreur reste masqué jusqu'à acceptation."}</p>
      <div class="payment-account-card ${accountReady ? "ready" : "todo"}">
        <span>${cash ? "Paiement à la remise" : `Compte Bizzis ${escapeHtml(method)}`}</span>
        <strong>${escapeHtml(accountReady ? account : "Compte Bizzis à renseigner")}</strong>
      </div>
      <div class="payment-copy-actions">
        ${cash ? "" : `<button class="secondary" type="button" data-copy-delivery-payment-account ${accountReady ? "" : "disabled"}>Copier compte</button>`}
        <button class="secondary" type="button" data-copy-delivery-payment-instruction>Copier instruction</button>
      </div>`;
  }

  root.BizziPrivacy = Object.freeze({
    STORAGE_KEY,
    CASH_LABEL,
    valid,
    token,
    owns,
    paymentMethods,
    choosePayment,
    isCash,
    cashInstruction,
    paymentPanel,
  });
}(globalThis));
