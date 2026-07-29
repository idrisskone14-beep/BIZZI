-- Bizzi V302 — localisation précise, additive et rétrocompatible.
-- Longitude toujours passée avant latitude lors de la construction du POINT.

create extension if not exists postgis with schema extensions;

alter table if exists public.providers
  add column if not exists location_accuracy integer,
  add column if not exists location_timestamp timestamptz,
  add column if not exists location_label text,
  add column if not exists location_full_address text,
  add column if not exists geo_point extensions.geography(point, 4326)
    generated always as (
      case
        when latitude between -90 and 90 and longitude between -180 and 180
        then extensions.st_setsrid(extensions.st_makepoint(longitude::double precision, latitude::double precision), 4326)::extensions.geography
      end
    ) stored;

alter table if exists public.event_promotions
  add column if not exists location_accuracy integer,
  add column if not exists location_timestamp timestamptz,
  add column if not exists location_label text,
  add column if not exists location_full_address text,
  add column if not exists geo_point extensions.geography(point, 4326)
    generated always as (
      case
        when latitude between -90 and 90 and longitude between -180 and 180
        then extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326)::extensions.geography
      end
    ) stored;

alter table if exists public.food_places
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_accuracy integer,
  add column if not exists location_timestamp timestamptz,
  add column if not exists location_label text,
  add column if not exists location_full_address text,
  add column if not exists geo_point extensions.geography(point, 4326)
    generated always as (
      case
        when latitude between -90 and 90 and longitude between -180 and 180
        then extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326)::extensions.geography
      end
    ) stored;

alter table if exists public.exception_places
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_accuracy integer,
  add column if not exists location_timestamp timestamptz,
  add column if not exists location_label text,
  add column if not exists location_full_address text,
  add column if not exists geo_point extensions.geography(point, 4326)
    generated always as (
      case
        when latitude between -90 and 90 and longitude between -180 and 180
        then extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326)::extensions.geography
      end
    ) stored;

alter table if exists public.delivery_requests
  add column if not exists pickup_accuracy integer,
  add column if not exists pickup_location_timestamp timestamptz,
  add column if not exists pickup_location_label text,
  add column if not exists pickup_location_full_address text,
  add column if not exists dropoff_location_label text,
  add column if not exists dropoff_location_full_address text,
  add column if not exists pickup_geo_point extensions.geography(point, 4326)
    generated always as (
      case
        when pickup_latitude between -90 and 90 and pickup_longitude between -180 and 180
        then extensions.st_setsrid(extensions.st_makepoint(pickup_longitude, pickup_latitude), 4326)::extensions.geography
      end
    ) stored,
  add column if not exists dropoff_geo_point extensions.geography(point, 4326)
    generated always as (
      case
        when dropoff_latitude between -90 and 90 and dropoff_longitude between -180 and 180
        then extensions.st_setsrid(extensions.st_makepoint(dropoff_longitude, dropoff_latitude), 4326)::extensions.geography
      end
    ) stored;

create index if not exists providers_geo_point_gix on public.providers using gist (geo_point);
create index if not exists event_promotions_geo_point_gix on public.event_promotions using gist (geo_point);
create index if not exists food_places_geo_point_gix on public.food_places using gist (geo_point);
create index if not exists exception_places_geo_point_gix on public.exception_places using gist (geo_point);
create index if not exists delivery_requests_pickup_geo_point_gix on public.delivery_requests using gist (pickup_geo_point);
create index if not exists delivery_requests_dropoff_geo_point_gix on public.delivery_requests using gist (dropoff_geo_point);

alter table if exists public.providers
  drop constraint if exists providers_location_accuracy_check,
  add constraint providers_location_accuracy_check check (location_accuracy is null or location_accuracy between 0 and 10000) not valid;
alter table if exists public.event_promotions
  drop constraint if exists event_promotions_location_accuracy_check,
  add constraint event_promotions_location_accuracy_check check (location_accuracy is null or location_accuracy between 0 and 10000) not valid;
alter table if exists public.food_places
  drop constraint if exists food_places_location_accuracy_check,
  add constraint food_places_location_accuracy_check check (location_accuracy is null or location_accuracy between 0 and 10000) not valid;
alter table if exists public.exception_places
  drop constraint if exists exception_places_location_accuracy_check,
  add constraint exception_places_location_accuracy_check check (location_accuracy is null or location_accuracy between 0 and 10000) not valid;

create or replace view public.public_food_places as
select
  id, name, owner_name, contact_phone, place_type, main_specialty, specialties,
  city_name, area, address, average_budget, opening_hours, delivery_available,
  description, photo_url, rating, click_count, contact_click_count, status,
  verification_status, created_at, updated_at,
  latitude, longitude, location_accuracy, location_timestamp, location_label, location_full_address
from public.food_places
where status = any (array['published'::text, 'active'::text]);

create or replace view public.public_exception_places as
select
  id, name, owner_name, contact_phone, city_name, area, address, description,
  photo_url, plan_id, plan_name, amount, currency, payment_method, payment_reference,
  payment_status, boost_days, boost_starts_at, boost_ends_at, visibility_starts_at,
  visibility_ends_at, admin_grant, status, click_count, created_at, updated_at,
  (payment_status = 'approved' and boost_starts_at <= now() and boost_ends_at > now()) as boost_active,
  latitude, longitude, location_accuracy, location_timestamp, location_label, location_full_address
from public.exception_places
where status = any (array['published'::text, 'active'::text])
  and visibility_ends_at > now();

create or replace view public.public_event_promotions as
select
  id, title, description, event_datetime, end_datetime, venue, area, venue_address,
  latitude, longitude, visibility_radius_km, city_name, category, poster_url,
  ticket_price, ticket_url, contact_phone, organizer_name, plan_name, amount,
  currency, payment_status, is_sponsored, is_premium, status, click_count,
  ticket_click_count, contact_click_count, detail_view_count, stats_sent_at,
  created_at, updated_at,
  location_accuracy, location_timestamp, location_label, location_full_address
from public.event_promotions
where status = 'published'
  and payment_status = 'approved'
  and end_datetime >= now();

create or replace view public.public_provider_directory as
select
  p.id,
  case when p.visibility_status = any (array['trial'::public.provider_visibility_status, 'active'::public.provider_visibility_status]) then p.full_name end as full_name,
  case when p.visibility_status = any (array['trial'::public.provider_visibility_status, 'active'::public.provider_visibility_status]) then p.phone end as phone,
  case when p.visibility_status = any (array['trial'::public.provider_visibility_status, 'active'::public.provider_visibility_status]) then p.whatsapp end as whatsapp,
  p.photo_url, p.description, p.neighborhood, p.latitude, p.longitude,
  p.visibility_status, p.average_rating, p.call_count, p.is_verified,
  c.name as city_name, co.name as commune_name,
  coalesce(s.name, nullif(trim(p.requested_service_name), ''), 'Metier a preciser') as service_name,
  coalesce(cat.name, nullif(trim(p.requested_category_name), ''), 'Autres') as category_name,
  (p.visibility_status = any (array['trial'::public.provider_visibility_status, 'active'::public.provider_visibility_status])) as contact_visible,
  p.review_count, p.trial_ends_at, p.subscription_ends_at,
  p.requested_service_name, p.requested_category_name, p.boost_ends_at,
  p.delivery_penalty_rate, p.delivery_penalty_remaining, p.delivery_penalty_until,
  p.delivery_penalty_reason, p.delivery_cancel_count,
  p.location_accuracy, p.location_timestamp, p.location_label, p.location_full_address
from public.providers p
left join public.cities c on c.id = p.city_id
left join public.communes co on co.id = p.commune_id
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
left join public.categories cat on cat.id = s.category_id
where p.status = 'approved'::public.provider_status
  and p.visibility_status = any (array['trial'::public.provider_visibility_status, 'active'::public.provider_visibility_status]);
