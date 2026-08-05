-- Zeyds V304 - Table des abonnements push (notifications reelles pour le systeme de
-- propositions)
--
-- A executer sur SUPABASE (SQL Editor), PAS Neon : les Edge Functions push-subscribe et
-- push-notify se connectent uniquement a la base Supabase (cle service_role), quelle que soit
-- la base sur laquelle vivent providers/express_requests. C'est le seul endroit ou stocker les
-- abonnements pour que ces fonctions puissent les lire.
--
-- Une table push_subscriptions existait deja (tentative anterieure abandonnee, colonnes
-- user_agent/is_active/provider_id en uuid - incompatible avec ce schema). Verifie vide (0
-- ligne) avant suppression. drop...cascade pour repartir sur une structure propre.

drop table if exists public.push_subscriptions cascade;

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('provider', 'client')),
  provider_id text,
  phone text,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_provider_idx
on public.push_subscriptions (provider_id)
where provider_id is not null;

create index if not exists push_subscriptions_phone_idx
on public.push_subscriptions (phone)
where phone is not null;

alter table public.push_subscriptions enable row level security;

-- Aucune policy anon/authenticated volontairement : cette table ne doit jamais etre lisible
-- depuis le frontend (elle contient les abonnements push d'autres appareils). Seules les Edge
-- Functions (cle service_role, qui contourne RLS) y accedent.
revoke all on public.push_subscriptions from anon, authenticated;

notify pgrst, 'reload schema';

select
  'Zeyds V304 push_subscriptions installee (Supabase)' as statut,
  count(*) as abonnements_existants
from public.push_subscriptions;
