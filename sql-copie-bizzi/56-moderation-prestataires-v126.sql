-- Bizzi V126 - Correction approfondie Retirer / Reactiver cote client
-- A executer une seule fois dans Supabase SQL Editor.
--
-- Objectif :
-- - rendre l'action admin fiable meme si le profil admin Supabase est mal relie ;
-- - retirer un prestataire avec status=suspended + visibility_status=hidden ;
-- - reactiver un prestataire avec status=approved + visibility_status=trial/active ;
-- - retourner le statut modifie a l'application pour eviter les faux boutons.

grant usage on schema public to anon, authenticated;
grant select, update on public.providers to authenticated;
grant select, update on public.advertisements to authenticated;
grant select on public.public_provider_directory to anon, authenticated;

create or replace function public.bizzi_admin_request_allowed()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  request_uid uuid := auth.uid();
  request_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if request_email in ('contact@bizzi-africa.com', 'support@bizzi-africa.com') then
    return true;
  end if;

  if request_uid is not null and exists (
    select 1
    from public.admin_profiles ap
    where ap.auth_user_id = request_uid
      and ap.is_active = true
      and lower(coalesce(ap.role, '')) in ('admin', 'owner', 'super_admin')
  ) then
    return true;
  end if;

  return false;
exception
  when undefined_table then
    return request_email in ('contact@bizzi-africa.com', 'support@bizzi-africa.com');
end;
$$;

revoke all on function public.bizzi_admin_request_allowed() from public;
grant execute on function public.bizzi_admin_request_allowed() to anon, authenticated;

drop policy if exists "admin full providers" on public.providers;
create policy "admin full providers"
on public.providers
as permissive
for all
to authenticated
using (public.bizzi_admin_request_allowed())
with check (public.bizzi_admin_request_allowed());

drop policy if exists "admin full advertisements" on public.advertisements;
create policy "admin full advertisements"
on public.advertisements
as permissive
for all
to authenticated
using (public.bizzi_admin_request_allowed())
with check (public.bizzi_admin_request_allowed());

create or replace function public.admin_set_provider_visibility(
  provider_uuid uuid,
  make_visible boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_row record;
begin
  if not public.bizzi_admin_request_allowed() then
    raise exception 'Admin only';
  end if;

  if make_visible then
    update public.providers p
    set status = 'approved'::provider_status,
        visibility_status = case
          when p.subscription_ends_at is not null and p.subscription_ends_at > now()
            then 'active'::provider_visibility_status
          else 'trial'::provider_visibility_status
        end,
        trial_started_at = coalesce(p.trial_started_at, now()),
        trial_ends_at = case
          when p.subscription_ends_at is not null and p.subscription_ends_at > now()
            then p.trial_ends_at
          when p.trial_ends_at is null or p.trial_ends_at <= now()
            then now() + interval '30 days'
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
      p.trial_ends_at,
      p.subscription_ends_at
    into provider_row;
  else
    update public.providers p
    set status = 'suspended'::provider_status,
        visibility_status = 'hidden'::provider_visibility_status,
        updated_at = now()
    where p.id = provider_uuid
    returning
      p.id,
      p.full_name,
      p.phone,
      p.status,
      p.visibility_status,
      p.trial_ends_at,
      p.subscription_ends_at
    into provider_row;

    update public.advertisements
    set status = 'rejected',
        updated_at = now()
    where provider_id = provider_uuid
      and status = 'active';
  end if;

  if provider_row.id is null then
    raise exception 'Provider not found: %', provider_uuid;
  end if;

  return jsonb_build_object(
    'provider_id', provider_row.id,
    'provider_name', provider_row.full_name,
    'phone', provider_row.phone,
    'status', provider_row.status,
    'visibility_status', provider_row.visibility_status,
    'trial_ends_at', provider_row.trial_ends_at,
    'subscription_ends_at', provider_row.subscription_ends_at
  );
end;
$$;

revoke all on function public.admin_set_provider_visibility(uuid, boolean) from public;
grant execute on function public.admin_set_provider_visibility(uuid, boolean) to authenticated;

notify pgrst, 'reload schema';

select
  'moderation_prestataires_v126_installee' as verification,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status
from public.providers p
where lower(p.full_name) in ('didi b', 'amad diallo')
order by p.full_name;
