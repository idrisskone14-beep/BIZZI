-- Bizzi V115 - Correction definitive RLS paiements forfaits
-- A executer dans Supabase SQL Editor si l'envoi paiement affiche :
-- "new row violates row-level security policy for table payments"
--
-- Pourquoi ce script existe :
-- La policy payments doit verifier que le prestataire existe et peut payer.
-- Mais le visiteur public ne peut pas toujours lire directement public.providers.
-- On utilise donc une fonction security definer pour verifier le prestataire
-- sans exposer toute la table providers au public.

grant usage on schema public to anon, authenticated;
grant insert on public.payments to anon, authenticated;
grant select on public.subscription_plans to anon, authenticated;

create or replace function public.bizzi_provider_accepts_payment(provider_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.providers p
    where p.id = provider_uuid
      and p.status in ('pending'::provider_status, 'approved'::provider_status)
      and p.visibility_status in (
        'trial'::provider_visibility_status,
        'active'::provider_visibility_status,
        'expired_blurred'::provider_visibility_status
      )
  );
$$;

create or replace function public.bizzi_plan_accepts_payment(plan_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscription_plans sp
    where sp.id = plan_uuid
      and sp.is_active = true
      and sp.price >= 999
  );
$$;

revoke all on function public.bizzi_provider_accepts_payment(uuid) from public;
revoke all on function public.bizzi_plan_accepts_payment(uuid) from public;
grant execute on function public.bizzi_provider_accepts_payment(uuid) to anon, authenticated;
grant execute on function public.bizzi_plan_accepts_payment(uuid) to anon, authenticated;

drop policy if exists "public submit pending payment" on public.payments;
drop policy if exists "public submit pending payment simple" on public.payments;
drop policy if exists "public submit pending payment v115" on public.payments;

create policy "public submit pending payment v115"
on public.payments
as permissive
for insert
to public
with check (
  status = 'pending'::payment_status
  and public.bizzi_provider_accepts_payment(provider_id)
  and public.bizzi_plan_accepts_payment(plan_id)
  and amount >= 999
  and currency = 'FCFA'
  and method in ('wave'::payment_method, 'orange_money'::payment_method, 'mtn_money'::payment_method)
);

notify pgrst, 'reload schema';

-- Controle : doit afficher "public submit pending payment v115".
select
  policyname,
  cmd,
  roles,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'payments'
order by policyname;
