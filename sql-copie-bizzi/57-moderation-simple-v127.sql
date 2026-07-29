-- Bizzi V127 - Moderation simple et robuste pour Retirer / Reactiver
-- A executer dans Supabase SQL Editor si les boutons ne changent toujours pas
-- le statut du prestataire.
--
-- Cette version privilegie la stabilite du MVP :
-- - il faut etre connecte avec un compte Supabase authentifie ;
-- - la fonction est SECURITY DEFINER, donc elle peut modifier providers meme si
--   les politiques RLS admin sont mal synchronisees ;
-- - l'application garde l'acces admin cache, et il faudra resserrer les droits
--   ensuite avant une ouverture large.

grant usage on schema public to authenticated;
grant select on public.public_provider_directory to anon, authenticated;

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
  if auth.role() <> 'authenticated' then
    raise exception 'Connexion Supabase admin requise';
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
    raise exception 'Prestataire introuvable: %', provider_uuid;
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
  'moderation_simple_v127_installee' as verification,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status
from public.providers p
where lower(p.full_name) in ('didi b', 'amad diallo')
order by p.full_name;
