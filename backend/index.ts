import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type GeoPoint = {
  label: string;
  lat: number;
  lng: number;
  source: string;
  accuracy?: number;
};

type GeoSuggestion = GeoPoint & {
  primary_label: string;
  full_address: string;
  neighborhood: string;
  commune: string;
  city: string;
};

type ReverseAddress = GeoPoint & {
  primary_label: string;
  full_address: string;
  place_name: string;
  house_number: string;
  road: string;
  neighborhood: string;
  commune: string;
  city: string;
  point_of_interest: string;
  plus_code: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function coordinates(value: unknown): GeoPoint | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const lat = Number(candidate.lat);
  const lng = Number(candidate.lng);
  const accuracy = Number(candidate.accuracy);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return {
    label: "Position actuelle GPS",
    lat,
    lng,
    source: "device-gps",
    ...(Number.isFinite(accuracy) && accuracy > 0 ? { accuracy: Math.round(accuracy) } : {}),
  };
}

function optionalSupabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function logLookup(payload: Record<string, unknown>) {
  const supabase = optionalSupabase();
  if (!supabase) return;
  await supabase.from("map_lookup_events").insert(payload);
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const lat1 = a.lat * rad;
  const lat2 = b.lat * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round((6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))) * 10) / 10;
}

function preferredProviders(requestedProvider = "") {
  const strict = (Deno.env.get("BIZZI_MAPS_STRICT_PROVIDER") || "").toLowerCase() === "true";
  const configured = text(Deno.env.get("BIZZI_MAPS_PROVIDER")).toLowerCase();
  const requested = requestedProvider.toLowerCase();
  const provider = requested || configured || "auto";
  if (provider === "openstreetmap" || provider === "osm") return ["osm", ...(strict ? [] : ["mapbox"])];
  if (provider === "mapbox") return ["mapbox", ...(strict ? [] : ["osm"])];
  return Deno.env.get("MAPBOX_ACCESS_TOKEN") ? ["mapbox", "osm"] : ["osm", "mapbox"];
}

async function mapboxGeocode(query: string, language = "fr", country = "ci"): Promise<GeoPoint> {
  const token = Deno.env.get("MAPBOX_ACCESS_TOKEN") || "";
  if (!token) throw new Error("MAPBOX_ACCESS_TOKEN absent");
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("access_token", token);
  url.searchParams.set("language", language);
  url.searchParams.set("country", country);
  url.searchParams.set("limit", "1");
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Mapbox geocode ${response.status}`);
  const feature = payload.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) throw new Error("Lieu introuvable");
  return {
    label: feature.properties?.full_address || feature.properties?.name || query,
    lng: Number(coordinates[0]),
    lat: Number(coordinates[1]),
    source: "mapbox",
  };
}

async function mapboxSuggest(
  query: string,
  language = "fr",
  country = "ci",
  proximity: GeoPoint | null = null,
): Promise<GeoSuggestion[]> {
  const token = Deno.env.get("MAPBOX_ACCESS_TOKEN") || "";
  if (!token) throw new Error("MAPBOX_ACCESS_TOKEN absent");
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("access_token", token);
  url.searchParams.set("language", language);
  url.searchParams.set("country", country);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("limit", "6");
  if (proximity) url.searchParams.set("proximity", `${proximity.lng},${proximity.lat}`);
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Mapbox suggest ${response.status}`);
  return (Array.isArray(payload.features) ? payload.features : []).map((feature: Record<string, unknown>) => {
    const geometry = feature.geometry as Record<string, unknown> | undefined;
    const values = Array.isArray(geometry?.coordinates) ? geometry.coordinates : [];
    const properties = (feature.properties || {}) as Record<string, unknown>;
    const context = (properties.context || {}) as Record<string, Record<string, unknown>>;
    const label = text(properties.name) || text(properties.full_address);
    const fullAddress = text(properties.full_address) || [label, text(properties.place_formatted)].filter(Boolean).join(", ");
    return {
      label,
      primary_label: label,
      full_address: fullAddress,
      neighborhood: text(context.neighborhood?.name) || text(context.locality?.name),
      commune: text(context.district?.name) || text(context.place?.name),
      city: text(context.place?.name) || text(context.region?.name),
      lng: Number(values[0]),
      lat: Number(values[1]),
      source: "mapbox",
    };
  }).filter((item: GeoSuggestion) => item.primary_label && Number.isFinite(item.lat) && Number.isFinite(item.lng));
}

function coordinateIdentifier(lat: number, lng: number) {
  return `GPS ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function detailedAddress(input: Partial<ReverseAddress> & GeoPoint): ReverseAddress {
  const poi = text(input.point_of_interest);
  const number = text(input.house_number);
  const road = text(input.road);
  const neighborhood = text(input.neighborhood);
  const commune = text(input.commune);
  const city = text(input.city);
  const plusCode = text(input.plus_code) || coordinateIdentifier(input.lat, input.lng);
  const street = [number, road].filter(Boolean).join(" ");
  const primary = poi || street || road || plusCode || neighborhood || commune || city;
  const full = text(input.full_address)
    || [poi, street, neighborhood, commune, city, "Côte d’Ivoire"].filter((value, index, list) => value && list.indexOf(value) === index).join(", ");
  return {
    label: primary,
    lat: input.lat,
    lng: input.lng,
    source: input.source,
    ...(input.accuracy ? { accuracy: input.accuracy } : {}),
    primary_label: primary,
    full_address: full || primary,
    place_name: text(input.place_name) || poi,
    house_number: number,
    road,
    neighborhood,
    commune,
    city,
    point_of_interest: poi,
    plus_code: plusCode,
  };
}

async function mapboxReverse(point: GeoPoint, language = "fr", country = "ci"): Promise<ReverseAddress> {
  const token = Deno.env.get("MAPBOX_ACCESS_TOKEN") || "";
  if (!token) throw new Error("MAPBOX_ACCESS_TOKEN absent");
  const url = new URL("https://api.mapbox.com/search/geocode/v6/reverse");
  url.searchParams.set("longitude", String(point.lng));
  url.searchParams.set("latitude", String(point.lat));
  url.searchParams.set("access_token", token);
  url.searchParams.set("language", language);
  url.searchParams.set("country", country);
  url.searchParams.set("limit", "1");
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Mapbox reverse ${response.status}`);
  const feature = payload.features?.[0];
  const properties = feature?.properties || {};
  const context = properties.context || {};
  const featureType = text(properties.feature_type);
  const name = text(properties.name);
  return detailedAddress({
    label: name,
    lat: point.lat,
    lng: point.lng,
    source: "mapbox",
    accuracy: point.accuracy,
    point_of_interest: featureType === "poi" ? name : "",
    place_name: name,
    house_number: text(properties.address_number) || text(context.address?.address_number),
    road: featureType === "street" ? name : text(context.street?.name),
    neighborhood: text(context.neighborhood?.name) || text(context.locality?.name),
    commune: text(context.district?.name) || text(context.place?.name),
    city: text(context.place?.name) || text(context.region?.name),
    plus_code: text(properties.plus_code),
    full_address: text(properties.full_address) || text(properties.place_formatted),
  });
}

async function mapboxRoute(from: GeoPoint, to: GeoPoint) {
  const token = Deno.env.get("MAPBOX_ACCESS_TOKEN") || "";
  if (!token) throw new Error("MAPBOX_ACCESS_TOKEN absent");
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("overview", "false");
  url.searchParams.set("steps", "false");
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Mapbox route ${response.status}`);
  const meters = Number(payload.routes?.[0]?.distance || 0);
  if (!meters) throw new Error("Distance route introuvable");
  return Math.round((meters / 1000) * 10) / 10;
}

function osmUserAgent() {
  return Deno.env.get("OPENSTREETMAP_USER_AGENT")
    || Deno.env.get("BIZZI_MAPS_USER_AGENT")
    || "Bizzi/1.0 contact@bizzi-africa.com";
}

async function osmGeocode(query: string): Promise<GeoPoint> {
  const base = Deno.env.get("OPENSTREETMAP_NOMINATIM_URL") || "https://nominatim.openstreetmap.org/search";
  const url = new URL(base);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "ci");
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": osmUserAgent(),
    },
  });
  const payload = await response.json().catch(() => []);
  if (!response.ok) throw new Error(`OpenStreetMap geocode ${response.status}`);
  const item = Array.isArray(payload) ? payload[0] : null;
  if (!item?.lat || !item?.lon) throw new Error("Lieu OpenStreetMap introuvable");
  return {
    label: item.display_name || query,
    lat: Number(item.lat),
    lng: Number(item.lon),
    source: "openstreetmap",
  };
}

async function osmSuggest(query: string): Promise<GeoSuggestion[]> {
  const base = Deno.env.get("OPENSTREETMAP_NOMINATIM_URL") || "https://nominatim.openstreetmap.org/search";
  const url = new URL(base);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("namedetails", "1");
  url.searchParams.set("dedupe", "1");
  url.searchParams.set("countrycodes", "ci");
  url.searchParams.set("accept-language", "fr");
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": osmUserAgent(),
    },
  });
  const payload = await response.json().catch(() => []);
  if (!response.ok) throw new Error(`OpenStreetMap suggest ${response.status}`);
  return (Array.isArray(payload) ? payload : []).map((item: Record<string, unknown>) => {
    const address = (item.address || {}) as Record<string, unknown>;
    const label = text(item.name)
      || text((item.namedetails as Record<string, unknown> | undefined)?.name)
      || text(address.amenity)
      || text(address.shop)
      || text(address.tourism)
      || text(address.road)
      || text(item.display_name).split(",")[0];
    return {
      label,
      primary_label: label,
      full_address: text(item.display_name),
      neighborhood: text(address.neighbourhood) || text(address.suburb) || text(address.quarter),
      commune: text(address.city_district) || text(address.municipality) || text(address.county),
      city: text(address.city) || text(address.town) || text(address.village) || text(address.state),
      lat: Number(item.lat),
      lng: Number(item.lon),
      source: "openstreetmap",
    };
  }).filter((item: GeoSuggestion) => item.primary_label && Number.isFinite(item.lat) && Number.isFinite(item.lng));
}

async function osmReverse(point: GeoPoint): Promise<ReverseAddress> {
  const configured = Deno.env.get("OPENSTREETMAP_NOMINATIM_URL") || "https://nominatim.openstreetmap.org/search";
  const base = configured.replace(/\/search\/?$/i, "/reverse");
  const url = new URL(base);
  url.searchParams.set("lat", String(point.lat));
  url.searchParams.set("lon", String(point.lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("namedetails", "1");
  url.searchParams.set("zoom", "18");
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": osmUserAgent(),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.address) throw new Error(`OpenStreetMap reverse ${response.status}`);
  const address = payload.address || {};
  const poi = text(address.amenity)
    || text(address.tourism)
    || text(address.shop)
    || text(address.office)
    || text(address.building)
    || (["house", "building", "amenity", "tourism"].includes(text(payload.type)) ? text(payload.name) : "");
  return detailedAddress({
    label: text(payload.display_name),
    lat: point.lat,
    lng: point.lng,
    source: "openstreetmap",
    accuracy: point.accuracy,
    point_of_interest: poi,
    place_name: text(payload.name) || poi,
    house_number: text(address.house_number),
    road: text(address.road) || text(address.pedestrian) || text(address.residential) || text(address.path),
    neighborhood: text(address.neighbourhood) || text(address.suburb) || text(address.quarter),
    commune: text(address.city_district) || text(address.municipality) || text(address.county),
    city: text(address.city) || text(address.town) || text(address.village) || text(address.state),
    plus_code: text(address.plus_code) || text(payload.extratags?.plus_code) || text(address.postcode),
    full_address: text(payload.display_name),
  });
}

async function osmRoute(from: GeoPoint, to: GeoPoint) {
  const base = Deno.env.get("OPENSTREETMAP_ROUTING_URL") || "https://router.project-osrm.org";
  const url = new URL(`/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}`, base);
  url.searchParams.set("overview", "false");
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("steps", "false");
  const response = await fetch(url, { headers: { "User-Agent": osmUserAgent() } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.code !== "Ok") throw new Error(payload.message || `OpenStreetMap route ${response.status}`);
  const meters = Number(payload.routes?.[0]?.distance || 0);
  if (!meters) throw new Error("Distance OpenStreetMap introuvable");
  return Math.round((meters / 1000) * 10) / 10;
}

async function geocodeWithProvider(provider: string, query: string, language: string, country: string) {
  return provider === "mapbox" ? mapboxGeocode(query, language, country) : osmGeocode(query);
}

async function routeWithProvider(provider: string, from: GeoPoint, to: GeoPoint) {
  return provider === "mapbox" ? mapboxRoute(from, to) : osmRoute(from, to);
}

async function reverseWithProvider(provider: string, point: GeoPoint, language: string, country: string) {
  return provider === "mapbox" ? mapboxReverse(point, language, country) : osmReverse(point);
}

async function suggestWithProvider(
  provider: string,
  query: string,
  language: string,
  country: string,
  proximity: GeoPoint | null,
) {
  return provider === "mapbox"
    ? mapboxSuggest(query, language, country, proximity)
    : osmSuggest(query);
}

async function geocodeWithFallback(query: string, language: string, country: string, providers: string[]) {
  const errors: string[] = [];
  for (const provider of providers) {
    try {
      return await geocodeWithProvider(provider, query, language, country);
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : "erreur"}`);
    }
  }
  throw new Error(errors.join(" | ") || "Geocodage indisponible");
}

async function routeDistanceWithFallback(from: GeoPoint, to: GeoPoint, providers: string[]) {
  const errors: string[] = [];
  for (const provider of providers) {
    try {
      return {
        distanceKm: await routeWithProvider(provider, from, to),
        source: provider === "mapbox" ? "mapbox" : "openstreetmap",
        approximated: false,
      };
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : "erreur"}`);
    }
  }
  return {
    distanceKm: Math.round(distanceKm(from, to) * 1.35 * 10) / 10,
    source: "fallback-haversine",
    approximated: true,
    errors,
  };
}

async function reverseWithFallback(point: GeoPoint, language: string, country: string, providers: string[]) {
  const errors: string[] = [];
  for (const provider of providers) {
    try {
      return await reverseWithProvider(provider, point, language, country);
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : "erreur"}`);
    }
  }
  throw new Error(errors.join(" | ") || "Adresse précise indisponible");
}

async function suggestWithFallback(
  query: string,
  language: string,
  country: string,
  providers: string[],
  proximity: GeoPoint | null,
) {
  const errors: string[] = [];
  for (const provider of providers) {
    try {
      const suggestions = await suggestWithProvider(provider, query, language, country, proximity);
      if (suggestions.length) return { suggestions, source: suggestions[0].source };
      errors.push(`${provider}: aucun résultat`);
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : "erreur"}`);
    }
  }
  if (errors.length) console.warn("Suggestions cartographiques indisponibles", errors.join(" | "));
  return { suggestions: [], source: "none" };
}

Deno.serve({ port: Number(Deno.env.get("PORT")) || 8000 }, async (req) => {
  if (req.method === "GET" && new URL(req.url).pathname === "/") return jsonResponse({ ok: true, service: "bizzi-backend-map-geocode" });
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return jsonResponse({ ok: false, error: "invalid_json" }, 400);

  const mode = text(body.mode) || "geocode";
  const language = text(body.language) || "fr";
  const country = text(body.country) || "ci";
  const city = text(body.city);
  const providers = preferredProviders(text(body.provider));
  const providerName = providers.join(",");

  try {
    if (mode === "reverse") {
      const point = coordinates(body.coordinates);
      if (!point) return jsonResponse({ ok: false, error: "missing_coordinates" }, 400);
      const result = await reverseWithFallback(point, language, country, providers);
      await logLookup({
        mode,
        provider_name: result.source,
        query_text: `${point.lat},${point.lng}`,
        city: result.city || result.commune,
        status: "ok",
        payload: { result, providers, accuracy: point.accuracy || null },
      });
      return jsonResponse({ ok: true, providers_tried: providers, ...result });
    }

    if (mode === "suggest") {
      const rawQuery = text(body.query);
      if (rawQuery.length < 2) return jsonResponse({ ok: true, source: "none", suggestions: [], providers_tried: [] });
      const query = [rawQuery, city, "Côte d'Ivoire"].filter(Boolean).join(", ");
      const proximity = coordinates(body.proximity);
      const result = await suggestWithFallback(query, language, country, providers, proximity);
      return jsonResponse({
        ok: true,
        source: result.source,
        providers_tried: providers,
        suggestions: result.suggestions,
      });
    }

    if (mode === "route") {
      const pickupCoordinates = coordinates(body.pickup_coordinates);
      const dropoffCoordinates = coordinates(body.dropoff_coordinates);
      const pickup = [text(body.pickup), city, "Côte d'Ivoire"].filter(Boolean).join(", ");
      const dropoff = [text(body.dropoff), city, "Côte d'Ivoire"].filter(Boolean).join(", ");
      if ((!pickupCoordinates && !pickup) || (!dropoffCoordinates && !dropoff)) return jsonResponse({ ok: false, error: "missing_route_fields" }, 400);
      const from = pickupCoordinates || await geocodeWithFallback(pickup, language, country, providers);
      const to = dropoffCoordinates || await geocodeWithFallback(dropoff, language, country, providers);
      const route = await routeDistanceWithFallback(from, to, providers);
      await logLookup({
        mode,
        provider_name: route.source,
        query_text: `${pickupCoordinates ? "Position actuelle GPS" : pickup} -> ${dropoff}`,
        city,
        distance_km: route.distanceKm,
        status: route.approximated ? "approximated" : "ok",
        payload: { from, to, providers, route },
      });
      return jsonResponse({
        ok: true,
        source: route.source,
        providers_tried: providers,
        distance_km: route.distanceKm,
        approximated: route.approximated,
        from: from.label,
        to: to.label,
        from_coordinates: from,
        to_coordinates: to,
      });
    }

    const query = [text(body.query), city, "Côte d'Ivoire"].filter(Boolean).join(", ");
    if (!query) return jsonResponse({ ok: false, error: "missing_query" }, 400);
    const result = await geocodeWithFallback(query, language, country, providers);
    await logLookup({
      mode,
      provider_name: result.source,
      query_text: query,
      city,
      status: "ok",
      payload: { result, providers },
    });
    return jsonResponse({ ok: true, providers_tried: providers, ...result });
  } catch (error) {
    await logLookup({
      mode,
      provider_name: providerName,
      query_text: String(text(body.query) || text(body.pickup) || ""),
      city,
      status: "failed",
      payload: { error: error instanceof Error ? error.message : "map_error", providers },
    });
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "map_error", providers_tried: providers }, 400);
  }
});
