-- Bizzi - Correction metiers Miss Mum et Anissimova V84
-- Objectif : lier les profils deja actifs a leur metier principal
-- sans supprimer les paiements, abonnements, photos ou autres donnees.
--
-- Hypothese validee :
-- - Miss Mum = Nounou
-- - anissimova = Peintre
--
-- A executer dans Supabase > SQL Editor > New query.

insert into public.categories (name, sort_order, is_active)
values
  ('Services à la personne', 20, true),
  ('Maison & Travaux', 10, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into public.services (category_id, name, sort_order, is_active)
select c.id, v.service_name, v.sort_order, true
from (
  values
    ('Services à la personne', 'Nounou', 20),
    ('Maison & Travaux', 'Peintre', 30)
) as v(category_name, service_name, sort_order)
join public.categories c on lower(c.name) = lower(v.category_name)
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;

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
  from public.providers p
  where p.phone = provider_phone
  order by p.created_at desc nulls last
  limit 1;

  if target_provider_id is null then
    raise exception 'Aucun prestataire trouve avec le numero %', provider_phone;
  end if;

  select s.id
  into target_service_id
  from public.services s
  where lower(s.name) = lower(target_service_name)
  order by s.updated_at desc nulls last, s.created_at desc nulls last
  limit 1;

  if target_service_id is null then
    raise exception 'Aucun service trouve avec le nom %', target_service_name;
  end if;

  if target_city_name is not null and length(trim(target_city_name)) > 0 then
    select c.id
    into target_city_id
    from public.cities c
    where lower(c.name) = lower(target_city_name)
    limit 1;

    if target_city_id is null then
      raise exception 'Aucune ville trouvee avec le nom %', target_city_name;
    end if;

    update public.providers
    set city_id = target_city_id,
        updated_at = now()
    where id = target_provider_id;
  end if;

  update public.provider_services
  set is_primary = false
  where provider_id = target_provider_id;

  insert into public.provider_services (provider_id, service_id, is_primary)
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
  from public.providers p
  join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
  join public.services s on s.id = ps.service_id
  left join public.cities c on c.id = p.city_id
  where p.id = target_provider_id;
end;
$$;

grant execute on function public.bizzi_assign_primary_service(text, text, text) to authenticated;

select * from public.bizzi_assign_primary_service(
  '0809',
  'Nounou',
  'Abidjan'
);

select * from public.bizzi_assign_primary_service(
  '+2250908090809',
  'Peintre',
  'Abidjan'
);

-- Controle final : les deux profils doivent ressortir avec leur metier.
select
  full_name,
  phone,
  service_name,
  category_name,
  visibility_status
from public.public_provider_directory
where phone in ('0809', '+2250908090809')
order by full_name;
