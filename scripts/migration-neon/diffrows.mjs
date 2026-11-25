import fs from "node:fs"; import pg from "pg";
const env = Object.fromEntries(fs.readFileSync("./.env","utf8").split(/\r?\n/).filter(Boolean).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const b = JSON.parse(fs.readFileSync(process.argv[2],"utf8")).tables;
const c = new pg.Client({connectionString: env.TARGET_URL}); await c.connect();
for (const t of ["cash_transactions","push_subscriptions","recommendation_settings"]) {
  const {rows} = await c.query(`select coalesce(json_agg(x), '[]'::json) as j from public.${t} x`);
  const n = rows[0].j; const pk = "id" in (b[t][0]||{}) ? "id" : Object.keys(b[t][0])[0];
  const fields = new Set(); let money = 0;
  for (const s of b[t]) { const r = n.find(x=>x[pk]===s[pk]); if(!r){console.log(t,"ligne manquante",s[pk]);continue;}
    for (const k of Object.keys(s)) { const a=JSON.stringify(s[k]), z=JSON.stringify(r[k]); if (a!==z) { fields.add(k); if (fields.size<=4 && !fields.has("_shown_"+k)) { fields.add("_shown_"+k); console.log(t, k, "Supabase:", a.slice(0,90), "| Neon:", z.slice(0,90)); } if (/amount|balance|delta|fee|commission/i.test(k) && Number(s[k])!==Number(r[k])) money++; } } }
  console.log(t, "champs differents:", [...fields].filter(f=>!f.startsWith("_shown_")).join(","), "| ecarts de montant reels:", money);
}
await c.end();
