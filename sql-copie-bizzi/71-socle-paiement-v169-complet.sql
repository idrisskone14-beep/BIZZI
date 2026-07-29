-- Bizzi V169 - Socle paiement complet et robuste
-- A executer dans Supabase SQL Editor si les scripts 69/70 ont echoue.
--
-- Ce script :
-- 1. cree les tables de trace paiement si elles n'existent pas ;
-- 2. cree une fonction admin robuste compatible avec admin_profiles/is_admin ;
-- 3. applique les politiques RLS dans le bon ordre.

create extension if not exists pgcrypto;

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

alter table public.payment_webhook_events enable row level security;
alter table public.payment_transactions enable row level security;

create index if not exists idx_payment_webhook_events_reference
on public.payment_webhook_events(transaction_reference);

create index if not exists idx_payment_webhook_events_created
on public.payment_webhook_events(created_at desc);

create index if not exists idx_payment_transactions_status
on public.payment_transactions(status, updated_at desc);

create index if not exists idx_payment_transactions_type
on public.payment_transactions(payment_type);

create or replace function public.bizzi_payment_admin_allowed()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean := false;
begin
  if auth.uid() is null then
    return false;
  end if;

  if to_regprocedure('public.is_admin()') is not null then
    begin
      execute 'select public.is_admin()' into allowed;
      if coalesce(allowed, false) then
        return true;
      end if;
    exception when others then
      allowed := false;
    end;
  end if;

  if to_regclass('public.admin_profiles') is not null then
    execute
      'select exists (
        select 1
        from public.admin_profiles
        where auth_user_id = auth.uid()
          and is_active = true
          and lower(coalesce(role, '''')) in (''admin'', ''owner'', ''super_admin'')
      )'
      into allowed;

    return coalesce(allowed, false);
  end if;

  return false;
end;
$$;

revoke all on function public.bizzi_payment_admin_allowed() from public;
grant execute on function public.bizzi_payment_admin_allowed() to authenticated;

drop policy if exists "admin read payment transactions" on public.payment_transactions;
create policy "admin read payment transactions"
on public.payment_transactions for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read payment webhook events" on public.payment_webhook_events;
create policy "admin read payment webhook events"
on public.payment_webhook_events for select
to authenticated
using (public.bizzi_payment_admin_allowed());

grant select on public.payment_transactions to authenticated;
grant select on public.payment_webhook_events to authenticated;

select
  'Bizzi V169 socle paiement complet OK' as statut,
  (select count(*) from public.payment_transactions) as transactions_tracees,
  (select count(*) from public.payment_webhook_events) as webhooks_traces;
