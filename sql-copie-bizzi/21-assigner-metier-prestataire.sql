-- Bizzi - Assigner un metier a un prestataire
-- Objectif : ajouter ou corriger le metier principal d'un prestataire
-- sans manipuler les tables a la main.
--
-- A executer dans Supabase > SQL Editor > New query.

create or replace function public.bizzi_assign_primary_service(
  provider_phone text,
  target_service_name text,
  target_city_name text default null
)
returns table (
  provider_name text,
  phone text,
  service_name text,
  city_name text,
  visibility_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_provider_id uuid;
  target_service_id uuid;
  target_city_id uuid;
begin
  select p.id
  into target_provider_id
  from providers p
  where p.phone = provider_phone
  limit 1;

  if target_provider_id is null then
    raise exception 'Aucun prestataire trouve avec le numero %', provider_phone;
  end if;

  select s.id
  into target_service_id
  from services s
  where lower(s.name) = lower(target_service_name)
  limit 1;

  if target_service_id is null then
    raise exception 'Aucun service trouve avec le nom %', target_service_name;
  end if;

  if target_city_name is not null and length(trim(target_city_name)) > 0 then
    select c.id
    into target_city_id
    from cities c
    where lower(c.name) = lower(target_city_name)
    limit 1;

    if target_city_id is null then
      raise exception 'Aucune ville trouvee avec le nom %', target_city_name;
    end if;

    update providers
    set city_id = target_city_id,
        updated_at = now()
    where id = target_provider_id;
  end if;

  update provider_services
  set is_primary = false
  where provider_id = target_provider_id;

  insert into provider_services (provider_id, service_id, is_primary)
  values (target_provider_id, target_service_id, true)
  on conflict (provider_id, service_id) do update
  set is_primary = true;

  return query
  select
    p.full_name,
    p.phone,
    s.name,
    c.name,
    p.visibility_status::text
  from providers p
  join provider_services ps on ps.provider_id = p.id and ps.is_primary = true
  join services s on s.id = ps.service_id
  left join cities c on c.id = p.city_id
  where p.id = target_provider_id;
end;
$$;

grant execute on function public.bizzi_assign_primary_service(text, text, text) to authenticated;

-- Correction connue :
select * from public.bizzi_assign_primary_service(
  '+2253333',
  'Transport de colis international',
  'Abidjan'
);

-- Exemples pour les autres prestataires a completer :
-- Remplace le metier par le bon service exact, puis enleve les deux tirets au debut.
--
-- select * from public.bizzi_assign_primary_service('+2250700009999', 'METIER_DE_JEAN_FRANCOIS', 'Abidjan');
-- select * from public.bizzi_assign_primary_service('+22548839544', 'METIER_DE_AMIR_BAKAYOKO', 'Abidjan');
-- select * from public.bizzi_assign_primary_service('+2250100232139', 'METIER_DU_TEST_MINIMAL', 'Abidjan');
