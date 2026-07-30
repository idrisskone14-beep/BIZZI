-- Roles required by PostgREST / Storage-API and by the app's RLS policies
do $$
begin
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  -- storage-api's migrations grant privileges to a role literally named
  -- "postgres" (Supabase's own hosted Postgres always has one). Managed
  -- providers like Neon don't create this role by default, so the
  -- "buckets-objects-grants" migration fails with "role postgres does
  -- not exist" unless we create a stand-in here.
  if not exists (select from pg_roles where rolname = 'postgres') then
    create role postgres nologin noinherit;
  end if;
end $$;

grant anon to current_user;
grant authenticated to current_user;
grant service_role to current_user;

-- Minimal auth schema stub (the app never calls Supabase Auth, but a few
-- historical RLS policies reference auth.uid() for a not-yet-used
-- provider self-service flow; this keeps those policies valid without
-- running a full auth server).
create schema if not exists auth;

create or replace function auth.uid() returns uuid
  language sql stable
  as $$ select null::uuid $$;

create or replace function auth.role() returns text
  language sql stable
  as $$ select 'anon'::text $$;
