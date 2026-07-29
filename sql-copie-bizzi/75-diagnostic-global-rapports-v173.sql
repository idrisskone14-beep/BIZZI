-- Bizzi V173 - Diagnostic global et rapports admin simples
-- A copier dans Supabase SQL Editor apres les scripts 71 a 74.

create extension if not exists pgcrypto;

create table if not exists public.admin_report_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_type text not null default 'global',
  report_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_report_snapshots enable row level security;

drop policy if exists "admin read report snapshots" on public.admin_report_snapshots;
create policy "admin read report snapshots"
  on public.admin_report_snapshots
  for select
  to authenticated
  using (public.bizzi_payment_admin_allowed());

grant select on public.admin_report_snapshots to authenticated;

create or replace function public.bizzi_admin_global_report()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb := '{}'::jsonb;
  providers_total integer := 0;
  providers_visible integer := 0;
  providers_pending integer := 0;
  providers_without_service integer := 0;
  duplicate_phones integer := 0;
  payments_pending integer := 0;
  payments_approved integer := 0;
  deliveries_open integer := 0;
  deliveries_paid integer := 0;
  events_active integer := 0;
  events_pending integer := 0;
  jobs_active integer := 0;
  jobs_pending integer := 0;
  express_open integer := 0;
begin
  if not public.bizzi_payment_admin_allowed() then
    raise exception 'admin_required';
  end if;

  if to_regclass('public.providers') is not null then
    execute 'select count(*) from public.providers' into providers_total;
    execute 'select count(*) from public.providers where coalesce(status, '''') in (''approved'', ''active'') and coalesce(visibility_status, '''') not in (''hidden'', ''suspended'', ''expired_blurred'')' into providers_visible;
    execute 'select count(*) from public.providers where coalesce(status, '''') = ''pending''' into providers_pending;
    if to_regclass('public.provider_services') is not null then
      execute 'select count(*) from public.providers p where not exists (select 1 from public.provider_services ps where ps.provider_id = p.id)' into providers_without_service;
    end if;
    execute 'select count(*) from (select regexp_replace(coalesce(phone, whatsapp, ''''), ''[^0-9]'', '''', ''g'') as phone_key from public.providers group by 1 having count(*) > 1 and regexp_replace(coalesce(phone, whatsapp, ''''), ''[^0-9]'', '''', ''g'') <> '''') d' into duplicate_phones;
  end if;

  if to_regclass('public.payments') is not null then
    execute 'select count(*) from public.payments where coalesce(status, '''') = ''pending''' into payments_pending;
    execute 'select count(*) from public.payments where coalesce(status, '''') = ''approved''' into payments_approved;
  end if;

  if to_regclass('public.delivery_requests') is not null then
    execute 'select count(*) from public.delivery_requests where coalesce(status, '''') in (''open'', ''pending'')' into deliveries_open;
    execute 'select count(*) from public.delivery_requests where coalesce(payment_status, '''') = ''approved''' into deliveries_paid;
  end if;

  if to_regclass('public.event_promotions') is not null then
    execute 'select count(*) from public.event_promotions where coalesce(status, '''') = ''published'' and coalesce(end_datetime, event_datetime, now()) >= now()' into events_active;
    execute 'select count(*) from public.event_promotions where coalesce(status, '''') = ''pending''' into events_pending;
  end if;

  if to_regclass('public.job_offers') is not null then
    execute 'select count(*) from public.job_offers where coalesce(status, '''') = ''published''' into jobs_active;
    execute 'select count(*) from public.job_offers where coalesce(status, '''') = ''pending''' into jobs_pending;
  end if;

  if to_regclass('public.express_requests') is not null then
    execute 'select count(*) from public.express_requests where coalesce(status, '''') <> ''closed''' into express_open;
  end if;

  payload := jsonb_build_object(
    'generated_at', now(),
    'providers', jsonb_build_object(
      'total', providers_total,
      'visible', providers_visible,
      'pending', providers_pending,
      'without_service', providers_without_service,
      'duplicate_phone_groups', duplicate_phones
    ),
    'payments', jsonb_build_object(
      'pending', payments_pending,
      'approved', payments_approved
    ),
    'deliveries', jsonb_build_object(
      'open', deliveries_open,
      'paid', deliveries_paid
    ),
    'events', jsonb_build_object(
      'active', events_active,
      'pending', events_pending
    ),
    'jobs', jsonb_build_object(
      'active', jobs_active,
      'pending', jobs_pending
    ),
    'express_requests', jsonb_build_object(
      'open', express_open
    )
  );

  insert into public.admin_report_snapshots(report_type, report_payload)
  values ('global_v173', payload);

  return payload;
end;
$$;

grant execute on function public.bizzi_admin_global_report() to authenticated;

select
  'Bizzi V173 diagnostic global OK' as statut,
  'Appelez ensuite select public.bizzi_admin_global_report(); depuis une session admin Bizzi.' as prochaine_action;
