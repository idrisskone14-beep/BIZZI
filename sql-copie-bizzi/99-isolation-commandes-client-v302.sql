-- Bizzi V302 — isolation stricte des commandes Course/Livraison par appareil.
-- Les anciennes lignes reçoivent un jeton inconnu des navigateurs et ne sont
-- donc plus téléchargées par un client public.

alter table public.delivery_requests
  add column if not exists client_access_token text;

update public.delivery_requests
set client_access_token = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
where client_access_token is null
   or length(client_access_token) < 32;

alter table public.delivery_requests
  alter column client_access_token set not null;

alter table public.delivery_requests
  alter column client_access_token set default (
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  );

alter table public.delivery_requests
  drop constraint if exists delivery_requests_client_access_token_check;

alter table public.delivery_requests
  add constraint delivery_requests_client_access_token_check
  check (
    length(client_access_token) between 32 and 160
    and client_access_token ~ '^[A-Za-z0-9_-]+$'
  );

create index if not exists idx_delivery_requests_client_access_token
  on public.delivery_requests(client_access_token, created_at desc);

drop policy if exists "public read delivery requests" on public.delivery_requests;
drop policy if exists "client reads own delivery requests" on public.delivery_requests;
drop policy if exists "admins read all delivery requests" on public.delivery_requests;
drop policy if exists "providers read matched delivery requests" on public.delivery_requests;
drop policy if exists "authenticated reads allowed delivery requests" on public.delivery_requests;
drop policy if exists "public create open delivery requests" on public.delivery_requests;

create policy "client reads own delivery requests"
on public.delivery_requests
for select
to anon
using (
  length(coalesce((select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token'), '')) between 32 and 160
  and client_access_token = (select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token')
);

create policy "authenticated reads allowed delivery requests"
on public.delivery_requests
for select
to authenticated
using (
  (
    length(coalesce((select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token'), '')) between 32 and 160
    and client_access_token = (select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token')
  )
  or exists (
      select 1
      from public.admin_profiles admin_profile
      where admin_profile.auth_user_id = (select auth.uid())
        and admin_profile.is_active = true
    )
  or exists (
      select 1
      from public.providers provider
      where provider.auth_user_id = (select auth.uid())
        and (
          provider.id = assigned_provider_id
          or provider.id = any(matched_provider_ids)
        )
      )
);

create policy "public create open delivery requests"
on public.delivery_requests
for insert
to anon, authenticated
with check (
  (
    coalesce((select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token'), '') = ''
    or (
      length(coalesce((select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token'), '')) between 32 and 160
      and client_access_token = (select current_setting('request.headers', true)::jsonb ->> 'x-bizzi-client-token')
    )
  )
  and status = 'open'
  and assigned_provider_id is null
  and pickup_address is not null
  and dropoff_address is not null
  and parcel_description is not null
  and amount >= 800
  and suggested_amount >= 800
  and base_amount >= 800
  and commission_rate = 0.15
  and bizzi_commission >= 0
  and provider_payout >= 0
  and surcharge_rate >= 0
  and surcharge_rate <= 0.35
  and coalesce(distance_km, 0) > 0
  and pricing_slot = any(array['normal', 'morning_peak', 'evening_peak', 'night'])
  and payment_status = any(array['pending', 'unpaid', 'approved'])
);

comment on column public.delivery_requests.client_access_token is
  'Jeton privé aléatoire propre à l appareil client. Ne jamais afficher ni journaliser.';
