-- Bizzi V181 - Auto-validation des commandes livraison
-- Objectif : une livraison validee par le client devient automatiquement payee/dispatchable.
-- Le livreur disponible ou proche reste le seul a accepter la mission.
-- A executer apres le socle livraison 62 et, idealement, apres le dispatch 73.

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
add column if not exists dispatch_status text not null default 'not_dispatched',
add column if not exists dispatched_at timestamptz,
add column if not exists dispatch_attempts integer not null default 0,
add column if not exists dispatch_radius_km numeric not null default 8;

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
drop constraint if exists delivery_requests_dispatch_status_check;

alter table public.delivery_requests
add constraint delivery_requests_dispatch_status_check
check (dispatch_status in ('not_dispatched', 'dispatching', 'matched', 'expired', 'manual_review'));

create index if not exists idx_delivery_requests_auto_payment_status
on public.delivery_requests(payment_status, status, created_at desc);

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

  if coalesce(delivery_record.amount, 0) < 500 then
    raise exception 'Montant livraison invalide';
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
      updated_at = now()
  where id = p_delivery_id;

  if to_regprocedure('public.bizzi_dispatch_delivery_request(uuid,integer)') is not null then
    begin
      dispatch_result := public.bizzi_dispatch_delivery_request(p_delivery_id, 5);
      offers_created := coalesce((dispatch_result->>'offers_created')::integer, 0);
    exception
      when others then
        update public.delivery_requests
        set dispatch_status = 'manual_review',
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
    'offers_created', offers_created
  );
end;
$$;

revoke all on function public.bizzi_auto_validate_delivery_order(uuid, text) from public;
grant execute on function public.bizzi_auto_validate_delivery_order(uuid, text) to anon, authenticated;

create or replace function public.bizzi_auto_validate_delivery_order_tg()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.bizzi_auto_validate_delivery_order(new.id, new.transaction_reference);
  return new;
exception
  when others then
    return new;
end;
$$;

drop trigger if exists trg_bizzi_auto_validate_delivery_order on public.delivery_requests;

create trigger trg_bizzi_auto_validate_delivery_order
after insert on public.delivery_requests
for each row
execute function public.bizzi_auto_validate_delivery_order_tg();

select pg_notify('pgrst', 'reload schema');

select
  'Bizzi V181 auto-validation livraison installee' as message,
  count(*) filter (where payment_status = 'approved') as livraisons_deja_validees,
  count(*) filter (where status = 'open' and payment_status = 'approved') as livraisons_ouvertes_payees
from public.delivery_requests;
