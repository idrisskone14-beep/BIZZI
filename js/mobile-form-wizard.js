(() => {
  let runtime = {};

  function stepNumber(field) {
    return Number(field?.closest?.("[data-mobile-step]")?.dataset?.mobileStep || 1);
  }

  function setStep(form, requestedStep = 1, { focus = false } = {}) {
    if (!form) return;
    const steps = [...form.querySelectorAll("[data-mobile-step]")];
    if (!steps.length) return;
    const number = Math.min(Math.max(Number(requestedStep) || 1, 1), steps.length);
    form.dataset.mobileCurrentStep = String(number);
    steps.forEach((step) => step.classList.toggle("active", Number(step.dataset.mobileStep) === number));
    const active = steps.find((step) => Number(step.dataset.mobileStep) === number) || steps[0];
    const label = form.querySelector("[data-mobile-progress-label]");
    const text = form.querySelector("[data-mobile-progress-text]");
    if (label) label.textContent = `Étape ${number} sur ${steps.length}`;
    if (text) text.textContent = active.dataset.stepTitle || "Complétez la fiche";
    if (focus && window.matchMedia("(max-width: 720px)").matches) {
      form.querySelector(".mobile-form-progress")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function revealField(form, field, { focus = true } = {}) {
    if (!form || !field) return;
    const details = field.closest("details");
    if (details) details.open = true;
    setStep(form, stepNumber(field));
    if (focus && typeof field.focus === "function") {
      window.requestAnimationFrame(() => {
        try {
          field.focus({ preventScroll: true });
          field.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {
          field.focus();
        }
      });
    }
  }

  function validateStep(form, number) {
    const step = form?.querySelector(`[data-mobile-step="${Number(number)}"]`);
    if (!step) return true;
    const fields = [...step.querySelectorAll("input, select, textarea")].filter((field) => !field.disabled);
    fields.forEach((field) => field.setCustomValidity?.(""));
    const phones = form.id === "eventForm" ? ["contactPhone"] : ["phone", "whatsapp"];
    for (const name of phones) {
      const field = form.elements.namedItem(name);
      if (!field || !step.contains(field) || (!field.required && !String(field.value || "").trim())) continue;
      if (!runtime.isValidPhone(field.value)) {
        field.setCustomValidity(runtime.contactMessage(name === "whatsapp" ? "WhatsApp" : "téléphone"));
      }
    }
    if (form.id === "eventForm") {
      const start = form.elements.namedItem("dateTime");
      const end = form.elements.namedItem("endDateTime");
      if (step.contains(start) && start.value && end.value && new Date(end.value) <= new Date(start.value)) {
        end.setCustomValidity("La fin doit être après le début de l'événement.");
      }
    }
    const invalid = fields.find((field) => typeof field.checkValidity === "function" && !field.checkValidity());
    if (!invalid) return true;
    revealField(form, invalid);
    invalid.reportValidity?.();
    return false;
  }

  function reset(form) {
    if (!form) return;
    form.dataset.dirty = "false";
    setStep(form, 1);
  }

  function dateTimeValue(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function setup(options = {}) {
    runtime = options;
    document.querySelectorAll("[data-mobile-form]").forEach((form) => {
      if (form.dataset.mobileWizardReady === "true") return;
      form.dataset.mobileWizardReady = "true";
      reset(form);
      form.querySelectorAll("[data-mobile-next]").forEach((button) => button.addEventListener("click", () => {
        const current = Number(form.dataset.mobileCurrentStep || 1);
        if (validateStep(form, current)) setStep(form, current + 1, { focus: true });
      }));
      form.querySelectorAll("[data-mobile-prev]").forEach((button) => button.addEventListener("click", () => {
        setStep(form, Number(form.dataset.mobileCurrentStep || 1) - 1, { focus: true });
      }));
      form.addEventListener("invalid", (event) => revealField(form, event.target, { focus: false }), true);
      form.addEventListener("input", () => { form.dataset.dirty = "true"; });
    });

    const form = document.querySelector("#eventForm");
    if (form?.dataset.dirty !== "true") {
      runtime.state.selectedEventPlanId = "standard";
      const city = form.elements.namedItem("city");
      if (city && !city.value) city.value = runtime.defaultEventCity();
      runtime.saveState();
    }
    const start = form?.elements?.namedItem("dateTime");
    const end = form?.elements?.namedItem("endDateTime");
    if (start && end && start.dataset.autoEndReady !== "true") {
      start.dataset.autoEndReady = "true";
      start.addEventListener("change", () => {
        const date = new Date(start.value);
        if (Number.isNaN(date.getTime())) return;
        if (!end.value || new Date(end.value) <= date || end.dataset.userEdited !== "true") {
          end.value = dateTimeValue(new Date(date.getTime() + 7200000));
          end.dataset.userEdited = "false";
        }
      });
      end.addEventListener("input", () => {
        end.dataset.userEdited = "true";
        end.setCustomValidity("");
      });
    }
  }

  globalThis.BizziMobileForms = { setup, setStep, revealField, reset };
})();
