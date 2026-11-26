// GET /api/private-file?path=... : lecture d'un justificatif prive, reservee aux admins actifs.
// Le jeton est celui de Neon Auth (Authorization: Bearer <JWT>), verifie avec les cles publiques
// de Neon Auth ; l'admin est ensuite controle dans admin_profiles.
import { get } from "@vercel/blob";
import { verifyAdmin } from "./_lib/admin-auth.js";
import { blobAuth } from "./_lib/blob-auth.js";
import { json, text } from "./_lib/http.js";

export async function GET(request) {
  const path = text(new URL(request.url).searchParams.get("path"));
  if (!/^(verification|payments)\/[\w.-]+$/.test(path)) return json({ error: "Chemin invalide." }, 400);
  if (!(await verifyAdmin(request))) return json({ error: "Acces reserve aux admins." }, 403);
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
