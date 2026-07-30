(function () {
  "use strict";

  const STATE_KEY = "bizzi-state";
  const FAVORITES_KEY = "bizzi-home-magazine-favorites-v1";

  function readJson(key, fallback) {
    try {
      const raw = globalThis.BizziStorage?.localGet?.(key) ?? globalThis.localStorage?.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      const raw = JSON.stringify(value);
      if (globalThis.BizziStorage?.localSet) return globalThis.BizziStorage.localSet(key, raw);
      globalThis.localStorage?.setItem(key, raw);
      return true;
    } catch {
      return false;
    }
  }

  function safe(value = "") {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[character]));
  }

  function normalized(value = "") {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  function safeImage(value = "") {
    const url = String(value || "").trim();
    return /^(https:\/\/|assets\/)/i.test(url) ? safe(url) : "";
  }

  function currentState() {
    return readJson(STATE_KEY, {});
  }

  function favorites() {
    return new Set(readJson(FAVORITES_KEY, []));
  }

  function realRecord(item = {}) {
    const id = String(item.id || "");
    return !item.testData && !/^test[-_]|^test-v/i.test(id);
  }

  function realProvider(provider = {}) {
    return realRecord(provider)
      && provider.status === "approved"
      && provider.visibility === "active"
      && Boolean(provider.remoteId || provider.termsAcceptedAt || provider.remoteStatus === "linked");
  }

  function cityMatches(item = {}, city = "") {
    const selected = normalized(city);
    if (!selected || selected.includes("toute la cote") || selected === "abidjan") {
      if (selected !== "abidjan") return true;
      return ["abidjan", "cocody", "marcory", "yopougon", "treichville", "koumassi", "port-bouet", "abobo", "adjame", "bingerville", "anyama", "attecoube"]
        .some((name) => normalized(item.city).includes(name) || normalized(item.area).includes(name));
    }
    return normalized(item.city).includes(selected) || normalized(item.area).includes(selected);
  }

  function dateValue(item = {}) {
    const value = new Date(item.createdAt || item.created_at || item.verifiedAt || 0).getTime();
    return Number.isFinite(value) ? value : 0;
  }

  function providerImage(provider = {}) {
    return safeImage(provider.photo || globalThis.BizziServiceImages?.url?.(provider.service || ""));
  }

  function emptyCard(title, text, route) {
    return `<article class="home-magazine-empty"><span>✦</span><div><strong>${safe(title)}</strong><p>${safe(text)}</p></div><button type="button" data-magazine-go="${safe(route)}">Explorer</button></article>`;
  }

  function markSection(root, hasContent) {
    const section = root?.closest?.(".home-magazine-section");
    if (!section) return;
    section.classList.toggle("is-empty", !hasContent);
    section.classList.toggle("has-content", hasContent);
  }

  function providerCard(provider, favoriteIds) {
    const image = providerImage(provider);
    const id = String(provider.id || provider.remoteId || provider.fullName);
    const favorite = favoriteIds.has(id);
    const reviews = Number(provider.reviewCount || provider.reviewsCount || provider.review_count || 0);
    const distance = provider.distance || (Number(provider.distanceKm) ? `${Number(provider.distanceKm).toFixed(1).replace(".", ",")} km` : "");
    return `
      <article class="home-provider-card">
        <button class="home-provider-main" type="button" data-magazine-query="${safe(provider.fullName || provider.service)}" aria-label="Trouver ${safe(provider.fullName || provider.service)}">
          <span class="home-provider-photo">${image ? `<img src="${image}" loading="lazy" decoding="async" alt="">` : `<b>${safe(provider.initials || "BZ")}</b>`}${provider.verificationStatus === "verified" ? `<i>Vérifié</i>` : ""}</span>
          <span class="home-provider-copy">
            <strong>${safe(provider.fullName || "Prestataire Bizzis")}</strong>
            <small>${safe(provider.service || "Service Bizzis")}</small>
            <span class="home-provider-rating"><b>★ ${Number(provider.rating || 0).toFixed(1)}</b><i>${reviews ? `${reviews} avis` : "Nouveau"}</i></span>
            <span class="home-provider-location">${safe([provider.area, provider.city, distance].filter(Boolean).join(" · "))}</span>
          </span>
        </button>
        <button class="home-favorite" type="button" data-magazine-favorite="${safe(id)}" aria-label="${favorite ? "Retirer des favoris" : "Ajouter aux favoris"}" aria-pressed="${favorite}">${favorite ? "♥" : "♡"}</button>
      </article>`;
  }

  function dealCard(item) {
    const image = safeImage(item.image);
    return `
      <button class="home-deal-card" type="button" data-magazine-go="${safe(item.route)}">
        ${image ? `<img src="${image}" loading="lazy" decoding="async" alt="">` : `<span aria-hidden="true">${safe(item.icon || "✦")}</span>`}
        <i>${safe(item.badge)}</i>
        <strong>${safe(item.title)}</strong>
        <small>${safe(item.detail)}</small>
        <b>Découvrir →</b>
      </button>`;
  }

  function updateCard(item) {
    const image = safeImage(item.image);
    return `
      <button class="home-update-card" type="button" data-magazine-go="${safe(item.route)}"${item.query ? ` data-magazine-query="${safe(item.query)}"` : ""}>
        <span>${image ? `<img src="${image}" loading="lazy" decoding="async" alt="">` : `<b>${safe(item.icon || "✦")}</b>`}</span>
        <small>${safe(item.type)}</small>
        <strong>${safe(item.title)}</strong>
        <i>${safe(item.location || "Côte d’Ivoire")}</i>
      </button>`;
  }

  function renderContext(state) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
    const name = String(state.clientName || "").trim();
    const selectedCity = document.querySelector("#citySelect")?.value || state.selectedCity || "Côte d’Ivoire";
    const prompt = hour >= 18
      ? "Une sortie, un restaurant ou un service pour ce soir ?"
      : hour < 11
        ? "Un service, une course ou une livraison ce matin ?"
        : "Que recherchez-vous aujourd’hui ?";
    const greetingRoot = document.querySelector("#homeTimeGreeting");
    const nameRoot = document.querySelector("#homeContextName");
    const locationRoot = document.querySelector("#homeContextLocation");
    const promptRoot = document.querySelector("#homeContextPrompt");
    if (greetingRoot) greetingRoot.textContent = greeting;
    if (nameRoot) nameRoot.textContent = name ? `${name}, que souhaitez-vous faire ?` : "Que souhaitez-vous faire ?";
    if (locationRoot) locationRoot.textContent = selectedCity.includes("Toute la") ? "Côte d’Ivoire" : selectedCity;
    if (promptRoot) promptRoot.textContent = prompt;
  }

  function recommendations(state) {
    const root = document.querySelector("#homeRecommendations");
    if (!root) return;
    const city = document.querySelector("#citySelect")?.value || state.selectedCity || "";
    const providers = (state.providers || [])
      .filter(realProvider)
      .sort((left, right) => {
        const localDifference = Number(cityMatches(right, city)) - Number(cityMatches(left, city));
        return localDifference || Number(right.rating || 0) - Number(left.rating || 0) || Number(right.calls || 0) - Number(left.calls || 0);
      })
      .slice(0, 8);
    const favoriteIds = favorites();
    markSection(root, providers.length > 0);
    root.innerHTML = providers.length
      ? providers.map((provider) => providerCard(provider, favoriteIds)).join("")
      : emptyCard("Les recommandations arrivent", "Les prestataires réels et actifs de votre ville apparaîtront ici.", "search");
  }

  function deals(state) {
    const root = document.querySelector("#homeGoodDeals");
    if (!root) return;
    const now = Date.now();
    const items = [
      ...(state.eventPromotions || []).filter((event) => realRecord(event) && event.status === "published" && new Date(event.boostEndsAt || 0).getTime() > now).map((event) => ({
        title: event.title,
        detail: [event.venue || event.area, event.city].filter(Boolean).join(" · "),
        badge: "Événement boosté",
        route: "events",
        image: event.poster,
        icon: "☆",
      })),
      ...(state.exceptionPlaces || []).filter((place) => realRecord(place) && place.status === "published" && new Date(place.boostEndsAt || 0).getTime() > now).map((place) => ({
        title: place.name,
        detail: [place.area, place.city].filter(Boolean).join(" · "),
        badge: "Lieu en promotion",
        route: "exception-places",
        image: place.photo,
        icon: "⌖",
      })),
      ...(state.providers || []).filter((provider) => realProvider(provider) && new Date(provider.boostEndsAt || 0).getTime() > now).map((provider) => ({
        title: provider.fullName,
        detail: [provider.service, provider.area].filter(Boolean).join(" · "),
        badge: "Prestataire mis en avant",
        route: "search",
        image: provider.photo,
        icon: "✓",
      })),
    ].slice(0, 8);
    markSection(root, items.length > 0);
    root.innerHTML = items.length
      ? items.map(dealCard).join("")
      : emptyCard("Aucun bon plan actif aujourd’hui", "Les promotions validées apparaîtront automatiquement ici.", "events");
  }

  function updates(state) {
    const root = document.querySelector("#homeNewItems");
    if (!root) return 0;
    const items = [
      ...(state.providers || []).filter(realProvider).map((provider) => ({
        title: provider.fullName,
        type: provider.service || "Prestataire",
        location: [provider.area, provider.city].filter(Boolean).join(" · "),
        image: providerImage(provider),
        route: "search",
        query: provider.fullName,
        icon: "✓",
        date: dateValue(provider),
      })),
      ...(state.eventPromotions || []).filter((event) => realRecord(event) && event.status === "published").map((event) => ({
        title: event.title,
        type: "Événement",
        location: [event.venue || event.area, event.city].filter(Boolean).join(" · "),
        image: event.poster,
        route: "events",
        icon: "☆",
        date: dateValue(event),
      })),
      ...(state.foodPlaces || []).filter((place) => realRecord(place) && place.status === "published").map((place) => ({
        title: place.name,
        type: place.placeType || "Restaurant",
        location: [place.area, place.city].filter(Boolean).join(" · "),
        image: place.photo,
        route: "food",
        icon: "♨",
        date: dateValue(place),
      })),
      ...(state.exceptionPlaces || []).filter((place) => realRecord(place) && place.status === "published").map((place) => ({
        title: place.name,
        type: "Lieu d’exception",
        location: [place.area, place.city].filter(Boolean).join(" · "),
        image: place.photo,
        route: "exception-places",
        icon: "⌖",
        date: dateValue(place),
      })),
    ].sort((left, right) => right.date - left.date).slice(0, 10);
    markSection(root, items.length > 0);
    root.innerHTML = items.length
      ? items.map(updateCard).join("")
      : emptyCard("Aucune nouveauté pour le moment", "Les nouvelles publications validées apparaîtront ici.", "search");
    return items.length;
  }

  function render() {
    const state = currentState();
    renderContext(state);
    recommendations(state);
    deals(state);
    const count = updates(state);
    const countRoot = document.querySelector("#homeUpdatesCount");
    if (countRoot) countRoot.textContent = String(count);
  }

  function openQuery(query) {
    const input = document.querySelector("#homeQuickSearchInput");
    const form = document.querySelector("#homeQuickSearchForm");
    if (!input || !form || !query) return;
    input.value = query;
    form.requestSubmit();
  }

  function openRoute(route) {
    if (!/^[a-z-]+$/.test(route)) return;
    document.querySelector(`[data-go="${route}"]`)?.click();
  }

  document.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest("[data-magazine-favorite]");
    if (favoriteButton) {
      const ids = favorites();
      const id = favoriteButton.dataset.magazineFavorite;
      if (ids.has(id)) ids.delete(id);
      else ids.add(id);
      writeJson(FAVORITES_KEY, [...ids]);
      recommendations(currentState());
      return;
    }
    const queryButton = event.target.closest("[data-magazine-query]");
    if (queryButton?.dataset.magazineQuery) {
      openQuery(queryButton.dataset.magazineQuery);
      return;
    }
    const routeButton = event.target.closest("[data-magazine-go]");
    if (routeButton?.dataset.magazineGo) openRoute(routeButton.dataset.magazineGo);
  });

  document.querySelector("#homeUpdatesButton")?.addEventListener("click", () => {
    document.querySelector("#homeMagazineUpdates")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#citySelect")?.addEventListener("change", render);
  globalThis.addEventListener?.("storage", (event) => {
    if (event.key === STATE_KEY) render();
  });

  const eventRoot = document.querySelector("#boostedHomeEvents");
  if (eventRoot && "MutationObserver" in globalThis) new MutationObserver(render).observe(eventRoot, { childList: true });

  const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!reducedMotion && "IntersectionObserver" in globalThis) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".home-magazine-section").forEach((section) => observer.observe(section));
  } else {
    document.querySelectorAll(".home-magazine-section").forEach((section) => section.classList.add("is-visible"));
  }

  render();
}());
