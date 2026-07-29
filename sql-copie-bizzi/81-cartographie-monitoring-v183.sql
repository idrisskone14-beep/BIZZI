-- Bizzi V183 - Cartographie Mapbox/OpenStreetMap et monitoring Sentry/Better Stack
-- A executer apres les scripts 72 et 74 si disponibles.
-- Ce script complete les tables sans effacer les donnees existantes.

create extension if not exists pgcrypto;

create table if not exists public.app_error_events (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'bizzi-web',
  message text not null,
  name text,
  url text,
  user_agent text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.app_error_events
add column if not exists severity text not null default 'error',
add column if not exists fingerprint text;

create index if not exists idx_app_error_events_severity_created
on public.app_error_events(severity, created_at desc);

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

alter table public.map_lookup_events
add column if not exists provider_mode text not null default 'auto',
add column if not exists approximated boolean not null default false,
add column if not exists from_label text,
add column if not exists to_label text;

create index if not exists idx_map_lookup_events_provider_created
on public.map_lookup_events(provider_name, created_at desc);

create index if not exists idx_map_lookup_events_status_created
on public.map_lookup_events(status, created_at desc);

create table if not exists public.monitoring_forwarding_events (
  id uuid primary key default gen_random_uuid(),
  provider_url text,
  status text not null default 'local_only',
  event_count integer not null default 0,
  response_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.monitoring_forwarding_events
add column if not exists provider_name text not null default 'custom';

create index if not exists idx_monitoring_forwarding_provider_created
on public.monitoring_forwarding_events(provider_name, created_at desc);

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

alter table public.app_error_events enable row level security;
alter table public.map_lookup_events enable row level security;
alter table public.monitoring_forwarding_events enable row level security;
alter table public.integration_health_checks enable row level security;

drop policy if exists "admin read app error events" on public.app_error_events;
create policy "admin read app error events"
on public.app_error_events for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read map lookup events" on public.map_lookup_events;
create policy "admin read map lookup events"
on public.map_lookup_events for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read monitoring forwarding events" on public.monitoring_forwarding_events;
create policy "admin read monitoring forwarding events"
on public.monitoring_forwarding_events for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read integration health checks" on public.integration_health_checks;
create policy "admin read integration health checks"
on public.integration_health_checks for select
to authenticated
using (public.bizzi_payment_admin_allowed());

grant select on public.app_error_events to authenticated;
grant select on public.map_lookup_events to authenticated;
grant select on public.monitoring_forwarding_events to authenticated;
grant select on public.integration_health_checks to authenticated;

insert into public.integration_health_checks(provider_type, provider_name, status, message, payload)
values
  (
    'maps',
    'mapbox_openstreetmap',
    'ready_to_configure',
    'Backend map-geocode pret : Mapbox si MAPBOX_ACCESS_TOKEN existe, OpenStreetMap en fallback, approximation en dernier recours.',
    '{"secrets":["MAPBOX_ACCESS_TOKEN","BIZZI_MAPS_PROVIDER","OPENSTREETMAP_USER_AGENT","OPENSTREETMAP_ROUTING_URL"],"recommended_provider":"auto"}'::jsonb
  ),
  (
    'monitoring',
    'sentry_better_stack',
    'ready_to_configure',
    'Backend monitoring pret : error-ingest collecte, monitoring-forwarder envoie vers Sentry, Better Stack/Logtail ou custom.',
    '{"secrets":["BIZZI_MONITORING_PROVIDER","BIZZI_SENTRY_DSN","BIZZI_MONITORING_FORWARD_URL","BIZZI_MONITORING_FORWARD_KEY"],"recommended_provider":"sentry_ou_better_stack"}'::jsonb
  )
on conflict do nothing;

select pg_notify('pgrst', 'reload schema');

select
  'Bizzi V183 cartographie et monitoring prets' as statut,
  (select count(*) from public.map_lookup_events) as recherches_cartographiques,
  (select count(*) from public.app_error_events) as erreurs_app,
  (select count(*) from public.monitoring_forwarding_events) as forwards_monitoring;
