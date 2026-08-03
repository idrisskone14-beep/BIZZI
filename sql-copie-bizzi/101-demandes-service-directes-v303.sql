-- Zeyds V303 — demandes de service directes (demande -> accepte -> suit -> note).
-- Miroir simplifie de delivery_requests : une demande cible directement UN
-- prestataire deja choisi par le client (pas de diffusion/matching multi-
-- prestataires), et ne gere pas de paiement in-app en v1 (les colonnes de
-- paiement restent presentes pour une evolution future, mais ne sont pas
-- utilisees par le code actuel).
--
-- A executer sur le projet Supabase reel (SQL Editor) uniquement quand vous
-- voulez activer la synchronisation distante de ce module ; l'app fonctionne
-- deja entierement en local (localStorage) sans cette table.

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_access_token text,
  customer_name text,
  customer_phone text,
  service_name text,
  city_name text,
  area text,
  notes text,
  photo_url text,
  assigned_provider_id uuid references public.providers(id) on delete set null,
  assigned_provider_name text,
  assigned_provider_phone text,
  status text not null default 'pending_acceptance'
    check (status = any(array['pending_acceptance', 'accepted', 'in_progress', 'completed', 'declined', 'cancelled'])),
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  declined_at timestamptz,
  decline_reason text,
  cancellation_reason text,
  cancelled_by text,
  cancelled_at timestamptz,
  amount numeric default 0,
  currency text default 'FCFA',
  commission_rate numeric default 0.15,
  bizzi_commission numeric default 0,
  provider_payout numeric default 0,
  payment_reference text,
  payment_status text default 'unpaid',
  paid_at timestamptz,
  payout_status text default 'pending',
  review_submitted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_service_requests_client_access_token
  on public.service_requests(client_access_token, created_at desc);

create index if not exists idx_service_requests_assigned_provider
  on public.service_requests(assigned_provider_id, status);

alter table public.service_requests enable row level security;

drop policy if exists "client reads own service requests" on public.service_requests;
drop policy if exists "provider reads assigned service requests" on public.service_requests;
drop policy if exists "admins read all service requests" on public.service_requests;
drop policy if exists "public create service requests" on public.service_requests;
drop policy if exists "provider updates assigned service requests" on public.service_requests;

create policy "client reads own service requests"
on public.service_requests
for select
to anon, authenticated
using (
  length(coalesce((select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token'), '')) between 32 and 160
  and client_access_token = (select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token')
);

create policy "provider reads assigned service requests"
on public.service_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.providers provider
    where provider.auth_user_id = (select auth.uid())
      and provider.id = assigned_provider_id
  )
  or exists (
    select 1
    from public.admin_profiles admin_profile
    where admin_profile.auth_user_id = (select auth.uid())
      and admin_profile.is_active = true
  )
);

create policy "public create service requests"
on public.service_requests
for insert
to anon, authenticated
with check (
  status = 'pending_acceptance'
  and assigned_provider_id is not null
  and service_name is not null
);

create policy "provider updates assigned service requests"
on public.service_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.providers provider
    where provider.auth_user_id = (select auth.uid())
      and provider.id = assigned_provider_id
  )
)
with check (
  exists (
    select 1
    from public.providers provider
    where provider.auth_user_id = (select auth.uid())
      and provider.id = assigned_provider_id
  )
);

comment on column public.service_requests.client_access_token is
  'Jeton prive aleatoire propre a l appareil client. Ne jamais afficher ni journaliser.';
comment on table public.service_requests is
  'Demandes de service directes (1 client -> 1 prestataire deja choisi). Sans paiement in-app en v1.';
