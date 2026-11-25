// Phase "save" : sauvegarde les policies dependant du schema auth puis renomme auth -> auth_legacy.
// Phase "restore" : apres provisionnement Neon, recree ces policies et transfere les droits du role temporaire.
import fs from "node:fs"; import pg from "pg";
import { env } from "./common.mjs";
const c = new pg.Client({connectionString: env.TARGET_URL}); await c.connect();
const q = (n) => '"' + n.replace(/"/g, '""') + '"';
const mode = process.argv[2];
if (mode === "save") {
  const { rows } = await c.query(`select n.nspname as schemaname, cl.relname as tablename, p.polname as policyname, p.polpermissive as permissive, p.polcmd as cmd,
      array(select case when r = 0 then 'public' else pg_get_userbyid(r) end from unnest(p.polroles) r) as roles,
      pg_get_expr(p.polqual, p.polrelid) as qual, pg_get_expr(p.polwithcheck, p.polrelid) as with_check
    from pg_policy p join pg_class cl on cl.oid = p.polrelid join pg_namespace n on n.oid = cl.relnamespace
    where p.oid in (select d.objid from pg_depend d where d.classid = 'pg_policy'::regclass and d.refobjid in (select oid from pg_proc where pronamespace = 'auth'::regnamespace))`);
  fs.writeFileSync("./auth-policies.json", JSON.stringify(rows, null, 1));
  const { rows: fns } = await c.query(`select p.proname, pg_get_functiondef(p.oid) as def from pg_proc p where p.pronamespace = 'auth'::regnamespace`);
  fs.writeFileSync("./auth-legacy-functions.json", JSON.stringify(fns, null, 1));
  await c.query("alter schema auth rename to auth_legacy");
  console.log(`sauvegarde : ${rows.length} policies, ${fns.length} fonctions ; schema auth renomme en auth_legacy`);
}
if (mode === "restore") {
  const pols = JSON.parse(fs.readFileSync("./auth-policies.json", "utf8"));
  const { rows: authFns } = await c.query(`select proname from pg_proc where pronamespace = 'auth'::regnamespace`);
  const names = new Set(authFns.map((r) => r.proname));
  console.log("fonctions du nouveau schema auth :", [...names].sort().join(", "));
  if (!names.has("uid")) throw new Error("auth.uid() absent du schema Neon : arret");
  // auth.role() n existe pas chez Neon : aucune policy ne l utilise (verifie).
  const cmd = { r: "select", a: "insert", w: "update", d: "delete", "*": "all" };
  await c.query("begin");
  for (const p of pols) {
    const roleList = Array.isArray(p.roles) ? p.roles : String(p.roles).replace(/^{|}$/g, "").split(",").map((s) => s.replace(/^"|"$/g, ""));
    const roles = roleList.map((r) => (r === "zeyds_authenticated_tmp" ? "authenticated" : r)).map((r) => (r === "public" ? "public" : q(r))).join(", ");
    const fix = (s) => s && s.replace(/auth_legacy\./g, "auth.");
    await c.query(`drop policy ${q(p.policyname)} on ${q(p.schemaname)}.${q(p.tablename)}`);
    await c.query(`create policy ${q(p.policyname)} on ${q(p.schemaname)}.${q(p.tablename)} as ${p.permissive ? "permissive" : "restrictive"} for ${cmd[p.cmd]} to ${roles}`
      + (p.qual ? ` using (${fix(p.qual)})` : "") + (p.with_check ? ` with check (${fix(p.with_check)})` : ""));
  }
  await c.query("commit");
  console.log(`${pols.length} policies recreees sur le nouveau auth.uid()`);
}
await c.end();
