-- Bizzi V170 - Backend admin, paiement checkout et surveillance erreurs
-- A executer apres le script 71.

create extension if not exists pgcrypto;

create table if not exists public.payment_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  transaction_reference text not null unique,
  payment_type text not null default 'provider_subscription',
  amount numeric not null default 0,
  currency text not null default 'FCFA',
  customer_phone text,
  status text not null default 'created',
  payment_url text,
  payload jsonb not null default '{}'::jsonb,
  aggregator_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target_id text,
  success boolean not null default false,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

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

alter table public.payment_checkout_sessions enable row level security;
alter table public.admin_audit_events enable row level security;
alter table public.app_error_events enable row level security;

create index if not exists idx_payment_checkout_sessions_reference
on public.payment_checkout_sessions(transaction_reference);

create index if not exists idx_payment_checkout_sessions_status
on public.payment_checkout_sessions(status, updated_at desc);

create index if not exists idx_admin_audit_events_created
on public.admin_audit_events(created_at desc);

create index if not exists idx_app_error_events_created
on public.app_error_events(created_at desc);

drop policy if exists "admin read payment checkout sessions" on public.payment_checkout_sessions;
create policy "admin read payment checkout sessions"
on public.payment_checkout_sessions for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read audit events" on public.admin_audit_events;
create policy "admin read audit events"
on public.admin_audit_events for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read app error events" on public.app_error_events;
create policy "admin read app error events"
on public.app_error_events for select
to authenticated
using (public.bizzi_payment_admin_allowed());

grant select on public.payment_checkout_sessions to authenticated;
grant select on public.admin_audit_events to authenticated;
grant select on public.app_error_events to authenticated;

select
  'Bizzi V170 backend admin paiement observabilite OK' as statut,
  (select count(*) from public.payment_checkout_sessions) as checkout_sessions,
  (select count(*) from public.admin_audit_events) as admin_audits,
  (select count(*) from public.app_error_events) as erreurs_tracees;
