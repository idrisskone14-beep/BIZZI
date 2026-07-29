-- Bizzi - Emplois et missions Supabase V66
-- Objectif :
-- - permettre aux entreprises/prestataires de proposer une offre d'emploi ou une mission
-- - garder les offres en attente jusqu'a validation admin
-- - exposer uniquement les offres publiees au public.
--
-- A executer dans Supabase > SQL Editor > New query.

create table if not exists public.job_offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company_name text not null,
  contact_phone text,
  contact_email text,
  service_id uuid references public.services(id) on delete set null,
  service_name text,
  city_id uuid references public.cities(id) on delete set null,
  city_name text not null default 'Toute la Côte d''Ivoire',
  area text,
  contract_type text not null default 'Mission ponctuelle',
  salary_range text,
  description text,
  external_url text,
  source text not null default 'bizzi',
  status text not null default 'pending' check (status in ('pending', 'published', 'archived', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

alter table public.job_offers enable row level security;

drop trigger if exists job_offers_set_updated_at on public.job_offers;
create trigger job_offers_set_updated_at
before update on public.job_offers
for each row execute function public.set_updated_at();

create index if not exists idx_job_offers_status_created
on public.job_offers(status, created_at desc);

create index if not exists idx_job_offers_service_city
on public.job_offers(service_name, city_name);

grant insert on public.job_offers to anon, authenticated;
grant select, update on public.job_offers to authenticated;

drop policy if exists "public submit job offer" on public.job_offers;
create policy "public submit job offer"
on public.job_offers for insert
to anon, authenticated
with check (
  status = 'pending'
  and length(trim(title)) > 0
  and length(trim(company_name)) > 0
  and length(trim(city_name)) > 0
);

drop policy if exists "admin full job offers" on public.job_offers;
create policy "admin full job offers"
on public.job_offers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace view public.public_job_offers as
select
  jo.id,
  jo.title,
  jo.company_name,
  jo.contact_phone,
  jo.contact_email,
  jo.service_id,
  coalesce(jo.service_name, s.name) as service_name,
  jo.city_id,
  coalesce(jo.city_name, c.name, 'Toute la Côte d''Ivoire') as city_name,
  jo.area,
  jo.contract_type,
  jo.salary_range,
  jo.description,
  jo.external_url,
  jo.source,
  jo.status,
  jo.created_at,
  jo.expires_at
from public.job_offers jo
left join public.services s on s.id = jo.service_id
left join public.cities c on c.id = jo.city_id
where jo.status = 'published'
  and jo.expires_at > now();

grant select on public.public_job_offers to anon, authenticated;
