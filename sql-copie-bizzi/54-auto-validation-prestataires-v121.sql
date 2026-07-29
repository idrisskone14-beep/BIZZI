-- Bizzi V121 - Auto-validation definitive des nouveaux prestataires
-- A executer une seule fois dans Supabase SQL Editor.
--
-- Nouvelle regle simple :
-- - un prestataire cree depuis l'application est insere en pending/trial
--   pour respecter la securite RLS publique ;
-- - Supabase le bascule automatiquement en approved/trial juste apres insertion ;
-- - l'admin garde le pouvoir de le retirer ensuite en le passant en
--   suspended/hidden depuis l'application.

grant usage on schema public to anon, authenticated;
grant insert on public.providers to anon, authenticated;
grant insert on public.provider_services to anon, authenticated;
grant select on public.cities, public.categories, public.services to anon, authenticated;
grant select on public.public_provider_directory to anon, authenticated;
grant select, update on public.providers to authenticated;

drop policy if exists "public submit pending provider" on public.providers;
drop policy if exists "public submit pending provider simple" on public.providers;

create policy "public submit pending provider simple"
on public.providers
as permissive
for insert
to public
with check (
  auth_user_id is null
  and status = 'pending'::provider_status
  and visibility_status = 'trial'::provider_visibility_status
);

create or replace function public.bizzi_auto_approve_new_provider()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.auth_user_id is null
     and new.status = 'pending'::provider_status
     and new.visibility_status = 'trial'::provider_visibility_status then
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
    where p.id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists bizzi_auto_approve_new_provider_after_insert on public.providers;

create trigger bizzi_auto_approve_new_provider_after_insert
after insert on public.providers
for each row
execute function public.bizzi_auto_approve_new_provider();

-- Rattrapage des prestataires deja crees mais encore en attente.
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
  and p.visibility_status = 'trial'::provider_visibility_status;

notify pgrst, 'reload schema';

select
  'auto_validation_prestataires_v121_installee' as verification,
  count(*) filter (
    where status = 'approved'::provider_status
      and visibility_status = 'trial'::provider_visibility_status
  ) as prestataires_visibles_trial
from public.providers;
