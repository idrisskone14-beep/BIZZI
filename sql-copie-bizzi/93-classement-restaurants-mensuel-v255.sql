-- Bizzi V255 - classement mensuel des restaurants par consultations de fiche
-- A executer dans Supabase > SQL Editor apres 91-bizzi-food-v204.sql.

create table if not exists public.food_place_profile_clicks (
  id bigint generated always as identity primary key,
  food_place_id uuid not null references public.food_places(id) on delete cascade,
  clicked_at timestamptz not null default now()
);

create index if not exists food_place_profile_clicks_month_idx
on public.food_place_profile_clicks(food_place_id, clicked_at desc);

alter table public.food_place_profile_clicks enable row level security;
revoke all on public.food_place_profile_clicks from anon, authenticated;

create or replace function public.record_food_place_profile_click(food_uuid uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_click_count integer;
begin
  if not exists (
    select 1
    from public.food_places
    where id = food_uuid
      and status in ('published', 'active')
  ) then
    raise exception 'Adresse Food non disponible';
  end if;

  insert into public.food_place_profile_clicks(food_place_id)
  values (food_uuid);

  update public.food_places
  set click_count = coalesce(click_count, 0) + 1,
      updated_at = now()
  where id = food_uuid
  returning click_count into updated_click_count;

  return updated_click_count;
end;
$$;

revoke all on function public.record_food_place_profile_click(uuid) from public;
grant execute on function public.record_food_place_profile_click(uuid) to anon, authenticated;

create or replace view public.public_food_places as
select
  fp.id,
  fp.name,
  fp.owner_name,
  fp.contact_phone,
  fp.place_type,
  fp.main_specialty,
  fp.specialties,
  fp.city_name,
  fp.area,
  fp.address,
  fp.average_budget,
  fp.opening_hours,
  fp.delivery_available,
  fp.description,
  fp.photo_url,
  fp.rating,
  fp.click_count,
  fp.contact_click_count,
  fp.status,
  fp.verification_status,
  fp.created_at,
  fp.updated_at,
  to_char(timezone('UTC', now()), 'YYYY-MM') as monthly_click_month,
  (
    select count(*)::integer
    from public.food_place_profile_clicks clicks
    where clicks.food_place_id = fp.id
      and clicks.clicked_at >= date_trunc('month', timezone('UTC', now())) at time zone 'UTC'
      and clicks.clicked_at < (date_trunc('month', timezone('UTC', now())) + interval '1 month') at time zone 'UTC'
  ) as monthly_click_count
from public.food_places fp
where fp.status in ('published', 'active');

grant select on public.public_food_places to anon, authenticated;
notify pgrst, 'reload schema';

select
  'classement_restaurants_mensuel_v255_installe' as verification,
  count(*) as consultations_du_mois
from public.food_place_profile_clicks
where clicked_at >= date_trunc('month', timezone('UTC', now())) at time zone 'UTC';

