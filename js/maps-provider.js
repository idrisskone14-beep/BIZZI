(function () {
  "use strict";

  const REVERSE_CACHE_KEY = "bizzi-reverse-geocode-v304";
  const REVERSE_CACHE_TTL = 30 * 60 * 1000;
  const REVERSE_CACHE_LIMIT = 40;
  const SUGGEST_CACHE_KEY = "bizzi-address-suggestions-v304";
  const SUGGEST_CACHE_TTL = 10 * 60 * 1000;
  const SUGGEST_CACHE_LIMIT = 40;
  const pendingReverse = new Map();
  const pendingSuggest = new Map();

  function cfg() {
    return globalThis.BizziConfig?.maps || {};
  }

  function hasBackend() {
    return Boolean(cfg().geocodingEndpoint);
  }

  function normalizeDistance(value) {
    const distance = Number(value || 0);
    return Number.isFinite(distance) && distance > 0 ? Math.round(distance * 10) / 10 : 0;
  }

  function cleanCoordinates(value) {
    const lat = Number(value?.lat);
    const lng = Number(value?.lng);
    const accuracy = Number(value?.accuracy);
    const timestamp = Number(value?.timestamp);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return {
      lat,
      lng,
      ...(Number.isFinite(accuracy) && accuracy > 0 ? { accuracy: Math.round(accuracy) } : {}),
      ...(Number.isFinite(timestamp) && timestamp > 0 ? { timestamp } : {}),
    };
  }

  function authHeaders() {
    const anonKey = globalThis.BizziConfig?.supabase?.anonKey || "";
    return {
      "Content-Type": "application/json",
      ...(anonKey ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` } : {}),
    };
  }

  async function backendRequest(payload) {
    if (!hasBackend()) return null;
    const response = await fetch(cfg().geocodingEndpoint, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || data.message || `Cartographie ${response.status}`);
    }
    return data;
  }

  async function routeDistance(pickup = "", dropoff = "", city = "", options = {}) {
    const maps = cfg();
    const pickupCoordinates = cleanCoordinates(options.pickupCoordinates);
    const dropoffCoordinates = cleanCoordinates(options.dropoffCoordinates);
    const data = await backendRequest({
      mode: "route",
      provider: maps.provider || "mapbox",
      pickup,
      ...(pickupCoordinates ? { pickup_coordinates: pickupCoordinates } : {}),
      dropoff,
      ...(dropoffCoordinates ? { dropoff_coordinates: dropoffCoordinates } : {}),
      city,
      country: maps.country || "ci",
      language: maps.language || "fr",
    });
    if (!data) return null;
    const distanceKm = normalizeDistance(data.distance_km || data.distanceKm);
    if (!distanceKm) return null;
    return {
      distanceKm,
      from: data.from || pickup,
      to: data.to || dropoff,
      source: data.source || "backend-map",
      fromCoordinates: cleanCoordinates(data.from_coordinates),
      toCoordinates: cleanCoordinates(data.to_coordinates),
    };
  }

  async function geocode(query = "", city = "") {
    const maps = cfg();
    return backendRequest({
      mode: "geocode",
      provider: maps.provider || "mapbox",
      query,
      city,
      country: maps.country || "ci",
      language: maps.language || "fr",
    });
  }

  function normalizedQuery(value = "") {
    return String(value || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function suggestCacheKey(query, options = {}) {
    const point = cleanCoordinates(options.proximity);
    const nearby = point ? `${point.lat.toFixed(2)}:${point.lng.toFixed(2)}` : "";
    return `${normalizedQuery(query)}:${normalizedQuery(options.city)}:${nearby}`;
  }

  function readSuggestCache() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SUGGEST_CACHE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function cachedSuggestions(key) {
    const now = Date.now();
    const item = readSuggestCache().find((entry) => entry?.key === key && now - Number(entry.at || 0) < SUGGEST_CACHE_TTL);
    return Array.isArray(item?.value) ? item.value : null;
  }

  function storeSuggestions(key, value) {
    try {
      const next = [
        { key, at: Date.now(), value },
        ...readSuggestCache().filter((entry) => entry?.key !== key),
      ].slice(0, SUGGEST_CACHE_LIMIT);
      localStorage.setItem(SUGGEST_CACHE_KEY, JSON.stringify(next));
    } catch (_) {
      // Les suggestions restent disponibles si le stockage privé est bloqué.
    }
  }

  async function suggest(query = "", options = {}) {
    const value = String(query || "").trim();
    if (value.length < 2 || !hasBackend()) return [];
    const key = suggestCacheKey(value, options);
    const cached = options.refresh ? null : cachedSuggestions(key);
    if (cached) return cached;
    if (pendingSuggest.has(key)) return pendingSuggest.get(key);
    const maps = cfg();
    const proximity = cleanCoordinates(options.proximity);
    const request = backendRequest({
      mode: "suggest",
      provider: maps.provider || "mapbox",
      query: value,
      city: String(options.city || "").trim(),
      ...(proximity ? { proximity } : {}),
      country: maps.country || "ci",
      language: maps.language || "fr",
    }).then((data) => {
      const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
      storeSuggestions(key, suggestions);
      return suggestions;
    }).finally(() => pendingSuggest.delete(key));
    pendingSuggest.set(key, request);
    return request;
  }

  function reverseCacheKey(point) {
    return `${Number(point.lat).toFixed(4)}:${Number(point.lng).toFixed(4)}`;
  }

  function readReverseCache() {
    try {
      const parsed = JSON.parse(localStorage.getItem(REVERSE_CACHE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function cachedReverse(point) {
    const key = reverseCacheKey(point);
    const now = Date.now();
    const item = readReverseCache().find((entry) => entry?.key === key && now - Number(entry.at || 0) < REVERSE_CACHE_TTL);
    return item?.value || null;
  }

  function storeReverse(point, value) {
    try {
      const key = reverseCacheKey(point);
      const next = [
        { key, at: Date.now(), value },
        ...readReverseCache().filter((entry) => entry?.key !== key),
      ].slice(0, REVERSE_CACHE_LIMIT);
      localStorage.setItem(REVERSE_CACHE_KEY, JSON.stringify(next));
    } catch (_) {
      // La précision reste fonctionnelle même si le stockage privé est bloqué.
    }
  }

  async function reverseGeocode(value, options = {}) {
    const maps = cfg();
    const point = cleanCoordinates(value);
    if (!point) throw new Error("Coordonnées GPS invalides.");
    const cached = options.refresh ? null : cachedReverse(point);
    if (cached) return { ...cached, cached: true };
    const key = reverseCacheKey(point);
    if (pendingReverse.has(key)) return pendingReverse.get(key);
    const request = backendRequest({
      mode: "reverse",
      provider: maps.provider || "mapbox",
      coordinates: point,
      country: maps.country || "ci",
      language: maps.language || "fr",
    }).then((data) => {
      if (!data) return null;
      const result = { ...data, lat: point.lat, lng: point.lng, accuracy: point.accuracy, timestamp: point.timestamp };
      storeReverse(point, result);
      return result;
    }).finally(() => pendingReverse.delete(key));
    pendingReverse.set(key, request);
    return request;
  }

  globalThis.BizziMaps = Object.freeze({
    hasBackend,
    routeDistance,
    geocode,
    suggest,
    reverseGeocode,
    cleanCoordinates,
  });
})();
