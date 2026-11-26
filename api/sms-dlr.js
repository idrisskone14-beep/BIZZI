// /api/sms-dlr?k=<secret> : accuse de reception LeTexto (statut PENDING, SENT, DELIVERED, FAILED).
// Le secret est derive de la cle LeTexto (api/_lib/letexto.js) : seul LeTexto connait cette adresse.
// LeTexto appelle en POST (JSON) ; GET accepte aussi au cas ou le compte serait regle ainsi.
import { json, sql, text } from "./_lib/http.js";
import { checkDlrSecret, letextoConfig } from "./_lib/letexto.js";

const STATUSES = new Set(["PENDING", "SENT", "DELIVERED", "FAILED"]);

async function handle(request) {
  const config = letextoConfig();
  const url = new URL(request.url);
  if (!config || !checkDlrSecret(config, url.searchParams.get("k"))) return json({ error: "forbidden" }, 403);

  let body = {};
  if (request.method === "POST") body = (await request.json().catch(() => null)) || {};
  const id = text(String(body.id ?? url.searchParams.get("id") ?? ""));
  const status = text(String(body.statuts ?? body.statut ?? body.status ?? url.searchParams.get("statuts") ?? url.searchParams.get("status") ?? "")).toUpperCase();
  if (!id || !STATUSES.has(status)) return json({ ok: true, ignored: true });

  try {
    await sql()`update public.sms_log
      set delivery_status = ${status},
          delivered_at = case when ${status} = 'DELIVERED' then now() else delivered_at end
      where letexto_id = ${id}`;
  } catch (error) {
    console.error(JSON.stringify({ where: "sms-dlr", message: String(error?.message || error).slice(0, 200) }));
  }
  return json({ ok: true });
}

export const POST = handle;
export const GET = handle;
