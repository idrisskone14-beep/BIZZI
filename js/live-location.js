(function () {
  "use strict";

  let watchId = null;
  let lastPosition = null;
  let lastSentAt = 0;

  function distanceMeters(left, right) {
    if (!left || !right) return Infinity;
    const rad = Math.PI / 180;
    const dLat = (Number(right.latitude) - Number(left.latitude)) * rad;
    const dLng = (Number(right.longitude) - Number(left.longitude)) * rad;
    const lat1 = Number(left.latitude) * rad;
    const lat2 = Number(right.latitude) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function shouldSend(coords, options = {}) {
    if (!lastPosition) return true;
    const elapsed = Date.now() - lastSentAt;
    const moved = distanceMeters(lastPosition, coords);
    const precisionImproved = Number(coords.accuracy || Infinity) + 10 < Number(lastPosition.accuracy_meters || Infinity);
    return elapsed >= Number(options.maxSilenceMs || 30000)
      || moved >= Number(options.minimumMoveMeters || 25)
      || (elapsed >= Number(options.minimumIntervalMs || 5000) && precisionImproved);
  }

  function endpoint() {
    return globalThis.BizziConfig?.realtime?.locationEndpoint || "";
  }

  function canTrack() {
    return Boolean(globalThis.navigator?.geolocation && endpoint());
  }

  async function sendPosition(provider, position, options = {}) {
    const url = endpoint();
    if (!url || !provider?.id || !provider?.phone) return { ok: false, reason: "missing_config" };
    const coords = position.coords || {};
    const payload = {
      provider_id: provider.remoteId || provider.id,
      provider_phone: provider.phone,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy_meters: coords.accuracy || null,
      is_available: true,
    };
    if (typeof options.onPosition === "function") {
      try {
        options.onPosition({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy || null,
          at: new Date().toISOString(),
        });
      } catch (error) {
        globalThis.BizziErrorMonitor?.capture?.(error, { module: "live-location-callback" });
      }
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || `Live location ${response.status}`);
    lastPosition = { ...payload, at: new Date().toISOString() };
    lastSentAt = Date.now();
    return data;
  }

  function start(provider, options = {}) {
    if (!canTrack()) return { ok: false, reason: "geolocation_or_endpoint_missing" };
    stop();
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!shouldSend(position.coords || {}, options)) return;
        sendPosition(provider, position, options).catch((error) => {
          globalThis.BizziErrorMonitor?.capture?.(error, { module: "live-location", providerId: provider?.id || "" });
        });
      },
      (error) => {
        globalThis.BizziErrorMonitor?.capture?.(error, { module: "live-location-permission" });
      },
      {
        enableHighAccuracy: options.highAccuracy !== false,
        maximumAge: options.maximumAge || 30000,
        timeout: options.timeout || 12000,
      }
    );
    return { ok: true, watchId };
  }

  function stop() {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
    watchId = null;
    lastSentAt = 0;
  }

  globalThis.BizziLiveLocation = Object.freeze({
    canTrack,
    start,
    stop,
    last: () => lastPosition,
  });
})();
