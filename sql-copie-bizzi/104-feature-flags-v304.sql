-- Zeyds V304 - Onglets activables/desactivables (feature flags publics)
-- + correction de securite sur 103-super-admin-v304.sql
--
-- A executer sur Supabase, apres 103-super-admin-v304.sql.

-- 1. Correction de securite -------------------------------------------
-- admin_list_all_providers / admin_list_all_clients ne verifiaient que
-- is_admin() alors que ces fonctions sont exclusives au panneau Super
-- Admin (is_super_admin()). Un admin simple pouvait donc appeler ces
-- RPC directement (sans passer par l'UI) et lire l'annuaire complet,
-- telephones clients inclus.

create or replace function public.admin_list_all_providers(
  p_search text default '',
  p_status text default '',
  p_visibility text default '',
  p_after jsonb default '{}'::jsonb,
  p_limit integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  safe_limit integer := least(greatest(coalesce(p_limit, 30), 1), 100);
  search_value text := lower(trim(coalesce(p_search, '')));
  status_value text := lower(trim(coalesce(p_status, '')));
  visibility_value text := lower(trim(coalesce(p_visibility, '')));
  cursor_created timestamptz;
  cursor_id uuid;
  response jsonb;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;

  if coalesce(p_after, '{}'::jsonb) ? 'id' then
    cursor_created := (p_after ->> 'created_at')::timestamptz;
    cursor_id := (p_after ->> 'id')::uuid;
  end if;

  with candidates as (
    select
      p.id,
      p.full_name,
      p.phone,
      p.whatsapp,
      p.email,
      p.status,
      p.visibility_status,
      p.is_verified,
      p.trial_started_at,
      p.trial_ends_at,
      p.subscription_ends_at,
      p.average_rating,
      p.call_count,
      p.created_at,
      c.name as city_name,
      co.name as commune_name,
      p.neighborhood,
      coalesce(primary_service.service_name, 'Metier a preciser') as service_name
    from public.providers p
    left join public.cities c on c.id = p.city_id
    left join public.communes co on co.id = p.commune_id
    left join lateral (
      select s.name as service_name
      from public.provider_services ps
      join public.services s on s.id = ps.service_id
      where ps.provider_id = p.id
      order by ps.is_primary desc, s.name asc
      limit 1
    ) primary_service on true
    where (status_value = '' or lower(p.status::text) = status_value)
      and (visibility_value = '' or lower(p.visibility_status::text) = visibility_value)
      and (
        search_value = ''
        or lower(coalesce(p.full_name, '')) like '%' || search_value || '%'
        or lower(coalesce(p.email, '')) like '%' || search_value || '%'
        or (
          length(public.bizzi_normalize_phone_digits(p_search)) >= 6
          and public.bizzi_normalize_phone_digits(p.phone) like '%' || public.bizzi_normalize_phone_digits(p_search) || '%'
        )
      )
      and (
        cursor_id is null
        or p.created_at < cursor_created
        or (p.created_at = cursor_created and p.id > cursor_id)
      )
    order by p.created_at desc, p.id asc
    limit safe_limit + 1
  ), page as (
    select * from candidates order by created_at desc, id asc limit safe_limit
  ), last_row as (
    select * from page order by created_at asc, id desc limit 1
  )
  select jsonb_build_object(
    'items', coalesce((select jsonb_agg(to_jsonb(item) order by item.created_at desc, item.id asc) from page item), '[]'::jsonb),
    'has_more', (select count(*) > safe_limit from candidates),
    'next_cursor', (select jsonb_build_object('created_at', created_at, 'id', id) from last_row),
    'page_size', safe_limit
  ) into response;

  return coalesce(response, jsonb_build_object('items', '[]'::jsonb, 'has_more', false, 'next_cursor', null, 'page_size', safe_limit));
end;
$$;

create or replace function public.admin_list_all_clients(
  p_search text default '',
  p_after jsonb default '{}'::jsonb,
  p_limit integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  safe_limit integer := least(greatest(coalesce(p_limit, 30), 1), 100);
  search_value text := lower(trim(coalesce(p_search, '')));
  cursor_last_seen timestamptz;
  cursor_phone text;
  response jsonb;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;

  if coalesce(p_after, '{}'::jsonb) ? 'phone' then
    cursor_last_seen := (p_after ->> 'last_seen')::timestamptz;
    cursor_phone := p_after ->> 'phone';
  end if;

  with raw_events as (
    select customer_name, customer_phone, created_at, 'delivery'::text as source
    from public.delivery_requests
    where customer_phone is not null
    union all
    select customer_name, customer_phone, created_at, 'service'::text as source
    from public.service_requests
    where customer_phone is not null
    union all
    select null::text as customer_name, customer_phone, created_at, 'express'::text as source
    from public.express_requests
    where customer_phone is not null
  ), normalized as (
    select
      public.bizzi_normalize_phone_digits(customer_phone) as phone_key,
      customer_name,
      customer_phone,
      created_at,
      source
    from raw_events
    where public.bizzi_normalize_phone_digits(customer_phone) is not null
  ), aggregated as (
    select
      phone_key,
      (array_agg(customer_phone order by created_at desc))[1] as phone,
      (array_agg(customer_name order by created_at desc) filter (where customer_name is not null and trim(customer_name) <> ''))[1] as full_name,
      min(created_at) as first_seen,
      max(created_at) as last_seen,
      count(*) filter (where source = 'delivery') as delivery_count,
      count(*) filter (where source = 'service') as service_count,
      count(*) filter (where source = 'express') as express_count,
      count(*) as total_count
    from normalized
    group by phone_key
  ), candidates as (
    select *
    from aggregated
    where (
        search_value = ''
        or lower(coalesce(full_name, '')) like '%' || search_value || '%'
        or (
          length(public.bizzi_normalize_phone_digits(p_search)) >= 6
          and phone_key like '%' || public.bizzi_normalize_phone_digits(p_search) || '%'
        )
      )
      and (
        cursor_phone is null
        or last_seen < cursor_last_seen
        or (last_seen = cursor_last_seen and phone_key > cursor_phone)
      )
    order by last_seen desc, phone_key asc
    limit safe_limit + 1
  ), page as (
    select * from candidates order by last_seen desc, phone_key asc limit safe_limit
  ), last_row as (
    select * from page order by last_seen asc, phone_key desc limit 1
  )
  select jsonb_build_object(
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'phone', item.phone,
          'full_name', coalesce(item.full_name, 'Client'),
          'first_seen', item.first_seen,
          'last_seen', item.last_seen,
          'delivery_count', item.delivery_count,
          'service_count', item.service_count,
          'express_count', item.express_count,
          'total_count', item.total_count
        )
        order by item.last_seen desc, item.phone_key asc
      )
      from page item
    ), '[]'::jsonb),
    'has_more', (select count(*) > safe_limit from candidates),
    'next_cursor', (select jsonb_build_object('last_seen', last_seen, 'phone', phone_key) from last_row),
    'page_size', safe_limit
  ) into response;

  return coalesce(response, jsonb_build_object('items', '[]'::jsonb, 'has_more', false, 'next_cursor', null, 'page_size', safe_limit));
end;
$$;

-- 2. Onglets activables/desactivables -------------------------------------
-- Reutilise platform_settings (deja cree par 103). Chaque onglet
-- toggleable a une cle tab_<vue> ; absence de cle = active par defaut
-- (cote frontend, un flag manquant n'est jamais traite comme "off").

insert into public.platform_settings (key, value) values
  ('tab_life', 'true'::jsonb),
  ('tab_exception_places', 'true'::jsonb),
  ('tab_delivery', 'true'::jsonb),
  ('tab_food', 'true'::jsonb),
  ('tab_events', 'true'::jsonb),
  ('tab_search', 'true'::jsonb),
  ('tab_jobs', 'true'::jsonb),
  ('tab_provider', 'true'::jsonb)
on conflict (key) do nothing;

-- Lecture publique (necessaire : n'importe quel visiteur, pas seulement
-- les admins, doit savoir quels onglets sont actifs pour construire la
-- navigation). Volontairement restreinte aux cles tab_* uniquement --
-- ne pas etendre a un select=* qui exposerait d'autres reglages.

create or replace function public.public_get_feature_flags()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
  from public.platform_settings
  where key like 'tab_%';
$$;

revoke all on function public.public_get_feature_flags() from public;
grant execute on function public.public_get_feature_flags() to anon, authenticated;

notify pgrst, 'reload schema';

select
  'Zeyds V304 feature flags + correctif securite installes' as statut,
  (select count(*) from public.platform_settings where key like 'tab_%') as onglets_configures;
