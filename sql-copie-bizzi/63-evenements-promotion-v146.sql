-- Bizzi V146 - Promotion d'evenements sans billetterie interne
-- A executer dans Supabase SQL Editor.
--
-- Bizzi facture uniquement la visibilite organisateur.
-- Les billets restent vendus sur le lien officiel externe fourni par l'organisateur.

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
  venue text not null,
  city_name text not null default 'Toute la Cote d''Ivoire',
  category text not null default 'Autre evenement',
  poster_url text,
  ticket_price text,
  ticket_url text not null,
  contact_phone text,
  organizer_name text not null,
  plan_name text not null default 'Standard',
  amount integer not null default 100000,
  currency text not null default 'FCFA',
  payment_method text,
  transaction_reference text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'approved', 'rejected')),
  paid_at timestamptz,
  is_sponsored boolean not null default false,
  is_premium boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected', 'expired', 'archived')),
  published_at timestamptz,
  rejected_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_promotions
add column if not exists poster_url text,
add column if not exists ticket_price text,
add column if not exists paid_at timestamptz,
add column if not exists published_at timestamptz,
add column if not exists rejected_at timestamptz,
add column if not exists admin_note text,
add column if not exists is_sponsored boolean not null default false,
add column if not exists is_premium boolean not null default false;

alter table public.event_promotions enable row level security;

drop trigger if exists event_promotions_set_updated_at on public.event_promotions;
create trigger event_promotions_set_updated_at
before update on public.event_promotions
for each row execute function public.set_updated_at();

create index if not exists idx_event_promotions_status_payment_date
on public.event_promotions(status, payment_status, event_datetime);

create index if not exists idx_event_promotions_city_category
on public.event_promotions(city_name, category);

grant insert, select on public.event_promotions to anon, authenticated;
grant update on public.event_promotions to authenticated;

drop policy if exists "public submit event promotion" on public.event_promotions;
create policy "public submit event promotion"
on public.event_promotions for insert
to anon, authenticated
with check (
  status = 'pending'
  and payment_status = 'pending'
  and amount >= 100000
  and length(trim(coalesce(transaction_reference, ''))) > 0
  and length(trim(title)) > 0
  and length(trim(organizer_name)) > 0
  and length(trim(venue)) > 0
  and length(trim(city_name)) > 0
  and length(trim(ticket_url)) > 0
  and ticket_url ~* '^https?://'
);

drop policy if exists "public read published event promotions" on public.event_promotions;
create policy "public read published event promotions"
on public.event_promotions for select
to anon, authenticated
using (
  status = 'published'
  and payment_status = 'approved'
  and event_datetime >= now()
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
      paid_at = coalesce(ep.paid_at, now()),
      published_at = coalesce(ep.published_at, now()),
      updated_at = now()
  where ep.id = event_uuid
  returning
    ep.id,
    ep.title,
    ep.organizer_name,
    ep.status,
    ep.payment_status,
    ep.event_datetime
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
      payment_status = case when ep.payment_status = 'approved' then ep.payment_status else 'rejected' end,
      rejected_at = coalesce(ep.rejected_at, now()),
      updated_at = now()
  where ep.id = event_uuid
  returning
    ep.id,
    ep.title,
    ep.organizer_name,
    ep.status,
    ep.payment_status,
    ep.event_datetime
  into event_row;

  if event_row.id is null then
    raise exception 'Evenement introuvable: %', event_uuid;
  end if;

  return to_jsonb(event_row);
end;
$$;

revoke all on function public.admin_publish_event_promotion(uuid) from public;
revoke all on function public.admin_reject_event_promotion(uuid) from public;
grant execute on function public.admin_publish_event_promotion(uuid) to authenticated;
grant execute on function public.admin_reject_event_promotion(uuid) to authenticated;

drop view if exists public.public_event_promotions;

create or replace view public.public_event_promotions as
select
  ep.id,
  ep.title,
  ep.description,
  ep.event_datetime,
  ep.venue,
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
  ep.created_at,
  ep.updated_at
from public.event_promotions ep
where ep.status = 'published'
  and ep.payment_status = 'approved'
  and ep.event_datetime >= now();

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
  'evenements_promotion_v146_installe' as verification,
  count(*) filter (where status = 'pending') as evenements_en_attente,
  count(*) filter (where status = 'published' and payment_status = 'approved' and event_datetime >= now()) as evenements_publics
from public.event_promotions;
