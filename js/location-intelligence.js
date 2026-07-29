(function () {
  "use strict";

  const STALE_AFTER_MS = 15 * 60 * 1000;
  const REFRESH_COOLDOWN_MS = 10 * 60 * 1000;
  const SIGNIFICANT_MOVE_METERS = 60;
  const MAP_SPAN = 0.012;
  let candidate = null;
  let dropoffSuggestionTimer = null;
  let dropoffSuggestionRequest = 0;
  let lastAutomaticRefresh = 0;

  function appState() {
    try {
      return typeof state !== "undefined" ? state : null;
    } catch (_) {
      return null;
    }
  }

  function callApp(name, ...args) {
    try {
      const fn = globalThis[name];
      if (typeof fn === "function") return fn(...args);
    } catch (_) {
      // Une vue absente ne doit jamais bloquer la localisation.
    }
    return undefined;
  }

  function validPoint(value) {
    const lat = Number(value?.lat);
    const lng = Number(value?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    const accuracy = Number(value?.accuracy);
    const timestamp = Number(value?.timestamp);
    return {
      ...value,
      lat,
      lng,
      accuracy: Number.isFinite(accuracy) && accuracy > 0 ? Math.round(accuracy) : null,
      timestamp: Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Date.now(),
    };
  }

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function unique(values) {
    return values.filter((value, index, list) => value && list.indexOf(value) === index);
  }

  function coordinateLabel(point) {
    return `GPS ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
  }

  function normalizeAddress(raw, point) {
    const source = raw || {};
    const poi = text(source.point_of_interest || source.pointOfInterest);
    const placeName = text(source.place_name || source.placeName);
    const houseNumber = text(source.house_number || source.houseNumber);
    const road = text(source.road || source.street);
    const neighborhood = text(source.neighborhood || source.neighbourhood || source.suburb || source.area);
    const commune = text(source.commune || source.municipality || source.district);
    const city = text(source.city || source.town || source.village);
    const plusCode = text(source.plus_code || source.plusCode) || coordinateLabel(point);
    const streetAddress = [houseNumber, road].filter(Boolean).join(" ");
    const primaryLabel = text(source.primary_label || source.primaryLabel)
      || poi
      || streetAddress
      || road
      || plusCode
      || neighborhood
      || commune
      || city;
    const secondary = neighborhood && neighborhood !== primaryLabel
      ? neighborhood
      : commune && commune !== primaryLabel
        ? commune
        : city && city !== primaryLabel
          ? city
          : "";
    const shortLabel = unique([primaryLabel, secondary]).join(" — ");
    const fullAddress = text(source.full_address || source.fullAddress)
      || unique([poi || placeName, streetAddress, neighborhood, commune, city, "Côte d’Ivoire"]).join(", ");
    return {
      ...point,
      source: text(source.source) || point.source || "device-gps",
      primaryLabel,
      shortLabel: shortLabel || coordinateLabel(point),
      fullAddress: fullAddress || shortLabel || coordinateLabel(point),
      placeName: placeName || poi,
      houseNumber,
      road,
      neighborhood,
      commune,
      city,
      pointOfInterest: poi,
      plusCode,
    };
  }

  function distanceMeters(left, right) {
    const a = validPoint(left);
    const b = validPoint(right);
    if (!a || !b) return Infinity;
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad;
    const dLng = (b.lng - a.lng) * rad;
    const lat1 = a.lat * rad;
    const lat2 = b.lat * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function permissionMessage(error) {
    const message = text(error?.message);
    if (message) return message;
    if (error?.code === 1) return "Position refusée. Autorisez la localisation précise dans les réglages, ou choisissez le lieu manuellement.";
    if (error?.code === 2) return "Position momentanément indisponible. Vérifiez le GPS ou saisissez le lieu.";
    if (error?.code === 3) return "Le GPS met trop de temps à répondre. Réessayez à l’extérieur ou saisissez le lieu.";
    return "Impossible d’obtenir la position. La saisie manuelle reste disponible.";
  }

  async function reverse(point, options = {}) {
    const safePoint = validPoint(point);
    if (!safePoint) throw new Error("Position invalide.");
    try {
      const result = await globalThis.BizziMaps?.reverseGeocode?.(safePoint, options);
      return normalizeAddress(result, safePoint);
    } catch (_) {
      return normalizeAddress({}, safePoint);
    }
  }

  function matchedCity(location) {
    const select = document.querySelector("#citySelect");
    const choices = [...(select?.options || [])].map((option) => option.value);
    const candidates = [location.commune, location.city];
    const exact = candidates.find((value) => choices.includes(value));
    if (exact) return exact;
    try {
      const nearest = typeof nearestCityFromPoint === "function" ? nearestCityFromPoint(location) : "";
      return choices.includes(nearest) ? nearest : "";
    } catch (_) {
      return "";
    }
  }

  function qualityText(accuracy) {
    const value = Number(accuracy);
    if (!Number.isFinite(value) || value <= 0) return "précision non mesurée";
    if (value <= 15) return `excellente précision ±${Math.round(value)} m`;
    if (value <= 30) return `bonne précision ±${Math.round(value)} m`;
    if (value <= 60) return `précision ±${Math.round(value)} m`;
    return `position approximative ±${Math.round(value)} m`;
  }

  function renderLocation(location = appState()?.userLocation) {
    const precise = validPoint(location);
    const button = document.querySelector("#geoButton");
    const status = document.querySelector("#geoStatus");
    const home = document.querySelector("#homeContextLocation");
    const pill = document.querySelector(".location-pill");
    if (!precise) {
      if (button) button.textContent = "Me localiser";
      if (home) home.textContent = callApp("currentCity") || "Votre ville";
      pill?.classList.remove("has-precise-location");
      return;
    }
    const normalized = normalizeAddress(location, precise);
    if (button) {
      button.textContent = normalized.shortLabel;
      button.title = normalized.fullAddress;
      button.setAttribute("aria-label", `Position actuelle : ${normalized.fullAddress}. Modifier la position`);
    }
    if (status) status.textContent = `${normalized.fullAddress} · ${qualityText(normalized.accuracy)}`;
    if (home) home.textContent = normalized.shortLabel;
    pill?.classList.add("has-precise-location");
  }

  function persist(location, options = {}) {
    const normalized = normalizeAddress(location, validPoint(location));
    const current = appState();
    if (current) {
      current.userLocation = normalized;
      const city = matchedCity(normalized);
      if (city) {
        current.selectedCity = city;
        const citySelect = document.querySelector("#citySelect");
        if (citySelect) citySelect.value = city;
        const eventCity = document.querySelector("#eventCityFilter");
        if (eventCity && [...eventCity.options].some((option) => option.value === city)) eventCity.value = city;
        const foodCity = document.querySelector("#foodCityFilter");
        if (foodCity && [...foodCity.options].some((option) => option.value === city)) {
          foodCity.value = city;
          current.selectedFoodCity = city;
        }
      }
      callApp("saveState");
    }
    renderLocation(normalized);
    if (options.render !== false) {
      ["renderProviders", "renderDelivery", "renderFood", "renderEvents", "renderJobs", "renderAd", "renderHomeDiscovery", "renderSavedProviders"]
        .forEach((name) => callApp(name));
    }
    window.dispatchEvent(new CustomEvent("bizzi:location-changed", { detail: normalized }));
    return normalized;
  }

  async function acquire(options = {}) {
    if (!globalThis.BizziGeoPrecision?.acquire) throw new Error("Géolocalisation précise indisponible.");
    const position = await globalThis.BizziGeoPrecision.acquire({
      targetAccuracy: 12,
      acceptableAccuracy: 65,
      timeout: 22000,
    });
    const point = globalThis.BizziGeoPrecision.point(position);
    if (!point) throw new Error("Coordonnées GPS invalides.");
    point.source = "device-gps";
    const location = await reverse(point, { refresh: options.refresh === true });
    const previous = appState()?.userLocation;
    if (options.automatic && previous) {
      const moved = distanceMeters(previous, location);
      const improvesAccuracy = Number(location.accuracy || Infinity) + 10 < Number(previous.accuracy || Infinity);
      if (moved < SIGNIFICANT_MOVE_METERS && !improvesAccuracy) return normalizeAddress(previous, previous);
    }
    return persist(location);
  }

  function dialog() {
    let root = document.querySelector("#bizziLocationDialog");
    if (root) return root;
    root = document.createElement("dialog");
    root.id = "bizziLocationDialog";
    root.className = "bizzi-location-dialog";
    root.innerHTML = `
      <form method="dialog" class="location-sheet" id="bizziLocationForm">
        <header>
          <div><p>Votre position</p><h2>Choisir un point précis</h2></div>
          <button class="location-close" value="cancel" aria-label="Fermer">×</button>
        </header>
        <label class="location-search"><span>Rechercher une adresse ou un lieu</span><div><input id="bizziLocationSearch" type="search" autocomplete="street-address" placeholder="Ex. Angré 8e Tranche, China Mall…"><button id="bizziLocationSearchButton" type="button">Rechercher</button></div></label>
        <div class="location-map" id="bizziLocationMap">
          <img id="bizziLocationMapFrame" alt="Carte de la position sélectionnée" loading="lazy">
          <div class="location-map-touch" id="bizziLocationMapTouch" aria-label="Déplacer le repère sur la carte">
            <button class="location-marker" id="bizziLocationMarker" type="button" aria-label="Repère déplaçable">●</button>
          </div>
        </div>
        <p class="location-map-help">Touchez la carte ou déplacez le repère pour corriger le point.</p>
        <div class="location-result" id="bizziLocationResult" role="status" aria-live="polite"></div>
        <details class="location-details">
          <summary>Ajouter des précisions</summary>
          <div class="location-fields">
            <label>Nom du lieu<input name="placeName" maxlength="100" placeholder="Ex. Immeuble Arc-en-ciel"></label>
            <label>Quartier<input name="neighborhood" maxlength="100" placeholder="Ex. Angré 8e Tranche"></label>
            <label>Point de repère<input name="landmark" maxlength="140" placeholder="Ex. En face de la pharmacie"></label>
            <label>Téléphone du destinataire<input name="recipientPhone" inputmode="tel" autocomplete="tel" placeholder="+225 07 00 00 00 00"></label>
            <label class="location-field-wide">Instructions<textarea name="instructions" maxlength="280" rows="2" placeholder="Portail, étage, indications utiles…"></textarea></label>
          </div>
        </details>
        <div class="location-actions">
          <button class="secondary" id="bizziLocationCurrent" type="button">Utiliser ma position actuelle</button>
          <button class="primary" id="bizziLocationConfirm" type="button">Confirmer cette position</button>
        </div>
      </form>`;
    document.body.append(root);
    bindDialog(root);
    return root;
  }

  function mapUrl(point) {
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${point.lat},${point.lng}&zoom=16&size=760x420&maptype=mapnik`;
  }

  function updateDialog(point, message = "") {
    candidate = normalizeAddress(point, validPoint(point));
    const root = dialog();
    const frame = root.querySelector("#bizziLocationMapFrame");
    const marker = root.querySelector("#bizziLocationMarker");
    const result = root.querySelector("#bizziLocationResult");
    if (frame) frame.src = mapUrl(candidate);
    if (marker) {
      marker.style.left = "50%";
      marker.style.top = "50%";
    }
    if (result) {
      result.innerHTML = `
        <strong>${escapeHtml(candidate.shortLabel)}</strong>
        <span>${escapeHtml(candidate.fullAddress)}</span>
        <small>${escapeHtml(qualityText(candidate.accuracy))}</small>
        ${message ? `<em>${escapeHtml(message)}</em>` : ""}`;
    }
  }

  function escapeHtml(value) {
    const node = document.createElement("span");
    node.textContent = String(value || "");
    return node.innerHTML;
  }

  async function setCandidate(point, message = "") {
    const root = dialog();
    const result = root.querySelector("#bizziLocationResult");
    if (result) result.textContent = "Recherche de l’adresse précise…";
    const resolved = await reverse({ ...point, timestamp: Date.now(), source: point.source || "manual-map" }, { refresh: true });
    updateDialog(resolved, message);
  }

  function pointFromMapEvent(event, touch) {
    const rect = touch.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    return {
      ...candidate,
      lat: candidate.lat + (0.5 - y / rect.height) * MAP_SPAN,
      lng: candidate.lng + (x / rect.width - 0.5) * MAP_SPAN,
      accuracy: null,
      timestamp: Date.now(),
      source: "manual-map",
    };
  }

  function bindDialog(root) {
    const touch = root.querySelector("#bizziLocationMapTouch");
    const marker = root.querySelector("#bizziLocationMarker");
    let dragging = false;
    let movedPoint = null;
    const moveMarker = (event) => {
      if (!candidate || (!dragging && event.type !== "click")) return;
      const rect = touch.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      movedPoint = pointFromMapEvent(event, touch);
    };
    marker.addEventListener("pointerdown", (event) => {
      dragging = true;
      marker.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });
    touch.addEventListener("pointermove", moveMarker);
    touch.addEventListener("pointerup", async (event) => {
      if (!dragging) return;
      moveMarker(event);
      dragging = false;
      if (movedPoint) await setCandidate(movedPoint, "Point ajusté manuellement.");
    });
    touch.addEventListener("click", async (event) => {
      if (event.target === marker || dragging || !candidate) return;
      await setCandidate(pointFromMapEvent(event, touch), "Point ajusté manuellement.");
    });
    root.querySelector("#bizziLocationCurrent").addEventListener("click", async () => {
      showDialogStatus("Recherche GPS haute précision…");
      try {
        const location = await acquire({ refresh: true });
        updateDialog(location);
      } catch (error) {
        showDialogStatus(permissionMessage(error), true);
      }
    });
    root.querySelector("#bizziLocationSearchButton").addEventListener("click", searchAddress);
    root.querySelector("#bizziLocationSearch").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchAddress();
      }
    });
    root.querySelector("#bizziLocationConfirm").addEventListener("click", () => {
      if (!candidate) return;
      const data = new FormData(root.querySelector("#bizziLocationForm"));
      const overrides = {
        placeName: text(data.get("placeName")) || candidate.placeName,
        neighborhood: text(data.get("neighborhood")) || candidate.neighborhood,
        landmark: text(data.get("landmark")),
        recipientPhone: text(data.get("recipientPhone")),
        instructions: text(data.get("instructions")),
      };
      const primaryLabel = overrides.placeName || candidate.primaryLabel;
      const shortLabel = unique([primaryLabel, overrides.neighborhood || candidate.neighborhood || candidate.commune]).join(" — ");
      persist({ ...candidate, ...overrides, primaryLabel, shortLabel, fullAddress: unique([primaryLabel, candidate.fullAddress, overrides.landmark]).join(", "), source: "confirmed" });
      root.close();
    });
  }

  function showDialogStatus(message, error = false) {
    const result = dialog().querySelector("#bizziLocationResult");
    if (!result) return;
    result.textContent = message;
    result.classList.toggle("error", error);
  }

  async function searchAddress() {
    const root = dialog();
    const input = root.querySelector("#bizziLocationSearch");
    const query = text(input?.value);
    if (!query) {
      showDialogStatus("Saisissez une adresse, un quartier ou un lieu de référence.", true);
      return;
    }
    showDialogStatus("Recherche du lieu…");
    try {
      const result = await globalThis.BizziMaps?.geocode?.(query, "");
      const point = validPoint({ lat: result?.lat, lng: result?.lng, timestamp: Date.now(), source: result?.source || "address-search" });
      if (!point) throw new Error("Lieu introuvable.");
      await setCandidate(point, `Résultat pour « ${query} ».`);
    } catch (error) {
      showDialogStatus(text(error?.message) || "Lieu introuvable. Essayez avec un quartier ou un repère proche.", true);
    }
  }

  async function openPicker(options = {}) {
    const root = dialog();
    const current = validPoint(options.point || appState()?.userLocation);
    root.showModal();
    if (current) {
      updateDialog(normalizeAddress(options.point || appState().userLocation, current));
      return;
    }
    if (options.skipGps) {
      const fallback = validPoint({ lat: 5.3484, lng: -4.0305, timestamp: Date.now(), source: "manual-default" });
      updateDialog(normalizeAddress({ city: "Abidjan", primary_label: "Choisissez le point sur la carte" }, fallback), "Recherchez votre lieu ou déplacez le repère.");
      return;
    }
    showDialogStatus("Recherche GPS haute précision…");
    try {
      const location = await acquire({ refresh: true });
      updateDialog(location);
    } catch (error) {
      showDialogStatus(permissionMessage(error), true);
      const fallback = validPoint({ lat: 5.3484, lng: -4.0305, timestamp: Date.now(), source: "manual-default" });
      updateDialog(normalizeAddress({ city: "Abidjan", primary_label: "Choisissez le point sur la carte" }, fallback), "La saisie manuelle reste disponible.");
    }
  }

  function fillDeliveryPoint(location) {
    const form = document.querySelector("#deliveryRequestForm");
    if (!form) return;
    const label = form.querySelector("[name='pickup']");
    if (label) label.value = location.shortLabel;
    const city = form.querySelector("[name='city']");
    if (city) city.value = location.commune || location.city || matchedCity(location) || "Abidjan";
    [["#deliveryPickupLatitude", location.lat], ["#deliveryPickupLongitude", location.lng], ["#deliveryPickupAccuracy", location.accuracy || ""]]
      .forEach(([selector, value]) => {
        const input = form.querySelector(selector);
        if (input) input.value = String(value);
      });
    const status = document.querySelector("#deliveryPickupGeoStatus");
    if (status) {
      status.hidden = false;
      status.classList.remove("error");
      status.textContent = `${location.fullAddress} · ${qualityText(location.accuracy)}`;
    }
    const notes = form.elements.namedItem("notes");
    if (notes && (location.landmark || location.instructions || location.recipientPhone)) {
      notes.value = unique([
        location.landmark ? `Repère : ${location.landmark}` : "",
        location.instructions ? `Instructions : ${location.instructions}` : "",
        location.recipientPhone ? `Destinataire : ${location.recipientPhone}` : "",
      ]).join(" · ");
    }
    callApp("updateDeliveryPricingFromForm");
    callApp("renderDeliveryPaymentOptions");
  }

  async function useCurrentForDelivery(button) {
    if (button) {
      button.disabled = true;
      button.textContent = "Position…";
    }
    try {
      const location = await acquire({ refresh: true });
      fillDeliveryPoint(location);
      const status = document.querySelector("#deliveryPickupGeoStatus");
      if (status && Number(location.accuracy || 0) > 100) {
        status.textContent = `${location.fullAddress} · ${qualityText(location.accuracy)}. Vous pouvez ajuster ce point sur la carte.`;
      }
    } catch (error) {
      const status = document.querySelector("#deliveryPickupGeoStatus");
      if (status) {
        status.hidden = false;
        status.classList.add("error");
        status.textContent = `${permissionMessage(error)} Choisissez maintenant le départ sur la carte.`;
      }
      openPicker({ skipGps: true });
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Utiliser ma position";
      }
    }
  }

  function injectField(form, name) {
    if (!form || form.elements.namedItem(name)) return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    form.append(input);
  }

  function syncGeoForms(location) {
    ["foodForm", "exceptionPlaceForm", "providerForm"].forEach((id) => {
      const form = document.getElementById(id);
      ["latitude", "longitude", "locationAccuracy", "locationTimestamp", "locationLabel", "locationFullAddress"]
        .forEach((name) => injectField(form, name));
      if (!form || !location) return;
      const values = {
        latitude: location.lat,
        longitude: location.lng,
        locationAccuracy: location.accuracy || "",
        locationTimestamp: location.timestamp,
        locationLabel: location.shortLabel,
        locationFullAddress: location.fullAddress,
      };
      Object.entries(values).forEach(([name, value]) => {
        const input = form.elements.namedItem(name);
        if (input) input.value = String(value);
      });
    });
    const eventForm = document.querySelector("#eventForm");
    if (eventForm && location) {
      const lat = eventForm.elements.namedItem("latitude");
      const lng = eventForm.elements.namedItem("longitude");
      if (lat && !lat.value) lat.value = String(location.lat);
      if (lng && !lng.value) lng.value = String(location.lng);
    }
  }

  function injectLocationButtons() {
    [
      ["providerForm", "Utiliser ma position pour ce profil"],
      ["foodForm", "Localiser cette adresse"],
      ["exceptionPlaceForm", "Localiser ce lieu"],
      ["eventForm", "Localiser cet événement"],
    ].forEach(([id, label]) => {
      const form = document.getElementById(id);
      if (!form || form.querySelector("[data-form-location]")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary form-location-button";
      button.dataset.formLocation = id;
      button.textContent = label;
      const area = form.querySelector("[name='area']")?.closest("label");
      (area || form.firstElementChild)?.insertAdjacentElement("afterend", button);
      button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = "Localisation…";
        try {
          const location = await acquire({ refresh: true });
          syncGeoForms(location);
          const areaInput = form.elements.namedItem("area");
          if (areaInput && !areaInput.value) areaInput.value = location.neighborhood || location.commune || "";
          const addressInput = form.elements.namedItem("address");
          if (addressInput && !addressInput.value) addressInput.value = location.fullAddress;
          button.textContent = `Position : ${location.shortLabel}`;
        } catch (error) {
          button.textContent = permissionMessage(error);
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function ensureDeliveryDropoffCoordinates() {
    const form = document.querySelector("#deliveryRequestForm");
    ["dropoffLatitude", "dropoffLongitude", "dropoffLocationLabel", "dropoffLocationFullAddress"]
      .forEach((name) => injectField(form, name));
    const input = form?.elements.namedItem("dropoff");
    if (!input) return;
    const field = input.closest("label");
    const panel = document.createElement("div");
    panel.id = "deliveryDropoffSuggestions";
    panel.className = "delivery-address-suggestions";
    panel.setAttribute("role", "listbox");
    panel.setAttribute("aria-label", "Suggestions de destination");
    panel.hidden = true;
    field?.classList.add("delivery-address-field");
    field?.insertAdjacentElement("afterend", panel);
    input.removeAttribute("list");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", panel.id);
    input.setAttribute("aria-expanded", "false");
    let activeIndex = -1;
    let currentSuggestions = [];

    const suggestionKey = (value) => text(value)
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

    const normalizeSuggestion = (item) => {
      const lat = Number(item?.lat);
      const lng = Number(item?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const label = text(item?.primary_label || item?.primaryLabel || item?.name || item?.label);
      const fullAddress = text(item?.full_address || item?.fullAddress || item?.address || item?.secondary_label || item?.secondaryLabel);
      if (!label) return null;
      return {
        label,
        fullAddress: fullAddress || unique([label, text(item?.city), "Côte d’Ivoire"]).join(", "),
        city: text(item?.city || item?.commune),
        lat,
        lng,
        source: text(item?.source) || "ci-reference",
      };
    };

    const localSuggestions = (query) => (globalThis.BizziCIGeo?.suggestions?.(query, 6) || [])
      .map((item) => normalizeSuggestion({
        ...item,
        label: item.name,
        fullAddress: item.address,
        source: "bizzi-ci",
      }))
      .filter(Boolean);

    const mergeSuggestions = (...groups) => {
      const seen = new Set();
      return groups.flat().filter((item) => {
        if (!item) return false;
        const key = `${suggestionKey(item.label)}:${Number(item.lat).toFixed(4)}:${Number(item.lng).toFixed(4)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 7);
    };

    const hideSuggestions = () => {
      panel.hidden = true;
      panel.innerHTML = "";
      currentSuggestions = [];
      activeIndex = -1;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
    };

    const setActive = (index) => {
      const buttons = [...panel.querySelectorAll("[data-address-index]")];
      if (!buttons.length) return;
      activeIndex = Math.max(0, Math.min(index, buttons.length - 1));
      buttons.forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === activeIndex));
      const active = buttons[activeIndex];
      input.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView?.({ block: "nearest" });
    };

    const selectSuggestion = (suggestion) => {
      if (!suggestion) return;
      const lat = form.elements.namedItem("dropoffLatitude");
      const lng = form.elements.namedItem("dropoffLongitude");
      const label = form.elements.namedItem("dropoffLocationLabel");
      const fullAddress = form.elements.namedItem("dropoffLocationFullAddress");
      input.value = suggestion.label;
      if (lat) lat.value = String(suggestion.lat);
      if (lng) lng.value = String(suggestion.lng);
      if (label) label.value = suggestion.label;
      if (fullAddress) fullAddress.value = suggestion.fullAddress;
      if (suggestion.city) {
        const city = form.elements.namedItem("city");
        if (city) city.value = suggestion.city;
      }
      hideSuggestions();
      const distanceInput = document.querySelector("#deliveryDistanceInput");
      if (distanceInput) {
        distanceInput.dataset.manualDistance = "";
        distanceInput.dataset.mapboxKey = "";
        distanceInput.dataset.mapboxStatus = "";
        distanceInput.dataset.mapboxError = "";
      }
      callApp("updateDeliveryPricingFromForm");
      callApp("renderDeliveryPaymentOptions");
    };

    const renderSuggestions = (items, loading = false) => {
      currentSuggestions = items;
      activeIndex = -1;
      if (!items.length && !loading) {
        panel.innerHTML = `<p class="delivery-address-empty">Aucune adresse trouvée. Ajoutez un quartier ou un repère.</p>`;
      } else {
        panel.innerHTML = items.map((item, index) => `
          <button type="button" id="deliveryAddressOption${index}" role="option" data-address-index="${index}">
            <span aria-hidden="true">⌖</span>
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(item.fullAddress)}</small>
          </button>`).join("")
          + (loading ? `<p class="delivery-address-loading">Recherche d’autres adresses…</p>` : "");
      }
      panel.hidden = false;
      input.setAttribute("aria-expanded", "true");
      panel.querySelectorAll("[data-address-index]").forEach((button) => {
        button.addEventListener("pointerdown", (event) => event.preventDefault());
        button.addEventListener("click", () => selectSuggestion(currentSuggestions[Number(button.dataset.addressIndex)]));
      });
    };

    input.addEventListener("input", () => {
      const lat = form.elements.namedItem("dropoffLatitude");
      const lng = form.elements.namedItem("dropoffLongitude");
      const label = form.elements.namedItem("dropoffLocationLabel");
      const fullAddress = form.elements.namedItem("dropoffLocationFullAddress");
      if (lat) lat.value = "";
      if (lng) lng.value = "";
      if (label) label.value = "";
      if (fullAddress) fullAddress.value = "";
      clearTimeout(dropoffSuggestionTimer);
      const query = text(input.value);
      const requestId = ++dropoffSuggestionRequest;
      if (query.length < 2) {
        hideSuggestions();
        return;
      }
      const local = localSuggestions(query);
      renderSuggestions(local, true);
      dropoffSuggestionTimer = setTimeout(async () => {
        try {
          const remote = await globalThis.BizziMaps?.suggest?.(query, {
            city: text(form.elements.namedItem("city")?.value),
            proximity: validPoint(appState()?.userLocation),
          });
          if (requestId !== dropoffSuggestionRequest || text(input.value) !== query) return;
          renderSuggestions(mergeSuggestions(local, (remote || []).map(normalizeSuggestion).filter(Boolean)));
        } catch (_) {
          if (requestId === dropoffSuggestionRequest && text(input.value) === query) renderSuggestions(local);
        }
      }, 450);
    });
    input.addEventListener("focus", () => {
      const query = text(input.value);
      if (query.length >= 2 && currentSuggestions.length) renderSuggestions(currentSuggestions);
    });
    input.addEventListener("keydown", (event) => {
      if (panel.hidden) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive(activeIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive(activeIndex < 0 ? currentSuggestions.length - 1 : activeIndex - 1);
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        selectSuggestion(currentSuggestions[activeIndex]);
      } else if (event.key === "Escape") {
        hideSuggestions();
      }
    });
    document.addEventListener("pointerdown", (event) => {
      if (event.target !== input && !panel.contains(event.target)) hideSuggestions();
    });
  }

  async function refreshIfUseful() {
    const current = validPoint(appState()?.userLocation);
    if (!current || Date.now() - current.timestamp < STALE_AFTER_MS) return;
    if (Date.now() - lastAutomaticRefresh < REFRESH_COOLDOWN_MS) return;
    if (!navigator.permissions?.query) return;
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" });
      if (permission.state !== "granted") return;
      lastAutomaticRefresh = Date.now();
      await acquire({ automatic: true, refresh: true });
    } catch (_) {
      // Aucun message intrusif lors d’une actualisation automatique.
    }
  }

  function bind() {
    const geoButton = document.querySelector("#geoButton");
    geoButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openPicker();
    }, true);
    const pickupButton = document.querySelector("#deliveryPickupCurrentButton");
    pickupButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      useCurrentForDelivery(event.currentTarget);
    }, true);
    window.addEventListener("bizzi:location-changed", (event) => {
      syncGeoForms(event.detail);
      fillDeliveryPoint(event.detail);
    });
    document.querySelector("#citySelect")?.addEventListener("change", () => setTimeout(() => renderLocation(), 0));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refreshIfUseful();
    });
    window.addEventListener("pageshow", refreshIfUseful);
    injectLocationButtons();
    ensureDeliveryDropoffCoordinates();
    const existing = validPoint(appState()?.userLocation);
    if (existing) {
      renderLocation(existing);
      syncGeoForms(normalizeAddress(appState().userLocation, existing));
    }
    setTimeout(() => renderLocation(), 100);
  }

  globalThis.BizziLocation = Object.freeze({
    acquire,
    openPicker,
    reverse,
    persist,
    current: () => appState()?.userLocation || null,
    distanceMeters,
    normalizeAddress,
  });

  bind();
})();
