(function () {
  const ABIDJAN_AREAS = [
    "cocody", "plateau", "yopougon", "marcory", "treichville", "adjame", "adjamé", "abobo",
    "koumassi", "port bouet", "port-bouet", "bingerville", "anyama", "riviera", "angre", "angré",
    "2 plateaux", "deux plateaux", "zone 4", "attoban", "palmeraie", "vridi",
  ];

  function normalize(value = "") {
    return String(value || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .replace(/[-–—]/g, " ")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function titlePlace(value = "") {
    return String(value || "")
      .replace(/\b(recherche|cherche|trouve moi|livreur|coursier|livraison|course|colis|un|une|le|la|de|depuis|depart|départ)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function routeText(prompt = "") {
    let text = normalize(prompt)
      .replace(/^(je\s+veux|je\s+cherche|cherche|recherche|besoin\s+de|trouve\s+moi)\s+/, "");
    for (let pass = 0; pass < 5; pass += 1) {
      text = text.replace(/^(un|une|des|du|de\s+la|livreur|coursier|livraison|livrer|course|colis)\s+/, "");
    }
    return text;
  }

  function urgency(text = "") {
    const value = normalize(text);
    if (/(maintenant|urgent|vite|immediat)/.test(value)) return "now";
    if (/(demain|programmer|plus tard)/.test(value)) return "scheduled";
    return "today";
  }

  function rideDestinationFromPrompt(prompt = "") {
    const text = normalize(prompt);
    const ending = "(?=$|[,.]|\\s+(?:maintenant|tout de suite|urgent|vite|aujourd hui|demain|ce soir|avec|pour [0-9]+ personne))";
    const patterns = [
      new RegExp(`^(?:je\\s+(?:vais|pars)|on\\s+va|je\\s+me\\s+rends|je\\s+(?:veux|dois|souhaite)\\s+aller)\\s+(?:a|au|aux|vers|pour)\\s+(.+?)${ending}`),
      new RegExp(`^(?:(?:peux tu|pouvez vous)\\s+)?(?:emmene|emmenez|conduis|conduisez|depose|deposez)\\s+moi\\s+(?:a|au|aux|vers)\\s+(.+?)${ending}`),
      new RegExp(`^direction\\s+(.+?)${ending}`),
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return "";
  }

  function isRideRequest(prompt = "") {
    const text = normalize(prompt);
    return Boolean(rideDestinationFromPrompt(text))
      || /\b(taxi|vtc|moto taxi|chauffeur|passager|passagers|vehicule|voiture|conduis|conduire|emmene|emmener|depose moi|deposer moi|trajet)\b/.test(text)
      || /\b(une|ma|commander|reserver)\s+course\b/.test(text)
      || /\bcourse\s+(?:de|depuis|vers|a|au|aux|pour)\b/.test(text);
  }

  function cityFromRoute(pickup = "", dropoff = "", fallback = "") {
    if (fallback && fallback !== "Toute la Côte d'Ivoire") return fallback;
    const route = normalize(`${pickup} ${dropoff}`);
    return ABIDJAN_AREAS.some((area) => route.includes(normalize(area))) ? "Abidjan" : fallback;
  }

  function parcelFromPrompt(prompt = "") {
    const match = String(prompt || "").match(/\b(colis|paquet|document|documents|achats?|m[ée]dicaments?|enveloppe|sac|bagage|carton)\b[^,.]*/i);
    return match ? titlePlace(match[0]) : "Course / colis à préciser";
  }

  function deliveryRequestType(prompt = "") {
    const text = normalize(prompt);
    const carriesGoods = /\b(livraison|livrer|livreur|coursier|colis|paquet|document|documents|achats?|medicaments?|enveloppe|sac|carton)\b/.test(text);
    if (carriesGoods) return "delivery";
    return isRideRequest(text) ? "ride" : "delivery";
  }

  function intent(prompt = "") {
    const text = normalize(prompt);
    if (
      /\b(organiser|preparer|planifier)\b.*\b(anniversaire|mariage|demenagement|renovation)\b/.test(text)
      || /\b(je demenage|demenagement|demenager|renover|renovation)\b/.test(text)
      || /\b(voiture|vehicule)\b.*\b(panne|depannage)\b/.test(text)
      || /\b(panne|depannage)\b.*\b(voiture|vehicule)\b/.test(text)
      || /\b(nounou|baby sitter|babysitter)\b.*\b(ce soir|demain|urgent|maintenant)\b/.test(text)
      || /\b(aller|trajet|depart)\b.*\b(aeroport)\b/.test(text)
      || /\b(aeroport)\b.*\b(demain|matin|soir|vol|bagage)\b/.test(text)
    ) return "life";
    if (/\b(evenement|event|concert|spectacle|festival|conference|billet|soiree|show|humour|theatre)\b/.test(text)) return "events";
    if (/\b(food|restaurant|resto|maquis|garba|attieke|attiéké|poulet|braise|braisé|alloco|placali|kedjenou|grillade|escargot|escargots|manger|plat|repas|dejeuner|déjeuner|diner|dîner|traiteur)\b/.test(text)) return "food";
    if (/\b(emploi|travail|job|mission|recrute|recrutement|stage|cv|embauche)\b/.test(text)) return "jobs";
    if (/\b(lieu d exception|lieux d exception|tourisme|touristique|site touristique|endroit insolite|resort|lodge|cascade|plage|escapade)\b/.test(text)) return "exception-places";
    if (isRideRequest(text) || /\b(livraison|livrer|livreur|coursier|colis|course|paquet|deposer|recuperer)\b/.test(text)) return "delivery";
    return "service";
  }

  function cleanQuery(prompt = "", type = "") {
    const generic = type === "events"
      ? /\b(recherche|chercher|cherche|trouve|voir|afficher|evenements?|events?|event|billets?|acheter|disponibles?|autour|proche|pres|à|a|au|aux|de|des|du|la|le|les)\b/gi
      : type === "food"
        ? /\b(recherche|chercher|cherche|trouve|voir|afficher|bonnes?|adresses?|restaurants?|restos?|maquis|manger|plat|repas|dejeuner|déjeuner|diner|dîner|près|pres|proche|à|a|au|aux|de|des|du|la|le|les)\b/gi
        : /\b(recherche|chercher|cherche|trouve|voir|afficher|offres?|emplois?|jobs?|missions?|postes?|à|a|au|aux|de|des|du|la|le|les)\b/gi;
    return normalize(prompt).replace(generic, " ").replace(/\s+/g, " ").trim();
  }

  function deliveryDetails(prompt = "", options = {}) {
    const raw = String(prompt || "").trim();
    const text = routeText(raw);
    const normalizedRaw = normalize(raw);
    const impliedDestination = rideDestinationFromPrompt(raw);
    const useCurrentPickup = Boolean(impliedDestination)
      || /\b(ma position|position actuelle|position gps|ici|d ou je suis|où je suis)\b/.test(normalizedRaw);
    const patterns = [
      /^(?:de|depuis|depart(?: de)?|recuperer(?: a)?|prendre(?: a)?|chercher(?: a)?)\s+(.+?)\s+(?:vers|a|au|aux|pour|jusqu a)\s+(.+?)(?=$|[,.]|\s+(?:maintenant|urgent|vite|aujourd hui|demain|avec|tel|telephone|numero|contact))/,
      /^(.+?)\s+(?:vers|a|au|aux|pour|jusqu a)\s+(.+?)(?=$|[,.]|\s+(?:maintenant|urgent|vite|aujourd hui|demain|avec|tel|telephone|numero|contact))/,
    ];
    let pickup = "";
    let dropoff = "";
    if (impliedDestination) {
      pickup = "Ma position actuelle";
      dropoff = titlePlace(impliedDestination);
    } else {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match?.[1] && match?.[2]) {
          pickup = titlePlace(match[1]);
          dropoff = titlePlace(match[2]);
          break;
        }
      }
    }
    if (useCurrentPickup) pickup = "Ma position actuelle";
    const city = cityFromRoute(pickup, dropoff, options.city || "");
    return {
      requestType: deliveryRequestType(raw),
      pickup,
      dropoff,
      city,
      urgency: urgency(raw),
      parcel: parcelFromPrompt(raw),
      notes: raw,
      useCurrentPickup,
    };
  }

  globalThis.BizziAssistantParser = {
    deliveryDetails,
    deliveryRequestType,
    isRideRequest,
    rideDestinationFromPrompt,
    intent,
    cleanQuery,
  };
})();
