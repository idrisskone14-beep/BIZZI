-- Bizzi V145 - Livraisons locales sans WhatsApp
-- Objectif : enregistrer les demandes de livraison, les afficher aux prestataires compatibles,
-- puis tracer l'acceptation dans Supabase.

create extension if not exists pgcrypto;

create table if not exists public.delivery_requests (
  id uuid primary key default gen_random_uuid(),
  pickup_address text not null,
  dropoff_address text not null,
  parcel_description text not null,
  city_name text,
  area text,
  urgency text not null default 'today',
  notes text,
  customer_phone text,
  matched_provider_ids uuid[] not null default '{}',
  assigned_provider_id uuid references public.providers(id) on delete set null,
  assigned_provider_name text,
  assigned_provider_phone text,
  status text not null default 'open' check (status in ('open', 'assigned', 'closed', 'cancelled')),
  accepted_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_delivery_requests_status_created
on public.delivery_requests(status, created_at desc);

create index if not exists idx_delivery_requests_city
on public.delivery_requests(city_name);

create index if not exists idx_delivery_requests_assigned_provider
on public.delivery_requests(assigned_provider_id);

alter table public.delivery_requests enable row level security;

drop policy if exists "public read delivery requests" on public.delivery_requests;
create policy "public read delivery requests"
on public.delivery_requests for select
to anon, authenticated
using (true);

drop policy if exists "public create open delivery requests" on public.delivery_requests;
create policy "public create open delivery requests"
on public.delivery_requests for insert
to anon, authenticated
with check (
  status = 'open'
  and assigned_provider_id is null
  and pickup_address is not null
  and dropoff_address is not null
  and parcel_description is not null
);

grant select, insert on public.delivery_requests to anon, authenticated;
grant update on public.delivery_requests to authenticated;

drop function if exists public.bizzi_accept_delivery_request(uuid, uuid, text, text);
create or replace function public.bizzi_accept_delivery_request(
  p_delivery_id uuid,
  p_provider_id uuid,
  p_provider_name text default null,
  p_provider_phone text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_record record;
begin
  select p.id, p.full_name, p.phone
    into provider_record
  from public.providers p
  join public.provider_services ps on ps.provider_id = p.id
  join public.services s on s.id = ps.service_id
  where p.id = p_provider_id
    and p.status = 'approved'
    and p.visibility_status in ('trial', 'active')
    and s.name in (
      'Bizzi Livraison',
      'Courses / achats à domicile',
      'Chauffeur',
      'Transport de marchandises',
      'Transport de colis international',
      'Conducteur moto-taxi',
      'Livreur de gaz en bouteille',
      'Livraison médicaments'
    )
  limit 1;

  if not found then
    raise exception 'Prestataire livraison non actif ou non compatible';
  end if;

  update public.delivery_requests
  set status = 'assigned',
      assigned_provider_id = provider_record.id,
      assigned_provider_name = coalesce(nullif(p_provider_name, ''), provider_record.full_name),
      assigned_provider_phone = coalesce(nullif(p_provider_phone, ''), provider_record.phone),
      accepted_at = coalesce(accepted_at, now()),
      updated_at = now()
  where id = p_delivery_id
    and status = 'open';

  if not found then
    raise exception 'Livraison déjà acceptée, clôturée ou introuvable';
  end if;
end;
$$;

drop function if exists public.bizzi_close_delivery_request(uuid);
create or replace function public.bizzi_close_delivery_request(p_delivery_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.delivery_requests
  set status = 'closed',
      closed_at = coalesce(closed_at, now()),
      updated_at = now()
  where id = p_delivery_id
    and status <> 'closed';

  if not found then
    raise exception 'Livraison introuvable ou déjà clôturée';
  end if;
end;
$$;

revoke all on function public.bizzi_accept_delivery_request(uuid, uuid, text, text) from public;
revoke all on function public.bizzi_close_delivery_request(uuid) from public;

grant execute on function public.bizzi_accept_delivery_request(uuid, uuid, text, text) to anon, authenticated;
grant execute on function public.bizzi_close_delivery_request(uuid) to authenticated;

select pg_notify('pgrst', 'reload schema');

select
  'Bizzi V145 livraisons installé' as message,
  count(*) as demandes_livraison
from public.delivery_requests;
