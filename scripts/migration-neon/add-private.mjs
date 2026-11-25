import fs from "node:fs"; import pg from "pg";
import { env } from "./common.mjs";
const priv = JSON.parse(fs.readFileSync("./supabase-export/private.json","utf8")).rows[0].info;
const ddl = JSON.parse(fs.readFileSync("./supabase-export/ddl.json","utf8")).rows;
const grants = JSON.parse(fs.readFileSync("./supabase-export/grants.json","utf8")).rows;
const revokes = JSON.parse(fs.readFileSync("./supabase-export/revokes.json","utf8")).rows;
const c = new pg.Client({connectionString: env.TARGET_URL}); await c.connect();
await c.query("create schema if not exists private");
await c.query("grant usage on schema private to authenticated");
const todo = [...priv.functions.map(f=>f.sql),
  ...ddl.filter(r=>r.grp===6 && r.k.startsWith("transition_ride(")).map(r=>r.sql),
  ...revokes.filter(r=>r.k.startsWith("transition_ride(")).map(r=>r.sql),
  ...grants.filter(r=>r.grp===12 && r.k.startsWith("transition_ride.")).map(r=>r.sql)];
let ok=0; for (const s of todo) { try { await c.query(s); ok++; } catch(e) { console.log("ECHEC", s.slice(0,80), "->", e.message); } }
console.log(`private + transition_ride : ${ok}/${todo.length} ok`);
await c.end();
