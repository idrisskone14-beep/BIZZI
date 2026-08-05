-- Zeyds V304 - Corrige les transitions de mission (accepter/refuser/demarrer/terminer)
--
-- A executer sur NEON, comme le reste du systeme de missions/propositions.
--
-- Bug trouve en testant le retour client->prestataire->client de bout en bout sur deux
-- appareils reellement separes (jusqu'ici toujours teste dans le meme state local, ce qui
-- masquait le probleme) :
-- 1. acceptServiceRequestInSupabase() appelle une RPC bizzi_accept_service_request qui
--    n'existe pas du tout sur Neon (verifie : PGRST202, "function not found").
-- 2. Son repli (PATCH direct sur service_requests) renvoie HTTP 200 mais un tableau VIDE :
--    la policy RLS "provider updates assigned service requests" (101-demandes-service-
--    directes-v303.sql) depend de auth.uid(), qui est toujours null sur Neon puisque les
--    prestataires n'ont pas de vraie session Supabase Auth - donc le PATCH est bloque en
--    silence, sans erreur remontee (le code utilisait Prefer: return=minimal, qui ne permet
--    pas de detecter un blocage RLS).
-- 3. advanceServiceRequestStage() (demarrer/terminer) n'appelait meme pas le serveur : mise a
--    jour 100% locale.
--
-- Resultat : une acceptation/un refus/un demarrage/une fin de prestation ne se propageait
-- JAMAIS reellement au client sur un autre appareil, meme si l'ecran du prestataire semblait
-- "marcher" (mise a jour optimiste locale uniquement).
--
-- Correctif : memes RPC security definer identifiees par telephone que
-- provider_submit_proposal/client_select_proposal (105-propositions-services-v304.sql),
-- plutot que de deboguer une policy RLS qui ne peut de toute facon pas fonctionner ici.

create or replace function public.provider_accept_service_request(
  p_service_request_id uuid,
  p_provider_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result_row public.service_requests%rowtype;
begin
  update public.service_requests
  set status = 'accepted',
      accepted_at = now()
  where id = p_service_request_id
    and status = 'pending_acceptance'
    and public.bizzi_normalize_phone_digits(assigned_provider_phone) = public.bizzi_normalize_phone_digits(p_provider_phone)
  returning * into result_row;

  if result_row.id is null then
    raise exception 'Demande introuvable, deja traitee, ou ne vous concerne pas';
  end if;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.provider_accept_service_request(uuid, text) from public;
grant execute on function public.provider_accept_service_request(uuid, text) to anon, authenticated;

create or replace function public.provider_decline_service_request(
  p_service_request_id uuid,
  p_provider_phone text,
  p_reason text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result_row public.service_requests%rowtype;
begin
  update public.service_requests
  set status = 'declined',
      decline_reason = nullif(trim(coalesce(p_reason, '')), ''),
      declined_at = now()
  where id = p_service_request_id
    and status = 'pending_acceptance'
    and public.bizzi_normalize_phone_digits(assigned_provider_phone) = public.bizzi_normalize_phone_digits(p_provider_phone)
  returning * into result_row;

  if result_row.id is null then
    raise exception 'Demande introuvable, deja traitee, ou ne vous concerne pas';
  end if;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.provider_decline_service_request(uuid, text, text) from public;
grant execute on function public.provider_decline_service_request(uuid, text, text) to anon, authenticated;

create or replace function public.provider_advance_service_request(
  p_service_request_id uuid,
  p_provider_phone text,
  p_next_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  required_status text;
  result_row public.service_requests%rowtype;
begin
  if p_next_status = 'in_progress' then
    required_status := 'accepted';
  elsif p_next_status = 'completed' then
    required_status := 'in_progress';
  else
    raise exception 'Statut suivant invalide : %', p_next_status;
  end if;

  update public.service_requests
  set status = p_next_status,
      started_at = case when p_next_status = 'in_progress' then now() else started_at end,
      completed_at = case when p_next_status = 'completed' then now() else completed_at end
  where id = p_service_request_id
    and status = required_status
    and public.bizzi_normalize_phone_digits(assigned_provider_phone) = public.bizzi_normalize_phone_digits(p_provider_phone)
  returning * into result_row;

  if result_row.id is null then
    raise exception 'Demande introuvable, statut incorrect, ou ne vous concerne pas';
  end if;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.provider_advance_service_request(uuid, text, text) from public;
grant execute on function public.provider_advance_service_request(uuid, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

-- Si les fonctions ne repondent pas tout de suite : sur Render, service "bizzi-rest" ->
-- Manual Deploy -> Restart service (meme souci de cache de schema que d'habitude sur Neon).

select 'Zeyds V304 transitions de mission corrigees (Neon)' as statut;
