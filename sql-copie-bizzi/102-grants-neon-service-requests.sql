-- Neon (auto-heberge) : contrairement a Supabase, une base Neon fraichement
-- creee n'accorde aucun droit par defaut aux roles "anon"/"authenticated" sur
-- les nouvelles tables. Le fichier 101-demandes-service-directes-v303.sql
-- cree bien les politiques RLS, mais sans droit de table de base (GRANT), ces
-- politiques ne sont jamais evaluees : Postgres refuse l'acces avant meme de
-- regarder les lignes ("permission denied for table service_requests").
--
-- A executer sur Neon uniquement, apres 101-demandes-service-directes-v303.sql.

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.service_requests to anon, authenticated;

notify pgrst, 'reload schema';
