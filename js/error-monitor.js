(function () {
  "use strict";

  const STORAGE_KEY = "bizzi-error-events";
  const MAX_EVENTS = 40;

  function safeNow() {
    try {
      return new Date().toISOString();
    } catch {
      return "";
    }
  }

  function storageGet(key) {
    return globalThis.BizziStorage?.localGet ? globalThis.BizziStorage.localGet(key) : null;
  }

  function storageSet(key, value) {
    return globalThis.BizziStorage?.localSet ? globalThis.BizziStorage.localSet(key, value) : false;
  }

  function readEvents() {
    try {
      return JSON.parse(storageGet(STORAGE_KEY) || "[]").filter(Boolean);
    } catch {
      return [];
    }
  }

  function writeEvents(events) {
    storageSet(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  }

  function normalizeError(error) {
    if (!error) return { message: "Erreur inconnue" };
    if (typeof error === "string") return { message: error };
    return {
      message: String(error.message || error.reason || "Erreur inconnue").slice(0, 500),
      name: String(error.name || "Error").slice(0, 120),
      stack: String(error.stack || "").slice(0, 2000),
    };
  }

  function endpoint() {
    const config = globalThis.BizziConfig || {};
    return config.observability?.endpoint || "";
  }

  function shouldSample() {
    const config = globalThis.BizziConfig || {};
    const rate = Number(config.observability?.sampleRate ?? 1);
    if (!Number.isFinite(rate)) return true;
    if (rate >= 1) return true;
    if (rate <= 0) return false;
    return Math.random() <= rate;
  }

  async function flush() {
    const url = endpoint();
    if (!url || !globalThis.fetch) return { ok: false, reason: "endpoint_absent" };
    if (globalThis.navigator && globalThis.navigator.onLine === false) return { ok: false, reason: "offline" };
    const events = readEvents();
    if (!events.length) return { ok: true, sent: 0 };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "bizzi-web", events }),
      keepalive: true,
    });
    if (!response.ok) return { ok: false, status: response.status };
    writeEvents([]);
    return { ok: true, sent: events.length };
  }

  function capture(error, context = {}) {
    if (!shouldSample()) return null;
    const event = {
      ...normalizeError(error),
      context,
      url: String(globalThis.location?.href || ""),
      userAgent: String(globalThis.navigator?.userAgent || ""),
      at: safeNow(),
    };
    const events = readEvents();
    events.push(event);
    writeEvents(events);
    return event;
  }

  function scheduleFlush(delay = 1200) {
    globalThis.setTimeout?.(() => {
      flush().catch(() => null);
    }, delay);
  }

  globalThis.BizziErrorMonitor = Object.freeze({
    capture,
    flush,
    recent: readEvents,
  });

  globalThis.addEventListener?.("error", (event) => {
    capture(event.error || event.message, { type: "window_error", filename: event.filename, lineno: event.lineno });
  });

  globalThis.addEventListener?.("unhandledrejection", (event) => {
    capture(event.reason, { type: "unhandled_rejection" });
  });

  globalThis.addEventListener?.("online", () => scheduleFlush(500));
  globalThis.addEventListener?.("visibilitychange", () => {
    if (globalThis.document?.visibilityState === "hidden") flush().catch(() => null);
  });
  globalThis.addEventListener?.("pagehide", () => {
    flush().catch(() => null);
  });
  scheduleFlush(1800);
})();
