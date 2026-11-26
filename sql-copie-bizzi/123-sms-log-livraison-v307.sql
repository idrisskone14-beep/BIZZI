-- Zeyds V307 - Journal SMS : accuse de reception LeTexto (DLR) et envois de test depuis la console.
-- A executer sur NEON (zeyds-prod). La table reste illisible via la Data API (aucune policy) :
-- seules les fonctions Vercel (connexion proprietaire) la lisent.

alter table public.sms_log add column if not exists delivery_status text;
alter table public.sms_log add column if not exists delivered_at timestamptz;
alter table public.sms_log add column if not exists parts integer;

create index if not exists sms_log_letexto_idx on public.sms_log (letexto_id) where letexto_id is not null;

select 'Zeyds V307 sms_log : accuses de reception' as statut, count(*) as sms_journalises from public.sms_log;
