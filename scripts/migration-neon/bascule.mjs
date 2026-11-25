// Jour J : recopie complete et verifiee vers zeyds-prod, en une commande. S'arrete au premier ecart.
//
//   Repetition (sans risque) : TARGET_URL=<branche Neon de zeyds-prod> node bascule.mjs --repetition
//   Jour J (base reelle)     : node bascule.mjs --confirmer
//
// Etapes : instantane horaire -> export Supabase -> recopie bizzi-db -> verification des lignes ->
// donnees Supabase -> verification Supabase/Zeyds Cash -> liaison des comptes admin ->
// remise a zero des abonnements push (ancienne cle VAPID) -> controle des admins.
// Ecrit bascule-etat.json (instantane, dossier d'export) pour rattrapage.mjs.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { env } from "./common.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repetition = process.argv.includes("--repetition");
const host = (url) => { try { return new URL(url).hostname; } catch { return ""; } };
const fileTarget = Object.fromEntries(fs.readFileSync(path.join(here, ".env"), "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])).TARGET_URL;

if (repetition && host(env.TARGET_URL) === host(fileTarget)) {
  console.error("Repetition refusee : TARGET_URL pointe sur la base de production. Donnez l'URL d'une branche Neon.");
  process.exit(2);
}
if (!repetition && !process.argv.includes("--confirmer")) {
  console.error("Bascule reelle : relancez avec --confirmer (ou --repetition avec une branche Neon).");
  process.exit(2);
}

const started = Date.now();
const snapshot = new Date().toISOString();
const stamp = snapshot.replace(/[:.]/g, "-").slice(0, 19);
const exportDir = path.join(here, "..", "..", "backups", `${repetition ? "repetition" : "bascule"}-${stamp}`);
const exportFile = path.join(exportDir, "donnees.json");
const timings = [];

function step(label, args) {
  const t0 = Date.now();
  console.log(`\n=== ${label}`);
  const result = spawnSync(process.execPath, args, {
    cwd: here,
    env: { ...process.env, TARGET_URL: env.TARGET_URL, NODE_NO_WARNINGS: "1" },
    stdio: "inherit",
  });
  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  timings.push(`${label} : ${seconds} s`);
  if (result.status !== 0) {
    console.error(`\nARRET : « ${label} » a echoue (code ${result.status}). La base de production n'est pas basculee ; l'app reste sur l'ancien systeme.`);
    process.exit(1);
  }
}

console.log(`${repetition ? "REPETITION" : "BASCULE REELLE"} vers ${host(env.TARGET_URL)} - instantane ${snapshot}`);
step("Export Supabase", ["export-supabase.mjs", exportDir]);
step("Recopie de bizzi-db", ["copy-neon.mjs", "data"]);
step("Verification des lignes bizzi-db", ["copy-neon.mjs", "verify"]);
step("Donnees propres a Supabase", ["add-supabase.mjs", "data", exportFile]);
step("Verification Supabase et Zeyds Cash", ["verif-supabase.mjs", exportFile]);
step("Liaison des comptes admin", ["link-admins.mjs", exportFile]);

const c = new pg.Client({ connectionString: env.TARGET_URL });
await c.connect();
const { rowCount } = await c.query("delete from public.push_subscriptions");
console.log(`\n=== Abonnements push remis a zero (${rowCount} supprime(s), ancienne cle VAPID)`);
const { rows: admins } = await c.query(`select p.role, u.email from public.admin_profiles p
  left join neon_auth."user" u on u.id::text = p.auth_user_id::text where p.is_active`);
await c.end();
const unlinked = admins.filter((a) => !a.email);
console.log(`=== Admins actifs relies a Neon Auth : ${admins.length - unlinked.length}/${admins.length}`);
if (unlinked.length) {
  console.error("ARRET : des profils admin actifs ne sont relies a aucun compte Neon Auth.");
  process.exit(1);
}

fs.writeFileSync(path.join(here, `bascule-etat${repetition ? "-repetition" : ""}.json`), JSON.stringify({ snapshot, exportDir, target: host(env.TARGET_URL), repetition }, null, 1));
console.log(`\nTERMINE en ${((Date.now() - started) / 1000).toFixed(0)} s, sans ecart.`);
for (const line of timings) console.log(`  ${line}`);
