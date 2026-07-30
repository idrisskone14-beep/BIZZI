(function () {
  "use strict";

  const REDUCED_MOTION = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
  const ITEM_SELECTOR = [
    ".service-card",
    ".provider-card",
    ".event-card",
    ".job-card",
    ".exception-place-card",
    ".food-place-card",
    ".boosted-event-card",
    ".premium-path-grid > button",
    ".life-template-card",
    ".life-checklist-item",
    ".delivery-request-card",
  ].join(",");
  const TAB_SELECTOR = [
    "[data-delivery-kind]",
    "[data-delivery-entry]",
    "[data-event-entry]",
    "[data-job-entry]",
    "[data-provider-entry]",
    "[data-exception-plan]",
    "[role='tab']",
  ].join(",");
  let initialized = false;

  function motionAllowed() {
    return !REDUCED_MOTION?.matches;
  }

  function restartClass(node, className) {
    if (!node || !motionAllowed()) return;
    node.classList.remove(className);
    void node.offsetWidth;
    node.classList.add(className);
    node.addEventListener("animationend", () => node.classList.remove(className), { once: true });
  }

  function revealItems(root, limit = 10) {
    if (!root || !motionAllowed()) return;
    [...root.querySelectorAll(ITEM_SELECTOR)]
      .filter((node) => !node.hidden && node.offsetParent !== null)
      .slice(0, limit)
      .forEach((node, index) => {
        node.style.setProperty("--motion-order", String(index));
        restartClass(node, "motion-item-enter");
      });
  }

  function viewChanged({ from = "", to = "", view = null } = {}) {
    if (!view || from === to) return;
    document.documentElement.dataset.motionDirection = to === "home" ? "back" : "forward";
    document.querySelectorAll(".nav-link,.bottom-link").forEach((node) => {
      if (node.classList.contains("active")) node.setAttribute("aria-current", "page");
      else node.removeAttribute("aria-current");
    });
    restartClass(view, "motion-view-enter");
    restartClass(document.querySelector("#pageTitle"), "motion-title-enter");
    const activeNavigation = document.querySelectorAll(`.nav-link.active,.bottom-link.active`);
    activeNavigation.forEach((node) => restartClass(node, "motion-nav-active"));
    positionNavIndicators();
    requestAnimationFrame(() => revealItems(view, 12));
  }

  function positionNavIndicators() {
    document.querySelectorAll(".side-nav,.bottom-nav").forEach((nav) => {
      const indicator = nav.querySelector(":scope > .nav-active-indicator");
      if (!indicator) return;
      const active = nav.querySelector(".nav-link.active,.bottom-link.active");
      if (!active) {
        indicator.style.opacity = "0";
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const btnRect = active.getBoundingClientRect();
      indicator.style.width = `${btnRect.width}px`;
      indicator.style.height = `${btnRect.height}px`;
      indicator.style.transform = `translate(${btnRect.left - navRect.left}px, ${btnRect.top - navRect.top}px)`;
      indicator.style.opacity = "1";
    });
  }

  let resizeTimer = null;
  function schedulePositionNavIndicators() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(positionNavIndicators, 120);
  }

  function refreshActiveSurface() {
    if (!motionAllowed()) return;
    const view = document.querySelector(".view.active");
    if (!view) return;
    [...view.querySelectorAll(".panel:not([hidden]),.delivery-payment-box:not([hidden])")]
      .slice(0, 3)
      .forEach((panel, index) => {
        panel.style.setProperty("--motion-order", String(index));
        restartClass(panel, "motion-surface-change");
      });
    revealItems(view, 8);
  }

  function observeRenderedItems() {
    const main = document.querySelector(".main");
    if (!main || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver((records) => {
      if (!motionAllowed()) return;
      const items = [];
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(ITEM_SELECTOR)) items.push(node);
        items.push(...node.querySelectorAll(ITEM_SELECTOR));
      }));
      items.filter((node) => node.closest(".view.active")).slice(0, 10).forEach((node, index) => {
        node.style.setProperty("--motion-order", String(index));
        restartClass(node, "motion-item-enter");
      });
    });
    observer.observe(main, { childList: true, subtree: true });
  }

  function bindPressFeedback() {
    document.addEventListener("pointerdown", (event) => {
      const target = event.target.closest("button,a[href],.clickable-provider,.clickable-featured");
      if (!target || target.matches(":disabled") || !motionAllowed()) return;
      target.classList.add("motion-pressing");
    }, { passive: true });
    ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
      document.addEventListener(eventName, (event) => {
        event.target.closest?.(".motion-pressing")?.classList.remove("motion-pressing");
      }, { passive: true });
    });
    document.addEventListener("click", (event) => {
      const tab = event.target.closest(TAB_SELECTOR);
      if (!tab) return;
      requestAnimationFrame(() => {
        restartClass(tab, "motion-tab-selected");
        refreshActiveSurface();
      });
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    document.documentElement.classList.add("bizzi-motion-ready");
    observeRenderedItems();
    bindPressFeedback();
    positionNavIndicators();
    window.addEventListener("resize", schedulePositionNavIndicators, { passive: true });
    window.addEventListener("load", positionNavIndicators);
  }

  globalThis.BizziMotion = Object.freeze({
    init,
    viewChanged,
    positionNavIndicators,
    refreshActiveSurface,
    revealItems,
    motionAllowed,
  });

  init();
})();
