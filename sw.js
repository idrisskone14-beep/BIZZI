const CACHE_NAME = "bizzi-v304-44";
const OFFLINE_URL = "./offline.html";
const NAVIGATION_TIMEOUT_MS = 4500;
const ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./offline.html",
  "./landing.html",
  "./landing.css?v=304",
  "./landing.js?v=304",
  "./js/storage-safe.js?v=240",
  "./js/privacy-guard.js?v=304",
  "./js/data-dedupe.js?v=304",
  "./js/ci-map.js?v=304",
  "./js/error-monitor.js?v=240",
  "./js/performance-monitor.js?v=240",
  "./js/payment-gateway.js?v=240",
  "./js/admin-guard.js?v=240",
  "./js/live-location.js?v=240",
  "./js/push-client.js?v=240",
  "./js/fraud-guard.js?v=240",
  "./js/admin-dashboard.js?v=240",
  "./js/geo-precision.js?v=304",
  "./js/maps-provider.js?v=304",
  "./js/location-intelligence.js?v=304",
  "./js/network-lite.js?v=240",
  "./js/voice-access.js?v=240",
  "./js/ai-voice.js?v=240",
  "./js/assistant-parser.js?v=304",
  "./js/assistant-router.js?v=240",
  "./js/voice-language.js?v=304",
  "./js/test-data.js?v=304",
  "./js/premium-home.js?v=240",
  "./js/mobile-form-wizard.js?v=304",
  "./config.js?v=304",
  "./styles.css?v=304",
  "./mobile-forms.css?v=304",
  "./journey-visuals.css?v=243",
  "./service-ai-images.css?v=304",
  "./v302.css?v=304",
  "./v302-home.css?v=304",
  "./home-magazine.css?v=304",
  "./bizzi-life.css?v=304",
  "./global-assistant.css?v=304",
  "./location-intelligence.css?v=304",
  "./motion-system.css?v=304",
  "./mobile-layout-v297.css?v=304",
  "./js/bizzi-life-event-templates.js?v=304",
  "./js/bizzi-life.js?v=304",
  "./js/motion-system.js?v=304",
  "./js/service-ai-images.js?v=304",
  "./app.js?v=304",
  "./js/home-magazine.js?v=304",
  "./admin-access.html",
  "./manifest.webmanifest",
  "./assets/logo-v302.png",
  "./assets/icon-192-v305.png",
  "./assets/icon-512-v305.png",
  "./assets/apple-touch-icon-v305.png",
  "./assets/journey-life-v302.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

function fetchWithTimeout(request, timeoutMs = NAVIGATION_TIMEOUT_MS) {
  return Promise.race([
    fetch(request, { cache: "no-store" }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("navigation_timeout")), timeoutMs)),
  ]);
}

function cacheFirstThenRefresh(request) {
  return caches.match(request).then((cached) => {
    const refresh = fetch(request, { cache: "no-store" }).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    }).catch(() => cached);
    return cached || refresh;
  });
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetchWithTimeout(event.request).catch(() => caches.match("./index.html").then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  if (url.pathname.includes("/assets/services-ai/")) {
    event.respondWith(cacheFirstThenRefresh(event.request));
    return;
  }

  event.respondWith(
    ASSETS.some((asset) => new URL(asset, self.location.href).pathname === url.pathname)
      ? cacheFirstThenRefresh(event.request)
      : caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "./index.html#provider";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((client) => "focus" in client);
      if (existing) {
        existing.navigate(targetUrl);
        return existing.focus();
      }
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Bizzi", body: event.data ? event.data.text() : "Nouvelle notification" };
  }
  const title = payload.title || "Bizzi";
  const options = {
    body: payload.body || "Nouvelle activité Bizzi",
    icon: "./assets/icon-192-v305.png",
    badge: "./assets/icon-192-v305.png",
    data: { url: payload.url || "./index.html#provider" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
