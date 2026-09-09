/* ============================================================
   ZEYDS MESSAGES — journal de contacts (Services + Emplois + Cash)

   Version scopee de la messagerie : pas de chat in-app en temps
   reel, mais un vrai historique synchronise de qui a ete contacte
   (clic WhatsApp/appel), pour retrouver facilement un contact recent.
   Meme architecture que js/zeyds-favorites.js (table Neon, RPC
   identifiees par telephone) - voir l'en-tete de
   sql-copie-bizzi/118-journal-contacts-v305.sql.
   ============================================================ */

(function () {
  "use strict";

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

  /* ------------------------------------------------------------------ */
  /* Journalisation (fire-and-forget, silencieuse si non identifie -     */
  /* on ne bloque jamais un clic WhatsApp/appel pour ca)                 */
  /* ------------------------------------------------------------------ */
  function logContact(type, id, method) {
    if (!identityReady() || !type || !id) return;
    neonRpc("contact_log_touch", {
      p_user_phone: identity().phone,
      p_item_id: id,
      p_item_type: type,
      p_contact_method: method === "call" ? "call" : "whatsapp",
    }).catch(() => { /* best-effort */ });
  }

  /* ------------------------------------------------------------------ */
  /* Resolution groupee (meme logique que zeyds-favorites.js)            */
  /* ------------------------------------------------------------------ */
  function jobRawId(itemId) { return String(itemId).replace(/^sb-job-/, ""); }

  async function resolveServices(ids) {
    if (!ids.length) return [];
    const rows = await neonSelect("public_provider_directory", `select=*&id=in.(${ids.join(",")})`);
    return rows.map((row) => ({
      type: "service",
      id: String(row.id),
      rawRow: row,
      title: (row.full_name || "Prestataire").trim(),
      subtitle: row.service_name || row.category_name || "",
      location: [row.commune_name || row.neighborhood, row.city_name].filter((v, i, arr) => v && arr.indexOf(v) === i).join(" · "),
      photo: row.photo_url || "",
    }));
  }

  async function resolveJobs(ids) {
    if (!ids.length) return [];
    const rawToStored = new Map(ids.map((id) => [jobRawId(id), id]));
    const rawIds = Array.from(rawToStored.keys());
    const rows = await neonSelect("public_job_offers", `select=*&id=in.(${rawIds.join(",")})`);
    return rows.map((row) => ({
      type: "job",
      id: rawToStored.get(String(row.id)) || `sb-job-${row.id}`,
      rawRow: row,
      title: row.title || "Offre emploi Zeyds",
      subtitle: row.company_name || "Entreprise Zeyds",
      location: [row.area, row.city_name].filter(Boolean).join(" · "),
    }));
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
      status: m.status,
    }));
  }

  /* ------------------------------------------------------------------ */
  /* Ouverture / recontact                                                */
  /* ------------------------------------------------------------------ */
  function openItem(item) {
    if (item.type === "service") {
      const provider = globalThis.providerFromSupabase ? globalThis.providerFromSupabase(item.rawRow, 0) : null;
      if (provider && globalThis.upsertRenewalProvider) globalThis.upsertRenewalProvider(provider);
      globalThis.openProfile?.(provider?.id || `sb-${item.id}`);
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

  function recontact(item) {
    if (item.type === "service" && item.rawRow) {
      const provider = globalThis.providerFromSupabase ? globalThis.providerFromSupabase(item.rawRow, 0) : null;
      const url = provider && globalThis.whatsappContactUrl ? globalThis.whatsappContactUrl(provider) : "";
      if (url) { logContact("service", item.id, "whatsapp"); globalThis.open?.(url, "_blank"); return; }
    }
    if (item.type === "job" && item.rawRow) {
      const job = globalThis.jobOfferFromSupabase ? globalThis.jobOfferFromSupabase(item.rawRow) : null;
      const url = job && globalThis.jobWhatsAppUrl ? globalThis.jobWhatsAppUrl(job) : "";
      if (url) { logContact("job", item.id, "whatsapp"); globalThis.open?.(url, "_blank"); return; }
    }
    // Cash (ou repli service/job sans contact reconstructible) : rouvrir
    // le contenu d'origine, ou le contact exact reste accessible.
    openItem(item);
  }

  /* ------------------------------------------------------------------ */
  /* Ecran                                                                */
  /* ------------------------------------------------------------------ */
  let currentFilter = "all";
  let resolved = [];
  let renderToken = 0;

  function updateFilterCounts() {
    const counts = { all: resolved.length, service: 0, job: 0, cash: 0 };
    resolved.forEach((item) => { counts[item.type] = (counts[item.type] || 0) + 1; });
    document.querySelectorAll("[data-msg-count]").forEach((el) => {
      const key = el.dataset.msgCount;
      el.textContent = counts[key] ? String(counts[key]) : "";
    });
  }

  function emptyState() {
    return `<div class="fav-empty">
      <span class="fav-empty-icon">${BizziIcon("chat")}</span>
      <h3>Aucun contact pour le moment</h3>
      <p>Quand vous contactez un prestataire, un recruteur ou un solveur ZEYDS Cash, il apparaît ici pour que vous le retrouviez facilement.</p>
    </div>`;
  }

  function msgCard(item) {
    if (item.missing) {
      return `<article class="fav-card fav-card-missing">
        <div class="fav-card-media"><span class="fav-card-icon">${BizziIcon("warning")}</span></div>
        <div class="fav-card-body"><strong>Contact introuvable</strong><span class="fav-card-meta">Ce contenu n'est plus disponible.</span></div>
      </article>`;
    }
    const icon = { service: BizziIcon("wrench"), job: BizziIcon("briefcase"), cash: BizziIcon("money") }[item.type];
    const contactIcon = item.contactMethod === "call" ? BizziIcon("phone") : BizziIcon("chat");
    return `<article class="fav-card msg-card">
      <div class="fav-card-media" data-msg-open="${safe(item.type)}:${safe(item.id)}">${item.photo ? `<img src="${safe(item.photo)}" alt="" loading="lazy">` : `<span class="fav-card-icon">${icon}</span>`}</div>
      <div class="fav-card-body">
        <div class="fav-card-top" data-msg-open="${safe(item.type)}:${safe(item.id)}">
          <strong>${safe(item.title)}</strong>
        </div>
        ${item.subtitle ? `<span class="fav-card-subtitle">${safe(item.subtitle)}</span>` : ""}
        <span class="fav-card-meta">${item.location ? `${BizziIcon("pin")} ${safe(item.location)} · ` : ""}${contactIcon} ${safe(timeAgo(item.updatedAt))}</span>
        <div class="msg-card-actions">
          <button class="fav-card-cta" type="button" data-msg-open="${safe(item.type)}:${safe(item.id)}">Voir →</button>
          <button class="msg-recontact-btn" type="button" data-msg-recontact="${safe(item.type)}:${safe(item.id)}">Recontacter</button>
        </div>
      </div>
    </article>`;
  }

  function renderList() {
    const content = document.querySelector("#msgContent");
    if (!content) return;
    const list = currentFilter === "all" ? resolved : resolved.filter((item) => item.type === currentFilter);
    if (!resolved.length) { content.innerHTML = emptyState(); return; }
    if (!list.length) { content.innerHTML = `<div class="fav-empty"><h3>Rien ici</h3><p>Aucun contact dans cette catégorie.</p></div>`; return; }
    content.innerHTML = `<div class="fav-grid">${list.map(msgCard).join("")}</div>`;
  }

  async function renderScreen() {
    const token = ++renderToken;
    const content = document.querySelector("#msgContent");
    if (!identityReady()) {
      if (content) content.innerHTML = emptyState();
      updateFilterCounts();
      return;
    }
    if (content) content.innerHTML = `<div class="fav-loading">Chargement…</div>`;

    let entries = [];
    try {
      entries = await neonRpc("contact_log_list", { p_user_phone: identity().phone, p_limit: 50 });
    } catch { entries = []; }
    if (token !== renderToken) return;

    const grouped = { service: [], job: [], cash: [] };
    (entries || []).forEach((e) => { if (grouped[e.item_type]) grouped[e.item_type].push(e.item_id); });

    let services = [];
    let jobs = [];
    let cash = [];
    try {
      [services, jobs, cash] = await Promise.all([
        resolveServices(grouped.service).catch(() => []),
        resolveJobs(grouped.job).catch(() => []),
        resolveCash(grouped.cash).catch(() => []),
      ]);
    } catch { /* chaque resolve absorbe deja ses erreurs */ }
    if (token !== renderToken) return;

    function cacheKey(t, id) { return `${t}:${id}`; }
    const entryByKey = new Map((entries || []).map((e) => [cacheKey(e.item_type, e.item_id), e]));
    resolved = [...services, ...jobs, ...cash].map((item) => {
      const entry = entryByKey.get(cacheKey(item.type, item.id));
      return { ...item, updatedAt: entry?.updated_at, contactMethod: entry?.contact_method };
    });

    const resolvedKeys = new Set(resolved.map((item) => cacheKey(item.type, item.id)));
    (entries || []).forEach((e) => {
      const key = cacheKey(e.item_type, e.item_id);
      if (!resolvedKeys.has(key)) resolved.push({ type: e.item_type, id: e.item_id, missing: true, updatedAt: e.updated_at });
    });

    resolved.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

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

    document.querySelector("#msgFilterBar")?.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-msg-filter]");
      if (!chip) return;
      currentFilter = chip.dataset.msgFilter;
      document.querySelectorAll("#msgFilterBar [data-msg-filter]").forEach((btn) => btn.setAttribute("aria-pressed", String(btn === chip)));
      renderList();
    });

    document.addEventListener("click", (e) => {
      // Point d'entree unique pour tout lien de contact (WhatsApp/tel:)
      // marque data-log-contact="type:id" par Services (app.js), Emplois
      // (js/zeyds-jobs.js) ou Cash (js/zeyds-cash.js). Volontairement le
      // SEUL endroit qui ecoute cet attribut, pour eviter un double
      // enregistrement si plusieurs modules l'observaient chacun de leur
      // cote (chaque module a sa propre delegation globale sur document).
      const contactLink = e.target.closest("[data-log-contact]");
      if (contactLink) {
        const [type, ...rest] = contactLink.dataset.logContact.split(":");
        logContact(type, rest.join(":"), type === "cash" ? "call" : "whatsapp");
        // pas de return : laisser la navigation (wa.me / tel:) continuer.
      }

      const openBtn = e.target.closest("[data-msg-open]");
      if (openBtn) {
        const [type, ...rest] = openBtn.dataset.msgOpen.split(":");
        const item = resolved.find((it) => it.type === type && it.id === rest.join(":"));
        if (item) openItem(item);
        return;
      }
      const recontactBtn = e.target.closest("[data-msg-recontact]");
      if (recontactBtn) {
        const [type, ...rest] = recontactBtn.dataset.msgRecontact.split(":");
        const item = resolved.find((it) => it.type === type && it.id === rest.join(":"));
        if (item) recontact(item);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* API publique                                                         */
  /* ------------------------------------------------------------------ */
  function render() { renderScreen(); }
  function init() { bind(); }

  globalThis.BizziMessages = Object.freeze({ init, render, logContact });
})();
