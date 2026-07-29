(function () {
  const p = (name, aliases, lat, lng) => ({ name, aliases: [name, ...(aliases || [])], lat, lng });
  const reference = (name, aliases, lat, lng, address) => ({
    ...p(name, aliases, lat, lng),
    address,
    city: "Abidjan",
    kind: "reference",
  });
  const referencePlaces = [
    reference(
      "China Mall Yopougon - Toits Rouges",
      ["China Mall Yopougon", "China Mall Toit Rouge", "China Mall Toits Rouges", "China Mall 4e pont", "Immeuble China Mall Yopougon"],
      5.3321533,
      -4.0624571,
      "Yopougon, quartier Toits Rouges / Nouveau Bureau"
    ),
    reference(
      "Pâtisserie Abidjanaise - Zone 3",
      ["Patisserie Abidjanaise", "Pâtisserie Abidjanaise", "Patisserie Abidjanaise Marcory", "Patisserie Abidjanaise Zone 3"],
      5.29469,
      -3.98991,
      "12 rue du Chevalier de Clieu, Zone 3, Marcory"
    ),
    reference(
      "Grand Marché de Treichville",
      ["Grand Marche de Treichville", "Grand Marche Treichville", "Marché de Treichville", "Marche de Treichville"],
      5.309433,
      -4.013682,
      "600 avenue Victor Biaka Boda, Treichville"
    ),
    reference(
      "Mairie d’Attécoubé",
      ["Mairie d'Attecoube", "Mairie Attecoube", "Mairie Attécoubé", "Mairie d Attecoube"],
      5.34789,
      -4.03387,
      "Rue I 13, Attécoubé"
    ),
    reference(
      "Sofitel Abidjan Hôtel Ivoire",
      ["Sofitel", "Sofitel Abidjan", "Sofitel Hôtel Ivoire", "Sofitel Hotel Ivoire", "Hôtel Ivoire", "Hotel Ivoire", "Village Ivoire"],
      5.326842,
      -4.005485,
      "Boulevard Hassan II, Cocody"
    ),
  ];
  const cities = {
    Abidjan: { lat: 5.3453, lng: -4.0244 }, Abobo: { lat: 5.4161, lng: -4.0159 }, Adjamé: { lat: 5.3651, lng: -4.0236 },
    Anyama: { lat: 5.4946, lng: -4.0518 }, Attécoubé: { lat: 5.3504, lng: -4.0417 }, Bingerville: { lat: 5.3558, lng: -3.8854 }, Cocody: { lat: 5.3599, lng: -3.9816 },
    Koumassi: { lat: 5.3002, lng: -3.9479 }, Marcory: { lat: 5.3029, lng: -3.9875 }, "Port-Bouët": { lat: 5.2618, lng: -3.9262 },
    Treichville: { lat: 5.2937, lng: -4.0039 }, Yopougon: { lat: 5.3364, lng: -4.0739 }, Songon: { lat: 5.3219, lng: -4.2586 },
    Bouaké: { lat: 7.6906, lng: -5.0301 }, Yamoussoukro: { lat: 6.8276, lng: -5.2893 }, "San Pedro": { lat: 4.7485, lng: -6.6363 },
    Daloa: { lat: 6.8774, lng: -6.4502 }, Korhogo: { lat: 9.4580, lng: -5.6296 }, Man: { lat: 7.4125, lng: -7.5538 },
    Gagnoa: { lat: 6.1319, lng: -5.9506 }, Abengourou: { lat: 6.7297, lng: -3.4964 }, Divo: { lat: 5.8374, lng: -5.3572 },
    Soubré: { lat: 5.7856, lng: -6.6083 }, Bondoukou: { lat: 8.0402, lng: -2.8000 }, Séguéla: { lat: 7.9611, lng: -6.6731 },
    Odienné: { lat: 9.5051, lng: -7.5643 }, Aboisso: { lat: 5.4678, lng: -3.2071 }, Agboville: { lat: 5.9280, lng: -4.2132 },
    Adzopé: { lat: 6.1069, lng: -3.8619 }, Bouaflé: { lat: 6.9904, lng: -5.7442 }, Issia: { lat: 6.4922, lng: -6.5856 },
    Guiglo: { lat: 6.5437, lng: -7.4935 }, Duékoué: { lat: 6.7420, lng: -7.3492 }, Sassandra: { lat: 4.9500, lng: -6.0833 },
    "Grand-Bassam": { lat: 5.2118, lng: -3.7388 }, Dabou: { lat: 5.3256, lng: -4.3769 }, Tiassalé: { lat: 5.8984, lng: -4.8229 },
    Toumodi: { lat: 6.5579, lng: -5.0177 }, Mankono: { lat: 8.0586, lng: -6.1897 }, Ferkessédougou: { lat: 9.5928, lng: -5.1945 },
    Bouna: { lat: 9.2693, lng: -3.0009 }, Boundiali: { lat: 9.5217, lng: -6.4869 }, Katiola: { lat: 8.1373, lng: -5.1009 },
    Dabakala: { lat: 8.3632, lng: -4.4286 }, Tanda: { lat: 7.8034, lng: -3.1683 }, Bongouanou: { lat: 6.6518, lng: -4.2040 },
    Daoukro: { lat: 7.0591, lng: -3.9631 }, Lakota: { lat: 5.8528, lng: -5.6828 }, Oumé: { lat: 6.3831, lng: -5.4176 },
    Sinfra: { lat: 6.6210, lng: -5.9114 }, Vavoua: { lat: 7.3819, lng: -6.4778 }, Zuénoula: { lat: 7.4292, lng: -6.0472 },
    Touba: { lat: 8.2833, lng: -7.6833 }, Biankouma: { lat: 7.7404, lng: -7.6138 }, Danané: { lat: 7.2596, lng: -8.1548 },
    Tabou: { lat: 4.4229, lng: -7.3528 }, Fresco: { lat: 5.1000, lng: -5.5833 }, Jacqueville: { lat: 5.2050, lng: -4.4146 },
    Tiébissou: { lat: 7.1578, lng: -5.2245 }, Bocanda: { lat: 7.0626, lng: -4.4995 }, "M'Bahiakro": { lat: 7.4577, lng: -4.3391 },
  };
  const points = [
    p("Attécoubé", ["attecoube", "locodjro"], 5.3504, -4.0417), p("Williamsville", ["williams ville"], 5.3770, -4.0201),
    p("Anono", ["cocody anono"], 5.3577, -3.9565), p("Faya", ["cocody faya", "riviera faya"], 5.3920, -3.9135),
    p("Abatta", ["cocody abatta"], 5.3472, -3.8899), p("Bonoumin", ["cocody bonoumin"], 5.3869, -3.9784),
    p("Danga", ["cocody danga"], 5.3409, -4.0006), p("Riviera Golf", ["golf", "cocody golf"], 5.3477, -3.9628),
    p("Abobo Baoulé", ["abobo baoule"], 5.4245, -3.9725), p("Abobo Gare", ["gare abobo"], 5.4182, -4.0198),
    p("PK18", ["pk 18", "abobo pk18"], 5.4632, -4.0043), p("N'Dotré", ["ndotre", "n dotre"], 5.4826, -4.0323),
    p("Siporex", ["yopougon siporex"], 5.3321, -4.0845), p("Gesco", ["yopougon gesco"], 5.3674, -4.1054),
    p("Koweït", ["yopougon koweit"], 5.3303, -4.1213), p("Banco", ["yopougon banco"], 5.3524, -4.0740),
    p("Anoumabo", ["marcory anoumabo"], 5.2950, -3.9650), p("Bietry", ["biétry", "marcory bietry"], 5.2866, -3.9741),
    p("Koumassi Remblais", ["remblais"], 5.2877, -3.9444), p("Prima", ["marcory prima"], 5.2965, -3.9907),
    p("Bouaké Air France", ["air france bouake", "air france"], 7.6991, -5.0414), p("Bouaké Koko", ["koko bouake", "koko"], 7.6978, -5.0318),
    p("Bouaké Nimbo", ["nimbo bouake", "nimbo"], 7.6844, -5.0266), p("Bouaké Dar-es-Salam", ["dar es salam bouake"], 7.7106, -5.0208),
    p("Bouaké Belleville", ["belleville bouake"], 7.6769, -5.0447), p("Yamoussoukro 220 Logements", ["220 logements"], 6.8226, -5.2757),
    p("Yamoussoukro Assabou", ["assabou"], 6.8190, -5.3015), p("Yamoussoukro Morofé", ["morofe", "morofé"], 6.8430, -5.2783),
    p("Yamoussoukro Millionnaire", ["quartier millionnaire", "millionnaire"], 6.8363, -5.2971), p("San Pedro Bardot", ["bardot"], 4.7590, -6.6512),
    p("San Pedro Balmer", ["balmer"], 4.7452, -6.6258), p("San Pedro Seweke", ["seweke", "séwéké"], 4.7652, -6.6372),
    p("Daloa Lobia", ["lobia"], 6.8914, -6.4712), p("Daloa Tazibouo", ["tazibouo"], 6.8718, -6.4331),
    p("Korhogo Soba", ["soba"], 9.4586, -5.6338), p("Korhogo Natiokobadara", ["natiokobadara"], 9.4723, -5.6205),
    p("Man Libreville", ["libreville man"], 7.4038, -7.5467), p("Man Campus", ["campus man"], 7.3948, -7.5334),
  ];
  const allPoints = [...referencePlaces, ...points];

  function normalized(value = "") {
    return String(value || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function suggestions(query = "", limit = 12) {
    const key = normalized(query);
    return allPoints
      .filter((point) => !key || point.aliases.some((alias) => normalized(alias).includes(key)))
      .sort((a, b) => Number(b.kind === "reference") - Number(a.kind === "reference") || a.name.localeCompare(b.name, "fr"))
      .slice(0, Math.max(1, Number(limit) || 12));
  }

  function renderReferenceOptions() {
    const list = document.querySelector("#ciReferencePlaces");
    if (!list || list.dataset.ready === "true") return;
    const seen = new Set();
    const fragment = document.createDocumentFragment();
    allPoints.forEach((point) => point.aliases.forEach((alias) => {
      const key = normalized(alias);
      if (!key || seen.has(key)) return;
      seen.add(key);
      const option = document.createElement("option");
      option.value = alias;
      option.label = point.address ? `${point.name} — ${point.address}` : point.name;
      fragment.appendChild(option);
    }));
    Object.keys(cities).forEach((city) => {
      const key = normalized(city);
      if (seen.has(key)) return;
      seen.add(key);
      const option = document.createElement("option");
      option.value = city;
      option.label = `${city}, Côte d’Ivoire`;
      fragment.appendChild(option);
    });
    list.appendChild(fragment);
    list.dataset.ready = "true";
  }

  globalThis.BizziCIGeo = {
    version: "V304",
    cities,
    points: allPoints,
    referencePlaces,
    suggestions,
    cityNames: Object.keys(cities),
    pricing: {
      minPrice: 500,
      tiers: [
        { id: "micro", label: "0 à 2 km", minKm: 0, maxKm: 2, minPrice: 500, maxPrice: 1000 },
        { id: "near", label: "2 à 5 km", minKm: 2, maxKm: 5, minPrice: 1000, maxPrice: 1600 },
        { id: "medium", label: "5 à 8 km", minKm: 5, maxKm: 8, minPrice: 1600, maxPrice: 2200 },
        { id: "long", label: "8 à 12 km", minKm: 8, maxKm: 12, minPrice: 2200, maxPrice: 3200 },
      ],
      extraKmPrice: 250,
      longDistanceBaseKm: 12,
      longDistanceBasePrice: 3200,
      maxSurchargeRate: 0.35,
      weatherSurcharge: 0.10,
      urgencySurcharge: 0.15,
      timeSlots: [
        { id: "normal", name: "Heure normale", surcharge: 0 },
        { id: "morning_peak", name: "Heure de pointe matin", surcharge: 0.15 },
        { id: "evening_peak", name: "Heure de pointe soir", surcharge: 0.15 },
        { id: "night", name: "Circulation fluide 22h-8h", surcharge: 0 },
      ],
    },
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderReferenceOptions, { once: true });
  else renderReferenceOptions();
}());
