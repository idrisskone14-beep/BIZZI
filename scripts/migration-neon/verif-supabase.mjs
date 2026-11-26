// Verifie que les donnees Supabase de l'export sont presentes a l'identique dans la base cible.
// - tables propres a Supabase (Zeyds Cash, Market, Ride, situations, push...) : contenu identique
//   ligne pour ligne et champ pour champ (JSON compare sans tenir compte de l'ordre des cles) ;
// - tables fusionnees (reglages, profils admin, journal admin) : chaque ligne Supabase existe.
// Sort en erreur (code 1) au moindre ecart : la bascule doit alors s'arreter.
// Usage : node verif-supabase.mjs <chemin/donnees.json>
import fs from "node:fs";
import pg from "pg";
import { canonical, env, MERGE_TABLES, NEW_TABLES } from "./common.mjs";

const exported = JSON.parse(fs.readFileSync(process.argv[2], "utf8")).tables;
const c = new pg.Client({ connectionString: env.TARGET_URL });
await c.connect();

const rowsOf = async (table) => (await c.query(`select coalesce(json_agg(x), '[]'::json) as j from public."${table}" x`)).rows[0].j;
const key = (row) => JSON.stringify(canonical(row));
let problems = 0;

for (const table of NEW_TABLES) {
  const source = exported[table];
  if (!source) continue;
  // La cible peut porter des colonnes en plus : on ne compare que celles de l'export.
  const target = (await rowsOf(table)).map((row) => Object.fromEntries(Object.keys(source[0] || row).map((k) => [k, row[k]])));
  const want = source.map(key).sort();
  const have = target.map(key).sort();
  const missing = want.filter((k) => !have.includes(k)).length;
  const extra = have.filter((k) => !want.includes(k)).length;
  if (missing || extra) {
    problems += 1;
    console.log(`ECART ${table} : ${source.length} attendues, ${target.length} trouvees, ${missing} absentes ou modifiees, ${extra} en trop`);
  }
}

for (const table of MERGE_TABLES) {
  const source = exported[table] || [];
  if (!source.length) continue;
  const id = "id" in source[0] ? "id" : "key";
  const target = new Set((await rowsOf(table)).map((row) => String(row[id])));
  const missing = source.filter((row) => !target.has(String(row[id])));
  if (missing.length) {
    problems += 1;
    console.log(`ECART ${table} : ${missing.length} ligne(s) Supabase absente(s)`);
  }
}

const cash = (await c.query(`select (select coalesce(sum(balance), 0) from public.cash_wallets) as soldes,
  (select count(*) from public.cash_transactions) as transactions`)).rows[0];
const expectedBalance = (exported.cash_wallets || []).reduce((sum, w) => sum + Number(w.balance || 0), 0);
console.log(`Zeyds Cash : soldes ${cash.soldes} (attendu ${expectedBalance}), ${cash.transactions} transactions (attendu ${(exported.cash_transactions || []).length})`);
if (Number(cash.soldes) !== expectedBalance) problems += 1;

console.log(problems ? `VERIFICATION ECHOUEE : ${problems} ecart(s)` : "verification Supabase : tout est identique");
process.exitCode = problems ? 1 : 0;
await c.end();
