(function () {
  "use strict";

  const DEVICE_KEY = "bizzi-device-id";
  const SIGNUP_LOG_KEY = "bizzi-provider-signup-log";
  const TRIAL_WINDOW_DAYS = 31;

  function deviceId() {
    let value = globalThis.BizziStorage?.localGet?.(DEVICE_KEY);
    if (!value) {
      value = `bz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      globalThis.BizziStorage?.localSet?.(DEVICE_KEY, value);
    }
    return value;
  }

  function normalizePhone(phone = "") {
    return String(phone).replace(/[^0-9]/g, "");
  }

  function phoneKeys(phone = "") {
    const digits = normalizePhone(phone);
    const keys = new Set();
    if (!digits) return keys;
    keys.add(digits);
    if (digits.length > 8) keys.add(digits.slice(-8));
    if (digits.length > 10) keys.add(digits.slice(-10));
    return keys;
  }

  function phonesOverlap(left = "", right = "") {
    const leftKeys = phoneKeys(left);
    if (!leftKeys.size) return false;
    return [...phoneKeys(right)].some((key) => leftKeys.has(key));
  }

  function duplicatePhoneCount(phone, providers = []) {
    if (!phoneKeys(phone).size) return 0;
    return providers.filter((provider) => (
      phonesOverlap(provider.phone, phone) ||
      phonesOverlap(provider.whatsapp, phone) ||
      phonesOverlap(provider.social?.whatsapp, phone)
    )).length;
  }

  function readSignupLog() {
    try {
      return JSON.parse(globalThis.BizziStorage?.localGet?.(SIGNUP_LOG_KEY) || "[]").filter(Boolean);
    } catch {
      return [];
    }
  }

  function writeSignupLog(entries = []) {
    globalThis.BizziStorage?.localSet?.(SIGNUP_LOG_KEY, JSON.stringify(entries.slice(-80)));
  }

  function recentSignupCount(phone = "") {
    const normalized = normalizePhone(phone);
    const limit = Date.now() - TRIAL_WINDOW_DAYS * 86400000;
    return readSignupLog().filter((entry) => {
      const at = new Date(entry.at || 0).getTime();
      const sameDevice = entry.deviceId === deviceId();
      const samePhone = normalized && (
        phonesOverlap(entry.phone, normalized) ||
        phonesOverlap(entry.whatsapp, normalized)
      );
      return at >= limit && (sameDevice || samePhone);
    }).length;
  }

  function rememberSignup(provider = {}) {
    const entries = readSignupLog();
    entries.push({
      deviceId: deviceId(),
      phone: normalizePhone(provider.phone || provider.whatsapp),
      whatsapp: normalizePhone(provider.whatsapp || provider.phone),
      service: provider.service || "",
      at: new Date().toISOString(),
    });
    writeSignupLog(entries);
  }

  function assessProviderSignup(provider = {}, providers = []) {
    const duplicates = duplicatePhoneCount(provider.phone || provider.whatsapp, providers);
    const recentTrials = recentSignupCount(provider.phone || provider.whatsapp);
    const signals = [];
    if (duplicates > 0) signals.push("telephone_deja_utilise");
    if (recentTrials >= 1) signals.push("essai_recent_sur_appareil");
    if (!provider.service || provider.service === "Choisir métier") signals.push("metier_absent");
    if (!provider.city) signals.push("ville_absente");
    return {
      deviceId: deviceId(),
      risk: duplicates > 0 || recentTrials >= 2 || signals.length >= 2 ? "high" : signals.length ? "medium" : "low",
      signals,
      recentTrials,
    };
  }

  globalThis.BizziFraudGuard = Object.freeze({
    deviceId,
    normalizePhone,
    duplicatePhoneCount,
    phoneKeys,
    phonesOverlap,
    recentSignupCount,
    rememberSignup,
    assessProviderSignup,
  });
})();
