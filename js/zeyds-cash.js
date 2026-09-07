(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* API — cible directement Supabase (jamais activeRestBaseUrl/Neon),   */
  /* meme principe que js/push-client.js pour les push notifications.   */
  /* ------------------------------------------------------------------ */
  const ADMIN_AUTH_SESSION_KEY = "bizzi-admin-auth-session";

  function supabaseCfg() {
    return globalThis.BizziConfig?.supabase || {};
  }

  function adminAccessToken() {
    try {
      const parsed = JSON.parse(globalThis.sessionStorage?.getItem(ADMIN_AUTH_SESSION_KEY) || "null");
      if (!parsed?.accessToken || !parsed?.expiresAt || parsed.expiresAt <= Date.now()) return "";
      return parsed.accessToken;
    } catch { return ""; }
  }

  function apiHeaders(useAdmin) {
    const key = supabaseCfg().anonKey || "";
    const token = useAdmin ? adminAccessToken() : "";
    const headers = {
      apikey: key,
      "Content-Type": "application/json",
      "X-Bizzi-Client-Token": globalThis.BizziPrivacy?.token?.() || "",
    };
    headers.Authorization = `Bearer ${token || key}`;
    return headers;
  }

  function restUrl(path) {
    const base = String(supabaseCfg().url || "").replace(/\/+$/, "");
    return `${base}/rest/v1/${path}`;
  }

  async function rpc(name, args = {}, useAdmin = false) {
    const response = await fetch(restUrl(`rpc/${name}`), {
      method: "POST",
      headers: apiHeaders(useAdmin),
      body: JSON.stringify(args),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Erreur (${name})`);
    }
    return data;
  }

  async function viewSelect(view, query = "") {
    const response = await fetch(restUrl(`${view}${query ? `?${query}` : ""}`), { headers: apiHeaders(false) });
    const data = await response.json().catch(() => []);
    if (!response.ok) {
      throw new Error((Array.isArray(data) ? "" : data?.message) || `Erreur (${view})`);
    }
    return Array.isArray(data) ? data : [];
  }

  /* ------------------------------------------------------------------ */
  /* Identite (pont app.js) + utilitaires                                */
  /* ------------------------------------------------------------------ */
  function identity() {
    return globalThis.BizziIdentity?.get?.() || { name: "", phone: "" };
  }

  function identityReady() {
    return Boolean(globalThis.BizziIdentity?.ready?.());
  }

  function setIdentity(name, phone) {
    return globalThis.BizziIdentity?.set?.(name, phone) || null;
  }

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
    const d = Math.floor(h / 24);
    return `Il y a ${d}j`;
  }

  function timeLeft(iso) {
    if (!iso) return "";
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return "Expiré";
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.max(1, Math.floor(diff / 60000))} min restantes`;
    if (h < 24) return `${h}h restantes`;
    return `${Math.floor(h / 24)}j restants`;
  }

  let toastTimer = null;
  function toast(message, isError) {
    let el = document.querySelector("#cashToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "cashToast";
      el.className = "cash-toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.toggle("cash-toast-error", Boolean(isError));
    el.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 3400);
  }

  function errMsg(error) {
    return error?.message || "Une erreur est survenue. Réessaie.";
  }

  /* ------------------------------------------------------------------ */
  /* Config publique (commission, bornes de prime, duree credit…)        */
  /* ------------------------------------------------------------------ */
  let cashSettings = {
    cash_commission_rate: 0.10,
    cash_max_active_solutions: 3,
    cash_credit_validity_days: 45,
    cash_min_reward: 500,
    cash_max_reward: 500000,
  };

  async function loadSettings() {
    try {
      const data = await rpc("public_get_cash_settings", {});
      if (data && typeof data === "object") cashSettings = { ...cashSettings, ...data };
    } catch { /* garde les valeurs par defaut */ }
  }

  /* ------------------------------------------------------------------ */
  /* Reputation / badges                                                  */
  /* ------------------------------------------------------------------ */
  function solverBadge(stats) {
    const rating = Number(stats?.average_rating || 0);
    const reviews = Number(stats?.review_count || 0);
    const completed = Number(stats?.missions_completed || 0);
    if (completed === 0) return { label: "Nouveau", cls: "cash-badge-new" };
    if (completed >= 50 && rating >= 4.8) return { label: "🥇 Top Solutionneur", cls: "cash-badge-top" };
    if (completed >= 20 && rating >= 4.5) return { label: "Expert", cls: "cash-badge-expert" };
    if (reviews >= 3 && rating >= 4.5) return { label: "Solutionneur fiable", cls: "cash-badge-reliable" };
    return { label: "Actif", cls: "cash-badge-active" };
  }

  function solverProfileCard(stats, name) {
    const rating = Number(stats?.average_rating || 0);
    const badge = solverBadge(stats);
    return `<div class="cash-solver-card">
      <div class="cash-solver-name">${safe(name || "Solveur")} <span class="cash-badge ${badge.cls}">${badge.label}</span></div>
      <div class="cash-solver-stats">
        <span>⭐ ${rating > 0 ? rating.toFixed(1) : "—"}/5</span>
        <span>🏆 ${Number(stats?.missions_completed || 0)} solutions réussies</span>
        ${Number(stats?.dispute_count || 0) > 0 ? `<span>🤝 ${stats.dispute_count} litige${stats.dispute_count > 1 ? "s" : ""}</span>` : ""}
      </div>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Statuts (libelles FR)                                               */
  /* ------------------------------------------------------------------ */
  const MISSION_STATUS_LABELS = {
    draft: "Brouillon",
    payment_pending: "Paiement en attente",
    published: "Ouverte aux solutions",
    in_progress: "En cours",
    completion_pending: "Confirmation attendue",
    completed: "Terminée",
    expired: "Expirée",
    disputed: "Litige en cours",
    cancelled: "Annulée",
  };

  function statusLabel(status) {
    return MISSION_STATUS_LABELS[status] || status;
  }

  /* ------------------------------------------------------------------ */
  /* Feed                                                                 */
  /* ------------------------------------------------------------------ */
  let feedFilter = { category: "", area: "", rewarded: false };
  let feedCache = [];

  function favoriteHeartButton(id) {
    const active = Boolean(globalThis.BizziFavorites?.isFavorite?.("cash", id));
    const label = active ? "Retirer des favoris" : "Ajouter aux favoris";
    return `<button class="fav-heart cash-fav-heart${active ? " is-favorite" : ""}" type="button" data-fav-toggle="cash:${safe(id)}" aria-pressed="${active}" aria-label="${label}" title="${label}">${active ? "♥" : "♡"}</button>`;
  }

  function needCard(m) {
    const count = Number(m.active_solutions_count || 0);
    const maxActive = Number(cashSettings.cash_max_active_solutions || 3);
    return `<article class="cash-need-card" role="button" tabindex="0" data-cash-open-need="${safe(m.id)}">
      <div class="cash-card-tags">
        <span class="cash-cat-chip">${safe(m.category)}</span>
        ${m.secured ? '<span class="cash-secured-badge">🔒 Prime sécurisée</span>' : ""}
        ${favoriteHeartButton(m.id)}
      </div>
      <div class="cash-card-reward">🔥 ${safe(formatMoney(m.reward_amount))} À GAGNER</div>
      <h3 class="cash-card-title">${safe(m.title)}</h3>
      ${m.description ? `<p class="cash-card-desc">${safe(m.description.slice(0, 120))}${m.description.length > 120 ? "…" : ""}</p>` : ""}
      <div class="cash-card-meta">
        <span>📍 ${safe(m.area)}</span>
        <span>⏱️ ${safe(timeLeft(m.deadline_at || m.expires_at))}</span>
        <span class="cash-sols-pill">${count}/${maxActive} solution${count !== 1 ? "s" : ""}</span>
      </div>
      <button class="cash-solution-cta" type="button" data-cash-open-need="${safe(m.id)}">JE PEUX AIDER</button>
    </article>`;
  }

  async function renderFeed() {
    const container = document.querySelector("#cashFeed");
    if (!container) return;
    container.innerHTML = `<div class="cash-loading">Chargement des missions…</div>`;
    try {
      const params = new URLSearchParams({ select: "*", order: "created_at.desc", limit: "60" });
      if (feedFilter.category) params.set("category", `eq.${feedFilter.category}`);
      if (feedFilter.area) params.set("area", `eq.${feedFilter.area}`);
      feedCache = await viewSelect("public_cash_feed", params.toString());
      let list = feedCache;
      if (feedFilter.rewarded) list = list.filter((m) => Number(m.reward_amount) > 0);

      if (!list.length) {
        container.innerHTML = `<div class="cash-empty">
          <span>💸</span>
          <strong>Aucune mission publiée pour l'instant.</strong>
          <p>Sois le premier à publier une recherche rémunérée.</p>
          <button class="cash-publish-cta" type="button" data-cash-publish>+ Publier une mission</button>
        </div>`;
        return;
      }
      container.innerHTML = list.map(needCard).join("");
    } catch (error) {
      container.innerHTML = `<div class="cash-empty"><span>⚠️</span><strong>Impossible de charger les missions.</strong><p>${safe(errMsg(error))}</p></div>`;
    }
  }

  function renderFilterChips() {
    document.querySelectorAll("[data-cash-filter]").forEach((btn) => {
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

  async function renderHeroStats() {
    const el = document.querySelector("#cashHeroStats");
    if (!el) return;
    const open = feedCache.filter((m) => m.status === "published").length;
    const totalSolutions = feedCache.reduce((s, m) => s + Number(m.active_solutions_count || 0), 0);
    el.innerHTML = `
      <div class="cash-stat"><strong>${open}</strong><span>Missions ouvertes</span></div>
      <div class="cash-stat"><strong>${totalSolutions}</strong><span>Solutions proposées</span></div>`;
  }

  async function renderCreditBanner() {
    const el = document.querySelector("#cashCreditBanner");
    if (!el) return;
    if (!identityReady()) { el.hidden = true; return; }
    try {
      const credits = await rpc("cash_list_my_credits", { p_phone: identity().phone });
      const active = (credits || []).filter((c) => c.status === "active" && Number(c.remaining_amount) > 0);
      if (!active.length) { el.hidden = true; return; }
      const total = active.reduce((s, c) => s + Number(c.remaining_amount), 0);
      const soonest = active.reduce((min, c) => (!min || new Date(c.expires_at) < new Date(min)) ? c.expires_at : min, null);
      el.hidden = false;
      el.innerHTML = `💳 Crédit ZEYDS Cash disponible : <strong>${safe(formatMoney(total))}</strong> · valable jusqu'au ${safe(new Date(soonest).toLocaleDateString("fr-FR"))}`;
    } catch { el.hidden = true; }
  }

  /* ------------------------------------------------------------------ */
  /* Detail mission                                                       */
  /* ------------------------------------------------------------------ */
  let currentMissionId = null;
  let currentMissionDetail = null;

  function formatDuration(value, unit) {
    if (!value || !unit) return "";
    const n = Number(value);
    const label = unit === "heures" ? (n === 1 ? "heure" : "heures") : (n === 1 ? "jour" : "jours");
    return `${n} ${label}`;
  }

  function solutionCard(s, mission) {
    const isMine = Boolean(s.is_mine);
    const isOwner = Boolean(mission.is_owner);
    const statusLabels = { pending: "En attente", selected: "✓ Sélectionnée", rejected: "✗ Non retenue", withdrawn: "Retirée" };
    const statusCls = { pending: "cash-sol-pending", selected: "cash-sol-accepted", rejected: "cash-sol-refused", withdrawn: "cash-sol-refused" };
    const duration = formatDuration(s.estimated_duration, s.duration_unit);
    return `<div class="cash-sol-card ${statusCls[s.status] || ""}">
      ${solverProfileCard(s.solver_stats, s.solver_name)}
      ${duration ? `<div class="cash-sol-duration">⏱️ Délai annoncé : <strong>${safe(duration)}</strong></div>` : ""}
      ${s.description ? `<p>${safe(s.description)}</p>` : ""}
      ${s.price_hint ? `<div class="cash-sol-detail">💵 Prix estimé : ${safe(formatMoney(s.price_hint))}</div>` : ""}
      ${s.availability ? `<div class="cash-sol-detail">🕐 ${safe(s.availability)}</div>` : ""}
      ${s.contact ? `<a class="cash-sol-contact" href="tel:${safe(s.contact)}" data-log-contact="cash:${safe(mission.id)}">📞 ${safe(s.contact)}</a>` : ""}
      <div class="cash-sol-meta">
        <span class="cash-sol-status">${statusLabels[s.status] || s.status}</span>
        <span>🕐 ${safe(timeAgo(s.submitted_at))}</span>
      </div>
      ${isOwner && s.status === "pending" && mission.status === "published"
        ? `<div class="cash-sol-actions">
            <button class="cash-accept-btn" type="button" data-cash-select-solution="${safe(s.id)}" data-cash-mission-id="${safe(mission.id)}" data-cash-solver-name="${safe(s.solver_name)}">✓ CHOISIR CETTE SOLUTION</button>
          </div>` : ""}
      ${isMine && s.status === "pending" ? `<button class="secondary" type="button" data-cash-withdraw-solution="${safe(s.id)}">Retirer ma proposition</button>` : ""}
    </div>`;
  }

  function missionActionsBlock(mission) {
    const isOwner = Boolean(mission.is_owner);
    const mySolverPhone = identity().phone;
    const mySolution = (mission.solutions || []).find((s) => s.is_mine);
    const isSelectedSolver = mission.selected_solution_id && mySolution?.id === mission.selected_solution_id;

    if (mission.status === "draft" && isOwner) {
      return `<div class="cash-mission-actions">
        <p class="cash-payment-warning">🔒 Cette demande n'est pas encore publiée : sécurise la prime pour la publier.</p>
        <button class="cash-submit-btn" type="button" data-cash-pay="${safe(mission.id)}">Sécuriser la prime</button>
      </div>`;
    }
    if (mission.status === "payment_pending" && isOwner) {
      return `<div class="cash-mission-actions"><p class="cash-payment-warning">⏳ Paiement en attente de confirmation par un admin ZEYDS.</p></div>`;
    }
    if (mission.status === "in_progress" && isSelectedSolver) {
      return `<div class="cash-mission-actions">
        <p>🎉 Ta solution a été choisie ! Récompense potentielle : <strong>${safe(formatMoney(mission.reward_amount * (1 - Number(cashSettings.cash_commission_rate || 0.1))))}</strong></p>
        <button class="cash-submit-btn" type="button" data-cash-finalize="${safe(mission.id)}">Finaliser la mission</button>
        <button class="secondary" type="button" data-cash-dispute="${safe(mission.id)}">Signaler un problème</button>
      </div>`;
    }
    if ((mission.status === "in_progress" || mission.status === "completion_pending") && isOwner) {
      return `<div class="cash-mission-actions">
        <p>As-tu obtenu la solution attendue ?</p>
        <button class="cash-submit-btn" type="button" data-cash-confirm="${safe(mission.id)}">OUI, TOUT EST BON</button>
        <button class="secondary" type="button" data-cash-dispute="${safe(mission.id)}">NON, J'AI UN PROBLÈME</button>
      </div>`;
    }
    if (mission.status === "completed" && isOwner) {
      return `<div class="cash-mission-actions"><button class="cash-submit-btn" type="button" data-cash-review="${safe(mission.id)}">⭐ Noter cette mission</button></div>`;
    }
    if (mission.status === "disputed") {
      return `<div class="cash-mission-actions"><p class="cash-payment-warning">🔒 Fonds bloqués — litige en cours d'examen par ZEYDS.</p></div>`;
    }
    if (mission.status === "expired" && isOwner) {
      return `<div class="cash-mission-actions"><p>❌ Aucune solution validée avant l'échéance — la prime est devenue un crédit ZEYDS Cash.</p></div>`;
    }
    return "";
  }

  async function renderNeedDetail(missionId) {
    const panel = document.querySelector("#cashNeedDetail");
    if (!panel) return;
    panel.innerHTML = `<div class="cash-loading">Chargement…</div>`;
    panel.hidden = false;
    try {
      const mission = await rpc("cash_get_mission_detail", { p_mission_id: missionId, p_caller_phone: identity().phone || "" });
      if (!mission) { panel.innerHTML = `<div class="cash-empty"><span>⚠️</span><strong>Mission introuvable.</strong></div>`; return; }
      currentMissionDetail = mission;
      const sols = mission.solutions || [];
      const commRate = Number(cashSettings.cash_commission_rate || 0.1);
      const net = mission.reward_amount * (1 - commRate);
      const isOwner = Boolean(mission.is_owner);
      const maxActive = Number(cashSettings.cash_max_active_solutions || 3);
      const activeCount = Number(mission.active_solutions_count || 0);
      const myPendingSolution = sols.find((s) => s.is_mine && s.status === "pending");
      const canPropose = mission.status === "published" && !isOwner
        && activeCount < maxActive
        && !myPendingSolution;

      panel.innerHTML = `
        <div class="cash-detail-bar">
          <button class="cash-back-btn" type="button" data-cash-open-feed aria-label="Retour au feed">← Retour</button>
          <button class="cash-report-link" type="button" data-cash-whatsapp="${safe(missionId)}">📲 Partager</button>
        </div>
        <div class="cash-detail-hero">
          <div class="cash-card-tags">
            <span class="cash-cat-chip">${safe(mission.category)}</span>
            <span class="cash-status-chip">${safe(statusLabel(mission.status))}</span>
            ${mission.secured ? '<span class="cash-secured-badge">🔒 Prime sécurisée</span>' : ""}
          </div>
          <h2>${safe(mission.title)}</h2>
          ${mission.description ? `<p class="cash-detail-desc">${safe(mission.description)}</p>` : ""}
          <div class="cash-card-meta">
            <span>📍 ${safe(mission.area)}</span>
            <span>👤 ${safe(mission.requester_name)}</span>
            <span>⏱️ ${safe(timeLeft(mission.deadline_at || mission.expires_at))}</span>
          </div>
          <div class="cash-reward-info">
            <div class="cash-reward-row"><span>Prime ZEYDS Cash</span><strong>${safe(formatMoney(mission.reward_amount))}</strong></div>
            <div class="cash-reward-row"><span>Gain net du solveur (après ${Math.round(commRate * 100)}% ZEYDS)</span><strong class="cash-gain-highlight">${safe(formatMoney(net))}</strong></div>
            ${mission.service_budget_hint ? `<div class="cash-reward-row"><span>Budget indicatif du produit/service</span><strong>${safe(formatMoney(mission.service_budget_hint))}</strong></div>` : ""}
          </div>
          ${canPropose ? `<button class="cash-solution-cta" type="button" data-cash-propose="${safe(missionId)}">JE PEUX AIDER</button>` : ""}
          ${myPendingSolution ? `<div class="cash-help-sent-badge">✓ Proposition envoyée</div>` : ""}
          ${mission.status === "published" && !isOwner && !canPropose && !myPendingSolution && activeCount >= maxActive ? `<p class="cash-payment-warning">3/3 — Solutions en cours d'examen.</p>` : ""}
        </div>
        ${missionActionsBlock(mission)}
        <div class="cash-solutions-block">
          <div class="cash-section-head">
            <h3>${isOwner ? "Personnes disponibles pour vous aider" : "Solutions"}</h3>
            <span class="cash-count-badge">${activeCount}/${maxActive}</span>
          </div>
          ${!sols.length ? `<p class="cash-sols-empty">Aucune solution encore — sois le premier.</p>` : ""}
          <div class="cash-solutions-list">${sols.map((s) => solutionCard(s, mission)).join("")}</div>
        </div>`;
    } catch (error) {
      panel.innerHTML = `<div class="cash-empty"><span>⚠️</span><strong>${safe(errMsg(error))}</strong></div>`;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Espace personnel                                                     */
  /* ------------------------------------------------------------------ */
  let personalTab = "mes-besoins";

  function missionRowCard(m) {
    return `<article class="cash-need-card" role="button" tabindex="0" data-cash-open-need="${safe(m.id)}">
      <div class="cash-card-tags">
        <span class="cash-cat-chip">${safe(m.category)}</span>
        <span class="cash-status-chip">${safe(statusLabel(m.status))}</span>
      </div>
      <h3 class="cash-card-title">${safe(m.title)}</h3>
      <div class="cash-card-meta">
        <span>💰 ${safe(formatMoney(m.reward_amount))}</span>
        <span>📍 ${safe(m.area)}</span>
        <span class="cash-sols-pill">${Number(m.active_solutions_count || 0)} solution(s)</span>
      </div>
    </article>`;
  }

  function walletTxLabel(t) {
    const labels = {
      mission_escrow: "Prime payée", reward_payout: "Gain reçu", commission: "Commission ZEYDS",
      credit_grant: "Crédit obtenu", credit_redeem: "Crédit utilisé", refund: "Remboursement",
    };
    return labels[t.type] || t.type;
  }

  let mySolutionsCache = [];
  let solutionsFilter = "all";

  function matchesSolutionsFilter(s) {
    if (solutionsFilter === "all") return true;
    if (solutionsFilter === "pending") return s.status === "pending";
    if (solutionsFilter === "selected") return s.status === "selected";
    if (solutionsFilter === "in_progress") return s.status === "selected" && ["in_progress", "completion_pending"].includes(s.mission_status);
    if (solutionsFilter === "completed") return s.mission_status === "completed";
    if (solutionsFilter === "not_retained") return ["rejected", "withdrawn"].includes(s.status);
    return true;
  }

  function mySolutionCard(s) {
    const duration = formatDuration(s.estimated_duration, s.duration_unit);
    return `<div class="cash-sol-card" data-cash-open-need="${safe(s.mission_id)}" role="button" tabindex="0">
      <div class="cash-sol-header">
        <strong class="cash-sol-need-title">${safe(s.mission_title)}</strong>
        <span class="cash-status-chip">${safe(statusLabel(s.mission_status))}</span>
      </div>
      <div class="cash-sol-meta">
        ${s.mission_reward_amount ? `<span>💰 ${safe(formatMoney(s.mission_reward_amount))}</span>` : ""}
        ${duration ? `<span>⏱️ ${safe(duration)}</span>` : ""}
        <span>🕐 ${safe(timeAgo(s.submitted_at))}</span>
      </div>
      ${s.description ? `<p>${safe(s.description)}</p>` : ""}
    </div>`;
  }

  function renderMySolutionsList() {
    const container = document.querySelector("#cashPersonalFeed");
    if (!container) return;
    const list = mySolutionsCache.filter(matchesSolutionsFilter);
    container.innerHTML = !list.length
      ? `<div class="cash-empty"><span>🤝</span><strong>${mySolutionsCache.length ? "Aucune solution dans cette catégorie." : "Tu n'as encore proposé aucune solution."}</strong></div>`
      : list.map(mySolutionCard).join("");
  }

  async function renderPersonalSpace() {
    const container = document.querySelector("#cashPersonalFeed");
    if (!container) return;
    const filterBar = document.querySelector("#cashSolutionsFilterBar");
    if (filterBar) filterBar.hidden = personalTab !== "mes-solutions";
    if (!identityReady()) {
      container.innerHTML = `<div class="cash-empty"><span>👤</span><strong>Renseigne ton identité pour accéder à ton espace.</strong></div>`;
      return;
    }
    container.innerHTML = `<div class="cash-loading">Chargement…</div>`;
    const phone = identity().phone;

    try {
      if (personalTab === "mes-besoins") {
        const missions = await rpc("cash_list_my_missions", { p_phone: phone });
        container.innerHTML = !missions.length
          ? `<div class="cash-empty"><span>📋</span><strong>Tu n'as pas encore publié de mission.</strong>
              <button class="cash-publish-cta" type="button" data-cash-publish>Publier ma première recherche</button></div>`
          : missions.map(missionRowCard).join("");

      } else if (personalTab === "mes-solutions") {
        mySolutionsCache = await rpc("cash_list_my_solutions", { p_phone: phone });
        renderMySolutionsList();

      } else {
        const [wallet, credits] = await Promise.all([
          rpc("cash_wallet_summary", { p_phone: phone }),
          rpc("cash_list_my_credits", { p_phone: phone }),
        ]);
        const activeCredits = (credits || []).filter((c) => c.status === "active");
        container.innerHTML = `
          <div class="cash-wallet-balance">
            <span>Mon solde</span>
            <strong>${safe(formatMoney(wallet?.balance || 0))}</strong>
          </div>
          ${activeCredits.length ? `<div class="cash-credits-list">
            <h4>Mes crédits ZEYDS Cash</h4>
            ${activeCredits.map((c) => `<div class="cash-credit-row">
              <span>${safe(formatMoney(c.remaining_amount))}</span>
              <small>Valable jusqu'au ${safe(new Date(c.expires_at).toLocaleDateString("fr-FR"))}</small>
            </div>`).join("")}
          </div>` : ""}
          <h4>Historique</h4>
          ${!(wallet?.transactions || []).length ? `<p class="cash-sols-empty">Aucune transaction pour l'instant.</p>` : ""}
          ${(wallet?.transactions || []).map((t) => `<div class="cash-gain-row">
            <span>${safe(walletTxLabel(t))} · ${safe(timeAgo(t.created_at))}</span>
            <strong class="${t.type === "reward_payout" || t.type === "credit_grant" || t.type === "refund" ? "cash-gain-highlight" : ""}">${safe(formatMoney(t.amount))}</strong>
          </div>`).join("")}`;
      }
    } catch (error) {
      container.innerHTML = `<div class="cash-empty"><span>⚠️</span><strong>${safe(errMsg(error))}</strong></div>`;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Notifications                                                        */
  /* ------------------------------------------------------------------ */
  async function refreshNotifBadge() {
    const badge = document.querySelector("#cashNotifBadge");
    if (!badge || !identityReady()) { if (badge) badge.hidden = true; return; }
    try {
      const notifs = await rpc("cash_list_my_notifications", { p_phone: identity().phone });
      // cash_list_my_notifications marque tout comme lu en le lisant ; pour un
      // badge fiable on ne l'appelle qu'a l'ouverture du panneau (voir bind()).
      const unread = (notifs || []).filter((n) => !n.read_at).length;
      badge.textContent = unread > 0 ? String(unread) : "";
      badge.hidden = unread === 0;
    } catch { badge.hidden = true; }
  }

  async function renderNotifPanel() {
    const panel = document.querySelector("#cashNotifList");
    if (!panel || !identityReady()) return;
    panel.innerHTML = `<div class="cash-loading">Chargement…</div>`;
    try {
      const notifs = await rpc("cash_list_my_notifications", { p_phone: identity().phone });
      panel.innerHTML = !notifs.length
        ? `<p class="cash-sols-empty">Aucune notification.</p>`
        : notifs.slice(0, 30).map((n) => `<div class="cash-notif-item${n.read_at ? "" : " unread"}" role="button" tabindex="0" data-cash-open-need="${safe(n.mission_id || "")}">
            <span class="cash-notif-msg">${safe(n.message)}</span>
            <span class="cash-notif-time">${safe(timeAgo(n.created_at))}</span>
          </div>`).join("");
      const badge = document.querySelector("#cashNotifBadge");
      if (badge) badge.hidden = true;
    } catch {
      panel.innerHTML = `<p class="cash-sols-empty">Notifications indisponibles.</p>`;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Wizard de publication                                                */
  /* ------------------------------------------------------------------ */
  let wizardStep = 1;
  const WIZARD_STEPS = 4;

  function ensureIdentityFieldsVisibility() {
    const identityFields = document.querySelector("#cashIdentityFields");
    if (identityFields) identityFields.hidden = identityReady();
  }

  function updateWizardUI() {
    document.querySelectorAll("#cashPublishForm .cash-wizard-step").forEach((step) => {
      step.hidden = Number(step.dataset.wizardStep) !== wizardStep;
    });
    document.querySelectorAll("#cashWizardSteps [data-wizard-dot]").forEach((dot) => {
      dot.classList.toggle("active", Number(dot.dataset.wizardDot) <= wizardStep);
    });
    const backBtn = document.querySelector("#cashWizardBack");
    const nextBtn = document.querySelector("#cashWizardNext");
    if (backBtn) backBtn.hidden = wizardStep === 1;
    if (nextBtn) nextBtn.textContent = wizardStep === WIZARD_STEPS ? "Voir le récapitulatif" : "Continuer";
  }

  function validateWizardStep(form) {
    if (wizardStep === 1) {
      if (!form.elements.title.value.trim()) { toast("Décris ce que tu recherches", true); return false; }
      if (!identityReady()) {
        const n = form.elements.identityName?.value.trim();
        const p = form.elements.identityPhone?.value.trim();
        if (!n || !p) { toast("Renseigne ton nom et ton téléphone", true); return false; }
        setIdentity(n, p);
      }
    }
    if (wizardStep === 3) {
      const type = form.querySelector("[name='deadlineType']:checked")?.value;
      if (type === "date_personnalisee" && !form.elements.deadlineAt.value) { toast("Choisis une date précise", true); return false; }
    }
    if (wizardStep === 4) {
      const reward = Number(form.elements.reward.value || 0);
      if (reward < cashSettings.cash_min_reward || reward > cashSettings.cash_max_reward) {
        toast(`La prime doit être entre ${formatMoney(cashSettings.cash_min_reward)} et ${formatMoney(cashSettings.cash_max_reward)}`, true);
        return false;
      }
    }
    return true;
  }

  function showPublishDialog() {
    const d = document.querySelector("#cashPublishDialog");
    if (!d) return;
    d.querySelector("#cashPublishForm")?.reset();
    wizardStep = 1;
    updateWizardUI();
    ensureIdentityFieldsVisibility();
    d.hidden = false;
    d.querySelector("[name='title']")?.focus();
  }

  function recapHtml(mission) {
    return `
      <div class="cash-recap-row"><strong>${safe(mission.title)}</strong></div>
      ${mission.description ? `<p>${safe(mission.description)}</p>` : ""}
      <div class="cash-recap-row"><span>📍</span><span>${safe(mission.area)}</span></div>
      <div class="cash-recap-row"><span>⏱️</span><span>${safe(timeLeft(mission.deadline_at))}</span></div>
      <div class="cash-recap-row"><span>💰</span><strong>${safe(formatMoney(mission.reward_amount))}</strong></div>
      ${mission.service_budget_hint ? `<div class="cash-recap-row"><span>Budget indicatif</span><span>${safe(formatMoney(mission.service_budget_hint))}</span></div>` : ""}`;
  }

  let draftMission = null;

  async function createDraftAndShowRecap(form) {
    const identityData = identity();
    const deadlineType = form.querySelector("[name='deadlineType']:checked")?.value || "cette_semaine";
    try {
      draftMission = await rpc("cash_create_mission_draft", {
        p_requester_phone: identityData.phone,
        p_requester_name: identityData.name,
        p_title: form.elements.title.value,
        p_description: form.elements.description.value,
        p_category: form.elements.category.value,
        p_area: form.elements.area.value,
        p_attachments: [],
        p_deadline_type: deadlineType,
        p_deadline_at: deadlineType === "date_personnalisee" ? new Date(form.elements.deadlineAt.value).toISOString() : null,
        p_reward_amount: Number(form.elements.reward.value || 0),
        p_service_budget_hint: form.elements.serviceBudgetHint.value ? Number(form.elements.serviceBudgetHint.value) : null,
      });
      document.querySelector("#cashPublishDialog").hidden = true;
      const recap = document.querySelector("#cashRecapDialog");
      document.querySelector("#cashRecapSummary").innerHTML = recapHtml(draftMission);
      recap.hidden = false;
    } catch (error) {
      toast(errMsg(error), true);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Paiement                                                             */
  /* ------------------------------------------------------------------ */
  const PAYMENT_METHODS = ["Wave", "Orange Money", "MTN Money", "Moov Money"];
  let paymentMissionId = null;
  let selectedPaymentMethod = "";

  async function showPaymentDialog(missionId) {
    paymentMissionId = missionId;
    selectedPaymentMethod = "";
    const d = document.querySelector("#cashPaymentDialog");
    if (!d) return;
    document.querySelector("#cashPaymentForm")?.reset();
    document.querySelector("#cashPaymentStatus").textContent = "";
    document.querySelector("#cashPaymentMethods").innerHTML = PAYMENT_METHODS
      .map((m) => `<button type="button" class="cash-provider-chip" data-cash-payment-method="${safe(m)}">${safe(m)}</button>`).join("");

    const creditBox = document.querySelector("#cashPaymentCreditOption");
    creditBox.hidden = true;
    if (identityReady()) {
      try {
        const [credits, missionDetail] = await Promise.all([
          rpc("cash_list_my_credits", { p_phone: identity().phone }),
          rpc("cash_get_mission_detail", { p_mission_id: missionId, p_caller_phone: identity().phone }),
        ]);
        const usable = (credits || []).find((c) => c.status === "active" && Number(c.remaining_amount) >= Number(missionDetail?.reward_amount || Infinity));
        if (usable) {
          creditBox.hidden = false;
          creditBox.innerHTML = `<button class="cash-submit-btn" type="button" id="cashUseCreditBtn" data-credit-id="${safe(usable.id)}">
            💳 Utiliser mon crédit (${safe(formatMoney(usable.remaining_amount))} disponibles)
          </button>`;
        }
      } catch { /* pas bloquant */ }
    }
    d.hidden = false;
  }

  /* ------------------------------------------------------------------ */
  /* Je peux aider (accepter + delai)                                     */
  /* ------------------------------------------------------------------ */
  let helpWizardStep = 1;
  const HELP_WIZARD_STEPS = 2;

  function updateHelpWizardUI() {
    document.querySelectorAll("#cashProposeForm .cash-wizard-step").forEach((step) => {
      step.hidden = Number(step.dataset.helpWizardStep) !== helpWizardStep;
    });
    document.querySelectorAll("#cashHelpWizardSteps [data-help-wizard-dot]").forEach((dot) => {
      dot.classList.toggle("active", Number(dot.dataset.helpWizardDot) <= helpWizardStep);
    });
    const backBtn = document.querySelector("#cashHelpWizardBack");
    const nextBtn = document.querySelector("#cashHelpWizardNext");
    if (backBtn) backBtn.hidden = helpWizardStep === 1;
    if (nextBtn) nextBtn.textContent = helpWizardStep === HELP_WIZARD_STEPS ? "Confirmer que je peux aider" : "Accepter la mission";
  }

  function showProposeDialog(missionId) {
    const d = document.querySelector("#cashProposeDialog");
    if (!d) return;
    d.dataset.missionId = missionId;
    d.querySelector("#cashProposeForm")?.reset();
    const identityFields = document.querySelector("#cashProposeIdentityFields");
    if (identityFields) identityFields.hidden = identityReady();
    const rewardEl = document.querySelector("#cashHelpRewardAmount");
    const mission = currentMissionDetail?.id === missionId ? currentMissionDetail : feedCache.find((m) => m.id === missionId);
    if (rewardEl) rewardEl.textContent = mission ? formatMoney(mission.reward_amount) : "—";
    const customFields = document.querySelector("#cashDurationCustomFields");
    if (customFields) customFields.hidden = true;
    helpWizardStep = 1;
    updateHelpWizardUI();
    d.hidden = false;
  }

  async function submitHelpProposal(form) {
    const dialog = document.querySelector("#cashProposeDialog");
    const missionId = dialog.dataset.missionId;
    const presetEl = form.querySelector("[name='durationPreset']:checked");
    if (!presetEl) { toast("Choisis un délai", true); return; }
    let durationValue;
    let durationUnit;
    if (presetEl.value === "autre") {
      durationValue = Number(form.elements.durationCustomValue.value || 0);
      durationUnit = form.elements.durationCustomUnit.value;
      if (!durationValue || durationValue <= 0) { toast("Indique un nombre de temps valide", true); return; }
    } else {
      const [v, u] = presetEl.value.split(":");
      durationValue = Number(v);
      durationUnit = u;
    }
    try {
      await rpc("cash_submit_solution", {
        p_mission_id: missionId,
        p_solver_phone: identity().phone,
        p_solver_name: identity().name,
        p_description: form.elements.description.value,
        p_attachments: [],
        p_contact: "",
        p_price_hint: null,
        p_availability: "",
        p_estimated_duration: durationValue,
        p_duration_unit: durationUnit,
      });
      dialog.hidden = true;
      const durationLabel = formatDuration(durationValue, durationUnit);
      const sentDurationEl = document.querySelector("#cashHelpSentDuration");
      if (sentDurationEl) sentDurationEl.textContent = `Délai annoncé : ${durationLabel}`;
      document.querySelector("#cashHelpSentDialog").hidden = false;
      if (currentMissionId) renderNeedDetail(currentMissionId);
    } catch (error) {
      toast(errMsg(error), true);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Confirmation generique (choisir un solveur / finaliser)              */
  /* ------------------------------------------------------------------ */
  function showConfirmDialog(title, message, onConfirm) {
    const d = document.querySelector("#cashConfirmDialog");
    if (!d) { onConfirm(); return; }
    document.querySelector("#cashConfirmTitle").textContent = title;
    document.querySelector("#cashConfirmMessage").textContent = message;
    const btn = document.querySelector("#cashConfirmActionBtn");
    const freshBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(freshBtn, btn);
    freshBtn.addEventListener("click", () => { d.hidden = true; onConfirm(); }, { once: true });
    d.hidden = false;
  }

  /* ------------------------------------------------------------------ */
  /* Litige / notation                                                    */
  /* ------------------------------------------------------------------ */
  function showDisputeDialog(missionId) {
    const d = document.querySelector("#cashDisputeDialog");
    if (!d) return;
    d.dataset.missionId = missionId;
    d.querySelector("#cashDisputeForm")?.reset();
    d.hidden = false;
  }

  let reviewRating = 5;

  function showReviewDialog(missionId) {
    const d = document.querySelector("#cashReviewDialog");
    if (!d) return;
    d.dataset.missionId = missionId;
    d.querySelector("#cashReviewForm")?.reset();
    reviewRating = 5;
    updateStarPicker();
    d.hidden = false;
  }

  function updateStarPicker() {
    document.querySelectorAll("#cashStarPicker .cash-star").forEach((star) => {
      star.classList.toggle("active", Number(star.dataset.star) <= reviewRating);
    });
    const input = document.querySelector("#cashReviewForm [name='rating']");
    if (input) input.value = String(reviewRating);
  }

  /* ------------------------------------------------------------------ */
  /* Navigation                                                           */
  /* ------------------------------------------------------------------ */
  function showFeed() {
    document.querySelector("#cashFeedSection")?.removeAttribute("hidden");
    document.querySelector("#cashNeedDetail")?.setAttribute("hidden", "");
    document.querySelector("#cashPersonalSection")?.setAttribute("hidden", "");
    renderFeed().then(renderHeroStats);
    renderCreditBanner();
  }

  function showDetail(missionId) {
    currentMissionId = missionId;
    document.querySelector("#cashFeedSection")?.setAttribute("hidden", "");
    document.querySelector("#cashNeedDetail")?.removeAttribute("hidden");
    document.querySelector("#cashPersonalSection")?.setAttribute("hidden", "");
    renderNeedDetail(missionId);
  }

  function showPersonal() {
    document.querySelector("#cashFeedSection")?.setAttribute("hidden", "");
    document.querySelector("#cashNeedDetail")?.setAttribute("hidden", "");
    document.querySelector("#cashPersonalSection")?.removeAttribute("hidden");
    renderPersonalSpace();
  }

  function whatsappShare(missionId) {
    const m = feedCache.find((x) => x.id === missionId) || currentMissionDetail;
    if (!m) return;
    const text = encodeURIComponent(
      `[Zeyds Cash] ${m.title}\n📍 ${m.area} · ${m.category}\n💰 Prime : ${formatMoney(m.reward_amount)}\n→ Propose ta solution sur Zeyds.`
    );
    globalThis.open?.(`https://wa.me/?text=${text}`, "_blank");
  }

  /* ------------------------------------------------------------------ */
  /* Admin                                                                */
  /* ------------------------------------------------------------------ */
  function adminMissionRow(m) {
    const actions = [];
    if (m.status === "payment_pending") {
      actions.push(`<button class="secondary" type="button" data-cash-admin-approve-payment="${safe(m.id)}">✓ Approuver le paiement</button>`);
      actions.push(`<button class="danger" type="button" data-cash-admin-reject-payment="${safe(m.id)}">✗ Rejeter</button>`);
    }
    return `<div class="cash-admin-row">
      <div class="cash-admin-row-info">
        <span class="cash-cat-chip">${safe(m.category)}</span>
        <strong>${safe(m.title)}</strong>
        <span>👤 ${safe(m.requester_name)} · ${safe(m.area)} · ${safe(timeAgo(m.created_at))}</span>
        <span class="cash-reward-badge">💰 ${safe(formatMoney(m.reward_amount))}</span>
        <span class="cash-sol-status">${safe(statusLabel(m.status))}</span>
        ${m.escrow_reference ? `<span>Réf. paiement : ${safe(m.escrow_reference)}</span>` : ""}
      </div>
      <div class="cash-admin-row-actions">${actions.join("")}</div>
    </div>`;
  }

  function adminDisputeRow(d) {
    return `<div class="cash-admin-row">
      <div class="cash-admin-row-info">
        <strong>${safe(d.mission_title)}</strong>
        <span>${safe(d.category)} · ${safe(timeAgo(d.created_at))}</span>
        <p>${safe(d.description)}</p>
        <span class="cash-reward-badge">💰 ${safe(formatMoney(d.mission_reward))}</span>
      </div>
      <div class="cash-admin-row-actions">
        <button class="secondary" type="button" data-cash-admin-resolve="${safe(d.id)}" data-favor="solver">En faveur du solveur</button>
        <button class="secondary" type="button" data-cash-admin-resolve="${safe(d.id)}" data-favor="requester">En faveur du demandeur</button>
      </div>
    </div>`;
  }

  async function renderAdminCash() {
    const container = document.querySelector("#cashAdminPanel");
    if (!container) return;
    if (!adminAccessToken()) {
      container.innerHTML = `<p class="cash-sols-empty">Connecte-toi en admin Supabase pour gérer ZEYDS Cash.</p>`;
      return;
    }
    container.innerHTML = `<div class="cash-loading">Chargement…</div>`;
    try {
      const [stats, pendingPayments, disputes, settingsRows] = await Promise.all([
        rpc("cash_admin_stats", {}, true),
        rpc("cash_admin_list_missions", { p_status: "payment_pending", p_limit: 50 }, true),
        rpc("cash_admin_list_disputes", { p_status: "open" }, true),
        rpc("admin_list_platform_settings", {}, true).catch(() => []),
      ]);
      const cashConfig = (settingsRows || []).filter((s) => String(s.key).startsWith("cash_"));

      container.innerHTML = `
        <div class="cash-admin-stats">
          <div class="cash-admin-stat"><strong>${stats.missions_active}</strong><span>Actives</span></div>
          <div class="cash-admin-stat"><strong>${stats.missions_completed}</strong><span>Terminées</span></div>
          <div class="cash-admin-stat"><strong>${stats.missions_payment_pending}</strong><span>Paiements à valider</span></div>
          <div class="cash-admin-stat cash-admin-stat-gold"><strong>${formatMoney(stats.total_commission)}</strong><span>Commissions</span></div>
          <div class="cash-admin-stat"><strong>${formatMoney(stats.total_paid_to_solvers)}</strong><span>Versé aux solveurs</span></div>
          <div class="cash-admin-stat"><strong>${stats.open_disputes}</strong><span>Litiges ouverts</span></div>
        </div>

        <div class="cash-admin-config">
          <h4>Configuration</h4>
          ${cashConfig.map((s) => `<label>${safe(s.key)}
            <input type="number" step="any" data-cash-config-key="${safe(s.key)}" value="${safe(String(s.value))}">
          </label>`).join("")}
          <button class="secondary" type="button" id="cashAdminSaveConfig">Enregistrer</button>
          <p id="cashAdminConfigStatus" role="status"></p>
        </div>

        <div class="cash-admin-needs">
          <h4>Paiements à valider (${pendingPayments.length})</h4>
          ${!pendingPayments.length ? `<p class="cash-sols-empty">Aucun paiement en attente.</p>` : pendingPayments.map(adminMissionRow).join("")}
        </div>

        ${disputes.length ? `<div class="cash-admin-reports">
          <h4>Litiges ouverts (${disputes.length})</h4>
          ${disputes.map(adminDisputeRow).join("")}
        </div>` : ""}`;
    } catch (error) {
      container.innerHTML = `<p class="cash-sols-empty">${safe(errMsg(error))}</p>`;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Event binding                                                        */
  /* ------------------------------------------------------------------ */
  let bridge = {};
  let bound = false;

  function bind() {
    if (bound) return;
    bound = true;

    document.querySelector("#cashWizardNext")?.addEventListener("click", () => {
      const form = document.querySelector("#cashPublishForm");
      if (!validateWizardStep(form)) return;
      if (wizardStep < WIZARD_STEPS) { wizardStep += 1; updateWizardUI(); return; }
      createDraftAndShowRecap(form);
    });
    document.querySelector("#cashWizardBack")?.addEventListener("click", () => {
      wizardStep = Math.max(1, wizardStep - 1);
      updateWizardUI();
    });
    document.querySelectorAll("[name='deadlineType']").forEach((el) => {
      el.addEventListener("change", () => {
        const field = document.querySelector("#cashCustomDeadlineField");
        if (field) field.hidden = el.value !== "date_personnalisee" || !el.checked;
      });
    });

    document.querySelector("#cashRecapEdit")?.addEventListener("click", () => {
      document.querySelector("#cashRecapDialog").hidden = true;
      showPublishDialog();
    });
    document.querySelector("#cashRecapContinue")?.addEventListener("click", () => {
      document.querySelector("#cashRecapDialog").hidden = true;
      if (draftMission) showPaymentDialog(draftMission.id);
    });

    document.querySelector("#cashPaymentMethods")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cash-payment-method]");
      if (!btn) return;
      selectedPaymentMethod = btn.dataset.cashPaymentMethod;
      document.querySelectorAll("#cashPaymentMethods .cash-provider-chip").forEach((c) => c.classList.toggle("active", c === btn));
    });
    document.querySelector("#cashPaymentCreditOption")?.addEventListener("click", async (e) => {
      const btn = e.target.closest("#cashUseCreditBtn");
      if (!btn || !paymentMissionId) return;
      btn.disabled = true;
      try {
        await rpc("cash_use_credit_for_mission", { p_credit_id: btn.dataset.creditId, p_mission_id: paymentMissionId, p_requester_phone: identity().phone });
        document.querySelector("#cashPaymentDialog").hidden = true;
        toast("Mission publiée grâce à ton crédit ZEYDS Cash !");
        showDetail(paymentMissionId);
        showFeed();
      } catch (error) {
        toast(errMsg(error), true);
        btn.disabled = false;
      }
    });
    document.querySelector("#cashPaymentForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!paymentMissionId) return;
      if (!selectedPaymentMethod) { toast("Choisis un moyen de paiement", true); return; }
      const f = e.currentTarget;
      const status = document.querySelector("#cashPaymentStatus");
      try {
        const mission = await rpc("cash_get_mission_detail", { p_mission_id: paymentMissionId, p_caller_phone: identity().phone });
        await rpc("cash_declare_mission_payment", {
          p_mission_id: paymentMissionId,
          p_requester_phone: identity().phone,
          p_payment_method: selectedPaymentMethod,
          p_transaction_reference: f.elements.transactionReference.value,
          p_amount: mission.reward_amount,
        });
        document.querySelector("#cashPaymentDialog").hidden = true;
        toast("Paiement déclaré ! Ta mission sera publiée dès confirmation admin.");
        showDetail(paymentMissionId);
      } catch (error) {
        if (status) status.textContent = errMsg(error);
      }
    });

    document.querySelector("#cashHelpWizardNext")?.addEventListener("click", async () => {
      const form = document.querySelector("#cashProposeForm");
      if (helpWizardStep === 1) {
        if (!identityReady()) {
          const n = form.elements.identityName?.value.trim();
          const p = form.elements.identityPhone?.value.trim();
          if (!n || !p) { toast("Renseigne ton nom et ton téléphone", true); return; }
          setIdentity(n, p);
        }
        helpWizardStep = 2;
        updateHelpWizardUI();
        return;
      }
      await submitHelpProposal(form);
    });
    document.querySelector("#cashHelpWizardBack")?.addEventListener("click", () => {
      helpWizardStep = 1;
      updateHelpWizardUI();
    });
    document.querySelectorAll("[name='durationPreset']").forEach((el) => {
      el.addEventListener("change", () => {
        const custom = document.querySelector("#cashDurationCustomFields");
        if (custom) custom.hidden = el.value !== "autre" || !el.checked;
      });
    });
    document.querySelector("#cashHelpSentGoBtn")?.addEventListener("click", () => {
      document.querySelector("#cashHelpSentDialog").hidden = true;
      bridge.setView?.("cash");
      personalTab = "mes-solutions";
      showPersonal();
    });

    document.querySelector("#cashDisputeForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dialog = document.querySelector("#cashDisputeDialog");
      const f = e.currentTarget;
      try {
        await rpc("cash_open_dispute", {
          p_mission_id: dialog.dataset.missionId,
          p_opened_by_phone: identity().phone,
          p_category: f.elements.category.value,
          p_description: f.elements.description.value,
          p_attachments: [],
        });
        dialog.hidden = true;
        toast("Signalement envoyé — fonds bloqués en attendant l'examen ZEYDS.");
        if (currentMissionId) renderNeedDetail(currentMissionId);
      } catch (error) {
        toast(errMsg(error), true);
      }
    });

    document.querySelector("#cashStarPicker")?.addEventListener("click", (e) => {
      const star = e.target.closest("[data-star]");
      if (!star) return;
      reviewRating = Number(star.dataset.star);
      updateStarPicker();
    });
    document.querySelector("#cashReviewForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dialog = document.querySelector("#cashReviewDialog");
      const f = e.currentTarget;
      try {
        await rpc("cash_submit_review", {
          p_mission_id: dialog.dataset.missionId,
          p_reviewer_phone: identity().phone,
          p_rating: reviewRating,
          p_speed_rating: null,
          p_reliability_rating: null,
          p_quality_rating: null,
          p_comment: f.elements.comment.value,
        });
        dialog.hidden = true;
        toast("Merci pour ta note !");
        if (currentMissionId) renderNeedDetail(currentMissionId);
      } catch (error) {
        toast(errMsg(error), true);
      }
    });

    document.querySelector("#cashPersonalTabs")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cash-tab]");
      if (!btn) return;
      document.querySelectorAll("#cashPersonalTabs [data-cash-tab]").forEach((b) => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      personalTab = btn.dataset.cashTab;
      renderPersonalSpace();
    });

    document.querySelector("#cashSolutionsFilterBar")?.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-cash-sol-filter]");
      if (!chip) return;
      solutionsFilter = chip.dataset.cashSolFilter;
      document.querySelectorAll("#cashSolutionsFilterBar [data-cash-sol-filter]").forEach((b) => {
        const active = b === chip;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      renderMySolutionsList();
    });

    document.querySelector("#cashNotifBtn")?.addEventListener("click", () => {
      const panel = document.querySelector("#cashNotifPanel");
      if (!panel) return;
      panel.hidden = !panel.hidden;
      if (!panel.hidden) renderNotifPanel();
    });

    document.querySelector("#cashAdminPanel")?.addEventListener("click", async (e) => {
      const approveBtn = e.target.closest("[data-cash-admin-approve-payment]");
      if (approveBtn) {
        approveBtn.disabled = true;
        try { await rpc("cash_admin_approve_payment", { p_mission_id: approveBtn.dataset.cashAdminApprovePayment }, true); toast("Paiement approuvé"); renderAdminCash(); }
        catch (error) { toast(errMsg(error), true); approveBtn.disabled = false; }
        return;
      }
      const rejectBtn = e.target.closest("[data-cash-admin-reject-payment]");
      if (rejectBtn) {
        const reason = globalThis.prompt?.("Motif du rejet :") || "";
        rejectBtn.disabled = true;
        try { await rpc("cash_admin_reject_payment", { p_mission_id: rejectBtn.dataset.cashAdminRejectPayment, p_reason: reason }, true); toast("Paiement rejeté"); renderAdminCash(); }
        catch (error) { toast(errMsg(error), true); rejectBtn.disabled = false; }
        return;
      }
      const resolveBtn = e.target.closest("[data-cash-admin-resolve]");
      if (resolveBtn) {
        const resolution = globalThis.prompt?.("Résolution (visible par les deux parties) :") || "";
        resolveBtn.disabled = true;
        try {
          await rpc("cash_admin_resolve_dispute", {
            p_dispute_id: resolveBtn.dataset.cashAdminResolve, p_favor: resolveBtn.dataset.favor, p_resolution: resolution, p_solver_share_amount: null,
          }, true);
          toast("Litige résolu");
          renderAdminCash();
        } catch (error) { toast(errMsg(error), true); resolveBtn.disabled = false; }
        return;
      }
      if (e.target.closest("#cashAdminSaveConfig")) {
        const status = document.querySelector("#cashAdminConfigStatus");
        try {
          const inputs = document.querySelectorAll("[data-cash-config-key]");
          for (const input of inputs) {
            await rpc("admin_set_platform_setting", { p_key: input.dataset.cashConfigKey, p_value: Number(input.value) }, true);
          }
          if (status) status.textContent = "Configuration enregistrée.";
          await loadSettings();
        } catch (error) {
          if (status) status.textContent = errMsg(error);
        }
      }
    });

    /* Delegation globale */
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-cash-publish]")) { showPublishDialog(); return; }
      if (e.target.closest("[data-cash-close-publish]")) { document.querySelector("#cashPublishDialog").hidden = true; return; }
      if (e.target.closest("[data-cash-close-recap]")) { document.querySelector("#cashRecapDialog").hidden = true; return; }
      if (e.target.closest("[data-cash-close-payment]")) { document.querySelector("#cashPaymentDialog").hidden = true; return; }
      if (e.target.closest("[data-cash-close-propose]")) { document.querySelector("#cashProposeDialog").hidden = true; return; }
      if (e.target.closest("[data-cash-close-dispute]")) { document.querySelector("#cashDisputeDialog").hidden = true; return; }
      if (e.target.closest("[data-cash-close-review]")) { document.querySelector("#cashReviewDialog").hidden = true; return; }
      if (e.target.closest("[data-cash-close-confirm]")) { document.querySelector("#cashConfirmDialog").hidden = true; return; }

      const openNeed = e.target.closest("[data-cash-open-need]");
      if (openNeed && !e.target.closest("button[data-cash-select-solution],button[data-cash-withdraw-solution],[data-fav-toggle]")) {
        const id = openNeed.dataset.cashOpenNeed;
        if (id) { bridge.setView?.("cash"); showDetail(id); }
        return;
      }
      if (e.target.closest("[data-cash-open-feed]")) { showFeed(); return; }
      if (e.target.closest("[data-cash-open-personal]")) { bridge.setView?.("cash"); showPersonal(); return; }
      if (e.target.closest("[data-cash-propose]")) { showProposeDialog(e.target.closest("[data-cash-propose]").dataset.cashPropose); return; }
      if (e.target.closest("[data-cash-pay]")) { showPaymentDialog(e.target.closest("[data-cash-pay]").dataset.cashPay); return; }
      if (e.target.closest("[data-cash-dispute]")) { showDisputeDialog(e.target.closest("[data-cash-dispute]").dataset.cashDispute); return; }
      if (e.target.closest("[data-cash-review]")) { showReviewDialog(e.target.closest("[data-cash-review]").dataset.cashReview); return; }
      if (e.target.closest("[data-cash-whatsapp]")) { whatsappShare(e.target.closest("[data-cash-whatsapp]").dataset.cashWhatsapp); return; }

      const finalizeBtn = e.target.closest("[data-cash-finalize]");
      if (finalizeBtn) {
        showConfirmDialog("Mission terminée ?", "Confirmer que la mission est terminée ? Le demandeur sera invité à valider ta solution.", () => {
          finalizeBtn.disabled = true;
          rpc("cash_solver_finalize_mission", { p_mission_id: finalizeBtn.dataset.cashFinalize, p_solver_phone: identity().phone })
            .then(() => { toast("Mission finalisée, en attente de confirmation."); renderNeedDetail(finalizeBtn.dataset.cashFinalize); })
            .catch((error) => { toast(errMsg(error), true); finalizeBtn.disabled = false; });
        });
        return;
      }
      const confirmBtn = e.target.closest("[data-cash-confirm]");
      if (confirmBtn) {
        confirmBtn.disabled = true;
        rpc("cash_confirm_completion", { p_mission_id: confirmBtn.dataset.cashConfirm, p_requester_phone: identity().phone })
          .then(() => { toast("Mission confirmée ! Merci de noter ton solveur."); showReviewDialog(confirmBtn.dataset.cashConfirm); renderNeedDetail(confirmBtn.dataset.cashConfirm); })
          .catch((error) => { toast(errMsg(error), true); confirmBtn.disabled = false; });
        return;
      }
      const selectBtn = e.target.closest("[data-cash-select-solution]");
      if (selectBtn) {
        const solverName = selectBtn.dataset.cashSolverName || "ce solveur";
        showConfirmDialog("Confirmer ce solutionneur ?", `Tu vas confier cette mission à ${solverName}. La prime reste sécurisée jusqu'à la validation finale de la mission.`, () => {
          selectBtn.disabled = true;
          rpc("cash_select_solution", { p_mission_id: selectBtn.dataset.cashMissionId, p_requester_phone: identity().phone, p_solution_id: selectBtn.dataset.cashSelectSolution })
            .then(() => { toast("Solution sélectionnée !"); renderNeedDetail(selectBtn.dataset.cashMissionId); })
            .catch((error) => { toast(errMsg(error), true); selectBtn.disabled = false; });
        });
        return;
      }
      const withdrawBtn = e.target.closest("[data-cash-withdraw-solution]");
      if (withdrawBtn) {
        withdrawBtn.disabled = true;
        rpc("cash_withdraw_solution", { p_solution_id: withdrawBtn.dataset.cashWithdrawSolution, p_solver_phone: identity().phone })
          .then(() => { toast("Proposition retirée."); if (currentMissionId) renderNeedDetail(currentMissionId); })
          .catch((error) => { toast(errMsg(error), true); withdrawBtn.disabled = false; });
        return;
      }

      const chip = e.target.closest("[data-cash-filter]");
      if (chip) {
        const key = chip.dataset.cashFilter;
        const val = chip.dataset.cashFilterVal;
        if (key === "category") feedFilter.category = feedFilter.category === val ? "" : val;
        else if (key === "area") feedFilter.area = feedFilter.area === val ? "" : val;
        else if (key === "rewarded") feedFilter.rewarded = !feedFilter.rewarded;
        renderFilterChips();
        renderFeed().then(renderHeroStats);
        return;
      }

      if (e.target.closest('[data-view="cash"],[data-go="cash"]')) showFeed();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const card = e.target.closest("[data-cash-open-need]");
      if (card?.dataset.cashOpenNeed) { bridge.setView?.("cash"); showDetail(card.dataset.cashOpenNeed); }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                           */
  /* ------------------------------------------------------------------ */
  async function render() {
    await loadSettings();
    rpc("cash_sweep_expired", { p_limit: 20 }).catch(() => {});
    await renderFeed();
    await renderHeroStats();
    renderCreditBanner();
    refreshNotifBadge();
  }

  function open() {
    bridge.setView?.("cash");
    showFeed();
  }

  function openMission(id) {
    bridge.setView?.("cash");
    showDetail(id);
  }

  function init(nextBridge = {}) {
    bridge = { ...bridge, ...nextBridge };
    bind();
    render();
  }

  globalThis.ZeydsCash = Object.freeze({ init, open, render, renderAdminCash, openMission });
})();
