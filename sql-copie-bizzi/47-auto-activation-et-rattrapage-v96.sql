-- Bizzi V96 - Auto-activation + rattrapage des prestataires en attente
-- A executer une seule fois dans Supabase SQL Editor.
--
-- Ce script installe la fonction d'activation automatique et rattrape les
-- prestataires deja bloques en pending/trial avant la V95/V96.

grant usage on schema public to anon, authenticated;
grant insert on public.providers to anon, authenticated;
grant insert on public.provider_services to anon, authenticated;
grant select on public.cities, public.communes, public.categories, public.services to anon, authenticated;
grant select, update on public.providers to authenticated;
grant select, update on public.advertisements to authenticated;

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
  if provider_uuid is null or nullif(trim(coalesce(provider_phone, '')), '') is null then
    raise exception 'Provider id and phone are required';
  end if;

  update public.providers p
  set status = 'approved'::provider_status,
      visibility_status = 'trial'::provider_visibility_status,
      trial_started_at = coalesce(p.trial_started_at, now()),
      trial_ends_at = case
        when p.trial_ends_at is null or p.trial_ends_at <= now()
          then now() + interval '30 days'
        else p.trial_ends_at
      end,
      updated_at = now()
  where p.id = provider_uuid
    and p.auth_user_id is null
    and p.status = 'pending'::provider_status
    and p.visibility_status = 'trial'::provider_visibility_status
    and regexp_replace(coalesce(p.phone, ''), '\s+', '', 'g') = regexp_replace(provider_phone, '\s+', '', 'g')
  returning
    p.id,
    p.full_name,
    p.phone,
    p.status,
    p.visibility_status,
    p.trial_ends_at
  into provider_row;

  if provider_row.id is null then
    select
      p.id,
      p.full_name,
      p.phone,
      p.status,
      p.visibility_status,
      p.trial_ends_at
    into provider_row
    from public.providers p
    where p.id = provider_uuid
      and p.auth_user_id is null
      and regexp_replace(coalesce(p.phone, ''), '\s+', '', 'g') = regexp_replace(provider_phone, '\s+', '', 'g')
    limit 1;

    if provider_row.id is null then
      raise exception 'Provider not found or phone mismatch';
    end if;

    if provider_row.status <> 'approved'::provider_status then
      raise exception 'Provider not eligible for automatic trial activation';
    end if;
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

with activated as (
  update public.providers p
  set status = 'approved'::provider_status,
      visibility_status = 'trial'::provider_visibility_status,
      trial_started_at = coalesce(p.trial_started_at, now()),
      trial_ends_at = case
        when p.trial_ends_at is null or p.trial_ends_at <= now()
          then now() + interval '30 days'
        else p.trial_ends_at
      end,
      updated_at = now()
  where p.auth_user_id is null
    and p.status = 'pending'::provider_status
    and p.visibility_status = 'trial'::provider_visibility_status
  returning p.id, p.full_name, p.phone, p.status, p.visibility_status, p.trial_ends_at
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
        and p.visibility_status = 'trial'::provider_visibility_status
    )
  returning a.id
)
select
  'auto_activation_installee_et_rattrapage_effectue' as verification,
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
