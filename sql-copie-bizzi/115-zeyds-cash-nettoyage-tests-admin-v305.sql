-- Zeyds V305 - ZEYDS CASH : nettoyage des 2 missions de test creees pour
-- verifier le panneau admin (approbation de paiement + resolution de
-- litige). A executer sur SUPABASE, une seule fois.
--
-- Contrairement au nettoyage precedent (114), ces 2 missions sont
-- entierement synthetiques (pas des demos reelles) : on peut les supprimer
-- directement, cascade sur cash_solutions/cash_disputes.

delete from public.cash_transactions
where mission_id in ('bf3abbaa-6c90-4b5e-abad-a78e2f895bae', '2b9896b0-fdcc-4df5-bfe3-96987354e618');

delete from public.cash_missions
where id in ('bf3abbaa-6c90-4b5e-abad-a78e2f895bae', '2b9896b0-fdcc-4df5-bfe3-96987354e618');

delete from public.cash_wallets where user_phone in ('0755555503');
delete from public.cash_solver_stats where user_phone in ('0755555503');

delete from public.cash_notifications
where user_phone in ('0755555501', '0755555502', '0755555503')
   or mission_id in ('bf3abbaa-6c90-4b5e-abad-a78e2f895bae', '2b9896b0-fdcc-4df5-bfe3-96987354e618');

select
  'Nettoyage des tests admin termine' as statut,
  (select count(*) from public.cash_missions where requester_phone like '07000000%') as missions_demo_restantes,
  (select count(*) from public.cash_missions where requester_phone like '0755555%') as missions_test_restantes;
