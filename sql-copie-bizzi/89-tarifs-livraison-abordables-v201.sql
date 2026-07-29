-- Bizzi V201 - Tarifs livraison plus abordables + marge Bizzi 15%
-- Objectif : aligner Supabase sur la grille appliquee dans l'application.
-- Minimum livraison : 800 FCFA.
-- Commission Bizzi : 15%.
-- Urgence : +15%.
-- Heures de pointe : +15%.
-- Nuit : +25%.
-- Pluie / trafic difficile : +10%.
-- Apres 12 km : +250 FCFA par km supplementaire.

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
add column if not exists pricing_breakdown text,
add column if not exists dispatch_status text not null default 'not_dispatched',
add column if not exists dispatched_at timestamptz,
add column if not exists dispatch_attempts integer not null default 0,
add column if not exists dispatch_radius_km numeric not null default 5;

alter table public.delivery_requests
alter column dispatch_radius_km set default 5,
alter column commission_rate set default 0.15;

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

alter table public.delivery_requests
drop constraint if exists delivery_requests_dispatch_status_check;

alter table public.delivery_requests
add constraint delivery_requests_dispatch_status_check
check (dispatch_status in ('not_dispatched', 'dispatching', 'matched', 'expired', 'manual_review'));

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
  and amount >= 800
  and suggested_amount >= 800
  and base_amount >= 800
  and commission_rate = 0.15
  and bizzi_commission >= 0
  and provider_payout >= 0
  and surcharge_rate >= 0
  and surcharge_rate <= 0.35
  and coalesce(distance_km, 0) > 0
  and pricing_slot in ('normal', 'morning_peak', 'evening_peak', 'night')
  and payment_status in ('pending', 'unpaid', 'approved')
);

create or replace function public.bizzi_auto_validate_delivery_order(
  p_delivery_id uuid,
  p_transaction_reference text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  delivery_record record;
  dispatch_result jsonb := null;
  offers_created integer := 0;
  final_dispatch_status text := 'not_dispatched';
begin
  select *
    into delivery_record
  from public.delivery_requests
  where id = p_delivery_id
    and status = 'open'
  limit 1;

  if delivery_record.id is null then
    raise exception 'Livraison introuvable ou non ouverte';
  end if;

  if coalesce(delivery_record.amount, 0) < 800 then
    raise exception 'Montant livraison inferieur au minimum Bizzi';
  end if;

  if coalesce(nullif(p_transaction_reference, ''), coalesce(delivery_record.transaction_reference, '')) <> coalesce(delivery_record.transaction_reference, '') then
    raise exception 'Reference transaction livraison non conforme';
  end if;

  update public.delivery_requests
  set payment_status = 'approved',
      paid_at = coalesce(paid_at, now()),
      payout_status = case
        when assigned_provider_id is not null then 'payable'
        else 'pending'
      end,
      dispatch_status = case
        when dispatch_status in ('not_dispatched', 'manual_review') then 'dispatching'
        else dispatch_status
      end,
      updated_at = now()
  where id = p_delivery_id;

  if to_regprocedure('public.bizzi_dispatch_delivery_request(uuid,integer)') is not null then
    begin
      dispatch_result := public.bizzi_dispatch_delivery_request(p_delivery_id, 5);
      offers_created := coalesce((dispatch_result->>'offers_created')::integer, 0);
    exception
      when others then
        update public.delivery_requests
        set dispatch_status = 'dispatching',
            updated_at = now()
        where id = p_delivery_id;
    end;
  end if;

  select coalesce(dispatch_status, 'not_dispatched')
    into final_dispatch_status
  from public.delivery_requests
  where id = p_delivery_id;

  return jsonb_build_object(
    'ok', true,
    'delivery_id', p_delivery_id,
    'payment_status', 'approved',
    'dispatch_status', final_dispatch_status,
    'offers_created', offers_created,
    'minimum_amount', 800,
    'commission_rate', 0.15,
    'extra_km_price_after_12km', 250
  );
end;
$$;

revoke all on function public.bizzi_auto_validate_delivery_order(uuid, text) from public;
grant execute on function public.bizzi_auto_validate_delivery_order(uuid, text) to anon, authenticated;

select pg_notify('pgrst', 'reload schema');

select
  'Bizzi V201 tarifs livraison abordables installes' as message,
  count(*) as demandes_livraison,
  count(*) filter (where amount >= 800) as demandes_avec_minimum_ok,
  count(*) filter (where payment_status = 'approved') as livraisons_payees,
  coalesce(sum(bizzi_commission) filter (where payment_status = 'approved'), 0) as commission_bizzi
from public.delivery_requests;
