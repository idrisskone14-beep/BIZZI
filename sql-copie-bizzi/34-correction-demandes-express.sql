-- Bizzi - Correction demandes express V75
-- Objectif :
-- 1. Completer la table express_requests si certaines colonnes manquent.
-- 2. Repararer le compteur de prestataires proposes.
-- 3. Garantir que l'admin peut lire et fermer les demandes express.
--
-- A executer dans Supabase > SQL Editor > New query.

create table if not exists public.express_requests (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete set null,
  service_name text not null,
  city_id uuid references public.cities(id) on delete set null,
  city_name text not null,
  area text,
  urgency text not null default 'today',
  message text,
  customer_phone text,
  matched_provider_ids uuid[] not null default '{}',
  status text not null default 'open',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table public.express_requests
add column if not exists matched_provider_ids uuid[] not null default '{}',
add column if not exists priority_score integer not null default 0,
add column if not exists priority_label text not null default 'Normal',
add column if not exists matched_count integer not null default 0,
add column if not exists admin_note text,
add column if not exists closed_at timestamptz;

update public.express_requests
set matched_count = coalesce(cardinality(matched_provider_ids), 0)
where matched_count = 0
  and matched_provider_ids is not null;

update public.express_requests
set closed_at = coalesce(closed_at, updated_at, now())
where status in ('closed', 'archived')
  and closed_at is null;

alter table public.express_requests enable row level security;

drop trigger if exists express_requests_set_updated_at on public.express_requests;
create trigger express_requests_set_updated_at
before update on public.express_requests
for each row execute function public.set_updated_at();

create index if not exists idx_express_requests_status_created
on public.express_requests(status, created_at desc);

create index if not exists idx_express_requests_priority
on public.express_requests(status, priority_score desc, created_at asc);

create index if not exists idx_express_requests_service_city
on public.express_requests(service_name, city_name);

grant insert on public.express_requests to anon, authenticated;
grant select, update on public.express_requests to authenticated;

drop policy if exists "public submit express request" on public.express_requests;
create policy "public submit express request"
on public.express_requests for insert
to anon, authenticated
with check (
  status = 'open'
  and length(trim(service_name)) > 0
  and length(trim(city_name)) > 0
);

drop policy if exists "admin full express requests" on public.express_requests;
create policy "admin full express requests"
on public.express_requests for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

comment on column public.express_requests.priority_score is 'Score Bizzi de 0 a 100 pour prioriser le traitement admin.';
comment on column public.express_requests.priority_label is 'Libelle de priorite affiche cote admin.';
comment on column public.express_requests.matched_count is 'Nombre de prestataires proposes au moment de la demande.';

-- Controle final : demandes encore ouvertes.
select
  id,
  service_name,
  city_name,
  area,
  status,
  priority_score,
  priority_label,
  matched_count,
  created_at
from public.express_requests
where status = 'open'
order by priority_score desc, created_at asc;
