-- Zeyds V305 - Fait correspondre les feature flags a l'etat reellement
-- affiche aujourd'hui : Food, Evenements et Lieux d'exception etaient
-- masques via une regle CSS codee en dur (desormais supprimee, voir
-- styles.css) alors que ces 3 flags valaient "true" dans platform_settings
-- - le panneau Super Admin affichait donc ces onglets comme actifs alors
-- qu'ils etaient invisibles partout. A executer sur SUPABASE.
--
-- Sans effet visuel immediat pour les visiteurs (ces modules restent
-- masques, exactement comme avant) - mais desormais le panneau Super Admin
-- ("Onglets de la plateforme") dit la verite ET peut reellement les
-- reactiver en un clic, puisque plus aucune regle CSS ne s'y oppose.

update public.platform_settings
set value = 'false'::jsonb, updated_at = now()
where key in ('tab_food', 'tab_events', 'tab_exception_places');

select key, value from public.platform_settings where key in ('tab_food', 'tab_events', 'tab_exception_places');
