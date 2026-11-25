import fs from "node:fs"; import pg from "pg";
import { env } from "./common.mjs";
const c = new pg.Client({connectionString: env.TARGET_URL}); await c.connect();
const TMP = "zeyds_authenticated_tmp";
const before = (await c.query(`select
  (select count(*) from pg_class cl cross join lateral aclexplode(cl.relacl) a where a.grantee = $1::regrole) as tables,
  (select count(*) from pg_proc p cross join lateral aclexplode(p.proacl) a where a.grantee = $1::regrole) as fonctions,
  (select count(*) from pg_policy where $1::regrole = any(polroles)) as policies`, [TMP])).rows[0];
console.log("droits du role temporaire :", before);
const stmts = (await c.query(`
  select format('grant %s on table %I.%I to authenticated', string_agg(distinct a.privilege_type, ', '), n.nspname, cl.relname) as s
  from pg_class cl join pg_namespace n on n.oid = cl.relnamespace cross join lateral aclexplode(cl.relacl) a
  where a.grantee = $1::regrole and cl.relkind in ('r','v','m','p','S') group by n.nspname, cl.relname, cl.relkind
  union all
  select format('grant %s (%I) on table %I.%I to authenticated', string_agg(distinct a.privilege_type, ', '), at.attname, n.nspname, cl.relname)
  from pg_attribute at join pg_class cl on cl.oid = at.attrelid join pg_namespace n on n.oid = cl.relnamespace cross join lateral aclexplode(at.attacl) a
  where a.grantee = $1::regrole group by n.nspname, cl.relname, at.attname
  union all
  select format('grant execute on function %I.%I(%s) to authenticated', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid))
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace cross join lateral aclexplode(p.proacl) a where a.grantee = $1::regrole
  union all
  select format('grant %s on schema %I to authenticated', string_agg(distinct a.privilege_type, ', '), n.nspname)
  from pg_namespace n cross join lateral aclexplode(n.nspacl) a where a.grantee = $1::regrole group by n.nspname
  union all
  select format('alter policy %I on %I.%I to %s', p.polname, n.nspname, cl.relname,
    (select string_agg(case when r = 0 then 'public' when r = $1::regrole then 'authenticated' else quote_ident(pg_get_userbyid(r)) end, ', ') from unnest(p.polroles) r))
  from pg_policy p join pg_class cl on cl.oid = p.polrelid join pg_namespace n on n.oid = cl.relnamespace where $1::regrole = any(p.polroles)`, [TMP])).rows.map((r) => r.s);
await c.query("begin");
for (const s of stmts) await c.query(s);
await c.query(`revoke all on all tables in schema public from ${TMP}`);
await c.query(`revoke all on all functions in schema public from ${TMP}`);
await c.query(`revoke all on all functions in schema private from ${TMP}`);
await c.query(`revoke all on schema public, private from ${TMP}`);
await c.query(`drop owned by ${TMP}`);
await c.query(`drop role ${TMP}`);
await c.query("grant anon to authenticator");
await c.query("commit");
console.log(`${stmts.length} droits/policies transferes vers authenticated ; role temporaire supprime ; anon accorde a authenticator`);
const after = (await c.query(`select
  (select count(*) from pg_class cl cross join lateral aclexplode(cl.relacl) a where a.grantee = 'authenticated'::regrole) as tables,
  (select count(*) from pg_proc p cross join lateral aclexplode(p.proacl) a where a.grantee = 'authenticated'::regrole) as fonctions,
  (select count(*) from pg_policy where 'authenticated'::regrole = any(polroles)) as policies,
  has_schema_privilege('anon','auth','USAGE') as anon_usage_auth, has_function_privilege('anon','auth.uid()','EXECUTE') as anon_exec_uid,
  has_schema_privilege('authenticated','auth','USAGE') as auth_usage_auth,
  (select rolinherit from pg_roles where rolname='authenticated') as authenticated_inherit`)).rows[0];
console.log("droits du nouveau role authenticated :", after);
await c.end();
