(function () {
  "use strict";

  function config() {
    return globalThis.BizziConfig?.notifications || {};
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = globalThis.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  async function subscribe(owner = {}) {
    const cfg = config();
    if (!("serviceWorker" in navigator) || !("PushManager" in globalThis)) {
      return { ok: false, reason: "push_not_supported" };
    }
    if (!cfg.vapidPublicKey || !cfg.subscribeEndpoint) {
      return { ok: false, reason: "push_not_configured" };
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { ok: false, reason: "permission_denied" };
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(cfg.vapidPublicKey),
    });
    const anonKey = globalThis.BizziConfig?.supabase?.anonKey || "";
    const response = await fetch(cfg.subscribeEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({
        owner_type: owner.ownerType || "provider",
        provider_id: owner.providerId || "",
        phone: owner.phone || "",
        subscription: subscription.toJSON(),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || `Push ${response.status}`);
    return { ok: true, subscription };
  }

  function supported() {
    return Boolean("serviceWorker" in navigator && "PushManager" in globalThis && "Notification" in globalThis);
  }

  globalThis.BizziPushClient = Object.freeze({
    supported,
    subscribe,
  });
})();
