-- Bizzi V172 - Integrations externes pretes
-- A copier dans Supabase SQL Editor apres les scripts 71, 72 et 73.

create extension if not exists pgcrypto;

create table if not exists public.integration_health_checks (
  id uuid primary key default gen_random_uuid(),
  provider_type text not null,
  provider_name text not null default 'a_configurer',
  status text not null default 'pending',
  message text,
  payload jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists integration_health_checks_type_idx
  on public.integration_health_checks(provider_type, checked_at desc);

create table if not exists public.map_lookup_events (
  id uuid primary key default gen_random_uuid(),
  mode text not null default 'geocode',
  provider_name text not null default 'mapbox',
  query_text text,
  city text,
  distance_km numeric,
  status text not null default 'ok',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists map_lookup_events_created_idx
  on public.map_lookup_events(created_at desc);

create table if not exists public.field_test_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tester_name text,
  device_name text,
  network_type text,
  city text,
  status text not null default 'open',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.field_test_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.field_test_sessions(id) on delete cascade,
  scenario_name text not null,
  status text not null default 'todo',
  notes text,
  screenshot_url text,
  created_at timestamptz not null default now()
);

create index if not exists field_test_results_session_idx
  on public.field_test_results(session_id, created_at desc);

create table if not exists public.load_test_runs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  virtual_users integer not null default 0,
  total_actions integer not null default 0,
  status text not null default 'planned',
  result_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.monitoring_forwarding_events (
  id uuid primary key default gen_random_uuid(),
  provider_url text,
  status text not null default 'local_only',
  event_count integer not null default 0,
  response_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists monitoring_forwarding_events_created_idx
  on public.monitoring_forwarding_events(created_at desc);

alter table public.integration_health_checks enable row level security;
alter table public.map_lookup_events enable row level security;
alter table public.field_test_sessions enable row level security;
alter table public.field_test_results enable row level security;
alter table public.load_test_runs enable row level security;
alter table public.monitoring_forwarding_events enable row level security;

drop policy if exists "admin read integration health checks" on public.integration_health_checks;
create policy "admin read integration health checks"
  on public.integration_health_checks
  for select
  to authenticated
  using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read map lookup events" on public.map_lookup_events;
create policy "admin read map lookup events"
  on public.map_lookup_events
  for select
  to authenticated
  using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read field test sessions" on public.field_test_sessions;
create policy "admin read field test sessions"
  on public.field_test_sessions
  for select
  to authenticated
  using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read field test results" on public.field_test_results;
create policy "admin read field test results"
  on public.field_test_results
  for select
  to authenticated
  using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read load test runs" on public.load_test_runs;
create policy "admin read load test runs"
  on public.load_test_runs
  for select
  to authenticated
  using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read monitoring forwarding events" on public.monitoring_forwarding_events;
create policy "admin read monitoring forwarding events"
  on public.monitoring_forwarding_events
  for select
  to authenticated
  using (public.bizzi_payment_admin_allowed());

grant select on public.integration_health_checks to authenticated;
grant select on public.map_lookup_events to authenticated;
grant select on public.field_test_sessions to authenticated;
grant select on public.field_test_results to authenticated;
grant select on public.load_test_runs to authenticated;
grant select on public.monitoring_forwarding_events to authenticated;

insert into public.integration_health_checks(provider_type, provider_name, status, message, payload)
values
  ('push', 'vapid', 'pending', 'Cle VAPID a generer puis placer dans Supabase Secrets et config.js public.', '{}'::jsonb),
  ('payment', 'aggregateur', 'pending', 'Compte marchand et cles API a renseigner dans Supabase Secrets.', '{}'::jsonb),
  ('maps', 'mapbox', 'pending', 'MAPBOX_ACCESS_TOKEN a renseigner dans Supabase Secrets pour le geocodage serveur.', '{}'::jsonb),
  ('monitoring', 'external_provider', 'pending', 'BIZZI_MONITORING_FORWARD_URL a renseigner si un outil externe est choisi.', '{}'::jsonb)
on conflict do nothing;

select
  'Bizzi V172 integrations externes OK' as statut,
  'Tables de suivi, tests terrain, monitoring et cartographie pretes.' as detail;
