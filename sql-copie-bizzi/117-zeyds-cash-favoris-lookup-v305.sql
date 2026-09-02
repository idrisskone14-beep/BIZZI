-- Zeyds V305 - Module Favoris : resolution groupee des missions Cash
-- favorites.
--
-- A executer sur SUPABASE (PAS sur Neon), apres 111-zeyds-cash-rpc-v305.sql.
-- Les favoris eux-memes vivent sur Neon (116-favoris-v305.sql, donnee non
-- financiere), mais les missions Zeyds Cash vivent sur Supabase (systeme
-- financier - voir l'en-tete de 110-zeyds-cash-schema-v305.sql). Cette RPC
-- permet au frontend de resoudre en un seul appel les favoris de type
-- "cash" (evite le N+1 : un favori par mission plutot qu'une requete par
-- mission), meme forme que public_cash_feed.

create or replace function public.cash_list_missions_by_ids(p_ids uuid[])
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'title', m.title,
      'description', m.description,
      'category', m.category,
      'area', m.area,
      'deadline_at', m.deadline_at,
      'reward_amount', m.reward_amount,
      'status', m.status,
      'secured', m.secured,
      'requester_name', m.requester_name,
      'created_at', m.created_at,
      'expires_at', m.expires_at,
      'active_solutions_count', (select count(*) from public.cash_solutions s where s.mission_id = m.id and s.status = 'pending')
    )
    order by m.created_at desc
  ), '[]'::jsonb)
  from public.cash_missions m
  where m.id = any(coalesce(p_ids, array[]::uuid[]));
$$;

revoke all on function public.cash_list_missions_by_ids(uuid[]) from public;
grant execute on function public.cash_list_missions_by_ids(uuid[]) to anon, authenticated;

notify pgrst, 'reload schema';

select 'Zeyds V305 Cash favoris lookup installe (Supabase)' as statut;
