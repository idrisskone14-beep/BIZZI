(function () {
  "use strict";

  const ASSET_ROOT = "assets/services-ai/";

  function slugify(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function imageUrl(serviceName) {
    return `${ASSET_ROOT}${slugify(serviceName)}.webp`;
  }

  function imageFocus(serviceName) {
    const slug = slugify(serviceName);
    const actionAtBottom = /(nettoyage|lavage|tatouage|carreleur|cuisinier|mecanicien|plombier|reparateur|vulcanisateur)/.test(slug);
    return actionAtBottom ? "50% 50%" : "50% 42%";
  }

  function isLiteMode() {
    return document.documentElement.dataset.saveData === "true"
      || document.body?.classList.contains("data-lite")
      || navigator.connection?.saveData === true;
  }

  function decorate(card) {
    if (!card || card.dataset.aiServiceDecorated === "true" || isLiteMode()) return;
    const serviceName = card.dataset.service || card.dataset.homeService;
    const art = card.querySelector(".service-art, .quick-art");
    if (!serviceName || !art) return;

    card.dataset.aiServiceDecorated = "true";
    const image = new Image();
    image.className = "service-ai-thumb";
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.fetchPriority = "low";
    image.style.setProperty("--service-image-focus", imageFocus(serviceName));
    image.addEventListener("load", () => image.classList.add("is-ready"), { once: true });
    image.addEventListener("error", () => {
      card.dataset.aiServiceDecorated = "error";
      image.remove();
    }, { once: true });
    image.src = imageUrl(serviceName);
    art.append(image);
  }

  function refresh(root) {
    if (isLiteMode()) return;
    (root || document).querySelectorAll?.(".service-card[data-service], .quick-service[data-home-service]").forEach(decorate);
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(".service-card[data-service], .quick-service[data-home-service]")) decorate(node);
        refresh(node);
      }
    }
  });

  function start() {
    refresh(document);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.BizziServiceImages = Object.freeze({ url: imageUrl, refresh });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
