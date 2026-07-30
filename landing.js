(function () {
  "use strict";

  const APP_URL = "index.html?source=landing&welcome=1";
  const stateKey = "bizzi-state";

  function cleanName(value) {
    return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40);
  }

  function cleanPhone(value) {
    return String(value || "").trim().replace(/[^\d+]/g, "").slice(0, 20);
  }

  function validPhone(value) {
    return value.replace(/\D/g, "").length >= 8;
  }

  function saveIdentity(name, phone) {
    try {
      const previous = JSON.parse(localStorage.getItem(stateKey) || "{}");
      const next = previous && typeof previous === "object" ? previous : {};
      next.clientName = name;
      next.clientPhone = phone;
      next.clientIdentityUpdatedAt = new Date().toISOString();
      localStorage.setItem(stateKey, JSON.stringify(next));
    } catch {
      // L’inscription continue même si le stockage local est indisponible.
    }
  }

  function openSignup() {
    document.querySelector("#signup")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => document.querySelector("#landingName")?.focus(), 450);
  }

  document.querySelectorAll("[data-landing-signup]").forEach((button) => {
    button.addEventListener("click", openSignup);
  });

  document.querySelector("#landingSignupForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = cleanName(data.get("clientName"));
    const phone = cleanPhone(data.get("clientPhone"));
    const status = document.querySelector("#landingSignupStatus");
    if (name.length < 2) {
      if (status) status.textContent = "Indiquez un prénom ou un pseudo d’au moins 2 caractères.";
      document.querySelector("#landingName")?.focus();
      return;
    }
    if (!validPhone(phone)) {
      if (status) status.textContent = "Indiquez un numéro de téléphone valide.";
      document.querySelector("#landingPhone")?.focus();
      return;
    }
    if (!data.get("consent")) {
      if (status) status.textContent = "Confirmez votre accord pour continuer.";
      return;
    }
    saveIdentity(name, phone);
    if (status) status.textContent = "Bienvenue dans Bizzis ! Ouverture de l’application…";
    window.setTimeout(() => globalThis.location.assign(APP_URL), 350);
  });
}());
