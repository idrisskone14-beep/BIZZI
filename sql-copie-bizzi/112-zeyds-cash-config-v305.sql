-- Zeyds V305 - ZEYDS CASH : reglages par defaut (platform_settings, meme
-- table generique que les feature flags - 104-feature-flags-v304.sql).
-- A executer sur SUPABASE, apres 111-zeyds-cash-rpc-v305.sql.
--
-- Administration : reutilise telles quelles les RPC generiques deja en
-- production (admin_list_platform_settings / admin_set_platform_setting,
-- 103-super-admin-v304.sql), pas besoin de nouvelle RPC d'ecriture. Lecture
-- publique restreinte au prefixe cash_ via public_get_cash_settings()
-- (111-zeyds-cash-rpc-v305.sql).

insert into public.platform_settings (key, value) values
  ('cash_commission_rate', '0.10'::jsonb),
  ('cash_max_active_solutions', '3'::jsonb),
  ('cash_credit_validity_days', '45'::jsonb),
  ('cash_min_reward', '500'::jsonb),
  ('cash_max_reward', '500000'::jsonb),
  ('cash_completion_reminder_hours', '24'::jsonb),
  ('cash_completion_autoresolve_hours', '72'::jsonb)
on conflict (key) do nothing;

notify pgrst, 'reload schema';

select
  'Zeyds V305 Cash config installee' as statut,
  (select count(*) from public.platform_settings where key like 'cash_%') as reglages_configures;
