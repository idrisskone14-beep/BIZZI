-- Bizzi - Correction RLS paiements forfaits V87
-- Objectif :
-- Permettre a un prestataire visible ou en attente d'envoyer un paiement forfait
-- depuis l'application publique, sans compte client/prestataire connecte.
--
-- Probleme corrige :
-- "new row violates row-level security policy for table payments"
--
-- A executer dans Supabase > SQL Editor > New query.

grant insert on public.payments to anon, authenticated;
grant select on public.subscription_plans to anon, authenticated;

drop policy if exists "public submit pending payment" on public.payments;
create policy "public submit pending payment"
on public.payments for insert
to anon, authenticated
with check (
  status = 'pending'
  and exists (
    select 1
    from public.providers p
    where p.id = provider_id
      and p.status in ('pending', 'approved')
      and p.visibility_status in ('trial', 'active', 'expired_blurred')
  )
  and exists (
    select 1
    from public.subscription_plans sp
    where sp.id = plan_id
      and sp.is_active = true
  )
  and amount >= 999
  and currency = 'FCFA'
  and method in ('wave', 'orange_money', 'mtn_money')
);

notify pgrst, 'reload schema';

-- Controle : doit afficher la nouvelle policy.
select
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'payments'
order by policyname;

