-- Bizzi V90 - Correction doublons paiements forfaits
-- Probleme traite :
-- le meme paiement peut apparaitre 2 fois dans "Paiements Supabase en attente"
-- avec le meme prestataire et la meme reference.
--
-- Effet :
-- - garde une seule ligne pending par prestataire + reference ;
-- - rejette les copies pending en doublon ;
-- - empeche de recreer deux pending identiques ;
-- - la fonction admin_approve_payment rejette aussi les copies apres validation.

grant usage on schema public to anon, authenticated;
grant select, update on public.payments to authenticated;
grant select, update on public.providers to authenticated;
grant select on public.subscription_plans to authenticated;

-- Nettoyage des doublons deja presents.
with ranked as (
  select
    p.id,
    p.status,
    row_number() over (
      partition by
        p.provider_id,
        lower(btrim(coalesce(p.transaction_reference, ''))),
        p.method
      order by
        case when p.status = 'approved'::payment_status then 0 else 1 end,
        p.created_at asc,
        p.id asc
    ) as rn
  from public.payments p
  where p.status in ('pending'::payment_status, 'approved'::payment_status)
    and p.transaction_reference is not null
    and btrim(p.transaction_reference) <> ''
)
update public.payments p
set status = 'rejected'::payment_status,
    admin_note = coalesce(p.admin_note || ' | ', '') || 'Doublon rejete automatiquement par Bizzi V90',
    updated_at = now()
from ranked r
where p.id = r.id
  and r.rn > 1
  and p.status = 'pending'::payment_status;

-- Empêche deux paiements EN ATTENTE identiques.
create unique index if not exists payments_unique_pending_provider_reference
on public.payments (
  provider_id,
  method,
  lower(btrim(transaction_reference))
)
where status = 'pending'::payment_status
  and transaction_reference is not null
  and btrim(transaction_reference) <> '';

create or replace function public.admin_approve_payment(payment_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  pay payments%rowtype;
  plan subscription_plans%rowtype;
  current_end timestamptz;
  new_end timestamptz;
  provider_name text;
  duplicate_count integer := 0;
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

  update public.payments
  set status = 'approved'::payment_status,
      approved_at = now(),
      amount = plan.price,
      currency = plan.currency,
      updated_at = now()
  where id = payment_uuid;

  if pay.transaction_reference is not null and btrim(pay.transaction_reference) <> '' then
    update public.payments p
    set status = 'rejected'::payment_status,
        admin_note = coalesce(p.admin_note || ' | ', '') || 'Doublon automatique du paiement ' || payment_uuid,
        updated_at = now()
    where p.id <> payment_uuid
      and p.provider_id = pay.provider_id
      and p.status = 'pending'::payment_status
      and lower(btrim(p.transaction_reference)) = lower(btrim(pay.transaction_reference));

    get diagnostics duplicate_count = row_count;
  end if;

  update public.providers
  set subscription_ends_at = new_end,
      visibility_status = 'active'::provider_visibility_status,
      status = case
        when status = 'pending'::provider_status then 'approved'::provider_status
        else status
      end,
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
    'duplicate_payments_rejected', duplicate_count
  );
end;
$$;

revoke all on function public.admin_approve_payment(uuid) from public;
grant execute on function public.admin_approve_payment(uuid) to authenticated;

notify pgrst, 'reload schema';

-- Controle : cette requete doit montrer les doublons rejetes et les paiements restants.
select
  p.id,
  pr.full_name,
  pr.phone,
  p.method,
  p.transaction_reference,
  p.status,
  p.admin_note,
  p.created_at,
  p.updated_at
from public.payments p
join public.providers pr on pr.id = p.provider_id
where lower(pr.full_name) like '%anissimova%'
   or p.transaction_reference = 'TEST-FORFAIT-V86-001'
order by p.created_at desc;
