-- Zeyds V305 - ZEYDS CASH : schema (missions remunerees, solutions,
-- ledger financier, wallet, credits, avis, litiges, notifications).
--
-- A executer sur SUPABASE (SQL Editor), PAS sur Neon. Contrairement au
-- systeme de propositions de services (105/109, qui vit sur Neon car ce
-- sont des echanges non-financiers entre telephones auto-declares), Cash
-- est un systeme financier : il a besoin d'un admin reellement authentifie
-- (is_admin()/is_super_admin(), qui dependent de auth.uid() et n'ont donc
-- de sens que sur Supabase ou l'admin a une vraie session Supabase Auth),
-- et d'une atomicite reelle pour le ledger (impossible entre deux Postgres
-- physiquement separes). Le frontend cible directement l'URL Supabase pour
-- ce module (comme js/push-client.js le fait deja pour les push), au lieu
-- de passer par activeRestBaseUrl() qui route vers Neon par defaut.
--
-- Identite : ni le demandeur ni le solveur n'ont de vraie session Supabase
-- Auth (meme limite que le reste de la plateforme - voir 109). L'ownership
-- des actions utilisateur est verifiee cote serveur par numero de telephone
-- normalise (bizzi_normalize_phone_digits, deja utilise par 105/109), pas
-- par RLS/auth.uid(). Toutes les tables de base sont verrouillees (revoke
-- all) : l'unique porte d'entree est les RPC security definer de
-- 111-zeyds-cash-rpc-v305.sql, plus une vue publique restreinte pour le feed.

-- 1. Missions ---------------------------------------------------------------

create table if not exists public.cash_missions (
  id uuid primary key default gen_random_uuid(),
  requester_phone text not null,
  requester_name text not null,
  title text not null,
  description text,
  category text not null default 'Autre',
  area text not null default 'Toute la ville',
  attachments jsonb not null default '[]'::jsonb,
  deadline_type text not null default 'cette_semaine'
    check (deadline_type = any(array['aujourd_hui', 'demain', 'cette_semaine', 'urgent', 'date_personnalisee'])),
  deadline_at timestamptz,
  reward_amount numeric not null check (reward_amount >= 0),
  service_budget_hint numeric,
  status text not null default 'draft'
    check (status = any(array[
      'draft', 'payment_pending', 'published', 'solution_selected',
      'in_progress', 'completion_pending', 'completed',
      'expired', 'disputed', 'cancelled'
    ])),
  secured boolean not null default false,
  selected_solution_id uuid,
  completion_pending_at timestamptz,
  reminder_stage integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists idx_cash_missions_status on public.cash_missions(status, created_at desc);
create index if not exists idx_cash_missions_requester on public.cash_missions(requester_phone);
create index if not exists idx_cash_missions_expiry on public.cash_missions(status, expires_at) where status in ('published', 'solution_selected', 'in_progress');

alter table public.cash_missions enable row level security;
revoke all on public.cash_missions from anon, authenticated;

-- 2. Solutions ----------------------------------------------------------------

create table if not exists public.cash_solutions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.cash_missions(id) on delete cascade,
  solver_phone text not null,
  solver_name text not null,
  description text not null,
  attachments jsonb not null default '[]'::jsonb,
  contact text,
  price_hint numeric,
  availability text,
  status text not null default 'pending'
    check (status = any(array['pending', 'selected', 'rejected', 'withdrawn'])),
  submitted_at timestamptz not null default now(),
  selected_at timestamptz
);

create index if not exists idx_cash_solutions_mission on public.cash_solutions(mission_id, status);
create index if not exists idx_cash_solutions_solver on public.cash_solutions(solver_phone);

alter table public.cash_solutions enable row level security;
revoke all on public.cash_solutions from anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cash_missions_selected_solution_fk'
  ) then
    alter table public.cash_missions
      add constraint cash_missions_selected_solution_fk
      foreign key (selected_solution_id) references public.cash_solutions(id) on delete set null;
  end if;
end $$;

-- 3. Ledger financier (append-only) -------------------------------------------

create table if not exists public.cash_transactions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.cash_missions(id) on delete set null,
  user_phone text,
  type text not null
    check (type = any(array[
      'mission_escrow', 'reward_payout', 'commission',
      'credit_grant', 'credit_redeem', 'refund'
    ])),
  amount numeric not null,
  status text not null default 'pending'
    check (status = any(array['pending', 'confirmed', 'rejected'])),
  payment_reference text,
  payment_method text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_cash_transactions_payment_ref
  on public.cash_transactions(payment_reference) where payment_reference is not null;

-- Idempotence du versement de recompense : un seul reward_payout confirme
-- par mission, quel que soit le nombre d'appels (rejeu, double-clic, retry
-- reseau) de cash_distribute_reward.
create unique index if not exists idx_cash_transactions_reward_once
  on public.cash_transactions(mission_id) where type = 'reward_payout' and status = 'confirmed';

create index if not exists idx_cash_transactions_user on public.cash_transactions(user_phone, created_at desc);
create index if not exists idx_cash_transactions_mission on public.cash_transactions(mission_id);

alter table public.cash_transactions enable row level security;
revoke all on public.cash_transactions from anon, authenticated;

-- 4. Wallet (solde derive, jamais ecrit directement) --------------------------

create table if not exists public.cash_wallets (
  user_phone text primary key,
  balance numeric not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.cash_wallets enable row level security;
revoke all on public.cash_wallets from anon, authenticated;

-- Seuls les gains (reward_payout) alimentent le solde wallet affiche a
-- l'utilisateur. L'escrow (argent qui quitte le demandeur, retenu par la
-- plateforme) et les credits (suivis a part dans cash_credits) ne comptent
-- pas dans ce solde : voir section 18 vs 19 de la demande produit.
create or replace function public.cash_apply_wallet_delta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'confirmed' and new.user_phone is not null and new.type = 'reward_payout' then
    insert into public.cash_wallets (user_phone, balance, updated_at)
    values (new.user_phone, new.amount, now())
    on conflict (user_phone) do update
    set balance = public.cash_wallets.balance + excluded.balance,
        updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists cash_transactions_wallet_delta on public.cash_transactions;
create trigger cash_transactions_wallet_delta
after insert on public.cash_transactions
for each row execute function public.cash_apply_wallet_delta();

-- 5. Credits ZEYDS Cash (mission expiree sans solution retenue) ---------------

create table if not exists public.cash_credits (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  source_mission_id uuid references public.cash_missions(id) on delete set null,
  initial_amount numeric not null check (initial_amount >= 0),
  remaining_amount numeric not null check (remaining_amount >= 0),
  status text not null default 'active'
    check (status = any(array['active', 'consumed', 'expired'])),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_cash_credits_user on public.cash_credits(user_phone, status);

alter table public.cash_credits enable row level security;
revoke all on public.cash_credits from anon, authenticated;

-- 6. Avis / reputation solveur -------------------------------------------------

create table if not exists public.cash_reviews (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.cash_missions(id) on delete cascade,
  reviewer_phone text not null,
  reviewed_phone text not null,
  rating integer not null check (rating between 1 and 5),
  speed_rating integer check (speed_rating between 1 and 5),
  reliability_rating integer check (reliability_rating between 1 and 5),
  quality_rating integer check (quality_rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (mission_id, reviewer_phone)
);

alter table public.cash_reviews enable row level security;
revoke all on public.cash_reviews from anon, authenticated;

create table if not exists public.cash_solver_stats (
  user_phone text primary key,
  average_rating numeric not null default 0,
  review_count integer not null default 0,
  missions_won integer not null default 0,
  missions_completed integer not null default 0,
  dispute_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.cash_solver_stats enable row level security;
revoke all on public.cash_solver_stats from anon, authenticated;

create or replace function public.cash_refresh_solver_stats(p_user_phone text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.cash_solver_stats (user_phone, average_rating, review_count, updated_at)
  values (
    p_user_phone,
    coalesce((select round(avg(rating)::numeric, 1) from public.cash_reviews where reviewed_phone = p_user_phone), 0),
    coalesce((select count(*) from public.cash_reviews where reviewed_phone = p_user_phone), 0),
    now()
  )
  on conflict (user_phone) do update
  set average_rating = excluded.average_rating,
      review_count = excluded.review_count,
      updated_at = now();
end;
$$;

create or replace function public.cash_reviews_refresh_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.cash_refresh_solver_stats(old.reviewed_phone);
    return old;
  end if;
  perform public.cash_refresh_solver_stats(new.reviewed_phone);
  return new;
end;
$$;

drop trigger if exists cash_reviews_after_change on public.cash_reviews;
create trigger cash_reviews_after_change
after insert or update or delete on public.cash_reviews
for each row execute function public.cash_reviews_refresh_stats();

-- 7. Litiges --------------------------------------------------------------------

create table if not exists public.cash_disputes (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.cash_missions(id) on delete cascade,
  opened_by_phone text not null,
  category text not null default 'autre',
  description text not null,
  attachments jsonb not null default '[]'::jsonb,
  status text not null default 'open'
    check (status = any(array['open', 'under_review', 'resolved_requester', 'resolved_solver', 'partial_resolution', 'closed'])),
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_cash_disputes_mission on public.cash_disputes(mission_id);
create index if not exists idx_cash_disputes_status on public.cash_disputes(status, created_at desc);

alter table public.cash_disputes enable row level security;
revoke all on public.cash_disputes from anon, authenticated;

-- 8. Notifications in-app (feed simple, distinct du web-push VAPID) -----------

create table if not exists public.cash_notifications (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  type text not null,
  mission_id uuid references public.cash_missions(id) on delete cascade,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_cash_notifications_user on public.cash_notifications(user_phone, read_at, created_at desc);

alter table public.cash_notifications enable row level security;
revoke all on public.cash_notifications from anon, authenticated;

-- 9. Vue publique pour le feed anonyme -----------------------------------------
-- Expose uniquement les missions visibles publiquement, sans donnees privees
-- (pas de telephone). Le nombre de solutions actives est calcule ici plutot
-- que denormalise sur cash_missions, pour eviter tout risque de compteur
-- desynchronise.

create or replace view public.public_cash_feed as
select
  m.id,
  m.title,
  m.description,
  m.category,
  m.area,
  m.deadline_type,
  m.deadline_at,
  m.reward_amount,
  m.service_budget_hint,
  m.status,
  m.secured,
  m.requester_name,
  m.created_at,
  m.expires_at,
  coalesce(sc.active_count, 0) as active_solutions_count
from public.cash_missions m
left join lateral (
  select count(*) as active_count
  from public.cash_solutions s
  where s.mission_id = m.id and s.status = 'pending'
) sc on true
where m.status in ('published', 'solution_selected', 'in_progress', 'completion_pending');

grant select on public.public_cash_feed to anon, authenticated;

notify pgrst, 'reload schema';

select 'Zeyds V305 Cash schema installe' as statut;
