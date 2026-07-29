-- Bizzi V187 - Correctif si erreur "column p.boost_ends_at does not exist"
-- A executer si le script 84 s'est arrete sur public_provider_directory.

alter table public.providers
add column if not exists boost_ends_at timestamptz,
add column if not exists delivery_penalty_rate numeric not null default 0,
add column if not exists delivery_penalty_remaining integer not null default 0,
add column if not exists delivery_penalty_until timestamptz,
add column if not exists delivery_penalty_reason text,
add column if not exists delivery_cancel_count integer not null default 0;

create or replace view public.public_provider_directory as
select
  p.id,
  case
    when p.visibility_status in ('trial', 'active') then p.full_name
    else null
  end as full_name,
  case
    when p.visibility_status in ('trial', 'active') then p.phone
    else null
  end as phone,
  case
    when p.visibility_status in ('trial', 'active') then p.whatsapp
    else null
  end as whatsapp,
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
  coalesce(s.name, nullif(trim(p.requested_service_name), ''), 'Metier a preciser') as service_name,
  coalesce(cat.name, nullif(trim(p.requested_category_name), ''), 'Autres') as category_name,
  case
    when p.visibility_status in ('trial', 'active') then true
    else false
  end as contact_visible,
  p.review_count,
  p.trial_ends_at,
  p.subscription_ends_at,
  p.requested_service_name,
  p.requested_category_name,
  p.boost_ends_at,
  p.delivery_penalty_rate,
  p.delivery_penalty_remaining,
  p.delivery_penalty_until,
  p.delivery_penalty_reason,
  p.delivery_cancel_count
from public.providers p
left join public.cities c on c.id = p.city_id
left join public.communes co on co.id = p.commune_id
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
left join public.categories cat on cat.id = s.category_id
where p.status = 'approved'
  and p.visibility_status in ('trial', 'active');

revoke all on function public.bizzi_delivery_customer_check_matches(uuid, text) from public;
revoke all on function public.bizzi_cancel_delivery_by_client(uuid, text, text) from public;
revoke all on function public.bizzi_request_provider_delivery_cancellation(uuid, uuid, text) from public;
revoke all on function public.bizzi_review_provider_delivery_cancellation(uuid, boolean, text) from public;
revoke all on function public.bizzi_accept_delivery_request(uuid, uuid, text, text) from public;

grant execute on function public.bizzi_delivery_customer_check_matches(uuid, text) to anon, authenticated;
grant execute on function public.bizzi_cancel_delivery_by_client(uuid, text, text) to anon, authenticated;
grant execute on function public.bizzi_request_provider_delivery_cancellation(uuid, uuid, text) to anon, authenticated;
grant execute on function public.bizzi_review_provider_delivery_cancellation(uuid, boolean, text) to authenticated;
grant execute on function public.bizzi_accept_delivery_request(uuid, uuid, text, text) to anon, authenticated;
grant select on public.public_provider_directory to anon, authenticated;

select
  'Correctif V187 boost_ends_at applique' as message,
  count(*) as prestataires_lisibles
from public.public_provider_directory;
