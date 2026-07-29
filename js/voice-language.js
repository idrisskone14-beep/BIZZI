(function () {
  const CORRECTIONS = [
    [/\b(?:coquody|cocodi|kokodi|coco\s+d[yi])\b/gi, "Cocody"],
    [/\b(?:yopou\s*gon|yopou\s*gong|yopou\s*gou)\b/gi, "Yopougon"],
    [/\bmarcori\b/gi, "Marcory"],
    [/\b(?:coumassi|koumasi|coumasi)\b/gi, "Koumassi"],
    [/\b(?:trecheville|treich\s+ville|treichville)\b/gi, "Treichville"],
    [/\badjame\b/gi, "Adjamé"],
    [/\bport\s*-?\s*bouet\b/gi, "Port-Bouët"],
    [/\bangre\b/gi, "Angré"],
    [/\b(?:deux|2)\s+plateau(?:x)?\b/gi, "Deux-Plateaux"],
    [/\bbouake\b/gi, "Bouaké"],
    [/\b(?:korogo|korogho)\b/gi, "Korhogo"],
    [/\b(?:plonbier|plombier)\b/gi, "plombier"],
    [/\b(?:eletricien|electricien|életricien)\b/gi, "électricien"],
    [/\b(?:mecanisien|mécanisien|mecano)\b/gi, "mécanicien"],
    [/\b(?:esteticienne|esteticien|estheticien|esthéticien)\b/gi, "esthéticienne"],
    [/\bserurier\b/gi, "serrurier"],
    [/\b(?:frijoriste|frigorist)\b/gi, "frigoriste"],
    [/\b(?:coifeuse|coifeur)\b/gi, "coiffeuse"],
    [/\bnetoyage\b/gi, "nettoyage"],
    [/\b(?:aide|femme)\s+(?:de|du|au)?\s*(?:minage|menage|ménage)\b/gi, "aide ménage"],
    [/\b(?:personel|personnel)\s+de\s+maison\b/gi, "personnel de maison"],
    [/\b(?:resto|restau)\b/gi, "restaurant"],
    [/\battieke\b/gi, "attiéké"],
    [/\bgaba\b/gi, "garba"],
    [/\bescargo\b/gi, "escargot"],
  ];

  const DOMAIN_PHRASES = [
    "abidjan", "cocody", "yopougon", "marcory", "koumassi", "treichville", "adjame", "abobo",
    "port bouet", "bingerville", "anyama", "angre", "riviera", "deux plateaux", "bouake",
    "yamoussoukro", "san pedro", "daloa", "korhogo", "plombier", "electricien", "mecanicien",
    "estheticienne", "coiffeuse", "couturier", "serrurier", "frigoriste", "livreur", "coursier",
    "livraison", "colis", "restaurant", "garba", "attieke", "alloco", "maquis", "placali", "transitaire",
    "aide menage", "femme de menage", "agence de placement", "personnel de maison",
  ];

  function compact(value = "") {
    return String(value || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalize(value = "") {
    let text = String(value || "")
      .replace(/[“”]/g, "\"")
      .replace(/[’']/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    CORRECTIONS.forEach(([pattern, replacement]) => {
      text = text.replace(pattern, replacement);
    });
    return text.replace(/\s+/g, " ").trim();
  }

  function score(candidate = {}) {
    const transcript = normalize(candidate.transcript || candidate.text || "");
    if (!transcript) return -Infinity;
    const normalized = compact(transcript);
    let value = Math.max(0, Math.min(1, Number(candidate.confidence || 0))) * 8;
    value += Math.min(3, normalized.split(" ").filter(Boolean).length * 0.25);
    DOMAIN_PHRASES.forEach((phrase) => {
      const token = compact(phrase);
      if (` ${normalized} `.includes(` ${token} `)) value += token.includes(" ") ? 4 : 2;
    });
    const inferred = globalThis.BizziServiceRecognition?.infer?.(transcript);
    if (inferred?.name && !inferred.uncertain) value += 8 + Math.min(8, Number(inferred.score || 0) / 10);
    if (/\b(de|depuis).+\b(vers|a|au|aux|pour)\b/.test(normalized)) value += 3;
    return value;
  }

  function alternatives(result) {
    return Array.from(result || []).map((item) => ({
      transcript: String(item?.transcript || item?.text || "").trim(),
      confidence: Number(item?.confidence || 0),
    })).filter((item) => item.transcript);
  }

  function best(result) {
    const candidates = alternatives(result);
    if (!candidates.length) return "";
    candidates.sort((left, right) => score(right) - score(left));
    return normalize(candidates[0].transcript);
  }

  globalThis.BizziVoiceLanguage = Object.freeze({ normalize, score, best, compact });
  if (globalThis.document?.documentElement) {
    const checks = [
      ["plonbier à coquody", "plombier à Cocody"],
      ["esteticienne à coumassi", "esthéticienne à Koumassi"],
      ["garba à yopou gong", "garba à Yopougon"],
      ["escargo", "escargot"],
      ["cargo", "cargo"],
      ["femme de minage", "aide ménage"],
    ];
    const failures = checks.filter(([spoken, expected]) => normalize(spoken) !== expected);
    document.documentElement.dataset.voiceLanguageReady = failures.length ? "false" : "true";
    document.documentElement.dataset.voiceLanguageFailures = failures.map(([spoken]) => spoken).join("|");
  }
})();
