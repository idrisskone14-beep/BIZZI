-- Bizzi - Admin Supabase V30
-- Objectif : permettre a un vrai admin Supabase de valider les paiements
-- depuis l'application Bizzi, sans utiliser la cle service_role dans le navigateur.

grant select, update on providers to authenticated;
grant select, update on payments to authenticated;
grant select, update on advertisements to authenticated;
grant select on provider_services, subscription_plans, cities, communes, services, categories to authenticated;

create or replace function admin_approve_payment(payment_uuid uuid)
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
begin
  if not is_admin() then
    raise exception 'Admin only';
  end if;

  select * into pay from payments where id = payment_uuid;
  if not found then
    raise exception 'Payment not found';
  end if;

  select * into plan from subscription_plans where id = pay.plan_id;
  if not found then
    raise exception 'Plan not found';
  end if;

  select p.subscription_ends_at, p.full_name
  into current_end, provider_name
  from providers p
  where p.id = pay.provider_id;

  new_end :=
    greatest(coalesce(current_end, now()), now())
    + make_interval(months => plan.duration_months);

  update payments
  set status = 'approved',
      approved_at = now(),
      amount = plan.price,
      currency = plan.currency,
      updated_at = now()
  where id = payment_uuid;

  update providers
  set subscription_ends_at = new_end,
      visibility_status = 'active',
      status = case when status = 'pending' then 'approved' else status end,
      updated_at = now()
  where id = pay.provider_id;

  update advertisements
  set status = 'active',
      updated_at = now()
  where provider_id = pay.provider_id
  and status = 'pending'
  and now() between starts_at and ends_at;

  return jsonb_build_object(
    'payment_id', payment_uuid,
    'provider_id', pay.provider_id,
    'provider_name', provider_name,
    'subscription_ends_at', new_end
  );
end;
$$;

revoke all on function admin_approve_payment(uuid) from public;
grant execute on function admin_approve_payment(uuid) to authenticated;

