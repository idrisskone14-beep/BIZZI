(function () {
  "use strict";

  const ABIDJAN_CENTER = { lat: 5.3453, lng: -4.0244 };
  const DEFAULT_ZOOM = 12;

  let map = null;
  let markersLayer = null;

  function ensureMap() {
    if (map) return map;
    const container = document.querySelector("#providersMap");
    if (!container || typeof L === "undefined") return null;
    map = L.map(container, { attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; contributeurs OpenStreetMap",
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    const origin = (typeof state !== "undefined" && state.userLocation) || ABIDJAN_CENTER;
    map.setView([origin.lat, origin.lng], DEFAULT_ZOOM);
    return map;
  }

  function popupHtml(provider) {
    const service = typeof providerServicesLabel === "function" ? providerServicesLabel(provider) : (provider.service || "");
    const distance = typeof distanceLabel === "function" ? distanceLabel(provider) : "";
    const rating = Number(provider.rating || 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 });
    const name = typeof safe === "function" ? safe(provider.fullName || "Prestataire") : String(provider.fullName || "Prestataire");
    const serviceLabel = typeof safe === "function" ? safe(service) : String(service);
    const distanceLine = distance ? ` · ${typeof safe === "function" ? safe(distance) : distance}` : "";
    return `
      <div class="providers-map-popup">
        <strong>${name}</strong>
        <p>${serviceLabel}${distanceLine}</p>
        <p>★ ${rating}</p>
        <button type="button" data-map-open-profile="${provider.id}">Voir le profil</button>
      </div>
    `;
  }

  function update(providers) {
    const container = document.querySelector("#providersMap");
    if (!container || container.hidden) return;
    const instance = ensureMap();
    if (!instance || !markersLayer) return;
    markersLayer.clearLayers();
    const points = [];
    (providers || []).forEach((provider) => {
      const point = typeof providerDistancePoint === "function" ? providerDistancePoint(provider) : null;
      if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;
      L.marker([point.lat, point.lng]).bindPopup(popupHtml(provider)).addTo(markersLayer);
      points.push([point.lat, point.lng]);
    });
    if (points.length) {
      instance.fitBounds(points, { padding: [32, 32], maxZoom: 14 });
    } else {
      const origin = (typeof state !== "undefined" && state.userLocation) || ABIDJAN_CENTER;
      instance.setView([origin.lat, origin.lng], DEFAULT_ZOOM);
    }
    instance.invalidateSize();
  }

  function invalidate() {
    if (map) map.invalidateSize();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-map-open-profile]");
    if (!button) return;
    if (typeof openProfile === "function") openProfile(button.dataset.mapOpenProfile);
  });

  globalThis.BizziProvidersMap = Object.freeze({ update, invalidate });
})();
