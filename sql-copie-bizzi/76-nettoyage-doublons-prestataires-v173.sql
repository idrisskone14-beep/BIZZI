-- Bizzi V173 - Diagnostic et nettoyage prudent des doublons prestataires
-- Par defaut, la fonction ne modifie rien. Elle retourne un apercu.

create or replace function public.bizzi_provider_duplicate_report()
returns table (
  phone_key text,
  duplicate_count integer,
  provider_names text,
  provider_ids text
)
language sql
security definer
set search_path = public
as $$
  select
    regexp_replace(coalesce(p.phone, p.whatsapp, ''), '[^0-9]', '', 'g') as phone_key,
    count(*)::integer as duplicate_count,
    string_agg(coalesce(p.full_name, 'Sans nom'), ' | ' order by p.created_at asc) as provider_names,
    string_agg(p.id::text, ',' order by p.created_at asc) as provider_ids
  from public.providers p
  where public.bizzi_payment_admin_allowed()
    and regexp_replace(coalesce(p.phone, p.whatsapp, ''), '[^0-9]', '', 'g') <> ''
  group by 1
  having count(*) > 1
  order by duplicate_count desc, phone_key;
$$;

grant execute on function public.bizzi_provider_duplicate_report() to authenticated;

create or replace function public.bizzi_cleanup_duplicate_trial_providers(apply_changes boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer := 0;
begin
  if not public.bizzi_payment_admin_allowed() then
    raise exception 'admin_required';
  end if;

  if not apply_changes then
    return jsonb_build_object(
      'mode', 'preview',
      'message', 'Aucune modification effectuee. Relisez bizzi_provider_duplicate_report() avant de passer apply_changes a true.',
      'duplicates', coalesce((select jsonb_agg(row_to_json(r)) from public.bizzi_provider_duplicate_report() r), '[]'::jsonb)
    );
  end if;

  with ranked as (
    select
      p.id,
      row_number() over (
        partition by regexp_replace(coalesce(p.phone, p.whatsapp, ''), '[^0-9]', '', 'g')
        order by
          case when coalesce(p.status, '') = 'approved' then 0 else 1 end,
          p.created_at asc
      ) as rn
    from public.providers p
    where regexp_replace(coalesce(p.phone, p.whatsapp, ''), '[^0-9]', '', 'g') <> ''
  )
  update public.providers p
  set
    status = case when coalesce(p.status, '') = 'approved' then p.status else 'suspended' end,
    visibility_status = case when coalesce(p.status, '') = 'approved' then p.visibility_status else 'hidden' end,
    updated_at = now()
  from ranked r
  where p.id = r.id
    and r.rn > 1
    and coalesce(p.status, '') <> 'approved';

  get diagnostics affected = row_count;

  return jsonb_build_object(
    'mode', 'applied',
    'hidden_or_suspended_duplicates', affected,
    'message', 'Seuls les doublons non approuves ont ete masques. Les profils approuves sont conserves.'
  );
end;
$$;

grant execute on function public.bizzi_cleanup_duplicate_trial_providers(boolean) to authenticated;

select
  'Bizzi V173 nettoyage doublons OK' as statut,
  'Appelez select * from public.bizzi_provider_duplicate_report(); puis public.bizzi_cleanup_duplicate_trial_providers(false).' as prochaine_action;
