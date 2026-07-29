-- Bizzi V184 - Coherence livraison
-- Objectif : stabiliser la lecture admin/client/livreur sans changer le modele commercial.
-- Ce script ne valide pas automatiquement les paiements en attente. Il securise les colonnes
-- et fournit un rapport simple pour voir les livraisons ouvertes, payees, assignees et bloquees.

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

update public.delivery_requests
set dispatch_status = 'not_dispatched'
where dispatch_status is null;

update public.delivery_requests
set payout_status = 'payable',
    updated_at = now()
where status in ('assigned', 'closed')
  and payment_status = 'approved'
  and assigned_provider_id is not null
  and payout_status = 'pending';

create index if not exists idx_delivery_requests_v184_ops
on public.delivery_requests(payment_status, dispatch_status, status, created_at desc);

create or replace view public.bizzi_delivery_coherence_v184 as
select
  count(*) filter (where status = 'open') as livraisons_ouvertes,
  count(*) filter (where status = 'open' and payment_status = 'approved') as livraisons_payees_ouvertes,
  count(*) filter (where status = 'open' and payment_status <> 'approved') as paiements_a_confirmer,
  count(*) filter (where status = 'open' and payment_status = 'approved' and dispatch_status = 'not_dispatched') as payees_a_dispatcher,
  count(*) filter (where status = 'open' and payment_status = 'approved' and dispatch_status in ('matched', 'dispatching')) as livreurs_alertes,
  count(*) filter (where status = 'open' and payment_status = 'approved' and dispatch_status = 'manual_review') as revue_manuelle,
  count(*) filter (where status = 'assigned') as livraisons_acceptees,
  count(*) filter (where status = 'closed') as livraisons_terminees,
  coalesce(sum(bizzi_commission) filter (where payment_status = 'approved'), 0) as commission_bizzi_approuvee,
  coalesce(sum(provider_payout) filter (where payment_status = 'approved'), 0) as part_livreur_a_suivre
from public.delivery_requests;

grant select on public.bizzi_delivery_coherence_v184 to authenticated;

select pg_notify('pgrst', 'reload schema');

select
  'Bizzi V184 coherence livraison prete' as message,
  *
from public.bizzi_delivery_coherence_v184;
