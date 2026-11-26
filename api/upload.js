// POST /api/upload : envoi d'une photo (stockage public) ou d'un justificatif (stockage prive).
// Remplace Supabase Storage. Corps multipart : file, kind (cle de BizziConfig.supabase.storage).
// L'app compresse les photos avant envoi ; la limite des fonctions Vercel est 4,5 Mo par requete.
import { put } from "@vercel/blob";
import { blobAuth } from "./_lib/blob-auth.js";
import { json, text } from "./_lib/http.js";

const MAX_BYTES = 4 * 1024 * 1024;
const IMAGES = ["image/jpeg", "image/png", "image/webp"];

const KINDS = {
  providerPhotos: { folder: "providers", access: "public", types: IMAGES },
  eventPosters: { folder: "events", access: "public", types: IMAGES },
  foodPhotos: { folder: "food", access: "public", types: IMAGES },
  exceptionPlacePhotos: { folder: "exception-places", access: "public", types: IMAGES },
  requestPhotos: { folder: "requests", access: "public", types: IMAGES },
  verificationProofs: { folder: "verification", access: "private", types: [...IMAGES, "application/pdf"] },
  paymentProofs: { folder: "payments", access: "private", types: [...IMAGES, "application/pdf"] },
};

function safeName(name) {
  const base = name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
  return (base || "fichier").slice(-60);
}

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Formulaire invalide." }, 400);
  }
  const kind = KINDS[text(form.get("kind"))];
  const file = form.get("file");
  if (!kind) return json({ error: "Type d'envoi inconnu." }, 400);
  if (!(file instanceof File) || !file.size) return json({ error: "Fichier manquant." }, 400);
  if (file.size > MAX_BYTES) return json({ error: "Fichier trop lourd (4 Mo maximum)." }, 413);
  if (!kind.types.includes(file.type)) return json({ error: "Format non accepte (JPEG, PNG, WebP ou PDF)." }, 415);

  const auth = await blobAuth(kind.access);
  if (!auth) return json({ error: "Stockage non configure." }, 503);

  try {
    const blob = await put(`${kind.folder}/${Date.now()}-${safeName(file.name)}`, file, {
      access: kind.access,
      ...auth,
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: kind.access === "public" ? 60 * 60 * 24 * 365 : undefined,
    });
    // Public : URL directe (CDN). Prive : seul le chemin est garde, lu via /api/private-file (admins).
    return json({ path: blob.pathname, publicUrl: kind.access === "public" ? blob.url : "" });
  } catch (error) {
    console.error(JSON.stringify({ where: "upload", message: String(error?.message || error).slice(0, 300) }));
    return json({ error: "Envoi impossible, reessayez." }, 502);
  }
}
