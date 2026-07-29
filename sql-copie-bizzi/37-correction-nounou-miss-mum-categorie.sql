-- Bizzi - Correction Nounou / Miss Mum V85
-- Objectif :
-- 1. Fusionner les doublons de categorie "Services à la personne".
-- 2. Garder un seul service Nounou officiel.
-- 3. Rattacher Miss Mum au meme Nounou que Maabio.
--
-- A executer dans Supabase > SQL Editor > New query.

begin;

insert into public.categories (name, sort_order, is_active)
values ('Services à la personne', 20, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

do $$
declare
  canonical_category_id uuid;
  duplicate_category_id uuid;
  duplicate_service record;
  canonical_service_id uuid;
  nounou_service_id uuid;
  miss_mum_provider_id uuid;
begin
  select id
  into canonical_category_id
  from public.categories
  where lower(name) = lower('Services à la personne')
  order by
    case when name = 'Services à la personne' then 0 else 1 end,
    is_active desc,
    created_at asc
  limit 1;

  if canonical_category_id is null then
    raise exception 'Categorie Services à la personne introuvable.';
  end if;

  -- Fusionner les categories ecrites avec une variante de majuscule/accent.
  for duplicate_category_id in
    select id
    from public.categories
    where lower(name) like 'services%personne'
      and id <> canonical_category_id
  loop
    for duplicate_service in
      select id, name, sort_order
      from public.services
      where category_id = duplicate_category_id
    loop
      select id
      into canonical_service_id
      from public.services
      where category_id = canonical_category_id
        and lower(name) = lower(duplicate_service.name)
      order by is_active desc, created_at asc
      limit 1;

      if canonical_service_id is null then
        update public.services
        set category_id = canonical_category_id,
            is_active = true,
            updated_at = now()
        where id = duplicate_service.id;
      else
        delete from public.provider_services ps
        where ps.service_id = duplicate_service.id
          and exists (
            select 1
            from public.provider_services existing
            where existing.provider_id = ps.provider_id
              and existing.service_id = canonical_service_id
          );

        update public.provider_services
        set service_id = canonical_service_id
        where service_id = duplicate_service.id;

        update public.services
        set is_active = false,
            updated_at = now()
        where id = duplicate_service.id;
      end if;
    end loop;

    update public.categories
    set is_active = false,
        updated_at = now()
    where id = duplicate_category_id;
  end loop;

  insert into public.services (category_id, name, sort_order, is_active)
  values (canonical_category_id, 'Nounou', 20, true)
  on conflict (category_id, name) do update
  set sort_order = excluded.sort_order,
      is_active = true,
      updated_at = now()
  returning id into nounou_service_id;

  if nounou_service_id is null then
    select id
    into nounou_service_id
    from public.services
    where category_id = canonical_category_id
      and lower(name) = lower('Nounou')
    order by is_active desc, created_at asc
    limit 1;
  end if;

  if nounou_service_id is null then
    raise exception 'Service Nounou introuvable apres correction.';
  end if;

  select p.id
  into miss_mum_provider_id
  from public.providers p
  where p.phone = '0809'
     or regexp_replace(lower(coalesce(p.full_name, '')), '[^a-z0-9]+', '', 'g') like '%missmum%'
  order by
    case when p.phone = '0809' then 0 else 1 end,
    case when p.status = 'approved' then 0 else 1 end,
    case when p.visibility_status in ('trial', 'active') then 0 else 1 end,
    p.created_at desc
  limit 1;

  if miss_mum_provider_id is null then
    raise exception 'Aucun prestataire Miss Mum trouve. Verifiez le nom ou le numero 0809.';
  end if;

  update public.provider_services
  set is_primary = false
  where provider_id = miss_mum_provider_id;

  insert into public.provider_services (provider_id, service_id, is_primary)
  values (miss_mum_provider_id, nounou_service_id, true)
  on conflict (provider_id, service_id) do update
  set is_primary = true;

  update public.providers
  set status = 'approved',
      visibility_status = case
        when visibility_status in ('active', 'trial') then visibility_status
        else 'trial'
      end,
      trial_started_at = coalesce(trial_started_at, now()),
      trial_ends_at = case
        when trial_ends_at is null and visibility_status = 'trial' then now() + interval '30 days'
        else trial_ends_at
      end,
      updated_at = now()
  where id = miss_mum_provider_id;
end $$;

commit;

-- Controle final :
-- Maabio et Miss Mum doivent apparaitre en Nounou dans la meme categorie officielle.
select
  full_name,
  phone,
  service_name,
  category_name,
  visibility_status
from public.public_provider_directory
where service_name = 'Nounou'
   or phone in ('0809', '+2250101010101')
   or lower(full_name) like '%miss%'
   or lower(full_name) like '%maabio%'
order by service_name, full_name;
