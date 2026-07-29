-- Bizzi V301 — Lieux d'exception, gratuité 30 jours et boosts
-- À exécuter une fois dans Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.exception_places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text not null,
  contact_phone text not null,
  city_name text not null,
  area text,
  address text,
  description text not null,
  photo_url text,
  plan_id text not null default 'free_30_days',
  plan_name text not null default 'Inscription gratuite 1 mois',
  amount integer not null default 0,
  currency text not null default 'FCFA',
  payment_method text,
  payment_reference text,
  payment_status text not null default 'approved',
  boost_days integer not null default 0,
  boost_starts_at timestamptz,
  boost_ends_at timestamptz,
  visibility_starts_at timestamptz,
  visibility_ends_at timestamptz,
  admin_grant boolean not null default false,
  status text not null default 'pending',
  click_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exception_places_plan_check check (plan_id in ('free_30_days', 'boost_1_day', 'boost_7_days', 'boost_30_days')),
  constraint exception_places_price_check check (
    (plan_id = 'free_30_days' and amount = 0 and boost_days = 0)
    or (plan_id = 'boost_1_day' and amount = 9900 and boost_days = 1)
    or (plan_id = 'boost_7_days' and amount = 24900 and boost_days = 7)
    or (plan_id = 'boost_30_days' and amount = 49900 and boost_days = 30)
  ),
  constraint exception_places_status_check check (status in ('pending', 'published', 'active', 'rejected', 'archived', 'expired')),
  constraint exception_places_payment_check check (payment_status in ('pending', 'approved', 'rejected'))
);

create index if not exists exception_places_public_order_idx
  on public.exception_places(status, boost_ends_at desc, visibility_ends_at desc, created_at desc);
create index if not exists exception_places_city_idx on public.exception_places(city_name, status);

alter table public.exception_places enable row level security;

revoke all on table public.exception_places from anon, authenticated;
grant select, insert on table public.exception_places to anon, authenticated;
grant update, delete on table public.exception_places to authenticated;

drop policy if exists "public read active exception places" on public.exception_places;
create policy "public read active exception places"
on public.exception_places for select
to anon, authenticated
using (status in ('published', 'active') and visibility_ends_at > now());

drop policy if exists "public submit exception places" on public.exception_places;
create policy "public submit exception places"
on public.exception_places for insert
to anon, authenticated
with check (
  status = 'pending'
  and admin_grant = false
  and visibility_starts_at is null
  and visibility_ends_at is null
  and boost_starts_at is null
  and boost_ends_at is null
  and ((plan_id = 'free_30_days' and payment_status = 'approved') or (plan_id <> 'free_30_days' and payment_status = 'pending'))
  and length(trim(name)) >= 2
  and length(trim(owner_name)) >= 2
  and length(regexp_replace(contact_phone, '\D', '', 'g')) >= 8
  and length(trim(city_name)) >= 2
  and length(trim(description)) >= 20
);

drop policy if exists "admin manages exception places" on public.exception_places;
create policy "admin manages exception places"
on public.exception_places for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.admin_publish_exception_place(place_uuid uuid)
returns public.exception_places
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.exception_places;
  activation_time timestamptz := now();
begin
  if not public.is_admin() then raise exception 'Compte admin Bizzi requis'; end if;

  update public.exception_places ep
  set status = 'published',
      payment_status = 'approved',
      visibility_starts_at = activation_time,
      visibility_ends_at = activation_time + interval '30 days',
      boost_starts_at = case when ep.boost_days > 0 then activation_time else null end,
      boost_ends_at = case when ep.boost_days > 0 then activation_time + make_interval(days => ep.boost_days) else null end,
      updated_at = activation_time
  where ep.id = place_uuid
  returning * into result;

  if result.id is null then raise exception 'Lieu introuvable'; end if;
  return result;
end;
$$;

create or replace function public.admin_add_free_exception_place(
  place_name text,
  responsible_name text,
  phone text,
  place_city text,
  place_area text,
  place_address text,
  place_description text,
  place_photo_url text default null
)
returns public.exception_places
language plpgsql
security definer
set search_path = public
as $$
declare result public.exception_places;
begin
  if not public.is_admin() then raise exception 'Compte admin Bizzi requis'; end if;
  insert into public.exception_places (
    name, owner_name, contact_phone, city_name, area, address, description, photo_url,
    plan_id, plan_name, amount, payment_status, boost_days, admin_grant, status,
    visibility_starts_at, visibility_ends_at
  ) values (
    place_name, responsible_name, phone, place_city, place_area, place_address, place_description, place_photo_url,
    'free_30_days', 'Offert par Bizzi', 0, 'approved', 0, true, 'published', now(), now() + interval '30 days'
  ) returning * into result;
  return result;
end;
$$;

revoke all on function public.admin_publish_exception_place(uuid) from public;
revoke all on function public.admin_add_free_exception_place(text,text,text,text,text,text,text,text) from public;
grant execute on function public.admin_publish_exception_place(uuid) to authenticated;
grant execute on function public.admin_add_free_exception_place(text,text,text,text,text,text,text,text) to authenticated;

drop view if exists public.public_exception_places;
create view public.public_exception_places
with (security_invoker = true)
as
select ep.*,
  (ep.payment_status = 'approved' and ep.boost_starts_at <= now() and ep.boost_ends_at > now()) as boost_active
from public.exception_places ep
where ep.status in ('published', 'active') and ep.visibility_ends_at > now();

revoke all on public.public_exception_places from public;
grant select on public.public_exception_places to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('exception-place-photos', 'exception-place-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "public read exception place photos" on storage.objects;
create policy "public read exception place photos"
on storage.objects for select to anon, authenticated
using (bucket_id = 'exception-place-photos');

drop policy if exists "public upload exception place photos" on storage.objects;
create policy "public upload exception place photos"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'exception-place-photos');

notify pgrst, 'reload schema';

select 'lieux_exception_v301_installe' as verification,
  count(*) as total,
  count(*) filter (where status in ('published', 'active') and visibility_ends_at > now()) as visibles
from public.exception_places;
