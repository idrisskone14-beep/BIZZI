// Tests des fonctions api/ contre zeyds-prod (donnees de test nettoyees a la fin). Necessite .env (TARGET_URL).
// Usage : cd scripts/migration-neon && node --test functions.test.mjs
import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const env = Object.fromEntries(fs.readFileSync(new URL("./.env", import.meta.url), "utf8").split(/\r?\n/).filter(Boolean).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
process.env.DATABASE_URL = env.TARGET_URL;
const API = new URL("../../api/", import.meta.url).href;
const { sql } = await import(API + "_lib/http.js");
const { handleSmsNotify, opportunityMessage } = await import(API + "_lib/sms-notify.js");
const pushSubscribe = await import(API + "push-subscribe.js");
const mapGeocode = await import(API + "map-geocode.js");
const upload = await import(API + "upload.js");
const privateFile = await import(API + "private-file.js");

const post = (body) => new Request("https://zeyds.test/api/x", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const cleanup = [];
after(async () => { for (const fn of cleanup) await fn(); });

test("push-subscribe enregistre puis met a jour un abonnement (base reelle)", async () => {
  const endpoint = `https://fcm.googleapis.com/fcm/send/test-${Date.now()}`;
  cleanup.push(() => sql()`delete from public.push_subscriptions where endpoint = ${endpoint}`);
  const sub = { endpoint, keys: { p256dh: "cle", auth: "auth" } };
  let res = await pushSubscribe.POST(post({ owner_type: "provider", provider_id: "p-test", subscription: sub }));
  assert.equal(res.status, 200);
  res = await pushSubscribe.POST(post({ owner_type: "client", phone: "07 11 27 84 92", subscription: sub }));
  assert.equal(res.status, 200);
  const rows = await sql()`select owner_type, phone, provider_id from public.push_subscriptions where endpoint = ${endpoint}`;
  assert.deepEqual(rows, [{ owner_type: "client", phone: "2250711278492", provider_id: null }]);
  assert.equal((await pushSubscribe.POST(post({ phone: "0711278492", subscription: { endpoint: "http://pas-https" } }))).status, 400);
});

test("map-geocode : suggestions et distance via OpenStreetMap, journal en base", async () => {
  delete process.env.MAPBOX_ACCESS_TOKEN;
  const before = (await sql()`select count(*)::int as n from public.map_lookup_events`)[0].n;
  const res = await mapGeocode.POST(post({ mode: "route", pickup_coordinates: { lat: 5.3364, lng: -4.0267 }, dropoff_coordinates: { lat: 5.3599, lng: -3.9870 }, city: "Abidjan" }));
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  assert.ok(data.distance_km > 1 && data.distance_km < 30, `distance ${data.distance_km}`);
  const afterCount = (await sql()`select count(*)::int as n from public.map_lookup_events`)[0].n;
  assert.equal(afterCount, before + 1);
  cleanup.push(() => sql()`delete from public.map_lookup_events where id = (select id from public.map_lookup_events order by created_at desc limit 1)`);
});

test("upload refuse les envois invalides sans toucher au stockage", async () => {
  const form = (kind, file) => { const f = new FormData(); f.set("kind", kind); if (file) f.set("file", file); return new Request("https://zeyds.test/api/upload", { method: "POST", body: f }); };
  assert.equal((await upload.POST(form("inconnu", new File(["x"], "a.jpg", { type: "image/jpeg" })))).status, 400);
  assert.equal((await upload.POST(form("providerPhotos", new File(["x"], "a.exe", { type: "application/x-msdownload" })))).status, 415);
  assert.equal((await upload.POST(form("providerPhotos", new File([new Uint8Array(5 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" })))).status, 413);
  delete process.env.BLOB_READ_WRITE_TOKEN;
  assert.equal((await upload.POST(form("providerPhotos", new File(["x"], "a.jpg", { type: "image/jpeg" })))).status, 503);
});

test("private-file refuse sans jeton admin valide", async () => {
  process.env.NEON_AUTH_ISSUER = "https://ep-dry-night-bgn2xvtv.neonauth.c-9.eu-central-1.aws.neon.tech/neondb/auth";
  process.env.NEON_AUTH_JWKS_URL = "https://ep-dry-night-bgn2xvtv.neonauth.c-9.eu-central-1.aws.neon.tech/neondb/auth/.well-known/jwks.json";
  const anon = (await (await fetch("https://ep-dry-night-bgn2xvtv.neonauth.c-9.eu-central-1.aws.neon.tech/neondb/auth/token/anonymous")).json()).token;
  const req = (token, path = "verification/a.jpg") => new Request(`https://zeyds.test/api/private-file?path=${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  assert.equal((await privateFile.GET(req(""))).status, 403);
  assert.equal((await privateFile.GET(req("pas.un.jeton"))).status, 403);
  assert.equal((await privateFile.GET(req(anon))).status, 403, "un jeton visiteur ne doit pas lire les justificatifs");
  assert.equal((await privateFile.GET(req(anon, "../etc/passwd"))).status, 400);
});

// --- SMS : logique avec base reelle, LeTexto simule ---
function smsDeps(sentTo, opts = {}) {
  return {
    env: { LETEXTO_API_KEY: "cle-secrete", SMS_PER_PROVIDER_DAILY: opts.perProvider || "3" },
    now: opts.now,
    fetch: async (url, init) => { sentTo.push(JSON.parse(init.body)); return new Response(JSON.stringify({ statut: "submitted", id: "msg-" + sentTo.length, partCount: 1 })); },
    async getRequest(id) {
      const rows = await sql()`select r.id, r.created_at, r.matched_provider_ids, coalesce(s.name,'') as service, coalesce(c.name,'') as city
        from public.express_requests r left join public.services s on s.id = r.service_id left join public.cities c on c.id = r.city_id where r.id = ${id}::uuid`;
      return rows[0] || null;
    },
    listProviders: (ids) => sql()`select id::text, phone from public.public_provider_directory where id = any(${ids}::uuid[])`,
    alreadyNotified: async (rid) => (await sql()`select 1 from public.sms_log where request_id = ${rid}::uuid limit 1`).length > 0,
    countSent: async ({ since, providerId }) => (providerId
      ? await sql()`select count(*)::int as n from public.sms_log where created_at >= ${since}::timestamptz and provider_id = ${providerId}`
      : await sql()`select count(*)::int as n from public.sms_log where created_at >= ${since}::timestamptz`)[0].n,
    record: (row) => sql()`insert into public.sms_log (event, request_id, provider_id, phone, status, letexto_id, error)
      values (${row.event}, ${row.request_id}::uuid, ${row.provider_id}, ${row.phone}, ${row.status}, ${row.letexto_id}, ${row.error})`,
  };
}

test("sms-notify : demande reelle -> SMS aux prestataires retenus, une seule fois", async () => {
  const [svc] = await sql()`select s.id, s.name from public.services s where s.name = 'Plombier' limit 1`;
  const [city] = await sql()`select id, name from public.cities where name = 'Abidjan' limit 1`;
  const providers = await sql()`select id::text, phone from public.public_provider_directory where phone is not null order by id limit 3`;
  const [demand] = await sql()`insert into public.express_requests (service_id, service_name, city_id, city_name, message, matched_provider_ids, status, client_access_token)
    values (${svc?.id ?? null}, 'Texte libre du client http://pub.example', ${city.id}, 'Ville inventee', 'test sms', ${providers.map((p) => p.id)}::uuid[], 'open', ${"t".repeat(40)})
    returning id::text`;
  cleanup.push(() => sql()`delete from public.sms_log where request_id = ${demand.id}::uuid`);
  cleanup.push(() => sql()`delete from public.express_requests where id = ${demand.id}::uuid`);

  const sent = [];
  let res = await handleSmsNotify(post({ event: "new_opportunity", request_id: demand.id }), smsDeps(sent));
  let data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  const { normalizeIvorianPhone } = await import(API + "_lib/http.js");
  const valid = providers.filter((p) => normalizeIvorianPhone(p.phone)).length;
  assert.equal(data.sent, valid);
  assert.equal(data.skipped, providers.length - valid);
  assert.equal(sent[0].content, opportunityMessage(svc?.name || "", "Abidjan"));
  assert.doesNotMatch(sent[0].content, /http|inventee|Texte libre/, "le texte du client ne doit jamais entrer dans le SMS");
  assert.match(sent[0].to, /^225\d{10}$/);

  res = await handleSmsNotify(post({ event: "new_opportunity", request_id: demand.id }), smsDeps(sent));
  data = await res.json();
  assert.equal(data.already, true, "deuxieme appel pour la meme demande : rien n'est renvoye");
  assert.equal(sent.length, valid);

  const later = () => new Date(Date.now() + 20 * 60 * 1000);
  const old = await handleSmsNotify(post({ event: "new_opportunity", request_id: demand.id }), smsDeps(sent, { now: later }));
  assert.equal(old.status, 409, "une demande de plus de 15 min est refusee");
});

test("sms-notify : entrees invalides et cle absente", async () => {
  const sent = [];
  assert.equal((await handleSmsNotify(post({ event: "autre", request_id: crypto.randomUUID() }), smsDeps(sent))).status, 400);
  assert.equal((await handleSmsNotify(post({ event: "new_opportunity", request_id: "x" }), smsDeps(sent))).status, 400);
  assert.equal((await handleSmsNotify(post({ event: "new_opportunity", request_id: crypto.randomUUID() }), smsDeps(sent))).status, 404);
  const noKey = { ...smsDeps(sent), env: {} };
  assert.equal((await handleSmsNotify(post({ event: "new_opportunity", request_id: crypto.randomUUID() }), noKey)).status, 503);
  assert.equal(sent.length, 0);
});
