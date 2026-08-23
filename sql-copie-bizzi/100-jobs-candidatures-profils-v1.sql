-- Bizzi - ZEYDS JOBS : profils candidats, candidatures, favoris, alertes V1
--
-- STATUT : proposition non appliquee. Le module ZEYDS JOBS actuel
-- (js/zeyds-jobs.js) fonctionne en 100% local (localStorage) pour ces
-- entites, exactement comme le module Zeyds Cash. Ce fichier prepare
-- une migration future vers Supabase pour synchroniser les profils
-- candidats et les candidatures entre appareils, SANS avoir a
-- reecrire le module cote client (memes noms de champs que l'objet
-- JS `profile`/`application` deja utilise).
--
-- Ne casse rien a l'existant : public.job_offers (V66, fichier
-- 25-emplois-missions-supabase.sql) n'est pas modifie.
--
-- A executer dans Supabase > SQL Editor > New query, quand la
-- decision est prise de synchroniser ces donnees cote serveur.

create table if not exists public.candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  whatsapp text,
  email text,
  city text,
  commune text,
  district text,
  metier text,
  poste_recherche text,
  bio text,
  experience_years integer,
  education_level text,
  availability text default 'immediate' check (availability in ('immediate', '7j', '30j', 'indisponible')),
  contract_wanted text,
  salary_expectation integer,
  available_for_missions boolean not null default false,
  skills text[] not null default '{}',
  experiences jsonb not null default '[]',
  education jsonb not null default '[]',
  cv_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidate_profiles enable row level security;

drop trigger if exists candidate_profiles_set_updated_at on public.candidate_profiles;
create trigger candidate_profiles_set_updated_at
before update on public.candidate_profiles
for each row execute function public.set_updated_at();

-- Un candidat ne peut lire/modifier que son propre profil.
create policy "candidate reads own profile" on public.candidate_profiles
  for select using (auth.uid() = auth_user_id);
create policy "candidate updates own profile" on public.candidate_profiles
  for update using (auth.uid() = auth_user_id);
create policy "candidate inserts own profile" on public.candidate_profiles
  for insert with check (auth.uid() = auth_user_id);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_offers(id) on delete cascade,
  candidate_profile_id uuid references public.candidate_profiles(id) on delete set null,
  candidate_name text,
  candidate_phone text,
  candidate_whatsapp text,
  candidate_metier text,
  candidate_experience_years integer,
  candidate_skills text[] default '{}',
  status text not null default 'Envoyée'
    check (status in ('Envoyée', 'Vue', 'Présélectionné', 'Entretien', 'Retenu', 'Non retenu')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, candidate_profile_id)
);

alter table public.job_applications enable row level security;

drop trigger if exists job_applications_set_updated_at on public.job_applications;
create trigger job_applications_set_updated_at
before update on public.job_applications
for each row execute function public.set_updated_at();

create index if not exists idx_job_applications_job on public.job_applications(job_id, created_at desc);

-- Le recruteur ne voit que les candidatures de SES offres.
create policy "recruiter reads own job applications" on public.job_applications
  for select using (
    exists (
      select 1 from public.job_offers
      where job_offers.id = job_applications.job_id
      and job_offers.contact_phone = (select phone from public.candidate_profiles where auth_user_id = auth.uid() limit 1)
    )
  );

create table if not exists public.recruiter_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete cascade,
  recruiter_auth_user_id uuid references auth.users(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.recruiter_notes enable row level security;

-- Notes strictement privees au recruteur qui les a ecrites (jamais visibles du candidat).
create policy "recruiter reads own notes" on public.recruiter_notes
  for select using (auth.uid() = recruiter_auth_user_id);
create policy "recruiter inserts own notes" on public.recruiter_notes
  for insert with check (auth.uid() = recruiter_auth_user_id);

create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid not null references public.candidate_profiles(id) on delete cascade,
  job_id uuid not null references public.job_offers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (candidate_profile_id, job_id)
);

alter table public.saved_jobs enable row level security;

create policy "candidate manages own saved jobs" on public.saved_jobs
  for all using (
    candidate_profile_id in (select id from public.candidate_profiles where auth_user_id = auth.uid())
  );

create table if not exists public.job_alerts (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid not null references public.candidate_profiles(id) on delete cascade,
  keyword text,
  city text,
  contract_type text,
  min_salary integer,
  created_at timestamptz not null default now()
);

alter table public.job_alerts enable row level security;

create policy "candidate manages own alerts" on public.job_alerts
  for all using (
    candidate_profile_id in (select id from public.candidate_profiles where auth_user_id = auth.uid())
  );

create index if not exists idx_saved_jobs_candidate on public.saved_jobs(candidate_profile_id);
create index if not exists idx_job_alerts_candidate on public.job_alerts(candidate_profile_id);
