-- Bizzi V97 - Liaison fiable du metier lors de la creation prestataire
-- A executer une seule fois dans Supabase SQL Editor.
--
-- Objectif :
-- - si le prestataire choisit un metier dans le formulaire, ce metier reste lie
--   dans Supabase ;
-- - la fonction verifie l'id + le telephone du prestataire avant de modifier
--   provider_services ;
-- - si le service existe dans une categorie differente ou avec une casse
--   differente, la fonction le retrouve.

grant usage on schema public to anon, authenticated;
grant select on public.providers, public.categories, public.services to anon, authenticated;
grant insert, update on public.provider_services to anon, authenticated;

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
  normalized_category := nullif(trim(coalesce(target_category_name, '')), '');

  if provider_uuid is null or nullif(trim(coalesce(provider_phone, '')), '') is null or normalized_service is null then
    raise exception 'Provider id, phone and service are required';
  end if;

  select p.id, p.full_name, p.phone
  into provider_row
  from public.providers p
  where p.id = provider_uuid
    and p.auth_user_id is null
    and regexp_replace(coalesce(p.phone, ''), '\s+', '', 'g') = regexp_replace(provider_phone, '\s+', '', 'g')
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
    values (coalesce(normalized_category, 'Autres'), 900, true)
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
    'category_name', coalesce(normalized_category, 'Autres')
  );
end;
$$;

revoke all on function public.public_link_provider_service(uuid, text, text, text) from public;
grant execute on function public.public_link_provider_service(uuid, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

select
  'public_link_provider_service installee' as verification,
  routine_schema,
  routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'public_link_provider_service';
