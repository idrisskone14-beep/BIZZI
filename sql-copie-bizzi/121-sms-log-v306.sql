-- Zeyds V306 - Journal des SMS LeTexto (fonction Vercel /api/sms-notify)
--
-- A executer sur NEON (zeyds-prod). Seule la fonction serveur (connexion proprietaire) lit et
-- ecrit cette table : elle sert de journal, de verrou « une seule salve par demande » et de
-- compteur pour les plafonds (par prestataire et global, sur 24 h glissantes).

create table if not exists public.sms_log (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  request_id uuid,
  provider_id text,
  phone text not null,
  status text not null check (status in ('sent', 'failed')),
  letexto_id text,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists sms_log_created_idx on public.sms_log (created_at desc);
create index if not exists sms_log_provider_created_idx on public.sms_log (provider_id, created_at desc);
create index if not exists sms_log_request_idx on public.sms_log (request_id);

alter table public.sms_log enable row level security;

-- Aucune policy volontairement : la table contient des numeros de telephone et ne doit jamais
-- etre lisible via la Data API.
revoke all on public.sms_log from anon, anonymous, authenticated;

select 'Zeyds V306 sms_log installee (Neon)' as statut, count(*) as sms_journalises from public.sms_log;
