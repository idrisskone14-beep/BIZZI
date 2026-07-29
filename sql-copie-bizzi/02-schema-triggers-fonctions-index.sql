-- =========================================================
-- Triggers updated_at
-- =========================================================

drop trigger if exists countries_set_updated_at on countries;
create trigger countries_set_updated_at
before update on countries
for each row execute function set_updated_at();

drop trigger if exists cities_set_updated_at on cities;
create trigger cities_set_updated_at
before update on cities
for each row execute function set_updated_at();

drop trigger if exists communes_set_updated_at on communes;
create trigger communes_set_updated_at
before update on communes
for each row execute function set_updated_at();

drop trigger if exists categories_set_updated_at on categories;
create trigger categories_set_updated_at
before update on categories
for each row execute function set_updated_at();

drop trigger if exists services_set_updated_at on services;
create trigger services_set_updated_at
before update on services
for each row execute function set_updated_at();

drop trigger if exists providers_set_updated_at on providers;
create trigger providers_set_updated_at
before update on providers
for each row execute function set_updated_at();

drop trigger if exists subscription_plans_set_updated_at on subscription_plans;
create trigger subscription_plans_set_updated_at
before update on subscription_plans
for each row execute function set_updated_at();

drop trigger if exists payments_set_updated_at on payments;
create trigger payments_set_updated_at
before update on payments
for each row execute function set_updated_at();

drop trigger if exists advertisements_set_updated_at on advertisements;
create trigger advertisements_set_updated_at
before update on advertisements
for each row execute function set_updated_at();

drop trigger if exists reports_set_updated_at on reports;
create trigger reports_set_updated_at
before update on reports
for each row execute function set_updated_at();

drop trigger if exists admin_profiles_set_updated_at on admin_profiles;
create trigger admin_profiles_set_updated_at
before update on admin_profiles
for each row execute function set_updated_at();

-- =========================================================
-- Fonctions metier
-- =========================================================

create or replace function refresh_provider_visibility(provider_uuid uuid)
returns void
language plpgsql
as $$
declare
  p providers%rowtype;
begin
  select * into p from providers where id = provider_uuid;

  if not found then
    return;
  end if;

  if p.status = 'suspended' or p.status = 'rejected' then
    update providers
    set visibility_status = 'hidden'
    where id = provider_uuid;
    return;
  end if;

  if p.status <> 'approved' then
    return;
  end if;

  if p.subscription_ends_at is not null and p.subscription_ends_at > now() then
    update providers
    set visibility_status = 'active'
    where id = provider_uuid;
    return;
  end if;

  if p.trial_ends_at is not null and p.trial_ends_at > now() then
    update providers
    set visibility_status = 'trial'
    where id = provider_uuid;
    return;
  end if;

  update providers
  set visibility_status = 'expired_blurred'
  where id = provider_uuid;
end;
$$;

create or replace function approve_payment(payment_uuid uuid)
returns void
language plpgsql
as $$
declare
  pay payments%rowtype;
  plan subscription_plans%rowtype;
  current_end timestamptz;
  new_end timestamptz;
begin
  select * into pay from payments where id = payment_uuid;
  if not found then
    raise exception 'Payment not found';
  end if;

  select * into plan from subscription_plans where id = pay.plan_id;
  if not found then
    raise exception 'Plan not found';
  end if;

  select subscription_ends_at into current_end
  from providers
  where id = pay.provider_id;

  new_end :=
    greatest(coalesce(current_end, now()), now())
    + make_interval(months => plan.duration_months);

  update payments
  set status = 'approved',
      approved_at = now(),
      amount = plan.price,
      currency = plan.currency
  where id = payment_uuid;

  update providers
  set subscription_ends_at = new_end,
      visibility_status = 'active',
      status = case when status = 'pending' then 'approved' else status end
  where id = pay.provider_id;
end;
$$;

-- Vue publique pour l'application client.
-- Elle masque les donnees sensibles quand visibility_status = expired_blurred.
create or replace view public_provider_cards as
select
  p.id,
  case
    when p.visibility_status in ('active', 'trial') then p.full_name
    else null
  end as full_name,
  p.photo_url,
  s.name as service_name,
  c.name as city_name,
  co.name as commune_name,
  case
    when p.visibility_status in ('active', 'trial') then p.neighborhood
    else null
  end as neighborhood,
  case
    when p.visibility_status in ('active', 'trial') then p.phone
    else null
  end as phone,
  case
    when p.visibility_status in ('active', 'trial') then p.whatsapp
    else null
  end as whatsapp,
  case
    when p.visibility_status in ('active', 'trial') then p.description
    else null
  end as description,
  p.average_rating,
  p.latitude,
  p.longitude,
  p.visibility_status,
  ps.service_id,
  p.city_id,
  p.commune_id
from providers p
join provider_services ps on ps.provider_id = p.id and ps.is_primary = true
join services s on s.id = ps.service_id
left join cities c on c.id = p.city_id
left join communes co on co.id = p.commune_id
where p.status = 'approved'
  and p.visibility_status in ('trial', 'active', 'expired_blurred');

-- =========================================================
-- Index
-- =========================================================

create index if not exists idx_cities_country on cities(country_id);
create index if not exists idx_communes_city on communes(city_id);
create index if not exists idx_services_category on services(category_id);
create index if not exists idx_provider_services_provider on provider_services(provider_id);
create index if not exists idx_provider_services_service on provider_services(service_id);
create index if not exists idx_providers_city on providers(city_id);
create index if not exists idx_providers_commune on providers(commune_id);
create index if not exists idx_providers_status_visibility on providers(status, visibility_status);
create index if not exists idx_payments_provider on payments(provider_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_advertisements_zone on advertisements(city_id, commune_id, status);
create index if not exists idx_reports_provider on reports(provider_id);

