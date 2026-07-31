function isoDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function addMonthsFromNow(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function extendExpiryIso(currentEnd = "", { months = 0, days = 0, anchor = Date.now() } = {}) {
  const anchorTime = Number.isFinite(Number(anchor)) ? Number(anchor) : Date.now();
  const currentTime = new Date(currentEnd || 0).getTime();
  const date = new Date(Math.max(anchorTime, Number.isFinite(currentTime) ? currentTime : 0));
  if (Number(months) > 0) date.setMonth(date.getMonth() + Number(months));
  if (Number(days) > 0) date.setDate(date.getDate() + Number(days));
  return date.toISOString();
}

function laterIsoDate(...values) {
  return values
    .filter(Boolean)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] || "";
}

const FEATURED_BOOKING_WHATSAPP = "+2250500910000";

const JOB_OFFER_PLANS = [
  { id: "job_1_day", name: "Offre 1 jour", price: 2500, days: 1, boost: true, credits: 1 },
  { id: "job_7_days", name: "Offre 1 semaine", price: 5000, days: 7, boost: true, credits: 1 },
  { id: "job_30_days", name: "Offre 1 mois", price: 14900, days: 30, boost: true, credits: 1 },
];

const EVENT_PROMOTION_PLANS = [
  { id: "standard", name: "Promotion standard", price: 0, durationDays: 0, placement: "Publication gratuite dans la ville choisie", sponsored: false, premium: false },
  { id: "boost_1_day", name: "Boost 1 jour", price: 25000, durationDays: 1, placement: "Événement sponsorisé pendant 1 jour dans la ville ou zone choisie", sponsored: true, premium: false },
  { id: "boost_7_days", name: "Boost 1 semaine", price: 150000, durationDays: 7, placement: "Événement sponsorisé pendant 1 semaine dans la ville ou zone choisie", sponsored: true, premium: false },
  { id: "boost_30_days", name: "Boost 1 mois", price: 3000000, durationDays: 30, placement: "Événement sponsorisé pendant 1 mois dans la ville ou zone choisie", sponsored: true, premium: false },
];

const EXCEPTION_PLACE_PLANS = [
  { id: "free_30_days", name: "Inscription gratuite 1 mois", price: 0, visibilityDays: 30, boostDays: 0 },
  { id: "boost_1_day", name: "Boost 1 jour", price: 9900, visibilityDays: 30, boostDays: 1 },
  { id: "boost_7_days", name: "Boost 1 semaine", price: 24900, visibilityDays: 30, boostDays: 7 },
  { id: "boost_30_days", name: "Boost 1 mois", price: 49900, visibilityDays: 30, boostDays: 30 },
];

const EVENT_CATEGORIES = [
  "Concert",
  "Soirée",
  "Spectacle",
  "Conférence",
  "Festival",
  "Sport",
  "Formation",
  "Culture",
  "Networking",
  "Autre événement",
];

const FOOD_PLACE_TYPES = [
  "Restaurant",
  "Maquis",
  "Fast-food",
  "Vendeuse de plats",
  "Traiteur",
  "Café / pâtisserie",
  "Grillade",
];

const FOOD_SPECIALTIES = [
  "Garba",
  "Attiéké poisson",
  "Poulet braisé",
  "Alloco",
  "Placali",
  "Kedjenou",
  "Sauce graine",
  "Grillades",
  "Cuisine africaine",
  "Pizza",
  "Burger",
  "Pâtisserie",
  "Glaces",
  "Traiteur",
  "Maquis",
];

const PROVIDER_SUBSCRIPTION_PLANS = [
  { id: "plan_1m", name: "1 mois", price: 3000, months: 1 },
  { id: "plan_3m", name: "3 mois", price: 4500, months: 3 },
  { id: "plan_6m", name: "6 mois", price: 6500, months: 6 },
];

const PROVIDER_BOOST_OPTIONS = [
  { id: "none", name: "Sans boost", price: 0, days: 0 },
  { id: "boost_7", name: "Boost 1 semaine", price: 1000, days: 7 },
  { id: "boost_30", name: "Boost 1 mois", price: 2000, days: 30 },
];

const LOCAL_DELIVERY_SERVICE = "Zeyds Livraison";
const INTERNATIONAL_PARCEL_SERVICE = "Transport de colis international";
const TRANSITAIRE_SERVICE = "Transitaire";
const INTERNATIONAL_LOGISTICS_SERVICES = [INTERNATIONAL_PARCEL_SERVICE, TRANSITAIRE_SERVICE];
const DELIVERY_SERVICES = [
  LOCAL_DELIVERY_SERVICE,
  "Courses / achats à domicile",
  "Chauffeur",
  "Transport de marchandises",
  INTERNATIONAL_PARCEL_SERVICE,
  TRANSITAIRE_SERVICE,
  "Conducteur moto-taxi",
  "Livreur de gaz en bouteille",
  "Livraison médicaments",
];

const DELIVERY_COMMISSION_RATE = 0.15;
const DELIVERY_PENALTY_COMMISSION_RATE = 0.18;
const DELIVERY_PENALTY_COURSE_COUNT = 3;
const DELIVERY_GEO_DATA = globalThis.BizziCIGeo || {};
const DELIVERY_PRICING_CONFIG = DELIVERY_GEO_DATA.pricing || {};
const DELIVERY_MIN_PRICE = DELIVERY_PRICING_CONFIG.minPrice || 500;
const DELIVERY_PRICING_TABLE = DELIVERY_PRICING_CONFIG.tiers || [
  { id: "near", label: "0 à 3 km", minKm: 0, maxKm: 3, minPrice: 500, maxPrice: 1500 },
  { id: "medium", label: "3 à 7 km", minKm: 3, maxKm: 7, minPrice: 1500, maxPrice: 2500 },
  { id: "long", label: "7 à 12 km", minKm: 7, maxKm: 12, minPrice: 2500, maxPrice: 4000 },
];
const DELIVERY_EXTRA_KM_PRICE = DELIVERY_PRICING_CONFIG.extraKmPrice || 350;
const DELIVERY_LONG_DISTANCE_BASE_KM = DELIVERY_PRICING_CONFIG.longDistanceBaseKm || 12;
const DELIVERY_LONG_DISTANCE_BASE_PRICE = DELIVERY_PRICING_CONFIG.longDistanceBasePrice || 4000;
const DELIVERY_MATCH_RADIUS_KM = 5;
const DELIVERY_MAX_SURCHARGE_RATE = DELIVERY_PRICING_CONFIG.maxSurchargeRate || 0.5;
const DELIVERY_TIME_SLOTS = DELIVERY_PRICING_CONFIG.timeSlots || [
  { id: "normal", name: "Heure normale", surcharge: 0 },
  { id: "morning_peak", name: "Heure de pointe matin", surcharge: 0.2 },
  { id: "evening_peak", name: "Heure de pointe soir", surcharge: 0.2 },
  { id: "night", name: "Circulation fluide 22h-8h", surcharge: 0 },
];
const DELIVERY_WEATHER_SURCHARGE = DELIVERY_PRICING_CONFIG.weatherSurcharge || 0.15;
const DELIVERY_URGENCY_SURCHARGE = DELIVERY_PRICING_CONFIG.urgencySurcharge || 0.2;

const JOB_COMPANY_TYPES = [
  "Entreprise formelle",
  "PME / TPE",
  "Commerce",
  "Restaurant / hôtel",
  "Transport / logistique",
  "Immobilier / construction",
  "École / centre de formation",
  "ONG / association",
  "Agence de recrutement",
  "Prestataire / artisan",
  "Particulier employeur",
  "Autre organisation",
];

const NATIONAL_CITIES = [
  "Toute la Côte d'Ivoire",
  "Abidjan",
  "Abobo",
  "Adjamé",
  "Anyama",
  "Attécoubé",
  "Bingerville",
  "Cocody",
  "Koumassi",
  "Marcory",
  "Port-Bouët",
  "Treichville",
  "Yopougon",
  "Songon",
  "Bouaké",
  "Yamoussoukro",
  "San Pedro",
  "Daloa",
  "Korhogo",
  "Man",
  "Gagnoa",
  "Abengourou",
  "Divo",
  "Soubré",
  "Bondoukou",
  "Séguéla",
  "Odienné",
  "Aboisso",
  "Agboville",
  "Adzopé",
  "Bouaflé",
  "Issia",
  "Guiglo",
  "Duékoué",
  "Sassandra",
  "Grand-Bassam",
  "Dabou",
  "Tiassalé",
  "Toumodi",
  "Mankono",
  "Ferkessédougou",
  "Bouna",
  "Boundiali",
  "Katiola",
  "Dabakala",
  "Tanda",
  "Bongouanou",
  "Daoukro",
  "Lakota",
  "Oumé",
  "Sinfra",
  "Vavoua",
  "Zuénoula",
  "Touba",
  "Biankouma",
  "Danané",
  "Tabou",
  "Fresco",
  "Jacqueville",
  "Tiébissou",
  "Bocanda",
  "M'Bahiakro",
  "Autre ville / commune",
];

const DELIVERY_LOCATION_POINTS = [
  { name: "Cocody", aliases: ["cocody"], lat: 5.3599, lng: -3.9816 },
  { name: "Riviera 2", aliases: ["riviera 2", "riviera deux", "cocody riviera 2"], lat: 5.3702, lng: -3.9659 },
  { name: "Riviera 3", aliases: ["riviera 3", "riviera trois", "cocody riviera 3"], lat: 5.3678, lng: -3.9465 },
  { name: "Riviera Palmeraie", aliases: ["palmeraie", "riviera palmeraie"], lat: 5.3768, lng: -3.9257 },
  { name: "Angré", aliases: ["angre", "angré", "cocody angre"], lat: 5.3972, lng: -3.9812 },
  { name: "Deux Plateaux", aliases: ["deux plateaux", "2 plateaux", "les deux plateaux"], lat: 5.3749, lng: -3.9977 },
  { name: "Mermoz", aliases: ["mermoz", "cocody mermoz"], lat: 5.3452, lng: -3.9904 },
  { name: "Plateau", aliases: ["plateau", "le plateau"], lat: 5.3236, lng: -4.0244 },
  { name: "Adjamé", aliases: ["adjame", "adjamé"], lat: 5.3651, lng: -4.0236 },
  { name: "Abobo", aliases: ["abobo"], lat: 5.4161, lng: -4.0159 },
  { name: "Anyama", aliases: ["anyama"], lat: 5.4946, lng: -4.0518 },
  { name: "Bingerville", aliases: ["bingerville"], lat: 5.3558, lng: -3.8854 },
  { name: "Yopougon", aliases: ["yopougon", "yop"], lat: 5.3364, lng: -4.0739 },
  { name: "Niangon", aliases: ["niangon", "yopougon niangon"], lat: 5.3277, lng: -4.1027 },
  { name: "Songon", aliases: ["songon"], lat: 5.3219, lng: -4.2586 },
  { name: "Marcory", aliases: ["marcory"], lat: 5.3029, lng: -3.9875 },
  { name: "Zone 4", aliases: ["zone 4", "marcory zone 4"], lat: 5.2968, lng: -3.9823 },
  { name: "Koumassi", aliases: ["koumassi"], lat: 5.3002, lng: -3.9479 },
  { name: "Treichville", aliases: ["treichville"], lat: 5.2937, lng: -4.0039 },
  { name: "Port-Bouët", aliases: ["port bouet", "port-bouet", "port-bouët"], lat: 5.2618, lng: -3.9262 },
  { name: "Vridi", aliases: ["vridi", "port bouet vridi", "port-bouet vridi"], lat: 5.2518, lng: -3.9921 },
  { name: "Grand-Bassam", aliases: ["grand bassam", "grand-bassam"], lat: 5.2118, lng: -3.7388 },
  { name: "Dabou", aliases: ["dabou"], lat: 5.3256, lng: -4.3769 },
  { name: "Bouaké", aliases: ["bouake", "bouaké"], lat: 7.6906, lng: -5.0301 },
  { name: "Yamoussoukro", aliases: ["yamoussoukro", "yakro"], lat: 6.8276, lng: -5.2893 },
  { name: "San Pedro", aliases: ["san pedro", "san-pedro"], lat: 4.7485, lng: -6.6363 },
  { name: "Daloa", aliases: ["daloa"], lat: 6.8774, lng: -6.4502 },
  { name: "Korhogo", aliases: ["korhogo"], lat: 9.4580, lng: -5.6296 },
  { name: "Man", aliases: ["man"], lat: 7.4125, lng: -7.5538 },
];

const seed = {
  selectedService: "Plombier",
  selectedCategory: "Maison & Travaux",
  selectedRadius: 10,
  selectedVerifiedOnly: false,
  selectedCity: "Toute la Côte d'Ivoire",
  userLocation: null,
  remote: {
    lastSupabaseSyncAt: null,
    lastSupabaseStatus: "",
    lastSupabaseWriteAt: null,
    lastSupabaseWriteStatus: "",
  },
  selectedPlan: { name: "1 mois", price: 3000 },
  selectedBoost: "none",
  selectedPayment: "Wave",
  selectedPaymentProviderId: "",
  identifiedProviderId: "",
  providerEntryMode: "new",
  recentProviderSignups: [],
  selectedJobEntryMode: "search",
  selectedJobPlanId: "job_1_day",
  selectedJobPayment: "Wave",
  selectedEventPlanId: "standard",
  selectedEventPayment: "Wave",
  selectedEventId: "",
  selectedEventEntryMode: "tickets",
  selectedFoodCity: "Abidjan",
  selectedFoodSpecialty: "Toutes les spécialités",
  selectedExceptionPlanId: "free_30_days",
  selectedExceptionPayment: "Wave",
  clientName: "",
  clientPhone: "",
  selectedDeliveryPayment: "Wave",
  selectedDeliveryEntryMode: "request",
  deliveryAlertsEnabled: false,
  deliveryAlertsEnabledAt: "",
  deliveryLiveEnabled: false,
  deliveryLiveEnabledAt: "",
  deliveryLiveProviderId: "",
  deliveryLiveLastStatus: "",
  notifiedDeliveryRequestIds: [],
  categories: [
    {
      name: "Maison & Travaux",
      services: ["Déménageur", "Electricien", "Peintre", "Plombier", "Vidangeur", "Ramassage d'ordures", "Soudeur / Métallier", "Menuisier", "Frigoriste / Climatisation", "Serrurier", "Maçon", "Carreleur", "Couvreur / Étanchéité", "Vitrier / Aluminium", "Jardinier / Paysagiste", "Nettoyage maison / bureau", "Nettoyage canapé / tapis / matelas", "Désinsectisation / Dératisation", "Technicien électroménager", "Installateur solaire / groupe électrogène", "Antenniste / TV satellite", "Architecte / décorateur professionnel"],
    },
    {
      name: "Services à la personne",
      services: ["Aide à domicile", "Nounou", "Gardiennage", "Détective privé(e)", "Coach sportif", "Masseur / Masseuse", "Esthéticienne", "Maquilleuse / Maquilleur", "Tresse / Coiffure", "Couturier / Retoucheur", "Conciergerie", "Pressing / Blanchisserie", "Courses / achats à domicile", "Aide ménage / agence de placement", "Tatouage"],
    },
    {
      name: "Transports & Logistique",
      services: ["Zeyds Livraison", "Chauffeur", "Livreur de gaz en bouteille", "Location de véhicules", "Mécanicien", "Remorquage / Dépannage auto", "Dépannage moto", "Vulcanisateur / Pneus", "Carrossier / Peintre auto", "Lavage auto / moto", "Transport de marchandises", "Transport de colis international", "Transitaire", "Conducteur moto-taxi"],
    },
    {
      name: "Education & Formation",
      services: ["Cours à domicile", "Formateur / Coach", "Secrétaire virtuelle / Assistante administrative", "Traducteur / Interprète", "Formation informatique"],
    },
    {
      name: "Evénementiel",
      services: ["Photographe", "Imprimeur", "Agence événementielle / organisateur événements", "Location d'articles d'événements", "DJ / Animateur", "Serveur / Serveuse", "Barman / Barmaid", "Designer d'intérieur", "Traiteur / Cuisinier à domicile", "Décorateur événementiel", "Location sonorisation / lumière", "Fleuriste"],
    },
    {
      name: "Commerce & Immobilier",
      services: ["Vendeur / Vendeuse", "Agent immobilier", "Vendeur de terrains et biens immobiliers", "Location type Airbnb", "Hôtels", "Restaurants", "Prêt financier", "Achat Or et pierre", "Aide démarches administratives", "Comptable / Fiscaliste", "Juriste / Conseil légal", "Courtier assurance", "Aide visa / voyage"],
    },
    {
      name: "Sports & Loisirs",
      services: ["Clubs de foot", "Coach tennis", "Coach Golf", "Guide touristique"],
    },
    {
      name: "Digital & Dépannage",
      services: ["Réparateur téléphone", "Réparateur ordinateur / imprimante", "Installation Wi-Fi / caméra", "Assistance informatique", "Création site web / design", "Community manager"],
    },
    {
      name: "Santé & Assistance",
      services: ["Infirmier à domicile", "Garde-malade", "Kinésithérapeute", "Sage-femme", "Ambulance privée", "Livraison médicaments"],
    },
    {
      name: "Agriculture & Rural",
      services: ["Technicien pompe / forage", "Réparateur groupe électrogène", "Tractoriste / Labour", "Ouvrier agricole", "Transport de récoltes", "Vétérinaire / soins animaux", "Technicien irrigation", "Réparateur chambre froide"],
    },
  ],
  providers: [
    {
      id: "p1",
      initials: "AD",
      fullName: "Alain Diabaté",
      phone: "+225 07 11 27 84 92",
      whatsapp: "+225 07 11 27 84 92",
      service: "Plombier",
      city: "Abidjan",
      area: "Cocody",
      distance: "2,1 km",
      distanceKm: 2.1,
      lat: 5.3599,
      lng: -3.9816,
      rating: 4.8,
      description: "Dépannage fuite, installation sanitaire, réparation robinetterie et entretien à domicile.",
      photo: "",
      social: {
        whatsapp: "+225 07 11 27 84 92",
      },
      status: "approved",
      visibility: "active",
      verificationStatus: "verified",
      verifiedAt: isoDaysFromNow(-3),
      verificationNote: "Profil vérifié par Zeyds.",
      trialEndsAt: isoDaysFromNow(18),
      subscriptionEndsAt: null,
      calls: 18,
    },
    {
      id: "p2",
      initials: "AK",
      fullName: "Aminata Koné",
      phone: "+225 05 81 70 82 13",
      whatsapp: "+225 05 81 70 82 13",
      service: "Tresse / Coiffure",
      city: "Abidjan",
      area: "Marcory",
      distance: "3,4 km",
      distanceKm: 3.4,
      lat: 5.3029,
      lng: -3.9875,
      rating: 4.9,
      description: "Coiffure, tresses, soins cheveux et prestations à domicile.",
      photo: "",
      social: {
        whatsapp: "+225 05 81 70 82 13",
      },
      status: "approved",
      visibility: "active",
      verificationStatus: "verified",
      verifiedAt: isoDaysFromNow(-5),
      verificationNote: "Profil vérifié par Zeyds.",
      trialEndsAt: isoDaysFromNow(24),
      subscriptionEndsAt: null,
      calls: 31,
    },
    {
      id: "p3",
      initials: "KS",
      fullName: "Koffi Services",
      phone: "+225 01 47 78 91 52",
      whatsapp: "+225 01 47 78 91 52",
      service: "Electricien",
      city: "Bouaké",
      area: "Belleville",
      distance: "1,8 km",
      distanceKm: 1.8,
      lat: 7.6906,
      lng: -5.0301,
      rating: 4.6,
      description: "Installation électrique, dépannage compteur et maintenance.",
      photo: "",
      social: {
        whatsapp: "+225 01 47 78 91 52",
      },
      status: "approved",
      visibility: "expired_blurred",
      verificationStatus: "none",
      verifiedAt: null,
      verificationNote: "",
      trialEndsAt: isoDaysFromNow(-6),
      subscriptionEndsAt: isoDaysFromNow(-2),
      calls: 9,
    },
    {
      id: "p4",
      initials: "YM",
      fullName: "Yao Mécano",
      phone: "+225 07 08 70 75 82",
      whatsapp: "+225 07 08 70 75 82",
      service: "Mécanicien",
      city: "Abidjan",
      area: "Yopougon",
      distance: "4,7 km",
      distanceKm: 4.7,
      lat: 5.3364,
      lng: -4.0739,
      rating: 4.7,
      description: "Diagnostic, vidange, freins, batterie et interventions rapides.",
      photo: "",
      social: {
        whatsapp: "+225 07 08 70 75 82",
      },
      status: "approved",
      visibility: "active",
      verificationStatus: "pending",
      verifiedAt: null,
      verificationNote: "Demande de vérification à contrôler.",
      trialEndsAt: isoDaysFromNow(7),
      subscriptionEndsAt: null,
      calls: 14,
    },
  ],
  payments: [],
  requests: [],
  deliveryRequests: [],
  eventPromotions: [],
  exceptionPlaces: [
    {
      id: "featured-exception-nzi-river-lodge",
      name: "N’Zi River Lodge",
      ownerName: "Équipe Zeyds",
      contactPhone: FEATURED_BOOKING_WHATSAPP,
      city: "Bouaké",
      area: "Bouaké",
      address: "Bouaké, Côte d’Ivoire",
      description: "Un lodge au cœur de la nature ivoirienne.",
      photo: "assets/lieu-nzi-river-lodge.jpg",
      planId: "free_30_days",
      planName: "Offert par Zeyds",
      amount: 0,
      paymentStatus: "approved",
      status: "published",
      adminGrant: true,
      visibilityStartsAt: new Date().toISOString(),
      visibilityEndsAt: isoDaysFromNow(30),
      createdAt: new Date().toISOString(),
    },
    {
      id: "featured-exception-mondoukou-resort",
      name: "Mondoukou Resort",
      ownerName: "Équipe Zeyds",
      contactPhone: FEATURED_BOOKING_WHATSAPP,
      city: "Grand-Bassam",
      area: "Mondoukou",
      address: "Mondoukou, Grand-Bassam",
      description: "Une parenthèse balnéaire entre piscine, plage et cocotiers.",
      photo: "assets/lieu-mondoukou-resort.jpg",
      planId: "free_30_days",
      planName: "Offert par Zeyds",
      amount: 0,
      paymentStatus: "approved",
      status: "published",
      adminGrant: true,
      visibilityStartsAt: new Date().toISOString(),
      visibilityEndsAt: isoDaysFromNow(30),
      createdAt: new Date().toISOString(),
    },
    {
      id: "featured-exception-boulay-beach-resort",
      name: "Le Boulay Beach Resort",
      ownerName: "Équipe Zeyds",
      contactPhone: FEATURED_BOOKING_WHATSAPP,
      city: "Abidjan",
      area: "Île Boulay",
      address: "Île Boulay, Abidjan",
      description: "Un lieu de détente remarquable aux portes d’Abidjan.",
      photo: "assets/lieu-boulay-beach-resort.jpg",
      planId: "free_30_days",
      planName: "Offert par Zeyds",
      amount: 0,
      paymentStatus: "approved",
      status: "published",
      adminGrant: true,
      visibilityStartsAt: new Date().toISOString(),
      visibilityEndsAt: isoDaysFromNow(30),
      createdAt: new Date().toISOString(),
    },
  ],
  foodPlaces: [
    {
      id: "featured-food-le-must-cocody-jardin",
      remoteStatus: "local_featured",
      name: "Restaurant Le Must",
      ownerName: "Events CI",
      contactPhone: FEATURED_BOOKING_WHATSAPP,
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
      rating: 4.9,
      status: "published",
      verificationStatus: "verified",
      clickCount: 1,
      monthlyClickMonth: new Date().toISOString().slice(0, 7),
      monthlyClickCount: 1,
      createdAt: isoDaysFromNow(-1),
    },
    {
      id: "featured-food-lagouteuse-marcory",
      remoteStatus: "local_featured",
      name: "Restaurant Lagouteuse",
      ownerName: "Events CI",
      contactPhone: FEATURED_BOOKING_WHATSAPP,
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
      rating: 4.8,
      status: "published",
      verificationStatus: "verified",
      clickCount: 1,
      monthlyClickMonth: new Date().toISOString().slice(0, 7),
      monthlyClickCount: 1,
      createdAt: isoDaysFromNow(-1),
    },
    {
      id: "featured-food-le-pecheur-bietry",
      remoteStatus: "local_featured",
      name: "Restaurant Le Pêcheur",
      ownerName: "Events CI",
      contactPhone: FEATURED_BOOKING_WHATSAPP,
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
      rating: 4.7,
      status: "published",
      verificationStatus: "verified",
      clickCount: 1,
      monthlyClickMonth: new Date().toISOString().slice(0, 7),
      monthlyClickCount: 1,
      createdAt: isoDaysFromNow(-1),
    },
    {
      id: "food1",
      name: "Maquis Le Bon Garba",
      ownerName: "Awa Traoré",
      contactPhone: "+225 07 44 10 20 30",
      placeType: "Maquis",
      mainSpecialty: "Garba",
      specialties: ["Garba", "Attiéké poisson", "Alloco"],
      city: "Abidjan",
      area: "Yopougon",
      address: "Yopougon Niangon, près du carrefour",
      averageBudget: "1 000 - 3 000 FCFA",
      openingHours: "10h - 22h",
      deliveryAvailable: true,
      description: "Garba frais, attiéké bien assaisonné et service rapide le midi.",
      rating: 4.8,
      status: "published",
      verificationStatus: "verified",
      createdAt: isoDaysFromNow(-12),
    },
    {
      id: "food2",
      name: "Poulet Braisé Riviera",
      ownerName: "Kouamé Serge",
      contactPhone: "+225 05 33 22 11 00",
      placeType: "Grillade",
      mainSpecialty: "Poulet braisé",
      specialties: ["Poulet braisé", "Grillades", "Alloco"],
      city: "Abidjan",
      area: "Cocody Riviera 2",
      address: "Riviera 2, axe principal",
      averageBudget: "3 000 - 7 000 FCFA",
      openingHours: "12h - 23h",
      deliveryAvailable: true,
      description: "Poulet braisé, poisson grillé et accompagnements servis chaud.",
      rating: 4.7,
      status: "published",
      verificationStatus: "verified",
      createdAt: isoDaysFromNow(-8),
    },
    {
      id: "food3",
      name: "Chez Maman Placali",
      ownerName: "Mariam Koné",
      contactPhone: "+225 01 02 03 04 05",
      placeType: "Restaurant",
      mainSpecialty: "Placali",
      specialties: ["Placali", "Sauce graine", "Kedjenou"],
      city: "Bouaké",
      area: "Air France",
      address: "Bouaké Air France, non loin du marché",
      averageBudget: "1 500 - 4 000 FCFA",
      openingHours: "11h - 21h",
      deliveryAvailable: false,
      description: "Plats ivoiriens du jour, sauces maison et portions généreuses.",
      rating: 4.6,
      status: "published",
      verificationStatus: "pending",
      createdAt: isoDaysFromNow(-5),
    },
  ],
  reports: [],
  reviews: [],
  jobOffers: [],
  ads: [],
};

const bizziConfig = window.BizziConfig || {
  mode: "local",
  currency: "FCFA",
  supabase: {
    url: "",
    anonKey: "",
    publicProviderView: "public_provider_directory",
    storage: {
      providerPhotos: "provider-photos",
      verificationProofs: "provider-proofs",
      paymentProofs: "payment-proofs",
    },
  },
  payments: { mode: "manual_validation", methods: ["Wave", "Orange Money", "MTN Money"], aggregator: { enabled: false } },
  backend: { adminActionsEndpoint: "", dispatchEndpoint: "", serverAlertsEndpoint: "" },
  observability: { endpoint: "", forwarderEndpoint: "", externalProvider: "", sampleRate: 1 },
  realtime: { locationEndpoint: "" },
  notifications: { enabled: false, vapidPublicKey: "", subscribeEndpoint: "", notifyEndpoint: "" },
  maps: {
    provider: "auto",
    mapboxAccessToken: "",
    geocodingEndpoint: "",
    routingMode: "local_estimate",
    fallbackProvider: "openstreetmap",
    country: "ci",
    language: "fr",
    bbox: "-8.7,4.0,-2.4,10.9",
    proximity: "-4.0244,5.3453",
  },
  admin: { demoPin: "", allowQueryEntry: false },
  official: {
    domain: "bizzi-africa.com",
    website: "https://bizzi-africa.com",
    contactEmail: "contact@bizzi-africa.com",
    supportEmail: "support@bizzi-africa.com",
    paymentEmail: "paiement@bizzi-africa.com",
    providersEmail: "prestataires@bizzi-africa.com",
  },
};
const CURRENT_RELEASE = bizziConfig.version || "V304";
const ADMIN_ENTRY_KEY = "bizzi-admin-entry";
const ADMIN_UNLOCK_KEY = "bizzi-admin-unlocked";
const ADMIN_AUTH_SESSION_KEY = "bizzi-admin-auth-session";
const FINAL_RECIPE_KEY = "bizzi-final-recipe-v181";
const PUBLIC_LAUNCH_CHECKLIST_KEY = "bizzi-public-launch-checklist-v181";
const PROVIDER_REGISTRY_KEY = "bizzi-provider-registry-v233";
const ADMIN_PATHS = new Set(["admin", "admin-access", "admin-panel", "admin-console", "admin.html", "admin-access.html"]);
const SUPABASE_REQUEST_TIMEOUT_MS = 20000;
const FINAL_RECIPE_ITEMS = [
  { id: "cloudflare_v181", label: `${CURRENT_RELEASE} uploadée et cache Cloudflare purgé`, detail: `Uploader le ZIP ${CURRENT_RELEASE} puis faire Purge everything.` },
  { id: "phone_clean", label: "Téléphone propre", detail: "Supprimer l'ancienne PWA ou les données du site, puis rouvrir Zeyds." },
  { id: "client_search", label: "Parcours client validé", detail: "Recherche sans compte, ville, fiche prestataire, appel/WhatsApp." },
  { id: "provider_signup", label: "Parcours prestataire validé", detail: "Création profil, métier, ville, photo, essai gratuit automatique." },
  { id: "provider_payment", label: "Forfait prestataire validé", detail: "Paiement préparé, référence reçue, validation admin, visibilité prolongée." },
  { id: "admin_control", label: "Admin validé", detail: "Connexion Supabase, validation paiement, retrait et réactivation visibles." },
  { id: "delivery_local", label: "Livraison locale validée", detail: "Distance estimée, prix affiché, commission 15%, paiement et affectation." },
  { id: "jobs_missions", label: "Emplois / missions validés", detail: "Création, référence Zeyds, paiement forfait, validation et affichage." },
  { id: "events_geo", label: "Événements géolocalisés validés", detail: "Ville, dates début/fin, publication, disparition après fin, stats clics." },
  { id: "legal_docs", label: "Documents légaux relus", detail: "Conditions, confidentialité, modération, règles prestataires/livraison/événements." },
  { id: "payments_accounts", label: "Comptes de paiement dédiés", detail: "Wave, Orange Money, MTN Money ou agrégateur renseignés avant vente réelle." },
  { id: "backup_process", label: "Sauvegarde et export", detail: "Export CSV/JSON testé et sauvegarde Supabase prévue." },
];
const PUBLIC_LAUNCH_ITEMS = [
  { id: "android_real_phone", label: "Android réel testé", detail: "Accueil, services, prestataire, paiement et livraison testés sur Android." },
  { id: "iphone_real_phone", label: "iPhone Safari testé", detail: "Ouverture, PWA, recherche service, événement et formulaire prestataire testés." },
  { id: "weak_network", label: "Réseau faible testé", detail: "Ouverture contrôlée en 4G faible avec écran de chargement acceptable." },
  { id: "payment_manual_trace", label: "Paiement manuel traçable", detail: "Référence reçue, validation admin et relance prestataire contrôlées." },
  { id: "delivery_trace", label: "Livraison test complète", detail: "Tarif, commission, validation paiement, message client et livreur copiés." },
  { id: "admin_backup", label: "Export admin sauvegardé", detail: "Export JSON/CSV conservé avant ouverture publique." },
  { id: "support_ready", label: "Support prêt", detail: "Email, WhatsApp ou téléphone Zeyds opérationnel pour les premiers retours." },
  { id: "legal_ready", label: "Textes légaux relus", detail: "Conditions, confidentialité, livraison, prestataires et événements relus." },
];
function safeSessionGet(key) {
  if (globalThis.BizziStorage?.sessionGet) return globalThis.BizziStorage.sessionGet(key);
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key, value) {
  if (globalThis.BizziStorage?.sessionSet) return globalThis.BizziStorage.sessionSet(key, value);
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeSessionRemove(key) {
  if (globalThis.BizziStorage?.sessionRemove) {
    globalThis.BizziStorage.sessionRemove(key);
    return;
  }
  try {
    sessionStorage.removeItem(key);
  } catch {
  }
}

function safeLocalGet(key) {
  if (globalThis.BizziStorage?.localGet) return globalThis.BizziStorage.localGet(key);
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalSet(key, value) {
  if (globalThis.BizziStorage?.localSet) return globalThis.BizziStorage.localSet(key, value);
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function captureBizziError(error, context = {}) {
  try {
    globalThis.BizziErrorMonitor?.capture?.(error, context);
  } catch {
  }
}

function recordBizziPerformance() {
  try {
    globalThis.BizziPerformance?.markReady?.("bizzi_app_ready");
    globalThis.BizziPerformance?.record?.();
  } catch (error) {
    captureBizziError(error, { module: "performance_record" });
  }
}

function isSecureAdminPath() {
  const path = String(location.pathname || "").replace(/\/+$/, "");
  const lastPart = path.split("/").filter(Boolean).pop() || "";
  return ADMIN_PATHS.has(lastPart);
}
function hasSecureAdminHash() {
  return location.hash === "#admin";
}
let adminUnlocked = safeSessionGet(ADMIN_UNLOCK_KEY) === "true" || isSecureAdminPath() || hasSecureAdminHash();
let adminAuthSession = loadAdminAuthSession();
let deliveryMapDistanceTimer = null;
function emptyRemoteAdminQueue() {
  return {
    payments: [],
    providers: [],
    recentProviders: [],
    ads: [],
    requests: [],
    jobs: [],
    jobError: "",
    events: [],
    eventError: "",
    foods: [],
    foodError: "",
    exceptionPlaces: [],
    exceptionPlaceError: "",
    providerSearchQuery: "",
    providerSearchResults: [],
    isAdmin: null,
    publicProviderCount: null,
  };
}

let remoteAdminQueue = emptyRemoteAdminQueue();
let adminRemoteActionsReady = false;
const remoteActivationBusyIds = new Set();
const remoteActivationIssueById = new Map();
const remoteModerationBusyById = new Map();
const remoteModerationIssueById = new Map();

const SERVICE_ALIASES = {
  "Livraison": "Zeyds Livraison",
  "Livreur": "Zeyds Livraison",
  "Coursier": "Zeyds Livraison",
  "Service livraison": "Zeyds Livraison",
  "Livreur de gaz": "Livreur de gaz en bouteille",
  "Location événement": "Location d'articles d'événements",
  "Assistante administrative": "Secrétaire virtuelle / Assistante administrative",
  "Détective privé": "Détective privé(e)",
  "Détective privée": "Détective privé(e)",
  "Detective prive": "Détective privé(e)",
  "Detective privee": "Détective privé(e)",
  "Jardinier": "Jardinier / Paysagiste",
  "Paysagiste": "Jardinier / Paysagiste",
  "Transitaires": "Transitaire",
  "Agent transitaire": "Transitaire",
  "Aide ménage": "Aide ménage / agence de placement",
  "Aide au ménage": "Aide ménage / agence de placement",
  "Femme de ménage": "Aide ménage / agence de placement",
  "Agence de placement": "Aide ménage / agence de placement",
  "Personnel de maison": "Aide ménage / agence de placement",
};

const SERVICE_KEY_ALIASES = {
  livraison: "Zeyds Livraison",
  livreur: "Zeyds Livraison",
  coursier: "Zeyds Livraison",
  servicelivraison: "Zeyds Livraison",
  detectiveprive: "Détective privé(e)",
  detectiveprivee: "Détective privé(e)",
  detective: "Détective privé(e)",
  jardinier: "Jardinier / Paysagiste",
  paysagiste: "Jardinier / Paysagiste",
  jardinierpaysagiste: "Jardinier / Paysagiste",
  transitaire: "Transitaire",
  transitaires: "Transitaire",
  agenttransitaire: "Transitaire",
  architecte: "Architecte / décorateur professionnel",
  decorateur: "Architecte / décorateur professionnel",
  decorateurprofessionnel: "Architecte / décorateur professionnel",
  architectedecorateur: "Architecte / décorateur professionnel",
  aidemenage: "Aide ménage / agence de placement",
  aideaumenage: "Aide ménage / agence de placement",
  femmedemenage: "Aide ménage / agence de placement",
  menagere: "Aide ménage / agence de placement",
  personneldemaison: "Aide ménage / agence de placement",
  agencedeplacement: "Aide ménage / agence de placement",
  placementmenage: "Aide ménage / agence de placement",
  tatoueur: "Tatouage",
  tatouage: "Tatouage",
  agenceevenementielle: "Agence événementielle / organisateur événements",
  organisateurevenements: "Agence événementielle / organisateur événements",
  organisateurevenement: "Agence événementielle / organisateur événements",
  fleuriste: "Fleuriste",
  fleurs: "Fleuriste",
  achator: "Achat Or et pierre",
  achatpierre: "Achat Or et pierre",
  achatoretpierre: "Achat Or et pierre",
  bijou: "Achat Or et pierre",
  bijoux: "Achat Or et pierre",
  tennis: "Coach tennis",
  coachtennis: "Coach tennis",
  golf: "Coach Golf",
  coachgolf: "Coach Golf",
  hotel: "Hôtels",
  hotels: "Hôtels",
  guidetouristique: "Guide touristique",
  guide: "Guide touristique",
  tourisme: "Guide touristique",
  depannagemoto: "Dépannage moto",
  mecanicienmoto: "Dépannage moto",
};

const CATEGORY_ALIASES = {
  servicesalapersonne: "Services à la personne",
};

const EMERGENCY_SERVICES = new Set([
  "Plombier",
  "Electricien",
  "Serrurier",
  "Mécanicien",
  "Remorquage / Dépannage auto",
  "Dépannage moto",
  "Vulcanisateur / Pneus",
  "Frigoriste / Climatisation",
  "Technicien électroménager",
  "Ambulance privée",
  "Infirmier à domicile",
  "Garde-malade",
  "Chauffeur",
  "Conducteur moto-taxi",
  "Zeyds Livraison",
  "Désinsectisation / Dératisation",
  "Vidangeur",
  "Ramassage d'ordures",
  "Installation Wi-Fi / caméra",
  "Réparateur téléphone",
  "Réparateur ordinateur / imprimante",
]);

const PROVIDER_DIRECTORY_PAGE_SIZE = 30;
const PROVIDER_DIRECTORY_MAX_SESSION_ITEMS = 300;
const providerDirectoryState = {
  items: [],
  cursor: null,
  hasMore: false,
  loadedCount: 0,
  loading: false,
  signature: "",
  pendingSignature: "",
  error: "",
  mode: "local",
  fallbackNationwide: false,
};
let providerDirectorySearchTimer = 0;
let providerDirectoryRequestId = 0;

const state = loadState();
let providerSignupSessionActive = false;

function isGeneratedTestProvider(provider = {}) {
  return Boolean(provider.testData || String(provider.id || "").startsWith("test-v234-"));
}

function durableLocalProvider(provider = {}) {
  return Boolean(
    !isGeneratedTestProvider(provider)
    && provider.termsAcceptedAt
    && canonicalPhoneForMatch(provider.phone)
    && !String(provider.id || "").startsWith("sb-")
  );
}

function providerRegistryRecord(provider = {}) {
  return {
    id: provider.id,
    testData: Boolean(provider.testData),
    remoteId: provider.remoteId || "",
    remoteStatus: provider.remoteStatus || "local_only",
    remoteServiceStatus: provider.remoteServiceStatus || "",
    fullName: provider.fullName,
    phone: provider.phone,
    whatsapp: provider.whatsapp || provider.phone,
    service: provider.service,
    services: providerServiceNames(provider),
    city: provider.city,
    area: provider.area,
    description: provider.description,
    status: provider.status || "approved",
    visibility: provider.visibility || "active",
    verificationStatus: provider.verificationStatus || "none",
    termsAcceptedAt: provider.termsAcceptedAt,
    trialEndsAt: provider.trialEndsAt,
    subscriptionEndsAt: provider.subscriptionEndsAt || null,
    boostEndsAt: provider.boostEndsAt || null,
    submissionReference: provider.submissionReference || "",
  };
}

function loadProviderRegistry() {
  try {
    const parsed = JSON.parse(safeLocalGet(PROVIDER_REGISTRY_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((provider) => provider?.phone && !isGeneratedTestProvider(provider))
      : [];
  } catch {
    return [];
  }
}

function mergeProviderRegistry(draft) {
  const providers = Array.isArray(draft.providers) ? draft.providers : [];
  loadProviderRegistry().forEach((backup) => {
    const index = providers.findIndex((provider) => (
      (backup.remoteId && provider.remoteId === backup.remoteId) || phonesMatch(provider.phone, backup.phone)
    ));
    if (index < 0) providers.push(backup);
    else providers[index] = {
      ...backup,
      ...providers[index],
      services: [...new Set([...providerServiceNames(backup), ...providerServiceNames(providers[index])])],
    };
  });
  draft.providers = providers;
  return draft;
}

function loadState() {
  const saved = safeLocalGet("bizzi-state");
  if (!saved) return normalizeState(mergeProviderRegistry(structuredClone(seed)));
  try {
    return normalizeState(mergeProviderRegistry({ ...structuredClone(seed), ...JSON.parse(saved) }));
  } catch {
    return normalizeState(mergeProviderRegistry(structuredClone(seed)));
  }
}

function saveState() {
  const compactState = JSON.stringify(state, (key, value) => {
    if (["verificationProof", "proof", "proofPhoto"].includes(key) && typeof value === "string" && value.startsWith("data:")) return "";
    if (["photo", "poster"].includes(key) && typeof value === "string" && value.startsWith("data:") && value.length > 180000) return "";
    return value;
  });
  const stateSaved = safeLocalSet("bizzi-state", compactState);
  const registry = state.providers.filter(durableLocalProvider).map(providerRegistryRecord).slice(-250);
  const registrySaved = safeLocalSet(PROVIDER_REGISTRY_KEY, JSON.stringify(registry));
  if (!stateSaved || !registrySaved) captureBizziError(new Error("Stockage local Zeyds saturé"), { module: "state_storage" });
  return stateSaved;
}

function debounce(fn, delay = 150) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function canonicalServiceName(service) {
  const name = String(service || "").trim();
  return SERVICE_ALIASES[name] || SERVICE_KEY_ALIASES[normalizedCatalogKey(name)] || name;
}

function normalizedCatalogKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function canonicalCategoryName(category) {
  const name = String(category || "").trim();
  return CATEGORY_ALIASES[normalizedCatalogKey(name)] || name || "Autres";
}

function uniqueServices(services) {
  const seen = new Set();
  return (Array.isArray(services) ? services : [])
    .map(canonicalServiceName)
    .filter((service) => {
      const key = normalizedCatalogKey(service);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function identityText(value) {
  return normalizedCatalogKey(String(value || ""));
}

function identityTimestamp(value, bucketMinutes = 1) {
  const timestamp = new Date(value || 0).getTime();
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "";
  return String(Math.floor(timestamp / (Math.max(1, bucketMinutes) * 60000)));
}

function recordIdentityKeys(record = {}, kind = "record") {
  const keys = [];
  const add = (scope, value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized) keys.push(`${kind}:${scope}:${normalized}`);
  };
  const addUid = (value) => add("uid", value);
  addUid(record.id);
  addUid(record.remoteId || record.remote_id);
  add("submission", identityText(record.submissionReference || record.submission_reference));

  if (kind === "provider") {
    [record.phone, record.whatsapp, record.social?.whatsapp]
      .map(canonicalPhoneForMatch)
      .filter(Boolean)
      .forEach((phone) => add("phone", phone));
  } else if (kind === "signup") {
    add("phone", canonicalPhoneForMatch(record.phone || record.whatsapp));
  } else if (kind === "payment") {
    const reference = normalizedPaymentReference(record.reference || record.transactionReference || record.transaction_reference);
    if (reference) add("transaction", `${record.providerId || record.provider_id || "provider"}|${record.method || "method"}|${reference}`);
  } else if (kind === "event") {
    add("payment", identityText(record.paymentReference || record.transaction_reference));
    const title = identityText(record.title);
    const start = identityTimestamp(record.dateTime || record.event_datetime || record.eventDate);
    const city = identityText(record.city || record.city_name);
    const venue = identityText(record.venue || record.address);
    if (title && start && city) add("fingerprint", `${title}|${start}|${city}|${venue}`);
  } else if (kind === "food") {
    const name = identityText(record.name);
    const city = identityText(record.city || record.city_name);
    const area = identityText(record.area || record.address);
    const phone = canonicalPhoneForMatch(record.contactPhone || record.contact_phone);
    if (name && city && (area || phone)) add("fingerprint", `${name}|${city}|${area}|${phone}`);
  } else if (kind === "job") {
    add("payment", identityText(record.paymentReference || record.transaction_reference));
  } else if (kind === "delivery") {
    add("payment", identityText(record.paymentReference || record.transaction_reference));
    const phone = canonicalPhoneForMatch(record.phone || record.customer_phone);
    const pickup = identityText(record.pickup || record.pickup_address);
    const dropoff = identityText(record.dropoff || record.dropoff_address);
    const minute = identityTimestamp(record.createdAt || record.created_at, 2);
    if (phone && pickup && dropoff && minute) add("fingerprint", `${phone}|${pickup}|${dropoff}|${minute}`);
  } else if (kind === "request") {
    const phone = canonicalPhoneForMatch(record.phone || record.customer_phone);
    const service = identityText(record.service || record.service_name);
    const city = identityText(record.city || record.city_name);
    const area = identityText(record.area);
    const minute = identityTimestamp(record.createdAt || record.created_at, 2);
    if (phone && service && city && minute) add("fingerprint", `${phone}|${service}|${city}|${area}|${minute}`);
  } else if (kind === "review") {
    const provider = record.providerId || record.provider_id;
    const message = identityText(record.message);
    const created = identityTimestamp(record.createdAt || record.created_at);
    if (provider && created) add("fingerprint", `${provider}|${record.rating || 0}|${message}|${created}`);
  }
  return [...new Set(keys)];
}

function mergeDuplicateRecord(preferred = {}, duplicate = {}, kind = "record") {
  const merged = { ...duplicate, ...preferred };
  Object.entries(preferred).forEach(([key, value]) => {
    const empty = value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
    if (empty && duplicate[key] !== "" && duplicate[key] !== null && duplicate[key] !== undefined) merged[key] = duplicate[key];
    if (Array.isArray(value) || Array.isArray(duplicate[key])) {
      merged[key] = [...new Set([...(Array.isArray(value) ? value : []), ...(Array.isArray(duplicate[key]) ? duplicate[key] : [])])];
    }
  });
  [
    "clickCount", "ticketClickCount", "contactClickCount", "detailViewCount", "contactClicks",
    "callClicks", "whatsappClicks", "shareClicks", "copyClicks", "routeClicks", "positiveFeedback",
    "noAnswerFeedback", "wrongNumberFeedback", "reviewCount", "socialViews", "matchCount",
    "verifiedMatchCount", "dispatchCandidateCount", "deliveryCancelCount",
  ].forEach((field) => {
    if (field in preferred || field in duplicate) merged[field] = Math.max(Number(preferred[field] || 0), Number(duplicate[field] || 0));
  });
  if (kind === "provider") {
    merged.services = uniqueServices([...providerServiceNames(preferred), ...providerServiceNames(duplicate)]);
    merged.service = canonicalServiceName(preferred.service || duplicate.service || merged.services[0] || "");
    merged.social = { ...(duplicate.social || {}), ...(preferred.social || {}) };
    merged.phone = preferred.phone || duplicate.phone || "";
    merged.whatsapp = preferred.whatsapp || duplicate.whatsapp || merged.phone;
  }
  if (kind === "event") {
    merged.isSponsored = Boolean(preferred.isSponsored || duplicate.isSponsored);
    merged.isPremium = Boolean(preferred.isPremium || duplicate.isPremium);
    merged.boostEndsAt = laterIsoDate(preferred.boostEndsAt, duplicate.boostEndsAt);
  }
  return merged;
}

function dedupeEntityRecords(records = [], kind = "record") {
  if (!globalThis.BizziDataDedupe?.dedupe) throw new Error("Module anti-doublons Zeyds indisponible");
  return globalThis.BizziDataDedupe.dedupe(records, {
    keysFor: (record) => recordIdentityKeys(record, kind),
    mergeRecords: (preferred, duplicate) => mergeDuplicateRecord(preferred, duplicate, kind),
  });
}

function remapDuplicateId(value, aliases = new Map()) {
  let current = String(value || "");
  const visited = new Set();
  while (current && aliases.has(current) && !visited.has(current)) {
    visited.add(current);
    current = aliases.get(current);
  }
  return current;
}

function setOpenProviderFilters({ clearSearch = false } = {}) {
  state.selectedCity = "Toute la Côte d'Ivoire";
  state.selectedRadius = 0;
  state.selectedVerifiedOnly = false;
  const citySelect = document.querySelector("#citySelect");
  const radiusSelect = document.querySelector("#radiusSelect");
  const verifiedOnly = document.querySelector("#verifiedOnly");
  const searchInput = document.querySelector("#searchInput");
  if (citySelect) citySelect.value = state.selectedCity;
  if (radiusSelect) radiusSelect.value = String(state.selectedRadius);
  if (verifiedOnly) verifiedOnly.checked = false;
  if (clearSearch && searchInput) searchInput.value = "";
}

function syncCategoriesWithSeed(categories) {
  const existingCategories = Array.isArray(categories) ? categories : [];
  const existingByName = new Map();
  existingCategories.forEach((category) => {
    const name = canonicalCategoryName(category.name);
    const current = existingByName.get(name) || { ...category, name, services: [] };
    current.services = uniqueServices([...(current.services || []), ...(category.services || [])]);
    existingByName.set(name, current);
  });
  const seedNames = new Set(seed.categories.map((category) => canonicalCategoryName(category.name)));
  const synced = seed.categories.map((seedCategory) => {
    const seedName = canonicalCategoryName(seedCategory.name);
    const existing = existingByName.get(seedName) || {};
    const services = uniqueServices([...seedCategory.services, ...(existing.services || [])]);
    return {
      ...existing,
      name: seedName,
      services,
    };
  });
  existingCategories
    .filter((category) => category.name && !seedNames.has(canonicalCategoryName(category.name)))
    .forEach((category) => synced.push({
      ...category,
      name: canonicalCategoryName(category.name),
      services: uniqueServices(category.services),
    }));
  return synced;
}

function allCatalogServices(categories) {
  return categories.flatMap((category) => Array.isArray(category.services) ? category.services : []);
}

function normalizeDeliveryRequest(request = {}) {
  const pricing = deliveryPricingDetails({
    distanceKm: request.distanceKm ?? request.distance_km,
    pricingSlot: request.pricingSlot || request.timeSlot || request.pricing_slot,
    scheduledAt: request.scheduledAt || request.scheduled_at,
    urgency: request.urgency,
    badWeather: request.badWeather ?? request.bad_weather,
  });
  const amount = Math.max(0, Math.round(Number(request.amount ?? request.deliveryAmount ?? pricing.suggestedAmount ?? 0)));
  const commissionRate = Number(request.commissionRate ?? DELIVERY_COMMISSION_RATE);
  const bizziCommission = Math.round(Number(request.bizziCommission ?? amount * commissionRate));
  const providerPayout = Math.max(0, Math.round(Number(request.providerPayout ?? amount - bizziCommission)));
  const parcel = String(request.parcel || "").trim() || "Colis";
  const requestType = request.requestType || request.request_type || (/^course (taxi|moto)/i.test(parcel) ? "ride" : "delivery");
  return {
    id: request.id || `del${Date.now()}`,
    remoteId: request.remoteId || "",
    remoteStatus: request.remoteStatus || "",
    clientDeviceToken: String(request.clientDeviceToken || request.client_access_token || ""),
    pickup: String(request.pickup || "").trim(),
    dropoff: String(request.dropoff || "").trim(),
    parcel,
    requestType,
    passengerCount: Math.max(1, Number(request.passengerCount || request.passenger_count || 1)),
    vehicleType: request.vehicleType || request.vehicle_type || (/moto-taxi/i.test(parcel) ? "moto_taxi" : "taxi"),
    city: String(request.city || "").trim() || "Toute la Côte d'Ivoire",
    area: String(request.area || "").trim(),
    urgency: request.urgency || "today",
    scheduledAt: request.scheduledAt || request.scheduled_at || "",
    notes: String(request.notes || "").trim(),
    clientName: normalizeClientName(request.clientName || request.customerName || request.customer_name || ""),
    phone: String(request.phone || "").trim(),
    pickupLatitude: normalizeCoordinate(request.pickupLatitude ?? request.pickup_latitude),
    pickupLongitude: normalizeCoordinate(request.pickupLongitude ?? request.pickup_longitude),
    pickupAccuracy: Math.max(0, Math.round(Number(request.pickupAccuracy ?? request.pickup_accuracy ?? 0))),
    pickupLocationTimestamp: request.pickupLocationTimestamp || request.pickup_location_timestamp || "",
    pickupLocationLabel: String(request.pickupLocationLabel || request.pickup_location_label || "").trim(),
    pickupLocationFullAddress: String(request.pickupLocationFullAddress || request.pickup_location_full_address || "").trim(),
    dropoffLatitude: normalizeCoordinate(request.dropoffLatitude ?? request.dropoff_latitude),
    dropoffLongitude: normalizeCoordinate(request.dropoffLongitude ?? request.dropoff_longitude),
    dropoffLocationLabel: String(request.dropoffLocationLabel || request.dropoff_location_label || "").trim(),
    dropoffLocationFullAddress: String(request.dropoffLocationFullAddress || request.dropoff_location_full_address || "").trim(),
    distanceKm: normalizeDistanceKm(request.distanceKm ?? request.distance_km ?? pricing.distanceKm),
    baseAmount: Math.max(0, Math.round(Number(request.baseAmount ?? request.base_amount ?? pricing.baseAmount))),
    suggestedAmount: Math.max(0, Math.round(Number(request.suggestedAmount ?? request.suggested_amount ?? pricing.suggestedAmount))),
    pricingSlot: request.pricingSlot || request.pricing_slot || pricing.pricingSlot,
    pricingSlotLabel: request.pricingSlotLabel || request.pricing_slot_label || pricing.pricingSlotLabel,
    badWeather: Boolean(request.badWeather ?? request.bad_weather ?? pricing.badWeather),
    surchargeRate: Number(request.surchargeRate ?? request.surcharge_rate ?? pricing.surchargeRate ?? 0),
    pricingBreakdown: request.pricingBreakdown || request.pricing_breakdown || pricing.pricingBreakdown,
    amount,
    currency: request.currency || bizziConfig.currency || "FCFA",
    commissionRate,
    bizziCommission,
    providerPayout,
    paymentMethod: request.paymentMethod || seed.selectedDeliveryPayment || "Wave",
    paymentReference: String(request.paymentReference || "").trim(),
    paymentStatus: request.paymentStatus || (amount > 0 ? "pending" : "unpaid"),
    paidAt: request.paidAt || null,
    payoutStatus: request.payoutStatus || "pending",
    foodPlaceId: String(request.foodPlaceId || request.food_place_id || ""),
    foodPlaceName: String(request.foodPlaceName || request.food_place_name || ""),
    foodItem: String(request.foodItem || request.food_item || ""),
    restaurantAmount: Math.max(0, Math.round(Number(request.restaurantAmount || request.restaurant_amount || 0))),
    restaurantPayout: Math.max(0, Math.round(Number(request.restaurantPayout || request.restaurant_payout || 0))),
    restaurantPayoutStatus: request.restaurantPayoutStatus || request.restaurant_payout_status || "",
    foodOrderTotal: Math.max(0, Math.round(Number(request.foodOrderTotal || request.food_order_total || 0))),
    deliveryAmount: Math.max(0, Math.round(Number(request.deliveryAmount || request.delivery_amount || 0))),
    restaurantMobileMoneyAccount: String(request.restaurantMobileMoneyAccount || request.restaurant_mobile_money_account || ""),
    status: request.status || "open",
    dispatchStatus: request.dispatchStatus || request.dispatch_status || "not_dispatched",
    dispatchCandidateCount: Number(request.dispatchCandidateCount ?? request.dispatch_candidate_count ?? request.dispatchAttempts ?? request.dispatch_attempts ?? 0),
    dispatchRadiusKm: normalizeDistanceKm(request.dispatchRadiusKm ?? request.dispatch_radius_km ?? DELIVERY_MATCH_RADIUS_KM),
    dispatchMode: request.dispatchMode || request.dispatch_mode || "",
    dispatchedAt: request.dispatchedAt || request.dispatched_at || null,
    lastDispatchMessage: request.lastDispatchMessage || request.last_dispatch_message || "",
    matchedProviderIds: Array.isArray(request.matchedProviderIds)
      ? request.matchedProviderIds
      : (Array.isArray(request.matched_provider_ids) ? request.matched_provider_ids : []),
    assignedProviderId: request.assignedProviderId || "",
    assignedProviderName: request.assignedProviderName || "",
    assignedProviderPhone: request.assignedProviderPhone || "",
    acceptedAt: request.acceptedAt || null,
    deliveryStage: request.deliveryStage || request.delivery_stage || (request.status === "assigned" ? "accepted" : "waiting"),
    proofCode: String(request.proofCode || request.proof_code || ""),
    proofPhoto: request.proofPhoto || request.proof_photo || "",
    pickedUpAt: request.pickedUpAt || request.picked_up_at || null,
    enRouteAt: request.enRouteAt || request.en_route_at || null,
    deliveredAt: request.deliveredAt || request.delivered_at || null,
    courierLatitude: normalizeCoordinate(request.courierLatitude ?? request.courier_latitude),
    courierLongitude: normalizeCoordinate(request.courierLongitude ?? request.courier_longitude),
    courierLocationAt: request.courierLocationAt || request.courier_location_at || null,
    cancellationStatus: request.cancellationStatus || request.cancellation_status || "",
    cancellationReason: request.cancellationReason || request.cancellation_reason || "",
    cancelledBy: request.cancelledBy || request.cancelled_by || "",
    cancelledAt: request.cancelledAt || request.cancelled_at || null,
    providerCancelReason: request.providerCancelReason || request.provider_cancel_reason || "",
    providerCancelRequestedAt: request.providerCancelRequestedAt || request.provider_cancel_requested_at || null,
    providerCancelReview: request.providerCancelReview || request.provider_cancel_review || "",
    providerCancelReviewedAt: request.providerCancelReviewedAt || request.provider_cancel_reviewed_at || null,
    providerCancelPenaltyAppliedAt: request.providerCancelPenaltyAppliedAt || request.provider_cancel_penalty_applied_at || null,
    closedAt: request.closedAt || null,
    createdAt: request.createdAt || new Date().toISOString(),
  };
}

function normalizeState(draft) {
  draft.categories = syncCategoriesWithSeed(draft.categories);
  draft.selectedCategory = canonicalCategoryName(draft.selectedCategory || seed.selectedCategory);
  draft.selectedCity = NATIONAL_CITIES.includes(draft.selectedCity) ? draft.selectedCity : "Toute la Côte d'Ivoire";
  draft.selectedRadius = Number(draft.selectedRadius ?? 10);
  draft.selectedVerifiedOnly = Boolean(draft.selectedVerifiedOnly);
  delete draft.selectedEmergencyOnly;
  draft.recentProviderSignups = dedupeEntityRecords(
    (Array.isArray(draft.recentProviderSignups) ? draft.recentProviderSignups : []).filter((item) => item?.phone),
    "signup",
  ).items.slice(0, 12);
  draft.selectedJobEntryMode = draft.selectedJobEntryMode === "publish" ? "publish" : "search";
  draft.selectedJobPlanId = JOB_OFFER_PLANS.some((plan) => plan.id === draft.selectedJobPlanId) ? draft.selectedJobPlanId : "job_1_day";
  draft.selectedJobPayment = (bizziConfig.payments?.methods || ["Wave", "Orange Money", "MTN Money"]).includes(draft.selectedJobPayment) ? draft.selectedJobPayment : "Wave";
  draft.selectedEventPlanId = EVENT_PROMOTION_PLANS.some((plan) => plan.id === draft.selectedEventPlanId) ? draft.selectedEventPlanId : "standard";
  draft.selectedEventPayment = (bizziConfig.payments?.methods || ["Wave", "Orange Money", "MTN Money"]).includes(draft.selectedEventPayment) ? draft.selectedEventPayment : "Wave";
  draft.selectedEventId = draft.selectedEventId || "";
  draft.selectedEventEntryMode = draft.selectedEventEntryMode === "promote" ? "promote" : "tickets";
  draft.selectedFoodCity = cityIsSpecific(draft.selectedFoodCity) ? draft.selectedFoodCity : "Abidjan";
  draft.selectedFoodSpecialty = FOOD_SPECIALTIES.includes(draft.selectedFoodSpecialty) ? draft.selectedFoodSpecialty : "Toutes les spécialités";
  draft.selectedExceptionPlanId = EXCEPTION_PLACE_PLANS.some((plan) => plan.id === draft.selectedExceptionPlanId) ? draft.selectedExceptionPlanId : "free_30_days";
  draft.selectedExceptionPayment = (bizziConfig.payments?.methods || ["Wave", "Orange Money", "MTN Money"]).includes(draft.selectedExceptionPayment) ? draft.selectedExceptionPayment : "Wave";
  draft.selectedDeliveryPayment = BizziPrivacy.choosePayment(draft.selectedDeliveryPayment, bizziConfig.payments?.methods, true);
  draft.selectedDeliveryEntryMode = draft.selectedDeliveryEntryMode === "courier" ? "courier" : "request";
  draft.lastSmartAction = draft.lastSmartAction || "";
  draft.lastSmartActionAt = draft.lastSmartActionAt || "";
  draft.deliveryAlertsEnabled = Boolean(draft.deliveryAlertsEnabled);
  draft.deliveryAlertsEnabledAt = draft.deliveryAlertsEnabledAt || "";
  draft.deliveryLiveEnabled = Boolean(draft.deliveryLiveEnabled);
  draft.deliveryLiveEnabledAt = draft.deliveryLiveEnabledAt || "";
  draft.deliveryLiveProviderId = draft.deliveryLiveProviderId || "";
  draft.deliveryLiveLastStatus = draft.deliveryLiveLastStatus || "";
  draft.notifiedDeliveryRequestIds = [...new Set(Array.isArray(draft.notifiedDeliveryRequestIds) ? draft.notifiedDeliveryRequestIds.filter(Boolean) : [])];
  draft.clientName = String(draft.clientName || "").trim().slice(0, 40);
  draft.clientPhone = String(draft.clientPhone || "").trim();
  const normalizedPlan = providerPlanByName(draft.selectedPlan?.name);
  draft.selectedPlan = { name: normalizedPlan.name, price: normalizedPlan.price };
  draft.selectedBoost = PROVIDER_BOOST_OPTIONS.some((boost) => boost.id === draft.selectedBoost) ? draft.selectedBoost : "none";
  draft.selectedService = canonicalServiceName(draft.selectedService);
  draft.remote = {
    lastSupabaseSyncAt: null,
    lastSupabaseStatus: "",
    lastSupabaseWriteAt: null,
    lastSupabaseWriteStatus: "",
    ...(draft.remote || {}),
  };
  const selectedCategory = draft.categories.find((category) => category.name === draft.selectedCategory);
  if (!selectedCategory) {
    draft.selectedCategory = draft.categories.find((category) => category.services?.includes(draft.selectedService))?.name
      || draft.categories[0]?.name
      || seed.selectedCategory;
  }
  if (!allCatalogServices(draft.categories).includes(draft.selectedService)) {
    const fallbackCategory = draft.categories.find((category) => category.name === draft.selectedCategory);
    draft.selectedService = fallbackCategory?.services?.[0] || draft.categories[0]?.services?.[0] || "Plombier";
  }
  draft.userLocation = draft.userLocation || null;
  draft.ads = [];
  draft.reports = Array.isArray(draft.reports) ? draft.reports : [];
  draft.requests = Array.isArray(draft.requests) ? draft.requests.map((request) => ({
    ...request,
    service: canonicalServiceName(request.service || ""),
    priorityScore: Number(request.priorityScore || 0),
    priorityLabel: request.priorityLabel || "",
    matchCount: Number(request.matchCount || 0),
    verifiedMatchCount: Number(request.verifiedMatchCount || 0),
  })) : [];
  draft.deliveryRequests = Array.isArray(draft.deliveryRequests) ? draft.deliveryRequests.map(normalizeDeliveryRequest).filter((request) => !request.remoteId || BizziPrivacy.owns(request.clientDeviceToken)) : [];
  draft.eventPromotions = Array.isArray(draft.eventPromotions) ? draft.eventPromotions.map(normalizeEventPromotion) : [];
  draft.exceptionPlaces = Array.isArray(draft.exceptionPlaces) ? draft.exceptionPlaces.map(normalizeExceptionPlace) : [];
  draft.foodPlaces = Array.isArray(draft.foodPlaces) ? draft.foodPlaces.map(normalizeFoodPlace) : [];
  draft.reviews = Array.isArray(draft.reviews) ? draft.reviews : [];
  draft.jobOffers = Array.isArray(draft.jobOffers) ? draft.jobOffers.map(normalizeJobOffer) : [];
  draft.leads = Array.isArray(draft.leads) ? draft.leads : [];
  draft.favorites = [];
  draft.recentProviders = [];
  draft.providers = draft.providers.map((provider) => {
    const seeded = seed.providers.find((item) => item.id === provider.id) || {};
    const distanceKm = Number(provider.distanceKm ?? seeded.distanceKm ?? parseFloat(String(provider.distance).replace(",", ".")) ?? 20);
    const primaryService = canonicalServiceName(provider.service || seeded.service || "");
    const services = [...new Set([
      primaryService,
      ...(Array.isArray(provider.services) ? provider.services : []),
    ].map((service) => canonicalServiceName(service)).filter((service) => !isPlaceholderServiceName(service)))];
    return {
      photo: "",
      lat: seeded.lat || 5.345,
      lng: seeded.lng || -4.024,
      distanceKm: Number.isFinite(distanceKm) ? distanceKm : 20,
      trialEndsAt: isoDaysFromNow(30),
      subscriptionEndsAt: null,
      socialViews: 0,
      verificationStatus: seeded.verificationStatus || "none",
      verifiedAt: seeded.verifiedAt || null,
      verificationNote: seeded.verificationNote || "",
      verificationProof: "",
      verificationProofName: "",
      ...provider,
      service: primaryService,
      services,
      whatsapp: provider.whatsapp || provider.social?.whatsapp || seeded.whatsapp || provider.phone || "",
      social: {
        whatsapp: provider.social?.whatsapp || provider.whatsapp || seeded.social?.whatsapp || provider.phone || "",
      },
      contactClicks: Number(provider.contactClicks || 0),
      callClicks: Number(provider.callClicks || 0),
      whatsappClicks: Number(provider.whatsappClicks || 0),
      shareClicks: Number(provider.shareClicks || 0),
      copyClicks: Number(provider.copyClicks || 0),
      routeClicks: Number(provider.routeClicks || 0),
      deliveryPenaltyRate: Number(provider.deliveryPenaltyRate || provider.delivery_penalty_rate || 0),
      deliveryPenaltyRemaining: Number(provider.deliveryPenaltyRemaining || provider.delivery_penalty_remaining || 0),
      deliveryPenaltyUntil: provider.deliveryPenaltyUntil || provider.delivery_penalty_until || "",
      deliveryCancelCount: Number(provider.deliveryCancelCount || provider.delivery_cancel_count || 0),
      deliveryPenaltyReason: provider.deliveryPenaltyReason || provider.delivery_penalty_reason || "",
      positiveFeedback: Number(provider.positiveFeedback || 0),
      noAnswerFeedback: Number(provider.noAnswerFeedback || 0),
      wrongNumberFeedback: Number(provider.wrongNumberFeedback || 0),
      reviewCount: Number(provider.reviewCount || 0),
      socialViews: Number(provider.socialViews || 0),
    };
  });
  const providerDeduplication = dedupeEntityRecords(draft.providers, "provider");
  draft.providers = providerDeduplication.items;
  const providerAliases = providerDeduplication.aliases;
  const remapProviderId = (value) => remapDuplicateId(value, providerAliases);
  draft.identifiedProviderId = remapProviderId(draft.identifiedProviderId);
  draft.selectedPaymentProviderId = remapProviderId(draft.selectedPaymentProviderId);
  draft.deliveryLiveProviderId = remapProviderId(draft.deliveryLiveProviderId);

  const eventDeduplication = dedupeEntityRecords(draft.eventPromotions, "event");
  draft.eventPromotions = eventDeduplication.items;
  draft.selectedEventId = remapDuplicateId(draft.selectedEventId, eventDeduplication.aliases);
  draft.foodPlaces = dedupeEntityRecords(draft.foodPlaces, "food").items;
  draft.jobOffers = dedupeEntityRecords(draft.jobOffers, "job").items;
  draft.requests = dedupeEntityRecords(draft.requests, "request").items;
  draft.deliveryRequests = dedupeEntityRecords(draft.deliveryRequests.map((request) => ({
    ...request,
    assignedProviderId: remapProviderId(request.assignedProviderId),
    matchedProviderIds: [...new Set((request.matchedProviderIds || []).map(remapProviderId).filter(Boolean))],
  })), "delivery").items;
  draft.reviews = dedupeEntityRecords(draft.reviews.map((review) => ({
    ...review,
    providerId: remapProviderId(review.providerId),
  })), "review").items;
  draft.leads = dedupeEntityRecords(draft.leads.map((lead) => ({
    ...lead,
    providerId: remapDuplicateId(remapProviderId(lead.providerId), eventDeduplication.aliases),
  })), "lead").items;
  draft.reports = dedupeEntityRecords(draft.reports.map((report) => ({
    ...report,
    providerId: remapProviderId(report.providerId),
  })), "report").items;
  draft.payments = dedupeEntityRecords((Array.isArray(draft.payments) ? draft.payments : []).map((payment) => ({
    ...payment,
    providerId: remapProviderId(payment.providerId),
  })), "payment").items;
  draft.payments
    .filter((payment) => payment.status === "approved")
    .forEach((payment) => {
      const provider = draft.providers.find((item) => item.id === payment.providerId);
      if (!provider) return;
      provider.status = "approved";
      provider.visibility = "active";
      payment.benefitsAppliedAt = payment.benefitsAppliedAt || payment.reviewedAt || payment.createdAt || new Date().toISOString();
    });
  const identifiedProviderId = String(draft.identifiedProviderId || "");
  draft.identifiedProviderId = draft.providers.some((provider) => provider.id === identifiedProviderId && provider.status === "approved")
    ? identifiedProviderId
    : "";
  const payableProviders = draft.identifiedProviderId
    ? draft.providers.filter((provider) => provider.id === draft.identifiedProviderId && provider.status === "approved")
    : [];
  const selectedPaymentProviderId = String(draft.selectedPaymentProviderId || "");
  draft.selectedPaymentProviderId = payableProviders.some((provider) => provider.id === selectedPaymentProviderId)
    ? selectedPaymentProviderId
    : (payableProviders[payableProviders.length - 1]?.id || "");
  return draft;
}

function renderCityOptions() {
  const citySelect = document.querySelector("#citySelect");
  citySelect.innerHTML = NATIONAL_CITIES.map((city) => `<option>${safe(city)}</option>`).join("");
  citySelect.value = state.selectedCity;
}

function isFavorite(providerId) {
  return false;
}

function providerVisibleToClients(provider) {
  return Boolean(provider && provider.status === "approved" && provider.visibility === "active");
}

function activeProviderById(providerId) {
  return state.providers.find((provider) => provider.id === providerId && providerVisibleToClients(provider));
}

function identifiedProvider() {
  if (!state.identifiedProviderId) return null;
  return state.providers.find((provider) => provider.id === state.identifiedProviderId && provider.status === "approved") || null;
}

function paymentTargetProviders() {
  const provider = identifiedProvider();
  return provider ? [provider] : [];
}

function currentPaymentProvider() {
  const providers = paymentTargetProviders();
  return providers.find((provider) => provider.id === state.selectedPaymentProviderId) || providers[providers.length - 1] || null;
}

function setPaymentProvider(providerId) {
  const provider = paymentTargetProviders().find((item) => item.id === providerId);
  state.selectedPaymentProviderId = provider?.id || "";
  saveState();
  renderPaymentProviderOptions();
  renderProviderStatus();
  renderProviderDeliveryQueue();
}

function clearProviderIdentification(message = "") {
  state.identifiedProviderId = "";
  state.selectedPaymentProviderId = "";
  state.deliveryLiveProviderId = "";
  state.deliveryLiveEnabled = false;
  saveState();
  renderProviderEntryMode();
  renderPaymentProviderOptions();
  renderProviderDeliveryQueue();
  renderProviderIdentityStatus(message || `
    <strong>Profil déconnecté</strong>
    <p>Entrez votre téléphone ou WhatsApp pour voir uniquement votre profil et renouveler votre abonnement.</p>
  `);
  renderProviderStatus("Identifiez votre profil prestataire avant de choisir un forfait.");
}

function canonicalPhoneForMatch(phone = "") {
  let digits = normalizePhoneForMatch(phone);
  if (!digits) return "";
  if (digits.startsWith("00225")) digits = digits.slice(5);
  else if (digits.startsWith("225") && digits.length === 13) digits = digits.slice(3);
  if (digits.length === 10 && /^[01527]/.test(digits)) return `225${digits}`;
  return digits;
}

function phoneMatchKeys(phone = "") {
  const canonical = canonicalPhoneForMatch(phone);
  return canonical ? new Set([canonical]) : new Set();
}

function phonesMatch(left = "", right = "") {
  const leftKeys = phoneMatchKeys(left);
  if (!leftKeys.size) return false;
  return [...phoneMatchKeys(right)].some((key) => leftKeys.has(key));
}

function providerMatchesContact(provider, phone = "", whatsapp = "") {
  if (!provider) return false;
  return phonesMatch(provider.phone, phone)
    || phonesMatch(provider.phone, whatsapp)
    || phonesMatch(provider.whatsapp, phone)
    || phonesMatch(provider.whatsapp, whatsapp)
    || phonesMatch(provider.social?.whatsapp, phone)
    || phonesMatch(provider.social?.whatsapp, whatsapp);
}

function providerContactMatchScore(provider, contact = "") {
  if (!provider || !canonicalPhoneForMatch(contact)) return 0;
  if (phonesMatch(provider.phone, contact)) return 3;
  if (phonesMatch(provider.whatsapp, contact) || phonesMatch(provider.social?.whatsapp, contact)) return 2;
  return 0;
}

function findLocalProviderByContact(phone = "", whatsapp = "") {
  return state.providers
    .map((provider) => ({ provider, score: Math.max(providerContactMatchScore(provider, phone), providerContactMatchScore(provider, whatsapp)) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)[0]?.provider || null;
}

function findLocalProviderByPrimaryPhone(phone = "") {
  return state.providers.find((provider) => phonesMatch(provider.phone, phone)) || null;
}

function recentProviderSignupsHtml() {
  const items = Array.isArray(state.recentProviderSignups) ? state.recentProviderSignups.slice(0, 8) : [];
  if (!items.length) return "";
  return `
    <div class="provider-recent-created">
      <strong>Profils créés récemment sur cet appareil</strong>
      <div class="provider-recent-created-list">
        ${items.map((item) => `
          <button class="secondary" type="button" data-open-created-phone="${safe(item.phone)}">
            ${safe(item.fullName || "Prestataire")} · ${safe(item.service || "Métier")} · ${safe(item.phone)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function openCreatedProviderByPhone(phone = "") {
  const canonical = canonicalPhoneForMatch(phone);
  if (!canonical) return;
  setProviderEntryMode("existing");
  const form = document.querySelector("#providerIdentifyForm");
  const input = form?.elements?.namedItem("providerPhone");
  if (!form || !input) return;
  input.value = phone;
  renderProviderIdentityStatus(`<strong>Recherche du profil</strong><p>Vérification de ${safe(phone)} dans Zeyds...</p>`);
  if (typeof form.requestSubmit === "function") form.requestSubmit();
  else form.querySelector("button[type='submit']")?.click();
}

function renderProviderIdentityStatus(message = "") {
  const root = document.querySelector("#providerIdentityStatus");
  if (!root) return;
  root.innerHTML = message || `
    <strong>Nouveau prestataire</strong>
    <p>Si vous avez déjà un profil Zeyds, identifiez-vous avec le même numéro pour renouveler au lieu de recréer un compte.</p>
    ${recentProviderSignupsHtml()}
  `;
  root.querySelector("[data-clear-provider-identity]")?.addEventListener("click", () => clearProviderIdentification());
  root.querySelectorAll("[data-open-created-phone]").forEach((button) => {
    button.addEventListener("click", () => openCreatedProviderByPhone(button.dataset.openCreatedPhone || ""));
  });
}

function renderProviderEntryMode() {
  const mode = providerSignupSessionActive ? "new" : (state.providerEntryMode === "existing" ? "existing" : "new");
  const view = document.querySelector("#view-provider");
  if (!view) return;
  view.classList.toggle("provider-mode-existing", mode === "existing");
  view.classList.toggle("provider-mode-new", mode !== "existing");
  view.querySelectorAll("[data-provider-entry]").forEach((button) => {
    const selected = button.dataset.providerEntry === mode;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
}

function resetProviderSignupForm() {
  const form = document.querySelector("#providerForm");
  if (!form) return;
  form.reset();
  form.querySelectorAll("input:not([type='checkbox']):not([type='radio']), textarea").forEach((field) => {
    field.value = "";
  });
  form.querySelectorAll("input[type='file']").forEach((field) => {
    field.value = "";
  });
  form.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach((field) => {
    field.checked = false;
  });
  const service = form.querySelector("[name='service']");
  if (service) service.value = "";
  form.dataset.submitting = "false";
  const button = form.querySelector("button[type='submit']");
  if (button) {
    button.disabled = false;
    button.textContent = "Créer mon profil";
  }
  const status = document.querySelector("#providerCreateStatus");
  if (status) {
    status.hidden = true;
    status.innerHTML = "";
  }
  resetMobileFormWizard(form);
}

function prepareNextProviderSignup(providerName = "", serviceName = "", options = {}) {
  providerSignupSessionActive = true;
  state.providerEntryMode = "new";
  state.identifiedProviderId = "";
  state.selectedPaymentProviderId = "";
  state.deliveryLiveProviderId = "";
  const identifyForm = document.querySelector("#providerIdentifyForm");
  if (identifyForm) identifyForm.reset();
  resetProviderSignupForm();
  saveState();
  renderProviderEntryMode();
  renderPaymentProviderOptions();
  renderProviderDeliveryQueue();

  const showConfirmation = () => {
    if (options.serviceAddedTo) {
      renderProviderIdentityStatus(`
        <strong>Service ajouté au profil</strong>
        <p>${safe(serviceName)} est maintenant associé à ${safe(options.serviceAddedTo)}. Dossier ${safe(options.submissionReference || "en cours")}. Ce profil propose ${Number(options.serviceCount || 1)} service(s). La fiche est vierge pour le test suivant.</p>
        <button class="primary" type="button" data-open-created-phone="${safe(options.phone || "")}">Ouvrir le profil</button>
        ${recentProviderSignupsHtml()}
      `);
      renderProviderStatus(`Service ${safe(serviceName)} ajouté sans dupliquer le profil ${safe(options.serviceAddedTo)}.`);
      renderProviderCreateStatus(`Le service ${serviceName} a été ajouté à ${options.serviceAddedTo}. La fiche est prête pour un nouveau test.`, "success");
      return;
    }
    if (options.duplicateName) {
      renderProviderIdentityStatus(`
        <strong>Numéro déjà utilisé</strong>
        <p>Ce numéro principal appartient déjà à ${safe(options.duplicateName)}. La fiche reste ouverte : utilisez un autre numéro pour le prochain profil.</p>
      `);
      renderProviderStatus(`Numéro déjà associé à ${safe(options.duplicateName)}. Modifiez le téléphone principal puis créez le nouveau profil.`);
      renderProviderCreateStatus(`Ce numéro principal appartient déjà à ${options.duplicateName}. Utilisez un autre numéro pour créer le prochain profil.`, "error");
      return;
    }
    renderProviderIdentityStatus(`
      <strong>Inscription terminée</strong>
      <p>${safe(providerName)} a bien été enregistré. Dossier ${safe(options.submissionReference || "en cours")}. La fiche est maintenant vierge pour inscrire immédiatement un autre prestataire.</p>
      <button class="primary" type="button" data-open-created-phone="${safe(options.phone || "")}">Ouvrir le profil créé</button>
      ${recentProviderSignupsHtml()}
    `);
    renderProviderStatus(`Profil créé pour le métier ${safe(serviceName)}. La fiche a été vidée automatiquement. Synchronisation Supabase en cours en arrière-plan.`);
    renderProviderCreateStatus(`Le profil de ${providerName} a bien été créé. La fiche est prête pour une nouvelle inscription.`, "success");
  };
  showConfirmation();

  window.requestAnimationFrame(() => {
    if (!providerSignupSessionActive) return;
    resetProviderSignupForm();
    renderProviderEntryMode();
    showConfirmation();
  });
}

function renderProviderCreateStatus(message = "", type = "info") {
  const status = document.querySelector("#providerCreateStatus");
  if (!status) return;
  status.hidden = !message;
  status.classList.toggle("error", type === "error");
  status.classList.toggle("success", type === "success");
  status.innerHTML = message ? `<strong>${type === "error" ? "À corriger" : "Inscription Zeyds"}</strong><p>${safe(message)}</p>` : "";
}

function reportProviderSignupIssue(form, button, message, fieldName = "") {
  renderProviderCreateStatus(message, "error");
  renderProviderStatus(message);
  form.dataset.submitting = "false";
  finishActionButton(button, "Corriger");
  const field = fieldName ? form.elements.namedItem(fieldName) : null;
  if (field) {
    revealMobileFormField(form, field);
    if (fieldName === "phone" && typeof field.select === "function") {
      window.setTimeout(() => field.select(), 180);
    }
  }
}

function setProviderEntryMode(mode = "new", options = {}) {
  state.providerEntryMode = mode === "existing" ? "existing" : "new";
  providerSignupSessionActive = state.providerEntryMode === "new";
  if (state.providerEntryMode === "new" && !options.keepIdentification) {
    state.identifiedProviderId = "";
    state.selectedPaymentProviderId = "";
    if (options.resetForm) resetProviderSignupForm();
  }
  saveState();
  renderProviderEntryMode();
  renderPaymentProviderOptions();
  renderProviderDeliveryQueue();
  if (options.focus) {
    document.querySelector(options.focus)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderEventEntryMode() {
  const mode = state.selectedEventEntryMode === "promote" ? "promote" : "tickets";
  const view = document.querySelector("#view-events");
  if (!view) return;
  view.classList.toggle("event-mode-promote", mode === "promote");
  view.classList.toggle("event-mode-tickets", mode !== "promote");
  view.querySelectorAll("[data-event-entry]").forEach((button) => {
    const selected = button.dataset.eventEntry === mode;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
}

function setEventEntryMode(mode = "tickets", options = {}) {
  state.selectedEventEntryMode = mode === "promote" ? "promote" : "tickets";
  const form = document.querySelector("#eventForm");
  if (state.selectedEventEntryMode === "promote" && form?.dataset.dirty !== "true") {
    state.selectedEventPlanId = "standard";
    const cityField = form.elements.namedItem("city");
    if (cityField && !cityField.value) cityField.value = defaultEventCity();
    resetMobileFormWizard(form);
  }
  saveState();
  renderEventEntryMode();
  renderEvents();
  renderEventPaymentOptions();
  if (options.focus) {
    document.querySelector(options.focus)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderJobEntryMode() {
  const mode = state.selectedJobEntryMode === "publish" ? "publish" : "search";
  const view = document.querySelector("#view-jobs");
  if (!view) return;
  view.classList.toggle("job-mode-publish", mode === "publish");
  view.classList.toggle("job-mode-search", mode !== "publish");
  view.querySelectorAll("[data-job-entry]").forEach((button) => {
    const selected = button.dataset.jobEntry === mode;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
}

function setJobEntryMode(mode = "search", options = {}) {
  state.selectedJobEntryMode = mode === "publish" ? "publish" : "search";
  saveState();
  renderJobEntryMode();
  renderJobs();
  if (options.focus) {
    document.querySelector(options.focus)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderDeliveryEntryMode() {
  const mode = state.selectedDeliveryEntryMode === "courier" ? "courier" : "request";
  const view = document.querySelector("#view-delivery");
  if (!view) return;
  view.classList.toggle("delivery-mode-courier", mode === "courier");
  view.classList.toggle("delivery-mode-request", mode !== "courier");
  view.querySelectorAll("[data-delivery-entry]").forEach((button) => {
    const selected = button.dataset.deliveryEntry === mode;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
}

function setDeliveryEntryMode(mode = "request", options = {}) {
  state.selectedDeliveryEntryMode = mode === "courier" ? "courier" : "request";
  saveState();
  renderDeliveryEntryMode();
  renderDelivery();
  if (options.focus) {
    document.querySelector(options.focus)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setProviderServiceSelect(serviceName = "Zeyds Livraison") {
  const providerService = document.querySelector("#providerService");
  if (!providerService) return;
  const canonical = canonicalServiceName(serviceName);
  const option = [...providerService.options].find((item) => canonicalServiceName(item.value || item.textContent) === canonical);
  providerService.value = option ? option.value || option.textContent : "";
}

function openCourierProfileCreation() {
  providerSignupSessionActive = true;
  const service = document.querySelector("#deliveryRequestType")?.value === "ride" ? "Chauffeur" : "Zeyds Livraison";
  state.selectedService = service;
  state.providerEntryMode = "new";
  state.identifiedProviderId = "";
  state.selectedPaymentProviderId = "";
  saveState();
  setView("provider");
  renderProviderEntryMode();
  setProviderServiceSelect(service);
  renderProviderIdentityStatus(`
    <strong>Profil livreur ou chauffeur Zeyds</strong>
    <p>Remplissez le formulaire avec votre numéro principal. Le métier “${safe(service)}” est prêt à recevoir les missions locales payées.</p>
  `);
  renderProviderStatus("Créez votre profil. Après inscription, Zeyds pourra vous proposer les livraisons ou courses compatibles proches de vous.");
  document.querySelector(".provider-create-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openCourierRenewal() {
  providerSignupSessionActive = false;
  state.selectedService = document.querySelector("#deliveryRequestType")?.value === "ride" ? "Chauffeur" : "Zeyds Livraison";
  state.providerEntryMode = "existing";
  saveState();
  setView("provider");
  renderProviderEntryMode();
  renderPaymentProviderOptions();
  renderProviderIdentityStatus(`
    <strong>Déjà livreur Zeyds ?</strong>
    <p>Identifiez-vous avec le même numéro que votre profil livreur, puis renouvelez votre visibilité si nécessaire.</p>
  `);
  renderProviderStatus("Entrez votre téléphone ou WhatsApp pour retrouver votre profil livreur et éviter de recréer un compte.");
  document.querySelector(".provider-entry-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectProviderForRenewal(provider, message = "") {
  if (!provider) return;
  providerSignupSessionActive = false;
  state.identifiedProviderId = provider.id;
  state.selectedPaymentProviderId = provider.id;
  state.providerEntryMode = "existing";
  saveState();
  renderProviderEntryMode();
  renderPaymentProviderOptions();
  renderProviderStatus(message || `Profil identifié : ${safe(provider.fullName)}. Choisissez un forfait puis envoyez la référence de paiement.`);
  renderProviderDeliveryQueue();
  renderProviderIdentityStatus(`
    <strong>Profil retrouvé</strong>
    <p>${safe(provider.fullName)} - ${safe(provider.service || "Métier à préciser")} - ${safe(provider.phone || "contact déjà enregistré")}.</p>
    <p>Vous pouvez renouveler ou booster ce profil sans recréer un nouveau mois gratuit.</p>
    <button class="secondary compact-action" type="button" data-clear-provider-identity>Changer de numéro</button>
  `);
  document.querySelector(".provider-renew-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isVerified(provider) {
  return provider.verificationStatus === "verified";
}

function verificationBadge(provider) {
  if (isVerified(provider)) return `<span class="tag verified">Vérifié Zeyds</span>`;
  if (provider.verificationStatus === "pending") return `<span class="tag pending">Vérification en cours</span>`;
  return "";
}

function isPlaceholderServiceName(serviceName = "") {
  const normalized = normalizeAssistantText(serviceName);
  return !normalized || ["choisir metier", "choisir un metier", "metier a preciser", "service bizzi"].includes(normalized);
}

function isEmergencyService(serviceName = "") {
  return EMERGENCY_SERVICES.has(canonicalServiceName(serviceName));
}

function serviceMatchGroup(serviceName = "") {
  const service = canonicalServiceName(serviceName);
  if (INTERNATIONAL_LOGISTICS_SERVICES.includes(service)) return INTERNATIONAL_LOGISTICS_SERVICES;
  if (DELIVERY_SERVICES.includes(service)) return [service];
  return [service];
}

function serviceMatches(selectedService = "", providerService = "") {
  return serviceMatchGroup(selectedService).includes(canonicalServiceName(providerService));
}

function providerServiceNames(provider = {}) {
  return [...new Set([
    provider.service,
    ...(Array.isArray(provider.services) ? provider.services : []),
  ].map((service) => canonicalServiceName(service)).filter((service) => !isPlaceholderServiceName(service)))];
}

function providerOffersService(provider, selectedService = "") {
  return providerServiceNames(provider).some((service) => serviceMatches(selectedService, service));
}

function providerServicesLabel(provider = {}) {
  return providerServiceNames(provider).join(" · ") || "Métier à préciser";
}

function addProviderService(provider, serviceName = "") {
  const service = canonicalServiceName(serviceName);
  if (!provider || isPlaceholderServiceName(service)) return false;
  const services = providerServiceNames(provider);
  if (services.some((item) => normalizedCatalogKey(item) === normalizedCatalogKey(service))) return false;
  provider.services = [...services, service];
  if (isPlaceholderServiceName(provider.service)) provider.service = service;
  return true;
}

function providerBoostActive(provider) {
  return provider.boostEndsAt && new Date(provider.boostEndsAt).getTime() > Date.now();
}

function providerBoostBadge(provider) {
  return providerBoostActive(provider) ? `<span class="tag pending">Boosté</span>` : "";
}

function applyPaymentBoost(provider, payment = {}) {
  const boost = boostFromPayment(payment);
  if (!provider || !boost?.days) return;
  provider.boostEndsAt = extendExpiryIso(provider.boostEndsAt, { days: boost.days });
}

function applyApprovedPaymentBenefits(provider, payment = {}) {
  if (!provider || payment.benefitsAppliedAt) return false;
  provider.status = "approved";
  provider.visibility = "active";
  provider.subscriptionEndsAt = extendExpiryIso(provider.subscriptionEndsAt, {
    months: planMonths(payment.plan),
  });
  applyPaymentBoost(provider, payment);
  payment.benefitsAppliedAt = new Date().toISOString();
  return true;
}

function providerReliabilityScore(provider) {
  const rating = Math.max(0, Math.min(5, Number(provider.rating || 0)));
  const reviewCount = Number(provider.reviewCount || 0);
  const positive = Number(provider.positiveFeedback || 0);
  const noAnswer = Number(provider.noAnswerFeedback || 0);
  const wrongNumber = Number(provider.wrongNumberFeedback || 0);
  const contacts = Number(provider.contactClicks || 0) + Number(provider.callClicks || 0) + Number(provider.whatsappClicks || 0);
  const base = 42;
  const verification = isVerified(provider) ? 20 : provider.verificationStatus === "pending" ? 8 : 0;
  const ratingScore = rating ? Math.round((rating / 5) * 18) : 6;
  const reviewScore = Math.min(10, reviewCount * 2);
  const contactScore = Math.min(8, Math.floor(contacts / 3));
  const feedbackScore = Math.min(8, positive * 2) - Math.min(18, noAnswer * 4 + wrongNumber * 9);
  const subscriptionScore = provider.visibility === "active" ? 6 : 0;
  const boostScore = providerBoostActive(provider) ? 5 : 0;
  return Math.max(0, Math.min(100, base + verification + ratingScore + reviewScore + contactScore + feedbackScore + subscriptionScore + boostScore));
}

function reliabilityInfo(provider) {
  const score = providerReliabilityScore(provider);
  if (score >= 85) return { score, label: "Fiabilité forte", className: "reliable-high" };
  if (score >= 70) return { score, label: "Fiable", className: "reliable-mid" };
  if (score >= 55) return { score, label: "À confirmer", className: "reliable-low" };
  return { score, label: "Nouveau profil", className: "reliable-low" };
}

function reliabilityBadge(provider) {
  const info = reliabilityInfo(provider);
  return `<span class="tag reliability ${info.className}">Score ${info.score}/100 - ${safe(info.label)}</span>`;
}

function toggleFavorite(providerId) {
  state.favorites = [];
  saveState();
  renderProviders();
  renderDelivery();
}

function rememberRecentProvider(providerId) {
  state.recentProviders = [];
  saveState();
}

const views = {
  home: document.querySelector("#view-home"),
  life: document.querySelector("#view-life"),
  "exception-places": document.querySelector("#view-exception-places"),
  delivery: document.querySelector("#view-delivery"),
  food: document.querySelector("#view-food"),
  events: document.querySelector("#view-events"),
  eventDetail: document.querySelector("#view-event-detail"),
  search: document.querySelector("#view-search"),
  jobs: document.querySelector("#view-jobs"),
  request: document.querySelector("#view-request"),
  profile: document.querySelector("#view-profile"),
  provider: document.querySelector("#view-provider"),
  admin: document.querySelector("#view-admin"),
  legal: document.querySelector("#view-legal"),
};

const titles = {
  home: "Bienvenue sur Zeyds",
  life: "Zeyds Life",
  "exception-places": "Lieux d’exception",
  delivery: "Zeyds Livraison et course",
  food: "Zeyds Food",
  events: "Événements",
  eventDetail: "Détail événement",
  search: "Rechercher un service",
  jobs: "Emplois & missions",
  request: "Demande express",
  profile: "Fiche prestataire",
  provider: "Espace prestataire",
  admin: "Administration",
  legal: "Documents légaux",
};

function setView(name) {
  const previousName = Object.entries(views).find(([, element]) => element?.classList.contains("active"))?.[0] || "";
  if (name === "admin" && !canOpenAdmin()) {
    history.replaceState(null, "", "#home");
    name = "home";
  }
  if (["search", "delivery"].includes(name) && !clientIdentityReady()) {
    const reason = name === "delivery"
      ? "accéder aux courses et livraisons"
      : "accéder à la recherche de services";
    openClientAccessGate(name, reason);
    return false;
  }
  if (name === "profile" && !document.querySelector("#profileContent")?.innerHTML.trim()) {
    name = "search";
  }
  if (name === "eventDetail" && !state.selectedEventId) {
    name = "events";
  }
  Object.entries(views).forEach(([key, el]) => el.classList.toggle("active", key === name));
  document.querySelectorAll(".nav-link,.bottom-link").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === name);
  });
  document.querySelector("#pageTitle").textContent = titles[name] || "Zeyds";
  globalThis.BizziMotion?.viewChanged?.({ from: previousName, to: name, view: views[name] });
  window.scrollTo(0, 0);
  if (name === "home") renderHomeDiscovery();
  if (name === "life") globalThis.BizziLife?.render?.();
  if (name === "exception-places") renderExceptionPlaces();
  if (name === "admin") renderAdmin();
  if (name === "delivery") {
    selectDeliveryService({ clearSearch: true });
    renderDelivery();
  }
  if (name === "food") renderFood();
  if (name === "search") renderProviders();
  if (name === "jobs") renderJobs();
  if (name === "events") renderEvents();
  if (name === "eventDetail") renderEventDetail();
  if (location.hash.slice(1) !== name) {
    history.replaceState(null, "", `#${name}`);
  }
  return true;
}

function openViewFromLocation() {
  const adminEntryConsumed = consumeAdminEntry();
  const requestedView = adminEntryConsumed ? "admin" : location.hash.slice(1);
  if (views[requestedView]) {
    setView(requestedView);
    return true;
  }
  return false;
}

function canOpenAdmin() {
  return adminUnlocked || isSecureAdminPath() || hasSecureAdminHash() || safeSessionGet(ADMIN_ENTRY_KEY) === "true";
}

function unlockAdminFromSecureEntry() {
  if (adminUnlocked) return false;
  if (safeSessionGet(ADMIN_ENTRY_KEY) !== "true") return false;
  adminUnlocked = true;
  safeSessionSet(ADMIN_UNLOCK_KEY, "true");
  return true;
}

function consumeAdminEntry() {
  const url = new URL(location.href);
  const secureAdminPath = isSecureAdminPath();
  const hasAdminQuery = url.searchParams.get("admin") === "1";
  const secureAdminHash = url.hash === "#admin";
  if (!hasAdminQuery && !secureAdminPath && !secureAdminHash) return false;
  const secureAdminEntry = url.searchParams.get("entry") === "admin-access";
  const secureAdminOpen = url.searchParams.get("open") === "admin";
  const isAllowedAdminEntry = secureAdminPath || secureAdminHash || secureAdminEntry || secureAdminOpen || bizziConfig.admin?.allowQueryEntry === true;
  if (isAllowedAdminEntry) {
    adminUnlocked = true;
    safeSessionSet(ADMIN_ENTRY_KEY, "true");
    safeSessionSet(ADMIN_UNLOCK_KEY, "true");
  }
  if (hasAdminQuery || url.searchParams.has("entry") || url.searchParams.has("open") || url.searchParams.has("t")) {
    url.searchParams.delete("admin");
    url.searchParams.delete("entry");
    url.searchParams.delete("open");
    url.searchParams.delete("t");
    if (isAllowedAdminEntry) url.hash = "admin";
    history.replaceState(null, "", url.href);
  }
  return isAllowedAdminEntry;
}

function allServices() {
  return state.categories.flatMap((category) => category.services.map((name) => ({ name, category: category.name })));
}

function alphabeticalServices() {
  return [...allServices()].sort((left, right) => left.name.localeCompare(right.name, "fr", {
    sensitivity: "base",
    ignorePunctuation: true,
  }));
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "BZ";
}

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[char]);
}

function normalizeContactDigits(value = "") {
  return String(value || "").replace(/\D/g, "");
}

function isValidContactPhone(value = "") {
  const digits = normalizeContactDigits(value);
  return digits.length >= 8 && digits.length <= 15;
}

function contactValidationMessage(label = "contact") {
  return `Renseignez un ${label} valide avec au moins 8 chiffres.`;
}

function normalizeClientName(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40);
}

function isValidClientName(value = "") {
  const name = normalizeClientName(value);
  return name.length >= 2 && /[A-Za-zÀ-ÿ0-9]/.test(name);
}

function currentClientName() {
  const inputs = [
    document.querySelector("#searchClientNameInput"),
    document.querySelector("#deliveryClientNameInput"),
    document.querySelector("#clientAccessNameInput"),
  ];
  const inputValue = inputs.map((input) => normalizeClientName(input?.value)).find(isValidClientName);
  const name = inputValue || normalizeClientName(state.clientName);
  return isValidClientName(name) ? name : "";
}

function currentClientPhone() {
  const inputs = [
    document.querySelector("#searchClientPhoneInput"),
    document.querySelector("#deliveryRequestForm [name='phone']"),
    document.querySelector("#clientAccessPhoneInput"),
  ];
  const inputValue = inputs.map((input) => String(input?.value || "").trim()).find(isValidContactPhone);
  const phone = String(inputValue || state.clientPhone || "").trim();
  return isValidContactPhone(phone) ? phone : "";
}

function rememberClientIdentity(clientName = "", phone = "") {
  const name = normalizeClientName(clientName);
  const value = String(phone || "").trim();
  if (!isValidClientName(name) || !isValidContactPhone(value)) return null;
  state.clientName = name;
  state.clientPhone = value;
  ["#searchClientNameInput", "#deliveryClientNameInput", "#clientAccessNameInput"].forEach((selector) => {
    const input = document.querySelector(selector);
    if (input && input.value !== name) input.value = name;
  });
  ["#searchClientPhoneInput", "#deliveryRequestForm [name='phone']", "#clientAccessPhoneInput"].forEach((selector) => {
    const input = document.querySelector(selector);
    if (input && input.value !== value) input.value = value;
  });
  saveState();
  return { name, phone: value };
}

function rememberClientPhone(phone = "") {
  const identity = rememberClientIdentity(currentClientName() || state.clientName, phone);
  if (identity) return identity.phone;
  const value = String(phone || "").trim();
  if (!isValidContactPhone(value)) return "";
  state.clientPhone = value;
  saveState();
  return value;
}

function clientIdentityReady() {
  return Boolean(isValidClientName(currentClientName()) && isValidContactPhone(currentClientPhone()));
}

let pendingClientAccessView = "";
let pendingClientAccessAction = null;

function closeClientAccessGate() {
  const dialog = document.querySelector("#clientAccessDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function" && dialog.open) dialog.close();
  dialog.removeAttribute("open");
  pendingClientAccessView = "";
  pendingClientAccessAction = null;
}

function openClientAccessGate(targetView = "search", reason = "continuer", onSuccess = null) {
  const dialog = document.querySelector("#clientAccessDialog");
  if (!dialog) return false;
  pendingClientAccessView = ["search", "delivery"].includes(targetView) ? targetView : "search";
  pendingClientAccessAction = typeof onSuccess === "function" ? onSuccess : null;
  const nameInput = document.querySelector("#clientAccessNameInput");
  const phoneInput = document.querySelector("#clientAccessPhoneInput");
  const reasonRoot = document.querySelector("#clientAccessReason");
  const status = document.querySelector("#clientAccessStatus");
  if (nameInput) nameInput.value = currentClientName() || state.clientName || "";
  if (phoneInput) phoneInput.value = currentClientPhone() || state.clientPhone || "";
  if (reasonRoot) reasonRoot.textContent = `Ajoutez votre prénom ou un pseudo et votre numéro de téléphone pour ${reason}. Aucun mot de passe n’est nécessaire.`;
  if (status) status.textContent = "";
  if (typeof dialog.showModal === "function") {
    if (!dialog.open) dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
  window.setTimeout(() => (isValidClientName(nameInput?.value) ? phoneInput : nameInput)?.focus(), 50);
  return false;
}

function requireClientIdentityForAccess(reason = "accéder aux services", targetView = "search") {
  const identity = rememberClientIdentity(currentClientName(), currentClientPhone());
  if (identity) return identity;
  openClientAccessGate(targetView, reason);
  return null;
}

function requireClientPhoneForAccess(reason = "accéder aux prestataires") {
  return requireClientIdentityForAccess(reason, "search")?.phone || "";
}

function setupClientAccessGate() {
  const form = document.querySelector("#clientAccessForm");
  const dialog = document.querySelector("#clientAccessDialog");
  const closeButton = document.querySelector("#closeClientAccessDialog");
  if (!form || !dialog) return;
  closeButton?.addEventListener("click", closeClientAccessGate);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeClientAccessGate();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = normalizeClientName(data.get("clientName"));
    const phone = String(data.get("clientPhone") || "").trim();
    const status = document.querySelector("#clientAccessStatus");
    if (!isValidClientName(name)) {
      if (status) status.textContent = "Ajoutez un prénom ou un pseudo d’au moins 2 caractères.";
      document.querySelector("#clientAccessNameInput")?.focus();
      return;
    }
    if (!isValidContactPhone(phone)) {
      if (status) status.textContent = contactValidationMessage("numéro de téléphone");
      document.querySelector("#clientAccessPhoneInput")?.focus();
      return;
    }
    const targetView = pendingClientAccessView || "search";
    const successAction = pendingClientAccessAction;
    rememberClientIdentity(name, phone);
    closeClientAccessGate();
    if (successAction) {
      window.setTimeout(successAction, 80);
      return;
    }
    setView(targetView);
    window.setTimeout(() => {
      document.querySelector(targetView === "delivery" ? "#deliveryRequestForm [name='pickup']" : "#searchAssistantInput")?.focus();
    }, 80);
  });
}

function safeExternalUrl(value = "", options = {}) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.length > 420) return "";
  const normalized = /^https?:\/\//i.test(raw) ? raw : options.addHttps === false ? raw : `https://${raw}`;
  try {
    const url = new URL(normalized);
    if (!["https:", "http:"].includes(url.protocol)) return "";
    if (!url.hostname || url.hostname.includes("..")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function safeMailtoHref(email = "") {
  const value = String(email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `mailto:${value}` : "";
}

function supabaseConfigured() {
  return hasProductionValue(bizziConfig.supabase?.url) && hasProductionValue(bizziConfig.supabase?.anonKey);
}

function supabaseRestUrl(resource) {
  const baseUrl = String(bizziConfig.supabase?.url || "").replace(/\/+$/, "");
  const cleanResource = String(resource || "").replace(/^\/+/, "").replace(/ /g, "%20");
  try {
    return new URL(cleanResource, `${baseUrl}/rest/v1/`).toString();
  } catch {
    return `${baseUrl}/rest/v1/${encodeURI(cleanResource)}`;
  }
}

function supabaseBaseUrl() {
  return String(bizziConfig.supabase?.url || "").replace(/\/+$/, "");
}

function supabaseApiHeaders(extra = {}, accessToken = "") {
  const key = bizziConfig.supabase?.anonKey || "";
  const headers = {
    apikey: key,
    "X-Bizzi-Client-Token": BizziPrivacy.token(),
    ...extra,
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (key && !key.startsWith("sb_publishable_")) {
    headers.Authorization = `Bearer ${key}`;
  }
  return headers;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = SUPABASE_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      cache: options.cache || "no-store",
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    captureBizziError(error, { module: "fetchWithTimeout", url: String(url || "").slice(0, 160) });
    if (error?.name === "AbortError") {
      throw new Error("Supabase ne répond pas assez vite. Vérifiez la connexion puis cliquez sur Charger validations Supabase.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function waitMs(ms = 300) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function withTimeout(promise, ms, message) {
  let timeoutId = 0;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

async function supabaseRequest(resource, options = {}) {
  if (!supabaseConfigured()) {
    throw new Error("Configuration Supabase absente");
  }
  const headers = supabaseApiHeaders({
    Accept: "application/json",
    ...(options.headers || {}),
  }, options.accessToken || "");
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetchWithTimeout(supabaseRestUrl(resource), {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  }, options.timeoutMs || SUPABASE_REQUEST_TIMEOUT_MS);
  if (!response.ok) {
    let message = `Supabase ${response.status}`;
    try {
      const payload = await response.json();
      message = payload.message || payload.error || message;
    } catch {
      try {
        message = await response.text() || message;
      } catch {
      }
    }
    throw new Error(message);
  }
  if (response.status === 204) {
    return null;
  }
  const responseText = await response.text();
  if (!responseText.trim()) return null;
  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("Supabase a renvoyé une réponse illisible. L'opération peut néanmoins avoir été enregistrée : rechargez les données avant de réessayer.");
  }
}

async function supabaseFetch(resource) {
  return supabaseRequest(resource);
}

function loadAdminAuthSession() {
  try {
    const parsed = JSON.parse(safeSessionGet(ADMIN_AUTH_SESSION_KEY) || "null");
    if (!parsed?.accessToken || !parsed?.expiresAt || parsed.expiresAt <= Date.now()) {
      safeSessionRemove(ADMIN_AUTH_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    safeSessionRemove(ADMIN_AUTH_SESSION_KEY);
    return null;
  }
}

function saveAdminAuthSession(session) {
  adminAuthSession = session;
  if (session) {
    safeSessionSet(ADMIN_AUTH_SESSION_KEY, JSON.stringify(session));
  } else {
    safeSessionRemove(ADMIN_AUTH_SESSION_KEY);
  }
}

function requireAdminAccessToken() {
  adminAuthSession = loadAdminAuthSession();
  if (!adminAuthSession?.accessToken) {
    throw new Error("Connectez-vous avec un compte admin Supabase.");
  }
  return adminAuthSession.accessToken;
}

async function supabaseAdminRequest(resource, options = {}) {
  return supabaseRequest(resource, {
    ...options,
    accessToken: requireAdminAccessToken(),
  });
}

async function supabaseRpc(name, payload = {}, options = {}) {
  if (!supabaseConfigured()) {
    throw new Error("Configuration Supabase absente");
  }
  const response = await fetchWithTimeout(`${supabaseBaseUrl()}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: supabaseApiHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=minimal",
      ...(options.headers || {}),
    }, options.accessToken || ""),
    body: JSON.stringify(payload),
  }, options.timeoutMs || SUPABASE_REQUEST_TIMEOUT_MS);
  if (!response.ok) {
    let message = `Supabase RPC ${response.status}`;
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {
      try {
        message = await response.text() || message;
      } catch {
      }
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function exactProviderSearchService(query = "") {
  const inferred = String(query || "").trim() ? inferAssistantService(query) : null;
  return inferred?.name && !inferred.uncertain ? canonicalServiceName(inferred.name) : "";
}

function syncTypedProviderSearchIntent(query = "") {
  const serviceName = exactProviderSearchService(query);
  if (!serviceName) return "";
  const service = allServices().find((item) => item.name === serviceName);
  if (!service) return "";
  state.selectedService = service.name;
  state.selectedCategory = service.category;
  state.selectedRadius = 0;
  state.selectedVerifiedOnly = false;
  const categorySelect = document.querySelector("#categorySelect");
  const radiusSelect = document.querySelector("#radiusSelect");
  const verifiedOnly = document.querySelector("#verifiedOnly");
  if (categorySelect) categorySelect.value = state.selectedCategory;
  if (radiusSelect) radiusSelect.value = "0";
  if (verifiedOnly) verifiedOnly.checked = false;
  return service.name;
}

function providerDirectoryRequest() {
  const rawQuery = String(document.querySelector("#searchInput")?.value || "").trim();
  const exactService = exactProviderSearchService(rawQuery);
  const selectedCity = currentCity();
  const city = ["Toute la Côte d'Ivoire", "Autre ville / commune"].includes(selectedCity) ? "" : selectedCity;
  const service = exactService || (rawQuery ? "" : canonicalServiceName(state.selectedService || ""));
  const query = exactService ? "" : rawQuery;
  const request = {
    query,
    city,
    service,
    exactService,
    verifiedOnly: Boolean(state.selectedVerifiedOnly),
  };
  request.signature = JSON.stringify(request);
  return request;
}

async function fetchLegacyPublicProviderPage() {
  const providerView = bizziConfig.supabase?.publicProviderView || "public_provider_directory";
  const limit = Math.min(PROVIDER_DIRECTORY_PAGE_SIZE, 50);
  let rows;
  try {
    rows = await supabaseFetch(`${providerView}?select=*&order=boost_ends_at.desc.nullslast,is_verified.desc,average_rating.desc,id.asc&limit=${limit}`);
  } catch {
    rows = await supabaseFetch(`${providerView}?select=*&order=is_verified.desc,average_rating.desc,id.asc&limit=${limit}`);
  }
  return {
    items: Array.isArray(rows) ? rows : [],
    hasMore: false,
    nextCursor: null,
    mode: "legacy_limited",
  };
}

async function fetchPublicProviderDirectoryPage(request, cursor = null) {
  try {
    const runSearch = async (searchRequest) => {
      const payload = await supabaseRpc("bizzi_search_public_providers", {
        p_search: searchRequest.query,
        p_city: searchRequest.city,
        p_service: searchRequest.service,
        p_verified_only: searchRequest.verifiedOnly,
        p_emergency_only: false,
        p_after: cursor || {},
        p_limit: PROVIDER_DIRECTORY_PAGE_SIZE,
      }, { prefer: "return=representation" });
      return Array.isArray(payload) ? payload[0] : payload;
    };
    const effectiveRequest = cursor && providerDirectoryState.fallbackNationwide
      ? { ...request, city: "" }
      : request;
    let result = await runSearch(effectiveRequest);
    let fallbackNationwide = Boolean(cursor && providerDirectoryState.fallbackNationwide);
    if (!cursor && request.exactService && request.city && !result?.items?.length) {
      result = await runSearch({ ...request, city: "" });
      fallbackNationwide = true;
    }
    return {
      items: Array.isArray(result?.items) ? result.items : [],
      hasMore: Boolean(result?.has_more),
      nextCursor: result?.next_cursor || null,
      mode: "server_cursor",
      fallbackNationwide,
    };
  } catch (error) {
    if (cursor) throw error;
    const fallback = await fetchLegacyPublicProviderPage();
    return {
      ...fallback,
      fallbackError: friendlySupabaseError(error),
      fallbackNationwide: false,
    };
  }
}

function dedupeProviderDirectoryItems(items = []) {
  return dedupeEntityRecords(items, "provider").items;
}

function mergeProviderDirectoryIntoState() {
  const identifiedId = state.identifiedProviderId;
  const preserved = state.providers.filter((provider) => (
    provider.id === identifiedId
    || (provider.remoteStatus !== "linked" && !String(provider.id || "").startsWith("sb-"))
  ));
  state.providers = dedupeProviderDirectoryItems([
    ...providerDirectoryState.items,
    ...preserved,
  ]);
}

async function loadProviderDirectoryPage({ reset = true } = {}) {
  if (!supabaseConfigured()) return;
  const request = providerDirectoryRequest();
  if (!reset && (!providerDirectoryState.hasMore || providerDirectoryState.loading)) return;
  const requestId = ++providerDirectoryRequestId;
  const cursor = reset ? null : providerDirectoryState.cursor;
  providerDirectoryState.loading = true;
  providerDirectoryState.pendingSignature = request.signature;
  providerDirectoryState.error = "";
  renderProviders();
  try {
    const result = await fetchPublicProviderDirectoryPage(request, cursor);
    if (requestId !== providerDirectoryRequestId) return;
    const page = result.items.map((row, index) => providerFromSupabase(row, index));
    const combined = reset ? page : dedupeProviderDirectoryItems([...providerDirectoryState.items, ...page]);
    providerDirectoryState.items = combined.length > PROVIDER_DIRECTORY_MAX_SESSION_ITEMS
      ? combined.slice(-PROVIDER_DIRECTORY_MAX_SESSION_ITEMS)
      : combined;
    providerDirectoryState.cursor = result.nextCursor;
    providerDirectoryState.hasMore = result.hasMore;
    providerDirectoryState.loadedCount = reset
      ? page.length
      : providerDirectoryState.loadedCount + page.length;
    providerDirectoryState.signature = request.signature;
    providerDirectoryState.mode = result.mode;
    providerDirectoryState.fallbackNationwide = Boolean(result.fallbackNationwide);
    providerDirectoryState.error = result.fallbackError
      ? `Pagination SQL V250 non installée : affichage de secours limité. ${result.fallbackError}`
      : "";
    mergeProviderDirectoryIntoState();
    refreshAssistantProviderSelectionFromDirectory();
  } catch (error) {
    if (requestId !== providerDirectoryRequestId) return;
    if (reset) {
      providerDirectoryState.items = [];
      providerDirectoryState.cursor = null;
      providerDirectoryState.hasMore = false;
      providerDirectoryState.loadedCount = 0;
      providerDirectoryState.fallbackNationwide = false;
    }
    providerDirectoryState.signature = request.signature;
    providerDirectoryState.mode = "error";
    providerDirectoryState.error = friendlySupabaseError(error);
  } finally {
    if (requestId === providerDirectoryRequestId) {
      providerDirectoryState.loading = false;
      providerDirectoryState.pendingSignature = "";
      renderProviders();
      renderHomeDiscovery();
      renderSavedProviders();
    }
  }
}

function ensureProviderDirectorySearch() {
  if (!supabaseConfigured()) return;
  const signature = providerDirectoryRequest().signature;
  if (providerDirectoryState.signature === signature) return;
  if (providerDirectoryState.loading && providerDirectoryState.pendingSignature === signature) return;
  window.clearTimeout(providerDirectorySearchTimer);
  providerDirectorySearchTimer = window.setTimeout(() => {
    loadProviderDirectoryPage({ reset: true }).catch(() => null);
  }, 180);
}

async function supabaseAuthSignIn(email, password) {
  if (!supabaseConfigured()) {
    throw new Error("Configuration Supabase absente");
  }
  const response = await fetchWithTimeout(`${supabaseBaseUrl()}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: bizziConfig.supabase.anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  }, SUPABASE_REQUEST_TIMEOUT_MS);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.msg || payload.message || payload.error_description || "Connexion admin Supabase impossible");
  }
  const session = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || "",
    expiresAt: Date.now() + Math.max(Number(payload.expires_in || 3600) - 60, 60) * 1000,
    email: payload.user?.email || email,
    userId: payload.user?.id || "",
  };
  saveAdminAuthSession(session);
  return session;
}

async function supabaseInsert(resource, payload) {
  await supabaseRequest(resource, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: payload,
  });
  return payload;
}

async function supabaseFirst(resource) {
  const rows = await supabaseFetch(resource);
  return Array.isArray(rows) ? rows[0] || null : rows;
}

function eqFilter(value) {
  return encodeURIComponent(`eq.${String(value ?? "")}`)
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

function randomUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ Math.floor(Math.random() * 16) >> Number(char) / 4).toString(16)
  );
}

function supabaseStorageBucket(key) {
  const storage = bizziConfig.supabase?.storage || {};
  const defaults = {
    providerPhotos: "provider-photos",
    verificationProofs: "provider-proofs",
    paymentProofs: "payment-proofs",
    eventPosters: "event-posters",
    foodPhotos: "food-photos",
    exceptionPlacePhotos: "exception-place-photos",
  };
  return storage[key] || defaults[key];
}

function cleanStorageName(value) {
  return String(value || "fichier")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || "fichier";
}

function storageFilePath(folder, file) {
  const name = cleanStorageName(file?.name || "upload");
  return `${folder}/${Date.now()}-${randomUuid()}-${name}`;
}

function supabaseStoragePublicUrl(bucket, path) {
  const baseUrl = String(bizziConfig.supabase?.url || "").replace(/\/+$/, "");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

async function supabaseUploadFile(bucket, path, file, options = {}) {
  if (!supabaseConfigured()) {
    throw new Error("Configuration Supabase absente");
  }
  if (!file || !file.size) {
    return null;
  }
  const baseUrl = String(bizziConfig.supabase?.url || "").replace(/\/+$/, "");
  const response = await fetchWithTimeout(`${baseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: supabaseApiHeaders({
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    }),
    body: file,
  }, options.timeoutMs || 30000);
  if (!response.ok) {
    let message = `Storage ${response.status}`;
    try {
      const payload = await response.json();
      message = payload.message || payload.error || message;
    } catch {
      try {
        message = await response.text() || message;
      } catch {
      }
    }
    throw new Error(message);
  }
  return {
    bucket,
    path,
    publicUrl: options.publicUrl ? supabaseStoragePublicUrl(bucket, path) : "",
  };
}

async function optionalStorageUpload(bucketKey, folder, file, options = {}) {
  if (!file || !file.size) return { skipped: true };
  try {
    const bucket = supabaseStorageBucket(bucketKey);
    return await supabaseUploadFile(bucket, storageFilePath(folder, file), file, options);
  } catch (error) {
    return { error: error.message };
  }
}

function storageWarnings(results) {
  return Object.entries(results)
    .filter(([, result]) => result?.error)
    .map(([label, result]) => `${label} non envoyé : ${result.error}`)
    .join(" ");
}

const remoteLookupCache = {
  cities: new Map(),
  services: new Map(),
  plans: new Map(),
};

async function supabaseIdByName(table, name, cache) {
  const normalized = table === "services"
    ? canonicalServiceName(name)
    : table === "categories"
      ? canonicalCategoryName(name)
      : String(name || "").trim();
  if (!normalized) return null;
  if (cache.has(normalized)) return cache.get(normalized);
  let row = null;
  try {
    row = await supabaseFirst(`${table}?select=id&name=${eqFilter(normalized)}&limit=1`);
  } catch {
    row = null;
  }
  let id = row?.id || null;
  if (!id && ["services", "categories", "cities"].includes(table)) {
    const rows = await supabaseFetch(`${table}?select=id,name&limit=1000`).catch(() => []);
    const match = (Array.isArray(rows) ? rows : [])
      .find((item) => normalizedCatalogKey(item.name) === normalizedCatalogKey(normalized));
    id = match?.id || null;
  }
  cache.set(normalized, id);
  return id;
}

function remoteProviderId(provider) {
  if (provider.remoteId) return provider.remoteId;
  if (String(provider.id || "").startsWith("sb-")) return provider.id.slice(3);
  return "";
}

function paymentMethodCode(method) {
  return {
    Wave: "wave",
    "Orange Money": "orange_money",
    "MTN Money": "mtn_money",
    Espèces: "cash",
  }[method] || "wave";
}

function paymentMethodLabel(code) {
  return {
    wave: "Wave",
    orange_money: "Orange Money",
    mtn_money: "MTN Money",
    cash: "Espèces",
  }[code] || code || "Wave";
}

function selectedJobPlan() {
  return JOB_OFFER_PLANS.find((plan) => plan.id === state.selectedJobPlanId) || JOB_OFFER_PLANS[1];
}

function selectedEventPlan() {
  return EVENT_PROMOTION_PLANS.find((plan) => plan.id === state.selectedEventPlanId) || EVENT_PROMOTION_PLANS[0];
}

function eventPlanByName(name) {
  return EVENT_PROMOTION_PLANS.find((plan) => plan.name === name || plan.id === name) || null;
}

function providerPlanByName(name) {
  return PROVIDER_SUBSCRIPTION_PLANS.find((plan) => plan.name === name) || PROVIDER_SUBSCRIPTION_PLANS[0];
}

function selectedProviderPlan() {
  return providerPlanByName(state.selectedPlan?.name);
}

function selectedProviderBoost() {
  return PROVIDER_BOOST_OPTIONS.find((boost) => boost.id === state.selectedBoost) || PROVIDER_BOOST_OPTIONS[0];
}

function selectedProviderPaymentTotal() {
  return Number(selectedProviderPlan().price || 0) + Number(selectedProviderBoost().price || 0);
}

function boostFromPayment(payment = {}) {
  if (payment.boostId) {
    return PROVIDER_BOOST_OPTIONS.find((boost) => boost.id === payment.boostId) || PROVIDER_BOOST_OPTIONS[0];
  }
  const note = String(payment.admin_note || payment.adminNote || "");
  if (/boost_30|boost 1 mois|1 mois de boost|30 jours/i.test(note)) {
    return PROVIDER_BOOST_OPTIONS.find((boost) => boost.id === "boost_30");
  }
  if (/boost_7|boost 1 semaine|semaine de boost|7 jours/i.test(note)) {
    return PROVIDER_BOOST_OPTIONS.find((boost) => boost.id === "boost_7");
  }
  const plan = providerPlanByName(payment.plan || remotePlanName(payment));
  const extra = Number(payment.amount || 0) - Number(plan.price || 0);
  if (extra >= 2000) return PROVIDER_BOOST_OPTIONS.find((boost) => boost.id === "boost_30");
  if (extra >= 1000) return PROVIDER_BOOST_OPTIONS.find((boost) => boost.id === "boost_7");
  return PROVIDER_BOOST_OPTIONS[0];
}

function paymentBoostSummary(payment = {}) {
  const boost = boostFromPayment(payment);
  if (!boost || boost.id === "none" || !Number(boost.price || 0)) return "";
  return `${boost.name} +${Number(boost.price || 0).toLocaleString("fr-FR")} FCFA`;
}

function paymentAdminNote(payment = {}) {
  const boostText = paymentBoostSummary(payment);
  return boostText ? `Option ${boostText}` : "";
}

function jobPlanByName(name) {
  return JOB_OFFER_PLANS.find((plan) => plan.name === name) || null;
}

function referenceDateStamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("") + `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function shortReferenceCode() {
  if (globalThis.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    return array[0].toString(36).toUpperCase().slice(0, 5).padEnd(5, "0");
  }
  return Math.random().toString(36).toUpperCase().slice(2, 7).padEnd(5, "0");
}

function generateSubmissionReference(kind = "DOS", contact = "") {
  const lastDigits = String(contact || "").replace(/\D/g, "").slice(-4) || "0000";
  const prefix = String(kind || "DOS").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 5) || "DOS";
  return `BZ-${prefix}-${referenceDateStamp()}-${lastDigits}-${shortReferenceCode()}`;
}

function generateJobPaymentReference(contactPhone = "", plan = selectedJobPlan()) {
  const lastDigits = String(contactPhone || "").replace(/\D/g, "").slice(-4) || "0000";
  const planCode = String(plan?.id || "job").split("_")[0].toUpperCase().slice(0, 4) || "JOB";
  return `BZ-EMP-${referenceDateStamp()}-${planCode}-${lastDigits}-${shortReferenceCode()}`;
}

function ensureJobPaymentReference(job) {
  if (!job.paymentReference) {
    job.paymentReference = generateJobPaymentReference(job.contactPhone, jobPlanByName(job.planName) || selectedJobPlan());
  }
  return job.paymentReference;
}

function generateEventPaymentReference(contactPhone = "", plan = selectedEventPlan()) {
  const lastDigits = String(contactPhone || "").replace(/\D/g, "").slice(-4) || "0000";
  const planCode = String(plan?.id || "event").toUpperCase().slice(0, 4) || "EVT";
  return `BZ-EVT-${referenceDateStamp()}-${planCode}-${lastDigits}-${shortReferenceCode()}`;
}

function generateDeliveryPaymentReference(contactPhone = "") {
  const lastDigits = String(contactPhone || "").replace(/\D/g, "").slice(-4) || "0000";
  return `BZ-LIV-${referenceDateStamp()}-${lastDigits}-${shortReferenceCode()}`;
}

function ensureEventPaymentReference(event) {
  if (!event.paymentReference) {
    event.paymentReference = generateEventPaymentReference(event.contactPhone, eventPlanByName(event.planName) || selectedEventPlan());
  }
  return event.paymentReference;
}

function ensureDeliveryPaymentReference(request) {
  if (!request.paymentReference) {
    request.paymentReference = generateDeliveryPaymentReference(request.phone);
  }
  return request.paymentReference;
}

function normalizeDistanceKm(value) {
  const normalized = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(normalized) || normalized <= 0) return 0;
  return Math.round(normalized * 10) / 10;
}

function deliveryBasePriceByDistance(distanceKm = 0) {
  return deliveryDistancePriceInfo(distanceKm).baseAmount;
}

function deliveryDistancePriceInfo(distanceKm = 0) {
  const distance = normalizeDistanceKm(distanceKm);
  if (!distance) {
    return {
      distance,
      baseAmount: 0,
      bandLabel: "Distance à renseigner",
      formulaLabel: `Minimum fixe ${formatMoney(DELIVERY_MIN_PRICE)}, puis calcul progressif par distance.`,
    };
  }

  const tier = DELIVERY_PRICING_TABLE.find((item) => distance <= item.maxKm);
  if (tier) {
    const spanKm = Math.max(0.1, tier.maxKm - tier.minKm);
    const ratio = Math.max(0, Math.min(1, (distance - tier.minKm) / spanKm));
    const rawAmount = tier.minPrice + ((tier.maxPrice - tier.minPrice) * ratio);
    const baseAmount = Math.max(DELIVERY_MIN_PRICE, roundDeliveryPrice(rawAmount));
    return {
      distance,
      baseAmount,
      bandLabel: `${tier.label} : ${formatMoney(tier.minPrice)} à ${formatMoney(tier.maxPrice)}`,
      formulaLabel: `Palier progressif ${tier.label}`,
    };
  }

  const extraKm = Math.max(0, Math.ceil(distance - DELIVERY_LONG_DISTANCE_BASE_KM));
  const baseAmount = roundDeliveryPrice(DELIVERY_LONG_DISTANCE_BASE_PRICE + (extraKm * DELIVERY_EXTRA_KM_PRICE));
  return {
    distance,
    baseAmount,
    bandLabel: `+12 km : ${formatMoney(DELIVERY_LONG_DISTANCE_BASE_PRICE)} + ${formatMoney(DELIVERY_EXTRA_KM_PRICE)}/km supplémentaire`,
    formulaLabel: `${extraKm} km supplémentaire(s) facturé(s) après 12 km`,
  };
}

function deliveryTimeSlotById(slotId = "normal") {
  return DELIVERY_TIME_SLOTS.find((slot) => slot.id === slotId) || DELIVERY_TIME_SLOTS[0];
}

function deliveryTimeSlotLabel(slotId = "normal") {
  return deliveryTimeSlotById(slotId).name;
}

function parseDeliveryDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const DELIVERY_OPEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const DELIVERY_SCHEDULE_GRACE_MS = 2 * 60 * 60 * 1000;

function deliveryRequestIsCurrent(request = {}, now = new Date()) {
  if (["closed", "cancelled", "completed"].includes(request.status)) return false;
  const nowTime = parseDeliveryDateTime(now)?.getTime() || Date.now();
  const scheduled = parseDeliveryDateTime(request.scheduledAt || request.scheduled_at);
  if (scheduled && scheduled.getTime() < nowTime - DELIVERY_SCHEDULE_GRACE_MS) return false;
  const created = parseDeliveryDateTime(request.acceptedAt || request.accepted_at || request.createdAt || request.created_at);
  if (!scheduled && created && created.getTime() < nowTime - DELIVERY_OPEN_MAX_AGE_MS) return false;
  return ["open", "assigned"].includes(request.status);
}

function deliveryDateTimeValue(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function deliveryEffectiveDate(options = {}) {
  const scheduled = parseDeliveryDateTime(options.scheduledAt || options.scheduled_at);
  if (scheduled) return scheduled;
  return new Date();
}

function deliveryTimeSlotFromDate(date = new Date()) {
  const checkedDate = parseDeliveryDateTime(date) || new Date();
  const minutes = checkedDate.getHours() * 60 + checkedDate.getMinutes();
  if (minutes >= 22 * 60 || minutes < 8 * 60) return deliveryTimeSlotById("night");
  if (minutes >= 8 * 60 && minutes < 9 * 60 + 30) return deliveryTimeSlotById("morning_peak");
  if (minutes >= 16 * 60 + 30 && minutes < 20 * 60) return deliveryTimeSlotById("evening_peak");
  return deliveryTimeSlotById("normal");
}

function deliveryScheduledLabel(dateValue, urgency = "today") {
  const date = parseDeliveryDateTime(dateValue);
  if (!date) return urgency === "scheduled" ? "Date à programmer" : "Détection sur l'heure actuelle";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDistanceKm(distanceKm = 0) {
  const distance = normalizeDistanceKm(distanceKm);
  return distance ? `${distance.toLocaleString("fr-FR")} km` : "distance à préciser";
}

function deliveryLocationPoint(value = "", fallbackCity = "") {
  const points = [
    ...DELIVERY_LOCATION_POINTS,
    ...(DELIVERY_GEO_DATA.points || []),
    ...NATIONAL_CITIES
      .filter((city) => !["Toute la Côte d'Ivoire", "Autre ville / commune"].includes(city))
      .map((city) => ({ name: city, aliases: [city], ...cityCoordinates(city) })),
  ];
  const indexedPoints = points
    .flatMap((point) => (point.aliases || [point.name]).map((alias) => ({
      ...point,
      alias,
      key: normalizedCatalogKey(alias),
    })));
  const findPoint = (query) => indexedPoints
    .filter((point) => point.key && query.includes(point.key))
    .sort((a, b) => b.key.length - a.key.length)[0] || null;
  const explicitQuery = normalizedCatalogKey(value);
  const explicitPoint = explicitQuery ? findPoint(explicitQuery) : null;
  if (explicitPoint) return explicitPoint;
  const fallbackQuery = normalizedCatalogKey(fallbackCity);
  return fallbackQuery ? findPoint(fallbackQuery) : null;
}

function estimateDeliveryDistanceKm(pickup = "", dropoff = "", city = "") {
  if (!String(pickup).trim() || !String(dropoff).trim()) return null;
  const from = deliveryLocationPoint(pickup, city);
  const to = deliveryLocationPoint(dropoff, city);
  if (!from || !to) return null;
  return estimateDeliveryDistanceBetweenPoints(from, to);
}

function estimateDeliveryDistanceBetweenPoints(from = null, to = null) {
  if (!from || !to) return null;
  const directDistance = distanceBetweenKm(from, to);
  const roadDistance = from.name === to.name
    ? 1.5
    : Math.max(1.5, directDistance * 1.35 + 0.4);
  return {
    distanceKm: normalizeDistanceKm(roadDistance),
    from: from.name,
    to: to.name,
  };
}

function currentPickupPointFromFormData(data = null) {
  const source = data || (document.querySelector("#deliveryRequestForm") ? new FormData(document.querySelector("#deliveryRequestForm")) : null);
  if (!source) return null;
  const lat = normalizeCoordinate(source.get("pickupLatitude"));
  const lng = normalizeCoordinate(source.get("pickupLongitude"));
  const accuracy = Number(source.get("pickupAccuracy"));
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return {
      lat,
      lng,
      name: "Position actuelle GPS",
      ...(Number.isFinite(accuracy) && accuracy > 0 ? { accuracy: Math.round(accuracy) } : {}),
    };
  }
  return null;
}

function currentDropoffPointFromFormData(data = null) {
  const source = data || (document.querySelector("#deliveryRequestForm") ? new FormData(document.querySelector("#deliveryRequestForm")) : null);
  if (!source) return null;
  const lat = normalizeCoordinate(source.get("dropoffLatitude"));
  const lng = normalizeCoordinate(source.get("dropoffLongitude"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    lat,
    lng,
    name: String(source.get("dropoffLocationLabel") || source.get("dropoff") || "Destination").trim(),
  };
}

function deliveryPickupPointFromFormData(data = null) {
  const source = data || (document.querySelector("#deliveryRequestForm") ? new FormData(document.querySelector("#deliveryRequestForm")) : null);
  if (!source) return null;
  return currentPickupPointFromFormData(source)
    || deliveryLocationPoint(String(source.get("pickup") || ""), String(source.get("city") || "").trim() || currentCity());
}

function mapboxEnabled() {
  const maps = bizziConfig.maps || {};
  const backendReady = globalThis.BizziMaps?.hasBackend?.() || hasProductionValue(maps.geocodingEndpoint);
  const directMapboxReady = maps.provider === "mapbox" && hasProductionValue(maps.mapboxAccessToken);
  return Boolean(backendReady || directMapboxReady);
}

function mapboxGeocodingUrl(query = "") {
  const maps = bizziConfig.maps || {};
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("access_token", maps.mapboxAccessToken || "");
  url.searchParams.set("country", maps.country || "ci");
  url.searchParams.set("language", maps.language || "fr");
  url.searchParams.set("limit", "1");
  url.searchParams.set("types", "address,street,neighborhood,locality,place");
  if (maps.bbox) url.searchParams.set("bbox", maps.bbox);
  if (maps.proximity) url.searchParams.set("proximity", maps.proximity);
  return url.toString();
}

async function mapboxGeocodeDeliveryPlace(value = "", city = "") {
  const query = [value, city, "Côte d'Ivoire"].filter(Boolean).join(", ");
  const response = await fetch(mapboxGeocodingUrl(query));
  if (!response.ok) throw new Error(`Geocodage Mapbox impossible (${response.status})`);
  const payload = await response.json();
  const feature = payload?.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error("Lieu non reconnu par Mapbox");
  }
  return {
    name: feature.properties?.name || feature.properties?.full_address || value,
    lng: Number(coordinates[0]),
    lat: Number(coordinates[1]),
  };
}

async function mapboxDeliveryRouteDistanceKm(pickup = "", dropoff = "", city = "", pickupPoint = null, dropoffPoint = null) {
  const maps = bizziConfig.maps || {};
  if (globalThis.BizziMaps?.hasBackend?.()) {
    try {
      const backendResult = await globalThis.BizziMaps.routeDistance(pickup, dropoff, city, {
        pickupCoordinates: pickupPoint,
        dropoffCoordinates: dropoffPoint,
      });
      if (backendResult?.distanceKm) return backendResult;
    } catch (error) {
      captureBizziError(error, { module: "maps-provider", action: "delivery_route_distance" });
    }
  }
  if (!(maps.provider === "mapbox" && hasProductionValue(maps.mapboxAccessToken))) return null;
  const [from, to] = await Promise.all([
    pickupPoint || mapboxGeocodeDeliveryPlace(pickup, city),
    dropoffPoint || mapboxGeocodeDeliveryPlace(dropoff, city),
  ]);
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}`);
  url.searchParams.set("access_token", maps.mapboxAccessToken || "");
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("overview", "false");
  url.searchParams.set("steps", "false");
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Itinéraire Mapbox impossible (${response.status})`);
  const payload = await response.json();
  const route = payload?.routes?.[0];
  const meters = Number(route?.distance || 0);
  if (!meters) throw new Error("Distance Mapbox non disponible");
  return {
    distanceKm: normalizeDistanceKm(meters / 1000),
    from: from.name,
    to: to.name,
    source: "mapbox",
  };
}

function deliveryMapDistanceKey(pickup = "", dropoff = "", city = "", pickupPoint = null, dropoffPoint = null) {
  const pickupCoordinatesKey = pickupPoint
    ? `${Number(pickupPoint.lat).toFixed(5)},${Number(pickupPoint.lng).toFixed(5)}`
    : "";
  const dropoffCoordinatesKey = dropoffPoint
    ? `${Number(dropoffPoint.lat).toFixed(5)},${Number(dropoffPoint.lng).toFixed(5)}`
    : "";
  return normalizedCatalogKey([pickup, pickupCoordinatesKey, dropoff, dropoffCoordinatesKey, city].filter(Boolean).join("|"));
}

function scheduleDeliveryMapDistanceLookup() {
  const form = document.querySelector("#deliveryRequestForm");
  const distanceInput = document.querySelector("#deliveryDistanceInput");
  if (!form || !distanceInput || !mapboxEnabled()) return;
  if (distanceInput.dataset.manualDistance === "true") return;
  const data = new FormData(form);
  const pickup = String(data.get("pickup") || "").trim();
  const dropoff = String(data.get("dropoff") || "").trim();
  const city = String(data.get("city") || "").trim() || currentCity();
  const pickupPoint = currentPickupPointFromFormData(data);
  const dropoffPoint = currentDropoffPointFromFormData(data);
  if (normalizedCatalogKey(pickup).startsWith("mapositionactuelle") && !pickupPoint) return;
  if (pickup.length < 3 || dropoff.length < 3) return;
  const key = deliveryMapDistanceKey(pickup, dropoff, city, pickupPoint, dropoffPoint);
  if (!key || distanceInput.dataset.mapboxKey === key) return;
  window.clearTimeout(deliveryMapDistanceTimer);
  deliveryMapDistanceTimer = window.setTimeout(async () => {
    if (distanceInput.dataset.manualDistance === "true") return;
    distanceInput.dataset.mapboxStatus = "loading";
    try {
      const result = await mapboxDeliveryRouteDistanceKm(pickup, dropoff, city, pickupPoint, dropoffPoint);
      const latestData = new FormData(form);
      const latestKey = deliveryMapDistanceKey(
        latestData.get("pickup"),
        latestData.get("dropoff"),
        latestData.get("city") || currentCity(),
        currentPickupPointFromFormData(latestData),
        currentDropoffPointFromFormData(latestData)
      );
      if (!result || latestKey !== key || distanceInput.dataset.manualDistance === "true") return;
      distanceInput.value = String(result.distanceKm);
      distanceInput.dataset.autoDistance = "mapbox";
      distanceInput.dataset.autoDistanceLabel = `${result.from} vers ${result.to} - API cartographique`;
      distanceInput.dataset.mapboxKey = key;
      distanceInput.dataset.mapboxStatus = "ready";
      renderDeliveryPaymentOptions();
    } catch (error) {
      distanceInput.dataset.mapboxStatus = "fallback";
      distanceInput.dataset.mapboxError = friendlySupabaseError(error);
    }
  }, 700);
}

function roundDeliveryPrice(amount = 0) {
  const total = Math.max(0, Number(amount || 0));
  return Math.ceil(total / 100) * 100;
}

function deliveryPricingDetails(options = {}) {
  const distanceKm = normalizeDistanceKm(options.distanceKm);
  const priceInfo = deliveryDistancePriceInfo(distanceKm);
  const baseAmount = priceInfo.baseAmount;
  const effectiveDate = deliveryEffectiveDate(options);
  const timeSlot = options.pricingSlot || options.timeSlot
    ? deliveryTimeSlotById(options.pricingSlot || options.timeSlot)
    : deliveryTimeSlotFromDate(effectiveDate);
  const items = [];
  let surchargeRate = 0;

  if (timeSlot.surcharge) {
    surchargeRate += timeSlot.surcharge;
    items.push(`${timeSlot.name} détectée +${Math.round(timeSlot.surcharge * 100)}%`);
  }
  if ((options.urgency || "today") === "now") {
    surchargeRate += DELIVERY_URGENCY_SURCHARGE;
    items.push(`Urgence +${Math.round(DELIVERY_URGENCY_SURCHARGE * 100)}%`);
  }
  if (Boolean(options.badWeather)) {
    surchargeRate += DELIVERY_WEATHER_SURCHARGE;
    items.push(`Pluie / trafic difficile +${Math.round(DELIVERY_WEATHER_SURCHARGE * 100)}%`);
  }

  const cappedRate = Math.min(surchargeRate, DELIVERY_MAX_SURCHARGE_RATE);
  const capped = cappedRate < surchargeRate;
  const suggestedAmount = baseAmount ? roundDeliveryPrice(baseAmount * (1 + cappedRate)) : 0;
  const noteParts = [
    distanceKm ? `${formatDistanceKm(distanceKm)} : ${priceInfo.bandLabel}, base ${formatMoney(baseAmount)}` : "Distance à renseigner",
    ...items,
  ];
  if (capped) noteParts.push(`Majorations plafonnées à ${Math.round(DELIVERY_MAX_SURCHARGE_RATE * 100)}%`);

  return {
    distanceKm,
    scheduledAt: options.scheduledAt || options.scheduled_at || effectiveDate.toISOString(),
    effectiveDate: effectiveDate.toISOString(),
    baseAmount,
    pricingBand: priceInfo.bandLabel,
    pricingFormula: priceInfo.formulaLabel,
    pricingSlot: timeSlot.id,
    pricingSlotLabel: timeSlot.name,
    badWeather: Boolean(options.badWeather),
    surchargeRate: cappedRate,
    suggestedAmount,
    pricingBreakdown: noteParts.join(" - "),
    surchargeItems: items,
    capped,
  };
}

function deliveryFinancials(amount = 0) {
  const total = Math.max(0, Math.round(Number(amount || 0)));
  const commission = Math.round(total * DELIVERY_COMMISSION_RATE);
  return {
    amount: total,
    commissionRate: DELIVERY_COMMISSION_RATE,
    bizziCommission: commission,
    providerPayout: Math.max(0, total - commission),
  };
}

function deliveryProviderPenaltyActive(provider = null) {
  if (!provider) return false;
  const remaining = Number(provider.deliveryPenaltyRemaining || 0);
  const until = provider.deliveryPenaltyUntil ? new Date(provider.deliveryPenaltyUntil).getTime() : 0;
  return remaining > 0 || (until && until > Date.now());
}

function deliveryProviderCommissionRate(provider = null) {
  return deliveryProviderPenaltyActive(provider)
    ? DELIVERY_PENALTY_COMMISSION_RATE
    : DELIVERY_COMMISSION_RATE;
}

function deliveryFinancialsForProvider(amount = 0, provider = null) {
  const total = Math.max(0, Math.round(Number(amount || 0)));
  const commissionRate = deliveryProviderCommissionRate(provider);
  const commission = Math.round(total * commissionRate);
  return {
    amount: total,
    commissionRate,
    bizziCommission: commission,
    providerPayout: Math.max(0, total - commission),
  };
}

function deliveryCommissionPercent(rate = DELIVERY_COMMISSION_RATE) {
  return `${Math.round(Number(rate || DELIVERY_COMMISSION_RATE) * 100)}%`;
}

function applyDeliveryCommissionForProvider(request, provider, { consumePenalty = false } = {}) {
  if (!request) return null;
  const financials = deliveryFinancialsForProvider(request.amount, provider);
  request.commissionRate = financials.commissionRate;
  request.bizziCommission = financials.bizziCommission;
  request.providerPayout = financials.providerPayout;
  if (consumePenalty && provider && financials.commissionRate > DELIVERY_COMMISSION_RATE) {
    provider.deliveryPenaltyRemaining = Math.max(0, Number(provider.deliveryPenaltyRemaining || 0) - 1);
    if (provider.deliveryPenaltyRemaining === 0) {
      provider.deliveryPenaltyRate = 0;
      provider.deliveryPenaltyUntil = "";
    }
  }
  return financials;
}

function applyProviderDeliveryPenalty(provider, reason = "") {
  if (!provider) return;
  const until = new Date();
  until.setDate(until.getDate() + 7);
  provider.deliveryPenaltyRate = DELIVERY_PENALTY_COMMISSION_RATE;
  provider.deliveryPenaltyRemaining = Math.max(Number(provider.deliveryPenaltyRemaining || 0), DELIVERY_PENALTY_COURSE_COUNT);
  provider.deliveryPenaltyUntil = until.toISOString();
  provider.deliveryCancelCount = Number(provider.deliveryCancelCount || 0) + 1;
  provider.deliveryPenaltyReason = reason || "Annulation prestataire injustifiée";
}

function deliveryPaymentInstructionText(amount = 0, method = state.selectedDeliveryPayment) {
  if (BizziPrivacy.isCash(method)) return BizziPrivacy.cashInstruction(formatMoney(amount));
  const account = bizziConfig.payments?.accounts?.[method] || "A renseigner";
  const accountLine = hasProductionValue(account)
    ? `Compte Zeyds ${method} : ${account}.`
    : `Compte Zeyds ${method} : a renseigner avant publication.`;
  const financials = deliveryFinancials(amount);
  return [
    "Paiement Zeyds Livraison",
    `Montant à payer : ${formatMoney(financials.amount)}.`,
    "Tarif calculé selon la distance estimée, l'heure détectée et les conditions de livraison.",
    accountLine,
    "Après confirmation de la commande, Zeyds ouvre la mission aux livreurs proches sans afficher leur contact avant acceptation.",
  ].join("\n");
}

function jobPaymentInstructionText(plan = selectedJobPlan(), method = state.selectedJobPayment) {
  const account = bizziConfig.payments?.accounts?.[method] || "A renseigner";
  const accountLine = hasProductionValue(account)
    ? `Compte Zeyds ${method} : ${account}.`
    : `Compte Zeyds ${method} : a renseigner avant publication.`;
  return [
    `Publication offre emploi Zeyds - ${plan.name}`,
    `Montant : ${plan.price.toLocaleString("fr-FR")} FCFA.`,
    accountLine,
    "Zeyds genere une reference de suivi et l'associe au contact indique. Cette reference sert de trace en cas de reclamation.",
  ].join("\n");
}

function eventPaymentInstructionText(plan = selectedEventPlan(), method = state.selectedEventPayment) {
  if (Number(plan.price || 0) <= 0) {
    return [
      `Promotion evenement Zeyds - ${plan.name}`,
      "Montant visibilite : gratuit.",
      "Aucun paiement n'est demande pour la publication standard.",
      "La validation Zeyds reste obligatoire avant affichage public.",
      "Important : Zeyds ne vend pas les billets et redirige uniquement vers le lien officiel de l'organisateur.",
    ].join("\n");
  }
  const account = bizziConfig.payments?.accounts?.[method] || "A renseigner";
  const accountLine = hasProductionValue(account)
    ? `Compte Zeyds ${method} : ${account}.`
    : `Compte Zeyds ${method} : a renseigner avant publication.`;
  return [
    `Promotion evenement Zeyds - ${plan.name}`,
    `Montant visibilite : ${plan.price.toLocaleString("fr-FR")} FCFA.`,
    Number(plan.durationDays || 0) ? `Duree du boost : ${Number(plan.durationDays).toLocaleString("fr-FR")} jour(s).` : "",
    accountLine,
    "Important : Zeyds ne vend pas les billets, ne rembourse pas les billets et redirige uniquement vers le lien officiel de l'organisateur.",
  ].filter(Boolean).join("\n");
}

function markRemoteWrite(message) {
  state.remote.lastSupabaseWriteAt = new Date().toISOString();
  state.remote.lastSupabaseWriteStatus = message;
  state.remote.lastSupabaseStatus = message;
  saveState();
  renderSupabaseStatus(message);
}

function renderSupabaseStatus(message = "", options = {}) {
  const status = document.querySelector("#supabaseStatus");
  if (!status) return;
  const lastSync = state.remote?.lastSupabaseSyncAt
    ? `Dernier import : ${new Date(state.remote.lastSupabaseSyncAt).toLocaleString("fr-FR")}.`
    : "Aucun import Supabase effectué.";
  const savedStatus = state.remote?.lastSupabaseWriteStatus || state.remote?.lastSupabaseStatus || "";
  const text = message || savedStatus || lastSync;
  status.innerHTML = text ? `<strong>Supabase</strong><p>${safe(text)}</p>` : "";
  if (options.focus && text) {
    status.classList.remove("attention");
    requestAnimationFrame(() => status.classList.add("attention"));
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function setBusyButton(button, busy, label = "") {
  if (!button) return;
  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent.trim();
  }
  button.disabled = busy;
  button.textContent = busy ? label : button.dataset.defaultLabel;
}

function finishActionButton(button, label) {
  if (!button) return;
  button.disabled = false;
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = button.dataset.defaultLabel || button.textContent;
  }, 2500);
}

function friendlySupabaseError(error) {
  const message = error?.message || String(error || "");
  if (message.includes("The string did not match the expected pattern")) {
    return "Le navigateur a refusé une adresse Supabase contenant un caractère spécial. Correction appliquée : réessayez Envoyer vers Supabase.";
  }
  if (message.includes("row-level security") || message.includes("violates row-level security")) {
    if (message.includes("\"payments\"") || message.includes("payments")) {
      return `${message}. Correction nécessaire : exécuter sql-copie-bizzi/53-correction-definitive-rls-paiements-v115.sql dans Supabase SQL Editor.`;
    }
    if (message.includes("\"provider_services\"") || message.includes("provider_services")) {
      return `${message}. Correction nécessaire : exécuter sql-copie-bizzi/48-liaison-metier-creation-v97.sql dans Supabase SQL Editor.`;
    }
    return `${message}. Correction nécessaire : exécuter sql-copie-bizzi/09-correction-rls-provider-simple.sql dans Supabase SQL Editor.`;
  }
  if (isDuplicatePendingPaymentReferenceError(error) || message.includes("payments_unique_provider_reference") || message.includes("payments_provider_reference_unique")) {
    return `${message}. Cette référence de paiement existe déjà pour ce prestataire : utilisez une nouvelle référence ou validez le paiement déjà en attente.`;
  }
  if (message.includes("duplicate key") || message.includes("providers_phone_key")) {
    return "Ce numéro existe déjà dans Supabase. Identifiez le profil existant puis utilisez le renouvellement au lieu de recréer un mois gratuit.";
  }
  if (/jwt|token|authorization|apikey|secret/i.test(message)) {
    return "Connexion refusée. Vérifiez la session admin Supabase ou reconnectez-vous.";
  }
  if (/network|timeout|failed to fetch|load failed|connection/i.test(message)) {
    return "Connexion réseau instable. Réessayez après quelques secondes ou vérifiez Supabase/Cloudflare.";
  }
  return message.length > 180 ? `${message.slice(0, 180)}...` : message || "Erreur inconnue. Réessayez puis consultez le diagnostic admin.";
}

function renderAdminRemoteStatus(message = "", focus = false) {
  const status = document.querySelector("#adminRemoteStatus");
  if (!status) return;
  const fallback = adminAuthSession?.email
    ? `Connecté à Supabase : ${adminAuthSession.email}.`
    : "Connectez un compte admin Supabase pour charger les validations réelles.";
  const text = message || fallback;
  const isProblem = /impossible|erreur|refus|bloqu|corrig|exécutez|instable|introuvable/i.test(text);
  status.classList.toggle("admin-status-error", isProblem);
  status.classList.toggle("admin-status-ok", !isProblem && Boolean(message));
  status.innerHTML = `<strong>Validation Supabase</strong><p>${safe(text)}</p>`;
  if (focus) {
    status.classList.remove("attention");
    requestAnimationFrame(() => status.classList.add("attention"));
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function remoteProviderName(row) {
  const provider = Array.isArray(row.providers) ? row.providers[0] : row.providers;
  return provider?.full_name || "Prestataire Supabase";
}

function remoteProviderPhone(row) {
  const provider = Array.isArray(row.providers) ? row.providers[0] : row.providers;
  return provider?.phone || "";
}

function remotePlanName(row) {
  const plan = Array.isArray(row.subscription_plans) ? row.subscription_plans[0] : row.subscription_plans;
  return plan?.name || "Forfait";
}

function remoteProviderService(row) {
  if (row?.service_name) return canonicalServiceName(row.service_name);
  if (row?.requested_service_name) return canonicalServiceName(row.requested_service_name);
  const links = Array.isArray(row.provider_services) ? row.provider_services : [];
  const primary = links.find((link) => link?.is_primary) || links[0];
  const service = Array.isArray(primary?.services) ? primary.services[0] : primary?.services;
  return service?.name ? canonicalServiceName(service.name) : "";
}

function remoteProviderLine(provider) {
  return `${provider.full_name || "Prestataire"} - ${remoteProviderService(provider) || "Métier non lié"} - ${provider.phone || "sans téléphone"}`;
}

function remotePaymentByProviderId() {
  return new Map(remoteAdminQueue.payments.map((payment) => [payment.provider_id, payment]));
}

function normalizedPaymentReference(reference = "") {
  return String(reference || "").trim().toLowerCase();
}

function remotePaymentDuplicateKey(payment) {
  const reference = normalizedPaymentReference(payment?.transaction_reference || "");
  if (!reference) return `id:${payment?.id || randomUuid()}`;
  return [
    payment?.provider_id || remoteProviderPhone(payment) || "provider",
    payment?.method || "method",
    reference,
  ].join("|");
}

function dedupeRemotePayments(payments = []) {
  const byKey = new Map();
  (Array.isArray(payments) ? payments : []).forEach((payment) => {
    const key = remotePaymentDuplicateKey(payment);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        ...payment,
        duplicate_count: 1,
        duplicate_ids: [payment.id].filter(Boolean),
      });
      return;
    }
    existing.duplicate_count = Number(existing.duplicate_count || 1) + 1;
    if (payment.id) existing.duplicate_ids = [...(existing.duplicate_ids || []), payment.id];
    const currentDate = new Date(existing.created_at || 0).getTime();
    const nextDate = new Date(payment.created_at || 0).getTime();
    if (nextDate && (!currentDate || nextDate < currentDate)) {
      byKey.set(key, {
        ...payment,
        duplicate_count: existing.duplicate_count,
        duplicate_ids: existing.duplicate_ids,
      });
    }
  });
  return [...byKey.values()];
}

function remoteServiceOptionsHtml(currentService = "") {
  const selectedName = canonicalServiceName(currentService || "");
  const services = allServices();
  const hasSelected = services.some((service) => normalizedCatalogKey(service.name) === normalizedCatalogKey(selectedName));
  const extraOption = selectedName && !hasSelected
    ? `<option value="${safe(selectedName)}" selected>${safe(selectedName)}</option>`
    : "";
  const placeholder = `<option value="" ${selectedName ? "" : "selected"}>Choisir métier</option>`;
  return `${placeholder}${extraOption}${state.categories.map((category) => `
    <optgroup label="${safe(category.name)}">
      ${category.services.map((service) => `
        <option value="${safe(service)}" ${normalizedCatalogKey(service) === normalizedCatalogKey(selectedName) ? "selected" : ""}>${safe(service)}</option>
      `).join("")}
    </optgroup>
  `).join("")}`;
}

function remoteServiceEditorHtml(provider) {
  const currentService = remoteProviderService(provider);
  return `
    <div class="admin-service-editor">
      <label>Modifier métier
        <select data-remote-service-select="${safe(provider.id)}">
          ${remoteServiceOptionsHtml(currentService)}
        </select>
      </label>
      <button class="secondary" type="button" data-remote-update-service="${safe(provider.id)}">Mettre à jour métier</button>
    </div>
  `;
}

function remoteProviderById(providerId) {
  return [
    ...(remoteAdminQueue.providers || []),
    ...(remoteAdminQueue.recentProviders || []),
    ...(remoteAdminQueue.providerSearchResults || []),
  ].find((provider) => provider.id === providerId) || null;
}

function remoteProviderVisibilityState(provider = {}) {
  const status = String(provider.status || "");
  const visibility = String(provider.visibility_status || "");
  const hidden = status === "suspended" || status === "rejected" || visibility === "hidden";
  const visible = !hidden && status === "approved" && ["trial", "active", "expired_blurred"].includes(visibility);
  return { status, visibility, hidden, visible };
}

function remoteTrialActivationButtonHtml(provider) {
  if (provider.public_visible) {
    return `<span class="tag ok">Déjà visible côté client</span>`;
  }
  const busy = remoteActivationBusyIds.has(provider.id);
  const issue = remoteActivationIssueById.get(provider.id);
  const label = busy ? "Activation..." : (issue ? "Rattraper activation" : "Rattraper mois gratuit");
  return `
    ${issue ? `<p class="admin-warning">${safe(issue)}</p>` : ""}
    <button class="primary" type="button" data-remote-activate-trial="${safe(provider.id)}" ${busy ? "disabled" : ""}>${safe(label)}</button>
  `;
}

function remoteProviderAdminCardHtml(provider, pendingPaymentsByProvider = new Map(), options = {}) {
  const providerPayment = pendingPaymentsByProvider.get(provider.id);
  const visibilityState = remoteProviderVisibilityState(provider);
  const publicVisible = provider.public_visible === true;
  const publicVisibilityChecked = provider.public_visibility_checked !== false;
  const moderationBusy = remoteModerationBusyById.get(provider.id) || "";
  const moderationIssue = remoteModerationIssueById.get(provider.id) || "";
  const effectiveStatus = provider.status || (publicVisible ? "approved" : "");
  const effectiveVisibility = provider.visibility_status || (publicVisible ? (provider.public_visibility_status || "trial") : "");
  const visibleInBaseButNotPublic = publicVisibilityChecked && !publicVisible && visibilityState.visible;
  const hiddenInBaseButStillPublic = publicVisible && visibilityState.hidden;
  const canSuspend = !visibilityState.hidden && (visibilityState.visible || (publicVisible && provider.status !== "pending"));
  const canRestore = visibilityState.hidden;
  const suspendLabel = moderationBusy === "suspend" ? "Retrait..." : "Retirer côté client";
  const restoreLabel = moderationBusy === "restore" ? "Réactivation..." : "Réactiver côté client";
  const disabled = moderationBusy ? "disabled" : "";
  const moderationButton = canSuspend
    ? `<button class="danger" type="button" data-remote-suspend-provider="${safe(provider.id)}" ${disabled}>${safe(suspendLabel)}</button>`
    : canRestore
      ? `<button class="secondary" type="button" data-remote-restore-provider="${safe(provider.id)}" ${disabled}>${safe(restoreLabel)}</button>`
      : "";
  return `
    <div class="admin-item">
      <div>
        <h3>${safe(provider.full_name || "Prestataire")}</h3>
        <p>${safe(remoteProviderService(provider) || "Métier Supabase non lié")} - ${safe(provider.phone || "")}</p>
        <p>${safe(effectiveStatus || "")} - ${safe(effectiveVisibility || "")}</p>
        ${publicVisible ? `<p class="admin-real-action"><strong>Déjà visible côté client</strong><span>Ce profil apparaît dans le catalogue public. Rechargez l'import public si vous ne le voyez pas encore sur votre téléphone.</span></p>` : ""}
        ${visibleInBaseButNotPublic ? `<p class="admin-warning"><strong>Visible en base, catalogue public à recharger.</strong><span>Le bouton Retirer reste disponible car le statut officiel est visible.</span></p>` : ""}
        ${hiddenInBaseButStillPublic ? `<p class="admin-warning"><strong>Retiré en base, ancien catalogue encore détecté.</strong><span>Le bouton Réactiver reste disponible car le statut officiel est retiré.</span></p>` : ""}
        ${moderationIssue ? `<p class="admin-warning"><strong>Dernière erreur moderation :</strong><span>${safe(moderationIssue)}</span></p>` : ""}
        ${providerPayment ? `<p class="admin-warning">Paiement forfait en attente : ${safe(remotePlanName(providerPayment))} - ${Number(providerPayment.amount || 0).toLocaleString("fr-FR")} ${safe(providerPayment.currency || "FCFA")}${paymentBoostSummary(providerPayment) ? ` - ${safe(paymentBoostSummary(providerPayment))}` : ""} - Réf. ${safe(providerPayment.transaction_reference || "Non renseignée")}</p>` : ""}
        <p>Créé le ${provider.created_at ? new Date(provider.created_at).toLocaleString("fr-FR") : "date inconnue"}</p>
        ${options.searchResult ? `<p class="admin-warning">Résultat de recherche admin : si ce profil est introuvable côté client, vérifiez son statut, son métier et sa visibilité.</p>` : ""}
      </div>
      <div class="admin-actions">
        ${providerPayment
          ? `<button class="primary" type="button" data-remote-approve-payment="${safe(providerPayment.id)}">Valider paiement forfait</button>`
          : publicVisible
            ? `<span class="tag ok">Déjà visible côté client</span>`
          : provider.status === "pending"
            ? remoteTrialActivationButtonHtml(provider)
            : `<span class="tag ${provider.status === "approved" ? "ok" : "pending"}">${provider.status === "approved" ? "Déjà approuvé - import public" : "Non en attente"}</span>`}
        ${moderationButton}
      </div>
      ${remoteServiceEditorHtml(provider)}
    </div>
  `;
}

function remoteProviderSearchHtml(pendingPaymentsByProvider) {
  const query = remoteAdminQueue.providerSearchQuery || "";
  const results = Array.isArray(remoteAdminQueue.providerSearchResults) ? remoteAdminQueue.providerSearchResults : [];
  const resultHtml = query
    ? (results.length
      ? results.map((provider) => remoteProviderAdminCardHtml(provider, pendingPaymentsByProvider, { searchResult: true })).join("")
      : `<p>Aucun prestataire trouvé pour "${safe(query)}". Essayez le nom seul, le prénom seul ou le numéro de téléphone.</p>`)
    : `<p>Recherchez un prestataire par nom ou téléphone, par exemple Aly Kouassi.</p>`;
  return `
    <h3>Recherche prestataire Supabase</h3>
    <form class="admin-search-row" data-remote-provider-search-form>
      <label>Nom ou téléphone
        <input id="remoteProviderSearchInput" name="query" value="${safe(query)}" placeholder="Ex: Aly Kouassi ou +225...">
      </label>
      <button class="secondary" type="submit">Rechercher</button>
    </form>
    <div class="admin-search-results">${resultHtml}</div>
  `;
}

function localSubmittedProvidersHtml() {
  const submitted = state.providers
    .filter((provider) => provider.remoteId || provider.remoteStatus === "submitted")
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.termsAcceptedAt || 0) - new Date(a.createdAt || a.termsAcceptedAt || 0))
    .slice(0, 12);
  if (!submitted.length) return "";
  return `
    <h3>Soumissions récentes depuis cet appareil</h3>
    <p>Si vous venez de créer un prestataire, vérifiez ici qu'il est bien parti vers Supabase, puis utilisez Retrouver dans Supabase.</p>
    ${submitted.map((provider) => `
      <div class="admin-item local-submit-card">
        <div>
          <h3>${safe(provider.fullName || "Prestataire")}</h3>
          <p>${safe(provider.service || "Métier non renseigné")} - ${safe(provider.phone || "")} - ${safe(provider.city || "Côte d'Ivoire")}</p>
          <p>Statut local : ${safe(provider.remoteStatus || (provider.remoteId ? "lié" : "local"))}${provider.remoteId ? ` - ID Supabase ${safe(provider.remoteId)}` : ""}</p>
          ${provider.remoteError ? `<p class="admin-warning">Erreur Supabase : ${safe(provider.remoteError)}</p>` : ""}
        </div>
        <div class="admin-actions">
          <button class="secondary" type="button" data-remote-find-local-provider="${safe(provider.id)}">Retrouver dans Supabase</button>
          ${provider.remoteStatus === "local_only" ? `<button class="primary" type="button" data-remote-resend-local-provider="${safe(provider.id)}">Renvoyer vers Supabase</button>` : ""}
        </div>
      </div>
    `).join("")}
  `;
}

function renderRemoteAdminPanel() {
  const loginForm = document.querySelector("#supabaseAdminLoginForm");
  const logoutButton = document.querySelector("#supabaseAdminLogout");
  const loadButton = document.querySelector("#loadRemoteQueue");
  const paymentsRoot = document.querySelector("#remotePayments");
  const requestsRoot = document.querySelector("#remoteRequests");
  const jobsRoot = document.querySelector("#remoteJobs");
  const eventsRoot = document.querySelector("#remoteEvents");
  const foodsRoot = document.querySelector("#remoteFoods");
  const exceptionPlacesRoot = document.querySelector("#remoteExceptionPlaces");
  const providersRoot = document.querySelector("#remoteProviders");
  if (!loginForm || !logoutButton || !loadButton || !paymentsRoot || !requestsRoot || !jobsRoot || !eventsRoot || !foodsRoot || !exceptionPlacesRoot || !providersRoot) return;

  adminAuthSession = loadAdminAuthSession();
  const signedIn = Boolean(adminAuthSession?.accessToken);
  loginForm.hidden = signedIn;
  logoutButton.hidden = !signedIn;
  loadButton.disabled = !signedIn;
  renderAdminRemoteStatus();

  if (!signedIn) {
    paymentsRoot.innerHTML = "";
    requestsRoot.innerHTML = "";
    jobsRoot.innerHTML = "";
    eventsRoot.innerHTML = "";
    foodsRoot.innerHTML = "";
    exceptionPlacesRoot.innerHTML = "";
    providersRoot.innerHTML = "";
    return;
  }

  paymentsRoot.innerHTML = remoteAdminQueue.payments.length ? `
    <h3>Paiements Supabase en attente</h3>
    ${remoteAdminQueue.payments.map((payment) => `
      <div class="admin-item">
        <div>
          <h3>${safe(remoteProviderName(payment))}</h3>
          <p>${safe(remotePlanName(payment))} - ${Number(payment.amount || 0).toLocaleString("fr-FR")} ${safe(payment.currency || "FCFA")} - ${safe(payment.method || "")}${paymentBoostSummary(payment) ? ` - ${safe(paymentBoostSummary(payment))}` : ""}</p>
          <p>${remoteProviderPhone(payment) ? `Téléphone : ${safe(remoteProviderPhone(payment))}` : "Téléphone non chargé"}</p>
          <p>Réf. ${safe(payment.transaction_reference || "Non renseignée")}</p>
          ${Number(payment.duplicate_count || 1) > 1 ? `<p class="admin-warning">Doublon détecté : ${Number(payment.duplicate_count)} lignes Supabase pour la même référence. Validez une seule fois, Zeyds rejettera les copies.</p>` : ""}
        </div>
        <div class="admin-actions">
          <button class="primary" type="button" data-remote-approve-payment="${safe(payment.id)}">Valider Supabase</button>
        </div>
      </div>
    `).join("")}
  ` : `<h3>Paiements Supabase en attente</h3><p>Aucun paiement Supabase en attente. Si vous venez d'arriver sur l'admin, cliquez d'abord sur Charger validations Supabase.</p>`;

  requestsRoot.innerHTML = remoteAdminQueue.requests.length ? `
    <h3>Demandes express Supabase ouvertes</h3>
    ${remoteAdminQueue.requests.map((request) => {
      const priorityScore = Number(request.priority_score || 0);
      const priorityLabel = request.priority_label || priorityLabelFromScore(priorityScore);
      const matchedCount = Number(request.matched_count ?? (Array.isArray(request.matched_provider_ids) ? request.matched_provider_ids.length : 0));
      return `
      <div class="admin-item">
        <div>
          <h3>${safe(request.service_name || "Service Zeyds")} - ${safe(requestUrgencyLabel(request.urgency))} ${priorityBadge(priorityLabel, priorityScore || null)}</h3>
          <p>${safe(request.city_name || "Côte d'Ivoire")}${request.area ? ` - ${safe(request.area)}` : ""}</p>
          <p>${safe(request.message || "Besoin non détaillé.")}</p>
          <p>${matchedCount} prestataire(s) proposé(s) par Zeyds.</p>
          <p>${request.customer_phone ? `Contact client : ${safe(request.customer_phone)}` : "Client sans contact renseigné"} - ${request.created_at ? new Date(request.created_at).toLocaleString("fr-FR") : "date inconnue"}</p>
        </div>
        <div class="admin-actions">
          <button class="secondary" type="button" data-remote-replay-request="${safe(request.id)}">Voir matches</button>
          <button class="primary" type="button" data-remote-close-request="${safe(request.id)}">Marquer traité Supabase</button>
        </div>
      </div>
    `; }).join("")}
  ` : `<h3>Demandes express Supabase ouvertes</h3><p>Aucune demande express distante ouverte ou table demandes express non encore installée.</p>`;

  jobsRoot.innerHTML = remoteAdminQueue.jobs.length ? `
    <h3>Offres emploi Supabase en attente</h3>
    ${remoteAdminQueue.jobs.map((job) => `
      <div class="admin-item">
        <div>
          <h3>${safe(job.title || "Offre emploi Zeyds")}</h3>
          <p>${safe(job.company_name || "Entreprise")} - ${safe(job.company_type || "Entreprise")} - ${safe(job.service_name || "Métier non précisé")} - ${safe(job.city_name || "Côte d'Ivoire")}</p>
          <p><strong>Paiement :</strong> ${safe(job.plan_name || "Forfait emploi")} - ${Number(job.amount || 0).toLocaleString("fr-FR")} ${safe(job.currency || "FCFA")} - ${safe(paymentMethodLabel(job.payment_method || ""))}</p>
          <p>Référence Zeyds : ${safe(job.transaction_reference || "Non renseignée")} - ${safe(job.payment_status || "pending")}${job.is_boosted ? " - Offre boostée" : ""}</p>
          <p>${safe(job.description || "Description non renseignée.")}</p>
          <p>${job.contact_phone ? `Contact : ${safe(job.contact_phone)}` : "Contact non renseigné"}${job.contact_email ? ` - ${safe(job.contact_email)}` : ""} - ${job.created_at ? new Date(job.created_at).toLocaleString("fr-FR") : "date inconnue"}</p>
        </div>
        <div class="admin-actions">
          ${jobPaymentTrackingWhatsAppUrl(job) ? `<a class="secondary" href="${safe(jobPaymentTrackingWhatsAppUrl(job))}" target="_blank" rel="noreferrer">Envoyer référence</a>` : ""}
          <button class="primary" type="button" data-remote-approve-job="${safe(job.id)}">Valider paiement et publier</button>
          <button class="danger" type="button" data-remote-archive-job="${safe(job.id)}">Archiver</button>
        </div>
      </div>
    `).join("")}
  ` : remoteAdminQueue.jobError
    ? `<h3>Offres emploi Supabase en attente</h3><p class="admin-warning">Lecture impossible : ${safe(remoteAdminQueue.jobError)}. Exécutez sql-copie-bizzi/59-emplois-missions-toutes-entreprises-v130.sql.</p>`
    : `<h3>Offres emploi Supabase en attente</h3><p>Aucune offre emploi distante en attente. Si une offre vient d'être créée, exécutez sql-copie-bizzi/59-emplois-missions-toutes-entreprises-v130.sql puis cliquez Charger validations Supabase.</p>`;

  eventsRoot.innerHTML = remoteAdminQueue.events.length ? `
    <h3>Événements Supabase en attente</h3>
    ${remoteAdminQueue.events.map((event) => `
      <div class="admin-item">
        <div>
          <h3>${safe(event.title || "Événement Zeyds")}</h3>
          <p>${safe(event.organizer_name || "Organisateur")} - ${safe(event.category || "Événement")} - ${safe(event.city_name || "Côte d'Ivoire")}${event.area ? ` - ${safe(event.area)}` : ""}</p>
          <p>${event.event_datetime ? new Date(event.event_datetime).toLocaleString("fr-FR") : "date inconnue"}${event.end_datetime ? ` au ${new Date(event.end_datetime).toLocaleString("fr-FR")}` : ""} - ${safe(event.venue || "lieu non renseigné")}</p>
          <p>${event.venue_address ? `Adresse : ${safe(event.venue_address)}. ` : ""}Rayon : ${Number(event.visibility_radius_km || 25).toLocaleString("fr-FR")} km${event.latitude && event.longitude ? ` - GPS ${Number(event.latitude).toLocaleString("fr-FR")}, ${Number(event.longitude).toLocaleString("fr-FR")}` : ""}</p>
          <p><strong>Forfait visibilité :</strong> ${safe(event.plan_name || "Standard")} - ${Number(event.amount || 0).toLocaleString("fr-FR")} ${safe(event.currency || "FCFA")} - ${safe(paymentMethodLabel(event.payment_method || ""))}</p>
          <p>Référence Zeyds : ${safe(event.transaction_reference || "Non renseignée")} - paiement ${safe(event.payment_status || "pending")}${event.is_sponsored ? " - sponsorisé" : ""}${event.is_premium ? " - premium" : ""}</p>
          <p>Stats : ${Number(event.click_count || 0)} clic(s), ${Number(event.ticket_click_count || 0)} billet(s), ${Number(event.contact_click_count || 0)} contact(s).</p>
          <p>${safe(event.description || "Description non renseignée.")}</p>
          <p>Billetterie externe : ${event.ticket_url ? safe(event.ticket_url) : "non renseignée"} - Zeyds n'encaisse pas les billets.</p>
        </div>
        <div class="admin-actions">
          ${eventPaymentTrackingWhatsAppUrl(eventPromotionFromSupabase(event)) ? `<a class="secondary" href="${safe(eventPaymentTrackingWhatsAppUrl(eventPromotionFromSupabase(event)))}" target="_blank" rel="noreferrer">Envoyer référence</a>` : ""}
          <button class="primary" type="button" data-remote-approve-event="${safe(event.id)}">Valider et publier</button>
          <button class="danger" type="button" data-remote-reject-event="${safe(event.id)}">Refuser</button>
        </div>
      </div>
    `).join("")}
  ` : remoteAdminQueue.eventError
    ? `<h3>Événements Supabase en attente</h3><p class="admin-warning">Lecture impossible : ${safe(remoteAdminQueue.eventError)}. Exécutez sql-copie-bizzi/67-evenements-geolocalises-v156.sql.</p>`
    : `<h3>Événements Supabase en attente</h3><p>Aucun événement distant en attente. Si un événement vient d'être créé, exécutez sql-copie-bizzi/67-evenements-geolocalises-v156.sql puis cliquez Charger validations Supabase.</p>`;

  foodsRoot.innerHTML = remoteAdminQueue.foods.length ? `
    <h3>Adresses Food Supabase en attente</h3>
    ${remoteAdminQueue.foods.map((place) => `
      <div class="admin-item">
        <div>
          <h3>${safe(place.name || "Adresse Food Zeyds")}</h3>
          <p>${safe(place.place_type || "Adresse")} - ${safe(place.main_specialty || "Spécialité non précisée")} - ${safe(place.city_name || "Côte d'Ivoire")}${place.area ? ` - ${safe(place.area)}` : ""}</p>
          <p>${place.address ? `Adresse : ${safe(place.address)}. ` : ""}${place.average_budget ? `Budget : ${safe(place.average_budget)}. ` : ""}${place.opening_hours ? `Horaires : ${safe(place.opening_hours)}.` : ""}</p>
          <p>${place.owner_name ? `Responsable : ${safe(place.owner_name)} - ` : ""}Contact : ${safe(place.contact_phone || "non renseigné")}</p>
          <p>${safe(place.description || "Description non renseignée.")}</p>
          <p>Statut : ${safe(place.status || "pending")} - vérification ${safe(place.verification_status || "none")} - ${place.created_at ? new Date(place.created_at).toLocaleString("fr-FR") : "date inconnue"}</p>
        </div>
        <div class="admin-actions">
          <button class="primary" type="button" data-remote-publish-food="${safe(place.id)}">Publier Food</button>
          <button class="danger" type="button" data-remote-reject-food="${safe(place.id)}">Refuser</button>
        </div>
      </div>
    `).join("")}
  ` : remoteAdminQueue.foodError
    ? `<h3>Adresses Food Supabase en attente</h3><p class="admin-warning">Lecture impossible : ${safe(remoteAdminQueue.foodError)}. Exécutez sql-copie-bizzi/91-bizzi-food-v204.sql.</p>`
    : `<h3>Adresses Food Supabase en attente</h3><p>Aucune adresse Food distante en attente. Si une adresse vient d'être créée, exécutez sql-copie-bizzi/91-bizzi-food-v204.sql puis cliquez Charger validations Supabase.</p>`;

  exceptionPlacesRoot.innerHTML = remoteAdminQueue.exceptionPlaces.length ? `
    <h3>Lieux d’exception Supabase en attente</h3>
    ${remoteAdminQueue.exceptionPlaces.map((place) => `
      <div class="admin-item">
        <div>
          <h3>${safe(place.name || "Lieu d’exception")}</h3>
          <p>${safe(place.owner_name || "Responsable")} - ${safe(place.city_name || "Côte d’Ivoire")}${place.area ? ` - ${safe(place.area)}` : ""}</p>
          <p><strong>${safe(place.plan_name || "Inscription gratuite 1 mois")}</strong> - ${Number(place.amount || 0).toLocaleString("fr-FR")} FCFA - paiement ${safe(place.payment_status || "pending")}</p>
          <p>${safe(place.description || "Description non renseignée.")}</p>
        </div>
        <div class="admin-actions">
          <button class="primary" type="button" data-remote-publish-exception="${safe(place.id)}">Valider 30 jours</button>
          <button class="danger" type="button" data-remote-reject-exception="${safe(place.id)}">Refuser</button>
        </div>
      </div>
    `).join("")}
  ` : remoteAdminQueue.exceptionPlaceError
    ? `<h3>Lieux d’exception Supabase en attente</h3><p class="admin-warning">Lecture impossible : ${safe(remoteAdminQueue.exceptionPlaceError)}. Exécutez sql-copie-bizzi/98-lieux-exception-v302.sql.</p>`
    : `<h3>Lieux d’exception Supabase en attente</h3><p>Aucun dossier distant en attente.</p>`;

  const pendingProviderIds = new Set(remoteAdminQueue.providers.map((provider) => provider.id));
  const pendingPaymentsByProvider = remotePaymentByProviderId();
  const recentProviders = remoteAdminQueue.recentProviders.filter((provider) => !pendingProviderIds.has(provider.id));
  const providerSearchHtml = remoteProviderSearchHtml(pendingPaymentsByProvider);
  const submittedProvidersHtml = localSubmittedProvidersHtml();
  const localProvidersToSend = state.providers.filter((provider) => !remoteProviderId(provider) || provider.remoteStatus === "local_only");
  const adminAccessIssue = remoteAdminQueue.isAdmin === false
    || (remoteAdminQueue.isAdmin === true && Number(remoteAdminQueue.publicProviderCount || 0) > 0 && !remoteAdminQueue.recentProviders.length);
  const adminDiagnosticHtml = adminAccessIssue ? `
    <div class="admin-real-action warning">
      <strong>Correction admin nécessaire</strong>
      <span>${remoteAdminQueue.isAdmin === false
        ? "Le compte connecté à Supabase n'est pas reconnu comme administrateur Zeyds."
        : `${Number(remoteAdminQueue.publicProviderCount || 0)} prestataire(s) sont visibles côté public, mais l'admin ne peut pas lire la table providers.`}
      Exécutez <b>sql-copie-bizzi/20-correction-admin-file-vide.sql</b> dans Supabase SQL Editor, puis déconnectez/reconnectez l'admin.</span>
    </div>
  ` : "";
  const localProvidersHtml = localProvidersToSend.length ? `
    <h3>Prestataires locaux à envoyer vers Supabase</h3>
    <p>Si votre imprimeur est ici, il existe seulement sur cet appareil. Cliquez sur Envoyer vers Supabase pour le faire apparaître dans les validations officielles.</p>
    ${localProvidersToSend.map((provider) => `
      <div class="admin-item">
        <div>
          <h3>${safe(provider.fullName || "Prestataire local")}</h3>
          <p>${safe(provider.service || "Métier non renseigné")} - ${safe(provider.phone || "")} - ${safe(provider.city || "Côte d'Ivoire")}</p>
          ${provider.remoteError ? `<p class="admin-warning">Dernière erreur : ${safe(provider.remoteError)}</p>` : ""}
        </div>
        <div class="admin-actions">
            <button class="primary" type="button" data-remote-resend-local-provider="${safe(provider.id)}">Envoyer vers Supabase</button>
        </div>
      </div>
    `).join("")}
  ` : "";
  const pendingProvidersHtml = remoteAdminQueue.providers.length ? `
    <h3>Prestataires Supabase bloqués ou à vérifier (${remoteAdminQueue.providers.length})</h3>
    <p class="admin-warning">Les nouveaux prestataires sont visibles automatiquement. Si un profil reste ici, exécutez sql-copie-bizzi/54-auto-validation-prestataires-v121.sql puis rechargez l'admin.</p>
    ${remoteAdminQueue.providers.map((provider) => remoteProviderAdminCardHtml(provider, pendingPaymentsByProvider)).join("")}
  ` : `<h3>Prestataires Supabase bloqués ou à vérifier</h3><p>Aucun prestataire bloqué : les nouvelles inscriptions doivent être visibles automatiquement pendant le mois gratuit.</p>`;

  const recentProvidersHtml = recentProviders.length ? `
    <h3>Prestataires Supabase récents</h3>
    <p>Diagnostic : si votre test est ici, il existe dans Supabase mais il n'est plus dans la file d'attente.</p>
    ${recentProviders.map((provider) => remoteProviderAdminCardHtml(provider, pendingPaymentsByProvider)).join("")}
  ` : `<h3>Prestataires Supabase récents</h3><p>Aucun prestataire récent chargé depuis Supabase.</p>`;

  providersRoot.innerHTML = `${adminDiagnosticHtml}${providerSearchHtml}${submittedProvidersHtml}${localProvidersHtml}${pendingProvidersHtml}${recentProvidersHtml}`;

}

function setupAdminRemoteActionDelegation() {
  if (adminRemoteActionsReady) return;
  const adminContent = document.querySelector("#adminContent");
  if (!adminContent) return;
  adminRemoteActionsReady = true;

  adminContent.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-remote-provider-search-form]");
    if (!form || !adminContent.contains(form)) return;
    event.preventDefault();
    searchRemoteProvider(form.querySelector("input[name='query']")?.value || "", form.querySelector("button[type='submit']"));
  });

  adminContent.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remote-approve-payment], [data-remote-activate-trial], [data-remote-replay-request], [data-remote-close-request], [data-remote-approve-job], [data-remote-archive-job], [data-remote-approve-event], [data-remote-reject-event], [data-remote-publish-food], [data-remote-reject-food], [data-remote-publish-exception], [data-remote-reject-exception], [data-remote-resend-local-provider], [data-remote-update-service], [data-remote-find-local-provider], [data-remote-suspend-provider], [data-remote-restore-provider]");
    if (!button || !adminContent.contains(button) || button.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    if (button.dataset.remoteApprovePayment) {
      renderAdminRemoteStatus("Validation du paiement Supabase en cours...", true);
      approveRemotePayment(button.dataset.remoteApprovePayment, button);
      return;
    }

    if (button.dataset.remoteResendLocalProvider) {
      resendLocalProviderToSupabase(button.dataset.remoteResendLocalProvider, button);
      return;
    }

    if (button.dataset.remoteFindLocalProvider) {
      const provider = state.providers.find((item) => item.id === button.dataset.remoteFindLocalProvider);
      const query = provider?.phone || provider?.fullName || "";
      searchRemoteProvider(query, button);
      return;
    }

    if (button.dataset.remoteUpdateService) {
      const select = button.closest(".admin-item")?.querySelector("[data-remote-service-select]");
      updateRemoteProviderService(button.dataset.remoteUpdateService, select?.value || "", button);
      return;
    }

    if (button.dataset.remoteActivateTrial) {
      renderAdminRemoteStatus("Activation du mois gratuit en cours...", true);
      const select = button.closest(".admin-item")?.querySelector("[data-remote-service-select]");
      activateRemoteTrialProvider(button.dataset.remoteActivateTrial, button, select?.value || "");
      return;
    }

    if (button.dataset.remoteSuspendProvider) {
      moderateRemoteProvider(button.dataset.remoteSuspendProvider, "suspend", button);
      return;
    }

    if (button.dataset.remoteRestoreProvider) {
      moderateRemoteProvider(button.dataset.remoteRestoreProvider, "restore", button);
      return;
    }

    if (button.dataset.remoteReplayRequest) {
      const row = remoteAdminQueue.requests.find((item) => item.id === button.dataset.remoteReplayRequest);
      if (!row) {
        renderAdminRemoteStatus("Demande introuvable. Cliquez sur Charger validations Supabase puis réessayez.", true);
        return;
      }
      const request = expressRequestFromSupabase(row);
      renderExpressRequestResult(request);
      setView("request");
      return;
    }

    if (button.dataset.remoteCloseRequest) {
      renderAdminRemoteStatus("Fermeture de la demande express Supabase en cours...", true);
      closeRemoteExpressRequest(button.dataset.remoteCloseRequest, button);
      return;
    }

    if (button.dataset.remoteApproveJob) {
      renderAdminRemoteStatus("Publication de l'offre emploi Supabase en cours...", true);
      approveRemoteJobOffer(button.dataset.remoteApproveJob, button);
      return;
    }

    if (button.dataset.remoteArchiveJob) {
      renderAdminRemoteStatus("Archivage de l'offre emploi Supabase en cours...", true);
      archiveRemoteJobOffer(button.dataset.remoteArchiveJob, button);
      return;
    }

    if (button.dataset.remoteApproveEvent) {
      renderAdminRemoteStatus("Publication de l'événement Supabase en cours...", true);
      approveRemoteEventPromotion(button.dataset.remoteApproveEvent, button);
      return;
    }

    if (button.dataset.remoteRejectEvent) {
      renderAdminRemoteStatus("Refus de l'événement Supabase en cours...", true);
      rejectRemoteEventPromotion(button.dataset.remoteRejectEvent, button);
      return;
    }

    if (button.dataset.remotePublishException) {
      renderAdminRemoteStatus("Validation du lieu d’exception Supabase en cours...", true);
      updateRemoteExceptionPlace(button.dataset.remotePublishException, "published", button);
      return;
    }

    if (button.dataset.remoteRejectException) {
      renderAdminRemoteStatus("Refus du lieu d’exception Supabase en cours...", true);
      updateRemoteExceptionPlace(button.dataset.remoteRejectException, "rejected", button);
      return;
    }

    if (button.dataset.remotePublishFood) {
      renderAdminRemoteStatus("Publication de l'adresse Food Supabase en cours...", true);
      publishRemoteFoodPlace(button.dataset.remotePublishFood, button);
      return;
    }

    if (button.dataset.remoteRejectFood) {
      renderAdminRemoteStatus("Refus de l'adresse Food Supabase en cours...", true);
      rejectRemoteFoodPlace(button.dataset.remoteRejectFood, button);
    }
  });
}

async function fetchRemoteExpressRequests() {
  const priorityQuery = "express_requests?select=id,service_name,city_name,area,urgency,message,customer_phone,status,created_at,matched_provider_ids,priority_score,priority_label,matched_count&status=eq.open&order=priority_score.desc,created_at.asc";
  const legacyQuery = "express_requests?select=id,service_name,city_name,area,urgency,message,customer_phone,status,created_at,matched_provider_ids&status=eq.open&order=created_at.asc";
  try {
    return await supabaseAdminRequest(priorityQuery);
  } catch {
    return supabaseAdminRequest(legacyQuery).catch(() => []);
  }
}

async function fetchRemotePendingJobs() {
  const fullQuery = "job_offers?select=id,title,company_name,company_type,contact_phone,contact_email,service_name,city_name,description,status,created_at,plan_name,amount,currency,payment_method,transaction_reference,payment_status,is_boosted,job_credits,proof_url&status=eq.pending&order=created_at.asc";
  const legacyQuery = "job_offers?select=id,title,company_name,contact_phone,contact_email,service_name,city_name,description,status,created_at,plan_name,amount,currency,payment_method,transaction_reference,payment_status,is_boosted,job_credits,proof_url&status=eq.pending&order=created_at.asc";
  try {
    return await supabaseAdminRequest(fullQuery);
  } catch (error) {
    if (!/company_type|schema cache|column/i.test(String(error?.message || error))) throw error;
    return supabaseAdminRequest(legacyQuery);
  }
}

async function fetchRemotePendingEvents() {
  const fullQuery = "event_promotions?select=id,title,description,event_datetime,end_datetime,venue,area,venue_address,latitude,longitude,visibility_radius_km,city_name,category,poster_url,ticket_price,ticket_url,contact_phone,organizer_name,status,created_at,plan_name,amount,currency,payment_method,transaction_reference,payment_status,is_sponsored,is_premium,click_count,ticket_click_count,contact_click_count,detail_view_count,stats_sent_at&status=eq.pending&order=created_at.asc";
  const legacyQuery = "event_promotions?select=id,title,description,event_datetime,venue,city_name,category,poster_url,ticket_price,ticket_url,contact_phone,organizer_name,status,created_at,plan_name,amount,currency,payment_method,transaction_reference,payment_status,is_sponsored,is_premium&status=eq.pending&order=created_at.asc";
  try {
    return await supabaseAdminRequest(fullQuery);
  } catch (error) {
    if (!/schema cache|column|end_datetime|venue_address|visibility_radius|click_count/i.test(String(error?.message || error))) throw error;
    return supabaseAdminRequest(legacyQuery);
  }
}

async function fetchRemotePendingFoodPlaces() {
  const fullQuery = "food_places?select=id,name,owner_name,contact_phone,place_type,main_specialty,specialties,city_name,area,address,average_budget,opening_hours,delivery_available,description,photo_url,rating,click_count,contact_click_count,status,verification_status,created_at,updated_at&status=eq.pending&order=created_at.asc";
  const legacyQuery = "food_places?select=id,name,contact_phone,place_type,main_specialty,city_name,area,address,status,created_at&status=eq.pending&order=created_at.asc";
  try {
    return await supabaseAdminRequest(fullQuery);
  } catch (error) {
    if (!/schema cache|column|owner_name|average_budget|opening_hours|verification_status/i.test(String(error?.message || error))) throw error;
    return supabaseAdminRequest(legacyQuery);
  }
}

async function fetchRemotePendingExceptionPlaces() {
  return supabaseAdminRequest("exception_places?select=id,name,owner_name,contact_phone,city_name,area,address,description,photo_url,plan_id,plan_name,amount,currency,payment_method,payment_reference,payment_status,boost_days,status,created_at&status=eq.pending&order=created_at.asc");
}

async function checkRemoteAdminRole() {
  try {
    return await supabaseRpc("is_admin", {}, { accessToken: requireAdminAccessToken() });
  } catch {
    return null;
  }
}

async function fetchPublicProvidersForAdminDiagnostic() {
  try {
    return await supabaseFetch("public_provider_directory?select=id,full_name,phone,service_name,category_name,visibility_status&order=boost_ends_at.desc.nullslast,full_name.asc&limit=100");
  } catch {
    return supabaseFetch("public_provider_directory?select=id,full_name,phone,service_name,category_name,visibility_status&order=full_name.asc&limit=100").catch(() => null);
  }
}

async function fetchPublicProviderCount() {
  try {
    const result = await supabaseRpc("bizzi_public_provider_count", {}, { prefer: "return=representation" });
    return Number(Array.isArray(result) ? result[0] : result);
  } catch {
    return null;
  }
}

function normalizePhoneForMatch(phone = "") {
  return String(phone || "").replace(/\D/g, "");
}

function publicProviderLookup(publicRows = []) {
  const byId = new Map();
  const byPhone = new Map();
  const byName = new Map();
  (Array.isArray(publicRows) ? publicRows : []).forEach((row) => {
    if (!row) return;
    if (row.id) byId.set(row.id, row);
    if (row.phone) phoneMatchKeys(row.phone).forEach((key) => byPhone.set(key, row));
    if (row.full_name) byName.set(normalizedCatalogKey(row.full_name), row);
  });
  return { byId, byPhone, byName };
}

function hydrateRemoteProviderServicesFromPublic(providers = [], publicRows = []) {
  const publicVisibilityChecked = Array.isArray(publicRows);
  if (!publicVisibilityChecked) {
    return (Array.isArray(providers) ? providers : []).map((provider) => ({
      ...provider,
      public_visibility_checked: false,
    }));
  }
  const lookup = publicProviderLookup(publicRows);
  return (Array.isArray(providers) ? providers : []).map((provider) => {
    const publicRow = lookup.byId.get(provider.id)
      || [...phoneMatchKeys(provider.phone)].map((key) => lookup.byPhone.get(key)).find(Boolean);
    if (!publicRow?.id && !publicRow?.service_name) {
      const directlyVisible = provider.status === "approved" && ["trial", "active"].includes(provider.visibility_status);
      if (directlyVisible) {
        return {
          ...provider,
          public_visible: true,
          public_visibility_checked: true,
          public_visibility_status: provider.visibility_status,
          service_name: canonicalServiceName(remoteProviderService(provider)),
          category_name: canonicalCategoryName(provider.requested_category_name || "Autres"),
        };
      }
      return {
        ...provider,
        public_visible: false,
        public_visibility_status: "",
        public_visibility_checked: true,
      };
    }
    const publicVisibilityStatus = publicRow.visibility_status || provider.visibility_status || "trial";
    const providerStatus = provider.status || "approved";
    const providerVisibility = provider.visibility_status || publicVisibilityStatus;
    const promotePendingVisibleProvider = providerStatus === "pending" && ["trial", "active", "expired_blurred"].includes(publicVisibilityStatus);
    return {
      ...provider,
      public_visible: true,
      public_visibility_checked: true,
      public_visibility_status: publicVisibilityStatus,
      status: promotePendingVisibleProvider ? "approved" : providerStatus,
      visibility_status: promotePendingVisibleProvider ? publicVisibilityStatus : providerVisibility,
      service_name: canonicalServiceName(publicRow.service_name || remoteProviderService(provider)),
      category_name: canonicalCategoryName(publicRow.category_name || ""),
    };
  });
}

async function fetchRemotePendingProviders() {
  const detailedWithBackup = "providers?select=id,full_name,phone,status,visibility_status,created_at,requested_service_name,requested_category_name,provider_services(is_primary,services(name))&status=eq.pending&order=created_at.asc&limit=100";
  const detailed = "providers?select=id,full_name,phone,status,visibility_status,created_at,provider_services(is_primary,services(name))&status=eq.pending&order=created_at.asc&limit=100";
  const simpleWithBackup = "providers?select=id,full_name,phone,status,visibility_status,created_at,requested_service_name,requested_category_name&status=eq.pending&order=created_at.asc&limit=100";
  const simple = "providers?select=id,full_name,phone,status,visibility_status,created_at&status=eq.pending&order=created_at.asc&limit=100";
  try {
    return await supabaseAdminRequest(detailedWithBackup);
  } catch {
  }
  try {
    return await supabaseAdminRequest(detailed);
  } catch {
    try {
      return await supabaseAdminRequest(simpleWithBackup);
    } catch {
      return supabaseAdminRequest(simple);
    }
  }
}

async function fetchRemoteRecentProviders() {
  const detailedWithBackup = "providers?select=id,full_name,phone,status,visibility_status,created_at,requested_service_name,requested_category_name,provider_services(is_primary,services(name))&order=created_at.desc&limit=50";
  const detailed = "providers?select=id,full_name,phone,status,visibility_status,created_at,provider_services(is_primary,services(name))&order=created_at.desc&limit=50";
  const simpleWithBackup = "providers?select=id,full_name,phone,status,visibility_status,created_at,requested_service_name,requested_category_name&order=created_at.desc&limit=50";
  const simple = "providers?select=id,full_name,phone,status,visibility_status,created_at&order=created_at.desc&limit=50";
  try {
    return await supabaseAdminRequest(detailedWithBackup);
  } catch {
  }
  try {
    return await supabaseAdminRequest(detailed);
  } catch {
    try {
      return await supabaseAdminRequest(simpleWithBackup);
    } catch {
      return supabaseAdminRequest(simple);
    }
  }
}

async function fetchRemoteProviderById(providerId) {
  if (!providerId) return null;
  const id = encodeURIComponent(providerId);
  const boostedDetailedWithBackup = `providers?select=id,full_name,phone,status,visibility_status,trial_started_at,trial_ends_at,subscription_ends_at,boost_ends_at,created_at,requested_service_name,requested_category_name,provider_services(is_primary,services(name))&id=eq.${id}&limit=1`;
  const detailedWithBackup = `providers?select=id,full_name,phone,status,visibility_status,trial_started_at,trial_ends_at,subscription_ends_at,created_at,requested_service_name,requested_category_name,provider_services(is_primary,services(name))&id=eq.${id}&limit=1`;
  const detailed = `providers?select=id,full_name,phone,status,visibility_status,trial_started_at,trial_ends_at,subscription_ends_at,created_at,provider_services(is_primary,services(name))&id=eq.${id}&limit=1`;
  const simpleWithBackup = `providers?select=id,full_name,phone,status,visibility_status,trial_started_at,trial_ends_at,subscription_ends_at,created_at,requested_service_name,requested_category_name&id=eq.${id}&limit=1`;
  const simple = `providers?select=id,full_name,phone,status,visibility_status,trial_started_at,trial_ends_at,subscription_ends_at,created_at&id=eq.${id}&limit=1`;
  let rows;
  try {
    rows = await supabaseAdminRequest(boostedDetailedWithBackup);
  } catch {
    try {
      rows = await supabaseAdminRequest(detailedWithBackup);
    } catch {
    }
  }
  if (!rows) {
    try {
      rows = await supabaseAdminRequest(detailed);
    } catch {
      try {
        rows = await supabaseAdminRequest(simpleWithBackup);
      } catch {
        rows = await supabaseAdminRequest(simple);
      }
    }
  }
  const provider = Array.isArray(rows) ? rows[0] : rows;
  if (!provider?.id) return null;
  const publicRows = await fetchPublicProvidersForAdminDiagnostic().catch(() => []);
  return hydrateRemoteProviderServicesFromPublic([provider], publicRows)[0] || provider;
}

async function searchRemoteProvider(query, button = null) {
  const normalized = String(query || "").trim();
  remoteAdminQueue.providerSearchQuery = normalized;
  if (!normalized) {
    remoteAdminQueue.providerSearchResults = [];
    renderRemoteAdminPanel();
    renderAdminRemoteStatus("Entrez un nom ou un numéro pour rechercher un prestataire Supabase.", true);
    return;
  }

  setBusyButton(button, true, "Recherche...");
  try {
    const pattern = encodeURIComponent(`*${normalized}*`);
    const detailedWithBackup = `providers?select=id,full_name,phone,status,visibility_status,created_at,requested_service_name,requested_category_name,provider_services(is_primary,services(name))&or=(full_name.ilike.${pattern},phone.ilike.${pattern})&order=created_at.desc&limit=25`;
    const detailed = `providers?select=id,full_name,phone,status,visibility_status,created_at,provider_services(is_primary,services(name))&or=(full_name.ilike.${pattern},phone.ilike.${pattern})&order=created_at.desc&limit=25`;
    const simpleWithBackup = `providers?select=id,full_name,phone,status,visibility_status,created_at,requested_service_name,requested_category_name&or=(full_name.ilike.${pattern},phone.ilike.${pattern})&order=created_at.desc&limit=25`;
    const simple = `providers?select=id,full_name,phone,status,visibility_status,created_at&or=(full_name.ilike.${pattern},phone.ilike.${pattern})&order=created_at.desc&limit=25`;
    let rows;
    try {
      rows = await supabaseAdminRequest(detailedWithBackup);
    } catch {
      try {
        rows = await supabaseAdminRequest(detailed);
      } catch {
        try {
          rows = await supabaseAdminRequest(simpleWithBackup);
        } catch {
          rows = await supabaseAdminRequest(simple);
        }
      }
    }
    const publicRows = await fetchPublicProvidersForAdminDiagnostic();
    remoteAdminQueue.providerSearchResults = hydrateRemoteProviderServicesFromPublic(Array.isArray(rows) ? rows : [], publicRows);
    renderRemoteAdminPanel();
    renderAdminRemoteStatus(`${remoteAdminQueue.providerSearchResults.length} résultat(s) trouvé(s) pour "${normalized}".`, true);
    finishActionButton(document.querySelector("[data-remote-provider-search-form] button[type='submit']"), "Rechercher");
  } catch (error) {
    remoteAdminQueue.providerSearchResults = [];
    renderRemoteAdminPanel();
    renderAdminRemoteStatus(`Recherche impossible : ${friendlySupabaseError(error)}`, true);
    finishActionButton(document.querySelector("[data-remote-provider-search-form] button[type='submit']"), "Erreur");
  }
}

function localCategoryForService(serviceName) {
  const key = normalizedCatalogKey(serviceName);
  return allServices().find((service) => normalizedCatalogKey(service.name) === key)?.category || "";
}

async function supabaseCategoryIdForAdmin(categoryName) {
  const name = canonicalCategoryName(categoryName || "Autres");
  const rows = await supabaseAdminRequest(`categories?select=id,name&name=${eqFilter(name)}&limit=1`).catch(() => []);
  const existing = Array.isArray(rows) ? rows[0] : rows;
  if (existing?.id) return existing.id;
  const inserted = await supabaseAdminRequest("categories?on_conflict=name", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: { name, sort_order: 900, is_active: true },
  });
  const row = Array.isArray(inserted) ? inserted[0] : inserted;
  if (!row?.id) throw new Error(`Categorie introuvable ou non creee : ${name}`);
  return row.id;
}

async function supabaseServiceIdForAdmin(serviceName) {
  const name = canonicalServiceName(String(serviceName || "").trim());
  if (!name) throw new Error("Choisissez un métier.");
  const preferredCategory = localCategoryForService(name);
  const rows = await supabaseAdminRequest(`services?select=id,name,is_active,category_id,categories(name)&name=${eqFilter(name)}`).catch(() => []);
  const rankedRows = (Array.isArray(rows) ? rows : [])
    .filter((row) => normalizedCatalogKey(row.name) === normalizedCatalogKey(name))
    .sort((a, b) => {
      const categoryA = canonicalCategoryName(Array.isArray(a.categories) ? a.categories[0]?.name : a.categories?.name);
      const categoryB = canonicalCategoryName(Array.isArray(b.categories) ? b.categories[0]?.name : b.categories?.name);
      const preferredA = preferredCategory && normalizedCatalogKey(categoryA) === normalizedCatalogKey(preferredCategory) ? 0 : 1;
      const preferredB = preferredCategory && normalizedCatalogKey(categoryB) === normalizedCatalogKey(preferredCategory) ? 0 : 1;
      return preferredA - preferredB || Number(b.is_active) - Number(a.is_active);
    });
  if (rankedRows[0]?.id) return rankedRows[0].id;

  const categoryId = await supabaseCategoryIdForAdmin(preferredCategory || "Autres");
  const inserted = await supabaseAdminRequest("services?on_conflict=category_id,name", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: {
      category_id: categoryId,
      name,
      sort_order: 900,
      is_active: true,
    },
  });
  const row = Array.isArray(inserted) ? inserted[0] : inserted;
  if (!row?.id) throw new Error(`Service introuvable ou non cree : ${name}`);
  return row.id;
}

async function setRemoteProviderPrimaryService(providerId, serviceName) {
  const service = canonicalServiceName(serviceName);
  if (!providerId || !service) return "";
  const categoryName = canonicalCategoryName(localCategoryForService(service) || "Autres");
  const serviceId = await supabaseServiceIdForAdmin(service);
  await supabaseAdminRequest(`provider_services?provider_id=eq.${encodeURIComponent(providerId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: { is_primary: false },
  }).catch(() => null);
  await supabaseAdminRequest("provider_services?on_conflict=provider_id,service_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: {
      provider_id: providerId,
      service_id: serviceId,
      is_primary: true,
    },
  });
  const providerPatch = {
    requested_service_name: service,
    requested_category_name: categoryName,
    updated_at: new Date().toISOString(),
  };
  await supabaseAdminRequest(`providers?id=eq.${encodeURIComponent(providerId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: providerPatch,
  }).catch(() => supabaseAdminRequest(`providers?id=eq.${encodeURIComponent(providerId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: { updated_at: providerPatch.updated_at },
  }).catch(() => null));
  return service;
}

async function updateRemoteProviderService(providerId, serviceName, button = null) {
  if (!providerId) return;
  const provider = remoteProviderById(providerId);
  const providerName = provider?.full_name || "Prestataire Supabase";
  const service = canonicalServiceName(serviceName);
  setBusyButton(button, true, "Mise à jour...");
  renderAdminRemoteStatus(`Mise à jour du métier de ${providerName} vers ${service || "..."}.`, true);
  try {
    await setRemoteProviderPrimaryService(providerId, service);
    if (provider) {
      provider.service_name = service;
      provider.category_name = localCategoryForService(service);
      provider.provider_services = [{ is_primary: true, services: { name: service } }];
    }
    renderRemoteAdminPanel();
    finishActionButton(button, "Métier modifié");
    await loadSupabaseAdminQueue();
    await syncSupabasePublicData();
    renderAdminRemoteStatus(`Métier mis à jour pour ${providerName} : ${service}. Les données publiques ont été réimportées.`, true);
  } catch (error) {
    renderAdminRemoteStatus(`Modification métier impossible : ${friendlySupabaseError(error)}`, true);
    finishActionButton(button, "Erreur");
  }
}

async function loadSupabaseAdminQueue(button = null) {
  setBusyButton(button, true, "Chargement...");
  try {
    let jobError = "";
    let eventError = "";
    let foodError = "";
    let exceptionPlaceError = "";
    const [isAdmin, publicProviders, publicProviderCount, payments, providers, recentProviders, requests, jobs, events, foods, exceptionPlaces] = await Promise.all([
      checkRemoteAdminRole(),
      fetchPublicProvidersForAdminDiagnostic(),
      fetchPublicProviderCount(),
      supabaseAdminRequest("payments?select=id,amount,currency,method,transaction_reference,admin_note,status,created_at,provider_id,providers(full_name,phone),subscription_plans(name,price,duration_months)&status=eq.pending&order=created_at.asc&limit=200"),
      fetchRemotePendingProviders(),
      fetchRemoteRecentProviders(),
      fetchRemoteExpressRequests(),
      fetchRemotePendingJobs().catch((error) => {
        jobError = friendlySupabaseError(error);
        return [];
      }),
      fetchRemotePendingEvents().catch((error) => {
        eventError = friendlySupabaseError(error);
        return [];
      }),
      fetchRemotePendingFoodPlaces().catch((error) => {
        foodError = friendlySupabaseError(error);
        return [];
      }),
      fetchRemotePendingExceptionPlaces().catch((error) => {
        exceptionPlaceError = friendlySupabaseError(error);
        return [];
      }),
    ]);
    const allPendingPayments = Array.isArray(payments) ? payments : [];
    const hydratedPendingProviders = hydrateRemoteProviderServicesFromPublic(Array.isArray(providers) ? providers : [], publicProviders);
    const publicVisiblePendingProviders = hydratedPendingProviders
      .filter((provider) => provider.public_visible)
      .map((provider) => ({
        ...provider,
        status: "approved",
        visibility_status: provider.public_visibility_status || provider.visibility_status || "trial",
      }));
    const hydratedRecentProviders = hydrateRemoteProviderServicesFromPublic(Array.isArray(recentProviders) ? recentProviders : [], publicProviders);
    const visibleIds = new Set(publicVisiblePendingProviders.map((provider) => provider.id));

    remoteAdminQueue = {
      payments: dedupeRemotePayments(allPendingPayments),
      providers: hydratedPendingProviders.filter((provider) => !provider.public_visible),
      recentProviders: [
        ...publicVisiblePendingProviders,
        ...hydratedRecentProviders.filter((provider) => !visibleIds.has(provider.id)),
      ].slice(0, 50),
      ads: [],
      requests: Array.isArray(requests) ? requests : [],
      jobs: Array.isArray(jobs) ? jobs : [],
      jobError,
      events: Array.isArray(events) ? events : [],
      eventError,
      foods: Array.isArray(foods) ? foods : [],
      foodError,
      exceptionPlaces: Array.isArray(exceptionPlaces) ? exceptionPlaces : [],
      exceptionPlaceError,
      providerSearchQuery: "",
      providerSearchResults: [],
      isAdmin,
      publicProviderCount: Number.isFinite(publicProviderCount)
        ? publicProviderCount
        : (Array.isArray(publicProviders) ? publicProviders.length : null),
    };
    renderRemoteAdminPanel();
    renderLaunchChecklist();
    const adminWarning = remoteAdminQueue.isAdmin === false
      ? " Votre compte Supabase est connecté mais pas reconnu comme admin Zeyds : exécutez sql-copie-bizzi/20-correction-admin-file-vide.sql."
      : Number(remoteAdminQueue.publicProviderCount || 0) > 0 && remoteAdminQueue.recentProviders.length === 0
        ? " Des prestataires existent côté public, mais l'admin n'arrive pas à lire providers : exécutez sql-copie-bizzi/20-correction-admin-file-vide.sql."
        : "";
    const pendingProviderText = remoteAdminQueue.providers.length
      ? ` Prestataire(s) à valider : ${remoteAdminQueue.providers.map(remoteProviderLine).join(" | ")}. La liste et les boutons d'activation sont juste sous ce résumé.`
      : "";
    const duplicatePaymentCount = allPendingPayments.length - remoteAdminQueue.payments.length;
    const duplicatePaymentText = duplicatePaymentCount > 0
      ? ` ${duplicatePaymentCount} doublon(s) de paiement masqué(s) pour éviter une double validation.`
      : "";
    const jobErrorText = remoteAdminQueue.jobError ? ` Erreur offres emploi : ${remoteAdminQueue.jobError}.` : "";
    const eventErrorText = remoteAdminQueue.eventError ? ` Erreur événements : ${remoteAdminQueue.eventError}.` : "";
    const foodErrorText = remoteAdminQueue.foodError ? ` Erreur Food : ${remoteAdminQueue.foodError}.` : "";
    const exceptionPlaceErrorText = remoteAdminQueue.exceptionPlaceError ? ` Erreur lieux d’exception : ${remoteAdminQueue.exceptionPlaceError}.` : "";
    renderAdminRemoteStatus(`${remoteAdminQueue.payments.length} paiement(s), ${remoteAdminQueue.providers.length} prestataire(s), ${remoteAdminQueue.requests.length} demande(s) express, ${remoteAdminQueue.jobs.length} offre(s) emploi, ${remoteAdminQueue.events.length} événement(s), ${remoteAdminQueue.foods.length} adresse(s) Food et ${remoteAdminQueue.exceptionPlaces.length} lieu(x) d’exception en attente dans Supabase. ${remoteAdminQueue.recentProviders.length} prestataire(s) récent(s) chargés pour diagnostic.${duplicatePaymentText}${pendingProviderText}${jobErrorText}${eventErrorText}${foodErrorText}${exceptionPlaceErrorText}${adminWarning}`, true);
    finishActionButton(button, "Chargé");
  } catch (error) {
    renderAdminRemoteStatus(`Chargement impossible : ${friendlySupabaseError(error)}`, true);
    finishActionButton(button, "Erreur");
  }
}

async function approveRemotePayment(paymentId, button = null) {
  if (!paymentId) return;
  setBusyButton(button, true, "Validation...");
  const payment = remoteAdminQueue.payments.find((item) => item.id === paymentId);
  const providerName = payment ? remoteProviderName(payment) : "le prestataire";
  const planName = payment ? remotePlanName(payment) : "le forfait";
  try {
    const providerBeforeApproval = payment?.provider_id
      ? await fetchRemoteProviderById(payment.provider_id).catch(() => null)
      : null;
    const result = await supabaseRpc("admin_approve_payment", { payment_uuid: paymentId }, {
      accessToken: requireAdminAccessToken(),
      prefer: "return=representation",
    });
    if (payment) {
      await forceApprovePaymentRecord(payment);
    }
    const activation = payment ? await forceActivateProviderAfterPayment(payment, result, providerBeforeApproval) : {};
    const subscriptionEndsAt = activation.subscriptionEndsAt || "";
    if (payment) {
      const localProvider = state.providers.find((provider) => remoteProviderId(provider) === payment.provider_id || provider.phone === remoteProviderPhone(payment));
      if (localProvider) {
        localProvider.subscriptionEndsAt = laterIsoDate(localProvider.subscriptionEndsAt, activation.subscriptionEndsAt);
        localProvider.boostEndsAt = laterIsoDate(localProvider.boostEndsAt, activation.boostEndsAt);
        saveState();
      }
    }
    const rejectedDuplicates = payment ? await rejectDuplicatePendingPayments(payment, paymentId) : 0;
    const payload = Array.isArray(result) ? result[0] : result;
    const endDateValue = payload?.subscription_ends_at || subscriptionEndsAt;
    const endDate = endDateValue
      ? ` Abonnement actif jusqu'au ${new Date(endDateValue).toLocaleDateString("fr-FR")}.`
      : "";
    const boostDate = activation.boostEndsAt
      ? ` Boost actif jusqu'au ${new Date(activation.boostEndsAt).toLocaleDateString("fr-FR")}.`
      : "";
    const boostWarning = activation.boostEndsAt && activation.boostPersisted === false
      ? " La colonne Supabase boost_ends_at doit être installée pour partager ce boost sur tous les appareils."
      : "";
    remoteAdminQueue.payments = remoteAdminQueue.payments.filter((item) => item.id !== paymentId && !(payment?.duplicate_ids || []).includes(item.id));
    renderRemoteAdminPanel();
    const duplicateMessage = rejectedDuplicates ? ` ${rejectedDuplicates} doublon(s) rejeté(s) automatiquement.` : "";
    renderAdminRemoteStatus(`Paiement Supabase validé pour ${providerName} (${planName}).${endDate}${boostDate}${duplicateMessage}${boostWarning}`, true);
    await loadSupabaseAdminQueue();
    await syncSupabasePublicData();
    renderAdminRemoteStatus(`Paiement Supabase validé pour ${providerName} (${planName}).${endDate}${boostDate}${duplicateMessage}${boostWarning} La file d'attente a été rechargée.`, true);
    renderLaunchChecklist();
    finishActionButton(button, "Validé");
  } catch (error) {
    renderAdminRemoteStatus(`Validation impossible : ${friendlySupabaseError(error)}`, true);
    finishActionButton(button, "Erreur");
  }
}

async function forceApprovePaymentRecord(payment) {
  if (!payment?.id) return;
  await supabaseAdminRequest(`payments?id=eq.${encodeURIComponent(payment.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: {
      status: "approved",
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
}

async function rejectDuplicatePendingPayments(payment, approvedPaymentId) {
  const reference = String(payment?.transaction_reference || "").trim();
  if (!payment?.provider_id || !reference) return 0;
  const rows = await supabaseAdminRequest(`payments?select=id,status&provider_id=eq.${encodeURIComponent(payment.provider_id)}&transaction_reference=${eqFilter(reference)}&status=eq.pending`);
  const duplicates = (Array.isArray(rows) ? rows : [])
    .filter((row) => row?.id && row.id !== approvedPaymentId);
  if (!duplicates.length) return 0;
  await Promise.all(duplicates.map((row) => supabaseAdminRequest(`payments?id=eq.${encodeURIComponent(row.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: {
      status: "rejected",
      admin_note: `Doublon automatique de ${approvedPaymentId}`,
      updated_at: new Date().toISOString(),
    },
  })));
  return duplicates.length;
}

function addMonthsFromNowIso(months = 1) {
  const date = new Date();
  date.setMonth(date.getMonth() + Math.max(1, Number(months) || 1));
  return date.toISOString();
}

async function forceActivateProviderAfterPayment(payment, result = null, providerBeforeApproval = null) {
  if (!payment?.provider_id) return {};
  const payload = Array.isArray(result) ? result[0] : result;
  const durationMonths = Number(payment.subscription_plans?.duration_months || planMonths(remotePlanName(payment)) || 1);
  const calculatedSubscriptionEnd = extendExpiryIso(providerBeforeApproval?.subscription_ends_at, { months: durationMonths });
  const subscriptionEndsAt = laterIsoDate(payload?.subscription_ends_at, calculatedSubscriptionEnd);
  const boost = boostFromPayment(payment);
  const boostEndsAt = boost?.days
    ? extendExpiryIso(providerBeforeApproval?.boost_ends_at, { days: boost.days })
    : providerBeforeApproval?.boost_ends_at || "";
  const body = {
    status: "approved",
    visibility_status: "active",
    subscription_ends_at: subscriptionEndsAt,
    updated_at: new Date().toISOString(),
  };
  if (boostEndsAt) body.boost_ends_at = boostEndsAt;
  let boostPersisted = true;
  try {
    await supabaseAdminRequest(`providers?id=eq.${encodeURIComponent(payment.provider_id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body,
    });
  } catch (error) {
    if (!boostEndsAt || !/boost_ends_at|schema cache|column/i.test(String(error?.message || error))) throw error;
    boostPersisted = false;
    delete body.boost_ends_at;
    await supabaseAdminRequest(`providers?id=eq.${encodeURIComponent(payment.provider_id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body,
    });
  }
  return { subscriptionEndsAt, boostEndsAt, boostPersisted };
}

async function fetchPublicProviderById(providerId) {
  if (!providerId) return null;
  let rows = await supabaseFetch(`public_provider_directory?select=id,full_name,phone,service_name,category_name,visibility_status,trial_ends_at,subscription_ends_at,boost_ends_at&id=eq.${encodeURIComponent(providerId)}&limit=1`).catch(() => null);
  if (!rows) {
    rows = await supabaseFetch(`public_provider_directory?select=id,full_name,phone,service_name,category_name,visibility_status,trial_ends_at,subscription_ends_at&id=eq.${encodeURIComponent(providerId)}&limit=1`).catch(() => []);
  }
  return Array.isArray(rows) ? rows[0] : rows;
}

async function forceActivateTrialProvider(providerId, trialStartedAt, trialEndsAt, providerPhone = "") {
  const cleanPhone = String(providerPhone || "").trim();
  let rpcError = null;
  let publicRpcError = null;
  let patchError = null;
  let patchSucceeded = false;

  if (cleanPhone) {
    try {
      await supabaseRpc("public_activate_provider_trial", {
        provider_uuid: providerId,
        provider_phone: cleanPhone,
      }, {
        prefer: "return=representation",
        timeoutMs: 8000,
      });
    } catch (error) {
      publicRpcError = error;
    }
  }

  try {
    await supabaseRpc("admin_activate_trial_provider", { provider_uuid: providerId }, {
      accessToken: requireAdminAccessToken(),
      prefer: "return=representation",
      timeoutMs: 12000,
    });
  } catch (error) {
    rpcError = error;
  }

  try {
    await supabaseAdminRequest(`providers?id=eq.${encodeURIComponent(providerId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: {
        status: "approved",
        visibility_status: "trial",
        trial_started_at: trialStartedAt,
        trial_ends_at: trialEndsAt,
        updated_at: trialStartedAt,
      },
      timeoutMs: 12000,
    });
    patchSucceeded = true;
  } catch (error) {
    patchError = error;
  }

  let refreshed = null;
  try {
    refreshed = await fetchRemoteProviderById(providerId);
  } catch (error) {
    if (!patchSucceeded) throw error;
    refreshed = {
      id: providerId,
      status: "approved",
      visibility_status: "trial",
      trial_started_at: trialStartedAt,
      trial_ends_at: trialEndsAt,
      subscription_ends_at: null,
    };
  }
  if (!refreshed?.id) {
    throw new Error("Supabase n'a pas retrouvé le prestataire après l'activation.");
  }
  if (refreshed.status !== "approved") {
    const publicVisible = await fetchPublicProviderById(providerId).catch(() => null);
    if (publicVisible?.id) {
      return {
        ...refreshed,
        status: "approved",
        visibility_status: publicVisible.visibility_status || "trial",
        service_name: publicVisible.service_name || refreshed.service_name,
        category_name: publicVisible.category_name || refreshed.category_name,
      };
    }
    const details = [
      publicRpcError ? `activation publique : ${friendlySupabaseError(publicRpcError)}` : "",
      rpcError ? `fonction Supabase : ${friendlySupabaseError(rpcError)}` : "",
      patchError ? `mise à jour directe : ${friendlySupabaseError(patchError)}` : "",
    ].filter(Boolean).join(" | ");
    throw new Error(`Activation non confirmée par Supabase : le statut est encore ${refreshed.status || "inconnu"} / ${refreshed.visibility_status || "inconnu"}.${details ? ` ${details}.` : ""} Exécutez sql-copie-bizzi/54-auto-validation-prestataires-v121.sql puis rechargez l'admin.`);
  }
  return refreshed;
}

async function activateRemoteTrialProvider(providerId, button = null, selectedService = "") {
  if (!providerId) return;
  remoteActivationBusyIds.add(providerId);
  remoteActivationIssueById.delete(providerId);
  setBusyButton(button, true, "Activation...");
  renderAdminRemoteStatus("Activation du mois gratuit en cours...", true);
  const trialStartedAt = new Date().toISOString();
  const trialEndsAt = isoDaysFromNow(30);
  try {
    renderRemoteAdminPanel();
    const chosenService = canonicalServiceName(selectedService);
    const providerBeforeActivation = remoteProviderById(providerId) || await fetchRemoteProviderById(providerId).catch(() => null);
    let serviceError = null;
    let refreshed = await forceActivateTrialProvider(providerId, trialStartedAt, trialEndsAt, providerBeforeActivation?.phone || "");
    if (chosenService) {
      try {
        await setRemoteProviderPrimaryService(providerId, chosenService);
        const provider = remoteProviderById(providerId);
        if (provider) {
          provider.service_name = chosenService;
          provider.category_name = localCategoryForService(chosenService);
          provider.provider_services = [{ is_primary: true, services: { name: chosenService } }];
        }
        refreshed = await fetchRemoteProviderById(providerId).catch(() => ({
          ...refreshed,
          service_name: chosenService,
          category_name: localCategoryForService(chosenService),
          provider_services: [{ is_primary: true, services: { name: chosenService } }],
        }));
      } catch (error) {
        serviceError = error;
      }
    }
    remoteAdminQueue.providers = remoteAdminQueue.providers.filter((provider) => provider.id !== providerId);
    remoteAdminQueue.recentProviders = [
      refreshed,
      ...remoteAdminQueue.recentProviders.filter((provider) => provider.id !== providerId),
    ].slice(0, 50);
    renderRemoteAdminPanel();
    const serviceMessage = serviceError
      ? ` Métier à vérifier : l'essai est activé, mais la liaison métier a été refusée (${friendlySupabaseError(serviceError)}). Utilisez ensuite Mettre à jour métier.`
      : (remoteProviderService(refreshed) ? ` Métier lié : ${remoteProviderService(refreshed)}.` : " Attention : métier encore non lié, choisissez un métier puis cliquez Mettre à jour métier.");
    renderAdminRemoteStatus(`${safe(refreshed.full_name || "Prestataire")} activé : statut confirmé ${safe(refreshed.status)} / ${safe(refreshed.visibility_status)}.${serviceMessage}`, true);
    finishActionButton(button, "Activé");
    await loadSupabaseAdminQueue();
    const confirmedAfterReload = await fetchRemoteProviderById(providerId).catch(() => null);
    const confirmedPublic = await fetchPublicProviderById(providerId).catch(() => null);
    const queueProvider = remoteProviderById(providerId);
    const confirmedStatus = (confirmedPublic?.id ? "approved" : "") || confirmedAfterReload?.status || queueProvider?.status || refreshed.status;
    const stillPending = !confirmedPublic?.id && (confirmedStatus === "pending" || remoteAdminQueue.providers.some((provider) => provider.id === providerId));
    if (stillPending || confirmedStatus !== "approved") {
      const issue = "Supabase n'a pas confirmé l'activation : le prestataire est encore en attente. Exécutez sql-copie-bizzi/54-auto-validation-prestataires-v121.sql dans Supabase, puis cliquez Charger validations Supabase.";
      remoteActivationIssueById.set(providerId, issue);
      remoteActivationBusyIds.delete(providerId);
      renderRemoteAdminPanel();
      renderAdminRemoteStatus(issue, true);
      finishActionButton(button, "À vérifier");
      return;
    }
    remoteActivationIssueById.delete(providerId);
    await syncSupabasePublicData();
    renderLaunchChecklist();
    renderAdminRemoteStatus("Mois gratuit activé. Les données publiques ont été réimportées : vérifiez maintenant côté client dans Services.", true);
  } catch (error) {
    remoteActivationIssueById.set(providerId, `Activation non confirmée : ${friendlySupabaseError(error)}`);
    remoteActivationBusyIds.delete(providerId);
    renderRemoteAdminPanel();
    renderAdminRemoteStatus(`Activation impossible : ${friendlySupabaseError(error)}`, true);
    finishActionButton(button, "Erreur");
  } finally {
    remoteActivationBusyIds.delete(providerId);
  }
}

function providerRowFromActionResult(result) {
  const payload = Array.isArray(result) ? result[0] : result;
  if (!payload) return null;
  if (payload.provider_id) {
    return {
      id: payload.provider_id,
      full_name: payload.provider_name || payload.full_name || "",
      phone: payload.phone || "",
      status: payload.status || "",
      visibility_status: payload.visibility_status || "",
      trial_ends_at: payload.trial_ends_at || null,
      subscription_ends_at: payload.subscription_ends_at || null,
    };
  }
  return payload;
}

async function setRemoteProviderClientVisibility(providerId, makeVisible) {
  const now = new Date().toISOString();
  let rpcError = null;
  let confirmed = null;
  const expectedState = (provider) => {
    const state = remoteProviderVisibilityState(provider);
    return makeVisible ? state.visible : state.hidden;
  };
  const directPatchBody = makeVisible
    ? {
        status: "approved",
        visibility_status: "trial",
        trial_started_at: now,
        trial_ends_at: isoDaysFromNow(30),
        subscription_ends_at: null,
        updated_at: now,
      }
    : {
        status: "suspended",
        visibility_status: "hidden",
        updated_at: now,
      };

  try {
    const result = await supabaseRpc(makeVisible ? "admin_reactivate_provider" : "admin_suspend_provider", {
      provider_uuid: providerId,
    }, {
      accessToken: requireAdminAccessToken(),
      prefer: "return=representation",
      timeoutMs: 12000,
    });
    confirmed = providerRowFromActionResult(result);
  } catch (error) {
    rpcError = error;
  }

  if (!confirmed?.id || !expectedState(confirmed)) {
    if (confirmed?.id && !expectedState(confirmed)) {
      rpcError = new Error(`La fonction SQL a retourné ${confirmed.status || "inconnu"} / ${confirmed.visibility_status || "inconnu"} au lieu du statut attendu.`);
      confirmed = null;
    }
    try {
      const result = await supabaseRpc("admin_set_provider_visibility", {
        provider_uuid: providerId,
        make_visible: makeVisible,
      }, {
        accessToken: requireAdminAccessToken(),
        prefer: "return=representation",
        timeoutMs: 12000,
      });
      const legacyConfirmed = providerRowFromActionResult(result);
      if (legacyConfirmed?.id && expectedState(legacyConfirmed)) {
        confirmed = legacyConfirmed;
      }
    } catch (error) {
      rpcError = rpcError || error;
    }
  }

  if (!confirmed?.id || !expectedState(confirmed)) {
    const rows = await supabaseAdminRequest(`providers?id=eq.${encodeURIComponent(providerId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: directPatchBody,
      timeoutMs: 12000,
    });
    const directConfirmed = providerRowFromActionResult(rows);
    if (directConfirmed?.id) {
      confirmed = directConfirmed;
    }
  }

  if (!confirmed?.id) {
    const details = rpcError ? ` Fonction SQL absente ou refusée : ${friendlySupabaseError(rpcError)}.` : "";
    throw new Error(`Supabase n'a retourné aucune ligne modifiée pour ce prestataire.${details} Exécutez sql-copie-bizzi/58-moderation-actions-separees-v128.sql puis réessayez.`);
  }

  let finalProvider = confirmed;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const refreshed = await fetchRemoteProviderById(providerId).catch(() => null);
    if (refreshed?.id) {
      finalProvider = refreshed;
      if (expectedState(refreshed)) break;
    }
    await waitMs(450);
  }
  const state = remoteProviderVisibilityState(finalProvider);
  if (makeVisible && !state.visible) {
    throw new Error(`Réactivation non confirmée : Supabase indique encore ${state.status || "inconnu"} / ${state.visibility || "inconnu"}. Exécutez sql-copie-bizzi/58-moderation-actions-separees-v128.sql puis réessayez.`);
  }
  if (!makeVisible && !state.hidden) {
    throw new Error(`Retrait non confirmé : Supabase indique encore ${state.status || "inconnu"} / ${state.visibility || "inconnu"}. Exécutez sql-copie-bizzi/58-moderation-actions-separees-v128.sql puis réessayez.`);
  }
  return finalProvider;
}

function replaceRemoteProviderInAdminQueue(provider) {
  if (!provider?.id) return;
  remoteAdminQueue.providers = (remoteAdminQueue.providers || []).filter((item) => item.id !== provider.id);
  const currentProvider = remoteProviderById(provider.id) || {};
  const visibilityState = remoteProviderVisibilityState(provider);
  const normalizedProvider = {
    ...currentProvider,
    ...provider,
    public_visible: visibilityState.visible,
    public_visibility_status: visibilityState.visible ? provider.visibility_status : "",
    public_visibility_checked: true,
  };
  remoteAdminQueue.recentProviders = [
    normalizedProvider,
    ...(remoteAdminQueue.recentProviders || []).filter((item) => item.id !== provider.id),
  ].slice(0, 50);
  remoteAdminQueue.providerSearchResults = (remoteAdminQueue.providerSearchResults || []).map((item) => (
    item.id === provider.id ? normalizedProvider : item
  ));
}

async function moderateRemoteProvider(providerId, action, button = null) {
  if (!providerId) return;
  const provider = remoteProviderById(providerId);
  const providerName = provider?.full_name || "ce prestataire";
  const suspend = action === "suspend";
  if (suspend && !window.confirm(`Retirer ${providerName} du côté client ?`)) return;

  remoteModerationBusyById.set(providerId, action);
  remoteModerationIssueById.delete(providerId);
  setBusyButton(button, true, suspend ? "Retrait..." : "Remise...");
  renderRemoteAdminPanel();
  renderAdminRemoteStatus(suspend
    ? `Retrait de ${providerName} côté client en cours...`
    : `Remise en visibilité de ${providerName} en cours...`, true);

  try {
    const confirmedProvider = await setRemoteProviderClientVisibility(providerId, !suspend);

    remoteAdminQueue.providerSearchQuery = "";
    remoteAdminQueue.providerSearchResults = [];
    remoteModerationBusyById.delete(providerId);
    remoteModerationIssueById.delete(providerId);
    replaceRemoteProviderInAdminQueue(confirmedProvider);
    renderRemoteAdminPanel();
    renderAdminRemoteStatus(suspend
      ? `${providerName} a été retiré côté client : Supabase a confirmé suspended / hidden. Cliquez ensuite sur Importer public Supabase pour rafraîchir le catalogue client.`
      : `${providerName} est à nouveau visible côté client : Supabase a confirmé approved / trial. Cliquez ensuite sur Importer public Supabase pour rafraîchir le catalogue client.`, true);
    finishActionButton(button, suspend ? "Retiré" : "Visible");
  } catch (error) {
    const message = friendlySupabaseError(error);
    remoteModerationIssueById.set(providerId, message);
    remoteModerationBusyById.delete(providerId);
    renderRemoteAdminPanel();
    renderAdminRemoteStatus(`${suspend ? "Retrait" : "Remise visible"} impossible : ${message}`, true);
    finishActionButton(button, "Erreur");
  } finally {
    remoteModerationBusyById.delete(providerId);
  }
}

function isDuplicateProviderPhoneError(error) {
  const message = error?.message || String(error || "");
  return message.includes("duplicate key") || message.includes("providers_phone_key");
}

function linkLocalProviderToRemote(provider, row) {
  provider.remoteId = row.id;
  provider.remoteStatus = row.status === "pending" ? "submitted" : "linked";
  provider.remoteError = "";
  if (row.trial_ends_at) provider.trialEndsAt = row.trial_ends_at;
  if (row.subscription_ends_at) provider.subscriptionEndsAt = row.subscription_ends_at;
  if (row.status === "approved") {
    provider.status = "approved";
    provider.visibility = row.visibility_status === "expired_blurred" ? "expired_blurred" : "active";
  }
}

async function assignRemotePrimaryService(provider, admin = true) {
  const providerId = remoteProviderId(provider);
  const serviceName = provider.service && provider.service !== "Métier à préciser" ? provider.service : "";
  if (!providerId || !serviceName) return "";
  const serviceId = await supabaseIdByName("services", serviceName, remoteLookupCache.services);
  if (!serviceId) return `Métier non lié : service introuvable (${serviceName}).`;
  const request = admin ? supabaseAdminRequest : supabaseRequest;
  await request(`provider_services?provider_id=eq.${encodeURIComponent(providerId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: { is_primary: false },
  }).catch(() => null);
  await request("provider_services?on_conflict=provider_id,service_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: {
      provider_id: providerId,
      service_id: serviceId,
      is_primary: true,
    },
  });
  return `Métier lié : ${serviceName}.`;
}

async function linkCreatedProviderService(provider, fallbackServiceId = null) {
  const providerId = remoteProviderId(provider);
  const serviceName = canonicalServiceName(provider.service && provider.service !== "Métier à préciser" ? provider.service : "");
  if (!providerId || !serviceName) return "Métier non lié : aucun métier choisi.";
  const categoryName = localCategoryForService(serviceName) || "Autres";

  try {
    await supabaseRpc("public_link_provider_service", {
      provider_uuid: providerId,
      provider_phone: provider.phone,
      target_service_name: serviceName,
      target_category_name: categoryName,
    }, { prefer: "return=representation" });
    provider.remoteServiceStatus = "linked";
    return `Métier lié automatiquement : ${serviceName}.`;
  } catch (rpcError) {
    if (fallbackServiceId) {
      try {
        await supabaseInsert("provider_services", {
          provider_id: providerId,
          service_id: fallbackServiceId,
          is_primary: true,
        });
        provider.remoteServiceStatus = "linked";
        return `Métier lié : ${serviceName}.`;
      } catch (insertError) {
        provider.remoteServiceStatus = "error";
        provider.remoteError = `Métier non lié : ${friendlySupabaseError(insertError)}`;
      }
    } else {
      provider.remoteServiceStatus = "error";
      provider.remoteError = `Métier non lié : ${friendlySupabaseError(rpcError)}`;
    }
    return `Métier à relier : ${serviceName}. Exécutez sql-copie-bizzi/50-socle-stable-metiers-v99.sql dans Supabase, puis les prochaines inscriptions garderont leur métier.`;
  }
}

async function syncAdditionalProviderService(provider, serviceName = "") {
  const service = canonicalServiceName(serviceName);
  if (!provider || isPlaceholderServiceName(service)) return "Métier non lié.";
  if (!supabaseConfigured()) return "Service conservé sur cet appareil : Supabase non configuré.";
  if (!remoteProviderId(provider)) {
    return "Service conservé localement : il sera envoyé avec le profil lors de sa synchronisation.";
  }
  try {
    const serviceId = await supabaseIdByName("services", service, remoteLookupCache.services);
    const message = await linkCreatedProviderService({ ...provider, service }, serviceId);
    provider.remoteServiceStatus = "linked";
    provider.remoteError = "";
    saveState();
    return message;
  } catch (error) {
    provider.remoteServiceStatus = "error";
    provider.remoteError = friendlySupabaseError(error);
    saveState();
    throw error;
  }
}

async function linkExistingProviderByPhone(provider) {
  const rows = await supabaseAdminRequest(`providers?select=id,full_name,phone,status,visibility_status,trial_ends_at,subscription_ends_at&phone=${eqFilter(provider.phone)}&limit=1`);
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row?.id) {
    throw new Error("Le numéro existe déjà, mais le profil correspondant n'a pas pu être retrouvé dans Supabase.");
  }
  linkLocalProviderToRemote(provider, row);
  let serviceMessage = "";
  try {
    serviceMessage = await assignRemotePrimaryService(provider, true);
  } catch (error) {
    serviceMessage = `Métier non lié : ${friendlySupabaseError(error)}.`;
  }
  if (row.status === "pending") {
    return `Ce numéro existe déjà dans Supabase : le profil local vient d'être relié au profil en attente. ${serviceMessage}`;
  }
  if (row.status === "approved") {
    return `Ce numéro existe déjà dans Supabase : le profil local vient d'être relié à un profil déjà approuvé. ${serviceMessage}`;
  }
  return `Ce numéro existe déjà dans Supabase : le profil local vient d'être relié au statut ${row.status || "existant"}. ${serviceMessage}`;
}

async function resendLocalProviderToSupabase(providerId, button = null) {
  const provider = state.providers.find((item) => item.id === providerId);
  if (!provider) return;
  if (remoteProviderId(provider)) {
    renderAdminRemoteStatus("Ce prestataire est déjà lié à Supabase. Cliquez sur Charger validations Supabase pour vérifier son statut.", true);
    return;
  }

  setBusyButton(button, true, "Envoi...");
  renderAdminRemoteStatus(`Envoi de ${provider.fullName} vers Supabase en cours...`, true);

  try {
    const message = await submitProviderToSupabase(provider);
    provider.remoteError = "";
    saveState();
    renderAdmin();
    renderProviders();
    renderHomeDiscovery();
    renderSavedProviders();
    renderAdminRemoteStatus(`${message} Cliquez maintenant sur Charger validations Supabase pour contrôler la file officielle.`, true);
    finishActionButton(button, "Envoyé");
  } catch (error) {
    if (isDuplicateProviderPhoneError(error)) {
      try {
        const message = await linkExistingProviderByPhone(provider);
        saveState();
        renderAdmin();
        renderProviders();
        renderHomeDiscovery();
        renderSavedProviders();
        renderAd();
        renderAdminRemoteStatus(`${message} Cliquez sur Charger validations Supabase. Si le profil n'est plus en attente, faites Importer public Supabase puis vérifiez Services.`, true);
        finishActionButton(button, "Lié");
        return;
      } catch (linkError) {
        provider.remoteStatus = "local_only";
        provider.remoteError = friendlySupabaseError(linkError);
        saveState();
        renderAdmin();
        renderAdminRemoteStatus(`Numéro déjà présent, mais liaison impossible : ${provider.remoteError}`, true);
        finishActionButton(button, "Erreur");
        return;
      }
    }
    provider.remoteStatus = "local_only";
    provider.remoteError = friendlySupabaseError(error);
    saveState();
    renderAdmin();
    renderAdminRemoteStatus(`Envoi vers Supabase impossible : ${provider.remoteError}`, true);
    finishActionButton(button, "Erreur");
  }
}

async function closeRemoteExpressRequest(requestId, button = null) {
  if (!requestId) return;
  setBusyButton(button, true, "Traitement...");
  try {
    const closedAt = new Date().toISOString();
    try {
      await supabaseAdminRequest(`express_requests?id=eq.${encodeURIComponent(requestId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: {
          status: "closed",
          closed_at: closedAt,
        },
      });
    } catch (closeAtError) {
      if (!String(closeAtError?.message || "").includes("closed_at")) {
        throw closeAtError;
      }
      await supabaseAdminRequest(`express_requests?id=eq.${encodeURIComponent(requestId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: { status: "closed" },
      });
    }

    remoteAdminQueue.requests = remoteAdminQueue.requests.filter((request) => request.id !== requestId);
    renderRemoteAdminPanel();
    renderLaunchChecklist();
    renderAdminRemoteStatus(`Demande express Supabase marquée traitée. Il reste ${remoteAdminQueue.requests.length} demande(s) express ouverte(s).`, true);
    await loadSupabaseAdminQueue();
    finishActionButton(button, "Traité");
  } catch (error) {
    renderAdminRemoteStatus(`Traitement impossible : ${friendlySupabaseError(error)}. Si la table ou des colonnes manquent, exécutez sql-copie-bizzi/34-correction-demandes-express.sql.`, true);
    finishActionButton(button, "Erreur");
  }
}

async function updateRemoteJobOffer(jobId, status, button = null) {
  if (!jobId) return;
  setBusyButton(button, true, status === "published" ? "Publication..." : "Archivage...");
  try {
    try {
      await supabaseRpc(status === "published" ? "admin_publish_job_offer" : "admin_archive_job_offer", {
        job_uuid: jobId,
      }, {
        accessToken: requireAdminAccessToken(),
        prefer: "return=representation",
        timeoutMs: 12000,
      });
    } catch {
      await supabaseAdminRequest(`job_offers?id=eq.${encodeURIComponent(jobId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: {
          status,
          ...(status === "published" ? {
            payment_status: "approved",
            paid_at: new Date().toISOString(),
          } : {}),
          updated_at: new Date().toISOString(),
        },
      });
    }
    renderAdminRemoteStatus(status === "published"
      ? "Offre emploi publiée. Elle devient visible côté client après import public."
      : "Offre emploi archivée.", true);
    await loadSupabaseAdminQueue();
    await syncSupabasePublicData();
    renderLaunchChecklist();
    finishActionButton(button, status === "published" ? "Publiée" : "Archivée");
  } catch (error) {
    renderAdminRemoteStatus(`Action offre emploi impossible : ${friendlySupabaseError(error)}. Si la table manque ou refuse la validation, exécutez sql-copie-bizzi/59-emplois-missions-toutes-entreprises-v130.sql.`, true);
    finishActionButton(button, "Erreur");
  }
}

function approveRemoteJobOffer(jobId, button = null) {
  return updateRemoteJobOffer(jobId, "published", button);
}

function archiveRemoteJobOffer(jobId, button = null) {
  return updateRemoteJobOffer(jobId, "archived", button);
}

async function updateRemoteEventPromotion(eventId, status, button = null) {
  if (!eventId) return;
  setBusyButton(button, true, status === "published" ? "Publication..." : "Refus...");
  try {
    const activatedAt = new Date().toISOString();
    let rpcSucceeded = false;
    try {
      await supabaseRpc(status === "published" ? "admin_publish_event_promotion" : "admin_reject_event_promotion", {
        event_uuid: eventId,
      }, {
        accessToken: requireAdminAccessToken(),
        prefer: "return=representation",
        timeoutMs: 12000,
      });
      rpcSucceeded = true;
    } catch {
      await supabaseAdminRequest(`event_promotions?id=eq.${encodeURIComponent(eventId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: {
          status,
          ...(status === "published" ? {
            payment_status: "approved",
            paid_at: activatedAt,
          } : {}),
          updated_at: activatedAt,
        },
      });
    }
    if (rpcSucceeded) {
      await supabaseAdminRequest(`event_promotions?id=eq.${encodeURIComponent(eventId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: {
          status,
          ...(status === "published" ? { payment_status: "approved", paid_at: activatedAt } : {}),
          updated_at: activatedAt,
        },
      });
    }
    const remoteEvent = remoteAdminQueue.events.find((item) => item.id === eventId);
    const eventPlan = eventPlanByName(remoteEvent?.plan_name || "");
    const boostMessage = status === "published" && Number(eventPlan?.durationDays || 0) > 0
      ? ` Boost prioritaire actif pendant ${Number(eventPlan.durationDays)} jour(s) à compter de la validation.`
      : "";
    renderAdminRemoteStatus(status === "published"
      ? `Événement publié.${boostMessage} Il devient visible côté client après import public.`
      : "Événement refusé.", true);
    await loadSupabaseAdminQueue();
    await syncSupabasePublicData();
    renderLaunchChecklist();
    finishActionButton(button, status === "published" ? "Publié" : "Refusé");
  } catch (error) {
    renderAdminRemoteStatus(`Action événement impossible : ${friendlySupabaseError(error)}. Exécutez sql-copie-bizzi/67-evenements-geolocalises-v156.sql si la table ou les fonctions manquent.`, true);
    finishActionButton(button, "Erreur");
  }
}

function approveRemoteEventPromotion(eventId, button = null) {
  return updateRemoteEventPromotion(eventId, "published", button);
}

function rejectRemoteEventPromotion(eventId, button = null) {
  return updateRemoteEventPromotion(eventId, "rejected", button);
}

async function updateRemoteFoodPlace(placeId, status, button = null) {
  if (!placeId) return;
  const publish = status === "published";
  setBusyButton(button, true, publish ? "Publication..." : "Refus...");
  try {
    try {
      await supabaseRpc(publish ? "admin_publish_food_place" : "admin_reject_food_place", {
        food_uuid: placeId,
      }, {
        accessToken: requireAdminAccessToken(),
        prefer: "return=representation",
        timeoutMs: 12000,
      });
    } catch {
      await supabaseAdminRequest(`food_places?id=eq.${encodeURIComponent(placeId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: {
          status,
          verification_status: publish ? "verified" : "rejected",
          updated_at: new Date().toISOString(),
        },
      });
    }
    renderAdminRemoteStatus(publish
      ? "Adresse Food publiée. Elle devient visible côté client après import public."
      : "Adresse Food refusée.", true);
    await loadSupabaseAdminQueue();
    await syncSupabasePublicData();
    renderFood();
    renderHomeDiscovery();
    renderLaunchChecklist();
    finishActionButton(button, publish ? "Publiée" : "Refusée");
  } catch (error) {
    renderAdminRemoteStatus(`Action Food impossible : ${friendlySupabaseError(error)}. Exécutez sql-copie-bizzi/91-bizzi-food-v204.sql si la table ou les fonctions manquent.`, true);
    finishActionButton(button, "Erreur");
  }
}

function publishRemoteFoodPlace(placeId, button = null) {
  return updateRemoteFoodPlace(placeId, "published", button);
}

function rejectRemoteFoodPlace(placeId, button = null) {
  return updateRemoteFoodPlace(placeId, "rejected", button);
}

async function updateRemoteExceptionPlace(placeId, status, button = null) {
  if (!placeId) return;
  const publish = status === "published";
  setBusyButton(button, true, publish ? "Validation..." : "Refus...");
  try {
    if (publish) {
      await supabaseRpc("admin_publish_exception_place", { place_uuid: placeId }, {
        accessToken: requireAdminAccessToken(),
        prefer: "return=representation",
        timeoutMs: 12000,
      });
    } else {
      await supabaseAdminRequest(`exception_places?id=eq.${encodeURIComponent(placeId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: { status: "rejected", payment_status: "rejected", updated_at: new Date().toISOString() },
      });
    }
    remoteAdminQueue.exceptionPlaces = remoteAdminQueue.exceptionPlaces.filter((place) => place.id !== placeId);
    await syncSupabasePublicData(null, { silent: true });
    renderRemoteAdminPanel();
    renderExceptionPlaces();
    renderHomeDiscovery();
    renderAdminRemoteStatus(publish ? "Lieu validé : 30 jours de visibilité démarrés et boost activé si payé." : "Lieu refusé.", true);
    finishActionButton(button, publish ? "Publié" : "Refusé");
  } catch (error) {
    renderAdminRemoteStatus(`Action lieu d’exception impossible : ${friendlySupabaseError(error)}. Exécutez sql-copie-bizzi/98-lieux-exception-v302.sql.`, true);
    finishActionButton(button, "Erreur");
  }
}

function categoriesFromSupabase(categoryRows, serviceRows) {
  const sortedCategories = [...categoryRows].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const byId = new Map(sortedCategories.map((category) => [category.id, { ...category, name: canonicalCategoryName(category.name) }]));
  const byName = new Map();
  const categories = [];
  sortedCategories.forEach((category) => {
    const categoryName = canonicalCategoryName(category.name);
    if (byName.has(categoryName)) return;
    const item = { name: categoryName, services: [] };
    byName.set(categoryName, item);
    categories.push(item);
    return item;
  });

  [...serviceRows]
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .forEach((service) => {
      const embeddedCategory = Array.isArray(service.categories) ? service.categories[0] : service.categories;
      const categoryName = canonicalCategoryName(embeddedCategory?.name || byId.get(service.category_id)?.name || "Autres");
      if (!byName.has(categoryName)) {
        const item = { name: categoryName, services: [] };
        byName.set(categoryName, item);
        categories.push(item);
      }
      const services = byName.get(categoryName).services;
      const serviceName = canonicalServiceName(service.name);
      if (!services.some((item) => normalizedCatalogKey(item) === normalizedCatalogKey(serviceName))) {
        services.push(serviceName);
      }
    });

  return categories.filter((category) => category.services.length);
}

function providerFromSupabase(row, index, options = {}) {
  const service = row.service_name ? canonicalServiceName(row.service_name) : "Métier à préciser";
  const services = [...new Set([
    service,
    ...(Array.isArray(row.service_names) ? row.service_names : []),
  ].map((name) => canonicalServiceName(name)).filter((name) => !isPlaceholderServiceName(name)))];
  const city = row.city_name || "Toute la Côte d'Ivoire";
  const area = row.commune_name || row.neighborhood || city;
  const coordinates = cityCoordinates(city);
  const lat = Number(row.latitude);
  const lng = Number(row.longitude);
  const visible = options.renewal === true || (row.contact_visible !== false && row.visibility_status !== "expired_blurred");
  const displayName = visible && row.full_name ? row.full_name : `Prestataire ${service}`;
  const visibility = row.visibility_status === "expired_blurred" ? "expired_blurred" : "active";
  return {
    id: `sb-${row.id || index}`,
    remoteId: row.id || "",
    remoteStatus: "linked",
    initials: initials(displayName || service),
    fullName: displayName,
    phone: visible ? row.phone || "" : "",
    whatsapp: visible ? row.whatsapp || row.phone || "" : "",
    service,
    services,
    city,
    area,
    distance: "",
    distanceKm: 20,
    lat: Number.isFinite(lat) ? lat : coordinates.lat,
    lng: Number.isFinite(lng) ? lng : coordinates.lng,
    locationPrecision: Number.isFinite(lat) && Number.isFinite(lng) ? "gps" : "area_estimate",
    locationAccuracy: Math.max(0, Math.round(Number(row.location_accuracy || 0))),
    locationTimestamp: row.location_timestamp || "",
    locationLabel: row.location_label || area,
    locationFullAddress: row.location_full_address || area,
    rating: Number(row.average_rating || 0) || 4.5,
    description: visible ? row.description || "Prestataire disponible via Zeyds." : "Coordonnées masquées jusqu'au renouvellement.",
    photo: row.photo_url || "",
    social: {
      whatsapp: visible ? row.whatsapp || row.phone || "" : "",
    },
    status: row.status || "approved",
    visibility,
    verificationStatus: row.is_verified ? "verified" : "none",
    verifiedAt: row.is_verified ? new Date().toISOString() : null,
    verificationNote: row.is_verified ? "Profil vérifié par Zeyds." : "",
    trialEndsAt: row.trial_ends_at || (row.visibility_status === "trial" ? isoDaysFromNow(30) : null),
    subscriptionEndsAt: row.subscription_ends_at || null,
    boostEndsAt: row.boost_ends_at || null,
    deliveryPenaltyRate: Number(row.delivery_penalty_rate || 0),
    deliveryPenaltyRemaining: Number(row.delivery_penalty_remaining || 0),
    deliveryPenaltyUntil: row.delivery_penalty_until || "",
    deliveryCancelCount: Number(row.delivery_cancel_count || 0),
    deliveryPenaltyReason: row.delivery_penalty_reason || "",
    calls: Number(row.call_count || 0),
    contactClicks: 0,
    reviewCount: Number(row.review_count || 0),
    callClicks: 0,
    whatsappClicks: 0,
    shareClicks: 0,
    copyClicks: 0,
    routeClicks: 0,
    positiveFeedback: 0,
    noAnswerFeedback: 0,
    wrongNumberFeedback: 0,
    socialViews: 0,
  };
}

async function fetchPublicProviderByContact(phone = "", whatsapp = "") {
  if (!supabaseConfigured()) return null;
  const rpcPhone = normalizePhoneForMatch(phone) ? phone : whatsapp;
  if (rpcPhone) {
    try {
      const rpcResult = await supabaseRpc("bizzi_find_provider_exact", {
        provider_phone: rpcPhone,
      }, { prefer: "return=representation" });
      const rpcRows = Array.isArray(rpcResult) ? rpcResult : (rpcResult ? [rpcResult] : []);
      if (rpcRows[0]?.id) {
        const rpcProvider = providerFromSupabase(rpcRows[0], 0, { renewal: true });
        if (phonesMatch(rpcProvider.phone, rpcPhone)) return rpcProvider;
      }
    } catch {
    }
  }
  const providerView = bizziConfig.supabase?.publicProviderView || "public_provider_directory";
  const rows = await supabaseFetch(`${providerView}?select=*&phone=${eqFilter(rpcPhone)}&limit=1`);
  const row = (Array.isArray(rows) ? rows : []).find((item) => phonesMatch(item.phone, rpcPhone));
  return row ? providerFromSupabase(row, 0) : null;
}

function upsertRenewalProvider(provider) {
  if (!provider) return null;
  const existingIndex = state.providers.findIndex((item) => (
    (provider.remoteId && item.remoteId === provider.remoteId)
      || (provider.phone && phonesMatch(item.phone, provider.phone))
  ));
  if (existingIndex >= 0) {
    const mergedServices = [...new Set([
      ...providerServiceNames(state.providers[existingIndex]),
      ...providerServiceNames(provider),
    ])];
    state.providers[existingIndex] = {
      ...state.providers[existingIndex],
      ...provider,
      id: state.providers[existingIndex].id || provider.id,
      services: mergedServices,
    };
    return state.providers[existingIndex];
  }
  state.providers.push(provider);
  return provider;
}

function reviewFromSupabase(row, providers = []) {
  const provider = providers.find((item) => item.remoteId === row.provider_id || item.id === `sb-${row.provider_id}`);
  return {
    id: `sb-review-${row.id}`,
    remoteId: row.id || "",
    remoteStatus: "linked",
    providerId: row.provider_id ? `sb-${row.provider_id}` : "",
    providerName: provider?.fullName || "Prestataire Zeyds",
    service: provider?.service || "Service Zeyds",
    city: provider?.city || "Côte d'Ivoire",
    rating: Number(row.rating || 0),
    message: row.message || "",
    status: row.status || "published",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function expressRequestFromSupabase(row) {
  const matchedCount = Number(row.matched_count ?? (Array.isArray(row.matched_provider_ids) ? row.matched_provider_ids.length : 0));
  const priorityScore = Number(row.priority_score || 0);
  return {
    id: `sb-req-${row.id}`,
    remoteId: row.id || "",
    remoteStatus: "linked",
    service: canonicalServiceName(row.service_name || "Service Zeyds"),
    city: row.city_name || "Côte d'Ivoire",
    area: row.area || "",
    urgency: row.urgency || "today",
    message: row.message || "",
    phone: row.customer_phone || "",
    status: row.status || "open",
    createdAt: row.created_at || new Date().toISOString(),
    closedAt: row.closed_at || null,
    adminNote: row.admin_note || "",
    priorityScore,
    priorityLabel: row.priority_label || priorityLabelFromScore(priorityScore),
    matchCount: matchedCount,
  };
}

function deliveryRequestFromSupabase(row) {
  return normalizeDeliveryRequest({
    id: `sb-del-${row.id}`,
    remoteId: row.id || "",
    remoteStatus: "linked",
    clientDeviceToken: row.client_access_token || "",
    pickup: row.pickup_address || "",
    dropoff: row.dropoff_address || "",
    parcel: row.parcel_description || "",
    city: row.city_name || "Toute la Côte d'Ivoire",
    area: row.area || "",
    urgency: row.urgency || "today",
    scheduledAt: row.scheduled_at || "",
    notes: row.notes || "",
    phone: row.customer_phone || "",
    pickupLatitude: row.pickup_latitude,
    pickupLongitude: row.pickup_longitude,
    dropoffLatitude: row.dropoff_latitude,
    dropoffLongitude: row.dropoff_longitude,
    distanceKm: row.distance_km || 0,
    baseAmount: row.base_amount || 0,
    suggestedAmount: row.suggested_amount || row.amount || 0,
    pricingSlot: row.pricing_slot || "normal",
    badWeather: Boolean(row.bad_weather),
    surchargeRate: Number(row.surcharge_rate || 0),
    pricingBreakdown: row.pricing_breakdown || "",
    amount: row.amount || 0,
    currency: row.currency || "FCFA",
    commissionRate: Number(row.commission_rate ?? DELIVERY_COMMISSION_RATE),
    bizziCommission: row.bizzi_commission || 0,
    providerPayout: row.provider_payout || 0,
    paymentMethod: paymentMethodLabel(row.payment_method || ""),
    paymentReference: row.transaction_reference || "",
    paymentStatus: row.payment_status || "pending",
    paidAt: row.paid_at || null,
    payoutStatus: row.payout_status || "pending",
    status: row.status || "open",
    dispatchStatus: row.dispatch_status || "not_dispatched",
    dispatchCandidateCount: row.dispatch_attempts || 0,
    dispatchRadiusKm: row.dispatch_radius_km || DELIVERY_MATCH_RADIUS_KM,
    dispatchedAt: row.dispatched_at || null,
    matchedProviderIds: Array.isArray(row.matched_provider_ids) ? row.matched_provider_ids.map((id) => `sb-${id}`) : [],
    assignedProviderId: row.assigned_provider_id ? `sb-${row.assigned_provider_id}` : "",
    assignedProviderName: row.assigned_provider_name || "",
    assignedProviderPhone: row.assigned_provider_phone || "",
    acceptedAt: row.accepted_at || null,
    deliveryStage: row.delivery_stage || "waiting",
    proofCode: row.proof_code || "",
    proofPhoto: row.proof_photo_url || "",
    pickedUpAt: row.picked_up_at || null,
    enRouteAt: row.en_route_at || null,
    deliveredAt: row.delivered_at || null,
    courierLatitude: row.courier_latitude,
    courierLongitude: row.courier_longitude,
    courierLocationAt: row.courier_location_at || null,
    cancellationStatus: row.cancellation_status || "",
    cancellationReason: row.cancellation_reason || "",
    cancelledBy: row.cancelled_by || "",
    cancelledAt: row.cancelled_at || null,
    providerCancelReason: row.provider_cancel_reason || "",
    providerCancelRequestedAt: row.provider_cancel_requested_at || null,
    providerCancelReview: row.provider_cancel_review || "",
    providerCancelReviewedAt: row.provider_cancel_reviewed_at || null,
    providerCancelPenaltyAppliedAt: row.provider_cancel_penalty_applied_at || null,
    closedAt: row.closed_at || null,
    createdAt: row.created_at || new Date().toISOString(),
  });
}

function defaultEventEndDate(dateTime) {
  const start = new Date(dateTime);
  if (Number.isNaN(start.getTime())) return isoDaysFromNow(8);
  start.setHours(start.getHours() + 24);
  return start.toISOString();
}

function eventTimestamp(value) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizeCoordinate(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function normalizeEventPromotion(event = {}) {
  const plan = eventPlanByName(event.planName) || EVENT_PROMOTION_PLANS.find((item) => item.id === event.planId) || EVENT_PROMOTION_PLANS[0];
  const amount = Number(event.amount ?? plan.price ?? 0);
  const dateTime = event.dateTime || event.eventDate || isoDaysFromNow(7);
  const endDateTime = event.endDateTime || event.end_datetime || event.eventEndDate || defaultEventEndDate(dateTime);
  const status = event.status || "pending";
  const paymentStatus = event.paymentStatus || (amount > 0 && event.paymentReference ? "pending" : "approved");
  const createdAt = event.createdAt || event.created_at || new Date().toISOString();
  const updatedAt = event.updatedAt || event.updated_at || "";
  const boostDurationDays = Number(event.boostDurationDays ?? event.boost_duration_days ?? plan.durationDays ?? 0);
  const boostStartsAt = event.boostStartsAt || event.boost_started_at
    || (["published", "active"].includes(status) && plan.sponsored ? updatedAt || createdAt : "");
  const boostEndsAt = event.boostEndsAt || event.boost_ends_at
    || (boostStartsAt && boostDurationDays > 0
      ? extendExpiryIso("", { days: boostDurationDays, anchor: new Date(boostStartsAt).getTime() })
      : "");
  return {
    id: event.id || `evt${Date.now()}`,
    remoteId: event.remoteId || "",
    remoteStatus: event.remoteStatus || "",
    title: String(event.title || "").trim() || "Événement Zeyds",
    description: String(event.description || "").trim(),
    dateTime,
    endDateTime,
    venue: String(event.venue || "").trim() || "Lieu à préciser",
    city: String(event.city || "").trim() || "Toute la Côte d'Ivoire",
    area: String(event.area || "").trim(),
    address: String(event.address || event.venueAddress || "").trim(),
    latitude: normalizeCoordinate(event.latitude ?? event.lat),
    longitude: normalizeCoordinate(event.longitude ?? event.lng),
    visibilityRadiusKm: Math.max(1, Math.min(300, Number(event.visibilityRadiusKm ?? event.visibility_radius_km ?? 25) || 25)),
    category: EVENT_CATEGORIES.includes(event.category) ? event.category : (event.category || "Autre événement"),
    poster: event.poster || "",
    posterUrl: event.posterUrl || "",
    ticketPrice: String(event.ticketPrice || "").trim(),
    ticketUrl: String(event.ticketUrl || "").trim(),
    contactPhone: String(event.contactPhone || "").trim(),
    organizerName: String(event.organizerName || "").trim() || "Organisateur",
    planId: event.planId || plan.id,
    planName: event.planName || plan.name,
    boostDurationDays,
    boostStartsAt,
    boostEndsAt,
    amount,
    currency: event.currency || bizziConfig.currency || "FCFA",
    paymentMethod: event.paymentMethod || seed.selectedEventPayment || "Wave",
    paymentReference: String(event.paymentReference || "").trim(),
    paymentStatus,
    isSponsored: Boolean(event.isSponsored ?? plan.sponsored),
    isPremium: Boolean(event.isPremium ?? plan.premium),
    status,
    clickCount: Number(event.clickCount ?? event.click_count ?? 0),
    ticketClickCount: Number(event.ticketClickCount ?? event.ticket_click_count ?? 0),
    contactClickCount: Number(event.contactClickCount ?? event.contact_click_count ?? 0),
    detailViewCount: Number(event.detailViewCount ?? event.detail_view_count ?? 0),
    statsReadyAt: event.statsReadyAt || event.stats_ready_at || "",
    statsSentAt: event.statsSentAt || event.stats_sent_at || "",
    submissionReference: event.submissionReference || event.submission_reference || event.paymentReference || "",
    createdAt,
    updatedAt,
  };
}

function exceptionPlanById(planId = "") {
  return EXCEPTION_PLACE_PLANS.find((plan) => plan.id === planId) || EXCEPTION_PLACE_PLANS[0];
}

function normalizeExceptionPlace(place = {}) {
  const plan = exceptionPlanById(place.planId || place.plan_id);
  const createdAt = place.createdAt || place.created_at || new Date().toISOString();
  return {
    id: place.id || `exception-place-${Date.now()}`,
    remoteId: place.remoteId || place.remote_id || "",
    remoteStatus: place.remoteStatus || place.remote_status || "",
    name: String(place.name || "").trim() || "Lieu d’exception",
    ownerName: String(place.ownerName || place.owner_name || "").trim() || "Responsable",
    contactPhone: String(place.contactPhone || place.contact_phone || "").trim(),
    city: String(place.city || place.city_name || "").trim() || "Abidjan",
    area: String(place.area || "").trim(),
    address: String(place.address || "").trim(),
    latitude: normalizeCoordinate(place.latitude ?? place.lat),
    longitude: normalizeCoordinate(place.longitude ?? place.lng),
    locationAccuracy: Math.max(0, Math.round(Number(place.locationAccuracy ?? place.location_accuracy ?? 0))),
    locationTimestamp: place.locationTimestamp || place.location_timestamp || "",
    locationLabel: String(place.locationLabel || place.location_label || "").trim(),
    locationFullAddress: String(place.locationFullAddress || place.location_full_address || "").trim(),
    description: String(place.description || "").trim(),
    photo: place.photo || "",
    photoUrl: place.photoUrl || place.photo_url || "",
    planId: plan.id,
    planName: String(place.planName || place.plan_name || plan.name),
    amount: Number(place.amount ?? plan.price ?? 0),
    currency: place.currency || "FCFA",
    paymentMethod: place.paymentMethod || place.payment_method || "",
    paymentReference: String(place.paymentReference || place.payment_reference || "").trim(),
    paymentStatus: place.paymentStatus || place.payment_status || (plan.price ? "pending" : "approved"),
    boostDays: Number(place.boostDays ?? place.boost_days ?? plan.boostDays ?? 0),
    boostStartsAt: place.boostStartsAt || place.boost_starts_at || "",
    boostEndsAt: place.boostEndsAt || place.boost_ends_at || "",
    visibilityStartsAt: place.visibilityStartsAt || place.visibility_starts_at || "",
    visibilityEndsAt: place.visibilityEndsAt || place.visibility_ends_at || "",
    adminGrant: Boolean(place.adminGrant ?? place.admin_grant),
    status: place.status || "pending",
    clickCount: Number(place.clickCount ?? place.click_count ?? 0),
    createdAt,
    updatedAt: place.updatedAt || place.updated_at || createdAt,
  };
}

function exceptionPlaceVisible(place, at = Date.now()) {
  const end = new Date(place.visibilityEndsAt || 0).getTime();
  return ["published", "active"].includes(place.status) && Number.isFinite(end) && end > at;
}

function exceptionPlaceBoostActive(place, at = Date.now()) {
  const start = new Date(place.boostStartsAt || 0).getTime();
  const end = new Date(place.boostEndsAt || 0).getTime();
  return exceptionPlaceVisible(place, at)
    && Number(place.boostDays || 0) > 0
    && place.paymentStatus === "approved"
    && Number.isFinite(start) && start <= at
    && Number.isFinite(end) && end > at;
}

function applyExceptionPlaceExpirationRules() {
  const now = Date.now();
  let changed = false;
  state.exceptionPlaces.forEach((place) => {
    if (["published", "active"].includes(place.status) && place.visibilityEndsAt && new Date(place.visibilityEndsAt).getTime() <= now) {
      place.status = "expired";
      place.updatedAt = new Date().toISOString();
      changed = true;
    }
  });
  if (changed) saveState();
  return changed;
}

function rankedExceptionPlaces(limit = Infinity) {
  const now = Date.now();
  return state.exceptionPlaces
    .filter((place) => exceptionPlaceVisible(place, now))
    .sort((a, b) => Number(exceptionPlaceBoostActive(b, now)) - Number(exceptionPlaceBoostActive(a, now))
      || Number(b.amount || 0) - Number(a.amount || 0)
      || new Date(b.boostStartsAt || b.visibilityStartsAt || b.createdAt).getTime() - new Date(a.boostStartsAt || a.visibilityStartsAt || a.createdAt).getTime()
      || Number(b.clickCount || 0) - Number(a.clickCount || 0)
      || a.name.localeCompare(b.name, "fr"))
    .slice(0, limit);
}

function exceptionPlaceWhatsAppUrl(place) {
  const phone = String(place.contactPhone || FEATURED_BOOKING_WHATSAPP).replace(/[^\d+]/g, "");
  if (!phone) return "";
  const message = `Bonjour ${place.ownerName || place.name}, je souhaite réserver ${place.name}, présenté sur Zeyds. Merci de m’indiquer les disponibilités et les conditions.`;
  return `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;
}

function exceptionPlaceCardHtml(place, index = 0) {
  const image = place.photoUrl || place.photo || "assets/journey-exception-v302.jpg";
  const boosted = exceptionPlaceBoostActive(place);
  return `
    <article class="exception-place-card${boosted ? " is-boosted" : ""}">
      ${boosted ? `<span class="exception-boost-badge">Boost</span>` : ""}
      <div class="exception-place-visual"><img src="${safe(image)}" alt="${safe(place.name)}" loading="lazy" decoding="async"></div>
      <div class="exception-place-copy"><span class="tag ok">${safe(place.area || place.city)}</span><h3>${safe(place.name)}</h3><p>${safe(place.description || place.address || "Lieu sélectionné par Zeyds.")}</p></div>
      <a class="booking-action" href="${safe(exceptionPlaceWhatsAppUrl(place))}" target="_blank" rel="noreferrer" data-exception-reservation="${safe(place.id)}">Réserver</a>
    </article>`;
}

function normalizeFoodSpecialties(value) {
  const raw = Array.isArray(value) ? value : String(value || "").split(/[,;/]+/);
  const normalized = raw.map((item) => String(item || "").trim()).filter(Boolean);
  return [...new Set(normalized)].slice(0, 8);
}

function normalizeFoodPlace(place = {}) {
  const mainSpecialty = String(place.mainSpecialty || place.main_specialty || place.specialty || "").trim() || FOOD_SPECIALTIES[0];
  const specialties = normalizeFoodSpecialties(place.specialties || place.specialties_text || mainSpecialty);
  return {
    id: place.id || `food${Date.now()}`,
    remoteId: place.remoteId || "",
    remoteStatus: place.remoteStatus || "",
    name: String(place.name || "").trim() || "Adresse Food Zeyds",
    ownerName: String(place.ownerName || place.owner_name || "").trim() || "Responsable",
    contactPhone: String(place.contactPhone || place.contact_phone || "").trim(),
    placeType: FOOD_PLACE_TYPES.includes(place.placeType || place.place_type) ? (place.placeType || place.place_type) : "Restaurant",
    mainSpecialty,
    specialties: specialties.includes(mainSpecialty) ? specialties : [mainSpecialty, ...specialties].slice(0, 8),
    city: String(place.city || place.city_name || "").trim() || "Abidjan",
    area: String(place.area || "").trim(),
    address: String(place.address || "").trim(),
    latitude: normalizeCoordinate(place.latitude ?? place.lat),
    longitude: normalizeCoordinate(place.longitude ?? place.lng),
    locationAccuracy: Math.max(0, Math.round(Number(place.locationAccuracy ?? place.location_accuracy ?? 0))),
    locationTimestamp: place.locationTimestamp || place.location_timestamp || "",
    locationLabel: String(place.locationLabel || place.location_label || "").trim(),
    locationFullAddress: String(place.locationFullAddress || place.location_full_address || "").trim(),
    averageBudget: String(place.averageBudget || place.average_budget || "").trim(),
    openingHours: String(place.openingHours || place.opening_hours || "").trim(),
    deliveryAvailable: Boolean(place.deliveryAvailable ?? place.delivery_available),
    description: String(place.description || "").trim(),
    photo: place.photo || "",
    photoUrl: place.photoUrl || place.photo_url || "",
    rating: Number(place.rating || 0),
    status: place.status || "pending",
    verificationStatus: place.verificationStatus || place.verification_status || "none",
    submissionReference: place.submissionReference || place.submission_reference || "",
    clickCount: Number(place.clickCount ?? place.click_count ?? 0),
    contactClickCount: Number(place.contactClickCount ?? place.contact_click_count ?? 0),
    monthlyClickMonth: String(place.monthlyClickMonth || place.monthly_click_month || "").trim(),
    monthlyClickCount: Number(place.monthlyClickCount ?? place.monthly_click_count ?? 0),
    createdAt: place.createdAt || place.created_at || new Date().toISOString(),
    updatedAt: place.updatedAt || place.updated_at || "",
  };
}

function foodPlaceFromSupabase(row, index = 0) {
  return normalizeFoodPlace({
    id: `sb-food-${row.id || index}`,
    remoteId: row.id || "",
    remoteStatus: "linked",
    name: row.name || "Adresse Food Zeyds",
    ownerName: row.owner_name || "Responsable",
    contactPhone: row.contact_phone || "",
    placeType: row.place_type || "Restaurant",
    mainSpecialty: row.main_specialty || "Cuisine africaine",
    specialties: row.specialties || row.specialties_text || "",
    city: row.city_name || "Abidjan",
    area: row.area || "",
    address: row.address || "",
    latitude: row.latitude,
    longitude: row.longitude,
    locationAccuracy: row.location_accuracy,
    locationTimestamp: row.location_timestamp,
    locationLabel: row.location_label,
    locationFullAddress: row.location_full_address,
    averageBudget: row.average_budget || "",
    openingHours: row.opening_hours || "",
    deliveryAvailable: row.delivery_available,
    description: row.description || "",
    photoUrl: row.photo_url || "",
    rating: row.rating,
    status: row.status || "published",
    verificationStatus: row.verification_status || "none",
    clickCount: row.click_count,
    contactClickCount: row.contact_click_count,
    monthlyClickMonth: row.monthly_click_month,
    monthlyClickCount: row.monthly_click_count,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || "",
  });
}

function foodDefaultCity() {
  const city = currentCity();
  return cityIsSpecific(city) ? city : state.selectedFoodCity || "Abidjan";
}

function activeFoodPlaces() {
  return state.foodPlaces
    .filter((place) => ["published", "active"].includes(place.status))
    .sort((a, b) => Number(b.verificationStatus === "verified") - Number(a.verificationStatus === "verified") || Number(b.rating || 0) - Number(a.rating || 0) || Number(b.clickCount || 0) - Number(a.clickCount || 0));
}

function foodPlacesMatching(query = "", specialty = "", city = "") {
  const normalizedQuery = normalizeAssistantText(query);
  const selectedSpecialty = specialty && specialty !== "Toutes les spécialités" ? specialty : "";
  const selectedCity = cityIsSpecific(city) ? city : foodDefaultCity();
  return activeFoodPlaces().filter((place) => {
    const cityOk = !cityIsSpecific(selectedCity)
      || place.city === selectedCity
      || deliveryCityGroup(place.city) === deliveryCityGroup(selectedCity)
      || normalizeAssistantText(place.area).includes(normalizeAssistantText(selectedCity));
    const specialtyOk = !selectedSpecialty || [place.mainSpecialty, ...place.specialties].some((item) => normalizeAssistantText(item) === normalizeAssistantText(selectedSpecialty));
    const queryOk = !normalizedQuery || [place.name, place.placeType, place.mainSpecialty, place.specialties.join(" "), place.city, place.area, place.address, place.description]
      .some((field) => normalizeAssistantText(field).includes(normalizedQuery));
    return cityOk && specialtyOk && queryOk;
  });
}

function currentFoodRankingMonth() {
  return new Date().toISOString().slice(0, 7);
}

function monthlyFoodClickCount(place) {
  return place.monthlyClickMonth === currentFoodRankingMonth()
    ? Number(place.monthlyClickCount || 0)
    : 0;
}

function topMonthlyFoodPlaces(city = foodDefaultCity(), limit = 3) {
  return foodPlacesMatching("", "", city)
    .sort((a, b) => monthlyFoodClickCount(b) - monthlyFoodClickCount(a)
      || Number(b.rating || 0) - Number(a.rating || 0)
      || Number(b.verificationStatus === "verified") - Number(a.verificationStatus === "verified")
      || a.name.localeCompare(b.name, "fr"))
    .slice(0, limit);
}

function recordFoodProfileClick(placeId) {
  const place = state.foodPlaces.find((item) => item.id === placeId);
  if (!place) return;
  const month = currentFoodRankingMonth();
  if (place.monthlyClickMonth !== month) {
    place.monthlyClickMonth = month;
    place.monthlyClickCount = 0;
  }
  place.monthlyClickCount = Number(place.monthlyClickCount || 0) + 1;
  place.clickCount = Number(place.clickCount || 0) + 1;
  place.updatedAt = new Date().toISOString();
  saveState();
  if (place.remoteId && supabaseConfigured()) {
    supabaseRpc("record_food_place_profile_click", { food_uuid: place.remoteId }).catch(() => null);
  }
}

function foodWhatsAppUrl(place) {
  const phone = String(place.contactPhone || "").replace(/[^\d+]/g, "");
  if (!phone) return "";
  const clientPhone = currentClientPhone();
  const message = [
    `Bonjour ${place.ownerName || place.name}, je souhaite réserver chez ${place.name}, présenté sur Zeyds.`,
    `Spécialité : ${place.mainSpecialty}. Merci de m'indiquer les disponibilités et les conditions.`,
    clientPhone ? `Mon contact : ${clientPhone}.` : "",
  ].filter(Boolean).join("\n");
  return `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;
}

function featuredBookingWhatsAppUrl(place) {
  const phone = String(place.contactPhone || FEATURED_BOOKING_WHATSAPP).replace(/[^\d+]/g, "");
  if (!phone) return "";
  const message = `Bonjour Events CI, je souhaite réserver ${place.name}, présenté sur Zeyds. Merci de m'indiquer les disponibilités et les conditions.`;
  return `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;
}

function recordFeaturedReservation(name, category) {
  state.leads.push({
    id: `featured-reservation-${Date.now()}`,
    providerId: normalizeAssistantText(name).replace(/\s+/g, "-"),
    providerName: name,
    service: category,
    city: currentCity(),
    action: "whatsapp_reservation",
    note: `${name} - réservation WhatsApp`,
    createdAt: new Date().toISOString(),
  });
  saveState();
}

function renderExceptionPlacePlans() {
  const root = document.querySelector("#exceptionPlacePlans");
  if (!root) return;
  const selected = exceptionPlanById(state.selectedExceptionPlanId);
  root.innerHTML = EXCEPTION_PLACE_PLANS.map((plan) => `
    <button class="exception-plan-card${plan.id === selected.id ? " selected" : ""}" type="button" data-exception-plan="${safe(plan.id)}" aria-pressed="${plan.id === selected.id}">
      <strong>${safe(plan.name)}</strong>
      <span>${plan.price ? `${plan.price.toLocaleString("fr-FR")} FCFA` : "Gratuit"}</span>
      <small>${plan.boostDays ? `Priorité pendant ${plan.boostDays} jour${plan.boostDays > 1 ? "s" : ""}` : "Visible 30 jours après validation"}</small>
    </button>
  `).join("");
  root.querySelectorAll("[data-exception-plan]").forEach((button) => button.addEventListener("click", () => {
    state.selectedExceptionPlanId = button.dataset.exceptionPlan;
    saveState();
    renderExceptionPlacePlans();
  }));
  const payment = document.querySelector("#exceptionPaymentFields");
  if (payment) payment.hidden = Number(selected.price || 0) === 0;
  const paymentSelect = document.querySelector("#exceptionPaymentMethod");
  if (paymentSelect) {
    paymentSelect.innerHTML = (bizziConfig.payments?.methods || ["Wave", "Orange Money", "MTN Money"]).map((method) => `<option>${safe(method)}</option>`).join("");
    paymentSelect.value = state.selectedExceptionPayment;
    paymentSelect.onchange = () => {
      state.selectedExceptionPayment = paymentSelect.value;
      saveState();
    };
  }
}

function bindExceptionPlaceReservations(root) {
  root?.querySelectorAll("[data-exception-reservation]").forEach((link) => {
    link.addEventListener("click", () => {
      const place = state.exceptionPlaces.find((item) => item.id === link.dataset.exceptionReservation);
      if (!place) return;
      place.clickCount = Number(place.clickCount || 0) + 1;
      place.updatedAt = new Date().toISOString();
      recordFeaturedReservation(place.name, "Lieu d’exception");
    });
  });
}

function renderExceptionPlaces(message = "") {
  applyExceptionPlaceExpirationRules();
  renderExceptionPlacePlans();
  const root = document.querySelector("#exceptionPlacesList");
  const count = document.querySelector("#exceptionPlaceCount");
  const status = document.querySelector("#exceptionPlaceStatus");
  const adminField = document.querySelector("#exceptionAdminGrantField");
  if (adminField) adminField.hidden = !adminUnlocked;
  if (status && message) status.textContent = message;
  if (!root) return;
  const places = rankedExceptionPlaces();
  if (count) count.textContent = `${places.length} lieu${places.length > 1 ? "x" : ""}`;
  root.innerHTML = places.length
    ? places.map(exceptionPlaceCardHtml).join("")
    : `<div class="empty-state"><h3>Aucun lieu visible</h3><p>Proposez gratuitement le premier lieu d’exception de votre ville.</p></div>`;
  bindExceptionPlaceReservations(root);
}

async function submitExceptionPlaceToSupabase(place, files = {}) {
  if (!supabaseConfigured()) return "Supabase non configuré : lieu conservé sur cet appareil.";
  const uploads = {
    photo: await optionalStorageUpload("exceptionPlacePhotos", "exception-places", files.photoFile, { publicUrl: true }),
  };
  const uploadWarning = storageWarnings(uploads);
  if (uploads.photo?.publicUrl) place.photoUrl = uploads.photo.publicUrl;
  const remoteId = randomUuid();
  await supabaseInsert("exception_places", {
    id: remoteId,
    name: place.name,
    owner_name: place.ownerName,
    contact_phone: place.contactPhone,
    city_name: place.city,
    area: place.area || null,
    address: place.address || null,
    latitude: place.latitude,
    longitude: place.longitude,
    location_accuracy: place.locationAccuracy || null,
    location_timestamp: place.locationTimestamp || null,
    location_label: place.locationLabel || null,
    location_full_address: place.locationFullAddress || null,
    description: place.description,
    photo_url: place.photoUrl || null,
    plan_id: place.planId,
    plan_name: place.planName,
    amount: place.amount,
    currency: place.currency,
    payment_method: paymentMethodCode(place.paymentMethod),
    payment_reference: place.paymentReference || null,
    payment_status: place.paymentStatus,
    boost_days: place.boostDays,
    admin_grant: false,
    status: "pending",
  });
  place.remoteId = remoteId;
  place.remoteStatus = "pending";
  markRemoteWrite(`Lieu d’exception envoyé vers Supabase : ${place.name}.`);
  return `Dossier transmis à Zeyds.${uploadWarning ? ` ${uploadWarning}` : ""}`;
}

async function submitAdminFreeExceptionPlaceToSupabase(place, files = {}) {
  if (!supabaseConfigured() || !adminAuthSession?.accessToken) return "Ajout gratuit conservé localement. Connectez l’admin Supabase pour le publier partout.";
  const upload = await optionalStorageUpload("exceptionPlacePhotos", "exception-places", files.photoFile, { publicUrl: true });
  if (upload?.publicUrl) place.photoUrl = upload.publicUrl;
  const rows = await supabaseRpc("admin_add_free_exception_place", {
    place_name: place.name,
    responsible_name: place.ownerName,
    phone: place.contactPhone,
    place_city: place.city,
    place_area: place.area || null,
    place_address: place.address || null,
    place_description: place.description,
    place_photo_url: place.photoUrl || null,
  }, {
    accessToken: requireAdminAccessToken(),
    prefer: "return=representation",
    timeoutMs: 12000,
  });
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (row?.id) {
    place.remoteId = row.id;
    place.remoteStatus = "linked";
  }
  markRemoteWrite(`Lieu offert par Zeyds publié : ${place.name}.`);
  return "Ajout gratuit publié dans Supabase pour 30 jours.";
}

function exceptionPlaceFromSupabase(row, index = 0) {
  return normalizeExceptionPlace({
    ...row,
    id: `sb-exception-${row.id || index}`,
    remoteId: row.id || "",
    remoteStatus: "linked",
  });
}

async function submitFoodPlaceToSupabase(place, files = {}) {
  if (!supabaseConfigured()) return "Supabase non configuré : adresse Food gardée en local.";
  const uploads = {
    photo: await optionalStorageUpload("foodPhotos", "food", files.photoFile, { publicUrl: true }),
  };
  const uploadWarning = storageWarnings(uploads);
  if (uploads.photo?.publicUrl) place.photoUrl = uploads.photo.publicUrl;
  const foodId = randomUuid();
  const payload = {
    id: foodId,
    name: place.name,
    owner_name: place.ownerName,
    contact_phone: place.contactPhone,
    place_type: place.placeType,
    main_specialty: place.mainSpecialty,
    specialties: place.specialties.join(", "),
    city_name: place.city,
    area: place.area || null,
    address: place.address || null,
    latitude: place.latitude,
    longitude: place.longitude,
    location_accuracy: place.locationAccuracy || null,
    location_timestamp: place.locationTimestamp || null,
    location_label: place.locationLabel || null,
    location_full_address: place.locationFullAddress || null,
    average_budget: place.averageBudget || null,
    opening_hours: place.openingHours || null,
    delivery_available: Boolean(place.deliveryAvailable),
    description: place.description || null,
    photo_url: place.photoUrl || null,
    status: "pending",
    verification_status: place.verificationStatus || "none",
  };
  await supabaseInsert("food_places", payload);
  place.remoteId = foodId;
  place.remoteStatus = "pending";
  const message = `Adresse Food envoyée vers Supabase. Validation Zeyds nécessaire avant affichage public.${uploadWarning ? ` ${uploadWarning}` : ""}`;
  markRemoteWrite(message);
  return message;
}

function eventPromotionFromSupabase(row, index = 0) {
  return normalizeEventPromotion({
    id: `sb-event-${row.id || index}`,
    remoteId: row.id || "",
    remoteStatus: "linked",
    title: row.title || "Événement Zeyds",
    description: row.description || "",
    dateTime: row.event_datetime || row.event_date || isoDaysFromNow(7),
    endDateTime: row.end_datetime || row.event_end_datetime || "",
    venue: row.venue || "",
    city: row.city_name || "Toute la Côte d'Ivoire",
    area: row.area || "",
    address: row.venue_address || row.address || "",
    latitude: row.latitude,
    longitude: row.longitude,
    visibilityRadiusKm: row.visibility_radius_km,
    category: row.category || "Autre événement",
    posterUrl: row.poster_url || "",
    ticketPrice: row.ticket_price || "",
    ticketUrl: row.ticket_url || "",
    contactPhone: row.contact_phone || "",
    organizerName: row.organizer_name || "Organisateur",
    planName: row.plan_name || "",
    amount: Number(row.amount || 0),
    currency: row.currency || "FCFA",
    paymentMethod: paymentMethodLabel(row.payment_method || ""),
    paymentReference: row.transaction_reference || "",
    paymentStatus: row.payment_status || "approved",
    isSponsored: Boolean(row.is_sponsored),
    isPremium: Boolean(row.is_premium),
    status: row.status || "published",
    clickCount: row.click_count,
    ticketClickCount: row.ticket_click_count,
    contactClickCount: row.contact_click_count,
    detailViewCount: row.detail_view_count,
    statsSentAt: row.stats_sent_at || "",
    boostStartsAt: row.boost_started_at || row.paid_at || row.published_at || row.created_at || "",
    boostEndsAt: row.boost_ends_at || "",
    submissionReference: row.submission_reference || row.transaction_reference || "",
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || "",
  });
}

function applyEventExpirationRules() {
  let changed = false;
  const now = Date.now();
  state.eventPromotions.forEach((event) => {
    if (["published", "active", "pending", "submitted"].includes(event.status) && eventEndTimestamp(event) <= now) {
      event.status = "expired";
      event.statsReadyAt = event.statsReadyAt || new Date().toISOString();
      event.updatedAt = new Date().toISOString();
      changed = true;
    }
  });
  if (changed) saveState();
  return changed;
}

function eventIsPubliclyVisible(event = {}, now = Date.now()) {
  return ["published", "active"].includes(event.status) && eventEndTimestamp(event) > now;
}

function activeEventPromotions() {
  const now = Date.now();
  return state.eventPromotions
    .filter((event) => eventIsPubliclyVisible(event, now));
}

let eventExpirationTimer = null;

function scheduleNextEventExpiration() {
  if (eventExpirationTimer) window.clearTimeout(eventExpirationTimer);
  const now = Date.now();
  const nextEnd = state.eventPromotions
    .filter((event) => ["published", "active", "pending", "submitted"].includes(event.status))
    .map(eventEndTimestamp)
    .filter((timestamp) => timestamp > now)
    .sort((left, right) => left - right)[0];
  if (!nextEnd) {
    eventExpirationTimer = null;
    return;
  }
  const delay = Math.min(Math.max(nextEnd - now + 250, 1000), 86400000);
  eventExpirationTimer = window.setTimeout(refreshExpiredEventVisibility, delay);
}

function refreshExpiredEventVisibility() {
  applyEventExpirationRules();
  renderEvents();
  renderHomeDiscovery();
  const selected = state.eventPromotions.find((event) => event.id === state.selectedEventId);
  if (views.eventDetail?.classList.contains("active") && !eventIsPubliclyVisible(selected)) {
    state.selectedEventId = "";
    saveState();
    setView("events");
  }
}

function setupEventExpirationWatcher() {
  scheduleNextEventExpiration();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshExpiredEventVisibility();
  });
}

function eventBoostActive(event = {}) {
  if (!event.isSponsored || !["published", "active"].includes(event.status) || event.paymentStatus !== "approved") return false;
  const endTime = eventTimestamp(event.boostEndsAt);
  if (endTime) return endTime > Date.now();
  const startTime = eventTimestamp(event.boostStartsAt || event.updatedAt || event.createdAt);
  const durationDays = Number(event.boostDurationDays || eventPlanByName(event.planName)?.durationDays || 0);
  return Boolean(startTime && durationDays > 0 && startTime + durationDays * 86400000 > Date.now());
}

function activateEventBoostWindow(event = {}, activatedAt = new Date().toISOString()) {
  if (!event.isSponsored || Number(event.boostDurationDays || 0) <= 0) {
    event.boostStartsAt = "";
    event.boostEndsAt = "";
    return;
  }
  event.boostStartsAt = activatedAt;
  event.boostEndsAt = extendExpiryIso("", {
    days: Number(event.boostDurationDays || 0),
    anchor: new Date(activatedAt).getTime(),
  });
}

function eventStartTimestamp(event) {
  return eventTimestamp(event.dateTime) || Date.now();
}

function eventEndTimestamp(event) {
  return eventTimestamp(event.endDateTime) || eventStartTimestamp(event);
}

function cityIsSpecific(city) {
  return Boolean(city && city !== "Toute la Côte d'Ivoire" && city !== "Autre ville / commune");
}

function defaultEventCity() {
  const city = currentCity();
  return cityIsSpecific(city) ? city : "Abidjan";
}

function eventAudiencePoint(city = defaultEventCity()) {
  if (state.userLocation && city === currentCity()) return state.userLocation;
  return cityCoordinates(city);
}

function eventCoordinates(event) {
  if (Number.isFinite(event.latitude) && Number.isFinite(event.longitude)) {
    return { lat: event.latitude, lng: event.longitude };
  }
  return cityCoordinates(event.city);
}

function eventDistanceKm(event, city = defaultEventCity()) {
  const audience = eventAudiencePoint(city);
  const coordinates = eventCoordinates(event);
  if (!audience || !coordinates) return Number.POSITIVE_INFINITY;
  return distanceBetweenKm(audience, coordinates);
}

function eventDistanceLabel(event, city = defaultEventCity()) {
  const distance = eventDistanceKm(event, city);
  if (!Number.isFinite(distance)) return "";
  return `${distance.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
}

function eventVisibleForCity(event, city = defaultEventCity()) {
  if (!cityIsSpecific(city)) return false;
  if (event.city === city) return true;
  if (!Number.isFinite(event.latitude) || !Number.isFinite(event.longitude)) return false;
  return eventDistanceKm(event, city) <= Number(event.visibilityRadiusKm || 25);
}

function sortEventsForAudience(events, city = defaultEventCity(), category = "") {
  return [...events].sort((a, b) => {
    const aCity = a.city === city ? 0 : 1;
    const bCity = b.city === city ? 0 : 1;
    const aCategory = !category || category === "Toutes les catégories" || a.category === category ? 0 : 1;
    const bCategory = !category || category === "Toutes les catégories" || b.category === category ? 0 : 1;
    return aCity - bCity
      || Number(eventBoostActive(b)) - Number(eventBoostActive(a))
      || Number(b.isPremium) - Number(a.isPremium)
      || aCategory - bCategory
      || eventDistanceKm(a, city) - eventDistanceKm(b, city)
      || eventStartTimestamp(a) - eventStartTimestamp(b)
      || Number(b.clickCount || 0) - Number(a.clickCount || 0);
  });
}

function eventPromotionsMatching(category = "", city = "", query = "") {
  const normalizedQuery = normalizeAssistantText(query);
  const cityFilter = cityIsSpecific(String(city || "").trim()) ? String(city || "").trim() : defaultEventCity();
  const matches = activeEventPromotions().filter((event) => {
    const categoryOk = !category || category === "Toutes les catégories" || event.category === category;
    const cityOk = eventVisibleForCity(event, cityFilter);
    const queryOk = !normalizedQuery || [event.title, event.description, event.venue, event.city, event.area, event.address, event.category, event.organizerName]
      .some((field) => normalizeAssistantText(field).includes(normalizedQuery));
    return categoryOk && cityOk && queryOk;
  });
  return sortEventsForAudience(matches, cityFilter, category);
}

function pendingLocalEvents() {
  const now = Date.now();
  return state.eventPromotions
    .filter((event) => event.status !== "expired" && eventEndTimestamp(event) > now)
    .filter((event) => ["pending", "submitted"].includes(event.status) || event.paymentStatus === "pending" || event.remoteStatus === "pending")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function normalizeJobOffer(job) {
  const plan = jobPlanByName(job.planName) || JOB_OFFER_PLANS.find((item) => item.id === job.planId) || JOB_OFFER_PLANS[1];
  const amount = Number(job.amount ?? plan.price ?? 0);
  return {
    id: job.id || `job${Date.now()}`,
    remoteId: job.remoteId || "",
    remoteStatus: job.remoteStatus || "",
    title: String(job.title || "").trim() || "Offre emploi Zeyds",
    companyName: String(job.companyName || "").trim() || "Entreprise Zeyds",
    companyType: String(job.companyType || "").trim() || "Entreprise formelle",
    contactPhone: String(job.contactPhone || "").trim(),
    contactEmail: String(job.contactEmail || "").trim(),
    service: canonicalServiceName(job.service || seed.selectedService),
    city: String(job.city || "").trim() || "Toute la Côte d'Ivoire",
    area: String(job.area || "").trim(),
    contractType: String(job.contractType || "").trim() || "Mission ponctuelle",
    salaryRange: String(job.salaryRange || "").trim(),
    description: String(job.description || "").trim(),
    externalUrl: String(job.externalUrl || "").trim(),
    source: String(job.source || "").trim() || "Zeyds",
    planId: job.planId || plan.id,
    planName: job.planName || plan.name,
    amount,
    currency: job.currency || bizziConfig.currency || "FCFA",
    paymentMethod: job.paymentMethod || seed.selectedJobPayment || "Wave",
    paymentReference: String(job.paymentReference || "").trim(),
    paymentProof: job.paymentProof || "",
    paymentProofName: job.paymentProofName || "",
    paymentStatus: job.paymentStatus || (amount > 0 && job.paymentReference ? "pending" : "unpaid"),
    isBoosted: Boolean(job.isBoosted ?? plan.boost),
    jobCredits: Number(job.jobCredits || plan.credits || 1),
    submissionReference: job.submissionReference || job.submission_reference || job.paymentReference || "",
    status: job.status || "pending",
    createdAt: job.createdAt || new Date().toISOString(),
    expiresAt: job.expiresAt || isoDaysFromNow(30),
  };
}

function jobOfferFromSupabase(row, index = 0) {
  return normalizeJobOffer({
    id: `sb-job-${row.id || index}`,
    remoteId: row.id || "",
    remoteStatus: "linked",
    title: row.title || "Offre emploi Zeyds",
    companyName: row.company_name || "Entreprise Zeyds",
    companyType: row.company_type || "Entreprise formelle",
    contactPhone: row.contact_phone || "",
    contactEmail: row.contact_email || "",
    service: row.service_name || "Service Zeyds",
    city: row.city_name || "Toute la Côte d'Ivoire",
    area: row.area || "",
    contractType: row.contract_type || "Mission ponctuelle",
    salaryRange: row.salary_range || "",
    description: row.description || "",
    externalUrl: row.external_url || "",
    source: row.source || "Zeyds",
    planName: row.plan_name || "",
    amount: Number(row.amount || 0),
    currency: row.currency || "FCFA",
    paymentMethod: paymentMethodLabel(row.payment_method || ""),
    paymentReference: row.transaction_reference || "",
    paymentStatus: row.payment_status || "approved",
    isBoosted: Boolean(row.is_boosted),
    jobCredits: Number(row.job_credits || 1),
    status: row.status || "published",
    createdAt: row.created_at || new Date().toISOString(),
    expiresAt: row.expires_at || isoDaysFromNow(30),
  });
}

function activeJobOffers() {
  const now = Date.now();
  return state.jobOffers
    .filter((job) => ["published", "open", "active"].includes(job.status))
    .filter((job) => !job.expiresAt || new Date(job.expiresAt).getTime() > now)
    .sort((a, b) => Number(b.isBoosted) - Number(a.isBoosted) || new Date(b.createdAt) - new Date(a.createdAt));
}

function applyJobExpirationRules() {
  const now = Date.now();
  let changed = false;
  state.jobOffers.forEach((job) => {
    if (["published", "open", "active"].includes(job.status) && job.expiresAt && new Date(job.expiresAt).getTime() <= now) {
      job.status = "expired";
      job.updatedAt = new Date().toISOString();
      changed = true;
    }
  });
  if (changed) saveState();
}

function jobsMatching(serviceName = "", cityName = "", query = "") {
  const service = canonicalServiceName(serviceName || "");
  const city = String(cityName || "").trim();
  const normalizedQuery = normalizeAssistantText(query);
  const national = !city || city === "Toute la Côte d'Ivoire" || city === "Autre ville / commune";
  return activeJobOffers().filter((job) => {
    const serviceOk = !service || service === "Tous les métiers" || job.service === service;
    const jobCity = String(job.city || "");
    const cityOk = national || jobCity === "Toute la Côte d'Ivoire" || jobCity === city || normalizeAssistantText(job.area).includes(normalizeAssistantText(city));
    const queryOk = !normalizedQuery || [job.title, job.companyName, job.service, job.city, job.area, job.contractType, job.description]
      .some((field) => normalizeAssistantText(field).includes(normalizedQuery));
    return serviceOk && cityOk && queryOk;
  });
}

function jobWhatsAppUrl(job) {
  const phone = String(job.contactPhone || "").replace(/[^\d+]/g, "");
  if (!phone) return "";
  const message = `Bonjour, j'ai vu votre offre sur Zeyds : ${job.title} (${job.service} à ${job.city}). Est-elle toujours disponible ?`;
  return `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;
}

function jobPaymentTrackingMessage(job) {
  const reference = job.paymentReference || job.transaction_reference || "Référence Zeyds non renseignée";
  const companyName = job.companyName || job.company_name || "votre organisation";
  const title = job.title || "votre offre emploi / mission";
  const planName = job.planName || job.plan_name || "forfait Zeyds";
  const amount = Number(job.amount || 0);
  const currency = job.currency || "FCFA";
  const amountLine = amount ? `${amount.toLocaleString("fr-FR")} ${currency}` : `montant ${currency}`;
  return [
    `Bonjour ${companyName},`,
    `Zeyds a enregistré votre demande : ${title}.`,
    `Référence de suivi : ${reference}.`,
    `Forfait : ${planName} - ${amountLine}.`,
    "Conservez cette référence : elle permettra de retrouver votre paiement ou votre demande en cas de réclamation.",
  ].join("\n");
}

function jobPaymentTrackingWhatsAppUrl(job) {
  const phone = String(job.contactPhone || job.contact_phone || "").replace(/[^\d+]/g, "");
  if (!phone) return "";
  return `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(jobPaymentTrackingMessage(job))}`;
}

function eventTicketUrl(event) {
  const raw = String(event.ticketUrl || "").trim();
  if (!raw) return "";
  return safeExternalUrl(raw);
}

function eventWhatsAppUrl(event) {
  const phone = String(event.contactPhone || "").replace(/[^\d+]/g, "");
  if (!phone) return "";
  const message = `Bonjour ${event.organizerName || "organisateur"}, j'ai vu votre événement sur Zeyds : ${event.title}. Je souhaite acheter un billet.`;
  return `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;
}

function eventPaymentTrackingMessage(event) {
  ensureEventPaymentReference(event);
  return [
    `Bonjour ${event.organizerName || "organisateur"},`,
    `Zeyds a enregistré votre événement : ${event.title}.`,
    `Référence de suivi visibilité : ${event.paymentReference}.`,
    `Forfait : ${event.planName} - ${Number(event.amount || 0).toLocaleString("fr-FR")} ${event.currency || "FCFA"}.`,
    Number(event.boostDurationDays || 0) ? `Durée du boost : ${Number(event.boostDurationDays).toLocaleString("fr-FR")} jour(s).` : "Formule standard gratuite.",
    "Rappel : Zeyds ne vend pas les billets. Les clients seront redirigés vers votre lien officiel.",
  ].join("\n");
}

function eventPaymentTrackingWhatsAppUrl(event) {
  const phone = String(event.contactPhone || "").replace(/[^\d+]/g, "");
  if (!phone) return "";
  return `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(eventPaymentTrackingMessage(event))}`;
}

async function submitEventPromotionToSupabase(event, files = {}) {
  if (!supabaseConfigured()) return "Supabase non configuré : événement gardé en local.";
  ensureEventPaymentReference(event);
  const uploads = {
    poster: await optionalStorageUpload("eventPosters", "events", files.posterFile, { publicUrl: true }),
  };
  const uploadWarning = storageWarnings(uploads);
  if (uploads.poster?.publicUrl) {
    event.posterUrl = uploads.poster.publicUrl;
  }
  const eventId = randomUuid();
  const paymentStatus = Number(event.amount || 0) > 0 ? "pending" : "approved";
  const payload = {
    id: eventId,
    title: event.title,
    description: event.description || null,
    event_datetime: event.dateTime,
    end_datetime: event.endDateTime,
    venue: event.venue,
    area: event.area || null,
    venue_address: event.address || null,
    latitude: Number.isFinite(event.latitude) ? event.latitude : null,
    longitude: Number.isFinite(event.longitude) ? event.longitude : null,
    visibility_radius_km: Number(event.visibilityRadiusKm || 25),
    city_name: event.city,
    category: event.category,
    poster_url: event.posterUrl || (/^https?:\/\//i.test(event.poster || "") ? event.poster : null),
    ticket_price: event.ticketPrice || null,
    ticket_url: event.ticketUrl,
    contact_phone: event.contactPhone,
    organizer_name: event.organizerName,
    plan_name: event.planName,
    amount: event.amount,
    currency: event.currency || bizziConfig.currency || "FCFA",
    payment_method: paymentMethodCode(event.paymentMethod),
    transaction_reference: event.paymentReference,
    payment_status: paymentStatus,
    is_sponsored: Boolean(event.isSponsored),
    is_premium: Boolean(event.isPremium),
    status: "pending",
  };
  try {
    await supabaseInsert("event_promotions", payload);
  } catch (error) {
    const message = String(error?.message || error);
    if (!/schema cache|column|end_datetime|venue_address|visibility_radius|latitude|longitude/i.test(message)) throw error;
    const legacyPayload = {
      id: eventId,
      title: payload.title,
      description: payload.description,
      event_datetime: payload.event_datetime,
      venue: payload.venue,
      city_name: payload.city_name,
      category: payload.category,
      poster_url: payload.poster_url,
      ticket_price: payload.ticket_price,
      ticket_url: payload.ticket_url,
      contact_phone: payload.contact_phone,
      organizer_name: payload.organizer_name,
      plan_name: payload.plan_name,
      amount: payload.amount,
      currency: payload.currency,
      payment_method: payload.payment_method,
      transaction_reference: payload.transaction_reference,
      payment_status: payload.payment_status,
      is_sponsored: payload.is_sponsored,
      is_premium: payload.is_premium,
      status: payload.status,
    };
    await supabaseInsert("event_promotions", legacyPayload);
  }
  event.remoteId = eventId;
  event.remoteStatus = "pending";
  event.paymentStatus = paymentStatus;
  const message = `Événement envoyé vers Supabase avec la référence Zeyds ${event.paymentReference}. Validation admin nécessaire avant publication.${uploadWarning ? ` ${uploadWarning}` : ""}`;
  markRemoteWrite(message);
  return message;
}

async function submitJobOfferToSupabase(job) {
  if (!supabaseConfigured()) return "Supabase non configuré : offre gardée en local.";
  ensureJobPaymentReference(job);
  const serviceId = await supabaseIdByName("services", job.service, remoteLookupCache.services);
  const cityId = await supabaseIdByName("cities", job.city, remoteLookupCache.cities);
  const jobId = randomUuid();
  const payload = {
    id: jobId,
    title: job.title,
    company_name: job.companyName,
    company_type: job.companyType || "Entreprise formelle",
    contact_phone: job.contactPhone,
    contact_email: job.contactEmail || null,
    service_id: serviceId,
    service_name: job.service,
    city_id: cityId,
    city_name: job.city,
    area: job.area || null,
    contract_type: job.contractType,
    salary_range: job.salaryRange || null,
    description: job.description || null,
    external_url: null,
    source: job.source || "bizzi",
    plan_name: job.planName,
    amount: job.amount,
    currency: job.currency || bizziConfig.currency || "FCFA",
    payment_method: paymentMethodCode(job.paymentMethod),
    transaction_reference: job.paymentReference,
    proof_url: null,
    payment_status: "pending",
    paid_at: new Date().toISOString(),
    is_boosted: Boolean(job.isBoosted),
    job_credits: Number(job.jobCredits || 1),
    status: "pending",
    expires_at: job.expiresAt || isoDaysFromNow(30),
  };
  try {
    await supabaseInsert("job_offers", payload);
  } catch (error) {
    if (!/company_type|schema cache|column/i.test(String(error?.message || error))) throw error;
    const legacyPayload = { ...payload };
    delete legacyPayload.company_type;
    await supabaseInsert("job_offers", legacyPayload);
  }
  job.remoteId = jobId;
  job.remoteStatus = "pending";
  job.paymentStatus = "pending";
  const message = `Offre emploi envoyée vers Supabase avec la référence Zeyds ${job.paymentReference}. Validation admin nécessaire avant affichage public.`;
  markRemoteWrite(message);
  return message;
}

async function testSupabaseConnection(button = null) {
  setBusyButton(button, true, "Test en cours...");
  renderSupabaseStatus("Test de connexion en cours...", { focus: true });
  try {
    const [countries, categories] = await Promise.all([
      supabaseFetch("countries?select=id,name&limit=1"),
      supabaseFetch("categories?select=id,name&is_active=eq.true&limit=1"),
    ]);
    const message = `Connexion OK. ${countries.length} pays lu, ${categories.length} catégorie lue.`;
    state.remote.lastSupabaseStatus = message;
    saveState();
    renderSupabaseStatus(message, { focus: true });
    renderProductionStatus();
    finishActionButton(button, "Connexion OK");
  } catch (error) {
    const message = `Connexion impossible : ${error.message}. Vérifiez l'URL Supabase, la clé anon et les politiques RLS.`;
    state.remote.lastSupabaseStatus = message;
    saveState();
    renderSupabaseStatus(message, { focus: true });
    renderProductionStatus();
    finishActionButton(button, "Erreur de connexion");
  }
}

async function repairRemoteServiceBackupsFromLocalState() {
  if (!supabaseConfigured()) return 0;
  const candidates = state.providers
    .filter((provider) => {
      const serviceName = canonicalServiceName(provider.service || "");
      return remoteProviderId(provider)
        && provider.phone
        && provider.remoteServiceStatus !== "linked"
        && !String(provider.id || "").startsWith("sb-")
        && serviceName
        && serviceName !== "Métier à préciser";
    })
    .slice(0, 40);
  let repaired = 0;
  for (const provider of candidates) {
    for (const serviceName of providerServiceNames(provider)) {
      const categoryName = localCategoryForService(serviceName) || "Autres";
      try {
        await supabaseRpc("public_link_provider_service", {
          provider_uuid: remoteProviderId(provider),
          provider_phone: provider.phone,
          target_service_name: serviceName,
          target_category_name: categoryName,
        }, { prefer: "return=representation" });
        provider.remoteServiceStatus = "linked";
        repaired += 1;
      } catch {
      }
    }
  }
  if (repaired) saveState();
  return repaired;
}

async function syncSupabasePublicData(button = null, options = {}) {
  const silent = options.silent === true;
  setBusyButton(button, true, "Import en cours...");
  if (!silent) renderSupabaseStatus("Import public Supabase en cours...", { focus: true });
  try {
    const repairedServiceCount = await repairRemoteServiceBackupsFromLocalState().catch(() => 0);
    const directoryRequest = providerDirectoryRequest();
    const [categories, services, providerPage, reviews, jobs, deliveries, events, foods, exceptionPlaces] = await Promise.all([
      supabaseFetch("categories?select=id,name,sort_order&is_active=eq.true&order=sort_order.asc"),
      supabaseFetch("services?select=id,name,sort_order,category_id,categories(name)&is_active=eq.true&order=sort_order.asc"),
      fetchPublicProviderDirectoryPage(directoryRequest),
      supabaseFetch("provider_reviews?select=id,provider_id,rating,message,status,created_at&status=eq.published&order=created_at.desc&limit=200").catch(() => null),
      supabaseFetch("public_job_offers?select=*").catch(() => null),
      supabaseFetch(`delivery_requests?select=*&client_access_token=eq.${encodeURIComponent(BizziPrivacy.token())}&order=created_at.desc&limit=80`).catch(() => null),
      supabaseFetch("public_event_promotions?select=*").catch(() => null),
      supabaseFetch("public_food_places?select=*").catch(() => null),
      supabaseFetch("public_exception_places?select=*&order=boost_active.desc,boost_ends_at.desc,created_at.desc").catch(() => null),
    ]);
    const providers = Array.isArray(providerPage?.items) ? providerPage.items : [];

    const previousIdentifiedProvider = identifiedProvider() || state.providers.find((provider) => provider.id === state.identifiedProviderId) || null;
    const durableLocalProviders = state.providers.filter(durableLocalProvider);
    const nextState = structuredClone(state);
    nextState.categories = categoriesFromSupabase(categories, services);
    const pageProviders = providers.map((row, index) => providerFromSupabase(row, index));
    nextState.providers = pageProviders.map((remoteProvider) => {
      const localProvider = durableLocalProviders.find((provider) => (
        (remoteProvider.remoteId && provider.remoteId === remoteProvider.remoteId)
        || phonesMatch(provider.phone, remoteProvider.phone)
      ));
      if (!localProvider) return remoteProvider;
      return {
        ...localProvider,
        ...remoteProvider,
        id: localProvider.id || remoteProvider.id,
        services: [...new Set([...providerServiceNames(remoteProvider), ...providerServiceNames(localProvider)])],
      };
    });
    providerDirectoryState.items = pageProviders;
    providerDirectoryState.cursor = providerPage?.nextCursor || null;
    providerDirectoryState.hasMore = Boolean(providerPage?.hasMore);
    providerDirectoryState.loadedCount = pageProviders.length;
    providerDirectoryState.signature = directoryRequest.signature;
    providerDirectoryState.pendingSignature = "";
    providerDirectoryState.mode = providerPage?.mode || "legacy_limited";
    providerDirectoryState.error = providerPage?.fallbackError
      ? `Pagination SQL V250 non installée : affichage de secours limité. ${providerPage.fallbackError}`
      : "";
    durableLocalProviders.forEach((localProvider) => {
      const represented = nextState.providers.some((provider) => (
        (localProvider.remoteId && provider.remoteId === localProvider.remoteId)
        || phonesMatch(provider.phone, localProvider.phone)
      ));
      if (!represented) nextState.providers.push(localProvider);
    });
    if (previousIdentifiedProvider) {
      const refreshedIdentified = nextState.providers.find((provider) => (
        (previousIdentifiedProvider.remoteId && provider.remoteId === previousIdentifiedProvider.remoteId)
          || providerMatchesContact(provider, previousIdentifiedProvider.phone, previousIdentifiedProvider.whatsapp)
      ));
      if (refreshedIdentified) {
        nextState.identifiedProviderId = refreshedIdentified.id;
        nextState.selectedPaymentProviderId = refreshedIdentified.id;
      } else {
        nextState.providers.push(previousIdentifiedProvider);
        nextState.identifiedProviderId = previousIdentifiedProvider.id;
        nextState.selectedPaymentProviderId = previousIdentifiedProvider.id;
      }
    }
    const activeRemoteProviderIds = new Set(nextState.providers
      .filter((provider) => provider.remoteStatus === "linked" && provider.visibility === "active")
      .map((provider) => provider.id));
    nextState.payments = Array.isArray(nextState.payments) ? nextState.payments.map((payment) => (
      activeRemoteProviderIds.has(payment.providerId) && payment.status === "pending"
        ? { ...payment, status: "approved", remoteStatus: payment.remoteStatus || "synced", reviewedAt: payment.reviewedAt || new Date().toISOString() }
        : payment
    )) : [];
    nextState.ads = [];
    if (Array.isArray(reviews)) nextState.reviews = reviews.map((review) => reviewFromSupabase(review, nextState.providers));
    if (Array.isArray(jobs)) nextState.jobOffers = jobs.map(jobOfferFromSupabase);
    if (Array.isArray(events)) {
      const remoteEvents = events.map(eventPromotionFromSupabase);
      const remoteIds = new Set(remoteEvents.map((event) => event.remoteId).filter(Boolean));
      const localOnlyEvents = (nextState.eventPromotions || []).filter((event) => !event.remoteId || !remoteIds.has(event.remoteId));
      nextState.eventPromotions = [...remoteEvents, ...localOnlyEvents].slice(0, 120);
    }
    if (Array.isArray(deliveries)) {
      const remoteDeliveries = deliveries.map(deliveryRequestFromSupabase);
      const remoteIds = new Set(remoteDeliveries.map((request) => request.remoteId).filter(Boolean));
      const localOnlyDeliveries = (nextState.deliveryRequests || []).filter((request) => !request.remoteId || (BizziPrivacy.owns(request.clientDeviceToken) && !remoteIds.has(request.remoteId)));
      nextState.deliveryRequests = [...remoteDeliveries, ...localOnlyDeliveries].slice(0, 100);
    }
    if (Array.isArray(foods)) {
      const remoteFoods = foods.map(foodPlaceFromSupabase);
      const remoteIds = new Set(remoteFoods.map((place) => place.remoteId).filter(Boolean));
      const localOnlyFoods = (nextState.foodPlaces || []).filter((place) => !place.remoteId || !remoteIds.has(place.remoteId));
      nextState.foodPlaces = [...remoteFoods, ...localOnlyFoods].slice(0, 160);
    }
    if (Array.isArray(exceptionPlaces)) {
      const remoteExceptionPlaces = exceptionPlaces.map(exceptionPlaceFromSupabase);
      const remoteIds = new Set(remoteExceptionPlaces.map((place) => place.remoteId).filter(Boolean));
      const localOnlyExceptionPlaces = (nextState.exceptionPlaces || []).filter((place) => !place.remoteId || !remoteIds.has(place.remoteId));
      nextState.exceptionPlaces = [...remoteExceptionPlaces, ...localOnlyExceptionPlaces].slice(0, 200);
    }
    const reviewImportLabel = Array.isArray(reviews) ? `${reviews.length} avis` : "avis non configurés";
    const jobImportLabel = Array.isArray(jobs) ? `${jobs.length} offre(s) emploi` : "emplois non configurés";
    const deliveryImportLabel = Array.isArray(deliveries) ? `${deliveries.length} livraison(s)` : "livraisons non configurées";
    const eventImportLabel = Array.isArray(events) ? `${events.length} événement(s)` : "événements non configurés";
    const foodImportLabel = Array.isArray(foods) ? `${foods.length} adresse(s) Food` : "Food non configuré";
    const exceptionImportLabel = Array.isArray(exceptionPlaces) ? `${exceptionPlaces.length} lieu(x) d’exception` : "lieux d’exception non configurés";
    const repairedLabel = repairedServiceCount ? ` ${repairedServiceCount} métier(s) local(aux) resynchronisé(s).` : "";
    nextState.remote = {
      ...(nextState.remote || {}),
      lastSupabaseSyncAt: new Date().toISOString(),
      lastSupabaseStatus: `Page de ${providers.length} prestataire(s), ${nextState.categories.length} catégorie(s), ${reviewImportLabel}, ${jobImportLabel}, ${deliveryImportLabel}, ${eventImportLabel}, ${foodImportLabel} et ${exceptionImportLabel} importés depuis Supabase. ${providerPage?.mode === "server_cursor" ? "Pagination serveur V250 active." : "Mode de secours limité : installez le SQL V250."}${repairedLabel}${providers.length ? "" : " Aucun prestataire actif ne correspond à cette recherche."}`,
    };
    replaceState(nextState);
    refreshApp();
    if (!silent) renderSupabaseStatus(state.remote.lastSupabaseStatus, { focus: true });
    finishActionButton(button, "Import terminé");
  } catch (error) {
    const message = `Import impossible : ${error.message}. Les données locales restent utilisées.`;
    state.remote.lastSupabaseStatus = message;
    saveState();
    if (!silent) {
      renderSupabaseStatus(message, { focus: true });
      renderProductionStatus();
    }
    finishActionButton(button, "Erreur import");
  }
}

async function submitProviderToSupabase(provider, files = {}) {
  if (!supabaseConfigured()) {
    return "Supabase non configuré : profil gardé en local.";
  }
  if (remoteProviderId(provider)) {
    if (adminAuthSession?.accessToken) {
      const serviceMessage = await assignRemotePrimaryService(provider, true);
      return `Profil déjà lié à Supabase. ${serviceMessage}`;
    }
    return "Profil déjà lié à Supabase.";
  }

  const cityId = await supabaseIdByName("cities", provider.city, remoteLookupCache.cities);
  provider.service = canonicalServiceName(provider.service || "");
  const categoryName = localCategoryForService(provider.service) || "Autres";
  const serviceId = await supabaseIdByName("services", provider.service, remoteLookupCache.services);
  const uploads = {
    photo: await optionalStorageUpload("providerPhotos", "providers", files.photoFile, { publicUrl: true }),
    justificatif: await optionalStorageUpload("verificationProofs", "verification", files.verificationProofFile),
  };
  const uploadWarning = storageWarnings(uploads);
  if (uploads.photo?.publicUrl) {
    provider.remotePhotoUrl = uploads.photo.publicUrl;
  }
  if (uploads.justificatif?.path) {
    provider.remoteVerificationProofPath = uploads.justificatif.path;
  }
  const providerId = randomUuid();
  const providerPayload = {
    id: providerId,
    full_name: provider.fullName,
    phone: provider.phone,
    whatsapp: provider.whatsapp || provider.phone,
    photo_url: provider.remotePhotoUrl || (/^https?:\/\//i.test(provider.photo || "") ? provider.photo : null),
    verification_proof_url: provider.remoteVerificationProofPath || null,
    verification_note: provider.verificationNote || null,
    description: provider.description,
    city_id: cityId,
    neighborhood: provider.area,
    latitude: provider.lat || null,
    longitude: provider.lng || null,
    location_accuracy: provider.locationAccuracy || null,
    location_timestamp: provider.locationTimestamp || null,
    location_label: provider.locationLabel || null,
    location_full_address: provider.locationFullAddress || null,
    status: "pending",
    visibility_status: "trial",
    trial_started_at: provider.termsAcceptedAt || new Date().toISOString(),
    trial_ends_at: provider.trialEndsAt,
    average_rating: 0,
    call_count: 0,
    is_verified: false,
  };
  try {
    await supabaseInsert("providers", {
      ...providerPayload,
      requested_service_name: provider.service,
      requested_category_name: categoryName,
    });
  } catch (error) {
    const message = friendlySupabaseError(error);
    if (!/requested_service_name|requested_category_name|schema cache|column/i.test(message)) {
      throw error;
    }
    await supabaseInsert("providers", providerPayload);
  }
  provider.remoteId = providerId;
  provider.remoteStatus = "submitted";

  const serviceMessage = provider.remoteId
    ? await linkCreatedProviderService(provider, serviceId)
    : "Métier non lié : profil Supabase non créé.";
  const additionalServiceMessages = [];
  for (const additionalService of providerServiceNames(provider).filter((name) => name !== provider.service)) {
    additionalServiceMessages.push(await syncAdditionalProviderService(provider, additionalService));
  }

  const autoTrialMessage = provider.remoteId
    ? await autoActivateNewProviderTrial(provider)
    : "";
  const message = provider.remoteId
    ? `Profil envoyé vers Supabase : ${serviceMessage} ${additionalServiceMessages.join(" ")} ${autoTrialMessage || "mois gratuit en attente d'activation automatique."} ID Supabase ${provider.remoteId}.`
    : "Profil local créé, mais Supabase n'a pas renvoyé d'identifiant.";
  const finalMessage = `${message}${uploadWarning ? ` ${uploadWarning}` : ""}`;
  markRemoteWrite(finalMessage);
  return finalMessage;
}

function refreshProviderCreationViews() {
  saveState();
  renderAdmin();
  renderAd();
  renderHomeDiscovery();
  renderPaymentProviderOptions();
  renderProviderDeliveryQueue();
}

async function hydrateProviderLocalFiles(provider, files = {}) {
  try {
    const photo = await withTimeout(readPhotoFile(files.photoFile), 8000, "Lecture de la photo trop longue. Réessayez avec une image plus légère.");
    if (photo && photo.length <= 180000) provider.photo = photo;
    if (files.verificationProofFile?.name) provider.verificationProofName = files.verificationProofFile.name;
    if (photo || files.verificationProofFile?.name) refreshProviderCreationViews();
  } catch (error) {
    provider.localFileError = friendlySupabaseError(error);
    refreshProviderCreationViews();
  }
}

async function syncCreatedProviderToSupabase(provider, files = {}) {
  if (!provider) return;
  const localFileHydration = hydrateProviderLocalFiles(provider, files);
  provider.remoteStatus = "syncing";
  provider.remoteError = "";
  refreshProviderCreationViews();

  try {
    const existingRemoteProvider = await withTimeout(
      fetchPublicProviderByContact(provider.phone, provider.whatsapp),
      6000,
      "Recherche Supabase trop lente, la synchronisation continue par envoi direct."
    ).catch(() => null);
    if (existingRemoteProvider?.remoteId) {
      const linkedProvider = upsertRenewalProvider(existingRemoteProvider);
      const requestedServices = providerServiceNames(provider);
      requestedServices.forEach((name) => addProviderService(linkedProvider, name));
      state.providers = state.providers.filter((item) => item.id !== provider.id || item.remoteId === linkedProvider.remoteId);
      for (const requestedService of requestedServices) {
        await syncAdditionalProviderService(linkedProvider, requestedService);
      }
      await localFileHydration.catch(() => {});
      prepareNextProviderSignup(linkedProvider.fullName, provider.service, {
        phone: linkedProvider.phone,
        serviceAddedTo: linkedProvider.fullName,
        serviceCount: providerServiceNames(linkedProvider).length,
        submissionReference: provider.submissionReference || provider.lastServiceSubmissionReference || "",
      });
      renderAdmin();
      renderHomeDiscovery();
      renderAd();
      return;
    }

    const message = await submitProviderToSupabase(provider, files);
    await localFileHydration.catch(() => {});
    provider.remoteError = "";
    refreshProviderCreationViews();
    renderProviderStatus(`Profil créé pour le métier ${safe(provider.service)}. Synchronisation Supabase terminée : ${safe(message)}`);
  } catch (error) {
    if (isDuplicateProviderPhoneError(error)) {
      const existingProvider = upsertRenewalProvider(await fetchPublicProviderByContact(provider.phone, provider.whatsapp).catch(() => null));
      if (existingProvider) {
        const requestedServices = providerServiceNames(provider);
        requestedServices.forEach((name) => addProviderService(existingProvider, name));
        state.providers = state.providers.filter((item) => item.id !== provider.id || item.remoteId === existingProvider.remoteId);
        for (const requestedService of requestedServices) {
          await syncAdditionalProviderService(existingProvider, requestedService).catch(() => "");
        }
        await localFileHydration.catch(() => {});
        prepareNextProviderSignup(existingProvider.fullName, provider.service, {
          phone: existingProvider.phone,
          serviceAddedTo: existingProvider.fullName,
          serviceCount: providerServiceNames(existingProvider).length,
          submissionReference: provider.submissionReference || provider.lastServiceSubmissionReference || "",
        });
        renderAdmin();
        renderHomeDiscovery();
        renderAd();
        return;
      }
    }
    provider.remoteStatus = "local_only";
    provider.remoteError = friendlySupabaseError(error);
    await localFileHydration.catch(() => {});
    refreshProviderCreationViews();
    renderProviderStatus(`Profil créé sur cet appareil. Synchronisation Supabase à reprendre depuis l'admin : ${safe(provider.remoteError)}`);
  }
}

async function autoActivateNewProviderTrial(provider) {
  try {
    const result = await supabaseRpc("public_activate_provider_trial", {
      provider_uuid: provider.remoteId,
      provider_phone: provider.phone,
    }, { prefer: "return=representation" });
    const payload = Array.isArray(result) ? result[0] : result;
    provider.remoteStatus = "linked";
    provider.status = "approved";
    provider.visibility = "active";
    provider.trialEndsAt = payload?.trial_ends_at || provider.trialEndsAt || isoDaysFromNow(30);
    provider.subscriptionEndsAt = null;
    saveState();
    return `mois gratuit activé automatiquement jusqu'au ${new Date(provider.trialEndsAt).toLocaleDateString("fr-FR")}. Le profil est visible côté client après import public.`;
  } catch (error) {
    const publicVisible = await fetchPublicProviderById(provider.remoteId).catch(() => null);
    if (publicVisible?.id) {
      provider.remoteStatus = "linked";
      provider.status = "approved";
      provider.visibility = "active";
      provider.trialEndsAt = publicVisible.trial_ends_at || provider.trialEndsAt || isoDaysFromNow(30);
      provider.subscriptionEndsAt = null;
      saveState();
      return `profil visible automatiquement côté client jusqu'au ${new Date(provider.trialEndsAt).toLocaleDateString("fr-FR")}.`;
    }
    provider.remoteStatus = "submitted";
    provider.remoteError = `Activation automatique du mois gratuit non confirmée : ${friendlySupabaseError(error)}`;
    saveState();
    return `profil créé, mais l'activation automatique du mois gratuit n'est pas encore confirmée (${friendlySupabaseError(error)}). Exécutez sql-copie-bizzi/54-auto-validation-prestataires-v121.sql une seule fois dans Supabase, puis les prochains prestataires seront visibles automatiquement.`;
  }
}

async function submitPaymentToSupabase(payment, provider, proofFile = null) {
  if (!supabaseConfigured()) return "Supabase non configuré : paiement gardé en local.";
  if (!remoteProviderId(provider)) {
    await submitProviderToSupabase(provider);
  }
  const providerId = remoteProviderId(provider);
  if (!providerId) return "Paiement local : le prestataire n'est pas encore lié à Supabase.";
  const planId = await supabaseIdByName("subscription_plans", payment.plan, remoteLookupCache.plans);
  if (!planId) throw new Error(`Forfait Supabase introuvable : ${payment.plan}`);
  const proofUpload = await optionalStorageUpload("paymentProofs", "payments", proofFile);
  if (proofUpload?.path) {
    payment.remoteProofPath = proofUpload.path;
  }
  const paymentId = randomUuid();
  try {
    await supabaseInsert("payments", {
      id: paymentId,
      provider_id: providerId,
      plan_id: planId,
      amount: payment.amount,
      currency: bizziConfig.currency || "FCFA",
      method: paymentMethodCode(payment.method),
      transaction_reference: payment.reference,
      proof_url: payment.remoteProofPath || (/^https?:\/\//i.test(payment.proof || "") ? payment.proof : null),
      admin_note: paymentAdminNote(payment) || null,
      status: "pending",
      paid_at: new Date().toISOString(),
    });
  } catch (error) {
    if (!isDuplicatePendingPaymentReferenceError(error)) throw error;
    const existingPayment = await fetchExistingPendingRemotePayment(providerId, payment).catch(() => null);
    if (existingPayment?.id) {
      payment.remoteId = existingPayment.id;
      payment.remoteStatus = "pending";
      payment.remoteDuplicateRecovered = true;
      const message = "Paiement déjà présent dans Supabase : il a été rattaché au paiement local. Cliquez sur Charger validations Supabase puis Valider Supabase.";
      markRemoteWrite(message);
      return message;
    }
    throw new Error("Cette référence de paiement existe déjà pour ce prestataire dans Supabase. Cliquez sur Charger validations Supabase : le paiement est probablement déjà en attente de validation.");
  }
  payment.remoteId = paymentId;
  payment.remoteStatus = "pending";
  const message = proofUpload?.error
    ? `Paiement envoyé vers Supabase, preuve non envoyée : ${proofUpload.error}.`
    : "Paiement envoyé vers Supabase : validation admin nécessaire.";
  markRemoteWrite(message);
  return message;
}

function isDuplicatePendingPaymentReferenceError(error) {
  const message = error?.message || String(error || "");
  return message.includes("payments_unique_pending_provider_reference")
    || message.includes("payments_unique_provider_reference")
    || message.includes("payments_provider_reference_unique")
    || (message.includes("duplicate key") && message.includes("payments"));
}

async function fetchExistingPendingRemotePayment(providerId, payment) {
  const reference = String(payment?.reference || "").trim();
  if (!providerId || !reference) return null;
  const resource = [
    "payments?select=id,provider_id,amount,currency,method,transaction_reference,admin_note,status,created_at",
    `provider_id=eq.${encodeURIComponent(providerId)}`,
    `method=eq.${encodeURIComponent(paymentMethodCode(payment.method))}`,
    `transaction_reference=${eqFilter(reference)}`,
    "status=eq.pending",
    "limit=1",
  ].join("&");
  const hasAdminSession = Boolean(loadAdminAuthSession()?.accessToken);
  const rows = hasAdminSession
    ? await supabaseAdminRequest(resource)
    : await supabaseFetch(resource);
  return Array.isArray(rows) ? rows[0] || null : rows;
}

async function resendLocalPaymentToSupabase(paymentId, button = null) {
  const payment = state.payments.find((item) => item.id === paymentId);
  if (!payment) {
    renderAdminRemoteStatus("Paiement local introuvable. Rechargez l'admin puis réessayez.", true);
    return;
  }
  const providerNameKey = normalizedCatalogKey(payment.providerName || "");
  const provider = state.providers.find((item) => item.id === payment.providerId)
    || state.providers.find((item) => normalizedCatalogKey(item.fullName || "") === providerNameKey);
  if (!provider) {
    renderAdminRemoteStatus(`Envoi impossible : prestataire local introuvable pour ${safe(payment.providerName || "ce paiement")}. Importez le public Supabase puis recréez le paiement.`, true);
    return;
  }
  setBusyButton(button, true, "Envoi...");
  renderAdminRemoteStatus(`Envoi du paiement de ${payment.providerName || provider.fullName} vers Supabase...`, true);
  try {
    const message = await submitPaymentToSupabase(payment, provider, null);
    payment.remoteStatus = "pending";
    saveState();
    renderAdmin();
    await loadSupabaseAdminQueue();
    renderAdminRemoteStatus(`${message} Cliquez maintenant sur Charger validations Supabase si la liste ne se met pas à jour.`, true);
    finishActionButton(button, "Envoyé");
  } catch (error) {
    payment.remoteStatus = "local_only";
    payment.remoteError = friendlySupabaseError(error);
    saveState();
    renderAdmin();
    renderAdminRemoteStatus(`Envoi paiement Supabase impossible : ${payment.remoteError}`, true);
    finishActionButton(button, "Erreur");
  }
}

async function submitReportToSupabase(report, provider) {
  if (!supabaseConfigured()) return "Supabase non configuré : signalement gardé en local.";
  const providerId = remoteProviderId(provider);
  if (!providerId) return "Signalement local : prestataire non lié à Supabase.";
  const reportId = randomUuid();
  await supabaseInsert("reports", {
    id: reportId,
    provider_id: providerId,
    reason: report.reason,
    message: report.message,
    status: "open",
  });
  report.remoteId = reportId;
  report.remoteStatus = "open";
  const message = "Signalement envoyé vers Supabase.";
  markRemoteWrite(message);
  return message;
}

async function submitReviewToSupabase(review, provider) {
  if (!supabaseConfigured()) return "Avis gardé en local : Supabase non configuré.";
  const providerId = remoteProviderId(provider) || "";
  try {
    return await submitReviewWithRpc(review, provider, providerId);
  } catch (rpcError) {
    if (!isMissingReviewRpcError(rpcError)) {
      throw rpcError;
    }
  }

  const resolvedProviderId = await resolveRemoteProviderIdForReview(provider);
  if (!resolvedProviderId) return "Avis gardé en local : prestataire non lié à Supabase.";
  const reviewId = randomUuid();
  await supabaseInsert("provider_reviews", {
    id: reviewId,
    provider_id: resolvedProviderId,
    rating: review.rating,
    message: review.message,
    status: "published",
  });
  review.remoteId = reviewId;
  review.remoteStatus = "submitted";
  const message = "Avis envoyé vers Supabase.";
  markRemoteWrite(message);
  return message;
}

async function submitReviewWithRpc(review, provider, providerId) {
  const payload = {
    p_provider_uuid: providerId || null,
    p_provider_phone: provider?.phone || "",
    p_rating: Number(review.rating || 5),
    p_message: review.message || "",
  };
  const result = await supabaseRpc("bizzi_submit_review", payload, { prefer: "return=representation" });
  const data = Array.isArray(result) ? result[0] : result;
  review.remoteId = data?.review_id || randomUuid();
  review.remoteStatus = "submitted";
  if (data?.provider_id) {
    provider.remoteId = data.provider_id;
    provider.remoteStatus = "linked";
  }
  const message = "Avis envoyé vers Supabase.";
  markRemoteWrite(message);
  return message;
}

function isMissingReviewRpcError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("bizzi_submit_review")
    || message.includes("could not find the function")
    || message.includes("function public.bizzi_submit_review")
    || message.includes("schema cache");
}

async function resolveRemoteProviderIdForReview(provider) {
  const directId = remoteProviderId(provider);
  if (directId) return directId;
  if (!provider?.phone) return "";

  const rows = await supabaseFetch(`public_provider_directory?select=id&phone=${eqFilter(provider.phone)}&limit=1`);
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row?.id) return "";

  provider.remoteId = row.id;
  provider.remoteStatus = "linked";
  saveState();
  return row.id;
}

function isMissingPriorityColumnError(error) {
  const message = String(error?.message || error || "");
  return /priority_score|priority_label|matched_count|schema cache|column/i.test(message);
}

async function submitExpressRequestToSupabase(request) {
  if (!supabaseConfigured()) return "Demande gardée en local : Supabase non configuré.";
  if (request.remoteId) return "Demande déjà liée à Supabase.";
  const requestId = randomUuid();
  const serviceId = await supabaseIdByName("services", request.service, remoteLookupCache.services);
  const cityId = await supabaseIdByName("cities", request.city, remoteLookupCache.cities);
  const matches = expressRequestMatches(request);
  const priority = hydrateRequestPriority(request, matches);
  const matchedProviderIds = matches
    .map(remoteProviderId)
    .filter(Boolean);
  const payload = {
    id: requestId,
    service_id: serviceId,
    service_name: request.service,
    city_id: cityId,
    city_name: request.city,
    area: request.area || null,
    urgency: request.urgency || "today",
    message: request.message || null,
    customer_name: request.clientName || null,
    customer_phone: request.phone || null,
    matched_provider_ids: matchedProviderIds,
    priority_score: priority.score,
    priority_label: priority.label,
    matched_count: priority.matchCount,
    status: "open",
  };
  try {
    await supabaseInsert("express_requests", payload);
  } catch (error) {
    if (!isMissingPriorityColumnError(error)) throw error;
    const legacyPayload = { ...payload };
    if (request.clientName) legacyPayload.message = [`Client : ${request.clientName}`, legacyPayload.message].filter(Boolean).join(" — ");
    delete legacyPayload.customer_name;
    delete legacyPayload.priority_score;
    delete legacyPayload.priority_label;
    delete legacyPayload.matched_count;
    await supabaseInsert("express_requests", legacyPayload);
  }
  request.remoteId = requestId;
  request.remoteStatus = "open";
  const message = "Demande express envoyée vers Supabase.";
  markRemoteWrite(message);
  return message;
}

async function submitDeliveryRequestToSupabase(request) {
  if (!supabaseConfigured()) return "Livraison gardée en local : Supabase non configuré.";
  if (request.remoteId) return "Livraison déjà liée à Supabase.";
  request.clientDeviceToken ||= BizziPrivacy.token();
  const requestId = randomUuid();
  const matches = deliveryRequestMatches(request);
  const matchedProviderIds = matches.map(remoteProviderId).filter(Boolean);
  const pickupPoint = deliveryPickupPoint(request);
  const dropoffPoint = (() => {
    if (Number.isFinite(request.dropoffLatitude) && Number.isFinite(request.dropoffLongitude)) {
      return { lat: request.dropoffLatitude, lng: request.dropoffLongitude };
    }
    const detected = deliveryLocationPoint(request.dropoff || "", request.city || "");
    if (detected) return detected;
    return null;
  })();
  ensureDeliveryPaymentReference(request);
  const payload = {
    id: requestId,
    pickup_address: request.pickup,
    dropoff_address: request.dropoff,
    pickup_latitude: pickupPoint?.lat || null,
    pickup_longitude: pickupPoint?.lng || null,
    pickup_accuracy: request.pickupAccuracy || null,
    pickup_location_timestamp: request.pickupLocationTimestamp || null,
    pickup_location_label: request.pickupLocationLabel || request.pickup || null,
    pickup_location_full_address: request.pickupLocationFullAddress || request.pickup || null,
    dropoff_latitude: dropoffPoint?.lat || null,
    dropoff_longitude: dropoffPoint?.lng || null,
    dropoff_location_label: request.dropoffLocationLabel || request.dropoff || null,
    dropoff_location_full_address: request.dropoffLocationFullAddress || request.dropoff || null,
    parcel_description: request.parcel,
    city_name: request.city,
    area: request.area || null,
    urgency: request.urgency || "today",
    scheduled_at: request.scheduledAt || null,
    notes: request.notes || null,
    customer_name: request.clientName || null,
    customer_phone: request.phone || null,
    client_access_token: request.clientDeviceToken,
    distance_km: request.distanceKm || null,
    base_amount: request.baseAmount || 0,
    suggested_amount: request.suggestedAmount || request.amount || 0,
    pricing_slot: request.pricingSlot || "normal",
    bad_weather: Boolean(request.badWeather),
    surcharge_rate: request.surchargeRate || 0,
    pricing_breakdown: request.pricingBreakdown || null,
    amount: request.amount,
    currency: request.currency || bizziConfig.currency || "FCFA",
    commission_rate: request.commissionRate || DELIVERY_COMMISSION_RATE,
    bizzi_commission: request.bizziCommission,
    provider_payout: request.providerPayout,
    payment_method: paymentMethodCode(request.paymentMethod),
    transaction_reference: request.paymentReference,
    payment_status: request.paymentStatus || "pending",
    paid_at: request.paidAt || null,
    payout_status: request.payoutStatus || "pending",
    dispatch_radius_km: DELIVERY_MATCH_RADIUS_KM,
    dispatch_status: request.dispatchStatus || "dispatching",
    dispatch_candidate_count: request.dispatchCandidateCount || matchedProviderIds.length,
    dispatch_mode: request.dispatchMode || "direct_local",
    dispatched_at: request.dispatchedAt || new Date().toISOString(),
    last_dispatch_message: request.lastDispatchMessage || null,
    matched_provider_ids: matchedProviderIds,
    delivery_stage: request.deliveryStage || "waiting",
    proof_code: request.proofCode || null,
    ...(request.foodPlaceId ? {
      food_place_id: request.foodPlaceId,
      food_place_name: request.foodPlaceName,
      food_item: request.foodItem,
      restaurant_amount: request.restaurantAmount,
      restaurant_payout: request.restaurantPayout,
      restaurant_payout_status: request.restaurantPayoutStatus || "payable_after_payment",
      restaurant_mobile_money_account: request.restaurantMobileMoneyAccount || null,
      delivery_amount: request.deliveryAmount || request.suggestedAmount || 0,
      food_order_total: request.foodOrderTotal || request.amount,
    } : {}),
    status: "open",
  };
  try {
    await supabaseInsert("delivery_requests", payload);
  } catch (error) {
    if (!isMissingPriorityColumnError(error)) throw error;
    if (request.clientName) payload.notes = [`Client : ${request.clientName}`, payload.notes].filter(Boolean).join(" — ");
    [
      "customer_name", "client_access_token", "paid_at", "dispatch_status", "dispatch_candidate_count", "dispatch_mode", "dispatched_at", "last_dispatch_message",
      "delivery_stage", "proof_code",
      "food_place_id", "food_place_name", "food_item", "restaurant_amount", "restaurant_payout",
      "restaurant_payout_status", "restaurant_mobile_money_account", "delivery_amount", "food_order_total",
    ].forEach((key) => delete payload[key]);
    await supabaseInsert("delivery_requests", payload);
  }
  request.remoteId = requestId;
  request.remoteStatus = "linked";
  const message = "Livraison envoyée vers Supabase.";
  markRemoteWrite(message);
  return message;
}

async function acceptDeliveryRequestInSupabase(request, provider) {
  if (!request?.remoteId || !remoteProviderId(provider)) return "Acceptation locale enregistrée.";
  const payload = {
    p_delivery_id: request.remoteId,
    p_provider_id: remoteProviderId(provider),
    p_provider_name: provider.fullName,
    p_provider_phone: provider.phone,
  };
  try {
    await supabaseRpc("bizzi_accept_delivery_request", payload);
  } catch (rpcError) {
    await supabaseRequest(`delivery_requests?id=eq.${encodeURIComponent(request.remoteId)}&status=eq.open`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: {
        status: "assigned",
        assigned_provider_id: remoteProviderId(provider),
        assigned_provider_name: provider.fullName,
        assigned_provider_phone: provider.phone,
        commission_rate: request.commissionRate || DELIVERY_COMMISSION_RATE,
        bizzi_commission: request.bizziCommission,
        provider_payout: request.providerPayout,
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  }
  request.remoteStatus = "linked";
  return "Acceptation publiée dans Supabase.";
}

async function cancelDeliveryByClientInSupabase(request, reason) {
  if (!request?.remoteId) return "Annulation locale enregistrée.";
  const customerCheck = request.paymentReference || request.phone || "";
  try {
    await supabaseRpc("bizzi_cancel_delivery_by_client", {
      p_delivery_id: request.remoteId,
      p_reason: reason,
      p_customer_check: customerCheck,
    }, {
      timeoutMs: 12000,
    });
  } catch (rpcError) {
    await supabaseRequest(`delivery_requests?id=eq.${encodeURIComponent(request.remoteId)}&status=in.(open,assigned)`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: {
        status: "cancelled",
        cancellation_status: "client_cancelled",
        cancellation_reason: reason,
        cancelled_by: "client",
        cancelled_at: new Date().toISOString(),
        payout_status: "blocked",
        dispatch_status: "expired",
        updated_at: new Date().toISOString(),
      },
    });
  }
  request.remoteStatus = "linked";
  return "Annulation client publiée dans Supabase.";
}

async function requestProviderDeliveryCancellationInSupabase(request, provider, reason) {
  if (!request?.remoteId || !remoteProviderId(provider)) return "Signalement local enregistré.";
  try {
    await supabaseRpc("bizzi_request_provider_delivery_cancellation", {
      p_delivery_id: request.remoteId,
      p_provider_id: remoteProviderId(provider),
      p_reason: reason,
    }, {
      timeoutMs: 12000,
    });
  } catch (rpcError) {
    await supabaseRequest(`delivery_requests?id=eq.${encodeURIComponent(request.remoteId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: {
        cancellation_status: "provider_requested",
        provider_cancel_reason: reason,
        provider_cancel_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  }
  request.remoteStatus = "linked";
  return "Signalement prestataire publié dans Supabase.";
}

async function reviewProviderDeliveryCancellationInSupabase(request, penalize = false) {
  if (!request?.remoteId) return "Revue locale enregistrée.";
  await supabaseRpc("bizzi_review_provider_delivery_cancellation", {
    p_delivery_id: request.remoteId,
    p_penalize: Boolean(penalize),
    p_admin_note: request.providerCancelReason || "",
  }, {
    accessToken: adminAuthSession?.accessToken || "",
    timeoutMs: 12000,
  });
  request.remoteStatus = "linked";
  return penalize ? "Pénalité prestataire publiée dans Supabase." : "Libération sans pénalité publiée dans Supabase.";
}

async function closeDeliveryRequestInSupabase(request) {
  if (!request?.remoteId) return "Clôture locale enregistrée.";
  try {
    await supabaseRpc("bizzi_close_delivery_request", { p_delivery_id: request.remoteId }, {
      accessToken: adminAuthSession?.accessToken || "",
    });
  } catch (rpcError) {
    await supabaseRequest(`delivery_requests?id=eq.${encodeURIComponent(request.remoteId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      accessToken: adminAuthSession?.accessToken || "",
      body: {
        status: "closed",
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  }
  request.remoteStatus = "linked";
  return "Clôture publiée dans Supabase.";
}

function socialUrl(type, value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return safeExternalUrl(raw, { addHttps: false });
  if (type === "whatsapp") {
    const digits = raw.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : "";
  }
  return "";
}

function providerShareText(provider) {
  return `Je te recommande ${provider.fullName} sur Zeyds. Métier : ${provider.service}. Zone : ${provider.area}, ${provider.city}. Téléphone : ${provider.phone}.`;
}

function providerContactText(provider) {
  const clientName = currentClientName();
  const clientPhone = currentClientPhone();
  return [
    `Bonjour ${provider.fullName}, je vous contacte depuis Zeyds pour votre service : ${provider.service}.`,
    clientName ? `Je m’appelle ${clientName}.` : "",
    clientPhone ? `Mon contact client : ${clientPhone}.` : "",
  ].filter(Boolean).join(" ");
}

function requestUrgencyLabel(value) {
  return {
    today: "aujourd'hui",
    "24h": "dans les 24h",
    week: "cette semaine",
    quote: "pour comparer les prix",
  }[value] || "rapidement";
}

function priorityLabelFromScore(score) {
  const value = Number(score || 0);
  if (value >= 80) return "Urgent";
  if (value >= 60) return "Priorité haute";
  if (value >= 40) return "A suivre";
  return "Normal";
}

function priorityClass(label) {
  const text = String(label || "").toLowerCase();
  if (text.includes("urgent")) return "urgent";
  if (text.includes("haute")) return "high";
  if (text.includes("suivre")) return "watch";
  return "normal";
}

function priorityBadge(label, score = null) {
  const hasScore = score !== null && score !== undefined && Number.isFinite(Number(score)) && Number(score) > 0;
  return `<span class="priority-pill ${priorityClass(label)}">${safe(label || "Normal")}${hasScore ? ` · ${Number(score)}/100` : ""}</span>`;
}

function requestPriorityInfo(request, matches = null) {
  const savedScore = Number(request.priorityScore || request.priority_score || 0);
  const savedLabel = request.priorityLabel || request.priority_label || "";
  if (savedScore > 0 && savedLabel) {
    return {
      score: savedScore,
      label: savedLabel,
      matchCount: Number(request.matchCount ?? request.matched_count ?? (matches ? matches.length : 0)),
      verifiedCount: Number(request.verifiedMatchCount || 0),
    };
  }

  const currentMatches = matches || expressRequestMatches(request);
  const matchCount = currentMatches.length;
  const verifiedCount = currentMatches.filter(isVerified).length;
  const urgencyScore = {
    today: 46,
    "24h": 34,
    week: 16,
    quote: 22,
  }[request.urgency] || 24;
  const lowCoverageBoost = matchCount === 0 ? 34 : matchCount === 1 ? 24 : matchCount <= 2 ? 14 : 0;
  const serviceDemand = state.requests.filter((item) =>
    item.status !== "closed" && item.service === request.service && item.id !== request.id
  ).length + 1;
  const demandBoost = Math.min(16, Math.max(0, serviceDemand - 1) * 4);
  const areaBoost = request.area ? 5 : 0;
  const verificationBoost = matchCount > 0 && verifiedCount === 0 ? 6 : 0;
  const score = Math.max(10, Math.min(100, Math.round(urgencyScore + lowCoverageBoost + demandBoost + areaBoost + verificationBoost)));
  return {
    score,
    label: priorityLabelFromScore(score),
    matchCount,
    verifiedCount,
  };
}

function hydrateRequestPriority(request, matches = null) {
  const priority = requestPriorityInfo(request, matches);
  request.priorityScore = priority.score;
  request.priorityLabel = priority.label;
  request.matchCount = priority.matchCount;
  request.verifiedMatchCount = priority.verifiedCount;
  return priority;
}

function expressRequestMessage(request, provider = null) {
  const intro = provider
    ? `Bonjour ${provider.fullName}, je vous contacte depuis Zeyds.`
    : "Bonjour, je vous contacte depuis Zeyds.";
  const phoneLine = request.phone ? ` Mon contact : ${request.phone}.` : "";
  return `${intro} J'ai besoin d'un service : ${request.service}, ${requestUrgencyLabel(request.urgency)}, zone ${request.area || request.city}. Détail : ${request.message || "besoin à préciser"}.${phoneLine}`;
}

let assistantProviderSelection = null;

function providerCurrentAvailability(provider = {}) {
  const explicit = provider.availableNow ?? provider.isAvailable ?? provider.available_now;
  const status = String(provider.availabilityStatus || provider.availability_status || "").toLowerCase();
  if (explicit === false || ["offline", "unavailable", "busy", "indisponible"].includes(status)) return false;
  return provider.status === "approved" && provider.visibility === "active";
}

function providerAcceptanceRate(provider = {}) {
  const direct = Number(provider.acceptanceRate ?? provider.acceptance_rate);
  if (Number.isFinite(direct) && direct >= 0) return Math.min(1, direct > 1 ? direct / 100 : direct);
  const accepted = Number(provider.acceptedMissions ?? provider.accepted_missions ?? provider.completedMissions ?? provider.completed_missions ?? 0);
  const rejected = Number(provider.rejectedMissions ?? provider.rejected_missions ?? provider.deliveryCancelCount ?? 0);
  return accepted + rejected > 0 ? accepted / (accepted + rejected) : 0.5;
}

function providerServicePrice(provider = {}) {
  const price = Number(provider.servicePrice ?? provider.service_price ?? provider.minPrice ?? provider.min_price ?? provider.hourlyRate ?? provider.hourly_rate);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function providerArrivalEstimate(provider = {}) {
  if (!providerCurrentAvailability(provider)) return "Sur rendez-vous";
  const distance = distanceToProvider(provider);
  if (!Number.isFinite(distance) || distance > 35) return "Zone à confirmer";
  const minutes = Math.max(10, Math.min(120, Math.round((8 + distance * 4) / 5) * 5));
  return `≈ ${minutes} min`;
}

function providerAveragePriceLabel(provider = {}) {
  const price = providerServicePrice(provider);
  return price ? `Dès ${formatMoney(price)}` : "Sur devis";
}

function assistantTrafficMultiplier(date = new Date()) {
  const slot = deliveryTimeSlotFromDate(date).id;
  if (slot === "night") return 0.75;
  if (["morning_peak", "evening_peak"].includes(slot)) return 1.25;
  return 1;
}

function assistantProviderScore(provider, request = {}) {
  if (!providerCurrentAvailability(provider) || !providerOffersService(provider, request.service)) return -1;
  const distance = Math.max(0, Number(request.distanceById?.[provider.id] ?? distanceToProvider(provider, request.origin) ?? 20));
  const effectiveDistance = distance * assistantTrafficMultiplier();
  const distanceScore = Math.max(0, 22 - Math.min(22, effectiveDistance * 1.5));
  const reliabilityScore = providerReliabilityScore(provider) * 0.20;
  const ratingScore = Math.max(0, Math.min(5, Number(provider.rating || 0))) / 5 * 12;
  const acceptanceScore = providerAcceptanceRate(provider) * 12;
  const price = providerServicePrice(provider);
  const priceScore = price === null ? 4 : Math.max(0, 8 - Math.min(8, price / 2500));
  const urgent = ["today", "24h", "now"].includes(request.urgency);
  const emergencyCapable = provider.emergencyAvailable === true || provider.emergency_available === true || providerServiceNames(provider).some(isEmergencyService);
  const emergencyScore = urgent ? (emergencyCapable ? 8 : 0) : 4;
  return Math.round((18 + distanceScore + reliabilityScore + ratingScore + acceptanceScore + priceScore + emergencyScore) * 10) / 10;
}

function rankAssistantProviders(providers = [], request = {}) {
  return providers
    .map((provider) => ({ provider, score: assistantProviderScore(provider, request) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || distanceToProvider(a.provider, request.origin) - distanceToProvider(b.provider, request.origin))
    .slice(0, 3);
}

function expressRequestMatches(request) {
  const cityText = String(request.city || "").trim().toLowerCase();
  const areaText = String(request.area || "").trim().toLowerCase();
  const active = state.providers
    .filter((provider) => provider.status === "approved" && provider.visibility === "active")
    .filter((provider) => providerOffersService(provider, request.service));
  const cityMatches = active.filter((provider) => {
    const providerCity = String(provider.city || "").toLowerCase();
    const providerArea = String(provider.area || "").toLowerCase();
    return !cityText || providerCity.includes(cityText) || cityText.includes(providerCity) || providerArea.includes(cityText) || (areaText && providerArea.includes(areaText));
  });
  const source = cityMatches.length ? cityMatches : active;
  return rankAssistantProviders(source, request).map((item) => item.provider);
}

function normalizeAssistantText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ASSISTANT_STOP_WORDS = new Set(["a", "au", "aux", "avec", "de", "des", "du", "en", "et", "je", "la", "le", "les", "moi", "mon", "pour", "pres", "proche", "recherche", "cherche", "trouve", "un", "une"]);

function assistantWords(value = "") {
  return normalizeAssistantText(value).split(" ").filter((word) => word.length > 2 && !ASSISTANT_STOP_WORDS.has(word));
}

function assistantPhraseIncluded(text = "", phrase = "") {
  const normalizedText = ` ${normalizeAssistantText(text)} `;
  const normalizedPhrase = normalizeAssistantText(phrase);
  return Boolean(normalizedPhrase && normalizedText.includes(` ${normalizedPhrase} `));
}

function assistantWordDistance(left = "", right = "") {
  if (left === right) return 0;
  if (!left || !right) return Math.max(left.length, right.length);
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return previous[right.length];
}

function assistantWordsClose(left = "", right = "") {
  const longest = Math.max(left.length, right.length);
  if (longest < 5) return false;
  const tolerance = longest >= 9 ? 2 : 1;
  return assistantWordDistance(left, right) <= tolerance;
}

function assistantAliasesForService(serviceName = "") {
  const aliases = Object.entries(SERVICE_ALIASES)
    .filter(([, target]) => target === serviceName)
    .map(([alias]) => alias);
  Object.entries(SERVICE_KEY_ALIASES).forEach(([alias, target]) => {
    if (target === serviceName && alias.length >= 5) aliases.push(alias);
  });
  return aliases;
}

function assistantServiceHints() {
  return {
    Plombier: ["fuite", "eau", "robinet", "wc", "toilette", "evier", "canalisation", "plomberie", "tuyau", "lavabo"],
    Electricien: ["courant", "electricite", "ampoule", "prise", "disjoncteur", "cable", "panne electrique", "lumiere"],
    Peintre: ["peinture", "peindre", "mur", "couleur", "repeindre"],
    "Tresse / Coiffure": ["coiffure", "coiffeuse", "coiffeur", "tresse", "natte", "cheveux", "salon"],
    Esthéticienne: ["estheticienne", "estheticien", "esteticienne", "esteticien", "esthetique", "institut de beaute", "soin du visage", "soins du visage", "manucure", "pedicure", "epilation", "ongles", "beaute"],
    Tatouage: ["tatouage", "tatoueur", "tatoueuse", "tattoo", "piercing"],
    Mécanicien: ["voiture", "auto", "moteur", "demarre", "panne", "garage", "mecanique", "moto"],
    "Réparateur téléphone": ["telephone", "portable", "ecran", "iphone", "android", "chargeur"],
    "Réparateur ordinateur / imprimante": ["ordinateur", "pc", "imprimante", "laptop", "macbook"],
    "Installation Wi-Fi / caméra": ["wifi", "camera", "reseau", "internet", "surveillance"],
    "Nettoyage maison / bureau": ["menage", "nettoyage", "bureau", "maison", "nettoyer"],
    "Aide ménage / agence de placement": ["aide menage", "aide au menage", "femme de menage", "menagere", "agence de placement", "personnel de maison", "employe de maison", "employee de maison"],
    "Gardiennage": ["gardien", "securite", "surveillance", "veilleur"],
    "Détective privé(e)": ["detective", "enquete", "surveiller", "filature", "preuve"],
    "Cours à domicile": ["cours", "prof", "professeur", "math", "anglais", "repetition"],
    "Photographe": ["photo", "photographe", "shooting", "mariage", "anniversaire"],
    "Imprimeur": ["imprimeur", "impression", "imprimer", "flyer", "affiche", "carte de visite", "banderole", "bache", "invitation", "document", "photocopie"],
    Restaurants: ["restaurant", "manger", "repas", "dejeuner", "diner"],
    "Vendeur / Vendeuse": ["vendeur", "vendeuse", "commercial", "vente", "boutique", "magasin", "commerce", "caissier", "caissiere", "rayon", "supermarche", "showroom", "conseiller client", "vendeur boutique"],
    "Traiteur / Cuisinier à domicile": ["traiteur", "cuisinier", "cuisine", "buffet", "plat"],
    "Chauffeur": ["chauffeur", "conduire", "course", "transport", "deplacement"],
    "Zeyds Livraison": ["livraison", "livrer", "livreur", "coursier", "colis", "paquet", "course", "recuperer", "deposer", "expedier", "porter", "proche de moi", "pres de moi", "moto", "rapide"],
    "Livreur de gaz en bouteille": ["gaz", "bouteille", "butane"],
    "Transport de colis international": ["colis", "paquet", "bagage", "europe", "france", "paris", "international", "etranger", "agence", "fret", "cargo", "envoyer", "expedier", "livraison europe", "moins cher", "diaspora"],
    Transitaire: ["transitaire", "transit", "douane", "dedouanement", "import", "export", "fret", "formalites", "conteneur", "cargo", "commissionnaire"],
    "Agent immobilier": ["maison", "appartement", "terrain", "louer", "location", "immobilier"],
    "Vendeur de terrains et biens immobiliers": ["terrain", "lot", "parcelle", "maison", "villa", "appartement", "bien immobilier", "acheter", "vente", "vendeur", "immobilier"],
    "Prêt financier": ["pret", "credit", "financement", "argent", "microcredit", "emprunt", "banque", "finance", "capital", "besoin d argent"],
    "Clubs de foot": ["club", "foot", "football", "academie", "centre de formation", "joueur", "entrainement", "recrutement football", "licence", "sport"],
    "Infirmier à domicile": ["infirmier", "injection", "pansement", "soin", "tension"],
    "Ambulance privée": ["ambulance", "urgence medicale", "hopital"],
    "Jardinier / Paysagiste": ["jardin", "pelouse", "plante", "paysagiste"],
    "Serrurier": ["serrure", "cle", "porte", "bloque"],
    "Maquilleuse / Maquilleur": ["maquillage", "makeup", "maquilleuse"],
    "Couturier / Retoucheur": ["couture", "retouche", "robe", "pantalon", "tailleur"],
    "Frigoriste / Climatisation": ["clim", "climatiseur", "frigo", "refrigerateur", "froid"],
    "Désinsectisation / Dératisation": ["cafard", "rat", "souris", "insecte", "deratisation", "desinsectisation"],
  };
}

function inferAssistantService(prompt) {
  const normalized = normalizeAssistantText(prompt);
  const promptWords = assistantWords(normalized);
  const hints = assistantServiceHints();
  const exactService = allServices()
    .filter((service) => assistantPhraseIncluded(normalized, service.name))
    .sort((left, right) => right.name.length - left.name.length)[0];
  if (exactService) return { ...exactService, score: 200, strong: true };
  const estheticIntent = /\b(?:estheti|esteti)[a-z]*\b|\binstitut de beaute\b|\bsoins? du visage\b|\bmanucure\b|\bpedicure\b|\bepilation\b/.test(normalized);
  if (estheticIntent) {
    const estheticService = allServices().find((service) => service.name === "Esthéticienne");
    if (estheticService) return { ...estheticService, score: 100 };
  }
  const candidates = allServices().map((service) => {
    const serviceText = normalizeAssistantText(service.name);
    const serviceWords = assistantWords(serviceText);
    let score = 0;
    let strong = false;
    if (assistantPhraseIncluded(normalized, serviceText)) {
      score += 60;
      strong = true;
    }
    assistantAliasesForService(service.name).forEach((alias) => {
      const normalizedAlias = normalizeAssistantText(alias);
      const exactAlias = assistantPhraseIncluded(normalized, normalizedAlias);
      if (exactAlias) {
        score += 45;
        strong = true;
      }
    });
    let matchedServiceWords = 0;
    serviceWords.forEach((word) => {
      if (promptWords.includes(word)) {
        score += 10;
        matchedServiceWords += 1;
      } else if (promptWords.some((promptWord) => assistantWordsClose(promptWord, word))) {
        score += 6;
        matchedServiceWords += 1;
      }
    });
    (hints[service.name] || []).forEach((hint) => {
      if (assistantPhraseIncluded(normalized, hint)) {
        score += 16 + assistantWords(hint).length * 2;
        strong = true;
      } else {
        const hintWords = assistantWords(hint);
        if (hintWords.length && hintWords.every((hintWord) => promptWords.some((promptWord) => promptWord === hintWord || assistantWordsClose(promptWord, hintWord)))) {
          score += 9 + hintWords.length;
        }
      }
    });
    if (serviceWords.length && matchedServiceWords === serviceWords.length) score += 10;
    return { ...service, score, strong };
  }).sort((a, b) => b.score - a.score || Number(b.strong) - Number(a.strong) || b.name.length - a.name.length);
  const best = candidates[0];
  const second = candidates[1];
  const ambiguous = best && second && !best.strong && !second.strong && best.score - second.score < 3;
  if (!best || best.score < 6 || ambiguous) {
    return { name: "", category: "", score: 0, uncertain: true, suggestions: candidates.filter((item) => item.score > 0).slice(0, 3).map((item) => item.name) };
  }
  return best;
}

globalThis.BizziServiceRecognition = Object.freeze({
  infer: inferAssistantService,
  normalize: normalizeAssistantText,
});

function verifyServiceRecognitionCatalog() {
  const services = allServices();
  const failures = services.filter((service) => inferAssistantService(`je cherche ${service.name}`).name !== service.name);
  const variants = [["plonbier", "Plombier"], ["mecanisien", "Mécanicien"], ["esteticienne", "Esthéticienne"], ["fotographe", "Photographe"], ["jardinnier", "Jardinier / Paysagiste"], ["serurier", "Serrurier"], ["frijoriste", "Frigoriste / Climatisation"], ["ambulence", "Ambulance privée"], ["coiffeuse", "Tresse / Coiffure"], ["netoyage maison", "Nettoyage maison / bureau"], ["reparateur ordinateur", "Réparateur ordinateur / imprimante"], ["wifi camera", "Installation Wi-Fi / caméra"], ["agent immobilier", "Agent immobilier"], ["coach golf", "Coach Golf"]];
  const variantFailures = variants.filter(([spoken, expected]) => inferAssistantService(`je cherche ${spoken}`).name !== expected);
  const falsePositivePrompts = ["escargot", "cargot", "un escargot", "je veux manger des escargots"];
  const falsePositiveFailures = falsePositivePrompts.filter((prompt) => (
    isAssistantInternationalDeliveryIntent(prompt)
    || inferAssistantService(prompt).name === INTERNATIONAL_PARCEL_SERVICE
  ));
  document.documentElement.dataset.serviceRecognitionTotal = String(services.length);
  document.documentElement.dataset.serviceRecognitionFailures = failures.map((service) => service.name).join("|");
  document.documentElement.dataset.serviceRecognitionVariantFailures = variantFailures.map(([spoken, expected]) => `${spoken}:${expected}`).join("|");
  document.documentElement.dataset.serviceRecognitionFalsePositiveFailures = falsePositiveFailures.join("|");
}

function inferAssistantCity(prompt) {
  const normalized = normalizeAssistantText(prompt);
  const cities = NATIONAL_CITIES
    .filter((city) => !["Toute la Côte d'Ivoire", "Autre ville / commune"].includes(city))
    .sort((a, b) => b.length - a.length);
  const match = cities.find((city) => normalized.includes(normalizeAssistantText(city)));
  if (match) return match;
  return currentCity() && currentCity() !== "Autre ville / commune" ? currentCity() : "Toute la Côte d'Ivoire";
}

function inferAssistantUrgency(prompt) {
  const normalized = normalizeAssistantText(prompt);
  if (["urgent", "urgence", "maintenant", "aujourd hui", "ce soir", "vite", "immediat"].some((word) => normalized.includes(word))) return "today";
  if (["demain", "24h", "24 h"].some((word) => normalized.includes(word))) return "24h";
  if (["devis", "prix", "tarif", "combien", "comparer"].some((word) => normalized.includes(word))) return "quote";
  if (["semaine", "week end", "weekend"].some((word) => normalized.includes(word))) return "week";
  return "24h";
}

function isAssistantJobIntent(prompt) {
  return [
    "emploi",
    "travail",
    "job",
    "mission",
    "recrute",
    "recrutement",
    "embauche",
    "cherche un employe",
    "cherche une employee",
    "cherche du personnel",
    "stage",
    "stagiaire",
    "apprenti",
    "apprentissage",
    "offre d emploi",
    "postuler",
    "cv",
  ].some((word) => assistantPhraseIncluded(prompt, word));
}

function isAssistantInternationalDeliveryIntent(prompt) {
  return [
    "international",
    "europe",
    "france",
    "paris",
    "etranger",
    "diaspora",
    "transitaire",
    "transit",
    "douane",
    "dedouanement",
    "fret",
    "cargo",
  ].some((word) => assistantPhraseIncluded(prompt, word));
}

function isAssistantLocalDeliveryIntent(prompt) {
  const deliveryWords = [
    "livraison",
    "livrer",
    "livreur",
    "coursier",
    "colis",
    "paquet",
    "document",
    "deposer",
    "depot",
    "recuperer",
    "ramasser",
    "course",
    "courses",
    "taxi",
    "vtc",
    "moto taxi",
  ];
  const naturalRide = globalThis.BizziAssistantParser?.isRideRequest?.(prompt) === true;
  return (naturalRide || deliveryWords.some((word) => assistantPhraseIncluded(prompt, word)))
    && !isAssistantInternationalDeliveryIntent(prompt);
}

function inferAssistantDeliveryDetails(prompt = "") {
  const parsed = globalThis.BizziAssistantParser?.deliveryDetails?.(prompt, { city: inferAssistantCity(prompt) });
  if (parsed) return parsed;
  const city = inferAssistantCity(prompt);
  const normalized = normalizeAssistantText(prompt);
  const urgency = normalized.includes("maintenant") || normalized.includes("urgent") || normalized.includes("vite")
    ? "now"
    : normalized.includes("demain") || normalized.includes("programmer")
      ? "scheduled"
      : "today";
  return {
    requestType: /\b(taxi|vtc|moto taxi|chauffeur|trajet|une course|ma course|je vais|je veux aller|je dois aller|emmene moi|conduis moi|depose moi|direction)\b/.test(normalized) ? "ride" : "delivery",
    pickup: "",
    dropoff: "",
    city,
    urgency,
    parcel: "Course / colis à préciser",
    notes: String(prompt || "").trim(),
  };
}

function assistantConfidence(service, prompt) {
  const score = Number(service?.score || 0);
  if (score >= 14) return "Très bonne";
  if (score >= 7) return "Bonne";
  if (String(prompt || "").trim().length > 12) return "À confirmer";
  return "Faible";
}

function analyzeAssistantPrompt(prompt, phone = "") {
  const service = inferAssistantService(prompt);
  const city = inferAssistantCity(prompt);
  const urgency = inferAssistantUrgency(prompt);
  const jobIntent = isAssistantJobIntent(prompt);
  const request = {
    id: `assistant-${Date.now()}`,
    clientName: currentClientName(),
    service: service.name,
    city,
    area: city === "Toute la Côte d'Ivoire" ? "" : city,
    urgency,
    message: String(prompt || "").trim(),
    phone: String(phone || "").trim(),
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  const matches = expressRequestMatches(request);
  const jobMatches = jobIntent ? jobsMatching(service.name, city, prompt).slice(0, 5) : [];
  const priority = requestPriorityInfo(request, matches);
  return {
    request,
    matches,
    jobMatches,
    jobIntent,
    priority,
    category: service.category,
    confidence: assistantConfidence(service, prompt),
    suggestions: service.suggestions || [],
  };
}

let globalVoiceSessionActive = false;
let globalVoiceTriggerButton = null;

function setGlobalVoiceSession(active = false, button = null, clearStatus = false) {
  globalVoiceSessionActive = Boolean(active);
  if (button) globalVoiceTriggerButton = button;
  if (globalVoiceTriggerButton) {
    globalVoiceTriggerButton.classList.toggle("is-listening", globalVoiceSessionActive);
    globalVoiceTriggerButton.setAttribute("aria-pressed", String(globalVoiceSessionActive));
  }
  if (!globalVoiceSessionActive && clearStatus) {
    ["#homeVoiceStatus", "#globalVoiceStatus"].forEach((selector) => {
      const status = document.querySelector(selector);
      if (status) status.hidden = true;
    });
  }
  if (!globalVoiceSessionActive) globalVoiceTriggerButton = null;
}

function renderSearchAssistantStatus(message = "") {
  const status = document.querySelector("#searchAssistantStatus");
  if (status) status.innerHTML = message;
  const homeStatus = document.querySelector("#homeVoiceStatus");
  if (homeStatus && globalVoiceSessionActive) {
    homeStatus.hidden = !message;
    homeStatus.innerHTML = message;
  }
  const globalStatus = document.querySelector("#globalVoiceStatus");
  if (globalStatus && globalVoiceSessionActive) {
    globalStatus.hidden = !message;
    globalStatus.innerHTML = message;
  }
}

async function startGlobalVoiceAssistant(button = null) {
  if (!clientIdentityReady()) {
    openClientAccessGate("search", "utiliser Parler à Zeyds dans toute l’application", () => startGlobalVoiceAssistant(button));
    return;
  }
  setGlobalVoiceSession(true, button);
  renderSearchAssistantStatus("<strong>Que cherchez-vous ?</strong><p>Dites par exemple : un taxi, un restaurant, un concert, un emploi, un lieu d’exception ou un plombier.</p>");
  await startSearchVoiceAssistant(null);
}

globalThis.startGlobalVoiceAssistant = startGlobalVoiceAssistant;

function setSearchCity(city = "") {
  if (!city || city === "Autre ville / commune") return;
  const citySelect = document.querySelector("#citySelect");
  const normalizedCity = normalizeAssistantText(city);
  const option = citySelect ? [...citySelect.options].find((item) => normalizeAssistantText(item.value || item.textContent) === normalizedCity) : null;
  if (option) {
    citySelect.value = option.value || option.textContent;
    state.selectedCity = citySelect.value;
  } else if (city && city !== "Toute la Côte d'Ivoire") {
    state.selectedCity = city;
  }
}

function applyAssistantIntentRoute(prompt = "", options = {}) {
  return Boolean(globalThis.BizziAssistantRouter?.route?.(prompt, options));
}

let assistantRouteSearchSession = 0;

function assistantLocalDistanceMap(providers = [], origin = null) {
  if (!origin) return {};
  return Object.fromEntries(providers.map((provider) => [provider.id, distanceToProvider(provider, origin)]));
}

function renderAssistantProviderResultStatus(options = {}) {
  renderSearchAssistantStatus(assistantProviderSelection?.ids?.length
    ? `<strong>${safe(state.selectedService)}</strong>`
    : "");
}

function refreshAssistantProviderSelectionFromDirectory() {
  if (!assistantProviderSelection?.service) return;
  const request = assistantProviderSelection.request || { service: assistantProviderSelection.service, urgency: "24h" };
  const candidates = state.providers
    .filter((provider) => providerMatches(provider, { ignoreLocation: providerDirectoryState.fallbackNationwide }))
    .filter(providerVisibleInClientSearch);
  const distanceById = {
    ...(assistantProviderSelection.distanceById || {}),
    ...assistantLocalDistanceMap(candidates, assistantProviderSelection.origin),
  };
  const ranked = rankAssistantProviders(candidates, { ...request, service: assistantProviderSelection.service, distanceById });
  assistantProviderSelection = {
    ...assistantProviderSelection,
    ids: ranked.map((item) => item.provider.id),
    scores: Object.fromEntries(ranked.map((item) => [item.provider.id, item.score])),
    distanceById,
  };
}

async function refineAssistantRoadDistances(sessionId, providers, request, options = {}) {
  const origin = assistantProviderSelection?.origin;
  if (!origin || origin.source === "gps" || !globalThis.BizziMaps?.hasBackend?.()) return;
  const candidates = [...providers]
    .sort((left, right) => distanceToProvider(left, origin) - distanceToProvider(right, origin))
    .slice(0, 10);
  const results = await Promise.all(candidates.map(async (provider) => {
    try {
      const target = [provider.area, provider.city].filter(Boolean).join(", ");
      const route = await globalThis.BizziMaps.routeDistance(origin.name, target, request.city);
      return route?.distanceKm ? [provider.id, route.distanceKm] : null;
    } catch {
      return null;
    }
  }));
  if (sessionId !== assistantRouteSearchSession || assistantProviderSelection?.service !== request.service) return;
  const verified = results.filter(Boolean);
  if (!verified.length) return;
  const distanceById = { ...(assistantProviderSelection.distanceById || {}), ...Object.fromEntries(verified) };
  const ranked = rankAssistantProviders(providers, { ...request, origin, distanceById });
  assistantProviderSelection = {
    ...assistantProviderSelection,
    ids: ranked.map((item) => item.provider.id),
    scores: Object.fromEntries(ranked.map((item) => [item.provider.id, item.score])),
    distanceById,
    distanceSource: "road_api",
  };
  renderProviders();
  renderAssistantProviderResultStatus(options);
}

function applyAssistantServiceSearch(prompt = "", options = {}) {
  const analysis = analyzeAssistantPrompt(prompt);
  const detectedService = allServices().find((item) => item.name === analysis.request.service);
  const internationalService = allServices().find((item) => item.name === INTERNATIONAL_PARCEL_SERVICE)
    || allServices().find((item) => item.name === TRANSITAIRE_SERVICE);
  const service = isAssistantInternationalDeliveryIntent(prompt) ? internationalService : detectedService;
  if (!service) {
    assistantProviderSelection = null;
    setView("search");
    const suggestions = analysis.suggestions?.length ? `<p>Suggestions possibles : ${safe(analysis.suggestions.join(", "))}.</p>` : "";
    renderSearchAssistantStatus(`<strong>Métier non reconnu avec assez de certitude</strong><p>Reformulez avec le métier précis, par exemple plombier, esthéticienne, mécanicien ou photographe.</p>${suggestions}`);
    return analysis;
  }
  const serviceName = service?.name || analysis.request.service;
  const category = service?.category || analysis.category || localCategoryForService(serviceName) || state.selectedCategory;
  state.selectedService = serviceName;
  state.selectedCategory = category;
  state.selectedRadius = 0;
  state.selectedVerifiedOnly = false;
  if (analysis.request.city && analysis.request.city !== "Toute la Côte d'Ivoire") {
    setSearchCity(analysis.request.city);
  }
  const origin = assistantSearchOrigin(prompt, analysis.request.city);
  const candidates = state.providers.filter(providerMatches).filter(providerVisibleInClientSearch);
  const distanceById = assistantLocalDistanceMap(candidates, origin);
  const rankedCandidates = rankAssistantProviders(
    candidates,
    { ...analysis.request, service: serviceName, origin, distanceById }
  );
  const sessionId = ++assistantRouteSearchSession;
  assistantProviderSelection = {
    service: serviceName,
    request: { ...analysis.request, service: serviceName },
    voice: Boolean(options.voice),
    ids: rankedCandidates.map((item) => item.provider.id),
    scores: Object.fromEntries(rankedCandidates.map((item) => [item.provider.id, item.score])),
    origin,
    distanceById,
    distanceSource: origin ? "local_geo" : "declared",
  };
  const searchInput = document.querySelector("#searchInput");
  if (searchInput) searchInput.value = serviceName;
  const categorySelect = document.querySelector("#categorySelect");
  const radiusSelect = document.querySelector("#radiusSelect");
  const verifiedOnly = document.querySelector("#verifiedOnly");
  if (categorySelect) categorySelect.value = state.selectedCategory;
  if (radiusSelect) radiusSelect.value = "0";
  if (verifiedOnly) verifiedOnly.checked = false;
  saveState();
  renderCategories();
  renderServices();
  renderProviders();
  renderHomeDiscovery();
  renderSavedProviders();
  setView("search");
  renderAssistantProviderResultStatus(options);
  window.setTimeout(() => document.querySelector("#providersList")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  refineAssistantRoadDistances(sessionId, candidates, { ...analysis.request, service: serviceName }, options)
    .catch((error) => captureBizziError(error, { module: "assistant_route_distance" }));
  return analysis;
}

function prefillDeliveryFormFromAssistant(details = {}) {
  const form = document.querySelector("#deliveryRequestForm");
  if (!form) return;
  const setField = (name, value) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field && value) field.value = value;
  };
  const notes = normalizeAssistantText(`${details.notes || ""} ${details.parcel || ""}`);
  const ride = details.requestType === "ride" || ["taxi", "vtc", "moto taxi", "chauffeur", "une course", "ma course", "trajet"].some((word) => notes.includes(word));
  const requestType = form.querySelector("[name='requestType']");
  if (requestType) requestType.value = ride ? "ride" : "delivery";
  const vehicleType = form.querySelector("[name='vehicleType']");
  if (vehicleType && ride) vehicleType.value = notes.includes("moto taxi") ? "moto_taxi" : "taxi";
  updateDeliveryRequestTypeUi();
  setField("pickup", details.pickup);
  setField("dropoff", details.dropoff);
  if (!ride) setField("parcel", details.parcel);
  setField("city", details.city && details.city !== "Toute la Côte d'Ivoire" ? details.city : "");
  setField("notes", details.notes);
  setField("clientName", currentClientName());
  setField("phone", currentClientPhone());
  if (details.useCurrentPickup) {
    const pickupField = form.querySelector("[name='pickup']");
    if (pickupField) pickupField.value = "Ma position actuelle";
    renderDeliveryPickupGeoStatus("Assistant : départ depuis votre position actuelle. Autorisez la position si le téléphone le demande.");
    window.setTimeout(() => {
      useCurrentLocationAsDeliveryPickup(document.querySelector("#deliveryPickupCurrentButton")).catch(() => {
        renderDeliveryPickupGeoStatus("Position non confirmée. Vous pouvez toucher le bouton Départ = ma position actuelle ou saisir le quartier.", false);
      });
    }, 150);
  }
  const urgency = form.querySelector("[name='urgency']");
  if (urgency) urgency.value = details.urgency || "today";
  const distanceInput = document.querySelector("#deliveryDistanceInput");
  if (distanceInput) {
    distanceInput.dataset.manualDistance = "";
    distanceInput.dataset.mapboxKey = "";
    distanceInput.dataset.mapboxStatus = "";
    distanceInput.dataset.mapboxError = "";
  }
  updateDeliveryPricingFromForm();
  renderDeliveryPaymentOptions();
}

function applyAssistantDeliveryPrompt(prompt = "", options = {}) {
  const details = inferAssistantDeliveryDetails(prompt);
  const ride = details.requestType === "ride";
  const requestType = document.querySelector("#deliveryRequestType");
  if (requestType) requestType.value = ride ? "ride" : "delivery";
  state.selectedService = LOCAL_DELIVERY_SERVICE;
  state.selectedDeliveryEntryMode = "request";
  saveState();
  setView("delivery");
  renderDeliveryEntryMode();
  renderDelivery();
  window.setTimeout(() => {
    prefillDeliveryFormFromAssistant(details);
    const missing = [];
    if (!details.pickup) missing.push(ride ? "lieu de départ" : "lieu de récupération");
    if (!details.dropoff) missing.push(ride ? "destination" : "lieu de livraison");
    const detectedJourney = ride ? "Course détectée" : "Livraison détectée";
    const message = missing.length
      ? `${detectedJourney} : ${missing.join(" et ")} à préciser. Le tarif se calculera dès que les deux lieux seront renseignés.`
      : `${detectedJourney} : trajet pré-rempli. Vérifiez le tarif Zeyds puis validez.`;
    renderDeliveryRequestStatus(message);
    renderSearchAssistantStatus(`
      <strong>${options.voice ? `Voix reconnue · ${detectedJourney}` : detectedJourney}</strong>
      <p>${safe(message)}</p>
    `);
    document.querySelector(".delivery-create-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 80);
}

function runSearchAssistant(prompt = "", options = {}) {
  const text = String(prompt || "").trim();
  if (!requireClientPhoneForAccess("lancer la recherche Zeyds")) return;
  if (!text) {
    renderSearchAssistantStatus("<strong>Décrivez votre besoin</strong><p>Exemple : plombier à Cocody, ou livrer un colis de Cocody à Marcory maintenant.</p>");
    return;
  }
  if (globalVoiceSessionActive) setGlobalVoiceSession(false, null, true);
  if (applyAssistantIntentRoute(text, options)) return;
  if (isAssistantLocalDeliveryIntent(text)) {
    applyAssistantDeliveryPrompt(text, options);
    return;
  }
  applyAssistantServiceSearch(text, options);
}

function redirectProviderSearchIntent() {
  const input = document.querySelector("#searchInput");
  const text = String(input?.value || "").trim();
  if (!text) return false;
  const intent = globalThis.BizziAssistantParser?.intent?.(text) || "service";
  if (!["life", "events", "jobs", "delivery", "food", "exception-places"].includes(intent)) return false;
  if (input) input.value = "";
  runSearchAssistant(text);
  return true;
}

function speechRecognitionConstructor() {
  return globalThis.BizziVoice?.recognition?.() || globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition || null;
}

let activeSearchVoiceRecognition = null;
let activeSearchVoiceSession = 0;

function resetSearchVoiceButton(button, label = "Parler") {
  if (button) {
    button.disabled = false;
    button.classList.remove("is-listening");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Démarrer la recherche vocale");
    finishActionButton(button, label);
  }
}

function voiceTranscriptFromEvent(event) {
  const results = Array.from(event?.results || []);
  return results
    .map((result) => globalThis.BizziVoiceLanguage?.best?.(result) || result?.[0]?.transcript || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeVoiceTranscript(text = "") {
  return globalThis.BizziVoiceLanguage?.normalize?.(text) || String(text || "").replace(/\s+/g, " ").trim();
}

function showVoiceTextFallback(input, button, reason = "") {
  button?.classList.add("voice-unavailable");
  button?.classList.add("voice-fallback");
  resetSearchVoiceButton(button, "Dicter");
  const detail = reason ? `<p>${safe(reason)}</p>` : "";
  const fallbackMessage = `<strong>Utilisez le micro du clavier</strong>${detail}<p>Touchez le champ texte, dictez votre phrase avec le clavier du téléphone, puis appuyez sur Trouver.</p>`;
  if (globalVoiceSessionActive) {
    const homeInput = document.querySelector("#homeQuickSearchInput");
    renderSearchAssistantStatus("<strong>Micro vocal indisponible</strong><p>Dictez votre demande dans la recherche Zeyds puis touchez Trouver.</p>");
    homeInput?.focus();
    setGlobalVoiceSession(false);
    return;
  }
  if (globalThis.BizziVoice?.focusTextFallback) {
    globalThis.BizziVoice.focusTextFallback(input, renderSearchAssistantStatus);
  } else {
    input?.focus();
    renderSearchAssistantStatus(fallbackMessage);
  }
  if (reason) renderSearchAssistantStatus(fallbackMessage);
}

async function startBrowserVoiceAssistant(button = null) {
  if (button && !button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim() || "Parler";
  if (activeSearchVoiceRecognition) {
    try {
      activeSearchVoiceRecognition.stop();
    } catch {}
    renderSearchAssistantStatus("<strong>Écoute arrêtée</strong>");
    resetSearchVoiceButton(button);
    activeSearchVoiceRecognition = null;
    activeSearchVoiceSession += 1;
    if (globalVoiceSessionActive) setGlobalVoiceSession(false);
    return;
  }
  const Recognition = speechRecognitionConstructor();
  const input = document.querySelector("#searchAssistantInput");
  if (!Recognition || !input) {
    showVoiceTextFallback(input, button, globalThis.BizziVoice?.message?.("not-supported") || "Reconnaissance vocale indisponible.");
    return;
  }
  const readiness = await globalThis.BizziVoice?.microphoneReadiness?.().catch(() => ({ ready: true, permission: "unknown" }));
  if (readiness?.ready === false) {
    const explanation = readiness.reason === "denied"
      ? "Le micro est bloqué. Ouvrez les réglages du site, autorisez le microphone, puis rechargez Zeyds."
      : "La reconnaissance vocale nécessite l'adresse HTTPS de Zeyds.";
    renderSearchAssistantStatus(`<strong>Micro indisponible</strong><p>${safe(explanation)}</p>`);
    resetSearchVoiceButton(button);
    if (globalVoiceSessionActive) setGlobalVoiceSession(false);
    return;
  }
  const recognition = new Recognition();
  const sessionId = ++activeSearchVoiceSession;
  activeSearchVoiceRecognition = recognition;
  let finalTranscript = "";
  let interimTranscript = "";
  let handled = false;
  let failed = "";
  let voiceTimer = null;
  let silenceTimer = null;
  recognition.lang = "fr-FR";
  recognition.interimResults = true;
  recognition.maxAlternatives = Math.min(5, Math.max(1, Number(bizziConfig.aiVoice?.maxAlternatives || 5)));
  recognition.continuous = false;
  if (button) {
    button.disabled = false;
    button.textContent = "Stop";
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", "Arrêter l'écoute");
  }
  button?.classList.add("is-listening");
  renderSearchAssistantStatus(`<strong>J'écoute...</strong><p>Parlez. ${safe(globalThis.BizziVoice?.warning?.() || "")}</p>`);
  const completeVoice = (rawTranscript = "") => {
    const transcript = normalizeVoiceTranscript(rawTranscript);
    if (!transcript || handled) return false;
    handled = true;
    input.value = transcript;
    renderSearchAssistantStatus(`<strong>Voix reconnue</strong><p>${safe(transcript)}</p>`);
    runSearchAssistant(transcript, { voice: true });
    return true;
  };
  recognition.onresult = (event) => {
    if (sessionId !== activeSearchVoiceSession) return;
    finalTranscript = "";
    interimTranscript = "";
    Array.from(event?.results || []).forEach((result) => {
      const phrase = globalThis.BizziVoiceLanguage?.best?.(result) || result?.[0]?.transcript || "";
      if (result?.isFinal) finalTranscript += ` ${phrase}`;
      else interimTranscript += ` ${phrase}`;
    });
    const transcript = normalizeVoiceTranscript(`${finalTranscript} ${interimTranscript}`);
    if (transcript) {
      input.value = transcript;
      renderSearchAssistantStatus(`<strong>Je vous écoute...</strong><p>${safe(transcript)}</p>`);
      if (silenceTimer) window.clearTimeout(silenceTimer);
      silenceTimer = window.setTimeout(() => {
        if (activeSearchVoiceRecognition === recognition && !handled) {
          try { recognition.stop(); } catch {}
        }
      }, 2200);
    }
    if (finalTranscript.trim()) {
      completeVoice(`${finalTranscript} ${interimTranscript}`);
      try { recognition.stop(); } catch {}
    }
    failed = "";
  };
  recognition.onnomatch = () => {
    failed = "no-speech";
    renderSearchAssistantStatus("<strong>Voix non comprise</strong><p>Réessayez avec une phrase courte : plombier à Cocody, garba à Yopougon, ou livrer un colis de Cocody au Plateau.</p>");
  };
  recognition.onerror = (event) => {
    if (sessionId !== activeSearchVoiceSession) return;
    failed = event?.error || "unknown";
    const capturedTranscript = normalizeVoiceTranscript(`${finalTranscript} ${interimTranscript}`);
    if (capturedTranscript && ["no-speech", "aborted"].includes(failed)) {
      completeVoice(capturedTranscript);
      return;
    }
    const retry = ["no-speech", "network", "aborted"].includes(failed) ? " Touchez Parler pour réessayer." : "";
    renderSearchAssistantStatus(`<strong>Micro non utilisable</strong><p>${safe(globalThis.BizziVoice?.message?.(failed) || "Écrivez.")}${safe(retry)}</p>`);
    resetSearchVoiceButton(button);
    if (globalVoiceSessionActive) setGlobalVoiceSession(false);
  };
  recognition.onend = () => {
    if (sessionId !== activeSearchVoiceSession) return;
    if (voiceTimer) window.clearTimeout(voiceTimer);
    if (silenceTimer) window.clearTimeout(silenceTimer);
    activeSearchVoiceRecognition = null;
    button?.classList.remove("is-listening");
    const capturedTranscript = normalizeVoiceTranscript(`${finalTranscript} ${interimTranscript}`);
    if (!handled && capturedTranscript) {
      completeVoice(capturedTranscript);
      return;
    }
    if (!handled && !failed) renderSearchAssistantStatus("<strong>Écoute terminée</strong><p>Aucune phrase exploitable. Réessayez ou utilisez le micro du clavier.</p>");
    resetSearchVoiceButton(button);
    if (globalVoiceSessionActive) setGlobalVoiceSession(false);
  };
  try {
    recognition.start();
    voiceTimer = window.setTimeout(() => {
      if (!activeSearchVoiceRecognition || handled) return;
      try {
        recognition.stop();
      } catch {}
    }, 15000);
  } catch (error) {
    if (voiceTimer) window.clearTimeout(voiceTimer);
    activeSearchVoiceRecognition = null;
    button?.classList.remove("is-listening");
    renderSearchAssistantStatus(`<strong>Micro bloqué</strong><p>${safe(globalThis.BizziVoice?.message?.(error?.name || "") || "Écrivez.")}</p>`);
    resetSearchVoiceButton(button);
    if (globalVoiceSessionActive) setGlobalVoiceSession(false);
  }
}

async function startSearchVoiceAssistant(button = null) {
  const input = document.querySelector("#searchAssistantInput");
  if (globalThis.BizziAIVoice?.active?.()) {
    globalThis.BizziAIVoice.stop();
    if (button) button.textContent = "Transcription...";
    renderSearchAssistantStatus("<strong>Transcription IA...</strong><p>Zeyds transforme votre voix en texte.</p>");
    if (globalVoiceSessionActive) setGlobalVoiceSession(false);
    return;
  }
  if (!globalThis.BizziAIVoice?.ready?.() || !input) {
    await startBrowserVoiceAssistant(button);
    return;
  }
  if (button) {
    button.textContent = "Stop";
    button.classList.add("is-listening");
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", "Arrêter l'écoute IA");
  }
  renderSearchAssistantStatus("<strong>J'écoute avec l'IA...</strong><p>Parlez naturellement avec votre accent. Zeyds optimise le français d'Afrique, puis touchez Stop ou attendez.</p>");
  try {
    const transcript = await globalThis.BizziAIVoice.start({
      maxMs: 15000,
      onState(stateName) {
        if (stateName === "transcribing") {
          if (button) button.textContent = "Transcription...";
          renderSearchAssistantStatus("<strong>Transcription IA...</strong><p>Analyse de votre message vocal.</p>");
        }
      },
    });
    const normalized = normalizeVoiceTranscript(transcript);
    input.value = normalized;
    resetSearchVoiceButton(button);
    renderSearchAssistantStatus(`<strong>Voix reconnue par l'IA</strong><p>${safe(normalized)}</p>`);
    runSearchAssistant(normalized, { voice: true });
  } catch (error) {
    resetSearchVoiceButton(button);
    const permissionFailure = ["NotAllowedError", "NotFoundError", "NotReadableError", "SecurityError"].includes(error?.name || "");
    const fallbackText = permissionFailure ? "Vérifiez l'autorisation du microphone." : "Passage au micro du navigateur.";
    renderSearchAssistantStatus(`<strong>Transcription IA indisponible</strong><p>${safe(error?.message || "Réessayez.")} ${safe(fallbackText)}</p>`);
    if (!permissionFailure && bizziConfig.aiVoice?.browserFallback !== false) await startBrowserVoiceAssistant(button);
    else if (globalVoiceSessionActive) setGlobalVoiceSession(false);
  }
}

function setupSearchAssistant() {
  const form = document.querySelector("#searchAssistantForm");
  const input = document.querySelector("#searchAssistantInput");
  const nameInput = document.querySelector("#searchClientNameInput");
  const phoneInput = document.querySelector("#searchClientPhoneInput");
  const voiceButton = document.querySelector("#searchVoiceButton");
  if (!form || !input) return;
  globalThis.BizziAIVoice?.probe?.();
  if (nameInput && state.clientName) nameInput.value = state.clientName;
  if (phoneInput && state.clientPhone) phoneInput.value = state.clientPhone;
  nameInput?.addEventListener("input", () => {
    if (isValidClientName(nameInput.value) && isValidContactPhone(phoneInput?.value || state.clientPhone)) {
      rememberClientIdentity(nameInput.value, phoneInput?.value || state.clientPhone);
    }
  });
  phoneInput?.addEventListener("input", () => {
    if (isValidContactPhone(phoneInput.value) && isValidClientName(nameInput?.value || state.clientName)) {
      rememberClientIdentity(nameInput?.value || state.clientName, phoneInput.value);
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireClientPhoneForAccess("lancer la recherche Zeyds")) return;
    runSearchAssistant(input.value);
  });
  if (voiceButton && !speechRecognitionConstructor()) {
    voiceButton.classList.add("voice-unavailable");
    voiceButton.title = "Touchez pour utiliser le micro du clavier si ce navigateur ne supporte pas la reconnaissance vocale.";
  }
  voiceButton?.addEventListener("click", () => startSearchVoiceAssistant(voiceButton));
  renderSearchAssistantStatus();
}

function openHomeQuickSearch(prompt = "") {
  const text = String(prompt || "").trim();
  if (!text) return;
  if (applyAssistantIntentRoute(text, { source: "home" })) return;
  if (isAssistantLocalDeliveryIntent(text)) {
    applyAssistantDeliveryPrompt(text, { source: "home" });
    return;
  }
  const analysis = analyzeAssistantPrompt(text);
  const service = allServices().find((item) => item.name === analysis.request.service);
  assistantProviderSelection = null;
  if (service) {
    state.selectedService = service.name;
    state.selectedCategory = service.category || analysis.category || state.selectedCategory;
    state.selectedVerifiedOnly = false;
    if (analysis.request.city && analysis.request.city !== "Toute la Côte d'Ivoire") {
      setSearchCity(analysis.request.city);
    }
    const searchInput = document.querySelector("#searchInput");
    if (searchInput) searchInput.value = service.name;
  } else {
    const searchInput = document.querySelector("#searchInput");
    if (searchInput) searchInput.value = text;
  }
  saveState();
  renderCategories();
  renderServices();
  renderProviders();
  setView("search");
  if (service) window.setTimeout(() => document.querySelector("#providersList")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  renderSearchAssistantStatus(service
    ? ""
    : "<strong>Précisez le métier</strong><p>Choisissez un service dans la liste ou reformulez votre besoin.</p>");
}

function setupHomeQuickSearch() {
  const form = document.querySelector("#homeQuickSearchForm");
  const input = document.querySelector("#homeQuickSearchInput");
  if (!form || !input) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    openHomeQuickSearch(input.value);
  });
  document.querySelectorAll("[data-home-intent]").forEach((button) => {
    button.addEventListener("click", () => {
      const intent = String(button.dataset.homeIntent || "").trim();
      if (!intent) return;
      input.value = intent;
      if (button.dataset.homeRoute === "events") {
        setEventEntryMode("tickets", { focus: ".events-list-panel" });
        setView("events");
        return;
      }
      if (button.dataset.homeRoute === "drive") {
        const type = document.querySelector("#deliveryRequestType");
        if (type) type.value = "ride";
        setDeliveryEntryMode("request", { focus: ".delivery-create-panel" });
        updateDeliveryRequestTypeUi();
        setView("delivery");
        return;
      }
      if (button.dataset.homeRoute === "delivery") {
        setDeliveryEntryMode("request", { focus: ".delivery-create-panel" });
        setView("delivery");
        return;
      }
      openHomeQuickSearch(intent);
    });
  });
}

function renderExpressRequestResult(request) {
  const status = document.querySelector("#requestStatus");
  const root = document.querySelector("#requestMatches");
  if (!status || !root) return;
  const matches = expressRequestMatches(request);
  const priority = hydrateRequestPriority(request, matches);
  const remoteNote = request.remoteStatus
    ? request.remoteStatus === "open" || request.remoteStatus === "linked"
      ? " Demande sauvegardée en ligne."
      : ` ${request.remoteStatus}`
    : "";
  status.innerHTML = `
    <div class="request-status-head">
      <strong>Demande enregistrée</strong>
      ${priorityBadge(priority.label, priority.score)}
    </div>
    <p>${safe(request.service)} - ${safe(request.city)} - ${safe(requestUrgencyLabel(request.urgency))}. ${matches.length ? `${matches.length} prestataire(s) recommandé(s).` : "Aucun prestataire actif exact pour le moment."}${safe(remoteNote)}</p>
    <p class="request-priority-note">Priorité Zeyds : ${safe(priority.label)} selon l'urgence, la zone et les prestataires disponibles.</p>
  `;
  root.innerHTML = matches.length ? matches.map((provider) => {
    const whatsappUrl = whatsappContactUrl(provider);
    const message = expressRequestMessage(request, provider);
    const requestUrl = whatsappUrl ? `${socialUrl("whatsapp", provider.social?.whatsapp || provider.whatsapp || provider.phone)}?text=${encodeURIComponent(message)}` : "";
    return `
      <article class="request-match">
        ${providerMedia(provider)}
        <div>
          <h3>${safe(provider.fullName)}</h3>
          <p>${safe(providerServicesLabel(provider))} - ${safe(provider.area)}, ${safe(provider.city)}</p>
          <div class="meta">
            ${verificationBadge(provider)}
            <span class="tag">${safe(provider.rating)}/5</span>
            <span class="tag">${safe(distanceLabel(provider))}</span>
          </div>
        </div>
        <div class="request-actions">
          ${requestUrl ? `<a class="primary" href="${safe(requestUrl)}" target="_blank" rel="noreferrer" data-request-whatsapp="${safe(provider.id)}" data-request-id="${safe(request.id)}">Envoyer WhatsApp</a>` : ""}
          <button class="secondary" type="button" data-copy-request-provider="${safe(provider.id)}" data-request-id="${safe(request.id)}">Copier message</button>
          <button class="secondary" type="button" data-open-request-provider="${safe(provider.id)}">Voir profil</button>
        </div>
      </article>
    `;
  }).join("") : `
    <article class="request-match empty">
      <div>
        <h3>Aucun match immédiat</h3>
        <p>La demande est quand même visible dans l'admin. Essayez aussi une ville proche ou une catégorie voisine.</p>
      </div>
    </article>
  `;

  root.querySelectorAll("[data-request-whatsapp]").forEach((link) => {
    link.addEventListener("click", () => {
      const provider = state.providers.find((item) => item.id === link.dataset.requestWhatsapp);
      if (!provider) return;
      recordLead(provider, "whatsapp", `Demande express ${link.dataset.requestId}`);
    });
  });
  root.querySelectorAll("[data-copy-request-provider]").forEach((button) => {
    button.addEventListener("click", async () => {
      const provider = state.providers.find((item) => item.id === button.dataset.copyRequestProvider);
      if (!provider) return;
      if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim();
      const copied = await copyTextToClipboard(expressRequestMessage(request, provider));
      finishActionButton(button, copied ? "Message copié" : "Copie impossible");
    });
  });
  root.querySelectorAll("[data-open-request-provider]").forEach((button) => {
    button.addEventListener("click", () => openProfile(button.dataset.openRequestProvider));
  });
}

function renewalMessage(provider) {
  const endDate = visibilityEndDate(provider);
  const dateLabel = endDate ? new Date(endDate).toLocaleDateString("fr-FR") : "bientôt";
  const status = renewalStatus(provider);
  const statusLine = status === "Expiré"
    ? "Votre visibilité Zeyds est actuellement expirée."
    : `Votre visibilité Zeyds ${status ? status.toLowerCase() : `arrive à échéance le ${dateLabel}`}.`;
  return `Bonjour ${provider.fullName}, ${statusLine} Pour rester visible auprès des clients, vous pouvez renouveler votre abonnement : 1 mois à 3 000 FCFA, 3 mois à 4 500 FCFA ou 6 mois à 6 500 FCFA. Option boost : 1 000 FCFA la semaine ou 2 000 FCFA le mois pour remonter dans les recherches. Répondez à ce message pour recevoir les instructions Wave, Orange Money ou MTN Money.`;
}

function renewalWhatsAppUrl(provider) {
  const baseUrl = socialUrl("whatsapp", provider.social?.whatsapp || provider.whatsapp || provider.phone);
  return baseUrl ? `${baseUrl}?text=${encodeURIComponent(renewalMessage(provider))}` : "";
}

function whatsappContactUrl(provider) {
  const baseUrl = socialUrl("whatsapp", provider.social?.whatsapp || provider.whatsapp || provider.phone);
  if (!baseUrl) return "";
  return `${baseUrl}?text=${encodeURIComponent(providerContactText(provider))}`;
}

function appShareText() {
  const appUrl = officialWebsiteUrl() || location.href.split("#")[0];
  return `Découvre Zeyds : une application pour trouver rapidement un prestataire près de toi en Côte d'Ivoire. ${appUrl}`;
}

function recordLead(provider, action, detail = "") {
  const actionMap = {
    call: "callClicks",
    whatsapp: "whatsappClicks",
    route: "routeClicks",
    share: "shareClicks",
    copy: "copyClicks",
  };
  if (actionMap[action]) {
    provider[actionMap[action]] = Number(provider[actionMap[action]] || 0) + 1;
    provider.contactClicks = Number(provider.contactClicks || 0) + 1;
  }
  if (action === "feedback_positive") provider.positiveFeedback = Number(provider.positiveFeedback || 0) + 1;
  if (action === "feedback_no_answer") provider.noAnswerFeedback = Number(provider.noAnswerFeedback || 0) + 1;
  if (action === "feedback_wrong_number") provider.wrongNumberFeedback = Number(provider.wrongNumberFeedback || 0) + 1;
  state.leads.push({
    id: `lead${Date.now()}${Math.floor(Math.random() * 1000)}`,
    providerId: provider.id,
    providerName: provider.fullName,
    service: provider.service,
    city: provider.city,
    clientName: currentClientName(),
    clientPhone: currentClientPhone(),
    action,
    detail,
    createdAt: new Date().toISOString(),
  });
  saveState();
  renderAdmin();
}

function contactFeedbackLabel(action) {
  const map = {
    feedback_positive: "Merci, contact confirmé.",
    feedback_no_answer: "Merci, retour enregistré.",
    feedback_wrong_number: "Merci, l'admin pourra vérifier ce numéro.",
  };
  return map[action] || "Retour enregistré.";
}

function providerReviews(providerId) {
  return state.reviews
    .filter((review) => review.providerId === providerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function submitReview(provider, rating, message) {
  const value = Math.max(1, Math.min(5, Number(rating) || 5));
  const review = {
    id: `rev${Date.now()}${Math.floor(Math.random() * 1000)}`,
    providerId: provider.id,
    providerName: provider.fullName,
    service: provider.service,
    city: provider.city,
    rating: value,
    message: String(message || "").trim(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  state.reviews.unshift(review);
  const reviews = providerReviews(provider.id);
  provider.reviewCount = reviews.length;
  provider.rating = Math.round((reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length) * 10) / 10;
  saveState();
  return review;
}

function contactActionMessage(provider, action) {
  const phone = provider.phone || "numéro indisponible";
  const messages = {
    call: {
      title: "Appel lancé depuis Zeyds",
      body: `Si rien ne s'ouvre sur cet appareil, composez directement : ${phone}.`,
    },
    whatsapp: {
      title: "WhatsApp ouvert depuis Zeyds",
      body: `Si WhatsApp ne s'ouvre pas, copiez ce numéro : ${provider.whatsapp || phone}.`,
    },
    route: {
      title: "Itinéraire ouvert",
      body: "Si la carte ne s'ouvre pas, vérifiez que votre navigateur autorise l'ouverture d'un nouvel onglet.",
    },
    share: {
      title: "Partage WhatsApp ouvert",
      body: "Si rien ne s'ouvre, utilisez le bouton Copier le contact.",
    },
  };
  return messages[action] || {
    title: "Action enregistrée",
    body: "Zeyds a bien enregistré cette action.",
  };
}

function serviceIcon(service) {
  const map = {
    "Déménageur": "📦",
    Electricien: "💡",
    Peintre: "🎨",
    Plombier: "🔧",
    Vidangeur: "🚛",
    "Ramassage d'ordures": "🗑️",
    "Soudeur / Métallier": "⚙️",
    Menuisier: "🪚",
    "Frigoriste / Climatisation": "❄️",
    Serrurier: "🔑",
    Maçon: "🧱",
    Carreleur: "⬚",
    "Couvreur / Étanchéité": "🏠",
    "Vitrier / Aluminium": "▣",
    "Jardinier / Paysagiste": "🌿",
    "Nettoyage maison / bureau": "🧹",
    "Nettoyage canapé / tapis / matelas": "🫧",
    "Désinsectisation / Dératisation": "🛡️",
    "Technicien électroménager": "🔌",
    "Installateur solaire / groupe électrogène": "☀️",
    "Antenniste / TV satellite": "📡",
    "Architecte / décorateur professionnel": "📐",
    "Aide à domicile": "🏡",
    Nounou: "🍼",
    Gardiennage: "🛡️",
    "Détective privé(e)": "🔎",
    "Coach sportif": "🏋️",
    "Masseur / Masseuse": "🤲",
    Esthéticienne: "💅",
    "Maquilleuse / Maquilleur": "💄",
    "Tresse / Coiffure": "✂️",
    "Couturier / Retoucheur": "🧵",
    Conciergerie: "🛎️",
    "Pressing / Blanchisserie": "👕",
    "Courses / achats à domicile": "🛒",
    "Aide ménage / agence de placement": "🧼",
    Tatouage: "✒️",
    Chauffeur: "🚗",
    "Livreur de gaz en bouteille": "🛢️",
    "Location de véhicules": "🚙",
    Mécanicien: "🔩",
    "Remorquage / Dépannage auto": "🪝",
    "Dépannage moto": "🛵",
    "Vulcanisateur / Pneus": "🛞",
    "Carrossier / Peintre auto": "🚘",
    "Lavage auto / moto": "🧽",
    "Transport de marchandises": "🚚",
    "Zeyds Livraison": "📦",
    "Transport de colis international": "🌍",
    Transitaire: "🛃",
    "Conducteur moto-taxi": "🏍️",
    "Cours à domicile": "📚",
    "Formateur / Coach": "🎓",
    "Secrétaire virtuelle / Assistante administrative": "💼",
    "Traducteur / Interprète": "💬",
    "Formation informatique": "💻",
    Photographe: "📷",
    Imprimeur: "🖨️",
    "Agence événementielle / organisateur événements": "🎟️",
    "Location d'articles d'événements": "🎪",
    "DJ / Animateur": "🎧",
    "Serveur / Serveuse": "🍽️",
    "Barman / Barmaid": "🍹",
    "Designer d'intérieur": "🛋️",
    "Traiteur / Cuisinier à domicile": "🍲",
    "Décorateur événementiel": "🎈",
    "Location sonorisation / lumière": "🔊",
    Fleuriste: "💐",
    "Agent immobilier": "🏘️",
    "Vendeur / Vendeuse": "🛍️",
    "Vendeur de terrains et biens immobiliers": "🏡",
    "Location type Airbnb": "🛏️",
    Hôtels: "🏨",
    Restaurants: "🍴",
    "Prêt financier": "💰",
    "Achat Or et pierre": "💎",
    "Aide démarches administratives": "📄",
    "Comptable / Fiscaliste": "🧾",
    "Juriste / Conseil légal": "⚖️",
    "Courtier assurance": "🛡️",
    "Aide visa / voyage": "✈️",
    "Coach tennis": "🎾",
    "Coach Golf": "⛳",
    "Guide touristique": "🧭",
    "Réparateur téléphone": "📱",
    "Réparateur ordinateur / imprimante": "🖨️",
    "Installation Wi-Fi / caméra": "📶",
    "Assistance informatique": "🖥️",
    "Création site web / design": "🌐",
    "Community manager": "📣",
    "Infirmier à domicile": "🩺",
    "Garde-malade": "🛏️",
    Kinésithérapeute: "♿",
    "Sage-femme": "🤱",
    "Ambulance privée": "🚑",
    "Livraison médicaments": "💊",
    "Technicien pompe / forage": "💧",
    "Réparateur groupe électrogène": "⚡",
    "Tractoriste / Labour": "🚜",
    "Ouvrier agricole": "🌾",
    "Transport de récoltes": "🧺",
    "Vétérinaire / soins animaux": "🐾",
    "Technicien irrigation": "💦",
    "Réparateur chambre froide": "🧊",
    "Clubs de foot": "⚽",
  };
  return map[service] || "✦";
}

function serviceStyle(service) {
  const serviceData = allServices().find((item) => item.name === service);
  const palettes = {
    "Maison & Travaux": ["#08245c", "#ff5148", "#5a321f", "#17100d"],
    "Services à la personne": ["#6d3fd1", "#19b978", "#6b3f28", "#1d130f"],
    "Transports & Logistique": ["#1f4aa8", "#f6b93b", "#4a281a", "#130d0a"],
    "Education & Formation": ["#087a78", "#4f46e5", "#70462f", "#21150f"],
    "Evénementiel": ["#bd2f7c", "#ff7b3f", "#5f3623", "#1a100c"],
    "Commerce & Immobilier": ["#0b5e58", "#f2c14e", "#4f2e20", "#160f0c"],
    "Sports & Loisirs": ["#136f42", "#f6b93b", "#5f3623", "#17100d"],
    "Digital & Dépannage": ["#2541b2", "#21b7d7", "#6b3f28", "#1b120e"],
    "Santé & Assistance": ["#0f766e", "#f05d5e", "#6a3e28", "#1b120f"],
    "Agriculture & Rural": ["#34743b", "#e0a13a", "#5b351f", "#17100d"],
  };
  const [tone, tone2, skin, hair] = palettes[serviceData?.category] || ["#08245c", "#ff5148", "#5a321f", "#17100d"];
  return `--tone:${tone};--tone-2:${tone2};--skin:${skin};--hair:${hair}`;
}

function cityCoordinates(city) {
  const map = {
    Abidjan: { lat: 5.3453, lng: -4.0244 },
    Abobo: { lat: 5.4161, lng: -4.0159 },
    Adjamé: { lat: 5.3651, lng: -4.0236 },
    Anyama: { lat: 5.4946, lng: -4.0518 },
    Bingerville: { lat: 5.3558, lng: -3.8854 },
    Cocody: { lat: 5.3599, lng: -3.9816 },
    Koumassi: { lat: 5.3002, lng: -3.9479 },
    Marcory: { lat: 5.3029, lng: -3.9875 },
    "Port-Bouët": { lat: 5.2618, lng: -3.9262 },
    Treichville: { lat: 5.2937, lng: -4.0039 },
    Yopougon: { lat: 5.3364, lng: -4.0739 },
    Bouaké: { lat: 7.6906, lng: -5.0301 },
    Yamoussoukro: { lat: 6.8276, lng: -5.2893 },
    "San Pedro": { lat: 4.7485, lng: -6.6363 },
    Daloa: { lat: 6.8774, lng: -6.4502 },
    Korhogo: { lat: 9.458, lng: -5.6296 },
    Man: { lat: 7.4125, lng: -7.5538 },
    Gagnoa: { lat: 6.1319, lng: -5.9506 },
    Abengourou: { lat: 6.7297, lng: -3.4964 },
    Divo: { lat: 5.8374, lng: -5.3572 },
    Soubré: { lat: 5.7856, lng: -6.6083 },
    Bondoukou: { lat: 8.0402, lng: -2.8000 },
    Séguéla: { lat: 7.9611, lng: -6.6731 },
    Odienné: { lat: 9.5051, lng: -7.5643 },
    Aboisso: { lat: 5.4678, lng: -3.2071 },
    Agboville: { lat: 5.9280, lng: -4.2132 },
    Adzopé: { lat: 6.1069, lng: -3.8619 },
    Bouaflé: { lat: 6.9904, lng: -5.7442 },
    Issia: { lat: 6.4922, lng: -6.5856 },
    Guiglo: { lat: 6.5437, lng: -7.4935 },
    Duékoué: { lat: 6.7420, lng: -7.3492 },
    Sassandra: { lat: 4.9500, lng: -6.0833 },
    "Grand-Bassam": { lat: 5.2118, lng: -3.7388 },
    Dabou: { lat: 5.3256, lng: -4.3769 },
    Tiassalé: { lat: 5.8984, lng: -4.8229 },
    Toumodi: { lat: 6.5579, lng: -5.0177 },
    Mankono: { lat: 8.0586, lng: -6.1897 },
    Ferkessédougou: { lat: 9.5928, lng: -5.1945 },
    Bouna: { lat: 9.2693, lng: -3.0009 },
    Boundiali: { lat: 9.5217, lng: -6.4869 },
    Katiola: { lat: 8.1373, lng: -5.1009 },
    Dabakala: { lat: 8.3632, lng: -4.4286 },
    Tanda: { lat: 7.8034, lng: -3.1683 },
    Bongouanou: { lat: 6.6518, lng: -4.2040 },
    Daoukro: { lat: 7.0591, lng: -3.9631 },
    Lakota: { lat: 5.8528, lng: -5.6828 },
    Oumé: { lat: 6.3831, lng: -5.4176 },
    Sinfra: { lat: 6.6210, lng: -5.9114 },
    Vavoua: { lat: 7.3819, lng: -6.4778 },
    Zuénoula: { lat: 7.4292, lng: -6.0472 },
    Touba: { lat: 8.2833, lng: -7.6833 },
    Biankouma: { lat: 7.7404, lng: -7.6138 },
    Danané: { lat: 7.2596, lng: -8.1548 },
    Tabou: { lat: 4.4229, lng: -7.3528 },
    Fresco: { lat: 5.1000, lng: -5.5833 },
    Jacqueville: { lat: 5.2050, lng: -4.4146 },
    Tiébissou: { lat: 7.1578, lng: -5.2245 },
    Bocanda: { lat: 7.0626, lng: -4.4995 },
    "M'Bahiakro": { lat: 7.4577, lng: -4.3391 },
  };
  return (DELIVERY_GEO_DATA.cities || {})[city] || map[city] || map.Abidjan;
}

function providerMedia(provider) {
  if (provider.photo) {
    return `<img class="provider-photo" src="${safe(provider.photo)}" alt="Photo de ${safe(provider.fullName)}" loading="lazy" decoding="async">`;
  }
  const service = providerServiceNames(provider)[0] || provider.service || "Service Zeyds";
  const serviceImage = !document.body.classList.contains("data-lite")
    ? globalThis.BizziServiceImages?.url?.(service)
    : "";
  if (serviceImage) {
    return `<div class="provider-photo provider-service-photo" role="img" aria-label="Illustration du métier ${safe(service)}"><img src="${safe(serviceImage)}" alt="" loading="lazy" decoding="async" onerror="this.remove()"><span>${safe(serviceIcon(service))}</span></div>`;
  }
  return `<div class="avatar african-avatar" style="${serviceStyle(provider.service)}" role="img" aria-label="Avatar ${safe(provider.service)}"><span>${safe(serviceIcon(provider.service))}</span></div>`;
}

function distanceBetweenKm(a, b) {
  const earth = 6371;
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function nearestCityFromPoint(point) {
  if (!point) return "";
  const externalCityPoints = Object.entries(DELIVERY_GEO_DATA.cities || {})
    .map(([name, coordinates]) => ({ name, ...coordinates }));
  const cityPoints = [...DELIVERY_LOCATION_POINTS, ...(DELIVERY_GEO_DATA.points || []), ...externalCityPoints]
    .filter((location) => NATIONAL_CITIES.includes(location.name))
    .filter((location, index, list) => list.findIndex((item) => item.name === location.name) === index);
  const nearest = cityPoints
    .map((location) => ({
      city: location.name,
      distance: distanceBetweenKm(point, { lat: location.lat, lng: location.lng }),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
  return nearest?.city || "";
}

function assistantSearchOrigin(prompt = "", city = "") {
  if (state.userLocation) return { ...state.userLocation, name: "Ma position GPS", source: "gps" };
  const spokenPoint = deliveryLocationPoint(prompt, city);
  if (spokenPoint) return { lat: spokenPoint.lat, lng: spokenPoint.lng, name: spokenPoint.name, source: "voice" };
  if (cityIsSpecific(city)) {
    const coordinates = cityCoordinates(city);
    return { ...coordinates, name: city, source: "city" };
  }
  return null;
}

function providerDistancePoint(provider = {}) {
  const precise = ["gps", "exact"].includes(provider.locationPrecision) && Number.isFinite(Number(provider.lat)) && Number.isFinite(Number(provider.lng));
  if (precise) return { lat: Number(provider.lat), lng: Number(provider.lng), name: provider.area || provider.city };
  const areaPoint = deliveryLocationPoint(provider.area || "", "") || deliveryLocationPoint(provider.city || "", "");
  if (areaPoint) return areaPoint;
  if (Number.isFinite(Number(provider.lat)) && Number.isFinite(Number(provider.lng))) {
    return { lat: Number(provider.lat), lng: Number(provider.lng), name: provider.area || provider.city };
  }
  return null;
}

function distanceToProvider(provider, origin = null) {
  const routed = origin ? null : assistantProviderSelection?.distanceById?.[provider.id];
  if (Number.isFinite(Number(routed)) && Number(routed) > 0) return Number(routed);
  const reference = origin || assistantProviderSelection?.origin || state.userLocation;
  const destination = providerDistancePoint(provider);
  if (reference && destination) return estimateDeliveryDistanceBetweenPoints(reference, destination)?.distanceKm || distanceBetweenKm(reference, destination);
  return Number(provider.distanceKm || 20);
}

function distanceLabel(provider) {
  const distance = distanceToProvider(provider);
  if (!Number.isFinite(distance)) return provider.distance || "Distance inconnue";
  return `${distance.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
}

function deliveryCityGroup(city = "") {
  const key = normalizedCatalogKey(city);
  const abidjanGroup = new Set([
    "abidjan",
    "abobo",
    "adjame",
    "anyama",
    "attecoube",
    "bingerville",
    "cocody",
    "koumassi",
    "marcory",
    "port bouet",
    "treichville",
    "yopougon",
    "songon",
  ]);
  if (abidjanGroup.has(key)) return "abidjan";
  return key;
}

function deliverySameCity(request = {}, provider = {}) {
  const requestCity = deliveryCityGroup(request.city || "");
  const providerCity = deliveryCityGroup(provider.city || "");
  if (!requestCity || requestCity === "toute la cote d ivoire" || requestCity === "autre ville commune") return Boolean(providerCity);
  if (!providerCity || providerCity === "toute la cote d ivoire" || providerCity === "autre ville commune") return false;
  return requestCity === providerCity;
}

function deliveryPickupPoint(request = {}) {
  const stored = {
    lat: normalizeCoordinate(request.pickupLatitude ?? request.pickup_latitude),
    lng: normalizeCoordinate(request.pickupLongitude ?? request.pickup_longitude),
  };
  if (Number.isFinite(stored.lat) && Number.isFinite(stored.lng)) return { ...stored, source: "pickup_gps" };
  const detected = deliveryLocationPoint(request.pickup || "", request.city || "");
  if (detected) return { lat: detected.lat, lng: detected.lng, source: "pickup_estimate", name: detected.name };
  const city = request.city && cityIsSpecific(request.city) ? request.city : currentCity();
  const coordinates = cityCoordinates(city);
  return { lat: coordinates.lat, lng: coordinates.lng, source: "city_fallback", name: city };
}

function deliveryCourierLivePoint(provider = null) {
  if (!provider) return null;
  const last = globalThis.BizziLiveLocation?.last?.();
  if (!last) return null;
  const lastProviderId = String(last.provider_id || "");
  const providerIds = [provider.id, provider.remoteId, remoteProviderId(provider)].filter(Boolean).map(String);
  if (!providerIds.includes(lastProviderId)) return null;
  const lat = Number(last.latitude);
  const lng = Number(last.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, source: "courier_live" };
}

function deliveryCourierPoint(provider = null) {
  const livePoint = deliveryCourierLivePoint(provider);
  if (livePoint) return livePoint;
  if (provider && Number.isFinite(Number(provider.lat)) && Number.isFinite(Number(provider.lng))) {
    return { lat: Number(provider.lat), lng: Number(provider.lng), source: "provider_profile" };
  }
  if (provider?.city) {
    const coordinates = cityCoordinates(provider.city);
    return { lat: coordinates.lat, lng: coordinates.lng, source: "provider_city" };
  }
  return null;
}

function deliveryDistanceToPickup(request = {}, provider = null) {
  const pickup = deliveryPickupPoint(request);
  const courier = deliveryCourierPoint(provider);
  if (!pickup || !courier) return Number.POSITIVE_INFINITY;
  return distanceBetweenKm(pickup, courier);
}

function deliveryProviderWithinPickupRadius(request = {}, provider = null) {
  if (!deliverySameCity(request, provider)) return false;
  const radius = normalizeDistanceKm(request.dispatchRadiusKm || request.dispatch_radius_km || DELIVERY_MATCH_RADIUS_KM) || DELIVERY_MATCH_RADIUS_KM;
  return deliveryDistanceToPickup(request, provider) <= radius;
}

function subscriptionLabel(provider) {
  if (provider.visibility === "expired_blurred") return "Abonnement expiré";
  if (provider.subscriptionEndsAt) return `Abonné jusqu'au ${new Date(provider.subscriptionEndsAt).toLocaleDateString("fr-FR")}`;
  if (provider.visibility === "active" && provider.remoteStatus === "linked") return "Profil actif";
  if (!provider.trialEndsAt) return "Profil actif";
  return `Essai gratuit jusqu'au ${new Date(provider.trialEndsAt).toLocaleDateString("fr-FR")}`;
}

function visibilityEndDate(provider) {
  return provider.subscriptionEndsAt || provider.trialEndsAt || null;
}

function daysUntil(dateValue) {
  if (!dateValue) return null;
  return Math.ceil((new Date(dateValue).getTime() - Date.now()) / 86400000);
}

function renewalStatus(provider) {
  const days = daysUntil(visibilityEndDate(provider));
  if (days === null) return "";
  if (provider.visibility === "expired_blurred" || days < 0) return "Expiré";
  if (days === 0) return "Expire aujourd'hui";
  if (days <= 7) return `Renouvellement dans ${days} j`;
  return "";
}

function renewalProviderList() {
  return state.providers
    .filter((provider) => provider.status === "approved")
    .filter((provider) => {
      const days = daysUntil(visibilityEndDate(provider));
      return provider.visibility === "expired_blurred" || (days !== null && days <= 7);
    })
    .sort((a, b) => (daysUntil(visibilityEndDate(a)) ?? 999) - (daysUntil(visibilityEndDate(b)) ?? 999));
}

function approvedRevenueTotal() {
  return state.payments
    .filter((payment) => payment.status === "approved")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

function pendingRevenueTotal() {
  return state.payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

function renewalPotentialTotal() {
  return renewalProviderList().length * PROVIDER_SUBSCRIPTION_PLANS[0].price;
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}

function officialWebsiteUrl() {
  const website = String(bizziConfig.official?.website || "").trim();
  if (hasProductionValue(website)) return safeExternalUrl(website);
  const domain = String(bizziConfig.official?.domain || "").trim();
  return hasProductionValue(domain) ? safeExternalUrl(domain) : "";
}

function officialEmail(key = "contactEmail") {
  return String(bizziConfig.official?.[key] || bizziConfig.official?.contactEmail || "").trim();
}

function paymentInstructionText(method = state.selectedPayment) {
  const account = bizziConfig.payments?.accounts?.[method] || "A renseigner";
  const accountReady = hasProductionValue(account);
  const accountLine = accountReady
    ? `Compte Zeyds ${method} : ${account}.`
    : `Compte Zeyds ${method} : a renseigner avant publication.`;
  return [
    `Paiement Zeyds - ${state.selectedPlan.name}`,
    `Montant : ${selectedProviderPaymentTotal().toLocaleString("fr-FR")} FCFA.`,
    selectedProviderBoost().price ? `Option : ${selectedProviderBoost().name} (+${selectedProviderBoost().price.toLocaleString("fr-FR")} FCFA).` : "Option : sans boost.",
    accountLine,
    "Apres paiement, indiquez la reference de transaction dans Zeyds et ajoutez une preuve si possible.",
  ].join("\n");
}

function topGroup(items, getter) {
  const counts = items.reduce((map, item) => {
    const key = getter(item) || "Non renseigné";
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || ["-", 0];
}

function commercialSummary() {
  const approved = state.providers.filter((provider) => provider.status === "approved");
  const localOnlyProviders = state.providers.filter((provider) => provider.remoteStatus === "local_only" || provider.visibility === "local_pending");
  const active = approved.filter((provider) => provider.visibility === "active");
  const renewals = renewalProviderList();
  const pendingPayments = state.payments.filter((payment) => payment.status === "pending");
  const openRequests = state.requests.filter((request) => request.status !== "closed");
  const priorityRequests = openRequests.filter((request) => requestPriorityInfo(request).score >= 60);
  const [topService, topServiceCount] = topGroup(active, (provider) => provider.service);
  const [topCity, topCityCount] = topGroup(active, (provider) => provider.city);
  return [
    `Bilan Zeyds du ${new Date().toLocaleDateString("fr-FR")}`,
    `Prestataires actifs : ${active.length}/${approved.length}.`,
    `Revenus validés : ${formatMoney(approvedRevenueTotal())}.`,
    `Paiements à valider : ${pendingPayments.length} pour ${formatMoney(pendingRevenueTotal())}.`,
    `Demandes express ouvertes : ${openRequests.length}, dont ${priorityRequests.length} prioritaire(s).`,
    `Relances abonnement : ${renewals.length} prestataire(s), potentiel minimum ${formatMoney(renewalPotentialTotal())}.`,
    `Service le plus actif : ${topService} (${topServiceCount}).`,
    `Ville la plus active : ${topCity} (${topCityCount}).`,
  ].join("\n");
}

function applySubscriptionRules() {
  const now = Date.now();
  let changed = false;
  state.providers.forEach((provider) => {
    if (provider.status !== "approved") return;
    if (provider.remoteStatus === "linked" && provider.visibility === "active" && !provider.subscriptionEndsAt && !provider.trialEndsAt) return;
    const hasActiveSubscription = provider.subscriptionEndsAt && new Date(provider.subscriptionEndsAt).getTime() > now;
    const hasActiveTrial = !provider.subscriptionEndsAt && new Date(provider.trialEndsAt).getTime() > now;
    if (!hasActiveSubscription && !hasActiveTrial && provider.visibility !== "expired_blurred") {
      provider.visibility = "expired_blurred";
      changed = true;
    }
  });
  if (changed) saveState();
}

function planMonths(planName) {
  return providerPlanByName(planName).months;
}

function readPhotoFile(file) {
  return new Promise((resolve) => {
    if (!file || !file.size) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function renderCategories() {
  const categorySelect = document.querySelector("#categorySelect");
  categorySelect.innerHTML = state.categories.map((category) => `<option>${category.name}</option>`).join("");
  categorySelect.value = state.selectedCategory;
  categorySelect.onchange = () => {
    assistantProviderSelection = null;
    state.selectedCategory = categorySelect.value;
    state.selectedService = state.categories.find((category) => category.name === state.selectedCategory).services[0];
    setOpenProviderFilters({ clearSearch: true });
    saveState();
    renderServices();
    renderProviders();
    renderHomeDiscovery();
    renderSavedProviders();
  };

  const providerService = document.querySelector("#providerService");
  providerService.innerHTML = `<option value="">Choisir métier</option>${alphabeticalServices().map((service) => `<option>${safe(service.name)}</option>`).join("")}`;
  providerService.value = "";

  const providerCity = document.querySelector("#providerCity");
  if (providerCity) {
    const cities = NATIONAL_CITIES.filter(cityIsSpecific);
    const preferredCity = cityIsSpecific(state.selectedCity) ? state.selectedCity : "Abidjan";
    providerCity.innerHTML = cities.map((city) => `<option>${safe(city)}</option>`).join("");
    providerCity.value = cities.includes(preferredCity) ? preferredCity : "Abidjan";
  }

  const requestService = document.querySelector("#requestService");
  if (requestService) {
    requestService.innerHTML = `<option value="">Choisir métier</option>${alphabeticalServices().map((service) => `<option>${safe(service.name)}</option>`).join("")}`;
    requestService.value = "";
  }

  const jobOfferService = document.querySelector("#jobOfferService");
  if (jobOfferService) {
    jobOfferService.innerHTML = `<option value="">Choisir métier</option>${alphabeticalServices().map((service) => `<option>${safe(service.name)}</option>`).join("")}`;
    jobOfferService.value = "";
  }

  const jobCompanyType = document.querySelector("#jobCompanyType");
  if (jobCompanyType) {
    const previous = jobCompanyType.value || "Entreprise formelle";
    jobCompanyType.innerHTML = JOB_COMPANY_TYPES.map((type) => `<option>${safe(type)}</option>`).join("");
    jobCompanyType.value = JOB_COMPANY_TYPES.includes(previous) ? previous : "Entreprise formelle";
  }

  const jobServiceFilter = document.querySelector("#jobServiceFilter");
  if (jobServiceFilter) {
    const previous = jobServiceFilter.value || "Tous les métiers";
    jobServiceFilter.innerHTML = `<option>Tous les métiers</option>${alphabeticalServices().map((service) => `<option>${safe(service.name)}</option>`).join("")}`;
    jobServiceFilter.value = [...jobServiceFilter.options].some((option) => option.value === previous) ? previous : "Tous les métiers";
  }

  const jobCityFilter = document.querySelector("#jobCityFilter");
  if (jobCityFilter) {
    const previous = jobCityFilter.value || state.selectedCity || "Toute la Côte d'Ivoire";
    jobCityFilter.innerHTML = NATIONAL_CITIES.map((city) => `<option>${safe(city)}</option>`).join("");
    jobCityFilter.value = [...jobCityFilter.options].some((option) => option.value === previous) ? previous : "Toute la Côte d'Ivoire";
  }

  const eventCategory = document.querySelector("#eventCategory");
  if (eventCategory) {
    eventCategory.innerHTML = EVENT_CATEGORIES.map((category) => `<option>${safe(category)}</option>`).join("");
  }

  const eventCity = document.querySelector("#eventCity");
  if (eventCity) {
    const eventCities = NATIONAL_CITIES.filter(cityIsSpecific);
    eventCity.innerHTML = `<option value="">Choisir ville</option>${eventCities.map((city) => `<option>${safe(city)}</option>`).join("")}`;
    eventCity.value = defaultEventCity();
  }

  const eventCategoryFilter = document.querySelector("#eventCategoryFilter");
  if (eventCategoryFilter) {
    const previous = eventCategoryFilter.value || "Toutes les catégories";
    eventCategoryFilter.innerHTML = `<option>Toutes les catégories</option>${EVENT_CATEGORIES.map((category) => `<option>${safe(category)}</option>`).join("")}`;
    eventCategoryFilter.value = [...eventCategoryFilter.options].some((option) => option.value === previous) ? previous : "Toutes les catégories";
  }

  const eventCityFilter = document.querySelector("#eventCityFilter");
  if (eventCityFilter) {
    const eventCities = NATIONAL_CITIES.filter(cityIsSpecific);
    const previous = eventCityFilter.value || defaultEventCity();
    eventCityFilter.innerHTML = eventCities.map((city) => `<option>${safe(city)}</option>`).join("");
    eventCityFilter.value = [...eventCityFilter.options].some((option) => option.value === previous) ? previous : defaultEventCity();
  }

  const foodCity = document.querySelector("#foodCity");
  if (foodCity) {
    const foodCities = NATIONAL_CITIES.filter(cityIsSpecific);
    foodCity.innerHTML = `<option value="">Choisir ville</option>${foodCities.map((city) => `<option>${safe(city)}</option>`).join("")}`;
    foodCity.value = "";
  }

  const foodCityFilter = document.querySelector("#foodCityFilter");
  if (foodCityFilter) {
    const foodCities = NATIONAL_CITIES.filter(cityIsSpecific);
    const previous = foodCityFilter.value || state.selectedFoodCity || foodDefaultCity();
    foodCityFilter.innerHTML = foodCities.map((city) => `<option>${safe(city)}</option>`).join("");
    foodCityFilter.value = [...foodCityFilter.options].some((option) => option.value === previous) ? previous : foodDefaultCity();
  }

  const foodSpecialtyFilter = document.querySelector("#foodSpecialtyFilter");
  if (foodSpecialtyFilter) {
    const previous = foodSpecialtyFilter.value || state.selectedFoodSpecialty || "Toutes les spécialités";
    foodSpecialtyFilter.innerHTML = `<option>Toutes les spécialités</option>${FOOD_SPECIALTIES.map((specialty) => `<option>${safe(specialty)}</option>`).join("")}`;
    foodSpecialtyFilter.value = [...foodSpecialtyFilter.options].some((option) => option.value === previous) ? previous : "Toutes les spécialités";
  }

  const foodMainSpecialty = document.querySelector("#foodMainSpecialty");
  if (foodMainSpecialty) {
    foodMainSpecialty.innerHTML = FOOD_SPECIALTIES.map((specialty) => `<option>${safe(specialty)}</option>`).join("");
  }

  const foodPlaceType = document.querySelector("#foodPlaceType");
  if (foodPlaceType) {
    foodPlaceType.innerHTML = FOOD_PLACE_TYPES.map((type) => `<option>${safe(type)}</option>`).join("");
  }
}

function renderServices() {
  const grid = document.querySelector("#servicesGrid");
  const category = state.categories.find((item) => item.name === state.selectedCategory)
    || state.categories.find((item) => item.services?.includes(state.selectedService))
    || state.categories[0];
  if (!category) return;
  if (category.name !== state.selectedCategory) {
    state.selectedCategory = category.name;
    const categorySelect = document.querySelector("#categorySelect");
    if (categorySelect) categorySelect.value = category.name;
  }
  const query = document.querySelector("#searchInput").value.trim();
  const normalizedQuery = normalizeAssistantText(query);
  const exactMatch = query ? inferAssistantService(query) : null;
  const serviceSource = query ? allServices().map((service) => service.name) : [...category.services];
  const services = [...new Set(serviceSource)]
    .filter((service) => !query
      || service === exactMatch?.name
      || normalizeAssistantText(service).includes(normalizedQuery)
      || assistantAliasesForService(service).some((alias) => normalizeAssistantText(alias).includes(normalizedQuery)))
    .sort((left, right) => left.localeCompare(right, "fr", { sensitivity: "base", ignorePunctuation: true }));
  if (exactMatch?.name && services.includes(exactMatch.name)) {
    services.splice(services.indexOf(exactMatch.name), 1);
    services.unshift(exactMatch.name);
  }

  grid.innerHTML = services.map((service) => `
    <button class="service-card ${service === state.selectedService ? "active" : ""}" data-service="${safe(service)}">
      <div class="service-art" style="${serviceStyle(service)}"><span>${safe(serviceIcon(service))}</span></div>
      <div class="service-body">
        <strong>${safe(service)}</strong>
      </div>
    </button>
  `).join("");

  grid.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => {
      assistantProviderSelection = null;
      state.selectedService = card.dataset.service;
      setOpenProviderFilters({ clearSearch: true });
      saveState();
      renderServices();
      renderProviders();
      renderHomeDiscovery();
      renderSavedProviders();
      window.setTimeout(() => document.querySelector("#providersList")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    });
  });
}

function selectServiceAndSearch(serviceName, options = {}) {
  const service = allServices().find((item) => item.name === serviceName);
  if (!service) return;
  assistantProviderSelection = null;
  state.selectedCategory = service.category;
  state.selectedService = service.name;
  setOpenProviderFilters({ clearSearch: true });
  const searchInput = document.querySelector("#searchInput");
  if (options.exactOnly && searchInput) searchInput.value = service.name;
  saveState();
  renderCategories();
  renderServices();
  renderProviders();
  setView("search");
}

function selectDeliveryService({ clearSearch = true, resetFilters = false } = {}) {
  const delivery = allServices().find((item) => item.name === "Zeyds Livraison")
    || { name: "Zeyds Livraison", category: "Transports & Logistique" };
  state.selectedCategory = delivery.category;
  state.selectedService = delivery.name;
  if (resetFilters) {
    setOpenProviderFilters({ clearSearch });
  } else {
    const searchInput = document.querySelector("#searchInput");
    if (clearSearch && searchInput) searchInput.value = "";
  }
  saveState();
  const categorySelect = document.querySelector("#categorySelect");
  if (categorySelect) categorySelect.value = state.selectedCategory;
  renderServices();
}

function deliveryRequestIsRide(request = {}) {
  return request.requestType === "ride" || /^course (taxi|moto)/i.test(String(request.parcel || ""));
}

function deliveryProviderSupportsRequest(provider, request = {}) {
  if (providerOffersService(provider, LOCAL_DELIVERY_SERVICE)) return true;
  if (!deliveryRequestIsRide(request)) return false;
  return request.vehicleType === "moto_taxi"
    ? providerOffersService(provider, "Conducteur moto-taxi")
    : providerOffersService(provider, "Chauffeur");
}

function deliveryProviderSupportsAny(provider) {
  return [LOCAL_DELIVERY_SERVICE, "Chauffeur", "Conducteur moto-taxi"].some((service) => providerOffersService(provider, service));
}

function deliveryFormRequestProfile() {
  return {
    requestType: document.querySelector("#deliveryRequestType")?.value || "delivery",
    vehicleType: document.querySelector("#deliveryRequestForm [name='vehicleType']")?.value || "taxi",
  };
}

function deliveryProviderList() {
  const profile = deliveryFormRequestProfile();
  return state.providers
    .filter(providerMatches)
    .filter((provider) => deliveryProviderSupportsRequest(provider, profile))
    .sort((a, b) => distanceToProvider(a) - distanceToProvider(b)
      || Number(providerBoostActive(b)) - Number(providerBoostActive(a))
      || providerReliabilityScore(b) - providerReliabilityScore(a)
      || Number(isVerified(b)) - Number(isVerified(a)));
}

function internationalParcelProviderList() {
  return state.providers
    .filter(providerMatches)
    .filter(isInternationalParcelProvider)
    .sort((a, b) => Number(providerBoostActive(b)) - Number(providerBoostActive(a))
      || providerReliabilityScore(b) - providerReliabilityScore(a)
      || Number(isVerified(b)) - Number(isVerified(a))
      || distanceToProvider(a) - distanceToProvider(b));
}

function deliveryUrgencyLabel(urgency = "today") {
  return {
    now: "Maintenant",
    today: "Aujourd'hui",
    scheduled: "Programmer",
  }[urgency] || "Aujourd'hui";
}

function deliveryRequestMatches(request) {
  const active = state.providers
    .filter((provider) => provider.status === "approved" && provider.visibility === "active")
    .filter((provider) => deliveryProviderSupportsRequest(provider, request));
  return active
    .filter((provider) => deliveryProviderWithinPickupRadius(request, provider))
    .sort((a, b) => deliveryDistanceToPickup(request, a) - deliveryDistanceToPickup(request, b)
      || Number(providerBoostActive(b)) - Number(providerBoostActive(a))
      || providerReliabilityScore(b) - providerReliabilityScore(a)
      || Number(isVerified(b)) - Number(isVerified(a)))
    .slice(0, 8);
}

function deliveryProviderCanAccept(request = {}, provider = null) {
  if (!provider || provider.status !== "approved" || provider.visibility !== "active") return false;
  if (!deliveryProviderSupportsRequest(provider, request)) return false;
  if (!deliveryRequestIsCurrent(request) || request.status !== "open" || request.paymentStatus !== "approved") return false;
  const providerRemoteId = remoteProviderId(provider);
  const acceptedIds = new Set([
    provider.id,
    providerRemoteId,
    providerRemoteId ? `sb-${providerRemoteId}` : "",
  ].filter(Boolean));
  if ((request.matchedProviderIds || []).some((id) => acceptedIds.has(id))) return true;
  if (deliveryProviderWithinPickupRadius(request, provider)) return true;
  return false;
}

function deliveryProviderOwnsRequest(request = {}, provider = null) {
  if (!request || !provider || request.status !== "assigned") return false;
  const providerRemoteId = remoteProviderId(provider);
  return [provider.id, providerRemoteId, providerRemoteId ? `sb-${providerRemoteId}` : ""]
    .filter(Boolean)
    .includes(request.assignedProviderId);
}

function deliveryRequestLine(request) {
  return `${request.pickup} -> ${request.dropoff} | ${request.parcel} | ${formatDistanceKm(request.distanceKm)} | ${deliveryUrgencyLabel(request.urgency)} | ${deliveryScheduledLabel(request.scheduledAt, request.urgency)} | ${formatMoney(request.amount)} | Zeyds ${deliveryCommissionPercent(request.commissionRate)} : ${formatMoney(request.bizziCommission)} | Professionnel : ${formatMoney(request.providerPayout)} | Réf. ${request.paymentReference || "non renseignée"} | Client : ${request.clientName || "non renseigné"} | Contact : ${request.phone || "non renseigné"}`;
}

function deliveryMissionWords(request = {}) {
  const ride = deliveryRequestIsRide(request);
  return ride
    ? { mission: "course", title: request.vehicleType === "moto_taxi" ? "Course moto-taxi" : "Course taxi", provider: "chauffeur", item: `${request.passengerCount || 1} passager${Number(request.passengerCount || 1) > 1 ? "s" : ""}` }
    : { mission: "livraison", title: request.parcel || "Livraison", provider: "livreur", item: request.parcel || "colis non renseigné" };
}

function deliveryPipelineInfo(request = {}) {
  const words = deliveryMissionWords(request);
  if (request.deliveryStage === "delivered") return { label: deliveryRequestIsRide(request) ? "Arrivée" : "Livrée", tone: "ok", step: 5 };
  if (request.status === "cancelled") return { label: "Annulée", tone: "danger", step: 5 };
  if (request.cancellationStatus === "provider_requested") return { label: "Annulation à examiner", tone: "pending", step: 4 };
  if (request.status === "closed") return { label: "Terminée", tone: "ok", step: 5 };
  if (request.status === "assigned") return { label: `Acceptée par un ${words.provider}`, tone: "ok", step: 4 };
  if (request.paymentStatus !== "approved") return { label: "Paiement à confirmer", tone: "pending", step: 1 };
  if (request.dispatchStatus === "matched") return { label: "Professionnels alertés", tone: "ok", step: 3 };
  if (request.dispatchStatus === "dispatching") return { label: `Recherche ${words.provider}`, tone: "pending", step: 3 };
  if (request.dispatchStatus === "manual_review") return { label: `En attente ${words.provider}`, tone: "pending", step: 2 };
  return { label: `Payée / recherche ${words.provider}`, tone: "pending", step: 2 };
}

function deliveryNeedsDispatch(request = {}) {
  return deliveryRequestIsCurrent(request)
    && request.status === "open"
    && request.paymentStatus === "approved"
    && !["matched", "dispatching", "assigned", "completed"].includes(request.dispatchStatus || "");
}

function deliveryDispatchReady(request = {}) {
  return request.status === "assigned"
    || request.status === "closed"
    || ["matched", "dispatching", "completed"].includes(request.dispatchStatus || "");
}

function dispatchDeliveryLocally(request = {}) {
  const matches = deliveryRequestMatches(request);
  const words = deliveryMissionWords(request);
  request.dispatchStatus = matches.length ? "matched" : "dispatching";
  request.matchedProviderIds = matches.map((provider) => provider.id);
  request.dispatchCandidateCount = matches.length;
  request.dispatchedAt = request.dispatchedAt || new Date().toISOString();
  request.dispatchMode = matches.length ? "local_candidates" : "waiting_courier";
  request.lastDispatchMessage = matches.length
    ? `${matches.length} professionnel(s) compatible(s) détecté(s) à moins de ${DELIVERY_MATCH_RADIUS_KM} km du départ.`
    : `${words.title} ouverte : le premier ${words.provider} compatible dans ${DELIVERY_MATCH_RADIUS_KM} km pourra accepter.`;
  saveState();
  return matches.length
    ? `Dispatch local préparé : ${matches.length} professionnel(s) proche(s).`
    : `${words.title} ouverte aux professionnels dans un rayon de ${DELIVERY_MATCH_RADIUS_KM} km.`;
}

function deliveryClientMessage(request = {}) {
  const pipeline = deliveryPipelineInfo(request);
  const words = deliveryMissionWords(request);
  return [
    `Suivi Zeyds ${words.title}`,
    `${deliveryRequestIsRide(request) ? "Passagers" : "Colis"} : ${words.item}.`,
    `Trajet : ${request.pickup || "-"} vers ${request.dropoff || "-"}.`,
    `Statut : ${pipeline.label}.`,
    `Montant : ${formatMoney(request.amount)}. Référence : ${request.paymentReference || "non renseignée"}.`,
    request.status === "assigned"
      ? `${words.provider[0].toUpperCase() + words.provider.slice(1)} attribué : ${request.assignedProviderName || "Zeyds"}${request.assignedProviderPhone ? ` - ${request.assignedProviderPhone}` : ""}.`
      : `Le contact ${words.provider} est communiqué après validation du paiement et attribution.`,
  ].join(" ");
}

function deliveryCourierMessage(request = {}) {
  const words = deliveryMissionWords(request);
  return [
    `Mission Zeyds ${words.title}`,
    `${request.pickup || "-"} vers ${request.dropoff || "-"}.`,
    `${deliveryRequestIsRide(request) ? "Passagers" : "Colis"} : ${words.item}.`,
    `Distance : ${formatDistanceKm(request.distanceKm)}.`,
    `Gain professionnel : ${formatMoney(request.providerPayout)}.`,
    `Date : ${deliveryScheduledLabel(request.scheduledAt, request.urgency)}.`,
    "Acceptez uniquement si vous pouvez réaliser la mission dans les conditions indiquées.",
  ].join(" ");
}

function deliveryStageInfo(request = {}) {
  const stage = request.deliveryStage || (request.status === "assigned" ? "accepted" : "waiting");
  const stages = deliveryRequestIsRide(request)
    ? [{ id: "accepted", label: "Accepté" }, { id: "picked_up", label: "Client à bord" }, { id: "en_route", label: "En route" }, { id: "delivered", label: "Arrivé" }]
    : [{ id: "accepted", label: "Accepté" }, { id: "picked_up", label: "Récupéré" }, { id: "en_route", label: "En route" }, { id: "delivered", label: "Livré" }];
  const index = Math.max(0, stages.findIndex((item) => item.id === stage));
  return { stage, index, stages };
}

function deliveryEtaMinutes(request = {}) {
  if (request.deliveryStage === "delivered") return 0;
  const distance = Math.max(1, Number(request.distanceKm || 1));
  const traffic = assistantTrafficMultiplier(new Date());
  const progress = request.deliveryStage === "en_route" ? 0.55 : request.deliveryStage === "picked_up" ? 0.8 : 1;
  return Math.max(5, Math.round((distance / 25) * 60 * traffic * progress));
}

function deliveryTrackingHtml(request = {}, options = {}) {
  if (!request.assignedProviderId || !["assigned", "closed"].includes(request.status)) return "";
  const info = deliveryStageInfo(request);
  const eta = deliveryEtaMinutes(request);
  const progress = Math.min(100, Math.max(8, ((info.index + 1) / info.stages.length) * 100));
  const supportEmail = officialEmail("supportEmail") || "support@bizzi-africa.com";
  const supportWhatsapp = String(bizziConfig.official?.supportWhatsapp || "").trim();
  const words = deliveryMissionWords(request);
  const ride = deliveryRequestIsRide(request);
  const subject = encodeURIComponent(`SOS ${words.mission} ${request.paymentReference || request.id}`);
  const body = encodeURIComponent(`Bonjour Zeyds, j'ai besoin d'aide pour la ${words.mission} ${request.paymentReference || request.id}.`);
  const supportWhatsappHref = supportWhatsapp
    ? `https://wa.me/${supportWhatsapp.replace(/[^\d]/g, "")}?text=${body}`
    : "";
  return `
    <section class="delivery-tracking" aria-label="Suivi de la ${words.mission}">
      <div class="delivery-tracking-head">
        <strong>Suivi en direct</strong>
        <span class="tag ok">${eta ? `Arrivée estimée ${eta} min` : ride ? "Arrivé" : "Livré"}</span>
      </div>
      <div class="delivery-live-map" role="img" aria-label="Position du livreur sur le trajet">
        <span class="map-route"></span>
        <span class="map-pin pickup">A</span>
        <span class="map-courier" style="left:${progress}%">🛵</span>
        <span class="map-pin dropoff">B</span>
      </div>
      ${request.courierLatitude && request.courierLongitude ? `<p class="sync-status">GPS livreur actualisé${request.courierLocationAt ? ` à ${safe(new Date(request.courierLocationAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }))}` : ""}.</p>` : `<p class="sync-status">Position GPS disponible dès que le livreur active le suivi live.</p>`}
      <div class="delivery-stage-list">
        ${info.stages.map((stage, index) => `<span class="${index <= info.index ? "done" : ""}"><b>${index < info.index ? "✓" : index + 1}</b>${stage.label}</span>`).join("")}
      </div>
      ${!options.providerId && request.proofCode ? `<p class="delivery-proof-code"><strong>${ride ? "Code de fin de course" : "Code de remise"} :</strong> ${safe(request.proofCode)} <small>À communiquer uniquement ${ride ? "à l'arrivée" : "quand le colis est remis"}.</small></p>` : ""}
      ${request.proofPhoto ? `<a class="doc-link" href="${safe(request.proofPhoto)}" target="_blank" rel="noreferrer">Voir la preuve photo</a>` : ""}
      <div class="delivery-tracking-actions">
        <a class="danger" href="mailto:${safe(supportEmail)}?subject=${subject}&body=${body}">SOS Zeyds</a>
        <a class="secondary" href="mailto:${safe(supportEmail)}?subject=${encodeURIComponent(`Support ${words.mission} ${request.paymentReference || request.id}`)}">Contacter le support</a>
        ${supportWhatsapp ? `<a class="secondary" href="${safe(supportWhatsappHref)}" target="_blank" rel="noreferrer">WhatsApp support</a>` : ""}
        ${options.providerId && info.stage === "accepted" ? `<button class="primary" type="button" data-delivery-stage="picked_up" data-delivery-id="${safe(request.id)}">${ride ? "Client à bord" : "Colis récupéré"}</button>` : ""}
        ${options.providerId && info.stage === "picked_up" ? `<button class="primary" type="button" data-delivery-stage="en_route" data-delivery-id="${safe(request.id)}">Je suis en route</button>` : ""}
        ${options.providerId && info.stage === "en_route" ? `<label class="proof-upload">Photo facultative<input type="file" accept="image/*" data-delivery-proof-file="${safe(request.id)}"></label><button class="primary" type="button" data-delivery-stage="delivered" data-delivery-id="${safe(request.id)}">${ride ? "Confirmer l'arrivée" : "Confirmer la livraison"}</button>` : ""}
      </div>
    </section>
  `;
}

function deliveryRequestCard(request, options = {}) {
  const words = deliveryMissionWords(request);
  const ride = deliveryRequestIsRide(request);
  const matches = deliveryRequestMatches(request);
  const assignedProvider = request.assignedProviderId ? state.providers.find((provider) => provider.id === request.assignedProviderId) : null;
  const paymentApproved = request.paymentStatus === "approved";
  const assignedName = request.assignedProviderName || assignedProvider?.fullName || `un ${words.provider} Zeyds`;
  const assignedPhone = request.assignedProviderPhone || assignedProvider?.phone || "";
  const pipeline = deliveryPipelineInfo(request);
  const candidateCount = Number(request.dispatchCandidateCount || matches.length || 0);
  const canAccept = Boolean(options.providerId && request.status === "open" && paymentApproved);
  const cardProvider = options.providerId ? state.providers.find((provider) => provider.id === options.providerId) : null;
  const providerOwnsAssigned = Boolean(cardProvider && deliveryProviderOwnsRequest(request, cardProvider));
  const canClientCancel = Boolean(!options.providerId && !options.admin && ["open", "assigned"].includes(request.status));
  const showFinancialSplit = Boolean(options.admin || options.providerId);
  const cancellationPending = request.cancellationStatus === "provider_requested";
  const pickupDistance = cardProvider ? deliveryDistanceToPickup(request, cardProvider) : null;
  const pickupDistanceLabel = Number.isFinite(pickupDistance)
    ? `${pickupDistance.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km du départ`
    : "";
  const clientWaitingText = paymentApproved
    ? `La commande est payée. Les ${words.provider}s proches peuvent accepter la mission ; le contact sera affiché après attribution.`
    : `Le ${words.provider} ne voit pas encore cette mission. Confirmez le paiement Zeyds pour ouvrir la demande aux professionnels proches.`;
  return `
    <article class="delivery-request-card">
      <div>
        <div class="delivery-card-head">
          <h3>${safe(words.title)}</h3>
          <span class="tag ${pipeline.tone}">${safe(pipeline.label)}</span>
        </div>
        <div class="delivery-pipeline-mini" aria-label="Statut ${safe(words.mission)}">
          ${[1, 2, 3, 4, 5].map((step) => `<span class="${step <= pipeline.step ? "done" : ""}">${step}</span>`).join("")}
        </div>
        <p><strong>Départ :</strong> ${safe(request.pickup)}</p>
        <p><strong>Arrivée :</strong> ${safe(request.dropoff)}</p>
        ${ride ? `<p><strong>Passagers :</strong> ${safe(request.passengerCount || 1)} - ${request.vehicleType === "moto_taxi" ? "moto-taxi" : "taxi / VTC"}</p>` : ""}
        <p>${safe(request.city)} - ${safe(deliveryUrgencyLabel(request.urgency))} - ${safe(deliveryScheduledLabel(request.scheduledAt, request.urgency))}${request.notes ? ` - ${safe(request.notes)}` : ""}</p>
        <p><strong>Tarif calculé :</strong> ${safe(formatDistanceKm(request.distanceKm))} - ${safe(request.pricingBreakdown || deliveryTimeSlotLabel(request.pricingSlot))}.</p>
        <p><strong>Paiement client :</strong> ${safe(formatMoney(request.amount))} - ${safe(paymentMethodLabel(request.paymentMethod))} - ${safe(request.paymentStatus || "pending")}</p>
        ${(options.providerId || options.admin) && request.clientName ? `<p><strong>Client :</strong> ${safe(request.clientName)}</p>` : ""}
        ${showFinancialSplit ? `<p><strong>Répartition :</strong> Zeyds ${safe(formatMoney(request.bizziCommission))} (${safe(deliveryCommissionPercent(request.commissionRate))}) - professionnel ${safe(formatMoney(request.providerPayout))}.</p>` : ""}
        <p>Réf. ${safe(request.paymentReference || "Non renseignée")} ${showFinancialSplit && request.payoutStatus === "payable" ? "- part professionnelle à payer" : ""}</p>
        ${cardProvider && deliveryProviderPenaltyActive(cardProvider) ? `<p class="admin-warning">Commission Zeyds temporaire ${safe(deliveryCommissionPercent(DELIVERY_PENALTY_COMMISSION_RATE))} : ${safe(Number(cardProvider.deliveryPenaltyRemaining || 0))} mission(s) restante(s).</p>` : ""}
        ${canAccept ? `<p class="admin-real-action"><strong>Mission disponible</strong><span>Gain professionnel ${safe(formatMoney(request.providerPayout))}. Après acceptation, la mission est verrouillée.</span></p>` : ""}
        ${pickupDistanceLabel ? `<p><strong>Proximité :</strong> ${safe(pickupDistanceLabel)} - rayon Zeyds ${safe(formatDistanceKm(DELIVERY_MATCH_RADIUS_KM))}.</p>` : ""}
        ${request.dispatchStatus === "manual_review" ? `<p class="admin-warning">Aucun professionnel proche confirmé. La mission reste ouverte dans la ville.</p>` : ""}
        ${request.lastDispatchMessage ? `<p>${safe(request.lastDispatchMessage)}</p>` : ""}
        ${request.cancellationReason ? `<p><strong>Motif annulation client :</strong> ${safe(request.cancellationReason)}</p>` : ""}
        ${request.providerCancelReason ? `<p class="admin-warning"><strong>Signalement professionnel :</strong> ${safe(request.providerCancelReason)}</p>` : ""}
        ${request.status === "assigned" && paymentApproved ? `<p class="admin-real-action"><strong>${safe(words.provider[0].toUpperCase() + words.provider.slice(1))} attribué :</strong><span>${safe(assignedName)}${assignedPhone ? ` - ${safe(assignedPhone)}` : ""}</span></p>` : ""}
        ${request.status !== "assigned" && !options.providerId && !options.admin ? `<p>${safe(clientWaitingText)}</p>` : ""}
        ${deliveryTrackingHtml(request, options)}
        ${(options.providerId || options.admin) ? `<p>${safe(candidateCount)} professionnel(s) compatible(s) ou alerté(s) par Zeyds.</p>` : ""}
        ${request.acceptedAt ? `<p>Acceptée le ${new Date(request.acceptedAt).toLocaleString("fr-FR")}</p>` : ""}
      </div>
      <div class="delivery-card-actions">
        ${canAccept ? `<button class="primary" type="button" data-accept-delivery="${safe(request.id)}" data-provider-id="${safe(options.providerId)}">Accepter cette ${safe(words.mission)}</button>` : ""}
        ${providerOwnsAssigned && !cancellationPending ? `<button class="secondary" type="button" data-provider-cancel-request="${safe(request.id)}" data-provider-id="${safe(options.providerId)}">Signaler un problème</button>` : ""}
        ${providerOwnsAssigned && cancellationPending ? `<span class="tag pending">Signalement envoyé</span>` : ""}
        ${canClientCancel ? `<button class="secondary" type="button" data-client-cancel-delivery="${safe(request.id)}">Annuler avec motif</button>` : ""}
        ${options.providerId && request.status === "open" && !paymentApproved ? `<span class="tag pending">Paiement à valider</span>` : ""}
        ${options.admin && request.paymentStatus !== "approved" && request.status !== "closed" ? `<button class="primary" type="button" data-approve-delivery-payment="${safe(request.id)}">Valider paiement ${safe(words.mission)}</button>` : ""}
        ${options.admin && cancellationPending ? `<button class="secondary" type="button" data-review-provider-cancel="${safe(request.id)}" data-penalty="false">Libérer sans pénalité</button>` : ""}
        ${options.admin && cancellationPending ? `<button class="danger" type="button" data-review-provider-cancel="${safe(request.id)}" data-penalty="true">Pénaliser 18%</button>` : ""}
        ${options.admin && deliveryNeedsDispatch(request) ? `<button class="primary" type="button" data-dispatch-delivery="${safe(request.id)}">Relancer professionnels</button>` : ""}
        ${options.admin && request.status === "open" && paymentApproved && !deliveryNeedsDispatch(request) ? `<button class="secondary" type="button" data-dispatch-delivery="${safe(request.id)}">Relancer la recherche</button>` : ""}
        ${request.status === "open" ? `<button class="secondary" type="button" data-copy-delivery="${safe(request.id)}">Copier détail</button>` : ""}
        ${options.admin ? `<button class="secondary" type="button" data-copy-delivery-client="${safe(request.id)}">Message client</button>` : ""}
        ${options.admin ? `<button class="secondary" type="button" data-copy-delivery-courier="${safe(request.id)}">Message professionnel</button>` : ""}
        ${options.admin && request.status !== "closed" ? `<button class="danger" type="button" data-close-delivery="${safe(request.id)}">Clôturer</button>` : ""}
      </div>
    </article>
  `;
}

function openDeliveryRequests() {
  const clientDigits = normalizeContactDigits(currentClientPhone());
  if (!clientDigits) return [];
  return state.deliveryRequests
    .filter(deliveryRequestIsCurrent)
    .filter((request) => normalizeContactDigits(request.phone) === clientDigits)
    .sort((a, b) => {
      const statusScore = (a.status === "open" ? 0 : 1) - (b.status === "open" ? 0 : 1);
      return statusScore || new Date(b.createdAt) - new Date(a.createdAt);
    });
}

async function requestDeliveryAlertPermission(button = null) {
  const provider = currentPaymentProvider();
  if (globalThis.BizziPushClient?.supported?.() && bizziConfig.notifications?.enabled && bizziConfig.notifications?.vapidPublicKey) {
    try {
      await globalThis.BizziPushClient.subscribe({
        ownerType: "provider",
        providerId: provider?.remoteId || provider?.id || "",
        phone: provider?.phone || "",
      });
      state.deliveryAlertsEnabled = true;
      state.deliveryAlertsEnabledAt = state.deliveryAlertsEnabledAt || new Date().toISOString();
      saveState();
      finishActionButton(button, "Push actif");
      renderProviderDeliveryQueue();
      return true;
    } catch (error) {
      captureBizziError(error, { module: "push-subscribe" });
      renderDeliveryRequestStatus(`Push réel non activé : ${friendlySupabaseError(error)}. Mode alerte locale utilisé si possible.`);
    }
  }
  if (!("Notification" in window)) {
    renderDeliveryRequestStatus("Les notifications locales ne sont pas disponibles sur ce navigateur.");
    return false;
  }
  if (Notification.permission === "granted") {
    state.deliveryAlertsEnabled = true;
    state.deliveryAlertsEnabledAt = state.deliveryAlertsEnabledAt || new Date().toISOString();
    saveState();
    finishActionButton(button, "Alertes actives");
    renderProviderDeliveryQueue();
    return true;
  }
  if (Notification.permission === "denied") {
    renderDeliveryRequestStatus("Notifications bloquées : activez-les dans les réglages du navigateur si vous voulez recevoir les alertes locales.");
    return false;
  }
  const permission = await Notification.requestPermission();
  state.deliveryAlertsEnabled = permission === "granted";
  if (state.deliveryAlertsEnabled) state.deliveryAlertsEnabledAt = new Date().toISOString();
  saveState();
  finishActionButton(button, state.deliveryAlertsEnabled ? "Alertes actives" : "Non activées");
  renderProviderDeliveryQueue();
  return state.deliveryAlertsEnabled;
}

async function startCourierLiveAvailability(button = null) {
  const provider = currentPaymentProvider();
  if (!provider) {
    renderProviderStatus("Sélectionnez d'abord un profil prestataire livreur.");
    finishActionButton(button, "Profil requis");
    return false;
  }
  if (!deliveryProviderSupportsAny(provider)) {
    renderProviderStatus("Ce profil n'est pas configuré pour les livraisons ou courses. Choisissez Zeyds Livraison, Chauffeur ou Conducteur moto-taxi.");
    finishActionButton(button, "Métier requis");
    return false;
  }
  if (!provider.remoteId) {
    renderProviderStatus("Disponibilité live impossible : ce livreur doit d'abord être synchronisé et visible dans Supabase.");
    finishActionButton(button, "Supabase requis");
    return false;
  }
  if (!globalThis.BizziLiveLocation?.canTrack?.()) {
    renderProviderStatus("Géolocalisation live non prête : vérifiez la fonction Supabase location-live et les autorisations GPS du téléphone.");
    finishActionButton(button, "Live non prêt");
    return false;
  }
  setBusyButton(button, true, "Activation live...");
  try {
    const result = globalThis.BizziLiveLocation.start(provider, {
      highAccuracy: true,
      onPosition: (point) => {
        provider.lat = point.lat;
        provider.lng = point.lng;
        state.deliveryRequests
          .filter((request) => request.status === "assigned" && request.assignedProviderId === provider.id)
          .forEach((request) => {
            request.courierLatitude = point.lat;
            request.courierLongitude = point.lng;
            request.courierLocationAt = point.at;
          });
        state.userLocation = { lat: point.lat, lng: point.lng };
        state.deliveryLiveLastStatus = `Position livreur active : Zeyds cherche les demandes à moins de ${DELIVERY_MATCH_RADIUS_KM} km dans ${provider.city || "sa ville"}.`;
        saveState();
        renderDelivery();
        renderProviderDeliveryQueue();
      },
    });
    if (!result?.ok) {
      throw new Error(result?.reason || "live_location_not_started");
    }
    state.deliveryLiveEnabled = true;
    state.deliveryLiveEnabledAt = new Date().toISOString();
    state.deliveryLiveProviderId = provider.id;
    state.deliveryLiveLastStatus = "Position live active. Gardez cette page ouverte pendant la disponibilité.";
    saveState();
    renderProviderStatus(`Disponibilité livreur live activée. Gardez cette page ouverte : Zeyds propose les courses de votre ville dont le départ est à moins de ${DELIVERY_MATCH_RADIUS_KM} km.`);
    renderProviderDeliveryQueue();
    finishActionButton(button, "Live actif");
    return true;
  } catch (error) {
    state.deliveryLiveEnabled = false;
    state.deliveryLiveLastStatus = friendlySupabaseError(error);
    saveState();
    renderProviderStatus(`Disponibilité live impossible : ${friendlySupabaseError(error)}`);
    renderProviderDeliveryQueue();
    finishActionButton(button, "Erreur live");
    return false;
  }
}

async function showLocalDeliveryNotification(request, matches, options = {}) {
  if (!state.deliveryAlertsEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
  const title = options.title || "Nouvelle livraison Zeyds";
  const body = options.body || `${request.pickup} vers ${request.dropoff} - ${matches.length} livreur(s) compatible(s).`;
  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration?.showNotification) {
      await registration.showNotification(title, {
        body,
        icon: "assets/icon-192-v302.png",
        badge: "assets/icon-192-v302.png",
        data: { url: `${location.origin}${location.pathname}#provider`, deliveryId: request.id },
      });
      return;
    }
  } catch {
  }
  try {
    const notification = new Notification(title, { body, icon: "assets/icon-192-v302.png" });
    notification.onclick = () => {
      window.focus();
      setView("provider");
    };
  } catch {
  }
}

function deliveryAlertKey(request) {
  return request.remoteId || request.id;
}

async function notifyProviderDeliveryRequests(requests = []) {
  if (!state.deliveryAlertsEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
  const enabledAt = state.deliveryAlertsEnabledAt ? new Date(state.deliveryAlertsEnabledAt).getTime() : Date.now();
  const notified = new Set(state.notifiedDeliveryRequestIds || []);
  const fresh = requests
    .filter((request) => request.status === "open")
    .filter((request) => new Date(request.createdAt).getTime() >= enabledAt)
    .filter((request) => !notified.has(deliveryAlertKey(request)))
    .slice(0, 3);
  if (!fresh.length) return;
  fresh.forEach((request) => notified.add(deliveryAlertKey(request)));
  state.notifiedDeliveryRequestIds = [...notified].slice(-80);
  saveState();
  for (const request of fresh) {
    await showLocalDeliveryNotification(request, deliveryRequestMatches(request), {
      title: "Livraison proche Zeyds",
      body: `${request.pickup} vers ${request.dropoff} - ${request.parcel}.`,
    });
  }
}

function renderDeliveryRequestStatus(message = "") {
  const status = document.querySelector("#deliveryRequestStatus");
  if (!status) return;
  const currentDeliveries = state.deliveryRequests.filter(deliveryRequestIsCurrent);
  const open = currentDeliveries.filter((request) => request.status === "open").length;
  const assigned = currentDeliveries.filter((request) => request.status === "assigned").length;
  const paidOpen = currentDeliveries.filter((request) => request.status === "open" && request.paymentStatus === "approved").length;
  const pendingPayments = currentDeliveries.filter((request) => request.status === "open" && request.paymentStatus !== "approved").length;
  const provider = currentPaymentProvider();
  const acceptCount = providerDeliveryRequests(provider).length;
  status.innerHTML = `
    ${message ? `<p>${safe(message)}</p>` : `
      <strong>Alertes livraison</strong>
      <p>${open} demande(s) ouverte(s), ${paidOpen} payée(s) visible(s) par les livreurs, ${assigned} acceptée(s), ${pendingPayments} paiement(s) à confirmer.</p>
    `}
    ${acceptCount ? `<button class="primary compact-action" type="button" data-open-courier-accept>Voir ${acceptCount} livraison(s) à accepter</button>` : ""}
  `;
  status.querySelector("[data-open-courier-accept]")?.addEventListener("click", () => {
    setDeliveryEntryMode("courier", { focus: ".delivery-open-panel" });
    renderProviderDeliveryQueue();
  });
}

function bindDeliveryRequestActions(root = document) {
  root.querySelectorAll("[data-copy-delivery]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", async () => {
      const request = state.deliveryRequests.find((item) => item.id === button.dataset.copyDelivery);
      if (!request) return;
      const copied = await copyTextToClipboard(deliveryRequestLine(request));
      finishActionButton(button, copied ? "Détail copié" : "Copie impossible");
    });
  });
  root.querySelectorAll("[data-copy-delivery-client]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", async () => {
      const request = state.deliveryRequests.find((item) => item.id === button.dataset.copyDeliveryClient);
      const copied = request ? await copyTextToClipboard(deliveryClientMessage(request)) : false;
      finishActionButton(button, copied ? "Client copié" : "Copie impossible");
    });
  });
  root.querySelectorAll("[data-copy-delivery-courier]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", async () => {
      const request = state.deliveryRequests.find((item) => item.id === button.dataset.copyDeliveryCourier);
      const copied = request ? await copyTextToClipboard(deliveryCourierMessage(request)) : false;
      finishActionButton(button, copied ? "Livreur copié" : "Copie impossible");
    });
  });
  root.querySelectorAll("[data-accept-delivery]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => acceptDeliveryRequest(button.dataset.acceptDelivery, button.dataset.providerId, button));
  });
  root.querySelectorAll("[data-client-cancel-delivery]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => cancelDeliveryByClient(button.dataset.clientCancelDelivery, button));
  });
  root.querySelectorAll("[data-provider-cancel-request]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => requestProviderDeliveryCancellation(button.dataset.providerCancelRequest, button.dataset.providerId, button));
  });
  root.querySelectorAll("[data-review-provider-cancel]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => reviewProviderDeliveryCancellation(button.dataset.reviewProviderCancel, button.dataset.penalty === "true", button));
  });
  root.querySelectorAll("[data-close-delivery]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => closeDeliveryRequest(button.dataset.closeDelivery, button));
  });
  root.querySelectorAll("[data-approve-delivery-payment]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => approveDeliveryPayment(button.dataset.approveDeliveryPayment, button));
  });
  root.querySelectorAll("[data-dispatch-delivery]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => dispatchDeliveryRequestNow(button.dataset.dispatchDelivery, button));
  });
  root.querySelectorAll("[data-delivery-stage]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", async () => {
      const request = state.deliveryRequests.find((item) => item.id === button.dataset.deliveryId);
      if (!request) return;
      const nextStage = button.dataset.deliveryStage;
      if (nextStage === "delivered") {
        const code = window.prompt("Saisissez le code de remise du client. Si vous joignez une photo, le code reste recommandé.");
        const file = root.querySelector(`[data-delivery-proof-file="${request.id}"]`)?.files?.[0];
        if (String(code || "").trim() !== String(request.proofCode || "").trim() && !file) {
          window.alert("Code incorrect. Ajoutez une photo de remise ou demandez le bon code au client.");
          return;
        }
        if (file) request.proofPhoto = await readPhotoFile(file);
        request.deliveredAt = new Date().toISOString();
        request.dispatchStatus = "completed";
        request.payoutStatus = "payable";
      }
      request.deliveryStage = nextStage;
      if (nextStage === "picked_up") request.pickedUpAt = new Date().toISOString();
      if (nextStage === "en_route") request.enRouteAt = new Date().toISOString();
      saveState();
      if (request.remoteId && supabaseConfigured()) {
        supabaseRequest(`delivery_requests?id=eq.${encodeURIComponent(request.remoteId)}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: {
            delivery_stage: request.deliveryStage,
            picked_up_at: request.pickedUpAt,
            en_route_at: request.enRouteAt,
            delivered_at: request.deliveredAt,
            courier_latitude: request.courierLatitude,
            courier_longitude: request.courierLongitude,
            courier_location_at: request.courierLocationAt,
            dispatch_status: request.dispatchStatus,
            payout_status: request.payoutStatus,
            updated_at: new Date().toISOString(),
          },
        }).catch((error) => captureBizziError(error, { module: "delivery-stage-sync", deliveryId: request.remoteId }));
      }
      renderDelivery();
      renderProviderDeliveryQueue();
      renderAdmin();
    });
  });
}

function renderInternationalParcelProviders() {
  const root = document.querySelector("#internationalParcelProviders");
  if (!root) return;
  const providers = internationalParcelProviderList().slice(0, 4);
  if (!providers.length) {
    root.innerHTML = `
      <article class="provider-card empty">
        <h3>Aucun prestataire international visible</h3>
        <p>Importez le catalogue public Supabase ou créez un prestataire avec le métier ${safe(INTERNATIONAL_PARCEL_SERVICE)} ou ${safe(TRANSITAIRE_SERVICE)}.</p>
        <button class="secondary" type="button" data-open-international-search>Ouvrir la recherche</button>
      </article>
    `;
  } else {
    root.innerHTML = `
      ${providers.map(providerCard).join("")}
      <article class="international-note-card">
        <strong>Tarifs libres</strong>
        <p>Zeyds ne fixe pas le prix d'un envoi international et ne vend pas le transport. Le client contacte le prestataire colis international ou le transitaire pour comparer les solutions.</p>
        <button class="secondary" type="button" data-open-international-search>Voir tous les prestataires</button>
      </article>
    `;
  }
  root.querySelectorAll("[data-open-profile]").forEach((button) => {
    button.addEventListener("click", () => openProfile(button.dataset.openProfile));
  });
  root.querySelector("[data-open-international-search]")?.addEventListener("click", openDeliverySearch);
}

function renderDelivery() {
  renderDeliveryEntryMode();
  renderInternationalParcelProviders();
  const count = document.querySelector("#deliveryCount");
  const nearest = document.querySelector("#deliveryNearest");
  const zone = document.querySelector("#deliveryZone");
  if (!count || !nearest || !zone) return;

  const providers = deliveryProviderList();
  count.textContent = providers.length;
  nearest.textContent = providers[0] ? distanceLabel(providers[0]) : "-";
  zone.textContent = state.userLocation ? "Autour de moi" : currentCity();

  const openRoot = document.querySelector("#deliveryOpenRequests");
  const openCount = document.querySelector("#deliveryOpenCount");
  if (openRoot && openCount) {
	    const requests = openDeliveryRequests();
	    const trackingPanel = openRoot.closest(".delivery-open-panel");
	    if (trackingPanel) trackingPanel.hidden = requests.length === 0;
	    const selectedCourier = currentPaymentProvider();
	    const showCourierActions = state.selectedDeliveryEntryMode === "courier"
	      && selectedCourier
	      && deliveryProviderSupportsAny(selectedCourier);
	    openCount.textContent = `${requests.length} demande${requests.length > 1 ? "s" : ""}`;
	    openRoot.innerHTML = requests.length ? requests.map((request) => {
	      const options = showCourierActions && (deliveryProviderCanAccept(request, selectedCourier) || deliveryProviderOwnsRequest(request, selectedCourier))
	        ? { providerId: selectedCourier.id }
	        : {};
      return deliveryRequestCard(request, options);
    }).join("") : `
      <article class="delivery-request-card empty">
        <h3>Aucune livraison ou course active</h3>
        <p>Créez une nouvelle demande pour rechercher un livreur ou un chauffeur.</p>
      </article>
    `;
    bindDeliveryRequestActions(openRoot);
  }
  renderDeliveryRequestStatus();
}

function providerDeliveryRequests(provider) {
  if (!provider) return [];
  return state.deliveryRequests
    .filter(deliveryRequestIsCurrent)
    .filter((request) => request.status === "open")
    .filter((request) => request.paymentStatus === "approved")
    .filter((request) => deliveryProviderCanAccept(request, provider))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderProviderDeliveryQueue() {
  const root = document.querySelector("#providerDeliveryQueue");
  const count = document.querySelector("#providerDeliveryCount");
  const alertButton = document.querySelector("#enableDeliveryAlerts");
  const liveButton = document.querySelector("#enableCourierLive");
  if (!root || !count) return;
  const provider = currentPaymentProvider();
  const requests = providerDeliveryRequests(provider);
  count.textContent = String(requests.length);
  if (alertButton) {
    alertButton.textContent = state.deliveryAlertsEnabled ? "Alertes locales actives" : "Activer alertes locales";
    alertButton.classList.toggle("primary", Boolean(state.deliveryAlertsEnabled));
  }
  if (liveButton) {
    const liveForProvider = Boolean(state.deliveryLiveEnabled && provider && state.deliveryLiveProviderId === provider.id);
    const canGoLive = Boolean(provider && deliveryProviderSupportsAny(provider) && provider.remoteId);
    liveButton.textContent = liveForProvider ? "Disponibilité live active" : "Activer disponibilité professionnelle";
    liveButton.classList.toggle("primary", liveForProvider);
    liveButton.disabled = Boolean(provider && !canGoLive);
    liveButton.title = canGoLive
      ? `Envoie la position à Zeyds pour recevoir les missions compatibles à moins de ${DELIVERY_MATCH_RADIUS_KM} km.`
      : "Profil de livraison ou transport synchronisé Supabase requis.";
  }
  if (!provider) {
    root.innerHTML = `
      <article class="delivery-request-card empty">
        <h3>Aucun profil prestataire sélectionné</h3>
        <p>Créez ou sélectionnez un prestataire pour voir les missions compatibles.</p>
      </article>
    `;
    return;
  }
  root.innerHTML = requests.length ? requests.map((request) => deliveryRequestCard(request, { providerId: provider.id })).join("") : `
    <article class="delivery-request-card empty">
      <h3>Aucune mission compatible</h3>
      <p>${deliveryProviderSupportsAny(provider) ? "Les nouvelles demandes apparaîtront ici." : "Choisissez un métier de livraison ou de transport de personnes."}</p>
      ${state.deliveryLiveLastStatus ? `<p>${safe(state.deliveryLiveLastStatus)}</p>` : ""}
    </article>
  `;
  bindDeliveryRequestActions(root);
  notifyProviderDeliveryRequests(requests).catch(() => null);
}

function startDeliveryAlertPolling() {
  if (!supabaseConfigured()) return;
  window.setInterval(() => {
    if (!state.deliveryAlertsEnabled || document.visibilityState === "hidden" || !views.provider?.classList.contains("active")) return;
    syncSupabasePublicData(null, { silent: true }).catch(() => null);
  }, 45000);
}

async function approveDeliveryPaymentInSupabase(request) {
  if (!request?.remoteId) return "Validation paiement locale enregistrée.";
  try {
    await supabaseRpc("bizzi_approve_delivery_payment", { p_delivery_id: request.remoteId }, {
      accessToken: adminAuthSession?.accessToken || "",
      timeoutMs: 12000,
    });
  } catch (rpcError) {
    await supabaseRequest(`delivery_requests?id=eq.${encodeURIComponent(request.remoteId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      accessToken: adminAuthSession?.accessToken || "",
      body: {
        payment_status: "approved",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  }
  request.remoteStatus = "linked";
  return "Paiement livraison validé dans Supabase.";
}

async function dispatchDeliveryInBackend(request) {
  if (!request?.remoteId || !bizziConfig.backend?.dispatchEndpoint || !adminAuthSession?.accessToken) {
    return dispatchDeliveryLocally(request);
  }
  try {
    const response = await fetchWithTimeout(bizziConfig.backend.dispatchEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminAuthSession.accessToken}`,
      },
      body: JSON.stringify({
        delivery_id: request.remoteId,
        limit: 5,
      }),
    }, 15000);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || payload.message || `Dispatch ${response.status}`);
    }
    const offers = Number(payload.data?.offers_created || 0);
    request.dispatchStatus = payload.data?.dispatch_status || (offers > 0 ? "matched" : "dispatching");
    request.dispatchCandidateCount = offers;
    request.dispatchMode = "supabase";
    request.dispatchedAt = request.dispatchedAt || new Date().toISOString();
    request.lastDispatchMessage = offers > 0
      ? `${offers} livreur(s) notifié(s) par Supabase.`
      : "Supabase n'a pas encore trouvé de livreur live : la course reste ouverte.";
    saveState();
    return offers > 0
      ? `Dispatch automatique lancé : ${offers} livreur(s) notifié(s).`
      : "Dispatch tenté : la course reste ouverte aux livreurs proches.";
  } catch (error) {
    const localMessage = dispatchDeliveryLocally(request);
    return `${localMessage} Dispatch Supabase non confirmé : ${friendlySupabaseError(error)}.`;
  }
}

async function dispatchDeliveryRequestNow(requestId, button = null) {
  const request = state.deliveryRequests.find((item) => item.id === requestId);
  if (!request) return;
  if (request.paymentStatus !== "approved") {
    finishActionButton(button, "Paiement requis");
    renderDeliveryRequestStatus("Validez d'abord le paiement livraison avant de dispatcher.");
    return;
  }
  setBusyButton(button, true, "Dispatch...");
  const message = await dispatchDeliveryInBackend(request);
  renderDelivery();
  renderProviderDeliveryQueue();
  renderAdmin();
  renderDeliveryRequestStatus(message);
  finishActionButton(button, request.dispatchStatus === "matched" ? "Livreurs alertés" : "Course ouverte");
}

async function autoValidateDeliveryOrder(request) {
  if (!request) return "";
  request.paymentStatus = "approved";
  request.paidAt = request.paidAt || new Date().toISOString();
  request.payoutStatus = request.assignedProviderId ? "payable" : "pending";
  request.autoValidatedAt = request.autoValidatedAt || new Date().toISOString();
  const dispatchMessage = dispatchDeliveryLocally(request);
  let remoteMessage = "";
  if (request.remoteId && supabaseConfigured()) {
    try {
      const result = await supabaseRpc("bizzi_auto_validate_delivery_order", {
        p_delivery_id: request.remoteId,
        p_transaction_reference: request.paymentReference || "",
      }, {
        prefer: "return=representation",
        timeoutMs: 15000,
      });
      const payload = Array.isArray(result) ? result[0] : result;
      const offers = Number(payload?.offers_created || payload?.data?.offers_created || 0);
      if (payload?.dispatch_status || payload?.data?.dispatch_status) {
        request.dispatchStatus = payload.dispatch_status || payload.data.dispatch_status;
      }
      if (offers > 0) {
        request.dispatchStatus = "matched";
        request.dispatchCandidateCount = offers;
        request.dispatchMode = "supabase_auto";
        request.lastDispatchMessage = `${offers} livreur(s) live notifié(s) automatiquement par Zeyds.`;
      }
      remoteMessage = "Validation automatique confirmée dans Supabase.";
    } catch (error) {
      remoteMessage = `Validation locale active ; Supabase se resynchronisera au prochain import. Détail : ${friendlySupabaseError(error)}.`;
    }
  }
  saveState();
  return `Commande livraison validée automatiquement. ${dispatchMessage} ${remoteMessage}`;
}

async function approveDeliveryPayment(requestId, button = null) {
  const request = state.deliveryRequests.find((item) => item.id === requestId);
  if (!request) return;
  setBusyButton(button, true, "Validation...");
  request.paymentStatus = "approved";
  request.paidAt = new Date().toISOString();
  request.payoutStatus = request.assignedProviderId ? "payable" : "pending";
  saveState();
  let remoteMessage = "";
  try {
    remoteMessage = await approveDeliveryPaymentInSupabase(request);
    const dispatchMessage = await dispatchDeliveryInBackend(request);
    remoteMessage = `${remoteMessage} ${dispatchMessage}`;
  } catch (error) {
    request.remoteStatus = `Paiement validé localement : ${friendlySupabaseError(error)}.`;
    remoteMessage = request.remoteStatus;
    saveState();
  }
  renderDelivery();
  renderProviderDeliveryQueue();
  renderAdmin();
  renderDeliveryRequestStatus(`Paiement livraison validé. Les livreurs proches peuvent accepter la mission. ${remoteMessage}`);
  await showLocalDeliveryNotification(request, deliveryRequestMatches(request), {
    title: "Livraison payée Zeyds",
    body: `${request.pickup} vers ${request.dropoff} - livreurs proches alertés.`,
  });
  finishActionButton(button, "Validé");
}

async function acceptDeliveryRequest(requestId, providerId, button = null) {
  const request = state.deliveryRequests.find((item) => item.id === requestId);
  const provider = state.providers.find((item) => item.id === providerId);
  if (!request || !provider || request.status !== "open") return;
  if (request.paymentStatus !== "approved") {
    renderProviderStatus("Cette livraison attend encore la confirmation du paiement client. Elle sera ouverte aux livreurs après confirmation Zeyds.");
    finishActionButton(button, "Paiement en attente");
    return;
  }
  setBusyButton(button, true, "Acceptation...");
  const financials = applyDeliveryCommissionForProvider(request, provider, { consumePenalty: true });
  request.status = "assigned";
  request.assignedProviderId = provider.id;
  request.assignedProviderName = provider.fullName;
  request.assignedProviderPhone = provider.phone;
  request.acceptedAt = new Date().toISOString();
  request.deliveryStage = "accepted";
  request.proofCode = request.proofCode || String(Math.floor(1000 + Math.random() * 9000));
  saveState();
  let remoteMessage = "";
  try {
    remoteMessage = await acceptDeliveryRequestInSupabase(request, provider);
  } catch (error) {
    request.remoteStatus = `Acceptation locale : ${friendlySupabaseError(error)}.`;
    remoteMessage = request.remoteStatus;
    saveState();
  }
  renderDelivery();
  renderProviderDeliveryQueue();
  renderAdmin();
  renderProviderStatus(`Livraison acceptée par ${safe(provider.fullName)}. Mission verrouillée. Commission Zeyds ${safe(deliveryCommissionPercent(financials?.commissionRate))}, gain livreur prévu : ${safe(formatMoney(request.providerPayout))}. Client : ${safe(request.clientName || "non renseigné")}. Contact : ${safe(request.phone || "non renseigné")}. ${safe(remoteMessage)}`);
  finishActionButton(button, "Acceptée");
}

function promptDeliveryClientCancelReason(request) {
  const reason = window.prompt("Motif d'annulation client : attente trop longue, erreur d'adresse, j'ai changé d'avis, livreur injoignable, autre raison.");
  if (!reason || !reason.trim()) return "";
  if (request.phone || request.paymentReference) {
    const check = window.prompt("Pour confirmer, indiquez le téléphone utilisé ou la référence de paiement.");
    const normalizedCheck = normalizeContactDigits(check || "");
    const phoneOk = request.phone && normalizedCheck && normalizeContactDigits(request.phone).endsWith(normalizedCheck.slice(-6));
    const referenceOk = request.paymentReference && String(check || "").trim().toLowerCase() === String(request.paymentReference).trim().toLowerCase();
    if (!phoneOk && !referenceOk) {
      window.alert("Confirmation refusée : téléphone ou référence incorrecte.");
      return "";
    }
  }
  return reason.trim();
}

async function cancelDeliveryByClient(requestId, button = null) {
  const request = state.deliveryRequests.find((item) => item.id === requestId);
  if (!request || !["open", "assigned"].includes(request.status)) return;
  const reason = promptDeliveryClientCancelReason(request);
  if (!reason) return;
  setBusyButton(button, true, "Annulation...");
  request.status = "cancelled";
  request.cancellationStatus = "client_cancelled";
  request.cancellationReason = reason;
  request.cancelledBy = "client";
  request.cancelledAt = new Date().toISOString();
  request.closedAt = request.closedAt || request.cancelledAt;
  request.payoutStatus = "blocked";
  request.dispatchStatus = "expired";
  saveState();
  let remoteMessage = "";
  try {
    remoteMessage = await cancelDeliveryByClientInSupabase(request, reason);
  } catch (error) {
    request.remoteStatus = `Annulation locale : ${friendlySupabaseError(error)}.`;
    remoteMessage = request.remoteStatus;
    saveState();
  }
  renderDelivery();
  renderProviderDeliveryQueue();
  renderAdmin();
  renderDeliveryRequestStatus(`Livraison annulée par le client. Motif : ${reason}. ${remoteMessage}`);
  finishActionButton(button, "Annulée");
}

async function requestProviderDeliveryCancellation(requestId, providerId, button = null) {
  const request = state.deliveryRequests.find((item) => item.id === requestId);
  const provider = state.providers.find((item) => item.id === providerId);
  if (!request || !provider || !deliveryProviderOwnsRequest(request, provider)) return;
  const reason = window.prompt("Expliquez le problème : panne, accident, sécurité, client injoignable, autre urgence.");
  if (!reason || !reason.trim()) return;
  setBusyButton(button, true, "Signalement...");
  request.cancellationStatus = "provider_requested";
  request.providerCancelReason = reason.trim();
  request.providerCancelRequestedAt = new Date().toISOString();
  saveState();
  let remoteMessage = "";
  try {
    remoteMessage = await requestProviderDeliveryCancellationInSupabase(request, provider, reason.trim());
  } catch (error) {
    request.remoteStatus = `Signalement local : ${friendlySupabaseError(error)}.`;
    remoteMessage = request.remoteStatus;
    saveState();
  }
  renderDelivery();
  renderProviderDeliveryQueue();
  renderAdmin();
  renderProviderStatus(`Signalement envoyé à Zeyds. La course reste engagée tant que Zeyds ne l'a pas libérée. ${safe(remoteMessage)}`);
  finishActionButton(button, "Signalé");
}

async function reviewProviderDeliveryCancellation(requestId, penalize = false, button = null) {
  const request = state.deliveryRequests.find((item) => item.id === requestId);
  if (!request || request.cancellationStatus !== "provider_requested") return;
  const provider = state.providers.find((item) => item.id === request.assignedProviderId)
    || state.providers.find((item) => item.remoteId && `sb-${item.remoteId}` === request.assignedProviderId);
  setBusyButton(button, true, penalize ? "Pénalité..." : "Libération...");
  const previousProviderName = request.assignedProviderName;
  if (penalize && provider) {
    applyProviderDeliveryPenalty(provider, request.providerCancelReason);
    request.providerCancelPenaltyAppliedAt = new Date().toISOString();
  }
  request.status = "open";
  request.assignedProviderId = "";
  request.assignedProviderName = "";
  request.assignedProviderPhone = "";
  request.acceptedAt = null;
  request.payoutStatus = "pending";
  request.cancellationStatus = penalize ? "provider_penalized" : "provider_justified";
  request.providerCancelReview = penalize ? "penalty_18" : "justified";
  request.providerCancelReviewedAt = new Date().toISOString();
  request.dispatchStatus = "not_dispatched";
  const reviewMessage = penalize
    ? `${previousProviderName || "Livreur"} libéré avec pénalité : commission Zeyds 18% sur les prochaines courses.`
    : `${previousProviderName || "Livreur"} libéré sans pénalité après examen Zeyds.`;
  request.lastDispatchMessage = reviewMessage;
  const dispatchMessage = dispatchDeliveryLocally(request);
  let remoteMessage = "";
  try {
    remoteMessage = await reviewProviderDeliveryCancellationInSupabase(request, penalize);
  } catch (error) {
    request.remoteStatus = `Revue locale : ${friendlySupabaseError(error)}.`;
    remoteMessage = request.remoteStatus;
    saveState();
  }
  saveState();
  renderDelivery();
  renderProviderDeliveryQueue();
  renderAdmin();
  renderDeliveryRequestStatus(`${reviewMessage} ${dispatchMessage} ${remoteMessage}`);
  finishActionButton(button, penalize ? "Pénalisé" : "Libéré");
}

async function closeDeliveryRequest(requestId, button = null) {
  const request = state.deliveryRequests.find((item) => item.id === requestId);
  if (!request) return;
  setBusyButton(button, true, "Clôture...");
  request.status = "closed";
  request.closedAt = new Date().toISOString();
  if (request.paymentStatus === "approved" && request.assignedProviderId) {
    request.payoutStatus = "payable";
  }
  saveState();
  try {
    await closeDeliveryRequestInSupabase(request);
  } catch (error) {
    request.remoteStatus = `Clôture locale : ${friendlySupabaseError(error)}.`;
    saveState();
  }
  renderDelivery();
  renderProviderDeliveryQueue();
  renderAdmin();
  finishActionButton(button, "Clôturée");
}

function openDeliverySearch() {
  selectServiceAndSearch(INTERNATIONAL_PARCEL_SERVICE);
}

function prefillDeliveryRequest() {
  state.selectedService = LOCAL_DELIVERY_SERVICE;
  state.selectedDeliveryEntryMode = "request";
  saveState();
  setView("delivery");
  renderDeliveryEntryMode();
  window.setTimeout(() => {
    const form = document.querySelector("#deliveryRequestForm");
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
    form?.querySelector("input[name='pickup']")?.focus();
  }, 80);
}

function renderHomeDiscovery() {
  applyEventExpirationRules();
  applyExceptionPlaceExpirationRules();
  const foodRoot = document.querySelector("#featuredFood");
  const boostedEventsRoot = document.querySelector("#boostedHomeEvents");
  const exceptionPlacesRoot = document.querySelector("#featuredExceptionPlaces");
  if (!foodRoot || !boostedEventsRoot || !exceptionPlacesRoot) return;

  const audienceCity = document.querySelector("#eventCityFilter")?.value || defaultEventCity();
  const audienceEvents = eventPromotionsMatching("", audienceCity, "");
  const boostedEvents = audienceEvents.filter(eventBoostActive).slice(0, 3);
  boostedEventsRoot.innerHTML = Array.from({ length: 3 }, (_, index) => {
    const event = boostedEvents[index];
    if (!event) return `
      <article class="boosted-event-card boosted-event-slot-empty">
        <span class="boosted-event-rank">0${index + 1}</span>
        <div><strong>Emplacement boost disponible</strong><p>Un événement validé avec un boost actif apparaîtra ici.</p></div>
      </article>
    `;
    const ticketWhatsAppUrl = eventWhatsAppUrl(event);
    return `
      <article class="boosted-event-card">
        ${eventPosterHtml(event)}
        <span class="boosted-event-rank">0${index + 1}</span>
        <div class="boosted-event-copy">
          <strong>${safe(event.title)}</strong>
          <p>${safe(eventDateLabel(event))}</p>
          <small>${safe(event.venue || event.area || event.city)}</small>
        </div>
        ${ticketWhatsAppUrl
          ? `<a class="premium-outline-action" href="${safe(ticketWhatsAppUrl)}" target="_blank" rel="noreferrer" data-event-track="${safe(event.id)}" data-event-track-kind="contact">Acheter un billet</a>`
          : `<button class="premium-outline-action" type="button" data-boosted-home-event="${safe(event.id)}">Acheter un billet</button>`}
      </article>
    `;
  }).join("");

  const exceptionPlaces = rankedExceptionPlaces(10);
  exceptionPlacesRoot.innerHTML = exceptionPlaces.length
    ? exceptionPlaces.map(exceptionPlaceCardHtml).join("")
    : `<article class="boosted-event-card boosted-event-slot-empty"><div><strong>Emplacement disponible</strong><p>Inscrivez gratuitement un lieu d’exception pendant un mois.</p></div><button class="premium-outline-action" type="button" data-go="exception-places">Inscrire un lieu</button></article>`;

  const homeFood = topMonthlyFoodPlaces(foodDefaultCity(), 3);
  foodRoot.innerHTML = homeFood.length ? homeFood.map((place, index) => `
    <article class="exception-place-card monthly-food-card">
      <span class="exception-place-rank">0${index + 1}</span>
      <div class="exception-place-visual monthly-food-visual">${foodPlaceArt(place)}</div>
      <div class="exception-place-copy">
        <span class="tag ok">${safe(place.area || place.city)}</span>
        <h3>${safe(place.name)}</h3>
        <p>${safe(place.mainSpecialty)}</p>
        <div class="meta">
          <span class="tag monthly-clicks">${monthlyFoodClickCount(place)} consultation${monthlyFoodClickCount(place) > 1 ? "s" : ""} ce mois</span>
          ${place.verificationStatus === "verified" ? `<span class="tag ok">Vérifiée</span>` : `<span class="tag">${safe(place.placeType)}</span>`}
          ${place.deliveryAvailable ? `<span class="tag ok">Livraison</span>` : ""}
        </div>
      </div>
      <a class="booking-action" href="${safe(foodWhatsAppUrl(place))}" target="_blank" rel="noreferrer" data-home-food-reservation="${safe(place.id)}">Réserver</a>
    </article>
  `).join("") : `
    <article class="featured-card empty">
      <div>
        <h3>Aucune adresse Food</h3>
        <p>Proposez une bonne adresse dans votre ville.</p>
      </div>
      <button class="secondary" data-go="food">Ouvrir Food</button>
    </article>
  `;
  foodRoot.querySelectorAll("[data-home-food-reservation]").forEach((link) => {
    link.addEventListener("click", () => {
      const place = state.foodPlaces.find((item) => item.id === link.dataset.homeFoodReservation);
      if (!place) return;
      recordFoodProfileClick(place.id);
      place.contactClickCount = Number(place.contactClickCount || 0) + 1;
      recordFeaturedReservation(place.name, "Restaurant du mois");
    });
  });
  bindExceptionPlaceReservations(exceptionPlacesRoot);
  exceptionPlacesRoot.querySelector("[data-go='exception-places']")?.addEventListener("click", () => setView("exception-places"));
  foodRoot.querySelector("[data-go='food']")?.addEventListener("click", () => setView("food"));
  boostedEventsRoot.querySelectorAll("[data-boosted-home-event]").forEach((button) => {
    button.addEventListener("click", () => openEventDetail(button.dataset.boostedHomeEvent));
  });
  bindEventActionTracking(boostedEventsRoot);
}

function savedProviderCard(provider, options = {}) {
  const favorite = isFavorite(provider.id);
  return `
    <article class="saved-card">
      ${providerMedia(provider)}
      <div>
        <h3>${safe(provider.fullName)}</h3>
        <p>${safe(providerServicesLabel(provider))} - ${safe(provider.area)}</p>
        <div class="meta">
          ${verificationBadge(provider)}
          <span class="tag ok">${safe(distanceLabel(provider))}</span>
          <span class="tag">${safe(provider.city)}</span>
        </div>
      </div>
      <div class="saved-actions">
        <button class="secondary" data-open-saved="${safe(provider.id)}">Voir</button>
        ${options.allowFavorite ? `<button class="secondary" data-toggle-saved="${safe(provider.id)}">${favorite ? "Retirer" : "Garder"}</button>` : ""}
      </div>
    </article>
  `;
}

function renderSavedProviders() {
  state.favorites = [];
  state.recentProviders = [];
}

function currentCity() {
  return document.querySelector("#citySelect").value || state.selectedCity || "Toute la Côte d'Ivoire";
}

function providerMatches(provider, { ignoreLocation = false } = {}) {
  const city = currentCity();
  const radius = Number(state.selectedRadius || 0);
  const nationalSearch = city === "Toute la Côte d'Ivoire" || city === "Autre ville / commune";
  const selectedCityKey = normalizeAssistantText(city);
  const providerAreaKey = normalizeAssistantText(provider.area || "");
  const cityOk = ignoreLocation
    || nationalSearch
    || provider.city === city
    || deliveryCityGroup(provider.city) === deliveryCityGroup(city)
    || (providerAreaKey && selectedCityKey && (providerAreaKey.includes(selectedCityKey) || selectedCityKey.includes(providerAreaKey)))
    || Boolean(state.userLocation);
  const radiusOk = ignoreLocation || !state.userLocation || radius === 0 || distanceToProvider(provider) <= radius;
  const verifiedOk = !state.selectedVerifiedOnly || isVerified(provider);
  return providerVisibleToClients(provider) && cityOk && radiusOk && verifiedOk;
}

function providerMatchesClientQuery(provider, query = "") {
  const term = normalizeAssistantText(query);
  if (!term) return true;
  return [provider.fullName, ...providerServiceNames(provider)].some((value) => {
    const candidate = normalizeAssistantText(value);
    return candidate && (candidate.includes(term) || term.includes(candidate));
  });
}

function isLocalDeliveryProvider(provider) {
  return serviceMatches(LOCAL_DELIVERY_SERVICE, provider?.service);
}

function isInternationalParcelProvider(provider) {
  return serviceMatches(INTERNATIONAL_PARCEL_SERVICE, provider?.service);
}

function providerVisibleInClientSearch(provider) {
  return !isLocalDeliveryProvider(provider) || isInternationalParcelProvider(provider);
}

function resetProviderFilters() {
  assistantProviderSelection = null;
  setOpenProviderFilters({ clearSearch: true });
  saveState();
  renderProviders();
  renderDelivery();
  renderHomeDiscovery();
  renderSavedProviders();
}

function renderVerifiedServicePanel() {
  const panel = document.querySelector("#verifiedServicePanel");
  const input = document.querySelector("#verifiedOnly");
  const action = document.querySelector("#verifiedServiceAction");
  const count = document.querySelector("#verifiedServiceCount");
  if (!panel || !input || !action || !count) return;
  const verifiedTotal = state.providers
    .filter(providerVisibleToClients)
    .filter(providerVisibleInClientSearch)
    .filter(isVerified).length;
  const active = Boolean(state.selectedVerifiedOnly);
  input.checked = active;
  panel.classList.toggle("active", active);
  action.textContent = active ? "Filtre vérifié activé" : "Afficher les vérifiés";
  count.textContent = `${verifiedTotal} vérifié${verifiedTotal > 1 ? "s" : ""}`;
}

function renderProviders() {
  const list = document.querySelector("#providersList");
  const query = document.querySelector("#searchInput").value.trim().toLowerCase();
  const inferredQueryService = query ? inferAssistantService(query) : null;
  const directoryRequest = providerDirectoryRequest();
  const directoryActive = supabaseConfigured()
    && providerDirectoryState.signature === directoryRequest.signature
    && providerDirectoryState.mode !== "local";
  const providerSource = directoryActive
    ? dedupeProviderDirectoryItems([...providerDirectoryState.items, ...state.providers.filter(durableLocalProvider)])
    : state.providers;
  ensureProviderDirectorySearch();
  renderVerifiedServicePanel();
  const secureDeliveryMode = state.selectedService === "Zeyds Livraison" && !query;
  if (secureDeliveryMode) {
    document.querySelector("#resultCount").textContent = "Parcours sécurisé";
    list.innerHTML = `
      <article class="provider-card">
        <h3>Livraison locale protégée</h3>
        <p>Pour éviter les contacts directs et les tarifs hors application, les profils des livreurs locaux ne sont pas affichés. Créez une demande, validez le paiement, puis Zeyds vous présente un livreur disponible.</p>
        <div class="card-actions">
          <button class="primary" type="button" data-go="delivery">Créer une livraison</button>
          <button class="secondary" type="button" data-international-parcel>Colis international</button>
        </div>
      </article>
    `;
    list.querySelector("[data-go='delivery']")?.addEventListener("click", () => setView("delivery"));
    list.querySelector("[data-international-parcel]")?.addEventListener("click", openDeliverySearch);
    return;
  }
  const ignoreLocation = Boolean(
    query
    && inferredQueryService?.name
    && directoryActive
    && providerDirectoryState.fallbackNationwide
  );
  const matches = providerSource.filter((provider) => providerMatches(provider, { ignoreLocation }));
  let providers = matches
    .filter(providerVisibleInClientSearch)
    .filter((provider) => {
      if (!query) return providerOffersService(provider, state.selectedService);
      if (inferredQueryService?.name) return providerOffersService(provider, inferredQueryService.name);
      return providerMatchesClientQuery(provider, query);
    })
    .sort((a, b) => Number(providerBoostActive(b)) - Number(providerBoostActive(a)) || providerReliabilityScore(b) - providerReliabilityScore(a) || Number(isVerified(b)) - Number(isVerified(a)) || distanceToProvider(a) - distanceToProvider(b));
  if (assistantProviderSelection?.service === state.selectedService && assistantProviderSelection.ids?.length) {
    const order = new Map(assistantProviderSelection.ids.map((id, index) => [id, index]));
    providers = providers
      .map((provider, index) => ({ provider, index }))
      .sort((left, right) => {
        const leftKnown = order.has(left.provider.id);
        const rightKnown = order.has(right.provider.id);
        if (leftKnown !== rightKnown) return leftKnown ? -1 : 1;
        if (leftKnown && rightKnown) return order.get(left.provider.id) - order.get(right.provider.id);
        return left.index - right.index;
      })
      .map((item) => item.provider);
  }
  document.querySelector("#resultCount").textContent = `${providers.length} prestataire${providers.length > 1 ? "s" : ""}`;
  const loadingState = providerDirectoryState.loading && providerDirectoryState.pendingSignature === directoryRequest.signature;
  const emptyState = loadingState ? `
    <article class="provider-card">
      <h3>Recherche en cours...</h3>
    </article>
  ` : `
    <article class="provider-card">
      <h3>Aucun prestataire disponible</h3>
      <p>Aucun profil correspondant à « ${safe(query || state.selectedService)} » pour le moment.</p>
    </article>
  `;
  const pagination = directoryActive && providerDirectoryState.mode === "server_cursor" && (providers.length || providerDirectoryState.hasMore) ? `
    <div class="provider-pagination-status">
      ${providerDirectoryState.hasMore ? `<button class="secondary" type="button" data-provider-directory-more ${providerDirectoryState.loading ? "disabled" : ""}>${providerDirectoryState.loading ? "Chargement..." : "Voir plus de prestataires"}</button>` : ""}
    </div>
  ` : "";
  list.innerHTML = `${providers.length ? providers.map(providerCard).join("") : emptyState}${pagination}`;

  list.querySelector("[data-provider-directory-more]")?.addEventListener("click", () => loadProviderDirectoryPage({ reset: false }));
  list.querySelectorAll("[data-provider-card]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button, a, input, select, textarea")) return;
      openProfile(card.dataset.providerCard);
    });
    card.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      openProfile(card.dataset.providerCard);
    });
  });
  list.querySelectorAll("[data-open-profile]").forEach((button) => {
    button.addEventListener("click", () => openProfile(button.dataset.openProfile));
  });
}

function eventPosterHtml(event, large = false) {
  const poster = event.posterUrl || event.poster;
  const icon = event.category === "Concert" ? "🎤" : event.category === "Conférence" ? "🎙" : event.category === "Sport" ? "🏆" : "🎟";
  return `
    <div class="${large ? "event-detail-hero" : "event-poster"}">
      ${poster ? `<img src="${safe(poster)}" alt="${safe(event.title)}" loading="${large ? "eager" : "lazy"}" decoding="async" onerror="this.outerHTML='${safe(icon)}'">` : `<span>${safe(icon)}</span>`}
    </div>
  `;
}

function eventDateLabel(event) {
  const start = new Date(event.dateTime);
  const end = new Date(event.endDateTime);
  if (Number.isNaN(start.getTime())) return "Date à confirmer";
  const startLabel = start.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  if (Number.isNaN(end.getTime())) return startLabel;
  const endLabel = end.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  return `Du ${startLabel} au ${endLabel}`;
}

function eventLocationLabel(event) {
  return [event.venue, event.area, event.city].filter(Boolean).join(" - ") || "Lieu à préciser";
}

function eventStatsMessage(event) {
  const total = Number(event.clickCount || 0);
  return [
    `Bonjour ${event.organizerName || "organisateur"},`,
    `Votre événement Zeyds "${event.title}" est terminé.`,
    `Statistiques Zeyds : ${total} clic(s) total.`,
    `Détails : ${Number(event.detailViewCount || 0)} ouverture(s), ${Number(event.ticketClickCount || 0)} clic(s) billetterie, ${Number(event.contactClickCount || 0)} contact(s).`,
    "Ces chiffres concernent uniquement les interactions visibles dans Zeyds.",
  ].join("\n");
}

function eventStatsWhatsAppUrl(event) {
  const phone = String(event.contactPhone || "").replace(/[^\d+]/g, "");
  if (!phone) return "";
  return `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(eventStatsMessage(event))}`;
}

function trackEventInteraction(eventId, kind = "view") {
  const event = state.eventPromotions.find((item) => item.id === eventId);
  if (!event) return;
  event.clickCount = Number(event.clickCount || 0) + 1;
  if (kind === "ticket") event.ticketClickCount = Number(event.ticketClickCount || 0) + 1;
  if (kind === "contact") event.contactClickCount = Number(event.contactClickCount || 0) + 1;
  if (kind === "detail") event.detailViewCount = Number(event.detailViewCount || 0) + 1;
  if (["ticket", "contact"].includes(kind)) recordEventLead(event, kind);
  event.updatedAt = new Date().toISOString();
  saveState();
  if (event.remoteId && supabaseConfigured()) {
    supabaseRpc("record_event_promotion_click", {
      event_uuid: event.remoteId,
      click_kind: kind,
    }).catch(() => null);
  }
}

function recordEventLead(event, kind = "contact") {
  state.leads.push({
    id: `eventlead${Date.now()}`,
    providerId: event.id,
    providerName: event.organizerName || event.title,
    service: `Événement - ${event.category || "Billetterie"}`,
    city: event.city,
    action: kind === "ticket" ? "event_ticket_site" : "event_whatsapp_contact",
    note: `${event.title} - ${kind === "ticket" ? "site officiel" : "WhatsApp organisateur"}`,
    createdAt: new Date().toISOString(),
  });
}

function bindEventActionTracking(root) {
  root.querySelectorAll("[data-event-track]").forEach((action) => {
    action.addEventListener("click", () => {
      trackEventInteraction(action.dataset.eventTrack, action.dataset.eventTrackKind || "view");
    });
  });
}

function eventCard(event, options = {}) {
  const selectedCity = document.querySelector("#eventCityFilter")?.value || defaultEventCity();
  const distance = eventDistanceLabel(event, selectedCity);
  const boosted = eventBoostActive(event);
  const whatsappUrl = eventWhatsAppUrl(event);
  const ticketUrl = eventTicketUrl(event) || whatsappUrl;
  return `
    <article class="event-card ${boosted || event.isPremium ? "sponsored" : ""}">
      ${eventPosterHtml(event)}
      <div class="event-body">
        <div class="job-title-row">
          <h3>${safe(event.title)}</h3>
          <span class="tag ${event.isPremium ? "pending" : boosted ? "ok" : ""}">${safe(event.isPremium ? "Premium" : boosted ? "Sponsorisé maintenant" : event.category)}</span>
        </div>
        <p><strong>${safe(eventDateLabel(event))}</strong></p>
        <p>${safe(eventLocationLabel(event))}${distance ? ` - ${safe(distance)}` : ""}</p>
        ${event.address ? `<p>${safe(event.address)}</p>` : ""}
        <p>${safe(event.description || "Informations disponibles sur le lien officiel de l'organisateur.")}</p>
        <div class="meta">
          <span class="tag">${safe(event.category)}</span>
          ${event.ticketPrice ? `<span class="tag">${safe(event.ticketPrice)}</span>` : ""}
          <span class="tag">WhatsApp ou site officiel</span>
        </div>
      </div>
      <div class="event-actions">
        ${ticketUrl ? `<a class="primary" href="${safe(ticketUrl)}" target="_blank" rel="noreferrer" data-event-track="${safe(event.id)}" data-event-track-kind="ticket">Acheter billet</a>` : ""}
        ${whatsappUrl ? `<a class="secondary" href="${safe(whatsappUrl)}" target="_blank" rel="noreferrer" data-event-track="${safe(event.id)}" data-event-track-kind="contact">Contacter</a>` : ""}
      </div>
    </article>
  `;
}

function pendingEventCard(event) {
  return `
    <article class="event-card pending-job">
      ${eventPosterHtml(event)}
      <div class="event-body">
        <div class="job-title-row">
          <h3>${safe(event.title)}</h3>
          <span class="tag pending">Validation Zeyds</span>
        </div>
        <p>${safe(event.organizerName)} - ${safe(event.category)} - ${safe(event.city)}</p>
        <p>Forfait ${safe(event.planName)} : ${Number(event.amount || 0).toLocaleString("fr-FR")} ${safe(event.currency || "FCFA")}.</p>
        <div class="meta">
          <span class="tag">${safe(event.paymentReference || "Réf. Zeyds en création")}</span>
          <span class="tag">${safe(event.paymentStatus || "pending")}</span>
          ${event.remoteId ? `<span class="tag ok">Supabase</span>` : `<span class="tag pending">Local</span>`}
        </div>
      </div>
    </article>
  `;
}

function openEventDetail(eventId) {
  applyEventExpirationRules();
  const event = state.eventPromotions.find((item) => item.id === eventId);
  if (!eventIsPubliclyVisible(event)) {
    state.selectedEventId = "";
    saveState();
    setView("events");
    return;
  }
  state.selectedEventId = event.id;
  trackEventInteraction(event.id, "detail");
  saveState();
  renderEventDetail();
  setView("eventDetail");
}

function renderEventDetail() {
  const root = document.querySelector("#eventDetailContent");
  if (!root) return;
  const event = state.eventPromotions.find((item) => item.id === state.selectedEventId);
  if (!eventIsPubliclyVisible(event)) {
    root.innerHTML = `<section class="panel"><h2>Événement terminé</h2><p>Cet événement n’est plus visible après sa date de fin. Retournez à l’agenda pour découvrir les événements disponibles.</p><button class="primary" type="button" data-go="events">Voir l’agenda</button></section>`;
    root.querySelector("[data-go='events']")?.addEventListener("click", () => setView("events"));
    return;
  }
  const ticketUrl = eventTicketUrl(event);
  const whatsappUrl = eventWhatsAppUrl(event);
  const selectedCity = document.querySelector("#eventCityFilter")?.value || defaultEventCity();
  const distance = eventDistanceLabel(event, selectedCity);
  const boosted = eventBoostActive(event);
  root.innerHTML = `
    <section class="panel event-detail-card">
      ${eventPosterHtml(event, true)}
      <div>
        <div class="section-head">
          <h2>${safe(event.title)}</h2>
          <span class="tag ${event.isPremium ? "pending" : boosted ? "ok" : ""}">${safe(event.isPremium ? "Premium" : boosted ? "Sponsorisé maintenant" : event.category)}</span>
        </div>
        <p><strong>Date :</strong> ${safe(eventDateLabel(event))}</p>
        <p><strong>Lieu :</strong> ${safe(eventLocationLabel(event))}${distance ? ` - ${safe(distance)}` : ""}</p>
        ${event.address ? `<p><strong>Adresse :</strong> ${safe(event.address)}</p>` : ""}
        <p><strong>Organisateur :</strong> ${safe(event.organizerName)}</p>
        ${event.ticketPrice ? `<p><strong>Prix indicatif :</strong> ${safe(event.ticketPrice)}</p>` : ""}
        <p>${safe(event.description || "Aucune description complémentaire.")}</p>
        <div class="ticket-choice-box">
          <strong>Choisir le contact événement</strong>
          <p>Zeyds ne vend pas les billets. Choisissez le WhatsApp de l'organisateur ou son site officiel s'il en a un.</p>
        </div>
        <div class="event-detail-actions">
          ${whatsappUrl ? `<a class="primary" href="${safe(whatsappUrl)}" target="_blank" rel="noreferrer" data-event-track="${safe(event.id)}" data-event-track-kind="contact">WhatsApp organisateur</a>` : ""}
          ${ticketUrl ? `<a class="secondary" href="${safe(ticketUrl)}" target="_blank" rel="noreferrer" data-event-track="${safe(event.id)}" data-event-track-kind="ticket">Site officiel / billet</a>` : ""}
        </div>
      </div>
    </section>
  `;
  bindEventActionTracking(root);
}

function renderEvents() {
  applyEventExpirationRules();
  scheduleNextEventExpiration();
  const list = document.querySelector("#eventList");
  const count = document.querySelector("#eventCount");
  const queryInput = document.querySelector("#eventSearchInput");
  const categoryFilter = document.querySelector("#eventCategoryFilter");
  const cityFilter = document.querySelector("#eventCityFilter");
  if (!list || !count || !queryInput || !categoryFilter || !cityFilter) return;
  renderEventEntryMode();
  if (!cityIsSpecific(cityFilter.value)) cityFilter.value = defaultEventCity();
  renderEventGeoStatus();
  const events = eventPromotionsMatching(categoryFilter.value, cityFilter.value, queryInput.value);
  const pending = pendingLocalEvents();
  const promoteMode = state.selectedEventEntryMode === "promote";
  count.textContent = promoteMode
    ? `${pending.length} en attente · ${events.length} publié${events.length > 1 ? "s" : ""}`
    : `${events.length} disponible${events.length > 1 ? "s" : ""}`;
  const pendingHtml = promoteMode && pending.length ? `
    <div class="job-pending-block">
      <h3>Vos événements en attente de validation (${pending.length})</h3>
      ${pending.map(pendingEventCard).join("")}
    </div>
  ` : "";
  const publishedHtml = events.length ? events.map(eventCard).join("") : `
    <article class="event-card empty">
      <div>
        <h3>Aucun événement disponible à ${safe(cityFilter.value || defaultEventCity())}</h3>
        <p>Changez de ville pour consulter les événements d'une autre zone.</p>
      </div>
    </article>
  `;
  list.innerHTML = `${pendingHtml}${publishedHtml}`;
  bindEventActionTracking(list);
}

function foodPlaceArt(place) {
  const photo = place.photoUrl || place.photo;
  return `
    <div class="food-art">
      ${photo ? `<img src="${safe(photo)}" alt="${safe(place.name)}" loading="lazy" decoding="async">` : `<span>${safe(serviceIcon("Restaurants"))}</span>`}
    </div>
  `;
}

function foodPlaceCard(place) {
  const whatsappUrl = foodWhatsAppUrl(place);
  return `
    <article class="food-card">
      ${foodPlaceArt(place)}
      <div class="food-body">
        <div class="job-title-row">
          <h3>${safe(place.name)}</h3>
          <span class="tag ${place.verificationStatus === "verified" ? "ok" : ""}">${safe(place.verificationStatus === "verified" ? "Adresse vérifiée" : place.placeType)}</span>
        </div>
        <p><strong>${safe(place.mainSpecialty)}</strong> - ${safe(place.city)}${place.area ? `, ${safe(place.area)}` : ""}</p>
        <p>${safe(place.address || "Adresse à préciser")} ${place.openingHours ? `- ${safe(place.openingHours)}` : ""}</p>
        <p>${safe(place.description || "Contactez l'adresse pour confirmer la disponibilité du plat.")}</p>
        <div class="meta">
          ${place.averageBudget ? `<span class="tag">${safe(place.averageBudget)}</span>` : ""}
          ${place.deliveryAvailable ? `<span class="tag ok">Livraison possible</span>` : `<span class="tag">Sur place / à emporter</span>`}
          ${place.specialties.slice(0, 3).map((specialty) => `<span class="tag">${safe(specialty)}</span>`).join("")}
        </div>
      </div>
      <div class="food-actions">
        ${whatsappUrl ? `<a class="primary" href="${safe(whatsappUrl)}" target="_blank" rel="noreferrer" data-food-contact="${safe(place.id)}">Contacter</a>` : ""}
        ${place.deliveryAvailable ? `<button class="secondary" type="button" data-food-delivery="${safe(place.id)}">Se faire livrer</button>` : ""}
      </div>
    </article>
  `;
}

function foodMenuItems(place = {}) {
  const firstPrice = String(place.averageBudget || "").match(/[\d\s.]+/)?.[0] || "";
  const parsedPrice = Number(firstPrice.replace(/[^\d]/g, ""));
  const basePrice = parsedPrice >= 500 ? parsedPrice : 2500;
  const specialties = [...new Set([place.mainSpecialty, ...(place.specialties || [])].filter(Boolean))].slice(0, 8);
  return (specialties.length ? specialties : ["Menu du jour"]).map((name, index) => ({
    name,
    price: Math.max(500, Math.round((basePrice + index * 500) / 100) * 100),
  }));
}

function updateFoodOrderPricing() {
  const form = document.querySelector("#foodOrderForm");
  if (!form) return null;
  const place = state.foodPlaces.find((item) => item.id === form.dataset.foodPlace);
  if (!place) return null;
  const menu = foodMenuItems(place);
  const selected = menu.find((item) => item.name === form.elements.namedItem("foodItem")?.value) || menu[0];
  const destination = String(form.elements.namedItem("destination")?.value || "").trim();
  const pickup = [place.area, place.address].filter(Boolean).join(" - ") || place.city;
  const estimate = destination ? estimateDeliveryDistanceKm(pickup, destination, place.city) : null;
  const distanceKm = estimate?.distanceKm || (destination ? 5 : 0);
  const pricing = deliveryPricingDetails({ distanceKm, urgency: "today" });
  const delivery = deliveryFinancials(pricing.suggestedAmount);
  const total = selected.price + delivery.amount;
  const summary = form.querySelector("#foodOrderSummary");
  if (summary) summary.innerHTML = destination ? `
    <span><small>Restaurant</small><strong>${safe(formatMoney(selected.price))}</strong></span>
    <span><small>Livraison</small><strong>${safe(formatMoney(delivery.amount))}</strong></span>
    <span><small>Total</small><strong>${safe(formatMoney(total))}</strong></span>
  ` : `<span><small>Tarif</small><strong>Indiquez le lieu de livraison</strong></span>`;
  const submit = form.querySelector("button[type='submit']");
  if (submit) submit.disabled = !destination || !delivery.amount;
  form.dataset.foodPrice = String(selected.price);
  form.dataset.deliveryPrice = String(delivery.amount);
  form.dataset.distanceKm = String(distanceKm);
  return { place, selected, pickup, destination, distanceKm, pricing, delivery, total };
}

function openFoodOrder(placeId = "") {
  const place = state.foodPlaces.find((item) => item.id === placeId && item.status === "published");
  const panel = document.querySelector("#foodOrderPanel");
  if (!place || !panel) return;
  const menu = foodMenuItems(place);
  const methods = bizziConfig.payments?.methods || ["Wave"];
  state.selectedDeliveryPayment = BizziPrivacy.choosePayment(state.selectedDeliveryPayment, methods);
  panel.hidden = false;
  panel.innerHTML = `
    <div class="section-head"><div><p class="eyebrow">Commande Food</p><h2>${safe(place.name)}</h2></div><button class="secondary compact-action" type="button" data-close-food-order>Fermer</button></div>
    <form id="foodOrderForm" class="form" data-food-place="${safe(place.id)}">
      <label>Choisissez votre menu<select name="foodItem">${menu.map((item) => `<option value="${safe(item.name)}">${safe(item.name)} · ${safe(formatMoney(item.price))}</option>`).join("")}</select></label>
      <label>Lieu de livraison<input name="destination" required autocomplete="street-address" placeholder="Ex: Marcory Zone 4"></label>
      <label>Votre téléphone<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="+225 07 00 00 00 00"></label>
      <div id="foodOrderSummary" class="food-order-summary"></div>
      <div class="payment-grid">${methods.map((method) => `<button class="pay ${method === state.selectedDeliveryPayment ? "selected" : ""}" type="button" data-food-payment="${safe(method)}">${safe(method)}</button>`).join("")}</div>
      <button class="primary" type="submit" disabled>Valider la commande</button>
    </form>
  `;
  const form = panel.querySelector("#foodOrderForm");
  panel.querySelector("[data-close-food-order]")?.addEventListener("click", () => { panel.hidden = true; panel.innerHTML = ""; });
  panel.querySelectorAll("[data-food-payment]").forEach((button) => button.addEventListener("click", () => {
    state.selectedDeliveryPayment = button.dataset.foodPayment;
    saveState();
    panel.querySelectorAll("[data-food-payment]").forEach((item) => item.classList.toggle("selected", item === button));
  }));
  ["foodItem", "destination"].forEach((name) => form.elements.namedItem(name)?.addEventListener("input", updateFoodOrderPricing));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const pricing = updateFoodOrderPricing();
    const phone = String(form.elements.namedItem("phone")?.value || "").trim();
    if (!pricing || !isValidContactPhone(phone)) {
      renderFoodStatus(contactValidationMessage("contact client"));
      return;
    }
    const restaurantPayout = pricing.selected.price;
    const restaurantMobileMoneyAccount = String(pricing.place.mobileMoneyAccount || pricing.place.contactPhone || "").trim();
    const request = normalizeDeliveryRequest({
      id: `food-del${Date.now()}`, pickup: pricing.pickup, dropoff: pricing.destination,
      parcel: `Commande Food : ${pricing.selected.name}`, requestType: "delivery", city: pricing.place.city,
      urgency: "today", phone, distanceKm: pricing.distanceKm,
      baseAmount: pricing.pricing.baseAmount, suggestedAmount: pricing.delivery.amount,
      pricingSlot: pricing.pricing.pricingSlot, pricingSlotLabel: pricing.pricing.pricingSlotLabel,
      pricingBreakdown: {
        ...pricing.pricing.pricingBreakdown,
        orderType: "food",
        restaurantAmount: pricing.selected.price,
        deliveryAmount: pricing.delivery.amount,
        foodOrderTotal: pricing.total,
        bizziDeliveryCommission: pricing.delivery.bizziCommission,
        courierPayout: pricing.delivery.providerPayout,
      },
      amount: pricing.total, deliveryAmount: pricing.delivery.amount,
      commissionRate: DELIVERY_COMMISSION_RATE, bizziCommission: pricing.delivery.bizziCommission,
      providerPayout: pricing.delivery.providerPayout, paymentMethod: state.selectedDeliveryPayment,
      paymentReference: generateDeliveryPaymentReference(phone), paymentStatus: "pending", payoutStatus: "pending",
      foodPlaceId: pricing.place.id, foodPlaceName: pricing.place.name, foodItem: pricing.selected.name,
      restaurantAmount: pricing.selected.price, restaurantPayout, restaurantPayoutStatus: "payable_after_payment",
      restaurantMobileMoneyAccount,
      foodOrderTotal: pricing.total,
      notes: `Commande Food. Restaurant ${pricing.place.name}: ${restaurantPayout} FCFA. Livraison: ${pricing.delivery.amount} FCFA. Compte Mobile Money restaurant: ${restaurantMobileMoneyAccount || "à confirmer"}.`,
      status: "open", createdAt: new Date().toISOString(),
    });
    request.matchedProviderIds = deliveryRequestMatches(request).map((provider) => provider.id);
    state.deliveryRequests.unshift(request);
    saveState();
    const autoMessage = await autoValidateDeliveryOrder(request);
    if (request.paymentStatus === "approved") request.restaurantPayoutStatus = "payable";
    saveState();
    let remoteMessage = "";
    try {
      remoteMessage = await submitDeliveryRequestToSupabase(request);
    } catch (error) {
      request.remoteStatus = `Commande Food gardée en local : ${friendlySupabaseError(error)}.`;
      remoteMessage = request.remoteStatus;
      saveState();
    }
    panel.hidden = true;
    panel.innerHTML = "";
    renderFoodStatus(`Commande validée : ${safe(pricing.selected.name)}. Total : ${safe(formatMoney(pricing.total))}. Restaurant : ${safe(formatMoney(restaurantPayout))} sur son compte Mobile Money enregistré. Livraison : ${safe(formatMoney(pricing.delivery.amount))}. Le livreur reçoit ${safe(formatMoney(pricing.delivery.providerPayout))} après la commission Zeyds de 15 %. ${safe(autoMessage)} ${safe(remoteMessage)}`);
    renderDelivery();
    renderAdmin();
  });
  updateFoodOrderPricing();
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function pendingFoodCard(place) {
  return `
    <article class="food-card pending-job">
      ${foodPlaceArt(place)}
      <div class="food-body">
        <div class="job-title-row">
          <h3>${safe(place.name)}</h3>
          <span class="tag pending">Validation Zeyds</span>
        </div>
        <p>${safe(place.placeType)} - ${safe(place.mainSpecialty)} - ${safe(place.city)}${place.area ? `, ${safe(place.area)}` : ""}</p>
        <p>Adresse reçue. Elle sera visible après contrôle Zeyds.</p>
        <div class="meta">
          <span class="tag">${safe(place.contactPhone || "Contact non renseigné")}</span>
          ${place.remoteId ? `<span class="tag ok">Supabase</span>` : `<span class="tag pending">Local</span>`}
        </div>
      </div>
    </article>
  `;
}

function foodShareText(place) {
  return [
    `Zeyds Food : ${place.name}`,
    `${place.mainSpecialty} - ${place.placeType}`,
    `Zone : ${place.city}${place.area ? `, ${place.area}` : ""}`,
    place.address ? `Adresse : ${place.address}` : "",
    place.averageBudget ? `Budget : ${place.averageBudget}` : "",
    place.openingHours ? `Horaires : ${place.openingHours}` : "",
    place.deliveryAvailable ? "Livraison possible" : "",
    place.contactPhone ? `Contact : ${place.contactPhone}` : "",
    officialWebsiteUrl() ? `Zeyds : ${officialWebsiteUrl()}` : "",
  ].filter(Boolean).join("\n");
}

function renderFoodStatus(message = "") {
  const status = document.querySelector("#foodStatus");
  if (!status) return;
  status.innerHTML = message || `
    <strong>Zeyds Food prêt</strong>
    <p>Proposez une adresse fiable ou recherchez un plat par ville et spécialité.</p>
  `;
}

function renderFoodQuickTags() {
  const root = document.querySelector("#foodQuickTags");
  if (!root) return;
  root.innerHTML = FOOD_SPECIALTIES.slice(0, 8).map((specialty) => `
    <button class="food-tag" type="button" data-food-tag="${safe(specialty)}">${safe(specialty)}</button>
  `).join("");
  root.querySelectorAll("[data-food-tag]").forEach((button) => {
    button.addEventListener("click", () => {
      const specialtyFilter = document.querySelector("#foodSpecialtyFilter");
      const searchInput = document.querySelector("#foodSearchInput");
      if (specialtyFilter) specialtyFilter.value = button.dataset.foodTag;
      if (searchInput) searchInput.value = "";
      state.selectedFoodSpecialty = button.dataset.foodTag;
      saveState();
      renderFood();
    });
  });
}

function renderFood() {
  renderFoodQuickTags();
  const list = document.querySelector("#foodList");
  const count = document.querySelector("#foodCount");
  const queryInput = document.querySelector("#foodSearchInput");
  const specialtyFilter = document.querySelector("#foodSpecialtyFilter");
  const cityFilter = document.querySelector("#foodCityFilter");
  if (!list || !count || !queryInput || !specialtyFilter || !cityFilter) return;
  if (!cityIsSpecific(cityFilter.value)) cityFilter.value = foodDefaultCity();
  state.selectedFoodCity = cityFilter.value || foodDefaultCity();
  state.selectedFoodSpecialty = specialtyFilter.value || "Toutes les spécialités";
  const places = foodPlacesMatching(queryInput.value, specialtyFilter.value, cityFilter.value);
  const pending = state.foodPlaces.filter((place) => ["pending", "submitted"].includes(place.status)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  count.textContent = `${places.length} adresse${places.length > 1 ? "s" : ""}`;
  const pendingHtml = pending.length ? `
    <div class="job-pending-block">
      <h3>Adresses en attente (${pending.length})</h3>
      ${pending.slice(0, 4).map(pendingFoodCard).join("")}
    </div>
  ` : "";
  const listHtml = places.length ? places.map(foodPlaceCard).join("") : `
    <article class="food-card empty">
      <div>
        <h3>Aucune adresse trouvée</h3>
        <p>Essayez une autre spécialité ou changez de ville. Vous pouvez aussi proposer une nouvelle adresse Food.</p>
      </div>
    </article>
  `;
  list.innerHTML = `${pendingHtml}${listHtml}`;
  list.querySelectorAll("[data-food-contact]").forEach((link) => {
    link.addEventListener("click", () => {
      const place = state.foodPlaces.find((item) => item.id === link.dataset.foodContact);
      if (!place) return;
      recordFoodProfileClick(place.id);
      place.contactClickCount = Number(place.contactClickCount || 0) + 1;
      saveState();
    });
  });
  list.querySelectorAll("[data-food-delivery]").forEach((button) => {
    button.addEventListener("click", () => {
      const place = state.foodPlaces.find((item) => item.id === button.dataset.foodDelivery);
      if (place) recordFoodProfileClick(place.id);
      if (place) openFoodOrder(place.id);
    });
  });
  list.querySelectorAll("[data-copy-food]").forEach((button) => {
    button.addEventListener("click", async () => {
      const place = state.foodPlaces.find((item) => item.id === button.dataset.copyFood);
      if (!place) return;
      if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim();
      const copied = await copyTextToClipboard(foodShareText(place));
      finishActionButton(button, copied ? "Copié" : "Copie impossible");
    });
  });
}

function renderEventGeoStatus() {
  const root = document.querySelector("#eventGeoStatus");
  const cityFilter = document.querySelector("#eventCityFilter");
  if (!root || !cityFilter) return;
  const city = cityIsSpecific(cityFilter.value) ? cityFilter.value : defaultEventCity();
  root.innerHTML = `<strong>Ville affichée : ${safe(city)}</strong><span>Par défaut, Zeyds ne mélange pas les événements des autres villes. Les événements sponsorisés restent limités à leur zone de visibilité.</span>`;
}

function renderJobs() {
  applyJobExpirationRules();
  renderJobEntryMode();
  const list = document.querySelector("#jobOffersList");
  const count = document.querySelector("#jobCount");
  const queryInput = document.querySelector("#jobSearchInput");
  const serviceFilter = document.querySelector("#jobServiceFilter");
  const cityFilter = document.querySelector("#jobCityFilter");
  if (!list || !count || !queryInput || !serviceFilter || !cityFilter) return;

  const jobs = jobsMatching(serviceFilter.value, cityFilter.value, queryInput.value);
  const localPendingJobs = pendingLocalJobOffers();
  count.textContent = `${jobs.length} publiée${jobs.length > 1 ? "s" : ""}${localPendingJobs.length ? ` · ${localPendingJobs.length} en attente` : ""}`;
  const publishedHtml = jobs.length ? jobs.map(jobCard).join("") : `
    <article class="job-card empty">
      <div>
        <h3>Aucune offre disponible pour ce filtre</h3>
        <p>Les offres payées apparaissent ici après validation admin Zeyds.</p>
      </div>
    </article>
  `;
  const pendingHtml = localPendingJobs.length ? `
    <div class="job-pending-block">
      <h3>Offres en attente de validation (${localPendingJobs.length})</h3>
      ${localPendingJobs.map(pendingJobCard).join("")}
    </div>
  ` : "";
  list.innerHTML = `${pendingHtml}${publishedHtml}`;

  list.querySelectorAll("[data-copy-job]").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = state.jobOffers.find((item) => item.id === button.dataset.copyJob);
      if (!job) return;
      if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim();
      const copied = await copyTextToClipboard(jobShareText(job));
      finishActionButton(button, copied ? "Offre copiée" : "Copie impossible");
    });
  });
}

function pendingLocalJobOffers() {
  return state.jobOffers
    .filter((job) => ["pending", "submitted"].includes(job.status) || job.paymentStatus === "pending" || job.remoteStatus === "pending")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function pendingJobCard(job) {
  return `
    <article class="job-card pending-job">
      <div class="job-art" style="${serviceStyle(job.service)}">
        <span>${safe(serviceIcon(job.service))}</span>
      </div>
      <div class="job-body">
        <div class="job-title-row">
          <h3>${safe(job.title)}</h3>
          <span class="tag pending">Validation Zeyds</span>
        </div>
        <p>${safe(job.companyName)} - ${safe(job.companyType || "Entreprise")} - ${safe(job.service)} - ${safe(job.city)}${job.area ? `, ${safe(job.area)}` : ""}</p>
        <p>Cette offre est enregistrée. Elle devient visible publiquement après validation du paiement par l'admin Zeyds.</p>
        <div class="meta">
          <span class="tag">${safe(job.planName || "Forfait emploi")}</span>
          <span class="tag">${safe(job.paymentReference || "Réf. Zeyds en création")}</span>
          <span class="tag">${safe(job.paymentStatus || "pending")}</span>
          ${job.remoteId ? `<span class="tag ok">Supabase</span>` : `<span class="tag pending">Local</span>`}
        </div>
      </div>
    </article>
  `;
}

function jobCard(job) {
  const whatsappUrl = jobWhatsAppUrl(job);
  return `
    <article class="job-card">
      <div class="job-art" style="${serviceStyle(job.service)}">
        <span>${safe(serviceIcon(job.service))}</span>
      </div>
      <div class="job-body">
        <div class="job-title-row">
          <h3>${safe(job.title)}</h3>
          <span class="tag ${job.isBoosted ? "pending" : "ok"}">${safe(job.isBoosted ? "Boostée" : job.contractType)}</span>
        </div>
        <p>${safe(job.companyName)} - ${safe(job.companyType || "Entreprise")} - ${safe(job.service)} - ${safe(job.city)}${job.area ? `, ${safe(job.area)}` : ""}</p>
        <p>${safe(job.description || "Contactez l'annonceur pour plus de détails.")}</p>
        <div class="meta">
          ${job.salaryRange ? `<span class="tag">${safe(job.salaryRange)}</span>` : ""}
          ${job.planName ? `<span class="tag">${safe(job.planName)}</span>` : ""}
          <span class="tag">${safe(job.source || "Zeyds")}</span>
          <span class="tag">Publié le ${new Date(job.createdAt).toLocaleDateString("fr-FR")}</span>
        </div>
      </div>
      <div class="job-actions">
        ${whatsappUrl ? `<a class="primary" href="${safe(whatsappUrl)}" target="_blank" rel="noreferrer">Contacter</a>` : ""}
        <button class="secondary" type="button" data-copy-job="${safe(job.id)}">Copier</button>
      </div>
    </article>
  `;
}

function jobShareText(job) {
  return [
    `Offre Zeyds : ${job.title}`,
    `${job.companyName} recherche : ${job.service}`,
    job.companyType ? `Demandeur : ${job.companyType}` : "",
    `Zone : ${job.city}${job.area ? `, ${job.area}` : ""}`,
    job.contractType ? `Type : ${job.contractType}` : "",
    job.salaryRange ? `Rémunération : ${job.salaryRange}` : "",
    job.description || "",
    job.contactPhone ? `Contact : ${job.contactPhone}` : "",
    officialWebsiteUrl() ? `Zeyds : ${officialWebsiteUrl()}` : "",
  ].filter(Boolean).join("\n");
}

function providerCard(provider) {
  const expired = provider.visibility === "expired_blurred";
  const renewal = renewalStatus(provider);
  if (expired) {
    return `
      <article class="provider-card expired">
        <div class="provider-head">
          ${providerMedia(provider)}
          <div>
            <h3>${safe(providerServicesLabel(provider))}</h3>
            <p class="blurred">${safe(provider.fullName)} - ${safe(provider.area)} - ${safe(provider.phone)}</p>
          </div>
          <span class="tag bad">Expiré</span>
        </div>
        <div class="meta blurred">
          <span class="tag">${safe(provider.rating)}/5</span>
          <span class="tag">${safe(provider.city)}</span>
          <span class="tag">${safe(distanceLabel(provider))}</span>
        </div>
        <div class="locked-note">Informations masquées : abonnement non renouvelé.</div>
      </article>
    `;
  }

  const reviews = Number(provider.reviewCount || 0);
  const reliability = reliabilityInfo(provider);
  return `
    <article class="provider-card provider-card-premium" data-provider-card="${safe(provider.id)}" tabindex="0" role="button" aria-label="Voir le profil de ${safe(provider.fullName)}">
      <div class="provider-card-media">
        ${providerMedia(provider)}
        ${providerCurrentAvailability(provider) ? `<span class="provider-live-badge">Disponible</span>` : ""}
      </div>
      <div class="provider-card-main">
        <div class="provider-card-title">
          <h3>${safe(provider.fullName)}</h3>
          ${providerBoostBadge(provider)}
        </div>
        <p class="provider-card-service">${safe(providerServicesLabel(provider))} · ${safe(provider.area || provider.city)}</p>
        <div class="provider-rating-row">
          <strong>★ ${Number(provider.rating || 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 })}</strong>
          <span>${reviews} avis</span>
          ${verificationBadge(provider)}
          <span class="tag reliability ${safe(reliability.className)}">${safe(reliability.label)}</span>
          ${renewal ? `<span class="tag bad">${safe(renewal)}</span>` : ""}
        </div>
        <div class="provider-facts">
          <span><small>Distance</small><strong>${safe(distanceLabel(provider))}</strong></span>
          <span><small>Arrivée estimée</small><strong>${safe(providerArrivalEstimate(provider))}</strong></span>
          <span><small>Prix moyen</small><strong>${safe(providerAveragePriceLabel(provider))}</strong></span>
        </div>
        <div class="card-actions">
          <button class="primary" type="button" data-open-profile="${safe(provider.id)}">Voir le profil</button>
        </div>
      </div>
    </article>
  `;
}

function openProfile(id) {
  const provider = state.providers.find((item) => item.id === id);
  if (!providerVisibleToClients(provider)) return;
  const clientPhone = requireClientPhoneForAccess("ouvrir une fiche prestataire");
  if (!clientPhone) return;
  provider.calls += 1;
  saveState();

  const heroStyle = provider.photo ? ` style="background-image:url('${safe(provider.photo)}')"` : "";
  const whatsappUrl = whatsappContactUrl(provider);
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(providerShareText(provider))}`;
  const routeLink = provider.lat && provider.lng
    ? `<a class="secondary call-link" href="https://www.google.com/maps/search/?api=1&query=${provider.lat},${provider.lng}" target="_blank" rel="noreferrer" data-lead-action="route">Voir l'itinéraire</a>`
    : "";
  document.querySelector("#profileContent").innerHTML = `
    <div class="profile-hero ${provider.photo ? "with-photo" : ""}"${heroStyle}>
      <div class="profile-hero-content">
        <h2>${safe(providerServicesLabel(provider))}</h2>
        <p>${safe(provider.fullName)} - ${safe(provider.area || provider.city || "Côte d'Ivoire")}</p>
        <span class="tag ok">Profil actif</span>
      </div>
    </div>
    <article class="provider-card">
      <div class="provider-head">
        ${providerMedia(provider)}
        <div>
          <h2>${safe(provider.fullName)}</h2>
          <p>${safe(providerServicesLabel(provider))} - ${safe(provider.area)}</p>
        </div>
        <span class="tag ok">Visible</span>
      </div>
      <p>${safe(provider.description)}</p>
      <div class="meta">
        <span class="tag">${safe(distanceLabel(provider))}</span>
        <span class="tag">${safe(provider.rating)}/5</span>
        <span class="tag">${safe(provider.city)}</span>
        ${verificationBadge(provider)}
        ${reliabilityBadge(provider)}
        ${providerBoostBadge(provider)}
        <span class="tag">${safe(subscriptionLabel(provider))}</span>
      </div>
      <div class="reliability-panel">
        <strong>${safe(reliabilityInfo(provider).label)} - ${providerReliabilityScore(provider)}/100</strong>
        <p>Score calculé avec vérification Zeyds, avis clients, retours de contact, activité et abonnement actif.</p>
      </div>
      <a class="primary call-link" href="tel:${provider.phone.replace(/\s/g, "")}" data-lead-action="call">Appeler ${provider.phone}</a>
      ${whatsappUrl ? `<a class="secondary call-link" href="${safe(whatsappUrl)}" target="_blank" rel="noreferrer" data-lead-action="whatsapp">Contacter sur WhatsApp</a>` : ""}
      ${routeLink}
      <div class="share-row">
        <a class="secondary call-link" href="${safe(shareUrl)}" target="_blank" rel="noreferrer" data-lead-action="share">Partager sur WhatsApp</a>
        <button class="secondary call-link" type="button" data-copy-profile="${safe(provider.id)}">Copier le contact</button>
      </div>
      <div class="contact-proof" id="profileLeadStatus">
        <strong>Zeyds peut confirmer ce contact</strong>
        <p>Après avoir contacté le prestataire, indiquez rapidement si tout s'est bien passé.</p>
        <div class="feedback-actions">
          <button class="secondary" type="button" data-contact-feedback="feedback_positive">J'ai eu le prestataire</button>
          <button class="secondary" type="button" data-contact-feedback="feedback_no_answer">Pas de réponse</button>
          <button class="danger" type="button" data-contact-feedback="feedback_wrong_number">Numéro incorrect</button>
        </div>
      </div>
      <form class="form review-form" data-review-provider="${safe(provider.id)}">
        <h3>Donner un avis rapide</h3>
        <p>Un avis court aide Zeyds à recommander les prestataires fiables.</p>
        <label>Note
          <select name="rating">
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Bien</option>
            <option value="3">3 - Moyen</option>
            <option value="2">2 - Décevant</option>
            <option value="1">1 - Mauvaise expérience</option>
          </select>
        </label>
        <label>Commentaire
          <textarea name="message" rows="2" maxlength="180" placeholder="Exemple : répond vite, travail propre, prix correct"></textarea>
        </label>
        <button class="secondary" type="submit">Envoyer l'avis</button>
      </form>
      <div class="review-list">
        ${providerReviews(provider.id).slice(0, 3).map((review) => `
          <div class="review-item">
            <strong>${Number(review.rating || 0)}/5</strong>
            <p>${safe(review.message || "Avis sans commentaire.")}</p>
          </div>
        `).join("")}
      </div>
      <form class="form report-form" data-report-provider="${safe(provider.id)}">
        <h3>Signaler ce prestataire</h3>
        <label>Raison
          <select name="reason">
            <option>Numéro incorrect</option>
            <option>Service non conforme</option>
            <option>Comportement inapproprié</option>
            <option>Autre problème</option>
          </select>
        </label>
        <label>Message<textarea name="message" rows="2" placeholder="Expliquez brièvement le problème"></textarea></label>
        <button class="secondary" type="submit">Envoyer le signalement</button>
      </form>
    </article>
  `;
  setupProfileActions(provider);
  setupReviewForms();
  setupReportForms();
  setView("profile");
}

function setupProfileActions(provider) {
  document.querySelectorAll("[data-lead-action]").forEach((element) => {
    element.addEventListener("click", () => {
      const action = element.dataset.leadAction;
      recordLead(provider, action);
      const status = document.querySelector("#profileLeadStatus");
      if (status) {
        const message = contactActionMessage(provider, action);
        status.classList.add("active");
        status.innerHTML = `
          <strong>${safe(message.title)}</strong>
          <p>${safe(message.body)}</p>
          <div class="feedback-actions">
            <button class="secondary" type="button" data-contact-feedback="feedback_positive">J'ai eu le prestataire</button>
            <button class="secondary" type="button" data-contact-feedback="feedback_no_answer">Pas de réponse</button>
            <button class="danger" type="button" data-contact-feedback="feedback_wrong_number">Numéro incorrect</button>
          </div>
        `;
        bindContactFeedbackButtons(provider);
      }
    });
  });

  document.querySelectorAll("[data-copy-profile]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = providerShareText(provider);
      recordLead(provider, "copy");
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = "Contact copié";
          return;
        } catch {
          prompt("Copiez ce contact", text);
          return;
        }
      }
      prompt("Copiez ce contact", text);
    });
  });

  bindContactFeedbackButtons(provider);
}

function bindContactFeedbackButtons(provider) {
  document.querySelectorAll("[data-contact-feedback]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const action = button.dataset.contactFeedback;
      recordLead(provider, action, button.textContent.trim());
      const status = document.querySelector("#profileLeadStatus");
      if (status) {
        status.innerHTML = `<strong>${safe(contactFeedbackLabel(action))}</strong><p>Votre retour aide Zeyds à garder des fiches fiables.</p>`;
      }
    });
  });
}

function setupReviewForms() {
  document.querySelectorAll("[data-review-provider]").forEach((form) => {
    if (form.dataset.bound === "true") return;
    form.dataset.bound = "true";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const currentForm = event.currentTarget;
      if (currentForm.dataset.submitting === "true") return;
      const button = currentForm.querySelector("button[type='submit']");
      const data = new FormData(currentForm);
      const provider = state.providers.find((item) => item.id === currentForm.dataset.reviewProvider);
      if (!provider) {
        currentForm.insertAdjacentHTML("beforeend", `<div class="status-box"><strong>Avis impossible</strong><p>Prestataire introuvable. Rechargez la page puis réessayez.</p></div>`);
        return;
      }
      currentForm.dataset.submitting = "true";
      setBusyButton(button, true, "Envoi...");
      const review = submitReview(provider, data.get("rating"), data.get("message"));
      currentForm.innerHTML = `
        <div class="status-box" id="reviewSubmitStatus" role="status" aria-live="polite">
          <strong>Avis enregistré</strong>
          <p>Merci, votre avis est enregistré dans Zeyds. Envoi vers Supabase en cours...</p>
        </div>
      `;
      renderAdmin();
      renderProviders();
      renderHomeDiscovery();
      renderSavedProviders();
      try {
        const remoteMessage = await submitReviewToSupabase(review, provider);
        const status = currentForm.querySelector("#reviewSubmitStatus");
        if (status) {
          status.innerHTML = `<strong>Merci pour votre avis</strong><p>Votre retour aide Zeyds à mettre en avant les prestataires fiables. ${safe(remoteMessage)}</p>`;
        }
      } catch (error) {
        review.remoteStatus = "local_only";
        const remoteMessage = `Avis gardé en local : ${friendlySupabaseError(error)}. Si besoin, exécutez sql-copie-bizzi/15-avis-clients-supabase.sql dans Supabase.`;
        saveState();
        const status = currentForm.querySelector("#reviewSubmitStatus");
        if (status) {
          status.innerHTML = `<strong>Merci pour votre avis</strong><p>Votre retour aide Zeyds à mettre en avant les prestataires fiables. ${safe(remoteMessage)}</p>`;
        }
      }
      renderAdmin();
      renderProviders();
      renderHomeDiscovery();
      renderSavedProviders();
    });
  });
}

function setupReportForms() {
  document.querySelectorAll("[data-report-provider]").forEach((form) => {
    if (form.dataset.bound === "true") return;
    form.dataset.bound = "true";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const currentForm = event.currentTarget;
      if (currentForm.dataset.submitting === "true") return;
      const button = currentForm.querySelector("button[type='submit']");
      currentForm.dataset.submitting = "true";
      setBusyButton(button, true, "Envoi...");
      const data = new FormData(currentForm);
      const provider = state.providers.find((item) => item.id === currentForm.dataset.reportProvider);
      if (!provider) {
        currentForm.dataset.submitting = "false";
        finishActionButton(button, "Signaler");
        return;
      }
      const report = {
        id: `rep${Date.now()}`,
        providerId: provider.id,
        providerName: provider.fullName,
        service: provider.service,
        reason: data.get("reason"),
        message: data.get("message").trim(),
        status: "open",
        createdAt: new Date().toISOString(),
      };
      state.reports.push(report);
      saveState();
      let remoteMessage = "";
      try {
        remoteMessage = await submitReportToSupabase(report, provider);
      } catch (error) {
        remoteMessage = `Signalement gardé en local : ${friendlySupabaseError(error)}.`;
        report.remoteStatus = "local_only";
        saveState();
      }
      currentForm.innerHTML = `<div class="status-box"><strong>Signalement envoyé</strong><p>L'équipe Zeyds pourra vérifier cette fiche. ${safe(remoteMessage)}</p></div>`;
      renderAdmin();
    });
  });
}

function renderAd() {
  state.ads = [];
}

function renderProviderStatus(message = "") {
  const status = document.querySelector("#providerStatus");
  const target = currentPaymentProvider();
  const targetPayment = target ? [...state.payments].reverse().find((payment) => payment.providerId === target.id) : null;
  const hideStaleRemotePending = target?.remoteStatus === "linked" && target.visibility === "active" && targetPayment?.status === "pending";
  const paymentLine = targetPayment && !hideStaleRemotePending
    ? `<p>Dernier paiement : ${safe(targetPayment.status)} - ${safe(targetPayment.plan)} - ${targetPayment.amount.toLocaleString("fr-FR")} FCFA</p>`
    : "";
  const renewalLine = target ? `<p>${safe(subscriptionLabel(target))}${renewalStatus(target) ? ` - ${safe(renewalStatus(target))}` : ""}</p>` : "";
  status.innerHTML = message || `
    <strong>Statut prestataire</strong>
    <p>${target ? `${safe(target.fullName)} - ${target.visibility === "active" ? "visible" : "en attente"}` : "Aucun prestataire disponible pour un paiement."}</p>
    ${renewalLine}
    ${paymentLine}
  `;
}

function renderEventStatus(message = "") {
  const status = document.querySelector("#eventStatus");
  if (!status) return;
  const pending = pendingLocalEvents().length;
  const published = activeEventPromotions().length;
  status.innerHTML = message || `
    <strong>Statut événements</strong>
    <p>${published} événement(s) publié(s), ${pending} événement(s) en attente de validation admin.</p>
  `;
}

function reportEventFormIssue(form, button, message, fieldName = "") {
  renderEventStatus(`<strong>À corriger</strong><p>${safe(message)}</p>`);
  form.dataset.submitting = "false";
  finishActionButton(button, "Corriger la fiche");
  const field = fieldName ? form.elements.namedItem(fieldName) : null;
  if (field) revealMobileFormField(form, field);
}

function renderEventPaymentOptions() {
  const plansRoot = document.querySelector("#eventPlans");
  const methodsRoot = document.querySelector("#eventPaymentMethods");
  const instructionsRoot = document.querySelector("#eventPaymentInstructions");
  if (!plansRoot || !methodsRoot || !instructionsRoot) return;
  const plan = selectedEventPlan();
  const planIsFree = Number(plan.price || 0) <= 0;
  const paidOptions = document.querySelector("#eventPaidOptions");
  const paymentReferenceRow = document.querySelector("#eventPaymentReferenceRow");
  const paymentReferenceInput = document.querySelector("#eventForm [name='paymentReference']");
  if (paidOptions) paidOptions.hidden = planIsFree;
  if (paymentReferenceRow) paymentReferenceRow.hidden = planIsFree;
  if (paymentReferenceInput) {
    paymentReferenceInput.required = !planIsFree;
    if (planIsFree) paymentReferenceInput.value = "";
  }
  const methods = bizziConfig.payments?.methods || ["Wave"];
  plansRoot.innerHTML = EVENT_PROMOTION_PLANS.map((item) => `
    <button class="event-plan ${item.id === plan.id ? "selected" : ""}" type="button" data-event-plan="${safe(item.id)}">
      <strong>${safe(item.name)}</strong>
      <span>${item.price ? `${item.price.toLocaleString("fr-FR")} FCFA` : "Gratuit"}</span>
      <small>${safe(item.placement)}</small>
    </button>
  `).join("");
  methodsRoot.innerHTML = planIsFree ? `
    <div class="payment-free-note">Aucun paiement pour la formule Standard. Les boosts ciblés restent payants.</div>
  ` : methods.map((method) => `
    <button class="pay event-pay ${method === state.selectedEventPayment ? "selected" : ""}" type="button" data-event-payment="${safe(method)}">${safe(method)}</button>
  `).join("");

  const account = bizziConfig.payments?.accounts?.[state.selectedEventPayment] || "A renseigner";
  const accountReady = hasProductionValue(account);
  const instruction = eventPaymentInstructionText(plan, state.selectedEventPayment);
  instructionsRoot.innerHTML = `
    <div class="payment-head">
      <strong>${safe(plan.name)}</strong>
      <span class="tag ${planIsFree || accountReady ? "ok" : "pending"}">${plan.price ? `${plan.price.toLocaleString("fr-FR")} FCFA` : "Gratuit"}</span>
    </div>
    <p>${safe(plan.placement)}. Ce paiement concerne uniquement la visibilité dans Zeyds.</p>
    ${Number(plan.durationDays || 0) ? `<p><strong>Durée du boost : ${Number(plan.durationDays).toLocaleString("fr-FR")} jour(s).</strong></p>` : ""}
    <p>Les billets restent vendus sur votre lien externe officiel.</p>
    ${planIsFree ? `
      <div class="payment-account-card ready">
        <span>Formule Standard</span>
        <strong>Publication gratuite après validation Zeyds</strong>
      </div>
    ` : `
      <div class="payment-account-card ${accountReady ? "ready" : "todo"}">
        <span>Compte Zeyds ${safe(state.selectedEventPayment)}</span>
        <strong>${safe(accountReady ? account : "Compte Zeyds à renseigner")}</strong>
      </div>
    `}
    <div class="payment-copy-actions">
      <button class="secondary" type="button" data-copy-event-payment-account ${!planIsFree && accountReady ? "" : "disabled"}>Copier compte</button>
      <button class="secondary" type="button" data-copy-event-payment-instruction>Copier instruction</button>
    </div>
  `;

  plansRoot.querySelectorAll("[data-event-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedEventPlanId = button.dataset.eventPlan;
      saveState();
      renderEventPaymentOptions();
    });
  });
  methodsRoot.querySelectorAll("[data-event-payment]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedEventPayment = button.dataset.eventPayment;
      saveState();
      renderEventPaymentOptions();
    });
  });
  instructionsRoot.querySelector("[data-copy-event-payment-account]")?.addEventListener("click", async (event) => {
    const copied = await copyTextToClipboard(account);
    finishActionButton(event.currentTarget, copied ? "Compte copié" : "Copie impossible");
  });
  instructionsRoot.querySelector("[data-copy-event-payment-instruction]")?.addEventListener("click", async (event) => {
    const copied = await copyTextToClipboard(instruction);
    finishActionButton(event.currentTarget, copied ? "Instruction copiée" : "Copie impossible");
  });
}

function renderJobOfferStatus(message = "") {
  const status = document.querySelector("#jobOfferStatus");
  if (!status) return;
  const pending = pendingLocalJobOffers().length;
  const published = activeJobOffers().length;
  status.innerHTML = message || `
    <strong>Statut offres</strong>
    <p>${published} offre(s) publiée(s), ${pending} offre(s) en attente de validation admin.</p>
  `;
}

function renderDeliveryPaymentOptions() {
  const methodsRoot = document.querySelector("#deliveryPaymentMethods");
  const instructionsRoot = document.querySelector("#deliveryPaymentInstructions");
  const amountInput = document.querySelector("#deliveryAmountInput");
  if (!methodsRoot || !instructionsRoot) return;
  updateDeliveryPricingFromForm();
  const methods = BizziPrivacy.paymentMethods(bizziConfig.payments?.methods);
  const amount = Number(amountInput?.value || 0);
  const financials = deliveryFinancials(amount);
  methodsRoot.innerHTML = methods.map((method) => `
    <button class="pay delivery-pay ${method === state.selectedDeliveryPayment ? "selected" : ""}" type="button" data-delivery-payment="${safe(method)}">${safe(method)}</button>
  `).join("");

  const cash = BizziPrivacy.isCash(state.selectedDeliveryPayment);
  const account = cash ? "À remettre au chauffeur/livreur" : bizziConfig.payments?.accounts?.[state.selectedDeliveryPayment] || "A renseigner";
  const accountReady = cash || hasProductionValue(account);
  const instruction = deliveryPaymentInstructionText(financials.amount, state.selectedDeliveryPayment);
  instructionsRoot.innerHTML = BizziPrivacy.paymentPanel({
    method: state.selectedDeliveryPayment,
    amountText: formatMoney(financials.amount),
    account,
    accountReady,
  });

  methodsRoot.querySelectorAll("[data-delivery-payment]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDeliveryPayment = button.dataset.deliveryPayment;
      saveState();
      renderDeliveryPaymentOptions();
    });
  });
  instructionsRoot.querySelector("[data-copy-delivery-payment-account]")?.addEventListener("click", async (event) => {
    const copied = await copyTextToClipboard(account);
    finishActionButton(event.currentTarget, copied ? "Compte copié" : "Copie impossible");
  });
  instructionsRoot.querySelector("[data-copy-delivery-payment-instruction]")?.addEventListener("click", async (event) => {
    const copied = await copyTextToClipboard(instruction);
    finishActionButton(event.currentTarget, copied ? "Instruction copiée" : "Copie impossible");
  });
}

function deliveryPricingFormOptions() {
  const form = document.querySelector("#deliveryRequestForm");
  if (!form) return {};
  const data = new FormData(form);
  return {
    distanceKm: data.get("distanceKm"),
    urgency: data.get("urgency") || "today",
    scheduledAt: data.get("scheduledAt") || "",
    badWeather: data.get("badWeather") === "on",
  };
}

function deliveryRequestSubmitLabel() {
  return document.querySelector("#deliveryRequestType")?.value === "ride" ? "Valider la course" : "Valider la livraison";
}

function updateDeliveryRequestTypeUi() {
  const ride = document.querySelector("#deliveryRequestType")?.value === "ride";
  const parcelLabel = document.querySelector("#deliveryParcelLabel");
  const passengerLabel = document.querySelector("#deliveryPassengerLabel");
  const vehicleLabel = document.querySelector("#deliveryVehicleLabel");
  const parcel = parcelLabel?.querySelector("input");
  const passengers = passengerLabel?.querySelector("input");
  if (parcelLabel) parcelLabel.hidden = ride;
  if (passengerLabel) passengerLabel.hidden = !ride;
  if (vehicleLabel) vehicleLabel.hidden = !ride;
  if (parcel) parcel.required = !ride;
  if (passengers) passengers.required = ride;
  const setText = (selector, value) => { const node = document.querySelector(selector); if (node) node.textContent = value; };
  setText("#deliveryPickupLabel span", ride ? "Lieu de départ" : "Lieu de récupération");
  setText("#deliveryDropoffLabel span", ride ? "Destination" : "Lieu de livraison");
  setText("#deliveryCreateTitle", ride ? "Commander une course taxi" : "Commander une livraison");
  setText("#deliveryPaymentTitle", ride ? "Paiement course taxi" : "Paiement livraison");
  setText("#deliverySubmitButton", deliveryRequestSubmitLabel());
  document.querySelectorAll("[data-delivery-kind]").forEach((button) => {
    const selected = button.dataset.deliveryKind === (ride ? "ride" : "delivery");
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  renderDelivery();
}

function updateDeliveryDistanceEstimateFromForm({ force = false } = {}) {
  const form = document.querySelector("#deliveryRequestForm");
  const distanceInput = document.querySelector("#deliveryDistanceInput");
  if (!form || !distanceInput) return null;
  if (distanceInput.dataset.manualDistance === "true" && !force) return null;
  const data = new FormData(form);
  const pickup = String(data.get("pickup") || "").trim();
  const dropoff = String(data.get("dropoff") || "").trim();
  const city = String(data.get("city") || "").trim() || currentCity();
  const currentPickup = currentPickupPointFromFormData(data);
  const currentDropoff = currentDropoffPointFromFormData(data);
  const key = deliveryMapDistanceKey(pickup, dropoff, city, currentPickup, currentDropoff);
  if (distanceInput.dataset.autoDistance === "mapbox" && distanceInput.dataset.mapboxKey === key && !force) {
    return null;
  }
  const waitingForCurrentPickup = normalizedCatalogKey(pickup).startsWith("mapositionactuelle") && !currentPickup;
  if (waitingForCurrentPickup) {
    distanceInput.value = "";
    distanceInput.dataset.autoDistance = "";
    distanceInput.dataset.autoDistanceLabel = "";
    return null;
  }
  const dropoffPoint = currentDropoff || deliveryLocationPoint(dropoff, city);
  const estimatedRoute = currentPickup && dropoffPoint
    ? estimateDeliveryDistanceBetweenPoints(currentPickup, dropoffPoint)
    : estimateDeliveryDistanceKm(pickup, dropoff, city);
  const estimate = estimatedRoute || (pickup && dropoff ? { distanceKm: 5, from: pickup, to: dropoff } : null);
  if (!estimate) {
    distanceInput.dataset.autoDistance = "";
    distanceInput.dataset.autoDistanceLabel = "";
    return null;
  }
  distanceInput.value = String(estimate.distanceKm);
  distanceInput.dataset.autoDistance = "internal";
  distanceInput.dataset.autoDistanceLabel = `${estimate.from} vers ${estimate.to}`;
  return estimate;
}

function updateDeliveryScheduleFields() {
  const urgency = document.querySelector("#deliveryUrgencySelect")?.value || "today";
  const scheduledInput = document.querySelector("#deliveryScheduledAtInput");
  if (!scheduledInput) return;
  const nowValue = deliveryDateTimeValue(new Date());
  scheduledInput.min = nowValue;
  if (urgency === "now") {
    scheduledInput.value = nowValue;
    scheduledInput.disabled = true;
    scheduledInput.required = false;
  } else {
    scheduledInput.disabled = false;
    scheduledInput.required = urgency === "scheduled";
    if (!scheduledInput.value) scheduledInput.value = nowValue;
  }
}

function updateDeliveryPricingFromForm() {
  const amountInput = document.querySelector("#deliveryAmountInput");
  const summary = document.querySelector("#deliveryPricingSummary");
  const paymentStage = document.querySelector("#deliveryPaymentStage");
  if (!amountInput && !summary) return deliveryPricingDetails();

  updateDeliveryScheduleFields();
  updateDeliveryDistanceEstimateFromForm();
  scheduleDeliveryMapDistanceLookup();
  const pricing = deliveryPricingDetails(deliveryPricingFormOptions());
  if (amountInput) {
    amountInput.value = pricing.suggestedAmount || "";
    amountInput.dataset.suggestedAmount = String(pricing.suggestedAmount || 0);
  }
  if (summary) {
    if (!pricing.distanceKm) {
      summary.innerHTML = `
        <strong>Tarif automatique</strong>
        <p>Renseignez le départ et la destination.</p>
      `;
    } else {
      const financials = deliveryFinancials(pricing.suggestedAmount);
      const ride = document.querySelector("#deliveryRequestType")?.value === "ride";
      summary.innerHTML = `
        <strong>${safe(formatMoney(financials.amount))}</strong>
        <p>Tarif de la ${ride ? "course" : "livraison"} calculé automatiquement.</p>
      `;
    }
  }
  if (paymentStage) paymentStage.hidden = !pricing.suggestedAmount;
  return pricing;
}

function renderDeliveryPickupGeoStatus(message = "", ok = true) {
  const status = document.querySelector("#deliveryPickupGeoStatus");
  if (!status) return;
  status.textContent = message;
  status.hidden = !String(message || "").trim();
  status.classList.toggle("error", !ok);
}

function browserCurrentPosition() {
  if (globalThis.BizziGeoPrecision?.acquire) {
    return globalThis.BizziGeoPrecision.acquire({
      targetAccuracy: 15,
      acceptableAccuracy: 60,
      timeout: 20000,
    });
  }
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Géolocalisation indisponible sur cet appareil."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });
  });
}

async function useCurrentLocationAsDeliveryPickup(button = null) {
  const form = document.querySelector("#deliveryRequestForm");
  if (!form) return;
  setBusyButton(button, true, "Position...");
  renderDeliveryPickupGeoStatus("Recherche de votre position actuelle...");
  try {
    const position = await browserCurrentPosition();
    const userPoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: Math.round(Number(position.coords.accuracy || 0)) || null,
      timestamp: Number(position.timestamp || Date.now()),
    };
    const nearestCity = nearestCityFromPoint(userPoint) || currentCity();
    const pickupInput = form.querySelector("input[name='pickup']");
    const cityInput = form.querySelector("input[name='city']");
    const latInput = form.querySelector("#deliveryPickupLatitude");
    const lngInput = form.querySelector("#deliveryPickupLongitude");
    const accuracyInput = form.querySelector("#deliveryPickupAccuracy");
    if (pickupInput) {
      pickupInput.value = nearestCity && cityIsSpecific(nearestCity)
        ? `Ma position actuelle - ${nearestCity}`
        : "Ma position actuelle";
    }
    if (cityInput && (!cityInput.value || cityInput.value === "Toute la Côte d'Ivoire")) cityInput.value = nearestCity;
    if (latInput) latInput.value = String(userPoint.lat);
    if (lngInput) lngInput.value = String(userPoint.lng);
    if (accuracyInput) accuracyInput.value = userPoint.accuracy ? String(userPoint.accuracy) : "";

    const distanceInput = document.querySelector("#deliveryDistanceInput");
    if (distanceInput) {
      distanceInput.dataset.manualDistance = "";
      distanceInput.dataset.mapboxKey = "";
      distanceInput.dataset.mapboxStatus = "";
      distanceInput.dataset.mapboxError = "";
    }
    state.userLocation = userPoint;
    if (cityIsSpecific(nearestCity)) {
      state.selectedCity = nearestCity;
      const citySelect = document.querySelector("#citySelect");
      if (citySelect) citySelect.value = nearestCity;
    }
    saveState();
    renderGeoStatus();
    updateDeliveryPricingFromForm();
    renderDeliveryPaymentOptions();
    renderDeliveryPickupGeoStatus(
      userPoint.accuracy
        ? `Position confirmée à ±${userPoint.accuracy} m. Indiquez maintenant la destination.`
        : "Position confirmée. Indiquez maintenant la destination."
    );
    renderDelivery();
    finishActionButton(button, "Position utilisée");
  } catch (error) {
    renderDeliveryPickupGeoStatus(error?.message || "Position refusée ou imprécise. Réessayez ou saisissez le départ.", false);
    finishActionButton(button, "Réessayer");
  }
}

function renderJobPaymentOptions() {
  const plansRoot = document.querySelector("#jobPlans");
  const methodsRoot = document.querySelector("#jobPaymentMethods");
  const instructionsRoot = document.querySelector("#jobPaymentInstructions");
  if (!plansRoot || !methodsRoot || !instructionsRoot) return;
  const plan = selectedJobPlan();
  const methods = bizziConfig.payments?.methods || ["Wave", "Orange Money", "MTN Money"];
  plansRoot.innerHTML = JOB_OFFER_PLANS.map((item) => `
    <button class="job-plan ${item.id === plan.id ? "selected" : ""}" type="button" data-job-plan="${safe(item.id)}">
      <strong>${safe(item.name)}</strong>
      <span>${item.price.toLocaleString("fr-FR")} FCFA</span>
      <small>${item.credits > 1 ? `${item.credits} offres` : `${item.days} jours`}${item.boost ? " - boost Assistant" : ""}</small>
    </button>
  `).join("");
  methodsRoot.innerHTML = methods.map((method) => `
    <button class="pay job-pay ${method === state.selectedJobPayment ? "selected" : ""}" type="button" data-job-payment="${safe(method)}">${safe(method)}</button>
  `).join("");

  const account = bizziConfig.payments?.accounts?.[state.selectedJobPayment] || "A renseigner";
  const accountReady = hasProductionValue(account);
  const instruction = jobPaymentInstructionText(plan, state.selectedJobPayment);
  instructionsRoot.innerHTML = `
    <div class="payment-head">
      <strong>${safe(plan.name)}</strong>
      <span class="tag ${accountReady ? "ok" : "pending"}">${plan.price.toLocaleString("fr-FR")} FCFA</span>
    </div>
    <p>${plan.credits > 1 ? `Pack de ${plan.credits} offres, validé manuellement par Zeyds.` : `Publication pendant ${plan.days} jours.`} ${plan.boost ? "Mise en avant dans Emplois et Recherche Zeyds." : ""}</p>
    <p>Après l'envoi, Zeyds crée une référence de suivi et l'associe au contact indiqué pour garder une trace en cas de réclamation.</p>
    <div class="payment-account-card ${accountReady ? "ready" : "todo"}">
      <span>Compte Zeyds ${safe(state.selectedJobPayment)}</span>
      <strong>${safe(accountReady ? account : "Compte Zeyds à renseigner")}</strong>
    </div>
    <div class="payment-copy-actions">
      <button class="secondary" type="button" data-copy-job-payment-account ${accountReady ? "" : "disabled"}>Copier compte</button>
      <button class="secondary" type="button" data-copy-job-payment-instruction>Copier instruction</button>
    </div>
  `;

  plansRoot.querySelectorAll("[data-job-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedJobPlanId = button.dataset.jobPlan;
      saveState();
      renderJobPaymentOptions();
    });
  });
  methodsRoot.querySelectorAll("[data-job-payment]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedJobPayment = button.dataset.jobPayment;
      saveState();
      renderJobPaymentOptions();
    });
  });
  instructionsRoot.querySelector("[data-copy-job-payment-account]")?.addEventListener("click", async (event) => {
    const copied = await copyTextToClipboard(account);
    finishActionButton(event.currentTarget, copied ? "Compte copié" : "Copie impossible");
  });
  instructionsRoot.querySelector("[data-copy-job-payment-instruction]")?.addEventListener("click", async (event) => {
    const copied = await copyTextToClipboard(instruction);
    finishActionButton(event.currentTarget, copied ? "Instruction copiée" : "Copie impossible");
  });
}

function renderPaymentInstructions() {
  syncProviderPricingButtons();
  const box = document.querySelector("#paymentInstructions");
  const method = state.selectedPayment;
  const account = bizziConfig.payments?.accounts?.[method] || "A renseigner";
  const accountReady = hasProductionValue(account);
  const accountLabel = accountReady ? account : "Compte Zeyds à renseigner";
  const instruction = paymentInstructionText(method);
  const plan = selectedProviderPlan();
  const boost = selectedProviderBoost();
  const total = selectedProviderPaymentTotal();
  box.innerHTML = `
    <div class="payment-head">
      <strong>Instruction ${safe(method)}</strong>
      <span class="tag ${accountReady ? "ok" : "pending"}">${accountReady ? "Compte prêt" : "À renseigner"}</span>
    </div>
    <p>Forfait : ${safe(plan.name)} - ${plan.price.toLocaleString("fr-FR")} FCFA. ${boost.price ? `Boost : ${safe(boost.name)} - ${boost.price.toLocaleString("fr-FR")} FCFA.` : "Boost : aucun."}</p>
    <p><strong>Total à payer : ${total.toLocaleString("fr-FR")} FCFA.</strong></p>
    <div class="payment-account-card ${accountReady ? "ready" : "todo"}">
      <span>Compte Zeyds ${safe(method)}</span>
      <strong>${safe(accountLabel)}</strong>
    </div>
    <p>${accountReady ? "Après paiement, saisissez la référence et ajoutez une preuve si possible." : "Pour le lancement, renseignez un numéro dédié Zeyds dans config.js avant de publier publiquement."}</p>
    <div class="payment-copy-actions">
      <button class="secondary" type="button" data-copy-payment-account ${accountReady ? "" : "disabled"}>Copier compte</button>
      <button class="secondary" type="button" data-copy-payment-instruction>Copier instruction</button>
    </div>
  `;
  box.querySelector("[data-copy-payment-account]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim();
    const copied = await copyTextToClipboard(account);
    finishActionButton(button, copied ? "Compte copié" : "Copie impossible");
  });
  box.querySelector("[data-copy-payment-instruction]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim();
    const copied = await copyTextToClipboard(instruction);
    finishActionButton(button, copied ? "Instruction copiée" : "Copie impossible");
  });
}

function syncProviderPricingButtons() {
  document.querySelectorAll(".plan").forEach((button) => {
    button.classList.toggle("selected", button.dataset.plan === selectedProviderPlan().name);
  });
  document.querySelectorAll(".boost-plan").forEach((button) => {
    button.classList.toggle("selected", (button.dataset.boost || "none") === selectedProviderBoost().id);
  });
}

function renderPaymentProviderOptions() {
  const select = document.querySelector("#paymentProviderSelect");
  const note = document.querySelector("#paymentTargetNote");
  const quickPick = document.querySelector("#paymentProviderQuickPick");
  const label = document.querySelector(".provider-target-label");
  const submitButton = document.querySelector("#paymentForm button[type='submit']");
  if (!select || !note) return;

  const providers = paymentTargetProviders();
  if (!providers.length) {
    if (label) label.classList.add("is-hidden");
    select.innerHTML = `<option value="">Identifiez votre profil</option>`;
    select.disabled = true;
    if (quickPick) quickPick.innerHTML = `
      <div class="provider-identity-card muted">
        <strong>Identification requise</strong>
        <span>Entrez votre téléphone ou WhatsApp plus haut pour afficher uniquement votre profil et renouveler.</span>
      </div>
    `;
    note.innerHTML = `
      <p>Votre abonnement se renouvelle après identification du prestataire. Les autres profils ne sont pas affichés ici.</p>
      <p>Si votre profil existe mais n'est pas retrouvé, cliquez sur <strong>Recharger prestataires Supabase</strong>, puis réessayez avec le même numéro.</p>
    `;
    if (submitButton) submitButton.disabled = true;
    return;
  }

  let selected = currentPaymentProvider();
  if (!selected) {
    selected = providers[providers.length - 1];
  }
  if (selected.id !== state.selectedPaymentProviderId) {
    state.selectedPaymentProviderId = selected.id;
    saveState();
  }

  if (label) label.classList.add("is-hidden");
  select.disabled = false;
  select.innerHTML = providers.map((provider) => `
    <option value="${safe(provider.id)}">${safe(provider.fullName)} - ${safe(providerServicesLabel(provider))} - ${safe(provider.city || provider.area || "Côte d'Ivoire")}</option>
  `).join("");
  select.value = selected.id;
  if (quickPick) {
    quickPick.innerHTML = `
      <div class="provider-identity-card selected">
        ${providerMedia(selected)}
        <div>
          <strong>${safe(selected.fullName)}</strong>
          <span>${safe(selected.service || "Métier à préciser")} - ${safe(selected.city || selected.area || "Côte d'Ivoire")}</span>
          <small>${safe(selected.phone || selected.whatsapp || "contact enregistré")} · ${safe(subscriptionLabel(selected))}</small>
        </div>
        <button class="secondary compact-action" type="button" data-clear-provider-identity>Changer</button>
      </div>
    `;
    quickPick.querySelector("[data-clear-provider-identity]")?.addEventListener("click", () => clearProviderIdentification());
  }
  if (submitButton) submitButton.disabled = false;
  note.innerHTML = `
    <p>Paiement préparé pour <strong>${safe(selected.fullName)}</strong> - ${safe(selected.service)}.</p>
    <p>${safe(subscriptionLabel(selected))}${renewalStatus(selected) ? ` - ${safe(renewalStatus(selected))}` : ""}</p>
  `;
  select.onchange = () => setPaymentProvider(select.value);
}

function setupSocialSharing() {
  const whatsapp = document.querySelector("#shareBizziWhatsApp");
  const copy = document.querySelector("#copyBizziLink");
  if (!whatsapp) return;
  whatsapp.href = `https://wa.me/?text=${encodeURIComponent(appShareText())}`;
  if (!copy) return;
  copy.addEventListener("click", async () => {
    const text = appShareText();
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copy.textContent = "Lien copié";
        return;
      } catch {
        prompt("Copiez ce lien", text);
        return;
      }
    }
    prompt("Copiez ce lien", text);
  });
}

function localOnlyBrowserTestMode() {
  return /^(127\.0\.0\.1|localhost|::1)$/i.test(location.hostname) && location.search.includes("localOnly=1");
}

function revealMobileFormField(form, field, { focus = true } = {}) { globalThis.BizziMobileForms?.revealField(form, field, { focus }); }
function resetMobileFormWizard(form) { globalThis.BizziMobileForms?.reset(form); }

function setupMobileFormWizards() {
  globalThis.BizziMobileForms?.setup({ isValidPhone: isValidContactPhone, contactMessage: contactValidationMessage, defaultEventCity, state, saveState });
}

function setupForms() {
  setupMobileFormWizards();
  const renderDeliveryPaymentOptionsSmooth = debounce(renderDeliveryPaymentOptions, 120);
  document.querySelector("#deliveryRequestType")?.addEventListener("change", () => {
    updateDeliveryRequestTypeUi();
    renderDeliveryPaymentOptions();
  });
  document.querySelectorAll("[data-delivery-kind]").forEach((button) => button.addEventListener("click", () => {
    const type = button.dataset.deliveryKind === "delivery" ? "delivery" : "ride";
    const select = document.querySelector("#deliveryRequestType");
    if (select) select.value = type;
    updateDeliveryRequestTypeUi();
    renderDeliveryPaymentOptions();
  }));
  document.querySelector("#deliveryRequestForm [name='vehicleType']")?.addEventListener("change", renderDelivery);
  updateDeliveryRequestTypeUi();
  document.querySelector("#deliveryPickupCurrentButton")?.addEventListener("click", (event) => {
    useCurrentLocationAsDeliveryPickup(event.currentTarget);
  });
  document.querySelector("#deliveryAmountInput")?.addEventListener("input", renderDeliveryPaymentOptionsSmooth);
  document.querySelector("#deliveryDistanceInput")?.addEventListener("input", (event) => {
    event.currentTarget.dataset.manualDistance = "true";
    event.currentTarget.dataset.autoDistance = "";
    event.currentTarget.dataset.autoDistanceLabel = "";
    renderDeliveryPaymentOptionsSmooth();
  });
  ["input[name='pickup']", "input[name='dropoff']", "input[name='city']"].forEach((selector) => {
    document.querySelector(`#deliveryRequestForm ${selector}`)?.addEventListener("input", (event) => {
      if (event.currentTarget.name === "pickup") {
        const latInput = document.querySelector("#deliveryPickupLatitude");
        const lngInput = document.querySelector("#deliveryPickupLongitude");
        const accuracyInput = document.querySelector("#deliveryPickupAccuracy");
        if (latInput) latInput.value = "";
        if (lngInput) lngInput.value = "";
        if (accuracyInput) accuracyInput.value = "";
        renderDeliveryPickupGeoStatus();
      }
      const distanceInput = document.querySelector("#deliveryDistanceInput");
      if (distanceInput) {
        distanceInput.dataset.manualDistance = "";
        distanceInput.dataset.mapboxKey = "";
        distanceInput.dataset.mapboxStatus = "";
        distanceInput.dataset.mapboxError = "";
      }
      renderDeliveryPaymentOptionsSmooth();
    });
  });
  ["#deliveryScheduledAtInput", "#deliveryBadWeatherInput", "#deliveryUrgencySelect"].forEach((selector) => {
    document.querySelector(selector)?.addEventListener("input", renderDeliveryPaymentOptionsSmooth);
    document.querySelector(selector)?.addEventListener("change", renderDeliveryPaymentOptions);
  });
  document.querySelector("#exceptionSubmitToggle")?.addEventListener("click", (event) => {
    const panel = document.querySelector("#exceptionSubmitPanel");
    if (!panel) return;
    panel.hidden = !panel.hidden;
    event.currentTarget.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
    event.currentTarget.textContent = panel.hidden ? "Inscrire un lieu gratuitement" : "Fermer le formulaire";
    if (!panel.hidden) {
      renderExceptionPlaces();
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  document.querySelector("#exceptionPaymentMethod")?.addEventListener("change", (event) => {
    state.selectedExceptionPayment = event.currentTarget.value;
    saveState();
  });
  document.querySelector("#exceptionPlaceForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.submitting === "true") return;
    const button = form.querySelector("button[type='submit']");
    const data = new FormData(form);
    const plan = exceptionPlanById(state.selectedExceptionPlanId);
    const contactPhone = String(data.get("contactPhone") || "").trim();
    const paymentReference = String(data.get("paymentReference") || "").trim();
    const adminGrant = adminUnlocked && data.get("adminGrant") === "on";
    if (!isValidContactPhone(contactPhone)) {
      renderExceptionPlaces(contactValidationMessage("contact du lieu"));
      return;
    }
    if (!adminGrant && Number(plan.price || 0) > 0 && !paymentReference) {
      renderExceptionPlaces(`Le ${plan.name} est payant : renseignez la référence de transaction.`);
      form.querySelector("[name='paymentReference']")?.focus();
      return;
    }
    form.dataset.submitting = "true";
    setBusyButton(button, true, "Envoi...");
    const photoFile = data.get("photo");
    const photo = await readPhotoFile(photoFile);
    const now = new Date().toISOString();
    const effectivePlan = adminGrant ? EXCEPTION_PLACE_PLANS[0] : plan;
    const place = normalizeExceptionPlace({
      id: `exception-place-${Date.now()}`,
      name: data.get("name"),
      ownerName: data.get("ownerName"),
      contactPhone,
      city: data.get("city"),
      area: data.get("area"),
      address: data.get("address"),
      latitude: data.get("latitude"),
      longitude: data.get("longitude"),
      locationAccuracy: data.get("locationAccuracy"),
      locationTimestamp: data.get("locationTimestamp"),
      locationLabel: data.get("locationLabel"),
      locationFullAddress: data.get("locationFullAddress"),
      description: data.get("description"),
      photo,
      planId: effectivePlan.id,
      planName: adminGrant ? "Offert par Zeyds" : effectivePlan.name,
      amount: adminGrant ? 0 : effectivePlan.price,
      paymentMethod: adminGrant || !effectivePlan.price ? "" : (data.get("paymentMethod") || state.selectedExceptionPayment),
      paymentReference: adminGrant ? "" : paymentReference,
      paymentStatus: adminGrant || !effectivePlan.price ? "approved" : "pending",
      boostDays: adminGrant ? 0 : effectivePlan.boostDays,
      adminGrant,
      status: adminGrant ? "published" : "pending",
      visibilityStartsAt: adminGrant ? now : "",
      visibilityEndsAt: adminGrant ? isoDaysFromNow(30) : "",
      createdAt: now,
    });
    state.exceptionPlaces.unshift(place);
    saveState();
    let remoteMessage = adminGrant ? "Ajout gratuit Zeyds publié sur cet appareil." : "";
    try {
      remoteMessage = adminGrant
        ? await submitAdminFreeExceptionPlaceToSupabase(place, { photoFile })
        : await submitExceptionPlaceToSupabase(place, { photoFile });
    } catch (error) {
      place.remoteStatus = "local_only";
      remoteMessage = `Lieu conservé localement : ${friendlySupabaseError(error)}. Installez le SQL Lieux d’exception V304 dans Supabase.`;
      saveState();
    }
    form.reset();
    state.selectedExceptionPlanId = "free_30_days";
    saveState();
    renderExceptionPlaces(`${place.name} enregistré. ${adminGrant ? `Publication gratuite active pendant 30 jours. ${remoteMessage}` : `Dossier en attente de validation Zeyds. ${remoteMessage}`}`);
    renderHomeDiscovery();
    renderAdmin();
    form.dataset.submitting = "false";
    finishActionButton(button, adminGrant ? "Lieu publié" : "Dossier envoyé");
  });
  document.querySelector("#foodSubmitToggle")?.addEventListener("click", (event) => {
    const panel = document.querySelector("#foodSubmitPanel");
    if (!panel) return;
    panel.hidden = !panel.hidden;
    event.currentTarget.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
    event.currentTarget.textContent = panel.hidden ? "Proposer une adresse Food" : "Fermer le formulaire Food";
    if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelector("#foodForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.submitting === "true") return;
    const button = form.querySelector("button[type='submit']");
    form.dataset.submitting = "true";
    setBusyButton(button, true, "Envoi...");
    const data = new FormData(form);
    const contactPhone = String(data.get("contactPhone") || "").trim();
    if (!isValidContactPhone(contactPhone)) {
      renderFoodStatus(contactValidationMessage("contact Food"));
      form.dataset.submitting = "false";
      finishActionButton(button, "Corriger contact");
      return;
    }
    const photoFile = data.get("photo");
    const photo = await readPhotoFile(photoFile);
    const mainSpecialty = String(data.get("mainSpecialty") || FOOD_SPECIALTIES[0]).trim();
    const place = normalizeFoodPlace({
      id: `food${Date.now()}`,
      name: data.get("name"),
      ownerName: data.get("ownerName"),
      contactPhone,
      placeType: data.get("placeType"),
      mainSpecialty,
      specialties: normalizeFoodSpecialties(`${mainSpecialty}, ${data.get("specialties") || ""}`),
      city: data.get("city"),
      area: data.get("area"),
      address: data.get("address"),
      latitude: data.get("latitude"),
      longitude: data.get("longitude"),
      locationAccuracy: data.get("locationAccuracy"),
      locationTimestamp: data.get("locationTimestamp"),
      locationLabel: data.get("locationLabel"),
      locationFullAddress: data.get("locationFullAddress"),
      averageBudget: data.get("averageBudget"),
      openingHours: data.get("openingHours"),
      deliveryAvailable: data.get("deliveryAvailable") === "on",
      description: data.get("description"),
      photo,
      status: "pending",
      verificationStatus: "pending",
      submissionReference: generateSubmissionReference("FOOD", contactPhone),
      createdAt: new Date().toISOString(),
    });
    state.foodPlaces.unshift(place);
    saveState();
    let remoteMessage = "";
    try {
      remoteMessage = await submitFoodPlaceToSupabase(place, { photoFile });
    } catch (error) {
      place.remoteStatus = "local_only";
      remoteMessage = `Adresse Food gardée en local : ${friendlySupabaseError(error)}. Exécutez sql-copie-bizzi/91-bizzi-food-v204.sql pour activer Food dans Supabase.`;
      saveState();
    }
    form.reset();
    renderFood();
    renderAdmin();
    renderFoodStatus(`Adresse Food reçue : ${safe(place.name)} (${safe(place.mainSpecialty)}). Dossier ${safe(place.submissionReference)}. Elle est en attente de validation Zeyds. ${safe(remoteMessage)}`);
    form.dataset.submitting = "false";
    finishActionButton(button, "Adresse envoyée");
  });

  document.querySelector("#eventForm")?.addEventListener("submit", async (eventSubmit) => {
    eventSubmit.preventDefault();
    const form = eventSubmit.currentTarget;
    if (form.dataset.submitting === "true") return;
    const button = form.querySelector("button[type='submit']");
    form.dataset.submitting = "true";
    setBusyButton(button, true, "Envoi...");
    const data = new FormData(form);
    const plan = selectedEventPlan();
    const contactPhone = String(data.get("contactPhone") || "").trim();
    const ticketUrl = String(data.get("ticketUrl") || "").trim();
    const startDate = new Date(String(data.get("dateTime") || ""));
    const endDate = new Date(String(data.get("endDateTime") || ""));
    if (!isValidContactPhone(contactPhone)) {
      reportEventFormIssue(form, button, contactValidationMessage("contact organisateur"), "contactPhone");
      return;
    }
    if (ticketUrl && !safeExternalUrl(ticketUrl)) {
      reportEventFormIssue(form, button, "Le lien officiel doit commencer par http ou https.", "ticketUrl");
      return;
    }
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      reportEventFormIssue(form, button, "La date de fin doit être renseignée et être après la date de début.", "endDateTime");
      return;
    }
    if (!String(data.get("city") || "").trim()) {
      reportEventFormIssue(form, button, "Choisissez la ville de l'événement avant l'envoi.", "city");
      return;
    }
    const posterFile = data.get("poster");
    const poster = await readPhotoFile(posterFile);
    const providedReference = String(data.get("paymentReference") || "").trim();
    if (Number(plan.price || 0) > 0 && !providedReference) {
      reportEventFormIssue(form, button, `Le boost ${plan.name} est payant : saisissez la référence réelle de la transaction avant l'envoi.`, "paymentReference");
      return;
    }
    const submissionReference = generateSubmissionReference("EVT", contactPhone);
    const promotion = normalizeEventPromotion({
      id: `evt${Date.now()}`,
      title: data.get("title"),
      organizerName: data.get("organizerName"),
      contactPhone,
      category: data.get("category"),
      dateTime: data.get("dateTime"),
      endDateTime: data.get("endDateTime"),
      venue: data.get("venue"),
      city: data.get("city"),
      area: data.get("area"),
      address: data.get("address"),
      latitude: data.get("latitude"),
      longitude: data.get("longitude"),
      visibilityRadiusKm: data.get("visibilityRadiusKm"),
      poster,
      ticketPrice: data.get("ticketPrice"),
      ticketUrl: safeExternalUrl(ticketUrl),
      description: data.get("description"),
      planId: plan.id,
      planName: plan.name,
      boostDurationDays: plan.durationDays || 0,
      amount: plan.price,
      currency: bizziConfig.currency || "FCFA",
      paymentMethod: state.selectedEventPayment,
      paymentReference: providedReference || generateEventPaymentReference(contactPhone, plan),
      submissionReference,
      paymentStatus: Number(plan.price || 0) > 0 ? "pending" : "approved",
      isSponsored: plan.sponsored,
      isPremium: plan.premium,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    state.eventPromotions.unshift(promotion);
    state.selectedEventEntryMode = "promote";
    saveState();
    let remoteMessage = "";
    if (localOnlyBrowserTestMode()) {
      promotion.remoteStatus = "local_only";
      remoteMessage = "Test local sans Supabase.";
      saveState();
    } else {
      try {
        remoteMessage = await submitEventPromotionToSupabase(promotion, { posterFile });
      } catch (error) {
        promotion.remoteStatus = "local_only";
        remoteMessage = `Événement gardé en local : ${friendlySupabaseError(error)}. Reprenez la synchronisation depuis l'admin Zeyds.`;
        saveState();
      }
    }
    saveState();
    form.reset();
    form.querySelector("[name='endDateTime']").dataset.userEdited = "false";
    state.selectedEventPlanId = "standard";
    const nextEventCity = form.elements.namedItem("city");
    if (nextEventCity) nextEventCity.value = defaultEventCity();
    resetMobileFormWizard(form);
    saveState();
    renderEventPaymentOptions();
    renderEventStatus(`Événement reçu avec forfait ${plan.name} (${plan.price ? `${plan.price.toLocaleString("fr-FR")} FCFA` : "gratuit"}). Dossier ${promotion.submissionReference}. Référence visibilité : ${promotion.paymentReference}. ${remoteMessage}`);
    renderEvents();
    renderAdmin();
    renderLaunchChecklist();
    form.dataset.submitting = "false";
    finishActionButton(button, "Envoyé");
  });

  document.querySelector("#jobOfferForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.submitting === "true") return;
    const button = form.querySelector("button[type='submit']");
    form.dataset.submitting = "true";
    const data = new FormData(form);
    const plan = selectedJobPlan();
    const contactPhone = String(data.get("contactPhone") || "").trim();
    const selectedService = canonicalServiceName(data.get("service"));
    if (!isValidContactPhone(contactPhone)) {
      renderJobOfferStatus(contactValidationMessage("contact entreprise"));
      form.dataset.submitting = "false";
      finishActionButton(button, "Payer et envoyer l'offre");
      return;
    }
    if (isPlaceholderServiceName(selectedService)) {
      renderJobOfferStatus("Choisissez un métier avant d'envoyer l'offre emploi / mission.");
      form.dataset.submitting = "false";
      finishActionButton(button, "Payer et envoyer l'offre");
      return;
    }
    const paymentReference = generateJobPaymentReference(contactPhone, plan);
    const job = normalizeJobOffer({
      id: `job${Date.now()}`,
      title: data.get("title"),
      companyName: data.get("companyName"),
      companyType: data.get("companyType"),
      contactPhone,
      contactEmail: data.get("contactEmail"),
      service: selectedService,
      city: data.get("city"),
      area: data.get("area"),
      contractType: data.get("contractType"),
      salaryRange: data.get("salaryRange"),
      externalUrl: "",
      description: data.get("description"),
      source: "Zeyds",
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      currency: bizziConfig.currency || "FCFA",
      paymentMethod: state.selectedJobPayment,
      paymentReference,
      submissionReference: generateSubmissionReference("EMP", contactPhone),
      paymentProof: "",
      paymentProofName: "",
      paymentStatus: "pending",
      isBoosted: plan.boost,
      jobCredits: plan.credits,
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: isoDaysFromNow(plan.days),
    });
    state.jobOffers.unshift(job);
    saveState();
    setBusyButton(button, true, "Envoi...");
    let remoteMessage = "";
    try {
      remoteMessage = await submitJobOfferToSupabase(job);
    } catch (error) {
      job.remoteStatus = "local_only";
      remoteMessage = `Offre payée gardée en local : ${friendlySupabaseError(error)}. Exécutez sql-copie-bizzi/59-emplois-missions-toutes-entreprises-v130.sql pour activer les offres payantes Supabase.`;
      saveState();
    }
    saveState();
    form.reset();
    renderJobPaymentOptions();
    renderJobOfferStatus(`Offre reçue avec forfait ${plan.name} (${plan.price.toLocaleString("fr-FR")} FCFA). Dossier ${job.submissionReference}. Référence Zeyds : ${job.paymentReference}. Elle est liée au contact ${job.contactPhone || "non renseigné"} pour la traçabilité. ${remoteMessage}`);
    renderJobs();
    renderAdmin();
    renderLaunchChecklist();
    form.dataset.submitting = "false";
    finishActionButton(button, "Envoyée");
  });

  document.querySelector("#deliveryRequestForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.submitting === "true") return;
    const button = form.querySelector("button[type='submit']");
    form.dataset.submitting = "true";
    setBusyButton(button, true, "Création...");
    const data = new FormData(form);
    const requestType = data.get("requestType") === "ride" ? "ride" : "delivery";
    const passengerCount = Math.max(1, Number(data.get("passengerCount") || 1));
    const vehicleType = data.get("vehicleType") === "moto_taxi" ? "moto_taxi" : "taxi";
    const parcelDescription = requestType === "ride"
      ? `Course ${vehicleType === "moto_taxi" ? "moto-taxi" : "taxi"} - ${passengerCount} passager${passengerCount > 1 ? "s" : ""}`
      : String(data.get("parcel") || "").trim();
    const pricing = updateDeliveryPricingFromForm();
    if (!pricing.distanceKm || !pricing.suggestedAmount) {
      renderDeliveryRequestStatus(`Indiquez une distance estimée pour calculer le tarif de la ${requestType === "ride" ? "course" : "livraison"}.`);
      form.dataset.submitting = "false";
      finishActionButton(button, deliveryRequestSubmitLabel());
      return;
    }
    const amount = Math.max(pricing.suggestedAmount, Math.round(Number(data.get("amount") || 0)));
    const financials = deliveryFinancials(amount);
    const clientName = normalizeClientName(data.get("clientName") || currentClientName());
    const phone = String(data.get("phone") || "").trim();
    if (!isValidClientName(clientName) || !isValidContactPhone(phone)) {
      renderDeliveryRequestStatus("Ajoutez votre prénom ou pseudo et un numéro de téléphone valide pour confirmer la demande.");
      form.dataset.submitting = "false";
      finishActionButton(button, deliveryRequestSubmitLabel());
      return;
    }
    rememberClientIdentity(clientName, phone);
    const pickupPoint = deliveryPickupPointFromFormData(data);
    const dropoffLat = normalizeCoordinate(data.get("dropoffLatitude"));
    const dropoffLng = normalizeCoordinate(data.get("dropoffLongitude"));
    const dropoffPoint = Number.isFinite(dropoffLat) && Number.isFinite(dropoffLng)
      ? { lat: dropoffLat, lng: dropoffLng }
      : deliveryLocationPoint(String(data.get("dropoff") || ""), String(data.get("city") || "").trim() || currentCity());
    const request = normalizeDeliveryRequest({
      id: `del${Date.now()}`,
      pickup: data.get("pickup"),
      dropoff: data.get("dropoff"),
      parcel: parcelDescription,
      requestType,
      passengerCount,
      vehicleType,
      city: String(data.get("city") || "").trim() || currentCity(),
      urgency: data.get("urgency"),
      scheduledAt: pricing.scheduledAt || data.get("scheduledAt"),
      notes: data.get("notes"),
      clientName,
      phone,
      clientDeviceToken: BizziPrivacy.token(),
      pickupLatitude: pickupPoint?.lat,
      pickupLongitude: pickupPoint?.lng,
      pickupAccuracy: pickupPoint?.accuracy,
      pickupLocationTimestamp: state.userLocation?.timestamp || "",
      pickupLocationLabel: state.userLocation?.shortLabel || data.get("pickup"),
      pickupLocationFullAddress: state.userLocation?.fullAddress || data.get("pickup"),
      dropoffLatitude: dropoffPoint?.lat,
      dropoffLongitude: dropoffPoint?.lng,
      dropoffLocationLabel: data.get("dropoffLocationLabel") || data.get("dropoff"),
      dropoffLocationFullAddress: data.get("dropoffLocationFullAddress") || data.get("dropoff"),
      distanceKm: pricing.distanceKm,
      baseAmount: pricing.baseAmount,
      suggestedAmount: pricing.suggestedAmount,
      pricingSlot: pricing.pricingSlot,
      pricingSlotLabel: pricing.pricingSlotLabel,
      badWeather: pricing.badWeather,
      surchargeRate: pricing.surchargeRate,
      pricingBreakdown: pricing.pricingBreakdown,
      amount: financials.amount,
      currency: bizziConfig.currency || "FCFA",
      commissionRate: DELIVERY_COMMISSION_RATE,
      bizziCommission: financials.bizziCommission,
      providerPayout: financials.providerPayout,
      paymentMethod: state.selectedDeliveryPayment,
      paymentReference: String(data.get("paymentReference") || "").trim() || generateDeliveryPaymentReference(phone),
      paymentStatus: "pending",
      payoutStatus: "pending",
      dispatchRadiusKm: DELIVERY_MATCH_RADIUS_KM,
      status: "open",
      deliveryStage: "waiting",
      proofCode: String(Math.floor(1000 + Math.random() * 9000)),
      createdAt: new Date().toISOString(),
    });
    const matches = deliveryRequestMatches(request);
    request.matchedProviderIds = matches.map((provider) => provider.id);
    state.deliveryRequests.unshift(request);
    saveState();
    const autoMessage = await autoValidateDeliveryOrder(request);
    let remoteMessage = "";
    try {
      remoteMessage = await submitDeliveryRequestToSupabase(request);
    } catch (error) {
      request.remoteStatus = `Livraison gardée en local : ${friendlySupabaseError(error)}. Exécutez sql-copie-bizzi/62-livraisons-bizzi-v145.sql pour activer le partage Supabase.`;
      remoteMessage = request.remoteStatus;
      saveState();
    }
    remoteMessage = `${remoteMessage} ${autoMessage}`;
    form.reset();
    updateDeliveryRequestTypeUi();
    renderDeliveryPaymentOptions();
    renderDelivery();
    renderProviderDeliveryQueue();
    renderAdmin();
    renderDeliveryRequestStatus(`${requestType === "ride" ? "Course taxi" : "Livraison"} créée. ${BizziPrivacy.isCash(request.paymentMethod) ? "Paiement en espèces à remettre au professionnel." : "Paiement confirmé."} Montant ${formatMoney(request.amount)}. Les professionnels proches peuvent accepter sans que leur contact soit affiché avant attribution. Réf. ${request.paymentReference}. ${remoteMessage}`);
    form.dataset.submitting = "false";
    finishActionButton(button, "Commande validée");
  });

  document.querySelectorAll("[data-provider-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.providerEntry === "existing" ? "existing" : "new";
      setProviderEntryMode(mode, {
        focus: mode === "existing" ? ".provider-entry-panel" : ".provider-create-panel",
        resetForm: mode === "new",
      });
      renderProviderIdentityStatus(mode === "existing" ? `
        <strong>Identifiez votre profil</strong>
        <p>Entrez le même téléphone ou WhatsApp utilisé lors de l'inscription. Zeyds ouvrira directement le renouvellement.</p>
      ` : "");
    });
  });

  document.querySelector("#providerIdentifyForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.submitting === "true") return;
    const button = form.querySelector("button[type='submit']");
    const phone = String(new FormData(form).get("providerPhone") || "").trim();
    if (!normalizePhoneForMatch(phone)) {
      renderProviderIdentityStatus("<strong>Numéro requis</strong><p>Entrez le téléphone ou WhatsApp utilisé pour votre profil Zeyds.</p>");
      return;
    }
    form.dataset.submitting = "true";
    setBusyButton(button, true, "Recherche...");
    let provider = null;
    try {
      provider = upsertRenewalProvider(await fetchPublicProviderByContact(phone, phone));
      if (provider) saveState();
    } catch (error) {
      renderProviderIdentityStatus(`<strong>Recherche Supabase impossible</strong><p>${safe(friendlySupabaseError(error))}. Zeyds vérifie maintenant les données locales.</p>`);
    }
    if (!provider) provider = findLocalProviderByPrimaryPhone(phone);
    if (provider) {
      selectProviderForRenewal(provider, `Profil identifié : ${safe(provider.fullName)}. Choisissez votre forfait, puis envoyez la référence de paiement.`);
      finishActionButton(button, "Profil trouvé");
    } else {
      renderProviderIdentityStatus(`
        <strong>Aucun profil retrouvé</strong>
        <p>Si vous êtes nouveau, cliquez sur Je m'inscris. Si vous aviez déjà un compte, vérifiez le numéro ou rechargez les prestataires Supabase.</p>
      `);
      finishActionButton(button, "Non trouvé");
    }
    form.dataset.submitting = "false";
  });

  document.querySelector("#providerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.submitting === "true") return;
    const button = form.querySelector("button[type='submit']");
    form.dataset.submitting = "true";
    setBusyButton(button, true, "Création...");
    try {
    const data = new FormData(form);
    const fullName = String(data.get("fullName") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const whatsapp = String(data.get("whatsapp") || "").trim() || phone;
    const service = canonicalServiceName(data.get("service"));
    const providerCity = String(data.get("providerCity") || "").trim();
    const area = String(data.get("area") || "").trim();
    if (!fullName) {
      reportProviderSignupIssue(form, button, "Renseignez le nom du prestataire avant de créer le profil.", "fullName");
      return;
    }
    if (!isValidContactPhone(phone)) {
      reportProviderSignupIssue(form, button, contactValidationMessage("téléphone prestataire"), "phone");
      return;
    }
    if (whatsapp && !isValidContactPhone(whatsapp)) {
      reportProviderSignupIssue(form, button, contactValidationMessage("WhatsApp prestataire"), "whatsapp");
      return;
    }
    if (isPlaceholderServiceName(service)) {
      reportProviderSignupIssue(form, button, "Choisissez un métier avant de créer le profil prestataire.", "service");
      return;
    }
    if (!cityIsSpecific(providerCity)) {
      reportProviderSignupIssue(form, button, "Ville requise.", "providerCity");
      return;
    }
    if (!area) {
      reportProviderSignupIssue(form, button, "Indiquez commune ou quartier.", "area");
      return;
    }
    if (data.get("acceptTerms") !== "on") {
      reportProviderSignupIssue(form, button, "Cochez la certification des informations et l’acceptation des conditions Zeyds.", "acceptTerms");
      return;
    }
    const fraudAssessment = globalThis.BizziFraudGuard?.assessProviderSignup?.({
      phone,
      whatsapp,
      service,
      city: providerCity,
    }, state.providers);
    const existingLocalProvider = findLocalProviderByPrimaryPhone(phone);
    if (existingLocalProvider) {
      if (!addProviderService(existingLocalProvider, service)) {
        reportProviderSignupIssue(
          form,
          button,
          `Le service ${service} est déjà associé au profil ${existingLocalProvider.fullName}. Choisissez un autre service ou un autre numéro.`,
          "service"
        );
        return;
      }
      state.selectedService = service;
      state.identifiedProviderId = existingLocalProvider.id;
      state.selectedPaymentProviderId = existingLocalProvider.id;
      existingLocalProvider.lastServiceSubmissionReference = generateSubmissionReference("SERV", phone);
      state.recentProviderSignups = [
        {
          fullName: existingLocalProvider.fullName,
          phone: existingLocalProvider.phone,
          service: providerServicesLabel(existingLocalProvider),
          city: existingLocalProvider.city,
          area: existingLocalProvider.area,
          createdAt: new Date().toISOString(),
        },
        ...(state.recentProviderSignups || []).filter((item) => !phonesMatch(item.phone, phone)),
      ].slice(0, 12);
      saveState();
      prepareNextProviderSignup(existingLocalProvider.fullName, service, {
        phone,
        serviceAddedTo: existingLocalProvider.fullName,
        serviceCount: providerServiceNames(existingLocalProvider).length,
        submissionReference: existingLocalProvider.lastServiceSubmissionReference,
      });
      renderAdmin();
      renderAd();
      renderHomeDiscovery();
      window.setTimeout(async () => {
        try {
          const message = await syncAdditionalProviderService(existingLocalProvider, service);
          renderProviderStatus(`Service ${safe(service)} ajouté au profil ${safe(existingLocalProvider.fullName)}. Dossier ${safe(existingLocalProvider.lastServiceSubmissionReference)}. ${safe(message)}`);
        } catch (error) {
          renderProviderStatus(`Service ${safe(service)} conservé sur cet appareil. Synchronisation Supabase à reprendre : ${safe(friendlySupabaseError(error))}`);
        }
      }, 0);
      finishActionButton(button, "Créer mon profil");
      return;
    }
    state.selectedService = service;
    const baseCoordinates = cityCoordinates(providerCity);
    const coordinates = state.userLocation || {
      lat: baseCoordinates.lat + (Math.random() - 0.5) * 0.04,
      lng: baseCoordinates.lng + (Math.random() - 0.5) * 0.04,
    };
    const photoFile = data.get("photo");
    const verificationProofFile = data.get("verificationProof");
    const verificationProofName = verificationProofFile?.name || "";
    const provider = {
      id: `p${Date.now()}`,
      initials: initials(fullName),
      fullName,
      phone,
      whatsapp,
      social: {
        whatsapp,
      },
      service,
      services: [service],
      city: providerCity,
      area,
      distance: "Nouveau",
      distanceKm: state.userLocation ? 0 : distanceBetweenKm(baseCoordinates, coordinates),
      lat: coordinates.lat,
      lng: coordinates.lng,
      locationPrecision: state.userLocation ? "gps" : "area_estimate",
      locationAccuracy: state.userLocation?.accuracy || null,
      locationTimestamp: state.userLocation?.timestamp || "",
      locationLabel: state.userLocation?.shortLabel || area,
      locationFullAddress: state.userLocation?.fullAddress || area,
      rating: 0,
      description: String(data.get("description") || "").trim() || "Nouveau prestataire Zeyds.",
      photo: "",
      termsAcceptedAt: new Date().toISOString(),
      status: "approved",
      visibility: "active",
      verificationStatus: verificationProofFile?.size ? "pending" : "none",
      verificationProof: "",
      verificationProofName,
      verificationNote: verificationProofFile?.size ? "Justificatif envoyé, en attente de validation admin." : "",
      verifiedAt: null,
      trialEndsAt: isoDaysFromNow(30),
      subscriptionEndsAt: null,
      calls: 0,
      socialViews: 0,
      remoteStatus: "syncing",
      submissionReference: generateSubmissionReference("PRO", phone),
      signupRisk: fraudAssessment?.risk || "low",
      signupSignals: fraudAssessment?.signals || [],
    };
    state.providers.push(provider);
    state.identifiedProviderId = provider.id;
    state.selectedPaymentProviderId = provider.id;
    state.recentProviderSignups = [
      { fullName, phone, service, city: providerCity, area, createdAt: provider.termsAcceptedAt },
      ...(state.recentProviderSignups || []).filter((item) => !phonesMatch(item.phone, phone)),
    ].slice(0, 12);

    saveState();
    globalThis.BizziFraudGuard?.rememberSignup?.(provider);
    prepareNextProviderSignup(fullName, service, { phone, submissionReference: provider.submissionReference });
    renderAdmin();
    renderAd();
    renderHomeDiscovery();
    if (localOnlyBrowserTestMode()) {
      provider.remoteStatus = "local_only";
      saveState();
      renderProviderStatus("Test local sans Supabase.");
    } else {
      window.setTimeout(() => syncCreatedProviderToSupabase(provider, {
        photoFile,
        verificationProofFile,
      }), 0);
    }
    finishActionButton(button, "Créer mon profil");
    } catch (error) {
      const message = friendlySupabaseError(error);
      captureBizziError(error, { module: "provider_signup" });
      renderProviderStatus(`Création interrompue : ${message}. Le bouton a été réactivé, vous pouvez réessayer.`);
      renderProviderCreateStatus(`Création interrompue : ${message}. Vérifiez la connexion puis réessayez.`, "error");
      finishActionButton(button, "Réessayer");
    } finally {
      form.dataset.submitting = "false";
    }
  });

  document.querySelectorAll(".plan").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".plan").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      state.selectedPlan = { name: button.dataset.plan, price: Number(button.dataset.price) };
      saveState();
      renderPaymentInstructions();
      renderPaymentProviderOptions();
    });
  });

  document.querySelectorAll(".boost-plan").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".boost-plan").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      state.selectedBoost = button.dataset.boost || "none";
      saveState();
      renderPaymentInstructions();
      renderPaymentProviderOptions();
    });
  });

  document.querySelectorAll(".payment-grid .pay[data-method]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".payment-grid .pay[data-method]").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      state.selectedPayment = button.dataset.method;
      saveState();
      renderPaymentInstructions();
    });
  });

  document.querySelector("#paymentProviderSync")?.addEventListener("click", (event) => {
    syncSupabasePublicData(event.currentTarget);
  });

  document.querySelector("#paymentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.submitting === "true") return;
    const button = form.querySelector("button[type='submit']");
    form.dataset.submitting = "true";
    setBusyButton(button, true, "Envoi...");
    const data = new FormData(form);
    const selectedProvider = paymentTargetProviders().find((provider) => provider.id === data.get("providerId")) || currentPaymentProvider();
    if (!selectedProvider) {
      renderProviderStatus("Choisissez d'abord un prestataire à renouveler.");
      form.dataset.submitting = "false";
      finishActionButton(button, "Envoyer");
      return;
    }
    state.selectedPaymentProviderId = selectedProvider.id;
    const reference = String(data.get("reference") || "").trim();
    if (!reference) {
      renderProviderStatus("Saisissez la référence réelle de la transaction pour éviter une validation ou un renouvellement en double.");
      form.dataset.submitting = "false";
      finishActionButton(button, "Référence requise");
      form.querySelector("[name='reference']")?.focus();
      return;
    }
    const duplicatePayment = state.payments.find((item) => (
      item.providerId === selectedProvider.id
      && normalizedPaymentReference(item.reference) === normalizedPaymentReference(reference)
      && ["pending", "approved"].includes(item.status)
    ));
    if (duplicatePayment) {
      renderProviderStatus(`Cette transaction est déjà enregistrée dans le dossier ${safe(duplicatePayment.submissionReference || duplicatePayment.id)} (${safe(duplicatePayment.status)}). Aucun doublon n'a été créé.`);
      form.dataset.submitting = "false";
      finishActionButton(button, "Déjà enregistré");
      return;
    }
    const proofFile = data.get("proof");
    const proof = await readPhotoFile(proofFile);
    const payment = {
      id: `pay${Date.now()}`,
      providerId: selectedProvider.id,
      providerName: selectedProvider.fullName,
      plan: state.selectedPlan.name,
      amount: selectedProviderPaymentTotal(),
      boostId: selectedProviderBoost().id,
      boostName: selectedProviderBoost().name,
      boostAmount: selectedProviderBoost().price,
      boostDays: selectedProviderBoost().days,
      method: state.selectedPayment,
      reference,
      submissionReference: generateSubmissionReference("PAY", selectedProvider.phone),
      proof,
      proofName: proofFile?.name || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    state.payments.push(payment);
    saveState();
    let remoteMessage = "";
    try {
      remoteMessage = await submitPaymentToSupabase(payment, selectedProvider, proofFile);
    } catch (error) {
      payment.remoteStatus = "local_only";
      remoteMessage = `Paiement gardé en local : ${friendlySupabaseError(error)}.`;
      saveState();
    }
    form.reset();
    renderPaymentProviderOptions();
    renderProviderStatus(`Paiement envoyé pour ${safe(selectedProvider.fullName)} : dossier ${safe(payment.submissionReference)}, en attente de validation admin. ${remoteMessage}`);
    renderAdmin();
    form.dataset.submitting = "false";
    finishActionButton(button, "Envoyé");
  });
}

function renderCommercialDashboard(data) {
  const root = document.querySelector("#commercialDashboard");
  if (!root) return;
  const activeRate = data.approved.length
    ? Math.round((data.activeProviders.length / data.approved.length) * 100)
    : 0;
  const pendingRevenue = pendingRevenueTotal();
  const renewalPotential = renewalPotentialTotal();
  const [topService, topServiceCount] = topGroup(data.activeProviders, (provider) => provider.service);
  const [topCity, topCityCount] = topGroup(data.activeProviders, (provider) => provider.city);
  const urgentRenewal = data.renewalProviders[0];
  const priorityRequests = data.openRequests.filter((request) => requestPriorityInfo(request).score >= 60);
  const nextAction = data.pendingPayments.length
    ? `Valider ${data.pendingPayments.length} paiement(s) en attente.`
    : priorityRequests.length
      ? `Traiter ${priorityRequests.length} demande(s) express prioritaire(s).`
    : urgentRenewal
      ? `Relancer ${urgentRenewal.fullName} (${renewalStatus(urgentRenewal)}).`
      : "Continuer à recruter de nouveaux prestataires.";

  root.innerHTML = `
    <div class="commercial-grid">
      <div class="commercial-metric">
        <span>Revenus encaissés</span>
        <strong>${safe(formatMoney(approvedRevenueTotal()))}</strong>
        <p>${data.activeProviders.length} prestataire(s) actif(s)</p>
      </div>
      <div class="commercial-metric">
        <span>A valider</span>
        <strong>${safe(formatMoney(pendingRevenue))}</strong>
        <p>${data.pendingPayments.length} paiement(s) en attente</p>
      </div>
      <div class="commercial-metric">
        <span>Relances</span>
        <strong>${safe(formatMoney(renewalPotential))}</strong>
        <p>${data.renewalProviders.length} renouvellement(s) à traiter</p>
      </div>
      <div class="commercial-metric">
        <span>Taux actif</span>
        <strong>${activeRate}%</strong>
        <p>${data.activeProviders.length}/${data.approved.length} profil(s) approuvé(s)</p>
      </div>
    </div>
    <div class="commercial-insights">
      <p><strong>Action prioritaire :</strong> ${safe(nextAction)}</p>
      <p><strong>Service moteur :</strong> ${safe(topService)}${topServiceCount ? ` (${topServiceCount})` : ""} · <strong>Ville moteur :</strong> ${safe(topCity)}${topCityCount ? ` (${topCityCount})` : ""}</p>
      <p><strong>Demandes express :</strong> ${data.openRequests.length} dont ${priorityRequests.length} prioritaire(s) · <strong>Contacts clients :</strong> ${data.contactLeads.length} · <strong>Signalements ouverts :</strong> ${data.openReports.length}</p>
    </div>
    <div class="admin-actions">
      <button class="secondary" data-copy-commercial-summary type="button">Copier bilan du jour</button>
    </div>
  `;

  root.querySelector("[data-copy-commercial-summary]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim();
    const copied = await copyTextToClipboard(commercialSummary());
    finishActionButton(button, copied ? "Bilan copié" : "Copie impossible");
  });
}

function appHealthChecks(data = {}) {
  const paymentMethods = bizziConfig.payments?.methods || [];
  const paymentAccounts = bizziConfig.payments?.accounts || {};
  const paymentAccountsReady = paymentMethods.length > 0 && paymentMethods.every((method) => hasProductionValue(paymentAccounts[method]));
  const aggregatorReady = Boolean(bizziConfig.payments?.aggregator?.enabled && hasProductionValue(bizziConfig.payments?.aggregator?.checkoutEndpoint));
  const duplicates = state.providers.filter((provider) => (
    globalThis.BizziFraudGuard?.duplicatePhoneCount?.(provider.phone || provider.whatsapp, state.providers) > 1
  ));
  const openDeliveries = state.deliveryRequests.filter((request) => request.status === "open");
  const paidUnmatchedDeliveries = openDeliveries.filter(deliveryNeedsDispatch);
  const pushSupported = globalThis.BizziPushClient?.supported?.() || false;
  const pushConfigured = Boolean(bizziConfig.notifications?.enabled && hasProductionValue(bizziConfig.notifications?.vapidPublicKey));
  const mapsProvider = bizziConfig.maps?.provider || "auto";
  const mapsBackendReady = hasProductionValue(bizziConfig.maps?.geocodingEndpoint);
  const mapboxPublicReady = hasProductionValue(bizziConfig.maps?.mapboxAccessToken);
  const monitoringEndpointReady = hasProductionValue(bizziConfig.observability?.endpoint);
  const monitoringForwarderReady = hasProductionValue(bizziConfig.observability?.forwarderEndpoint);
  const monitoringProvider = bizziConfig.observability?.externalProvider || "a_configurer";
  const pushDetail = pushConfigured
    ? "Push client configuré. Tester sur téléphone avec autorisation notifications."
    : pushSupported
      ? "Prêt côté navigateur : générer VAPID, renseigner la clé publique et les secrets Supabase."
      : "Navigateur actuel non compatible push. Tester sur Chrome Android ou PWA installée.";
  return [
    {
      label: "Supabase public",
      ready: supabaseConfigured() && Boolean(state.remote?.lastSupabaseSyncAt),
      detail: state.remote?.lastSupabaseSyncAt ? `Dernier import : ${new Date(state.remote.lastSupabaseSyncAt).toLocaleString("fr-FR")}.` : "Faire Tester Supabase puis Importer public Supabase.",
    },
    {
      label: "Admin protégé",
      ready: bizziConfig.admin?.allowQueryEntry === false && !hasProductionValue(bizziConfig.admin?.demoPin),
      detail: "L'entrée admin publique reste masquée et passe par le lien sécurisé.",
    },
    {
      label: "Paiement opérationnel",
      ready: paymentAccountsReady || aggregatorReady,
      detail: aggregatorReady ? "Checkout agrégateur prêt côté backend." : paymentAccountsReady ? "Comptes Mobile Money renseignés." : "Renseigner comptes Zeyds ou activer l'agrégateur.",
    },
    {
      label: "Cartographie",
      ready: mapsBackendReady || mapboxPublicReady,
      detail: mapsBackendReady
        ? `Distance/itinéraire prêts via backend. Mode : ${mapsProvider}; fallback : ${bizziConfig.maps?.fallbackProvider || "local"}.`
        : "Configurer la fonction map-geocode ou garder l'estimation locale par quartiers.",
      actionLabel: "Copier procédure carte",
      actionKind: "copy-maps-procedure",
    },
    {
      label: "Monitoring",
      ready: monitoringEndpointReady,
      detail: monitoringForwarderReady
        ? `Erreurs Supabase + forwarder prêts. Fournisseur externe : ${monitoringProvider}.`
        : "Ingestion Supabase prête. Ajouter Sentry ou Better Stack pour les alertes externes.",
      actionLabel: "Copier procédure monitoring",
      actionKind: "copy-monitoring-procedure",
    },
    {
      label: "Push notifications",
      ready: pushConfigured,
      detail: pushDetail,
      actionLabel: "Copier procédure push",
      actionKind: "copy-push-procedure",
    },
    {
      label: "Anti-doublon prestataire",
      ready: duplicates.length === 0,
      detail: duplicates.length ? `${duplicates.length} profil(s) avec téléphone ou WhatsApp en double. Exécuter le rapport SQL puis nettoyer les doublons non approuvés.` : "Aucun doublon local détecté.",
      actionLabel: duplicates.length ? "Copier SQL doublons" : "",
      actionKind: "copy-duplicate-sql",
    },
    {
      label: "Livraisons sans livreur",
      ready: paidUnmatchedDeliveries.length === 0,
      detail: paidUnmatchedDeliveries.length ? `${paidUnmatchedDeliveries.length} livraison(s) payée(s) attendent un livreur proche. Vérifier la disponibilité livreur dans la ville.` : "Aucune livraison payée bloquée.",
      actionLabel: paidUnmatchedDeliveries.length ? "Voir livraisons" : "",
      actionTarget: "#deliveryAdminDashboard",
    },
    {
      label: "Signalements ouverts",
      ready: data.openReports?.length === 0,
      detail: data.openReports?.length ? `${data.openReports.length} signalement(s) à traiter.` : "Aucun signalement local ouvert.",
    },
  ];
}

function renderAppHealthDashboard(data = {}) {
  const root = document.querySelector("#appHealthDashboard");
  if (!root) return;
  const checks = appHealthChecks(data);
  const readyCount = checks.filter((item) => item.ready).length;
  const score = checks.length ? Math.round((readyCount / checks.length) * 100) : 0;
  const tone = score >= 80 ? "ok" : score >= 55 ? "pending" : "bad";
  const nextFix = checks.find((item) => !item.ready);
  root.innerHTML = `
    <div class="health-summary">
      <div class="health-score ${tone}">
        <strong>${score}%</strong>
        <span>${readyCount}/${checks.length} prêts</span>
      </div>
      <div>
        <h3>${score >= 80 ? "Zeyds est proche du lancement public" : "Zeyds doit encore sécuriser quelques points"}</h3>
        <p>${nextFix ? `Priorité : ${safe(nextFix.label)} - ${safe(nextFix.detail)}` : "Tous les contrôles locaux sont prêts pour les tests terrain."}</p>
      </div>
    </div>
    <div class="health-grid">
      ${checks.map((item) => `
        <div class="health-item ${item.ready ? "ok" : "todo"}">
          <span>${item.ready ? "OK" : "A faire"}</span>
          <strong>${safe(item.label)}</strong>
          <p>${safe(item.detail)}</p>
          ${item.actionLabel ? `<button class="secondary compact-action" type="button" ${item.actionKind ? `data-health-action="${safe(item.actionKind)}"` : ""} ${item.actionTarget ? `data-health-target="${safe(item.actionTarget)}"` : ""}>${safe(item.actionLabel)}</button>` : ""}
        </div>
      `).join("")}
    </div>
  `;
  root.querySelectorAll("[data-health-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.healthTarget);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  root.querySelectorAll("[data-health-action='copy-duplicate-sql']").forEach((button) => {
    button.addEventListener("click", async () => {
      const sql = [
        "-- Avant ces requetes : executez une seule fois le contenu complet de :",
        "-- sql-copie-bizzi/68-anti-doublon-prestataires-v161.sql",
        "-- puis sql-copie-bizzi/76-nettoyage-doublons-prestataires-v173.sql",
        "",
        "-- 1) Voir les doublons",
        "select * from public.bizzi_provider_duplicate_report();",
        "",
        "-- 2) Previsualiser le nettoyage",
        "select public.bizzi_cleanup_duplicate_trial_providers(false);",
        "",
        "-- 3) Appliquer seulement apres verification du resultat",
        "select public.bizzi_cleanup_duplicate_trial_providers(true);",
      ].join("\\n");
      const copied = await copyTextToClipboard(sql);
      finishActionButton(button, copied ? "SQL copié" : "Copie impossible");
    });
  });
  root.querySelectorAll("[data-health-action='copy-push-procedure']").forEach((button) => {
    button.addEventListener("click", async () => {
      const procedure = [
        "Activation push Zeyds",
        "1. Generer les cles avec outputs/tools/generate-vapid-keys.js.",
        "2. Mettre uniquement la cle publique dans config.js > notifications.vapidPublicKey.",
        "3. Garder la cle privee dans Supabase Secrets, jamais dans l'app publique.",
        "4. Deployer les fonctions Supabase push-subscribe et push-notify.",
        "5. Renseigner les secrets backend Supabase et la VAPID privee selon le fournisseur push.",
        "6. Tester depuis un telephone compatible ou une PWA installee.",
      ].join("\\n");
      const copied = await copyTextToClipboard(procedure);
      finishActionButton(button, copied ? "Procédure copiée" : "Copie impossible");
    });
  });
  root.querySelectorAll("[data-health-action='copy-maps-procedure']").forEach((button) => {
    button.addEventListener("click", async () => {
      const procedure = [
        "Activation carte / distance Zeyds",
        "1. Executer sql-copie-bizzi/81-cartographie-monitoring-v183.sql dans Supabase.",
        "2. Deployer la fonction Supabase : outputs/supabase/functions/map-geocode.",
        "3. Option Mapbox recommandee : creer une cle Mapbox puis renseigner MAPBOX_ACCESS_TOKEN dans Supabase Secrets.",
        "4. Option OpenStreetMap : renseigner OPENSTREETMAP_USER_AGENT avec contact@bizzi-africa.com.",
        "5. Laisser BIZZI_MAPS_PROVIDER=auto pour Mapbox d'abord, OpenStreetMap en secours.",
        "6. Tester une livraison avec Cocody -> Marcory, puis Bouake -> Air France, puis Yamoussoukro centre -> quartier Millionnaire.",
      ].join("\\n");
      const copied = await copyTextToClipboard(procedure);
      finishActionButton(button, copied ? "Carte copiée" : "Copie impossible");
    });
  });
  root.querySelectorAll("[data-health-action='copy-monitoring-procedure']").forEach((button) => {
    button.addEventListener("click", async () => {
      const procedure = [
        "Activation monitoring Zeyds",
        "1. Executer sql-copie-bizzi/81-cartographie-monitoring-v183.sql dans Supabase.",
        "2. Deployer les fonctions Supabase : error-ingest et monitoring-forwarder.",
        "3. Pour Sentry : renseigner BIZZI_MONITORING_PROVIDER=sentry et BIZZI_SENTRY_DSN dans Supabase Secrets.",
        "4. Pour Better Stack/Logtail : renseigner BIZZI_MONITORING_PROVIDER=better_stack, BIZZI_MONITORING_FORWARD_URL et BIZZI_MONITORING_FORWARD_KEY.",
        "5. Garder l'endpoint public error-ingest dans config.js, jamais de secret dans l'app publique.",
        "6. Tester en declenchant une erreur test, puis ouvrir le dashboard Sentry/Better Stack et l'admin Zeyds.",
      ].join("\\n");
      const copied = await copyTextToClipboard(procedure);
      finishActionButton(button, copied ? "Monitoring copié" : "Copie impossible");
    });
  });
}

function launchModeChecks(data = {}) {
  const health = appHealthChecks(data);
  const healthReady = health.filter((item) => item.ready).length;
  const required = [
    { label: "Admin protégé", ready: health.some((item) => item.label === "Admin protégé" && item.ready) },
    { label: "Paiement prêt", ready: health.some((item) => item.label === "Paiement opérationnel" && item.ready) },
    { label: "Aucun doublon critique", ready: health.some((item) => item.label === "Anti-doublon prestataire" && item.ready) },
    { label: "Aucune livraison payée bloquée", ready: health.some((item) => item.label === "Livraisons sans livreur" && item.ready) },
    { label: "Tests terrain documentés", ready: true },
  ];
  const score = health.length ? Math.round((healthReady / health.length) * 100) : 0;
  return { health, required, score, readyForProduction: score >= 80 && required.every((item) => item.ready) };
}

function renderLaunchModeDashboard(data = {}) {
  const root = document.querySelector("#launchModeDashboard");
  if (!root) return;
  const launch = launchModeChecks(data);
  const mode = launch.readyForProduction ? "Production contrôlée" : "Pré-lancement sécurisé";
  root.innerHTML = `
    <div class="launch-mode-card ${launch.readyForProduction ? "ok" : "pending"}">
      <div>
        <span>Mode conseillé</span>
        <strong>${safe(mode)}</strong>
        <p>${launch.readyForProduction ? "Vous pouvez ouvrir à un petit groupe d'utilisateurs avec surveillance active." : "Restez en test terrain jusqu'à correction des points bloquants."}</p>
      </div>
      <div class="health-score ${launch.readyForProduction ? "ok" : "pending"}">
        <strong>${launch.score}%</strong>
        <span>santé</span>
      </div>
    </div>
    <div class="field-test-steps">
      ${launch.required.map((item) => fieldTestStep(item.label, item.ready, item.ready ? "Contrôle prêt." : "A corriger avant ouverture publique.")).join("")}
    </div>
  `;
}

function loadPublicLaunchChecklist() {
  try {
    return JSON.parse(safeLocalGet(PUBLIC_LAUNCH_CHECKLIST_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function savePublicLaunchChecklist(checks) {
  safeLocalSet(PUBLIC_LAUNCH_CHECKLIST_KEY, JSON.stringify(checks || {}));
}

function publicLaunchChecklistStats() {
  const saved = loadPublicLaunchChecklist();
  const done = PUBLIC_LAUNCH_ITEMS.filter((item) => saved[item.id]).length;
  return { saved, done, total: PUBLIC_LAUNCH_ITEMS.length, complete: done === PUBLIC_LAUNCH_ITEMS.length };
}

function adminVisibleIssues() {
  const runtimeErrors = globalThis.BizziErrorMonitor?.recent?.() || [];
  const localOnlyProviders = state.providers.filter((provider) => provider.remoteStatus === "local_only" || provider.remoteError);
  const localOnlyJobs = state.jobOffers.filter((job) => job.remoteStatus === "local_only" || job.remoteError);
  const localOnlyEvents = state.eventPromotions.filter((event) => event.remoteStatus === "local_only" || event.remoteError);
  const localOnlyDeliveries = state.deliveryRequests.filter((request) => request.remoteStatus && !["linked", "synced"].includes(request.remoteStatus));
  const issues = [];
  if (remoteAdminQueue.jobError) issues.push({ level: "warning", label: "Offres emploi Supabase", detail: remoteAdminQueue.jobError });
  if (remoteAdminQueue.eventError) issues.push({ level: "warning", label: "Événements Supabase", detail: remoteAdminQueue.eventError });
  if (remoteAdminQueue.foodError) issues.push({ level: "warning", label: "Zeyds Food Supabase", detail: remoteAdminQueue.foodError });
  if (runtimeErrors.length) issues.push({ level: "warning", label: "Erreurs navigateur", detail: `${runtimeErrors.length} erreur(s) locale(s) enregistrée(s).` });
  if (localOnlyProviders.length) issues.push({ level: "warning", label: "Prestataires locaux", detail: `${localOnlyProviders.length} profil(s) à synchroniser ou vérifier.` });
  if (localOnlyJobs.length) issues.push({ level: "info", label: "Emplois locaux", detail: `${localOnlyJobs.length} offre(s) à envoyer ou valider dans Supabase.` });
  if (localOnlyEvents.length) issues.push({ level: "info", label: "Événements locaux", detail: `${localOnlyEvents.length} événement(s) à envoyer ou valider dans Supabase.` });
  if (localOnlyDeliveries.length) issues.push({ level: "info", label: "Livraisons locales", detail: `${localOnlyDeliveries.length} livraison(s) sans confirmation Supabase.` });
  return issues;
}

function safeAdminErrorMessage(message = "") {
  return friendlySupabaseError({ message: String(message || "") });
}

function renderAdminErrorDashboard() {
  const root = document.querySelector("#adminErrorDashboard");
  if (!root) return;
  const issues = adminVisibleIssues();
  const runtimeErrors = globalThis.BizziErrorMonitor?.recent?.() || [];
  root.innerHTML = `
    <div class="admin-error-summary ${issues.length ? "warning" : "ok"}">
      <div>
        <strong>${issues.length ? `${issues.length} point(s) à surveiller` : "Aucune erreur visible"}</strong>
        <p>${issues.length ? "Les erreurs sont regroupées ici pour éviter de chercher dans toute l'interface admin." : "Les derniers contrôles locaux ne signalent rien de bloquant."}</p>
      </div>
      <span>${runtimeErrors.length} log(s)</span>
    </div>
    <div class="admin-error-list">
      ${issues.length ? issues.map((issue) => `
        <div class="admin-error-item ${safe(issue.level)}">
          <span>${safe(issue.level === "warning" ? "A corriger" : "Info")}</span>
          <div>
            <strong>${safe(issue.label)}</strong>
            <p>${safe(safeAdminErrorMessage(issue.detail))}</p>
          </div>
        </div>
      `).join("") : "<p>Aucun blocage visible. Continuez avec les tests terrain et la checklist.</p>"}
    </div>
    <div class="admin-actions">
      <button class="secondary" type="button" data-refresh-admin-errors>Rafraîchir diagnostic</button>
      <button class="secondary" type="button" data-clear-runtime-errors ${runtimeErrors.length ? "" : "disabled"}>Vider logs navigateur</button>
    </div>
  `;
  root.querySelector("[data-refresh-admin-errors]")?.addEventListener("click", () => renderAdminErrorDashboard());
  root.querySelector("[data-clear-runtime-errors]")?.addEventListener("click", (event) => {
    globalThis.BizziStorage?.localSet?.("bizzi-error-events", "[]");
    finishActionButton(event.currentTarget, "Logs vidés");
    renderAdminErrorDashboard();
  });
}

function prelaunchReadiness(data = {}) {
  const health = appHealthChecks(data);
  const publicChecklist = publicLaunchChecklistStats();
  const issues = adminVisibleIssues();
  const activeProviders = state.providers.filter((provider) => provider.status === "approved" && provider.visibility === "active");
  const paidOrVisible = state.payments.some((payment) => payment.status === "approved") || activeProviders.length > 0;
  const required = [
    { id: "admin", label: "Admin protégé", ready: health.some((item) => item.label === "Admin protégé" && item.ready) },
    { id: "supabase", label: "Supabase branché", ready: supabaseConfigured() },
    { id: "providers", label: "Prestataires visibles", ready: activeProviders.length >= 1 },
    { id: "payments", label: "Paiement testé", ready: paidOrVisible },
    { id: "forms", label: "Formulaires sécurisés", ready: true },
    { id: "errors", label: "Erreurs sous contrôle", ready: issues.filter((issue) => issue.level === "warning").length === 0 },
    { id: "manual", label: "Checklist terrain", ready: publicChecklist.done >= Math.ceil(publicChecklist.total * 0.6) },
  ];
  const readyCount = required.filter((item) => item.ready).length;
  const score = Math.round((readyCount / required.length) * 100);
  const fullReady = required.every((item) => item.ready) && publicChecklist.complete;
  const pilotReady = score >= 70 && activeProviders.length >= 1;
  return { required, score, fullReady, pilotReady, publicChecklist, issues };
}

function renderPrelaunchGateDashboard(data = {}) {
  const root = document.querySelector("#prelaunchGateDashboard");
  if (!root) return;
  const readiness = prelaunchReadiness(data);
  const label = readiness.fullReady ? "PRÊT OUVERTURE CONTRÔLÉE" : readiness.pilotReady ? "PRÊT PILOTE LIMITÉ" : "PAS PRÊT PUBLIC";
  const tone = readiness.fullReady ? "ok" : readiness.pilotReady ? "pending" : "bad";
  const next = readiness.required.find((item) => !item.ready);
  root.innerHTML = `
    <div class="prelaunch-gate-card ${tone}">
      <div>
        <span>Décision ${safe(CURRENT_RELEASE)}</span>
        <strong>${safe(label)}</strong>
        <p>${next ? `Prochaine priorité : ${safe(next.label)}.` : "Tous les contrôles critiques sont prêts. Ouvrir progressivement et surveiller l'admin."}</p>
      </div>
      <div class="health-score ${tone}">
        <strong>${readiness.score}%</strong>
        <span>score</span>
      </div>
    </div>
    <div class="field-test-steps">
      ${readiness.required.map((item) => fieldTestStep(item.label, item.ready, item.ready ? "Prêt." : "A finaliser avant ouverture large.")).join("")}
    </div>
  `;
}

function renderPublicLaunchChecklistDashboard(data = {}) {
  const root = document.querySelector("#publicLaunchChecklist");
  if (!root) return;
  const stats = publicLaunchChecklistStats();
  root.innerHTML = `
    <div class="field-test-summary">
      <div>
        <strong>${stats.done}/${stats.total} point(s) validé(s)</strong>
        <p>Cochez uniquement après un vrai test. Cette checklist décide si Zeyds peut passer du pilote à l'ouverture publique contrôlée.</p>
      </div>
      <span class="field-test-score">${stats.complete ? "OK" : safe(CURRENT_RELEASE)}</span>
    </div>
    <div class="public-launch-list">
      ${PUBLIC_LAUNCH_ITEMS.map((item) => `
        <label class="final-recipe-item ${stats.saved[item.id] ? "done" : ""}">
          <input type="checkbox" data-public-launch-check="${safe(item.id)}" ${stats.saved[item.id] ? "checked" : ""}>
          <span>
            <strong>${safe(item.label)}</strong>
            <small>${safe(item.detail)}</small>
          </span>
        </label>
      `).join("")}
    </div>
  `;
  root.querySelectorAll("[data-public-launch-check]").forEach((input) => {
    input.addEventListener("change", () => {
      const saved = loadPublicLaunchChecklist();
      saved[input.dataset.publicLaunchCheck] = input.checked;
      savePublicLaunchChecklist(saved);
      renderPublicLaunchChecklistDashboard(data);
      renderPrelaunchGateDashboard(data);
    });
  });
}

function revenueBreakdown() {
  const approvedPayments = state.payments.filter((payment) => payment.status === "approved");
  const subscriptionRevenue = approvedPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.boostAmount || 0)), 0);
  const boostRevenue = approvedPayments.reduce((sum, payment) => sum + Number(payment.boostAmount || 0), 0);
  const deliveryCommission = state.deliveryRequests
    .filter((request) => request.paymentStatus === "approved")
    .reduce((sum, request) => sum + Number(request.bizziCommission || deliveryFinancials(request.amount).bizziCommission || 0), 0);
  const jobRevenue = state.jobOffers
    .filter((job) => job.paymentStatus === "approved" || job.status === "published")
    .reduce((sum, job) => sum + Number(job.amount || 0), 0);
  const eventRevenue = state.eventPromotions
    .filter((event) => event.paymentStatus === "approved" || event.status === "published")
    .reduce((sum, event) => sum + Number(event.amount || 0), 0);
  const pending = pendingRevenueTotal()
    + state.deliveryRequests.filter((request) => request.paymentStatus === "pending").reduce((sum, request) => sum + Number(request.bizziCommission || 0), 0)
    + state.jobOffers.filter((job) => job.paymentStatus === "pending" || job.status === "pending").reduce((sum, job) => sum + Number(job.amount || 0), 0)
    + state.eventPromotions.filter((event) => event.paymentStatus === "pending" || event.status === "pending").reduce((sum, event) => sum + Number(event.amount || 0), 0);
  const total = subscriptionRevenue + boostRevenue + deliveryCommission + jobRevenue + eventRevenue;
  const projection = total + pending + renewalPotentialTotal();
  return {
    subscriptionRevenue,
    boostRevenue,
    deliveryCommission,
    jobRevenue,
    eventRevenue,
    pending,
    total,
    projection,
  };
}

function profitableServices() {
  const byService = new Map();
  state.payments
    .filter((payment) => payment.status === "approved")
    .forEach((payment) => {
      const provider = state.providers.find((item) => item.id === payment.providerId);
      const service = provider?.service || "Service Zeyds";
      byService.set(service, (byService.get(service) || 0) + Number(payment.amount || 0));
    });
  state.deliveryRequests
    .filter((request) => request.paymentStatus === "approved")
    .forEach((request) => byService.set("Zeyds Livraison", (byService.get("Zeyds Livraison") || 0) + Number(request.bizziCommission || 0)));
  return [...byService.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function revenueSummaryText() {
  const revenue = revenueBreakdown();
  const services = profitableServices();
  return [
    `Revenus Zeyds - ${new Date().toLocaleDateString("fr-FR")}`,
    `Total validé : ${formatMoney(revenue.total)}.`,
    `Prestataires : ${formatMoney(revenue.subscriptionRevenue)}.`,
    `Boosts : ${formatMoney(revenue.boostRevenue)}.`,
    `Livraison : ${formatMoney(revenue.deliveryCommission)}.`,
    `Emplois : ${formatMoney(revenue.jobRevenue)}.`,
    `Événements : ${formatMoney(revenue.eventRevenue)}.`,
    `Projection avec attente et relances : ${formatMoney(revenue.projection)}.`,
    services.length ? `Top services : ${services.map(([name, amount]) => `${name} (${formatMoney(amount)})`).join(", ")}.` : "Aucun service rentable encore identifié.",
  ].join("\n");
}

function renderRevenueDashboard() {
  const root = document.querySelector("#revenueDashboard");
  if (!root) return;
  const revenue = revenueBreakdown();
  const totalForShare = Math.max(1, revenue.total);
  const rows = [
    ["Prestataires", revenue.subscriptionRevenue],
    ["Boosts", revenue.boostRevenue],
    ["Livraison", revenue.deliveryCommission],
    ["Emplois", revenue.jobRevenue],
    ["Événements", revenue.eventRevenue],
  ];
  root.innerHTML = `
    <div class="commercial-grid">
      <div class="commercial-metric"><span>Total validé</span><strong>${safe(formatMoney(revenue.total))}</strong><p>Revenus déjà confirmés</p></div>
      <div class="commercial-metric"><span>En attente</span><strong>${safe(formatMoney(revenue.pending))}</strong><p>Paiements, emplois, événements et livraisons</p></div>
      <div class="commercial-metric"><span>Projection</span><strong>${safe(formatMoney(revenue.projection))}</strong><p>Total + attente + relances</p></div>
      <div class="commercial-metric"><span>Top service</span><strong>${safe(profitableServices()[0]?.[0] || "-")}</strong><p>${safe(formatMoney(profitableServices()[0]?.[1] || 0))}</p></div>
    </div>
    <div class="revenue-bars">
      ${rows.map(([label, amount]) => `
        <div class="revenue-row">
          <span>${safe(label)}</span>
          <div><i style="width:${Math.max(4, Math.round((amount / totalForShare) * 100))}%"></i></div>
          <strong>${safe(formatMoney(amount))}</strong>
        </div>
      `).join("")}
    </div>
    <div class="admin-actions">
      <button class="secondary" type="button" data-copy-revenue-summary>Copier rapport revenus</button>
      <button class="secondary" type="button" id="exportRevenueCsv">Exporter CSV revenus</button>
      <button class="secondary" type="button" id="exportDeliveriesCsv">Exporter CSV livraisons</button>
    </div>
  `;
  root.querySelector("[data-copy-revenue-summary]")?.addEventListener("click", async (event) => {
    const copied = await copyTextToClipboard(revenueSummaryText());
    finishActionButton(event.currentTarget, copied ? "Rapport copié" : "Copie impossible");
  });
  root.querySelector("#exportRevenueCsv")?.addEventListener("click", exportRevenueCsv);
  root.querySelector("#exportDeliveriesCsv")?.addEventListener("click", exportDeliveriesCsv);
}

function deliveryOperationsSummary() {
  const open = state.deliveryRequests.filter((request) => request.status === "open");
  const pendingPayment = state.deliveryRequests.filter((request) => request.status !== "closed" && request.paymentStatus !== "approved");
  const paidToDispatch = open.filter(deliveryNeedsDispatch);
  const manualReview = open.filter((request) => request.paymentStatus === "approved" && ["manual_review", "dispatching"].includes(request.dispatchStatus) && !Number(request.dispatchCandidateCount || 0));
  const dispatchReady = state.deliveryRequests.filter(deliveryDispatchReady);
  const assigned = state.deliveryRequests.filter((request) => request.status === "assigned");
  const closed = state.deliveryRequests.filter((request) => request.status === "closed");
  const commission = state.deliveryRequests
    .filter((request) => request.paymentStatus === "approved")
    .reduce((sum, request) => sum + Number(request.bizziCommission || 0), 0);
  const payout = state.deliveryRequests
    .filter((request) => request.paymentStatus === "approved")
    .reduce((sum, request) => sum + Number(request.providerPayout || 0), 0);
  return { open, pendingPayment, paidToDispatch, manualReview, dispatchReady, assigned, closed, commission, payout };
}

function deliveryOpsText() {
  const ops = deliveryOperationsSummary();
  return [
    `Suivi livraisons Zeyds - ${new Date().toLocaleDateString("fr-FR")}`,
    `Demandes ouvertes : ${ops.open.length}.`,
    `Paiements non confirmés : ${ops.pendingPayment.length}.`,
    `Payées à dispatcher : ${ops.paidToDispatch.length}.`,
    `En attente livreur proche : ${ops.manualReview.length}.`,
    `Dispatch prêtes : ${ops.dispatchReady.length}.`,
    `Attribuées : ${ops.assigned.length}.`,
    `Terminées : ${ops.closed.length}.`,
    `Commission Zeyds : ${formatMoney(ops.commission)}.`,
    `Parts livreurs : ${formatMoney(ops.payout)}.`,
  ].join("\n");
}

function renderDeliveryAdminDashboard() {
  const root = document.querySelector("#deliveryAdminDashboard");
  if (!root) return;
  const ops = deliveryOperationsSummary();
  const nextDelivery = ops.paidToDispatch[0] || ops.pendingPayment[0] || ops.assigned[0] || null;
  const dispatchList = ops.paidToDispatch.slice(0, 3);
  root.innerHTML = `
    <div class="commercial-grid">
      <div class="commercial-metric"><span>Paiements non confirmés</span><strong>${ops.pendingPayment.length}</strong><p>Anciens cas à vérifier</p></div>
      <div class="commercial-metric"><span>Dispatch à relancer</span><strong>${ops.paidToDispatch.length}</strong><p>Option de secours admin</p></div>
      <div class="commercial-metric"><span>Sans livreur proche</span><strong>${ops.manualReview.length}</strong><p>Course ouverte aux livreurs</p></div>
      <div class="commercial-metric"><span>Commission Zeyds</span><strong>${safe(formatMoney(ops.commission))}</strong><p>15% validés</p></div>
    </div>
    <div class="commercial-insights">
      <p><strong>Action livraison :</strong> ${nextDelivery ? `${safe(deliveryPipelineInfo(nextDelivery).label)} - ${safe(nextDelivery.pickup)} vers ${safe(nextDelivery.dropoff)}` : "Aucune livraison active."}</p>
      <p><strong>Règle :</strong> le client ne voit pas le profil livreur avant paiement validé et attribution.</p>
      ${dispatchList.length ? `<div class="admin-real-action warning"><strong>${dispatchList.length} dispatch à relancer</strong><span>Secours uniquement : les nouvelles commandes sont déjà ouvertes aux livreurs proches.</span></div>` : ""}
    </div>
    <div class="admin-actions">
      <button class="secondary" type="button" data-copy-delivery-ops>Copier rapport livraison</button>
      ${dispatchList.map((request) => `<button class="primary" type="button" data-dispatch-delivery="${safe(request.id)}">Relancer ${safe(request.parcel || "livraison")}</button>`).join("")}
      ${nextDelivery ? `<button class="secondary" type="button" data-copy-next-delivery-client="${safe(nextDelivery.id)}">Message prochain client</button>` : ""}
      ${nextDelivery ? `<button class="secondary" type="button" data-copy-next-delivery-courier="${safe(nextDelivery.id)}">Message prochain livreur</button>` : ""}
    </div>
  `;
  root.querySelector("[data-copy-delivery-ops]")?.addEventListener("click", async (event) => {
    const copied = await copyTextToClipboard(deliveryOpsText());
    finishActionButton(event.currentTarget, copied ? "Rapport copié" : "Copie impossible");
  });
  root.querySelector("[data-copy-next-delivery-client]")?.addEventListener("click", async (event) => {
    const request = state.deliveryRequests.find((item) => item.id === event.currentTarget.dataset.copyNextDeliveryClient);
    const copied = request ? await copyTextToClipboard(deliveryClientMessage(request)) : false;
    finishActionButton(event.currentTarget, copied ? "Client copié" : "Copie impossible");
  });
  root.querySelector("[data-copy-next-delivery-courier]")?.addEventListener("click", async (event) => {
    const request = state.deliveryRequests.find((item) => item.id === event.currentTarget.dataset.copyNextDeliveryCourier);
    const copied = request ? await copyTextToClipboard(deliveryCourierMessage(request)) : false;
    finishActionButton(event.currentTarget, copied ? "Livreur copié" : "Copie impossible");
  });
  bindDeliveryRequestActions(root);
}

function renderStoreBusinessDashboard(data = {}) {
  const root = document.querySelector("#storeBusinessDashboard");
  if (!root) return;
  const readiness = prelaunchReadiness(data);
  const releaseReady = readiness.fullReady;
  const statusTag = document.querySelector("#storeBusinessStatusTag");
  if (statusTag) {
    statusTag.textContent = releaseReady ? "Prêt à publier" : "À valider";
    statusTag.classList.toggle("ok", releaseReady);
    statusTag.classList.toggle("pending", !releaseReady);
  }
  const releaseLabel = /^V\d+$/.test(CURRENT_RELEASE) ? CURRENT_RELEASE : "V304";
  const releaseNumber = releaseLabel.slice(1);
  const docs = [
    [`Fiche Play Store / App Store ${releaseLabel}`, `docs/store-listing-v${releaseNumber}.md`],
    [`Checklist publication stores ${releaseLabel}`, `docs/checklist-publication-stores-v${releaseNumber}.md`],
    [`Pack lancement ${releaseLabel}`, `docs/pack-lancement-v${releaseNumber}.md`],
    [`Confidentialité ${releaseLabel}`, `docs/politique-confidentialite-v${releaseNumber}.md`],
    [`Conditions ${releaseLabel}`, `docs/conditions-utilisation-v${releaseNumber}.md`],
    [`Tests terrain ${releaseLabel}`, `docs/tests-terrain-v${releaseNumber}.md`],
    [`Plan business terrain ${releaseLabel}`, `docs/plan-business-lancement-v${releaseNumber}.md`],
    [`Sécurité & stabilité ${releaseLabel}`, `docs/securite-stabilite-v${releaseNumber}.md`],
    ["Renouvellement privé V188", "docs/guide-v188-renouvellement-prive-bizzi.md"],
    ["Colis international V190", "docs/guide-v190-colis-international-transitaires-bizzi.md"],
  ];
  root.innerHTML = `
    <div class="field-test-summary">
      <div>
        <strong>Pack lancement ${safe(releaseLabel)} ${releaseReady ? "validé" : "à valider"}</strong>
        <p>Documents ${safe(releaseLabel)} à jour. La publication reste conditionnée par les contrôles réels de la checklist et le statut d'ouverture contrôlée.</p>
      </div>
      <span class="field-test-score">${safe(releaseLabel)}</span>
    </div>
    <div class="doc-list store-doc-list">
      ${docs.map(([label, href]) => `<a class="doc-link" href="${safe(href)}" target="_blank" rel="noreferrer">${safe(label)}</a>`).join("")}
    </div>
  `;
}

function providerConversionCandidates() {
  return state.providers
    .filter((provider) => provider.status === "approved" && provider.visibility === "active")
    .map((provider) => {
      const lastPayment = [...state.payments].reverse().find((payment) => payment.providerId === provider.id);
      const contactScore = Number(provider.contactClicks || 0) + Number(provider.callClicks || 0) + Number(provider.whatsappClicks || 0) + Number(provider.calls || 0);
      const days = daysUntil(visibilityEndDate(provider));
      const noSubscription = !provider.subscriptionEndsAt;
      const urgent = days !== null && days <= 14;
      const paid = lastPayment?.status === "approved";
      const score = (urgent ? 40 : 0) + (noSubscription ? 25 : 0) + Math.min(contactScore * 3, 30) + (paid ? -20 : 0);
      return { provider, score, contactScore, days, noSubscription, paid };
    })
    .filter((item) => item.score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function conversionMessage(item) {
  const provider = item.provider;
  const status = item.days !== null && item.days >= 0
    ? `Votre visibilité Zeyds arrive à échéance dans ${item.days} jour(s).`
    : "Votre visibilité Zeyds doit être renouvelée.";
  return [
    `Bonjour ${provider.fullName},`,
    status,
    `Vous avez déjà reçu ${item.contactScore} interaction(s) client sur Zeyds.`,
    "Pour rester visible et recevoir plus de demandes, choisissez un forfait ou ajoutez un boost.",
    "Répondez à ce message pour recevoir la référence de paiement Zeyds.",
  ].join(" ");
}

function renderConversionDashboard() {
  const root = document.querySelector("#conversionDashboard");
  if (!root) return;
  const candidates = providerConversionCandidates();
  const boostRevenue = state.payments
    .filter((payment) => payment.status === "approved")
    .reduce((sum, payment) => sum + Number(payment.boostAmount || 0), 0);
  const eventPotential = state.eventPromotions.filter((event) => event.status === "pending").reduce((sum, event) => sum + Number(event.amount || 0), 0);
  const jobPotential = state.jobOffers.filter((job) => job.status === "pending").reduce((sum, job) => sum + Number(job.amount || 0), 0);
  const providerPotential = candidates.reduce((sum) => sum + PROVIDER_SUBSCRIPTION_PLANS[0].price + PROVIDER_BOOST_OPTIONS[1].price, 0);
  root.innerHTML = `
    <div class="commercial-grid">
      <div class="commercial-metric"><span>Potentiel prestataires</span><strong>${safe(formatMoney(providerPotential))}</strong><p>${candidates.length} profil(s) à relancer</p></div>
      <div class="commercial-metric"><span>Boosts encaissés</span><strong>${safe(formatMoney(boostRevenue))}</strong><p>Options prestataires validées</p></div>
      <div class="commercial-metric"><span>Emplois à convertir</span><strong>${safe(formatMoney(jobPotential))}</strong><p>Offres en attente</p></div>
      <div class="commercial-metric"><span>Événements à convertir</span><strong>${safe(formatMoney(eventPotential))}</strong><p>Promotions en attente</p></div>
    </div>
    <div class="conversion-list">
      ${candidates.length ? candidates.map((item) => `
        <div class="conversion-item">
          <div>
            <strong>${safe(item.provider.fullName)}</strong>
            <p>${safe(item.provider.service)} - ${safe(item.provider.city)} - score ${item.score}</p>
            <p>${safe(item.noSubscription ? "Essai gratuit / sans forfait payé" : renewalStatus(item.provider) || subscriptionLabel(item.provider))} · ${item.contactScore} interaction(s)</p>
          </div>
          <div class="admin-actions">
            ${renewalWhatsAppUrl(item.provider) ? `<a class="primary" href="${safe(renewalWhatsAppUrl(item.provider))}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
            <button class="secondary" type="button" data-copy-conversion="${safe(item.provider.id)}">Copier message</button>
          </div>
        </div>
      `).join("") : "<p>Aucun prestataire prioritaire à convertir pour le moment.</p>"}
    </div>
  `;
  root.querySelectorAll("[data-copy-conversion]").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = candidates.find((candidate) => candidate.provider.id === button.dataset.copyConversion);
      const copied = item ? await copyTextToClipboard(conversionMessage(item)) : false;
      finishActionButton(button, copied ? "Message copié" : "Copie impossible");
    });
  });
}

function fieldTestProvider() {
  return state.providers
    .filter((provider) => provider.status === "approved" && provider.visibility === "active")
    .sort((a, b) => {
      const scoreA = Number(a.reviewCount || 0) * 10 + Number(a.rating || 0) + Number(a.contactClicks || 0);
      const scoreB = Number(b.reviewCount || 0) * 10 + Number(b.rating || 0) + Number(b.contactClicks || 0);
      return scoreB - scoreA || String(a.fullName || "").localeCompare(String(b.fullName || ""), "fr");
    })[0];
}

function fieldTestStep(label, ready, detail) {
  return `
    <div class="field-test-step ${ready ? "ok" : "todo"}">
      <span>${ready ? "OK" : "A faire"}</span>
      <div>
        <strong>${safe(label)}</strong>
        <p>${safe(detail)}</p>
      </div>
    </div>
  `;
}

function fieldTestPlanText(provider) {
  return [
    "Test terrain Zeyds",
    "1. Ouvrir l'application côté client.",
    provider ? `2. Rechercher le service : ${provider.service}.` : "2. Rechercher un service avec au moins un prestataire actif.",
    provider ? `3. Ouvrir la fiche : ${provider.fullName}.` : "3. Ouvrir une fiche prestataire active.",
    "4. Tester Appeler, WhatsApp ou Copier le contact.",
    "5. Revenir sur la fiche et laisser un avis 5/5 court.",
    "6. Créer une demande express pour vérifier le matching.",
    "7. Dans l'admin, importer public Supabase puis vérifier Recette lancement.",
  ].join("\n");
}

function renderFieldTestPanel() {
  const root = document.querySelector("#fieldTestPanel");
  if (!root) return;

  const provider = fieldTestProvider();
  const activeProviders = state.providers.filter((item) => item.status === "approved" && item.visibility === "active");
  const hasRemoteSync = Boolean(state.remote?.lastSupabaseSyncAt);
  const hasContacts = state.leads.some((lead) => ["call", "whatsapp", "route", "share", "copy"].includes(lead.action));
  const hasReviews = state.reviews.length > 0;
  const hasRequests = state.requests.length > 0;
  const pendingPayments = state.payments.filter((payment) => payment.status === "pending").length + remoteAdminQueue.payments.length;
  const nextAction = !hasRemoteSync
    ? "Importer public Supabase"
    : !provider
      ? "Créer ou activer un prestataire"
      : !hasContacts
        ? `Ouvrir ${provider.fullName} et tester un contact`
        : !hasReviews
          ? `Laisser un avis sur ${provider.fullName}`
          : !hasRequests
            ? "Créer une demande express"
            : pendingPayments
              ? "Valider les paiements en attente"
              : "Refaire le parcours complet avec un nouveau prestataire";

  root.innerHTML = `
    <div class="field-test-summary">
      <div>
        <strong>${safe(nextAction)}</strong>
        <p>${provider ? `Profil conseillé : ${provider.fullName} - ${provider.service} - ${provider.city}.` : "Aucun prestataire actif disponible pour le test client."}</p>
      </div>
      <span class="field-test-score">${activeProviders.length} actif(s)</span>
    </div>
    <div class="field-test-steps">
      ${fieldTestStep("Catalogue public", hasRemoteSync, hasRemoteSync ? `Dernier import le ${new Date(state.remote.lastSupabaseSyncAt).toLocaleString("fr-FR")}.` : "Importer public Supabase depuis l'admin.")}
      ${fieldTestStep("Prestataire actif", Boolean(provider), provider ? `${provider.fullName} est visible côté client.` : "Activer un mois gratuit ou valider un forfait.")}
      ${fieldTestStep("Contact client", hasContacts, hasContacts ? "Au moins un contact client a été enregistré." : "Ouvrir une fiche et tester Appeler, WhatsApp ou Copier.")}
      ${fieldTestStep("Avis client", hasReviews, hasReviews ? `${state.reviews.length} avis enregistré(s).` : "Laisser un avis rapide depuis une fiche prestataire.")}
      ${fieldTestStep("Demande express", hasRequests, hasRequests ? `${state.requests.length} demande(s) créée(s).` : "Créer une demande express pour tester le matching.")}
    </div>
    <div class="admin-actions field-test-actions">
      <button class="primary" type="button" data-field-test-view="search" data-field-test-service="${safe(provider?.service || "")}" ${provider ? "" : "disabled"}>Tester côté client</button>
      <button class="secondary" type="button" data-field-test-profile="${safe(provider?.id || "")}" ${provider ? "" : "disabled"}>Ouvrir fiche test</button>
      <button class="secondary" type="button" data-field-test-payment="${safe(provider?.id || "")}" ${provider ? "" : "disabled"}>Préparer forfait</button>
      <button class="secondary" type="button" data-field-test-view="request">Demande express</button>
      <button class="secondary" type="button" data-copy-field-test>Copier procédure</button>
    </div>
  `;

  root.querySelectorAll("[data-field-test-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const service = button.dataset.fieldTestService;
      if (service) state.selectedService = service;
      saveState();
      setView(button.dataset.fieldTestView);
      if (button.dataset.fieldTestView === "search") {
        renderServices();
        renderProviders();
      }
    });
  });

  root.querySelector("[data-field-test-profile]")?.addEventListener("click", (event) => {
    const providerId = event.currentTarget.dataset.fieldTestProfile;
    if (providerId) openProfile(providerId);
  });

  root.querySelector("[data-field-test-payment]")?.addEventListener("click", (event) => {
    const providerId = event.currentTarget.dataset.fieldTestPayment;
    if (!providerId) return;
    state.identifiedProviderId = providerId;
    state.selectedPaymentProviderId = providerId;
    saveState();
    renderPaymentProviderOptions();
    renderPaymentInstructions();
    setView("provider");
    const paymentProvider = state.providers.find((item) => item.id === providerId);
    renderProviderStatus(`Forfait préparé pour ${safe(paymentProvider?.fullName || "ce prestataire")}. Choisissez le forfait puis envoyez la référence de paiement.`);
  });

  root.querySelector("[data-copy-field-test]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim();
    const copied = await copyTextToClipboard(fieldTestPlanText(provider));
    finishActionButton(button, copied ? "Procédure copiée" : "Copie impossible");
  });
}

function renderAdminOperationsDashboard() {
  const root = document.querySelector("#adminOperationsDashboard");
  if (!root || !globalThis.BizziAdminDashboard?.render) return;
  const openDeliveries = state.deliveryRequests.filter((request) => request.status === "open").length;
  const paidDeliveries = state.deliveryRequests.filter(deliveryNeedsDispatch).length;
  const activeDispatchOffers = state.deliveryRequests.filter((request) => request.dispatchStatus === "matched" || request.dispatchStatus === "dispatching").length;
  const queuedPush = state.deliveryAlertsEnabled ? 1 : 0;
  const fraud24h = state.providers.filter((provider) => globalThis.BizziFraudGuard?.duplicatePhoneCount?.(provider.phone, state.providers) > 1).length;
  globalThis.BizziAdminDashboard.render(root, {
    openDeliveries,
    paidDeliveries,
    liveCouriers: 0,
    activeDispatchOffers,
    queuedPush,
    fraud24h,
    openAlerts: paidDeliveries && !activeDispatchOffers ? 1 : 0,
    remoteReady: Boolean(bizziConfig.backend?.serverAlertsEndpoint),
  });
}

function renderAdmin() {
  renderAdminAccess();
  if (!adminUnlocked) return;

  const approved = state.providers.filter((provider) => provider.status === "approved");
  const activeProviders = approved.filter((provider) => provider.visibility === "active");
  const active = activeProviders.length;
  const blurred = approved.filter((provider) => provider.visibility === "expired_blurred").length;
  const verified = approved.filter(isVerified).length;
  const pendingPayments = state.payments.filter((payment) => payment.status === "pending");
  const openReports = state.reports.filter((report) => report.status === "open");
  const openRequests = state.requests
    .filter((request) => request.status !== "closed")
    .map((request) => {
      hydrateRequestPriority(request);
      return request;
    })
    .sort((a, b) => Number(b.priorityScore || 0) - Number(a.priorityScore || 0) || new Date(a.createdAt) - new Date(b.createdAt));
  const localJobs = [...state.jobOffers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const localEvents = [...state.eventPromotions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const localFoodPlaces = [...state.foodPlaces].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const localExceptionPlaces = [...state.exceptionPlaces].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  let repairedJobReferences = false;
  localJobs.forEach((job) => {
    if (!job.paymentReference) {
      ensureJobPaymentReference(job);
      repairedJobReferences = true;
    }
  });
  let repairedEventReferences = false;
  localEvents.forEach((event) => {
    if (!event.paymentReference) {
      ensureEventPaymentReference(event);
      repairedEventReferences = true;
    }
  });
  if (repairedJobReferences || repairedEventReferences) saveState();
  const recentReviews = [...state.reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const contactLeads = state.leads.filter((lead) => ["call", "whatsapp", "route", "share", "copy"].includes(lead.action));
  const approvedRevenue = approvedRevenueTotal();
  const renewalProviders = renewalProviderList();
  const localOnlyProviders = state.providers.filter((provider) => (
    provider.remoteStatus === "local_only" || provider.visibility === "local_pending"
  ));

  document.querySelector("#metricProviders").textContent = state.providers.length;
  document.querySelector("#metricActive").textContent = active;
  document.querySelector("#metricBlurred").textContent = blurred;
  document.querySelector("#metricVerified").textContent = verified;
  document.querySelector("#metricPayments").textContent = pendingPayments.length;
  document.querySelector("#metricReports").textContent = openReports.length;
  document.querySelector("#metricRequests").textContent = openRequests.length;
  document.querySelector("#metricFood").textContent = activeFoodPlaces().length;
  document.querySelector("#metricLeads").textContent = contactLeads.length;
  document.querySelector("#metricReviews").textContent = state.reviews.length;
  document.querySelector("#metricRevenue").textContent = approvedRevenue.toLocaleString("fr-FR");

  const adminDashboardData = { approved, activeProviders, pendingPayments, renewalProviders, contactLeads, openReports, openRequests };
  renderPrelaunchGateDashboard(adminDashboardData);
  renderPublicLaunchChecklistDashboard(adminDashboardData);
  renderAdminErrorDashboard();
  renderAppHealthDashboard(adminDashboardData);
  renderLaunchModeDashboard(adminDashboardData);
  renderCommercialDashboard(adminDashboardData);
  renderRevenueDashboard();
  renderConversionDashboard();
  renderDeliveryAdminDashboard();
  renderStoreBusinessDashboard(adminDashboardData);
  renderFieldTestPanel();
  renderAdminOperationsDashboard();

  const localOnlyNotice = localOnlyProviders.length ? `
    <div class="admin-real-action warning">
      <strong>${localOnlyProviders.length} profil(s) local(aux) non publié(s)</strong>
      <span>Ces prestataires existent sur cet appareil mais ne sont pas encore visibles côté client. Cliquez sur Envoyer vers Supabase.</span>
    </div>
  ` : "";

  document.querySelector("#adminProviders").innerHTML = `${localOnlyNotice}${state.providers.map((provider) => `
    <div class="admin-item">
      <div>
        <h3>${safe(provider.fullName)}</h3>
        <p>${safe(providerServicesLabel(provider))} - ${safe(provider.city)} - ${safe(subscriptionLabel(provider))}</p>
        <p>${isVerified(provider) ? "Badge vérifié actif" : provider.verificationStatus === "pending" ? "Vérification en attente" : "Non vérifié"}</p>
        <p>Fiabilité Zeyds : ${providerReliabilityScore(provider)}/100 - ${safe(reliabilityInfo(provider).label)}</p>
        <p>Supabase : ${safe(provider.remoteStatus || (provider.remoteId ? "lié" : "local"))}${provider.remoteId ? ` - ${safe(provider.remoteId)}` : ""}</p>
        ${provider.remoteStatus === "local_only" ? `<p class="admin-warning">Ce profil est seulement local. Cliquez sur Envoyer vers Supabase pour le faire apparaître dans les validations officielles.${provider.remoteError ? ` Dernière erreur : ${safe(provider.remoteError)}` : ""}</p>` : ""}
        ${provider.verificationProof ? `<a class="doc-link" href="${safe(provider.verificationProof)}" target="_blank" rel="noreferrer">Voir justificatif${provider.verificationProofName ? ` : ${safe(provider.verificationProofName)}` : ""}</a>` : ""}
        <p>Note client : ${Number(provider.rating || 0).toLocaleString("fr-FR")} / 5 - ${Number(provider.reviewCount || 0)} avis</p>
        <p>${Number(provider.calls || 0)} ouverture(s) de fiche - ${Number(provider.contactClicks || 0)} contact(s) Zeyds</p>
        <p>Appels ${Number(provider.callClicks || 0)} - WhatsApp ${Number(provider.whatsappClicks || 0)} - Partages ${Number(provider.shareClicks || 0)} - Copies ${Number(provider.copyClicks || 0)}</p>
      </div>
      <div class="admin-actions">
        <button class="secondary" type="button" data-admin-verify="${safe(provider.id)}">Vérifier</button>
        <button class="secondary" type="button" data-admin-unverify="${safe(provider.id)}">Retirer badge</button>
        ${provider.remoteStatus === "local_only" ? `<button class="primary" type="button" data-admin-resend-provider="${safe(provider.id)}">Envoyer vers Supabase</button>` : ""}
        <button class="secondary" type="button" data-admin-active="${safe(provider.id)}">Activer test local</button>
        <button class="danger" type="button" data-admin-blur="${safe(provider.id)}">Flouter</button>
      </div>
    </div>
  `).join("")}`;

  document.querySelector("#adminPayments").innerHTML = pendingPayments.length ? pendingPayments.map((payment) => `
    <div class="admin-item">
      <div>
        <h3>${safe(payment.providerName)}</h3>
        <p>${safe(payment.plan)} - ${payment.amount.toLocaleString("fr-FR")} FCFA - ${safe(payment.method)}${paymentBoostSummary(payment) ? ` - ${safe(paymentBoostSummary(payment))}` : ""}</p>
        <p>Réf. ${safe(payment.reference)}</p>
        <p>Supabase : ${safe(payment.remoteStatus || (payment.remoteId ? "lié" : "local"))}${payment.remoteId ? ` - ${safe(payment.remoteId)}` : ""}</p>
        ${payment.proof ? `<a class="doc-link" href="${safe(payment.proof)}" target="_blank" rel="noreferrer">Voir la preuve${payment.proofName ? ` : ${safe(payment.proofName)}` : ""}</a>` : `<p>Aucune preuve jointe.</p>`}
      </div>
      <div class="admin-actions">
        ${!payment.remoteId || payment.remoteStatus === "local_only"
          ? `<button class="secondary" type="button" data-admin-resend-payment="${safe(payment.id)}">Envoyer Supabase</button>`
          : ""}
        <button class="primary" type="button" data-approve-payment="${safe(payment.id)}">Valider le paiement local</button>
        <button class="danger" type="button" data-reject-payment="${safe(payment.id)}">Refuser</button>
      </div>
    </div>
  `).join("") : `<p>Aucun paiement local en attente. Pour les paiements réels, utilisez Validation Supabase en haut.</p>`;

  const deliveryAdminHtml = state.deliveryRequests.length ? `
    <h3>Livraisons Zeyds</h3>
    ${state.deliveryRequests.slice(0, 30).map((request) => deliveryRequestCard(request, { admin: true })).join("")}
  ` : `<h3>Livraisons Zeyds</h3><p>Aucune livraison créée pour le moment.</p>`;

  const expressAdminHtml = openRequests.length ? openRequests.map((request) => {
    const priority = requestPriorityInfo(request);
    return `
    <div class="admin-item">
      <div>
        <h3>${safe(request.service)} - ${safe(requestUrgencyLabel(request.urgency))} ${priorityBadge(priority.label, priority.score)}</h3>
        <p>${safe(request.city)}${request.area ? ` - ${safe(request.area)}` : ""}</p>
        <p>${safe(request.message || "Besoin non détaillé.")}</p>
        <p>Score ${priority.score}/100 - ${priority.matchCount} prestataire(s) recommandé(s).</p>
        <p>${request.phone ? `Contact client : ${safe(request.phone)}` : "Client sans contact renseigné"} - ${new Date(request.createdAt).toLocaleString("fr-FR")}</p>
      </div>
      <div class="admin-actions">
        <button class="secondary" data-copy-admin-request="${safe(request.id)}">Copier demande</button>
        <button class="secondary" data-replay-request="${safe(request.id)}">Voir matches</button>
        <button class="primary" data-close-request="${safe(request.id)}">Marquer traité</button>
      </div>
    </div>
  `; }).join("") : `<p>Aucune demande express ouverte.</p>`;

  document.querySelector("#adminRequests").innerHTML = `${deliveryAdminHtml}<h3>Demandes express</h3>${expressAdminHtml}`;
  bindDeliveryRequestActions(document.querySelector("#adminRequests"));

  document.querySelector("#adminJobs").innerHTML = localJobs.length ? localJobs.map((job) => `
    <div class="admin-item">
      <div>
        <h3>${safe(job.title)}</h3>
        <p>${safe(job.companyName)} - ${safe(job.service)} - ${safe(job.city)}${job.area ? `, ${safe(job.area)}` : ""}</p>
        <p>${safe(job.contractType)}${job.salaryRange ? ` - ${safe(job.salaryRange)}` : ""} - ${safe(job.status)}</p>
        <p><strong>Forfait :</strong> ${safe(job.planName || "Non renseigné")} - ${Number(job.amount || 0).toLocaleString("fr-FR")} ${safe(job.currency || "FCFA")} - ${safe(job.paymentMethod || "")}</p>
        <p>Référence Zeyds : ${safe(job.paymentReference || "Non renseignée")} - paiement ${safe(job.paymentStatus || "unpaid")}${job.isBoosted ? " - boostée" : ""}</p>
        <p>${safe(job.description || "Description non renseignée.")}</p>
        <p>Supabase : ${safe(job.remoteStatus || (job.remoteId ? "lié" : "local"))}${job.remoteId ? ` - ${safe(job.remoteId)}` : ""}</p>
      </div>
      <div class="admin-actions">
        ${jobPaymentTrackingWhatsAppUrl(job) ? `<a class="secondary" href="${safe(jobPaymentTrackingWhatsAppUrl(job))}" target="_blank" rel="noreferrer">Envoyer référence</a>` : ""}
        ${job.status === "pending" ? `<button class="primary" type="button" data-job-publish="${safe(job.id)}">Valider paiement local</button>` : ""}
        ${job.remoteStatus === "local_only" || !job.remoteId ? `<button class="secondary" type="button" data-job-resend="${safe(job.id)}">Envoyer vers Supabase</button>` : ""}
        <button class="danger" type="button" data-job-archive="${safe(job.id)}">Archiver</button>
      </div>
    </div>
  `).join("") : `<p>Aucune offre emploi locale pour le moment.</p>`;

  document.querySelector("#adminEvents").innerHTML = localEvents.length ? localEvents.map((event) => `
    <div class="admin-item">
      <div>
        <h3>${safe(event.title)}</h3>
        <p>${safe(event.organizerName)} - ${safe(event.category)} - ${safe(event.city)}${event.area ? ` - ${safe(event.area)}` : ""} - ${safe(eventDateLabel(event))}</p>
        <p>${safe(eventLocationLabel(event))}${event.address ? ` - ${safe(event.address)}` : ""}</p>
        <p><strong>Forfait visibilité :</strong> ${safe(event.planName || "Non renseigné")} - ${Number(event.amount || 0).toLocaleString("fr-FR")} ${safe(event.currency || "FCFA")} - ${safe(event.paymentMethod || "")}</p>
        <p>Référence Zeyds : ${safe(event.paymentReference || "Non renseignée")} - paiement ${safe(event.paymentStatus || "unpaid")}${event.isSponsored ? " - sponsorisé" : ""}${event.isPremium ? " - premium" : ""}</p>
        <p>Zone : rayon ${Number(event.visibilityRadiusKm || 25).toLocaleString("fr-FR")} km${Number.isFinite(event.latitude) && Number.isFinite(event.longitude) ? ` - GPS ${event.latitude}, ${event.longitude}` : ""}</p>
        <p>Stats : ${Number(event.clickCount || 0)} clic(s), ${Number(event.detailViewCount || 0)} ouverture(s), ${Number(event.ticketClickCount || 0)} billet(s), ${Number(event.contactClickCount || 0)} contact(s).</p>
        <p>${safe(event.description || "Description non renseignée.")}</p>
        <p>Billetterie externe : ${safe(event.ticketUrl || "non renseignée")} - Zeyds ne vend pas les billets.</p>
        <p>Supabase : ${safe(event.remoteStatus || (event.remoteId ? "lié" : "local"))}${event.remoteId ? ` - ${safe(event.remoteId)}` : ""}</p>
      </div>
      <div class="admin-actions">
        ${eventPaymentTrackingWhatsAppUrl(event) ? `<a class="secondary" href="${safe(eventPaymentTrackingWhatsAppUrl(event))}" target="_blank" rel="noreferrer">Envoyer référence</a>` : ""}
        ${eventEndTimestamp(event) < Date.now() && eventStatsWhatsAppUrl(event) ? `<a class="secondary" href="${safe(eventStatsWhatsAppUrl(event))}" target="_blank" rel="noreferrer" data-event-stats-sent="${safe(event.id)}">Envoyer stats</a>` : ""}
        ${event.status === "pending" ? `<button class="primary" type="button" data-event-publish="${safe(event.id)}">Valider local</button>` : ""}
        ${event.remoteStatus === "local_only" || !event.remoteId ? `<button class="secondary" type="button" data-event-resend="${safe(event.id)}">Envoyer vers Supabase</button>` : ""}
        <button class="danger" type="button" data-event-archive="${safe(event.id)}">Archiver</button>
      </div>
    </div>
  `).join("") : `<p>Aucun événement local pour le moment.</p>`;

  document.querySelector("#adminFoodPlaces").innerHTML = localFoodPlaces.length ? localFoodPlaces.map((place) => `
    <div class="admin-item">
      <div>
        <h3>${safe(place.name)}</h3>
        <p>${safe(place.placeType)} - ${safe(place.mainSpecialty)} - ${safe(place.city)}${place.area ? `, ${safe(place.area)}` : ""}</p>
        <p>${safe(place.address || "Adresse non renseignée")} ${place.openingHours ? `- ${safe(place.openingHours)}` : ""}</p>
        <p>${place.deliveryAvailable ? "Livraison possible" : "Sur place / à emporter"}${place.averageBudget ? ` - ${safe(place.averageBudget)}` : ""}</p>
        <p>${safe(place.description || "Description non renseignée.")}</p>
        <p>Statut : ${safe(place.status)} - ${safe(place.verificationStatus)} - Supabase : ${safe(place.remoteStatus || (place.remoteId ? "lié" : "local"))}${place.remoteId ? ` - ${safe(place.remoteId)}` : ""}</p>
      </div>
      <div class="admin-actions">
        ${place.status === "pending" ? `<button class="primary" type="button" data-food-publish="${safe(place.id)}">Valider Food local</button>` : ""}
        ${place.remoteStatus === "local_only" || !place.remoteId ? `<button class="secondary" type="button" data-food-resend="${safe(place.id)}">Envoyer vers Supabase</button>` : ""}
        <button class="danger" type="button" data-food-archive="${safe(place.id)}">Archiver</button>
      </div>
    </div>
  `).join("") : `<p>Aucune adresse Food locale pour le moment.</p>`;

  document.querySelector("#adminExceptionPlaces").innerHTML = localExceptionPlaces.length ? localExceptionPlaces.map((place) => `
    <div class="admin-item">
      <div>
        <h3>${safe(place.name)} ${exceptionPlaceBoostActive(place) ? '<span class="tag ok">Boost actif</span>' : ""}</h3>
        <p>${safe(place.city)}${place.area ? ` - ${safe(place.area)}` : ""} - ${safe(place.ownerName)} - ${safe(place.contactPhone)}</p>
        <p><strong>Offre :</strong> ${safe(place.planName)} - ${Number(place.amount || 0).toLocaleString("fr-FR")} FCFA - paiement ${safe(place.paymentStatus)}</p>
        <p>Statut : ${safe(place.status)}${place.visibilityEndsAt ? ` - visible jusqu’au ${new Date(place.visibilityEndsAt).toLocaleString("fr-FR")}` : " - période non démarrée"}</p>
        <p>Supabase : ${safe(place.remoteStatus || (place.remoteId ? "lié" : "local"))}${place.adminGrant ? " - offert par Zeyds" : ""}</p>
      </div>
      <div class="admin-actions">
        ${place.status === "pending" ? `<button class="primary" type="button" data-exception-publish="${safe(place.id)}">Valider 30 jours</button>` : ""}
        <button class="danger" type="button" data-exception-archive="${safe(place.id)}">Archiver</button>
      </div>
    </div>
  `).join("") : `<p>Aucun lieu d’exception enregistré.</p>`;

  document.querySelector("#adminRenewals").innerHTML = renewalProviders.length ? renewalProviders.map((provider) => `
    <div class="admin-item">
      <div>
        <h3>${safe(provider.fullName)}</h3>
        <p>${safe(providerServicesLabel(provider))} - ${safe(provider.city)} - ${safe(renewalStatus(provider) || subscriptionLabel(provider))}</p>
        <p>${safe(provider.phone)}</p>
        <p class="renewal-message">${safe(renewalMessage(provider))}</p>
      </div>
      <div class="admin-actions">
        ${renewalWhatsAppUrl(provider) ? `<a class="primary" href="${safe(renewalWhatsAppUrl(provider))}" target="_blank" rel="noreferrer" data-renewal-whatsapp="${safe(provider.id)}">WhatsApp relance</a>` : ""}
        <button class="secondary" type="button" data-copy-renewal="${safe(provider.id)}">Copier message</button>
        <button class="secondary" type="button" data-admin-active="${safe(provider.id)}">Réactiver test local</button>
        <button class="danger" type="button" data-admin-blur="${safe(provider.id)}">Flouter</button>
      </div>
    </div>
  `).join("") : `<p>Aucun renouvellement urgent.</p>`;

  document.querySelector("#adminPaymentHistory").innerHTML = state.payments.length ? [...state.payments].reverse().map((payment) => `
    <div class="admin-item">
      <div>
        <h3>${safe(payment.providerName)}</h3>
        <p>${safe(payment.status)} - ${safe(payment.plan)} - ${payment.amount.toLocaleString("fr-FR")} FCFA - ${safe(payment.method)}${paymentBoostSummary(payment) ? ` - ${safe(paymentBoostSummary(payment))}` : ""}</p>
        <p>Réf. ${safe(payment.reference)}${payment.reviewedAt ? ` - traité le ${new Date(payment.reviewedAt).toLocaleDateString("fr-FR")}` : ""}</p>
        <p>Supabase : ${safe(payment.remoteStatus || (payment.remoteId ? "lié" : "local"))}${payment.remoteId ? ` - ${safe(payment.remoteId)}` : ""}</p>
      </div>
      <div class="admin-actions">
        ${!payment.remoteId || payment.remoteStatus === "local_only"
          ? `<button class="secondary" type="button" data-admin-resend-payment="${safe(payment.id)}">Envoyer Supabase</button>`
          : `<span class="tag ok">Envoyé Supabase</span>`}
      </div>
    </div>
  `).join("") : `<p>Aucun paiement enregistré.</p>`;

  document.querySelector("#adminReports").innerHTML = openReports.length ? openReports.map((report) => `
    <div class="admin-item">
      <div>
        <h3>${safe(report.providerName)}</h3>
        <p>${safe(report.service)} - ${safe(report.reason)}</p>
        <p>${safe(report.message || "Aucun message complémentaire.")}</p>
        <p>Supabase : ${safe(report.remoteStatus || (report.remoteId ? "lié" : "local"))}${report.remoteId ? ` - ${safe(report.remoteId)}` : ""}</p>
        <p>${new Date(report.createdAt).toLocaleDateString("fr-FR")}</p>
      </div>
      <div class="admin-actions">
        <button class="secondary" data-close-report="${safe(report.id)}">Marquer traité</button>
        <button class="danger" data-report-blur="${safe(report.providerId)}">Flouter le prestataire</button>
      </div>
    </div>
  `).join("") : `<p>Aucun signalement ouvert.</p>`;

  document.querySelector("#adminReviews").innerHTML = recentReviews.length ? recentReviews.map((review) => `
    <div class="admin-item">
      <div>
        <h3>${safe(review.providerName)}</h3>
        <p>${Number(review.rating || 0)}/5 - ${safe(review.service)} - ${safe(review.city)}</p>
        <p>${safe(review.message || "Avis sans commentaire.")}</p>
        <p>${new Date(review.createdAt).toLocaleDateString("fr-FR")}</p>
      </div>
    </div>
  `).join("") : `<p>Aucun avis client pour le moment.</p>`;

  renderProductionStatus();
  renderSupabaseStatus();
  renderRemoteAdminPanel();
  renderLaunchChecklist();

  document.querySelectorAll("[data-admin-verify]").forEach((button) => {
    button.addEventListener("click", () => {
      const provider = state.providers.find((item) => item.id === button.dataset.adminVerify);
      if (!provider) return;
      provider.verificationStatus = "verified";
      provider.verifiedAt = new Date().toISOString();
      provider.verificationNote = "Profil vérifié par l'admin Zeyds.";
      saveState();
      renderAdmin();
      renderProviders();
      renderHomeDiscovery();
      renderSavedProviders();
    });
  });

  document.querySelectorAll("[data-admin-unverify]").forEach((button) => {
    button.addEventListener("click", () => {
      const provider = state.providers.find((item) => item.id === button.dataset.adminUnverify);
      if (!provider) return;
      provider.verificationStatus = "none";
      provider.verifiedAt = null;
      provider.verificationNote = "";
      saveState();
      renderAdmin();
      renderProviders();
      renderHomeDiscovery();
      renderSavedProviders();
    });
  });

  document.querySelectorAll("[data-admin-resend-provider]").forEach((button) => {
    button.addEventListener("click", () => resendLocalProviderToSupabase(button.dataset.adminResendProvider, button));
  });

  document.querySelectorAll("[data-admin-resend-payment]").forEach((button) => {
    button.addEventListener("click", () => resendLocalPaymentToSupabase(button.dataset.adminResendPayment, button));
  });

  document.querySelectorAll("[data-admin-active]").forEach((button) => {
    button.addEventListener("click", () => {
      const provider = state.providers.find((item) => item.id === button.dataset.adminActive);
      if (!provider) return;
      provider.visibility = "active";
      saveState();
      renderAdmin();
      renderProviders();
      renderAd();
      renderAdminRemoteStatus("Activation locale de test effectuée. Pour publier réellement dans Supabase, remontez au bloc Validation Supabase puis cliquez sur Activer mois gratuit Supabase dans Prestataires Supabase en attente.", true);
    });
  });

  document.querySelectorAll("[data-admin-blur]").forEach((button) => {
    button.addEventListener("click", () => {
      const provider = state.providers.find((item) => item.id === button.dataset.adminBlur);
      if (!provider) return;
      provider.visibility = "expired_blurred";
      saveState();
      renderAdmin();
      renderProviders();
    });
  });

  document.querySelectorAll("[data-approve-payment]").forEach((button) => {
    button.addEventListener("click", () => {
      const payment = state.payments.find((item) => item.id === button.dataset.approvePayment);
      if (!payment) return;
      if (payment.status === "approved" && payment.benefitsAppliedAt) {
        renderProviderStatus("Ce paiement a déjà été validé. Aucun renouvellement ni boost supplémentaire n'a été ajouté.");
        return;
      }
      payment.status = "approved";
      payment.reviewedAt = new Date().toISOString();
      const provider = state.providers.find((item) => item.id === payment.providerId);
      if (!provider) return;
      applyApprovedPaymentBenefits(provider, payment);
      saveState();
      renderAdmin();
      renderProviders();
      renderProviderStatus(`Paiement validé : abonnement prolongé jusqu'au ${new Date(provider.subscriptionEndsAt).toLocaleDateString("fr-FR")}${providerBoostActive(provider) ? `, boost actif jusqu'au ${new Date(provider.boostEndsAt).toLocaleDateString("fr-FR")}` : ""}.`);
    });
  });

  document.querySelectorAll("[data-reject-payment]").forEach((button) => {
    button.addEventListener("click", () => {
      const payment = state.payments.find((item) => item.id === button.dataset.rejectPayment);
      if (!payment) return;
      payment.status = "rejected";
      payment.reviewedAt = new Date().toISOString();
      payment.adminNote = "Paiement refusé en démonstration locale.";
      saveState();
      renderAdmin();
      renderProviderStatus("Paiement refusé : vérifiez la référence ou la preuve.");
    });
  });

  document.querySelectorAll("[data-close-report]").forEach((button) => {
    button.addEventListener("click", () => {
      const report = state.reports.find((item) => item.id === button.dataset.closeReport);
      if (!report) return;
      report.status = "reviewed";
      saveState();
      renderAdmin();
    });
  });

  document.querySelectorAll("[data-report-blur]").forEach((button) => {
    button.addEventListener("click", () => {
      const provider = state.providers.find((item) => item.id === button.dataset.reportBlur);
      if (!provider) return;
      provider.visibility = "expired_blurred";
      saveState();
      renderAdmin();
      renderProviders();
    });
  });

  document.querySelectorAll("[data-copy-admin-request]").forEach((button) => {
    button.addEventListener("click", async () => {
      const request = state.requests.find((item) => item.id === button.dataset.copyAdminRequest);
      if (!request) return;
      if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim();
      const copied = await copyTextToClipboard(expressRequestMessage(request));
      finishActionButton(button, copied ? "Demande copiée" : "Copie impossible");
    });
  });

  document.querySelectorAll("[data-replay-request]").forEach((button) => {
    button.addEventListener("click", () => {
      const request = state.requests.find((item) => item.id === button.dataset.replayRequest);
      if (!request) return;
      renderExpressRequestResult(request);
      setView("request");
    });
  });

  document.querySelectorAll("[data-close-request]").forEach((button) => {
    button.addEventListener("click", async () => {
      const request = state.requests.find((item) => item.id === button.dataset.closeRequest);
      if (!request) return;
      request.status = "closed";
      request.closedAt = new Date().toISOString();
      saveState();
      if (request.remoteId && adminAuthSession?.accessToken) {
        try {
          await closeRemoteExpressRequest(request.remoteId, button);
        } catch {
        }
      }
      renderAdmin();
    });
  });

  document.querySelectorAll("[data-job-publish]").forEach((button) => {
    button.addEventListener("click", () => {
      const job = state.jobOffers.find((item) => item.id === button.dataset.jobPublish);
      if (!job) return;
      ensureJobPaymentReference(job);
      job.status = "published";
      job.paymentStatus = "approved";
      job.updatedAt = new Date().toISOString();
      saveState();
      renderAdmin();
      renderJobs();
      renderLaunchChecklist();
      renderAdminRemoteStatus("Publication locale effectuée. Pour publier réellement dans Supabase, utilisez Validation Supabase après exécution du script SQL emplois.", true);
    });
  });

  document.querySelectorAll("[data-job-archive]").forEach((button) => {
    button.addEventListener("click", () => {
      const job = state.jobOffers.find((item) => item.id === button.dataset.jobArchive);
      if (!job) return;
      job.status = "archived";
      job.updatedAt = new Date().toISOString();
      saveState();
      renderAdmin();
      renderJobs();
      renderLaunchChecklist();
    });
  });

  document.querySelectorAll("[data-job-resend]").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = state.jobOffers.find((item) => item.id === button.dataset.jobResend);
      if (!job) return;
      setBusyButton(button, true, "Envoi...");
      try {
        const message = await submitJobOfferToSupabase(job);
        saveState();
        renderAdmin();
        renderJobs();
        if (adminAuthSession?.accessToken) await loadSupabaseAdminQueue();
        renderAdminRemoteStatus(`${message} L'offre apparaîtra dans Offres emploi Supabase en attente après chargement.`, true);
        finishActionButton(button, "Envoyée");
      } catch (error) {
        job.remoteStatus = "local_only";
        saveState();
        renderAdminRemoteStatus(`Envoi offre impossible : ${friendlySupabaseError(error)}. Exécutez sql-copie-bizzi/59-emplois-missions-toutes-entreprises-v130.sql si la table manque ou refuse les offres payantes.`, true);
        finishActionButton(button, "Erreur");
      }
    });
  });

  document.querySelectorAll("[data-event-publish]").forEach((button) => {
    button.addEventListener("click", () => {
      const event = state.eventPromotions.find((item) => item.id === button.dataset.eventPublish);
      if (!event) return;
      ensureEventPaymentReference(event);
      const activatedAt = new Date().toISOString();
      event.status = "published";
      event.paymentStatus = "approved";
      event.updatedAt = activatedAt;
      activateEventBoostWindow(event, activatedAt);
      saveState();
      renderAdmin();
      renderEvents();
      renderLaunchChecklist();
      renderAdminRemoteStatus(eventBoostActive(event)
        ? `Publication locale effectuée : boost prioritaire actif jusqu'au ${new Date(event.boostEndsAt).toLocaleString("fr-FR")}. Pour publier réellement dans Supabase, utilisez Validation Supabase.`
        : "Publication locale effectuée. Pour publier réellement dans Supabase, utilisez Validation Supabase.", true);
    });
  });

  document.querySelectorAll("[data-event-archive]").forEach((button) => {
    button.addEventListener("click", () => {
      const event = state.eventPromotions.find((item) => item.id === button.dataset.eventArchive);
      if (!event) return;
      event.status = "archived";
      event.updatedAt = new Date().toISOString();
      saveState();
      renderAdmin();
      renderEvents();
      renderLaunchChecklist();
    });
  });

  document.querySelectorAll("[data-event-resend]").forEach((button) => {
    button.addEventListener("click", async () => {
      const event = state.eventPromotions.find((item) => item.id === button.dataset.eventResend);
      if (!event) return;
      setBusyButton(button, true, "Envoi...");
      try {
        const message = await submitEventPromotionToSupabase(event);
        saveState();
        renderAdmin();
        renderEvents();
        if (adminAuthSession?.accessToken) await loadSupabaseAdminQueue();
        renderAdminRemoteStatus(`${message} L'événement apparaîtra dans Événements Supabase en attente après chargement.`, true);
        finishActionButton(button, "Envoyé");
      } catch (error) {
        event.remoteStatus = "local_only";
        saveState();
        renderAdminRemoteStatus(`Envoi événement impossible : ${friendlySupabaseError(error)}. Exécutez sql-copie-bizzi/67-evenements-geolocalises-v156.sql si la table manque ou refuse les boosts géolocalisés.`, true);
        finishActionButton(button, "Erreur");
      }
    });
  });

  document.querySelectorAll("[data-event-stats-sent]").forEach((link) => {
    link.addEventListener("click", () => {
      const event = state.eventPromotions.find((item) => item.id === link.dataset.eventStatsSent);
      if (!event) return;
      event.statsSentAt = new Date().toISOString();
      saveState();
      renderAdminRemoteStatus(`Statistiques préparées pour ${event.title}.`, true);
    });
  });

  document.querySelectorAll("[data-food-publish]").forEach((button) => {
    button.addEventListener("click", () => {
      const place = state.foodPlaces.find((item) => item.id === button.dataset.foodPublish);
      if (!place) return;
      place.status = "published";
      place.verificationStatus = place.verificationStatus === "verified" ? "verified" : "pending";
      place.updatedAt = new Date().toISOString();
      saveState();
      renderAdmin();
      renderFood();
      renderHomeDiscovery();
      renderAdminRemoteStatus("Adresse Food validée localement. Pour publier réellement dans Supabase, exécutez le SQL Food puis renvoyez l'adresse.", true);
    });
  });

  document.querySelectorAll("[data-food-archive]").forEach((button) => {
    button.addEventListener("click", () => {
      const place = state.foodPlaces.find((item) => item.id === button.dataset.foodArchive);
      if (!place) return;
      place.status = "archived";
      place.updatedAt = new Date().toISOString();
      saveState();
      renderAdmin();
      renderFood();
      renderHomeDiscovery();
    });
  });

  document.querySelectorAll("[data-food-resend]").forEach((button) => {
    button.addEventListener("click", async () => {
      const place = state.foodPlaces.find((item) => item.id === button.dataset.foodResend);
      if (!place) return;
      setBusyButton(button, true, "Envoi...");
      try {
        const message = await submitFoodPlaceToSupabase(place);
        saveState();
        renderAdmin();
        renderFood();
        renderAdminRemoteStatus(message, true);
        finishActionButton(button, "Envoyée");
      } catch (error) {
        place.remoteStatus = "local_only";
        saveState();
        renderAdminRemoteStatus(`Envoi Food impossible : ${friendlySupabaseError(error)}. Exécutez sql-copie-bizzi/91-bizzi-food-v204.sql si la table manque.`, true);
        finishActionButton(button, "Erreur");
      }
    });
  });

  document.querySelectorAll("[data-exception-publish]").forEach((button) => {
    button.addEventListener("click", () => {
      const place = state.exceptionPlaces.find((item) => item.id === button.dataset.exceptionPublish);
      if (!place) return;
      const now = new Date();
      const plan = exceptionPlanById(place.planId);
      place.status = "published";
      place.paymentStatus = "approved";
      place.visibilityStartsAt = now.toISOString();
      place.visibilityEndsAt = new Date(now.getTime() + 30 * 86400000).toISOString();
      if (Number(plan.boostDays || 0) > 0) {
        place.boostStartsAt = now.toISOString();
        place.boostEndsAt = new Date(now.getTime() + Number(plan.boostDays) * 86400000).toISOString();
      }
      place.updatedAt = now.toISOString();
      saveState();
      renderAdmin();
      renderExceptionPlaces();
      renderHomeDiscovery();
      renderAdminRemoteStatus(`${place.name} validé : 30 jours de visibilité${plan.boostDays ? ` et boost ${plan.boostDays} jour(s)` : ""}.`, true);
    });
  });

  document.querySelectorAll("[data-exception-archive]").forEach((button) => {
    button.addEventListener("click", () => {
      const place = state.exceptionPlaces.find((item) => item.id === button.dataset.exceptionArchive);
      if (!place) return;
      place.status = "archived";
      place.updatedAt = new Date().toISOString();
      saveState();
      renderAdmin();
      renderExceptionPlaces();
      renderHomeDiscovery();
    });
  });

  document.querySelectorAll("[data-renewal-whatsapp]").forEach((link) => {
    link.addEventListener("click", () => {
      const provider = state.providers.find((item) => item.id === link.dataset.renewalWhatsapp);
      if (!provider) return;
      state.leads.push({
        id: `lead${Date.now()}${Math.floor(Math.random() * 1000)}`,
        providerId: provider.id,
        providerName: provider.fullName,
        service: provider.service,
        city: provider.city,
        action: "renewal_whatsapp",
        detail: "Relance abonnement envoyée depuis l'admin",
        createdAt: new Date().toISOString(),
      });
      saveState();
      window.setTimeout(renderAdmin, 300);
    });
  });

  document.querySelectorAll("[data-copy-renewal]").forEach((button) => {
    button.addEventListener("click", async () => {
      const provider = state.providers.find((item) => item.id === button.dataset.copyRenewal);
      if (!provider) return;
      if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim();
      const copied = await copyTextToClipboard(renewalMessage(provider));
      if (copied) {
        state.leads.push({
          id: `lead${Date.now()}${Math.floor(Math.random() * 1000)}`,
          providerId: provider.id,
          providerName: provider.fullName,
          service: provider.service,
          city: provider.city,
          action: "renewal_copy",
          detail: "Message de relance copié depuis l'admin",
          createdAt: new Date().toISOString(),
        });
        saveState();
        finishActionButton(button, "Copié");
        return;
      }
      finishActionButton(button, "Copie impossible");
    });
  });
}

function renderAdminAccess() {
  unlockAdminFromSecureEntry();
  document.querySelector("#adminLogin").hidden = adminUnlocked;
  document.querySelector("#adminContent").hidden = !adminUnlocked;
}

function setupAdminAccess() {
  const form = document.querySelector("#adminLoginForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!bizziConfig.admin?.demoPin) {
      document.querySelector("#adminLoginStatus").innerHTML = "<strong>Entrée admin sécurisée</strong><p>Utilisez le lien admin officiel, puis connectez-vous à Supabase pour les actions réelles.</p>";
      return;
    }
    const data = new FormData(event.currentTarget);
    if (data.get("pin") === bizziConfig.admin?.demoPin) {
      adminUnlocked = true;
      safeSessionSet(ADMIN_UNLOCK_KEY, "true");
      event.currentTarget.reset();
      document.querySelector("#adminLoginStatus").innerHTML = "";
      renderAdmin();
      return;
    }
    document.querySelector("#adminLoginStatus").innerHTML = "<strong>Code incorrect</strong><p>Vérifiez le code admin temporaire.</p>";
  });

  document.querySelector("#lockAdmin").addEventListener("click", () => {
    adminUnlocked = false;
    safeSessionRemove(ADMIN_UNLOCK_KEY);
    safeSessionRemove(ADMIN_ENTRY_KEY);
    setView("home");
  });
}

function hasProductionValue(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return false;
  return ![
    "a renseigner",
    "à renseigner",
    "votre",
    "votre_",
    "votre-",
    "votre ",
    "xx xx",
    "a_remplacer",
  ].some((placeholder) => normalized.includes(placeholder));
}

function productionChecklistItem(label, ready, detail) {
  return `
    <div class="production-item ${ready ? "ok" : "todo"}">
      <span class="production-state">${ready ? "OK" : "A finaliser"}</span>
      <div>
        <strong>${safe(label)}</strong>
        <p>${safe(detail)}</p>
      </div>
    </div>
  `;
}

function launchChecklistItem(label, ready, detail) {
  return `
    <div class="launch-step ${ready ? "ok" : "todo"}">
      <span>${ready ? "OK" : "..."}</span>
      <div>
        <strong>${safe(label)}</strong>
        <p>${safe(detail)}</p>
      </div>
    </div>
  `;
}

function loadFinalRecipeChecks() {
  try {
    return JSON.parse(safeLocalGet(FINAL_RECIPE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveFinalRecipeChecks(checks) {
  safeLocalSet(FINAL_RECIPE_KEY, JSON.stringify(checks || {}));
}

function finalRecipeChecklistHtml() {
  const saved = loadFinalRecipeChecks();
  const doneCount = FINAL_RECIPE_ITEMS.filter((item) => saved[item.id]).length;
  return `
    <div class="final-recipe">
      <div class="section-head">
        <h3>Recette finale manuelle</h3>
        <span class="tag ${doneCount === FINAL_RECIPE_ITEMS.length ? "ok" : "pending"}">${doneCount}/${FINAL_RECIPE_ITEMS.length}</span>
      </div>
      <p>Cochez chaque point après test réel sur téléphone. Cette liste reste enregistrée sur cet appareil admin.</p>
      <div class="final-recipe-list">
        ${FINAL_RECIPE_ITEMS.map((item) => `
          <label class="final-recipe-item ${saved[item.id] ? "done" : ""}">
            <input type="checkbox" data-final-recipe="${safe(item.id)}" ${saved[item.id] ? "checked" : ""}>
            <span>
              <strong>${safe(item.label)}</strong>
              <small>${safe(item.detail)}</small>
            </span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function bindFinalRecipeChecklist(root) {
  root.querySelectorAll("[data-final-recipe]").forEach((input) => {
    input.addEventListener("change", () => {
      const saved = loadFinalRecipeChecks();
      saved[input.dataset.finalRecipe] = input.checked;
      saveFinalRecipeChecks(saved);
      renderLaunchChecklist();
    });
  });
}

function renderLaunchChecklist() {
  const root = document.querySelector("#launchChecklist");
  if (!root) return;
  const publicProviders = state.providers.filter((provider) => provider.status === "approved" && provider.visibility === "active");
  const hasRemoteProvider = state.providers.some((provider) => provider.remoteId || String(provider.id || "").startsWith("sb-"));
  const hasPendingPayment = state.payments.some((payment) => payment.status === "pending") || remoteAdminQueue.payments.length > 0;
  const hasApprovedPayment = state.payments.some((payment) => payment.status === "approved") || publicProviders.length > 0;
  const hasContacts = state.leads.some((lead) => ["call", "whatsapp", "route", "share", "copy"].includes(lead.action));
  const hasReviews = state.reviews.length > 0;
  const hasRequests = state.requests.length > 0;
  const hasJobs = activeJobOffers().length > 0 || remoteAdminQueue.jobs.length > 0 || state.jobOffers.some((job) => job.remoteId);
  const hasEvents = activeEventPromotions().length > 0 || remoteAdminQueue.events.length > 0 || state.eventPromotions.some((event) => event.remoteId);
  const checks = [
    {
      label: "Connexion Supabase",
      ready: supabaseConfigured(),
      detail: supabaseConfigured() ? "La base est branchée à Zeyds." : "Configurer l'URL et la clé publique Supabase.",
    },
    {
      label: "Catalogue public",
      ready: Boolean(state.remote?.lastSupabaseSyncAt) && state.categories.length > 0,
      detail: state.remote?.lastSupabaseSyncAt ? "Les services publics ont été importés." : "Importer les données publiques depuis l'admin.",
    },
    {
      label: "Soumission prestataire",
      ready: hasRemoteProvider,
      detail: hasRemoteProvider ? "Au moins un prestataire est lié à Supabase." : "Créer un prestataire test depuis le parcours prestataire.",
    },
    {
      label: "Paiement en attente",
      ready: hasPendingPayment || hasApprovedPayment,
      detail: hasPendingPayment ? "Un paiement attend la validation admin." : hasApprovedPayment ? "Un paiement a déjà été validé." : "Envoyer un paiement test après création du prestataire.",
    },
    {
      label: "Validation admin",
      ready: hasApprovedPayment,
      detail: hasApprovedPayment ? "La validation active la visibilité client." : "Valider un paiement depuis Validation Supabase.",
    },
    {
      label: "Visibilité client",
      ready: publicProviders.length > 0,
      detail: publicProviders.length ? `${publicProviders.length} prestataire(s) visible(s) côté client.` : "Importer le public après validation pour afficher le prestataire.",
    },
    {
      label: "Contacts Zeyds",
      ready: hasContacts,
      detail: hasContacts ? "Au moins une action client a été enregistrée." : "Ouvrir une fiche côté client puis tester un contact.",
    },
    {
      label: "Demande express",
      ready: hasRequests,
      detail: hasRequests ? "Au moins une demande client a été créée." : "Créer une demande express côté client pour tester le matching.",
    },
    {
      label: "Emplois & missions",
      ready: hasJobs,
      detail: hasJobs ? "La brique emploi est active ou une offre attend validation." : "Publier une offre test depuis Emplois puis valider côté admin.",
    },
    {
      label: "Événements",
      ready: hasEvents,
      detail: hasEvents ? "La promotion d'événements est active ou un événement attend validation." : "Créer un événement test puis valider le forfait visibilité côté admin.",
    },
    {
      label: "Avis client",
      ready: hasReviews,
      detail: hasReviews ? "Au moins un avis client a été enregistré." : "Laisser un avis rapide après un contact test.",
    },
  ];
  root.innerHTML = `
    <div class="auto-recipe">
      <div class="section-head">
        <h3>Contrôles automatiques</h3>
        <span class="tag ok">${checks.filter((item) => item.ready).length}/${checks.length}</span>
      </div>
      ${checks.map((item) => launchChecklistItem(item.label, item.ready, item.detail)).join("")}
    </div>
    ${finalRecipeChecklistHtml()}
  `;
  bindFinalRecipeChecklist(root);
}

function renderProductionStatus() {
  const supabaseReady = hasProductionValue(bizziConfig.supabase?.url) && hasProductionValue(bizziConfig.supabase?.anonKey);
  const methods = bizziConfig.payments?.methods || [];
  const accounts = bizziConfig.payments?.accounts || {};
  const paymentApiReady = bizziConfig.payments?.mode === "provider_api";
  const paymentAccountsReady = methods.length > 0 && methods.every((method) => hasProductionValue(accounts[method]));
  const socialReady = Object.values(bizziConfig.social || {}).some(hasProductionValue);
  const officialReady = hasProductionValue(bizziConfig.official?.domain)
    && hasProductionValue(officialWebsiteUrl())
    && hasProductionValue(officialEmail("contactEmail"));
  const adminReady = bizziConfig.admin?.allowQueryEntry === false && !hasProductionValue(bizziConfig.admin?.demoPin);
  const modeReady = bizziConfig.mode === "production";
  const supabaseSyncReady = Boolean(state.remote?.lastSupabaseSyncAt);
  const supabaseWriteReady = Boolean(state.remote?.lastSupabaseWriteAt);
  const storage = bizziConfig.supabase?.storage || {};
  const storageReady = ["providerPhotos", "verificationProofs", "paymentProofs", "eventPosters"]
    .every((key) => hasProductionValue(storage[key] || supabaseStorageBucket(key)));
  const paymentMode = paymentApiReady ? "API paiement" : "Validation manuelle admin";
  const checks = [
    {
      label: "Mode application",
      ready: modeReady,
      detail: modeReady ? "Configuration marquée production." : "Passer config.js en mode production avant publication.",
    },
    {
      label: "Base de données Supabase",
      ready: supabaseReady,
      detail: supabaseReady ? "URL et clé publique renseignées." : "Renseigner Supabase pour sortir du stockage local du navigateur.",
    },
    {
      label: "Domaine et email officiel",
      ready: officialReady,
      detail: officialReady ? `${bizziConfig.official.domain} et ${officialEmail("contactEmail")} sont configurés.` : "Renseigner le domaine officiel et l'email de contact Zeyds.",
    },
    {
      label: "Import public Supabase",
      ready: supabaseSyncReady,
      detail: supabaseSyncReady ? `Dernier import le ${new Date(state.remote.lastSupabaseSyncAt).toLocaleDateString("fr-FR")}.` : "Tester puis importer les données publiques depuis l'espace admin.",
    },
    {
      label: "Ecritures Supabase",
      ready: supabaseWriteReady,
      detail: supabaseWriteReady ? `Dernière écriture le ${new Date(state.remote.lastSupabaseWriteAt).toLocaleDateString("fr-FR")}.` : "Créer un prestataire, un paiement ou un signalement après configuration Supabase.",
    },
    {
      label: "Stockage fichiers",
      ready: storageReady,
      detail: storageReady ? "Buckets Storage définis pour photos, justificatifs, preuves de paiement et affiches événements." : "Renseigner les buckets Supabase Storage.",
    },
    {
      label: "Paiements mobile money",
      ready: paymentAccountsReady,
      detail: paymentApiReady && paymentAccountsReady
        ? "Wave, Orange Money et MTN Money sont configurés avec API."
        : paymentAccountsReady
          ? "Comptes dédiés renseignés, validation manuelle active pour le lancement."
          : "Renseigner des comptes dédiés Zeyds pour Wave, Orange Money et MTN Money.",
    },
    {
      label: "Accès administrateur",
      ready: adminReady,
      detail: adminReady ? "Entrée admin dédiée et validations protégées par connexion Supabase." : "Désactiver le PIN public et garder l'accès admin sur admin-access.html.",
    },
    {
      label: "Contact officiel Zeyds",
      ready: socialReady,
      detail: socialReady ? "Au moins un canal officiel Zeyds est renseigné." : "Ajouter au moins un canal officiel Zeyds pour les partages et le support.",
    },
  ];
  const readyCount = checks.filter((item) => item.ready).length;
  const allReady = readyCount === checks.length;

  document.querySelector("#productionStatus").innerHTML = `
    <div class="production-head">
      <div>
        <strong>${safe(bizziConfig.appName || "Zeyds")} ${safe(bizziConfig.version || "V45")}</strong>
        <p>Mode ${safe(bizziConfig.mode || "local")} - ${safe(paymentMode)} - ${readyCount}/${checks.length} points prêts</p>
      </div>
      <span class="production-pill ${allReady ? "ready" : "pending"}">${allReady ? "Prêt publication" : "Pré-production"}</span>
    </div>
    <div class="production-checklist">
      ${checks.map((item) => productionChecklistItem(item.label, item.ready, item.detail)).join("")}
    </div>
    <p class="production-note">${allReady ? "Les paramètres essentiels sont prêts pour les tests finaux." : "Ces points sont des réglages à finaliser progressivement. Ils ne bloquent pas l'utilisation publique de Zeyds."}</p>
  `;
}

function renderOfficialContact() {
  const root = document.querySelector("#officialContact");
  if (!root) return;
  const website = officialWebsiteUrl();
  const domain = bizziConfig.official?.domain || "bizzi-africa.com";
  const contactEmail = officialEmail("contactEmail");
  const supportEmail = officialEmail("supportEmail");
  const paymentEmail = officialEmail("paymentEmail");
  const providersEmail = officialEmail("providersEmail");
  const supportWhatsapp = String(bizziConfig.official?.supportWhatsapp || "").trim();
  const supportWhatsappHref = supportWhatsapp ? `https://wa.me/${supportWhatsapp.replace(/[^\d]/g, "")}` : "";
  root.innerHTML = `
    <div class="official-contact">
      <p><strong>Domaine :</strong> ${website ? `<a href="${safe(website)}" target="_blank" rel="noreferrer">${safe(domain)}</a>` : safe(domain)}</p>
      <p><strong>Contact :</strong> ${safeMailtoHref(contactEmail) ? `<a href="${safe(safeMailtoHref(contactEmail))}">${safe(contactEmail)}</a>` : safe(contactEmail)}</p>
      <p><strong>Support :</strong> ${safeMailtoHref(supportEmail) ? `<a href="${safe(safeMailtoHref(supportEmail))}">${safe(supportEmail)}</a>` : safe(supportEmail)}</p>
      ${supportWhatsapp ? `<p><strong>WhatsApp :</strong> <a href="${safe(supportWhatsappHref)}" target="_blank" rel="noreferrer">${safe(supportWhatsapp)}</a></p>` : ""}
      <p><strong>Paiements :</strong> ${safeMailtoHref(paymentEmail) ? `<a href="${safe(safeMailtoHref(paymentEmail))}">${safe(paymentEmail)}</a>` : safe(paymentEmail)}</p>
      <p><strong>Prestataires :</strong> ${safeMailtoHref(providersEmail) ? `<a href="${safe(safeMailtoHref(providersEmail))}">${safe(providersEmail)}</a>` : safe(providersEmail)}</p>
    </div>
  `;
}

function renderSidebarContact() {
  const root = document.querySelector("#sidebarContact");
  if (!root) return;
  const supportWhatsapp = String(bizziConfig.official?.supportWhatsapp || "").trim();
  if (!supportWhatsapp) {
    root.innerHTML = "";
    return;
  }
  const href = `https://wa.me/${supportWhatsapp.replace(/[^\d]/g, "")}`;
  root.innerHTML = `<a class="sidebar-contact-link" href="${safe(href)}" target="_blank" rel="noreferrer"><span aria-hidden="true">💬</span> ${safe(supportWhatsapp)}</a>`;
}

function refreshApp() {
  applySubscriptionRules();
  renderCategories();
  renderServices();
  renderProviders();
  renderDelivery();
  renderFood();
  renderEvents();
  renderEventEntryMode();
  renderDeliveryEntryMode();
  renderJobs();
  renderJobEntryMode();
  renderProviderDeliveryQueue();
  renderPaymentProviderOptions();
  renderProviderEntryMode();
  renderProviderStatus();
  renderFoodStatus();
  renderExceptionPlaces();
  renderEventStatus();
  renderEventPaymentOptions();
  renderJobOfferStatus();
  renderJobPaymentOptions();
  renderDeliveryPaymentOptions();
  renderPaymentInstructions();
  renderAdmin();
  renderAd();
  renderHomeDiscovery();
  renderSavedProviders();
  renderGeoStatus();
  renderOfficialContact();
  renderSidebarContact();
}

function replaceState(nextState) {
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, normalizeState({ ...structuredClone(seed), ...nextState }));
  saveState();
  refreshApp();
}

function exportData() {
  const payload = {
    app: "Zeyds",
    version: bizziConfig.version || "V304",
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bizzi-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadTextFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
    }
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}

function exportProvidersCsv() {
  const headers = ["Nom", "Téléphone", "Métier", "Ville", "Quartier", "Visibilité", "Vérification", "Echéance", "Renouvellement", "Appels", "Dernier paiement", "Montant"];
  const rows = state.providers.map((provider) => {
    const lastPayment = [...state.payments].reverse().find((payment) => payment.providerId === provider.id);
    return [
      provider.fullName,
      provider.phone,
      provider.service,
      provider.city,
      provider.area,
      provider.visibility,
      provider.verificationStatus || "none",
      visibilityEndDate(provider) ? new Date(visibilityEndDate(provider)).toLocaleDateString("fr-FR") : "",
      renewalStatus(provider),
      provider.calls || 0,
      lastPayment?.status || "",
      lastPayment?.amount || "",
    ].map(csvCell).join(",");
  });
  downloadTextFile(`bizzi-prestataires-${new Date().toISOString().slice(0, 10)}.csv`, [headers.map(csvCell).join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

function exportPaymentsCsv() {
  const headers = ["Prestataire", "Forfait", "Montant", "Méthode", "Référence", "Statut", "Créé le", "Traité le"];
  const rows = state.payments.map((payment) => [
    payment.providerName,
    payment.plan,
    payment.amount,
    payment.method,
    payment.reference,
    payment.status,
    payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("fr-FR") : "",
    payment.reviewedAt ? new Date(payment.reviewedAt).toLocaleDateString("fr-FR") : "",
  ].map(csvCell).join(","));
  downloadTextFile(`bizzi-paiements-${new Date().toISOString().slice(0, 10)}.csv`, [headers.map(csvCell).join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

function exportRevenueCsv() {
  const revenue = revenueBreakdown();
  const rows = [
    ["Prestataires", revenue.subscriptionRevenue],
    ["Boosts", revenue.boostRevenue],
    ["Livraison commission", revenue.deliveryCommission],
    ["Emplois", revenue.jobRevenue],
    ["Événements", revenue.eventRevenue],
    ["En attente", revenue.pending],
    ["Projection", revenue.projection],
  ].map((row) => row.map(csvCell).join(","));
  downloadTextFile(`bizzi-revenus-${new Date().toISOString().slice(0, 10)}.csv`, [["Source", "Montant"].map(csvCell).join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

function exportDeliveriesCsv() {
  const headers = ["Statut", "Paiement", "Départ", "Arrivée", "Colis", "Distance", "Montant", "Commission Zeyds", "Part livreur", "Référence", "Client", "Livreur", "Créé le"];
  const rows = state.deliveryRequests.map((request) => [
    deliveryPipelineInfo(request).label,
    request.paymentStatus || "",
    request.pickup,
    request.dropoff,
    request.parcel,
    request.distanceKm,
    request.amount,
    request.bizziCommission,
    request.providerPayout,
    request.paymentReference,
    request.phone,
    request.assignedProviderName || "",
    request.createdAt ? new Date(request.createdAt).toLocaleString("fr-FR") : "",
  ].map(csvCell).join(","));
  downloadTextFile(`bizzi-livraisons-${new Date().toISOString().slice(0, 10)}.csv`, [headers.map(csvCell).join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

function exportReportsCsv() {
  const headers = ["Prestataire", "Métier", "Raison", "Message", "Statut", "Créé le"];
  const rows = state.reports.map((report) => [
    report.providerName,
    report.service,
    report.reason,
    report.message,
    report.status,
    report.createdAt ? new Date(report.createdAt).toLocaleDateString("fr-FR") : "",
  ].map(csvCell).join(","));
  downloadTextFile(`bizzi-signalements-${new Date().toISOString().slice(0, 10)}.csv`, [headers.map(csvCell).join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

function exportLeadsCsv() {
  const headers = ["Prestataire", "Métier", "Ville", "Client", "Action", "Détail", "Créé le"];
  const rows = state.leads.map((lead) => [
    lead.providerName,
    lead.service,
    lead.city,
    lead.clientPhone || "",
    lead.action,
    lead.detail,
    lead.createdAt ? new Date(lead.createdAt).toLocaleString("fr-FR") : "",
  ].map(csvCell).join(","));
  downloadTextFile(`bizzi-contacts-${new Date().toISOString().slice(0, 10)}.csv`, [headers.map(csvCell).join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

function exportRequestsCsv() {
  const headers = ["Priorité", "Score", "Prestataires proposés", "Service", "Ville", "Quartier", "Urgence", "Message", "Contact", "Statut", "Créé le", "Traité le"];
  const rows = state.requests.map((request) => {
    const priority = requestPriorityInfo(request);
    return [
      priority.label,
      priority.score,
      priority.matchCount,
      request.service,
      request.city,
      request.area,
      requestUrgencyLabel(request.urgency),
      request.message,
      request.phone,
      request.status,
      request.createdAt ? new Date(request.createdAt).toLocaleString("fr-FR") : "",
      request.closedAt ? new Date(request.closedAt).toLocaleString("fr-FR") : "",
    ].map(csvCell).join(",");
  });
  downloadTextFile(`bizzi-demandes-express-${new Date().toISOString().slice(0, 10)}.csv`, [headers.map(csvCell).join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

function exportReviewsCsv() {
  const headers = ["Prestataire", "Métier", "Ville", "Note", "Commentaire", "Créé le"];
  const rows = state.reviews.map((review) => [
    review.providerName,
    review.service,
    review.city,
    review.rating,
    review.message,
    new Date(review.createdAt).toLocaleString("fr-FR"),
  ].map(csvCell).join(","));
  downloadTextFile(`bizzi-avis-${new Date().toISOString().slice(0, 10)}.csv`, [headers.map(csvCell).join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

function exportRenewalsCsv() {
  const renewalProviders = renewalProviderList();
  const headers = ["Nom", "Téléphone", "WhatsApp", "Métier", "Ville", "Quartier", "Statut", "Echéance", "Message"];
  const rows = renewalProviders.map((provider) => [
    provider.fullName,
    provider.phone,
    provider.whatsapp || provider.social?.whatsapp || provider.phone,
    provider.service,
    provider.city,
    provider.area,
    renewalStatus(provider) || subscriptionLabel(provider),
    visibilityEndDate(provider) ? new Date(visibilityEndDate(provider)).toLocaleDateString("fr-FR") : "",
    renewalMessage(provider),
  ].map(csvCell).join(","));
  downloadTextFile(`bizzi-relances-${new Date().toISOString().slice(0, 10)}.csv`, [headers.map(csvCell).join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedState = parsed.state || parsed;
      if (!Array.isArray(importedState.providers) || !Array.isArray(importedState.categories)) {
        throw new Error("Format Zeyds invalide");
      }
      replaceState(importedState);
    } catch {
      renderProductionStatus();
      document.querySelector("#productionStatus").innerHTML += `<p>Import impossible : fichier non reconnu.</p>`;
    }
  };
  reader.readAsText(file);
}

function renderTestDataStatus(message = "") {
  const root = document.querySelector("#testDataStatus");
  if (!root) return;
  const testProviders = state.providers.filter((item) => item.testData || String(item.id || "").startsWith("test-v234-")).length;
  root.innerHTML = message
    ? `<strong>Données de test Zeyds</strong><p>${safe(message)}</p>`
    : `<strong>${testProviders} profil(s) métier test actif(s)</strong><p>Ces éléments restent uniquement sur cet appareil et ne sont jamais synchronisés vers Supabase.</p>`;
}

function installCompleteTestData(button = null) {
  if (!globalThis.BizziTestData?.install) {
    renderTestDataStatus("Module de données test indisponible. Rechargez l’application.");
    return;
  }
  const snapshot = {
    providers: structuredClone(state.providers || []),
    foodPlaces: structuredClone(state.foodPlaces || []),
    eventPromotions: structuredClone(state.eventPromotions || []),
    testDataInstalledAt: state.testDataInstalledAt || "",
    testDataVersion: state.testDataVersion || "",
  };
  setBusyButton(button, true, "Création...");
  renderTestDataStatus("Création et enregistrement en cours...");
  try {
    const summary = globalThis.BizziTestData.install(state, alphabeticalServices());
    if (!saveState()) throw new Error("Stockage local insuffisant");
    refreshApp();
    renderTestDataStatus(`${summary.providers} profils métiers, ${summary.foods} restaurants et ${summary.events} événements créés et enregistrés. Vous pouvez maintenant rechercher n'importe quel métier.`);
    finishActionButton(button, "Données créées");
  } catch (error) {
    state.providers = snapshot.providers;
    state.foodPlaces = snapshot.foodPlaces;
    state.eventPromotions = snapshot.eventPromotions;
    state.testDataInstalledAt = snapshot.testDataInstalledAt;
    state.testDataVersion = snapshot.testDataVersion;
    saveState();
    captureBizziError(error, { module: "test_data_install" });
    renderTestDataStatus("Création impossible sur cet appareil. Libérez un peu d’espace du navigateur, rechargez Zeyds puis réessayez.");
    finishActionButton(button, "Réessayer");
  }
}

function removeCompleteTestData() {
  globalThis.BizziTestData?.remove?.(state);
  saveState();
  refreshApp();
  renderTestDataStatus("Toutes les données fictives ont été supprimées. Les profils réels sont conservés.");
}

function setupDataTools() {
  setupAdminRemoteActionDelegation();
  document.querySelectorAll("[data-admin-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.adminJump);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.querySelector("#testSupabase")?.addEventListener("click", (event) => testSupabaseConnection(event.currentTarget));
  document.querySelector("#syncSupabase")?.addEventListener("click", (event) => syncSupabasePublicData(event.currentTarget));
  document.querySelector("#installTestData")?.addEventListener("click", (event) => installCompleteTestData(event.currentTarget));
  document.querySelector("#removeTestData")?.addEventListener("click", () => {
    if (!confirm("Supprimer uniquement les profils, restaurants et événements TEST BIZZI ?")) return;
    removeCompleteTestData();
  });
  renderTestDataStatus();
  if (new URLSearchParams(location.search).get("testdata") === "1" && !state.testDataInstalledAt) {
    window.setTimeout(installCompleteTestData, 0);
  }
  document.querySelector("#loadRemoteQueue")?.addEventListener("click", (event) => loadSupabaseAdminQueue(event.currentTarget));
  document.querySelector("#supabaseAdminLogout")?.addEventListener("click", () => {
    saveAdminAuthSession(null);
    remoteAdminQueue = emptyRemoteAdminQueue();
    renderRemoteAdminPanel();
    renderLaunchChecklist();
    renderAdminRemoteStatus("Compte admin Supabase déconnecté.", true);
  });
  document.querySelector("#supabaseAdminLoginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type='submit']");
    const data = new FormData(form);
    setBusyButton(button, true, "Connexion...");
    try {
      const session = await supabaseAuthSignIn(String(data.get("email") || "").trim(), String(data.get("password") || ""));
      form.reset();
      renderRemoteAdminPanel();
      renderAdminRemoteStatus(`Connexion réussie : ${session.email}. Cliquez sur Charger validations Supabase quand vous voulez actualiser la file.`, true);
      finishActionButton(button, "Connecté");
    } catch (error) {
      renderAdminRemoteStatus(`Connexion impossible : ${friendlySupabaseError(error)}`, true);
      finishActionButton(button, "Erreur");
    }
  });
  document.querySelector("#exportData")?.addEventListener("click", exportData);
  document.querySelector("#exportProvidersCsv")?.addEventListener("click", exportProvidersCsv);
  document.querySelector("#exportPaymentsCsv")?.addEventListener("click", exportPaymentsCsv);
  document.querySelector("#exportReportsCsv")?.addEventListener("click", exportReportsCsv);
  document.querySelector("#exportLeadsCsv")?.addEventListener("click", exportLeadsCsv);
  document.querySelector("#exportRequestsCsv")?.addEventListener("click", exportRequestsCsv);
  document.querySelector("#exportReviewsCsv")?.addEventListener("click", exportReviewsCsv);
  document.querySelector("#exportRenewalsCsv")?.addEventListener("click", exportRenewalsCsv);
  document.querySelector("#importData")?.addEventListener("change", (event) => {
    importData(event.currentTarget.files[0]);
    event.currentTarget.value = "";
  });
  document.querySelector("#resetDemo")?.addEventListener("click", () => {
    if (!confirm("Réinitialiser les données locales Zeyds ?")) return;
    replaceState(structuredClone(seed));
  });
}

function renderGeoStatus(message = "") {
  const status = document.querySelector("#geoStatus");
  if (message) {
    status.textContent = message;
    return;
  }
  status.textContent = state.userLocation
    ? "Position active : les résultats sont triés par proximité."
    : "Position manuelle par ville.";
}

function setupGeolocation() {
  const button = document.querySelector("#geoButton");
  const radiusSelect = document.querySelector("#radiusSelect");
  const verifiedOnly = document.querySelector("#verifiedOnly");
  const resetFilters = document.querySelector("#resetProviderFilters");
  if (!button || !radiusSelect || !verifiedOnly) return;
  radiusSelect.value = String(state.selectedRadius ?? 10);
  verifiedOnly.checked = Boolean(state.selectedVerifiedOnly);
  resetFilters?.addEventListener("click", resetProviderFilters);

  radiusSelect.addEventListener("change", () => {
    state.selectedRadius = Number(radiusSelect.value);
    saveState();
    renderProviders();
    renderDelivery();
    renderHomeDiscovery();
    renderSavedProviders();
  });

  verifiedOnly.addEventListener("change", () => {
    state.selectedVerifiedOnly = verifiedOnly.checked;
    saveState();
    renderProviders();
    renderDelivery();
    renderHomeDiscovery();
    renderSavedProviders();
  });

  button.addEventListener("click", () => {
    if (!navigator.geolocation) {
      renderGeoStatus("Géolocalisation indisponible sur cet appareil.");
      return;
    }
    renderGeoStatus("Recherche de votre position...");
    navigator.geolocation.getCurrentPosition((position) => {
      const userPoint = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      const nearestCity = nearestCityFromPoint(userPoint) || "Toute la Côte d'Ivoire";
      state.userLocation = userPoint;
      document.querySelector("#citySelect").value = nearestCity;
      state.selectedCity = nearestCity;
      const eventCityFilter = document.querySelector("#eventCityFilter");
      if (eventCityFilter && cityIsSpecific(nearestCity)) eventCityFilter.value = nearestCity;
      const foodCityFilter = document.querySelector("#foodCityFilter");
      if (foodCityFilter && cityIsSpecific(nearestCity)) {
        foodCityFilter.value = nearestCity;
        state.selectedFoodCity = nearestCity;
      }
      saveState();
      renderGeoStatus();
      renderProviders();
      renderDelivery();
      renderFood();
      renderEvents();
      renderJobs();
      renderAd();
      renderHomeDiscovery();
      renderSavedProviders();
    }, () => {
      renderGeoStatus("Position refusée : choisissez une ville manuellement.");
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 120000,
    });
  });

  renderGeoStatus();
}

function setupInstallPrompt() {
  const installButton = document.querySelector("#installButton");
  if (!installButton) return;
  let promptEvent = null;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    promptEvent = event;
    installButton.hidden = false;
  });
  installButton.addEventListener("click", async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice;
    promptEvent = null;
    installButton.hidden = true;
  });
}

function initNavigation() {
  const renderProviderSearchSmooth = debounce(() => {
    if (redirectProviderSearchIntent()) return;
    renderServices();
    renderProviders();
    renderDelivery();
  }, 120);
  const renderJobsSmooth = debounce(renderJobs, 120);
  const renderEventsSmooth = debounce(renderEvents, 120);
  const renderFoodSmooth = debounce(renderFood, 120);
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.go);
    });
  });
  document.querySelector("#deliveryGeoButton")?.addEventListener("click", () => document.querySelector("#geoButton")?.click());
  document.querySelector("#deliverySearchButton")?.addEventListener("click", openDeliverySearch);
  document.querySelector("#deliveryRequestButton")?.addEventListener("click", prefillDeliveryRequest);
  document.querySelector("#deliveryCourierCreateButton")?.addEventListener("click", openCourierProfileCreation);
  document.querySelector("#deliveryCourierRenewButton")?.addEventListener("click", openCourierRenewal);
  document.querySelector("#enableDeliveryAlerts")?.addEventListener("click", (event) => requestDeliveryAlertPermission(event.currentTarget));
  document.querySelector("#enableCourierLive")?.addEventListener("click", (event) => startCourierLiveAvailability(event.currentTarget));
  document.querySelectorAll("[data-job-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.jobEntry === "publish" ? "publish" : "search";
      setJobEntryMode(mode, { focus: mode === "publish" ? ".job-publish-panel" : ".job-search-panel" });
    });
  });
  document.querySelectorAll("[data-delivery-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.deliveryEntry === "courier" ? "courier" : "request";
      setDeliveryEntryMode(mode, { focus: mode === "courier" ? ".delivery-courier-panel" : ".delivery-create-panel" });
    });
  });
  document.querySelectorAll("[data-event-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.eventEntry === "promote" ? "promote" : "tickets";
      setEventEntryMode(mode, { focus: mode === "promote" ? ".event-submit-panel" : ".events-list-panel" });
    });
  });
  document.querySelector("#citySelect")?.addEventListener("change", () => {
    state.selectedCity = currentCity();
    if (currentCity() !== "Toute la Côte d'Ivoire") {
      state.userLocation = null;
    }
    const foodCityFilter = document.querySelector("#foodCityFilter");
    if (foodCityFilter && cityIsSpecific(currentCity())) {
      foodCityFilter.value = currentCity();
      state.selectedFoodCity = currentCity();
    }
    saveState();
    renderGeoStatus();
    renderProviders();
    renderDelivery();
    renderFood();
    renderEvents();
    renderJobs();
    renderAd();
    renderHomeDiscovery();
    renderSavedProviders();
  });
  document.querySelector("#searchInput")?.addEventListener("input", () => {
    assistantProviderSelection = null;
    syncTypedProviderSearchIntent(document.querySelector("#searchInput")?.value || "");
    saveState();
    renderProviderSearchSmooth();
  });
  document.querySelector("#jobSearchInput")?.addEventListener("input", renderJobsSmooth);
  document.querySelector("#jobServiceFilter")?.addEventListener("change", renderJobs);
  document.querySelector("#jobCityFilter")?.addEventListener("change", renderJobs);
  document.querySelector("#eventSearchInput")?.addEventListener("input", renderEventsSmooth);
  document.querySelector("#eventCategoryFilter")?.addEventListener("change", renderEvents);
  document.querySelector("#eventCityFilter")?.addEventListener("change", () => {
    renderEvents();
    renderHomeDiscovery();
  });
  document.querySelector("#foodSearchInput")?.addEventListener("input", renderFoodSmooth);
  document.querySelector("#foodSpecialtyFilter")?.addEventListener("change", () => {
    state.selectedFoodSpecialty = document.querySelector("#foodSpecialtyFilter")?.value || "Toutes les spécialités";
    saveState();
    renderFood();
  });
  document.querySelector("#foodCityFilter")?.addEventListener("change", () => {
    state.selectedFoodCity = document.querySelector("#foodCityFilter")?.value || foodDefaultCity();
    saveState();
    renderFood();
  });
  window.addEventListener("hashchange", openViewFromLocation);
  window.addEventListener("pageshow", openViewFromLocation);
}

function boot() {
  globalThis.BizziPerformance?.markReady?.("bizzi_boot_start");
  applySubscriptionRules();
  verifyServiceRecognitionCatalog();
  renderCityOptions();
  renderCategories();
  setupGeolocation();
  renderServices();
  renderProviders();
  renderDelivery();
  renderFood();
  renderExceptionPlaces();
  renderEvents();
  setupEventExpirationWatcher();
  renderJobs();
  setupForms();
  setupSearchAssistant();
  setupClientAccessGate();
  setupHomeQuickSearch();
  globalThis.BizziLife?.init?.({
    setView,
    inferService: (prompt) => inferAssistantService(prompt)?.name || "",
    openService: (serviceName, options) => selectServiceAndSearch(serviceName, options),
    openDelivery: (prompt) => {
      if (!requireClientPhoneForAccess("organiser ce trajet")) return;
      applyAssistantDeliveryPrompt(prompt);
    },
  });
  initNavigation();
  setupInstallPrompt();
  setupSocialSharing();
  setupAdminAccess();
  setupDataTools();
  startDeliveryAlertPolling();
  renderProviderStatus();
  renderFoodStatus();
  renderEventStatus();
  renderEventPaymentOptions();
  renderJobOfferStatus();
  renderJobPaymentOptions();
  renderDeliveryPaymentOptions();
  renderAdmin();
  renderAd();
  renderHomeDiscovery();
  renderSavedProviders();
  openViewFromLocation();
  renderProviderDeliveryQueue();
  const adminIsActive = views.admin?.classList.contains("active") || isSecureAdminPath() || location.hash === "#admin";
  if (supabaseConfigured() && !adminIsActive) {
    setTimeout(() => {
      syncSupabasePublicData().catch(() => null);
    }, 800);
  }
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      window.__bizziAppReady = true;
      if (typeof window.__bizziShowApp === "function") {
        window.__bizziShowApp();
      } else {
        document.body.classList.add("bizzi-ready");
      }
      recordBizziPerformance();
      globalThis.BizziErrorMonitor?.flush?.().catch(() => null);
    }, 420);
  });
}

try {
  boot();
} catch (error) {
  console.error("Zeyds boot error", error);
  captureBizziError(error, { module: "boot" });
  window.__bizziCssReady = true;
  window.__bizziAppReady = true;
  document.body.classList.add("bizzi-ready");
}
