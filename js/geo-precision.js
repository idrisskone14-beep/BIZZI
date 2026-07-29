(function () {
  "use strict";

  const DEFAULTS = Object.freeze({
    targetAccuracy: 15,
    acceptableAccuracy: 60,
    fallbackAccuracy: 500,
    allowApproximate: true,
    timeout: 20000,
    settleDelay: 2200,
    maxPositionAge: 30000,
  });

  function accuracyOf(position) {
    const value = Number(position?.coords?.accuracy);
    return Number.isFinite(value) && value > 0 ? value : Infinity;
  }

  function quality(accuracy) {
    const meters = Number(accuracy);
    if (!Number.isFinite(meters) || meters <= 0) return "unknown";
    if (meters <= 15) return "excellent";
    if (meters <= 30) return "good";
    if (meters <= 60) return "acceptable";
    return "insufficient";
  }

  function point(position) {
    const lat = Number(position?.coords?.latitude);
    const lng = Number(position?.coords?.longitude);
    const accuracy = accuracyOf(position);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      lat,
      lng,
      accuracy: Number.isFinite(accuracy) ? Math.round(accuracy) : null,
      timestamp: Number(position?.timestamp || Date.now()),
    };
  }

  function acquire(options = {}) {
    const settings = { ...DEFAULTS, ...(options || {}) };
    return new Promise((resolve, reject) => {
      const geolocation = globalThis.navigator?.geolocation;
      if (!geolocation?.watchPosition) {
        reject(new Error("Géolocalisation précise indisponible sur cet appareil."));
        return;
      }

      let best = null;
      let watchId = null;
      let settled = false;
      let settleTimer = null;
      let hardTimer = null;

      const cleanup = () => {
        if (watchId !== null) geolocation.clearWatch?.(watchId);
        globalThis.clearTimeout?.(settleTimer);
        globalThis.clearTimeout?.(hardTimer);
      };
      const finish = (position) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(position);
      };
      const fail = (error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error instanceof Error ? error : new Error("Position GPS indisponible."));
      };

      hardTimer = globalThis.setTimeout?.(() => {
        if (best && (settings.allowApproximate || accuracyOf(best) <= settings.fallbackAccuracy)) {
          finish(best);
          return;
        }
        fail(new Error("Signal GPS indisponible. Saisissez le départ ou choisissez-le sur la carte."));
      }, settings.timeout);

      watchId = geolocation.watchPosition((position) => {
        if (Date.now() - Number(position?.timestamp || Date.now()) > settings.maxPositionAge) return;
        if (!best || accuracyOf(position) < accuracyOf(best)) best = position;
        if (accuracyOf(best) <= settings.targetAccuracy) {
          finish(best);
          return;
        }
        if (accuracyOf(best) <= settings.acceptableAccuracy && !settleTimer) {
          settleTimer = globalThis.setTimeout?.(() => finish(best), settings.settleDelay);
        }
      }, (error) => {
        if (best && (settings.allowApproximate || accuracyOf(best) <= settings.fallbackAccuracy)) {
          finish(best);
          return;
        }
        fail(error?.code === 1
          ? new Error("Autorisez la position précise dans les réglages du téléphone.")
          : new Error("Impossible d’obtenir une position GPS suffisamment précise."));
      }, {
        enableHighAccuracy: true,
        timeout: settings.timeout,
        maximumAge: 0,
      });
    });
  }

  globalThis.BizziGeoPrecision = Object.freeze({ acquire, point, quality });
})();
