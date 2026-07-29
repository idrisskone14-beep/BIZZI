-- Bizzi V169 - Socle V2 technique pour paiements via agregateur
-- A executer dans Supabase SQL Editor avant de deployer le webhook payment-webhook.
-- Ce script ne remplace pas les validations admin existantes : il ajoute une trace fiable des callbacks paiement.

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null default 'aggregateur',
  payment_type text not null default 'provider_subscription',
  transaction_reference text not null,
  normalized_status text not null default 'pending',
  amount numeric not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.payment_webhook_events enable row level security;

create index if not exists idx_payment_webhook_events_reference
on public.payment_webhook_events(transaction_reference);

create index if not exists idx_payment_webhook_events_created
on public.payment_webhook_events(created_at desc);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_type text not null default 'provider_subscription',
  transaction_reference text not null unique,
  status text not null default 'pending',
  amount numeric not null default 0,
  method text not null default 'aggregateur',
  provider_phone text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_transactions enable row level security;

create index if not exists idx_payment_transactions_status
on public.payment_transactions(status, updated_at desc);

create index if not exists idx_payment_transactions_type
on public.payment_transactions(payment_type);

drop policy if exists "admin read payment transactions" on public.payment_transactions;
create policy "admin read payment transactions"
on public.payment_transactions for select
to authenticated
using (public.is_admin());

drop policy if exists "admin read payment webhook events" on public.payment_webhook_events;
create policy "admin read payment webhook events"
on public.payment_webhook_events for select
to authenticated
using (public.is_admin());

grant select on public.payment_transactions to authenticated;
grant select on public.payment_webhook_events to authenticated;

select
  'Bizzi V169 paiement webhook pret' as statut,
  count(*) as transactions_tracees
from public.payment_transactions;
