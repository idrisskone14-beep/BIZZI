(function () {
  const EVENT_CATS = ["Concert", "Soirée", "Spectacle", "Conférence", "Festival", "Sport", "Formation", "Culture", "Networking", "Autre événement"];

  function norm(value = "") {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function eventCategory(prompt = "") {
    const text = norm(prompt);
    return EVENT_CATS.find((category) => text.includes(norm(category))) || "Toutes les catégories";
  }

  function routeEvents(prompt = "", options = {}) {
    const queryInput = document.querySelector("#eventSearchInput");
    const categoryFilter = document.querySelector("#eventCategoryFilter");
    const cityFilter = document.querySelector("#eventCityFilter");
    const city = globalThis.inferAssistantCity?.(prompt);
    if (queryInput) queryInput.value = globalThis.BizziAssistantParser?.cleanQuery?.(prompt, "events") || "";
    if (categoryFilter) categoryFilter.value = eventCategory(prompt);
    if (cityFilter && globalThis.cityIsSpecific?.(city)) cityFilter.value = city;
    globalThis.setEventEntryMode?.("tickets");
    globalThis.renderEvents?.();
    globalThis.renderHomeDiscovery?.();
    globalThis.setView?.("events");
    globalThis.renderSearchAssistantStatus?.(`<strong>${options.voice ? "Voix reconnue" : "Recherche comprise"} : événements</strong><p>Aucun prestataire service n'est mélangé.</p>`);
  }

  function routeJobs(prompt = "") {
    const input = document.querySelector("#jobSearchInput");
    const cityFilter = document.querySelector("#jobCityFilter");
    const city = globalThis.inferAssistantCity?.(prompt);
    if (input) input.value = globalThis.BizziAssistantParser?.cleanQuery?.(prompt, "jobs") || "";
    if (cityFilter && globalThis.cityIsSpecific?.(city)) cityFilter.value = city;
    globalThis.renderJobs?.();
    globalThis.setView?.("jobs");
  }

  function routeFood(prompt = "", options = {}) {
    const input = document.querySelector("#foodSearchInput");
    const cityFilter = document.querySelector("#foodCityFilter");
    const specialtyFilter = document.querySelector("#foodSpecialtyFilter");
    const city = globalThis.inferAssistantCity?.(prompt);
    const query = globalThis.BizziAssistantParser?.cleanQuery?.(prompt, "food") || "";
    if (input) input.value = query;
    if (cityFilter && globalThis.cityIsSpecific?.(city)) cityFilter.value = city;
    if (specialtyFilter && query) {
      const match = [...specialtyFilter.options].find((option) => norm(query).includes(norm(option.value || option.textContent)));
      if (match) specialtyFilter.value = match.value || match.textContent;
    }
    globalThis.renderFood?.();
    globalThis.setView?.("food");
    globalThis.renderSearchAssistantStatus?.(`<strong>${options.voice ? "Voix reconnue" : "Recherche comprise"} : Bizzi Food</strong><p>Les résultats affichent uniquement des adresses et spécialités Food.</p>`);
  }

  function route(prompt = "", options = {}) {
    function routeExceptionPlaces() {
      globalThis.renderExceptionPlaces?.();
      globalThis.setView?.("exception-places");
      globalThis.renderSearchAssistantStatus?.(`<strong>${options.voice ? "Voix reconnue" : "Recherche comprise"} : lieux d’exception</strong><p>Bizzi affiche les sites touristiques, resorts, lodges et endroits insolites.</p>`);
      globalThis.setTimeout?.(() => document.querySelector("#exceptionPlacesList")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }
    const intent = globalThis.BizziAssistantParser?.intent?.(prompt);
    if (intent === "life") {
      globalThis.setView?.("life");
      globalThis.BizziLife?.open?.(prompt, { autoCreate: true });
      globalThis.renderSearchAssistantStatus?.(`<strong>${options.voice ? "Voix reconnue" : "Projet compris"} : Bizzi Life</strong><p>Bizzi a organisé les services et les prochaines étapes.</p>`);
      return true;
    }
    if (intent === "events") {
      routeEvents(prompt, options);
      return true;
    }
    if (intent === "food") {
      routeFood(prompt, options);
      return true;
    }
    if (intent === "jobs") {
      routeJobs(prompt);
      return true;
    }
    if (intent === "exception-places") {
      routeExceptionPlaces();
      return true;
    }
    return false;
  }

  globalThis.BizziAssistantRouter = { route };
})();
