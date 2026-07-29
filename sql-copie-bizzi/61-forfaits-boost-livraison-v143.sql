-- Bizzi V143 - Forfaits, boost et Bizzi Livraison
-- Objectif :
-- - remplacer les anciens tarifs visibles par les nouveaux forfaits prestataires ;
-- - ajouter le service Bizzi Livraison au catalogue Supabase ;
-- - garder la trace du montant total paye quand une option boost est ajoutee.
--
-- A executer une seule fois dans Supabase > SQL Editor > New query.

grant usage on schema public to anon, authenticated;
grant select on public.subscription_plans to anon, authenticated;
grant select on public.categories, public.services to anon, authenticated;
grant select, update on public.payments to authenticated;
grant select, update on public.providers to authenticated;
grant select, update on public.advertisements to authenticated;

alter table public.providers add column if not exists requested_service_name text;
alter table public.providers add column if not exists requested_category_name text;
alter table public.providers add column if not exists review_count integer not null default 0;
alter table public.providers add column if not exists boost_ends_at timestamptz;

insert into public.subscription_plans (name, duration_months, price, currency, is_active)
values
  ('1 mois', 1, 3000, 'FCFA', true),
  ('3 mois', 3, 4500, 'FCFA', true),
  ('6 mois', 6, 6500, 'FCFA', true)
on conflict (name) do update
set duration_months = excluded.duration_months,
    price = excluded.price,
    currency = excluded.currency,
    is_active = true,
    updated_at = now();

update public.subscription_plans
set is_active = false,
    updated_at = now()
where name in ('12 mois')
  and price = 9900;

insert into public.categories (name, sort_order, is_active)
values
  ('Transports & Logistique', 30, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = true;

insert into public.services (category_id, name, sort_order, is_active)
select c.id, v.service_name, v.sort_order, true
from public.categories c
join (values
  ('Transports & Logistique', 'Bizzi Livraison', 1),
  ('Transports & Logistique', 'Transport de colis international', 95),
  ('Transports & Logistique', 'Transport de marchandises', 90),
  ('Transports & Logistique', 'Conducteur moto-taxi', 100)
) as v(category_name, service_name, sort_order)
on c.name = v.category_name
on conflict (category_id, name) do update
set sort_order = excluded.sort_order,
    is_active = true;

create or replace function public.admin_approve_payment(payment_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  pay public.payments%rowtype;
  plan public.subscription_plans%rowtype;
  current_end timestamptz;
  new_end timestamptz;
  provider_name text;
  approved_amount integer;
  boost_days integer := 0;
  new_boost_end timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select * into pay from public.payments where id = payment_uuid;
  if not found then
    raise exception 'Payment not found';
  end if;

  select * into plan from public.subscription_plans where id = pay.plan_id;
  if not found then
    raise exception 'Plan not found';
  end if;

  select p.subscription_ends_at, p.full_name
  into current_end, provider_name
  from public.providers p
  where p.id = pay.provider_id;

  new_end :=
    greatest(coalesce(current_end, now()), now())
    + make_interval(months => plan.duration_months);

  approved_amount := greatest(coalesce(pay.amount, 0), plan.price);
  if approved_amount - plan.price >= 2000 then
    boost_days := 30;
  elsif approved_amount - plan.price >= 1000 then
    boost_days := 7;
  end if;

  if boost_days > 0 then
    new_boost_end := greatest(coalesce((select boost_ends_at from public.providers where id = pay.provider_id), now()), now())
      + make_interval(days => boost_days);
  end if;

  update public.payments
  set status = 'approved',
      approved_at = now(),
      amount = approved_amount,
      currency = plan.currency,
      updated_at = now()
  where id = payment_uuid;

  update public.providers
  set subscription_ends_at = new_end,
      visibility_status = 'active',
      status = case when status = 'pending' then 'approved'::provider_status else status end,
      boost_ends_at = coalesce(new_boost_end, boost_ends_at),
      updated_at = now()
  where id = pay.provider_id;

  update public.advertisements
  set status = 'active',
      updated_at = now()
  where provider_id = pay.provider_id
    and status = 'pending'
    and now() between starts_at and ends_at;

  return jsonb_build_object(
    'payment_id', payment_uuid,
    'provider_id', pay.provider_id,
    'provider_name', provider_name,
    'subscription_ends_at', new_end,
    'boost_ends_at', new_boost_end,
    'amount', approved_amount,
    'plan_name', plan.name
  );
end;
$$;

revoke all on function public.admin_approve_payment(uuid) from public;
grant execute on function public.admin_approve_payment(uuid) to authenticated;

create or replace view public.public_provider_directory as
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
  coalesce(s.name, nullif(trim(p.requested_service_name), ''), 'Metier a preciser') as service_name,
  coalesce(cat.name, nullif(trim(p.requested_category_name), ''), 'Autres') as category_name,
  case
    when p.visibility_status in ('trial', 'active') then true
    else false
  end as contact_visible,
  p.review_count,
  p.trial_ends_at,
  p.subscription_ends_at,
  p.boost_ends_at,
  p.requested_service_name,
  p.requested_category_name
from public.providers p
left join public.cities c on c.id = p.city_id
left join public.communes co on co.id = p.commune_id
left join public.provider_services ps on ps.provider_id = p.id and ps.is_primary = true
left join public.services s on s.id = ps.service_id
left join public.categories cat on cat.id = s.category_id
where p.status = 'approved'
and p.visibility_status in ('trial', 'active', 'expired_blurred');

grant select on public.public_provider_directory to anon, authenticated;

notify pgrst, 'reload schema';

select
  'forfaits_boost_livraison_v143_ok' as verification,
  sp.name,
  sp.duration_months,
  sp.price,
  sp.currency,
  sp.is_active
from public.subscription_plans sp
where sp.name in ('1 mois', '3 mois', '6 mois', '12 mois')
order by sp.duration_months;
