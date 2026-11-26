/* Zeyds V306 - Acces a la base Neon (Data API + Neon Auth).
 *
 * La Data API Neon exige un jeton (JWT) sur chaque requete :
 * - visiteur : jeton anonyme (GET /token/anonymous), valable ~1 h, garde en memoire et en session ;
 * - admin    : connexion e-mail + mot de passe -> jeton de session (Bearer, pas de cookie tiers),
 *              puis jeton d'acces de ~15 min (GET /token), renouvele automatiquement.
 * Premiere connexion / oubli : code a 6 chiffres envoye par e-mail, puis nouveau mot de passe.
 *
 * Activation : BizziConfig.neon.enabled = true, ou ?backend=neon dans l'URL (memorise pour l'onglet)
 * pour tester sans changer la configuration de production ; ?backend=legacy revient en arriere.
 */
(function () {
  "use strict";

  const ANON_KEY = "zeyds-neon-anon-jwt";
  const OVERRIDE_KEY = "zeyds-backend-override";
  const REFRESH_MARGIN_MS = 60 * 1000;
  let anonPromise = null;

  function cfg() {
    return globalThis.BizziConfig?.neon || {};
  }

  function session() {
    try { return globalThis.sessionStorage; } catch { return null; }
  }

  function readOverride() {
    try {
      const param = new URLSearchParams(globalThis.location?.search || "").get("backend");
      if (param === "neon" || param === "legacy") session()?.setItem(OVERRIDE_KEY, param);
      return session()?.getItem(OVERRIDE_KEY) || "";
    } catch {
      return "";
    }
  }

  const override = readOverride();

  function enabled() {
    const c = cfg();
    if (!c.dataApiUrl || !c.authUrl) return false;
    if (override === "neon") return true;
    if (override === "legacy") return false;
    return c.enabled === true;
  }

  const trim = (url) => String(url || "").replace(/\/+$/, "");
  const dataBaseUrl = () => trim(cfg().dataApiUrl);
  const authUrl = (path) => `${trim(cfg().authUrl)}${path}`;

  function jwtExpiryMs(token) {
    try {
      const part = String(token).split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(part + "=".repeat((4 - (part.length % 4)) % 4)));
      return Number(payload.exp) * 1000 || 0;
    } catch {
      return 0;
    }
  }

  const fresh = (token, expiresAt) => Boolean(token) && expiresAt - REFRESH_MARGIN_MS > Date.now();

  async function call(path, { method = "GET", body, bearer } = {}) {
    const headers = { Accept: "application/json" };
    if (body) headers["Content-Type"] = "application/json";
    if (bearer) headers.Authorization = `Bearer ${bearer}`;
    const response = await fetch(authUrl(path), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "omit",
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(frenchError(payload, response.status));
      error.status = response.status;
      error.code = payload.code || "";
      throw error;
    }
    return payload;
  }

  function frenchError(payload, status) {
    const code = String(payload?.code || "");
    if (code === "INVALID_EMAIL_OR_PASSWORD") return "E-mail ou mot de passe incorrect.";
    if (code === "INVALID_OTP" || code === "OTP_EXPIRED") return "Code incorrect ou expiré. Demandez un nouveau code.";
    if (code === "TOO_MANY_ATTEMPTS" || status === 429) return "Trop de tentatives. Patientez quelques minutes.";
    if (code === "PASSWORD_TOO_SHORT") return "Mot de passe trop court (8 caractères minimum).";
    return payload?.message || `Connexion impossible (${status}).`;
  }

  // Le jeton visiteur n'est pas un secret (n'importe qui peut en obtenir un) : il est garde dans le
  // localStorage pour que les visites suivantes (moins d'1 h) n'aient pas a l'attendre.
  function persistent() {
    try { return globalThis.localStorage; } catch { return null; }
  }

  async function anonJwt() {
    let cached = null;
    try { cached = JSON.parse(persistent()?.getItem(ANON_KEY) || "null"); } catch { cached = null; }
    if (cached && fresh(cached.token, cached.expiresAt)) return cached.token;
    if (!anonPromise) {
      anonPromise = call("/token/anonymous")
        .then(({ token }) => {
          const value = { token, expiresAt: jwtExpiryMs(token) };
          try { persistent()?.setItem(ANON_KEY, JSON.stringify(value)); } catch { /* stockage indisponible */ }
          return token;
        })
        .finally(() => { anonPromise = null; });
    }
    return anonPromise;
  }

  async function accessFromSession(sessionToken) {
    const { token } = await call("/token", { bearer: sessionToken });
    return { accessToken: token, accessExpiresAt: jwtExpiryMs(token) };
  }

  /** Connexion admin. Renvoie la session a conserver (format attendu par app.js). */
  async function signIn(email, password) {
    const result = await call("/sign-in/email", { method: "POST", body: { email, password, rememberMe: true } });
    if (!result.token) throw new Error("Connexion refusée par Neon Auth.");
    const access = await accessFromSession(result.token);
    return {
      provider: "neon",
      sessionToken: result.token,
      ...access,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      email: result.user?.email || email,
      userId: result.user?.id || "",
    };
  }

  /** Renvoie un jeton d'acces valide pour la session admin, en le renouvelant si besoin. */
  async function refreshAdmin(stored) {
    if (!stored?.sessionToken) return stored;
    if (fresh(stored.accessToken, stored.accessExpiresAt || 0)) return stored;
    return { ...stored, ...(await accessFromSession(stored.sessionToken)) };
  }

  async function signOut(stored) {
    if (!stored?.sessionToken) return;
    await call("/sign-out", { method: "POST", bearer: stored.sessionToken, body: {} }).catch(() => null);
  }

  /** Premiere connexion ou mot de passe oublie : envoie un code a 6 chiffres par e-mail. */
  async function requestPasswordCode(email) {
    await call("/email-otp/request-password-reset", { method: "POST", body: { email } });
  }

  async function resetPassword(email, otp, password) {
    await call("/email-otp/reset-password", { method: "POST", body: { email, otp, password } });
  }

  /** En-tetes pour la Data API (Authorization + jeton client pour les policies RLS). */
  async function headers(extra = {}, adminAccessToken = "") {
    const token = adminAccessToken || (await anonJwt());
    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Bizzi-Client-Token": globalThis.BizziPrivacy?.token?.() || "",
      ...extra,
    };
  }

  /** Jeton admin courant (sessionStorage partage avec app.js), renouvele si besoin. */
  async function currentAdminAccessToken() {
    const key = "bizzi-admin-auth-session";
    let stored = null;
    try { stored = JSON.parse(session()?.getItem(key) || "null"); } catch { stored = null; }
    if (!stored?.sessionToken || !stored.expiresAt || stored.expiresAt <= Date.now()) return "";
    const next = await refreshAdmin(stored);
    if (next !== stored) {
      try { session()?.setItem(key, JSON.stringify(next)); } catch { /* stockage indisponible */ }
    }
    return next.accessToken || "";
  }

  /** Fonctions serveur : en mode Neon, celles de Vercel (/api/<nom>, meme domaine que le site). */
  function endpoint(name, fallback = "") {
    return enabled() ? `/api/${name}` : fallback;
  }

  /** Reduit une photo (1600 px max, JPEG) avant envoi : plus rapide sur mobile, sous la limite de 4 Mo. */
  async function compressImage(file) {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file?.type || "") || typeof createImageBitmap !== "function") return file;
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      if (scale === 1 && file.size < 1.5 * 1024 * 1024 && /jpeg|webp/i.test(file.type)) return file;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
      if (!blob || blob.size >= file.size) return file;
      return new File([blob], String(file.name || "photo").replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    } catch {
      return file;
    }
  }

  /** Envoi d'un fichier vers Vercel Blob (/api/upload). kind = cle de BizziConfig.supabase.storage. */
  async function uploadFile(kind, file) {
    const prepared = await compressImage(file);
    const form = new FormData();
    form.set("kind", kind);
    form.set("file", prepared, prepared.name || "fichier");
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Envoi ${response.status}`);
    return { bucket: kind, path: data.path, publicUrl: data.publicUrl || "" };
  }

  globalThis.ZeydsNeon = {
    enabled,
    endpoint,
    uploadFile,
    dataBaseUrl,
    restUrl: (path) => `${dataBaseUrl()}/rest/v1/${String(path || "").replace(/^\/+/, "")}`,
    anonJwt,
    headers,
    signIn,
    refreshAdmin,
    signOut,
    requestPasswordCode,
    resetPassword,
    currentAdminAccessToken,
  };

  // Demande le jeton visiteur des le chargement, en parallele du reste de la page.
  if (enabled()) anonJwt().catch(() => null);
})();
