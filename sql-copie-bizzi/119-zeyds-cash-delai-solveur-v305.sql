-- Zeyds V305 - ZEYDS CASH : parcours solutionneur "Je peux aider"
-- (accepter la prime telle quelle + indiquer un delai, au lieu de proposer
-- un prix/une disponibilite en texte libre).
--
-- A executer sur SUPABASE (comme le reste de Zeyds Cash), apres
-- 111-zeyds-cash-rpc-v305.sql. N'ajoute que ce qui manque reellement :
-- cash_solutions existe deja, on lui ajoute 2 colonnes et on assouplit
-- "description" (qui devient optionnelle). Le reste du systeme (selection,
-- finalisation, versement, notation, expiration, wallet) n'est pas touche.

-- 1. Colonnes manquantes sur cash_solutions -------------------------------

alter table public.cash_solutions
  add column if not exists estimated_duration numeric,
  add column if not exists duration_unit text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cash_solutions_duration_unit_check'
  ) then
    alter table public.cash_solutions
      add constraint cash_solutions_duration_unit_check
      check (duration_unit is null or duration_unit in ('heures', 'jours'));
  end if;
end $$;

-- "Explique ta solution" n'est plus obligatoire dans le nouveau parcours
-- (l'engagement, c'est accepter la prime + indiquer un delai).
alter table public.cash_solutions alter column description drop not null;

-- 2. Contrainte anti-doublon (deja verifiee cote application dans
-- cash_submit_solution, ajoutee ici en plus comme garde-fou serveur) : un
-- meme solveur ne peut pas avoir 2 propositions actives sur la meme mission.
create unique index if not exists idx_cash_solutions_one_active_per_solver
  on public.cash_solutions(mission_id, solver_phone) where status = 'pending';

-- 3. cash_submit_solution : nouvelle signature (delai obligatoire, prix/
-- disponibilite retires du parcours, description desormais optionnelle) --

drop function if exists public.cash_submit_solution(uuid, text, text, text, jsonb, text, numeric, text);

create or replace function public.cash_submit_solution(
  p_mission_id uuid,
  p_solver_phone text,
  p_solver_name text,
  p_description text,
  p_attachments jsonb,
  p_contact text,
  p_price_hint numeric,
  p_availability text,
  p_estimated_duration numeric,
  p_duration_unit text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
  max_active integer := public.cash_setting_numeric('cash_max_active_solutions', 3)::integer;
  active_count integer;
  result_row public.cash_solutions%rowtype;
  solver_stats_row public.cash_solver_stats%rowtype;
  duration_label text;
  notif_message text;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if mission_row.status <> 'published' then
    raise exception 'Cette mission n''accepte plus de nouvelles solutions';
  end if;
  if mission_row.expires_at is not null and mission_row.expires_at <= now() then
    raise exception 'Cette mission a expiré';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) = public.bizzi_normalize_phone_digits(p_solver_phone) then
    raise exception 'Vous ne pouvez pas proposer de solution sur votre propre demande';
  end if;
  if trim(coalesce(p_solver_phone, '')) = '' or trim(coalesce(p_solver_name, '')) = '' then
    raise exception 'Identité requise (nom et téléphone)';
  end if;
  if p_duration_unit not in ('heures', 'jours') then
    raise exception 'Délai invalide';
  end if;
  if coalesce(p_estimated_duration, 0) <= 0 then
    raise exception 'Indique le délai nécessaire pour réaliser cette mission';
  end if;

  select count(*) into active_count from public.cash_solutions where mission_id = p_mission_id and status = 'pending';
  if active_count >= max_active then
    raise exception '3 solutions sont déjà proposées pour cette mission';
  end if;
  if exists (
    select 1 from public.cash_solutions
    where mission_id = p_mission_id and status = 'pending'
      and public.bizzi_normalize_phone_digits(solver_phone) = public.bizzi_normalize_phone_digits(p_solver_phone)
  ) then
    raise exception 'Vous avez déjà une proposition active sur cette mission';
  end if;

  insert into public.cash_solutions (
    mission_id, solver_phone, solver_name, description, attachments, contact, price_hint, availability,
    estimated_duration, duration_unit
  )
  values (
    p_mission_id, public.bizzi_normalize_phone_digits(p_solver_phone), trim(p_solver_name),
    nullif(trim(coalesce(p_description, '')), ''), coalesce(p_attachments, '[]'::jsonb),
    nullif(trim(coalesce(p_contact, '')), ''), p_price_hint, nullif(trim(coalesce(p_availability, '')), ''),
    p_estimated_duration, p_duration_unit
  )
  returning * into result_row;

  select * into solver_stats_row from public.cash_solver_stats where user_phone = public.bizzi_normalize_phone_digits(p_solver_phone);
  duration_label := trim(to_char(p_estimated_duration, 'FM999990.##')) || ' ' || p_duration_unit;

  notif_message := trim(p_solver_name)
    || case when solver_stats_row.review_count > 0
         then format(' (⭐%s · %s missions)', to_char(coalesce(solver_stats_row.average_rating, 0), 'FM9.0'), coalesce(solver_stats_row.missions_completed, 0))
         else ' (nouveau solveur)'
       end
    || ' peut vous aider pour "' || mission_row.title || '" — délai annoncé : ' || duration_label;

  perform public.cash_notify(mission_row.requester_phone, 'new_solution', p_mission_id, notif_message);

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.cash_submit_solution(uuid, text, text, text, jsonb, text, numeric, text, numeric, text) from public;
grant execute on function public.cash_submit_solution(uuid, text, text, text, jsonb, text, numeric, text, numeric, text) to anon, authenticated;

-- 4. cash_select_solution : notification enrichie (prime + delai annonce) -

create or replace function public.cash_select_solution(p_mission_id uuid, p_requester_phone text, p_solution_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
  duration_label text;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) <> public.bizzi_normalize_phone_digits(p_requester_phone) then
    raise exception 'Cette mission ne vous appartient pas';
  end if;
  if mission_row.status <> 'published' then
    raise exception 'Cette mission n''est plus ouverte à la sélection';
  end if;

  select * into solution_row from public.cash_solutions where id = p_solution_id and mission_id = p_mission_id;
  if not found or solution_row.status <> 'pending' then
    raise exception 'Solution introuvable ou déjà traitée';
  end if;

  update public.cash_solutions set status = 'rejected'
  where mission_id = p_mission_id and status = 'pending' and id <> p_solution_id;

  update public.cash_solutions set status = 'selected', selected_at = now()
  where id = p_solution_id;

  update public.cash_missions
  set status = 'in_progress', selected_solution_id = p_solution_id, updated_at = now()
  where id = p_mission_id
  returning * into mission_row;

  duration_label := case when solution_row.estimated_duration is not null
    then trim(to_char(solution_row.estimated_duration, 'FM999990.##')) || ' ' || coalesce(solution_row.duration_unit, '')
    else null end;

  perform public.cash_notify(solution_row.solver_phone, 'solution_selected', p_mission_id,
    'Votre proposition a été acceptée 🎉 — "' || mission_row.title || '" · Prime : ' || mission_row.reward_amount::text || ' FCFA'
    || coalesce(' · Délai annoncé : ' || duration_label, ''));
  perform public.cash_notify(s.solver_phone, 'solution_rejected', p_mission_id, 'Une autre solution a été retenue pour "' || mission_row.title || '"')
  from public.cash_solutions s where s.mission_id = p_mission_id and s.id <> p_solution_id and s.status = 'rejected';

  return to_jsonb(mission_row);
end;
$$;

revoke all on function public.cash_select_solution(uuid, text, uuid) from public;
grant execute on function public.cash_select_solution(uuid, text, uuid) to anon, authenticated;

-- 5. cash_list_my_solutions : ajoute la prime pour l'affichage "Mes solutions" -

create or replace function public.cash_list_my_solutions(p_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    to_jsonb(s) || jsonb_build_object(
      'mission_title', m.title, 'mission_status', m.status, 'mission_area', m.area,
      'mission_reward_amount', m.reward_amount
    )
    order by s.submitted_at desc
  ), '[]'::jsonb)
  from public.cash_solutions s
  join public.cash_missions m on m.id = s.mission_id
  where public.bizzi_normalize_phone_digits(s.solver_phone) = public.bizzi_normalize_phone_digits(p_phone);
$$;

revoke all on function public.cash_list_my_solutions(text) from public;
grant execute on function public.cash_list_my_solutions(text) to anon, authenticated;

notify pgrst, 'reload schema';

select 'Zeyds V305 Cash parcours solutionneur (delai) installe' as statut;
