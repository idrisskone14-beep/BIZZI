-- Bizzi V269 : ventilation financière des commandes Food
-- À exécuter une seule fois dans l'éditeur SQL Supabase avant l'ouverture commerciale.

alter table public.delivery_requests
  add column if not exists food_place_id text,
  add column if not exists food_place_name text,
  add column if not exists food_item text,
  add column if not exists restaurant_amount numeric(12,2) not null default 0,
  add column if not exists restaurant_payout numeric(12,2) not null default 0,
  add column if not exists restaurant_payout_status text not null default 'not_applicable',
  add column if not exists restaurant_mobile_money_account text,
  add column if not exists delivery_amount numeric(12,2) not null default 0,
  add column if not exists food_order_total numeric(12,2) not null default 0;

alter table public.delivery_requests
  drop constraint if exists delivery_requests_restaurant_payout_status_check;

alter table public.delivery_requests
  add constraint delivery_requests_restaurant_payout_status_check
  check (restaurant_payout_status in ('not_applicable', 'payable_after_payment', 'payable', 'processing', 'paid', 'failed'));

create index if not exists idx_delivery_requests_food_v269
  on public.delivery_requests(food_place_id, restaurant_payout_status, created_at desc)
  where food_place_id is not null;

comment on column public.delivery_requests.food_order_total is
  'Total payé par le client : restaurant + livraison.';

comment on column public.delivery_requests.restaurant_payout is
  'Montant dû au restaurant, sans commission Bizzi sur le repas.';

comment on column public.delivery_requests.delivery_amount is
  'Montant de livraison sur lequel Bizzi prélève 15 pour cent.';
