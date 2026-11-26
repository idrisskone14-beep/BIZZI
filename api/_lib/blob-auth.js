// Acces aux deux stockages Vercel Blob de Zeyds.
// - public (photos) : cle BLOB_READ_WRITE_TOKEN ;
// - prive (justificatifs) : mode OIDC de Vercel, stockage designe par PRIVATE_BLOB_STORE_ID
//   (prefixe choisi a la connexion du stockage au projet), ou ancienne cle PRIVATE_BLOB_READ_WRITE_TOKEN.
// On passe toujours des identifiants explicites : sans eux, la bibliotheque se rabattrait sur la
// cle du stockage PUBLIC, et un justificatif pourrait y atterrir.
import { getVercelOidcToken } from "@vercel/oidc";

export async function blobAuth(access) {
  if (access === "public") {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    return token ? { token } : null;
  }
  const storeId = process.env.PRIVATE_BLOB_STORE_ID;
  if (storeId) {
    const oidcToken = await getVercelOidcToken().catch(() => "");
    return oidcToken ? { oidcToken, storeId } : null;
  }
  const token = process.env.PRIVATE_BLOB_READ_WRITE_TOKEN;
  return token ? { token } : null;
}
