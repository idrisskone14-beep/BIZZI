// GET /api/private-file?path=... : lecture d'un justificatif prive, reservee aux admins actifs.
// Le jeton est celui de Neon Auth (Authorization: Bearer <JWT>), verifie avec les cles publiques
// de Neon Auth ; l'admin est ensuite controle dans admin_profiles.
import { get } from "@vercel/blob";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { blobAuth } from "./_lib/blob-auth.js";
import { json, sql, text } from "./_lib/http.js";

let jwks = null;

async function adminUserId(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!token || !jwksUrl) return "";
  jwks ||= createRemoteJWKSet(new URL(jwksUrl));
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: process.env.NEON_AUTH_ISSUER || undefined });
    if (payload.role !== "authenticated" || typeof payload.sub !== "string") return "";
    const rows = await sql()`select 1 from public.admin_profiles where auth_user_id::text = ${payload.sub} and is_active = true limit 1`;
    return rows.length ? payload.sub : "";
  } catch {
    return "";
  }
}

export async function GET(request) {
  const path = text(new URL(request.url).searchParams.get("path"));
  if (!/^(verification|payments)\/[\w.-]+$/.test(path)) return json({ error: "Chemin invalide." }, 400);
  if (!(await adminUserId(request))) return json({ error: "Acces reserve aux admins." }, 403);
  const auth = await blobAuth("private");
  if (!auth) return json({ error: "Stockage prive non configure." }, 503);
  const result = await get(path, { access: "private", ...auth });
  if (!result || result.statusCode !== 200) return json({ error: "Fichier introuvable." }, 404);
  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
