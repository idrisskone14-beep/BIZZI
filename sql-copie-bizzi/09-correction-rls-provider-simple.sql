-- Bizzi - Correction RLS provider simple
-- A executer si le fichier 08 ne debloque pas la creation prestataire.
--
-- Probleme constate :
-- "new row violates row-level security policy for table providers"
--
-- Objectif :
-- autoriser uniquement la creation publique de profils prestataires en attente,
-- sans autoriser un visiteur public a creer directement un profil approuve.

grant usage on schema public to anon, authenticated;
grant insert on providers to anon, authenticated;

drop policy if exists "public submit pending provider" on providers;
drop policy if exists "public submit pending provider simple" on providers;

create policy "public submit pending provider simple"
on providers
as permissive
for insert
to public
with check (
  status = 'pending'::provider_status
  and visibility_status = 'trial'::provider_visibility_status
);

-- Verification manuelle possible apres execution :
-- Dans l'application Bizzi, creer un prestataire test.
-- Le profil doit etre cree avec status = pending et visibility_status = trial.

