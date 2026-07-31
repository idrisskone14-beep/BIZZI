(function () {
  "use strict";

  const PROJECTS_KEY = "bizzi-life-projects-v1";
  const PREFERENCES_KEY = "bizzi-life-preferences-v1";
  const ACTIVE_KEY = "bizzi-life-active-v1";
  const MAX_PROJECTS = 20;
  const AREAS = [
    "Cocody", "Yopougon", "Marcory", "Plateau", "Treichville", "Adjamé", "Abobo",
    "Koumassi", "Port-Bouët", "Bingerville", "Anyama", "Riviera", "Angré",
    "Deux-Plateaux", "Zone 4", "Attoban", "Palmeraie", "Vridi", "Bouaké",
    "Grand-Bassam", "San-Pédro", "Man",
  ];
  const DEFAULT_PREFERENCES = {
    budgetTier: "standard",
    preferredArea: "",
    priority: "balanced",
    payment: "mobile-money",
    verifiedOnly: true,
  };
  const STRATEGIES = [
    {
      id: "economy",
      title: "Meilleur rapport qualité-prix",
      description: "Des profils bien notés avec des tarifs accessibles.",
    },
    {
      id: "standard",
      title: "Choix recommandé par Zeyds",
      description: "Disponibilité, proximité, vérification et qualité équilibrées.",
    },
    {
      id: "premium",
      title: "Option Premium",
      description: "Des profils haut de gamme pour un niveau de service supérieur.",
    },
  ];

  const TEMPLATES = [
    ...(globalThis.BizziLifeEventTemplates || []),
    {
      id: "afterwork",
      icon: "🥂",
      title: "Organiser un afterwork",
      keywords: ["afterwork", "after work", "cocktail professionnel", "cocktail d entreprise"],
      services: [
        ["Agence événementielle / organisateur événements", "Concevoir et coordonner l’afterwork"],
        ["Location de salle", "Trouver un cadre adapté"],
        ["Traiteur / Cuisinier à domicile", "Prévoir les bouchées et boissons"],
        ["Barman / Barmaid", "Assurer le service des boissons"],
        ["DJ / Animateur", "Créer l’ambiance"],
        ["Location sonorisation / lumière", "Équiper le lieu"],
        ["Photographe", "Couvrir les temps forts"],
      ],
      tasks: ["Définir le format, la date et les invités", "Choisir le lieu et l’agence événementielle", "Valider restauration et animation", "Confirmer les prestataires", "Vérifier le déroulé"],
    },
    {
      id: "fashion-show",
      icon: "✦",
      title: "Organiser un défilé de mode",
      keywords: ["defile de mode", "fashion show", "presentation de collection", "lancement de collection"],
      services: [
        ["Agence événementielle / organisateur événements", "Produire et coordonner le défilé"],
        ["Location de salle", "Trouver le lieu et l’espace podium"],
        ["Décorateur événementiel", "Concevoir la scénographie"],
        ["Couturier / Retoucheur", "Préparer les tenues et retouches"],
        ["Maquilleuse / Maquilleur", "Organiser le maquillage des modèles"],
        ["Tresse / Coiffure", "Organiser la coiffure des modèles"],
        ["Location sonorisation / lumière", "Installer son, lumière et podium"],
        ["Photographe", "Produire les images du défilé"],
        ["Vidéaste", "Filmer le show et les coulisses"],
      ],
      tasks: ["Cadrer le concept, la date et le budget", "Sélectionner l’agence et le lieu", "Préparer casting, tenues et scénographie", "Coordonner la technique et les répétitions", "Valider le conducteur final"],
    },
    {
      id: "wedding",
      icon: "💍",
      title: "Organiser un mariage",
      keywords: ["mariage", "marier", "wedding"],
      services: [
        ["Agence événementielle / organisateur événements", "Coordonner l’ensemble du projet"],
        ["Location de salle", "Trouver un lieu adapté aux invités"],
        ["Traiteur / Cuisinier à domicile", "Préparer le repas et le service"],
        ["Décorateur événementiel", "Créer l’ambiance et la scénographie"],
        ["Photographe", "Conserver les moments importants"],
        ["Vidéaste", "Réaliser le film de l’événement"],
        ["DJ / Animateur", "Animer la réception"],
        ["Maquilleuse / Maquilleur", "Préparer la mise en beauté"],
        ["Tresse / Coiffure", "Organiser la coiffure"],
        ["Fleuriste", "Composer la décoration florale"],
        ["Chauffeur", "Gérer les déplacements"],
        ["Gardiennage", "Sécuriser le lieu si nécessaire"],
      ],
      tasks: ["Cadrer la date, le lieu et le budget", "Demander les premiers devis", "Comparer et sélectionner les prestataires", "Confirmer le planning", "Valider les derniers détails"],
    },
    {
      id: "birthday",
      icon: "🎉",
      title: "Organiser un anniversaire",
      keywords: ["anniversaire", "birthday", "fete d anniversaire"],
      services: [
        ["Agence événementielle / organisateur événements", "Coordonner la préparation"],
        ["Traiteur / Cuisinier à domicile", "Prévoir le repas"],
        ["Pâtissier", "Préparer le gâteau"],
        ["Décorateur événementiel", "Décorer le lieu"],
        ["DJ / Animateur", "Créer l’ambiance"],
        ["Photographe", "Couvrir l’événement"],
        ["Location d'articles d'événements", "Prévoir tables, chaises et matériel"],
        ["Serveur / Serveuse", "Assurer le service"],
        ["Zeyds Livraison", "Acheminer les commandes"],
      ],
      tasks: ["Définir la date, le nombre d’invités et le budget", "Choisir le lieu", "Demander les devis prioritaires", "Confirmer les prestataires", "Vérifier le déroulé la veille"],
    },
    {
      id: "moving",
      icon: "📦",
      title: "Organiser un déménagement",
      keywords: ["demenagement", "demenage", "demenager"],
      services: [
        ["Déménageur", "Piloter le déménagement"],
        ["Transport de marchandises", "Prévoir le camion adapté"],
        ["Manutentionnaire", "Charger et décharger les meubles"],
        ["Nettoyage maison / bureau", "Nettoyer le départ et l’arrivée"],
        ["Monteur de meubles", "Démonter et remonter le mobilier"],
        ["Electricien", "Vérifier la nouvelle installation"],
        ["Plombier", "Contrôler les arrivées d’eau"],
        ["Garde-meubles", "Stocker temporairement si nécessaire"],
      ],
      tasks: ["Confirmer les deux adresses et la date", "Lister le volume à transporter", "Comparer les devis de transport", "Confirmer l’équipe et le nettoyage", "Contrôler l’installation à l’arrivée"],
    },
    {
      id: "breakdown",
      icon: "🛠",
      title: "Gérer une panne de véhicule",
      keywords: ["voiture en panne", "vehicule en panne", "panne de voiture", "panne voiture", "panne"],
      services: [
        ["Mécanicien", "Réaliser un diagnostic sur place"],
        ["Remorquage / Dépannage auto", "Déplacer le véhicule si nécessaire"],
        ["Vulcanisateur / Pneus", "Intervenir en cas de problème de pneu"],
        ["Garage automobile", "Effectuer une réparation en atelier"],
        ["Zeyds Livraison", "Acheminer une pièce urgente"],
        ["Chauffeur", "Prévoir un transport alternatif"],
      ],
      tasks: ["Partager la position du véhicule", "Décrire les symptômes", "Choisir l’intervention adaptée", "Confirmer le devis", "Valider la réparation"],
    },
    {
      id: "nanny",
      icon: "🧸",
      title: "Trouver une nounou",
      keywords: ["nounou", "baby sitter", "babysitter", "garde d enfant"],
      services: [
        ["Nounou", "Trouver un profil disponible et adapté"],
        ["Agence de placement", "Obtenir une sélection accompagnée"],
        ["Chauffeur", "Prévoir un déplacement sûr si nécessaire"],
      ],
      tasks: ["Préciser les horaires et l’âge de l’enfant", "Consulter les profils vérifiés", "Échanger avec les candidates", "Confirmer la disponibilité", "Partager les consignes utiles"],
    },
    {
      id: "renovation",
      icon: "🏠",
      title: "Rénover un appartement",
      keywords: ["renover", "renovation", "travaux appartement", "refaire mon appartement"],
      services: [
        ["Architecte / décorateur professionnel", "Concevoir et chiffrer le projet"],
        ["Peintre", "Rafraîchir murs et plafonds"],
        ["Electricien", "Mettre l’installation aux normes"],
        ["Plombier", "Rénover les points d’eau"],
        ["Menuisier", "Réaliser ou réparer les éléments bois"],
        ["Carreleur", "Poser les revêtements"],
        ["Décorateur", "Finaliser l’aménagement"],
        ["Nettoyage maison / bureau", "Livrer un espace propre"],
        ["Zeyds Livraison", "Acheminer les matériaux"],
      ],
      tasks: ["Faire le diagnostic", "Demander et comparer les devis", "Sélectionner les prestataires", "Planifier les travaux", "Suivre l’avancement", "Effectuer la validation finale"],
    },
    {
      id: "airport",
      icon: "✈️",
      title: "Organiser un trajet aéroport",
      keywords: ["aeroport", "vol", "avion"],
      services: [
        ["Chauffeur", "Réserver un trajet ponctuel"],
        ["Location de véhicules", "Choisir un véhicule adapté"],
        ["Zeyds Livraison", "Acheminer des bagages si nécessaire"],
      ],
      tasks: ["Renseigner l’aéroport et l’adresse de départ", "Préciser l’heure du vol et les bagages", "Choisir le véhicule", "Confirmer l’heure de départ", "Activer le rappel"],
    },
  ];

  let bridge = {};
  let bound = false;

  function normalize(value = "") {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function safe(value = "") {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readJson(key, fallback) {
    try {
      const raw = globalThis.BizziStorage?.localGet?.(key) ?? globalThis.localStorage?.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    const raw = JSON.stringify(value);
    try {
      if (globalThis.BizziStorage?.localSet) globalThis.BizziStorage.localSet(key, raw);
      else globalThis.localStorage?.setItem(key, raw);
      return true;
    } catch {
      return false;
    }
  }

  function projects() {
    const value = readJson(PROJECTS_KEY, []);
    return Array.isArray(value) ? value.filter((item) => item?.id && item?.goal).slice(0, MAX_PROJECTS) : [];
  }

  function preferences() {
    return { ...DEFAULT_PREFERENCES, ...(readJson(PREFERENCES_KEY, {}) || {}) };
  }

  function activeId() {
    try {
      return globalThis.BizziStorage?.localGet?.(ACTIVE_KEY) ?? globalThis.localStorage?.getItem(ACTIVE_KEY) ?? "";
    } catch {
      return "";
    }
  }

  function setActiveId(id) {
    try {
      if (globalThis.BizziStorage?.localSet) globalThis.BizziStorage.localSet(ACTIVE_KEY, id);
      else globalThis.localStorage?.setItem(ACTIVE_KEY, id);
    } catch {
      return;
    }
  }

  function formatMoney(value) {
    const amount = Number(value || 0);
    return amount > 0 ? `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA` : "Budget à préciser";
  }

  function formatDate(value) {
    if (!value) return "Date à préciser";
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return "Date à préciser";
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  function isoDate(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function nextSaturday() {
    const date = new Date();
    const distance = (6 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + distance);
    return isoDate(date);
  }

  function inferredDate(goal = "") {
    const text = normalize(goal);
    const date = new Date();
    if (/\b(demain|demain matin|demain soir)\b/.test(text)) {
      date.setDate(date.getDate() + 1);
      return isoDate(date);
    }
    if (/\b(ce soir|aujourd hui)\b/.test(text)) return isoDate(date);
    if (/\bsamedi prochain\b/.test(text)) return nextSaturday();
    return "";
  }

  function inferredArea(goal = "") {
    const text = normalize(goal);
    return AREAS.find((area) => text.includes(normalize(area))) || "";
  }

  function matchingTemplate(goal = "") {
    const text = normalize(goal);
    return TEMPLATES.find((template) => template.keywords.some((keyword) => text.includes(normalize(keyword))));
  }

  function genericTemplate(goal = "") {
    const inferred = bridge.inferService?.(goal) || "";
    const service = inferred && !/service/i.test(inferred) ? inferred : "";
    return {
      id: "custom",
      icon: "✦",
      title: "Organiser mon projet",
      services: service ? [[service, "Répondre au besoin principal"]] : [],
      tasks: ["Préciser le besoin, la date et le budget", "Identifier les services nécessaires", "Demander les devis", "Sélectionner les prestataires", "Suivre la réalisation"],
    };
  }

  function analyze(goal = "", options = {}) {
    const cleanGoal = String(goal || "").trim();
    const prefs = preferences();
    const template = matchingTemplate(cleanGoal) || genericTemplate(cleanGoal);
    const targetDate = options.targetDate || inferredDate(cleanGoal);
    const strategy = options.budgetTier || prefs.budgetTier || "standard";
    const area = inferredArea(cleanGoal) || prefs.preferredArea || "";
    return {
      template,
      targetDate,
      area,
      budget: Number(options.budget || 0),
      strategy,
      services: template.services.map(([name, reason], index) => ({
        id: `${template.id}-service-${index}`,
        name,
        reason,
        status: "pending",
      })),
      tasks: template.tasks.map((label, index) => ({
        id: `${template.id}-task-${index}`,
        label,
        done: false,
      })),
    };
  }

  function createProject(goal = "", options = {}) {
    const cleanGoal = String(goal || "").trim();
    if (!cleanGoal) return null;
    const all = projects();
    const duplicate = all.find((project) => normalize(project.goal) === normalize(cleanGoal));
    if (duplicate) {
      const refreshed = analyze(cleanGoal, options);
      const completedTasks = new Set((duplicate.tasks || []).filter((task) => task.done).map((task) => normalize(task.label)));
      duplicate.type = refreshed.template.id;
      duplicate.icon = refreshed.template.icon;
      duplicate.title = refreshed.template.title;
      duplicate.area = refreshed.area || duplicate.area;
      duplicate.services = refreshed.services;
      duplicate.tasks = refreshed.tasks.map((task) => ({ ...task, done: completedTasks.has(normalize(task.label)) }));
      duplicate.targetDate = options.targetDate || duplicate.targetDate || inferredDate(cleanGoal);
      duplicate.budget = Number(options.budget || duplicate.budget || 0);
      duplicate.strategy = options.budgetTier || duplicate.strategy || "standard";
      duplicate.updatedAt = new Date().toISOString();
      writeJson(PROJECTS_KEY, all);
      setActiveId(duplicate.id);
      return duplicate;
    }
    const result = analyze(cleanGoal, options);
    const now = new Date().toISOString();
    const project = {
      id: `life-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: result.template.id,
      icon: result.template.icon,
      title: result.template.title,
      goal: cleanGoal,
      targetDate: result.targetDate,
      area: result.area,
      budget: result.budget,
      spent: 0,
      strategy: result.strategy,
      services: result.services,
      tasks: result.tasks,
      createdAt: now,
      updatedAt: now,
    };
    writeJson(PROJECTS_KEY, [project, ...all].slice(0, MAX_PROJECTS));
    setActiveId(project.id);
    return project;
  }

  function updateProject(project) {
    const all = projects();
    const index = all.findIndex((item) => item.id === project.id);
    if (index < 0) return;
    all[index] = { ...project, updatedAt: new Date().toISOString() };
    writeJson(PROJECTS_KEY, all);
  }

  function activeProject() {
    const all = projects();
    return all.find((project) => project.id === activeId()) || all[0] || null;
  }

  function progress(project) {
    const tasks = project?.tasks || [];
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((task) => task.done).length / tasks.length) * 100);
  }

  function daysUntil(value) {
    if (!value) return null;
    const target = new Date(`${value}T23:59:59`);
    if (Number.isNaN(target.getTime())) return null;
    return Math.ceil((target.getTime() - Date.now()) / 86400000);
  }

  function renderProactive() {
    const panel = document.querySelector("#lifeProactivePanel");
    if (!panel) return;
    const reminders = projects().flatMap((project) => {
      const days = daysUntil(project.targetDate);
      const remaining = (project.tasks || []).filter((task) => !task.done).length;
      if (days === null || days < 0 || days > 7 || !remaining) return [];
      let message = `Votre projet est dans ${days === 0 ? "moins d’un jour" : `${days} jour${days > 1 ? "s" : ""}`}. Il reste ${remaining} étape${remaining > 1 ? "s" : ""}.`;
      if (project.type === "airport" && days <= 1) message = "Votre départ approche. Confirmez le chauffeur, l’heure de prise en charge et les bagages.";
      if (project.type === "moving" && days <= 1) message = "Votre déménagement est imminent. Confirmez le camion, la manutention et le nettoyage.";
      return [{ project, message }];
    }).slice(0, 3);
    if (!reminders.length) {
      panel.innerHTML = `<div><span>Assistant proactif</span><strong>Vos prochains rappels apparaîtront ici.</strong></div><p>Ajoutez une date à un projet pour que Zeyds vous accompagne au bon moment.</p>`;
      return;
    }
    panel.innerHTML = `<div class="life-proactive-title"><span>À ne pas oublier</span><strong>Zeyds veille sur vos projets.</strong></div><div class="life-proactive-items">${reminders.map(({ project, message }) => `
      <button type="button" data-life-open="${safe(project.id)}"><span>${safe(project.icon || "✦")}</span><span><strong>${safe(project.title)}</strong><small>${safe(message)}</small></span><b>→</b></button>
    `).join("")}</div>`;
  }

  function renderSummary(project) {
    const container = document.querySelector("#lifeProjectSummary");
    if (!container) return;
    const completed = (project.tasks || []).filter((task) => task.done).length;
    const points = completed * 10;
    container.innerHTML = `
      <article class="life-project-summary">
        <div class="life-project-symbol">${safe(project.icon || "✦")}</div>
        <div class="life-project-copy">
          <span>Projet Zeyds Life</span>
          <h3>${safe(project.title)}</h3>
          <p>« ${safe(project.goal)} »</p>
          <div class="life-project-meta">
            <span>${safe(formatDate(project.targetDate))}</span>
            <span>${safe(project.area || "Zone à préciser")}</span>
            <span>${safe(formatMoney(project.budget))}</span>
            <span>${points} point${points > 1 ? "s" : ""} pilote</span>
          </div>
        </div>
        <div class="life-project-progress" style="--life-progress:${progress(project)}%"><strong>${progress(project)} %</strong><span>réalisé</span></div>
      </article>`;
  }

  function renderServices(project) {
    const container = document.querySelector("#lifeServices");
    const count = document.querySelector("#lifeServiceCount");
    if (!container) return;
    if (count) count.textContent = String(project.services?.length || 0);
    container.innerHTML = (project.services || []).map((service, index) => `
      <article class="life-service">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <div><strong>${safe(service.name)}</strong><small>${safe(service.reason)}</small></div>
        <button type="button" data-life-service="${safe(service.id)}" aria-label="Trouver ${safe(service.name)}">Trouver</button>
      </article>
    `).join("");
  }

  function renderTasks(project) {
    const container = document.querySelector("#lifeTasks");
    const value = document.querySelector("#lifeProgressValue");
    if (!container) return;
    if (value) value.textContent = `${progress(project)} %`;
    container.innerHTML = (project.tasks || []).map((task, index) => `
      <label class="life-task${task.done ? " is-done" : ""}">
        <input type="checkbox" data-life-task="${safe(task.id)}"${task.done ? " checked" : ""}>
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${safe(task.label)}</strong>
      </label>
    `).join("");
  }

  function renderStrategies(project) {
    const container = document.querySelector("#lifeStrategies");
    if (!container) return;
    container.innerHTML = STRATEGIES.map((strategy) => `
      <button class="life-strategy${project.strategy === strategy.id ? " selected" : ""}" type="button" data-life-strategy="${strategy.id}" aria-pressed="${project.strategy === strategy.id}">
        <span>${strategy.id === "economy" ? "€" : strategy.id === "premium" ? "✦" : "✓"}</span>
        <strong>${safe(strategy.title)}</strong>
        <small>${safe(strategy.description)}</small>
      </button>
    `).join("");
  }

  function renderProjects() {
    const container = document.querySelector("#lifeProjects");
    if (!container) return;
    const all = projects();
    if (!all.length) {
      container.innerHTML = `<div class="life-empty"><span>✦</span><strong>Aucun projet pour le moment.</strong><p>Décrivez un objectif : Zeyds construira les étapes et les services utiles.</p></div>`;
      return;
    }
    container.innerHTML = all.map((project) => `
      <button class="life-project-row${project.id === activeId() ? " active" : ""}" type="button" data-life-open="${safe(project.id)}">
        <span>${safe(project.icon || "✦")}</span>
        <span><strong>${safe(project.title)}</strong><small>${safe(formatDate(project.targetDate))} · ${progress(project)} % réalisé</small></span>
        <b>→</b>
      </button>
    `).join("");
  }

  function populatePreferences() {
    const form = document.querySelector("#lifePreferencesForm");
    if (!form) return;
    const prefs = preferences();
    if (form.elements.preferredArea) form.elements.preferredArea.value = prefs.preferredArea || "";
    if (form.elements.priority) form.elements.priority.value = prefs.priority || "balanced";
    if (form.elements.payment) form.elements.payment.value = prefs.payment || "mobile-money";
    if (form.elements.verifiedOnly) form.elements.verifiedOnly.checked = prefs.verifiedOnly !== false;
    const budgetTier = document.querySelector("#lifeBudgetTier");
    if (budgetTier && !budgetTier.dataset.edited) budgetTier.value = prefs.budgetTier || "standard";
  }

  function showReturnBar(project = null, service = null) {
    const bar = document.querySelector("#lifeReturnBar");
    const label = document.querySelector("#lifeReturnLabel");
    if (!bar) return;
    bar.hidden = !project;
    if (label && project) {
      label.textContent = service
        ? `${service.name} · la checklist « ${project.title} » reste enregistrée.`
        : `La checklist « ${project.title} » reste enregistrée.`;
    }
  }

  function render(project = activeProject()) {
    showReturnBar();
    renderProjects();
    renderProactive();
    populatePreferences();
    const section = document.querySelector("#lifePlanSection");
    if (!section) return;
    if (!project) {
      section.hidden = true;
      return;
    }
    setActiveId(project.id);
    section.hidden = false;
    renderSummary(project);
    renderServices(project);
    renderTasks(project);
    renderStrategies(project);
    renderProjects();
  }

  function projectById(id) {
    return projects().find((project) => project.id === id) || null;
  }

  function findService(project, id) {
    return (project?.services || []).find((service) => service.id === id);
  }

  function handleService(serviceId) {
    const project = activeProject();
    const service = findService(project, serviceId);
    if (!project || !service) return;
    project.activeServiceId = service.id;
    project.lastOpenedService = service.name;
    updateProject(project);
    showReturnBar(project, service);
    if (service.name === "Zeyds Livraison" || (project.type === "airport" && service.name === "Chauffeur")) {
      bridge.openDelivery?.(project.goal, { projectId: project.id, serviceId: service.id });
      return;
    }
    bridge.openService?.(service.name, {
      area: project.area,
      strategy: project.strategy,
      verifiedOnly: preferences().verifiedOnly,
      exactOnly: true,
      projectId: project.id,
      serviceId: service.id,
    });
  }

  function open(goal = "", options = {}) {
    bridge.setView?.("life");
    const input = document.querySelector("#lifeGoalInput");
    if (input && goal) input.value = goal;
    if (goal && options.autoCreate) {
      const project = createProject(goal, options);
      render(project);
      globalThis.setTimeout?.(() => document.querySelector("#lifePlanSection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
      return project;
    }
    render();
    return activeProject();
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.querySelector("#lifeGoalForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const project = createProject(form.elements.goal?.value, {
        targetDate: form.elements.targetDate?.value || "",
        budget: form.elements.budget?.value || 0,
        budgetTier: form.elements.budgetTier?.value || "standard",
      });
      if (!project) return;
      render(project);
      document.querySelector("#lifePlanSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.querySelectorAll("[data-life-example]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.querySelector("#lifeGoalInput");
        if (!input) return;
        input.value = button.dataset.lifeExample || "";
        input.focus();
      });
    });
    document.querySelector("#lifeBudgetTier")?.addEventListener("change", (event) => {
      event.currentTarget.dataset.edited = "true";
    });
    document.querySelector("#lifePreferencesForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const previous = preferences();
      const next = {
        ...previous,
        preferredArea: String(form.elements.preferredArea?.value || "").trim(),
        priority: form.elements.priority?.value || "balanced",
        payment: form.elements.payment?.value || "mobile-money",
        verifiedOnly: Boolean(form.elements.verifiedOnly?.checked),
      };
      writeJson(PREFERENCES_KEY, next);
      const status = document.querySelector("#lifePreferencesStatus");
      if (status) status.textContent = "Préférences enregistrées sur cet appareil.";
    });
    document.addEventListener("click", (event) => {
      const returnButton = event.target.closest("[data-life-return]");
      if (returnButton) {
        const project = activeProject();
        bridge.setView?.("life");
        render(project);
        globalThis.setTimeout?.(() => document.querySelector("#lifePlanSection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
        return;
      }
      const lifeNavigation = event.target.closest('[data-view="life"],[data-go="life"]');
      if (lifeNavigation) {
        render(activeProject());
        return;
      }
      const opener = event.target.closest("[data-life-open]");
      if (opener) {
        const project = projectById(opener.dataset.lifeOpen);
        if (project) {
          setActiveId(project.id);
          bridge.setView?.("life");
          render(project);
          document.querySelector("#lifePlanSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }
      const serviceButton = event.target.closest("[data-life-service]");
      if (serviceButton) {
        handleService(serviceButton.dataset.lifeService);
        return;
      }
      const strategyButton = event.target.closest("[data-life-strategy]");
      if (strategyButton) {
        const project = activeProject();
        if (!project) return;
        project.strategy = strategyButton.dataset.lifeStrategy || "standard";
        updateProject(project);
        const prefs = preferences();
        prefs.budgetTier = project.strategy;
        writeJson(PREFERENCES_KEY, prefs);
        render(project);
      }
    });
    document.addEventListener("change", (event) => {
      const checkbox = event.target.closest("[data-life-task]");
      if (!checkbox) return;
      const project = activeProject();
      const task = (project?.tasks || []).find((item) => item.id === checkbox.dataset.lifeTask);
      if (!project || !task) return;
      task.done = checkbox.checked;
      updateProject(project);
      render(project);
    });
  }

  function init(nextBridge = {}) {
    bridge = { ...bridge, ...nextBridge };
    bind();
    render();
  }

  globalThis.BizziLife = Object.freeze({ init, open, analyze, render });
})();
