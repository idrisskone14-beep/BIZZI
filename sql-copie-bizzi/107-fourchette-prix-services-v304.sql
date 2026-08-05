-- Zeyds V304 - Fourchette de prix par metier avant publication d'un besoin
--
-- A executer sur NEON (gateway PostgREST auto-heberge), comme le reste du systeme de
-- propositions (105, 106) : express_requests et express_request_proposals vivent sur Neon.
--
-- Principe : agreger les vrais prix deja proposes par des prestataires
-- (express_request_proposals.amount) pour un metier donne, plutot qu'inventer une estimation.
-- Le nom du metier est stocke sur express_requests (pas sur express_request_proposals), d'ou
-- la jointure. Meme seuil de fiabilite que le badge "temps de reponse" (106) : sample_count < 3
-- => le frontend masque l'estimation plutot que d'afficher une fourchette non representative.

create or replace function public.bizzi_service_price_estimate(p_service_name text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'min_amount', min(proposal.amount),
    'max_amount', max(proposal.amount),
    'avg_amount', round(avg(proposal.amount)),
    'sample_count', count(*)
  )
  from public.express_request_proposals proposal
  join public.express_requests request on request.id = proposal.express_request_id
  where request.service_name = p_service_name
    and proposal.amount > 0;
$$;

revoke all on function public.bizzi_service_price_estimate(text) from public;
grant execute on function public.bizzi_service_price_estimate(text) to anon, authenticated;

notify pgrst, 'reload schema';

-- Si la RPC ne repond pas tout de suite : sur Render, service "bizzi-rest" -> Manual Deploy ->
-- Restart service (cache de schema PostgREST, meme souci que 105/106).

select
  'Zeyds V304 fourchette de prix services installee (Neon)' as statut,
  count(*) as propositions_existantes
from public.express_request_proposals;
