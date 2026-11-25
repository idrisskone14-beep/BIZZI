import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-idempotency-key",
};

type Json = Record<string, unknown>;

function response(body: Json, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown, fallback = 0) {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function point(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const item = value as Json;
  const lat = number(item.lat, NaN);
  const lng = number(item.lng, NaN);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng, accuracy: Math.max(0, number(item.accuracy, 0)) || null };
}

function paymentMethod(value: unknown) {
  const method = text(value).toLowerCase();
  return ["cash", "wave", "orange_money", "mtn_money", "card"].includes(method) ? method : "cash";
}

function uniqueKey(req: Request, body: Json, prefix: string) {
  const supplied = req.headers.get("x-idempotency-key") || text(body.idempotency_key);
  return supplied || `${prefix}:${crypto.randomUUID()}`;
}

async function authenticatedUser(userClient: ReturnType<typeof createClient>) {
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

async function routeDetails(mapEndpoint: string, anonKey: string, body: Json) {
  const pickup = point(body.pickup_coordinates);
  const dropoff = point(body.dropoff_coordinates);
  if (!pickup || !dropoff) throw new Error("coordinates_required");
  if (!mapEndpoint) throw new Error("map_endpoint_missing");
  const result = await fetch(mapEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    body: JSON.stringify({
      mode: "route",
      pickup: text(body.pickup_address),
      dropoff: text(body.dropoff_address),
      pickup_coordinates: pickup,
      dropoff_coordinates: dropoff,
      city: text(body.city_name) || "Abidjan",
      country: "ci",
      language: "fr",
    }),
  });
  const payload = await result.json().catch(() => ({}));
  if (!result.ok || !payload.ok) throw new Error(payload.error || "route_unavailable");
  const distanceKm = number(payload.distance_km);
  const durationMinutes = number(payload.duration_minutes) || Math.max(1, Math.round(distanceKm / 0.4));
  if (distanceKm <= 0) throw new Error("route_unavailable");
  return { distanceKm, durationMinutes, pickup, dropoff, source: payload.source || "map" };
}

async function notify(service: ReturnType<typeof createClient>, userId: string | null, title: string, message: string, payload: Json) {
  if (!userId) return;
  await service.from("notifications").insert({ user_id: userId, type: "ride", title, message, payload }).catch(() => null);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response({ ok: false, error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const mapEndpoint = Deno.env.get("ZEYDS_MAP_ENDPOINT") || `${supabaseUrl}/functions/v1/map-geocode`;
  if (!supabaseUrl || !serviceRoleKey || !anonKey) return response({ ok: false, error: "missing_backend_env" }, 500);

  const authorization = req.headers.get("Authorization") || `Bearer ${anonKey}`;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const service = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const body = await req.json().catch(() => null) as Json | null;
  if (!body) return response({ ok: false, error: "invalid_json" }, 400);
  const action = text(body.action) || "config";
  const user = await authenticatedUser(userClient);

  try {
    if (action === "config") {
      const [{ data: categories, error: categoryError }, { data: settings, error: settingError }] = await Promise.all([
        service.from("vehicle_categories").select("id,code,name,description,icon,sort_order,minimum_fare,base_fare,per_km,per_minute,waiting_per_minute,free_waiting_minutes,commission_rate,currency").eq("is_active", true).order("sort_order"),
        service.from("ride_pricing_settings").select("city_name,driver_search_radius_km,quote_validity_seconds,rounding_step,stop_fee").eq("is_active", true),
      ]);
      if (categoryError || settingError) throw categoryError || settingError;
      return response({ ok: true, categories, settings });
    }

    if (action === "quote") {
      const route = await routeDetails(mapEndpoint, anonKey, body);
      const city = text(body.city_name) || "Abidjan";
      const { data: quoteData, error: quoteError } = await service.rpc("zeyds_ride_quote", {
        category_code: text(body.category_code) || "basic",
        city_input: city,
        distance_input: route.distanceKm,
        duration_input: route.durationMinutes,
        traffic_input: null,
        availability_input: null,
        time_input: null,
        promotion_code_input: text(body.promotion_code) || null,
      });
      if (quoteError) throw quoteError;
      const quote = quoteData as Json;
      let quoteId: string | null = null;
      let expiresAt: string | null = null;
      if (user) {
        expiresAt = new Date(Date.now() + number(quote.validity_seconds, 300) * 1000).toISOString();
        const { data: saved, error } = await service.from("pricing_quotes").insert({
          client_user_id: user.id,
          category_id: quote.category_id,
          city_name: city,
          pickup_address: text(body.pickup_address),
          pickup_latitude: route.pickup.lat,
          pickup_longitude: route.pickup.lng,
          dropoff_address: text(body.dropoff_address),
          dropoff_latitude: route.dropoff.lat,
          dropoff_longitude: route.dropoff.lng,
          distance_km: route.distanceKm,
          duration_minutes: route.durationMinutes,
          base_amount: quote.base_amount,
          traffic_multiplier: quote.traffic_multiplier,
          availability_multiplier: quote.availability_multiplier,
          time_multiplier: quote.time_multiplier,
          applied_multiplier: quote.applied_multiplier,
          discount_amount: quote.discount_amount,
          total_amount: quote.total_amount,
          pricing_snapshot: { ...quote, route_source: route.source },
          expires_at: expiresAt,
        }).select("id,expires_at").single();
        if (error) throw error;
        quoteId = saved.id;
        expiresAt = saved.expires_at;
      }
      return response({ ok: true, quote: { ...quote, quote_id: quoteId, expires_at: expiresAt, route_source: route.source } });
    }

    if (!user) return response({ ok: false, error: "authentication_required" }, 401);

    if (action === "create") {
      const key = uniqueKey(req, body, "ride-create");
      const existing = await service.from("rides").select("*").eq("idempotency_key", key).maybeSingle();
      if (existing.data) return response({ ok: true, idempotent: true, ride: existing.data });
      const quoteId = text(body.quote_id);
      const { data: quote, error: quoteError } = await service.from("pricing_quotes").select("*").eq("id", quoteId).eq("client_user_id", user.id).gt("expires_at", new Date().toISOString()).is("consumed_at", null).single();
      if (quoteError || !quote) return response({ ok: false, error: "quote_missing_or_expired" }, 409);
      const method = paymentMethod(body.payment_method);
      const { data: ride, error } = await service.from("rides").insert({
        client_user_id: user.id,
        client_name: text(body.client_name),
        client_phone: text(body.client_phone),
        category_id: quote.category_id,
        quote_id: quote.id,
        city_name: quote.city_name,
        pickup_address: quote.pickup_address,
        pickup_latitude: quote.pickup_latitude,
        pickup_longitude: quote.pickup_longitude,
        pickup_accuracy_m: Math.round(number(body.pickup_accuracy_m)) || null,
        dropoff_address: quote.dropoff_address,
        dropoff_latitude: quote.dropoff_latitude,
        dropoff_longitude: quote.dropoff_longitude,
        estimated_distance_km: quote.distance_km,
        estimated_duration_minutes: quote.duration_minutes,
        estimated_amount: quote.total_amount,
        commission_rate: number(quote.pricing_snapshot?.commission_rate, 0.19),
        payment_method: method,
        payment_status: method === "cash" ? "cash_due" : "pending",
        idempotency_key: key,
      }).select("*").single();
      if (error) throw error;
      await service.from("pricing_quotes").update({ consumed_at: new Date().toISOString() }).eq("id", quote.id).is("consumed_at", null);
      await service.from("ride_status_history").insert({ ride_id: ride.id, previous_status: null, new_status: "searching", actor_user_id: user.id, actor_role: "client" });
      await notify(service, user.id, "Recherche d’un chauffeur", "Votre course Zeyds est proposée aux chauffeurs disponibles.", { ride_id: ride.id });
      return response({ ok: true, ride }, 201);
    }

    if (action === "get") {
      const rideId = text(body.ride_id);
      const { data: ride, error } = await userClient.from("rides").select("*,vehicle_categories(*),driver_vehicles(*),ride_stops(*),ride_status_history(*)").eq("id", rideId).single();
      if (error) throw error;
      let location = null;
      if (ride.driver_id) {
        const latest = await userClient.from("driver_locations").select("latitude,longitude,accuracy_m,heading,speed_kmh,recorded_at").eq("driver_id", ride.driver_id).order("recorded_at", { ascending: false }).limit(1).maybeSingle();
        location = latest.data;
      }
      return response({ ok: true, ride, driver_location: location });
    }

    if (action === "nearby") {
      const { data: driver } = await service.from("ride_drivers").select("id,current_vehicle_category_id,status,verification_status,providers!inner(auth_user_id)").eq("providers.auth_user_id", user.id).maybeSingle();
      if (!driver || driver.status !== "available" || driver.verification_status !== "verified") return response({ ok: true, driver, rides: [] });
      const { data: rides, error } = await userClient.from("rides").select("id,city_name,pickup_address,pickup_latitude,pickup_longitude,dropoff_address,estimated_distance_km,estimated_duration_minutes,estimated_amount,category_id,created_at").eq("status", "searching").eq("category_id", driver.current_vehicle_category_id).order("created_at").limit(20);
      if (error) throw error;
      return response({ ok: true, driver, rides });
    }

    if (action === "driver_status") {
      const target = text(body.status) === "available" ? "available" : "offline";
      const { data: driver } = await service.from("ride_drivers").select("id,status,verification_status,providers!inner(auth_user_id)").eq("providers.auth_user_id", user.id).single();
      if (!driver || driver.verification_status !== "verified") return response({ ok: false, error: "driver_not_verified" }, 403);
      if (driver.status === "busy" && target === "offline") return response({ ok: false, error: "active_ride_in_progress" }, 409);
      const { data, error } = await service.from("ride_drivers").update({ status: target, last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", driver.id).select("id,status,verification_status").single();
      if (error) throw error;
      return response({ ok: true, driver: data });
    }

    if (action === "accept") {
      const { data, error } = await userClient.rpc("accept_ride", { ride_uuid: text(body.ride_id), operation_key: uniqueKey(req, body, "ride-accept") });
      if (error) throw error;
      return response({ ok: true, result: data });
    }

    if (action === "transition") {
      const allowed = ["driver_arriving", "driver_arrived", "in_progress", "completed", "cancelled"];
      const status = text(body.status);
      if (!allowed.includes(status)) return response({ ok: false, error: "invalid_status" }, 400);
      const { data, error } = await userClient.rpc("transition_ride", {
        ride_uuid: text(body.ride_id),
        target_status: status,
        operation_key: uniqueKey(req, body, `ride-${status}`),
        // Le montant final est recalculé par PostgreSQL depuis le devis garanti,
        // l'attente et les arrêts. Le mobile ne peut jamais imposer un prix.
        final_amount_input: null,
      });
      if (error) throw error;
      return response({ ok: true, result: data });
    }

    if (action === "add_stop") {
      const rideId = text(body.ride_id);
      const stopPoint = point(body.coordinates);
      if (!stopPoint || !text(body.address)) return response({ ok: false, error: "stop_invalid" }, 400);
      const { data: ride } = await service.from("rides").select("id,client_user_id,status").eq("id", rideId).single();
      if (!ride || ride.client_user_id !== user.id || !["searching", "accepted", "driver_arriving"].includes(ride.status)) return response({ ok: false, error: "stop_forbidden" }, 403);
      const count = await service.from("ride_stops").select("id", { count: "exact", head: true }).eq("ride_id", rideId);
      const { data, error } = await service.from("ride_stops").insert({ ride_id: rideId, position: (count.count || 0) + 1, address: text(body.address), latitude: stopPoint.lat, longitude: stopPoint.lng }).select("*").single();
      if (error) throw error;
      return response({ ok: true, stop: data });
    }

    if (action === "location") {
      const location = point(body.coordinates);
      if (!location) return response({ ok: false, error: "location_invalid" }, 400);
      const { data: driver } = await service.from("ride_drivers").select("id,providers!inner(auth_user_id)").eq("providers.auth_user_id", user.id).single();
      if (!driver) return response({ ok: false, error: "driver_profile_missing" }, 403);
      const rideId = text(body.ride_id) || null;
      const payload = { driver_id: driver.id, ride_id: rideId, latitude: location.lat, longitude: location.lng, accuracy_m: location.accuracy, heading: number(body.heading) || null, speed_kmh: number(body.speed_kmh) || null };
      const { error } = await service.from("driver_locations").insert(payload);
      if (error) throw error;
      if (rideId) {
        await service.channel(`ride:${rideId}`, { config: { private: true } }).send({ type: "broadcast", event: "driver_location", payload: { ...payload, recorded_at: new Date().toISOString() } }).catch(() => null);
      }
      return response({ ok: true });
    }

    if (action === "wallet") {
      const { data: driver } = await service.from("ride_drivers").select("id,providers!inner(auth_user_id)").eq("providers.auth_user_id", user.id).single();
      if (!driver) return response({ ok: false, error: "driver_profile_missing" }, 403);
      const { data: wallet } = await userClient.from("professional_wallets").select("*,wallet_transactions(*)").eq("driver_id", driver.id).single();
      return response({ ok: true, wallet });
    }

    if (action === "wallet_recharge") {
      const amount = Math.round(number(body.amount));
      if (amount < 500) return response({ ok: false, error: "minimum_recharge_500" }, 400);
      const { data: driver } = await service.from("ride_drivers").select("id,providers!inner(auth_user_id)").eq("providers.auth_user_id", user.id).single();
      if (!driver) return response({ ok: false, error: "driver_profile_missing" }, 403);
      const reference = uniqueKey(req, body, "ride-wallet");
      const checkoutEndpoint = Deno.env.get("ZEYDS_PAYMENT_CHECKOUT_ENDPOINT") || `${supabaseUrl}/functions/v1/payment-checkout`;
      const checkout = await fetch(checkoutEndpoint, { method: "POST", headers: { "Content-Type": "application/json", apikey: anonKey, Authorization: `Bearer ${anonKey}` }, body: JSON.stringify({ payment_type: "ride_wallet_recharge", reference, amount, currency: "XOF", method: text(body.method), customer_phone: text(body.phone), metadata: { driver_id: driver.id } }) });
      const checkoutPayload = await checkout.json().catch(() => ({}));
      if (!checkout.ok) return response({ ok: false, error: "wallet_checkout_failed", detail: checkoutPayload }, 502);
      return response({ ok: true, reference, checkout: checkoutPayload });
    }

    return response({ ok: false, error: "unknown_action" }, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const conflict = /already|expired|insufficient|invalid_ride_transition|duplicate/i.test(message);
    return response({ ok: false, error: message }, conflict ? 409 : 400);
  }
});
