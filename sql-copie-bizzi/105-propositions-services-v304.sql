-- Zeyds V304 - Systeme de propositions (Parcours B "Publier mon besoin")
-- + correctif d'une lacune de production sur service_requests.
--
-- CORRECTIF IMPORTANT : ce fichier doit etre execute sur NEON (gateway
-- PostgREST auto-heberge), PAS sur Supabase. Verifie en direct le
-- 2026-08-04 : service_requests, express_requests et providers repondent
-- HTTP 200 sur https://bizzi-gateway.onrender.com/rest/v1/... , ce qui
-- confirme que ce sont ces tables-la que lit/ecrit le frontend par defaut
-- (activeRestBaseUrl() route vers Neon des qu'aucun accessToken admin n'est
-- fourni - donc pour tout appel prestataire/client identifie par telephone).
-- L'ancienne note ci-dessous ("Supabase uniquement") etait une erreur de
-- raisonnement : l'identification par telephone (plutot que par vraie
-- session Supabase Auth) ne dit rien sur quelle base de donnees physique
-- repond a l'appel HTTP, seul compte le routage cote frontend. Comme pour
-- 101/102, Neon n'accorde aucun droit par defaut sur les nouveaux objets :
-- des GRANT explicites sont necessaires en plus des policies RLS.

-- 1. Correctif fondation : un prestataire ne pouvait JAMAIS relire ses
-- service_requests depuis un autre appareil que celui qui les a creees
-- (aucun appel de lecture cote frontend, la policy RLS existante depend de
-- auth.uid() alors que les prestataires n'ont pas de vraie session Supabase
-- Auth). RPC security definer, identification par telephone normalise,
-- meme convention que public_activate_provider_trial/bizzi_find_provider_exact.

create or replace function public.provider_list_service_requests(provider_phone text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(to_jsonb(sr) order by sr.created_at desc), '[]'::jsonb)
  from public.service_requests sr
  where public.bizzi_normalize_phone_digits(sr.assigned_provider_phone)
      = public.bizzi_normalize_phone_digits(provider_phone)
    and public.bizzi_normalize_phone_digits(provider_phone) is not null;
$$;

revoke all on function public.provider_list_service_requests(text) from public;
grant execute on function public.provider_list_service_requests(text) to anon, authenticated;

-- 2. Remettre en service express_requests --------------------------------
-- customer_name est deja envoye par submitExpressRequestToSupabase()
-- (app.js) mais la colonne n'existe pas -> le code a un repli qui la
-- supprime silencieusement en cas d'echec. client_access_token n'existe pas
-- du tout : sans lui, un client ne peut jamais relire sa propre demande
-- (necessaire pour la comparaison des propositions).

alter table public.express_requests
  add column if not exists customer_name text,
  add column if not exists client_access_token text,
  add column if not exists budget text,
  add column if not exists photo_url text;

comment on column public.express_requests.client_access_token is
  'Jeton prive aleatoire propre a l appareil client. Ne jamais afficher ni journaliser.';

-- Neon n'accorde rien par defaut sur une table existante non plus des qu'on
-- y touche via une nouvelle policy/colonne : on repete le grant par securite
-- (idempotent, sans effet si deja accorde).
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.express_requests to anon, authenticated;

drop policy if exists "client reads own express requests" on public.express_requests;
create policy "client reads own express requests"
on public.express_requests
for select
to anon, authenticated
using (
  length(coalesce((select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token'), '')) between 32 and 160
  and client_access_token = (select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token')
);

-- 3. Table des propositions ------------------------------------------------

create table if not exists public.express_request_proposals (
  id uuid primary key default gen_random_uuid(),
  express_request_id uuid not null references public.express_requests(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  provider_name text,
  provider_phone text,
  amount numeric,
  currency text default 'FCFA',
  message text,
  availability text,
  status text not null default 'sent'
    check (status = any(array['sent', 'selected', 'declined', 'expired'])),
  created_at timestamptz not null default now(),
  unique (express_request_id, provider_id)
);

create index if not exists idx_express_request_proposals_request
on public.express_request_proposals(express_request_id, status);

alter table public.express_request_proposals enable row level security;

drop policy if exists "client reads proposals for own request" on public.express_request_proposals;
create policy "client reads proposals for own request"
on public.express_request_proposals
for select
to anon, authenticated
using (
  exists (
    select 1 from public.express_requests er
    where er.id = express_request_id
      and length(coalesce((select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token'), '')) between 32 and 160
      and er.client_access_token = (select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token')
  )
);

-- Pas de policy d'ecriture directe : l'insertion passe uniquement par la
-- RPC provider_submit_proposal ci-dessous (verifie l'appartenance a
-- matched_provider_ids avant d'inserer), donc pas besoin de grant insert
-- sur la table elle-meme (la fonction est security definer).
grant select on public.express_request_proposals to anon, authenticated;

create or replace function public.provider_list_proposal_opportunities(provider_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  target_provider_id uuid;
  response jsonb;
begin
  select id into target_provider_id
  from public.providers
  where public.bizzi_normalize_phone_digits(phone) = public.bizzi_normalize_phone_digits(provider_phone)
  limit 1;

  if target_provider_id is null then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', er.id,
      'service_name', er.service_name,
      'city_name', er.city_name,
      'area', er.area,
      'urgency', er.urgency,
      'message', er.message,
      'created_at', er.created_at,
      'already_proposed', exists (
        select 1 from public.express_request_proposals p
        where p.express_request_id = er.id and p.provider_id = target_provider_id
      )
    )
    order by er.created_at desc
  ), '[]'::jsonb)
  into response
  from public.express_requests er
  where er.status = 'open'
    and target_provider_id = any(er.matched_provider_ids);

  return response;
end;
$$;

revoke all on function public.provider_list_proposal_opportunities(text) from public;
grant execute on function public.provider_list_proposal_opportunities(text) to anon, authenticated;

create or replace function public.provider_submit_proposal(
  p_express_request_id uuid,
  p_provider_phone text,
  p_amount numeric,
  p_message text,
  p_availability text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_provider record;
  request_row public.express_requests%rowtype;
  result_row public.express_request_proposals%rowtype;
begin
  select id, full_name, phone into target_provider
  from public.providers
  where public.bizzi_normalize_phone_digits(phone) = public.bizzi_normalize_phone_digits(p_provider_phone)
  limit 1;

  if target_provider.id is null then
    raise exception 'Prestataire introuvable pour ce numero';
  end if;

  select * into request_row from public.express_requests where id = p_express_request_id;
  if not found then
    raise exception 'Demande introuvable';
  end if;
  if request_row.status != 'open' then
    raise exception 'Cette demande n a deja plus de propositions ouvertes';
  end if;
  if not (target_provider.id = any(request_row.matched_provider_ids)) then
    raise exception 'Ce prestataire n est pas concerne par cette demande';
  end if;

  insert into public.express_request_proposals (
    express_request_id, provider_id, provider_name, provider_phone,
    amount, message, availability
  )
  values (
    p_express_request_id, target_provider.id, target_provider.full_name, target_provider.phone,
    p_amount, nullif(trim(coalesce(p_message, '')), ''), nullif(trim(coalesce(p_availability, '')), '')
  )
  on conflict (express_request_id, provider_id) do update
  set amount = excluded.amount,
      message = excluded.message,
      availability = excluded.availability
  returning * into result_row;

  update public.express_requests
  set status = 'contacted', updated_at = now()
  where id = p_express_request_id and status = 'open';

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.provider_submit_proposal(uuid, text, numeric, text, text) from public;
grant execute on function public.provider_submit_proposal(uuid, text, numeric, text, text) to anon, authenticated;

-- 4. Selection d'une proposition -> creation de la mission -----------------
-- Point de jonction : une fois choisie, on cree une ligne service_requests
-- classique, qui repart dans le pipeline deja existant (accepter/demarrer/
-- terminer/noter), sans dupliquer cette logique.

create or replace function public.client_select_proposal(
  p_proposal_id uuid,
  p_client_access_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  proposal_row public.express_request_proposals%rowtype;
  request_row public.express_requests%rowtype;
  new_service_request_id uuid := gen_random_uuid();
  result_row public.service_requests%rowtype;
begin
  if length(coalesce(p_client_access_token, '')) < 32 then
    raise exception 'Jeton client invalide';
  end if;

  select * into proposal_row from public.express_request_proposals where id = p_proposal_id;
  if not found then
    raise exception 'Proposition introuvable';
  end if;

  select * into request_row from public.express_requests where id = proposal_row.express_request_id;
  if not found or request_row.client_access_token is distinct from p_client_access_token then
    raise exception 'Cette proposition ne correspond pas a votre demande';
  end if;
  if request_row.status = 'closed' then
    raise exception 'Un prestataire a deja ete choisi pour cette demande';
  end if;

  update public.express_request_proposals
  set status = case when id = p_proposal_id then 'selected' else 'declined' end
  where express_request_id = request_row.id;

  -- express_requests.status n'accepte que open/contacted/closed/archived
  -- (contrainte posee par 16-demandes-express-supabase.sql) : 'assigned'
  -- n'existe pas, on utilise 'closed' pour dire "plus de nouvelles
  -- propositions, un prestataire a ete retenu".
  update public.express_requests
  set status = 'closed', updated_at = now()
  where id = request_row.id;

  insert into public.service_requests (
    id, client_access_token, customer_name, customer_phone,
    service_name, city_name, area, notes,
    assigned_provider_id, assigned_provider_name, assigned_provider_phone,
    status, amount
  )
  values (
    new_service_request_id, request_row.client_access_token, request_row.customer_name, request_row.customer_phone,
    request_row.service_name, request_row.city_name, request_row.area, request_row.message,
    proposal_row.provider_id, proposal_row.provider_name, proposal_row.provider_phone,
    'pending_acceptance', coalesce(proposal_row.amount, 0)
  )
  returning * into result_row;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.client_select_proposal(uuid, text) from public;
grant execute on function public.client_select_proposal(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';

-- Si les nouvelles fonctions/colonnes ne sont pas visibles tout de suite
-- (connexion poolee Neon, NOTIFY pas toujours propage) : sur Render, ouvrir
-- le service "bizzi-rest" -> Manual Deploy -> Restart service.

select
  'Zeyds V304 systeme de propositions installe (Neon)' as statut,
  (select count(*) from public.express_requests) as demandes_express_existantes;
