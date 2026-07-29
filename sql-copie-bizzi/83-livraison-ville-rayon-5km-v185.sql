-- Bizzi V185 - Dispatch livraison par ville + rayon 5 km
-- Objectif : un livreur indique sa ville a l'inscription, puis recoit seulement
-- les courses payees de cette ville si sa position live est a moins de 5 km du depart.

create extension if not exists pgcrypto;

alter table public.delivery_requests
add column if not exists pickup_latitude double precision,
add column if not exists pickup_longitude double precision,
add column if not exists dropoff_latitude double precision,
add column if not exists dropoff_longitude double precision,
add column if not exists dispatch_radius_km numeric not null default 5;

alter table public.delivery_requests
alter column dispatch_radius_km set default 5;

update public.delivery_requests
set dispatch_radius_km = 5
where status = 'open'
  and coalesce(dispatch_radius_km, 0) <> 5;

create or replace function public.bizzi_city_group_key(p_city text)
returns text
language sql
immutable
as $$
  with normalized as (
    select trim(regexp_replace(lower(translate(coalesce(p_city, ''),
      'àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
      'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'
    )), '[^a-z0-9]+', ' ', 'g')) as value
  )
  select case
    when value in ('abidjan', 'abobo', 'adjame', 'anyama', 'bingerville', 'cocody', 'koumassi', 'marcory', 'port bouet', 'treichville', 'yopougon', 'songon') then 'abidjan'
    when value in ('toute la cote d ivoire', 'autre ville commune', '') then ''
    else value
  end
  from normalized;
$$;

create or replace function public.bizzi_service_group_key(p_service text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(lower(translate(coalesce(p_service, ''),
    'àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
    'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'
  )), '[^a-z0-9]+', ' ', 'g'));
$$;

create or replace function public.bizzi_provider_is_delivery(p_provider_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.provider_services ps
    join public.services s on s.id = ps.service_id
    where ps.provider_id = p_provider_id
      and public.bizzi_service_group_key(s.name) in (
        'bizzi livraison',
        'service livraison',
        'livreur',
        'livraison'
      )
  );
$$;

create or replace function public.bizzi_dispatch_delivery_request(
  p_delivery_id uuid,
  p_limit integer default 5
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  delivery_record record;
  inserted_count integer := 0;
  requested_city_group text := '';
begin
  select *
    into delivery_record
  from public.delivery_requests
  where id = p_delivery_id
    and status = 'open'
    and payment_status = 'approved'
  limit 1;

  if delivery_record.id is null then
    raise exception 'Livraison introuvable, non payee ou deja attribuee';
  end if;

  requested_city_group := public.bizzi_city_group_key(delivery_record.city_name);

  update public.delivery_requests
  set dispatch_status = 'dispatching',
      dispatch_radius_km = 5,
      dispatched_at = coalesce(dispatched_at, now()),
      dispatch_attempts = dispatch_attempts + 1,
      updated_at = now()
  where id = p_delivery_id;

  insert into public.delivery_dispatch_offers(delivery_id, provider_id, distance_km)
  select
    delivery_record.id,
    cl.provider_id,
    public.bizzi_distance_km(delivery_record.pickup_latitude, delivery_record.pickup_longitude, cl.latitude, cl.longitude)
  from public.courier_locations cl
  join public.providers p on p.id = cl.provider_id
  left join public.cities c on c.id = p.city_id
  where cl.is_available = true
    and cl.last_seen_at >= now() - interval '15 minutes'
    and p.status = 'approved'
    and p.visibility_status in ('trial', 'active')
    and public.bizzi_provider_is_delivery(p.id)
    and (
      requested_city_group = ''
      or public.bizzi_city_group_key(c.name) = requested_city_group
    )
    and delivery_record.pickup_latitude is not null
    and delivery_record.pickup_longitude is not null
    and public.bizzi_distance_km(delivery_record.pickup_latitude, delivery_record.pickup_longitude, cl.latitude, cl.longitude) <= 5
  order by
    public.bizzi_distance_km(delivery_record.pickup_latitude, delivery_record.pickup_longitude, cl.latitude, cl.longitude) asc,
    cl.last_seen_at desc
  limit greatest(1, least(coalesce(p_limit, 5), 10))
  on conflict (delivery_id, provider_id) do nothing;

  get diagnostics inserted_count = row_count;

  insert into public.push_notifications(provider_id, title, body, url, payload)
  select
    ddo.provider_id,
    'Nouvelle livraison Bizzi',
    coalesce(delivery_record.pickup_address, 'Départ') || ' vers ' || coalesce(delivery_record.dropoff_address, 'Arrivée'),
    '/index.html#provider',
    jsonb_build_object(
      'delivery_id', delivery_record.id,
      'amount', delivery_record.provider_payout,
      'radius_km', 5,
      'city', delivery_record.city_name
    )
  from public.delivery_dispatch_offers ddo
  where ddo.delivery_id = delivery_record.id
    and ddo.status = 'offered'
    and ddo.created_at >= now() - interval '30 seconds';

  update public.delivery_requests
  set dispatch_status = case when inserted_count > 0 then 'matched' else 'manual_review' end,
      updated_at = now()
  where id = p_delivery_id;

  if inserted_count = 0 then
    insert into public.server_alerts(alert_type, severity, title, message, payload)
    values (
      'dispatch_no_courier_5km',
      'warning',
      'Aucun livreur disponible a 5 km',
      'Aucun livreur live trouve dans la ville et a moins de 5 km pour la livraison ' || p_delivery_id,
      jsonb_build_object('delivery_id', p_delivery_id, 'city', delivery_record.city_name, 'radius_km', 5)
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'delivery_id', p_delivery_id,
    'offers_created', inserted_count,
    'radius_km', 5,
    'city_group', requested_city_group
  );
end;
$$;

select pg_notify('pgrst', 'reload schema');

select
  'Bizzi V185 dispatch ville + rayon 5 km installe' as message,
  count(*) filter (where status = 'open' and payment_status = 'approved') as livraisons_payees_ouvertes,
  count(*) filter (where status = 'open' and payment_status = 'approved' and dispatch_status = 'manual_review') as livraisons_sans_livreur_5km
from public.delivery_requests;
