-- Zeyds V305 - ZEYDS CASH : nettoyage des donnees creees pendant la
-- verification manuelle du module (session de test). A executer sur
-- SUPABASE, une seule fois. Sans effet si deja execute (toutes les
-- suppressions sont ciblees par identifiants precis).

-- 1. Mission de test "Test end-to-end Claude" (paiement en attente)
delete from public.cash_transactions
where mission_id in (
  select id from public.cash_missions
  where requester_phone = '0733333333' and title = 'Test end-to-end Claude'
);

delete from public.cash_missions
where requester_phone = '0733333333' and title = 'Test end-to-end Claude';

-- 2. Litige de test sur la mission demo "Appartement 2 pieces a Cocody"
delete from public.cash_disputes
where mission_id = 'f6f0854f-91a4-446b-aed1-a65015bd532e';

delete from public.cash_solutions
where mission_id = 'f6f0854f-91a4-446b-aed1-a65015bd532e' and solver_phone = '0744444444';

update public.cash_missions
set status = 'published', selected_solution_id = null, updated_at = now()
where id = 'f6f0854f-91a4-446b-aed1-a65015bd532e';

-- 3. Restaurer la mission demo "Mecanicien disponible maintenant a Cocody"
--    a son etat initial (mon test complet l'avait menee jusqu'au versement)
delete from public.cash_reviews
where mission_id = '5c002640-cfee-4561-aefa-b9bb498e9aa2';

delete from public.cash_transactions
where mission_id = '5c002640-cfee-4561-aefa-b9bb498e9aa2'
  and type in ('reward_payout', 'commission');

delete from public.cash_solutions
where mission_id = '5c002640-cfee-4561-aefa-b9bb498e9aa2' and solver_phone = '0711111111';

update public.cash_missions
set status = 'published', selected_solution_id = null, updated_at = now()
where id = '5c002640-cfee-4561-aefa-b9bb498e9aa2';

-- 4. Faux profils solveur / wallet crees pour les identites de test
delete from public.cash_wallets where user_phone in ('0711111111');
delete from public.cash_solver_stats where user_phone in ('0711111111', '0744444444');

-- 5. Notifications generees pendant les tests
delete from public.cash_notifications
where user_phone in ('0733333333', '0711111111', '0744444444')
   or mission_id in ('5c002640-cfee-4561-aefa-b9bb498e9aa2', 'f6f0854f-91a4-446b-aed1-a65015bd532e');

select
  'Nettoyage des donnees de test termine' as statut,
  (select count(*) from public.cash_missions where requester_phone like '07000000%') as missions_demo_restantes;
