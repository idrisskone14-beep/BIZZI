-- V307 : trois fonctions admin lisaient encore auth.users (table Supabase, absente sur Neon).
-- Sur Neon, les comptes vivent dans neon_auth."user" (Neon Auth) : on y lit l'e-mail.
-- Applique sur zeyds-prod le 2026-11-26.

create or replace function public.admin_list_admins()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
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
  left join neon_auth."user" u on u.id = ap.auth_user_id;

  return response;
end;
$function$;

create or replace function public.admin_log_action(
  p_action text,
  p_target_id text default null::text,
  p_success boolean default true,
  p_error_message text default null::text,
  p_payload jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
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
    (select email from neon_auth."user" where id = auth.uid())
  );
end;
$function$;

create or replace function public.admin_set_platform_setting(p_key text, p_value jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
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
  values (trim(p_key), coalesce(p_value, 'null'::jsonb), now(), (select email from neon_auth."user" where id = auth.uid()))
  on conflict (key) do update
  set value = excluded.value,
      updated_at = now(),
      updated_by_email = excluded.updated_by_email
  returning * into result_row;

  return to_jsonb(result_row);
end;
$function$;
