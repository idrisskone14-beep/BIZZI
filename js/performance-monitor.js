(function () {
  "use strict";

  const STORAGE_KEY = "bizzi-performance-events";
  const MAX_EVENTS = 30;

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

  function saveEvent(event) {
    const events = readEvents();
    events.push(event);
    storageSet(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  }

  function connectionProfile() {
    const connection = globalThis.navigator?.connection || {};
    return {
      effectiveType: connection.effectiveType || "",
      downlink: Number(connection.downlink || 0),
      saveData: Boolean(connection.saveData),
    };
  }

  function collect() {
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    const paints = performance.getEntriesByType?.("paint") || [];
    const firstPaint = paints.find((entry) => entry.name === "first-paint");
    const firstContentfulPaint = paints.find((entry) => entry.name === "first-contentful-paint");
    return {
      at: new Date().toISOString(),
      url: String(globalThis.location?.href || ""),
      deviceMemory: Number(globalThis.navigator?.deviceMemory || 0),
      hardwareConcurrency: Number(globalThis.navigator?.hardwareConcurrency || 0),
      connection: connectionProfile(),
      navigation: nav ? {
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
        load: Math.round(nav.loadEventEnd || 0),
        transferSize: Math.round(nav.transferSize || 0),
        encodedBodySize: Math.round(nav.encodedBodySize || 0),
      } : {},
      paint: {
        firstPaint: firstPaint ? Math.round(firstPaint.startTime) : 0,
        firstContentfulPaint: firstContentfulPaint ? Math.round(firstContentfulPaint.startTime) : 0,
      },
    };
  }

  function markReady(label = "app_ready") {
    try {
      performance.mark(label);
    } catch {
      // Performance marks are best-effort.
    }
  }

  function record() {
    try {
      const event = collect();
      saveEvent(event);
      return event;
    } catch (error) {
      globalThis.BizziErrorMonitor?.capture(error, { module: "performance-monitor" });
      return null;
    }
  }

  function classifyDevice() {
    const memory = Number(globalThis.navigator?.deviceMemory || 0);
    const cores = Number(globalThis.navigator?.hardwareConcurrency || 0);
    if ((memory && memory <= 2) || (cores && cores <= 2)) return "telephone_entree_de_gamme";
    if ((memory && memory <= 4) || (cores && cores <= 4)) return "telephone_milieu_de_gamme";
    return "telephone_rapide";
  }

  globalThis.BizziPerformance = Object.freeze({
    record,
    recent: readEvents,
    markReady,
    classifyDevice,
  });
})();
