-- Bizzi V130 - Emplois/Missions pour tous types d'entreprises
-- A executer dans Supabase SQL Editor.
--
-- Objectifs :
-- - permettre a tout type d'entreprise/organisation de publier une offre payante ;
-- - afficher les offres en attente dans l'admin ;
-- - publier une offre apres validation admin ;
-- - exposer uniquement les offres publiees et payees au public.

grant usage on schema public to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

alter table public.job_offers
add column if not exists company_type text not null default 'Entreprise formelle',
add column if not exists plan_name text,
add column if not exists amount integer not null default 0,
add column if not exists currency text not null default 'FCFA',
add column if not exists payment_method text,
add column if not exists transaction_reference text,
add column if not exists proof_url text,
add column if not exists payment_status text not null default 'pending',
add column if not exists paid_at timestamptz,
add column if not exists is_boosted boolean not null default false,
add column if not exists job_credits integer not null default 1;

alter table public.job_offers enable row level security;

drop trigger if exists job_offers_set_updated_at on public.job_offers;
create trigger job_offers_set_updated_at
before update on public.job_offers
for each row execute function public.set_updated_at();

create index if not exists idx_job_offers_status_payment_created
on public.job_offers(status, payment_status, created_at desc);

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
  and payment_status = 'pending'
  and amount >= 999
  and length(trim(coalesce(transaction_reference, ''))) > 0
  and length(trim(title)) > 0
  and length(trim(company_name)) > 0
  and length(trim(coalesce(company_type, ''))) > 0
  and length(trim(city_name)) > 0
);

drop policy if exists "admin full job offers" on public.job_offers;
create policy "admin full job offers"
on public.job_offers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.admin_publish_job_offer(job_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  job_row record;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.job_offers jo
  set status = 'published',
      payment_status = 'approved',
      paid_at = coalesce(jo.paid_at, now()),
      expires_at = case
        when jo.expires_at is null or jo.expires_at <= now()
          then now() + interval '30 days'
        else jo.expires_at
      end,
      updated_at = now()
  where jo.id = job_uuid
  returning
    jo.id,
    jo.title,
    jo.company_name,
    jo.company_type,
    jo.status,
    jo.payment_status,
    jo.expires_at
  into job_row;

  if job_row.id is null then
    raise exception 'Offre emploi introuvable: %', job_uuid;
  end if;

  return to_jsonb(job_row);
end;
$$;

create or replace function public.admin_archive_job_offer(job_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  job_row record;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.job_offers jo
  set status = 'archived',
      updated_at = now()
  where jo.id = job_uuid
  returning
    jo.id,
    jo.title,
    jo.company_name,
    jo.company_type,
    jo.status,
    jo.payment_status,
    jo.expires_at
  into job_row;

  if job_row.id is null then
    raise exception 'Offre emploi introuvable: %', job_uuid;
  end if;

  return to_jsonb(job_row);
end;
$$;

revoke all on function public.admin_publish_job_offer(uuid) from public;
revoke all on function public.admin_archive_job_offer(uuid) from public;
grant execute on function public.admin_publish_job_offer(uuid) to authenticated;
grant execute on function public.admin_archive_job_offer(uuid) to authenticated;

drop view if exists public.public_job_offers;

create or replace view public.public_job_offers as
select
  jo.id,
  jo.title,
  jo.company_name,
  jo.company_type,
  jo.contact_phone,
  jo.contact_email,
  jo.service_id,
  coalesce(jo.service_name, s.name, 'Service Bizzi') as service_name,
  jo.city_id,
  coalesce(jo.city_name, c.name, 'Toute la Côte d''Ivoire') as city_name,
  jo.area,
  jo.contract_type,
  jo.salary_range,
  jo.description,
  jo.external_url,
  jo.source,
  jo.plan_name,
  jo.amount,
  jo.currency,
  jo.payment_method,
  jo.payment_status,
  jo.is_boosted,
  jo.job_credits,
  jo.status,
  jo.created_at,
  jo.expires_at
from public.job_offers jo
left join public.services s on s.id = jo.service_id
left join public.cities c on c.id = jo.city_id
where jo.status = 'published'
  and jo.payment_status = 'approved'
  and jo.expires_at > now();

grant select on public.public_job_offers to anon, authenticated;

notify pgrst, 'reload schema';

select
  'emplois_missions_toutes_entreprises_v130_installe' as verification,
  count(*) filter (where status = 'pending') as offres_en_attente,
  count(*) filter (where status = 'published' and payment_status = 'approved') as offres_publiques
from public.job_offers;
