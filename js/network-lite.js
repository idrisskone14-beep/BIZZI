(function () {
  "use strict";
  const translations = {
    fr: {
      home: "Accueil", delivery: "Livraison et course", services: "Services", jobs: "Emplois",
      express: "Demande express", provider: "Prestataire", welcome: "Bienvenue sur Bizzis",
      today: "Que voulez-vous faire aujourd'hui ?", install: "Installer",
    },
    nouchi: {
      home: "Accueil", delivery: "Livraison et course", services: "Services", jobs: "Boulot",
      express: "Besoin rapide", provider: "Pro", welcome: "Akwaba sur Bizzis",
      today: "Tu veux faire quoi aujourd'hui ?", install: "Mettre sur téléphone",
    },
  };

  function connection() {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  }

  function isLite() {
    const net = connection();
    return Boolean(net?.saveData || ["slow-2g", "2g"].includes(net?.effectiveType));
  }

  function optimizeImages() {
    document.querySelectorAll("img").forEach((img) => {
      if (!img.loading) img.loading = "lazy";
      img.decoding = "async";
    });
  }

  function applyConnectionMode() {
    const lite = isLite();
    document.documentElement.classList.toggle("data-lite", lite);
    const status = document.querySelector("#connectionMode");
    if (status) status.textContent = lite ? "Mode données réduites" : navigator.onLine ? "Connexion normale" : "Mode hors ligne";
    optimizeImages();
  }

  function setLanguage(language = "fr") {
    const selected = translations[language] ? language : "fr";
    document.documentElement.lang = selected === "nouchi" ? "fr-CI" : "fr";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = translations[selected][element.dataset.i18n];
      if (value) element.textContent = value;
    });
    try { localStorage.setItem("bizzi-language", selected); } catch {}
    const select = document.querySelector("#languageSelect");
    if (select) select.value = selected;
  }

  function setup() {
    const select = document.querySelector("#languageSelect");
    let language = "fr";
    try { language = localStorage.getItem("bizzi-language") || "fr"; } catch {}
    select?.addEventListener("change", () => setLanguage(select.value));
    connection()?.addEventListener?.("change", applyConnectionMode);
    globalThis.addEventListener("online", applyConnectionMode);
    globalThis.addEventListener("offline", applyConnectionMode);
    applyConnectionMode();
    setLanguage(language);
  }

  globalThis.BizziLite = { setup, isLite, setLanguage };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup, { once: true });
  else setup();
})();
