-- Bizzi V206 - Bizzi Food
-- Objectif : referencer restaurants, maquis, vendeuses de plats, fast-foods et traiteurs.
-- Bizzi ne vend pas les repas dans cette version : la fiche redirige vers WhatsApp / telephone.
--
-- A executer dans Supabase > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.food_places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text,
  contact_phone text not null,
  place_type text not null default 'Restaurant',
  main_specialty text not null,
  specialties text,
  city_name text not null,
  area text,
  address text,
  average_budget text,
  opening_hours text,
  delivery_available boolean not null default false,
  description text,
  photo_url text,
  rating numeric not null default 0,
  click_count integer not null default 0,
  contact_click_count integer not null default 0,
  status text not null default 'pending',
  verification_status text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.food_places
add column if not exists owner_name text,
add column if not exists place_type text not null default 'Restaurant',
add column if not exists main_specialty text,
add column if not exists specialties text,
add column if not exists city_name text,
add column if not exists area text,
add column if not exists address text,
add column if not exists average_budget text,
add column if not exists opening_hours text,
add column if not exists delivery_available boolean not null default false,
add column if not exists description text,
add column if not exists photo_url text,
add column if not exists rating numeric not null default 0,
add column if not exists click_count integer not null default 0,
add column if not exists contact_click_count integer not null default 0,
add column if not exists status text not null default 'pending',
add column if not exists verification_status text not null default 'none',
add column if not exists updated_at timestamptz not null default now();

alter table public.food_places
drop constraint if exists food_places_status_check;

alter table public.food_places
add constraint food_places_status_check
check (status in ('pending', 'published', 'active', 'rejected', 'archived'));

alter table public.food_places
drop constraint if exists food_places_verification_status_check;

alter table public.food_places
add constraint food_places_verification_status_check
check (verification_status in ('none', 'pending', 'verified', 'rejected'));

create index if not exists food_places_status_city_idx on public.food_places(status, city_name);
create index if not exists food_places_specialty_idx on public.food_places(main_specialty);
create index if not exists food_places_created_at_idx on public.food_places(created_at desc);

alter table public.food_places enable row level security;

drop policy if exists "public read published food places" on public.food_places;
create policy "public read published food places"
on public.food_places for select
to anon, authenticated
using (status in ('published', 'active'));

drop policy if exists "public submit food places" on public.food_places;
create policy "public submit food places"
on public.food_places for insert
to anon, authenticated
with check (
  status = 'pending'
  and length(trim(name)) >= 2
  and length(regexp_replace(contact_phone, '\D', '', 'g')) >= 8
  and length(trim(main_specialty)) >= 2
  and length(trim(city_name)) >= 2
);

grant select, update on public.food_places to authenticated;

drop policy if exists "admin full food places" on public.food_places;
create policy "admin full food places"
on public.food_places for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.admin_publish_food_place(food_uuid uuid)
returns public.food_places
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.food_places;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.food_places fp
  set
    status = 'published',
    verification_status = 'verified',
    updated_at = now()
  where fp.id = food_uuid
  returning * into result;

  if result.id is null then
    raise exception 'Adresse Food introuvable';
  end if;

  return result;
end;
$$;

create or replace function public.admin_reject_food_place(food_uuid uuid)
returns public.food_places
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.food_places;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.food_places fp
  set
    status = 'rejected',
    verification_status = 'rejected',
    updated_at = now()
  where fp.id = food_uuid
  returning * into result;

  if result.id is null then
    raise exception 'Adresse Food introuvable';
  end if;

  return result;
end;
$$;

revoke all on function public.admin_publish_food_place(uuid) from public;
revoke all on function public.admin_reject_food_place(uuid) from public;
grant execute on function public.admin_publish_food_place(uuid) to authenticated;
grant execute on function public.admin_reject_food_place(uuid) to authenticated;

create or replace view public.public_food_places as
select
  id,
  name,
  owner_name,
  contact_phone,
  place_type,
  main_specialty,
  specialties,
  city_name,
  area,
  address,
  average_budget,
  opening_hours,
  delivery_available,
  description,
  photo_url,
  rating,
  click_count,
  contact_click_count,
  status,
  verification_status,
  created_at,
  updated_at
from public.food_places
where status in ('published', 'active');

grant select on public.public_food_places to anon, authenticated;
grant insert on public.food_places to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('food-photos', 'food-photos', true)
on conflict (id) do update
set public = true;

drop policy if exists "public read food photos" on storage.objects;
create policy "public read food photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'food-photos');

drop policy if exists "public upload food photos" on storage.objects;
create policy "public upload food photos"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'food-photos');

notify pgrst, 'reload schema';

select
  'bizzi_food_v204_installe' as verification,
  count(*) as adresses_food,
  count(*) filter (where status in ('published', 'active')) as adresses_visibles
from public.food_places;
