// Verification d'un admin Zeyds cote serveur : jeton Neon Auth (Authorization: Bearer <JWT>)
// verifie avec les cles publiques de Neon Auth, puis compte actif dans admin_profiles.
import { createRemoteJWKSet, jwtVerify } from "jose";
import { sql } from "./http.js";

let jwks = null;

/** Renvoie { id, role } de l'admin actif, ou null. */
export async function verifyAdmin(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!token || !jwksUrl) return null;
  jwks ||= createRemoteJWKSet(new URL(jwksUrl));
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: process.env.NEON_AUTH_ISSUER || undefined });
    if (payload.role !== "authenticated" || typeof payload.sub !== "string") return null;
    const rows = await sql()`select role from public.admin_profiles
      where auth_user_id::text = ${payload.sub} and is_active = true limit 1`;
    return rows.length ? { id: payload.sub, role: String(rows[0].role || "admin") } : null;
  } catch {
    return null;
  }
}
