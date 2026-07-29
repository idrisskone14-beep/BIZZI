-- Bizzi V187 - Livraison verrouillee, annulation motivee et penalite livreur
-- Regle :
-- 1. Une course acceptee est verrouillee pour le livreur.
-- 2. Le client peut annuler avec motif.
-- 3. Le livreur peut seulement signaler un probleme.
-- 4. L'admin libere la course avec ou sans penalite.
-- 5. Si penalite : commission Bizzi 18% sur les 3 prochaines courses ou 7 jours.

alter table public.delivery_requests
add column if not exists cancellation_status text,
add column if not exists cancellation_reason text,
add column if not exists cancelled_by text,
add column if not exists cancelled_at timestamptz,
add column if not exists provider_cancel_reason text,
add column if not exists provider_cancel_requested_at timestamptz,
add column if not exists provider_cancel_review text,
add column if not exists provider_cancel_reviewed_at timestamptz,
add column if not exists provider_cancel_penalty_applied_at timestamptz;

alter table public.providers
add column if not exists delivery_penalty_rate numeric not null default 0,
add column if not exists delivery_penalty_remaining integer not null default 0,
add column if not exists delivery_penalty_until timestamptz,
add column if not exists delivery_penalty_reason text,
add column if not exists delivery_cancel_count integer not null default 0,
add column if not exists boost_ends_at timestamptz;

alter table public.delivery_requests
drop constraint if exists delivery_requests_cancellation_status_check;

alter table public.delivery_requests
add constraint delivery_requests_cancellation_status_check
check (
  cancellation_status is null
  or cancellation_status in (
    'client_cancelled',
    'provider_requested',
    'provider_justified',
    'provider_penalized'
  )
);

create index if not exists idx_delivery_requests_cancellation_status
on public.delivery_requests(cancellation_status, status, created_at desc);

create index if not exists idx_providers_delivery_penalty
on public.providers(delivery_penalty_remaining, delivery_penalty_until);

create or replace function public.bizzi_delivery_customer_check_matches(
  p_delivery_id uuid,
  p_customer_check text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  delivery_record record;
  cleaned_check text := regexp_replace(coalesce(p_customer_check, ''), '[^0-9A-Za-z]+', '', 'g');
  cleaned_phone text;
  cleaned_ref text;
begin
  select customer_phone, transaction_reference
    into delivery_record
  from public.delivery_requests
  where id = p_delivery_id
  limit 1;

  if not found then
    return false;
  end if;

  if cleaned_check = '' then
    return true;
  end if;

  cleaned_phone := regexp_replace(coalesce(delivery_record.customer_phone, ''), '[^0-9A-Za-z]+', '', 'g');
  cleaned_ref := regexp_replace(coalesce(delivery_record.transaction_reference, ''), '[^0-9A-Za-z]+', '', 'g');

  return cleaned_check = cleaned_ref
    or right(cleaned_phone, least(6, length(cleaned_phone))) = right(cleaned_check, least(6, length(cleaned_check)));
end;
$$;

create or replace function public.bizzi_cancel_delivery_by_client(
  p_delivery_id uuid,
  p_reason text,
  p_customer_check text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'Motif annulation requis';
  end if;

  if not public.bizzi_delivery_customer_check_matches(p_delivery_id, p_customer_check) then
    raise exception 'Telephone ou reference client incorrect';
  end if;

  update public.delivery_requests
  set status = 'cancelled',
      cancellation_status = 'client_cancelled',
      cancellation_reason = trim(p_reason),
      cancelled_by = 'client',
      cancelled_at = coalesce(cancelled_at, now()),
      payout_status = 'blocked',
      dispatch_status = 'expired',
      updated_at = now()
  where id = p_delivery_id
    and status in ('open', 'assigned');

  if not found then
    raise exception 'Livraison introuvable ou non annulable';
  end if;
end;
$$;

create or replace function public.bizzi_request_provider_delivery_cancellation(
  p_delivery_id uuid,
  p_provider_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'Motif prestataire requis';
  end if;

  update public.delivery_requests
  set cancellation_status = 'provider_requested',
      provider_cancel_reason = trim(p_reason),
      provider_cancel_requested_at = coalesce(provider_cancel_requested_at, now()),
      updated_at = now()
  where id = p_delivery_id
    and status = 'assigned'
    and assigned_provider_id = p_provider_id;

  if not found then
    raise exception 'Livraison non attribuee a ce prestataire';
  end if;
end;
$$;

create or replace function public.bizzi_review_provider_delivery_cancellation(
  p_delivery_id uuid,
  p_penalize boolean default false,
  p_admin_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  delivery_record record;
begin
  if not public.is_admin() then
    raise exception 'Compte admin Bizzi requis';
  end if;

  select *
    into delivery_record
  from public.delivery_requests
  where id = p_delivery_id
    and status = 'assigned'
    and cancellation_status = 'provider_requested'
  limit 1;

  if not found then
    raise exception 'Aucune demande annulation prestataire a examiner';
  end if;

  if p_penalize and delivery_record.assigned_provider_id is not null then
    update public.providers
    set delivery_penalty_rate = 0.18,
        delivery_penalty_remaining = greatest(coalesce(delivery_penalty_remaining, 0), 3),
        delivery_penalty_until = greatest(coalesce(delivery_penalty_until, now()), now() + interval '7 days'),
        delivery_penalty_reason = coalesce(nullif(trim(p_admin_note), ''), delivery_record.provider_cancel_reason, 'Annulation prestataire injustifiee'),
        delivery_cancel_count = coalesce(delivery_cancel_count, 0) + 1,
        updated_at = now()
    where id = delivery_record.assigned_provider_id;
  end if;

  update public.delivery_requests
  set status = 'open',
      assigned_provider_id = null,
      assigned_provider_name = null,
      assigned_provider_phone = null,
      accepted_at = null,
      payout_status = 'pending',
      dispatch_status = 'not_dispatched',
      cancellation_status = case when p_penalize then 'provider_penalized' else 'provider_justified' end,
      provider_cancel_review = case when p_penalize then 'penalty_18' else 'justified' end,
      provider_cancel_reviewed_at = now(),
      provider_cancel_penalty_applied_at = case when p_penalize then now() else provider_cancel_penalty_applied_at end,
      updated_at = now()
  where id = p_delivery_id;

  return jsonb_build_object(
    'ok', true,
    'penalized', p_penalize,
    'delivery_id', p_delivery_id,
    'provider_id', delivery_record.assigned_provider_id
  );
end;
$$;

create or replace function public.bizzi_accept_delivery_request(
  p_delivery_id uuid,
  p_provider_id uuid,
  p_provider_name text default null,
  p_provider_phone text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_record record;
  selected_rate numeric := 0.15;
  delivery_amount numeric := 0;
  selected_commission numeric := 0;
begin
  select p.id, p.full_name, p.phone, p.delivery_penalty_remaining, p.delivery_penalty_until
    into provider_record
  from public.providers p
  join public.provider_services ps on ps.provider_id = p.id
  join public.services s on s.id = ps.service_id
  where p.id = p_provider_id
    and p.status = 'approved'
    and p.visibility_status in ('trial', 'active')
    and s.name in (
      'Bizzi Livraison',
      'Courses / achats à domicile',
      'Chauffeur',
      'Transport de marchandises',
      'Transport de colis international',
      'Conducteur moto-taxi',
      'Livreur de gaz en bouteille',
      'Livraison médicaments'
    )
  limit 1;

  if not found then
    raise exception 'Prestataire livraison non actif ou non compatible';
  end if;

  if coalesce(provider_record.delivery_penalty_remaining, 0) > 0
     or coalesce(provider_record.delivery_penalty_until, '-infinity'::timestamptz) > now() then
    selected_rate := 0.18;
  end if;

  select coalesce(amount, 0)
    into delivery_amount
  from public.delivery_requests
  where id = p_delivery_id
    and status = 'open'
    and payment_status = 'approved'
  limit 1;

  if not found then
    raise exception 'Livraison non payee, deja acceptee, cloturee ou introuvable';
  end if;

  selected_commission := round(delivery_amount * selected_rate);

  update public.delivery_requests
  set status = 'assigned',
      assigned_provider_id = provider_record.id,
      assigned_provider_name = coalesce(nullif(p_provider_name, ''), provider_record.full_name),
      assigned_provider_phone = coalesce(nullif(p_provider_phone, ''), provider_record.phone),
      commission_rate = selected_rate,
      bizzi_commission = selected_commission,
      provider_payout = greatest(0, delivery_amount - selected_commission),
      cancellation_status = null,
      accepted_at = coalesce(accepted_at, now()),
      updated_at = now()
  where id = p_delivery_id
    and status = 'open'
    and payment_status = 'approved';

  if selected_rate > 0.15 then
    update public.providers
    set delivery_penalty_remaining = greatest(0, coalesce(delivery_penalty_remaining, 0) - 1),
        delivery_penalty_rate = case when greatest(0, coalesce(delivery_penalty_remaining, 0) - 1) = 0 then 0 else delivery_penalty_rate end,
        delivery_penalty_until = case when greatest(0, coalesce(delivery_penalty_remaining, 0) - 1) = 0 then null else delivery_penalty_until end,
        updated_at = now()
    where id = provider_record.id;
  end if;
end;
$$;

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
  'Bizzi V187 livraison verrouillee installee' as message,
  count(*) filter (where status = 'assigned') as livraisons_verrouillees,
  count(*) filter (where cancellation_status = 'provider_requested') as annulations_prestataires_a_examiner
from public.delivery_requests;
