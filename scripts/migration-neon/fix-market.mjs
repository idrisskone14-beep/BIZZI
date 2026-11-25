import fs from "node:fs"; import pg from "pg";
import { env } from "./common.mjs";
const c = new pg.Client({connectionString: env.TARGET_URL}); await c.connect();
const { rows: [r] } = await c.query(`select pg_get_functiondef(p.oid) as d from pg_proc p where p.proname = 'process_market_expirations' and p.pronamespace = 'public'::regnamespace`);
// Sans JWT (connexion directe d'un serveur de confiance) = equivalent du service_role Supabase.
const fixed = r.d.replace("auth.role() <> 'service_role'", "coalesce(auth.jwt() ->> 'role', 'service_role') <> 'service_role'");
if (fixed === r.d) throw new Error("motif introuvable");
await c.query("begin"); await c.query(fixed); await c.query("drop schema auth_legacy cascade"); await c.query("commit");
console.log("process_market_expirations corrigee ; schema auth_legacy supprime");
await c.end();
