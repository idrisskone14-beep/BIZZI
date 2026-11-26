// Acces Neon pour la console admin : Neon Auth (session par cookie, comme le SDK officiel) et
// Data API (PostgREST). Toutes les regles de securite restent dans la base (RLS + fonctions admin).

const AUTH_URL = "https://ep-dry-night-bgn2xvtv.neonauth.c-9.eu-central-1.aws.neon.tech/neondb/auth";
const DATA_URL = "https://ep-dry-night-bgn2xvtv.apirest.c-9.eu-central-1.aws.neon.tech/neondb/rest/v1";
const MARGIN_MS = 60 * 1000;

let access = { token: "", exp: 0 };
let pending = null;

export function claims(token = access.token) {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(part + "=".repeat((4 - (part.length % 4)) % 4))))) || {};
  } catch {
    return {};
  }
}

function frenchAuthError(payload, status) {
  const code = String(payload?.code || "");
  if (code === "INVALID_EMAIL_OR_PASSWORD") return "E-mail ou mot de passe incorrect.";
  if (code === "INVALID_OTP" || code === "OTP_EXPIRED") return "Code incorrect ou expiré. Demandez un nouveau code.";
  if (code === "TOO_MANY_ATTEMPTS" || status === 429) return "Trop de tentatives. Patientez quelques minutes.";
  if (code === "PASSWORD_TOO_SHORT") return "Mot de passe trop court (8 caractères minimum).";
  return payload?.message || `Connexion impossible (${status}).`;
}

async function auth(path, { method = "GET", body } = {}) {
  const response = await fetch(`${AUTH_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json", Accept: "application/json" } : { Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(frenchAuthError(payload, response.status));
    error.status = response.status;
    throw error;
  }
  return { payload, response };
}

/** Jeton d'acces (~15 min) tire du cookie de session Neon Auth ; "" si pas de session. */
export async function accessToken({ force = false } = {}) {
  if (!force && access.token && access.exp - MARGIN_MS > Date.now()) return access.token;
  if (!pending) {
    pending = (async () => {
      let token = "";
      try {
        token = (await auth("/token")).payload?.token || "";
      } catch {
        try {
          const { response } = await auth("/get-session");
          token = response.headers.get("set-auth-jwt") || "";
        } catch {
          token = "";
        }
      }
      access = { token, exp: token ? Number(claims(token).exp || 0) * 1000 : 0 };
      return token;
    })().finally(() => { pending = null; });
  }
  return pending;
}

export async function signIn(email, password) {
  await auth("/sign-in/email", { method: "POST", body: { email, password, rememberMe: true } });
  const token = await accessToken({ force: true });
  if (!token) throw new Error("Session refusée : votre navigateur bloque peut-être les cookies de connexion.");
  return token;
}

export async function signOut() {
  await auth("/sign-out", { method: "POST", body: {} }).catch(() => null);
  access = { token: "", exp: 0 };
}

export const requestPasswordCode = (email) => auth("/email-otp/request-password-reset", { method: "POST", body: { email } });
export const resetPassword = (email, otp, password) => auth("/email-otp/reset-password", { method: "POST", body: { email, otp, password } });

function frenchDataError(payload, status) {
  const message = String(payload?.message || payload?.error || "");
  if (/admin only|super admin only/i.test(message)) return "Action réservée aux administrateurs autorisés.";
  if (/jwt|token/i.test(message) || status === 401) return "Session expirée : reconnectez-vous.";
  if (/row-level security/i.test(message)) return "Action refusée par les règles de sécurité de la base.";
  return message || `Erreur ${status}`;
}

async function data(path, { method = "GET", body, headers = {} } = {}) {
  const token = await accessToken();
  if (!token) {
    const error = new Error("Session expirée : reconnectez-vous.");
    error.status = 401;
    throw error;
  }
  const response = await fetch(`${DATA_URL}/${path}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) {
    const error = new Error(frenchDataError(payload, response.status));
    error.status = response.status;
    throw error;
  }
  return { payload, response };
}

export async function rpc(name, args = {}) {
  return (await data(`rpc/${name}`, { method: "POST", body: args })).payload;
}

export async function select(query) {
  return (await data(query)).payload || [];
}

/** Lignes + nombre total (en-tete Content-Range de PostgREST). */
export async function selectCount(query) {
  const { payload, response } = await data(query, { headers: { Prefer: "count=exact" } });
  const total = Number(String(response.headers.get("content-range") || "").split("/")[1]);
  return { rows: payload || [], total: Number.isFinite(total) ? total : (payload || []).length };
}

export async function count(table, filter = "") {
  const { total } = await selectCount(`${table}?select=id&limit=1${filter ? `&${filter}` : ""}`);
  return total;
}

export async function update(table, filter, values) {
  return (await data(`${table}?${filter}`, { method: "PATCH", body: values, headers: { Prefer: "return=representation" } })).payload;
}

/** Trace d'audit (best effort : ne bloque jamais l'action). */
export function audit(action, targetId, payload = {}, success = true, errorMessage = null) {
  rpc("admin_log_action", {
    p_action: action, p_target_id: targetId ? String(targetId) : null, p_success: success,
    p_error_message: errorMessage, p_payload: payload,
  }).catch(() => null);
}

/** Justificatif prive (stockage Vercel Blob prive) -> URL locale temporaire. */
export async function privateFileUrl(path) {
  const token = await accessToken();
  const response = await fetch(`/api/private-file?path=${encodeURIComponent(path)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(response.status === 403 ? "Accès refusé." : "Fichier introuvable.");
  return URL.createObjectURL(await response.blob());
}

export const eq = (value) => `eq.${encodeURIComponent(value)}`;
export const like = (value) => `*${String(value).replace(/[*,()]/g, " ").trim()}*`;
