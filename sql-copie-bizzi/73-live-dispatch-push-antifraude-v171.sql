-- Bizzi V171 - Live location, dispatch, push, anti-fraude et alertes serveur
-- A executer apres les scripts 71 et 72.
-- Objectif : preparer une logique proche d'une plateforme de livraison temps reel,
-- sans exposer de secrets dans l'application publique.

create extension if not exists pgcrypto;

alter table public.delivery_requests
add column if not exists pickup_latitude double precision,
add column if not exists pickup_longitude double precision,
add column if not exists dropoff_latitude double precision,
add column if not exists dropoff_longitude double precision,
add column if not exists dispatch_status text not null default 'not_dispatched',
add column if not exists dispatched_at timestamptz,
add column if not exists dispatch_radius_km numeric not null default 8,
add column if not exists dispatch_attempts integer not null default 0;

alter table public.delivery_requests
drop constraint if exists delivery_requests_dispatch_status_check;

alter table public.delivery_requests
add constraint delivery_requests_dispatch_status_check
check (dispatch_status in ('not_dispatched', 'dispatching', 'matched', 'expired', 'manual_review'));

create table if not exists public.courier_locations (
  provider_id uuid primary key references public.providers(id) on delete cascade,
  provider_phone text,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_meters numeric,
  is_available boolean not null default true,
  battery_level integer,
  source text not null default 'web',
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_dispatch_offers (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.delivery_requests(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  distance_km numeric,
  status text not null default 'offered',
  expires_at timestamptz not null default (now() + interval '3 minutes'),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (delivery_id, provider_id)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null default 'provider',
  provider_id uuid references public.providers(id) on delete cascade,
  phone text,
  endpoint text not null unique,
  p256dh text,
  auth text,
  user_agent text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.push_notifications (
  id uuid primary key default gen_random_uuid(),
  target_type text not null default 'provider',
  provider_id uuid references public.providers(id) on delete set null,
  phone text,
  title text not null,
  body text,
  url text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.fraud_signals (
  id uuid primary key default gen_random_uuid(),
  signal_type text not null,
  phone text,
  provider_id uuid references public.providers(id) on delete set null,
  severity text not null default 'medium',
  reason text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.server_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null,
  severity text not null default 'info',
  title text not null,
  message text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.courier_locations enable row level security;
alter table public.delivery_dispatch_offers enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.push_notifications enable row level security;
alter table public.fraud_signals enable row level security;
alter table public.server_alerts enable row level security;

create index if not exists idx_courier_locations_available_seen
on public.courier_locations(is_available, last_seen_at desc);

create index if not exists idx_delivery_dispatch_offers_delivery_status
on public.delivery_dispatch_offers(delivery_id, status);

create index if not exists idx_push_notifications_status
on public.push_notifications(status, created_at desc);

create index if not exists idx_fraud_signals_phone_created
on public.fraud_signals(phone, created_at desc);

create index if not exists idx_server_alerts_status_created
on public.server_alerts(status, created_at desc);

create or replace function public.bizzi_distance_km(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
returns numeric
language sql
immutable
as $$
  select case
    when lat1 is null or lon1 is null or lat2 is null or lon2 is null then null
    else round((6371 * acos(
      least(1, greatest(-1,
        cos(radians(lat1)) * cos(radians(lat2)) *
        cos(radians(lon2) - radians(lon1)) +
        sin(radians(lat1)) * sin(radians(lat2))
      ))
    ))::numeric, 2)
  end;
$$;

create or replace function public.bizzi_update_courier_location(
  p_provider_id uuid,
  p_provider_phone text,
  p_latitude double precision,
  p_longitude double precision,
  p_accuracy_meters numeric default null,
  p_battery_level integer default null,
  p_is_available boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_record record;
begin
  select id, phone, full_name, status, visibility_status
    into provider_record
  from public.providers
  where id = p_provider_id
    and regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = regexp_replace(coalesce(p_provider_phone, ''), '[^0-9]', '', 'g')
    and status = 'approved'
    and visibility_status in ('trial', 'active')
  limit 1;

  if provider_record.id is null then
    insert into public.fraud_signals(signal_type, phone, provider_id, severity, reason, payload)
    values ('courier_location_rejected', p_provider_phone, p_provider_id, 'high', 'Position refusee: prestataire introuvable ou non actif', jsonb_build_object('provider_id', p_provider_id));
    raise exception 'Prestataire livreur non autorise';
  end if;

  insert into public.courier_locations (
    provider_id, provider_phone, latitude, longitude, accuracy_meters, battery_level, is_available, last_seen_at, updated_at
  )
  values (
    p_provider_id, p_provider_phone, p_latitude, p_longitude, p_accuracy_meters, p_battery_level, p_is_available, now(), now()
  )
  on conflict (provider_id)
  do update set
    provider_phone = excluded.provider_phone,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    accuracy_meters = excluded.accuracy_meters,
    battery_level = excluded.battery_level,
    is_available = excluded.is_available,
    last_seen_at = now(),
    updated_at = now();

  return jsonb_build_object('ok', true, 'provider_id', p_provider_id, 'last_seen_at', now());
end;
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

  update public.delivery_requests
  set dispatch_status = 'dispatching',
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
  where cl.is_available = true
    and cl.last_seen_at >= now() - interval '15 minutes'
    and p.status = 'approved'
    and p.visibility_status in ('trial', 'active')
    and (
      delivery_record.pickup_latitude is null
      or public.bizzi_distance_km(delivery_record.pickup_latitude, delivery_record.pickup_longitude, cl.latitude, cl.longitude) <= delivery_record.dispatch_radius_km
    )
  order by
    public.bizzi_distance_km(delivery_record.pickup_latitude, delivery_record.pickup_longitude, cl.latitude, cl.longitude) nulls last,
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
    jsonb_build_object('delivery_id', delivery_record.id, 'amount', delivery_record.provider_payout)
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
      'dispatch_no_courier',
      'warning',
      'Aucun livreur disponible',
      'Aucun livreur live trouve pour la livraison ' || p_delivery_id,
      jsonb_build_object('delivery_id', p_delivery_id)
    );
  end if;

  return jsonb_build_object('ok', true, 'delivery_id', p_delivery_id, 'offers_created', inserted_count);
end;
$$;

create or replace function public.bizzi_accept_dispatch_offer(
  p_offer_id uuid,
  p_provider_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  offer_record record;
begin
  select *
    into offer_record
  from public.delivery_dispatch_offers
  where id = p_offer_id
    and provider_id = p_provider_id
    and status = 'offered'
    and expires_at > now()
  limit 1;

  if offer_record.id is null then
    raise exception 'Offre introuvable ou expiree';
  end if;

  perform public.bizzi_accept_delivery_request(offer_record.delivery_id, p_provider_id, null, null);

  update public.delivery_dispatch_offers
  set status = case when provider_id = p_provider_id then 'accepted' else 'expired' end,
      responded_at = case when provider_id = p_provider_id then now() else responded_at end
  where delivery_id = offer_record.delivery_id;

  return jsonb_build_object('ok', true, 'delivery_id', offer_record.delivery_id, 'provider_id', p_provider_id);
end;
$$;

drop policy if exists "admin read courier locations" on public.courier_locations;
create policy "admin read courier locations"
on public.courier_locations for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read dispatch offers" on public.delivery_dispatch_offers;
create policy "admin read dispatch offers"
on public.delivery_dispatch_offers for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read push subscriptions" on public.push_subscriptions;
create policy "admin read push subscriptions"
on public.push_subscriptions for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read push notifications" on public.push_notifications;
create policy "admin read push notifications"
on public.push_notifications for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read fraud signals" on public.fraud_signals;
create policy "admin read fraud signals"
on public.fraud_signals for select
to authenticated
using (public.bizzi_payment_admin_allowed());

drop policy if exists "admin read server alerts" on public.server_alerts;
create policy "admin read server alerts"
on public.server_alerts for select
to authenticated
using (public.bizzi_payment_admin_allowed());

grant select on public.courier_locations to authenticated;
grant select on public.delivery_dispatch_offers to authenticated;
grant select on public.push_subscriptions to authenticated;
grant select on public.push_notifications to authenticated;
grant select on public.fraud_signals to authenticated;
grant select on public.server_alerts to authenticated;

revoke all on function public.bizzi_update_courier_location(uuid, text, double precision, double precision, numeric, integer, boolean) from public;
revoke all on function public.bizzi_dispatch_delivery_request(uuid, integer) from public;
revoke all on function public.bizzi_accept_dispatch_offer(uuid, uuid) from public;

grant execute on function public.bizzi_update_courier_location(uuid, text, double precision, double precision, numeric, integer, boolean) to anon, authenticated;
grant execute on function public.bizzi_dispatch_delivery_request(uuid, integer) to authenticated;
grant execute on function public.bizzi_accept_dispatch_offer(uuid, uuid) to anon, authenticated;

create or replace view public.admin_operations_dashboard as
select
  (select count(*) from public.delivery_requests where status = 'open') as livraisons_ouvertes,
  (select count(*) from public.delivery_requests where payment_status = 'approved' and status = 'open') as livraisons_payees_a_dispatcher,
  (select count(*) from public.courier_locations where is_available = true and last_seen_at >= now() - interval '15 minutes') as livreurs_live,
  (select count(*) from public.delivery_dispatch_offers where status = 'offered' and expires_at > now()) as offres_dispatch_actives,
  (select count(*) from public.push_notifications where status = 'queued') as notifications_en_attente,
  (select count(*) from public.fraud_signals where created_at >= now() - interval '24 hours') as signaux_fraude_24h,
  (select count(*) from public.server_alerts where status = 'open') as alertes_ouvertes,
  now() as generated_at;

grant select on public.admin_operations_dashboard to authenticated;

select
  'Bizzi V171 live dispatch push anti-fraude OK' as statut,
  (select count(*) from public.courier_locations) as positions_livreurs,
  (select count(*) from public.delivery_dispatch_offers) as offres_dispatch,
  (select count(*) from public.push_subscriptions) as abonnements_push,
  (select count(*) from public.server_alerts where status = 'open') as alertes_ouvertes;
