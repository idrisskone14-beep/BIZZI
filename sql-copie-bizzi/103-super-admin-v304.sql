-- Zeyds V304 - Espace Super Admin (gestion des admins, journal d'audit,
-- reglages sensibles, annuaire complet prestataires + clients).
--
-- A executer sur le projet Supabase reel (SQL Editor) uniquement. L'espace
-- admin reste 100% Supabase par conception actuelle (authentification reelle
-- via Supabase Auth) : aucune equivalence n'est necessaire sur Neon.

-- 1. Hierarchie de roles -------------------------------------------------
-- is_admin() existe deja (voir 20-correction-admin-file-vide.sql) mais ne
-- distingue pas les roles. is_super_admin() ajoute ce filtre pour gater
-- tout ce qui est exclusif au niveau le plus haut (owner / super_admin).

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where auth_user_id = auth.uid()
      and is_active = true
      and lower(coalesce(role, '')) in ('owner', 'super_admin')
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

-- 2. Journal d'audit : ajouter l'auteur -----------------------------------
-- La table existait deja (72-v2-backend-admin-observability-v170.sql) mais
-- rien n'y ecrivait, et rien n'identifiait l'auteur d'une action.

alter table public.admin_audit_events
  add column if not exists actor_auth_user_id uuid,
  add column if not exists actor_email text;

create index if not exists idx_admin_audit_events_actor
on public.admin_audit_events(actor_auth_user_id, created_at desc);

drop policy if exists "admin read audit events" on public.admin_audit_events;
create policy "super admin read audit events"
on public.admin_audit_events for select
to authenticated
using (public.is_super_admin());

drop policy if exists "admin insert audit events" on public.admin_audit_events;
create policy "admin insert own audit events"
on public.admin_audit_events for insert
to authenticated
with check (public.is_admin());

grant select, insert on public.admin_audit_events to authenticated;

-- 3. RPC : journaliser une action super admin -----------------------------

create or replace function public.admin_log_action(
  p_action text,
  p_target_id text default null,
  p_success boolean default true,
  p_error_message text default null,
  p_payload jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  insert into public.admin_audit_events (
    action, target_id, success, error_message, payload,
    actor_auth_user_id, actor_email
  )
  values (
    p_action, p_target_id, coalesce(p_success, true), p_error_message, coalesce(p_payload, '{}'::jsonb),
    auth.uid(),
    (select email from auth.users where id = auth.uid())
  );
end;
$$;

revoke all on function public.admin_log_action(text, text, boolean, text, jsonb) from public;
grant execute on function public.admin_log_action(text, text, boolean, text, jsonb) to authenticated;

-- 4. RPC : gestion des administrateurs ------------------------------------

create or replace function public.admin_list_admins()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  response jsonb;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', ap.id,
      'auth_user_id', ap.auth_user_id,
      'full_name', ap.full_name,
      'role', ap.role,
      'is_active', ap.is_active,
      'email', u.email,
      'created_at', ap.created_at,
      'updated_at', ap.updated_at
    )
    order by ap.created_at asc
  ), '[]'::jsonb)
  into response
  from public.admin_profiles ap
  left join auth.users u on u.id = ap.auth_user_id;

  return response;
end;
$$;

revoke all on function public.admin_list_admins() from public;
grant execute on function public.admin_list_admins() to authenticated;

create or replace function public.admin_upsert_admin_profile(
  target_auth_user_id uuid,
  p_full_name text,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  safe_role text := lower(trim(coalesce(p_role, 'admin')));
  result_row public.admin_profiles%rowtype;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;
  if target_auth_user_id is null then
    raise exception 'auth_user_id requis (a copier depuis Supabase Dashboard > Authentication > Users)';
  end if;
  if safe_role not in ('admin', 'owner', 'super_admin') then
    raise exception 'Role invalide : admin, owner ou super_admin uniquement';
  end if;

  insert into public.admin_profiles (auth_user_id, full_name, role, is_active)
  values (target_auth_user_id, coalesce(nullif(trim(p_full_name), ''), 'Admin Zeyds'), safe_role, true)
  on conflict (auth_user_id) do update
  set full_name = excluded.full_name,
      role = excluded.role,
      is_active = true,
      updated_at = now()
  returning * into result_row;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.admin_upsert_admin_profile(uuid, text, text) from public;
grant execute on function public.admin_upsert_admin_profile(uuid, text, text) to authenticated;

create or replace function public.admin_set_admin_active(
  target_auth_user_id uuid,
  p_is_active boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result_row public.admin_profiles%rowtype;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;
  if target_auth_user_id = auth.uid() and coalesce(p_is_active, true) = false then
    raise exception 'Impossible de se desactiver soi-meme';
  end if;

  update public.admin_profiles
  set is_active = coalesce(p_is_active, true),
      updated_at = now()
  where auth_user_id = target_auth_user_id
  returning * into result_row;

  if not found then
    raise exception 'Admin introuvable';
  end if;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.admin_set_admin_active(uuid, boolean) from public;
grant execute on function public.admin_set_admin_active(uuid, boolean) to authenticated;

-- 5. RPC : annuaire complet prestataires (recherche + statut, pagine) -----

create or replace function public.admin_list_all_providers(
  p_search text default '',
  p_status text default '',
  p_visibility text default '',
  p_after jsonb default '{}'::jsonb,
  p_limit integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  safe_limit integer := least(greatest(coalesce(p_limit, 30), 1), 100);
  search_value text := lower(trim(coalesce(p_search, '')));
  status_value text := lower(trim(coalesce(p_status, '')));
  visibility_value text := lower(trim(coalesce(p_visibility, '')));
  cursor_created timestamptz;
  cursor_id uuid;
  response jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  if coalesce(p_after, '{}'::jsonb) ? 'id' then
    cursor_created := (p_after ->> 'created_at')::timestamptz;
    cursor_id := (p_after ->> 'id')::uuid;
  end if;

  with candidates as (
    select
      p.id,
      p.full_name,
      p.phone,
      p.whatsapp,
      p.email,
      p.status,
      p.visibility_status,
      p.is_verified,
      p.trial_started_at,
      p.trial_ends_at,
      p.subscription_ends_at,
      p.average_rating,
      p.call_count,
      p.created_at,
      c.name as city_name,
      co.name as commune_name,
      p.neighborhood,
      coalesce(primary_service.service_name, 'Metier a preciser') as service_name
    from public.providers p
    left join public.cities c on c.id = p.city_id
    left join public.communes co on co.id = p.commune_id
    left join lateral (
      select s.name as service_name
      from public.provider_services ps
      join public.services s on s.id = ps.service_id
      where ps.provider_id = p.id
      order by ps.is_primary desc, s.name asc
      limit 1
    ) primary_service on true
    where (status_value = '' or lower(p.status::text) = status_value)
      and (visibility_value = '' or lower(p.visibility_status::text) = visibility_value)
      and (
        search_value = ''
        or lower(coalesce(p.full_name, '')) like '%' || search_value || '%'
        or lower(coalesce(p.email, '')) like '%' || search_value || '%'
        or (
          length(public.bizzi_normalize_phone_digits(p_search)) >= 6
          and public.bizzi_normalize_phone_digits(p.phone) like '%' || public.bizzi_normalize_phone_digits(p_search) || '%'
        )
      )
      and (
        cursor_id is null
        or p.created_at < cursor_created
        or (p.created_at = cursor_created and p.id > cursor_id)
      )
    order by p.created_at desc, p.id asc
    limit safe_limit + 1
  ), page as (
    select * from candidates order by created_at desc, id asc limit safe_limit
  ), last_row as (
    select * from page order by created_at asc, id desc limit 1
  )
  select jsonb_build_object(
    'items', coalesce((select jsonb_agg(to_jsonb(item) order by item.created_at desc, item.id asc) from page item), '[]'::jsonb),
    'has_more', (select count(*) > safe_limit from candidates),
    'next_cursor', (select jsonb_build_object('created_at', created_at, 'id', id) from last_row),
    'page_size', safe_limit
  ) into response;

  return coalesce(response, jsonb_build_object('items', '[]'::jsonb, 'has_more', false, 'next_cursor', null, 'page_size', safe_limit));
end;
$$;

revoke all on function public.admin_list_all_providers(text, text, text, jsonb, integer) from public;
grant execute on function public.admin_list_all_providers(text, text, text, jsonb, integer) to authenticated;

-- 6. RPC : annuaire complet clients (agrege depuis les demandes) ----------
-- Les clients n'ont pas de compte reel (juste un nom/telephone memorise
-- localement) : on reconstitue une liste a partir de leur identite laissee
-- sur delivery_requests / service_requests / express_requests, dedupliquee
-- par numero normalise. express_requests n'a pas de customer_name -> "Client".

create or replace function public.admin_list_all_clients(
  p_search text default '',
  p_after jsonb default '{}'::jsonb,
  p_limit integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  safe_limit integer := least(greatest(coalesce(p_limit, 30), 1), 100);
  search_value text := lower(trim(coalesce(p_search, '')));
  cursor_last_seen timestamptz;
  cursor_phone text;
  response jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  if coalesce(p_after, '{}'::jsonb) ? 'phone' then
    cursor_last_seen := (p_after ->> 'last_seen')::timestamptz;
    cursor_phone := p_after ->> 'phone';
  end if;

  with raw_events as (
    select customer_name, customer_phone, created_at, 'delivery'::text as source
    from public.delivery_requests
    where customer_phone is not null
    union all
    select customer_name, customer_phone, created_at, 'service'::text as source
    from public.service_requests
    where customer_phone is not null
    union all
    select null::text as customer_name, customer_phone, created_at, 'express'::text as source
    from public.express_requests
    where customer_phone is not null
  ), normalized as (
    select
      public.bizzi_normalize_phone_digits(customer_phone) as phone_key,
      customer_name,
      customer_phone,
      created_at,
      source
    from raw_events
    where public.bizzi_normalize_phone_digits(customer_phone) is not null
  ), aggregated as (
    select
      phone_key,
      (array_agg(customer_phone order by created_at desc))[1] as phone,
      (array_agg(customer_name order by created_at desc) filter (where customer_name is not null and trim(customer_name) <> ''))[1] as full_name,
      min(created_at) as first_seen,
      max(created_at) as last_seen,
      count(*) filter (where source = 'delivery') as delivery_count,
      count(*) filter (where source = 'service') as service_count,
      count(*) filter (where source = 'express') as express_count,
      count(*) as total_count
    from normalized
    group by phone_key
  ), candidates as (
    select *
    from aggregated
    where (
        search_value = ''
        or lower(coalesce(full_name, '')) like '%' || search_value || '%'
        or (
          length(public.bizzi_normalize_phone_digits(p_search)) >= 6
          and phone_key like '%' || public.bizzi_normalize_phone_digits(p_search) || '%'
        )
      )
      and (
        cursor_phone is null
        or last_seen < cursor_last_seen
        or (last_seen = cursor_last_seen and phone_key > cursor_phone)
      )
    order by last_seen desc, phone_key asc
    limit safe_limit + 1
  ), page as (
    select * from candidates order by last_seen desc, phone_key asc limit safe_limit
  ), last_row as (
    select * from page order by last_seen asc, phone_key desc limit 1
  )
  select jsonb_build_object(
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'phone', item.phone,
          'full_name', coalesce(item.full_name, 'Client'),
          'first_seen', item.first_seen,
          'last_seen', item.last_seen,
          'delivery_count', item.delivery_count,
          'service_count', item.service_count,
          'express_count', item.express_count,
          'total_count', item.total_count
        )
        order by item.last_seen desc, item.phone_key asc
      )
      from page item
    ), '[]'::jsonb),
    'has_more', (select count(*) > safe_limit from candidates),
    'next_cursor', (select jsonb_build_object('last_seen', last_seen, 'phone', phone_key) from last_row),
    'page_size', safe_limit
  ) into response;

  return coalesce(response, jsonb_build_object('items', '[]'::jsonb, 'has_more', false, 'next_cursor', null, 'page_size', safe_limit));
end;
$$;

revoke all on function public.admin_list_all_clients(text, jsonb, integer) from public;
grant execute on function public.admin_list_all_clients(text, jsonb, integer) to authenticated;

-- 7. Reglages plateforme sensibles ----------------------------------------
-- Cle-valeur generique : la v1 n'expose qu'un seul reglage concret
-- (production_unlocked) depuis l'UI, mais la table est generique pour
-- accueillir d'autres reglages plus tard sans nouvelle migration.

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by_email text
);

alter table public.platform_settings enable row level security;

drop policy if exists "admin read platform settings" on public.platform_settings;
create policy "admin read platform settings"
on public.platform_settings for select
to authenticated
using (public.is_admin());

grant select on public.platform_settings to authenticated;

insert into public.platform_settings (key, value)
values ('production_unlocked', 'false'::jsonb)
on conflict (key) do nothing;

create or replace function public.admin_list_platform_settings()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select case when public.is_admin()
    then coalesce((select jsonb_agg(to_jsonb(s) order by s.key) from public.platform_settings s), '[]'::jsonb)
    else (select '[]'::jsonb)
  end;
$$;

revoke all on function public.admin_list_platform_settings() from public;
grant execute on function public.admin_list_platform_settings() to authenticated;

create or replace function public.admin_set_platform_setting(
  p_key text,
  p_value jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result_row public.platform_settings%rowtype;
begin
  if not public.is_super_admin() then
    raise exception 'Super admin only';
  end if;
  if p_key is null or trim(p_key) = '' then
    raise exception 'Cle de reglage requise';
  end if;

  insert into public.platform_settings (key, value, updated_at, updated_by_email)
  values (trim(p_key), coalesce(p_value, 'null'::jsonb), now(), (select email from auth.users where id = auth.uid()))
  on conflict (key) do update
  set value = excluded.value,
      updated_at = now(),
      updated_by_email = excluded.updated_by_email
  returning * into result_row;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.admin_set_platform_setting(text, jsonb) from public;
grant execute on function public.admin_set_platform_setting(text, jsonb) to authenticated;

notify pgrst, 'reload schema';

select
  'Zeyds V304 super admin installe' as statut,
  (select count(*) from public.admin_profiles) as admins_existants,
  (select count(*) from public.admin_profiles where lower(coalesce(role, '')) in ('owner', 'super_admin')) as super_admins_existants;
