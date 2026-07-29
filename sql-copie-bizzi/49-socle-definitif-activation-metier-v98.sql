-- Bizzi V98 - Socle definitif activation + metier
-- A executer une seule fois dans Supabase SQL Editor.
--
-- Ce script remplace les rattrapages separes 47 et 48 :
-- - installe l'activation automatique du mois gratuit ;
-- - rattrape les prestataires deja bloques en pending/trial ;
-- - installe la liaison fiable du metier choisi a la creation ;
-- - reinstalle aussi la fonction admin d'activation pour les cas exceptionnels.

grant usage on schema public to anon, authenticated;
grant select on public.providers, public.categories, public.services to anon, authenticated;
grant insert on public.providers, public.provider_services to anon, authenticated;
grant update on public.providers, public.provider_services, public.advertisements to authenticated;
grant select, insert, update on public.categories, public.services to authenticated;

create or replace function public.bizzi_phone_digits(phone_value text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(phone_value, ''), '[^0-9]', '', 'g');
$$;

create or replace function public.public_activate_provider_trial(
  provider_uuid uuid,
  provider_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_row record;
begin
  if provider_uuid is null or nullif(public.bizzi_phone_digits(provider_phone), '') is null then
    raise exception 'Provider id and phone are required';
  end if;

  update public.providers p
  set status = 'approved'::provider_status,
      visibility_status = case
        when p.visibility_status = 'active'::provider_visibility_status then p.visibility_status
        else 'trial'::provider_visibility_status
      end,
      trial_started_at = coalesce(p.trial_started_at, now()),
      trial_ends_at = case
        when p.visibility_status = 'active'::provider_visibility_status then p.trial_ends_at
        when p.trial_ends_at is null or p.trial_ends_at <= now() then now() + interval '30 days'
        else p.trial_ends_at
      end,
      updated_at = now()
  where p.id = provider_uuid
    and p.auth_user_id is null
    and p.status in ('pending'::provider_status, 'approved'::provider_status)
    and public.bizzi_phone_digits(p.phone) = public.bizzi_phone_digits(provider_phone)
  returning
    p.id,
    p.full_name,
    p.phone,
    p.status,
    p.visibility_status,
    p.trial_ends_at
  into provider_row;

  if provider_row.id is null then
    raise exception 'Provider not found, phone mismatch, or provider not eligible';
  end if;

  update public.advertisements a
  set status = 'active'::advertisement_status,
      updated_at = now()
  where a.provider_id = provider_uuid
    and a.status = 'pending'::advertisement_status;

  return jsonb_build_object(
    'provider_id', provider_row.id,
    'provider_name', provider_row.full_name,
    'phone', provider_row.phone,
    'status', provider_row.status,
    'visibility_status', provider_row.visibility_status,
    'trial_ends_at', provider_row.trial_ends_at
  );
end;
$$;

revoke all on function public.public_activate_provider_trial(uuid, text) from public;
grant execute on function public.public_activate_provider_trial(uuid, text) to anon, authenticated;

create or replace function public.admin_activate_trial_provider(provider_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_row record;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  update public.providers p
  set status = 'approved'::provider_status,
      visibility_status = case
        when p.visibility_status = 'active'::provider_visibility_status then p.visibility_status
        else 'trial'::provider_visibility_status
      end,
      trial_started_at = coalesce(p.trial_started_at, now()),
      trial_ends_at = case
        when p.visibility_status = 'active'::provider_visibility_status then p.trial_ends_at
        when p.trial_ends_at is null or p.trial_ends_at <= now() then now() + interval '30 days'
        else p.trial_ends_at
      end,
      updated_at = now()
  where p.id = provider_uuid
  returning
    p.id,
    p.full_name,
    p.phone,
    p.status,
    p.visibility_status,
    p.trial_ends_at
  into provider_row;

  if provider_row.id is null then
    raise exception 'Provider not found: %', provider_uuid;
  end if;

  update public.advertisements a
  set status = 'active'::advertisement_status,
      updated_at = now()
  where a.provider_id = provider_uuid
    and a.status = 'pending'::advertisement_status;

  return jsonb_build_object(
    'provider_id', provider_row.id,
    'provider_name', provider_row.full_name,
    'phone', provider_row.phone,
    'status', provider_row.status,
    'visibility_status', provider_row.visibility_status,
    'trial_ends_at', provider_row.trial_ends_at
  );
end;
$$;

revoke all on function public.admin_activate_trial_provider(uuid) from public;
grant execute on function public.admin_activate_trial_provider(uuid) to authenticated;

create or replace function public.public_link_provider_service(
  provider_uuid uuid,
  provider_phone text,
  target_service_name text,
  target_category_name text default 'Autres'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_row record;
  category_uuid uuid;
  service_uuid uuid;
  normalized_service text;
  normalized_category text;
begin
  normalized_service := nullif(trim(coalesce(target_service_name, '')), '');
  normalized_category := coalesce(nullif(trim(coalesce(target_category_name, '')), ''), 'Autres');

  if provider_uuid is null or nullif(public.bizzi_phone_digits(provider_phone), '') is null or normalized_service is null then
    raise exception 'Provider id, phone and service are required';
  end if;

  select p.id, p.full_name, p.phone
  into provider_row
  from public.providers p
  where p.id = provider_uuid
    and p.auth_user_id is null
    and public.bizzi_phone_digits(p.phone) = public.bizzi_phone_digits(provider_phone)
  limit 1;

  if provider_row.id is null then
    raise exception 'Provider not found or phone mismatch';
  end if;

  select s.id
  into service_uuid
  from public.services s
  where lower(regexp_replace(s.name, '\s+', ' ', 'g')) = lower(regexp_replace(normalized_service, '\s+', ' ', 'g'))
  order by s.is_active desc, s.sort_order asc, s.created_at asc
  limit 1;

  if service_uuid is null then
    insert into public.categories (name, sort_order, is_active)
    values (normalized_category, 900, true)
    on conflict (name) do update
    set is_active = true,
        updated_at = now()
    returning id into category_uuid;

    insert into public.services (category_id, name, sort_order, is_active)
    values (category_uuid, normalized_service, 900, true)
    on conflict (category_id, name) do update
    set is_active = true,
        updated_at = now()
    returning id into service_uuid;
  end if;

  update public.provider_services
  set is_primary = false
  where provider_id = provider_uuid;

  insert into public.provider_services (provider_id, service_id, is_primary)
  values (provider_uuid, service_uuid, true)
  on conflict (provider_id, service_id) do update
  set is_primary = true;

  return jsonb_build_object(
    'provider_id', provider_row.id,
    'provider_name', provider_row.full_name,
    'service_id', service_uuid,
    'service_name', normalized_service,
    'category_name', normalized_category
  );
end;
$$;

revoke all on function public.public_link_provider_service(uuid, text, text, text) from public;
grant execute on function public.public_link_provider_service(uuid, text, text, text) to anon, authenticated;

with activated as (
  update public.providers p
  set status = 'approved'::provider_status,
      visibility_status = 'trial'::provider_visibility_status,
      trial_started_at = coalesce(p.trial_started_at, now()),
      trial_ends_at = case
        when p.trial_ends_at is null or p.trial_ends_at <= now() then now() + interval '30 days'
        else p.trial_ends_at
      end,
      updated_at = now()
  where p.auth_user_id is null
    and p.status = 'pending'::provider_status
    and p.visibility_status = 'trial'::provider_visibility_status
  returning p.id
),
activated_ads as (
  update public.advertisements a
  set status = 'active'::advertisement_status,
      updated_at = now()
  where a.status = 'pending'::advertisement_status
    and exists (
      select 1
      from public.providers p
      where p.id = a.provider_id
        and p.status = 'approved'::provider_status
        and p.visibility_status in ('trial'::provider_visibility_status, 'active'::provider_visibility_status)
    )
  returning a.id
)
select
  'socle_definitif_activation_metier_installe' as verification,
  (select count(*) from activated) as prestataires_rattrapes,
  (select count(*) from activated_ads) as publicites_activees;

notify pgrst, 'reload schema';

select
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  p.trial_ends_at,
  coalesce(s.name, 'Metier non lie') as service_name,
  p.updated_at
from public.providers p
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
where p.auth_user_id is null
order by p.updated_at desc
limit 20;
