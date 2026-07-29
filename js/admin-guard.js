(function () {
  "use strict";

  const ADMIN_KEYS = ["bizzi-admin-entry", "bizzi-admin-unlocked", "bizzi-admin-auth-session"];

  function clearAdminSession() {
    ADMIN_KEYS.forEach((key) => globalThis.BizziStorage?.sessionRemove?.(key));
  }

  function hasAdminContext() {
    const path = String(globalThis.location?.pathname || "");
    const hash = String(globalThis.location?.hash || "");
    return path.includes("admin") || hash === "#admin" || globalThis.BizziStorage?.sessionGet?.("bizzi-admin-entry") === "true";
  }

  function redactSession(session = {}) {
    return {
      email: session.email || "",
      expiresAt: session.expiresAt || "",
      hasAccessToken: Boolean(session.accessToken),
    };
  }

  globalThis.BizziAdminGuard = Object.freeze({
    clearAdminSession,
    hasAdminContext,
    redactSession,
  });
})();
