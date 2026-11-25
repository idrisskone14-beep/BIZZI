import fs from "node:fs"; import pg from "pg";
const env = Object.fromEntries(fs.readFileSync("./.env","utf8").split(/\r?\n/).filter(Boolean).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const b = JSON.parse(fs.readFileSync(process.argv[2],"utf8")).tables;
const c = new pg.Client({connectionString: env.TARGET_URL}); await c.connect();
const sbPs = b.platform_settings; const {rows: nePs} = await c.query("select * from public.platform_settings");
const keyCol = Object.keys(sbPs[0]).find(k=>/^(key|setting_key|name|id)$/.test(k));
for (const n of nePs) { const s = sbPs.find(x=>x[keyCol]===n[keyCol]); if (s) console.log("CONFLIT platform_settings", keyCol, "=", n[keyCol], "| Neon:", JSON.stringify(n.value ?? n), "| Supabase:", JSON.stringify(s.value ?? s)); }
const canon = (rows) => JSON.stringify(rows.map(r=>JSON.stringify(Object.keys(r).sort().map(k=>[k, r[k]===null?null:String(typeof r[k]==="object"?JSON.stringify(r[k]):r[k])]))).sort());
let same=0, diff=[];
for (const t of Object.keys(b).filter(t=>t.startsWith("cash_")||t.startsWith("situation")||["vehicle_categories","market_settings","ride_pricing_settings","recommendation_settings","push_subscriptions"].includes(t))) {
  const {rows} = await c.query(`select coalesce(json_agg(x), '[]'::json) as j from public.${t} x`);
  canon(rows[0].j)===canon(b[t]) ? same++ : diff.push(t);
}
console.log(`tables identiques champ par champ : ${same}, differentes : ${diff.join(" ")||"aucune"}`);
const {rows:[w]} = await c.query("select (select json_agg(row_to_json(x)) from public.cash_wallets x) as wallets, (select count(*) from public.cash_transactions) as nb_tx");
console.log("portefeuilles Neon:", JSON.stringify(w.wallets), "| Supabase:", JSON.stringify(b.cash_wallets));
await c.end();
