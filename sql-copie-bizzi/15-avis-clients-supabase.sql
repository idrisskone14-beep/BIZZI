-- Bizzi - Avis clients Supabase V38
-- Objectif : enregistrer les avis clients sans compte client.
-- A executer une seule fois dans Supabase SQL Editor.

alter table providers
add column if not exists review_count integer not null default 0;

create table if not exists provider_reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  message text,
  status text not null default 'published' check (status in ('published', 'hidden', 'reviewed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table provider_reviews enable row level security;

drop trigger if exists provider_reviews_set_updated_at on provider_reviews;
create trigger provider_reviews_set_updated_at
before update on provider_reviews
for each row execute function set_updated_at();

create or replace function refresh_provider_rating(provider_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update providers
  set average_rating = coalesce((
        select round(avg(rating)::numeric, 1)
        from provider_reviews
        where provider_id = provider_uuid
          and status = 'published'
      ), 0),
      review_count = coalesce((
        select count(*)::integer
        from provider_reviews
        where provider_id = provider_uuid
          and status = 'published'
      ), 0),
      updated_at = now()
  where id = provider_uuid;
end;
$$;

create or replace function provider_reviews_refresh_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_provider uuid;
begin
  if tg_op = 'DELETE' then
    target_provider := old.provider_id;
    perform refresh_provider_rating(target_provider);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.provider_id is distinct from new.provider_id then
    perform refresh_provider_rating(old.provider_id);
  end if;

  target_provider := new.provider_id;
  perform refresh_provider_rating(target_provider);
  return new;
end;
$$;

drop trigger if exists provider_reviews_after_change on provider_reviews;
create trigger provider_reviews_after_change
after insert or update or delete on provider_reviews
for each row execute function provider_reviews_refresh_rating();

grant select, insert on provider_reviews to anon, authenticated;
grant update on provider_reviews to authenticated;

drop policy if exists "public submit provider review" on provider_reviews;
create policy "public submit provider review"
on provider_reviews for insert
to anon, authenticated
with check (
  rating between 1 and 5
  and status = 'published'
  and provider_id in (
    select id from providers
    where status = 'approved'
      and visibility_status in ('trial', 'active')
  )
);

drop policy if exists "public read published provider reviews" on provider_reviews;
create policy "public read published provider reviews"
on provider_reviews for select
to anon, authenticated
using (
  status = 'published'
  and provider_id in (
    select id from providers
    where status = 'approved'
      and visibility_status in ('trial', 'active')
  )
);

drop policy if exists "admin full provider reviews" on provider_reviews;
create policy "admin full provider reviews"
on provider_reviews for all
to authenticated
using (is_admin())
with check (is_admin());

create or replace view public_provider_directory as
select
  p.id,
  case
    when p.visibility_status in ('trial', 'active') then p.full_name
    else null
  end as full_name,
  case
    when p.visibility_status in ('trial', 'active') then p.phone
    else null
  end as phone,
  case
    when p.visibility_status in ('trial', 'active') then p.whatsapp
    else null
  end as whatsapp,
  p.photo_url,
  p.description,
  p.neighborhood,
  p.latitude,
  p.longitude,
  p.visibility_status,
  p.average_rating,
  p.call_count,
  p.is_verified,
  c.name as city_name,
  co.name as commune_name,
  s.name as service_name,
  cat.name as category_name,
  case
    when p.visibility_status in ('trial', 'active') then true
    else false
  end as contact_visible,
  p.review_count
from providers p
left join cities c on c.id = p.city_id
left join communes co on co.id = p.commune_id
left join provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join services s on s.id = ps.service_id
left join categories cat on cat.id = s.category_id
where p.status = 'approved'
and p.visibility_status in ('trial', 'active', 'expired_blurred');

grant select on public_provider_directory to anon, authenticated;
