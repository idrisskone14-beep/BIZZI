-- Bizzi V174 - Rapports revenus et livraisons
-- A copier dans Supabase SQL Editor apres les scripts 71 a 76.

create extension if not exists pgcrypto;

create table if not exists public.admin_financial_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_type text not null default 'finance_delivery',
  report_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_financial_snapshots enable row level security;

drop policy if exists "admin read financial snapshots" on public.admin_financial_snapshots;
create policy "admin read financial snapshots"
  on public.admin_financial_snapshots
  for select
  to authenticated
  using (public.bizzi_payment_admin_allowed());

grant select on public.admin_financial_snapshots to authenticated;

create or replace function public.bizzi_column_exists(table_name text, column_name text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = $1
      and column_name = $2
  );
$$;

create or replace function public.bizzi_admin_finance_delivery_report()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_payments integer := 0;
  provider_revenue numeric := 0;
  pending_payments integer := 0;
  pending_revenue numeric := 0;
  delivery_total integer := 0;
  delivery_pending integer := 0;
  delivery_paid integer := 0;
  delivery_assigned integer := 0;
  delivery_commission numeric := 0;
  delivery_payout numeric := 0;
  jobs_pending integer := 0;
  jobs_revenue numeric := 0;
  events_pending integer := 0;
  events_revenue numeric := 0;
  payload jsonb;
begin
  if not public.bizzi_payment_admin_allowed() then
    raise exception 'admin_required';
  end if;

  if to_regclass('public.payments') is not null then
    execute 'select count(*), coalesce(sum(amount), 0) from public.payments where coalesce(status, '''') = ''approved''' into provider_payments, provider_revenue;
    execute 'select count(*), coalesce(sum(amount), 0) from public.payments where coalesce(status, '''') = ''pending''' into pending_payments, pending_revenue;
  end if;

  if to_regclass('public.delivery_requests') is not null then
    execute 'select count(*) from public.delivery_requests' into delivery_total;
    if public.bizzi_column_exists('delivery_requests', 'payment_status') then
      execute 'select count(*) from public.delivery_requests where coalesce(payment_status, '''') = ''pending''' into delivery_pending;
      execute 'select count(*) from public.delivery_requests where coalesce(payment_status, '''') = ''approved''' into delivery_paid;
    end if;
    if public.bizzi_column_exists('delivery_requests', 'status') then
      execute 'select count(*) from public.delivery_requests where coalesce(status, '''') = ''assigned''' into delivery_assigned;
    end if;
    if public.bizzi_column_exists('delivery_requests', 'bizzi_commission')
      and public.bizzi_column_exists('delivery_requests', 'payment_status') then
      execute 'select coalesce(sum(bizzi_commission), 0) from public.delivery_requests where coalesce(payment_status, '''') = ''approved''' into delivery_commission;
    end if;
    if public.bizzi_column_exists('delivery_requests', 'provider_payout')
      and public.bizzi_column_exists('delivery_requests', 'payment_status') then
      execute 'select coalesce(sum(provider_payout), 0) from public.delivery_requests where coalesce(payment_status, '''') = ''approved''' into delivery_payout;
    end if;
  end if;

  if to_regclass('public.job_offers') is not null then
    execute 'select count(*) from public.job_offers where coalesce(status, '''') = ''pending''' into jobs_pending;
    if public.bizzi_column_exists('job_offers', 'amount') and public.bizzi_column_exists('job_offers', 'payment_status') then
      execute 'select coalesce(sum(amount), 0) from public.job_offers where coalesce(payment_status, '''') = ''approved'' or coalesce(status, '''') = ''published''' into jobs_revenue;
    elsif public.bizzi_column_exists('job_offers', 'amount') then
      execute 'select coalesce(sum(amount), 0) from public.job_offers where coalesce(status, '''') = ''published''' into jobs_revenue;
    end if;
  end if;

  if to_regclass('public.event_promotions') is not null then
    execute 'select count(*) from public.event_promotions where coalesce(status, '''') = ''pending''' into events_pending;
    if public.bizzi_column_exists('event_promotions', 'amount') and public.bizzi_column_exists('event_promotions', 'payment_status') then
      execute 'select coalesce(sum(amount), 0) from public.event_promotions where coalesce(payment_status, '''') = ''approved'' or coalesce(status, '''') = ''published''' into events_revenue;
    elsif public.bizzi_column_exists('event_promotions', 'amount') then
      execute 'select coalesce(sum(amount), 0) from public.event_promotions where coalesce(status, '''') = ''published''' into events_revenue;
    end if;
  end if;

  payload := jsonb_build_object(
    'generated_at', now(),
    'provider_payments', jsonb_build_object(
      'approved_count', provider_payments,
      'approved_revenue', provider_revenue,
      'pending_count', pending_payments,
      'pending_revenue', pending_revenue
    ),
    'deliveries', jsonb_build_object(
      'total', delivery_total,
      'pending_payment', delivery_pending,
      'paid', delivery_paid,
      'assigned', delivery_assigned,
      'bizzi_commission', delivery_commission,
      'provider_payout', delivery_payout
    ),
    'jobs', jsonb_build_object(
      'pending', jobs_pending,
      'revenue', jobs_revenue
    ),
    'events', jsonb_build_object(
      'pending', events_pending,
      'revenue', events_revenue
    ),
    'total_known_revenue', provider_revenue + delivery_commission + jobs_revenue + events_revenue
  );

  insert into public.admin_financial_snapshots(report_type, report_payload)
  values ('finance_delivery_v174', payload);

  return payload;
end;
$$;

grant execute on function public.bizzi_admin_finance_delivery_report() to authenticated;

select
  'Bizzi V174 rapports revenus livraisons OK' as statut,
  'Appelez ensuite select public.bizzi_admin_finance_delivery_report(); depuis une session admin Bizzi.' as prochaine_action;
