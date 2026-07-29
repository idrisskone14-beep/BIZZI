-- Bizzi - Fusion categorie Services a la personne V74
-- Objectif : corriger le doublon cree par la difference de majuscule
-- entre "Services à la personne" et "Services à la Personne".
--
-- A executer dans Supabase > SQL Editor > New query si la categorie apparait en double.

begin;

do $$
declare
  canonical_category_id uuid;
  duplicate_category_id uuid;
  duplicate_service record;
  canonical_service_id uuid;
begin
  select id
  into canonical_category_id
  from public.categories
  where name = 'Services à la personne'
  order by created_at asc
  limit 1;

  if canonical_category_id is null then
    insert into public.categories (name, sort_order, is_active)
    values ('Services à la personne', 20, true)
    returning id into canonical_category_id;
  end if;

  for duplicate_category_id in
    select id
    from public.categories
    where regexp_replace(lower(name), '[^a-z0-9]+', '', 'g') = 'servicesalapersonne'
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
end $$;

commit;

-- Controle final : il ne doit rester qu'une categorie active "Services à la personne".
select
  id,
  name,
  sort_order,
  is_active
from public.categories
where regexp_replace(lower(name), '[^a-z0-9]+', '', 'g') = 'servicesalapersonne'
order by is_active desc, created_at asc;
