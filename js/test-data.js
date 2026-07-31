(function () {
  "use strict";

  const PREFIX = "test-v234-";
  const DATASET_VERSION = "v262-featured-reservations";
  const EVENTS_CI_WHATSAPP = "+2250500910000";
  const FALLY_EVENT_ID = `${PREFIX}event-fally-ipupa`;
  const JOSEY_EVENT_ID = "featured-event-josey-sofitel-2026";
  const HIMRA_EVENT_ID = "featured-event-himra-ebimpe-2026";
  const LE_MUST_FOOD_ID = "featured-food-le-must-cocody-jardin";
  const LAGOUTEUSE_FOOD_ID = "featured-food-lagouteuse-marcory";
  const LE_PECHEUR_FOOD_ID = "featured-food-le-pecheur-bietry";
  const CITIES = [
    ["Abidjan", "Cocody"], ["Abidjan", "Koumassi"], ["Abidjan", "Yopougon"],
    ["Bouaké", "Air France"], ["Yamoussoukro", "Millionnaire"], ["San Pedro", "Bardot"],
  ];

  function futureIso(days, hour = 18) {
    const date = new Date(Date.now() + days * 86400000);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  }

  function provider(service, index) {
    const [city, area] = CITIES[index % CITIES.length];
    const number = String(index + 1).padStart(8, "0");
    return {
      id: `${PREFIX}provider-${index + 1}`,
      testData: true,
      fullName: `TEST BIZZI — ${service.name}`,
      initials: "TB",
      phone: `+22505${number}`,
      whatsapp: `+22505${number}`,
      service: service.name,
      services: [service.name],
      city,
      area,
      distance: "Test",
      distanceKm: 3 + (index % 12),
      rating: 4 + (index % 10) / 10,
      description: `Profil de démonstration Zeyds pour tester le métier ${service.name}. Ne pas contacter comme prestataire réel.`,
      status: "approved",
      visibility: "active",
      verificationStatus: "verified",
      verifiedAt: new Date().toISOString(),
      verificationNote: "Profil de test Zeyds.",
      termsAcceptedAt: new Date().toISOString(),
      trialEndsAt: futureIso(365),
      remoteStatus: "test",
      availableNow: true,
      acceptanceRate: 0.9,
      reviewCount: 12 + (index % 20),
    };
  }

  function food(index, specialty, area) {
    return {
      id: `${PREFIX}food-${index + 1}`,
      name: `TEST BIZZI Restaurant ${index + 1}`,
      ownerName: "Équipe test Zeyds",
      contactPhone: `+22505009000${index + 1}`,
      placeType: "Restaurant",
      mainSpecialty: specialty,
      specialties: [specialty, "Cuisine africaine"],
      city: "Abidjan",
      area,
      address: `${area}, zone de test Zeyds`,
      averageBudget: `${3000 + index * 1000} FCFA`,
      openingHours: "Test : 08:00–22:00",
      deliveryAvailable: true,
      description: "Restaurant fictif réservé aux essais fonctionnels Zeyds.",
      rating: 4.5 + index / 10,
      status: "published",
      verificationStatus: "verified",
      createdAt: new Date().toISOString(),
    };
  }

  function event(index, category, title, area) {
    return {
      id: `${PREFIX}event-${index + 1}`,
      title: `TEST BIZZI — ${title}`,
      organizerName: "Équipe test Zeyds",
      contactPhone: `+22505009100${index + 1}`,
      category,
      dateTime: futureIso(7 + index * 3),
      endDateTime: futureIso(7 + index * 3, 23),
      venue: `Espace test ${area}`,
      city: "Abidjan",
      area,
      address: `${area}, Abidjan`,
      visibilityRadiusKm: 50,
      ticketPrice: "Test gratuit",
      description: "Événement fictif réservé aux essais fonctionnels Zeyds.",
      amount: 0,
      paymentStatus: "approved",
      status: "published",
      isSponsored: index === 0,
      isPremium: index === 0,
      createdAt: new Date().toISOString(),
    };
  }

  function fallyTestEvent(previous = {}) {
    const createdAt = new Date();
    const boostStartsAt = previous.boostStartsAt || createdAt.toISOString();
    const boostEndsAt = previous.boostEndsAt || new Date(createdAt.getTime() + 30 * 86400000).toISOString();
    return {
      id: FALLY_EVENT_ID,
      testData: true,
      remoteStatus: "local_test",
      title: "TEST BIZZI — Fally Ipupa en concert live",
      organizerName: "Events CI",
      contactPhone: EVENTS_CI_WHATSAPP,
      category: "Concert",
      dateTime: "2026-12-25T20:00:00",
      endDateTime: "2026-12-26T00:30:00",
      venue: "Palais des Expositions d’Abidjan",
      city: "Abidjan",
      area: "Port-Bouët",
      address: "Palais des Expositions d’Abidjan, près de l’aéroport international",
      latitude: 5.261,
      longitude: -3.926,
      visibilityRadiusKm: 50,
      poster: "assets/fally-ipupa-concert-2026.jpg",
      posterUrl: "",
      ticketPrice: "À partir de 10 000 FCFA",
      ticketUrl: "",
      description: "Concert fictif réservé au test du parcours Premium et du boost Zeyds. Ne constitue pas une annonce officielle.",
      planId: "boost_30_days",
      planName: "Boost 1 mois",
      boostDurationDays: 30,
      boostStartsAt,
      boostEndsAt,
      amount: 3000000,
      currency: "FCFA",
      paymentMethod: "Test local",
      paymentReference: "TEST-FALLY-PREMIUM-30J",
      paymentStatus: "approved",
      isSponsored: true,
      isPremium: true,
      status: "published",
      clickCount: Number(previous.clickCount || 0),
      ticketClickCount: Number(previous.ticketClickCount || 0),
      contactClickCount: Number(previous.contactClickCount || 0),
      detailViewCount: Number(previous.detailViewCount || 0),
      submissionReference: "BZ-TEST-FALLY-2026",
      createdAt: previous.createdAt || createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
  }

  function joseyFeaturedEvent(previous = {}) {
    const createdAt = new Date();
    const boostStartsAt = previous.boostStartsAt || createdAt.toISOString();
    const boostEndsAt = previous.boostEndsAt || new Date(createdAt.getTime() + 30 * 86400000).toISOString();
    return {
      id: JOSEY_EVENT_ID,
      remoteStatus: "local_featured",
      title: "Joséy en concert live au Sofitel Abidjan",
      organizerName: "Events CI",
      contactPhone: EVENTS_CI_WHATSAPP,
      category: "Concert",
      dateTime: "2026-12-26T20:00:00",
      endDateTime: "2026-12-27T00:00:00",
      venue: "Sofitel Abidjan Hôtel Ivoire",
      city: "Abidjan",
      area: "Cocody",
      address: "Sofitel Abidjan Hôtel Ivoire, Cocody",
      latitude: 5.326,
      longitude: -4.003,
      visibilityRadiusKm: 50,
      poster: "assets/josey-live-sofitel-2026.jpg",
      posterUrl: "",
      ticketPrice: "À partir de 10 000 FCFA",
      ticketUrl: "",
      description: "Joséy en concert live à Abidjan le samedi 26 décembre 2026 à partir de 20 h.",
      planId: "boost_30_days",
      planName: "Boost 1 mois",
      boostDurationDays: 30,
      boostStartsAt,
      boostEndsAt,
      amount: 3000000,
      currency: "FCFA",
      paymentMethod: "Mise en avant Zeyds",
      paymentReference: "BIZZI-JOSEY-PREMIUM-30J",
      paymentStatus: "approved",
      isSponsored: true,
      isPremium: true,
      status: "published",
      clickCount: Number(previous.clickCount || 0),
      ticketClickCount: Number(previous.ticketClickCount || 0),
      contactClickCount: Number(previous.contactClickCount || 0),
      detailViewCount: Number(previous.detailViewCount || 0),
      submissionReference: "BZ-JOSEY-2026",
      createdAt: previous.createdAt || createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
  }

  function himraFeaturedEvent(previous = {}) {
    const createdAt = new Date();
    const boostStartsAt = previous.boostStartsAt || createdAt.toISOString();
    const boostEndsAt = previous.boostEndsAt || new Date(createdAt.getTime() + 30 * 86400000).toISOString();
    return {
      id: HIMRA_EVENT_ID,
      remoteStatus: "local_featured",
      title: "Himra en concert au Stade d’Ebimpé",
      organizerName: "Events CI",
      contactPhone: EVENTS_CI_WHATSAPP,
      category: "Concert",
      dateTime: "2026-12-26T14:00:00",
      endDateTime: "2026-12-26T20:00:00",
      venue: "Stade d’Ebimpé",
      city: "Abidjan",
      area: "Ebimpé",
      address: "Stade d’Ebimpé, Abidjan",
      latitude: 5.48,
      longitude: -4.02,
      visibilityRadiusKm: 50,
      poster: "assets/himra-stade-ebimpe-2026.jpg",
      posterUrl: "",
      ticketPrice: "À partir de 5 000 FCFA",
      ticketUrl: "",
      description: "Himra en concert au Stade d’Ebimpé le 26 décembre 2026 à partir de 14 h. Date retenue provisoirement selon les informations reçues.",
      planId: "boost_30_days",
      planName: "Boost 1 mois",
      boostDurationDays: 30,
      boostStartsAt,
      boostEndsAt,
      amount: 3000000,
      currency: "FCFA",
      paymentMethod: "Mise en avant Zeyds",
      paymentReference: "BIZZI-HIMRA-PREMIUM-30J",
      paymentStatus: "approved",
      isSponsored: true,
      isPremium: true,
      status: "published",
      clickCount: Number(previous.clickCount || 0),
      ticketClickCount: Number(previous.ticketClickCount || 0),
      contactClickCount: Number(previous.contactClickCount || 0),
      detailViewCount: Number(previous.detailViewCount || 0),
      submissionReference: "BZ-HIMRA-2026",
      createdAt: previous.createdAt || createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
  }

  function leMustFeaturedFood(previous = {}) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return {
      id: LE_MUST_FOOD_ID,
      remoteStatus: "local_featured",
      name: "Restaurant Le Must",
      ownerName: "Events CI",
      contactPhone: EVENTS_CI_WHATSAPP,
      placeType: "Restaurant",
      mainSpecialty: "Cuisine africaine et internationale",
      specialties: ["Cuisine africaine", "Cuisine internationale", "Grillades"],
      city: "Abidjan",
      area: "Cocody Jardin",
      address: "Cocody Jardin, Abidjan",
      averageBudget: "À confirmer",
      openingHours: "Horaires à confirmer",
      deliveryAvailable: false,
      description: "Le Must, une adresse de Cocody Jardin mise en avant dans les restaurants du mois.",
      photo: "assets/restaurant-le-must-cocody-jardin.jpg",
      photoUrl: "",
      rating: 4.9,
      status: "published",
      verificationStatus: "verified",
      clickCount: Number(previous.clickCount || 1),
      contactClickCount: Number(previous.contactClickCount || 0),
      monthlyClickMonth: previous.monthlyClickMonth || currentMonth,
      monthlyClickCount: Number(previous.monthlyClickCount || 1),
      createdAt: previous.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function lagouteuseFeaturedFood(previous = {}) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return {
      id: LAGOUTEUSE_FOOD_ID,
      remoteStatus: "local_featured",
      name: "Restaurant Lagouteuse",
      ownerName: "Events CI",
      contactPhone: EVENTS_CI_WHATSAPP,
      placeType: "Restaurant",
      mainSpecialty: "Cuisine africaine",
      specialties: ["Cuisine africaine", "Poisson", "Grillades"],
      city: "Abidjan",
      area: "Marcory",
      address: "Marcory, Abidjan",
      averageBudget: "À confirmer",
      openingHours: "Horaires à confirmer",
      deliveryAvailable: false,
      description: "Lagouteuse, une adresse de Marcory sélectionnée parmi les restaurants du mois.",
      photo: "assets/restaurant-lagouteuse-marcory.jpg",
      photoUrl: "",
      rating: 4.8,
      status: "published",
      verificationStatus: "verified",
      clickCount: Number(previous.clickCount || 1),
      contactClickCount: Number(previous.contactClickCount || 0),
      monthlyClickMonth: previous.monthlyClickMonth || currentMonth,
      monthlyClickCount: Number(previous.monthlyClickCount || 1),
      createdAt: previous.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function lePecheurFeaturedFood(previous = {}) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return {
      id: LE_PECHEUR_FOOD_ID,
      remoteStatus: "local_featured",
      name: "Restaurant Le Pêcheur",
      ownerName: "Events CI",
      contactPhone: EVENTS_CI_WHATSAPP,
      placeType: "Restaurant",
      mainSpecialty: "Poissons et fruits de mer",
      specialties: ["Poisson", "Fruits de mer", "Cuisine africaine"],
      city: "Abidjan",
      area: "Biétry",
      address: "Biétry, Abidjan",
      averageBudget: "À confirmer",
      openingHours: "Horaires à confirmer",
      deliveryAvailable: false,
      description: "Le Pêcheur, une adresse de Biétry sélectionnée parmi les restaurants du mois.",
      photo: "assets/restaurant-le-pecheur-bietry.jpg",
      photoUrl: "",
      rating: 4.7,
      status: "published",
      verificationStatus: "verified",
      clickCount: Number(previous.clickCount || 1),
      contactClickCount: Number(previous.contactClickCount || 0),
      monthlyClickMonth: previous.monthlyClickMonth || currentMonth,
      monthlyClickCount: Number(previous.monthlyClickCount || 1),
      createdAt: previous.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function isLegacyFeaturedEvent(event = {}) {
    const id = String(event.id || "");
    const title = String(event.title || "").toLowerCase();
    return id === FALLY_EVENT_ID
      || id === `${PREFIX}event-1`
      || title.includes("fally ipupa")
      || title.includes("concert pilote");
  }

  function ensureFeaturedEvent(state) {
    state.eventPromotions = Array.isArray(state.eventPromotions) ? state.eventPromotions : [];
    state.foodPlaces = Array.isArray(state.foodPlaces) ? state.foodPlaces : [];
    const currentFally = state.eventPromotions.find((event) => String(event.id || "") === FALLY_EVENT_ID);
    const currentJosey = state.eventPromotions.find((event) => String(event.id || "") === JOSEY_EVENT_ID);
    const currentHimra = state.eventPromotions.find((event) => String(event.id || "") === HIMRA_EVENT_ID);
    const currentLeMust = state.foodPlaces.find((place) => String(place.id || "") === LE_MUST_FOOD_ID);
    const currentLagouteuse = state.foodPlaces.find((place) => String(place.id || "") === LAGOUTEUSE_FOOD_ID);
    const currentLePecheur = state.foodPlaces.find((place) => String(place.id || "") === LE_PECHEUR_FOOD_ID);
    const ready = currentFally?.poster === "assets/fally-ipupa-concert-2026.jpg"
      && currentJosey?.poster === "assets/josey-live-sofitel-2026.jpg"
      && currentHimra?.poster === "assets/himra-stade-ebimpe-2026.jpg"
      && Number.isFinite(Number(currentJosey?.latitude)) && Number.isFinite(Number(currentJosey?.longitude))
      && Number.isFinite(Number(currentHimra?.latitude)) && Number.isFinite(Number(currentHimra?.longitude))
      && currentLeMust?.photo === "assets/restaurant-le-must-cocody-jardin.jpg"
      && currentLagouteuse?.photo === "assets/restaurant-lagouteuse-marcory.jpg"
      && currentLePecheur?.photo === "assets/restaurant-le-pecheur-bietry.jpg"
      && [currentFally, currentJosey, currentHimra].every((event) => event.status === "published"
        && event.paymentStatus === "approved" && event.isPremium === true && event.isSponsored === true
        && Number(event.boostDurationDays || 0) === 30)
      && state.testDataVersion === DATASET_VERSION;
    if (ready) return { changed: false, event: currentFally, events: [currentFally, currentJosey, currentHimra], foods: [currentLeMust, currentLagouteuse, currentLePecheur] };

    const featuredEvents = [
      fallyTestEvent(currentFally || state.eventPromotions.find(isLegacyFeaturedEvent) || {}),
      joseyFeaturedEvent(currentJosey || {}),
      himraFeaturedEvent(currentHimra || {}),
    ];
    const featuredEventIds = new Set([FALLY_EVENT_ID, JOSEY_EVENT_ID, HIMRA_EVENT_ID]);
    state.eventPromotions = [
      ...featuredEvents,
      ...state.eventPromotions.filter((event) => !featuredEventIds.has(String(event.id || "")) && !isLegacyFeaturedEvent(event)),
    ];
    const leMust = leMustFeaturedFood(currentLeMust || {});
    const lagouteuse = lagouteuseFeaturedFood(currentLagouteuse || {});
    const lePecheur = lePecheurFeaturedFood(currentLePecheur || {});
    const featuredFoodIds = new Set([LE_MUST_FOOD_ID, LAGOUTEUSE_FOOD_ID, LE_PECHEUR_FOOD_ID]);
    state.foodPlaces = [
      leMust,
      lagouteuse,
      lePecheur,
      ...state.foodPlaces.filter((place) => !featuredFoodIds.has(String(place.id || ""))
        && !["restaurant le must", "restaurant lagouteuse", "restaurant le pêcheur"].includes(String(place.name || "").toLowerCase())),
    ];
    state.testDataVersion = DATASET_VERSION;
    state.testDataInstalledAt = state.testDataInstalledAt || new Date().toISOString();
    return { changed: true, event: featuredEvents[0], events: featuredEvents, foods: [leMust, lagouteuse, lePecheur] };
  }

  function migrateStoredState() {
    try {
      if (typeof localStorage === "undefined") return;
      const stored = JSON.parse(localStorage.getItem("bizzi-state") || "{}");
      if (ensureFeaturedEvent(stored).changed) localStorage.setItem("bizzi-state", JSON.stringify(stored));
    } catch {}
  }

  function remove(state) {
    state.providers = (state.providers || []).filter((item) => !String(item.id || "").startsWith(PREFIX));
    state.foodPlaces = (state.foodPlaces || []).filter((item) => !String(item.id || "").startsWith(PREFIX));
    state.eventPromotions = (state.eventPromotions || []).filter((item) => !String(item.id || "").startsWith(PREFIX));
    state.testDataInstalledAt = "";
    state.testDataVersion = "";
  }

  function install(state, services) {
    remove(state);
    const providers = services.map(provider);
    const foods = [
      food(0, "Garba", "Yopougon"), food(1, "Cuisine africaine", "Cocody"),
      food(2, "Grillades", "Koumassi"), food(3, "Pâtisserie", "Marcory"),
    ];
    const events = [
      event(1, "Formation", "Atelier entrepreneurs", "Plateau"),
      event(2, "Sport", "Tournoi communautaire", "Yopougon"), event(3, "Festival", "Festival découverte", "Marcory"),
    ];
    state.providers.push(...providers);
    state.foodPlaces.push(...foods);
    state.eventPromotions.push(...events);
    ensureFeaturedEvent(state);
    return { providers: providers.length, foods: foods.length + 3, events: events.length + 3 };
  }

  globalThis.BizziTestData = Object.freeze({ install, remove, ensureFeaturedEvent, prefix: PREFIX, datasetVersion: DATASET_VERSION });
  migrateStoredState();
})();
