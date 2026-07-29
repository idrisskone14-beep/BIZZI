-- Bizzi V156 - Evenements geolocalises, boosts par ville et statistiques de clics
-- A executer dans Supabase SQL Editor apres la V146 si elle existe deja.
--
-- Bizzi ne vend pas les billets. La table sert uniquement a publier des evenements
-- et a facturer les options de visibilite geolocalisees.

grant usage on schema public to anon, authenticated;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.event_promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_datetime timestamptz not null,
  end_datetime timestamptz,
  venue text not null,
  area text,
  venue_address text,
  latitude double precision,
  longitude double precision,
  visibility_radius_km numeric not null default 25,
  city_name text not null default 'Abidjan',
  category text not null default 'Autre evenement',
  poster_url text,
  ticket_price text,
  ticket_url text not null,
  contact_phone text,
  organizer_name text not null,
  plan_name text not null default 'Standard',
  amount integer not null default 0,
  currency text not null default 'FCFA',
  payment_method text,
  transaction_reference text,
  payment_status text not null default 'approved' check (payment_status in ('pending', 'approved', 'rejected')),
  paid_at timestamptz,
  is_sponsored boolean not null default false,
  is_premium boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected', 'expired', 'archived')),
  published_at timestamptz,
  rejected_at timestamptz,
  admin_note text,
  click_count integer not null default 0,
  ticket_click_count integer not null default 0,
  contact_click_count integer not null default 0,
  detail_view_count integer not null default 0,
  stats_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_promotions
add column if not exists end_datetime timestamptz,
add column if not exists area text,
add column if not exists venue_address text,
add column if not exists latitude double precision,
add column if not exists longitude double precision,
add column if not exists visibility_radius_km numeric not null default 25,
add column if not exists click_count integer not null default 0,
add column if not exists ticket_click_count integer not null default 0,
add column if not exists contact_click_count integer not null default 0,
add column if not exists detail_view_count integer not null default 0,
add column if not exists stats_sent_at timestamptz;

update public.event_promotions
set end_datetime = coalesce(end_datetime, event_datetime + interval '1 day')
where end_datetime is null;

update public.event_promotions
set amount = 0,
    payment_status = case when status = 'pending' then 'approved' else payment_status end
where plan_name = 'Standard'
  and coalesce(amount, 0) >= 100000;

alter table public.event_promotions
alter column end_datetime set not null,
alter column amount set default 0,
alter column visibility_radius_km set default 25,
alter column payment_status set default 'approved';

alter table public.event_promotions
drop constraint if exists event_promotions_dates_check,
add constraint event_promotions_dates_check check (end_datetime > event_datetime);

alter table public.event_promotions
drop constraint if exists event_promotions_visibility_radius_check,
add constraint event_promotions_visibility_radius_check check (visibility_radius_km between 1 and 300);

alter table public.event_promotions
drop constraint if exists event_promotions_gps_pair_check,
add constraint event_promotions_gps_pair_check check (
  (latitude is null and longitude is null)
  or (
    latitude between -90 and 90
    and longitude between -180 and 180
  )
);

alter table public.event_promotions enable row level security;

drop trigger if exists event_promotions_set_updated_at on public.event_promotions;
create trigger event_promotions_set_updated_at
before update on public.event_promotions
for each row execute function public.set_updated_at();

create index if not exists idx_event_promotions_status_payment_end
on public.event_promotions(status, payment_status, end_datetime);

create index if not exists idx_event_promotions_city_category_end
on public.event_promotions(city_name, category, end_datetime);

create index if not exists idx_event_promotions_boost_clicks
on public.event_promotions(is_premium, is_sponsored, click_count);

grant insert, select on public.event_promotions to anon, authenticated;
grant update on public.event_promotions to authenticated;

drop policy if exists "public submit event promotion" on public.event_promotions;
create policy "public submit event promotion"
on public.event_promotions for insert
to anon, authenticated
with check (
  status = 'pending'
  and length(trim(title)) > 0
  and length(trim(organizer_name)) > 0
  and length(trim(venue)) > 0
  and length(trim(city_name)) > 0
  and length(trim(coalesce(area, ''))) > 0
  and length(trim(coalesce(venue_address, ''))) > 0
  and length(trim(ticket_url)) > 0
  and ticket_url ~* '^https?://'
  and end_datetime > event_datetime
  and visibility_radius_km between 1 and 300
  and (
    (
      plan_name = 'Standard'
      and amount = 0
      and payment_status = 'approved'
      and is_sponsored = false
      and is_premium = false
    )
    or (
      plan_name in ('Boost', 'Premium')
      and amount >= 150000
      and payment_status = 'pending'
      and length(trim(coalesce(transaction_reference, ''))) > 0
    )
  )
);

drop policy if exists "public read published event promotions" on public.event_promotions;
create policy "public read published event promotions"
on public.event_promotions for select
to anon, authenticated
using (
  status = 'published'
  and payment_status = 'approved'
  and end_datetime >= now()
);

drop policy if exists "admin full event promotions" on public.event_promotions;
create policy "admin full event promotions"
on public.event_promotions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.admin_publish_event_promotion(event_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  event_row record;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.event_promotions ep
  set status = 'published',
      payment_status = 'approved',
      paid_at = case when ep.amount > 0 then coalesce(ep.paid_at, now()) else ep.paid_at end,
      published_at = coalesce(ep.published_at, now()),
      updated_at = now()
  where ep.id = event_uuid
  returning
    ep.id,
    ep.title,
    ep.organizer_name,
    ep.status,
    ep.payment_status,
    ep.event_datetime,
    ep.end_datetime
  into event_row;

  if event_row.id is null then
    raise exception 'Evenement introuvable: %', event_uuid;
  end if;

  return to_jsonb(event_row);
end;
$$;

create or replace function public.admin_reject_event_promotion(event_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  event_row record;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.event_promotions ep
  set status = 'rejected',
      payment_status = case when ep.payment_status = 'approved' and ep.amount = 0 then ep.payment_status else 'rejected' end,
      rejected_at = coalesce(ep.rejected_at, now()),
      updated_at = now()
  where ep.id = event_uuid
  returning
    ep.id,
    ep.title,
    ep.organizer_name,
    ep.status,
    ep.payment_status,
    ep.event_datetime,
    ep.end_datetime
  into event_row;

  if event_row.id is null then
    raise exception 'Evenement introuvable: %', event_uuid;
  end if;

  return to_jsonb(event_row);
end;
$$;

create or replace function public.record_event_promotion_click(event_uuid uuid, click_kind text default 'view')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  event_row record;
begin
  update public.event_promotions ep
  set click_count = coalesce(ep.click_count, 0) + 1,
      ticket_click_count = coalesce(ep.ticket_click_count, 0) + case when click_kind = 'ticket' then 1 else 0 end,
      contact_click_count = coalesce(ep.contact_click_count, 0) + case when click_kind = 'contact' then 1 else 0 end,
      detail_view_count = coalesce(ep.detail_view_count, 0) + case when click_kind = 'detail' then 1 else 0 end,
      updated_at = now()
  where ep.id = event_uuid
    and ep.status = 'published'
  returning
    ep.id,
    ep.click_count,
    ep.ticket_click_count,
    ep.contact_click_count,
    ep.detail_view_count
  into event_row;

  if event_row.id is null then
    return jsonb_build_object('updated', false);
  end if;

  return jsonb_build_object(
    'updated', true,
    'id', event_row.id,
    'click_count', event_row.click_count,
    'ticket_click_count', event_row.ticket_click_count,
    'contact_click_count', event_row.contact_click_count,
    'detail_view_count', event_row.detail_view_count
  );
end;
$$;

revoke all on function public.admin_publish_event_promotion(uuid) from public;
revoke all on function public.admin_reject_event_promotion(uuid) from public;
revoke all on function public.record_event_promotion_click(uuid, text) from public;

grant execute on function public.admin_publish_event_promotion(uuid) to authenticated;
grant execute on function public.admin_reject_event_promotion(uuid) to authenticated;
grant execute on function public.record_event_promotion_click(uuid, text) to anon, authenticated;

drop view if exists public.public_event_promotions;

create or replace view public.public_event_promotions as
select
  ep.id,
  ep.title,
  ep.description,
  ep.event_datetime,
  ep.end_datetime,
  ep.venue,
  ep.area,
  ep.venue_address,
  ep.latitude,
  ep.longitude,
  ep.visibility_radius_km,
  ep.city_name,
  ep.category,
  ep.poster_url,
  ep.ticket_price,
  ep.ticket_url,
  ep.contact_phone,
  ep.organizer_name,
  ep.plan_name,
  ep.amount,
  ep.currency,
  ep.payment_status,
  ep.is_sponsored,
  ep.is_premium,
  ep.status,
  ep.click_count,
  ep.ticket_click_count,
  ep.contact_click_count,
  ep.detail_view_count,
  ep.stats_sent_at,
  ep.created_at,
  ep.updated_at
from public.event_promotions ep
where ep.status = 'published'
  and ep.payment_status = 'approved'
  and ep.end_datetime >= now();

grant select on public.public_event_promotions to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('event-posters', 'event-posters', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read event posters" on storage.objects;
create policy "public read event posters"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'event-posters');

drop policy if exists "public upload event posters" on storage.objects;
create policy "public upload event posters"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'event-posters');

notify pgrst, 'reload schema';

select
  'evenements_geolocalises_v156_installe' as verification,
  count(*) filter (where status = 'pending') as evenements_en_attente,
  count(*) filter (where status = 'published' and payment_status = 'approved' and end_datetime >= now()) as evenements_publics,
  count(*) filter (where amount = 0 and plan_name = 'Standard') as evenements_standard_gratuits
from public.event_promotions;
