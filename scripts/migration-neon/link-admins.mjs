// Relie les profils admin (admin_profiles.auth_user_id = ancien id Supabase) aux comptes Neon Auth,
// en passant par l'e-mail du compte Supabase (sauvegarde backups/.../donnees.json, champ auth_users).
// Rejouable : a relancer apres chaque recopie des donnees (copy-neon.mjs data + add-supabase.mjs data).
// Usage : node link-admins.mjs <chemin/donnees.json>
import fs from "node:fs";
import pg from "pg";

const env = Object.fromEntries(fs.readFileSync(new URL("./.env", import.meta.url), "utf8").split(/\r?\n/).filter(Boolean).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const backup = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const oldIdToEmail = Object.fromEntries(backup.auth_users.map((u) => [u.id, String(u.email || "").toLowerCase()]));

const c = new pg.Client({ connectionString: env.TARGET_URL });
await c.connect();
const { rows: users } = await c.query(`select id::text, lower(email) as email from neon_auth."user"`);
const emailToNewId = Object.fromEntries(users.map((u) => [u.email, u.id]));
const { rows: profiles } = await c.query("select id, auth_user_id::text, role from public.admin_profiles");
for (const p of profiles) {
  if (users.some((u) => u.id === p.auth_user_id)) {
    console.log(`${p.role} deja relie (${p.auth_user_id})`);
    continue;
  }
  const email = oldIdToEmail[p.auth_user_id];
  const newId = email && emailToNewId[email];
  if (!newId) {
    console.log(`${p.role} : aucun compte Neon Auth pour ${email || "ancien id inconnu " + p.auth_user_id}`);
    continue;
  }
  await c.query("update public.admin_profiles set auth_user_id = $1, updated_at = now() where id = $2", [newId, p.id]);
  console.log(`${p.role} ${email} -> ${newId}`);
}
await c.end();
