// Export frais des donnees propres a Supabase (lecture seule), au format attendu par
// add-supabase.mjs, link-admins.mjs et verif-supabase.mjs.
// Prerequis : `npx supabase login` fait une fois sur ce poste.
// Usage : node export-supabase.mjs [dossier]   (defaut : backups/bascule-<date> a la racine du depot)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MERGE_TABLES, NEW_TABLES } from "./common.mjs";

const PROJECT_REF = "hqqppxnvorcnvksulhna";
const here = path.dirname(fileURLToPath(import.meta.url));
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = path.resolve(process.argv[2] || path.join(here, "..", "..", "backups", `bascule-${stamp}`));
fs.mkdirSync(outDir, { recursive: true });

const tables = [...NEW_TABLES, ...MERGE_TABLES];
const sql = `select json_build_object(
  'tables', json_build_object(${tables.map((t) => `'${t}', (select coalesce(json_agg(x), '[]'::json) from public."${t}" x)`).join(",\n    ")}),
  'auth_users', (select coalesce(json_agg(json_build_object('id', id, 'email', email, 'created_at', created_at, 'last_sign_in_at', last_sign_in_at)), '[]'::json) from auth.users),
  'storage_objects', (select coalesce(json_agg(json_build_object('bucket', bucket_id, 'name', name, 'size', metadata->>'size', 'created_at', created_at)), '[]'::json) from storage.objects)
) as data`;
const sqlFile = path.join(outDir, "export.sql");
fs.writeFileSync(sqlFile, sql);

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const raw = execFileSync(npx, ["--yes", "supabase@3.4.0", "db", "query", `--remote=${PROJECT_REF}`, "--read-only", "--output-format", "json", "--file", sqlFile], {
  encoding: "utf8",
  maxBuffer: 256 * 1024 * 1024,
  shell: process.platform === "win32",
  stdio: ["ignore", "pipe", "ignore"],
});
const parsed = JSON.parse(raw.slice(raw.indexOf("{")));
if (!parsed.rows?.[0]?.data) throw new Error(`Export Supabase impossible : ${JSON.stringify(parsed).slice(0, 300)}`);
const data = parsed.rows[0].data;
const file = path.join(outDir, "donnees.json");
fs.writeFileSync(file, JSON.stringify({ exported_at: new Date().toISOString(), project: PROJECT_REF, ...data }, null, 1));
fs.unlinkSync(sqlFile);

const counts = Object.entries(data.tables).filter(([, rows]) => rows.length).map(([t, rows]) => `${t}=${rows.length}`);
console.log(`export Supabase : ${file}`);
console.log(`  ${counts.join(" ")} | comptes=${data.auth_users.length} fichiers=${data.storage_objects.length}`);
