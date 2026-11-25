-- Export de la structure de la base Supabase bizzi-production (hqqppxnvorcnvksulhna), schema public.
-- Genere le 2026-11-25 en lecture seule (catalogue Postgres), faute de pg_dump/Docker sur le poste.
-- Sert de reference pour la migration vers Neon : ce n est PAS un script a rejouer tel quel
-- (les fonctions dependent de auth.uid()/Supabase Auth et l ordre des vues n est pas garanti).


-- ============================================================
-- Extensions
-- ============================================================

create extension if not exists pg_cron with schema pg_catalog;

create extension if not exists pg_stat_statements with schema extensions;

create extension if not exists pg_trgm with schema extensions;

create extension if not exists pgcrypto with schema extensions;

create extension if not exists postgis with schema extensions;

create extension if not exists supabase_vault with schema vault;

create extension if not exists "uuid-ossp" with schema extensions;


-- ============================================================
-- Types enum
-- ============================================================

create type public.advertisement_status as enum ('pending', 'active', 'expired', 'rejected');

create type public.payment_method as enum ('wave', 'orange_money', 'mtn_money');

create type public.payment_status as enum ('pending', 'approved', 'rejected');

create type public.provider_status as enum ('pending', 'approved', 'suspended', 'rejected');

create type public.provider_visibility_status as enum ('trial', 'active', 'expired_blurred', 'hidden');

create type public.report_status as enum ('open', 'reviewed', 'closed');


-- ============================================================
-- Tables
-- ============================================================

create table public.admin_audit_events (
  id uuid default gen_random_uuid() not null,
  action text not null,
  target_id text,
  success boolean default false not null,
  error_message text,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  actor_auth_user_id uuid,
  actor_email text
);

create table public.admin_financial_snapshots (
  id uuid default gen_random_uuid() not null,
  report_type text default 'finance_delivery'::text not null,
  report_payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table public.admin_profiles (
  id uuid default gen_random_uuid() not null,
  auth_user_id uuid,
  full_name text not null,
  role text default 'admin'::text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.admin_report_snapshots (
  id uuid default gen_random_uuid() not null,
  report_type text default 'global'::text not null,
  report_payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table public.advertisements (
  id uuid default gen_random_uuid() not null,
  title text not null,
  body text not null,
  image_url text,
  provider_id uuid,
  city_id uuid,
  commune_id uuid,
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone not null,
  status advertisement_status default 'pending'::advertisement_status not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.app_error_events (
  id uuid default gen_random_uuid() not null,
  source text default 'bizzi-web'::text not null,
  message text not null,
  name text,
  url text,
  user_agent text,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  severity text default 'error'::text not null,
  fingerprint text
);

create table public.cash_credits (
  id uuid default gen_random_uuid() not null,
  user_phone text not null,
  source_mission_id uuid,
  initial_amount numeric not null,
  remaining_amount numeric not null,
  status text default 'active'::text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now() not null
);

create table public.cash_disputes (
  id uuid default gen_random_uuid() not null,
  mission_id uuid not null,
  opened_by_phone text not null,
  category text default 'autre'::text not null,
  description text not null,
  attachments jsonb default '[]'::jsonb not null,
  status text default 'open'::text not null,
  resolution text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

create table public.cash_missions (
  id uuid default gen_random_uuid() not null,
  requester_phone text not null,
  requester_name text not null,
  title text not null,
  description text,
  category text default 'Autre'::text not null,
  area text default 'Toute la ville'::text not null,
  attachments jsonb default '[]'::jsonb not null,
  deadline_type text default 'cette_semaine'::text not null,
  deadline_at timestamp with time zone,
  reward_amount numeric not null,
  service_budget_hint numeric,
  status text default 'draft'::text not null,
  secured boolean default false not null,
  selected_solution_id uuid,
  completion_pending_at timestamp with time zone,
  reminder_stage integer default 0 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone
);

create table public.cash_notifications (
  id uuid default gen_random_uuid() not null,
  user_phone text not null,
  type text not null,
  mission_id uuid,
  message text not null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

create table public.cash_reviews (
  id uuid default gen_random_uuid() not null,
  mission_id uuid not null,
  reviewer_phone text not null,
  reviewed_phone text not null,
  rating integer not null,
  speed_rating integer,
  reliability_rating integer,
  quality_rating integer,
  comment text,
  created_at timestamp with time zone default now() not null
);

create table public.cash_solutions (
  id uuid default gen_random_uuid() not null,
  mission_id uuid not null,
  solver_phone text not null,
  solver_name text not null,
  description text,
  attachments jsonb default '[]'::jsonb not null,
  contact text,
  price_hint numeric,
  availability text,
  status text default 'pending'::text not null,
  submitted_at timestamp with time zone default now() not null,
  selected_at timestamp with time zone,
  estimated_duration numeric,
  duration_unit text
);

create table public.cash_solver_stats (
  user_phone text not null,
  average_rating numeric default 0 not null,
  review_count integer default 0 not null,
  missions_won integer default 0 not null,
  missions_completed integer default 0 not null,
  dispute_count integer default 0 not null,
  updated_at timestamp with time zone default now() not null
);

create table public.cash_transactions (
  id uuid default gen_random_uuid() not null,
  mission_id uuid,
  user_phone text,
  type text not null,
  amount numeric not null,
  status text default 'pending'::text not null,
  payment_reference text,
  payment_method text,
  raw_payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table public.cash_wallets (
  user_phone text not null,
  balance numeric default 0 not null,
  updated_at timestamp with time zone default now() not null
);

create table public.categories (
  id uuid default gen_random_uuid() not null,
  name text not null,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.cities (
  id uuid default gen_random_uuid() not null,
  country_id uuid not null,
  name text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  latitude numeric(10,7),
  longitude numeric(10,7)
);

create table public.communes (
  id uuid default gen_random_uuid() not null,
  city_id uuid not null,
  name text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  latitude numeric(10,7),
  longitude numeric(10,7)
);

create table public.countries (
  id uuid default gen_random_uuid() not null,
  name text not null,
  iso_code text,
  currency text default 'FCFA'::text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.courier_locations (
  provider_id uuid not null,
  provider_phone text,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_meters numeric,
  is_available boolean default true not null,
  battery_level integer,
  source text default 'web'::text not null,
  last_seen_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.delivery_dispatch_offers (
  id uuid default gen_random_uuid() not null,
  delivery_id uuid not null,
  provider_id uuid not null,
  distance_km numeric,
  status text default 'offered'::text not null,
  expires_at timestamp with time zone default (now() + '00:03:00'::interval) not null,
  created_at timestamp with time zone default now() not null,
  responded_at timestamp with time zone
);

create table public.delivery_requests (
  id uuid default gen_random_uuid() not null,
  pickup_address text not null,
  dropoff_address text not null,
  parcel_description text not null,
  city_name text,
  area text,
  urgency text default 'today'::text not null,
  notes text,
  customer_phone text,
  matched_provider_ids uuid[] default '{}'::uuid[] not null,
  assigned_provider_id uuid,
  assigned_provider_name text,
  assigned_provider_phone text,
  status text default 'open'::text not null,
  accepted_at timestamp with time zone,
  closed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  amount integer default 0 not null,
  currency text default 'FCFA'::text not null,
  commission_rate numeric default 0.15 not null,
  bizzi_commission integer default 0 not null,
  provider_payout integer default 0 not null,
  payment_method text,
  transaction_reference text,
  payment_status text default 'pending'::text not null,
  paid_at timestamp with time zone,
  payout_status text default 'pending'::text not null,
  distance_km numeric,
  base_amount integer default 0 not null,
  suggested_amount integer default 0 not null,
  pricing_slot text default 'normal'::text not null,
  bad_weather boolean default false not null,
  surcharge_rate numeric default 0 not null,
  pricing_breakdown text,
  scheduled_at timestamp with time zone,
  pickup_latitude double precision,
  pickup_longitude double precision,
  dropoff_latitude double precision,
  dropoff_longitude double precision,
  dispatch_status text default 'not_dispatched'::text not null,
  dispatched_at timestamp with time zone,
  dispatch_radius_km numeric default 5 not null,
  dispatch_attempts integer default 0 not null,
  delivery_stage text default 'waiting'::text not null,
  proof_code text,
  proof_photo_url text,
  picked_up_at timestamp with time zone,
  en_route_at timestamp with time zone,
  delivered_at timestamp with time zone,
  courier_latitude double precision,
  courier_longitude double precision,
  courier_location_at timestamp with time zone,
  client_access_token text default (replace((gen_random_uuid())::text, '-'::text, ''::text) || replace((gen_random_uuid())::text, '-'::text, ''::text)) not null,
  pickup_accuracy integer,
  pickup_location_timestamp timestamp with time zone,
  pickup_location_label text,
  pickup_location_full_address text,
  dropoff_location_label text,
  dropoff_location_full_address text,
  pickup_geo_point extensions.geography(Point,4326) generated always as (
CASE
    WHEN (((pickup_latitude >= ('-90'::integer)::double precision) AND (pickup_latitude <= (90)::double precision)) AND ((pickup_longitude >= ('-180'::integer)::double precision) AND (pickup_longitude <= (180)::double precision))) THEN (extensions.st_setsrid(extensions.st_makepoint(pickup_longitude, pickup_latitude), 4326))::extensions.geography
    ELSE NULL::extensions.geography
END) stored,
  dropoff_geo_point extensions.geography(Point,4326) generated always as (
CASE
    WHEN (((dropoff_latitude >= ('-90'::integer)::double precision) AND (dropoff_latitude <= (90)::double precision)) AND ((dropoff_longitude >= ('-180'::integer)::double precision) AND (dropoff_longitude <= (180)::double precision))) THEN (extensions.st_setsrid(extensions.st_makepoint(dropoff_longitude, dropoff_latitude), 4326))::extensions.geography
    ELSE NULL::extensions.geography
END) stored
);

create table public.driver_locations (
  id bigint generated always as identity not null,
  driver_id uuid not null,
  ride_id uuid,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_m numeric(8,2),
  heading numeric(6,2),
  speed_kmh numeric(7,2),
  recorded_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

create table public.driver_vehicles (
  id uuid default gen_random_uuid() not null,
  driver_id uuid not null,
  category_id uuid not null,
  make text not null,
  model text not null,
  color text not null,
  registration_number text not null,
  seats integer default 4 not null,
  photo_url text,
  verification_status text default 'pending'::text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.event_promotions (
  id uuid default gen_random_uuid() not null,
  title text not null,
  description text,
  event_datetime timestamp with time zone not null,
  venue text not null,
  city_name text default 'Toute la Cote d''Ivoire'::text not null,
  category text default 'Autre evenement'::text not null,
  poster_url text,
  ticket_price text,
  ticket_url text not null,
  contact_phone text,
  organizer_name text not null,
  plan_name text default 'Standard'::text not null,
  amount integer default 0 not null,
  currency text default 'FCFA'::text not null,
  payment_method text,
  transaction_reference text,
  payment_status text default 'approved'::text not null,
  paid_at timestamp with time zone,
  is_sponsored boolean default false not null,
  is_premium boolean default false not null,
  status text default 'pending'::text not null,
  published_at timestamp with time zone,
  rejected_at timestamp with time zone,
  admin_note text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  end_datetime timestamp with time zone not null,
  area text,
  venue_address text,
  latitude double precision,
  longitude double precision,
  visibility_radius_km numeric default 25 not null,
  click_count integer default 0 not null,
  ticket_click_count integer default 0 not null,
  contact_click_count integer default 0 not null,
  detail_view_count integer default 0 not null,
  stats_sent_at timestamp with time zone,
  location_accuracy integer,
  location_timestamp timestamp with time zone,
  location_label text,
  location_full_address text,
  geo_point extensions.geography(Point,4326) generated always as (
CASE
    WHEN (((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision)) AND ((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision))) THEN (extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326))::extensions.geography
    ELSE NULL::extensions.geography
END) stored
);

create table public.exception_places (
  id uuid default gen_random_uuid() not null,
  name text not null,
  owner_name text not null,
  contact_phone text not null,
  city_name text not null,
  area text,
  address text,
  description text not null,
  photo_url text,
  plan_id text default 'free_30_days'::text not null,
  plan_name text default 'Inscription gratuite 1 mois'::text not null,
  amount integer default 0 not null,
  currency text default 'FCFA'::text not null,
  payment_method text,
  payment_reference text,
  payment_status text default 'approved'::text not null,
  boost_days integer default 0 not null,
  boost_starts_at timestamp with time zone,
  boost_ends_at timestamp with time zone,
  visibility_starts_at timestamp with time zone,
  visibility_ends_at timestamp with time zone,
  admin_grant boolean default false not null,
  status text default 'pending'::text not null,
  click_count integer default 0 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  latitude double precision,
  longitude double precision,
  location_accuracy integer,
  location_timestamp timestamp with time zone,
  location_label text,
  location_full_address text,
  geo_point extensions.geography(Point,4326) generated always as (
CASE
    WHEN (((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision)) AND ((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision))) THEN (extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326))::extensions.geography
    ELSE NULL::extensions.geography
END) stored
);

create table public.express_requests (
  id uuid default gen_random_uuid() not null,
  service_id uuid,
  service_name text not null,
  city_id uuid,
  city_name text not null,
  area text,
  urgency text default 'today'::text not null,
  message text,
  customer_phone text,
  matched_provider_ids uuid[] default '{}'::uuid[] not null,
  status text default 'open'::text not null,
  admin_note text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  closed_at timestamp with time zone,
  priority_score integer default 0 not null,
  priority_label text default 'Normal'::text not null,
  matched_count integer default 0 not null,
  client_user_id uuid,
  client_name text,
  analysis jsonb default '{}'::jsonb not null,
  requested_skills text[] default '{}'::text[] not null,
  desired_at timestamp with time zone,
  budget_amount integer,
  latitude double precision,
  longitude double precision,
  location_accuracy_m integer,
  location_label text,
  search_radius_km integer default 20 not null,
  radius_history integer[] default '{}'::integer[] not null,
  dispatch_status text default 'pending'::text not null,
  accepted_proposal_id uuid,
  situation_id uuid,
  situation_code text,
  solution_mode text default 'self'::text not null,
  people_count integer,
  constraint_notes text,
  resolution_status text default 'request_received'::text not null,
  overall_budget integer,
  resolved_at timestamp with time zone
);

create table public.field_test_results (
  id uuid default gen_random_uuid() not null,
  session_id uuid,
  scenario_name text not null,
  status text default 'todo'::text not null,
  notes text,
  screenshot_url text,
  created_at timestamp with time zone default now() not null
);

create table public.field_test_sessions (
  id uuid default gen_random_uuid() not null,
  title text not null,
  tester_name text,
  device_name text,
  network_type text,
  city text,
  status text default 'open'::text not null,
  started_at timestamp with time zone default now() not null,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now() not null
);

create table public.food_places (
  id uuid default gen_random_uuid() not null,
  name text not null,
  owner_name text,
  contact_phone text not null,
  place_type text default 'Restaurant'::text not null,
  main_specialty text not null,
  specialties text,
  city_name text not null,
  area text,
  address text,
  average_budget text,
  opening_hours text,
  delivery_available boolean default false not null,
  description text,
  photo_url text,
  rating numeric default 0 not null,
  click_count integer default 0 not null,
  contact_click_count integer default 0 not null,
  status text default 'pending'::text not null,
  verification_status text default 'none'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  latitude double precision,
  longitude double precision,
  location_accuracy integer,
  location_timestamp timestamp with time zone,
  location_label text,
  location_full_address text,
  geo_point extensions.geography(Point,4326) generated always as (
CASE
    WHEN (((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision)) AND ((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision))) THEN (extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326))::extensions.geography
    ELSE NULL::extensions.geography
END) stored
);

create table public.fraud_signals (
  id uuid default gen_random_uuid() not null,
  signal_type text not null,
  phone text,
  provider_id uuid,
  severity text default 'medium'::text not null,
  reason text,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table public.integration_health_checks (
  id uuid default gen_random_uuid() not null,
  provider_type text not null,
  provider_name text default 'a_configurer'::text not null,
  status text default 'pending'::text not null,
  message text,
  payload jsonb default '{}'::jsonb not null,
  checked_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

create table public.job_offers (
  id uuid default gen_random_uuid() not null,
  title text not null,
  company_name text not null,
  contact_phone text,
  contact_email text,
  service_id uuid,
  service_name text,
  city_id uuid,
  city_name text default 'Toute la Côte d''Ivoire'::text not null,
  area text,
  contract_type text default 'Mission ponctuelle'::text not null,
  salary_range text,
  description text,
  external_url text,
  source text default 'bizzi'::text not null,
  status text default 'pending'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone default (now() + '30 days'::interval) not null,
  company_type text default 'Entreprise formelle'::text not null,
  plan_name text,
  amount integer default 0 not null,
  currency text default 'FCFA'::text not null,
  payment_method text,
  transaction_reference text,
  proof_url text,
  payment_status text default 'pending'::text not null,
  paid_at timestamp with time zone,
  is_boosted boolean default false not null,
  job_credits integer default 1 not null
);

create table public.load_test_runs (
  id uuid default gen_random_uuid() not null,
  name text not null,
  virtual_users integer default 0 not null,
  total_actions integer default 0 not null,
  status text default 'planned'::text not null,
  result_payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table public.map_lookup_events (
  id uuid default gen_random_uuid() not null,
  mode text default 'geocode'::text not null,
  provider_name text default 'mapbox'::text not null,
  query_text text,
  city text,
  distance_km numeric,
  status text default 'ok'::text not null,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  provider_mode text default 'auto'::text not null,
  approximated boolean default false not null,
  from_label text,
  to_label text
);

create table public.market_credits (
  id uuid default gen_random_uuid() not null,
  requester_id uuid not null,
  source_request_id uuid not null,
  original_amount bigint not null,
  balance_amount bigint not null,
  remaining_uses integer default 3 not null,
  status text default 'ACTIVE'::text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.market_ledger (
  id uuid default gen_random_uuid() not null,
  request_id uuid not null,
  solution_id uuid,
  credit_id uuid,
  actor_user_id uuid,
  entry_type text not null,
  amount bigint not null,
  currency text default 'FCFA'::text not null,
  external_reference text,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table public.market_requests (
  id uuid default gen_random_uuid() not null,
  requester_id uuid not null,
  title text not null,
  description text not null,
  public_description text not null,
  category text not null,
  city text not null,
  area text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  duration_days integer not null,
  urgency text default 'normal'::text not null,
  reward_amount bigint not null,
  solver_share_percent integer not null,
  platform_share_percent integer not null,
  solver_reward_amount bigint not null,
  platform_reward_amount bigint not null,
  payment_method text not null,
  payment_reference text,
  funding_status text default 'PENDING'::text not null,
  status text default 'AWAITING_FUNDING'::text not null,
  max_solutions integer default 3 not null,
  solution_count integer default 0 not null,
  current_solution_id uuid,
  certified_only boolean default false not null,
  pause_until timestamp with time zone,
  funded_at timestamp with time zone,
  published_at timestamp with time zone,
  expires_at timestamp with time zone not null,
  matched_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.market_settings (
  id boolean default true not null,
  solver_share_percent integer default 75 not null,
  platform_share_percent integer default 25 not null,
  max_solutions integer default 3 not null,
  pause_hours integer default 2 not null,
  credit_max_uses integer default 3 not null,
  credit_valid_days integer default 30 not null,
  certified_only_direct boolean default false not null,
  updated_at timestamp with time zone default now() not null
);

create table public.market_solutions (
  id uuid default gen_random_uuid() not null,
  request_id uuid not null,
  solver_id uuid not null,
  provider_id uuid,
  solution_type text not null,
  message text not null,
  contact_details text not null,
  service_price bigint,
  solver_reward_amount bigint not null,
  certified_provider boolean default false not null,
  status text default 'SUBMITTED'::text not null,
  reviewed_at timestamp with time zone,
  decided_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.market_solver_permissions (
  user_id uuid not null,
  provider_id uuid,
  can_refer boolean default true not null,
  can_direct boolean default false not null,
  certified boolean default false not null,
  authorized_at timestamp with time zone,
  authorized_by uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.monitoring_forwarding_events (
  id uuid default gen_random_uuid() not null,
  provider_url text,
  status text default 'local_only'::text not null,
  event_count integer default 0 not null,
  response_payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  provider_name text default 'custom'::text not null
);

create table public.payment_checkout_sessions (
  id uuid default gen_random_uuid() not null,
  transaction_reference text not null,
  payment_type text default 'provider_subscription'::text not null,
  amount numeric default 0 not null,
  currency text default 'FCFA'::text not null,
  customer_phone text,
  status text default 'created'::text not null,
  payment_url text,
  payload jsonb default '{}'::jsonb not null,
  aggregator_response jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.payment_transactions (
  id uuid default gen_random_uuid() not null,
  payment_type text default 'provider_subscription'::text not null,
  transaction_reference text not null,
  status text default 'pending'::text not null,
  amount numeric default 0 not null,
  method text default 'aggregateur'::text not null,
  provider_phone text,
  raw_payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.payment_webhook_events (
  id uuid default gen_random_uuid() not null,
  provider_name text default 'aggregateur'::text not null,
  payment_type text default 'provider_subscription'::text not null,
  transaction_reference text not null,
  normalized_status text default 'pending'::text not null,
  amount numeric default 0 not null,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table public.payments (
  id uuid default gen_random_uuid() not null,
  provider_id uuid not null,
  plan_id uuid not null,
  amount integer not null,
  currency text default 'FCFA'::text not null,
  method payment_method not null,
  transaction_reference text,
  proof_url text,
  status payment_status default 'pending'::payment_status not null,
  admin_note text,
  paid_at timestamp with time zone,
  approved_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.platform_settings (
  key text not null,
  value jsonb default 'null'::jsonb not null,
  updated_at timestamp with time zone default now() not null,
  updated_by_email text
);

create table public.pricing_quotes (
  id uuid default gen_random_uuid() not null,
  client_user_id uuid,
  category_id uuid not null,
  city_name text default 'Abidjan'::text not null,
  pickup_address text not null,
  pickup_latitude double precision not null,
  pickup_longitude double precision not null,
  dropoff_address text not null,
  dropoff_latitude double precision not null,
  dropoff_longitude double precision not null,
  distance_km numeric(9,3) not null,
  duration_minutes numeric(9,2) not null,
  base_amount integer not null,
  traffic_multiplier numeric(5,4) default 1 not null,
  availability_multiplier numeric(5,4) default 1 not null,
  time_multiplier numeric(5,4) default 1 not null,
  applied_multiplier numeric(5,4) default 1 not null,
  promotion_id uuid,
  discount_amount integer default 0 not null,
  total_amount integer not null,
  currency text default 'XOF'::text not null,
  pricing_snapshot jsonb default '{}'::jsonb not null,
  expires_at timestamp with time zone not null,
  consumed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

create table public.professional_wallets (
  id uuid default gen_random_uuid() not null,
  driver_id uuid not null,
  balance integer default 0 not null,
  reserved_balance integer default 0 not null,
  currency text default 'XOF'::text not null,
  status text default 'active'::text not null,
  updated_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

create table public.provider_availability (
  provider_id uuid not null,
  status text default 'offline'::text not null,
  weekly_schedule jsonb default '{}'::jsonb not null,
  available_until timestamp with time zone,
  last_seen_at timestamp with time zone,
  updated_at timestamp with time zone default now() not null
);

create table public.provider_reviews (
  id uuid default gen_random_uuid() not null,
  provider_id uuid not null,
  rating integer not null,
  message text,
  status text default 'published'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.provider_services (
  id uuid default gen_random_uuid() not null,
  provider_id uuid not null,
  service_id uuid not null,
  is_primary boolean default false not null,
  created_at timestamp with time zone default now() not null
);

create table public.providers (
  id uuid default gen_random_uuid() not null,
  auth_user_id uuid,
  full_name text not null,
  phone text not null,
  whatsapp text,
  email text,
  photo_url text,
  description text,
  country_id uuid,
  city_id uuid,
  commune_id uuid,
  neighborhood text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  status provider_status default 'pending'::provider_status not null,
  visibility_status provider_visibility_status default 'trial'::provider_visibility_status not null,
  trial_started_at timestamp with time zone,
  trial_ends_at timestamp with time zone,
  subscription_ends_at timestamp with time zone,
  average_rating numeric(2,1) default 0 not null,
  call_count integer default 0 not null,
  is_verified boolean default false not null,
  verification_proof_url text,
  verification_note text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  review_count integer default 0 not null,
  requested_service_name text,
  requested_category_name text,
  boost_ends_at timestamp with time zone,
  delivery_penalty_rate numeric default 0 not null,
  delivery_penalty_remaining integer default 0 not null,
  delivery_penalty_until timestamp with time zone,
  delivery_penalty_reason text,
  delivery_cancel_count integer default 0 not null,
  location_accuracy integer,
  location_timestamp timestamp with time zone,
  location_label text,
  location_full_address text,
  geo_point extensions.geography(Point,4326) generated always as (
CASE
    WHEN (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)) AND ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))) THEN (extensions.st_setsrid(extensions.st_makepoint((longitude)::double precision, (latitude)::double precision), 4326))::extensions.geography
    ELSE NULL::extensions.geography
END) stored
);

create table public.push_notifications (
  id uuid default gen_random_uuid() not null,
  target_type text default 'provider'::text not null,
  provider_id uuid,
  phone text,
  title text not null,
  body text,
  url text,
  payload jsonb default '{}'::jsonb not null,
  status text default 'queued'::text not null,
  error_message text,
  created_at timestamp with time zone default now() not null,
  sent_at timestamp with time zone
);

create table public.push_subscriptions (
  id uuid default gen_random_uuid() not null,
  owner_type text not null,
  provider_id text,
  phone text,
  endpoint text not null,
  subscription jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.recommendation_settings (
  code text default 'default'::text not null,
  weights jsonb default '{"price": 14, "rating": 14, "verified": 6, "proximity": 18, "relevance": 5, "availability": 22, "response_rate": 8, "completed_jobs": 5, "cancellation_rate": 8}'::jsonb not null,
  explanation_template text default 'Bon équilibre entre prix, proximité et qualité.'::text not null,
  updated_at timestamp with time zone default now() not null
);

create table public.reports (
  id uuid default gen_random_uuid() not null,
  provider_id uuid not null,
  reason text not null,
  message text,
  status report_status default 'open'::report_status not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.request_services (
  id uuid default gen_random_uuid() not null,
  request_id uuid not null,
  situation_service_id uuid,
  service_id uuid,
  service_name text not null,
  module_key text default 'services'::text not null,
  status text default 'planned'::text not null,
  selected_provider_id uuid,
  estimated_budget integer,
  required boolean default false not null,
  display_order integer default 100 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.ride_admin_audit_log (
  id bigint generated always as identity not null,
  actor_user_id uuid,
  table_name text not null,
  record_id text,
  operation text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone default now() not null
);

create table public.ride_drivers (
  id uuid default gen_random_uuid() not null,
  provider_id uuid not null,
  status text default 'offline'::text not null,
  verification_status text default 'pending'::text not null,
  current_vehicle_category_id uuid,
  rating numeric(3,2) default 5 not null,
  completed_rides integer default 0 not null,
  acceptance_rate numeric(5,2) default 100 not null,
  cancellation_rate numeric(5,2) default 0 not null,
  last_seen_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.ride_pricing_settings (
  id uuid default gen_random_uuid() not null,
  city_name text default 'Abidjan'::text not null,
  traffic_multiplier numeric(5,4) default 1 not null,
  availability_multiplier numeric(5,4) default 1 not null,
  time_multiplier numeric(5,4) default 1 not null,
  maximum_combined_multiplier numeric(5,4) default 1.25 not null,
  rounding_step integer default 50 not null,
  stop_fee integer default 100 not null,
  driver_search_radius_km numeric(5,2) default 5 not null,
  quote_validity_seconds integer default 300 not null,
  cancellation_fee_before_arrival integer default 0 not null,
  cancellation_fee_after_arrival integer default 500 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.ride_promotions (
  id uuid default gen_random_uuid() not null,
  code text not null,
  discount_type text not null,
  discount_value numeric(10,2) not null,
  maximum_discount integer,
  city_name text,
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone not null,
  maximum_uses integer,
  uses_count integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null
);

create table public.ride_status_history (
  id bigint generated always as identity not null,
  ride_id uuid not null,
  previous_status text,
  new_status text not null,
  actor_user_id uuid,
  actor_role text not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table public.ride_stops (
  id uuid default gen_random_uuid() not null,
  ride_id uuid not null,
  "position" integer not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  status text default 'pending'::text not null,
  reached_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

create table public.rides (
  id uuid default gen_random_uuid() not null,
  client_user_id uuid not null,
  client_name text not null,
  client_phone text not null,
  driver_id uuid,
  vehicle_id uuid,
  category_id uuid not null,
  quote_id uuid not null,
  city_name text default 'Abidjan'::text not null,
  pickup_address text not null,
  pickup_latitude double precision not null,
  pickup_longitude double precision not null,
  pickup_accuracy_m integer,
  dropoff_address text not null,
  dropoff_latitude double precision not null,
  dropoff_longitude double precision not null,
  status text default 'searching'::text not null,
  estimated_distance_km numeric(9,3) not null,
  estimated_duration_minutes numeric(9,2) not null,
  estimated_amount integer not null,
  final_amount integer,
  waiting_minutes numeric(9,2) default 0 not null,
  waiting_amount integer default 0 not null,
  commission_rate numeric(5,4) default 0.19 not null,
  commission_amount integer default 0 not null,
  driver_payout integer default 0 not null,
  payment_method text default 'cash'::text not null,
  payment_status text default 'pending'::text not null,
  cancellation_reason text,
  cancelled_by text,
  idempotency_key text not null,
  accepted_at timestamp with time zone,
  driver_arrived_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.server_alerts (
  id uuid default gen_random_uuid() not null,
  alert_type text not null,
  severity text default 'info'::text not null,
  title text not null,
  message text,
  payload jsonb default '{}'::jsonb not null,
  status text default 'open'::text not null,
  created_at timestamp with time zone default now() not null,
  resolved_at timestamp with time zone
);

create table public.service_proposals (
  id uuid default gen_random_uuid() not null,
  request_id uuid not null,
  provider_id uuid not null,
  price_amount integer not null,
  intervention_delay text not null,
  estimated_duration text not null,
  message text not null,
  guarantee_text text,
  quote_storage_path text,
  status text default 'sent'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  request_service_id uuid
);

create table public.service_request_events (
  id bigint generated always as identity not null,
  request_id uuid not null,
  actor_user_id uuid,
  event_type text not null,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table public.service_request_matches (
  id uuid default gen_random_uuid() not null,
  request_id uuid not null,
  provider_id uuid not null,
  status text default 'notified'::text not null,
  score numeric(6,2) default 0 not null,
  distance_km numeric(8,2),
  radius_km integer default 20 not null,
  public_description text not null,
  approximate_location text not null,
  desired_at timestamp with time zone,
  urgency text,
  budget_amount integer,
  notified_at timestamp with time zone default now() not null,
  viewed_at timestamp with time zone,
  responded_at timestamp with time zone
);

create table public.service_request_media (
  id uuid default gen_random_uuid() not null,
  request_id uuid not null,
  owner_user_id uuid not null,
  media_type text not null,
  storage_path text not null,
  mime_type text,
  byte_size bigint,
  approved_for_provider boolean default true not null,
  created_at timestamp with time zone default now() not null
);

create table public.services (
  id uuid default gen_random_uuid() not null,
  category_id uuid not null,
  name text not null,
  image_url text,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.situation_questions (
  id uuid default gen_random_uuid() not null,
  situation_id uuid not null,
  code text not null,
  question text not null,
  response_type text default 'text'::text not null,
  required boolean default false not null,
  display_order integer default 100 not null,
  conditions jsonb default '{}'::jsonb not null,
  choices jsonb default '[]'::jsonb not null,
  placeholder text default ''::text not null,
  created_at timestamp with time zone default now() not null
);

create table public.situation_services (
  id uuid default gen_random_uuid() not null,
  situation_id uuid not null,
  service_id uuid,
  service_name text not null,
  module_key text default 'services'::text not null,
  required boolean default false not null,
  priority integer default 100 not null,
  estimated_budget integer,
  config jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table public.situations (
  id uuid default gen_random_uuid() not null,
  code text not null,
  name text not null,
  description text default ''::text not null,
  icon text default '✦'::text not null,
  active boolean default true not null,
  default_radius_km integer default 20 not null,
  urgent_radius_km integer default 5 not null,
  allow_grouped_solution boolean default true not null,
  sort_order integer default 100 not null,
  config jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.subscription_plans (
  id uuid default gen_random_uuid() not null,
  name text not null,
  duration_months integer not null,
  price integer not null,
  currency text default 'FCFA'::text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.vehicle_categories (
  id uuid default gen_random_uuid() not null,
  code text not null,
  name text not null,
  description text default ''::text not null,
  icon text default 'car'::text not null,
  sort_order integer default 0 not null,
  minimum_fare integer not null,
  base_fare integer not null,
  per_km integer not null,
  per_minute integer not null,
  waiting_per_minute integer not null,
  free_waiting_minutes integer default 3 not null,
  commission_rate numeric(5,4) default 0.19 not null,
  currency text default 'XOF'::text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.wallet_transactions (
  id uuid default gen_random_uuid() not null,
  wallet_id uuid not null,
  ride_id uuid,
  transaction_type text not null,
  amount integer not null,
  balance_after integer not null,
  reserved_after integer not null,
  idempotency_key text not null,
  description text default ''::text not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);


-- ============================================================
-- Contraintes (cles primaires, uniques, checks)
-- ============================================================

alter table public.admin_audit_events add constraint admin_audit_events_pkey PRIMARY KEY (id);

alter table public.admin_financial_snapshots add constraint admin_financial_snapshots_pkey PRIMARY KEY (id);

alter table public.admin_profiles add constraint admin_profiles_auth_user_id_key UNIQUE (auth_user_id);

alter table public.admin_profiles add constraint admin_profiles_pkey PRIMARY KEY (id);

alter table public.admin_report_snapshots add constraint admin_report_snapshots_pkey PRIMARY KEY (id);

alter table public.advertisements add constraint advertisements_pkey PRIMARY KEY (id);

alter table public.app_error_events add constraint app_error_events_pkey PRIMARY KEY (id);

alter table public.cash_credits add constraint cash_credits_initial_amount_check CHECK ((initial_amount >= (0)::numeric));

alter table public.cash_credits add constraint cash_credits_pkey PRIMARY KEY (id);

alter table public.cash_credits add constraint cash_credits_remaining_amount_check CHECK ((remaining_amount >= (0)::numeric));

alter table public.cash_credits add constraint cash_credits_status_check CHECK ((status = ANY (ARRAY['active'::text, 'consumed'::text, 'expired'::text])));

alter table public.cash_disputes add constraint cash_disputes_pkey PRIMARY KEY (id);

alter table public.cash_disputes add constraint cash_disputes_status_check CHECK ((status = ANY (ARRAY['open'::text, 'under_review'::text, 'resolved_requester'::text, 'resolved_solver'::text, 'partial_resolution'::text, 'closed'::text])));

alter table public.cash_missions add constraint cash_missions_deadline_type_check CHECK ((deadline_type = ANY (ARRAY['aujourd_hui'::text, 'demain'::text, 'cette_semaine'::text, 'urgent'::text, 'date_personnalisee'::text])));

alter table public.cash_missions add constraint cash_missions_pkey PRIMARY KEY (id);

alter table public.cash_missions add constraint cash_missions_reward_amount_check CHECK ((reward_amount >= (0)::numeric));

alter table public.cash_missions add constraint cash_missions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'payment_pending'::text, 'published'::text, 'solution_selected'::text, 'in_progress'::text, 'completion_pending'::text, 'completed'::text, 'expired'::text, 'disputed'::text, 'cancelled'::text])));

alter table public.cash_notifications add constraint cash_notifications_pkey PRIMARY KEY (id);

alter table public.cash_reviews add constraint cash_reviews_mission_id_reviewer_phone_key UNIQUE (mission_id, reviewer_phone);

alter table public.cash_reviews add constraint cash_reviews_pkey PRIMARY KEY (id);

alter table public.cash_reviews add constraint cash_reviews_quality_rating_check CHECK (((quality_rating >= 1) AND (quality_rating <= 5)));

alter table public.cash_reviews add constraint cash_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)));

alter table public.cash_reviews add constraint cash_reviews_reliability_rating_check CHECK (((reliability_rating >= 1) AND (reliability_rating <= 5)));

alter table public.cash_reviews add constraint cash_reviews_speed_rating_check CHECK (((speed_rating >= 1) AND (speed_rating <= 5)));

alter table public.cash_solutions add constraint cash_solutions_duration_unit_check CHECK (((duration_unit IS NULL) OR (duration_unit = ANY (ARRAY['heures'::text, 'jours'::text]))));

alter table public.cash_solutions add constraint cash_solutions_pkey PRIMARY KEY (id);

alter table public.cash_solutions add constraint cash_solutions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'selected'::text, 'rejected'::text, 'withdrawn'::text])));

alter table public.cash_solver_stats add constraint cash_solver_stats_pkey PRIMARY KEY (user_phone);

alter table public.cash_transactions add constraint cash_transactions_pkey PRIMARY KEY (id);

alter table public.cash_transactions add constraint cash_transactions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'rejected'::text])));

alter table public.cash_transactions add constraint cash_transactions_type_check CHECK ((type = ANY (ARRAY['mission_escrow'::text, 'reward_payout'::text, 'commission'::text, 'credit_grant'::text, 'credit_redeem'::text, 'refund'::text])));

alter table public.cash_wallets add constraint cash_wallets_pkey PRIMARY KEY (user_phone);

alter table public.categories add constraint categories_name_key UNIQUE (name);

alter table public.categories add constraint categories_pkey PRIMARY KEY (id);

alter table public.cities add constraint cities_country_id_name_key UNIQUE (country_id, name);

alter table public.cities add constraint cities_pkey PRIMARY KEY (id);

alter table public.communes add constraint communes_city_id_name_key UNIQUE (city_id, name);

alter table public.communes add constraint communes_pkey PRIMARY KEY (id);

alter table public.countries add constraint countries_name_key UNIQUE (name);

alter table public.countries add constraint countries_pkey PRIMARY KEY (id);

alter table public.courier_locations add constraint courier_locations_pkey PRIMARY KEY (provider_id);

alter table public.delivery_dispatch_offers add constraint delivery_dispatch_offers_delivery_id_provider_id_key UNIQUE (delivery_id, provider_id);

alter table public.delivery_dispatch_offers add constraint delivery_dispatch_offers_pkey PRIMARY KEY (id);

alter table public.delivery_requests add constraint delivery_requests_amount_min_v212 CHECK ((amount >= 500));

alter table public.delivery_requests add constraint delivery_requests_client_access_token_check CHECK ((((length(client_access_token) >= 32) AND (length(client_access_token) <= 160)) AND (client_access_token ~ '^[A-Za-z0-9_-]+$'::text)));

alter table public.delivery_requests add constraint delivery_requests_dispatch_status_check CHECK ((dispatch_status = ANY (ARRAY['not_dispatched'::text, 'dispatching'::text, 'matched'::text, 'expired'::text, 'manual_review'::text])));

alter table public.delivery_requests add constraint delivery_requests_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'refunded'::text, 'unpaid'::text])));

alter table public.delivery_requests add constraint delivery_requests_payout_status_check CHECK ((payout_status = ANY (ARRAY['pending'::text, 'payable'::text, 'paid'::text, 'blocked'::text])));

alter table public.delivery_requests add constraint delivery_requests_pkey PRIMARY KEY (id);

alter table public.delivery_requests add constraint delivery_requests_pricing_slot_check CHECK ((pricing_slot = ANY (ARRAY['normal'::text, 'morning_peak'::text, 'evening_peak'::text, 'night'::text])));

alter table public.delivery_requests add constraint delivery_requests_stage_v215 CHECK ((delivery_stage = ANY (ARRAY['waiting'::text, 'accepted'::text, 'picked_up'::text, 'en_route'::text, 'delivered'::text])));

alter table public.delivery_requests add constraint delivery_requests_status_check CHECK ((status = ANY (ARRAY['open'::text, 'assigned'::text, 'closed'::text, 'cancelled'::text])));

alter table public.driver_locations add constraint driver_locations_accuracy_m_check CHECK (((accuracy_m IS NULL) OR (accuracy_m >= (0)::numeric)));

alter table public.driver_locations add constraint driver_locations_heading_check CHECK (((heading IS NULL) OR ((heading >= (0)::numeric) AND (heading <= (360)::numeric))));

alter table public.driver_locations add constraint driver_locations_latitude_check CHECK (((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision)));

alter table public.driver_locations add constraint driver_locations_longitude_check CHECK (((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision)));

alter table public.driver_locations add constraint driver_locations_pkey PRIMARY KEY (id);

alter table public.driver_locations add constraint driver_locations_speed_kmh_check CHECK (((speed_kmh IS NULL) OR (speed_kmh >= (0)::numeric)));

alter table public.driver_vehicles add constraint driver_vehicles_pkey PRIMARY KEY (id);

alter table public.driver_vehicles add constraint driver_vehicles_registration_number_key UNIQUE (registration_number);

alter table public.driver_vehicles add constraint driver_vehicles_seats_check CHECK (((seats >= 1) AND (seats <= 20)));

alter table public.driver_vehicles add constraint driver_vehicles_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text, 'suspended'::text])));

alter table public.event_promotions add constraint event_promotions_dates_check CHECK ((end_datetime > event_datetime));

alter table public.event_promotions add constraint event_promotions_gps_pair_check CHECK ((((latitude IS NULL) AND (longitude IS NULL)) OR (((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision)) AND ((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision)))));

alter table public.event_promotions add constraint event_promotions_location_accuracy_check CHECK (((location_accuracy IS NULL) OR ((location_accuracy >= 0) AND (location_accuracy <= 10000)))) NOT VALID;

alter table public.event_promotions add constraint event_promotions_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));

alter table public.event_promotions add constraint event_promotions_pkey PRIMARY KEY (id);

alter table public.event_promotions add constraint event_promotions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'published'::text, 'rejected'::text, 'expired'::text, 'archived'::text])));

alter table public.event_promotions add constraint event_promotions_visibility_radius_check CHECK (((visibility_radius_km >= (1)::numeric) AND (visibility_radius_km <= (300)::numeric)));

alter table public.exception_places add constraint exception_places_location_accuracy_check CHECK (((location_accuracy IS NULL) OR ((location_accuracy >= 0) AND (location_accuracy <= 10000)))) NOT VALID;

alter table public.exception_places add constraint exception_places_payment_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));

alter table public.exception_places add constraint exception_places_pkey PRIMARY KEY (id);

alter table public.exception_places add constraint exception_places_plan_check CHECK ((plan_id = ANY (ARRAY['free_30_days'::text, 'boost_1_day'::text, 'boost_7_days'::text, 'boost_30_days'::text])));

alter table public.exception_places add constraint exception_places_price_check CHECK ((((plan_id = 'free_30_days'::text) AND (amount = 0) AND (boost_days = 0)) OR ((plan_id = 'boost_1_day'::text) AND (amount = 9900) AND (boost_days = 1)) OR ((plan_id = 'boost_7_days'::text) AND (amount = 24900) AND (boost_days = 7)) OR ((plan_id = 'boost_30_days'::text) AND (amount = 49900) AND (boost_days = 30))));

alter table public.exception_places add constraint exception_places_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'published'::text, 'active'::text, 'rejected'::text, 'archived'::text, 'expired'::text])));

alter table public.express_requests add constraint express_requests_budget_amount_check CHECK (((budget_amount IS NULL) OR (budget_amount >= 0)));

alter table public.express_requests add constraint express_requests_dispatch_status_check CHECK ((dispatch_status = ANY (ARRAY['pending'::text, 'analyzing'::text, 'matching'::text, 'notifying'::text, 'collecting_offers'::text, 'offers_received'::text, 'accepted'::text, 'closed'::text])));

alter table public.express_requests add constraint express_requests_overall_budget_check CHECK (((overall_budget IS NULL) OR (overall_budget >= 0)));

alter table public.express_requests add constraint express_requests_people_count_check CHECK (((people_count IS NULL) OR (people_count > 0)));

alter table public.express_requests add constraint express_requests_pkey PRIMARY KEY (id);

alter table public.express_requests add constraint express_requests_resolution_status_check CHECK ((resolution_status = ANY (ARRAY['request_received'::text, 'need_understood'::text, 'providers_searching'::text, 'proposals_preparing'::text, 'solutions_received'::text, 'provider_selected'::text, 'in_progress'::text, 'resolved'::text])));

alter table public.express_requests add constraint express_requests_search_radius_check CHECK (((search_radius_km >= 0) AND (search_radius_km <= 100)));

alter table public.express_requests add constraint express_requests_solution_mode_check CHECK ((solution_mode = ANY (ARRAY['self'::text, 'zeyds'::text])));

alter table public.express_requests add constraint express_requests_status_check CHECK ((status = ANY (ARRAY['open'::text, 'contacted'::text, 'closed'::text, 'archived'::text])));

alter table public.express_requests add constraint express_requests_urgency_check CHECK ((urgency = ANY (ARRAY['today'::text, '24h'::text, 'week'::text, 'quote'::text])));

alter table public.field_test_results add constraint field_test_results_pkey PRIMARY KEY (id);

alter table public.field_test_sessions add constraint field_test_sessions_pkey PRIMARY KEY (id);

alter table public.food_places add constraint food_places_location_accuracy_check CHECK (((location_accuracy IS NULL) OR ((location_accuracy >= 0) AND (location_accuracy <= 10000)))) NOT VALID;

alter table public.food_places add constraint food_places_pkey PRIMARY KEY (id);

alter table public.food_places add constraint food_places_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'published'::text, 'active'::text, 'rejected'::text, 'archived'::text])));

alter table public.food_places add constraint food_places_verification_status_check CHECK ((verification_status = ANY (ARRAY['none'::text, 'pending'::text, 'verified'::text, 'rejected'::text])));

alter table public.fraud_signals add constraint fraud_signals_pkey PRIMARY KEY (id);

alter table public.integration_health_checks add constraint integration_health_checks_pkey PRIMARY KEY (id);

alter table public.job_offers add constraint job_offers_pkey PRIMARY KEY (id);

alter table public.load_test_runs add constraint load_test_runs_pkey PRIMARY KEY (id);

alter table public.map_lookup_events add constraint map_lookup_events_pkey PRIMARY KEY (id);

alter table public.market_credits add constraint market_credits_balance_amount_check CHECK ((balance_amount >= 0));

alter table public.market_credits add constraint market_credits_original_amount_check CHECK ((original_amount >= 500));

alter table public.market_credits add constraint market_credits_pkey PRIMARY KEY (id);

alter table public.market_credits add constraint market_credits_remaining_uses_check CHECK ((remaining_uses >= 0));

alter table public.market_credits add constraint market_credits_source_request_id_key UNIQUE (source_request_id);

alter table public.market_credits add constraint market_credits_status_check CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'USED'::text, 'EXPIRED'::text, 'FORFEITED'::text])));

alter table public.market_ledger add constraint market_ledger_amount_check CHECK ((amount >= 0));

alter table public.market_ledger add constraint market_ledger_currency_check CHECK ((currency = 'FCFA'::text));

alter table public.market_ledger add constraint market_ledger_entry_type_check CHECK ((entry_type = ANY (ARRAY['HOLD'::text, 'CREDIT_CONSUMED'::text, 'SOLVER_PAYABLE'::text, 'PLATFORM_FEE'::text, 'PAYOUT_CONFIRMED'::text, 'CREDIT_CREATED'::text, 'CREDIT_FORFEITED'::text, 'REFUND'::text])));

alter table public.market_ledger add constraint market_ledger_pkey PRIMARY KEY (id);

alter table public.market_requests add constraint market_request_coordinates_check CHECK ((((latitude IS NULL) AND (longitude IS NULL)) OR (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)) AND ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)))));

alter table public.market_requests add constraint market_request_shares_check CHECK (((solver_share_percent + platform_share_percent) = 100));

alter table public.market_requests add constraint market_request_solution_count_check CHECK ((solution_count <= max_solutions));

alter table public.market_requests add constraint market_request_split_check CHECK (((solver_reward_amount + platform_reward_amount) = reward_amount));

alter table public.market_requests add constraint market_requests_category_check CHECK (((char_length(category) >= 2) AND (char_length(category) <= 80)));

alter table public.market_requests add constraint market_requests_city_check CHECK (((char_length(city) >= 2) AND (char_length(city) <= 80)));

alter table public.market_requests add constraint market_requests_description_check CHECK (((char_length(description) >= 20) AND (char_length(description) <= 1200)));

alter table public.market_requests add constraint market_requests_duration_days_check CHECK ((duration_days = ANY (ARRAY[3, 7, 14, 30])));

alter table public.market_requests add constraint market_requests_funding_status_check CHECK ((funding_status = ANY (ARRAY['PENDING'::text, 'HELD'::text, 'RELEASED'::text, 'CREDITED'::text, 'FORFEITED'::text, 'REFUNDED'::text])));

alter table public.market_requests add constraint market_requests_max_solutions_check CHECK (((max_solutions >= 1) AND (max_solutions <= 10)));

alter table public.market_requests add constraint market_requests_payment_method_check CHECK (((char_length(payment_method) >= 2) AND (char_length(payment_method) <= 40)));

alter table public.market_requests add constraint market_requests_pkey PRIMARY KEY (id);

alter table public.market_requests add constraint market_requests_platform_reward_amount_check CHECK ((platform_reward_amount >= 0));

alter table public.market_requests add constraint market_requests_platform_share_percent_check CHECK (((platform_share_percent >= 0) AND (platform_share_percent <= 100)));

alter table public.market_requests add constraint market_requests_public_description_check CHECK (((char_length(public_description) >= 20) AND (char_length(public_description) <= 1200)));

alter table public.market_requests add constraint market_requests_reward_amount_check CHECK ((reward_amount >= 500));

alter table public.market_requests add constraint market_requests_solution_count_check CHECK ((solution_count >= 0));

alter table public.market_requests add constraint market_requests_solver_reward_amount_check CHECK ((solver_reward_amount >= 0));

alter table public.market_requests add constraint market_requests_solver_share_percent_check CHECK (((solver_share_percent >= 0) AND (solver_share_percent <= 100)));

alter table public.market_requests add constraint market_requests_status_check CHECK ((status = ANY (ARRAY['AWAITING_FUNDING'::text, 'OPEN'::text, 'PAUSED_REVIEW'::text, 'MATCHED'::text, 'PAYOUT_PENDING'::text, 'COMPLETED'::text, 'NO_WINNER'::text, 'CANCELLED'::text, 'EXPIRED'::text])));

alter table public.market_requests add constraint market_requests_title_check CHECK (((char_length(title) >= 5) AND (char_length(title) <= 100)));

alter table public.market_requests add constraint market_requests_urgency_check CHECK ((urgency = ANY (ARRAY['normal'::text, 'urgent'::text])));

alter table public.market_settings add constraint market_settings_credit_max_uses_check CHECK (((credit_max_uses >= 1) AND (credit_max_uses <= 10)));

alter table public.market_settings add constraint market_settings_credit_valid_days_check CHECK (((credit_valid_days >= 1) AND (credit_valid_days <= 365)));

alter table public.market_settings add constraint market_settings_id_check CHECK (id);

alter table public.market_settings add constraint market_settings_max_solutions_check CHECK (((max_solutions >= 1) AND (max_solutions <= 10)));

alter table public.market_settings add constraint market_settings_pause_hours_check CHECK (((pause_hours >= 1) AND (pause_hours <= 48)));

alter table public.market_settings add constraint market_settings_pkey PRIMARY KEY (id);

alter table public.market_settings add constraint market_settings_platform_share_percent_check CHECK (((platform_share_percent >= 0) AND (platform_share_percent <= 100)));

alter table public.market_settings add constraint market_settings_shares_check CHECK (((solver_share_percent + platform_share_percent) = 100));

alter table public.market_settings add constraint market_settings_solver_share_percent_check CHECK (((solver_share_percent >= 0) AND (solver_share_percent <= 100)));

alter table public.market_solutions add constraint market_solutions_contact_details_check CHECK (((char_length(contact_details) >= 5) AND (char_length(contact_details) <= 240)));

alter table public.market_solutions add constraint market_solutions_message_check CHECK (((char_length(message) >= 20) AND (char_length(message) <= 800)));

alter table public.market_solutions add constraint market_solutions_pkey PRIMARY KEY (id);

alter table public.market_solutions add constraint market_solutions_request_id_solver_id_key UNIQUE (request_id, solver_id);

alter table public.market_solutions add constraint market_solutions_service_price_check CHECK (((service_price IS NULL) OR (service_price >= 0)));

alter table public.market_solutions add constraint market_solutions_solution_type_check CHECK ((solution_type = ANY (ARRAY['REFERRAL'::text, 'DIRECT'::text])));

alter table public.market_solutions add constraint market_solutions_solver_reward_amount_check CHECK ((solver_reward_amount >= 0));

alter table public.market_solutions add constraint market_solutions_status_check CHECK ((status = ANY (ARRAY['SUBMITTED'::text, 'UNDER_REVIEW'::text, 'ACCEPTED'::text, 'REJECTED'::text, 'WITHDRAWN'::text, 'PAYOUT_PENDING'::text, 'PAID'::text])));

alter table public.market_solver_permissions add constraint market_solver_permissions_pkey PRIMARY KEY (user_id);

alter table public.monitoring_forwarding_events add constraint monitoring_forwarding_events_pkey PRIMARY KEY (id);

alter table public.payment_checkout_sessions add constraint payment_checkout_sessions_pkey PRIMARY KEY (id);

alter table public.payment_checkout_sessions add constraint payment_checkout_sessions_transaction_reference_key UNIQUE (transaction_reference);

alter table public.payment_transactions add constraint payment_transactions_pkey PRIMARY KEY (id);

alter table public.payment_transactions add constraint payment_transactions_transaction_reference_key UNIQUE (transaction_reference);

alter table public.payment_webhook_events add constraint payment_webhook_events_pkey PRIMARY KEY (id);

alter table public.payments add constraint payments_pkey PRIMARY KEY (id);

alter table public.platform_settings add constraint platform_settings_pkey PRIMARY KEY (key);

alter table public.pricing_quotes add constraint pricing_quotes_base_amount_check CHECK ((base_amount >= 0));

alter table public.pricing_quotes add constraint pricing_quotes_currency_check CHECK ((currency = 'XOF'::text));

alter table public.pricing_quotes add constraint pricing_quotes_discount_amount_check CHECK ((discount_amount >= 0));

alter table public.pricing_quotes add constraint pricing_quotes_distance_km_check CHECK ((distance_km >= (0)::numeric));

alter table public.pricing_quotes add constraint pricing_quotes_dropoff_latitude_check CHECK (((dropoff_latitude >= ('-90'::integer)::double precision) AND (dropoff_latitude <= (90)::double precision)));

alter table public.pricing_quotes add constraint pricing_quotes_dropoff_longitude_check CHECK (((dropoff_longitude >= ('-180'::integer)::double precision) AND (dropoff_longitude <= (180)::double precision)));

alter table public.pricing_quotes add constraint pricing_quotes_duration_minutes_check CHECK ((duration_minutes >= (0)::numeric));

alter table public.pricing_quotes add constraint pricing_quotes_pickup_latitude_check CHECK (((pickup_latitude >= ('-90'::integer)::double precision) AND (pickup_latitude <= (90)::double precision)));

alter table public.pricing_quotes add constraint pricing_quotes_pickup_longitude_check CHECK (((pickup_longitude >= ('-180'::integer)::double precision) AND (pickup_longitude <= (180)::double precision)));

alter table public.pricing_quotes add constraint pricing_quotes_pkey PRIMARY KEY (id);

alter table public.pricing_quotes add constraint pricing_quotes_total_amount_check CHECK ((total_amount >= 0));

alter table public.professional_wallets add constraint professional_wallets_balance_check CHECK ((balance >= 0));

alter table public.professional_wallets add constraint professional_wallets_check CHECK (((reserved_balance >= 0) AND (reserved_balance <= balance)));

alter table public.professional_wallets add constraint professional_wallets_currency_check CHECK ((currency = 'XOF'::text));

alter table public.professional_wallets add constraint professional_wallets_driver_id_key UNIQUE (driver_id);

alter table public.professional_wallets add constraint professional_wallets_pkey PRIMARY KEY (id);

alter table public.professional_wallets add constraint professional_wallets_status_check CHECK ((status = ANY (ARRAY['active'::text, 'blocked'::text, 'closed'::text])));

alter table public.provider_availability add constraint provider_availability_pkey PRIMARY KEY (provider_id);

alter table public.provider_availability add constraint provider_availability_status_check CHECK ((status = ANY (ARRAY['available'::text, 'busy'::text, 'offline'::text, 'on_leave'::text])));

alter table public.provider_reviews add constraint provider_reviews_pkey PRIMARY KEY (id);

alter table public.provider_reviews add constraint provider_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)));

alter table public.provider_reviews add constraint provider_reviews_status_check CHECK ((status = ANY (ARRAY['published'::text, 'hidden'::text, 'reviewed'::text])));

alter table public.provider_services add constraint provider_services_pkey PRIMARY KEY (id);

alter table public.provider_services add constraint provider_services_provider_id_service_id_key UNIQUE (provider_id, service_id);

alter table public.providers add constraint providers_location_accuracy_check CHECK (((location_accuracy IS NULL) OR ((location_accuracy >= 0) AND (location_accuracy <= 10000)))) NOT VALID;

alter table public.providers add constraint providers_phone_key UNIQUE (phone);

alter table public.providers add constraint providers_pkey PRIMARY KEY (id);

alter table public.push_notifications add constraint push_notifications_pkey PRIMARY KEY (id);

alter table public.push_subscriptions add constraint push_subscriptions_endpoint_key UNIQUE (endpoint);

alter table public.push_subscriptions add constraint push_subscriptions_owner_type_check CHECK ((owner_type = ANY (ARRAY['provider'::text, 'client'::text])));

alter table public.push_subscriptions add constraint push_subscriptions_pkey PRIMARY KEY (id);

alter table public.recommendation_settings add constraint recommendation_settings_pkey PRIMARY KEY (code);

alter table public.reports add constraint reports_pkey PRIMARY KEY (id);

alter table public.request_services add constraint request_services_estimated_budget_check CHECK (((estimated_budget IS NULL) OR (estimated_budget >= 0)));

alter table public.request_services add constraint request_services_module_key_check CHECK ((module_key = ANY (ARRAY['services'::text, 'delivery'::text, 'food'::text, 'events'::text, 'jobs'::text, 'venues'::text, 'exception_places'::text])));

alter table public.request_services add constraint request_services_pkey PRIMARY KEY (id);

alter table public.request_services add constraint request_services_request_id_service_name_key UNIQUE (request_id, service_name);

alter table public.request_services add constraint request_services_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'searching'::text, 'proposals_received'::text, 'selected'::text, 'in_progress'::text, 'resolved'::text, 'removed'::text])));

alter table public.ride_admin_audit_log add constraint ride_admin_audit_log_operation_check CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])));

alter table public.ride_admin_audit_log add constraint ride_admin_audit_log_pkey PRIMARY KEY (id);

alter table public.ride_drivers add constraint ride_drivers_acceptance_rate_check CHECK (((acceptance_rate >= (0)::numeric) AND (acceptance_rate <= (100)::numeric)));

alter table public.ride_drivers add constraint ride_drivers_cancellation_rate_check CHECK (((cancellation_rate >= (0)::numeric) AND (cancellation_rate <= (100)::numeric)));

alter table public.ride_drivers add constraint ride_drivers_completed_rides_check CHECK ((completed_rides >= 0));

alter table public.ride_drivers add constraint ride_drivers_pkey PRIMARY KEY (id);

alter table public.ride_drivers add constraint ride_drivers_provider_id_key UNIQUE (provider_id);

alter table public.ride_drivers add constraint ride_drivers_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric)));

alter table public.ride_drivers add constraint ride_drivers_status_check CHECK ((status = ANY (ARRAY['available'::text, 'busy'::text, 'offline'::text, 'suspended'::text])));

alter table public.ride_drivers add constraint ride_drivers_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text, 'suspended'::text])));

alter table public.ride_pricing_settings add constraint ride_pricing_settings_availability_multiplier_check CHECK (((availability_multiplier >= (1)::numeric) AND (availability_multiplier <= 1.25)));

alter table public.ride_pricing_settings add constraint ride_pricing_settings_cancellation_fee_after_arrival_check CHECK ((cancellation_fee_after_arrival >= 0));

alter table public.ride_pricing_settings add constraint ride_pricing_settings_cancellation_fee_before_arrival_check CHECK ((cancellation_fee_before_arrival >= 0));

alter table public.ride_pricing_settings add constraint ride_pricing_settings_city_name_key UNIQUE (city_name);

alter table public.ride_pricing_settings add constraint ride_pricing_settings_driver_search_radius_km_check CHECK (((driver_search_radius_km >= 0.5) AND (driver_search_radius_km <= (100)::numeric)));

alter table public.ride_pricing_settings add constraint ride_pricing_settings_maximum_combined_multiplier_check CHECK (((maximum_combined_multiplier >= (1)::numeric) AND (maximum_combined_multiplier <= (2)::numeric)));

alter table public.ride_pricing_settings add constraint ride_pricing_settings_pkey PRIMARY KEY (id);

alter table public.ride_pricing_settings add constraint ride_pricing_settings_quote_validity_seconds_check CHECK (((quote_validity_seconds >= 30) AND (quote_validity_seconds <= 3600)));

alter table public.ride_pricing_settings add constraint ride_pricing_settings_rounding_step_check CHECK ((rounding_step > 0));

alter table public.ride_pricing_settings add constraint ride_pricing_settings_stop_fee_check CHECK ((stop_fee >= 0));

alter table public.ride_pricing_settings add constraint ride_pricing_settings_time_multiplier_check CHECK (((time_multiplier >= (1)::numeric) AND (time_multiplier <= 1.25)));

alter table public.ride_pricing_settings add constraint ride_pricing_settings_traffic_multiplier_check CHECK (((traffic_multiplier >= (1)::numeric) AND (traffic_multiplier <= 1.25)));

alter table public.ride_promotions add constraint ride_promotions_check CHECK ((ends_at > starts_at));

alter table public.ride_promotions add constraint ride_promotions_code_key UNIQUE (code);

alter table public.ride_promotions add constraint ride_promotions_discount_type_check CHECK ((discount_type = ANY (ARRAY['fixed'::text, 'percentage'::text])));

alter table public.ride_promotions add constraint ride_promotions_discount_value_check CHECK ((discount_value > (0)::numeric));

alter table public.ride_promotions add constraint ride_promotions_maximum_discount_check CHECK (((maximum_discount IS NULL) OR (maximum_discount >= 0)));

alter table public.ride_promotions add constraint ride_promotions_maximum_uses_check CHECK (((maximum_uses IS NULL) OR (maximum_uses > 0)));

alter table public.ride_promotions add constraint ride_promotions_pkey PRIMARY KEY (id);

alter table public.ride_promotions add constraint ride_promotions_uses_count_check CHECK ((uses_count >= 0));

alter table public.ride_status_history add constraint ride_status_history_actor_role_check CHECK ((actor_role = ANY (ARRAY['client'::text, 'driver'::text, 'admin'::text, 'system'::text])));

alter table public.ride_status_history add constraint ride_status_history_pkey PRIMARY KEY (id);

alter table public.ride_stops add constraint ride_stops_latitude_check CHECK (((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision)));

alter table public.ride_stops add constraint ride_stops_longitude_check CHECK (((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision)));

alter table public.ride_stops add constraint ride_stops_pkey PRIMARY KEY (id);

alter table public.ride_stops add constraint ride_stops_position_check CHECK ((("position" >= 1) AND ("position" <= 10)));

alter table public.ride_stops add constraint ride_stops_ride_id_position_key UNIQUE (ride_id, "position");

alter table public.ride_stops add constraint ride_stops_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'reached'::text, 'skipped'::text])));

alter table public.rides add constraint rides_cancelled_by_check CHECK (((cancelled_by IS NULL) OR (cancelled_by = ANY (ARRAY['client'::text, 'driver'::text, 'admin'::text, 'system'::text]))));

alter table public.rides add constraint rides_commission_amount_check CHECK ((commission_amount >= 0));

alter table public.rides add constraint rides_commission_rate_check CHECK (((commission_rate >= (0)::numeric) AND (commission_rate <= (1)::numeric)));

alter table public.rides add constraint rides_driver_payout_check CHECK ((driver_payout >= 0));

alter table public.rides add constraint rides_dropoff_latitude_check CHECK (((dropoff_latitude >= ('-90'::integer)::double precision) AND (dropoff_latitude <= (90)::double precision)));

alter table public.rides add constraint rides_dropoff_longitude_check CHECK (((dropoff_longitude >= ('-180'::integer)::double precision) AND (dropoff_longitude <= (180)::double precision)));

alter table public.rides add constraint rides_estimated_amount_check CHECK ((estimated_amount >= 0));

alter table public.rides add constraint rides_estimated_distance_km_check CHECK ((estimated_distance_km >= (0)::numeric));

alter table public.rides add constraint rides_estimated_duration_minutes_check CHECK ((estimated_duration_minutes >= (0)::numeric));

alter table public.rides add constraint rides_final_amount_check CHECK (((final_amount IS NULL) OR (final_amount >= 0)));

alter table public.rides add constraint rides_idempotency_key_key UNIQUE (idempotency_key);

alter table public.rides add constraint rides_payment_method_check CHECK ((payment_method = ANY (ARRAY['cash'::text, 'wave'::text, 'orange_money'::text, 'mtn_money'::text, 'card'::text])));

alter table public.rides add constraint rides_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'authorized'::text, 'paid'::text, 'failed'::text, 'refunded'::text, 'cash_due'::text, 'cash_collected'::text])));

alter table public.rides add constraint rides_pickup_accuracy_m_check CHECK (((pickup_accuracy_m IS NULL) OR ((pickup_accuracy_m >= 0) AND (pickup_accuracy_m <= 10000))));

alter table public.rides add constraint rides_pickup_latitude_check CHECK (((pickup_latitude >= ('-90'::integer)::double precision) AND (pickup_latitude <= (90)::double precision)));

alter table public.rides add constraint rides_pickup_longitude_check CHECK (((pickup_longitude >= ('-180'::integer)::double precision) AND (pickup_longitude <= (180)::double precision)));

alter table public.rides add constraint rides_pkey PRIMARY KEY (id);

alter table public.rides add constraint rides_quote_id_key UNIQUE (quote_id);

alter table public.rides add constraint rides_status_check CHECK ((status = ANY (ARRAY['searching'::text, 'accepted'::text, 'driver_arriving'::text, 'driver_arrived'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'expired'::text])));

alter table public.rides add constraint rides_waiting_amount_check CHECK ((waiting_amount >= 0));

alter table public.rides add constraint rides_waiting_minutes_check CHECK ((waiting_minutes >= (0)::numeric));

alter table public.server_alerts add constraint server_alerts_pkey PRIMARY KEY (id);

alter table public.service_proposals add constraint service_proposals_pkey PRIMARY KEY (id);

alter table public.service_proposals add constraint service_proposals_price_amount_check CHECK ((price_amount >= 0));

alter table public.service_proposals add constraint service_proposals_request_id_provider_id_key UNIQUE (request_id, provider_id);

alter table public.service_proposals add constraint service_proposals_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'declined'::text, 'withdrawn'::text, 'expired'::text])));

alter table public.service_request_events add constraint service_request_events_pkey PRIMARY KEY (id);

alter table public.service_request_matches add constraint service_request_matches_pkey PRIMARY KEY (id);

alter table public.service_request_matches add constraint service_request_matches_request_id_provider_id_key UNIQUE (request_id, provider_id);

alter table public.service_request_matches add constraint service_request_matches_status_check CHECK ((status = ANY (ARRAY['notified'::text, 'viewing'::text, 'responding'::text, 'ignored'::text, 'expired'::text])));

alter table public.service_request_media add constraint service_request_media_byte_size_check CHECK (((byte_size IS NULL) OR ((byte_size >= 1) AND (byte_size <= 52428800))));

alter table public.service_request_media add constraint service_request_media_media_type_check CHECK ((media_type = ANY (ARRAY['photo'::text, 'video'::text])));

alter table public.service_request_media add constraint service_request_media_pkey PRIMARY KEY (id);

alter table public.services add constraint services_category_id_name_key UNIQUE (category_id, name);

alter table public.services add constraint services_pkey PRIMARY KEY (id);

alter table public.situation_questions add constraint situation_questions_code_check CHECK ((code ~ '^[a-z0-9_]+$'::text));

alter table public.situation_questions add constraint situation_questions_pkey PRIMARY KEY (id);

alter table public.situation_questions add constraint situation_questions_response_type_check CHECK ((response_type = ANY (ARRAY['text'::text, 'number'::text, 'choice'::text, 'boolean'::text, 'date'::text, 'time'::text, 'location'::text, 'budget'::text])));

alter table public.situation_questions add constraint situation_questions_situation_id_code_key UNIQUE (situation_id, code);

alter table public.situation_services add constraint situation_services_estimated_budget_check CHECK (((estimated_budget IS NULL) OR (estimated_budget >= 0)));

alter table public.situation_services add constraint situation_services_module_key_check CHECK ((module_key = ANY (ARRAY['services'::text, 'delivery'::text, 'food'::text, 'events'::text, 'jobs'::text, 'venues'::text, 'exception_places'::text])));

alter table public.situation_services add constraint situation_services_pkey PRIMARY KEY (id);

alter table public.situation_services add constraint situation_services_priority_check CHECK (((priority >= 1) AND (priority <= 999)));

alter table public.situation_services add constraint situation_services_situation_id_service_name_key UNIQUE (situation_id, service_name);

alter table public.situations add constraint situations_code_check CHECK ((code ~ '^[a-z0-9_]+$'::text));

alter table public.situations add constraint situations_code_key UNIQUE (code);

alter table public.situations add constraint situations_default_radius_km_check CHECK (((default_radius_km >= 1) AND (default_radius_km <= 100)));

alter table public.situations add constraint situations_pkey PRIMARY KEY (id);

alter table public.situations add constraint situations_urgent_radius_km_check CHECK (((urgent_radius_km >= 1) AND (urgent_radius_km <= 50)));

alter table public.subscription_plans add constraint subscription_plans_name_key UNIQUE (name);

alter table public.subscription_plans add constraint subscription_plans_pkey PRIMARY KEY (id);

alter table public.vehicle_categories add constraint vehicle_categories_base_fare_check CHECK ((base_fare >= 0));

alter table public.vehicle_categories add constraint vehicle_categories_code_check CHECK ((code = ANY (ARRAY['basic'::text, 'normal'::text, 'premium'::text, 'ultra_premium'::text])));

alter table public.vehicle_categories add constraint vehicle_categories_code_key UNIQUE (code);

alter table public.vehicle_categories add constraint vehicle_categories_commission_rate_check CHECK (((commission_rate >= (0)::numeric) AND (commission_rate <= (1)::numeric)));

alter table public.vehicle_categories add constraint vehicle_categories_currency_check CHECK ((currency = 'XOF'::text));

alter table public.vehicle_categories add constraint vehicle_categories_free_waiting_minutes_check CHECK (((free_waiting_minutes >= 0) AND (free_waiting_minutes <= 60)));

alter table public.vehicle_categories add constraint vehicle_categories_minimum_fare_check CHECK ((minimum_fare >= 0));

alter table public.vehicle_categories add constraint vehicle_categories_per_km_check CHECK ((per_km >= 0));

alter table public.vehicle_categories add constraint vehicle_categories_per_minute_check CHECK ((per_minute >= 0));

alter table public.vehicle_categories add constraint vehicle_categories_pkey PRIMARY KEY (id);

alter table public.vehicle_categories add constraint vehicle_categories_waiting_per_minute_check CHECK ((waiting_per_minute >= 0));

alter table public.wallet_transactions add constraint wallet_transactions_amount_check CHECK ((amount >= 0));

alter table public.wallet_transactions add constraint wallet_transactions_balance_after_check CHECK ((balance_after >= 0));

alter table public.wallet_transactions add constraint wallet_transactions_idempotency_key_key UNIQUE (idempotency_key);

alter table public.wallet_transactions add constraint wallet_transactions_pkey PRIMARY KEY (id);

alter table public.wallet_transactions add constraint wallet_transactions_reserved_after_check CHECK ((reserved_after >= 0));

alter table public.wallet_transactions add constraint wallet_transactions_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['credit'::text, 'reserve'::text, 'commission_debit'::text, 'release'::text, 'adjustment'::text, 'refund'::text])));


-- ============================================================
-- Cles etrangeres
-- ============================================================

alter table public.advertisements add constraint advertisements_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL;

alter table public.advertisements add constraint advertisements_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES communes(id) ON DELETE SET NULL;

alter table public.advertisements add constraint advertisements_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;

alter table public.cash_credits add constraint cash_credits_source_mission_id_fkey FOREIGN KEY (source_mission_id) REFERENCES cash_missions(id) ON DELETE SET NULL;

alter table public.cash_disputes add constraint cash_disputes_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES cash_missions(id) ON DELETE CASCADE;

alter table public.cash_missions add constraint cash_missions_selected_solution_fk FOREIGN KEY (selected_solution_id) REFERENCES cash_solutions(id) ON DELETE SET NULL;

alter table public.cash_notifications add constraint cash_notifications_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES cash_missions(id) ON DELETE CASCADE;

alter table public.cash_reviews add constraint cash_reviews_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES cash_missions(id) ON DELETE CASCADE;

alter table public.cash_solutions add constraint cash_solutions_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES cash_missions(id) ON DELETE CASCADE;

alter table public.cash_transactions add constraint cash_transactions_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES cash_missions(id) ON DELETE SET NULL;

alter table public.cities add constraint cities_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;

alter table public.communes add constraint communes_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE;

alter table public.courier_locations add constraint courier_locations_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;

alter table public.delivery_dispatch_offers add constraint delivery_dispatch_offers_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES delivery_requests(id) ON DELETE CASCADE;

alter table public.delivery_dispatch_offers add constraint delivery_dispatch_offers_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;

alter table public.delivery_requests add constraint delivery_requests_assigned_provider_id_fkey FOREIGN KEY (assigned_provider_id) REFERENCES providers(id) ON DELETE SET NULL;

alter table public.driver_locations add constraint driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES ride_drivers(id) ON DELETE CASCADE;

alter table public.driver_locations add constraint driver_locations_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE;

alter table public.driver_vehicles add constraint driver_vehicles_category_id_fkey FOREIGN KEY (category_id) REFERENCES vehicle_categories(id) ON DELETE RESTRICT;

alter table public.driver_vehicles add constraint driver_vehicles_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES ride_drivers(id) ON DELETE CASCADE;

alter table public.express_requests add constraint express_requests_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL;

alter table public.express_requests add constraint express_requests_client_user_id_fkey FOREIGN KEY (client_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

alter table public.express_requests add constraint express_requests_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

alter table public.express_requests add constraint express_requests_situation_id_fkey FOREIGN KEY (situation_id) REFERENCES situations(id) ON DELETE SET NULL;

alter table public.field_test_results add constraint field_test_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES field_test_sessions(id) ON DELETE CASCADE;

alter table public.fraud_signals add constraint fraud_signals_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;

alter table public.job_offers add constraint job_offers_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL;

alter table public.job_offers add constraint job_offers_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

alter table public.market_credits add constraint market_credits_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

alter table public.market_credits add constraint market_credits_source_request_id_fkey FOREIGN KEY (source_request_id) REFERENCES market_requests(id) ON DELETE RESTRICT;

alter table public.market_ledger add constraint market_ledger_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

alter table public.market_ledger add constraint market_ledger_credit_id_fkey FOREIGN KEY (credit_id) REFERENCES market_credits(id) ON DELETE RESTRICT;

alter table public.market_ledger add constraint market_ledger_request_id_fkey FOREIGN KEY (request_id) REFERENCES market_requests(id) ON DELETE RESTRICT;

alter table public.market_ledger add constraint market_ledger_solution_id_fkey FOREIGN KEY (solution_id) REFERENCES market_solutions(id) ON DELETE RESTRICT;

alter table public.market_requests add constraint market_requests_current_solution_fk FOREIGN KEY (current_solution_id) REFERENCES market_solutions(id) ON DELETE SET NULL;

alter table public.market_requests add constraint market_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

alter table public.market_solutions add constraint market_solutions_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;

alter table public.market_solutions add constraint market_solutions_request_id_fkey FOREIGN KEY (request_id) REFERENCES market_requests(id) ON DELETE CASCADE;

alter table public.market_solutions add constraint market_solutions_solver_id_fkey FOREIGN KEY (solver_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

alter table public.market_solver_permissions add constraint market_solver_permissions_authorized_by_fkey FOREIGN KEY (authorized_by) REFERENCES auth.users(id) ON DELETE SET NULL;

alter table public.market_solver_permissions add constraint market_solver_permissions_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;

alter table public.market_solver_permissions add constraint market_solver_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public.payments add constraint payments_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id);

alter table public.payments add constraint payments_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;

alter table public.pricing_quotes add constraint pricing_quotes_category_id_fkey FOREIGN KEY (category_id) REFERENCES vehicle_categories(id) ON DELETE RESTRICT;

alter table public.pricing_quotes add constraint pricing_quotes_client_user_id_fkey FOREIGN KEY (client_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

alter table public.pricing_quotes add constraint pricing_quotes_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES ride_promotions(id) ON DELETE SET NULL;

alter table public.professional_wallets add constraint professional_wallets_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES ride_drivers(id) ON DELETE CASCADE;

alter table public.provider_availability add constraint provider_availability_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;

alter table public.provider_reviews add constraint provider_reviews_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;

alter table public.provider_services add constraint provider_services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;

alter table public.provider_services add constraint provider_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE;

alter table public.providers add constraint providers_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id);

alter table public.providers add constraint providers_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES communes(id);

alter table public.providers add constraint providers_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id);

alter table public.push_notifications add constraint push_notifications_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;

alter table public.reports add constraint reports_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;

alter table public.request_services add constraint request_services_request_id_fkey FOREIGN KEY (request_id) REFERENCES express_requests(id) ON DELETE CASCADE;

alter table public.request_services add constraint request_services_selected_provider_id_fkey FOREIGN KEY (selected_provider_id) REFERENCES providers(id) ON DELETE SET NULL;

alter table public.request_services add constraint request_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

alter table public.request_services add constraint request_services_situation_service_id_fkey FOREIGN KEY (situation_service_id) REFERENCES situation_services(id) ON DELETE SET NULL;

alter table public.ride_admin_audit_log add constraint ride_admin_audit_log_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

alter table public.ride_drivers add constraint ride_drivers_current_vehicle_category_id_fkey FOREIGN KEY (current_vehicle_category_id) REFERENCES vehicle_categories(id) ON DELETE SET NULL;

alter table public.ride_drivers add constraint ride_drivers_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;

alter table public.ride_status_history add constraint ride_status_history_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

alter table public.ride_status_history add constraint ride_status_history_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE;

alter table public.ride_stops add constraint ride_stops_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE;

alter table public.rides add constraint rides_category_id_fkey FOREIGN KEY (category_id) REFERENCES vehicle_categories(id) ON DELETE RESTRICT;

alter table public.rides add constraint rides_client_user_id_fkey FOREIGN KEY (client_user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

alter table public.rides add constraint rides_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES ride_drivers(id) ON DELETE SET NULL;

alter table public.rides add constraint rides_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES pricing_quotes(id) ON DELETE RESTRICT;

alter table public.rides add constraint rides_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES driver_vehicles(id) ON DELETE SET NULL;

alter table public.service_proposals add constraint service_proposals_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;

alter table public.service_proposals add constraint service_proposals_request_id_fkey FOREIGN KEY (request_id) REFERENCES express_requests(id) ON DELETE CASCADE;

alter table public.service_proposals add constraint service_proposals_request_service_id_fkey FOREIGN KEY (request_service_id) REFERENCES request_services(id) ON DELETE CASCADE;

alter table public.service_request_events add constraint service_request_events_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

alter table public.service_request_events add constraint service_request_events_request_id_fkey FOREIGN KEY (request_id) REFERENCES express_requests(id) ON DELETE CASCADE;

alter table public.service_request_matches add constraint service_request_matches_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;

alter table public.service_request_matches add constraint service_request_matches_request_id_fkey FOREIGN KEY (request_id) REFERENCES express_requests(id) ON DELETE CASCADE;

alter table public.service_request_media add constraint service_request_media_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public.service_request_media add constraint service_request_media_request_id_fkey FOREIGN KEY (request_id) REFERENCES express_requests(id) ON DELETE CASCADE;

alter table public.services add constraint services_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

alter table public.situation_questions add constraint situation_questions_situation_id_fkey FOREIGN KEY (situation_id) REFERENCES situations(id) ON DELETE CASCADE;

alter table public.situation_services add constraint situation_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

alter table public.situation_services add constraint situation_services_situation_id_fkey FOREIGN KEY (situation_id) REFERENCES situations(id) ON DELETE CASCADE;

alter table public.wallet_transactions add constraint wallet_transactions_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE RESTRICT;

alter table public.wallet_transactions add constraint wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES professional_wallets(id) ON DELETE RESTRICT;


-- ============================================================
-- Index
-- ============================================================

CREATE INDEX delivery_requests_dropoff_geo_point_gix ON public.delivery_requests USING gist (dropoff_geo_point);

CREATE INDEX delivery_requests_pickup_geo_point_gix ON public.delivery_requests USING gist (pickup_geo_point);

CREATE INDEX delivery_requests_tracking_v215_idx ON public.delivery_requests USING btree (status, delivery_stage, courier_location_at DESC);

CREATE INDEX driver_locations_latest_idx ON public.driver_locations USING btree (driver_id, recorded_at DESC);

CREATE INDEX driver_locations_ride_idx ON public.driver_locations USING btree (ride_id, recorded_at DESC) WHERE (ride_id IS NOT NULL);

CREATE INDEX driver_vehicles_category_idx ON public.driver_vehicles USING btree (category_id);

CREATE INDEX driver_vehicles_driver_idx ON public.driver_vehicles USING btree (driver_id, is_active, verification_status);

CREATE INDEX event_promotions_geo_point_gix ON public.event_promotions USING gist (geo_point);

CREATE INDEX exception_places_city_idx ON public.exception_places USING btree (city_name, status);

CREATE INDEX exception_places_geo_point_gix ON public.exception_places USING gist (geo_point);

CREATE INDEX exception_places_public_order_idx ON public.exception_places USING btree (status, boost_ends_at DESC, visibility_ends_at DESC, created_at DESC);

CREATE INDEX express_requests_city_id_idx ON public.express_requests USING btree (city_id) WHERE (city_id IS NOT NULL);

CREATE INDEX express_requests_service_id_idx ON public.express_requests USING btree (service_id) WHERE (service_id IS NOT NULL);

CREATE INDEX express_requests_situation_id_idx ON public.express_requests USING btree (situation_id) WHERE (situation_id IS NOT NULL);

CREATE INDEX express_requests_situation_idx ON public.express_requests USING btree (situation_code, resolution_status, created_at DESC) WHERE (situation_code IS NOT NULL);

CREATE INDEX express_requests_smart_dispatch_idx ON public.express_requests USING btree (dispatch_status, search_radius_km, created_at) WHERE (status = 'open'::text);

CREATE INDEX express_requests_smart_owner_idx ON public.express_requests USING btree (client_user_id, status, created_at DESC) WHERE (client_user_id IS NOT NULL);

CREATE INDEX field_test_results_session_idx ON public.field_test_results USING btree (session_id, created_at DESC);

CREATE INDEX food_places_created_at_idx ON public.food_places USING btree (created_at DESC);

CREATE INDEX food_places_geo_point_gix ON public.food_places USING gist (geo_point);

CREATE INDEX food_places_specialty_idx ON public.food_places USING btree (main_specialty);

CREATE INDEX food_places_status_city_idx ON public.food_places USING btree (status, city_name);

CREATE INDEX idx_admin_audit_events_actor ON public.admin_audit_events USING btree (actor_auth_user_id, created_at DESC);

CREATE INDEX idx_admin_audit_events_created ON public.admin_audit_events USING btree (created_at DESC);

CREATE INDEX idx_advertisements_zone ON public.advertisements USING btree (city_id, commune_id, status);

CREATE INDEX idx_app_error_events_created ON public.app_error_events USING btree (created_at DESC);

CREATE INDEX idx_app_error_events_severity_created ON public.app_error_events USING btree (severity, created_at DESC);

CREATE INDEX idx_cash_credits_user ON public.cash_credits USING btree (user_phone, status);

CREATE INDEX idx_cash_disputes_mission ON public.cash_disputes USING btree (mission_id);

CREATE INDEX idx_cash_disputes_status ON public.cash_disputes USING btree (status, created_at DESC);

CREATE INDEX idx_cash_missions_expiry ON public.cash_missions USING btree (status, expires_at) WHERE (status = ANY (ARRAY['published'::text, 'solution_selected'::text, 'in_progress'::text]));

CREATE INDEX idx_cash_missions_requester ON public.cash_missions USING btree (requester_phone);

CREATE INDEX idx_cash_missions_status ON public.cash_missions USING btree (status, created_at DESC);

CREATE INDEX idx_cash_notifications_user ON public.cash_notifications USING btree (user_phone, read_at, created_at DESC);

CREATE INDEX idx_cash_solutions_mission ON public.cash_solutions USING btree (mission_id, status);

CREATE UNIQUE INDEX idx_cash_solutions_one_active_per_solver ON public.cash_solutions USING btree (mission_id, solver_phone) WHERE (status = 'pending'::text);

CREATE INDEX idx_cash_solutions_solver ON public.cash_solutions USING btree (solver_phone);

CREATE INDEX idx_cash_transactions_mission ON public.cash_transactions USING btree (mission_id);

CREATE UNIQUE INDEX idx_cash_transactions_payment_ref ON public.cash_transactions USING btree (payment_reference) WHERE (payment_reference IS NOT NULL);

CREATE UNIQUE INDEX idx_cash_transactions_reward_once ON public.cash_transactions USING btree (mission_id) WHERE ((type = 'reward_payout'::text) AND (status = 'confirmed'::text));

CREATE INDEX idx_cash_transactions_user ON public.cash_transactions USING btree (user_phone, created_at DESC);

CREATE INDEX idx_cities_country ON public.cities USING btree (country_id);

CREATE INDEX idx_communes_city ON public.communes USING btree (city_id);

CREATE INDEX idx_courier_locations_available_seen ON public.courier_locations USING btree (is_available, last_seen_at DESC);

CREATE INDEX idx_delivery_dispatch_offers_delivery_status ON public.delivery_dispatch_offers USING btree (delivery_id, status);

CREATE INDEX idx_delivery_requests_assigned_provider ON public.delivery_requests USING btree (assigned_provider_id);

CREATE INDEX idx_delivery_requests_auto_payment_status ON public.delivery_requests USING btree (payment_status, status, created_at DESC);

CREATE INDEX idx_delivery_requests_city ON public.delivery_requests USING btree (city_name);

CREATE INDEX idx_delivery_requests_client_access_token ON public.delivery_requests USING btree (client_access_token, created_at DESC);

CREATE INDEX idx_delivery_requests_distance ON public.delivery_requests USING btree (distance_km);

CREATE INDEX idx_delivery_requests_payment_status ON public.delivery_requests USING btree (payment_status, created_at DESC);

CREATE INDEX idx_delivery_requests_scheduled_at ON public.delivery_requests USING btree (scheduled_at);

CREATE INDEX idx_delivery_requests_status_created ON public.delivery_requests USING btree (status, created_at DESC);

CREATE INDEX idx_delivery_requests_transaction_reference ON public.delivery_requests USING btree (transaction_reference);

CREATE INDEX idx_delivery_requests_v184_ops ON public.delivery_requests USING btree (payment_status, dispatch_status, status, created_at DESC);

CREATE INDEX idx_event_promotions_boost_clicks ON public.event_promotions USING btree (is_premium, is_sponsored, click_count);

CREATE INDEX idx_event_promotions_city_category ON public.event_promotions USING btree (city_name, category);

CREATE INDEX idx_event_promotions_city_category_end ON public.event_promotions USING btree (city_name, category, end_datetime);

CREATE INDEX idx_event_promotions_status_payment_date ON public.event_promotions USING btree (status, payment_status, event_datetime);

CREATE INDEX idx_event_promotions_status_payment_end ON public.event_promotions USING btree (status, payment_status, end_datetime);

CREATE INDEX idx_express_requests_priority ON public.express_requests USING btree (status, priority_score DESC, created_at);

CREATE INDEX idx_express_requests_service_city ON public.express_requests USING btree (service_name, city_name);

CREATE INDEX idx_express_requests_status_created ON public.express_requests USING btree (status, created_at DESC);

CREATE INDEX idx_fraud_signals_phone_created ON public.fraud_signals USING btree (phone, created_at DESC);

CREATE INDEX idx_job_offers_service_city ON public.job_offers USING btree (service_name, city_name);

CREATE INDEX idx_job_offers_status_payment_created ON public.job_offers USING btree (status, payment_status, created_at DESC);

CREATE INDEX idx_map_lookup_events_provider_created ON public.map_lookup_events USING btree (provider_name, created_at DESC);

CREATE INDEX idx_map_lookup_events_status_created ON public.map_lookup_events USING btree (status, created_at DESC);

CREATE INDEX idx_monitoring_forwarding_provider_created ON public.monitoring_forwarding_events USING btree (provider_name, created_at DESC);

CREATE INDEX idx_payment_checkout_sessions_reference ON public.payment_checkout_sessions USING btree (transaction_reference);

CREATE INDEX idx_payment_checkout_sessions_status ON public.payment_checkout_sessions USING btree (status, updated_at DESC);

CREATE INDEX idx_payment_transactions_status ON public.payment_transactions USING btree (status, updated_at DESC);

CREATE INDEX idx_payment_transactions_type ON public.payment_transactions USING btree (payment_type);

CREATE INDEX idx_payment_webhook_events_created ON public.payment_webhook_events USING btree (created_at DESC);

CREATE INDEX idx_payment_webhook_events_reference ON public.payment_webhook_events USING btree (transaction_reference);

CREATE INDEX idx_payments_provider ON public.payments USING btree (provider_id);

CREATE INDEX idx_payments_status ON public.payments USING btree (status);

CREATE INDEX idx_provider_services_provider ON public.provider_services USING btree (provider_id);

CREATE INDEX idx_provider_services_service ON public.provider_services USING btree (service_id);

CREATE INDEX idx_providers_city ON public.providers USING btree (city_id);

CREATE INDEX idx_providers_commune ON public.providers USING btree (commune_id);

CREATE INDEX idx_providers_status_visibility ON public.providers USING btree (status, visibility_status);

CREATE INDEX idx_push_notifications_status ON public.push_notifications USING btree (status, created_at DESC);

CREATE INDEX idx_reports_provider ON public.reports USING btree (provider_id);

CREATE INDEX idx_server_alerts_status_created ON public.server_alerts USING btree (status, created_at DESC);

CREATE INDEX idx_services_category ON public.services USING btree (category_id);

CREATE INDEX integration_health_checks_type_idx ON public.integration_health_checks USING btree (provider_type, checked_at DESC);

CREATE INDEX map_lookup_events_created_idx ON public.map_lookup_events USING btree (created_at DESC);

CREATE INDEX market_credits_owner_status_idx ON public.market_credits USING btree (requester_id, status, expires_at);

CREATE INDEX market_ledger_actor_idx ON public.market_ledger USING btree (actor_user_id) WHERE (actor_user_id IS NOT NULL);

CREATE INDEX market_ledger_credit_idx ON public.market_ledger USING btree (credit_id) WHERE (credit_id IS NOT NULL);

CREATE INDEX market_ledger_request_idx ON public.market_ledger USING btree (request_id, created_at);

CREATE INDEX market_ledger_solution_idx ON public.market_ledger USING btree (solution_id) WHERE (solution_id IS NOT NULL);

CREATE UNIQUE INDEX market_ledger_unique_hold_idx ON public.market_ledger USING btree (request_id, entry_type) WHERE (entry_type = ANY (ARRAY['HOLD'::text, 'CREDIT_CREATED'::text, 'PAYOUT_CONFIRMED'::text]));

CREATE INDEX market_permissions_authorized_by_idx ON public.market_solver_permissions USING btree (authorized_by) WHERE (authorized_by IS NOT NULL);

CREATE INDEX market_permissions_provider_idx ON public.market_solver_permissions USING btree (provider_id) WHERE (provider_id IS NOT NULL);

CREATE UNIQUE INDEX market_request_payment_reference_uidx ON public.market_requests USING btree (lower(payment_reference)) WHERE (payment_reference IS NOT NULL);

CREATE INDEX market_requests_category_idx ON public.market_requests USING btree (category, status, created_at DESC);

CREATE INDEX market_requests_current_solution_idx ON public.market_requests USING btree (current_solution_id) WHERE (current_solution_id IS NOT NULL);

CREATE INDEX market_requests_feed_idx ON public.market_requests USING btree (status, expires_at, created_at DESC);

CREATE INDEX market_requests_location_idx ON public.market_requests USING btree (city, area, status, created_at DESC);

CREATE INDEX market_requests_requester_idx ON public.market_requests USING btree (requester_id, created_at DESC);

CREATE INDEX market_requests_reward_idx ON public.market_requests USING btree (status, solver_reward_amount DESC, created_at DESC);

CREATE INDEX market_solutions_provider_idx ON public.market_solutions USING btree (provider_id) WHERE (provider_id IS NOT NULL);

CREATE INDEX market_solutions_request_status_idx ON public.market_solutions USING btree (request_id, status, created_at);

CREATE INDEX market_solutions_solver_idx ON public.market_solutions USING btree (solver_id, created_at DESC);

CREATE INDEX monitoring_forwarding_events_created_idx ON public.monitoring_forwarding_events USING btree (created_at DESC);

CREATE UNIQUE INDEX payments_unique_pending_provider_reference ON public.payments USING btree (provider_id, method, lower(btrim(transaction_reference))) WHERE ((status = 'pending'::payment_status) AND (transaction_reference IS NOT NULL) AND (btrim(transaction_reference) <> ''::text));

CREATE INDEX pricing_quotes_category_idx ON public.pricing_quotes USING btree (category_id);

CREATE INDEX pricing_quotes_expiry_idx ON public.pricing_quotes USING btree (expires_at) WHERE (consumed_at IS NULL);

CREATE INDEX pricing_quotes_owner_idx ON public.pricing_quotes USING btree (client_user_id, created_at DESC);

CREATE INDEX pricing_quotes_promotion_idx ON public.pricing_quotes USING btree (promotion_id) WHERE (promotion_id IS NOT NULL);

CREATE INDEX provider_availability_dispatch_idx ON public.provider_availability USING btree (status, last_seen_at DESC) WHERE (status = 'available'::text);

CREATE INDEX provider_services_directory_idx ON public.provider_services USING btree (provider_id, is_primary DESC, service_id);

CREATE INDEX provider_services_service_provider_idx ON public.provider_services USING btree (service_id, provider_id);

CREATE INDEX providers_city_public_idx ON public.providers USING btree (city_id, commune_id, status, visibility_status);

CREATE INDEX providers_coordinates_public_idx ON public.providers USING btree (latitude, longitude) WHERE ((latitude IS NOT NULL) AND (longitude IS NOT NULL));

CREATE INDEX providers_full_name_trgm_idx ON public.providers USING gin (lower(full_name) extensions.gin_trgm_ops);

CREATE INDEX providers_geo_point_gix ON public.providers USING gist (geo_point);

CREATE INDEX providers_phone_canonical_idx ON public.providers USING btree (bizzi_phone_canonical(phone));

CREATE INDEX providers_public_directory_order_idx ON public.providers USING btree (status, visibility_status, boost_ends_at DESC, is_verified DESC, average_rating DESC, id) WHERE ((status = 'approved'::provider_status) AND (visibility_status = ANY (ARRAY['trial'::provider_visibility_status, 'active'::provider_visibility_status])));

CREATE INDEX push_subscriptions_phone_idx ON public.push_subscriptions USING btree (phone) WHERE (phone IS NOT NULL);

CREATE INDEX push_subscriptions_provider_idx ON public.push_subscriptions USING btree (provider_id) WHERE (provider_id IS NOT NULL);

CREATE INDEX request_services_provider_idx ON public.request_services USING btree (selected_provider_id, status) WHERE (selected_provider_id IS NOT NULL);

CREATE INDEX request_services_request_idx ON public.request_services USING btree (request_id, status, display_order);

CREATE INDEX request_services_service_id_idx ON public.request_services USING btree (service_id) WHERE (service_id IS NOT NULL);

CREATE INDEX request_services_situation_service_id_idx ON public.request_services USING btree (situation_service_id) WHERE (situation_service_id IS NOT NULL);

CREATE INDEX ride_admin_audit_created_idx ON public.ride_admin_audit_log USING btree (created_at DESC);

CREATE INDEX ride_drivers_category_idx ON public.ride_drivers USING btree (current_vehicle_category_id) WHERE (current_vehicle_category_id IS NOT NULL);

CREATE INDEX ride_drivers_dispatch_idx ON public.ride_drivers USING btree (status, verification_status, last_seen_at DESC) WHERE (status = 'available'::text);

CREATE INDEX ride_status_history_actor_idx ON public.ride_status_history USING btree (actor_user_id) WHERE (actor_user_id IS NOT NULL);

CREATE INDEX ride_status_history_ride_idx ON public.ride_status_history USING btree (ride_id, created_at);

CREATE INDEX ride_stops_ride_idx ON public.ride_stops USING btree (ride_id, "position");

CREATE INDEX rides_category_idx ON public.rides USING btree (category_id);

CREATE INDEX rides_client_idx ON public.rides USING btree (client_user_id, created_at DESC);

CREATE INDEX rides_dispatch_idx ON public.rides USING btree (city_name, category_id, status, created_at) WHERE (status = 'searching'::text);

CREATE INDEX rides_driver_idx ON public.rides USING btree (driver_id, status, created_at DESC) WHERE (driver_id IS NOT NULL);

CREATE INDEX rides_vehicle_idx ON public.rides USING btree (vehicle_id) WHERE (vehicle_id IS NOT NULL);

CREATE INDEX service_proposals_provider_idx ON public.service_proposals USING btree (provider_id, status, created_at DESC);

CREATE INDEX service_proposals_request_idx ON public.service_proposals USING btree (request_id, status, created_at);

CREATE INDEX service_proposals_request_service_idx ON public.service_proposals USING btree (request_service_id, status, created_at) WHERE (request_service_id IS NOT NULL);

CREATE INDEX service_request_events_actor_idx ON public.service_request_events USING btree (actor_user_id, created_at DESC) WHERE (actor_user_id IS NOT NULL);

CREATE INDEX service_request_events_request_idx ON public.service_request_events USING btree (request_id, created_at);

CREATE INDEX service_request_matches_provider_idx ON public.service_request_matches USING btree (provider_id, status, notified_at DESC);

CREATE INDEX service_request_matches_request_idx ON public.service_request_matches USING btree (request_id, status, score DESC);

CREATE INDEX service_request_media_owner_idx ON public.service_request_media USING btree (owner_user_id, created_at DESC);

CREATE INDEX service_request_media_request_idx ON public.service_request_media USING btree (request_id, created_at DESC);

CREATE INDEX services_lower_name_idx ON public.services USING btree (lower(name));

CREATE INDEX situation_questions_situation_idx ON public.situation_questions USING btree (situation_id, display_order);

CREATE INDEX situation_services_service_id_idx ON public.situation_services USING btree (service_id) WHERE (service_id IS NOT NULL);

CREATE INDEX situation_services_situation_idx ON public.situation_services USING btree (situation_id, priority, service_name);

CREATE INDEX situations_active_sort_idx ON public.situations USING btree (active, sort_order, name);

CREATE INDEX wallet_transactions_ride_idx ON public.wallet_transactions USING btree (ride_id, created_at) WHERE (ride_id IS NOT NULL);

CREATE INDEX wallet_transactions_wallet_idx ON public.wallet_transactions USING btree (wallet_id, created_at DESC);


-- ============================================================
-- Fonctions SQL
-- ============================================================

CREATE OR REPLACE FUNCTION public.accept_ride(ride_uuid uuid, operation_key text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare driver_uuid uuid;
begin
  driver_uuid := private.zeyds_driver_for_user((select auth.uid()));
  if driver_uuid is null then raise exception 'driver_profile_missing'; end if;
  return private.zeyds_accept_ride_atomic(ride_uuid, driver_uuid, (select auth.uid()), operation_key);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_activate_trial_provider(provider_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  provider_row record;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  update public.providers p
  set status = 'approved'::provider_status,
      visibility_status = case
        when p.visibility_status = 'active'::provider_visibility_status then p.visibility_status
        else 'trial'::provider_visibility_status
      end,
      trial_started_at = coalesce(p.trial_started_at, now()),
      trial_ends_at = case
        when p.visibility_status = 'active'::provider_visibility_status then p.trial_ends_at
        when p.trial_ends_at is null or p.trial_ends_at <= now() then now() + interval '30 days'
        else p.trial_ends_at
      end,
      updated_at = now()
  where p.id = provider_uuid
  returning
    p.id,
    p.full_name,
    p.phone,
    p.status,
    p.visibility_status,
    p.trial_ends_at
  into provider_row;

  if provider_row.id is null then
    raise exception 'Provider not found: %', provider_uuid;
  end if;

  update public.advertisements a
  set status = 'active'::advertisement_status,
      updated_at = now()
  where a.provider_id = provider_uuid
    and a.status = 'pending'::advertisement_status;

  return jsonb_build_object(
    'provider_id', provider_row.id,
    'provider_name', provider_row.full_name,
    'phone', provider_row.phone,
    'status', provider_row.status,
    'visibility_status', provider_row.visibility_status,
    'trial_ends_at', provider_row.trial_ends_at
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_add_free_exception_place(place_name text, responsible_name text, phone text, place_city text, place_area text, place_address text, place_description text, place_photo_url text DEFAULT NULL::text)
 RETURNS exception_places
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare result public.exception_places;
begin
  if not public.is_admin() then raise exception 'Compte admin Bizzi requis'; end if;
  insert into public.exception_places (
    name, owner_name, contact_phone, city_name, area, address, description, photo_url,
    plan_id, plan_name, amount, payment_status, boost_days, admin_grant, status,
    visibility_starts_at, visibility_ends_at
  ) values (
    place_name, responsible_name, phone, place_city, place_area, place_address, place_description, place_photo_url,
    'free_30_days', 'Offert par Bizzi', 0, 'approved', 0, true, 'published', now(), now() + interval '30 days'
  ) returning * into result;
  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_approve_payment(payment_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  pay public.payments%rowtype;
  plan public.subscription_plans%rowtype;
  current_subscription_end timestamptz;
  current_boost_end timestamptz;
  new_subscription_end timestamptz;
  new_boost_end timestamptz;
  boost_days integer := 0;
  extra_amount integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select * into pay
  from public.payments
  where id = payment_uuid
  for update;

  if not found then
    raise exception 'Payment not found';
  end if;

  select * into plan
  from public.subscription_plans
  where id = pay.plan_id;

  if not found then
    raise exception 'Plan not found';
  end if;

  select p.subscription_ends_at, p.boost_ends_at
  into current_subscription_end, current_boost_end
  from public.providers p
  where p.id = pay.provider_id
  for update;

  -- Une seconde validation du meme paiement ne doit jamais ajouter une nouvelle duree.
  if pay.status::text = 'approved' then
    return jsonb_build_object(
      'payment_id', pay.id,
      'provider_id', pay.provider_id,
      'subscription_ends_at', current_subscription_end,
      'boost_ends_at', current_boost_end,
      'already_applied', true
    );
  end if;

  new_subscription_end :=
    greatest(coalesce(current_subscription_end, now()), now())
    + make_interval(months => greatest(coalesce(plan.duration_months, 1), 1));

  extra_amount := greatest(coalesce(pay.amount, 0) - coalesce(plan.price, 0), 0);
  if coalesce(pay.admin_note, '') ~* 'boost_30|boost 1 mois|30 jours' or extra_amount >= 2000 then
    boost_days := 30;
  elsif coalesce(pay.admin_note, '') ~* 'boost_7|boost 1 semaine|7 jours' or extra_amount >= 1000 then
    boost_days := 7;
  end if;

  if boost_days > 0 then
    new_boost_end := greatest(coalesce(current_boost_end, now()), now())
      + make_interval(days => boost_days);
  else
    new_boost_end := current_boost_end;
  end if;

  update public.payments
  set status = 'approved',
      approved_at = coalesce(approved_at, now()),
      updated_at = now()
  where id = payment_uuid;

  update public.providers
  set subscription_ends_at = new_subscription_end,
      boost_ends_at = new_boost_end,
      visibility_status = 'active',
      status = case when status::text = 'pending' then 'approved'::provider_status else status end,
      updated_at = now()
  where id = pay.provider_id;

  return jsonb_build_object(
    'payment_id', pay.id,
    'provider_id', pay.provider_id,
    'subscription_ends_at', new_subscription_end,
    'boost_ends_at', new_boost_end,
    'already_applied', false
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_archive_job_offer(job_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_list_admins()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  response jsonb;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', ap.id,
      'auth_user_id', ap.auth_user_id,
      'full_name', ap.full_name,
      'role', ap.role,
      'is_active', ap.is_active,
      'email', u.email,
      'created_at', ap.created_at,
      'updated_at', ap.updated_at
    )
    order by ap.created_at asc
  ), '[]'::jsonb)
  into response
  from public.admin_profiles ap
  left join auth.users u on u.id = ap.auth_user_id;

  return response;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_list_all_clients(p_search text DEFAULT ''::text, p_after jsonb DEFAULT '{}'::jsonb, p_limit integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  safe_limit integer := least(greatest(coalesce(p_limit, 30), 1), 100);
  search_value text := lower(trim(coalesce(p_search, '')));
  cursor_last_seen timestamptz;
  cursor_phone text;
  response jsonb;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;

  if coalesce(p_after, '{}'::jsonb) ? 'phone' then
    cursor_last_seen := (p_after ->> 'last_seen')::timestamptz;
    cursor_phone := p_after ->> 'phone';
  end if;

  with raw_events as (
    select customer_name, customer_phone, created_at, 'delivery'::text as source
    from public.delivery_requests
    where customer_phone is not null
    union all
    select customer_name, customer_phone, created_at, 'service'::text as source
    from public.service_requests
    where customer_phone is not null
    union all
    select null::text as customer_name, customer_phone, created_at, 'express'::text as source
    from public.express_requests
    where customer_phone is not null
  ), normalized as (
    select
      public.bizzi_normalize_phone_digits(customer_phone) as phone_key,
      customer_name,
      customer_phone,
      created_at,
      source
    from raw_events
    where public.bizzi_normalize_phone_digits(customer_phone) is not null
  ), aggregated as (
    select
      phone_key,
      (array_agg(customer_phone order by created_at desc))[1] as phone,
      (array_agg(customer_name order by created_at desc) filter (where customer_name is not null and trim(customer_name) <> ''))[1] as full_name,
      min(created_at) as first_seen,
      max(created_at) as last_seen,
      count(*) filter (where source = 'delivery') as delivery_count,
      count(*) filter (where source = 'service') as service_count,
      count(*) filter (where source = 'express') as express_count,
      count(*) as total_count
    from normalized
    group by phone_key
  ), candidates as (
    select *
    from aggregated
    where (
        search_value = ''
        or lower(coalesce(full_name, '')) like '%' || search_value || '%'
        or (
          length(public.bizzi_normalize_phone_digits(p_search)) >= 6
          and phone_key like '%' || public.bizzi_normalize_phone_digits(p_search) || '%'
        )
      )
      and (
        cursor_phone is null
        or last_seen < cursor_last_seen
        or (last_seen = cursor_last_seen and phone_key > cursor_phone)
      )
    order by last_seen desc, phone_key asc
    limit safe_limit + 1
  ), page as (
    select * from candidates order by last_seen desc, phone_key asc limit safe_limit
  ), last_row as (
    select * from page order by last_seen asc, phone_key desc limit 1
  )
  select jsonb_build_object(
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'phone', item.phone,
          'full_name', coalesce(item.full_name, 'Client'),
          'first_seen', item.first_seen,
          'last_seen', item.last_seen,
          'delivery_count', item.delivery_count,
          'service_count', item.service_count,
          'express_count', item.express_count,
          'total_count', item.total_count
        )
        order by item.last_seen desc, item.phone_key asc
      )
      from page item
    ), '[]'::jsonb),
    'has_more', (select count(*) > safe_limit from candidates),
    'next_cursor', (select jsonb_build_object('last_seen', last_seen, 'phone', phone_key) from last_row),
    'page_size', safe_limit
  ) into response;

  return coalesce(response, jsonb_build_object('items', '[]'::jsonb, 'has_more', false, 'next_cursor', null, 'page_size', safe_limit));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_list_all_providers(p_search text DEFAULT ''::text, p_status text DEFAULT ''::text, p_visibility text DEFAULT ''::text, p_after jsonb DEFAULT '{}'::jsonb, p_limit integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  safe_limit integer := least(greatest(coalesce(p_limit, 30), 1), 100);
  search_value text := lower(trim(coalesce(p_search, '')));
  status_value text := lower(trim(coalesce(p_status, '')));
  visibility_value text := lower(trim(coalesce(p_visibility, '')));
  cursor_created timestamptz;
  cursor_id uuid;
  response jsonb;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;

  if coalesce(p_after, '{}'::jsonb) ? 'id' then
    cursor_created := (p_after ->> 'created_at')::timestamptz;
    cursor_id := (p_after ->> 'id')::uuid;
  end if;

  with candidates as (
    select
      p.id,
      p.full_name,
      p.phone,
      p.whatsapp,
      p.email,
      p.status,
      p.visibility_status,
      p.is_verified,
      p.trial_started_at,
      p.trial_ends_at,
      p.subscription_ends_at,
      p.average_rating,
      p.call_count,
      p.created_at,
      c.name as city_name,
      co.name as commune_name,
      p.neighborhood,
      coalesce(primary_service.service_name, 'Metier a preciser') as service_name
    from public.providers p
    left join public.cities c on c.id = p.city_id
    left join public.communes co on co.id = p.commune_id
    left join lateral (
      select s.name as service_name
      from public.provider_services ps
      join public.services s on s.id = ps.service_id
      where ps.provider_id = p.id
      order by ps.is_primary desc, s.name asc
      limit 1
    ) primary_service on true
    where (status_value = '' or lower(p.status::text) = status_value)
      and (visibility_value = '' or lower(p.visibility_status::text) = visibility_value)
      and (
        search_value = ''
        or lower(coalesce(p.full_name, '')) like '%' || search_value || '%'
        or lower(coalesce(p.email, '')) like '%' || search_value || '%'
        or (
          length(public.bizzi_normalize_phone_digits(p_search)) >= 6
          and public.bizzi_normalize_phone_digits(p.phone) like '%' || public.bizzi_normalize_phone_digits(p_search) || '%'
        )
      )
      and (
        cursor_id is null
        or p.created_at < cursor_created
        or (p.created_at = cursor_created and p.id > cursor_id)
      )
    order by p.created_at desc, p.id asc
    limit safe_limit + 1
  ), page as (
    select * from candidates order by created_at desc, id asc limit safe_limit
  ), last_row as (
    select * from page order by created_at asc, id desc limit 1
  )
  select jsonb_build_object(
    'items', coalesce((select jsonb_agg(to_jsonb(item) order by item.created_at desc, item.id asc) from page item), '[]'::jsonb),
    'has_more', (select count(*) > safe_limit from candidates),
    'next_cursor', (select jsonb_build_object('created_at', created_at, 'id', id) from last_row),
    'page_size', safe_limit
  ) into response;

  return coalesce(response, jsonb_build_object('items', '[]'::jsonb, 'has_more', false, 'next_cursor', null, 'page_size', safe_limit));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_list_platform_settings()
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case when public.is_admin()
    then coalesce((select jsonb_agg(to_jsonb(s) order by s.key) from public.platform_settings s), '[]'::jsonb)
    else (select '[]'::jsonb)
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_log_action(p_action text, p_target_id text DEFAULT NULL::text, p_success boolean DEFAULT true, p_error_message text DEFAULT NULL::text, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  insert into public.admin_audit_events (
    action, target_id, success, error_message, payload,
    actor_auth_user_id, actor_email
  )
  values (
    p_action, p_target_id, coalesce(p_success, true), p_error_message, coalesce(p_payload, '{}'::jsonb),
    auth.uid(),
    (select email from auth.users where id = auth.uid())
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_publish_event_promotion(event_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  event_row record;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.event_promotions ep
  set status = 'published',
      payment_status = 'approved',
      paid_at = case when ep.amount > 0 then coalesce(ep.paid_at, now()) else ep.paid_at end,
      published_at = coalesce(ep.published_at, now()),
      updated_at = now()
  where ep.id = event_uuid
  returning
    ep.id,
    ep.title,
    ep.organizer_name,
    ep.status,
    ep.payment_status,
    ep.event_datetime,
    ep.end_datetime
  into event_row;

  if event_row.id is null then
    raise exception 'Evenement introuvable: %', event_uuid;
  end if;

  return to_jsonb(event_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_publish_exception_place(place_uuid uuid)
 RETURNS exception_places
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  result public.exception_places;
  activation_time timestamptz := now();
begin
  if not public.is_admin() then raise exception 'Compte admin Bizzi requis'; end if;

  update public.exception_places ep
  set status = 'published',
      payment_status = 'approved',
      visibility_starts_at = activation_time,
      visibility_ends_at = activation_time + interval '30 days',
      boost_starts_at = case when ep.boost_days > 0 then activation_time else null end,
      boost_ends_at = case when ep.boost_days > 0 then activation_time + make_interval(days => ep.boost_days) else null end,
      updated_at = activation_time
  where ep.id = place_uuid
  returning * into result;

  if result.id is null then raise exception 'Lieu introuvable'; end if;
  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_publish_food_place(food_uuid uuid)
 RETURNS food_places
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  result public.food_places;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.food_places fp
  set
    status = 'published',
    verification_status = 'verified',
    updated_at = now()
  where fp.id = food_uuid
  returning * into result;

  if result.id is null then
    raise exception 'Adresse Food introuvable';
  end if;

  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_publish_job_offer(job_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_reactivate_provider(provider_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  provider_row record;
begin
  update public.providers p
  set status = 'approved'::provider_status,
      visibility_status = case
        when p.subscription_ends_at is not null and p.subscription_ends_at > now()
          then 'active'::provider_visibility_status
        else 'trial'::provider_visibility_status
      end,
      trial_started_at = coalesce(p.trial_started_at, now()),
      trial_ends_at = case
        when p.subscription_ends_at is not null and p.subscription_ends_at > now()
          then p.trial_ends_at
        when p.trial_ends_at is null or p.trial_ends_at <= now()
          then now() + interval '30 days'
        else p.trial_ends_at
      end,
      updated_at = now()
  where p.id = provider_uuid
  returning
    p.id,
    p.full_name,
    p.phone,
    p.status,
    p.visibility_status,
    p.trial_ends_at,
    p.subscription_ends_at
  into provider_row;

  if provider_row.id is null then
    raise exception 'Prestataire introuvable: %', provider_uuid;
  end if;

  return jsonb_build_object(
    'provider_id', provider_row.id,
    'provider_name', provider_row.full_name,
    'phone', provider_row.phone,
    'status', provider_row.status,
    'visibility_status', provider_row.visibility_status,
    'trial_ends_at', provider_row.trial_ends_at,
    'subscription_ends_at', provider_row.subscription_ends_at
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_reject_event_promotion(event_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  event_row record;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.event_promotions ep
  set status = 'rejected',
      payment_status = case when ep.payment_status = 'approved' and ep.amount = 0 then ep.payment_status else 'rejected' end,
      rejected_at = coalesce(ep.rejected_at, now()),
      updated_at = now()
  where ep.id = event_uuid
  returning
    ep.id,
    ep.title,
    ep.organizer_name,
    ep.status,
    ep.payment_status,
    ep.event_datetime,
    ep.end_datetime
  into event_row;

  if event_row.id is null then
    raise exception 'Evenement introuvable: %', event_uuid;
  end if;

  return to_jsonb(event_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_reject_food_place(food_uuid uuid)
 RETURNS food_places
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  result public.food_places;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.food_places fp
  set
    status = 'rejected',
    verification_status = 'rejected',
    updated_at = now()
  where fp.id = food_uuid
  returning * into result;

  if result.id is null then
    raise exception 'Adresse Food introuvable';
  end if;

  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_admin_active(target_auth_user_id uuid, p_is_active boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  result_row public.admin_profiles%rowtype;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;
  if target_auth_user_id = auth.uid() and coalesce(p_is_active, true) = false then
    raise exception 'Impossible de se desactiver soi-meme';
  end if;

  update public.admin_profiles
  set is_active = coalesce(p_is_active, true),
      updated_at = now()
  where auth_user_id = target_auth_user_id
  returning * into result_row;

  if not found then
    raise exception 'Admin introuvable';
  end if;

  return to_jsonb(result_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_platform_setting(p_key text, p_value jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  result_row public.platform_settings%rowtype;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;
  if p_key is null or trim(p_key) = '' then
    raise exception 'Cle de reglage requise';
  end if;

  insert into public.platform_settings (key, value, updated_at, updated_by_email)
  values (trim(p_key), coalesce(p_value, 'null'::jsonb), now(), (select email from auth.users where id = auth.uid()))
  on conflict (key) do update
  set value = excluded.value,
      updated_at = now(),
      updated_by_email = excluded.updated_by_email
  returning * into result_row;

  return to_jsonb(result_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_provider_visibility(provider_uuid uuid, make_visible boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if make_visible then
    return public.admin_reactivate_provider(provider_uuid);
  end if;

  return public.admin_suspend_provider(provider_uuid);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_suspend_provider(provider_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  provider_row record;
begin
  update public.providers p
  set status = 'suspended'::provider_status,
      visibility_status = 'hidden'::provider_visibility_status,
      updated_at = now()
  where p.id = provider_uuid
  returning
    p.id,
    p.full_name,
    p.phone,
    p.status,
    p.visibility_status,
    p.trial_ends_at,
    p.subscription_ends_at
  into provider_row;

  if provider_row.id is null then
    raise exception 'Prestataire introuvable: %', provider_uuid;
  end if;

  update public.advertisements
  set status = 'rejected',
      updated_at = now()
  where provider_id = provider_uuid
    and status = 'active';

  return jsonb_build_object(
    'provider_id', provider_row.id,
    'provider_name', provider_row.full_name,
    'phone', provider_row.phone,
    'status', provider_row.status,
    'visibility_status', provider_row.visibility_status,
    'trial_ends_at', provider_row.trial_ends_at,
    'subscription_ends_at', provider_row.subscription_ends_at
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_upsert_admin_profile(target_auth_user_id uuid, p_full_name text, p_role text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  safe_role text := lower(trim(coalesce(p_role, 'admin')));
  result_row public.admin_profiles%rowtype;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;
  if target_auth_user_id is null then
    raise exception 'auth_user_id requis (a copier depuis Supabase Dashboard > Authentication > Users)';
  end if;
  if safe_role not in ('admin', 'owner', 'super_admin') then
    raise exception 'Role invalide : admin, owner ou super_admin uniquement';
  end if;

  insert into public.admin_profiles (auth_user_id, full_name, role, is_active)
  values (target_auth_user_id, coalesce(nullif(trim(p_full_name), ''), 'Admin Zeyds'), safe_role, true)
  on conflict (auth_user_id) do update
  set full_name = excluded.full_name,
      role = excluded.role,
      is_active = true,
      updated_at = now()
  returning * into result_row;

  return to_jsonb(result_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_payment(payment_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_accept_delivery_request(p_delivery_id uuid, p_provider_id uuid, p_provider_name text DEFAULT NULL::text, p_provider_phone text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  provider_record record;
begin
  select p.id, p.full_name, p.phone
    into provider_record
  from public.providers p
  join public.provider_services ps on ps.provider_id = p.id
  join public.services s on s.id = ps.service_id
  where p.id = p_provider_id
    and p.status = 'approved'
    and p.visibility_status in ('trial', 'active')
    and s.name in (
      'Bizzi Livraison',
      'Courses / achats à domicile',
      'Chauffeur',
      'Transport de marchandises',
      'Transport de colis international',
      'Conducteur moto-taxi',
      'Livreur de gaz en bouteille',
      'Livraison médicaments'
    )
  limit 1;

  if not found then
    raise exception 'Prestataire livraison non actif ou non compatible';
  end if;

  update public.delivery_requests
  set status = 'assigned',
      assigned_provider_id = provider_record.id,
      assigned_provider_name = coalesce(nullif(p_provider_name, ''), provider_record.full_name),
      assigned_provider_phone = coalesce(nullif(p_provider_phone, ''), provider_record.phone),
      accepted_at = coalesce(accepted_at, now()),
      updated_at = now()
  where id = p_delivery_id
    and status = 'open'
    and payment_status = 'approved';

  if not found then
    raise exception 'Livraison non payee, deja acceptee, cloturee ou introuvable';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_accept_dispatch_offer(p_offer_id uuid, p_provider_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  offer_record record;
begin
  select *
    into offer_record
  from public.delivery_dispatch_offers
  where id = p_offer_id
    and provider_id = p_provider_id
    and status = 'offered'
    and expires_at > now()
  limit 1;

  if offer_record.id is null then
    raise exception 'Offre introuvable ou expiree';
  end if;

  perform public.bizzi_accept_delivery_request(offer_record.delivery_id, p_provider_id, null, null);

  update public.delivery_dispatch_offers
  set status = case when provider_id = p_provider_id then 'accepted' else 'expired' end,
      responded_at = case when provider_id = p_provider_id then now() else responded_at end
  where delivery_id = offer_record.delivery_id;

  return jsonb_build_object('ok', true, 'delivery_id', offer_record.delivery_id, 'provider_id', p_provider_id);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_admin_finance_delivery_report()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  provider_payments integer := 0;
  provider_revenue numeric := 0;
  pending_payments integer := 0;
  pending_revenue numeric := 0;
  delivery_total integer := 0;
  delivery_pending integer := 0;
  delivery_paid integer := 0;
  delivery_assigned integer := 0;
  delivery_commission numeric := 0;
  delivery_payout numeric := 0;
  jobs_pending integer := 0;
  jobs_revenue numeric := 0;
  events_pending integer := 0;
  events_revenue numeric := 0;
  payload jsonb;
begin
  if not public.bizzi_payment_admin_allowed() then
    raise exception 'admin_required';
  end if;

  if to_regclass('public.payments') is not null then
    execute 'select count(*), coalesce(sum(amount), 0) from public.payments where coalesce(status, '''') = ''approved''' into provider_payments, provider_revenue;
    execute 'select count(*), coalesce(sum(amount), 0) from public.payments where coalesce(status, '''') = ''pending''' into pending_payments, pending_revenue;
  end if;

  if to_regclass('public.delivery_requests') is not null then
    execute 'select count(*) from public.delivery_requests' into delivery_total;
    if public.bizzi_column_exists('delivery_requests', 'payment_status') then
      execute 'select count(*) from public.delivery_requests where coalesce(payment_status, '''') = ''pending''' into delivery_pending;
      execute 'select count(*) from public.delivery_requests where coalesce(payment_status, '''') = ''approved''' into delivery_paid;
    end if;
    if public.bizzi_column_exists('delivery_requests', 'status') then
      execute 'select count(*) from public.delivery_requests where coalesce(status, '''') = ''assigned''' into delivery_assigned;
    end if;
    if public.bizzi_column_exists('delivery_requests', 'bizzi_commission')
      and public.bizzi_column_exists('delivery_requests', 'payment_status') then
      execute 'select coalesce(sum(bizzi_commission), 0) from public.delivery_requests where coalesce(payment_status, '''') = ''approved''' into delivery_commission;
    end if;
    if public.bizzi_column_exists('delivery_requests', 'provider_payout')
      and public.bizzi_column_exists('delivery_requests', 'payment_status') then
      execute 'select coalesce(sum(provider_payout), 0) from public.delivery_requests where coalesce(payment_status, '''') = ''approved''' into delivery_payout;
    end if;
  end if;

  if to_regclass('public.job_offers') is not null then
    execute 'select count(*) from public.job_offers where coalesce(status, '''') = ''pending''' into jobs_pending;
    if public.bizzi_column_exists('job_offers', 'amount') and public.bizzi_column_exists('job_offers', 'payment_status') then
      execute 'select coalesce(sum(amount), 0) from public.job_offers where coalesce(payment_status, '''') = ''approved'' or coalesce(status, '''') = ''published''' into jobs_revenue;
    elsif public.bizzi_column_exists('job_offers', 'amount') then
      execute 'select coalesce(sum(amount), 0) from public.job_offers where coalesce(status, '''') = ''published''' into jobs_revenue;
    end if;
  end if;

  if to_regclass('public.event_promotions') is not null then
    execute 'select count(*) from public.event_promotions where coalesce(status, '''') = ''pending''' into events_pending;
    if public.bizzi_column_exists('event_promotions', 'amount') and public.bizzi_column_exists('event_promotions', 'payment_status') then
      execute 'select coalesce(sum(amount), 0) from public.event_promotions where coalesce(payment_status, '''') = ''approved'' or coalesce(status, '''') = ''published''' into events_revenue;
    elsif public.bizzi_column_exists('event_promotions', 'amount') then
      execute 'select coalesce(sum(amount), 0) from public.event_promotions where coalesce(status, '''') = ''published''' into events_revenue;
    end if;
  end if;

  payload := jsonb_build_object(
    'generated_at', now(),
    'provider_payments', jsonb_build_object(
      'approved_count', provider_payments,
      'approved_revenue', provider_revenue,
      'pending_count', pending_payments,
      'pending_revenue', pending_revenue
    ),
    'deliveries', jsonb_build_object(
      'total', delivery_total,
      'pending_payment', delivery_pending,
      'paid', delivery_paid,
      'assigned', delivery_assigned,
      'bizzi_commission', delivery_commission,
      'provider_payout', delivery_payout
    ),
    'jobs', jsonb_build_object(
      'pending', jobs_pending,
      'revenue', jobs_revenue
    ),
    'events', jsonb_build_object(
      'pending', events_pending,
      'revenue', events_revenue
    ),
    'total_known_revenue', provider_revenue + delivery_commission + jobs_revenue + events_revenue
  );

  insert into public.admin_financial_snapshots(report_type, report_payload)
  values ('finance_delivery_v174', payload);

  return payload;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_admin_global_report()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  payload jsonb := '{}'::jsonb;
  providers_total integer := 0;
  providers_visible integer := 0;
  providers_pending integer := 0;
  providers_without_service integer := 0;
  duplicate_phones integer := 0;
  payments_pending integer := 0;
  payments_approved integer := 0;
  deliveries_open integer := 0;
  deliveries_paid integer := 0;
  events_active integer := 0;
  events_pending integer := 0;
  jobs_active integer := 0;
  jobs_pending integer := 0;
  express_open integer := 0;
begin
  if not public.bizzi_payment_admin_allowed() then
    raise exception 'admin_required';
  end if;

  if to_regclass('public.providers') is not null then
    execute 'select count(*) from public.providers' into providers_total;
    execute 'select count(*) from public.providers where coalesce(status, '''') in (''approved'', ''active'') and coalesce(visibility_status, '''') not in (''hidden'', ''suspended'', ''expired_blurred'')' into providers_visible;
    execute 'select count(*) from public.providers where coalesce(status, '''') = ''pending''' into providers_pending;
    if to_regclass('public.provider_services') is not null then
      execute 'select count(*) from public.providers p where not exists (select 1 from public.provider_services ps where ps.provider_id = p.id)' into providers_without_service;
    end if;
    execute 'select count(*) from (select regexp_replace(coalesce(phone, whatsapp, ''''), ''[^0-9]'', '''', ''g'') as phone_key from public.providers group by 1 having count(*) > 1 and regexp_replace(coalesce(phone, whatsapp, ''''), ''[^0-9]'', '''', ''g'') <> '''') d' into duplicate_phones;
  end if;

  if to_regclass('public.payments') is not null then
    execute 'select count(*) from public.payments where coalesce(status, '''') = ''pending''' into payments_pending;
    execute 'select count(*) from public.payments where coalesce(status, '''') = ''approved''' into payments_approved;
  end if;

  if to_regclass('public.delivery_requests') is not null then
    execute 'select count(*) from public.delivery_requests where coalesce(status, '''') in (''open'', ''pending'')' into deliveries_open;
    execute 'select count(*) from public.delivery_requests where coalesce(payment_status, '''') = ''approved''' into deliveries_paid;
  end if;

  if to_regclass('public.event_promotions') is not null then
    execute 'select count(*) from public.event_promotions where coalesce(status, '''') = ''published'' and coalesce(end_datetime, event_datetime, now()) >= now()' into events_active;
    execute 'select count(*) from public.event_promotions where coalesce(status, '''') = ''pending''' into events_pending;
  end if;

  if to_regclass('public.job_offers') is not null then
    execute 'select count(*) from public.job_offers where coalesce(status, '''') = ''published''' into jobs_active;
    execute 'select count(*) from public.job_offers where coalesce(status, '''') = ''pending''' into jobs_pending;
  end if;

  if to_regclass('public.express_requests') is not null then
    execute 'select count(*) from public.express_requests where coalesce(status, '''') <> ''closed''' into express_open;
  end if;

  payload := jsonb_build_object(
    'generated_at', now(),
    'providers', jsonb_build_object(
      'total', providers_total,
      'visible', providers_visible,
      'pending', providers_pending,
      'without_service', providers_without_service,
      'duplicate_phone_groups', duplicate_phones
    ),
    'payments', jsonb_build_object(
      'pending', payments_pending,
      'approved', payments_approved
    ),
    'deliveries', jsonb_build_object(
      'open', deliveries_open,
      'paid', deliveries_paid
    ),
    'events', jsonb_build_object(
      'active', events_active,
      'pending', events_pending
    ),
    'jobs', jsonb_build_object(
      'active', jobs_active,
      'pending', jobs_pending
    ),
    'express_requests', jsonb_build_object(
      'open', express_open
    )
  );

  insert into public.admin_report_snapshots(report_type, report_payload)
  values ('global_v173', payload);

  return payload;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_admin_request_allowed()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  request_uid uuid := auth.uid();
  request_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if request_email in ('contact@bizzi-africa.com', 'support@bizzi-africa.com') then
    return true;
  end if;

  if request_uid is not null and exists (
    select 1
    from public.admin_profiles ap
    where ap.auth_user_id = request_uid
      and ap.is_active = true
      and lower(coalesce(ap.role, '')) in ('admin', 'owner', 'super_admin')
  ) then
    return true;
  end if;

  return false;
exception
  when undefined_table then
    return request_email in ('contact@bizzi-africa.com', 'support@bizzi-africa.com');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_approve_delivery_payment(p_delivery_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.delivery_requests
  set payment_status = 'approved',
      paid_at = coalesce(paid_at, now()),
      updated_at = now()
  where id = p_delivery_id
    and status in ('open', 'assigned');

  if not found then
    raise exception 'Livraison introuvable ou deja cloturee';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_assign_primary_service(provider_phone text, target_service_name text, target_city_name text DEFAULT NULL::text)
 RETURNS TABLE(provider_name text, phone text, service_name text, city_name text, visibility_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  target_provider_id uuid;
  target_service_id uuid;
  target_city_id uuid;
begin
  select p.id
  into target_provider_id
  from public.providers p
  where p.phone = provider_phone
  order by p.created_at desc nulls last
  limit 1;

  if target_provider_id is null then
    raise exception 'Aucun prestataire trouve avec le numero %', provider_phone;
  end if;

  select s.id
  into target_service_id
  from public.services s
  where lower(s.name) = lower(target_service_name)
  order by s.updated_at desc nulls last, s.created_at desc nulls last
  limit 1;

  if target_service_id is null then
    raise exception 'Aucun service trouve avec le nom %', target_service_name;
  end if;

  if target_city_name is not null and length(trim(target_city_name)) > 0 then
    select c.id
    into target_city_id
    from public.cities c
    where lower(c.name) = lower(target_city_name)
    limit 1;

    if target_city_id is null then
      raise exception 'Aucune ville trouvee avec le nom %', target_city_name;
    end if;

    update public.providers
    set city_id = target_city_id,
        updated_at = now()
    where id = target_provider_id;
  end if;

  update public.provider_services
  set is_primary = false
  where provider_id = target_provider_id;

  insert into public.provider_services (provider_id, service_id, is_primary)
  values (target_provider_id, target_service_id, true)
  on conflict (provider_id, service_id) do update
  set is_primary = true;

  return query
  select
    p.full_name,
    p.phone,
    s.name,
    c.name,
    p.visibility_status::text
  from public.providers p
  join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
  join public.services s on s.id = ps.service_id
  left join public.cities c on c.id = p.city_id
  where p.id = target_provider_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_auto_approve_new_provider()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.auth_user_id is null
     and new.status = 'pending'::provider_status
     and new.visibility_status = 'trial'::provider_visibility_status then
    update public.providers p
    set status = 'approved'::provider_status,
        visibility_status = 'trial'::provider_visibility_status,
        trial_started_at = coalesce(p.trial_started_at, now()),
        trial_ends_at = case
          when p.trial_ends_at is null or p.trial_ends_at <= now()
            then now() + interval '30 days'
          else p.trial_ends_at
        end,
        updated_at = now()
    where p.id = new.id;
  end if;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_auto_validate_delivery_order(p_delivery_id uuid, p_transaction_reference text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  delivery_record record;
  dispatch_result jsonb := null;
  offers_created integer := 0;
  final_dispatch_status text := 'not_dispatched';
begin
  select *
    into delivery_record
  from public.delivery_requests
  where id = p_delivery_id
    and status = 'open'
  limit 1;

  if delivery_record.id is null then
    raise exception 'Livraison introuvable ou non ouverte';
  end if;

  if coalesce(delivery_record.amount, 0) < 800 then
    raise exception 'Montant livraison inferieur au minimum Bizzi';
  end if;

  if coalesce(nullif(p_transaction_reference, ''), coalesce(delivery_record.transaction_reference, '')) <> coalesce(delivery_record.transaction_reference, '') then
    raise exception 'Reference transaction livraison non conforme';
  end if;

  update public.delivery_requests
  set payment_status = 'approved',
      paid_at = coalesce(paid_at, now()),
      payout_status = case
        when assigned_provider_id is not null then 'payable'
        else 'pending'
      end,
      dispatch_status = case
        when dispatch_status in ('not_dispatched', 'manual_review') then 'dispatching'
        else dispatch_status
      end,
      updated_at = now()
  where id = p_delivery_id;

  if to_regprocedure('public.bizzi_dispatch_delivery_request(uuid,integer)') is not null then
    begin
      dispatch_result := public.bizzi_dispatch_delivery_request(p_delivery_id, 5);
      offers_created := coalesce((dispatch_result->>'offers_created')::integer, 0);
    exception
      when others then
        update public.delivery_requests
        set dispatch_status = 'dispatching',
            updated_at = now()
        where id = p_delivery_id;
    end;
  end if;

  select coalesce(dispatch_status, 'not_dispatched')
    into final_dispatch_status
  from public.delivery_requests
  where id = p_delivery_id;

  return jsonb_build_object(
    'ok', true,
    'delivery_id', p_delivery_id,
    'payment_status', 'approved',
    'dispatch_status', final_dispatch_status,
    'offers_created', offers_created,
    'minimum_amount', 800,
    'commission_rate', 0.15,
    'extra_km_price_after_12km', 250
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_auto_validate_delivery_order_tg()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.bizzi_auto_validate_delivery_order(new.id, new.transaction_reference);
  return new;
exception
  when others then
    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_block_duplicate_provider_phone()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  clean_phone text;
  existing_provider record;
begin
  clean_phone := public.bizzi_normalize_phone_digits(new.phone);

  if clean_phone is null then
    return new;
  end if;

  select id, full_name, phone
    into existing_provider
  from public.providers
  where public.bizzi_normalize_phone_digits(phone) = clean_phone
    and (new.id is null or id <> new.id)
  limit 1;

  if found then
    raise exception 'provider_phone_already_exists'
      using
        errcode = '23505',
        detail = 'Ce numero est deja lie a un prestataire Bizzi. Utilisez le renouvellement au lieu de creer un nouveau mois gratuit.',
        hint = existing_provider.id::text;
  end if;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_can_review_provider(provider_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.providers p
    where p.id = provider_uuid
      and p.status = 'approved'
      and p.visibility_status in ('trial', 'active')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_city_group_key(p_city text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  with normalized as (
    select trim(regexp_replace(lower(translate(coalesce(p_city, ''),
      'àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
      'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'
    )), '[^a-z0-9]+', ' ', 'g')) as value
  )
  select case
    when value in ('abidjan', 'abobo', 'adjame', 'anyama', 'bingerville', 'cocody', 'koumassi', 'marcory', 'port bouet', 'treichville', 'yopougon', 'songon') then 'abidjan'
    when value in ('toute la cote d ivoire', 'autre ville commune', '') then ''
    else value
  end
  from normalized;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_cleanup_duplicate_trial_providers(apply_changes boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  affected integer := 0;
begin
  if not public.bizzi_payment_admin_allowed() then
    raise exception 'admin_required';
  end if;

  if not apply_changes then
    return jsonb_build_object(
      'mode', 'preview',
      'message', 'Aucune modification effectuee. Relisez bizzi_provider_duplicate_report() avant de passer apply_changes a true.',
      'duplicates', coalesce((select jsonb_agg(row_to_json(r)) from public.bizzi_provider_duplicate_report() r), '[]'::jsonb)
    );
  end if;

  with ranked as (
    select
      p.id,
      row_number() over (
        partition by regexp_replace(coalesce(p.phone, p.whatsapp, ''), '[^0-9]', '', 'g')
        order by
          case when coalesce(p.status, '') = 'approved' then 0 else 1 end,
          p.created_at asc
      ) as rn
    from public.providers p
    where regexp_replace(coalesce(p.phone, p.whatsapp, ''), '[^0-9]', '', 'g') <> ''
  )
  update public.providers p
  set
    status = case when coalesce(p.status, '') = 'approved' then p.status else 'suspended' end,
    visibility_status = case when coalesce(p.status, '') = 'approved' then p.visibility_status else 'hidden' end,
    updated_at = now()
  from ranked r
  where p.id = r.id
    and r.rn > 1
    and coalesce(p.status, '') <> 'approved';

  get diagnostics affected = row_count;

  return jsonb_build_object(
    'mode', 'applied',
    'hidden_or_suspended_duplicates', affected,
    'message', 'Seuls les doublons non approuves ont ete masques. Les profils approuves sont conserves.'
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_close_delivery_request(p_delivery_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  update public.delivery_requests
  set status = 'closed',
      payout_status = case
        when payment_status = 'approved' and assigned_provider_id is not null then 'payable'
        else payout_status
      end,
      closed_at = coalesce(closed_at, now()),
      updated_at = now()
  where id = p_delivery_id
    and status <> 'closed';

  if not found then
    raise exception 'Livraison introuvable ou deja cloturee';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_column_exists(table_name text, column_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = $1
      and column_name = $2
  );
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_dispatch_delivery_request(p_delivery_id uuid, p_limit integer DEFAULT 5)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  delivery_record record;
  inserted_count integer := 0;
  requested_city_group text := '';
begin
  select *
    into delivery_record
  from public.delivery_requests
  where id = p_delivery_id
    and status = 'open'
    and payment_status = 'approved'
  limit 1;

  if delivery_record.id is null then
    raise exception 'Livraison introuvable, non payee ou deja attribuee';
  end if;

  requested_city_group := public.bizzi_city_group_key(delivery_record.city_name);

  update public.delivery_requests
  set dispatch_status = 'dispatching',
      dispatch_radius_km = 5,
      dispatched_at = coalesce(dispatched_at, now()),
      dispatch_attempts = dispatch_attempts + 1,
      updated_at = now()
  where id = p_delivery_id;

  insert into public.delivery_dispatch_offers(delivery_id, provider_id, distance_km)
  select
    delivery_record.id,
    cl.provider_id,
    public.bizzi_distance_km(delivery_record.pickup_latitude, delivery_record.pickup_longitude, cl.latitude, cl.longitude)
  from public.courier_locations cl
  join public.providers p on p.id = cl.provider_id
  left join public.cities c on c.id = p.city_id
  where cl.is_available = true
    and cl.last_seen_at >= now() - interval '15 minutes'
    and p.status = 'approved'
    and p.visibility_status in ('trial', 'active')
    and public.bizzi_provider_is_delivery(p.id)
    and (
      requested_city_group = ''
      or public.bizzi_city_group_key(c.name) = requested_city_group
    )
    and delivery_record.pickup_latitude is not null
    and delivery_record.pickup_longitude is not null
    and public.bizzi_distance_km(delivery_record.pickup_latitude, delivery_record.pickup_longitude, cl.latitude, cl.longitude) <= 5
  order by
    public.bizzi_distance_km(delivery_record.pickup_latitude, delivery_record.pickup_longitude, cl.latitude, cl.longitude) asc,
    cl.last_seen_at desc
  limit greatest(1, least(coalesce(p_limit, 5), 10))
  on conflict (delivery_id, provider_id) do nothing;

  get diagnostics inserted_count = row_count;

  insert into public.push_notifications(provider_id, title, body, url, payload)
  select
    ddo.provider_id,
    'Nouvelle livraison Bizzi',
    coalesce(delivery_record.pickup_address, 'Départ') || ' vers ' || coalesce(delivery_record.dropoff_address, 'Arrivée'),
    '/index.html#provider',
    jsonb_build_object(
      'delivery_id', delivery_record.id,
      'amount', delivery_record.provider_payout,
      'radius_km', 5,
      'city', delivery_record.city_name
    )
  from public.delivery_dispatch_offers ddo
  where ddo.delivery_id = delivery_record.id
    and ddo.status = 'offered'
    and ddo.created_at >= now() - interval '30 seconds';

  update public.delivery_requests
  set dispatch_status = case when inserted_count > 0 then 'matched' else 'manual_review' end,
      updated_at = now()
  where id = p_delivery_id;

  if inserted_count = 0 then
    insert into public.server_alerts(alert_type, severity, title, message, payload)
    values (
      'dispatch_no_courier_5km',
      'warning',
      'Aucun livreur disponible a 5 km',
      'Aucun livreur live trouve dans la ville et a moins de 5 km pour la livraison ' || p_delivery_id,
      jsonb_build_object('delivery_id', p_delivery_id, 'city', delivery_record.city_name, 'radius_km', 5)
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'delivery_id', p_delivery_id,
    'offers_created', inserted_count,
    'radius_km', 5,
    'city_group', requested_city_group
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_distance_km(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when lat1 is null or lon1 is null or lat2 is null or lon2 is null then null
    else round((6371 * acos(
      least(1, greatest(-1,
        cos(radians(lat1)) * cos(radians(lat2)) *
        cos(radians(lon2) - radians(lon1)) +
        sin(radians(lat1)) * sin(radians(lat2))
      ))
    ))::numeric, 2)
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_find_provider_exact(provider_phone text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  result jsonb;
begin
  select to_jsonb(provider)
    into result
  from public.public_provider_directory provider
  where public.bizzi_phone_canonical(provider.phone) = public.bizzi_phone_canonical(provider_phone)
  order by provider.id
  limit 1;
  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_normalize_phone_digits(raw_phone text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select nullif(regexp_replace(coalesce(raw_phone, ''), '\D', '', 'g'), '');
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_payment_admin_allowed()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  allowed boolean := false;
begin
  if auth.uid() is null then
    return false;
  end if;

  if to_regprocedure('public.is_admin()') is not null then
    begin
      execute 'select public.is_admin()' into allowed;
      if coalesce(allowed, false) then
        return true;
      end if;
    exception when others then
      allowed := false;
    end;
  end if;

  if to_regclass('public.admin_profiles') is not null then
    execute
      'select exists (
        select 1
        from public.admin_profiles
        where auth_user_id = auth.uid()
          and is_active = true
          and lower(coalesce(role, '''')) in (''admin'', ''owner'', ''super_admin'')
      )'
      into allowed;

    return coalesce(allowed, false);
  end if;

  return false;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_phone_canonical(value text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  select case
    when regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g') like '00225%'
      then '225' || substring(regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g') from 6)
    when length(regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g')) = 10
      then '225' || regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g')
    else regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g')
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_phone_digits(phone_value text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select regexp_replace(coalesce(phone_value, ''), '[^0-9]', '', 'g');
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_plan_accepts_payment(plan_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.subscription_plans sp
    where sp.id = plan_uuid
      and sp.is_active = true
      and sp.price >= 999
  );
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_provider_accepts_payment(provider_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.providers p
    where p.id = provider_uuid
      and p.status in ('pending'::provider_status, 'approved'::provider_status)
      and p.visibility_status in (
        'trial'::provider_visibility_status,
        'active'::provider_visibility_status,
        'expired_blurred'::provider_visibility_status
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_provider_duplicate_report()
 RETURNS TABLE(phone_key text, duplicate_count integer, provider_names text, provider_ids text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    regexp_replace(coalesce(p.phone, p.whatsapp, ''), '[^0-9]', '', 'g') as phone_key,
    count(*)::integer as duplicate_count,
    string_agg(coalesce(p.full_name, 'Sans nom'), ' | ' order by p.created_at asc) as provider_names,
    string_agg(p.id::text, ',' order by p.created_at asc) as provider_ids
  from public.providers p
  where public.bizzi_payment_admin_allowed()
    and regexp_replace(coalesce(p.phone, p.whatsapp, ''), '[^0-9]', '', 'g') <> ''
  group by 1
  having count(*) > 1
  order by duplicate_count desc, phone_key;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_provider_is_delivery(p_provider_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1
    from public.provider_services ps
    join public.services s on s.id = ps.service_id
    where ps.provider_id = p_provider_id
      and public.bizzi_service_group_key(s.name) in (
        'bizzi livraison',
        'service livraison',
        'livreur',
        'livraison'
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_public_provider_count()
 RETURNS bigint
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select count(*)
  from public.providers
  where status = 'approved'
    and visibility_status in ('trial', 'active');
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_search_key(value text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  select trim(lower(translate(coalesce(value, ''),
    'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖòóôõöÙÚÛÜùúûüÝŸýÿ',
    'AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiNnOOOOOoooooUUUUuuuuYYyy'
  )));
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_search_public_providers(p_search text DEFAULT ''::text, p_city text DEFAULT ''::text, p_service text DEFAULT ''::text, p_verified_only boolean DEFAULT false, p_emergency_only boolean DEFAULT false, p_after jsonb DEFAULT '{}'::jsonb, p_limit integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  safe_limit integer := least(greatest(coalesce(p_limit, 30), 1), 50);
  search_value text := public.bizzi_search_key(p_search);
  city_value text := public.bizzi_search_key(p_city);
  service_value text := public.bizzi_search_key(p_service);
  cursor_boost integer;
  cursor_verified integer;
  cursor_rating numeric;
  cursor_id uuid;
  response jsonb;
begin
  if coalesce(p_after, '{}'::jsonb) ? 'id' then
    cursor_boost := coalesce((p_after ->> 'boost')::integer, 0);
    cursor_verified := coalesce((p_after ->> 'verified')::integer, 0);
    cursor_rating := coalesce((p_after ->> 'rating')::numeric, 0);
    cursor_id := (p_after ->> 'id')::uuid;
  end if;

  with candidates as (
    select
      p.id,
      p.full_name,
      p.phone,
      p.whatsapp,
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
      p.requested_service_name,
      p.requested_category_name,
      true as contact_visible,
      p.review_count,
      p.trial_ends_at,
      p.subscription_ends_at,
      p.boost_ends_at,
      p.delivery_penalty_rate,
      p.delivery_penalty_remaining,
      p.delivery_penalty_until,
      p.delivery_penalty_reason,
      p.delivery_cancel_count,
      'approved'::text as status,
      case when p.boost_ends_at > now() then 1 else 0 end as sort_boost,
      case when p.is_verified then 1 else 0 end as sort_verified,
      coalesce(p.average_rating, 0) as sort_rating
    from public.providers p
    left join public.cities c on c.id = p.city_id
    left join public.communes co on co.id = p.commune_id
    where p.status = 'approved'
      and p.visibility_status in ('trial', 'active')
      and (
        city_value = ''
        or public.bizzi_search_key(c.name) = city_value
        or public.bizzi_search_key(co.name) = city_value
      )
      and (
        service_value = ''
        or public.bizzi_search_key(p.requested_service_name) = service_value
        or exists (
          select 1
          from public.provider_services service_filter
          join public.services service_row on service_row.id = service_filter.service_id
          where service_filter.provider_id = p.id
            and public.bizzi_search_key(service_row.name) = service_value
        )
      )
      and (
        not coalesce(p_verified_only, false)
        or p.is_verified = true
      )
      and (
        not coalesce(p_emergency_only, false)
        or lower(translate(coalesce(p.requested_service_name, ''),
          'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖòóôõöÙÚÛÜùúûüÝŸýÿ',
          'AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiNnOOOOOoooooUUUUuuuuYYyy'
        )) = any (array[
          'plombier', 'electricien', 'serrurier', 'mecanicien',
          'remorquage / depannage auto', 'depannage moto', 'vulcanisateur / pneus',
          'frigoriste / climatisation', 'technicien electromenager', 'ambulance privee',
          'infirmier a domicile', 'garde-malade', 'chauffeur', 'conducteur moto-taxi',
          'bizzi livraison', 'desinsectisation / deratisation', 'vidangeur',
          'ramassage d''ordures', 'installation wi-fi / camera', 'reparateur telephone',
          'reparateur ordinateur / imprimante'
        ]::text[])
        or exists (
          select 1
          from public.provider_services emergency_link
          join public.services emergency_service on emergency_service.id = emergency_link.service_id
          where emergency_link.provider_id = p.id
            and lower(translate(emergency_service.name,
              'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖòóôõöÙÚÛÜùúûüÝŸýÿ',
              'AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiNnOOOOOoooooUUUUuuuuYYyy'
            )) = any (array[
              'plombier', 'electricien', 'serrurier', 'mecanicien',
              'remorquage / depannage auto', 'depannage moto', 'vulcanisateur / pneus',
              'frigoriste / climatisation', 'technicien electromenager', 'ambulance privee',
              'infirmier a domicile', 'garde-malade', 'chauffeur', 'conducteur moto-taxi',
              'bizzi livraison', 'desinsectisation / deratisation', 'vidangeur',
              'ramassage d''ordures', 'installation wi-fi / camera', 'reparateur telephone',
              'reparateur ordinateur / imprimante'
            ]::text[])
        )
      )
      and (
        search_value = ''
        or public.bizzi_search_key(p.full_name) like '%' || search_value || '%'
        or public.bizzi_search_key(p.description) like '%' || search_value || '%'
        or public.bizzi_search_key(p.neighborhood) like '%' || search_value || '%'
        or public.bizzi_search_key(c.name) like '%' || search_value || '%'
        or public.bizzi_search_key(co.name) like '%' || search_value || '%'
        or public.bizzi_search_key(p.requested_service_name) like '%' || search_value || '%'
        or public.bizzi_search_key(p.requested_category_name) like '%' || search_value || '%'
        or (
          length(public.bizzi_phone_canonical(p_search)) >= 8
          and public.bizzi_phone_canonical(p.phone) = public.bizzi_phone_canonical(p_search)
        )
        or exists (
          select 1
          from public.provider_services search_link
          join public.services search_service on search_service.id = search_link.service_id
          left join public.categories search_category on search_category.id = search_service.category_id
          where search_link.provider_id = p.id
            and (
              public.bizzi_search_key(search_service.name) like '%' || search_value || '%'
              or public.bizzi_search_key(search_category.name) like '%' || search_value || '%'
            )
        )
      )
  ), page_with_extra as (
    select *
    from candidates
    where cursor_id is null
      or sort_boost < cursor_boost
      or (sort_boost = cursor_boost and sort_verified < cursor_verified)
      or (sort_boost = cursor_boost and sort_verified = cursor_verified and sort_rating < cursor_rating)
      or (sort_boost = cursor_boost and sort_verified = cursor_verified and sort_rating = cursor_rating and id > cursor_id)
    order by sort_boost desc, sort_verified desc, sort_rating desc, id asc
    limit safe_limit + 1
  ), visible_page as (
    select *
    from page_with_extra
    order by sort_boost desc, sort_verified desc, sort_rating desc, id asc
    limit safe_limit
  ), enriched_page as (
    select
      visible_page.*,
      coalesce(primary_service.service_name, nullif(trim(visible_page.requested_service_name), ''), 'Metier a preciser') as service_name,
      coalesce(primary_service.category_name, nullif(trim(visible_page.requested_category_name), ''), 'Autres') as category_name,
      coalesce(all_services.service_names, array[]::text[]) as service_names
    from visible_page
    left join lateral (
      select
        s.name as service_name,
        cat.name as category_name
      from public.provider_services ps
      join public.services s on s.id = ps.service_id
      left join public.categories cat on cat.id = s.category_id
      where ps.provider_id = visible_page.id
      order by ps.is_primary desc, s.name asc
      limit 1
    ) primary_service on true
    left join lateral (
      select array_agg(distinct s.name order by s.name) as service_names
      from public.provider_services ps
      join public.services s on s.id = ps.service_id
      where ps.provider_id = visible_page.id
    ) all_services on true
  ), last_row as (
    select *
    from visible_page
    order by sort_boost asc, sort_verified asc, sort_rating asc, id desc
    limit 1
  )
  select jsonb_build_object(
    'items', coalesce((
      select jsonb_agg(
        to_jsonb(item)
          - 'sort_boost' - 'sort_verified' - 'sort_rating'
          - 'requested_service_name' - 'requested_category_name'
        order by item.sort_boost desc, item.sort_verified desc, item.sort_rating desc, item.id asc
      )
      from enriched_page item
    ), '[]'::jsonb),
    'has_more', (select count(*) > safe_limit from page_with_extra),
    'next_cursor', (
      select jsonb_build_object(
        'boost', sort_boost,
        'verified', sort_verified,
        'rating', sort_rating,
        'id', id
      )
      from last_row
    ),
    'page_size', safe_limit
  ) into response;

  return coalesce(response, jsonb_build_object(
    'items', '[]'::jsonb,
    'has_more', false,
    'next_cursor', null,
    'page_size', safe_limit
  ));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_service_group_key(p_service text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select trim(regexp_replace(lower(translate(coalesce(p_service, ''),
    'àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
    'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'
  )), '[^a-z0-9]+', ' ', 'g'));
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_submit_review(p_provider_uuid uuid, p_provider_phone text, p_rating integer, p_message text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  target_provider_id uuid;
  new_review_id uuid;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'La note doit etre comprise entre 1 et 5';
  end if;

  if p_provider_uuid is not null then
    select p.id
    into target_provider_id
    from providers p
    where p.id = p_provider_uuid
      and p.status = 'approved'
      and p.visibility_status in ('trial', 'active')
    limit 1;
  end if;

  if target_provider_id is null and p_provider_phone is not null and length(trim(p_provider_phone)) > 0 then
    select p.id
    into target_provider_id
    from providers p
    where p.phone = p_provider_phone
      and p.status = 'approved'
      and p.visibility_status in ('trial', 'active')
    limit 1;
  end if;

  if target_provider_id is null then
    raise exception 'Prestataire non visible ou introuvable pour cet avis';
  end if;

  insert into provider_reviews (provider_id, rating, message, status)
  values (
    target_provider_id,
    p_rating,
    left(coalesce(p_message, ''), 500),
    'published'
  )
  returning id into new_review_id;

  return jsonb_build_object(
    'review_id', new_review_id,
    'provider_id', target_provider_id,
    'rating', p_rating,
    'status', 'published'
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.bizzi_update_courier_location(p_provider_id uuid, p_provider_phone text, p_latitude double precision, p_longitude double precision, p_accuracy_meters numeric DEFAULT NULL::numeric, p_battery_level integer DEFAULT NULL::integer, p_is_available boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  provider_record record;
begin
  select id, phone, full_name, status, visibility_status
    into provider_record
  from public.providers
  where id = p_provider_id
    and regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = regexp_replace(coalesce(p_provider_phone, ''), '[^0-9]', '', 'g')
    and status = 'approved'
    and visibility_status in ('trial', 'active')
  limit 1;

  if provider_record.id is null then
    insert into public.fraud_signals(signal_type, phone, provider_id, severity, reason, payload)
    values ('courier_location_rejected', p_provider_phone, p_provider_id, 'high', 'Position refusee: prestataire introuvable ou non actif', jsonb_build_object('provider_id', p_provider_id));
    raise exception 'Prestataire livreur non autorise';
  end if;

  insert into public.courier_locations (
    provider_id, provider_phone, latitude, longitude, accuracy_meters, battery_level, is_available, last_seen_at, updated_at
  )
  values (
    p_provider_id, p_provider_phone, p_latitude, p_longitude, p_accuracy_meters, p_battery_level, p_is_available, now(), now()
  )
  on conflict (provider_id)
  do update set
    provider_phone = excluded.provider_phone,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    accuracy_meters = excluded.accuracy_meters,
    battery_level = excluded.battery_level,
    is_available = excluded.is_available,
    last_seen_at = now(),
    updated_at = now();

  return jsonb_build_object('ok', true, 'provider_id', p_provider_id, 'last_seen_at', now());
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_admin_approve_payment(p_mission_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
  updated_count integer;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if mission_row.status <> 'payment_pending' then
    raise exception 'Cette mission n''a pas de paiement en attente';
  end if;

  update public.cash_transactions
  set status = 'confirmed'
  where mission_id = p_mission_id and type = 'mission_escrow' and status = 'pending';
  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    raise exception 'Aucune transaction de paiement en attente trouvée';
  end if;

  update public.cash_missions set status = 'published', secured = true, updated_at = now()
  where id = p_mission_id returning * into mission_row;

  perform public.cash_notify(mission_row.requester_phone, 'payment_approved', p_mission_id,
    'Prime sécurisée ✓ — "' || mission_row.title || '" est maintenant publiée.');
  perform public.admin_log_action('cash_admin_approve_payment', p_mission_id::text, true, null, jsonb_build_object('mission_id', p_mission_id));

  return to_jsonb(mission_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_admin_list_disputes(p_status text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  response jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select coalesce(jsonb_agg(
    to_jsonb(d) || jsonb_build_object('mission_title', m.title, 'mission_reward', m.reward_amount)
    order by d.created_at desc
  ), '[]'::jsonb) into response
  from public.cash_disputes d
  join public.cash_missions m on m.id = d.mission_id
  where nullif(trim(p_status), '') is null or d.status = trim(p_status);

  return response;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_admin_list_missions(p_status text DEFAULT ''::text, p_limit integer DEFAULT 50)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  safe_limit integer := least(greatest(coalesce(p_limit, 50), 1), 200);
  response jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select coalesce(jsonb_agg(
    to_jsonb(m) || jsonb_build_object(
      'active_solutions_count', (select count(*) from public.cash_solutions s where s.mission_id = m.id and s.status = 'pending'),
      'escrow_reference', (select payment_reference from public.cash_transactions t where t.mission_id = m.id and t.type = 'mission_escrow' order by t.created_at desc limit 1)
    )
    order by m.created_at desc
  ), '[]'::jsonb) into response
  from (
    select * from public.cash_missions
    where (nullif(trim(p_status), '') is null or status = trim(p_status))
    order by created_at desc
    limit safe_limit
  ) m;

  return response;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_admin_reject_payment(p_mission_id uuid, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if mission_row.status <> 'payment_pending' then
    raise exception 'Cette mission n''a pas de paiement en attente';
  end if;

  update public.cash_transactions
  set status = 'rejected'
  where mission_id = p_mission_id and type = 'mission_escrow' and status = 'pending';

  update public.cash_missions set status = 'draft', updated_at = now()
  where id = p_mission_id returning * into mission_row;

  perform public.cash_notify(mission_row.requester_phone, 'payment_rejected', p_mission_id,
    'Paiement refusé pour "' || mission_row.title || '" : ' || coalesce(p_reason, 'référence introuvable') || '. Merci de renvoyer une référence valide.');
  perform public.admin_log_action('cash_admin_reject_payment', p_mission_id::text, true, p_reason, '{}'::jsonb);

  return to_jsonb(mission_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_admin_reject_solution(p_solution_id uuid, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  solution_row public.cash_solutions%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select * into solution_row from public.cash_solutions where id = p_solution_id for update;
  if not found then
    raise exception 'Solution introuvable';
  end if;
  if solution_row.status <> 'pending' then
    raise exception 'Cette solution ne peut plus être modérée';
  end if;

  update public.cash_solutions set status = 'rejected' where id = p_solution_id returning * into solution_row;
  perform public.cash_notify(solution_row.solver_phone, 'solution_moderated', solution_row.mission_id,
    'Ta proposition a été retirée par la modération : ' || coalesce(p_reason, 'contenu non conforme'));
  perform public.admin_log_action('cash_admin_reject_solution', p_solution_id::text, true, p_reason, '{}'::jsonb);

  return to_jsonb(solution_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_admin_resolve_dispute(p_dispute_id uuid, p_favor text, p_resolution text, p_solver_share_amount numeric DEFAULT NULL::numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  dispute_row public.cash_disputes%rowtype;
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
  commission_rate numeric := public.cash_setting_numeric('cash_commission_rate', 0.10);
  share numeric;
  commission_amount numeric;
  remainder numeric;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;
  if p_favor not in ('requester', 'solver', 'partial') then
    raise exception 'Décision invalide';
  end if;

  select * into dispute_row from public.cash_disputes where id = p_dispute_id for update;
  if not found then
    raise exception 'Litige introuvable';
  end if;
  if dispute_row.status not in ('open', 'under_review') then
    raise exception 'Ce litige est déjà résolu';
  end if;

  select * into mission_row from public.cash_missions where id = dispute_row.mission_id for update;
  select * into solution_row from public.cash_solutions where id = mission_row.selected_solution_id;

  if p_favor = 'solver' then
    update public.cash_missions set status = 'completed', updated_at = now() where id = mission_row.id;
    perform public.cash_distribute_reward(mission_row.id);
    update public.cash_disputes set status = 'resolved_solver', resolution = p_resolution, resolved_at = now() where id = p_dispute_id;

  elsif p_favor = 'requester' then
    update public.cash_missions set status = 'cancelled', updated_at = now() where id = mission_row.id;
    perform public.cash_grant_credit(mission_row.id, mission_row.requester_phone, mission_row.reward_amount, 'Litige résolu en votre faveur');
    update public.cash_disputes set status = 'resolved_requester', resolution = p_resolution, resolved_at = now() where id = p_dispute_id;

  else
    share := greatest(least(coalesce(p_solver_share_amount, 0), mission_row.reward_amount), 0);
    remainder := mission_row.reward_amount - share;
    if share > 0 and solution_row.id is not null then
      commission_amount := round(share * least(greatest(commission_rate, 0), 1));
      insert into public.cash_transactions (mission_id, user_phone, type, amount, status)
      values (mission_row.id, public.bizzi_normalize_phone_digits(solution_row.solver_phone), 'reward_payout', share - commission_amount, 'confirmed');
      insert into public.cash_transactions (mission_id, user_phone, type, amount, status)
      values (mission_row.id, null, 'commission', commission_amount, 'confirmed');
    end if;
    if remainder > 0 then
      perform public.cash_grant_credit(mission_row.id, mission_row.requester_phone, remainder, 'Litige résolu partiellement en votre faveur');
    end if;
    update public.cash_missions set status = 'completed', updated_at = now() where id = mission_row.id;
    update public.cash_disputes set status = 'partial_resolution', resolution = p_resolution, resolved_at = now() where id = p_dispute_id;
  end if;

  if solution_row.solver_phone is not null then
    update public.cash_solver_stats
    set dispute_count = dispute_count + 1, updated_at = now()
    where user_phone = public.bizzi_normalize_phone_digits(solution_row.solver_phone);
    insert into public.cash_solver_stats (user_phone, dispute_count)
    select public.bizzi_normalize_phone_digits(solution_row.solver_phone), 1
    where not exists (select 1 from public.cash_solver_stats where user_phone = public.bizzi_normalize_phone_digits(solution_row.solver_phone));
  end if;

  perform public.cash_notify(mission_row.requester_phone, 'dispute_resolved', mission_row.id, 'Litige résolu : ' || coalesce(p_resolution, ''));
  if solution_row.solver_phone is not null then
    perform public.cash_notify(solution_row.solver_phone, 'dispute_resolved', mission_row.id, 'Litige résolu : ' || coalesce(p_resolution, ''));
  end if;
  perform public.admin_log_action('cash_admin_resolve_dispute', p_dispute_id::text, true, p_resolution, jsonb_build_object('favor', p_favor));

  select * into dispute_row from public.cash_disputes where id = p_dispute_id;
  return to_jsonb(dispute_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_admin_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  response jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select jsonb_build_object(
    'missions_total', (select count(*) from public.cash_missions),
    'missions_active', (select count(*) from public.cash_missions where status in ('published', 'solution_selected', 'in_progress', 'completion_pending')),
    'missions_completed', (select count(*) from public.cash_missions where status = 'completed'),
    'missions_disputed', (select count(*) from public.cash_missions where status = 'disputed'),
    'missions_payment_pending', (select count(*) from public.cash_missions where status = 'payment_pending'),
    'total_reward_value', (select coalesce(sum(reward_amount), 0) from public.cash_missions where secured = true),
    'total_commission', (select coalesce(sum(amount), 0) from public.cash_transactions where type = 'commission' and status = 'confirmed'),
    'total_paid_to_solvers', (select coalesce(sum(amount), 0) from public.cash_transactions where type = 'reward_payout' and status = 'confirmed'),
    'active_credits_value', (select coalesce(sum(remaining_amount), 0) from public.cash_credits where status = 'active'),
    'open_disputes', (select count(*) from public.cash_disputes where status in ('open', 'under_review')),
    'reports_pending', (select count(*) from public.cash_solutions where status = 'pending')
  ) into response;

  return response;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_apply_wallet_delta()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.cash_confirm_completion(p_mission_id uuid, p_requester_phone text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) <> public.bizzi_normalize_phone_digits(p_requester_phone) then
    raise exception 'Cette mission ne vous appartient pas';
  end if;
  if mission_row.status not in ('in_progress', 'completion_pending') then
    raise exception 'Cette mission ne peut pas être confirmée dans son état actuel';
  end if;

  update public.cash_missions set status = 'completed', updated_at = now() where id = p_mission_id returning * into mission_row;
  perform public.cash_distribute_reward(p_mission_id);

  return to_jsonb(mission_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_create_mission_draft(p_requester_phone text, p_requester_name text, p_title text, p_description text, p_category text, p_area text, p_attachments jsonb, p_deadline_type text, p_deadline_at timestamp with time zone, p_reward_amount numeric, p_service_budget_hint numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  min_reward numeric := public.cash_setting_numeric('cash_min_reward', 500);
  max_reward numeric := public.cash_setting_numeric('cash_max_reward', 500000);
  computed_deadline timestamptz;
  result_row public.cash_missions%rowtype;
begin
  if trim(coalesce(p_requester_phone, '')) = '' or trim(coalesce(p_requester_name, '')) = '' then
    raise exception 'Identité requise (nom et téléphone)';
  end if;
  if trim(coalesce(p_title, '')) = '' then
    raise exception 'Décris ce que tu recherches';
  end if;
  if p_reward_amount < min_reward or p_reward_amount > max_reward then
    raise exception 'La prime doit être comprise entre % et % FCFA', min_reward, max_reward;
  end if;

  computed_deadline := case p_deadline_type
    when 'aujourd_hui' then date_trunc('day', now()) + interval '23 hours 59 minutes'
    when 'demain' then date_trunc('day', now()) + interval '1 day 23 hours 59 minutes'
    when 'urgent' then now() + interval '24 hours'
    when 'date_personnalisee' then p_deadline_at
    else now() + interval '7 days'
  end;
  if computed_deadline is null then
    raise exception 'Échéance invalide';
  end if;

  insert into public.cash_missions (
    requester_phone, requester_name, title, description, category, area,
    attachments, deadline_type, deadline_at, reward_amount, service_budget_hint,
    status, expires_at
  )
  values (
    public.bizzi_normalize_phone_digits(p_requester_phone), trim(p_requester_name), trim(p_title),
    nullif(trim(coalesce(p_description, '')), ''), coalesce(nullif(trim(p_category), ''), 'Autre'),
    coalesce(nullif(trim(p_area), ''), 'Toute la ville'), coalesce(p_attachments, '[]'::jsonb),
    coalesce(p_deadline_type, 'cette_semaine'), computed_deadline, p_reward_amount, p_service_budget_hint,
    'draft', computed_deadline
  )
  returning * into result_row;

  return to_jsonb(result_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_declare_mission_payment(p_mission_id uuid, p_requester_phone text, p_payment_method text, p_transaction_reference text, p_amount numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) <> public.bizzi_normalize_phone_digits(p_requester_phone) then
    raise exception 'Cette mission ne vous appartient pas';
  end if;
  if mission_row.status not in ('draft') then
    raise exception 'Cette mission a déjà un paiement déclaré ou publié';
  end if;
  if trim(coalesce(p_transaction_reference, '')) = '' then
    raise exception 'Référence de transaction requise';
  end if;
  if round(coalesce(p_amount, 0)) <> round(mission_row.reward_amount) then
    raise exception 'Le montant déclaré ne correspond pas à la prime de la mission';
  end if;

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status, payment_reference, payment_method)
  values (p_mission_id, public.bizzi_normalize_phone_digits(p_requester_phone), 'mission_escrow', p_amount, 'pending', trim(p_transaction_reference), p_payment_method);

  update public.cash_missions
  set status = 'payment_pending', updated_at = now()
  where id = p_mission_id
  returning * into mission_row;

  return to_jsonb(mission_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_distribute_reward(p_mission_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
  commission_rate numeric := public.cash_setting_numeric('cash_commission_rate', 0.10);
  solver_amount numeric;
  commission_amount numeric;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;

  -- Idempotence explicite en plus de l'index unique : evite une exception
  -- bruyante si la fonction est rejouee (retry reseau, double clic deja
  -- absorbe cote UI mais on protege aussi le serveur).
  if exists (
    select 1 from public.cash_transactions
    where mission_id = p_mission_id and type = 'reward_payout' and status = 'confirmed'
  ) then
    return;
  end if;

  if mission_row.selected_solution_id is null then
    raise exception 'Aucune solution selectionnee pour cette mission';
  end if;

  select * into solution_row from public.cash_solutions where id = mission_row.selected_solution_id;
  if not found then
    raise exception 'Solution selectionnee introuvable';
  end if;

  commission_rate := least(greatest(commission_rate, 0), 1);
  commission_amount := round(mission_row.reward_amount * commission_rate);
  solver_amount := mission_row.reward_amount - commission_amount;

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status, raw_payload)
  values (
    p_mission_id, public.bizzi_normalize_phone_digits(solution_row.solver_phone), 'reward_payout', solver_amount, 'confirmed',
    jsonb_build_object('commission_rate', commission_rate, 'reward_amount', mission_row.reward_amount)
  );

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status, raw_payload)
  values (
    p_mission_id, null, 'commission', commission_amount, 'confirmed',
    jsonb_build_object('commission_rate', commission_rate, 'solver_phone', solution_row.solver_phone)
  );

  update public.cash_solver_stats
  set missions_completed = missions_completed + 1, updated_at = now()
  where user_phone = public.bizzi_normalize_phone_digits(solution_row.solver_phone);
  insert into public.cash_solver_stats (user_phone, missions_completed)
  select public.bizzi_normalize_phone_digits(solution_row.solver_phone), 1
  where not exists (
    select 1 from public.cash_solver_stats where user_phone = public.bizzi_normalize_phone_digits(solution_row.solver_phone)
  );

  perform public.cash_notify(solution_row.solver_phone, 'payment_received', p_mission_id,
    'Paiement reçu : ' || solver_amount::text || ' FCFA pour "' || mission_row.title || '"');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_get_mission_detail(p_mission_id uuid, p_caller_phone text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
  caller_norm text := public.bizzi_normalize_phone_digits(p_caller_phone);
  is_owner boolean;
  solutions_json jsonb;
  dispute_json jsonb;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id;
  if not found then
    return null;
  end if;
  is_owner := caller_norm is not null and caller_norm = public.bizzi_normalize_phone_digits(mission_row.requester_phone);

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'solver_name', s.solver_name,
      'solver_phone', case when is_owner or public.bizzi_normalize_phone_digits(s.solver_phone) = caller_norm then s.solver_phone else null end,
      'contact', case when is_owner or public.bizzi_normalize_phone_digits(s.solver_phone) = caller_norm then s.contact else null end,
      'description', s.description,
      'attachments', s.attachments,
      'price_hint', s.price_hint,
      'availability', s.availability,
      'status', s.status,
      'submitted_at', s.submitted_at,
      'is_mine', public.bizzi_normalize_phone_digits(s.solver_phone) = caller_norm,
      'solver_stats', (select to_jsonb(st) - 'user_phone' from public.cash_solver_stats st where st.user_phone = public.bizzi_normalize_phone_digits(s.solver_phone))
    )
    order by s.submitted_at asc
  ), '[]'::jsonb)
  into solutions_json
  from public.cash_solutions s
  where s.mission_id = p_mission_id
    and (is_owner or public.bizzi_normalize_phone_digits(s.solver_phone) = caller_norm or s.status = 'selected');

  select to_jsonb(d) into dispute_json from public.cash_disputes d
  where d.mission_id = p_mission_id order by d.created_at desc limit 1;

  -- Compte total independant de la visibilite (les propositions des autres
  -- solveurs sont masquees dans "solutions" par souci de confidentialite,
  -- mais le badge X/3 doit rester exact pour tout le monde).
  return to_jsonb(mission_row)
    || jsonb_build_object(
      'is_owner', is_owner,
      'solutions', solutions_json,
      'dispute', dispute_json,
      'active_solutions_count', (select count(*) from public.cash_solutions s2 where s2.mission_id = p_mission_id and s2.status = 'pending')
    )
    || jsonb_build_object('requester_phone', case when is_owner then mission_row.requester_phone else null end);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_get_solver_profile(p_phone text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(to_jsonb(st), jsonb_build_object(
    'user_phone', public.bizzi_normalize_phone_digits(p_phone), 'average_rating', 0, 'review_count', 0,
    'missions_won', 0, 'missions_completed', 0, 'dispute_count', 0
  ))
  from public.cash_solver_stats st
  where st.user_phone = public.bizzi_normalize_phone_digits(p_phone);
$function$
;

CREATE OR REPLACE FUNCTION public.cash_grant_credit(p_mission_id uuid, p_user_phone text, p_amount numeric, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  validity_days numeric := public.cash_setting_numeric('cash_credit_validity_days', 45);
begin
  if p_amount <= 0 then
    return;
  end if;
  insert into public.cash_credits (user_phone, source_mission_id, initial_amount, remaining_amount, status, expires_at)
  values (public.bizzi_normalize_phone_digits(p_user_phone), p_mission_id, p_amount, p_amount, 'active', now() + make_interval(days => greatest(validity_days, 1)::int));

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status, raw_payload)
  values (p_mission_id, public.bizzi_normalize_phone_digits(p_user_phone), 'credit_grant', p_amount, 'confirmed', jsonb_build_object('reason', p_reason));

  perform public.cash_notify(p_user_phone, 'credit_granted', p_mission_id,
    'Crédit ZEYDS Cash de ' || p_amount::text || ' FCFA (' || coalesce(p_reason, '') || '), valable ' || validity_days::text || ' jours');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_list_missions_by_ids(p_ids uuid[])
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'title', m.title,
      'description', m.description,
      'category', m.category,
      'area', m.area,
      'deadline_at', m.deadline_at,
      'reward_amount', m.reward_amount,
      'status', m.status,
      'secured', m.secured,
      'requester_name', m.requester_name,
      'created_at', m.created_at,
      'expires_at', m.expires_at,
      'active_solutions_count', (select count(*) from public.cash_solutions s where s.mission_id = m.id and s.status = 'pending')
    )
    order by m.created_at desc
  ), '[]'::jsonb)
  from public.cash_missions m
  where m.id = any(coalesce(p_ids, array[]::uuid[]));
$function$
;

CREATE OR REPLACE FUNCTION public.cash_list_my_credits(p_phone text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at desc), '[]'::jsonb)
  from public.cash_credits c
  where public.bizzi_normalize_phone_digits(c.user_phone) = public.bizzi_normalize_phone_digits(p_phone);
$function$
;

CREATE OR REPLACE FUNCTION public.cash_list_my_missions(p_phone text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_agg(
    to_jsonb(m) || jsonb_build_object(
      'active_solutions_count', (select count(*) from public.cash_solutions s where s.mission_id = m.id and s.status = 'pending')
    )
    order by m.created_at desc
  ), '[]'::jsonb)
  from public.cash_missions m
  where public.bizzi_normalize_phone_digits(m.requester_phone) = public.bizzi_normalize_phone_digits(p_phone);
$function$
;

CREATE OR REPLACE FUNCTION public.cash_list_my_notifications(p_phone text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  response jsonb;
begin
  select coalesce(jsonb_agg(to_jsonb(n) order by n.created_at desc), '[]'::jsonb) into response
  from public.cash_notifications n
  where public.bizzi_normalize_phone_digits(n.user_phone) = public.bizzi_normalize_phone_digits(p_phone)
  limit 50;

  update public.cash_notifications
  set read_at = now()
  where public.bizzi_normalize_phone_digits(user_phone) = public.bizzi_normalize_phone_digits(p_phone) and read_at is null;

  return response;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_list_my_solutions(p_phone text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_agg(
    to_jsonb(s) || jsonb_build_object(
      'mission_title', m.title, 'mission_status', m.status, 'mission_area', m.area,
      'mission_reward_amount', m.reward_amount
    )
    order by s.submitted_at desc
  ), '[]'::jsonb)
  from public.cash_solutions s
  join public.cash_missions m on m.id = s.mission_id
  where public.bizzi_normalize_phone_digits(s.solver_phone) = public.bizzi_normalize_phone_digits(p_phone);
$function$
;

CREATE OR REPLACE FUNCTION public.cash_notify(p_user_phone text, p_type text, p_mission_id uuid, p_message text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  insert into public.cash_notifications (user_phone, type, mission_id, message)
  select public.bizzi_normalize_phone_digits(p_user_phone), p_type, p_mission_id, p_message
  where p_user_phone is not null and trim(p_user_phone) <> '';
$function$
;

CREATE OR REPLACE FUNCTION public.cash_open_dispute(p_mission_id uuid, p_opened_by_phone text, p_category text, p_description text, p_attachments jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
  result_row public.cash_disputes%rowtype;
  is_requester boolean;
  is_solver boolean;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if mission_row.status not in ('in_progress', 'completion_pending') then
    raise exception 'Un litige ne peut être ouvert que sur une mission en cours';
  end if;

  select * into solution_row from public.cash_solutions where id = mission_row.selected_solution_id;

  is_requester := public.bizzi_normalize_phone_digits(mission_row.requester_phone) = public.bizzi_normalize_phone_digits(p_opened_by_phone);
  is_solver := found and public.bizzi_normalize_phone_digits(solution_row.solver_phone) = public.bizzi_normalize_phone_digits(p_opened_by_phone);
  if not (is_requester or is_solver) then
    raise exception 'Vous n''êtes pas concerné par cette mission';
  end if;
  if exists (select 1 from public.cash_disputes where mission_id = p_mission_id and status in ('open', 'under_review')) then
    raise exception 'Un litige est déjà en cours pour cette mission';
  end if;

  insert into public.cash_disputes (mission_id, opened_by_phone, category, description, attachments)
  values (p_mission_id, public.bizzi_normalize_phone_digits(p_opened_by_phone), coalesce(nullif(trim(p_category), ''), 'autre'), trim(p_description), coalesce(p_attachments, '[]'::jsonb))
  returning * into result_row;

  update public.cash_missions set status = 'disputed', updated_at = now() where id = p_mission_id;

  perform public.cash_notify(mission_row.requester_phone, 'dispute_opened', p_mission_id, 'Litige ouvert sur "' || mission_row.title || '" — fonds bloqués en attendant l''examen ZEYDS.');
  if solution_row.solver_phone is not null then
    perform public.cash_notify(solution_row.solver_phone, 'dispute_opened', p_mission_id, 'Litige ouvert sur "' || mission_row.title || '" — fonds bloqués en attendant l''examen ZEYDS.');
  end if;

  return to_jsonb(result_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_refresh_solver_stats(p_user_phone text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.cash_reviews_refresh_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if tg_op = 'DELETE' then
    perform public.cash_refresh_solver_stats(old.reviewed_phone);
    return old;
  end if;
  perform public.cash_refresh_solver_stats(new.reviewed_phone);
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_select_solution(p_mission_id uuid, p_requester_phone text, p_solution_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
  duration_label text;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) <> public.bizzi_normalize_phone_digits(p_requester_phone) then
    raise exception 'Cette mission ne vous appartient pas';
  end if;
  if mission_row.status <> 'published' then
    raise exception 'Cette mission n''est plus ouverte à la sélection';
  end if;

  select * into solution_row from public.cash_solutions where id = p_solution_id and mission_id = p_mission_id;
  if not found or solution_row.status <> 'pending' then
    raise exception 'Solution introuvable ou déjà traitée';
  end if;

  update public.cash_solutions set status = 'rejected'
  where mission_id = p_mission_id and status = 'pending' and id <> p_solution_id;

  update public.cash_solutions set status = 'selected', selected_at = now()
  where id = p_solution_id;

  update public.cash_missions
  set status = 'in_progress', selected_solution_id = p_solution_id, updated_at = now()
  where id = p_mission_id
  returning * into mission_row;

  duration_label := case when solution_row.estimated_duration is not null
    then trim(to_char(solution_row.estimated_duration, 'FM999990.##')) || ' ' || coalesce(solution_row.duration_unit, '')
    else null end;

  perform public.cash_notify(solution_row.solver_phone, 'solution_selected', p_mission_id,
    'Votre proposition a été acceptée 🎉 — "' || mission_row.title || '" · Prime : ' || mission_row.reward_amount::text || ' FCFA'
    || coalesce(' · Délai annoncé : ' || duration_label, ''));
  perform public.cash_notify(s.solver_phone, 'solution_rejected', p_mission_id, 'Une autre solution a été retenue pour "' || mission_row.title || '"')
  from public.cash_solutions s where s.mission_id = p_mission_id and s.id <> p_solution_id and s.status = 'rejected';

  return to_jsonb(mission_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_setting_numeric(p_key text, p_default numeric)
 RETURNS numeric
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce((select (value)::text::numeric from public.platform_settings where key = p_key), p_default);
$function$
;

CREATE OR REPLACE FUNCTION public.cash_solver_finalize_mission(p_mission_id uuid, p_solver_phone text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if mission_row.status <> 'in_progress' then
    raise exception 'Cette mission n''est pas en cours';
  end if;

  select * into solution_row from public.cash_solutions where id = mission_row.selected_solution_id;
  if not found or public.bizzi_normalize_phone_digits(solution_row.solver_phone) <> public.bizzi_normalize_phone_digits(p_solver_phone) then
    raise exception 'Vous n''êtes pas le solveur retenu pour cette mission';
  end if;

  update public.cash_missions
  set status = 'completion_pending', completion_pending_at = now(), reminder_stage = 0, updated_at = now()
  where id = p_mission_id
  returning * into mission_row;

  perform public.cash_notify(mission_row.requester_phone, 'completion_pending', p_mission_id,
    solution_row.solver_name || ' indique avoir terminé "' || mission_row.title || '" — confirme la réception.');

  return to_jsonb(mission_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_submit_review(p_mission_id uuid, p_reviewer_phone text, p_rating integer, p_speed_rating integer, p_reliability_rating integer, p_quality_rating integer, p_comment text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
  result_row public.cash_reviews%rowtype;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) <> public.bizzi_normalize_phone_digits(p_reviewer_phone) then
    raise exception 'Seul le demandeur peut noter cette mission';
  end if;
  if mission_row.status <> 'completed' then
    raise exception 'Cette mission n''est pas encore terminée';
  end if;

  select * into solution_row from public.cash_solutions where id = mission_row.selected_solution_id;
  if not found then
    raise exception 'Solveur introuvable pour cette mission';
  end if;

  insert into public.cash_reviews (mission_id, reviewer_phone, reviewed_phone, rating, speed_rating, reliability_rating, quality_rating, comment)
  values (
    p_mission_id, public.bizzi_normalize_phone_digits(p_reviewer_phone), public.bizzi_normalize_phone_digits(solution_row.solver_phone),
    greatest(least(p_rating, 5), 1), p_speed_rating, p_reliability_rating, p_quality_rating, nullif(trim(coalesce(p_comment, '')), '')
  )
  on conflict (mission_id, reviewer_phone) do update
  set rating = excluded.rating, speed_rating = excluded.speed_rating,
      reliability_rating = excluded.reliability_rating, quality_rating = excluded.quality_rating, comment = excluded.comment
  returning * into result_row;

  return to_jsonb(result_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_submit_solution(p_mission_id uuid, p_solver_phone text, p_solver_name text, p_description text, p_attachments jsonb, p_contact text, p_price_hint numeric, p_availability text, p_estimated_duration numeric, p_duration_unit text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
  max_active integer := public.cash_setting_numeric('cash_max_active_solutions', 3)::integer;
  active_count integer;
  result_row public.cash_solutions%rowtype;
  solver_stats_row public.cash_solver_stats%rowtype;
  duration_label text;
  notif_message text;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if mission_row.status <> 'published' then
    raise exception 'Cette mission n''accepte plus de nouvelles solutions';
  end if;
  if mission_row.expires_at is not null and mission_row.expires_at <= now() then
    raise exception 'Cette mission a expiré';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) = public.bizzi_normalize_phone_digits(p_solver_phone) then
    raise exception 'Vous ne pouvez pas proposer de solution sur votre propre demande';
  end if;
  if trim(coalesce(p_solver_phone, '')) = '' or trim(coalesce(p_solver_name, '')) = '' then
    raise exception 'Identité requise (nom et téléphone)';
  end if;
  if p_duration_unit not in ('heures', 'jours') then
    raise exception 'Délai invalide';
  end if;
  if coalesce(p_estimated_duration, 0) <= 0 then
    raise exception 'Indique le délai nécessaire pour réaliser cette mission';
  end if;

  select count(*) into active_count from public.cash_solutions where mission_id = p_mission_id and status = 'pending';
  if active_count >= max_active then
    raise exception '3 solutions sont déjà proposées pour cette mission';
  end if;
  if exists (
    select 1 from public.cash_solutions
    where mission_id = p_mission_id and status = 'pending'
      and public.bizzi_normalize_phone_digits(solver_phone) = public.bizzi_normalize_phone_digits(p_solver_phone)
  ) then
    raise exception 'Vous avez déjà une proposition active sur cette mission';
  end if;

  insert into public.cash_solutions (
    mission_id, solver_phone, solver_name, description, attachments, contact, price_hint, availability,
    estimated_duration, duration_unit
  )
  values (
    p_mission_id, public.bizzi_normalize_phone_digits(p_solver_phone), trim(p_solver_name),
    nullif(trim(coalesce(p_description, '')), ''), coalesce(p_attachments, '[]'::jsonb),
    nullif(trim(coalesce(p_contact, '')), ''), p_price_hint, nullif(trim(coalesce(p_availability, '')), ''),
    p_estimated_duration, p_duration_unit
  )
  returning * into result_row;

  select * into solver_stats_row from public.cash_solver_stats where user_phone = public.bizzi_normalize_phone_digits(p_solver_phone);
  duration_label := trim(to_char(p_estimated_duration, 'FM999990.##')) || ' ' || p_duration_unit;

  notif_message := trim(p_solver_name)
    || case when solver_stats_row.review_count > 0
         then format(' (⭐%s · %s missions)', to_char(coalesce(solver_stats_row.average_rating, 0), 'FM9.0'), coalesce(solver_stats_row.missions_completed, 0))
         else ' (nouveau solveur)'
       end
    || ' peut vous aider pour "' || mission_row.title || '" — délai annoncé : ' || duration_label;

  perform public.cash_notify(mission_row.requester_phone, 'new_solution', p_mission_id, notif_message);

  return to_jsonb(result_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_sweep_expired(p_limit integer DEFAULT 50)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  autoresolve_hours numeric := public.cash_setting_numeric('cash_completion_autoresolve_hours', 72);
  expired_count integer := 0;
  autoresolved_count integer := 0;
  credits_expired_count integer := 0;
  mission_row record;
begin
  for mission_row in
    select id, requester_phone, reward_amount, title from public.cash_missions
    where status = 'published' and expires_at is not null and expires_at <= now()
    limit p_limit
  loop
    update public.cash_missions set status = 'expired', updated_at = now() where id = mission_row.id;
    perform public.cash_grant_credit(mission_row.id, mission_row.requester_phone, mission_row.reward_amount, 'Aucune solution validée avant l''échéance');
    perform public.cash_notify(mission_row.requester_phone, 'mission_expired', mission_row.id,
      '"' || mission_row.title || '" a expiré sans solution retenue — la prime devient un crédit ZEYDS Cash.');
    expired_count := expired_count + 1;
  end loop;

  for mission_row in
    select id from public.cash_missions
    where status = 'completion_pending' and completion_pending_at is not null
      and completion_pending_at <= now() - make_interval(hours => greatest(autoresolve_hours, 1)::int)
    limit p_limit
  loop
    update public.cash_missions set status = 'completed', updated_at = now() where id = mission_row.id;
    perform public.cash_distribute_reward(mission_row.id);
    autoresolved_count := autoresolved_count + 1;
  end loop;

  update public.cash_credits set status = 'expired'
  where status = 'active' and expires_at <= now();
  get diagnostics credits_expired_count = row_count;

  return jsonb_build_object(
    'expired_missions', expired_count,
    'autoresolved_missions', autoresolved_count,
    'credits_expired', credits_expired_count
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_use_credit_for_mission(p_credit_id uuid, p_mission_id uuid, p_requester_phone text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  mission_row public.cash_missions%rowtype;
  credit_row public.cash_credits%rowtype;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) <> public.bizzi_normalize_phone_digits(p_requester_phone) then
    raise exception 'Cette mission ne vous appartient pas';
  end if;
  if mission_row.status <> 'draft' then
    raise exception 'Cette mission ne peut plus être payée par crédit';
  end if;

  select * into credit_row from public.cash_credits where id = p_credit_id for update;
  if not found then
    raise exception 'Crédit introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(credit_row.user_phone) <> public.bizzi_normalize_phone_digits(p_requester_phone) then
    raise exception 'Ce crédit ne vous appartient pas';
  end if;
  if credit_row.status <> 'active' or credit_row.expires_at <= now() then
    raise exception 'Ce crédit n''est plus valide';
  end if;
  if credit_row.remaining_amount < mission_row.reward_amount then
    raise exception 'Crédit insuffisant pour couvrir cette prime (utilisez le paiement manuel pour le complément)';
  end if;

  update public.cash_credits
  set remaining_amount = remaining_amount - mission_row.reward_amount,
      status = case when remaining_amount - mission_row.reward_amount <= 0 then 'consumed' else status end
  where id = p_credit_id;

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status)
  values (p_mission_id, public.bizzi_normalize_phone_digits(p_requester_phone), 'credit_redeem', mission_row.reward_amount, 'confirmed');

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status, raw_payload)
  values (p_mission_id, public.bizzi_normalize_phone_digits(p_requester_phone), 'mission_escrow', mission_row.reward_amount, 'confirmed', jsonb_build_object('source', 'credit', 'credit_id', p_credit_id));

  update public.cash_missions
  set status = 'published', secured = true, updated_at = now()
  where id = p_mission_id
  returning * into mission_row;

  return to_jsonb(mission_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cash_wallet_summary(p_phone text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'balance', coalesce((select balance from public.cash_wallets where user_phone = public.bizzi_normalize_phone_digits(p_phone)), 0),
    'transactions', coalesce((
      select jsonb_agg(to_jsonb(t) order by t.created_at desc)
      from public.cash_transactions t
      where t.user_phone = public.bizzi_normalize_phone_digits(p_phone)
      limit 200
    ), '[]'::jsonb)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.cash_withdraw_solution(p_solution_id uuid, p_solver_phone text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  solution_row public.cash_solutions%rowtype;
begin
  select * into solution_row from public.cash_solutions where id = p_solution_id for update;
  if not found then
    raise exception 'Solution introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(solution_row.solver_phone) <> public.bizzi_normalize_phone_digits(p_solver_phone) then
    raise exception 'Cette solution ne vous appartient pas';
  end if;
  if solution_row.status <> 'pending' then
    raise exception 'Cette solution ne peut plus être retirée';
  end if;

  update public.cash_solutions set status = 'withdrawn' where id = p_solution_id returning * into solution_row;
  return to_jsonb(solution_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.close_market_without_winner(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare request_row public.market_requests%rowtype; cfg public.market_settings%rowtype; credit_uuid uuid;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  select * into request_row from public.market_requests where id=p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if request_row.requester_id <> auth.uid() and not public.is_admin() then raise exception 'forbidden'; end if;
  if request_row.funding_status <> 'HELD' or request_row.status not in ('OPEN','PAUSED_REVIEW','EXPIRED') then raise exception 'request_not_closable'; end if;
  if request_row.current_solution_id is not null then raise exception 'finish_current_solution_first'; end if;
  if exists(select 1 from public.market_solutions where request_id=p_request_id and status in ('SUBMITTED','UNDER_REVIEW','ACCEPTED','PAYOUT_PENDING','PAID')) then raise exception 'solutions_still_pending'; end if;
  select * into cfg from public.market_settings where id=true;
  insert into public.market_credits(requester_id,source_request_id,original_amount,balance_amount,remaining_uses,expires_at)
    values(request_row.requester_id,p_request_id,request_row.reward_amount,request_row.reward_amount,cfg.credit_max_uses,now()+make_interval(days=>cfg.credit_valid_days))
    returning id into credit_uuid;
  update public.market_requests set status='NO_WINNER',funding_status='CREDITED',updated_at=now() where id=p_request_id;
  insert into public.market_ledger(request_id,credit_id,actor_user_id,entry_type,amount)
    values(p_request_id,credit_uuid,auth.uid(),'CREDIT_CREATED',request_row.reward_amount);
  return jsonb_build_object('request_id',p_request_id,'status','NO_WINNER','credit_id',credit_uuid,'remaining_uses',cfg.credit_max_uses,'valid_days',cfg.credit_valid_days);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.configure_market_settings(p_solver_share_percent integer, p_max_solutions integer DEFAULT 3, p_pause_hours integer DEFAULT 2, p_credit_max_uses integer DEFAULT 3, p_credit_valid_days integer DEFAULT 30, p_certified_only_direct boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'admin_required'; end if;
  if p_solver_share_percent not between 0 and 100 then raise exception 'invalid_solver_share'; end if;
  if p_max_solutions not between 1 and 10 then raise exception 'invalid_solution_limit'; end if;
  if p_pause_hours not between 1 and 48 then raise exception 'invalid_pause'; end if;
  if p_credit_max_uses not between 1 and 10 then raise exception 'invalid_credit_uses'; end if;
  if p_credit_valid_days not between 1 and 365 then raise exception 'invalid_credit_validity'; end if;
  update public.market_settings set solver_share_percent=p_solver_share_percent,
    platform_share_percent=100-p_solver_share_percent,max_solutions=p_max_solutions,pause_hours=p_pause_hours,
    credit_max_uses=p_credit_max_uses,credit_valid_days=p_credit_valid_days,
    certified_only_direct=p_certified_only_direct,updated_at=now() where id=true;
  return jsonb_build_object('solver_share_percent',p_solver_share_percent,'platform_share_percent',100-p_solver_share_percent,
    'max_solutions',p_max_solutions,'pause_hours',p_pause_hours,'credit_max_uses',p_credit_max_uses,
    'credit_valid_days',p_credit_valid_days,'certified_only_direct',p_certified_only_direct);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.confirm_market_funding(p_request_id uuid, p_external_reference text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare request_row public.market_requests%rowtype;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'admin_required'; end if;
  select * into request_row from public.market_requests where id = p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if request_row.status <> 'AWAITING_FUNDING' or request_row.funding_status <> 'PENDING' then raise exception 'request_not_awaiting_funding'; end if;
  update public.market_requests set funding_status='HELD',status='OPEN',funded_at=now(),published_at=now(),updated_at=now() where id=p_request_id;
  insert into public.market_ledger(request_id,actor_user_id,entry_type,amount,external_reference)
  values(p_request_id,auth.uid(),'HOLD',request_row.reward_amount,nullif(trim(coalesce(p_external_reference,'')),''));
  return jsonb_build_object('request_id',p_request_id,'status','OPEN','funding_status','HELD');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.confirm_market_payout(p_request_id uuid, p_payout_reference text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare request_row public.market_requests%rowtype; solution_row public.market_solutions%rowtype;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'admin_required'; end if;
  if char_length(trim(coalesce(p_payout_reference,''))) < 4 then raise exception 'payout_reference_required'; end if;
  select * into request_row from public.market_requests where id=p_request_id for update;
  if not found or request_row.status <> 'PAYOUT_PENDING' or request_row.funding_status <> 'HELD' then raise exception 'payout_not_pending'; end if;
  select * into solution_row from public.market_solutions where id=request_row.current_solution_id for update;
  if not found or solution_row.status <> 'PAYOUT_PENDING' then raise exception 'solution_payout_not_pending'; end if;
  update public.market_solutions set status='PAID',paid_at=now(),updated_at=now() where id=solution_row.id;
  update public.market_requests set status='COMPLETED',funding_status='RELEASED',completed_at=now(),updated_at=now() where id=p_request_id;
  insert into public.market_ledger(request_id,solution_id,actor_user_id,entry_type,amount,external_reference)
    values(p_request_id,solution_row.id,auth.uid(),'PAYOUT_CONFIRMED',request_row.solver_reward_amount,trim(p_payout_reference));
  return jsonb_build_object('request_id',p_request_id,'solution_id',solution_row.id,'status','COMPLETED');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_market_request(p_title text, p_description text, p_category text, p_city text, p_area text, p_duration_days integer, p_reward_amount bigint, p_urgency text, p_payment_method text, p_payment_reference text DEFAULT NULL::text, p_credit_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  actor_uuid uuid := auth.uid();
  cfg public.market_settings%rowtype;
  credit_row public.market_credits%rowtype;
  request_uuid uuid;
  solver_amount bigint;
  platform_amount bigint;
  initial_status text := 'AWAITING_FUNDING';
  initial_funding text := 'PENDING';
  clean_reference text := nullif(trim(coalesce(p_payment_reference,'')), '');
begin
  if actor_uuid is null then raise exception 'authentication_required'; end if;
  if char_length(trim(coalesce(p_title,''))) not between 5 and 100 then raise exception 'invalid_title'; end if;
  if char_length(trim(coalesce(p_description,''))) not between 20 and 1200 then raise exception 'invalid_description'; end if;
  if char_length(trim(coalesce(p_category,''))) not between 2 and 80 then raise exception 'invalid_category'; end if;
  if char_length(trim(coalesce(p_city,''))) not between 2 and 80 then raise exception 'invalid_city'; end if;
  if p_duration_days not in (3,7,14,30) then raise exception 'invalid_duration'; end if;
  if p_reward_amount is null or p_reward_amount < 500 then raise exception 'invalid_reward'; end if;
  if p_urgency not in ('normal','urgent') then raise exception 'invalid_urgency'; end if;

  select * into cfg from public.market_settings where id = true;
  solver_amount := floor(p_reward_amount * cfg.solver_share_percent / 100.0);
  platform_amount := p_reward_amount - solver_amount;

  if p_credit_id is not null then
    select * into credit_row from public.market_credits
    where id = p_credit_id and requester_id = actor_uuid and status = 'ACTIVE' and expires_at > now()
    for update;
    if not found then raise exception 'credit_unavailable'; end if;
    if credit_row.remaining_uses <= 0 or credit_row.balance_amount < p_reward_amount then raise exception 'credit_insufficient'; end if;
    initial_status := 'OPEN'; initial_funding := 'HELD';
  elsif clean_reference is null or char_length(clean_reference) < 4 then
    raise exception 'payment_reference_required';
  end if;

  insert into public.market_requests(
    requester_id,title,description,public_description,category,city,area,duration_days,urgency,
    reward_amount,solver_share_percent,platform_share_percent,solver_reward_amount,platform_reward_amount,
    payment_method,payment_reference,funding_status,status,max_solutions,funded_at,published_at,expires_at
  ) values(
    actor_uuid,left(trim(p_title),100),left(trim(p_description),1200),left(trim(p_description),1200),
    left(trim(p_category),80),left(trim(p_city),80),nullif(left(trim(coalesce(p_area,'')),100),''),p_duration_days,p_urgency,
    p_reward_amount,cfg.solver_share_percent,cfg.platform_share_percent,solver_amount,platform_amount,
    left(trim(p_payment_method),40),clean_reference,initial_funding,initial_status,cfg.max_solutions,
    case when p_credit_id is not null then now() end,case when p_credit_id is not null then now() end,now() + make_interval(days => p_duration_days)
  ) returning id into request_uuid;

  if p_credit_id is not null then
    update public.market_credits set balance_amount = balance_amount - p_reward_amount,
      remaining_uses = remaining_uses - 1,
      status = case when balance_amount - p_reward_amount = 0 or remaining_uses - 1 = 0 then 'USED' else 'ACTIVE' end,
      updated_at = now()
    where id = p_credit_id;
    insert into public.market_ledger(request_id,credit_id,actor_user_id,entry_type,amount,metadata)
    values(request_uuid,p_credit_id,actor_uuid,'CREDIT_CONSUMED',p_reward_amount,jsonb_build_object('source','market_credit'));
  end if;

  return jsonb_build_object('request_id',request_uuid,'status',initial_status,'funding_status',initial_funding,
    'solver_reward_amount',solver_amount,'platform_reward_amount',platform_amount);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.credit_driver_wallet(driver_uuid uuid, amount_input integer, payment_reference text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare wallet_row public.professional_wallets%rowtype;
begin
  if amount_input is null or amount_input <= 0 then raise exception 'wallet_credit_invalid'; end if;
  if payment_reference is null or length(trim(payment_reference)) < 8 then raise exception 'payment_reference_invalid'; end if;
  select * into wallet_row from public.professional_wallets where driver_id = driver_uuid for update;
  if not found then
    insert into public.professional_wallets(driver_id) values(driver_uuid) returning * into wallet_row;
  end if;
  if exists(select 1 from public.wallet_transactions where idempotency_key = 'wallet-credit:' || payment_reference) then
    return jsonb_build_object('ok', true, 'idempotent', true, 'balance', wallet_row.balance);
  end if;
  update public.professional_wallets set balance = balance + amount_input, updated_at = now() where id = wallet_row.id;
  insert into public.wallet_transactions(wallet_id, transaction_type, amount, balance_after, reserved_after, idempotency_key, description)
  values(wallet_row.id, 'credit', amount_input, wallet_row.balance + amount_input, wallet_row.reserved_balance,
    'wallet-credit:' || payment_reference, 'Recharge portefeuille chauffeur validée');
  return jsonb_build_object('ok', true, 'balance', wallet_row.balance + amount_input);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.decide_market_solution(p_request_id uuid, p_solution_id uuid, p_accept boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare request_row public.market_requests%rowtype; solution_row public.market_solutions%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  select * into request_row from public.market_requests where id=p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if request_row.requester_id <> auth.uid() and not public.is_admin() then raise exception 'forbidden'; end if;
  if request_row.current_solution_id <> p_solution_id then raise exception 'solution_not_under_review'; end if;
  select * into solution_row from public.market_solutions where id=p_solution_id and request_id=p_request_id for update;
  if not found or solution_row.status <> 'UNDER_REVIEW' then raise exception 'solution_not_under_review'; end if;

  if p_accept then
    update public.market_solutions set status='PAYOUT_PENDING',decided_at=now(),updated_at=now() where id=p_solution_id;
    update public.market_solutions set status='REJECTED',decided_at=now(),updated_at=now()
      where request_id=p_request_id and id<>p_solution_id and status in ('SUBMITTED','UNDER_REVIEW');
    update public.market_requests set status='PAYOUT_PENDING',matched_at=now(),updated_at=now() where id=p_request_id;
    insert into public.market_ledger(request_id,solution_id,actor_user_id,entry_type,amount)
      values(p_request_id,p_solution_id,auth.uid(),'SOLVER_PAYABLE',request_row.solver_reward_amount);
    insert into public.market_ledger(request_id,solution_id,actor_user_id,entry_type,amount)
      values(p_request_id,p_solution_id,auth.uid(),'PLATFORM_FEE',request_row.platform_reward_amount);
    return jsonb_build_object('request_id',p_request_id,'solution_id',p_solution_id,'status','PAYOUT_PENDING');
  end if;

  update public.market_solutions set status='REJECTED',decided_at=now(),updated_at=now() where id=p_solution_id;
  update public.market_requests set current_solution_id=null,
    status=case when solution_count < max_solutions and expires_at>now() then 'OPEN' else 'PAUSED_REVIEW' end,
    pause_until=case when solution_count < max_solutions then null else pause_until end,updated_at=now()
  where id=p_request_id;
  return jsonb_build_object('request_id',p_request_id,'solution_id',p_solution_id,'status','REJECTED');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.expire_unpaid_providers()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  update providers
  set visibility_status = 'expired_blurred'
  where status = 'approved'
  and visibility_status in ('trial', 'active')
  and coalesce(subscription_ends_at, trial_ends_at) < now();

  update advertisements
  set status = 'expired'
  where status = 'active'
  and provider_id in (
    select id from providers where visibility_status = 'expired_blurred'
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_market_admin_workspace()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare result jsonb;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'admin_required'; end if;
  select jsonb_build_object(
    'settings',to_jsonb(cfg),
    'requests',coalesce((select jsonb_agg(jsonb_build_object(
      'id',r.id,'title',r.title,'city',r.city,'status',r.status,'funding_status',r.funding_status,
      'reward_amount',r.reward_amount,'solver_reward_amount',r.solver_reward_amount,'platform_reward_amount',r.platform_reward_amount,
      'payment_method',r.payment_method,'payment_reference',r.payment_reference,'created_at',r.created_at
    ) order by r.created_at desc) from public.market_requests r where r.status in ('AWAITING_FUNDING','PAYOUT_PENDING')),'[]'::jsonb)
  ) into result from public.market_settings cfg where cfg.id=true;
  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_market_workspace(p_filter text DEFAULT 'new'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare actor_uuid uuid:=auth.uid(); result jsonb;
begin
  if actor_uuid is null then raise exception 'authentication_required'; end if;
  select jsonb_build_object(
    'settings',jsonb_build_object('solverRate',cfg.solver_share_percent,'platformRate',cfg.platform_share_percent,
      'maxSolutions',cfg.max_solutions,'pauseHours',cfg.pause_hours,'creditUses',cfg.credit_max_uses,'creditDays',cfg.credit_valid_days,
      'certifiedOnlyDirect',cfg.certified_only_direct),
    'profile',jsonb_build_object('can_refer',coalesce(perm.can_refer,true),'can_direct',coalesce(perm.can_direct,false),
      'certified',coalesce(perm.certified,false),'provider_id',perm.provider_id),
    'credits',coalesce((select jsonb_agg(to_jsonb(c) order by c.created_at desc) from public.market_credits c where c.requester_id=actor_uuid),'[]'::jsonb),
    'requests',coalesce((select jsonb_agg(to_jsonb(rq) || jsonb_build_object(
      'solutions',coalesce((select jsonb_agg(to_jsonb(s) || jsonb_build_object('display_name',case when s.solution_type='DIRECT' then coalesce(p.full_name,'Prestataire Zeyds') else 'Solution proposée' end) order by s.created_at)
        from public.market_solutions s left join public.providers p on p.id=s.provider_id where s.request_id=rq.id),'[]'::jsonb),
      'can_close_without_winner',rq.current_solution_id is null and rq.funding_status='HELD'
        and rq.status in ('OPEN','PAUSED_REVIEW','EXPIRED')
        and not exists(select 1 from public.market_solutions sx where sx.request_id=rq.id and sx.status in ('SUBMITTED','UNDER_REVIEW','ACCEPTED','PAYOUT_PENDING','PAID'))
    ) order by rq.created_at desc) from public.market_requests rq where rq.requester_id=actor_uuid),'[]'::jsonb),
    'feed',coalesce((select jsonb_agg(jsonb_build_object(
      'id',f.id,'title',f.title,'public_description',f.public_description,'category',f.category,'city',f.city,'area',f.area,
      'urgency',f.urgency,'solver_reward_amount',f.solver_reward_amount,'slots_remaining',f.max_solutions-f.solution_count,
      'certified_only',f.certified_only,'created_at',f.created_at,'expires_at',f.expires_at
    ) order by case when p_filter='reward' then f.solver_reward_amount end desc nulls last,f.created_at desc)
      from public.market_requests f
      where f.requester_id<>actor_uuid and f.status='OPEN' and f.funding_status='HELD' and f.expires_at>now()
        and f.solution_count<f.max_solutions
        and not exists(select 1 from public.market_solutions sx where sx.request_id=f.id and sx.solver_id=actor_uuid)
        and (p_filter<>'urgent' or f.urgency='urgent')
        and (p_filter<>'certified' or f.certified_only)
    ),'[]'::jsonb)
  ) into result
  from public.market_settings cfg
  left join public.market_solver_permissions perm on perm.user_id=actor_uuid
  where cfg.id=true;
  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.admin_profiles
    where auth_user_id = auth.uid()
      and is_active = true
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.admin_profiles
    where auth_user_id = auth.uid()
      and is_active = true
      and lower(coalesce(role, '')) in ('owner', 'super_admin')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.process_market_expirations()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare expired_requests integer := 0; forfeited_credits integer := 0;
begin
  if auth.role() <> 'service_role' and (auth.uid() is null or not public.is_admin()) then raise exception 'admin_required'; end if;
  update public.market_requests set status='EXPIRED',updated_at=now()
    where status in ('OPEN','PAUSED_REVIEW') and expires_at<=now() and current_solution_id is null;
  get diagnostics expired_requests = row_count;
  with expired as materialized (
    select id,source_request_id,balance_amount from public.market_credits
      where status='ACTIVE' and expires_at<=now() for update
  ), updated as (
    update public.market_credits c set status='FORFEITED',balance_amount=0,updated_at=now()
      from expired e where c.id=e.id returning e.id,e.source_request_id,e.balance_amount
  )
  insert into public.market_ledger(request_id,credit_id,actor_user_id,entry_type,amount)
    select source_request_id,id,auth.uid(),'CREDIT_FORFEITED',balance_amount from updated;
  get diagnostics forfeited_credits = row_count;
  update public.market_requests r set funding_status='FORFEITED',updated_at=now()
    where r.funding_status='CREDITED' and exists(
      select 1 from public.market_credits c where c.source_request_id=r.id and c.status='FORFEITED'
    );
  return jsonb_build_object('expired_requests',expired_requests,'forfeited_credits',forfeited_credits);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.provider_reviews_refresh_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  target_provider uuid;
begin
  if tg_op = 'DELETE' then
    target_provider := old.provider_id;
    perform refresh_provider_rating(target_provider);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.provider_id is distinct from new.provider_id then
    perform refresh_provider_rating(old.provider_id);
  end if;

  target_provider := new.provider_id;
  perform refresh_provider_rating(target_provider);
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.public_activate_provider_trial(provider_uuid uuid, provider_phone text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  provider_row record;
begin
  if provider_uuid is null or nullif(public.bizzi_phone_digits(provider_phone), '') is null then
    raise exception 'Provider id and phone are required';
  end if;

  update public.providers p
  set status = 'approved'::provider_status,
      visibility_status = case
        when p.visibility_status = 'active'::provider_visibility_status then p.visibility_status
        else 'trial'::provider_visibility_status
      end,
      trial_started_at = coalesce(p.trial_started_at, now()),
      trial_ends_at = case
        when p.visibility_status = 'active'::provider_visibility_status then p.trial_ends_at
        when p.trial_ends_at is null or p.trial_ends_at <= now() then now() + interval '30 days'
        else p.trial_ends_at
      end,
      updated_at = now()
  where p.id = provider_uuid
    and p.auth_user_id is null
    and p.status in ('pending'::provider_status, 'approved'::provider_status)
    and public.bizzi_phone_digits(p.phone) = public.bizzi_phone_digits(provider_phone)
  returning
    p.id,
    p.full_name,
    p.phone,
    p.status,
    p.visibility_status,
    p.trial_ends_at
  into provider_row;

  if provider_row.id is null then
    raise exception 'Provider not found, phone mismatch, or provider not eligible';
  end if;

  update public.advertisements a
  set status = 'active'::advertisement_status,
      updated_at = now()
  where a.provider_id = provider_uuid
    and a.status = 'pending'::advertisement_status;

  return jsonb_build_object(
    'provider_id', provider_row.id,
    'provider_name', provider_row.full_name,
    'phone', provider_row.phone,
    'status', provider_row.status,
    'visibility_status', provider_row.visibility_status,
    'trial_ends_at', provider_row.trial_ends_at
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.public_can_use_pending_provider(provider_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.providers p
    where p.id = provider_uuid
      and p.auth_user_id is null
      and p.status in ('pending', 'approved')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.public_find_provider_for_renewal(provider_phone text)
 RETURNS TABLE(id uuid, full_name text, phone text, whatsapp text, status text, visibility_status text, trial_ends_at timestamp with time zone, subscription_ends_at timestamp with time zone, service_name text, city_name text, neighborhood text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  clean_phone text;
begin
  clean_phone := public.bizzi_normalize_phone_digits(provider_phone);

  if clean_phone is null then
    return;
  end if;

  return query
  select
    p.id,
    p.full_name,
    p.phone,
    p.whatsapp,
    p.status::text,
    p.visibility_status::text,
    p.trial_ends_at,
    p.subscription_ends_at,
    coalesce(s.name, p.requested_service_name, 'Metier a preciser') as service_name,
    c.name as city_name,
    p.neighborhood
  from public.providers p
  left join public.cities c on c.id = p.city_id
  left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
  left join public.services s on s.id = ps.service_id
  where public.bizzi_normalize_phone_digits(p.phone) = clean_phone
     or public.bizzi_normalize_phone_digits(p.whatsapp) = clean_phone
  order by p.created_at desc
  limit 1;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.public_get_cash_settings()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
  from public.platform_settings
  where key like 'cash_%';
$function$
;

CREATE OR REPLACE FUNCTION public.public_get_feature_flags()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
  from public.platform_settings
  where key like 'tab_%';
$function$
;

CREATE OR REPLACE FUNCTION public.public_link_provider_service(provider_uuid uuid, provider_phone text, target_service_name text, target_category_name text DEFAULT 'Autres'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  provider_row record;
  category_uuid uuid;
  service_uuid uuid;
  normalized_service text;
  normalized_category text;
  final_category_name text;
begin
  normalized_service := nullif(trim(coalesce(target_service_name, '')), '');
  normalized_category := coalesce(nullif(trim(coalesce(target_category_name, '')), ''), 'Autres');

  if provider_uuid is null or nullif(public.bizzi_phone_digits(provider_phone), '') is null or normalized_service is null then
    raise exception 'Provider id, phone and service are required';
  end if;

  select p.id, p.full_name, p.phone
  into provider_row
  from public.providers p
  where p.id = provider_uuid
    and p.auth_user_id is null
    and public.bizzi_phone_digits(p.phone) = public.bizzi_phone_digits(provider_phone)
  limit 1;

  if provider_row.id is null then
    raise exception 'Provider not found or phone mismatch';
  end if;

  select s.id, s.category_id
  into service_uuid, category_uuid
  from public.services s
  where lower(regexp_replace(s.name, '\s+', ' ', 'g')) = lower(regexp_replace(normalized_service, '\s+', ' ', 'g'))
  order by s.is_active desc, s.sort_order asc, s.created_at asc
  limit 1;

  if service_uuid is null then
    insert into public.categories (name, sort_order, is_active)
    values (normalized_category, 900, true)
    on conflict (name) do update
    set is_active = true,
        updated_at = now()
    returning id into category_uuid;

    insert into public.services (category_id, name, sort_order, is_active)
    values (category_uuid, normalized_service, 900, true)
    on conflict (category_id, name) do update
    set is_active = true,
        updated_at = now()
    returning id into service_uuid;
  end if;

  select c.name
  into final_category_name
  from public.categories c
  where c.id = category_uuid
  limit 1;

  update public.providers p
  set requested_service_name = normalized_service,
      requested_category_name = coalesce(final_category_name, normalized_category),
      updated_at = now()
  where p.id = provider_uuid;

  update public.provider_services
  set is_primary = false
  where provider_id = provider_uuid;

  insert into public.provider_services (provider_id, service_id, is_primary)
  values (provider_uuid, service_uuid, true)
  on conflict (provider_id, service_id) do update
  set is_primary = true;

  return jsonb_build_object(
    'provider_id', provider_row.id,
    'provider_name', provider_row.full_name,
    'service_id', service_uuid,
    'service_name', normalized_service,
    'category_name', coalesce(final_category_name, normalized_category)
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.record_event_promotion_click(event_uuid uuid, click_kind text DEFAULT 'view'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  event_row record;
begin
  update public.event_promotions ep
  set click_count = coalesce(ep.click_count, 0) + 1,
      ticket_click_count = coalesce(ep.ticket_click_count, 0) + case when click_kind = 'ticket' then 1 else 0 end,
      contact_click_count = coalesce(ep.contact_click_count, 0) + case when click_kind = 'contact' then 1 else 0 end,
      detail_view_count = coalesce(ep.detail_view_count, 0) + case when click_kind = 'detail' then 1 else 0 end,
      updated_at = now()
  where ep.id = event_uuid
    and ep.status = 'published'
  returning
    ep.id,
    ep.click_count,
    ep.ticket_click_count,
    ep.contact_click_count,
    ep.detail_view_count
  into event_row;

  if event_row.id is null then
    return jsonb_build_object('updated', false);
  end if;

  return jsonb_build_object(
    'updated', true,
    'id', event_row.id,
    'click_count', event_row.click_count,
    'ticket_click_count', event_row.ticket_click_count,
    'contact_click_count', event_row.contact_click_count,
    'detail_view_count', event_row.detail_view_count
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_provider_rating(provider_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update providers
  set average_rating = coalesce((
        select round(avg(rating)::numeric, 1)
        from provider_reviews
        where provider_id = provider_uuid
          and status = 'published'
      ), 0),
      review_count = coalesce((
        select count(*)::integer
        from provider_reviews
        where provider_id = provider_uuid
          and status = 'published'
      ), 0),
      updated_at = now()
  where id = provider_uuid;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_provider_visibility(provider_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.review_market_solution(p_request_id uuid, p_solution_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare request_row public.market_requests%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  select * into request_row from public.market_requests where id=p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if request_row.requester_id <> auth.uid() and not public.is_admin() then raise exception 'forbidden'; end if;
  if request_row.status not in ('OPEN','PAUSED_REVIEW') then raise exception 'request_not_reviewable'; end if;
  if request_row.current_solution_id is not null and request_row.current_solution_id <> p_solution_id then raise exception 'finish_current_solution_first'; end if;
  if not exists(select 1 from public.market_solutions where id=p_solution_id and request_id=p_request_id and status='SUBMITTED') then raise exception 'solution_not_available'; end if;
  update public.market_solutions set status='UNDER_REVIEW',reviewed_at=now(),updated_at=now() where id=p_solution_id;
  update public.market_requests set current_solution_id=p_solution_id,status='PAUSED_REVIEW',updated_at=now() where id=p_request_id;
  return jsonb_build_object('request_id',p_request_id,'solution_id',p_solution_id,'status','UNDER_REVIEW');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_market_solver_permission(p_user_id uuid, p_provider_id uuid DEFAULT NULL::uuid, p_can_refer boolean DEFAULT true, p_can_direct boolean DEFAULT false, p_certified boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'admin_required'; end if;
  if p_provider_id is not null and not exists(select 1 from public.providers where id=p_provider_id and auth_user_id=p_user_id and status='approved') then
    raise exception 'provider_user_mismatch';
  end if;
  insert into public.market_solver_permissions(user_id,provider_id,can_refer,can_direct,certified,authorized_at,authorized_by)
  values(p_user_id,p_provider_id,p_can_refer,p_can_direct,p_certified,now(),auth.uid())
  on conflict(user_id) do update set provider_id=excluded.provider_id,can_refer=excluded.can_refer,
    can_direct=excluded.can_direct,certified=excluded.certified,authorized_at=now(),authorized_by=auth.uid(),updated_at=now();
  return jsonb_build_object('user_id',p_user_id,'provider_id',p_provider_id,'can_refer',p_can_refer,'can_direct',p_can_direct,'certified',p_certified);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_market_solution(p_request_id uuid, p_solution_type text, p_message text, p_contact_details text, p_service_price bigint DEFAULT NULL::bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  actor_uuid uuid := auth.uid();
  request_row public.market_requests%rowtype;
  permission_row public.market_solver_permissions%rowtype;
  provider_uuid uuid;
  provider_verified boolean := false;
  solution_uuid uuid;
  next_count integer;
  cfg public.market_settings%rowtype;
begin
  if actor_uuid is null then raise exception 'authentication_required'; end if;
  if p_solution_type not in ('REFERRAL','DIRECT') then raise exception 'invalid_solution_type'; end if;
  if char_length(trim(coalesce(p_message,''))) not between 20 and 800 then raise exception 'invalid_message'; end if;
  if char_length(trim(coalesce(p_contact_details,''))) not between 5 and 240 then raise exception 'invalid_contact'; end if;
  if p_service_price is not null and p_service_price < 0 then raise exception 'invalid_service_price'; end if;

  select * into request_row from public.market_requests where id=p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if request_row.requester_id = actor_uuid then raise exception 'requester_cannot_solve'; end if;
  if request_row.status <> 'OPEN' or request_row.funding_status <> 'HELD' or request_row.expires_at <= now() then raise exception 'request_not_open'; end if;
  if request_row.solution_count >= request_row.max_solutions then raise exception 'solution_limit_reached'; end if;

  select * into cfg from public.market_settings where id=true;
  select * into permission_row from public.market_solver_permissions where user_id=actor_uuid;
  if not found then
    insert into public.market_solver_permissions(user_id,can_refer) values(actor_uuid,true) returning * into permission_row;
  end if;
  if p_solution_type='REFERRAL' and not permission_row.can_refer then raise exception 'referral_not_authorized'; end if;
  if p_solution_type='DIRECT' then
    if not permission_row.can_direct then raise exception 'direct_provider_authorization_required'; end if;
    if (cfg.certified_only_direct or request_row.certified_only) and not permission_row.certified then raise exception 'certified_provider_required'; end if;
    select p.id,p.is_verified into provider_uuid,provider_verified from public.providers p
      where p.auth_user_id=actor_uuid and p.status='approved' order by p.is_verified desc limit 1;
    if provider_uuid is null then raise exception 'approved_provider_required'; end if;
  end if;

  next_count := request_row.solution_count + 1;
  insert into public.market_solutions(request_id,solver_id,provider_id,solution_type,message,contact_details,service_price,solver_reward_amount,certified_provider)
  values(p_request_id,actor_uuid,provider_uuid,p_solution_type,left(trim(p_message),800),left(trim(p_contact_details),240),
    case when p_solution_type='DIRECT' then coalesce(p_service_price,0) else null end,request_row.solver_reward_amount,
    coalesce(permission_row.certified,false) or provider_verified)
  returning id into solution_uuid;

  update public.market_requests set solution_count=next_count,
    status=case when next_count >= max_solutions then 'PAUSED_REVIEW' else status end,
    pause_until=case when next_count >= max_solutions then now()+make_interval(hours=>cfg.pause_hours) else pause_until end,
    updated_at=now()
  where id=p_request_id;
  return jsonb_build_object('solution_id',solution_uuid,'request_id',p_request_id,'status','SUBMITTED','solution_count',next_count);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.transition_ride(ride_uuid uuid, target_status text, operation_key text, final_amount_input integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.zeyds_transition_ride_atomic(ride_uuid, target_status, (select auth.uid()), operation_key, final_amount_input); $function$
;

CREATE OR REPLACE FUNCTION public.zeyds_ride_quote(category_code text, city_input text, distance_input numeric, duration_input numeric, traffic_input numeric DEFAULT NULL::numeric, availability_input numeric DEFAULT NULL::numeric, time_input numeric DEFAULT NULL::numeric, promotion_code_input text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
declare
  category_row public.vehicle_categories%rowtype;
  settings_row public.ride_pricing_settings%rowtype;
  promotion_row public.ride_promotions%rowtype;
  raw_amount numeric;
  multiplier numeric;
  discounted_amount numeric;
  discount_amount integer := 0;
  rounded_amount integer;
begin
  if distance_input is null or distance_input < 0 or duration_input is null or duration_input < 0 then
    raise exception 'distance_or_duration_invalid';
  end if;

  select * into category_row from public.vehicle_categories
  where code = lower(trim(category_code)) and is_active
  limit 1;
  if not found then raise exception 'vehicle_category_unavailable'; end if;

  select * into settings_row from public.ride_pricing_settings
  where city_name = coalesce(nullif(trim(city_input), ''), 'Abidjan') and is_active
  limit 1;
  if not found then
    select * into settings_row from public.ride_pricing_settings where city_name = 'Abidjan' and is_active limit 1;
  end if;
  if not found then raise exception 'pricing_settings_unavailable'; end if;

  multiplier := least(
    settings_row.maximum_combined_multiplier,
    greatest(1, coalesce(traffic_input, settings_row.traffic_multiplier))
      * greatest(1, coalesce(availability_input, settings_row.availability_multiplier))
      * greatest(1, coalesce(time_input, settings_row.time_multiplier))
  );
  raw_amount := category_row.base_fare + distance_input * category_row.per_km + duration_input * category_row.per_minute;
  discounted_amount := greatest(category_row.minimum_fare, raw_amount * multiplier);

  if nullif(trim(promotion_code_input), '') is not null then
    select * into promotion_row from public.ride_promotions
    where upper(code) = upper(trim(promotion_code_input))
      and is_active and starts_at <= now() and ends_at > now()
      and (city_name is null or city_name = coalesce(nullif(trim(city_input), ''), 'Abidjan'))
      and (maximum_uses is null or uses_count < maximum_uses)
    limit 1;
    if found then
      discount_amount := case
        when promotion_row.discount_type = 'fixed' then promotion_row.discount_value::integer
        else floor(discounted_amount * promotion_row.discount_value / 100)::integer
      end;
      if promotion_row.maximum_discount is not null then discount_amount := least(discount_amount, promotion_row.maximum_discount); end if;
      discounted_amount := greatest(category_row.minimum_fare, discounted_amount - discount_amount);
    end if;
  end if;

  rounded_amount := round(discounted_amount / settings_row.rounding_step) * settings_row.rounding_step;
  return jsonb_build_object(
    'category_id', category_row.id,
    'category_code', category_row.code,
    'category_name', category_row.name,
    'minimum_fare', category_row.minimum_fare,
    'base_fare', category_row.base_fare,
    'per_km', category_row.per_km,
    'per_minute', category_row.per_minute,
    'distance_km', distance_input,
    'duration_minutes', duration_input,
    'base_amount', round(raw_amount),
    'traffic_multiplier', greatest(1, coalesce(traffic_input, settings_row.traffic_multiplier)),
    'availability_multiplier', greatest(1, coalesce(availability_input, settings_row.availability_multiplier)),
    'time_multiplier', greatest(1, coalesce(time_input, settings_row.time_multiplier)),
    'applied_multiplier', multiplier,
    'discount_amount', discount_amount,
    'total_amount', rounded_amount,
    'commission_rate', category_row.commission_rate,
    'currency', 'XOF',
    'validity_seconds', settings_row.quote_validity_seconds
  );
end;
$function$
;


-- ============================================================
-- Vues
-- ============================================================

create or replace view public.admin_operations_dashboard as
 SELECT ( SELECT count(*) AS count
           FROM delivery_requests
          WHERE delivery_requests.status = 'open'::text) AS livraisons_ouvertes,
    ( SELECT count(*) AS count
           FROM delivery_requests
          WHERE delivery_requests.payment_status = 'approved'::text AND delivery_requests.status = 'open'::text) AS livraisons_payees_a_dispatcher,
    ( SELECT count(*) AS count
           FROM courier_locations
          WHERE courier_locations.is_available = true AND courier_locations.last_seen_at >= (now() - '00:15:00'::interval)) AS livreurs_live,
    ( SELECT count(*) AS count
           FROM delivery_dispatch_offers
          WHERE delivery_dispatch_offers.status = 'offered'::text AND delivery_dispatch_offers.expires_at > now()) AS offres_dispatch_actives,
    ( SELECT count(*) AS count
           FROM push_notifications
          WHERE push_notifications.status = 'queued'::text) AS notifications_en_attente,
    ( SELECT count(*) AS count
           FROM fraud_signals
          WHERE fraud_signals.created_at >= (now() - '24:00:00'::interval)) AS signaux_fraude_24h,
    ( SELECT count(*) AS count
           FROM server_alerts
          WHERE server_alerts.status = 'open'::text) AS alertes_ouvertes,
    now() AS generated_at;

create or replace view public.bizzi_delivery_coherence_v184 as
 SELECT count(*) FILTER (WHERE status = 'open'::text) AS livraisons_ouvertes,
    count(*) FILTER (WHERE status = 'open'::text AND payment_status = 'approved'::text) AS livraisons_payees_ouvertes,
    count(*) FILTER (WHERE status = 'open'::text AND payment_status <> 'approved'::text) AS paiements_a_confirmer,
    count(*) FILTER (WHERE status = 'open'::text AND payment_status = 'approved'::text AND dispatch_status = 'not_dispatched'::text) AS payees_a_dispatcher,
    count(*) FILTER (WHERE status = 'open'::text AND payment_status = 'approved'::text AND (dispatch_status = ANY (ARRAY['matched'::text, 'dispatching'::text]))) AS livreurs_alertes,
    count(*) FILTER (WHERE status = 'open'::text AND payment_status = 'approved'::text AND dispatch_status = 'manual_review'::text) AS revue_manuelle,
    count(*) FILTER (WHERE status = 'assigned'::text) AS livraisons_acceptees,
    count(*) FILTER (WHERE status = 'closed'::text) AS livraisons_terminees,
    COALESCE(sum(bizzi_commission) FILTER (WHERE payment_status = 'approved'::text), 0::bigint) AS commission_bizzi_approuvee,
    COALESCE(sum(provider_payout) FILTER (WHERE payment_status = 'approved'::text), 0::bigint) AS part_livreur_a_suivre
   FROM delivery_requests;

create or replace view public.public_advertisements as
 SELECT a.id,
    a.provider_id,
    a.title,
    a.body,
    a.image_url,
    a.starts_at,
    a.ends_at,
    c.name AS city_name,
    co.name AS commune_name,
    COALESCE(s.name, NULLIF(TRIM(BOTH FROM p.requested_service_name), ''::text), 'Publicite locale'::text) AS service_name
   FROM advertisements a
     LEFT JOIN providers p ON p.id = a.provider_id
     LEFT JOIN cities c ON c.id = a.city_id
     LEFT JOIN communes co ON co.id = a.commune_id
     LEFT JOIN provider_services ps ON ps.provider_id = a.provider_id AND ps.is_primary = true
     LEFT JOIN services s ON s.id = ps.service_id
  WHERE a.status = 'active'::advertisement_status AND now() >= a.starts_at AND now() <= a.ends_at;

create or replace view public.public_cash_feed as
 SELECT m.id,
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
    COALESCE(sc.active_count, 0::bigint) AS active_solutions_count
   FROM cash_missions m
     LEFT JOIN LATERAL ( SELECT count(*) AS active_count
           FROM cash_solutions s
          WHERE s.mission_id = m.id AND s.status = 'pending'::text) sc ON true
  WHERE m.status = ANY (ARRAY['published'::text, 'solution_selected'::text, 'in_progress'::text, 'completion_pending'::text]);

create or replace view public.public_event_promotions as
 SELECT id,
    title,
    description,
    event_datetime,
    end_datetime,
    venue,
    area,
    venue_address,
    latitude,
    longitude,
    visibility_radius_km,
    city_name,
    category,
    poster_url,
    ticket_price,
    ticket_url,
    contact_phone,
    organizer_name,
    plan_name,
    amount,
    currency,
    payment_status,
    is_sponsored,
    is_premium,
    status,
    click_count,
    ticket_click_count,
    contact_click_count,
    detail_view_count,
    stats_sent_at,
    created_at,
    updated_at,
    location_accuracy,
    location_timestamp,
    location_label,
    location_full_address
   FROM event_promotions
  WHERE status = 'published'::text AND payment_status = 'approved'::text AND end_datetime >= now();

create or replace view public.public_exception_places as
 SELECT id,
    name,
    owner_name,
    contact_phone,
    city_name,
    area,
    address,
    description,
    photo_url,
    plan_id,
    plan_name,
    amount,
    currency,
    payment_method,
    payment_reference,
    payment_status,
    boost_days,
    boost_starts_at,
    boost_ends_at,
    visibility_starts_at,
    visibility_ends_at,
    admin_grant,
    status,
    click_count,
    created_at,
    updated_at,
    payment_status = 'approved'::text AND boost_starts_at <= now() AND boost_ends_at > now() AS boost_active,
    latitude,
    longitude,
    location_accuracy,
    location_timestamp,
    location_label,
    location_full_address
   FROM exception_places
  WHERE (status = ANY (ARRAY['published'::text, 'active'::text])) AND visibility_ends_at > now();

create or replace view public.public_food_places as
 SELECT id,
    name,
    owner_name,
    contact_phone,
    place_type,
    main_specialty,
    specialties,
    city_name,
    area,
    address,
    average_budget,
    opening_hours,
    delivery_available,
    description,
    photo_url,
    rating,
    click_count,
    contact_click_count,
    status,
    verification_status,
    created_at,
    updated_at,
    latitude,
    longitude,
    location_accuracy,
    location_timestamp,
    location_label,
    location_full_address
   FROM food_places
  WHERE status = ANY (ARRAY['published'::text, 'active'::text]);

create or replace view public.public_job_offers as
 SELECT jo.id,
    jo.title,
    jo.company_name,
    jo.company_type,
    jo.contact_phone,
    jo.contact_email,
    jo.service_id,
    COALESCE(jo.service_name, s.name, 'Service Bizzi'::text) AS service_name,
    jo.city_id,
    COALESCE(jo.city_name, c.name, 'Toute la Côte d''Ivoire'::text) AS city_name,
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
   FROM job_offers jo
     LEFT JOIN services s ON s.id = jo.service_id
     LEFT JOIN cities c ON c.id = jo.city_id
  WHERE jo.status = 'published'::text AND jo.payment_status = 'approved'::text AND jo.expires_at > now();

create or replace view public.public_provider_cards as
 SELECT p.id,
        CASE
            WHEN p.visibility_status = ANY (ARRAY['active'::provider_visibility_status, 'trial'::provider_visibility_status]) THEN p.full_name
            ELSE NULL::text
        END AS full_name,
    p.photo_url,
    s.name AS service_name,
    c.name AS city_name,
    co.name AS commune_name,
        CASE
            WHEN p.visibility_status = ANY (ARRAY['active'::provider_visibility_status, 'trial'::provider_visibility_status]) THEN p.neighborhood
            ELSE NULL::text
        END AS neighborhood,
        CASE
            WHEN p.visibility_status = ANY (ARRAY['active'::provider_visibility_status, 'trial'::provider_visibility_status]) THEN p.phone
            ELSE NULL::text
        END AS phone,
        CASE
            WHEN p.visibility_status = ANY (ARRAY['active'::provider_visibility_status, 'trial'::provider_visibility_status]) THEN p.whatsapp
            ELSE NULL::text
        END AS whatsapp,
        CASE
            WHEN p.visibility_status = ANY (ARRAY['active'::provider_visibility_status, 'trial'::provider_visibility_status]) THEN p.description
            ELSE NULL::text
        END AS description,
    p.average_rating,
    p.latitude,
    p.longitude,
    p.visibility_status,
    ps.service_id,
    p.city_id,
    p.commune_id
   FROM providers p
     JOIN provider_services ps ON ps.provider_id = p.id AND ps.is_primary = true
     JOIN services s ON s.id = ps.service_id
     LEFT JOIN cities c ON c.id = p.city_id
     LEFT JOIN communes co ON co.id = p.commune_id
  WHERE p.status = 'approved'::provider_status AND (p.visibility_status = ANY (ARRAY['trial'::provider_visibility_status, 'active'::provider_visibility_status, 'expired_blurred'::provider_visibility_status]));

create or replace view public.public_provider_directory as
 SELECT p.id,
        CASE
            WHEN p.visibility_status = ANY (ARRAY['trial'::provider_visibility_status, 'active'::provider_visibility_status]) THEN p.full_name
            ELSE NULL::text
        END AS full_name,
        CASE
            WHEN p.visibility_status = ANY (ARRAY['trial'::provider_visibility_status, 'active'::provider_visibility_status]) THEN p.phone
            ELSE NULL::text
        END AS phone,
        CASE
            WHEN p.visibility_status = ANY (ARRAY['trial'::provider_visibility_status, 'active'::provider_visibility_status]) THEN p.whatsapp
            ELSE NULL::text
        END AS whatsapp,
    p.photo_url,
    p.description,
    p.neighborhood,
    p.latitude,
    p.longitude,
    p.visibility_status,
    p.average_rating,
    p.call_count,
    p.is_verified,
    c.name AS city_name,
    co.name AS commune_name,
    COALESCE(s.name, NULLIF(TRIM(BOTH FROM p.requested_service_name), ''::text), 'Metier a preciser'::text) AS service_name,
    COALESCE(cat.name, NULLIF(TRIM(BOTH FROM p.requested_category_name), ''::text), 'Autres'::text) AS category_name,
    p.visibility_status = ANY (ARRAY['trial'::provider_visibility_status, 'active'::provider_visibility_status]) AS contact_visible,
    p.review_count,
    p.trial_ends_at,
    p.subscription_ends_at,
    p.requested_service_name,
    p.requested_category_name,
    p.boost_ends_at,
    p.delivery_penalty_rate,
    p.delivery_penalty_remaining,
    p.delivery_penalty_until,
    p.delivery_penalty_reason,
    p.delivery_cancel_count,
    p.location_accuracy,
    p.location_timestamp,
    p.location_label,
    p.location_full_address
   FROM providers p
     LEFT JOIN cities c ON c.id = p.city_id
     LEFT JOIN communes co ON co.id = p.commune_id
     LEFT JOIN provider_services ps ON ps.provider_id = p.id AND ps.is_primary = true
     LEFT JOIN services s ON s.id = ps.service_id
     LEFT JOIN categories cat ON cat.id = s.category_id
  WHERE p.status = 'approved'::provider_status AND (p.visibility_status = ANY (ARRAY['trial'::provider_visibility_status, 'active'::provider_visibility_status]));

create or replace view public.public_provider_services as
 SELECT ps.provider_id,
    s.name AS service_name,
    COALESCE(ps.is_primary, false) AS is_primary
   FROM provider_services ps
     JOIN services s ON s.id = ps.service_id
     JOIN providers p ON p.id = ps.provider_id
  WHERE s.is_active IS TRUE AND p.status = 'approved'::provider_status AND (p.visibility_status = ANY (ARRAY['trial'::provider_visibility_status, 'active'::provider_visibility_status]));


-- ============================================================
-- Triggers
-- ============================================================

CREATE TRIGGER admin_profiles_set_updated_at BEFORE UPDATE ON public.admin_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER advertisements_set_updated_at BEFORE UPDATE ON public.advertisements FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER cash_reviews_after_change AFTER INSERT OR DELETE OR UPDATE ON public.cash_reviews FOR EACH ROW EXECUTE FUNCTION cash_reviews_refresh_stats();

CREATE TRIGGER cash_transactions_wallet_delta AFTER INSERT ON public.cash_transactions FOR EACH ROW EXECUTE FUNCTION cash_apply_wallet_delta();

CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER cities_set_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER communes_set_updated_at BEFORE UPDATE ON public.communes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER countries_set_updated_at BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bizzi_auto_validate_delivery_order AFTER INSERT ON public.delivery_requests FOR EACH ROW EXECUTE FUNCTION bizzi_auto_validate_delivery_order_tg();

CREATE TRIGGER zeyds_audit_driver_vehicles AFTER INSERT OR DELETE OR UPDATE ON public.driver_vehicles FOR EACH ROW EXECUTE FUNCTION private.zeyds_audit_ride_admin_change();

CREATE TRIGGER event_promotions_set_updated_at BEFORE UPDATE ON public.event_promotions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER express_requests_set_updated_at BEFORE UPDATE ON public.express_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER job_offers_set_updated_at BEFORE UPDATE ON public.job_offers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER payments_set_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER provider_reviews_after_change AFTER INSERT OR DELETE OR UPDATE ON public.provider_reviews FOR EACH ROW EXECUTE FUNCTION provider_reviews_refresh_rating();

CREATE TRIGGER provider_reviews_set_updated_at BEFORE UPDATE ON public.provider_reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER bizzi_auto_approve_new_provider_after_insert AFTER INSERT ON public.providers FOR EACH ROW EXECUTE FUNCTION bizzi_auto_approve_new_provider();

CREATE TRIGGER bizzi_block_duplicate_provider_phone_tg BEFORE INSERT OR UPDATE OF phone ON public.providers FOR EACH ROW EXECUTE FUNCTION bizzi_block_duplicate_provider_phone();

CREATE TRIGGER providers_set_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER reports_set_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER zeyds_audit_ride_drivers AFTER INSERT OR DELETE OR UPDATE ON public.ride_drivers FOR EACH ROW EXECUTE FUNCTION private.zeyds_audit_ride_admin_change();

CREATE TRIGGER zeyds_create_driver_wallet AFTER INSERT ON public.ride_drivers FOR EACH ROW EXECUTE FUNCTION private.zeyds_create_driver_wallet();

CREATE TRIGGER zeyds_audit_ride_pricing_settings AFTER INSERT OR DELETE OR UPDATE ON public.ride_pricing_settings FOR EACH ROW EXECUTE FUNCTION private.zeyds_audit_ride_admin_change();

CREATE TRIGGER zeyds_audit_ride_promotions AFTER INSERT OR DELETE OR UPDATE ON public.ride_promotions FOR EACH ROW EXECUTE FUNCTION private.zeyds_audit_ride_admin_change();

CREATE TRIGGER zeyds_broadcast_ride_change AFTER INSERT OR DELETE OR UPDATE ON public.rides FOR EACH ROW EXECUTE FUNCTION private.zeyds_broadcast_ride_change();

CREATE TRIGGER services_set_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER subscription_plans_set_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER zeyds_audit_vehicle_categories AFTER INSERT OR DELETE OR UPDATE ON public.vehicle_categories FOR EACH ROW EXECUTE FUNCTION private.zeyds_audit_ride_admin_change();


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.admin_audit_events enable row level security;

alter table public.admin_financial_snapshots enable row level security;

alter table public.admin_profiles enable row level security;

alter table public.admin_report_snapshots enable row level security;

alter table public.advertisements enable row level security;

alter table public.app_error_events enable row level security;

alter table public.cash_credits enable row level security;

alter table public.cash_disputes enable row level security;

alter table public.cash_missions enable row level security;

alter table public.cash_notifications enable row level security;

alter table public.cash_reviews enable row level security;

alter table public.cash_solutions enable row level security;

alter table public.cash_solver_stats enable row level security;

alter table public.cash_transactions enable row level security;

alter table public.cash_wallets enable row level security;

alter table public.categories enable row level security;

alter table public.cities enable row level security;

alter table public.communes enable row level security;

alter table public.countries enable row level security;

alter table public.courier_locations enable row level security;

alter table public.delivery_dispatch_offers enable row level security;

alter table public.delivery_requests enable row level security;

alter table public.driver_locations enable row level security;

alter table public.driver_vehicles enable row level security;

alter table public.event_promotions enable row level security;

alter table public.exception_places enable row level security;

alter table public.express_requests enable row level security;

alter table public.field_test_results enable row level security;

alter table public.field_test_sessions enable row level security;

alter table public.food_places enable row level security;

alter table public.fraud_signals enable row level security;

alter table public.integration_health_checks enable row level security;

alter table public.job_offers enable row level security;

alter table public.load_test_runs enable row level security;

alter table public.map_lookup_events enable row level security;

alter table public.market_credits enable row level security;

alter table public.market_ledger enable row level security;

alter table public.market_requests enable row level security;

alter table public.market_settings enable row level security;

alter table public.market_solutions enable row level security;

alter table public.market_solver_permissions enable row level security;

alter table public.monitoring_forwarding_events enable row level security;

alter table public.payment_checkout_sessions enable row level security;

alter table public.payment_transactions enable row level security;

alter table public.payment_webhook_events enable row level security;

alter table public.payments enable row level security;

alter table public.platform_settings enable row level security;

alter table public.pricing_quotes enable row level security;

alter table public.professional_wallets enable row level security;

alter table public.provider_availability enable row level security;

alter table public.provider_reviews enable row level security;

alter table public.provider_services enable row level security;

alter table public.providers enable row level security;

alter table public.push_notifications enable row level security;

alter table public.push_subscriptions enable row level security;

alter table public.recommendation_settings enable row level security;

alter table public.reports enable row level security;

alter table public.request_services enable row level security;

alter table public.ride_admin_audit_log enable row level security;

alter table public.ride_drivers enable row level security;

alter table public.ride_pricing_settings enable row level security;

alter table public.ride_promotions enable row level security;

alter table public.ride_status_history enable row level security;

alter table public.ride_stops enable row level security;

alter table public.rides enable row level security;

alter table public.server_alerts enable row level security;

alter table public.service_proposals enable row level security;

alter table public.service_request_events enable row level security;

alter table public.service_request_matches enable row level security;

alter table public.service_request_media enable row level security;

alter table public.services enable row level security;

alter table public.situation_questions enable row level security;

alter table public.situation_services enable row level security;

alter table public.situations enable row level security;

alter table public.subscription_plans enable row level security;

alter table public.vehicle_categories enable row level security;

alter table public.wallet_transactions enable row level security;


-- ============================================================
-- Policies RLS
-- ============================================================

create policy "admin insert own audit events" on public.admin_audit_events as permissive for insert to authenticated with check (is_admin());

create policy "super admin read audit events" on public.admin_audit_events as permissive for select to authenticated using (is_super_admin());

create policy "admin read financial snapshots" on public.admin_financial_snapshots as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin profile self read" on public.admin_profiles as permissive for select to authenticated using ((auth.uid() = auth_user_id));

create policy "admin read report snapshots" on public.admin_report_snapshots as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin full advertisements" on public.advertisements as permissive for all to authenticated using (bizzi_admin_request_allowed()) with check (bizzi_admin_request_allowed());

create policy "provider can create own advertisement" on public.advertisements as permissive for insert to public with check ((provider_id IN ( SELECT providers.id
   FROM providers
  WHERE (providers.auth_user_id = auth.uid()))));

create policy "provider can read own advertisements" on public.advertisements as permissive for select to public using ((provider_id IN ( SELECT providers.id
   FROM providers
  WHERE (providers.auth_user_id = auth.uid()))));

create policy "public submit pending advertisement" on public.advertisements as permissive for insert to anon, authenticated with check (((status = 'pending'::advertisement_status) AND public_can_use_pending_provider(provider_id)));

create policy "admin read app error events" on public.app_error_events as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin full categories" on public.categories as permissive for all to authenticated using (is_admin()) with check (is_admin());

create policy "public read active categories" on public.categories as permissive for select to public using ((is_active = true));

create policy "public read active cities" on public.cities as permissive for select to public using ((is_active = true));

create policy "public read active communes" on public.communes as permissive for select to public using ((is_active = true));

create policy "public read active countries" on public.countries as permissive for select to public using ((is_active = true));

create policy "admin read courier locations" on public.courier_locations as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin read dispatch offers" on public.delivery_dispatch_offers as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "authenticated reads allowed delivery requests" on public.delivery_requests as permissive for select to authenticated using (((((length(COALESCE(( SELECT ((current_setting('request.headers'::text, true))::jsonb ->> 'x-bizzi-client-token'::text)), ''::text)) >= 32) AND (length(COALESCE(( SELECT ((current_setting('request.headers'::text, true))::jsonb ->> 'x-bizzi-client-token'::text)), ''::text)) <= 160)) AND (client_access_token = ( SELECT ((current_setting('request.headers'::text, true))::jsonb ->> 'x-bizzi-client-token'::text)))) OR (EXISTS ( SELECT 1
   FROM admin_profiles admin_profile
  WHERE ((admin_profile.auth_user_id = ( SELECT auth.uid() AS uid)) AND (admin_profile.is_active = true)))) OR (EXISTS ( SELECT 1
   FROM providers provider
  WHERE ((provider.auth_user_id = ( SELECT auth.uid() AS uid)) AND ((provider.id = delivery_requests.assigned_provider_id) OR (provider.id = ANY (delivery_requests.matched_provider_ids))))))));

create policy "client reads own delivery requests" on public.delivery_requests as permissive for select to anon using ((((length(COALESCE(( SELECT ((current_setting('request.headers'::text, true))::jsonb ->> 'x-bizzi-client-token'::text)), ''::text)) >= 32) AND (length(COALESCE(( SELECT ((current_setting('request.headers'::text, true))::jsonb ->> 'x-bizzi-client-token'::text)), ''::text)) <= 160)) AND (client_access_token = ( SELECT ((current_setting('request.headers'::text, true))::jsonb ->> 'x-bizzi-client-token'::text)))));

create policy "public create open delivery requests" on public.delivery_requests as permissive for insert to anon, authenticated with check ((((COALESCE(( SELECT ((current_setting('request.headers'::text, true))::jsonb ->> 'x-bizzi-client-token'::text)), ''::text) = ''::text) OR (((length(COALESCE(( SELECT ((current_setting('request.headers'::text, true))::jsonb ->> 'x-bizzi-client-token'::text)), ''::text)) >= 32) AND (length(COALESCE(( SELECT ((current_setting('request.headers'::text, true))::jsonb ->> 'x-bizzi-client-token'::text)), ''::text)) <= 160)) AND (client_access_token = ( SELECT ((current_setting('request.headers'::text, true))::jsonb ->> 'x-bizzi-client-token'::text))))) AND (status = 'open'::text) AND (assigned_provider_id IS NULL) AND (pickup_address IS NOT NULL) AND (dropoff_address IS NOT NULL) AND (parcel_description IS NOT NULL) AND (amount >= 800) AND (suggested_amount >= 800) AND (base_amount >= 800) AND (commission_rate = 0.15) AND (bizzi_commission >= 0) AND (provider_payout >= 0) AND (surcharge_rate >= (0)::numeric) AND (surcharge_rate <= 0.35) AND (COALESCE(distance_km, (0)::numeric) > (0)::numeric) AND (pricing_slot = ANY (ARRAY['normal'::text, 'morning_peak'::text, 'evening_peak'::text, 'night'::text])) AND (payment_status = ANY (ARRAY['pending'::text, 'unpaid'::text, 'approved'::text]))));

create policy "driver locations owner create" on public.driver_locations as permissive for insert to authenticated with check ((EXISTS ( SELECT 1
   FROM (ride_drivers d
     JOIN providers p ON ((p.id = d.provider_id)))
  WHERE ((d.id = driver_locations.driver_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))));

create policy "driver locations participant read" on public.driver_locations as permissive for select to authenticated using (((EXISTS ( SELECT 1
   FROM (ride_drivers d
     JOIN providers p ON ((p.id = d.provider_id)))
  WHERE ((d.id = driver_locations.driver_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM rides r
  WHERE ((r.id = driver_locations.ride_id) AND (r.client_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "driver vehicles admin create" on public.driver_vehicles as permissive for insert to authenticated with check (is_admin());

create policy "driver vehicles admin delete" on public.driver_vehicles as permissive for delete to authenticated using (is_admin());

create policy "driver vehicles admin update" on public.driver_vehicles as permissive for update to authenticated using (is_admin()) with check (is_admin());

create policy "driver vehicles participant read" on public.driver_vehicles as permissive for select to authenticated using (((EXISTS ( SELECT 1
   FROM (ride_drivers d
     JOIN providers p ON ((p.id = d.provider_id)))
  WHERE ((d.id = driver_vehicles.driver_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM rides r
  WHERE ((r.vehicle_id = r.id) AND (r.client_user_id = ( SELECT auth.uid() AS uid)) AND (r.status = ANY (ARRAY['accepted'::text, 'driver_arriving'::text, 'driver_arrived'::text, 'in_progress'::text, 'completed'::text]))))) OR is_admin()));

create policy "admin full event promotions" on public.event_promotions as permissive for all to authenticated using (is_admin()) with check (is_admin());

create policy "public read published event promotions" on public.event_promotions as permissive for select to anon, authenticated using (((status = 'published'::text) AND (payment_status = 'approved'::text) AND (end_datetime >= now())));

create policy "public submit event promotion" on public.event_promotions as permissive for insert to anon, authenticated with check (((status = 'pending'::text) AND (length(TRIM(BOTH FROM title)) > 0) AND (length(TRIM(BOTH FROM organizer_name)) > 0) AND (length(TRIM(BOTH FROM venue)) > 0) AND (length(TRIM(BOTH FROM city_name)) > 0) AND (length(TRIM(BOTH FROM COALESCE(area, ''::text))) > 0) AND (length(TRIM(BOTH FROM COALESCE(venue_address, ''::text))) > 0) AND (length(TRIM(BOTH FROM ticket_url)) > 0) AND (ticket_url ~* '^https?://'::text) AND (end_datetime > event_datetime) AND ((visibility_radius_km >= (1)::numeric) AND (visibility_radius_km <= (300)::numeric)) AND (((plan_name = 'Standard'::text) AND (amount = 0) AND (payment_status = 'approved'::text) AND (is_sponsored = false) AND (is_premium = false)) OR ((plan_name = ANY (ARRAY['Boost'::text, 'Premium'::text])) AND (amount >= 150000) AND (payment_status = 'pending'::text) AND (length(TRIM(BOTH FROM COALESCE(transaction_reference, ''::text))) > 0)))));

create policy "admin manages exception places" on public.exception_places as permissive for all to authenticated using (is_admin()) with check (is_admin());

create policy "public read active exception places" on public.exception_places as permissive for select to anon, authenticated using (((status = ANY (ARRAY['published'::text, 'active'::text])) AND (visibility_ends_at > now())));

create policy "public submit exception places" on public.exception_places as permissive for insert to anon, authenticated with check (((status = 'pending'::text) AND (admin_grant = false) AND (visibility_starts_at IS NULL) AND (visibility_ends_at IS NULL) AND (boost_starts_at IS NULL) AND (boost_ends_at IS NULL) AND (((plan_id = 'free_30_days'::text) AND (payment_status = 'approved'::text)) OR ((plan_id <> 'free_30_days'::text) AND (payment_status = 'pending'::text))) AND (length(TRIM(BOTH FROM name)) >= 2) AND (length(TRIM(BOTH FROM owner_name)) >= 2) AND (length(regexp_replace(contact_phone, '\D'::text, ''::text, 'g'::text)) >= 8) AND (length(TRIM(BOTH FROM city_name)) >= 2) AND (length(TRIM(BOTH FROM description)) >= 20)));

create policy "legacy anonymous request create" on public.express_requests as permissive for insert to anon with check (((client_user_id IS NULL) AND (status = 'open'::text) AND (length(TRIM(BOTH FROM service_name)) > 0) AND (length(TRIM(BOTH FROM city_name)) > 0)));

create policy "smart request admin delete" on public.express_requests as permissive for delete to authenticated using (is_admin());

create policy "smart request owner create" on public.express_requests as permissive for insert to authenticated with check ((((client_user_id = ( SELECT auth.uid() AS uid)) AND (status = 'open'::text)) OR is_admin()));

create policy "smart request owner read" on public.express_requests as permissive for select to authenticated using (((client_user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));

create policy "smart request owner update" on public.express_requests as permissive for update to authenticated using (((client_user_id = ( SELECT auth.uid() AS uid)) OR is_admin())) with check (((client_user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));

create policy "admin read field test results" on public.field_test_results as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin read field test sessions" on public.field_test_sessions as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin full food places" on public.food_places as permissive for all to authenticated using (is_admin()) with check (is_admin());

create policy "public read published food places" on public.food_places as permissive for select to anon, authenticated using ((status = ANY (ARRAY['published'::text, 'active'::text])));

create policy "public submit food places" on public.food_places as permissive for insert to anon, authenticated with check (((status = 'pending'::text) AND (length(TRIM(BOTH FROM name)) >= 2) AND (length(regexp_replace(contact_phone, '\D'::text, ''::text, 'g'::text)) >= 8) AND (length(TRIM(BOTH FROM main_specialty)) >= 2) AND (length(TRIM(BOTH FROM city_name)) >= 2)));

create policy "admin read fraud signals" on public.fraud_signals as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin read integration health checks" on public.integration_health_checks as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin full job offers" on public.job_offers as permissive for all to authenticated using (is_admin()) with check (is_admin());

create policy "public submit job offer" on public.job_offers as permissive for insert to anon, authenticated with check (((status = 'pending'::text) AND (payment_status = 'pending'::text) AND (amount >= 999) AND (length(TRIM(BOTH FROM COALESCE(transaction_reference, ''::text))) > 0) AND (length(TRIM(BOTH FROM title)) > 0) AND (length(TRIM(BOTH FROM company_name)) > 0) AND (length(TRIM(BOTH FROM COALESCE(company_type, ''::text))) > 0) AND (length(TRIM(BOTH FROM city_name)) > 0)));

create policy "admin read load test runs" on public.load_test_runs as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin read map lookup events" on public.map_lookup_events as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "market credits owner read" on public.market_credits as permissive for select to authenticated using (((requester_id = ( SELECT auth.uid() AS uid)) OR is_admin()));

create policy "market ledger participant read" on public.market_ledger as permissive for select to authenticated using ((is_admin() OR (EXISTS ( SELECT 1
   FROM market_requests r
  WHERE ((r.id = market_ledger.request_id) AND (r.requester_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM market_solutions s
  WHERE ((s.id = market_ledger.solution_id) AND (s.solver_id = ( SELECT auth.uid() AS uid)))))));

create policy "market request controlled read" on public.market_requests as permissive for select to authenticated using (((requester_id = ( SELECT auth.uid() AS uid)) OR is_admin() OR ((status = ANY (ARRAY['OPEN'::text, 'PAUSED_REVIEW'::text])) AND (funding_status = 'HELD'::text) AND (expires_at > now())) OR (EXISTS ( SELECT 1
   FROM market_solutions s
  WHERE ((s.request_id = s.id) AND (s.solver_id = ( SELECT auth.uid() AS uid)))))));

create policy "market settings authenticated read" on public.market_settings as permissive for select to authenticated using (true);

create policy "market solutions participant read" on public.market_solutions as permissive for select to authenticated using (((solver_id = ( SELECT auth.uid() AS uid)) OR is_admin() OR (EXISTS ( SELECT 1
   FROM market_requests r
  WHERE ((r.id = market_solutions.request_id) AND (r.requester_id = ( SELECT auth.uid() AS uid)))))));

create policy "market permissions own read" on public.market_solver_permissions as permissive for select to authenticated using (((user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));

create policy "admin read monitoring forwarding events" on public.monitoring_forwarding_events as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin read payment checkout sessions" on public.payment_checkout_sessions as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin read payment transactions" on public.payment_transactions as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin read payment webhook events" on public.payment_webhook_events as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "admin full payments" on public.payments as permissive for all to authenticated using (is_admin()) with check (is_admin());

create policy "provider can create own payment" on public.payments as permissive for insert to public with check ((provider_id IN ( SELECT providers.id
   FROM providers
  WHERE (providers.auth_user_id = auth.uid()))));

create policy "provider can read own payments" on public.payments as permissive for select to public using ((provider_id IN ( SELECT providers.id
   FROM providers
  WHERE (providers.auth_user_id = auth.uid()))));

create policy "public submit pending payment v115" on public.payments as permissive for insert to public with check (((status = 'pending'::payment_status) AND bizzi_provider_accepts_payment(provider_id) AND bizzi_plan_accepts_payment(plan_id) AND (amount >= 999) AND (currency = 'FCFA'::text) AND (method = ANY (ARRAY['wave'::payment_method, 'orange_money'::payment_method, 'mtn_money'::payment_method]))));

create policy "admin read platform settings" on public.platform_settings as permissive for select to authenticated using (is_admin());

create policy "pricing quotes owner create" on public.pricing_quotes as permissive for insert to authenticated with check ((client_user_id = ( SELECT auth.uid() AS uid)));

create policy "pricing quotes owner read" on public.pricing_quotes as permissive for select to authenticated using (((client_user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));

create policy "wallet owner read" on public.professional_wallets as permissive for select to authenticated using (((EXISTS ( SELECT 1
   FROM (ride_drivers d
     JOIN providers p ON ((p.id = d.provider_id)))
  WHERE ((d.id = professional_wallets.driver_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "provider availability own insert" on public.provider_availability as permissive for insert to authenticated with check (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = provider_availability.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "provider availability own read" on public.provider_availability as permissive for select to authenticated using (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = provider_availability.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "provider availability own update" on public.provider_availability as permissive for update to authenticated using (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = provider_availability.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin())) with check (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = provider_availability.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "admin full provider reviews" on public.provider_reviews as permissive for all to authenticated using (is_admin()) with check (is_admin());

create policy "public read published provider reviews" on public.provider_reviews as permissive for select to anon, authenticated using (((status = 'published'::text) AND bizzi_can_review_provider(provider_id)));

create policy "public submit provider review" on public.provider_reviews as permissive for insert to anon, authenticated with check ((((rating >= 1) AND (rating <= 5)) AND (status = 'published'::text) AND bizzi_can_review_provider(provider_id)));

create policy "admin full provider services" on public.provider_services as permissive for all to authenticated using (is_admin()) with check (is_admin());

create policy "public attach service to pending provider" on public.provider_services as permissive for insert to anon, authenticated with check (public_can_use_pending_provider(provider_id));

create policy "admin full providers" on public.providers as permissive for all to authenticated using (bizzi_admin_request_allowed()) with check (bizzi_admin_request_allowed());

create policy "admin read providers" on public.providers as permissive for select to authenticated using (is_admin());

create policy "provider can create own profile" on public.providers as permissive for insert to public with check ((auth.uid() = auth_user_id));

create policy "provider can read own profile" on public.providers as permissive for select to public using ((auth.uid() = auth_user_id));

create policy "provider can update own profile" on public.providers as permissive for update to public using ((auth.uid() = auth_user_id)) with check ((auth.uid() = auth_user_id));

create policy "public submit pending provider simple" on public.providers as permissive for insert to public with check (((auth_user_id IS NULL) AND (status = 'pending'::provider_status) AND (visibility_status = 'trial'::provider_visibility_status)));

create policy "admin read push notifications" on public.push_notifications as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "recommendation settings admin create" on public.recommendation_settings as permissive for insert to authenticated with check (is_admin());

create policy "recommendation settings admin delete" on public.recommendation_settings as permissive for delete to authenticated using (is_admin());

create policy "recommendation settings admin update" on public.recommendation_settings as permissive for update to authenticated using (is_admin()) with check (is_admin());

create policy "recommendation settings public read" on public.recommendation_settings as permissive for select to anon, authenticated using (true);

create policy "admin full reports" on public.reports as permissive for all to authenticated using (is_admin()) with check (is_admin());

create policy "public submit report" on public.reports as permissive for insert to anon, authenticated with check (((status = 'open'::report_status) AND public_can_use_pending_provider(provider_id)));

create policy "anonymous request services create" on public.request_services as permissive for insert to anon with check (((status = 'planned'::text) AND (selected_provider_id IS NULL) AND (length(TRIM(BOTH FROM service_name)) > 0)));

create policy "request services owner create" on public.request_services as permissive for insert to authenticated with check (((EXISTS ( SELECT 1
   FROM express_requests r
  WHERE ((r.id = request_services.request_id) AND (r.client_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "request services owner update" on public.request_services as permissive for update to authenticated using (((EXISTS ( SELECT 1
   FROM express_requests r
  WHERE ((r.id = request_services.request_id) AND (r.client_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin())) with check (((EXISTS ( SELECT 1
   FROM express_requests r
  WHERE ((r.id = request_services.request_id) AND (r.client_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "request services participants read" on public.request_services as permissive for select to authenticated using (((EXISTS ( SELECT 1
   FROM express_requests r
  WHERE ((r.id = request_services.request_id) AND (r.client_user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM (service_request_matches m
     JOIN providers p ON ((p.id = m.provider_id)))
  WHERE ((m.request_id = m.request_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "ride admin audit read" on public.ride_admin_audit_log as permissive for select to authenticated using (is_admin());

create policy "ride drivers admin create" on public.ride_drivers as permissive for insert to authenticated with check (is_admin());

create policy "ride drivers admin delete" on public.ride_drivers as permissive for delete to authenticated using (is_admin());

create policy "ride drivers admin update" on public.ride_drivers as permissive for update to authenticated using (is_admin()) with check (is_admin());

create policy "ride drivers participant read" on public.ride_drivers as permissive for select to authenticated using (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = ride_drivers.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM rides r
  WHERE ((r.driver_id = r.id) AND (r.client_user_id = ( SELECT auth.uid() AS uid)) AND (r.status = ANY (ARRAY['accepted'::text, 'driver_arriving'::text, 'driver_arrived'::text, 'in_progress'::text, 'completed'::text]))))) OR is_admin()));

create policy "ride pricing admin create" on public.ride_pricing_settings as permissive for insert to authenticated with check (is_admin());

create policy "ride pricing admin delete" on public.ride_pricing_settings as permissive for delete to authenticated using (is_admin());

create policy "ride pricing admin update" on public.ride_pricing_settings as permissive for update to authenticated using (is_admin()) with check (is_admin());

create policy "ride pricing public read" on public.ride_pricing_settings as permissive for select to anon, authenticated using ((is_active OR is_admin()));

create policy "ride promotions admin create" on public.ride_promotions as permissive for insert to authenticated with check (is_admin());

create policy "ride promotions admin delete" on public.ride_promotions as permissive for delete to authenticated using (is_admin());

create policy "ride promotions admin update" on public.ride_promotions as permissive for update to authenticated using (is_admin()) with check (is_admin());

create policy "ride promotions authenticated read" on public.ride_promotions as permissive for select to authenticated using ((is_active OR is_admin()));

create policy "ride history participant read" on public.ride_status_history as permissive for select to authenticated using ((EXISTS ( SELECT 1
   FROM rides r
  WHERE ((r.id = ride_status_history.ride_id) AND ((r.client_user_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
           FROM (ride_drivers d
             JOIN providers p ON ((p.id = d.provider_id)))
          WHERE ((d.id = r.driver_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin())))));

create policy "ride stops client create" on public.ride_stops as permissive for insert to authenticated with check ((EXISTS ( SELECT 1
   FROM rides r
  WHERE ((r.id = ride_stops.ride_id) AND (r.client_user_id = ( SELECT auth.uid() AS uid)) AND (r.status = ANY (ARRAY['searching'::text, 'accepted'::text, 'driver_arriving'::text]))))));

create policy "ride stops participant read" on public.ride_stops as permissive for select to authenticated using ((EXISTS ( SELECT 1
   FROM rides r
  WHERE ((r.id = ride_stops.ride_id) AND ((r.client_user_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
           FROM (ride_drivers d
             JOIN providers p ON ((p.id = d.provider_id)))
          WHERE ((d.id = r.driver_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin())))));

create policy "rides client create" on public.rides as permissive for insert to authenticated with check (((client_user_id = ( SELECT auth.uid() AS uid)) AND (status = 'searching'::text)));

create policy "rides participant read" on public.rides as permissive for select to authenticated using (((client_user_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM (ride_drivers d
     JOIN providers p ON ((p.id = d.provider_id)))
  WHERE ((d.id = rides.driver_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR ((status = 'searching'::text) AND (EXISTS ( SELECT 1
   FROM (ride_drivers d
     JOIN providers p ON ((p.id = d.provider_id)))
  WHERE ((p.auth_user_id = ( SELECT auth.uid() AS uid)) AND (d.status = 'available'::text) AND (d.verification_status = 'verified'::text) AND (d.current_vehicle_category_id = rides.category_id))))) OR is_admin()));

create policy "admin read server alerts" on public.server_alerts as permissive for select to authenticated using (bizzi_payment_admin_allowed());

create policy "service proposals participants read" on public.service_proposals as permissive for select to authenticated using (((EXISTS ( SELECT 1
   FROM express_requests r
  WHERE ((r.id = service_proposals.request_id) AND (r.client_user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = service_proposals.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "service proposals provider create" on public.service_proposals as permissive for insert to authenticated with check (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = service_proposals.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) AND (EXISTS ( SELECT 1
   FROM service_request_matches m
  WHERE ((m.request_id = m.request_id) AND (m.provider_id = m.provider_id) AND (m.status = ANY (ARRAY['notified'::text, 'viewing'::text, 'responding'::text])))))));

create policy "service proposals provider update" on public.service_proposals as permissive for update to authenticated using (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = service_proposals.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin())) with check (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = service_proposals.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "service events participant create" on public.service_request_events as permissive for insert to authenticated with check (((actor_user_id = ( SELECT auth.uid() AS uid)) AND ((EXISTS ( SELECT 1
   FROM express_requests r
  WHERE ((r.id = service_request_events.request_id) AND (r.client_user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM (service_request_matches m
     JOIN providers p ON ((p.id = m.provider_id)))
  WHERE ((m.request_id = m.request_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))))));

create policy "service events participants read" on public.service_request_events as permissive for select to authenticated using (((EXISTS ( SELECT 1
   FROM express_requests r
  WHERE ((r.id = service_request_events.request_id) AND (r.client_user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM (service_request_matches m
     JOIN providers p ON ((p.id = m.provider_id)))
  WHERE ((m.request_id = m.request_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "request matches admin create" on public.service_request_matches as permissive for insert to authenticated with check (is_admin());

create policy "request matches provider read" on public.service_request_matches as permissive for select to authenticated using (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = service_request_matches.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "request matches provider update" on public.service_request_matches as permissive for update to authenticated using (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = service_request_matches.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin())) with check (((EXISTS ( SELECT 1
   FROM providers p
  WHERE ((p.id = service_request_matches.provider_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));

create policy "service media owner create" on public.service_request_media as permissive for insert to authenticated with check (((owner_user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM express_requests r
  WHERE ((r.id = service_request_media.request_id) AND (r.client_user_id = ( SELECT auth.uid() AS uid)))))));

create policy "service media owner delete" on public.service_request_media as permissive for delete to authenticated using (((owner_user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));

create policy "service media participants read" on public.service_request_media as permissive for select to authenticated using (((owner_user_id = ( SELECT auth.uid() AS uid)) OR (approved_for_provider AND (EXISTS ( SELECT 1
   FROM (service_request_matches m
     JOIN providers p ON ((p.id = m.provider_id)))
  WHERE ((m.request_id = m.request_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid)))))) OR is_admin()));

create policy "admin full services" on public.services as permissive for all to authenticated using (is_admin()) with check (is_admin());

create policy "public read active services" on public.services as permissive for select to public using ((is_active = true));

create policy "situation questions admin create" on public.situation_questions as permissive for insert to authenticated with check (is_admin());

create policy "situation questions admin delete" on public.situation_questions as permissive for delete to authenticated using (is_admin());

create policy "situation questions admin update" on public.situation_questions as permissive for update to authenticated using (is_admin()) with check (is_admin());

create policy "situation questions visible or admin" on public.situation_questions as permissive for select to anon, authenticated using ((EXISTS ( SELECT 1
   FROM situations s
  WHERE ((s.id = situation_questions.situation_id) AND (s.active OR is_admin())))));

create policy "situation services admin create" on public.situation_services as permissive for insert to authenticated with check (is_admin());

create policy "situation services admin delete" on public.situation_services as permissive for delete to authenticated using (is_admin());

create policy "situation services admin update" on public.situation_services as permissive for update to authenticated using (is_admin()) with check (is_admin());

create policy "situation services visible or admin" on public.situation_services as permissive for select to anon, authenticated using ((EXISTS ( SELECT 1
   FROM situations s
  WHERE ((s.id = situation_services.situation_id) AND (s.active OR is_admin())))));

create policy "situations admin create" on public.situations as permissive for insert to authenticated with check (is_admin());

create policy "situations admin delete" on public.situations as permissive for delete to authenticated using (is_admin());

create policy "situations admin update" on public.situations as permissive for update to authenticated using (is_admin()) with check (is_admin());

create policy "situations visible or admin" on public.situations as permissive for select to anon, authenticated using ((active OR is_admin()));

create policy "public read active plans" on public.subscription_plans as permissive for select to public using ((is_active = true));

create policy "ride categories admin create" on public.vehicle_categories as permissive for insert to authenticated with check (is_admin());

create policy "ride categories admin delete" on public.vehicle_categories as permissive for delete to authenticated using (is_admin());

create policy "ride categories admin update" on public.vehicle_categories as permissive for update to authenticated using (is_admin()) with check (is_admin());

create policy "ride categories public read" on public.vehicle_categories as permissive for select to anon, authenticated using ((is_active OR is_admin()));

create policy "wallet transactions owner read" on public.wallet_transactions as permissive for select to authenticated using (((EXISTS ( SELECT 1
   FROM ((professional_wallets w
     JOIN ride_drivers d ON ((d.id = w.driver_id)))
     JOIN providers p ON ((p.id = d.provider_id)))
  WHERE ((w.id = wallet_transactions.wallet_id) AND (p.auth_user_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));


-- ============================================================
-- Droits sur les tables (anon, authenticated)
-- ============================================================

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_audit_events to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_audit_events to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_financial_snapshots to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_financial_snapshots to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_operations_dashboard to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_operations_dashboard to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_profiles to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_profiles to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_report_snapshots to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_report_snapshots to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.advertisements to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.advertisements to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.app_error_events to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.app_error_events to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.bizzi_delivery_coherence_v184 to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.bizzi_delivery_coherence_v184 to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.categories to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.categories to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.cities to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.cities to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.communes to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.communes to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.countries to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.countries to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.courier_locations to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.courier_locations to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.delivery_dispatch_offers to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.delivery_dispatch_offers to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.delivery_requests to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.delivery_requests to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.driver_locations to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.driver_locations to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.driver_vehicles to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.driver_vehicles to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.event_promotions to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.event_promotions to authenticated;

grant INSERT, SELECT on public.exception_places to anon;

grant DELETE, INSERT, SELECT, UPDATE on public.exception_places to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.express_requests to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.express_requests to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.field_test_results to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.field_test_results to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.field_test_sessions to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.field_test_sessions to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.food_places to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.food_places to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.fraud_signals to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.fraud_signals to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.integration_health_checks to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.integration_health_checks to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.job_offers to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.job_offers to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.load_test_runs to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.load_test_runs to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.map_lookup_events to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.map_lookup_events to authenticated;

grant SELECT on public.market_settings to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.monitoring_forwarding_events to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.monitoring_forwarding_events to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.payment_checkout_sessions to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.payment_checkout_sessions to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.payment_transactions to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.payment_transactions to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.payment_webhook_events to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.payment_webhook_events to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.payments to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.payments to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.platform_settings to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.platform_settings to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.pricing_quotes to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.pricing_quotes to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.professional_wallets to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.professional_wallets to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.provider_availability to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.provider_availability to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.provider_reviews to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.provider_reviews to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.provider_services to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.provider_services to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.providers to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.providers to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_advertisements to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_advertisements to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_cash_feed to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_cash_feed to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_event_promotions to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_event_promotions to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_exception_places to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_exception_places to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_food_places to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_food_places to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_job_offers to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_job_offers to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_provider_cards to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_provider_cards to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_provider_directory to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_provider_directory to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_provider_services to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_provider_services to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.push_notifications to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.push_notifications to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.recommendation_settings to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.recommendation_settings to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.reports to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.reports to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.request_services to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.request_services to authenticated;

grant SELECT on public.ride_admin_audit_log to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ride_drivers to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ride_drivers to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ride_pricing_settings to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ride_pricing_settings to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ride_promotions to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ride_promotions to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ride_status_history to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ride_status_history to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ride_stops to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ride_stops to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.rides to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.rides to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.server_alerts to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.server_alerts to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.service_proposals to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.service_proposals to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.service_request_events to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.service_request_events to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.service_request_matches to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.service_request_matches to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.service_request_media to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.service_request_media to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.services to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.services to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.situation_questions to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.situation_questions to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.situation_services to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.situation_services to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.situations to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.situations to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.subscription_plans to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.subscription_plans to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.vehicle_categories to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.vehicle_categories to authenticated;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.wallet_transactions to anon;

grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.wallet_transactions to authenticated;


-- ============================================================
-- Droits sur les fonctions (anon, authenticated)
-- ============================================================

grant execute on function public.accept_ride(ride_uuid uuid, operation_key text) to authenticated;

grant execute on function public.admin_activate_trial_provider(provider_uuid uuid) to anon;

grant execute on function public.admin_activate_trial_provider(provider_uuid uuid) to authenticated;

grant execute on function public.admin_add_free_exception_place(place_name text, responsible_name text, phone text, place_city text, place_area text, place_address text, place_description text, place_photo_url text) to anon;

grant execute on function public.admin_add_free_exception_place(place_name text, responsible_name text, phone text, place_city text, place_area text, place_address text, place_description text, place_photo_url text) to authenticated;

grant execute on function public.admin_approve_payment(payment_uuid uuid) to anon;

grant execute on function public.admin_approve_payment(payment_uuid uuid) to authenticated;

grant execute on function public.admin_archive_job_offer(job_uuid uuid) to anon;

grant execute on function public.admin_archive_job_offer(job_uuid uuid) to authenticated;

grant execute on function public.admin_list_admins() to anon;

grant execute on function public.admin_list_admins() to authenticated;

grant execute on function public.admin_list_all_clients(p_search text, p_after jsonb, p_limit integer) to anon;

grant execute on function public.admin_list_all_clients(p_search text, p_after jsonb, p_limit integer) to authenticated;

grant execute on function public.admin_list_all_providers(p_search text, p_status text, p_visibility text, p_after jsonb, p_limit integer) to anon;

grant execute on function public.admin_list_all_providers(p_search text, p_status text, p_visibility text, p_after jsonb, p_limit integer) to authenticated;

grant execute on function public.admin_list_platform_settings() to anon;

grant execute on function public.admin_list_platform_settings() to authenticated;

grant execute on function public.admin_log_action(p_action text, p_target_id text, p_success boolean, p_error_message text, p_payload jsonb) to anon;

grant execute on function public.admin_log_action(p_action text, p_target_id text, p_success boolean, p_error_message text, p_payload jsonb) to authenticated;

grant execute on function public.admin_publish_event_promotion(event_uuid uuid) to anon;

grant execute on function public.admin_publish_event_promotion(event_uuid uuid) to authenticated;

grant execute on function public.admin_publish_exception_place(place_uuid uuid) to anon;

grant execute on function public.admin_publish_exception_place(place_uuid uuid) to authenticated;

grant execute on function public.admin_publish_food_place(food_uuid uuid) to anon;

grant execute on function public.admin_publish_food_place(food_uuid uuid) to authenticated;

grant execute on function public.admin_publish_job_offer(job_uuid uuid) to anon;

grant execute on function public.admin_publish_job_offer(job_uuid uuid) to authenticated;

grant execute on function public.admin_reactivate_provider(provider_uuid uuid) to anon;

grant execute on function public.admin_reactivate_provider(provider_uuid uuid) to authenticated;

grant execute on function public.admin_reject_event_promotion(event_uuid uuid) to anon;

grant execute on function public.admin_reject_event_promotion(event_uuid uuid) to authenticated;

grant execute on function public.admin_reject_food_place(food_uuid uuid) to anon;

grant execute on function public.admin_reject_food_place(food_uuid uuid) to authenticated;

grant execute on function public.admin_set_admin_active(target_auth_user_id uuid, p_is_active boolean) to anon;

grant execute on function public.admin_set_admin_active(target_auth_user_id uuid, p_is_active boolean) to authenticated;

grant execute on function public.admin_set_platform_setting(p_key text, p_value jsonb) to anon;

grant execute on function public.admin_set_platform_setting(p_key text, p_value jsonb) to authenticated;

grant execute on function public.admin_set_provider_visibility(provider_uuid uuid, make_visible boolean) to anon;

grant execute on function public.admin_set_provider_visibility(provider_uuid uuid, make_visible boolean) to authenticated;

grant execute on function public.admin_suspend_provider(provider_uuid uuid) to anon;

grant execute on function public.admin_suspend_provider(provider_uuid uuid) to authenticated;

grant execute on function public.admin_upsert_admin_profile(target_auth_user_id uuid, p_full_name text, p_role text) to anon;

grant execute on function public.admin_upsert_admin_profile(target_auth_user_id uuid, p_full_name text, p_role text) to authenticated;

grant execute on function public.approve_payment(payment_uuid uuid) to anon;

grant execute on function public.approve_payment(payment_uuid uuid) to authenticated;

grant execute on function public.bizzi_accept_delivery_request(p_delivery_id uuid, p_provider_id uuid, p_provider_name text, p_provider_phone text) to anon;

grant execute on function public.bizzi_accept_delivery_request(p_delivery_id uuid, p_provider_id uuid, p_provider_name text, p_provider_phone text) to authenticated;

grant execute on function public.bizzi_accept_dispatch_offer(p_offer_id uuid, p_provider_id uuid) to anon;

grant execute on function public.bizzi_accept_dispatch_offer(p_offer_id uuid, p_provider_id uuid) to authenticated;

grant execute on function public.bizzi_admin_finance_delivery_report() to anon;

grant execute on function public.bizzi_admin_finance_delivery_report() to authenticated;

grant execute on function public.bizzi_admin_global_report() to anon;

grant execute on function public.bizzi_admin_global_report() to authenticated;

grant execute on function public.bizzi_admin_request_allowed() to anon;

grant execute on function public.bizzi_admin_request_allowed() to authenticated;

grant execute on function public.bizzi_approve_delivery_payment(p_delivery_id uuid) to anon;

grant execute on function public.bizzi_approve_delivery_payment(p_delivery_id uuid) to authenticated;

grant execute on function public.bizzi_assign_primary_service(provider_phone text, target_service_name text, target_city_name text) to anon;

grant execute on function public.bizzi_assign_primary_service(provider_phone text, target_service_name text, target_city_name text) to authenticated;

grant execute on function public.bizzi_auto_approve_new_provider() to anon;

grant execute on function public.bizzi_auto_approve_new_provider() to authenticated;

grant execute on function public.bizzi_auto_validate_delivery_order(p_delivery_id uuid, p_transaction_reference text) to anon;

grant execute on function public.bizzi_auto_validate_delivery_order(p_delivery_id uuid, p_transaction_reference text) to authenticated;

grant execute on function public.bizzi_auto_validate_delivery_order_tg() to anon;

grant execute on function public.bizzi_auto_validate_delivery_order_tg() to authenticated;

grant execute on function public.bizzi_block_duplicate_provider_phone() to anon;

grant execute on function public.bizzi_block_duplicate_provider_phone() to authenticated;

grant execute on function public.bizzi_can_review_provider(provider_uuid uuid) to anon;

grant execute on function public.bizzi_can_review_provider(provider_uuid uuid) to authenticated;

grant execute on function public.bizzi_city_group_key(p_city text) to anon;

grant execute on function public.bizzi_city_group_key(p_city text) to authenticated;

grant execute on function public.bizzi_cleanup_duplicate_trial_providers(apply_changes boolean) to anon;

grant execute on function public.bizzi_cleanup_duplicate_trial_providers(apply_changes boolean) to authenticated;

grant execute on function public.bizzi_close_delivery_request(p_delivery_id uuid) to anon;

grant execute on function public.bizzi_close_delivery_request(p_delivery_id uuid) to authenticated;

grant execute on function public.bizzi_column_exists(table_name text, column_name text) to anon;

grant execute on function public.bizzi_column_exists(table_name text, column_name text) to authenticated;

grant execute on function public.bizzi_dispatch_delivery_request(p_delivery_id uuid, p_limit integer) to anon;

grant execute on function public.bizzi_dispatch_delivery_request(p_delivery_id uuid, p_limit integer) to authenticated;

grant execute on function public.bizzi_distance_km(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision) to anon;

grant execute on function public.bizzi_distance_km(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision) to authenticated;

grant execute on function public.bizzi_find_provider_exact(provider_phone text) to anon;

grant execute on function public.bizzi_find_provider_exact(provider_phone text) to authenticated;

grant execute on function public.bizzi_normalize_phone_digits(raw_phone text) to anon;

grant execute on function public.bizzi_normalize_phone_digits(raw_phone text) to authenticated;

grant execute on function public.bizzi_payment_admin_allowed() to anon;

grant execute on function public.bizzi_payment_admin_allowed() to authenticated;

grant execute on function public.bizzi_phone_canonical(value text) to anon;

grant execute on function public.bizzi_phone_canonical(value text) to authenticated;

grant execute on function public.bizzi_phone_digits(phone_value text) to anon;

grant execute on function public.bizzi_phone_digits(phone_value text) to authenticated;

grant execute on function public.bizzi_plan_accepts_payment(plan_uuid uuid) to anon;

grant execute on function public.bizzi_plan_accepts_payment(plan_uuid uuid) to authenticated;

grant execute on function public.bizzi_provider_accepts_payment(provider_uuid uuid) to anon;

grant execute on function public.bizzi_provider_accepts_payment(provider_uuid uuid) to authenticated;

grant execute on function public.bizzi_provider_duplicate_report() to anon;

grant execute on function public.bizzi_provider_duplicate_report() to authenticated;

grant execute on function public.bizzi_provider_is_delivery(p_provider_id uuid) to anon;

grant execute on function public.bizzi_provider_is_delivery(p_provider_id uuid) to authenticated;

grant execute on function public.bizzi_public_provider_count() to anon;

grant execute on function public.bizzi_public_provider_count() to authenticated;

grant execute on function public.bizzi_search_key(value text) to anon;

grant execute on function public.bizzi_search_key(value text) to authenticated;

grant execute on function public.bizzi_search_public_providers(p_search text, p_city text, p_service text, p_verified_only boolean, p_emergency_only boolean, p_after jsonb, p_limit integer) to anon;

grant execute on function public.bizzi_search_public_providers(p_search text, p_city text, p_service text, p_verified_only boolean, p_emergency_only boolean, p_after jsonb, p_limit integer) to authenticated;

grant execute on function public.bizzi_service_group_key(p_service text) to anon;

grant execute on function public.bizzi_service_group_key(p_service text) to authenticated;

grant execute on function public.bizzi_submit_review(p_provider_uuid uuid, p_provider_phone text, p_rating integer, p_message text) to anon;

grant execute on function public.bizzi_submit_review(p_provider_uuid uuid, p_provider_phone text, p_rating integer, p_message text) to authenticated;

grant execute on function public.bizzi_update_courier_location(p_provider_id uuid, p_provider_phone text, p_latitude double precision, p_longitude double precision, p_accuracy_meters numeric, p_battery_level integer, p_is_available boolean) to anon;

grant execute on function public.bizzi_update_courier_location(p_provider_id uuid, p_provider_phone text, p_latitude double precision, p_longitude double precision, p_accuracy_meters numeric, p_battery_level integer, p_is_available boolean) to authenticated;

grant execute on function public.cash_admin_approve_payment(p_mission_id uuid) to anon;

grant execute on function public.cash_admin_approve_payment(p_mission_id uuid) to authenticated;

grant execute on function public.cash_admin_list_disputes(p_status text) to anon;

grant execute on function public.cash_admin_list_disputes(p_status text) to authenticated;

grant execute on function public.cash_admin_list_missions(p_status text, p_limit integer) to anon;

grant execute on function public.cash_admin_list_missions(p_status text, p_limit integer) to authenticated;

grant execute on function public.cash_admin_reject_payment(p_mission_id uuid, p_reason text) to anon;

grant execute on function public.cash_admin_reject_payment(p_mission_id uuid, p_reason text) to authenticated;

grant execute on function public.cash_admin_reject_solution(p_solution_id uuid, p_reason text) to anon;

grant execute on function public.cash_admin_reject_solution(p_solution_id uuid, p_reason text) to authenticated;

grant execute on function public.cash_admin_resolve_dispute(p_dispute_id uuid, p_favor text, p_resolution text, p_solver_share_amount numeric) to anon;

grant execute on function public.cash_admin_resolve_dispute(p_dispute_id uuid, p_favor text, p_resolution text, p_solver_share_amount numeric) to authenticated;

grant execute on function public.cash_admin_stats() to anon;

grant execute on function public.cash_admin_stats() to authenticated;

grant execute on function public.cash_apply_wallet_delta() to anon;

grant execute on function public.cash_apply_wallet_delta() to authenticated;

grant execute on function public.cash_confirm_completion(p_mission_id uuid, p_requester_phone text) to anon;

grant execute on function public.cash_confirm_completion(p_mission_id uuid, p_requester_phone text) to authenticated;

grant execute on function public.cash_create_mission_draft(p_requester_phone text, p_requester_name text, p_title text, p_description text, p_category text, p_area text, p_attachments jsonb, p_deadline_type text, p_deadline_at timestamp with time zone, p_reward_amount numeric, p_service_budget_hint numeric) to anon;

grant execute on function public.cash_create_mission_draft(p_requester_phone text, p_requester_name text, p_title text, p_description text, p_category text, p_area text, p_attachments jsonb, p_deadline_type text, p_deadline_at timestamp with time zone, p_reward_amount numeric, p_service_budget_hint numeric) to authenticated;

grant execute on function public.cash_declare_mission_payment(p_mission_id uuid, p_requester_phone text, p_payment_method text, p_transaction_reference text, p_amount numeric) to anon;

grant execute on function public.cash_declare_mission_payment(p_mission_id uuid, p_requester_phone text, p_payment_method text, p_transaction_reference text, p_amount numeric) to authenticated;

grant execute on function public.cash_distribute_reward(p_mission_id uuid) to anon;

grant execute on function public.cash_distribute_reward(p_mission_id uuid) to authenticated;

grant execute on function public.cash_get_mission_detail(p_mission_id uuid, p_caller_phone text) to anon;

grant execute on function public.cash_get_mission_detail(p_mission_id uuid, p_caller_phone text) to authenticated;

grant execute on function public.cash_get_solver_profile(p_phone text) to anon;

grant execute on function public.cash_get_solver_profile(p_phone text) to authenticated;

grant execute on function public.cash_grant_credit(p_mission_id uuid, p_user_phone text, p_amount numeric, p_reason text) to anon;

grant execute on function public.cash_grant_credit(p_mission_id uuid, p_user_phone text, p_amount numeric, p_reason text) to authenticated;

grant execute on function public.cash_list_missions_by_ids(p_ids uuid[]) to anon;

grant execute on function public.cash_list_missions_by_ids(p_ids uuid[]) to authenticated;

grant execute on function public.cash_list_my_credits(p_phone text) to anon;

grant execute on function public.cash_list_my_credits(p_phone text) to authenticated;

grant execute on function public.cash_list_my_missions(p_phone text) to anon;

grant execute on function public.cash_list_my_missions(p_phone text) to authenticated;

grant execute on function public.cash_list_my_notifications(p_phone text) to anon;

grant execute on function public.cash_list_my_notifications(p_phone text) to authenticated;

grant execute on function public.cash_list_my_solutions(p_phone text) to anon;

grant execute on function public.cash_list_my_solutions(p_phone text) to authenticated;

grant execute on function public.cash_notify(p_user_phone text, p_type text, p_mission_id uuid, p_message text) to anon;

grant execute on function public.cash_notify(p_user_phone text, p_type text, p_mission_id uuid, p_message text) to authenticated;

grant execute on function public.cash_open_dispute(p_mission_id uuid, p_opened_by_phone text, p_category text, p_description text, p_attachments jsonb) to anon;

grant execute on function public.cash_open_dispute(p_mission_id uuid, p_opened_by_phone text, p_category text, p_description text, p_attachments jsonb) to authenticated;

grant execute on function public.cash_refresh_solver_stats(p_user_phone text) to anon;

grant execute on function public.cash_refresh_solver_stats(p_user_phone text) to authenticated;

grant execute on function public.cash_reviews_refresh_stats() to anon;

grant execute on function public.cash_reviews_refresh_stats() to authenticated;

grant execute on function public.cash_select_solution(p_mission_id uuid, p_requester_phone text, p_solution_id uuid) to anon;

grant execute on function public.cash_select_solution(p_mission_id uuid, p_requester_phone text, p_solution_id uuid) to authenticated;

grant execute on function public.cash_setting_numeric(p_key text, p_default numeric) to anon;

grant execute on function public.cash_setting_numeric(p_key text, p_default numeric) to authenticated;

grant execute on function public.cash_solver_finalize_mission(p_mission_id uuid, p_solver_phone text) to anon;

grant execute on function public.cash_solver_finalize_mission(p_mission_id uuid, p_solver_phone text) to authenticated;

grant execute on function public.cash_submit_review(p_mission_id uuid, p_reviewer_phone text, p_rating integer, p_speed_rating integer, p_reliability_rating integer, p_quality_rating integer, p_comment text) to anon;

grant execute on function public.cash_submit_review(p_mission_id uuid, p_reviewer_phone text, p_rating integer, p_speed_rating integer, p_reliability_rating integer, p_quality_rating integer, p_comment text) to authenticated;

grant execute on function public.cash_submit_solution(p_mission_id uuid, p_solver_phone text, p_solver_name text, p_description text, p_attachments jsonb, p_contact text, p_price_hint numeric, p_availability text, p_estimated_duration numeric, p_duration_unit text) to anon;

grant execute on function public.cash_submit_solution(p_mission_id uuid, p_solver_phone text, p_solver_name text, p_description text, p_attachments jsonb, p_contact text, p_price_hint numeric, p_availability text, p_estimated_duration numeric, p_duration_unit text) to authenticated;

grant execute on function public.cash_sweep_expired(p_limit integer) to anon;

grant execute on function public.cash_sweep_expired(p_limit integer) to authenticated;

grant execute on function public.cash_use_credit_for_mission(p_credit_id uuid, p_mission_id uuid, p_requester_phone text) to anon;

grant execute on function public.cash_use_credit_for_mission(p_credit_id uuid, p_mission_id uuid, p_requester_phone text) to authenticated;

grant execute on function public.cash_wallet_summary(p_phone text) to anon;

grant execute on function public.cash_wallet_summary(p_phone text) to authenticated;

grant execute on function public.cash_withdraw_solution(p_solution_id uuid, p_solver_phone text) to anon;

grant execute on function public.cash_withdraw_solution(p_solution_id uuid, p_solver_phone text) to authenticated;

grant execute on function public.close_market_without_winner(p_request_id uuid) to authenticated;

grant execute on function public.configure_market_settings(p_solver_share_percent integer, p_max_solutions integer, p_pause_hours integer, p_credit_max_uses integer, p_credit_valid_days integer, p_certified_only_direct boolean) to authenticated;

grant execute on function public.confirm_market_funding(p_request_id uuid, p_external_reference text) to authenticated;

grant execute on function public.confirm_market_payout(p_request_id uuid, p_payout_reference text) to authenticated;

grant execute on function public.create_market_request(p_title text, p_description text, p_category text, p_city text, p_area text, p_duration_days integer, p_reward_amount bigint, p_urgency text, p_payment_method text, p_payment_reference text, p_credit_id uuid) to authenticated;

grant execute on function public.decide_market_solution(p_request_id uuid, p_solution_id uuid, p_accept boolean) to authenticated;

grant execute on function public.expire_unpaid_providers() to anon;

grant execute on function public.expire_unpaid_providers() to authenticated;

grant execute on function public.get_market_admin_workspace() to authenticated;

grant execute on function public.get_market_workspace(p_filter text) to authenticated;

grant execute on function public.is_admin() to anon;

grant execute on function public.is_admin() to authenticated;

grant execute on function public.is_super_admin() to anon;

grant execute on function public.is_super_admin() to authenticated;

grant execute on function public.process_market_expirations() to authenticated;

grant execute on function public.provider_reviews_refresh_rating() to anon;

grant execute on function public.provider_reviews_refresh_rating() to authenticated;

grant execute on function public.public_activate_provider_trial(provider_uuid uuid, provider_phone text) to anon;

grant execute on function public.public_activate_provider_trial(provider_uuid uuid, provider_phone text) to authenticated;

grant execute on function public.public_can_use_pending_provider(provider_uuid uuid) to anon;

grant execute on function public.public_can_use_pending_provider(provider_uuid uuid) to authenticated;

grant execute on function public.public_find_provider_for_renewal(provider_phone text) to anon;

grant execute on function public.public_find_provider_for_renewal(provider_phone text) to authenticated;

grant execute on function public.public_get_cash_settings() to anon;

grant execute on function public.public_get_cash_settings() to authenticated;

grant execute on function public.public_get_feature_flags() to anon;

grant execute on function public.public_get_feature_flags() to authenticated;

grant execute on function public.public_link_provider_service(provider_uuid uuid, provider_phone text, target_service_name text, target_category_name text) to anon;

grant execute on function public.public_link_provider_service(provider_uuid uuid, provider_phone text, target_service_name text, target_category_name text) to authenticated;

grant execute on function public.record_event_promotion_click(event_uuid uuid, click_kind text) to anon;

grant execute on function public.record_event_promotion_click(event_uuid uuid, click_kind text) to authenticated;

grant execute on function public.refresh_provider_rating(provider_uuid uuid) to anon;

grant execute on function public.refresh_provider_rating(provider_uuid uuid) to authenticated;

grant execute on function public.refresh_provider_visibility(provider_uuid uuid) to anon;

grant execute on function public.refresh_provider_visibility(provider_uuid uuid) to authenticated;

grant execute on function public.review_market_solution(p_request_id uuid, p_solution_id uuid) to authenticated;

grant execute on function public.rls_auto_enable() to anon;

grant execute on function public.rls_auto_enable() to authenticated;

grant execute on function public.set_market_solver_permission(p_user_id uuid, p_provider_id uuid, p_can_refer boolean, p_can_direct boolean, p_certified boolean) to authenticated;

grant execute on function public.set_updated_at() to anon;

grant execute on function public.set_updated_at() to authenticated;

grant execute on function public.submit_market_solution(p_request_id uuid, p_solution_type text, p_message text, p_contact_details text, p_service_price bigint) to authenticated;

grant execute on function public.transition_ride(ride_uuid uuid, target_status text, operation_key text, final_amount_input integer) to authenticated;

grant execute on function public.zeyds_ride_quote(category_code text, city_input text, distance_input numeric, duration_input numeric, traffic_input numeric, availability_input numeric, time_input numeric, promotion_code_input text) to anon;

grant execute on function public.zeyds_ride_quote(category_code text, city_input text, distance_input numeric, duration_input numeric, traffic_input numeric, availability_input numeric, time_input numeric, promotion_code_input text) to authenticated;
