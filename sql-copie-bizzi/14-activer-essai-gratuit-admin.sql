-- Bizzi - Activation admin du mois gratuit
-- Objectif : permettre a l'admin d'activer un prestataire en essai gratuit
-- sans paiement, pour respecter le mois offert aux nouveaux prestataires.

create or replace function admin_activate_trial_provider(provider_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_name text;
  trial_end timestamptz := now() + interval '30 days';
begin
  if not is_admin() then
    raise exception 'Admin only';
  end if;

  update providers
  set status = 'approved',
      visibility_status = 'trial',
      trial_started_at = coalesce(trial_started_at, now()),
      trial_ends_at = coalesce(trial_ends_at, trial_end),
      updated_at = now()
  where id = provider_uuid
  returning full_name into provider_name;

  if provider_name is null then
    raise exception 'Provider not found';
  end if;

  update advertisements
  set status = 'active',
      updated_at = now()
  where provider_id = provider_uuid
    and status = 'pending'
    and now() between starts_at and ends_at;

  return jsonb_build_object(
    'provider_id', provider_uuid,
    'provider_name', provider_name,
    'visibility_status', 'trial',
    'trial_ends_at', trial_end
  );
end;
$$;

revoke all on function admin_activate_trial_provider(uuid) from public;
grant execute on function admin_activate_trial_provider(uuid) to authenticated;
