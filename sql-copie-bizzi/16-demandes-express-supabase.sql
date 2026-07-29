-- Bizzi - Demandes express Supabase V43
-- Objectif : enregistrer les demandes express clients sans compte.
-- A executer une seule fois dans Supabase SQL Editor.

create table if not exists express_requests (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) on delete set null,
  service_name text not null,
  city_id uuid references cities(id) on delete set null,
  city_name text not null,
  area text,
  urgency text not null default 'today' check (urgency in ('today', '24h', 'week', 'quote')),
  message text,
  customer_phone text,
  matched_provider_ids uuid[] not null default '{}',
  status text not null default 'open' check (status in ('open', 'contacted', 'closed', 'archived')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table express_requests enable row level security;

drop trigger if exists express_requests_set_updated_at on express_requests;
create trigger express_requests_set_updated_at
before update on express_requests
for each row execute function set_updated_at();

create index if not exists idx_express_requests_status_created
on express_requests(status, created_at desc);

create index if not exists idx_express_requests_service_city
on express_requests(service_name, city_name);

grant insert on express_requests to anon, authenticated;
grant select, update on express_requests to authenticated;

drop policy if exists "public submit express request" on express_requests;
create policy "public submit express request"
on express_requests for insert
to anon, authenticated
with check (
  status = 'open'
  and length(trim(service_name)) > 0
  and length(trim(city_name)) > 0
);

drop policy if exists "admin full express requests" on express_requests;
create policy "admin full express requests"
on express_requests for all
to authenticated
using (is_admin())
with check (is_admin());
