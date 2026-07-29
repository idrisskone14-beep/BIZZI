-- Bizzi - Complement production Supabase
-- A executer apres schema-bizzi.sql
-- Objectif : securite, vues publiques masquees, donnees consultables par l'app client.

alter table countries enable row level security;
alter table cities enable row level security;
alter table communes enable row level security;
alter table categories enable row level security;
alter table services enable row level security;
alter table providers enable row level security;
alter table provider_services enable row level security;
alter table subscription_plans enable row level security;
alter table payments enable row level security;
alter table advertisements enable row level security;
alter table reports enable row level security;
alter table admin_profiles enable row level security;

alter table providers add column if not exists verification_proof_url text;
alter table providers add column if not exists verification_note text;

create policy "public read active countries"
on countries for select
using (is_active = true);

create policy "public read active cities"
on cities for select
using (is_active = true);

create policy "public read active communes"
on communes for select
using (is_active = true);

create policy "public read active categories"
on categories for select
using (is_active = true);

create policy "public read active services"
on services for select
using (is_active = true);

create policy "public read active plans"
on subscription_plans for select
using (is_active = true);

create or replace view public_provider_directory as
select
  p.id,
  case
    when p.visibility_status in ('trial', 'active') then p.full_name
    else null
  end as full_name,
  case
    when p.visibility_status in ('trial', 'active') then p.phone
    else null
  end as phone,
  case
    when p.visibility_status in ('trial', 'active') then p.whatsapp
    else null
  end as whatsapp,
  p.photo_url,
  p.description,
  p.neighborhood,
  p.latitude,
  p.longitude,
  p.visibility_status,
  p.average_rating,
  p.call_count,
  p.is_verified,
  c.name as city_name,
  co.name as commune_name,
  s.name as service_name,
  cat.name as category_name,
  case
    when p.visibility_status in ('trial', 'active') then true
    else false
  end as contact_visible
from providers p
left join cities c on c.id = p.city_id
left join communes co on co.id = p.commune_id
left join provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join services s on s.id = ps.service_id
left join categories cat on cat.id = s.category_id
where p.status = 'approved'
and p.visibility_status in ('trial', 'active', 'expired_blurred');

create or replace view public_advertisements as
select
  a.id,
  a.provider_id,
  a.title,
  a.body,
  a.image_url,
  a.starts_at,
  a.ends_at,
  c.name as city_name,
  co.name as commune_name,
  s.name as service_name
from advertisements a
left join cities c on c.id = a.city_id
left join communes co on co.id = a.commune_id
left join provider_services ps on ps.provider_id = a.provider_id and ps.is_primary = true
left join services s on s.id = ps.service_id
where a.status = 'active'
and now() between a.starts_at and a.ends_at;

create policy "provider can read own profile"
on providers for select
using (auth.uid() = auth_user_id);

create policy "provider can update own profile"
on providers for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

create policy "provider can create own profile"
on providers for insert
with check (auth.uid() = auth_user_id);

create policy "provider can read own payments"
on payments for select
using (
  provider_id in (
    select id from providers where auth_user_id = auth.uid()
  )
);

create policy "provider can create own payment"
on payments for insert
with check (
  provider_id in (
    select id from providers where auth_user_id = auth.uid()
  )
);

create policy "provider can read own advertisements"
on advertisements for select
using (
  provider_id in (
    select id from providers where auth_user_id = auth.uid()
  )
);

create policy "provider can create own advertisement"
on advertisements for insert
with check (
  provider_id in (
    select id from providers where auth_user_id = auth.uid()
  )
);

-- Soumissions publiques MVP.
-- Le client ne cree pas de compte, et le prestataire peut proposer un profil.
-- Tout reste en attente de validation admin cote production.

grant usage on schema public to anon, authenticated;
grant select on countries, cities, communes, categories, services, subscription_plans to anon, authenticated;
grant select on public_provider_directory, public_advertisements to anon, authenticated;
grant insert on providers, provider_services, payments, advertisements, reports to anon, authenticated;

drop policy if exists "public submit pending provider" on providers;
create policy "public submit pending provider"
on providers for insert
to anon
with check (
  auth_user_id is null
  and status = 'pending'
  and visibility_status = 'trial'
);

drop policy if exists "public attach service to pending provider" on provider_services;
create policy "public attach service to pending provider"
on provider_services for insert
to anon
with check (
  provider_id in (
    select id from providers
    where auth_user_id is null
    and status = 'pending'
  )
);

drop policy if exists "public submit pending payment" on payments;
create policy "public submit pending payment"
on payments for insert
to anon
with check (
  status = 'pending'
  and provider_id in (
    select id from providers
    where auth_user_id is null
    and status in ('pending', 'approved')
  )
);

drop policy if exists "public submit pending advertisement" on advertisements;
create policy "public submit pending advertisement"
on advertisements for insert
to anon
with check (
  status = 'pending'
  and provider_id in (
    select id from providers
    where auth_user_id is null
    and status in ('pending', 'approved')
  )
);

drop policy if exists "public submit report" on reports;
create policy "public submit report"
on reports for insert
to anon
with check (
  status = 'open'
  and provider_id in (
    select id from providers
    where status = 'approved'
  )
);

