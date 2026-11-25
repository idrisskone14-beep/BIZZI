// Elements partages par les scripts de migration.
import fs from "node:fs";

/**
 * Chaines de connexion : fichier .env de ce dossier (jamais commite), surchargeables par les
 * variables d'environnement SOURCE_URL / TARGET_URL (ex. une branche Neon de repetition).
 */
export const env = (() => {
  const file = new URL("./.env", import.meta.url);
  const values = fs.existsSync(file)
    ? Object.fromEntries(fs.readFileSync(file, "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]))
    : {};
  for (const key of ["SOURCE_URL", "TARGET_URL"]) if (process.env[key]) values[key] = process.env[key];
  return values;
})();

/** Tables qui n'existaient que sur Supabase (copiees depuis l'export Supabase). */
export const NEW_TABLES = new Set("cash_credits cash_disputes cash_missions cash_notifications cash_reviews cash_solutions cash_solver_stats cash_transactions cash_wallets driver_locations driver_vehicles market_credits market_ledger market_requests market_settings market_solutions market_solver_permissions pricing_quotes professional_wallets provider_availability recommendation_settings request_services ride_admin_audit_log ride_drivers ride_pricing_settings ride_promotions ride_status_history ride_stops rides service_proposals service_request_events service_request_matches service_request_media situation_questions situation_services situations vehicle_categories wallet_transactions push_subscriptions".split(" "));

/** Tables presentes des deux cotes dont les lignes Supabase sont fusionnees (sans ecraser Neon). */
export const MERGE_TABLES = ["platform_settings", "admin_profiles", "admin_audit_events"];

/** Valeur JSON comparable : cles d'objets triees (jsonb ne garde pas l'ordre), nombres normalises. */
export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonical(value[k])]));
  if (typeof value === "number") return String(value);
  if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) return String(Number(value));
  return value;
}
