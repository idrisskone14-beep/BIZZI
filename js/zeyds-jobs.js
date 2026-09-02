/* ============================================================
   ZEYDS JOBS — Profil candidat, candidatures, favoris, alertes,
   espace recruteur, matching.

   Réutilise le module "Emplois & missions" existant (app.js) pour
   la publication d'offres, le paiement, la validation admin et la
   synchronisation Supabase — voir #jobOfferForm / renderJobs() /
   jobsMatching() / activeJobOffers(), inchangés.

   Ce module n'y touche pas et se contente de :
   - lire les offres via bridge.getJobOffers() (référence vivante
     vers state.jobOffers, fournie par app.js à l'init) ;
   - ajouter par-dessus les briques absentes : profil candidat
     (mini-CV), candidature en 1 clic, suivi des candidatures,
     favoris, alertes, matching, mini-dashboard recruteur.

   Persistance 100% locale (localStorage via BizziStorage), comme
   Zeyds Cash — donc les candidatures/favoris/profils ne sont PAS
   synchronisés entre appareils (contrairement aux offres, qui,
   elles, passent par Supabase). Une table Supabase dédiée est
   préparée dans sql-copie-bizzi/60-emplois-candidatures-v1.sql
   pour une évolution future sans réécrire ce module.
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Storage                                                              */
  /* ------------------------------------------------------------------ */
  const PROFILE_KEY = "zeyds-jobs-candidate-v1";
  const APPLICATIONS_KEY = "zeyds-jobs-applications-v1";
  const FAVORITES_KEY = "zeyds-jobs-favorites-v1";
  const ALERTS_KEY = "zeyds-jobs-alerts-v1";
  const RECRUITER_PHONE_KEY = "zeyds-jobs-recruiter-phone-v1";

  const APPLICATION_STATUSES = ["Envoyée", "Vue", "Présélectionné", "Entretien", "Retenu", "Non retenu"];
  const PIPELINE_STATUSES = ["Nouveau", "À examiner", "Présélectionné", "Entretien", "Recruté", "Refusé"];

  /* ------------------------------------------------------------------ */
  /* Utils (copie locale, même esprit que zeyds-cash.js)                  */
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

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function formatMoney(v) {
    const n = Number(v || 0);
    return n > 0 ? `${new Intl.NumberFormat("fr-FR").format(n)} FCFA` : "";
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

  function normalizePhone(v) {
    return String(v || "").replace(/[^\d]/g, "").replace(/^225/, "");
  }

  function normalizeText(v) {
    return String(v || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }

  /* ------------------------------------------------------------------ */
  /* Bridge vers app.js (fourni à init)                                   */
  /* ------------------------------------------------------------------ */
  let bridge = {
    setView: () => {},
    getJobOffers: () => [],
    renderJobs: () => {},
    jobWhatsAppUrl: () => "",
  };

  function allOffers() {
    try { return bridge.getJobOffers?.() || []; } catch { return []; }
  }

  function offerType(job) {
    return job.contractType === "Mission ponctuelle" ? "mission" : "emploi";
  }

  function findOffer(jobId) {
    return allOffers().find((j) => j.id === jobId);
  }

  /* ------------------------------------------------------------------ */
  /* Profil candidat                                                      */
  /* ------------------------------------------------------------------ */
  function defaultProfile() {
    return {
      firstName: "", lastName: "", phone: "", whatsapp: "", email: "",
      city: "", commune: "", district: "",
      metier: "", posteRecherche: "", bio: "",
      experienceYears: "", educationLevel: "", availability: "immediate",
      contractWanted: "", salaryExpectation: "",
      availableForMissions: false,
      skills: [], experiences: [], education: [],
      updatedAt: null,
    };
  }

  function getProfile() {
    return { ...defaultProfile(), ...(readJson(PROFILE_KEY, {}) || {}) };
  }

  function saveProfile(profile) {
    profile.updatedAt = new Date().toISOString();
    writeJson(PROFILE_KEY, profile);
    return profile;
  }

  function hasProfile(profile = getProfile()) {
    return Boolean(profile.firstName && profile.phone);
  }

  function profileCompletion(profile = getProfile()) {
    const checks = [
      profile.firstName, profile.lastName, profile.phone, profile.city,
      profile.metier, profile.posteRecherche, profile.bio,
      profile.experienceYears !== "" && profile.experienceYears != null,
      profile.educationLevel, profile.availability,
      profile.skills && profile.skills.length > 0,
      profile.experiences && profile.experiences.length > 0,
      profile.education && profile.education.length > 0,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }

  /* ------------------------------------------------------------------ */
  /* Candidatures                                                         */
  /* ------------------------------------------------------------------ */
  function getApplications() {
    const v = readJson(APPLICATIONS_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  function hasApplied(jobId) {
    return getApplications().some((a) => a.jobId === jobId);
  }

  function addApplication(jobId) {
    if (!jobId || hasApplied(jobId)) return null;
    const profile = getProfile();
    const app = {
      id: uid("app"),
      jobId,
      candidateSnapshot: {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        metier: profile.metier,
        experienceYears: profile.experienceYears,
        skills: profile.skills || [],
      },
      status: "Envoyée",
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = [app, ...getApplications()].slice(0, 500);
    writeJson(APPLICATIONS_KEY, list);
    return app;
  }

  function updateApplicationStatus(appId, status) {
    const list = getApplications();
    const app = list.find((a) => a.id === appId);
    if (!app || !APPLICATION_STATUSES.includes(status)) return null;
    app.status = status;
    app.updatedAt = new Date().toISOString();
    writeJson(APPLICATIONS_KEY, list);
    return app;
  }

  function addApplicationNote(appId, text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return null;
    const list = getApplications();
    const app = list.find((a) => a.id === appId);
    if (!app) return null;
    app.notes = app.notes || [];
    app.notes.unshift({ text: trimmed, createdAt: new Date().toISOString() });
    writeJson(APPLICATIONS_KEY, list);
    return app;
  }

  function applicationsForOffers(offerIds) {
    const set = new Set(offerIds);
    return getApplications().filter((a) => set.has(a.jobId));
  }

  /* ------------------------------------------------------------------ */
  /* Favoris                                                              */
  /* ------------------------------------------------------------------ */
  // Delegue au module Favoris centralise (synchronise avec l'onglet
  // "Favoris" et Supabase/Neon) au lieu du stockage local d'origine
  // (FAVORITES_KEY reste inutilise mais n'est pas retire, au cas ou
  // BizziFavorites ne serait pas charge).
  function getFavorites() {
    if (globalThis.BizziFavorites?.getAll) {
      return globalThis.BizziFavorites.getAll()
        .filter((f) => f.item_type === "job")
        .map((f) => f.item_id);
    }
    const v = readJson(FAVORITES_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  function isFavorite(jobId) {
    if (globalThis.BizziFavorites?.isFavorite) return globalThis.BizziFavorites.isFavorite("job", jobId);
    return getFavorites().includes(jobId);
  }

  function toggleFavorite(jobId) {
    if (globalThis.BizziFavorites?.toggle) {
      globalThis.BizziFavorites.toggle("job", jobId);
      return globalThis.BizziFavorites.isFavorite("job", jobId);
    }
    const list = getFavorites();
    const idx = list.indexOf(jobId);
    if (idx >= 0) list.splice(idx, 1);
    else list.unshift(jobId);
    writeJson(FAVORITES_KEY, list);
    return list.includes(jobId);
  }

  /* ------------------------------------------------------------------ */
  /* Alertes                                                              */
  /* ------------------------------------------------------------------ */
  function getAlerts() {
    const v = readJson(ALERTS_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  function addAlert({ keyword, city, contractType }) {
    if (!keyword && !city && !contractType) return null;
    const alert = {
      id: uid("alert"),
      keyword: String(keyword || "").trim(),
      city: String(city || "").trim(),
      contractType: String(contractType || "").trim(),
      createdAt: new Date().toISOString(),
    };
    writeJson(ALERTS_KEY, [alert, ...getAlerts()].slice(0, 50));
    return alert;
  }

  function removeAlert(id) {
    writeJson(ALERTS_KEY, getAlerts().filter((a) => a.id !== id));
  }

  function alertMatches(alert, job) {
    const kw = normalizeText(alert.keyword);
    const keywordOk = !kw || [job.title, job.service, job.description].some((f) => normalizeText(f).includes(kw));
    const cityOk = !alert.city || normalizeText(job.city).includes(normalizeText(alert.city)) || normalizeText(job.area).includes(normalizeText(alert.city));
    const contractOk = !alert.contractType || job.contractType === alert.contractType;
    return keywordOk && cityOk && contractOk;
  }

  function alertMatchCount(alert) {
    return allOffers().filter((job) => alertMatches(alert, job)).length;
  }

  /* ------------------------------------------------------------------ */
  /* Recruteur (identification locale par téléphone)                     */
  /* ------------------------------------------------------------------ */
  function getRecruiterPhone() {
    return readJson(RECRUITER_PHONE_KEY, "") || "";
  }

  function setRecruiterPhone(phone) {
    writeJson(RECRUITER_PHONE_KEY, String(phone || "").trim());
  }

  function recruiterOffers() {
    const phone = normalizePhone(getRecruiterPhone());
    if (!phone) return [];
    return allOffers().filter((j) => normalizePhone(j.contactPhone) === phone);
  }

  /* ------------------------------------------------------------------ */
  /* Matching — score 0-100, règles simples et transparentes             */
  /* Pondération : métier 25 / compétences 25 / localisation 15 /        */
  /* expérience 15 / disponibilité 10 / salaire 10                       */
  /* ------------------------------------------------------------------ */
  function computeMatchScore(job, profile = getProfile()) {
    if (!hasProfile(profile)) return null;
    let score = 0;

    /* Métier (25) */
    const jobText = normalizeText(`${job.title} ${job.service} ${job.description}`);
    const metier = normalizeText(profile.metier);
    const poste = normalizeText(profile.posteRecherche);
    if (metier && jobText.includes(metier)) score += 25;
    else if (poste && jobText.includes(poste)) score += 18;
    else if (metier || poste) score += 6;

    /* Compétences (25) */
    const skills = (profile.skills || []).map(normalizeText).filter(Boolean);
    if (skills.length) {
      const matched = skills.filter((s) => jobText.includes(s)).length;
      score += Math.round((matched / skills.length) * 25);
    }

    /* Localisation (15) */
    const jobCity = normalizeText(job.city);
    const jobArea = normalizeText(job.area);
    const city = normalizeText(profile.city);
    const commune = normalizeText(profile.commune);
    if (jobCity === "toute la cote d'ivoire" || jobCity === "toute la côte d'ivoire") score += 12;
    else if (city && jobCity === city) score += 15;
    else if (commune && jobArea && jobArea.includes(commune)) score += 15;
    else if (city && jobCity) score += 4;

    /* Expérience (15) */
    const years = Number(profile.experienceYears || 0);
    const requiredMatch = job.description?.match(/(\d+)\s*an/i);
    const required = requiredMatch ? Number(requiredMatch[1]) : null;
    if (required == null) score += 9;
    else if (years >= required) score += 15;
    else if (years >= required - 1) score += 8;

    /* Disponibilité (10) */
    if (profile.availability === "immediate") score += 10;
    else if (profile.availability === "7j") score += 7;
    else if (profile.availability === "30j") score += 4;

    /* Salaire (10) */
    const wanted = Number(profile.salaryExpectation || 0);
    const salaryMatch = job.salaryRange?.match(/(\d[\d\s]{2,})/);
    const offered = salaryMatch ? Number(salaryMatch[1].replace(/\s/g, "")) : null;
    if (!wanted || offered == null) score += 6;
    else if (offered >= wanted) score += 10;
    else if (offered >= wanted * 0.85) score += 6;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /* ------------------------------------------------------------------ */
  /* Navigation entre écrans                                              */
  /* ------------------------------------------------------------------ */
  let currentScreen = "home";
  let currentTypeFilter = "";
  let currentDetailJobId = null;
  let recruiterTab = "offers";

  function showScreen(name) {
    currentScreen = name;
    document.querySelectorAll(".jobs-screen").forEach((el) => {
      el.hidden = el.dataset.jobsScreen !== name;
    });
    document.querySelectorAll("#jobsSubNav .jobs-subnav-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.jobsGoto === name);
    });
    if (name === "detail" && currentDetailJobId) renderDetail(currentDetailJobId);
    if (name === "profile") renderProfileScreen();
    if (name === "applications") renderApplicationsScreen();
    if (name === "favorites") renderFavoritesScreen();
    if (name === "alerts") renderAlertsScreen();
    if (name === "recruiter") renderRecruiterScreen();
    if (name === "home") enhanceOffersList();
  }

  function openDetail(jobId) {
    currentDetailJobId = jobId;
    bridge.setView?.("jobs");
    showScreen("detail");
  }

  /* ------------------------------------------------------------------ */
  /* Écran Accueil — enrichissement des cartes rendues par app.js         */
  /* ------------------------------------------------------------------ */
  function enhanceOffersList() {
    const list = document.querySelector("#jobOffersList");
    if (!list) return;
    const profile = getProfile();
    const favorites = getFavorites();

    list.querySelectorAll(".job-card:not(.empty):not(.pending-job)").forEach((card) => {
      const copyBtn = card.querySelector("[data-copy-job]");
      const jobId = copyBtn?.dataset.copyJob;
      if (!jobId || card.dataset.jobsEnhanced === jobId) return;
      card.dataset.jobsEnhanced = jobId;
      card.dataset.jobId = jobId;

      const job = findOffer(jobId);
      if (!job) return;

      /* Filtre type (au cas où le tab courant n'est pas déjà passé à jobsMatching) */
      if (currentTypeFilter && offerType(job) !== currentTypeFilter) {
        card.hidden = true;
        return;
      }
      card.hidden = false;

      /* Badge mission */
      const titleRow = card.querySelector(".job-title-row");
      if (titleRow && offerType(job) === "mission" && !titleRow.querySelector(".jobs-mission-badge")) {
        const badge = document.createElement("span");
        badge.className = "tag jobs-mission-badge";
        badge.textContent = "Mission";
        titleRow.appendChild(badge);
      }

      /* Score de compatibilité */
      const meta = card.querySelector(".meta");
      if (meta && !meta.querySelector(".jobs-match-badge")) {
        const score = computeMatchScore(job, profile);
        if (score != null) {
          const badge = document.createElement("span");
          badge.className = `tag jobs-match-badge ${score >= 70 ? "ok" : ""}`;
          badge.textContent = `${score}% compatible`;
          meta.appendChild(badge);
        }
      }

      /* Actions : Voir l'offre / Postuler / Enregistrer */
      const actions = card.querySelector(".job-actions");
      if (actions && !actions.querySelector("[data-jobs-open]")) {
        const viewBtn = document.createElement("button");
        viewBtn.type = "button";
        viewBtn.className = "secondary";
        viewBtn.dataset.jobsOpen = jobId;
        viewBtn.textContent = "Voir l'offre";

        const applyBtn = document.createElement("button");
        applyBtn.type = "button";
        applyBtn.className = "primary";
        applyBtn.dataset.jobsApply = jobId;
        const applied = hasApplied(jobId);
        applyBtn.textContent = applied ? "Candidature envoyée" : "Postuler";
        applyBtn.disabled = applied;

        const favBtn = document.createElement("button");
        favBtn.type = "button";
        favBtn.className = "secondary jobs-fav-btn";
        favBtn.dataset.jobsFav = jobId;
        favBtn.setAttribute("aria-label", "Enregistrer cette offre");
        favBtn.textContent = favorites.includes(jobId) ? "★" : "☆";

        actions.prepend(favBtn);
        actions.prepend(applyBtn);
        actions.prepend(viewBtn);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Écran Détail                                                         */
  /* ------------------------------------------------------------------ */
  function renderDetail(jobId) {
    const container = document.querySelector("#jobsDetailContent");
    if (!container) return;
    const job = findOffer(jobId);
    if (!job) {
      container.innerHTML = `<div class="jobs-empty"><span>🔎</span><strong>Offre introuvable.</strong><p>Elle a peut-être expiré.</p></div>`;
      return;
    }
    const profile = getProfile();
    const score = computeMatchScore(job, profile);
    const applied = hasApplied(jobId);
    const favorite = isFavorite(jobId);
    const whatsappUrl = bridge.jobWhatsAppUrl?.(job) || "";
    const expired = job.expiresAt && new Date(job.expiresAt).getTime() <= Date.now();
    const daysLeft = job.expiresAt ? Math.ceil((new Date(job.expiresAt).getTime() - Date.now()) / 86400000) : null;

    container.innerHTML = `
      <div class="jobs-detail-hero">
        <div class="jobs-detail-tags">
          <span class="tag ${offerType(job) === "mission" ? "" : "ok"}">${safe(offerType(job) === "mission" ? "Mission" : job.contractType)}</span>
          ${job.isBoosted ? `<span class="tag pending">Urgent</span>` : ""}
          ${score != null ? `<span class="tag ${score >= 70 ? "ok" : ""}">${score}% compatible</span>` : ""}
          ${expired ? `<span class="tag">Offre expirée</span>` : daysLeft != null ? `<span class="tag">Expire dans ${daysLeft}j</span>` : ""}
        </div>
        <h2>${safe(job.title)}</h2>
        <p class="jobs-detail-company">${safe(job.companyName)} · ${safe(job.companyType || "Entreprise")}</p>
        <div class="jobs-detail-facts">
          <span>📍 ${safe(job.city)}${job.area ? `, ${safe(job.area)}` : ""}</span>
          <span>💼 ${safe(job.contractType)}</span>
          ${job.salaryRange ? `<span>💰 ${safe(job.salaryRange)}</span>` : ""}
          <span>🗓 Publié le ${new Date(job.createdAt).toLocaleDateString("fr-FR")}</span>
          ${job.positions ? `<span>👥 ${safe(job.positions)} poste(s)</span>` : ""}
        </div>
      </div>

      <div class="jobs-detail-section">
        <h3>Description</h3>
        <p>${safe(job.description || "Contactez l'annonceur pour plus de détails.")}</p>
      </div>

      <div class="jobs-detail-cta-row">
        <button type="button" class="primary jobs-apply-btn" data-jobs-apply="${safe(job.id)}" ${applied || expired ? "disabled" : ""}>
          ${applied ? "Candidature envoyée ✓" : expired ? "Offre expirée" : "Postuler maintenant"}
        </button>
        <button type="button" class="secondary" data-jobs-fav="${safe(job.id)}">${favorite ? "★ Enregistrée" : "☆ Enregistrer"}</button>
        ${whatsappUrl ? `<a class="secondary jobs-whatsapp-link" href="${safe(whatsappUrl)}" target="_blank" rel="noreferrer">💬 WhatsApp</a>` : ""}
      </div>
      <p id="jobsApplyStatus" class="status-box" role="status"></p>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Écran Profil                                                         */
  /* ------------------------------------------------------------------ */
  let skillsDraft = [];
  let experiencesDraft = [];
  let educationDraft = [];

  function renderProfileScreen() {
    const profile = getProfile();
    const form = document.querySelector("#jobsProfileForm");
    if (!form) return;
    Object.entries(profile).forEach(([key, value]) => {
      const field = form.elements[key];
      if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = value ?? "";
    });
    skillsDraft = [...(profile.skills || [])];
    experiencesDraft = (profile.experiences || []).map((e) => ({ ...e }));
    educationDraft = (profile.education || []).map((e) => ({ ...e }));
    renderSkillsTags();
    renderExperiencesList();
    renderEducationList();
    renderProfileCompletion(profile);
  }

  function renderProfileCompletion(profile = getProfile()) {
    const pct = profileCompletion(profile);
    const fill = document.querySelector("#jobsProfileBarFill");
    const label = document.querySelector("#jobsProfileCompletionLabel");
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `Profil complété à ${pct} %`;
  }

  function renderSkillsTags() {
    const container = document.querySelector("#jobsSkillsTags");
    if (!container) return;
    container.innerHTML = skillsDraft.map((s, i) => `
      <span class="jobs-skill-tag">${safe(s)} <button type="button" data-jobs-remove-skill="${i}" aria-label="Retirer">×</button></span>
    `).join("") || `<p class="jobs-form-hint">Aucune compétence ajoutée.</p>`;
  }

  function experienceRow(exp, i) {
    return `
      <div class="jobs-repeatable-item" data-jobs-exp-index="${i}">
        <div class="jobs-form-grid">
          <label class="jobs-form-label">Entreprise<input type="text" data-jobs-exp-field="company" value="${safe(exp.company)}" maxlength="80"></label>
          <label class="jobs-form-label">Poste<input type="text" data-jobs-exp-field="role" value="${safe(exp.role)}" maxlength="80"></label>
          <label class="jobs-form-label">Début<input type="month" data-jobs-exp-field="startDate" value="${safe(exp.startDate)}"></label>
          <label class="jobs-form-label">Fin<input type="month" data-jobs-exp-field="endDate" value="${safe(exp.endDate)}"></label>
        </div>
        <label class="jobs-form-label jobs-form-label-full">Description<textarea data-jobs-exp-field="description" rows="2" maxlength="300">${safe(exp.description)}</textarea></label>
        <button type="button" class="jobs-remove-row-btn" data-jobs-remove-experience="${i}">Retirer cette expérience</button>
      </div>
    `;
  }

  function renderExperiencesList() {
    const container = document.querySelector("#jobsExperiencesList");
    if (!container) return;
    container.innerHTML = experiencesDraft.map(experienceRow).join("") || `<p class="jobs-form-hint">Aucune expérience ajoutée.</p>`;
  }

  function educationRow(edu, i) {
    return `
      <div class="jobs-repeatable-item" data-jobs-edu-index="${i}">
        <div class="jobs-form-grid">
          <label class="jobs-form-label">Établissement<input type="text" data-jobs-edu-field="school" value="${safe(edu.school)}" maxlength="80"></label>
          <label class="jobs-form-label">Diplôme<input type="text" data-jobs-edu-field="degree" value="${safe(edu.degree)}" maxlength="80"></label>
          <label class="jobs-form-label">Domaine<input type="text" data-jobs-edu-field="field" value="${safe(edu.field)}" maxlength="80"></label>
          <label class="jobs-form-label">Année<input type="number" min="1970" max="2100" data-jobs-edu-field="year" value="${safe(edu.year)}"></label>
        </div>
        <button type="button" class="jobs-remove-row-btn" data-jobs-remove-education="${i}">Retirer cette formation</button>
      </div>
    `;
  }

  function renderEducationList() {
    const container = document.querySelector("#jobsEducationList");
    if (!container) return;
    container.innerHTML = educationDraft.map(educationRow).join("") || `<p class="jobs-form-hint">Aucune formation ajoutée.</p>`;
  }

  function syncDraftsFromDom() {
    document.querySelectorAll("#jobsExperiencesList [data-jobs-exp-index]").forEach((row) => {
      const i = Number(row.dataset.jobsExpIndex);
      if (!experiencesDraft[i]) return;
      row.querySelectorAll("[data-jobs-exp-field]").forEach((field) => {
        experiencesDraft[i][field.dataset.jobsExpField] = field.value;
      });
    });
    document.querySelectorAll("#jobsEducationList [data-jobs-edu-index]").forEach((row) => {
      const i = Number(row.dataset.jobsEduIndex);
      if (!educationDraft[i]) return;
      row.querySelectorAll("[data-jobs-edu-field]").forEach((field) => {
        educationDraft[i][field.dataset.jobsEduField] = field.value;
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Écran Mes candidatures                                               */
  /* ------------------------------------------------------------------ */
  function renderApplicationsScreen() {
    const container = document.querySelector("#jobsApplicationsList");
    if (!container) return;
    const apps = getApplications();
    if (!apps.length) {
      container.innerHTML = `<div class="jobs-empty"><span>📄</span><strong>Aucune candidature envoyée.</strong><p>Trouvez une offre et postulez en un clic.</p></div>`;
      return;
    }
    container.innerHTML = apps.map((app) => {
      const job = findOffer(app.jobId);
      return `
        <article class="jobs-application-card" data-jobs-open="${safe(app.jobId)}">
          <div class="jobs-application-head">
            <h3>${safe(job?.title || "Offre indisponible")}</h3>
            <span class="tag jobs-status-${safe(app.status.replace(/\s/g, "-"))}">${safe(app.status)}</span>
          </div>
          <p>${safe(job?.companyName || "")}</p>
          <span class="jobs-application-date">Mise à jour : ${safe(timeAgo(app.updatedAt))}</span>
        </article>
      `;
    }).join("");
  }

  /* ------------------------------------------------------------------ */
  /* Écran Mes favoris                                                    */
  /* ------------------------------------------------------------------ */
  function jobCardLite(job) {
    const whatsappUrl = bridge.jobWhatsAppUrl?.(job) || "";
    return `
      <article class="job-card" data-job-id="${safe(job.id)}">
        <div class="job-art"><span>💼</span></div>
        <div class="job-body">
          <div class="job-title-row">
            <h3>${safe(job.title)}</h3>
            <span class="tag ${offerType(job) === "mission" ? "" : "ok"}">${safe(offerType(job) === "mission" ? "Mission" : job.contractType)}</span>
          </div>
          <p>${safe(job.companyName)} - ${safe(job.city)}${job.area ? `, ${safe(job.area)}` : ""}</p>
          ${job.salaryRange ? `<div class="meta"><span class="tag">${safe(job.salaryRange)}</span></div>` : ""}
        </div>
        <div class="job-actions">
          <button type="button" class="secondary" data-jobs-open="${safe(job.id)}">Voir l'offre</button>
          ${whatsappUrl ? `<a class="primary" href="${safe(whatsappUrl)}" target="_blank" rel="noreferrer">Contacter</a>` : ""}
          <button type="button" class="secondary jobs-fav-btn" data-jobs-fav="${safe(job.id)}">★</button>
        </div>
      </article>
    `;
  }

  function renderFavoritesScreen() {
    const container = document.querySelector("#jobsFavoritesList");
    if (!container) return;
    const jobs = getFavorites().map(findOffer).filter(Boolean);
    container.innerHTML = jobs.length
      ? jobs.map(jobCardLite).join("")
      : `<div class="jobs-empty"><span>☆</span><strong>Aucune offre enregistrée.</strong><p>Enregistrez une offre pour la retrouver ici.</p></div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Écran Mes alertes                                                    */
  /* ------------------------------------------------------------------ */
  function renderAlertsScreen() {
    const container = document.querySelector("#jobsAlertsList");
    if (!container) return;
    const alerts = getAlerts();
    if (!alerts.length) {
      container.innerHTML = `<div class="jobs-empty"><span>🔔</span><strong>Aucune alerte créée.</strong><p>Essayez d'élargir vos critères.</p></div>`;
      return;
    }
    container.innerHTML = alerts.map((alert) => {
      const count = alertMatchCount(alert);
      const label = [alert.keyword, alert.city].filter(Boolean).join(" – ") || alert.contractType || "Toutes offres";
      return `
        <div class="jobs-alert-card">
          <div>
            <strong>${safe(label)}</strong>
            <span class="tag ${count ? "ok" : ""}">${count} offre${count > 1 ? "s" : ""} correspondante${count > 1 ? "s" : ""}</span>
          </div>
          <button type="button" class="secondary" data-jobs-remove-alert="${safe(alert.id)}">Supprimer</button>
        </div>
      `;
    }).join("");
  }

  /* ------------------------------------------------------------------ */
  /* Écran Recruteur                                                      */
  /* ------------------------------------------------------------------ */
  function renderRecruiterScreen() {
    const phoneInput = document.querySelector("#jobsRecruiterPhone");
    if (phoneInput && !phoneInput.value) phoneInput.value = getRecruiterPhone();

    const offers = recruiterOffers();
    const offerIds = offers.map((o) => o.id);
    const apps = applicationsForOffers(offerIds);

    const kpis = document.querySelector("#jobsRecruiterKpis");
    if (kpis) {
      const active = offers.filter((o) => ["published", "open", "active"].includes(o.status)).length;
      const shortlisted = apps.filter((a) => a.status === "Présélectionné").length;
      const interviews = apps.filter((a) => a.status === "Entretien").length;
      kpis.innerHTML = `
        <div class="jobs-kpi-card"><strong>${active}</strong><span>Offres actives</span></div>
        <div class="jobs-kpi-card"><strong>${apps.length}</strong><span>Candidatures</span></div>
        <div class="jobs-kpi-card"><strong>${shortlisted}</strong><span>Présélectionnés</span></div>
        <div class="jobs-kpi-card"><strong>${interviews}</strong><span>Entretiens</span></div>
      `;
    }

    const offersPanel = document.querySelector("#jobsRecruiterOffers");
    if (offersPanel) {
      offersPanel.innerHTML = offers.length ? offers.map((job) => {
        const jobApps = getApplications().filter((a) => a.jobId === job.id);
        return `
          <div class="jobs-recruiter-offer-row">
            <div>
              <strong>${safe(job.title)}</strong>
              <span class="jobs-recruiter-offer-meta">${safe(job.city)} · ${safe(job.status)} · ${jobApps.length} candidature${jobApps.length > 1 ? "s" : ""}</span>
            </div>
            <span class="tag ${job.status === "expired" ? "" : "ok"}">${safe(job.status)}</span>
          </div>
        `;
      }).join("") : `<div class="jobs-empty"><span>📋</span><strong>Aucune offre associée à ce numéro.</strong><p>Renseignez le numéro utilisé lors de la publication, ou publiez une offre.</p></div>`;
    }

    const appsPanel = document.querySelector("#jobsRecruiterApplications");
    if (appsPanel) {
      appsPanel.innerHTML = apps.length ? apps.map((app) => {
        const job = findOffer(app.jobId);
        return `
          <div class="jobs-candidate-card">
            <div class="jobs-candidate-head">
              <strong>${safe(app.candidateSnapshot?.name || "Candidat")}</strong>
              <span class="jobs-candidate-job">${safe(job?.title || "")}</span>
            </div>
            <div class="jobs-candidate-meta">
              ${app.candidateSnapshot?.metier ? `<span>${safe(app.candidateSnapshot.metier)}</span>` : ""}
              ${app.candidateSnapshot?.experienceYears ? `<span>${safe(app.candidateSnapshot.experienceYears)} ans d'expérience</span>` : ""}
              ${(app.candidateSnapshot?.skills || []).length ? `<span>${safe(app.candidateSnapshot.skills.join(" · "))}</span>` : ""}
            </div>
            <label class="jobs-form-label">Statut
              <select data-jobs-app-status="${safe(app.id)}">
                ${PIPELINE_STATUSES.map((s) => `<option ${pipelineToApplicationStatus(s) === app.status ? "selected" : ""}>${s}</option>`).join("")}
              </select>
            </label>
            <div class="jobs-candidate-actions">
              ${app.candidateSnapshot?.whatsapp ? `<a class="secondary" href="https://wa.me/${safe(String(app.candidateSnapshot.whatsapp).replace(/[^\d+]/g, "").replace(/^\+/, ""))}" target="_blank" rel="noreferrer">💬 Contacter</a>` : ""}
            </div>
            <label class="jobs-form-label">Note interne (privée)
              <textarea rows="2" maxlength="300" placeholder="Visible par vous uniquement…" data-jobs-app-note="${safe(app.id)}"></textarea>
            </label>
            ${(app.notes || []).length ? `<ul class="jobs-notes-list">${app.notes.map((n) => `<li>${safe(n.text)} <small>${safe(timeAgo(n.createdAt))}</small></li>`).join("")}</ul>` : ""}
          </div>
        `;
      }).join("") : `<div class="jobs-empty"><span>🧑‍💼</span><strong>Aucune candidature reçue pour l'instant.</strong></div>`;
    }
  }

  function pipelineToApplicationStatus(pipelineStatus) {
    const map = {
      "Nouveau": "Envoyée", "À examiner": "Vue", "Présélectionné": "Présélectionné",
      "Entretien": "Entretien", "Recruté": "Retenu", "Refusé": "Non retenu",
    };
    return map[pipelineStatus] || pipelineStatus;
  }

  /* ------------------------------------------------------------------ */
  /* Binding                                                              */
  /* ------------------------------------------------------------------ */
  let bound = false;

  function bind() {
    if (bound) return;
    bound = true;

    /* Type tabs (Emplois / Missions) */
    document.querySelector(".jobs-type-tabs")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-jobs-type]");
      if (!btn) return;
      currentTypeFilter = btn.dataset.jobsType || "";
      document.querySelectorAll(".jobs-type-tab").forEach((t) => {
        t.classList.toggle("active", t === btn);
        t.setAttribute("aria-selected", String(t === btn));
      });
      const hiddenInput = document.querySelector("#jobTypeFilter");
      if (hiddenInput) hiddenInput.value = currentTypeFilter;
      bridge.renderJobs?.();
      enhanceOffersList();
    });

    /* Recherche */
    document.querySelector("[data-jobs-search]")?.addEventListener("click", () => {
      bridge.renderJobs?.();
      enhanceOffersList();
    });

    /* Géolocalisation ("Près de moi" réutilise le bouton global existant) */
    document.querySelector("[data-jobs-locate]")?.addEventListener("click", () => {
      document.querySelector("#geoButton")?.click();
    });

    /* Compétences */
    function addSkillFromInput() {
      const input = document.querySelector("#jobsSkillInput");
      const value = input?.value.trim();
      if (!value) return;
      if (!skillsDraft.some((s) => s.toLowerCase() === value.toLowerCase())) skillsDraft.push(value);
      input.value = "";
      renderSkillsTags();
    }
    document.querySelector("[data-jobs-add-skill]")?.addEventListener("click", addSkillFromInput);
    document.querySelector("#jobsSkillInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); addSkillFromInput(); }
    });

    /* Expériences / formation : ajout */
    document.querySelector("[data-jobs-add-experience]")?.addEventListener("click", () => {
      syncDraftsFromDom();
      experiencesDraft.push({ company: "", role: "", startDate: "", endDate: "", description: "" });
      renderExperiencesList();
    });
    document.querySelector("[data-jobs-add-education]")?.addEventListener("click", () => {
      syncDraftsFromDom();
      educationDraft.push({ school: "", degree: "", field: "", year: "" });
      renderEducationList();
    });

    /* Profil : soumission */
    document.querySelector("#jobsProfileForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      syncDraftsFromDom();
      const f = e.currentTarget;
      const profile = getProfile();
      ["firstName", "lastName", "phone", "whatsapp", "email", "city", "commune", "district",
        "metier", "posteRecherche", "bio", "experienceYears", "educationLevel", "availability",
        "contractWanted", "salaryExpectation"].forEach((key) => {
        if (f.elements[key]) profile[key] = f.elements[key].value.trim();
      });
      profile.availableForMissions = Boolean(f.elements.availableForMissions?.checked);
      profile.skills = [...skillsDraft];
      profile.experiences = experiencesDraft.filter((x) => x.company || x.role);
      profile.education = educationDraft.filter((x) => x.school || x.degree);
      saveProfile(profile);
      renderProfileCompletion(profile);
      const status = document.querySelector("#jobsProfileStatus");
      if (status) status.textContent = "Profil enregistré avec succès.";
    });

    /* Alerte : création */
    document.querySelector("#jobsAlertForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.currentTarget;
      addAlert({
        keyword: f.elements.keyword?.value,
        city: f.elements.city?.value,
        contractType: f.elements.contractType?.value,
      });
      f.reset();
      renderAlertsScreen();
    });

    /* Recruteur : sauvegarde téléphone */
    document.querySelector("[data-jobs-recruiter-save]")?.addEventListener("click", () => {
      const phone = document.querySelector("#jobsRecruiterPhone")?.value || "";
      setRecruiterPhone(phone);
      renderRecruiterScreen();
    });

    /* Recruteur : sous-onglets */
    document.querySelector(".jobs-recruiter-tabs")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-jobs-recruiter-tab]");
      if (!btn) return;
      recruiterTab = btn.dataset.jobsRecruiterTab;
      document.querySelectorAll(".jobs-recruiter-tab").forEach((t) => {
        t.classList.toggle("active", t === btn);
        t.setAttribute("aria-selected", String(t === btn));
      });
      document.querySelectorAll(".jobs-recruiter-panel").forEach((panel) => {
        panel.hidden = panel.dataset.jobsRecruiterPanel !== recruiterTab;
      });
    });

    /* Changement de statut candidature (recruteur) */
    document.addEventListener("change", (e) => {
      const select = e.target.closest("[data-jobs-app-status]");
      if (select) {
        updateApplicationStatus(select.dataset.jobsAppStatus, pipelineToApplicationStatus(select.value));
        renderRecruiterScreen();
        return;
      }
    });

    /* Note interne (recruteur) — sauvegarde sur blur */
    document.addEventListener("blur", (e) => {
      const textarea = e.target.closest?.("[data-jobs-app-note]");
      if (!textarea || !textarea.value.trim()) return;
      addApplicationNote(textarea.dataset.jobsAppNote, textarea.value);
      textarea.value = "";
      renderRecruiterScreen();
    }, true);

    /* Délégation globale de clics */
    document.addEventListener("click", (e) => {
      const goto = e.target.closest("[data-jobs-goto]");
      if (goto) {
        bridge.setView?.("jobs");
        showScreen(goto.dataset.jobsGoto);
        return;
      }

      const open = e.target.closest("[data-jobs-open]");
      if (open) {
        openDetail(open.dataset.jobsOpen);
        return;
      }

      const apply = e.target.closest("[data-jobs-apply]");
      if (apply && !apply.disabled) {
        const jobId = apply.dataset.jobsApply;
        const profile = getProfile();
        if (!hasProfile(profile)) {
          bridge.setView?.("jobs");
          showScreen("profile");
          const status = document.querySelector("#jobsProfileStatus");
          if (status) status.textContent = "Complétez au moins votre prénom et téléphone pour postuler.";
          return;
        }
        const app = addApplication(jobId);
        if (app) {
          apply.textContent = "Candidature envoyée ✓";
          apply.disabled = true;
          const status = document.querySelector("#jobsApplyStatus");
          if (status) status.textContent = "Votre candidature a été envoyée avec succès.";
          enhanceOffersList();
        }
        return;
      }

      const fav = e.target.closest("[data-jobs-fav]");
      if (fav) {
        const jobId = fav.dataset.jobsFav;
        const nowFav = toggleFavorite(jobId);
        const isDetailButton = Boolean(fav.closest(".jobs-detail-cta-row"));
        fav.textContent = isDetailButton
          ? (nowFav ? "★ Enregistrée" : "☆ Enregistrer")
          : (nowFav ? "★" : "☆");
        if (currentScreen === "favorites") renderFavoritesScreen();
        return;
      }

      const removeSkill = e.target.closest("[data-jobs-remove-skill]");
      if (removeSkill) {
        skillsDraft.splice(Number(removeSkill.dataset.jobsRemoveSkill), 1);
        renderSkillsTags();
        return;
      }

      const removeExp = e.target.closest("[data-jobs-remove-experience]");
      if (removeExp) {
        syncDraftsFromDom();
        experiencesDraft.splice(Number(removeExp.dataset.jobsRemoveExperience), 1);
        renderExperiencesList();
        return;
      }

      const removeEdu = e.target.closest("[data-jobs-remove-education]");
      if (removeEdu) {
        syncDraftsFromDom();
        educationDraft.splice(Number(removeEdu.dataset.jobsRemoveEducation), 1);
        renderEducationList();
        return;
      }

      const removeAlertBtn = e.target.closest("[data-jobs-remove-alert]");
      if (removeAlertBtn) {
        removeAlert(removeAlertBtn.dataset.jobsRemoveAlert);
        renderAlertsScreen();
        return;
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* API publique                                                         */
  /* ------------------------------------------------------------------ */
  function render() {
    if (currentScreen === "home") { bridge.renderJobs?.(); enhanceOffersList(); }
    else showScreen(currentScreen);
  }

  function open() {
    bridge.setView?.("jobs");
    showScreen("home");
  }

  function init(nextBridge = {}) {
    bridge = { ...bridge, ...nextBridge };
    bind();
    showScreen("home");
  }

  globalThis.ZeydsJobs = Object.freeze({ init, open, render, openDetail });
})();
