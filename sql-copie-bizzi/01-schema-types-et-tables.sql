-- Bizzi - Schema SQL initial
-- Cible : PostgreSQL / Supabase
-- Date : 2026-06-28

create extension if not exists "pgcrypto";

-- =========================================================
-- Types
-- =========================================================

do $$ begin
  create type provider_status as enum ('pending', 'approved', 'suspended', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type provider_visibility_status as enum ('trial', 'active', 'expired_blurred', 'hidden');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_method as enum ('wave', 'orange_money', 'mtn_money');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type advertisement_status as enum ('pending', 'active', 'expired', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type report_status as enum ('open', 'reviewed', 'closed');
exception when duplicate_object then null;
end $$;

-- =========================================================
-- Helpers
-- =========================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- Geographie
-- =========================================================

create table if not exists countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  iso_code text,
  currency text not null default 'FCFA',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references countries(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(country_id, name)
);

create table if not exists communes (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(city_id, name)
);

-- =========================================================
-- Catalogue services
-- =========================================================

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(category_id, name)
);

-- =========================================================
-- Prestataires
-- =========================================================

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  full_name text not null,
  phone text not null unique,
  whatsapp text,
  email text,
  photo_url text,
  description text,
  country_id uuid references countries(id),
  city_id uuid references cities(id),
  commune_id uuid references communes(id),
  neighborhood text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  status provider_status not null default 'pending',
  visibility_status provider_visibility_status not null default 'trial',
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  average_rating numeric(2, 1) not null default 0,
  call_count integer not null default 0,
  is_verified boolean not null default false,
  verification_proof_url text,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique(provider_id, service_id)
);

-- =========================================================
-- Abonnements et paiements
-- =========================================================

create table if not exists subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  duration_months integer not null,
  price integer not null,
  currency text not null default 'FCFA',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  plan_id uuid not null references subscription_plans(id),
  amount integer not null,
  currency text not null default 'FCFA',
  method payment_method not null,
  transaction_reference text,
  proof_url text,
  status payment_status not null default 'pending',
  admin_note text,
  paid_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Publicites locales
-- =========================================================

create table if not exists advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  provider_id uuid references providers(id) on delete set null,
  city_id uuid references cities(id) on delete set null,
  commune_id uuid references communes(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status advertisement_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Signalements
-- =========================================================

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  reason text not null,
  message text,
  status report_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Admin profiles
-- =========================================================

create table if not exists admin_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

