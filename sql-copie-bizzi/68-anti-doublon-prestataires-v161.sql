-- Bizzi V161 - Anti-doublon prestataires
-- Objectif : empecher qu'un meme numero obtienne plusieurs mois gratuits
-- meme si le numero est saisi avec espaces, tirets ou sans le signe +.

create or replace function public.bizzi_normalize_phone_digits(raw_phone text)
returns text
language sql
immutable
as $$
  select nullif(regexp_replace(coalesce(raw_phone, ''), '\D', '', 'g'), '');
$$;

create or replace function public.bizzi_block_duplicate_provider_phone()
returns trigger
language plpgsql
as $$
declare
  clean_phone text;
  existing_provider record;
begin
  clean_phone := public.bizzi_normalize_phone_digits(new.phone);

  if clean_phone is null then
    return new;
  end if;

  select id, full_name, phone
    into existing_provider
  from public.providers
  where public.bizzi_normalize_phone_digits(phone) = clean_phone
    and (new.id is null or id <> new.id)
  limit 1;

  if found then
    raise exception 'provider_phone_already_exists'
      using
        errcode = '23505',
        detail = 'Ce numero est deja lie a un prestataire Bizzi. Utilisez le renouvellement au lieu de creer un nouveau mois gratuit.',
        hint = existing_provider.id::text;
  end if;

  return new;
end;
$$;

drop trigger if exists bizzi_block_duplicate_provider_phone_tg on public.providers;

create trigger bizzi_block_duplicate_provider_phone_tg
before insert or update of phone on public.providers
for each row
execute function public.bizzi_block_duplicate_provider_phone();

comment on function public.bizzi_block_duplicate_provider_phone() is
'Bizzi: bloque la creation de plusieurs profils prestataires avec le meme numero normalise.';

create or replace function public.public_find_provider_for_renewal(provider_phone text)
returns table (
  id uuid,
  full_name text,
  phone text,
  whatsapp text,
  status text,
  visibility_status text,
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  service_name text,
  city_name text,
  neighborhood text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_phone text;
begin
  clean_phone := public.bizzi_normalize_phone_digits(provider_phone);

  if clean_phone is null then
    return;
  end if;

  return query
  select
    p.id,
    p.full_name,
    p.phone,
    p.whatsapp,
    p.status::text,
    p.visibility_status::text,
    p.trial_ends_at,
    p.subscription_ends_at,
    coalesce(s.name, p.requested_service_name, 'Metier a preciser') as service_name,
    c.name as city_name,
    p.neighborhood
  from public.providers p
  left join public.cities c on c.id = p.city_id
  left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
  left join public.services s on s.id = ps.service_id
  where public.bizzi_normalize_phone_digits(p.phone) = clean_phone
     or public.bizzi_normalize_phone_digits(p.whatsapp) = clean_phone
  order by p.created_at desc
  limit 1;
end;
$$;

grant execute on function public.public_find_provider_for_renewal(text) to anon, authenticated;

comment on function public.public_find_provider_for_renewal(text) is
'Bizzi: permet a un prestataire de retrouver son profil par telephone pour renouveler sans recreer un essai gratuit.';
