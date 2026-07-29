-- Bizzi V89 - Correction definitive activation mois gratuit
-- Objectif :
-- - le bouton "Activer mois gratuit Supabase" doit vraiment passer le prestataire
--   de pending/trial a approved/trial ;
-- - l'action doit rester possible meme si la mise a jour directe RLS ne touche
--   aucune ligne ;
-- - Aly Kouassi et JeanJean sont aussi rattrapes s'ils sont encore pending.

grant usage on schema public to anon, authenticated;
grant select, update on public.providers to authenticated;
grant select, update on public.advertisements to authenticated;
grant select, insert, update on public.provider_services to authenticated;
grant select, insert, update on public.services to authenticated;
grant select, insert, update on public.categories to authenticated;

drop policy if exists "admin full provider services" on public.provider_services;
create policy "admin full provider services"
on public.provider_services
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin full services" on public.services;
create policy "admin full services"
on public.services
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin full categories" on public.categories;
create policy "admin full categories"
on public.categories
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

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

  update public.providers
  set status = 'approved'::provider_status,
      visibility_status = 'trial'::provider_visibility_status,
      trial_started_at = coalesce(trial_started_at, now()),
      trial_ends_at = case
        when trial_ends_at is null or trial_ends_at <= now()
          then now() + interval '30 days'
        else trial_ends_at
      end,
      updated_at = now()
  where id = provider_uuid
  returning
    id,
    full_name,
    phone,
    status,
    visibility_status,
    trial_ends_at
  into provider_row;

  if provider_row.id is null then
    raise exception 'Provider not found: %', provider_uuid;
  end if;

  update public.advertisements
  set status = 'active',
      updated_at = now()
  where provider_id = provider_uuid
    and status = 'pending';

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

-- Rattrapage des deux profils signales comme deja valides par l'admin.
update public.providers
set status = 'approved'::provider_status,
    visibility_status = 'trial'::provider_visibility_status,
    trial_started_at = coalesce(trial_started_at, now()),
    trial_ends_at = case
      when trial_ends_at is null or trial_ends_at <= now()
        then now() + interval '30 days'
      else trial_ends_at
    end,
    updated_at = now()
where status = 'pending'::provider_status
  and (
    phone in ('+2250000000009', '+2250700000007')
    or lower(full_name) in ('aly kouassi', 'jeanjean')
  );

notify pgrst, 'reload schema';

select
  id,
  full_name,
  phone,
  status,
  visibility_status,
  trial_ends_at,
  updated_at
from public.providers
where phone in ('+2250000000009', '+2250700000007')
   or lower(full_name) in ('aly kouassi', 'jeanjean')
order by updated_at desc;
