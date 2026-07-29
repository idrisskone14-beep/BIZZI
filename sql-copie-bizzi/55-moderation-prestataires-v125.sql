-- Bizzi V125 - Moderation fiable des prestataires cote admin
-- A executer une seule fois dans Supabase SQL Editor si Retirer/Reactiver
-- ne confirme pas correctement le statut du prestataire.

grant usage on schema public to authenticated;
grant select, update on public.providers to authenticated;
grant select, update on public.advertisements to authenticated;
grant select on public.public_provider_directory to anon, authenticated;

drop policy if exists "admin full providers" on public.providers;
create policy "admin full providers"
on public.providers
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin full advertisements" on public.advertisements;
create policy "admin full advertisements"
on public.advertisements
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

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
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  if make_visible then
    update public.providers p
    set status = 'approved'::provider_status,
        visibility_status = 'trial'::provider_visibility_status,
        trial_started_at = coalesce(p.trial_started_at, now()),
        trial_ends_at = case
          when p.trial_ends_at is null or p.trial_ends_at <= now()
            then now() + interval '30 days'
          else p.trial_ends_at
        end,
        subscription_ends_at = null,
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
  'moderation_prestataires_v125_installee' as verification,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status
from public.providers p
where lower(p.full_name) in ('didi b', 'amad diallo')
order by p.full_name;
