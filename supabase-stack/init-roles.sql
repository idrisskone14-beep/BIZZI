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
