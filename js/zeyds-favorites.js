/* ============================================================
   ZEYDS FAVORIS — bibliotheque personnelle centralisee
   Services + Emplois + Zeyds Cash, synchronisee partout.

   La table favorites vit sur NEON (donnee utilisateur ordinaire,
   comme service_requests/express_requests), identifiee par
   telephone normalise (meme pattern que Zeyds Cash/Jobs). Les
   missions Zeyds Cash vivent sur Supabase (systeme financier,
   base physiquement separee) : leur resolution passe par une RPC
   Supabase dediee (cash_list_missions_by_ids). Voir l'en-tete de
   sql-copie-bizzi/116-favoris-v305.sql pour le raisonnement complet.
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* API — Neon pour les favoris eux-memes + services/emplois,          */
  /* Supabase uniquement pour resoudre les favoris Zeyds Cash.           */
  /* ------------------------------------------------------------------ */
  function neonCfg() { return globalThis.BizziConfig?.restBackend || {}; }
  function supaCfg() { return globalThis.BizziConfig?.supabase || {}; }

  function restHeaders(cfg) {
    const key = cfg.anonKey || "";
    return {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Bizzi-Client-Token": globalThis.BizziPrivacy?.token?.() || "",
    };
  }

  function restUrl(cfg, path) {
    const base = String(cfg.url || "").replace(/\/+$/, "");
    return `${base}/rest/v1/${path}`;
  }

  async function neonRpc(name, args = {}) {
    const cfg = neonCfg();
    const response = await fetch(restUrl(cfg, `rpc/${name}`), { method: "POST", headers: restHeaders(cfg), body: JSON.stringify(args) });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || data?.error || `Erreur (${name})`);
    return data;
  }

  async function neonSelect(resource, query) {
    const cfg = neonCfg();
    const response = await fetch(restUrl(cfg, `${resource}?${query}`), { headers: restHeaders(cfg) });
    const data = await response.json().catch(() => []);
    if (!response.ok) throw new Error((Array.isArray(data) ? "" : data?.message) || `Erreur (${resource})`);
    return Array.isArray(data) ? data : [];
  }

  async function supaRpc(name, args = {}) {
    const cfg = supaCfg();
    const response = await fetch(restUrl(cfg, `rpc/${name}`), { method: "POST", headers: restHeaders(cfg), body: JSON.stringify(args) });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || data?.error || `Erreur (${name})`);
    return data;
  }

  /* ------------------------------------------------------------------ */
  /* Identite + utilitaires (copie locale, meme convention que           */
  /* zeyds-cash.js / zeyds-jobs.js)                                       */
  /* ------------------------------------------------------------------ */
  function identity() { return globalThis.BizziIdentity?.get?.() || { name: "", phone: "" }; }
  function identityReady() { return Boolean(globalThis.BizziIdentity?.ready?.()); }

  function safe(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatMoney(v) {
    return `${new Intl.NumberFormat("fr-FR").format(Math.round(Number(v || 0)))} FCFA`;
  }

  function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `Il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Il y a ${h}h`;
    return `Il y a ${Math.floor(h / 24)}j`;
  }

  let toastTimer = null;
  function toast(message, isError) {
    let el = document.querySelector("#favToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "favToast";
      el.className = "fav-toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.toggle("fav-toast-error", Boolean(isError));
    el.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 3000);
  }

  /* ------------------------------------------------------------------ */
  /* Cache local des favoris (source de verite unique = Neon, mais       */
  /* isFavorite() doit rester synchrone pour le rendu des cartes des     */
  /* 3 modules) — mise a jour optimiste au toggle.                       */
  /* ------------------------------------------------------------------ */
  let cache = new Set();
  let cacheMeta = new Map();
  let loadedForPhone = null;

  function cacheKey(type, id) { return `${type}:${id}`; }

  async function loadFavorites(force = false) {
    const phone = identity().phone;
    if (!identityReady()) {
      cache = new Set();
      cacheMeta = new Map();
      loadedForPhone = null;
      return;
    }
    if (!force && loadedForPhone === phone) return;
    try {
      const list = await neonRpc("favorite_list", { p_user_phone: phone });
      cache = new Set((list || []).map((f) => cacheKey(f.item_type, f.item_id)));
      cacheMeta = new Map((list || []).map((f) => [cacheKey(f.item_type, f.item_id), f.created_at]));
      loadedForPhone = phone;
    } catch {
      /* garde le cache precedent en cas d'erreur reseau */
    }
  }

  function isFavorite(type, id) {
    return cache.has(cacheKey(type, id));
  }

  function getAll() {
    return Array.from(cache).map((key) => {
      const [item_type, ...rest] = key.split(":");
      const item_id = rest.join(":");
      return { item_type, item_id, created_at: cacheMeta.get(key) || null };
    });
  }

  function updateHeartButtons(type, id, active) {
    // item_id est toujours un uuid (eventuellement prefixe "sb-job-"), donc
    // sans guillemet ni backslash : pas besoin d'echappement CSS ici.
    const selectorValue = cacheKey(type, id).replace(/"/g, '\\"');
    document.querySelectorAll(`[data-fav-toggle="${selectorValue}"]`).forEach((btn) => {
      btn.classList.toggle("is-favorite", active);
      btn.setAttribute("aria-pressed", String(active));
      const label = active ? "Retirer des favoris" : "Ajouter aux favoris";
      btn.setAttribute("aria-label", label);
      btn.title = label;
      btn.textContent = active ? "♥" : "♡";
    });
  }

  async function performToggle(type, id) {
    const key = cacheKey(type, id);
    const wasFavorite = cache.has(key);
    if (wasFavorite) cache.delete(key);
    else { cache.add(key); cacheMeta.set(key, new Date().toISOString()); }
    updateHeartButtons(type, id, !wasFavorite);
    toast(wasFavorite ? "Retiré des favoris" : "Ajouté aux favoris");

    try {
      const phone = identity().phone;
      if (wasFavorite) await neonRpc("favorite_remove", { p_user_phone: phone, p_item_id: id, p_item_type: type });
      else await neonRpc("favorite_add", { p_user_phone: phone, p_item_id: id, p_item_type: type });
    } catch {
      if (wasFavorite) { cache.add(key); cacheMeta.set(key, new Date().toISOString()); }
      else cache.delete(key);
      updateHeartButtons(type, id, wasFavorite);
      toast("Connexion instable — réessaie.", true);
      return;
    }
    if (document.querySelector("#view-favorites")?.classList.contains("active")) renderScreen();
  }

  function toggle(type, id) {
    if (!type || !id) return;
    if (!identityReady()) {
      globalThis.openClientAccessGate?.("search", "enregistrer ce favori", () => performToggle(type, id));
      return;
    }
    performToggle(type, id);
  }

  /* ------------------------------------------------------------------ */
  /* Resolution des elements favorises, groupee par type (pas de N+1)    */
  /* ------------------------------------------------------------------ */
  function jobRawId(itemId) { return String(itemId).replace(/^sb-job-/, ""); }

  async function resolveServices(ids) {
    if (!ids.length) return [];
    const rows = await neonSelect("public_provider_directory", `select=*&id=in.(${ids.join(",")})`);
    return rows.map((row) => {
      const provider = globalThis.providerFromSupabase ? globalThis.providerFromSupabase(row, 0) : null;
      const area = row.commune_name || row.neighborhood || row.city_name || "";
      return {
        type: "service",
        // item_id stocke = provider.remoteId (brut, non prefixe) - voir le
        // bouton coeur ajoute dans providerCard() (app.js). Le prefixe
        // "sb-..." n'est utile qu'a l'ouverture (openItem), pas ici.
        id: String(row.id),
        rawRow: row,
        title: (provider?.fullName || row.full_name || "Prestataire").trim(),
        subtitle: provider?.service || row.service_name || row.category_name || "",
        location: [area, row.city_name].filter((v, i, arr) => v && arr.indexOf(v) === i).join(" · "),
        rating: Number(row.average_rating || 0),
        photo: row.photo_url || "",
        unavailable: row.visibility_status === "expired_blurred",
      };
    });
  }

  async function resolveJobs(ids) {
    if (!ids.length) return [];
    const rawToStored = new Map(ids.map((id) => [jobRawId(id), id]));
    const rawIds = Array.from(rawToStored.keys());
    const rows = await neonSelect("public_job_offers", `select=*&id=in.(${rawIds.join(",")})`);
    return rows.map((row) => {
      const expiresAt = row.expires_at;
      return {
        type: "job",
        id: rawToStored.get(String(row.id)) || `sb-job-${row.id}`,
        rawRow: row,
        title: row.title || "Offre emploi Zeyds",
        subtitle: row.company_name || "Entreprise Zeyds",
        location: [row.area, row.city_name].filter(Boolean).join(" · "),
        contractType: row.contract_type || "",
        expired: expiresAt ? new Date(expiresAt).getTime() <= Date.now() : false,
        createdAt: row.created_at,
        expiresAt,
      };
    });
  }

  async function resolveCash(ids) {
    if (!ids.length) return [];
    const rows = await supaRpc("cash_list_missions_by_ids", { p_ids: ids });
    return (rows || []).map((m) => ({
      type: "cash",
      id: m.id,
      title: m.title || "Mission ZEYDS Cash",
      subtitle: m.category || "",
      location: m.area || "",
      reward: Number(m.reward_amount || 0),
      secured: Boolean(m.secured),
      status: m.status,
      ended: ["completed", "expired", "cancelled"].includes(m.status),
      createdAt: m.created_at,
    }));
  }

  /* ------------------------------------------------------------------ */
  /* Ouverture d'un element favorise dans son module d'origine            */
  /* ------------------------------------------------------------------ */
  function openItem(item) {
    if (item.missing) return;
    if (item.type === "service") {
      const provider = globalThis.providerFromSupabase ? globalThis.providerFromSupabase(item.rawRow, 0) : null;
      if (provider && globalThis.upsertRenewalProvider) globalThis.upsertRenewalProvider(provider);
      globalThis.openProfile?.(provider?.id || item.id);
      return;
    }
    if (item.type === "job") {
      const job = globalThis.jobOfferFromSupabase ? globalThis.jobOfferFromSupabase(item.rawRow) : null;
      if (job && globalThis.upsertJobOfferIntoState) globalThis.upsertJobOfferIntoState(job);
      globalThis.ZeydsJobs?.openDetail?.(job?.id || item.id);
      return;
    }
    if (item.type === "cash") {
      globalThis.ZeydsCash?.openMission?.(item.id);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Ecran principal                                                     */
  /* ------------------------------------------------------------------ */
  let currentFilter = "all";
  let currentSort = "recent";
  let currentSearch = "";
  let resolved = [];
  let renderToken = 0;

  const TYPE_LABEL = { service: "Services", job: "Emplois", cash: "Zeyds Cash" };

  function updateFilterCounts() {
    const counts = { all: resolved.length, service: 0, job: 0, cash: 0 };
    resolved.forEach((item) => { counts[item.type] = (counts[item.type] || 0) + 1; });
    document.querySelectorAll("[data-fav-count]").forEach((el) => {
      const key = el.dataset.favCount;
      el.textContent = counts[key] ? String(counts[key]) : "";
    });
  }

  function matchesSearch(item, term) {
    if (!term) return true;
    const haystack = [item.title, item.subtitle, item.location].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(term);
  }

  function sortItems(items) {
    const list = [...items];
    if (currentSort === "az") list.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    else if (currentSort === "old") list.sort((a, b) => new Date(a.favoritedAt || 0) - new Date(b.favoritedAt || 0));
    else list.sort((a, b) => new Date(b.favoritedAt || 0) - new Date(a.favoritedAt || 0));
    return list;
  }

  function emptyStateGlobal() {
    return `<div class="fav-empty">
      <span class="fav-empty-icon">💛</span>
      <h3>Aucun favori pour le moment</h3>
      <p>Enregistrez les services, offres d'emploi et opportunités Zeyds Cash qui vous intéressent pour les retrouver facilement ici.</p>
      <div class="fav-empty-shortcuts">
        <button type="button" data-go="search"><span>🔧</span><strong>Services</strong><small>Explorer les services</small></button>
        <button type="button" data-go="jobs"><span>💼</span><strong>Emplois</strong><small>Voir les emplois</small></button>
        <button type="button" data-go="cash"><span>💵</span><strong>Zeyds Cash</strong><small>Découvrir Zeyds Cash</small></button>
      </div>
    </div>`;
  }

  const CATEGORY_EMPTY = {
    service: { title: "Aucun service enregistré", desc: "Explorez les prestataires disponibles sur ZEYDS et ajoutez ceux qui vous intéressent.", cta: "Explorer les services", go: "search" },
    job: { title: "Aucune offre enregistrée", desc: "Sauvegardez les offres qui vous intéressent pour pouvoir y revenir plus tard.", cta: "Voir les emplois", go: "jobs" },
    cash: { title: "Aucune opportunité enregistrée", desc: "Ajoutez les opportunités qui vous intéressent pour les retrouver facilement.", cta: "Découvrir Zeyds Cash", go: "cash" },
  };

  function emptyStateCategory(type) {
    const info = CATEGORY_EMPTY[type];
    if (!info) return emptyStateGlobal();
    return `<div class="fav-empty">
      <h3>${safe(info.title)}</h3>
      <p>${safe(info.desc)}</p>
      <button class="fav-empty-cta" type="button" data-go="${info.go}">${safe(info.cta)}</button>
    </div>`;
  }

  function skeletonCards() {
    return `<div class="fav-grid">${Array.from({ length: 4 }).map(() => `
      <article class="fav-card fav-skeleton" aria-hidden="true">
        <div class="fav-card-media"></div>
        <div class="fav-card-body">
          <span class="fav-skel-line fav-skel-title"></span>
          <span class="fav-skel-line fav-skel-sub"></span>
          <span class="fav-skel-line fav-skel-meta"></span>
        </div>
      </article>`).join("")}</div>`;
  }

  function favCard(item) {
    if (item.missing) {
      return `<article class="fav-card fav-card-missing">
        <div class="fav-card-media"><span class="fav-card-icon">⚠️</span></div>
        <div class="fav-card-body">
          <div class="fav-card-top"><strong>Élément introuvable</strong>${favHeart(item)}</div>
          <span class="fav-card-meta">Ce contenu n'est plus disponible.</span>
        </div>
      </article>`;
    }

    const icon = { service: "🔧", job: "💼", cash: "💵" }[item.type];
    let metaLine = safe(item.location ? `📍 ${item.location}` : "");
    let statusBadge = "";
    let ctaLabel = "Voir →";

    if (item.type === "service") {
      ctaLabel = "Voir le profil →";
      if (item.rating > 0) metaLine += ` · ★ ${item.rating.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}`;
      if (item.unavailable) statusBadge = `<span class="fav-status-chip">Indisponible</span>`;
    } else if (item.type === "job") {
      ctaLabel = "Voir l'offre →";
      if (item.contractType) metaLine += ` · ${safe(item.contractType)}`;
      if (item.expired) statusBadge = `<span class="fav-status-chip fav-status-warn">Offre expirée</span>`;
    } else if (item.type === "cash") {
      ctaLabel = "Voir →";
      if (item.reward) metaLine += ` · 💰 ${safe(formatMoney(item.reward))}`;
      if (item.ended) statusBadge = `<span class="fav-status-chip">${item.status === "expired" ? "Offre terminée" : "Terminée"}</span>`;
      else if (item.secured) statusBadge = `<span class="fav-secured-chip">🔒 Sécurisée</span>`;
    }

    return `<article class="fav-card" role="button" tabindex="0" data-fav-open="${safe(item.type)}:${safe(item.id)}">
      <div class="fav-card-media">${item.photo ? `<img src="${safe(item.photo)}" alt="" loading="lazy">` : `<span class="fav-card-icon">${icon}</span>`}</div>
      <div class="fav-card-body">
        <div class="fav-card-top">
          <strong>${safe(item.title)}</strong>
          ${favHeart(item)}
        </div>
        ${item.subtitle ? `<span class="fav-card-subtitle">${safe(item.subtitle)}</span>` : ""}
        ${metaLine ? `<span class="fav-card-meta">${metaLine}</span>` : ""}
        ${statusBadge}
        <button class="fav-card-cta" type="button" data-fav-open="${safe(item.type)}:${safe(item.id)}">${ctaLabel}</button>
      </div>
    </article>`;
  }

  function favHeart(item) {
    return `<button class="fav-heart is-favorite" type="button" data-fav-toggle="${safe(item.type)}:${safe(item.id)}" aria-pressed="true" aria-label="Retirer des favoris" title="Retirer des favoris">♥</button>`;
  }

  function renderList() {
    const term = currentSearch.trim().toLowerCase();
    let list = currentFilter === "all" ? resolved : resolved.filter((item) => item.type === currentFilter);
    list = list.filter((item) => matchesSearch(item, term));
    list = sortItems(list);

    const content = document.querySelector("#favContent");
    if (!content) return;

    if (!resolved.length) {
      content.innerHTML = emptyStateGlobal();
      return;
    }
    if (!list.length) {
      content.innerHTML = term
        ? `<div class="fav-empty"><h3>Aucun résultat</h3><p>Aucun favori ne correspond à « ${safe(currentSearch)} ».</p></div>`
        : emptyStateCategory(currentFilter);
      return;
    }
    content.innerHTML = `<div class="fav-grid">${list.map(favCard).join("")}</div>`;
  }

  async function renderScreen() {
    const token = ++renderToken;
    const content = document.querySelector("#favContent");
    if (!identityReady()) {
      if (content) content.innerHTML = emptyStateGlobal();
      updateFilterCounts();
      return;
    }
    if (content) content.innerHTML = skeletonCards();

    await loadFavorites();
    const grouped = { service: [], job: [], cash: [] };
    getAll().forEach((f) => { if (grouped[f.item_type]) grouped[f.item_type].push(f.item_id); });

    let services = [];
    let jobs = [];
    let cash = [];
    try {
      [services, jobs, cash] = await Promise.all([
        resolveServices(grouped.service).catch(() => []),
        resolveJobs(grouped.job).catch(() => []),
        resolveCash(grouped.cash).catch(() => []),
      ]);
    } catch {
      /* chaque resolve() absorbe deja ses propres erreurs */
    }
    if (token !== renderToken) return;

    const favoritedAtByKey = new Map(getAll().map((f) => [cacheKey(f.item_type, f.item_id), f.created_at]));
    resolved = [...services, ...jobs, ...cash].map((item) => ({ ...item, favoritedAt: favoritedAtByKey.get(cacheKey(item.type, item.id)) }));

    const resolvedKeys = new Set(resolved.map((item) => cacheKey(item.type, item.id)));
    getAll().forEach((f) => {
      const key = cacheKey(f.item_type, f.item_id);
      if (!resolvedKeys.has(key)) {
        resolved.push({ type: f.item_type, id: f.item_id, missing: true, title: "Élément introuvable", favoritedAt: f.created_at });
      }
    });

    updateFilterCounts();
    renderList();
  }

  /* ------------------------------------------------------------------ */
  /* Evenements                                                           */
  /* ------------------------------------------------------------------ */
  let bound = false;
  function bind() {
    if (bound) return;
    bound = true;

    document.querySelector("#favSearchInput")?.addEventListener("input", (e) => {
      currentSearch = e.target.value || "";
      renderList();
    });
    document.querySelector("#favSortSelect")?.addEventListener("change", (e) => {
      currentSort = e.target.value || "recent";
      renderList();
    });
    document.querySelector("#favFilterBar")?.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-fav-filter]");
      if (!chip) return;
      currentFilter = chip.dataset.favFilter;
      document.querySelectorAll("#favFilterBar [data-fav-filter]").forEach((btn) => btn.setAttribute("aria-pressed", String(btn === chip)));
      renderList();
    });

    document.addEventListener("click", (e) => {
      const heart = e.target.closest("[data-fav-toggle]");
      if (heart) {
        e.preventDefault();
        e.stopPropagation();
        const [type, ...rest] = heart.dataset.favToggle.split(":");
        toggle(type, rest.join(":"));
        return;
      }
      const openBtn = e.target.closest("[data-fav-open]");
      if (openBtn) {
        const [type, ...rest] = openBtn.dataset.favOpen.split(":");
        const id = rest.join(":");
        const item = resolved.find((it) => it.type === type && it.id === id);
        if (item) openItem(item);
        return;
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const card = e.target.closest("[data-fav-open]");
      if (!card) return;
      const [type, ...rest] = card.dataset.favOpen.split(":");
      const item = resolved.find((it) => it.type === type && it.id === rest.join(":"));
      if (item) openItem(item);
    });
  }

  /* ------------------------------------------------------------------ */
  /* API publique                                                         */
  /* ------------------------------------------------------------------ */
  function render() {
    renderScreen();
  }

  function init() {
    bind();
    if (identityReady()) loadFavorites();
  }

  globalThis.BizziFavorites = Object.freeze({
    init,
    render,
    toggle,
    isFavorite,
    getAll,
    toast,
  });
})();
