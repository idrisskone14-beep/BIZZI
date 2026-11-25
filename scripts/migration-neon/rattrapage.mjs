// Apres la bascule : recupere les lignes ecrites sur l'ancien systeme APRES l'instantane de
// bascule.mjs (onglet reste ouvert pendant la maintenance, par exemple). Ajoute seulement les
// lignes absentes de zeyds-prod (jamais d'ecrasement) et liste les lignes modifiees a revoir.
// Usage : node rattrapage.mjs            (lit bascule-etat.json)
//         TARGET_URL=<branche> node rattrapage.mjs --repetition
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { env, NEW_TABLES } from "./common.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const stateFile = process.argv.includes("--repetition") ? "bascule-etat-repetition.json" : "bascule-etat.json";
const state = JSON.parse(fs.readFileSync(path.join(here, stateFile), "utf8"));
const q = (n) => '"' + n.replace(/"/g, '""') + '"';
const src = new pg.Client({ connectionString: env.SOURCE_URL });
const tgt = new pg.Client({ connectionString: env.TARGET_URL });
await src.connect();
await tgt.connect();
console.log(`Rattrapage depuis l'instantane ${state.snapshot}`);

// 1. bizzi-db : lignes creees apres l'instantane.
const { rows: tables } = await src.query(`select c.table_name from information_schema.columns c
  join information_schema.tables t using (table_schema, table_name)
  where c.table_schema = 'public' and t.table_type = 'BASE TABLE' and c.column_name = 'created_at'
    and exists (select 1 from information_schema.columns i where i.table_schema = 'public' and i.table_name = c.table_name and i.column_name = 'id')`);
let added = 0;
for (const { table_name: table } of tables) {
  const { rows: cols } = await src.query(`select a.attname, format_type(a.atttypid, a.atttypmod) as type from pg_attribute a
    where a.attrelid = ('public.' || quote_ident($1))::regclass and a.attnum > 0 and not a.attisdropped and a.attgenerated = '' order by a.attnum`, [table]);
  const { rows } = await src.query(`select json_build_array(${cols.map((c) => `${q(c.attname)}::text`).join(", ")}) as r from public.${q(table)} where created_at >= $1`, [state.snapshot]);
  if (!rows.length) continue;
  const result = await tgt.query(`insert into public.${q(table)} (${cols.map((c) => q(c.attname)).join(", ")})
    select ${cols.map((c, i) => `(r->>${i})::${c.type}`).join(", ")} from json_array_elements($1::json) r on conflict do nothing`, [JSON.stringify(rows.map((r) => r.r))]);
  added += result.rowCount;
  console.log(`bizzi-db ${table} : +${result.rowCount} (sur ${rows.length} creee(s) apres l'instantane)`);
}
const { rows: updated } = await src.query(`select string_agg(t, ' ') as t from (
  select c.table_name as t from information_schema.columns c where c.table_schema = 'public' and c.column_name = 'updated_at') x`);
for (const table of String(updated[0].t || "").split(" ").filter(Boolean)) {
  const { rows: [r] } = await src.query(`select count(*)::int as n from public.${q(table)} where updated_at >= $1 and created_at < $1`, [state.snapshot]).catch(() => ({ rows: [{ n: 0 }] }));
  if (r?.n) console.log(`A REVOIR bizzi-db ${table} : ${r.n} ligne(s) modifiee(s) apres l'instantane (non recopiees)`);
}

// 2. Supabase : nouvel export, ajout des lignes absentes.
const dir = path.join(path.dirname(state.exportDir), `rattrapage-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}`);
execFileSync(process.execPath, [path.join(here, "export-supabase.mjs"), dir], { stdio: "inherit", env: { ...process.env, NODE_NO_WARNINGS: "1" } });
const fresh = JSON.parse(fs.readFileSync(path.join(dir, "donnees.json"), "utf8")).tables;
for (const table of NEW_TABLES) {
  const rows = (fresh[table] || []).filter((row) => !row.created_at || row.created_at >= state.snapshot);
  if (!rows.length || table === "push_subscriptions") continue;
  const { rows: cols } = await tgt.query(`select a.attname from pg_attribute a where a.attrelid = ('public.' || quote_ident($1))::regclass
    and a.attnum > 0 and not a.attisdropped and a.attgenerated = '' and a.attidentity <> 'a' order by a.attnum`, [table]);
  const list = cols.map((c) => c.attname).filter((n) => rows.some((row) => n in row)).map(q).join(", ");
  const result = await tgt.query(`insert into public.${q(table)} (${list}) select ${list} from json_populate_recordset(null::public.${q(table)}, $1::json) on conflict do nothing`, [JSON.stringify(rows)]);
  added += result.rowCount;
  console.log(`Supabase ${table} : +${result.rowCount}`);
}
console.log(`Rattrapage termine : ${added} ligne(s) ajoutee(s).`);
await src.end();
await tgt.end();
