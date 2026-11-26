// Ajoute a zeyds-prod ce qui n'existe que sur Supabase (structure + donnees).
// Usage : node add-supabase.mjs schema
//         node add-supabase.mjs data <chemin/donnees.json>   (rejouable)
import fs from "node:fs";
import pg from "pg";
import { env, MERGE_TABLES, NEW_TABLES } from "./common.mjs";

const read = (p) => JSON.parse(fs.readFileSync(new URL(p, import.meta.url), "utf8")).rows;
const ddl = read("./supabase-export/ddl.json");
const grants = read("./supabase-export/grants.json");
const revokes = read("./supabase-export/revokes.json");
const expressCols = read("./supabase-export/express-cols.json");

const EXPRESS_EXTRA = "client_user_id client_name analysis requested_skills desired_at budget_amount latitude longitude location_accuracy_m location_label search_radius_km radius_history dispatch_status accepted_proposal_id situation_id situation_code solution_mode people_count constraint_notes resolution_status overall_budget resolved_at".split(" ");

const q = (n) => '"' + n.replace(/"/g, '""') + '"';
const tableOf = (k) => k.split(".")[0];
const indexTable = (sql) => (sql.match(/ ON (?:ONLY )?public\.("?[\w]+"?)/i) || [])[1]?.replace(/"/g, "");

async function client() {
  const c = new pg.Client({ connectionString: env.TARGET_URL });
  await c.connect();
  return c;
}

async function runPasses(c, statements, label) {
  let pending = statements;
  for (let pass = 1; pending.length && pass <= 6; pass += 1) {
    const failed = [];
    for (const st of pending) {
      try {
        await c.query(st.sql);
      } catch (error) {
        if (/already exists/.test(error.message)) continue;
        failed.push({ ...st, error: error.message });
      }
    }
    console.log(`${label} passe ${pass} : ${pending.length - failed.length} ok, ${failed.length} en echec`);
    if (failed.length === pending.length) return failed;
    pending = failed;
  }
  return pending;
}

async function schema() {
  const c = await client();
  const { rows: [{ n }] } = await c.query("select count(*)::int as n from public.push_subscriptions");
  if (n !== 0) throw new Error(`push_subscriptions cible contient ${n} lignes : arret`);
  await c.query("drop table public.push_subscriptions cascade");

  for (const col of expressCols.filter((x) => EXPRESS_EXTRA.includes(x.c))) {
    await c.query(`alter table public.express_requests add column if not exists ${q(col.c)} ${col.ty}${col.def ? " default " + col.def : ""}${col.nn ? " not null" : ""}`);
  }

  const { rows: existingFns } = await c.query("select p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as k from pg_proc p where p.pronamespace = 'public'::regnamespace");
  const haveFn = new Set(existingFns.map((r) => r.k));
  const newFns = ddl.filter((r) => r.grp === 6 && !haveFn.has(r.k));
  const newFnNames = new Set(newFns.map((r) => r.k.split("(")[0]));
  const { rows: existingTypes } = await c.query("select typname from pg_type where typnamespace = 'public'::regnamespace");
  const haveType = new Set(existingTypes.map((r) => r.typname));

  const before = [
    ...ddl.filter((r) => r.grp === 1 && !haveType.has(r.k)),
    ...ddl.filter((r) => r.grp === 2 && NEW_TABLES.has(r.k)),
    ...ddl.filter((r) => r.grp === 3 && NEW_TABLES.has(tableOf(r.k))),
    ...ddl.filter((r) => r.grp === 5 && NEW_TABLES.has(indexTable(r.sql))),
    ...newFns,
    ...ddl.filter((r) => r.grp === 7 && r.k === "public_cash_feed"),
    ...ddl.filter((r) => r.grp === 9 && NEW_TABLES.has(r.k)),
    ...ddl.filter((r) => r.grp === 10 && NEW_TABLES.has(tableOf(r.k))),
    ...grants.filter((r) => r.grp === 11 && (NEW_TABLES.has(tableOf(r.k)) || tableOf(r.k) === "public_cash_feed")),
    ...revokes.filter((r) => haveFn.has(r.k) === false && newFns.some((f) => f.k === r.k)).map((r) => ({ grp: 12, ...r })),
    ...grants.filter((r) => r.grp === 12 && newFnNames.has(r.k.split(".")[0])),
  ];
  const left = await runPasses(c, before, "structure Supabase");
  for (const f of left) console.log("ECHEC", f.grp, f.k, "->", f.error.slice(0, 200));

  const ignoredTriggers = ddl.filter((r) => r.grp === 8 && !NEW_TABLES.has(tableOf(r.k)));
  const ignoredPolicies = ddl.filter((r) => r.grp === 10 && !NEW_TABLES.has(tableOf(r.k)));
  const { rows: tTrig } = await c.query("select c.relname || '.' || t.tgname as k from pg_trigger t join pg_class c on c.oid = t.tgrelid where c.relnamespace = 'public'::regnamespace and not t.tgisinternal");
  const { rows: tPol } = await c.query("select tablename || '.' || policyname as k from pg_policies where schemaname = 'public'");
  const haveTrig = new Set(tTrig.map((r) => r.k));
  const havePol = new Set(tPol.map((r) => r.k));
  console.log("A EXAMINER - triggers Supabase sur tables communes absents de Neon :", ignoredTriggers.filter((r) => !haveTrig.has(r.k)).map((r) => r.k).join(" ") || "aucun");
  console.log("A EXAMINER - policies Supabase sur tables communes absentes de Neon :", ignoredPolicies.filter((r) => !havePol.has(r.k)).map((r) => r.k).join(" ") || "aucune");
  fs.writeFileSync(new URL("./supabase-after-data.json", import.meta.url), JSON.stringify([
    ...ddl.filter((r) => r.grp === 4 && NEW_TABLES.has(tableOf(r.k))),
    ...ddl.filter((r) => r.grp === 8 && NEW_TABLES.has(tableOf(r.k))),
  ]));
  console.log(`structure Supabase : ${before.length} instructions, ${left.length} en echec, ${newFns.length} fonctions ajoutees`);
  await c.end();
}

async function insertRows(c, table, rows, conflict) {
  if (!rows.length) return 0;
  const { rows: cols } = await c.query(
    `select a.attname from pg_attribute a where a.attrelid = ('public.' || quote_ident($1))::regclass and a.attnum > 0 and not a.attisdropped and a.attgenerated = '' and a.attidentity <> 'a' order by a.attnum`,
    [table],
  );
  const present = cols.map((r) => r.attname).filter((name) => rows.some((row) => name in row));
  const list = present.map(q).join(", ");
  const result = await c.query(
    `insert into public.${q(table)} (${list}) select ${list} from json_populate_recordset(null::public.${q(table)}, $1::json)${conflict ? " on conflict do nothing" : ""}`,
    [JSON.stringify(rows)],
  );
  return result.rowCount;
}

async function data(path) {
  const backup = JSON.parse(fs.readFileSync(path, "utf8")).tables;
  const c = await client();
  const { rows: fks } = await c.query(`select conrelid::regclass::text as t, conname from pg_constraint where contype = 'f' and connamespace = 'public'::regnamespace and conrelid::regclass::text = any($1)`, [[...NEW_TABLES].map((t) => t)]);
  for (const fk of fks) await c.query(`alter table ${fk.t} drop constraint ${q(fk.conname)}`);
  for (const t of NEW_TABLES) {
    await c.query(`alter table public.${q(t)} disable trigger user`);
    await c.query(`truncate public.${q(t)} cascade`);
  }
  for (const t of NEW_TABLES) {
    const inserted = await insertRows(c, t, backup[t] || [], false);
    if ((backup[t] || []).length) console.log(`${t}: ${inserted}/${backup[t].length}`);
  }
  for (const t of MERGE_TABLES) console.log(`${t} (fusion) : +${await insertRows(c, t, backup[t] || [], true)} sur ${(backup[t] || []).length}`);
  for (const t of NEW_TABLES) await c.query(`alter table public.${q(t)} enable trigger user`);
  const after = JSON.parse(fs.readFileSync(new URL("./supabase-after-data.json", import.meta.url), "utf8"))
    .map((s) => ({ ...s, sql: s.grp === 8 ? s.sql.replace(/^CREATE TRIGGER/i, "CREATE OR REPLACE TRIGGER") : s.sql }));
  const left = await runPasses(c, after, "cles etrangeres + triggers Supabase");
  for (const f of left) console.log("ECHEC", f.k, "->", f.error.slice(0, 200));
  await c.end();
}

const [mode, arg] = process.argv.slice(2);
await ({ schema: () => schema(), data: () => data(arg) }[mode] || (() => console.log("mode: schema | data <fichier>")))();
