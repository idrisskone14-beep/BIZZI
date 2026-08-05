-- Zeyds V304 - Temps de reponse moyen des prestataires (badge "Repond en ~X min")
--
-- A executer sur NEON (gateway PostgREST auto-heberge), comme le reste du systeme de
-- propositions (105-propositions-services-v304.sql) : providers, express_requests et
-- express_request_proposals vivent tous sur Neon, pas Supabase.
--
-- Principe : mesurer le vrai delai entre la publication d'un besoin (express_requests.
-- created_at) et la reponse d'un prestataire (express_request_proposals.created_at), plutot
-- qu'inventer une estimation. Stocke en moyenne glissante sur public.providers pour que
-- bizzi_search_public_providers reste rapide (colonne lue directement, pas de sous-requete
-- par ligne).

alter table public.providers
  add column if not exists avg_response_seconds integer,
  add column if not exists response_sample_count integer not null default 0;

-- 1. Trigger : met a jour la moyenne glissante a chaque nouvelle proposition -----------------
-- Ne se declenche pas sur "on conflict do update" (edition d'une proposition existante) :
-- Postgres ne relance pas le trigger AFTER INSERT pour les lignes qui passent par le chemin
-- de conflit, ce qui est le comportement voulu (on ne compte que la premiere reponse).

create or replace function public.bizzi_track_proposal_response_time()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  request_created_at timestamptz;
  response_delta integer;
begin
  select created_at into request_created_at
  from public.express_requests
  where id = new.express_request_id;

  if request_created_at is null then
    return new;
  end if;

  response_delta := greatest(1, extract(epoch from (new.created_at - request_created_at))::integer);

  update public.providers
  set avg_response_seconds = case
        when response_sample_count = 0 then response_delta
        else round((avg_response_seconds::numeric * response_sample_count + response_delta) / (response_sample_count + 1))::integer
      end,
      response_sample_count = response_sample_count + 1
  where id = new.provider_id;

  return new;
end;
$$;

drop trigger if exists bizzi_track_proposal_response_time_trigger on public.express_request_proposals;
create trigger bizzi_track_proposal_response_time_trigger
after insert on public.express_request_proposals
for each row execute function public.bizzi_track_proposal_response_time();

-- 2. Exposer les deux colonnes dans l'annuaire public ----------------------------------------
-- Copie de bizzi_search_public_providers (93-correction-recherche-metiers-v271.sql) avec
-- avg_response_seconds/response_sample_count ajoutes a la CTE candidates. Comme la sortie
-- finale se construit via to_jsonb(item) sur toute la ligne, ajouter les colonnes ici suffit :
-- rien d'autre a changer dans la fonction.

create or replace function public.bizzi_search_public_providers(
  p_search text default '',
  p_city text default '',
  p_service text default '',
  p_verified_only boolean default false,
  p_emergency_only boolean default false,
  p_after jsonb default '{}'::jsonb,
  p_limit integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
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
      p.avg_response_seconds,
      p.response_sample_count,
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
$$;

revoke all on function public.bizzi_search_public_providers(text, text, text, boolean, boolean, jsonb, integer) from public;
grant execute on function public.bizzi_search_public_providers(text, text, text, boolean, boolean, jsonb, integer) to anon, authenticated;

notify pgrst, 'reload schema';

-- Si le badge ne se met pas a jour tout de suite apres avoir soumis des propositions de test :
-- sur Render, service "bizzi-rest" -> Manual Deploy -> Restart service (cache de schema
-- PostgREST, meme souci que 105-propositions-services-v304.sql).

select
  'Zeyds V304 temps de reponse prestataires installe (Neon)' as statut,
  count(*) filter (where response_sample_count > 0) as prestataires_avec_historique
from public.providers;
