(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Storage                                                              */
  /* ------------------------------------------------------------------ */
  const NEEDS_KEY    = "zeyds-cash-needs-v1";
  const SOLS_KEY     = "zeyds-cash-solutions-v1";
  const CONFIG_KEY   = "zeyds-cash-config-v1";
  const NOTIFS_KEY   = "zeyds-cash-notifs-v1";
  const REPORTS_KEY  = "zeyds-cash-reports-v1";

  const DEFAULT_CONFIG = {
    commissionRate: 0.10,
    maxReward: 500000,
    paymentProviders: ["wave", "orange-money", "mtn-money", "moov-money"],
  };

  const CATEGORIES = ["Services", "Livraison", "Emploi", "Logement", "Vente", "Événements", "Autre"];
  const AREAS = [
    "Cocody", "Yopougon", "Marcory", "Plateau", "Treichville",
    "Adjamé", "Abobo", "Koumassi", "Port-Bouët", "Riviera",
    "Angré", "Zone 4", "Bingerville", "Bouaké", "Toute la ville",
  ];

  /* ------------------------------------------------------------------ */
  /* Utils                                                                */
  /* ------------------------------------------------------------------ */
  function safe(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readJson(key, fallback) {
    try {
      const raw = globalThis.BizziStorage?.localGet?.(key)
        ?? globalThis.localStorage?.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function writeJson(key, value) {
    const raw = JSON.stringify(value);
    try {
      if (globalThis.BizziStorage?.localSet) globalThis.BizziStorage.localSet(key, raw);
      else globalThis.localStorage?.setItem(key, raw);
    } catch { /* quota exceeded, silent */ }
  }

  function uid() {
    return `cash-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function formatMoney(v) {
    const n = Number(v || 0);
    return n > 0
      ? `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`
      : "Gratuit";
  }

  function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `Il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Il y a ${h}h`;
    const d = Math.floor(h / 24);
    return `Il y a ${d}j`;
  }

  /* ------------------------------------------------------------------ */
  /* State accessors                                                      */
  /* ------------------------------------------------------------------ */
  function config() {
    return { ...DEFAULT_CONFIG, ...(readJson(CONFIG_KEY, {}) || {}) };
  }

  function needs() {
    const v = readJson(NEEDS_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  function solutions() {
    const v = readJson(SOLS_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  function notifs() {
    const v = readJson(NOTIFS_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  function currentUser() {
    const p = globalThis.BizziClientProfile?.get?.() || {};
    return {
      id: p.id || p.phone || "guest",
      name: p.name || p.firstName || "Anonyme",
    };
  }

  /* ------------------------------------------------------------------ */
  /* CRUD                                                                 */
  /* ------------------------------------------------------------------ */
  function addNeed({ title, description, category, area, reward }) {
    const user = currentUser();
    const need = {
      id: uid(),
      title: String(title || "").trim(),
      description: String(description || "").trim(),
      category: category || "Autre",
      area: area || "Toute la ville",
      authorId: user.id,
      authorName: user.name,
      reward: Math.max(0, Number(reward || 0)),
      status: "open",
      createdAt: new Date().toISOString(),
      acceptedSolutionId: null,
    };
    if (!need.title) return null;
    writeJson(NEEDS_KEY, [need, ...needs()].slice(0, 200));
    return need;
  }

  function addSolution({ needId, type, description, contact }) {
    if (!needId || !description?.trim()) return null;
    const user = currentUser();
    const sol = {
      id: `sol-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      needId,
      type: type || "je_peux",
      description: String(description).trim(),
      contact: String(contact || "").trim(),
      authorId: user.id,
      authorName: user.name,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    writeJson(SOLS_KEY, [sol, ...solutions()].slice(0, 500));
    pushNotif(needId, `${safe(user.name)} a proposé une solution`);
    return sol;
  }

  function acceptSolution(needId, solutionId) {
    const allNeeds = needs();
    const need = allNeeds.find(n => n.id === needId);
    if (!need) return;
    need.status = "resolved";
    need.acceptedSolutionId = solutionId;
    writeJson(NEEDS_KEY, allNeeds);

    const allSols = solutions();
    allSols.forEach(s => {
      if (s.needId === needId) {
        s.status = s.id === solutionId ? "accepted" : "refused";
      }
    });
    writeJson(SOLS_KEY, allSols);
  }

  function refuseSolution(solutionId) {
    const all = solutions();
    const s = all.find(x => x.id === solutionId);
    if (s) { s.status = "refused"; writeJson(SOLS_KEY, all); }
  }

  function closeNeed(needId) {
    const all = needs();
    const n = all.find(x => x.id === needId);
    if (n) { n.status = "closed"; writeJson(NEEDS_KEY, all); }
  }

  function reportItem(type, targetId, reason) {
    const all = readJson(REPORTS_KEY, []) || [];
    all.unshift({ type, targetId, reason, createdAt: new Date().toISOString() });
    writeJson(REPORTS_KEY, all.slice(0, 100));
  }

  /* ------------------------------------------------------------------ */
  /* Notifications                                                        */
  /* ------------------------------------------------------------------ */
  function pushNotif(needId, message) {
    const all = notifs();
    all.unshift({ id: uid(), needId, message, read: false, createdAt: new Date().toISOString() });
    writeJson(NOTIFS_KEY, all.slice(0, 50));
    renderNotifBadge();
  }

  function markNotifsRead() {
    writeJson(NOTIFS_KEY, notifs().map(n => ({ ...n, read: true })));
    renderNotifBadge();
  }

  function renderNotifBadge() {
    const badge = document.querySelector("#cashNotifBadge");
    if (!badge) return;
    const count = notifs().filter(n => !n.read).length;
    badge.textContent = count > 0 ? String(count) : "";
    badge.hidden = count === 0;
  }

  /* ------------------------------------------------------------------ */
  /* Feed                                                                 */
  /* ------------------------------------------------------------------ */
  let feedFilter = { category: "", area: "", rewarded: false };

  function solsForNeed(needId) {
    return solutions().filter(s => s.needId === needId);
  }

  function needCard(n) {
    const count = solsForNeed(n.id).length;
    const rewardBadge = n.reward > 0
      ? `<span class="cash-reward-badge">💰 ${safe(formatMoney(n.reward))}</span>`
      : `<span class="cash-free-badge">Gratuit</span>`;
    const statusBadge = n.status === "resolved"
      ? `<span class="cash-status-resolved">✓ Résolu</span>`
      : n.status === "closed"
      ? `<span class="cash-status-closed">Fermé</span>` : "";
    return `<article class="cash-need-card${n.status !== "open" ? " cash-card-done" : ""}" role="button" tabindex="0" data-cash-open-need="${safe(n.id)}">
      <div class="cash-card-tags">
        <span class="cash-cat-chip">${safe(n.category)}</span>
        ${rewardBadge}${statusBadge}
      </div>
      <h3 class="cash-card-title">${safe(n.title)}</h3>
      ${n.description ? `<p class="cash-card-desc">${safe(n.description.slice(0, 120))}${n.description.length > 120 ? "…" : ""}</p>` : ""}
      <div class="cash-card-meta">
        <span>📍 ${safe(n.area)}</span>
        <span>👤 ${safe(n.authorName)}</span>
        <span>🕐 ${safe(timeAgo(n.createdAt))}</span>
        <span class="cash-sols-pill">${count} proposition${count !== 1 ? "s" : ""}</span>
      </div>
    </article>`;
  }

  function renderFeed() {
    const container = document.querySelector("#cashFeed");
    if (!container) return;
    let list = needs().filter(n => n.status !== "closed");
    if (feedFilter.category) list = list.filter(n => n.category === feedFilter.category);
    if (feedFilter.area) list = list.filter(n => n.area === feedFilter.area || n.area === "Toute la ville");
    if (feedFilter.rewarded) list = list.filter(n => n.reward > 0);

    if (!list.length) {
      container.innerHTML = `<div class="cash-empty">
        <span>💸</span>
        <strong>Aucun besoin publié.</strong>
        <p>Soyez le premier à partager un besoin.</p>
        <button class="cash-publish-cta" type="button" data-cash-publish>Publier un besoin</button>
      </div>`;
      return;
    }
    container.innerHTML = list.map(needCard).join("");
  }

  function renderFilterChips() {
    document.querySelectorAll("[data-cash-filter]").forEach(btn => {
      const key = btn.dataset.cashFilter;
      const val = btn.dataset.cashFilterVal;
      let on = false;
      if (key === "category") on = feedFilter.category === val;
      else if (key === "area") on = feedFilter.area === val;
      else if (key === "rewarded") on = feedFilter.rewarded;
      btn.setAttribute("aria-pressed", String(on));
      btn.classList.toggle("active", on);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Need detail                                                          */
  /* ------------------------------------------------------------------ */
  let currentNeedId = null;

  function renderNeedDetail(needId) {
    const need = needs().find(n => n.id === needId);
    const panel = document.querySelector("#cashNeedDetail");
    if (!panel || !need) return;

    const user = currentUser();
    const isAuthor = need.authorId === user.id;
    const cfg = config();
    const sols = solsForNeed(needId);
    const commission = need.reward * cfg.commissionRate;
    const gain = need.reward - commission;
    const commPct = Math.round(cfg.commissionRate * 100);

    panel.innerHTML = `
      <div class="cash-detail-bar">
        <button class="cash-back-btn" type="button" data-cash-open-feed aria-label="Retour au feed">← Retour</button>
        <button class="cash-report-link" type="button" data-cash-report="${safe(needId)}">Signaler</button>
      </div>
      <div class="cash-detail-hero">
        <div class="cash-card-tags">
          <span class="cash-cat-chip">${safe(need.category)}</span>
          ${need.reward > 0 ? `<span class="cash-reward-badge">💰 ${safe(formatMoney(need.reward))}</span>` : '<span class="cash-free-badge">Gratuit</span>'}
          ${need.status === "resolved" ? '<span class="cash-status-resolved">✓ Résolu</span>' : ""}
        </div>
        <h2>${safe(need.title)}</h2>
        ${need.description ? `<p class="cash-detail-desc">${safe(need.description)}</p>` : ""}
        <div class="cash-card-meta">
          <span>📍 ${safe(need.area)}</span>
          <span>👤 ${safe(need.authorName)}</span>
          <span>🕐 ${safe(timeAgo(need.createdAt))}</span>
        </div>
        ${need.reward > 0 ? `<div class="cash-reward-info">
          <div class="cash-reward-row">
            <span>Récompense totale</span><strong>${safe(formatMoney(need.reward))}</strong>
          </div>
          <div class="cash-reward-row">
            <span>Votre gain net (après ${commPct}% Zeyds)</span><strong class="cash-gain-highlight">${safe(formatMoney(gain))}</strong>
          </div>
          <div class="cash-payment-providers">
            <span>Paiement via</span>
            <span class="cash-provider-chip">Wave</span>
            <span class="cash-provider-chip">Orange Money</span>
            <span class="cash-provider-chip">MTN Money</span>
            <span class="cash-provider-chip">Moov Money</span>
          </div>
        </div>` : ""}
        ${need.status === "open" && !isAuthor ? `<div class="cash-propose-row">
          <button class="cash-propose-btn" type="button" data-cash-propose="${safe(needId)}" data-propose-type="je_connais">
            <span>👥</span><strong>Je connais quelqu'un</strong>
          </button>
          <button class="cash-propose-btn cash-propose-accent" type="button" data-cash-propose="${safe(needId)}" data-propose-type="je_peux">
            <span>✋</span><strong>Je peux le faire</strong>
          </button>
        </div>` : ""}
        <button class="cash-whatsapp-btn" type="button" data-cash-whatsapp="${safe(needId)}">
          📲 Partager sur WhatsApp
        </button>
      </div>
      <div class="cash-solutions-block">
        <div class="cash-section-head">
          <h3>Propositions</h3>
          <span class="cash-count-badge">${sols.length}</span>
        </div>
        ${!sols.length ? `<p class="cash-sols-empty">Aucune proposition encore — soyez le premier.</p>` : ""}
        <div class="cash-solutions-list">
          ${sols.map(s => solutionCard(s, isAuthor, need)).join("")}
        </div>
      </div>`;

    panel.hidden = false;
  }

  function solutionCard(s, isAuthor, need) {
    const label = s.type === "je_connais" ? "👥 Je connais quelqu'un" : "✋ Je peux le faire";
    const statusLabel = s.status === "accepted" ? "✓ Acceptée" : s.status === "refused" ? "✗ Refusée" : "En attente";
    const statusClass = s.status === "accepted" ? "cash-sol-accepted" : s.status === "refused" ? "cash-sol-refused" : "cash-sol-pending";
    return `<div class="cash-sol-card ${statusClass}">
      <div class="cash-sol-header">
        <span class="cash-sol-type">${label}</span>
        <span class="cash-sol-status">${statusLabel}</span>
      </div>
      <p>${safe(s.description)}</p>
      ${s.contact ? `<a class="cash-sol-contact" href="tel:${safe(s.contact)}">📞 ${safe(s.contact)}</a>` : ""}
      <div class="cash-sol-meta">
        <span>👤 ${safe(s.authorName)}</span>
        <span>🕐 ${safe(timeAgo(s.createdAt))}</span>
      </div>
      ${isAuthor && s.status === "pending" && need.status === "open"
        ? `<div class="cash-sol-actions">
            <button class="cash-accept-btn" type="button" data-cash-accept="${safe(s.id)}" data-cash-need-id="${safe(need.id)}">Accepter</button>
            <button class="cash-refuse-btn" type="button" data-cash-refuse="${safe(s.id)}" data-cash-need-id="${safe(need.id)}">Refuser</button>
          </div>` : ""}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Personal space                                                       */
  /* ------------------------------------------------------------------ */
  let personalTab = "mes-besoins";

  function renderPersonalSpace() {
    const user = currentUser();
    const container = document.querySelector("#cashPersonalFeed");
    if (!container) return;

    if (personalTab === "mes-besoins") {
      const myNeeds = needs().filter(n => n.authorId === user.id);
      container.innerHTML = !myNeeds.length
        ? `<div class="cash-empty"><span>📋</span><strong>Vous n'avez pas encore publié de besoin.</strong>
            <button class="cash-publish-cta" type="button" data-cash-publish>Publier mon premier besoin</button></div>`
        : myNeeds.map(needCard).join("");

    } else if (personalTab === "mes-solutions") {
      const mySols = solutions().filter(s => s.authorId === user.id);
      container.innerHTML = !mySols.length
        ? `<div class="cash-empty"><span>🤝</span><strong>Vous n'avez encore proposé aucune solution.</strong></div>`
        : mySols.map(s => {
            const need = needs().find(n => n.id === s.needId);
            const statusLabel = s.status === "accepted" ? "✓ Acceptée" : s.status === "refused" ? "✗ Refusée" : "En attente";
            const statusClass = s.status === "accepted" ? "cash-sol-accepted" : s.status === "refused" ? "cash-sol-refused" : "cash-sol-pending";
            return `<div class="cash-sol-card ${statusClass}" data-cash-open-need="${safe(s.needId)}">
              <div class="cash-sol-header">
                <span class="cash-sol-type">${s.type === "je_connais" ? "👥 Je connais quelqu'un" : "✋ Je peux le faire"}</span>
                <span class="cash-sol-status">${statusLabel}</span>
              </div>
              ${need ? `<strong class="cash-sol-need-title">${safe(need.title)}</strong>` : ""}
              <p>${safe(s.description)}</p>
              <span class="cash-sol-time">🕐 ${safe(timeAgo(s.createdAt))}</span>
            </div>`;
          }).join("");

    } else {
      // Mes gains
      const cfg = config();
      const gainedSols = solutions().filter(s => s.authorId === user.id && s.status === "accepted");
      const gains = gainedSols.map(s => {
        const need = needs().find(n => n.id === s.needId);
        if (!need || !need.reward) return null;
        return { need, sol: s, amount: need.reward * (1 - cfg.commissionRate) };
      }).filter(Boolean);
      const total = gains.reduce((sum, g) => sum + g.amount, 0);

      container.innerHTML = !gains.length
        ? `<div class="cash-empty"><span>💸</span><strong>Aucun gain pour l'instant.</strong>
            <p>Proposez des solutions à des besoins rémunérés.</p></div>`
        : `<div class="cash-gains-total">
            <span>Total estimé</span>
            <strong class="cash-gains-amount">${safe(formatMoney(total))}</strong>
            <small>Après commission Zeyds · paiement Mobile Money</small>
          </div>` + gains.map(g => `<div class="cash-gain-row">
            <strong>${safe(g.need.title)}</strong>
            <span class="cash-reward-badge">💰 ${safe(formatMoney(g.amount))}</span>
          </div>`).join("");
    }
  }

  /* ------------------------------------------------------------------ */
  /* Notifications panel                                                  */
  /* ------------------------------------------------------------------ */
  function renderNotifPanel() {
    const panel = document.querySelector("#cashNotifList");
    if (!panel) return;
    const all = notifs();
    panel.innerHTML = !all.length
      ? `<p class="cash-sols-empty">Aucune notification.</p>`
      : all.slice(0, 30).map(n => `<div class="cash-notif-item${n.read ? "" : " unread"}" role="button" tabindex="0" data-cash-open-need="${safe(n.needId)}">
          <span class="cash-notif-msg">${safe(n.message)}</span>
          <span class="cash-notif-time">${safe(timeAgo(n.createdAt))}</span>
        </div>`).join("");
    markNotifsRead();
  }

  /* ------------------------------------------------------------------ */
  /* Admin panel                                                          */
  /* ------------------------------------------------------------------ */
  function renderAdminCash() {
    const container = document.querySelector("#cashAdminPanel");
    if (!container) return;

    const cfg = config();
    const allNeeds = needs();
    const allSols = solutions();
    const resolvedNeeds = allNeeds.filter(n => n.status === "resolved" && n.reward > 0);
    const totalRewards = resolvedNeeds.reduce((s, n) => s + n.reward, 0);
    const totalCommission = totalRewards * cfg.commissionRate;
    const allReports = readJson(REPORTS_KEY, []) || [];

    container.innerHTML = `
      <div class="cash-admin-stats">
        <div class="cash-admin-stat"><strong>${allNeeds.length}</strong><span>Besoins</span></div>
        <div class="cash-admin-stat"><strong>${allNeeds.filter(n => n.status === "open").length}</strong><span>Ouverts</span></div>
        <div class="cash-admin-stat"><strong>${allNeeds.filter(n => n.status === "resolved").length}</strong><span>Résolus</span></div>
        <div class="cash-admin-stat"><strong>${allSols.length}</strong><span>Solutions</span></div>
        <div class="cash-admin-stat cash-admin-stat-gold"><strong>${formatMoney(totalCommission)}</strong><span>Commissions</span></div>
        <div class="cash-admin-stat"><strong>${allReports.length}</strong><span>Signalements</span></div>
      </div>

      <div class="cash-admin-config">
        <h4>Configuration</h4>
        <label>Taux de commission Zeyds (%)
          <input id="cashAdminRate" type="number" min="0" max="50" step="1" value="${Math.round(cfg.commissionRate * 100)}">
        </label>
        <button class="secondary" type="button" id="cashAdminSaveRate">Enregistrer</button>
        <p id="cashAdminConfigStatus" role="status"></p>
        <div class="cash-payment-providers">
          <span>Providers compatibles :</span>
          <span class="cash-provider-chip">Wave</span>
          <span class="cash-provider-chip">Orange Money</span>
          <span class="cash-provider-chip">MTN Money</span>
          <span class="cash-provider-chip">Moov Money</span>
        </div>
        <small>Aucune API de paiement connectée — architecture prête pour intégration réelle.</small>
      </div>

      <div class="cash-admin-needs">
        <h4>Gestion des besoins</h4>
        ${!allNeeds.length ? `<p class="cash-sols-empty">Aucun besoin.</p>` :
          allNeeds.slice(0, 100).map(n => `<div class="cash-admin-row">
            <div class="cash-admin-row-info">
              <span class="cash-cat-chip">${safe(n.category)}</span>
              <strong>${safe(n.title)}</strong>
              <span>👤 ${safe(n.authorName)} · ${safe(n.area)} · ${safe(timeAgo(n.createdAt))}</span>
              ${n.reward ? `<span class="cash-reward-badge">💰 ${safe(formatMoney(n.reward))}</span>` : ""}
              <span class="cash-sol-status">${n.status}</span>
            </div>
            ${n.status !== "closed" ? `<button class="secondary" type="button" data-cash-admin-close="${safe(n.id)}">Fermer</button>` : ""}
          </div>`).join("")}
      </div>

      ${allReports.length ? `<div class="cash-admin-reports">
        <h4>Signalements (${allReports.length})</h4>
        ${allReports.slice(0, 20).map(r => `<div class="cash-admin-row">
          <span class="cash-cat-chip">${r.type}</span>
          <span>${safe(r.reason)}</span>
          <span>${safe(timeAgo(r.createdAt))}</span>
        </div>`).join("")}
      </div>` : ""}`;

    document.querySelector("#cashAdminSaveRate")?.addEventListener("click", () => {
      const raw = Number(document.querySelector("#cashAdminRate")?.value ?? 10);
      const rate = Math.max(0, Math.min(50, raw)) / 100;
      writeJson(CONFIG_KEY, { ...cfg, commissionRate: rate });
      const status = document.querySelector("#cashAdminConfigStatus");
      if (status) status.textContent = `Commission mise à jour : ${Math.round(rate * 100)} %`;
      renderAdminCash();
    }, { once: true });
  }

  /* ------------------------------------------------------------------ */
  /* Dialogs                                                              */
  /* ------------------------------------------------------------------ */
  function showPublishDialog() {
    const d = document.querySelector("#cashPublishDialog");
    if (!d) return;
    d.querySelector("#cashPublishForm")?.reset();
    const rewardField = d.querySelector("#cashRewardField");
    if (rewardField) rewardField.hidden = true;
    d.hidden = false;
    d.querySelector("[name='title']")?.focus();
  }

  function showProposeDialog(needId, type) {
    const d = document.querySelector("#cashProposeDialog");
    if (!d) return;
    d.dataset.needId = needId;
    d.dataset.proposeType = type;
    d.querySelector("#cashProposeForm")?.reset();
    const titleEl = d.querySelector("#cashProposeTypeLabel");
    const descEl = d.querySelector("[name='description']");
    if (titleEl) titleEl.textContent = type === "je_connais" ? "Je connais quelqu'un" : "Je peux le faire";
    if (descEl) descEl.placeholder = type === "je_connais"
      ? "Décrivez la personne que vous recommandez…"
      : "Décrivez ce que vous pouvez faire et votre expérience…";
    d.hidden = false;
    descEl?.focus();
  }

  function whatsappShare(needId) {
    const need = needs().find(n => n.id === needId);
    if (!need) return;
    const reward = need.reward > 0 ? ` 💰 Récompense : ${formatMoney(need.reward)}.` : "";
    const text = encodeURIComponent(
      `[Zeyds Cash] ${need.title}\n📍 ${need.area} · ${need.category}${reward}\n→ Proposez une solution sur Zeyds.`
    );
    globalThis.open?.(`https://wa.me/?text=${text}`, "_blank");
  }

  /* ------------------------------------------------------------------ */
  /* Navigation helpers                                                   */
  /* ------------------------------------------------------------------ */
  function showFeed() {
    document.querySelector("#cashFeedSection")?.removeAttribute("hidden");
    document.querySelector("#cashNeedDetail")?.setAttribute("hidden", "");
    document.querySelector("#cashPersonalSection")?.setAttribute("hidden", "");
    renderFeed();
  }

  function showDetail(needId) {
    currentNeedId = needId;
    document.querySelector("#cashFeedSection")?.setAttribute("hidden", "");
    document.querySelector("#cashNeedDetail")?.removeAttribute("hidden");
    document.querySelector("#cashPersonalSection")?.setAttribute("hidden", "");
    renderNeedDetail(needId);
  }

  function showPersonal() {
    document.querySelector("#cashFeedSection")?.setAttribute("hidden", "");
    document.querySelector("#cashNeedDetail")?.setAttribute("hidden", "");
    const section = document.querySelector("#cashPersonalSection");
    section?.removeAttribute("hidden");
    renderPersonalSpace();
  }

  /* ------------------------------------------------------------------ */
  /* Event binding                                                        */
  /* ------------------------------------------------------------------ */
  let bridge = {};
  let bound = false;

  function bind() {
    if (bound) return;
    bound = true;

    /* Publish form */
    document.querySelector("#cashPublishForm")?.addEventListener("submit", e => {
      e.preventDefault();
      const f = e.currentTarget;
      const rewardOn = f.elements.rewardToggle?.checked;
      const need = addNeed({
        title: f.elements.title?.value,
        description: f.elements.description?.value,
        category: f.elements.category?.value,
        area: f.elements.area?.value,
        reward: rewardOn ? f.elements.reward?.value : 0,
      });
      if (!need) return;
      document.querySelector("#cashPublishDialog").hidden = true;
      renderFeed();
    });

    /* Reward toggle */
    document.querySelector("#cashRewardToggle")?.addEventListener("change", e => {
      const field = document.querySelector("#cashRewardField");
      if (field) field.hidden = !e.currentTarget.checked;
    });

    /* Propose form */
    document.querySelector("#cashProposeForm")?.addEventListener("submit", e => {
      e.preventDefault();
      const dialog = document.querySelector("#cashProposeDialog");
      const f = e.currentTarget;
      const sol = addSolution({
        needId: dialog?.dataset.needId,
        type: dialog?.dataset.proposeType || "je_peux",
        description: f.elements.description?.value,
        contact: f.elements.contact?.value,
      });
      if (!sol) return;
      dialog.hidden = true;
      if (currentNeedId) renderNeedDetail(currentNeedId);
    });

    /* Personal tabs */
    document.querySelector("#cashPersonalTabs")?.addEventListener("click", e => {
      const btn = e.target.closest("[data-cash-tab]");
      if (!btn) return;
      document.querySelectorAll("#cashPersonalTabs [data-cash-tab]").forEach(b => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      personalTab = btn.dataset.cashTab;
      renderPersonalSpace();
    });

    /* Notif button */
    document.querySelector("#cashNotifBtn")?.addEventListener("click", () => {
      const panel = document.querySelector("#cashNotifPanel");
      if (!panel) return;
      panel.hidden = !panel.hidden;
      if (!panel.hidden) renderNotifPanel();
    });

    /* Global delegation */
    document.addEventListener("click", e => {
      /* Publish dialog open */
      if (e.target.closest("[data-cash-publish]")) {
        showPublishDialog();
        return;
      }

      /* Publish dialog close */
      if (e.target.closest("[data-cash-close-publish]")) {
        document.querySelector("#cashPublishDialog").hidden = true;
        return;
      }

      /* Propose dialog close */
      if (e.target.closest("[data-cash-close-propose]")) {
        document.querySelector("#cashProposeDialog").hidden = true;
        return;
      }

      /* Open need detail */
      if (e.target.closest("[data-cash-open-need]") && !e.target.closest("[data-cash-accept],[data-cash-refuse],[data-cash-report]")) {
        const id = e.target.closest("[data-cash-open-need]").dataset.cashOpenNeed;
        bridge.setView?.("cash");
        showDetail(id);
        return;
      }

      /* Back to feed */
      if (e.target.closest("[data-cash-open-feed]")) {
        showFeed();
        return;
      }

      /* Personal space */
      if (e.target.closest("[data-cash-open-personal]")) {
        bridge.setView?.("cash");
        showPersonal();
        return;
      }

      /* Propose */
      if (e.target.closest("[data-cash-propose]")) {
        const btn = e.target.closest("[data-cash-propose]");
        showProposeDialog(btn.dataset.cashPropose, btn.dataset.proposeType);
        return;
      }

      /* Accept solution */
      if (e.target.closest("[data-cash-accept]")) {
        const btn = e.target.closest("[data-cash-accept]");
        acceptSolution(btn.dataset.cashNeedId, btn.dataset.cashAccept);
        if (currentNeedId) renderNeedDetail(currentNeedId);
        return;
      }

      /* Refuse solution */
      if (e.target.closest("[data-cash-refuse]")) {
        const btn = e.target.closest("[data-cash-refuse]");
        refuseSolution(btn.dataset.cashRefuse);
        if (currentNeedId) renderNeedDetail(currentNeedId);
        return;
      }

      /* WhatsApp share */
      if (e.target.closest("[data-cash-whatsapp]")) {
        whatsappShare(e.target.closest("[data-cash-whatsapp]").dataset.cashWhatsapp);
        return;
      }

      /* Report */
      if (e.target.closest("[data-cash-report]")) {
        const id = e.target.closest("[data-cash-report]").dataset.cashReport;
        const reason = globalThis.prompt?.("Motif du signalement (abus, spam, faux besoin…) :") || "";
        if (reason.trim()) reportItem("need", id, reason.trim());
        return;
      }

      /* Admin close need */
      if (e.target.closest("[data-cash-admin-close]")) {
        closeNeed(e.target.closest("[data-cash-admin-close]").dataset.cashAdminClose);
        renderAdminCash();
        return;
      }

      /* Filter chip */
      const chip = e.target.closest("[data-cash-filter]");
      if (chip) {
        const key = chip.dataset.cashFilter;
        const val = chip.dataset.cashFilterVal;
        if (key === "category") feedFilter.category = feedFilter.category === val ? "" : val;
        else if (key === "area") feedFilter.area = feedFilter.area === val ? "" : val;
        else if (key === "rewarded") feedFilter.rewarded = !feedFilter.rewarded;
        renderFilterChips();
        renderFeed();
        return;
      }

      /* Nav to Cash */
      if (e.target.closest('[data-view="cash"],[data-go="cash"]')) {
        showFeed();
      }
    });

    /* Keyboard navigation on need cards */
    document.addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      const card = e.target.closest("[data-cash-open-need]");
      if (card) {
        bridge.setView?.("cash");
        showDetail(card.dataset.cashOpenNeed);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                           */
  /* ------------------------------------------------------------------ */
  function renderHeroStats() {
    const el = document.querySelector("#cashHeroStats");
    if (!el) return;
    const all = needs();
    const open = all.filter(n => n.status === "open").length;
    const rewarded = all.filter(n => n.reward > 0 && n.status === "open").length;
    const cfg = config();
    const totalRewards = all.filter(n => n.reward > 0 && n.status === "resolved")
      .reduce((s, n) => s + n.reward, 0);
    el.innerHTML = `
      <div class="cash-stat"><strong>${open}</strong><span>Besoins ouverts</span></div>
      <div class="cash-stat"><strong>${rewarded}</strong><span>Avec récompense</span></div>
      <div class="cash-stat"><strong>${solutions().length}</strong><span>Solutions proposées</span></div>
      ${totalRewards > 0 ? `<div class="cash-stat"><strong>${formatMoney(totalRewards * (1 - cfg.commissionRate))}</strong><span>Distribués</span></div>` : ""}`;
  }

  function render() {
    renderHeroStats();
    renderFeed();
    renderNotifBadge();
  }

  function open() {
    bridge.setView?.("cash");
    showFeed();
  }

  function init(nextBridge = {}) {
    bridge = { ...bridge, ...nextBridge };
    bind();
    render();
  }

  globalThis.ZeydsCash = Object.freeze({ init, open, render, renderAdminCash });
})();
