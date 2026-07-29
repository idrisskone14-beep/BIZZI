-- Bizzi V148 - Tarification livraison par distance, heure et conditions
-- A executer dans Supabase SQL Editor apres le deploiement V148.
-- Ce script conserve la commission Bizzi 15% et ajoute la trace du calcul tarifaire.

create extension if not exists pgcrypto;

alter table public.delivery_requests
add column if not exists amount integer not null default 0,
add column if not exists currency text not null default 'FCFA',
add column if not exists commission_rate numeric not null default 0.15,
add column if not exists bizzi_commission integer not null default 0,
add column if not exists provider_payout integer not null default 0,
add column if not exists payment_method text,
add column if not exists transaction_reference text,
add column if not exists payment_status text not null default 'pending',
add column if not exists paid_at timestamptz,
add column if not exists payout_status text not null default 'pending',
add column if not exists distance_km numeric,
add column if not exists base_amount integer not null default 0,
add column if not exists suggested_amount integer not null default 0,
add column if not exists pricing_slot text not null default 'normal',
add column if not exists bad_weather boolean not null default false,
add column if not exists surcharge_rate numeric not null default 0,
add column if not exists pricing_breakdown text;

alter table public.delivery_requests
drop constraint if exists delivery_requests_payment_status_check;

alter table public.delivery_requests
add constraint delivery_requests_payment_status_check
check (payment_status in ('pending', 'approved', 'rejected', 'refunded', 'unpaid'));

alter table public.delivery_requests
drop constraint if exists delivery_requests_payout_status_check;

alter table public.delivery_requests
add constraint delivery_requests_payout_status_check
check (payout_status in ('pending', 'payable', 'paid', 'blocked'));

alter table public.delivery_requests
drop constraint if exists delivery_requests_pricing_slot_check;

alter table public.delivery_requests
add constraint delivery_requests_pricing_slot_check
check (pricing_slot in ('normal', 'morning_peak', 'evening_peak', 'night'));

create index if not exists idx_delivery_requests_payment_status
on public.delivery_requests(payment_status, created_at desc);

create index if not exists idx_delivery_requests_transaction_reference
on public.delivery_requests(transaction_reference);

create index if not exists idx_delivery_requests_distance
on public.delivery_requests(distance_km);

drop policy if exists "public create open delivery requests" on public.delivery_requests;
create policy "public create open delivery requests"
on public.delivery_requests for insert
to anon, authenticated
with check (
  status = 'open'
  and assigned_provider_id is null
  and pickup_address is not null
  and dropoff_address is not null
  and parcel_description is not null
  and amount >= 0
  and bizzi_commission >= 0
  and provider_payout >= 0
  and base_amount >= 0
  and suggested_amount >= 0
  and surcharge_rate >= 0
  and surcharge_rate <= 0.5
  and coalesce(distance_km, 0) >= 0
  and pricing_slot in ('normal', 'morning_peak', 'evening_peak', 'night')
  and payment_status in ('pending', 'unpaid')
);

create or replace function public.bizzi_approve_delivery_payment(p_delivery_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.delivery_requests
  set payment_status = 'approved',
      paid_at = coalesce(paid_at, now()),
      updated_at = now()
  where id = p_delivery_id
    and status in ('open', 'assigned');

  if not found then
    raise exception 'Livraison introuvable ou deja cloturee';
  end if;
end;
$$;

drop function if exists public.bizzi_accept_delivery_request(uuid, uuid, text, text);
create or replace function public.bizzi_accept_delivery_request(
  p_delivery_id uuid,
  p_provider_id uuid,
  p_provider_name text default null,
  p_provider_phone text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_record record;
begin
  select p.id, p.full_name, p.phone
    into provider_record
  from public.providers p
  join public.provider_services ps on ps.provider_id = p.id
  join public.services s on s.id = ps.service_id
  where p.id = p_provider_id
    and p.status = 'approved'
    and p.visibility_status in ('trial', 'active')
    and s.name in (
      'Bizzi Livraison',
      'Courses / achats à domicile',
      'Chauffeur',
      'Transport de marchandises',
      'Transport de colis international',
      'Conducteur moto-taxi',
      'Livreur de gaz en bouteille',
      'Livraison médicaments'
    )
  limit 1;

  if not found then
    raise exception 'Prestataire livraison non actif ou non compatible';
  end if;

  update public.delivery_requests
  set status = 'assigned',
      assigned_provider_id = provider_record.id,
      assigned_provider_name = coalesce(nullif(p_provider_name, ''), provider_record.full_name),
      assigned_provider_phone = coalesce(nullif(p_provider_phone, ''), provider_record.phone),
      accepted_at = coalesce(accepted_at, now()),
      updated_at = now()
  where id = p_delivery_id
    and status = 'open'
    and payment_status = 'approved';

  if not found then
    raise exception 'Livraison non payee, deja acceptee, cloturee ou introuvable';
  end if;
end;
$$;

drop function if exists public.bizzi_close_delivery_request(uuid);
create or replace function public.bizzi_close_delivery_request(p_delivery_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.delivery_requests
  set status = 'closed',
      payout_status = case
        when payment_status = 'approved' and assigned_provider_id is not null then 'payable'
        else payout_status
      end,
      closed_at = coalesce(closed_at, now()),
      updated_at = now()
  where id = p_delivery_id
    and status <> 'closed';

  if not found then
    raise exception 'Livraison introuvable ou deja cloturee';
  end if;
end;
$$;

revoke all on function public.bizzi_approve_delivery_payment(uuid) from public;
revoke all on function public.bizzi_accept_delivery_request(uuid, uuid, text, text) from public;
revoke all on function public.bizzi_close_delivery_request(uuid) from public;

grant execute on function public.bizzi_approve_delivery_payment(uuid) to authenticated;
grant execute on function public.bizzi_accept_delivery_request(uuid, uuid, text, text) to anon, authenticated;
grant execute on function public.bizzi_close_delivery_request(uuid) to authenticated;

select pg_notify('pgrst', 'reload schema');

select
  'Bizzi V148 tarification livraison installee' as message,
  count(*) as demandes_livraison,
  count(*) filter (where payment_status = 'approved') as livraisons_payees,
  coalesce(sum(bizzi_commission) filter (where payment_status = 'approved'), 0) as commission_bizzi,
  coalesce(avg(distance_km) filter (where distance_km is not null), 0) as distance_moyenne_km
from public.delivery_requests;
