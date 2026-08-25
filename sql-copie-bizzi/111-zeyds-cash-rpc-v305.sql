-- Zeyds V305 - ZEYDS CASH : RPC (parcours demandeur/solveur identifies par
-- telephone + actions admin). A executer sur SUPABASE, apres
-- 110-zeyds-cash-schema-v305.sql.
--
-- Convention : toutes les fonctions utilisateur prennent le telephone en
-- parametre et verifient l'appartenance par comparaison normalisee
-- (bizzi_normalize_phone_digits), meme pattern que
-- provider_accept_service_request (109). Toutes les fonctions qui modifient
-- une mission verrouillent la ligne (select ... for update) pour serialiser
-- les appels concurrents (ex : deux solveurs qui proposent en meme temps
-- quand il ne reste qu'une place sur 3).
--
-- Simplification assumee sur l'ordre notation/paiement : la demande produit
-- decrit "confirmation -> notation -> distribution". Pour ne jamais bloquer
-- le paiement du solveur si le demandeur confirme puis ignore l'ecran de
-- notation, la distribution se declenche a la confirmation
-- (cash_confirm_completion), et la notation (cash_submit_review) reste une
-- action independante, non bloquante pour le versement.

-- 0. Utilitaires internes ------------------------------------------------------

create or replace function public.cash_setting_numeric(p_key text, p_default numeric)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select (value)::text::numeric from public.platform_settings where key = p_key), p_default);
$$;

create or replace function public.cash_notify(p_user_phone text, p_type text, p_mission_id uuid, p_message text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.cash_notifications (user_phone, type, mission_id, message)
  select public.bizzi_normalize_phone_digits(p_user_phone), p_type, p_mission_id, p_message
  where p_user_phone is not null and trim(p_user_phone) <> '';
$$;

-- Distribution du gain : idempotente (index unique partiel sur
-- cash_transactions), jamais appelee directement par le frontend (pas de
-- grant execute a anon/authenticated), uniquement depuis les fonctions
-- ci-dessous qui ont deja verifie les conditions d'appel.
create or replace function public.cash_distribute_reward(p_mission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
  commission_rate numeric := public.cash_setting_numeric('cash_commission_rate', 0.10);
  solver_amount numeric;
  commission_amount numeric;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;

  -- Idempotence explicite en plus de l'index unique : evite une exception
  -- bruyante si la fonction est rejouee (retry reseau, double clic deja
  -- absorbe cote UI mais on protege aussi le serveur).
  if exists (
    select 1 from public.cash_transactions
    where mission_id = p_mission_id and type = 'reward_payout' and status = 'confirmed'
  ) then
    return;
  end if;

  if mission_row.selected_solution_id is null then
    raise exception 'Aucune solution selectionnee pour cette mission';
  end if;

  select * into solution_row from public.cash_solutions where id = mission_row.selected_solution_id;
  if not found then
    raise exception 'Solution selectionnee introuvable';
  end if;

  commission_rate := least(greatest(commission_rate, 0), 1);
  commission_amount := round(mission_row.reward_amount * commission_rate);
  solver_amount := mission_row.reward_amount - commission_amount;

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status, raw_payload)
  values (
    p_mission_id, public.bizzi_normalize_phone_digits(solution_row.solver_phone), 'reward_payout', solver_amount, 'confirmed',
    jsonb_build_object('commission_rate', commission_rate, 'reward_amount', mission_row.reward_amount)
  );

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status, raw_payload)
  values (
    p_mission_id, null, 'commission', commission_amount, 'confirmed',
    jsonb_build_object('commission_rate', commission_rate, 'solver_phone', solution_row.solver_phone)
  );

  update public.cash_solver_stats
  set missions_completed = missions_completed + 1, updated_at = now()
  where user_phone = public.bizzi_normalize_phone_digits(solution_row.solver_phone);
  insert into public.cash_solver_stats (user_phone, missions_completed)
  select public.bizzi_normalize_phone_digits(solution_row.solver_phone), 1
  where not exists (
    select 1 from public.cash_solver_stats where user_phone = public.bizzi_normalize_phone_digits(solution_row.solver_phone)
  );

  perform public.cash_notify(solution_row.solver_phone, 'payment_received', p_mission_id,
    'Paiement reçu : ' || solver_amount::text || ' FCFA pour "' || mission_row.title || '"');
end;
$$;

revoke all on function public.cash_distribute_reward(uuid) from public;

-- Octroi d'un credit ZEYDS Cash (mission expiree ou litige resolu en faveur
-- du demandeur) - pas de rail de paiement reel connecte, donc le
-- remboursement prend la forme d'un credit reutilisable (abstraction
-- assumee, voir section credits de la demande produit).
create or replace function public.cash_grant_credit(p_mission_id uuid, p_user_phone text, p_amount numeric, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  validity_days numeric := public.cash_setting_numeric('cash_credit_validity_days', 45);
begin
  if p_amount <= 0 then
    return;
  end if;
  insert into public.cash_credits (user_phone, source_mission_id, initial_amount, remaining_amount, status, expires_at)
  values (public.bizzi_normalize_phone_digits(p_user_phone), p_mission_id, p_amount, p_amount, 'active', now() + make_interval(days => greatest(validity_days, 1)::int));

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status, raw_payload)
  values (p_mission_id, public.bizzi_normalize_phone_digits(p_user_phone), 'credit_grant', p_amount, 'confirmed', jsonb_build_object('reason', p_reason));

  perform public.cash_notify(p_user_phone, 'credit_granted', p_mission_id,
    'Crédit ZEYDS Cash de ' || p_amount::text || ' FCFA (' || coalesce(p_reason, '') || '), valable ' || validity_days::text || ' jours');
end;
$$;

revoke all on function public.cash_grant_credit(uuid, text, numeric, text) from public;

-- 1. Creation / paiement de mission ---------------------------------------------

create or replace function public.cash_create_mission_draft(
  p_requester_phone text,
  p_requester_name text,
  p_title text,
  p_description text,
  p_category text,
  p_area text,
  p_attachments jsonb,
  p_deadline_type text,
  p_deadline_at timestamptz,
  p_reward_amount numeric,
  p_service_budget_hint numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  min_reward numeric := public.cash_setting_numeric('cash_min_reward', 500);
  max_reward numeric := public.cash_setting_numeric('cash_max_reward', 500000);
  computed_deadline timestamptz;
  result_row public.cash_missions%rowtype;
begin
  if trim(coalesce(p_requester_phone, '')) = '' or trim(coalesce(p_requester_name, '')) = '' then
    raise exception 'Identité requise (nom et téléphone)';
  end if;
  if trim(coalesce(p_title, '')) = '' then
    raise exception 'Décris ce que tu recherches';
  end if;
  if p_reward_amount < min_reward or p_reward_amount > max_reward then
    raise exception 'La prime doit être comprise entre % et % FCFA', min_reward, max_reward;
  end if;

  computed_deadline := case p_deadline_type
    when 'aujourd_hui' then date_trunc('day', now()) + interval '23 hours 59 minutes'
    when 'demain' then date_trunc('day', now()) + interval '1 day 23 hours 59 minutes'
    when 'urgent' then now() + interval '24 hours'
    when 'date_personnalisee' then p_deadline_at
    else now() + interval '7 days'
  end;
  if computed_deadline is null then
    raise exception 'Échéance invalide';
  end if;

  insert into public.cash_missions (
    requester_phone, requester_name, title, description, category, area,
    attachments, deadline_type, deadline_at, reward_amount, service_budget_hint,
    status, expires_at
  )
  values (
    public.bizzi_normalize_phone_digits(p_requester_phone), trim(p_requester_name), trim(p_title),
    nullif(trim(coalesce(p_description, '')), ''), coalesce(nullif(trim(p_category), ''), 'Autre'),
    coalesce(nullif(trim(p_area), ''), 'Toute la ville'), coalesce(p_attachments, '[]'::jsonb),
    coalesce(p_deadline_type, 'cette_semaine'), computed_deadline, p_reward_amount, p_service_budget_hint,
    'draft', computed_deadline
  )
  returning * into result_row;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.cash_create_mission_draft(text, text, text, text, text, text, jsonb, text, timestamptz, numeric, numeric) from public;
grant execute on function public.cash_create_mission_draft(text, text, text, text, text, text, jsonb, text, timestamptz, numeric, numeric) to anon, authenticated;

create or replace function public.cash_declare_mission_payment(
  p_mission_id uuid,
  p_requester_phone text,
  p_payment_method text,
  p_transaction_reference text,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) <> public.bizzi_normalize_phone_digits(p_requester_phone) then
    raise exception 'Cette mission ne vous appartient pas';
  end if;
  if mission_row.status not in ('draft') then
    raise exception 'Cette mission a déjà un paiement déclaré ou publié';
  end if;
  if trim(coalesce(p_transaction_reference, '')) = '' then
    raise exception 'Référence de transaction requise';
  end if;
  if round(coalesce(p_amount, 0)) <> round(mission_row.reward_amount) then
    raise exception 'Le montant déclaré ne correspond pas à la prime de la mission';
  end if;

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status, payment_reference, payment_method)
  values (p_mission_id, public.bizzi_normalize_phone_digits(p_requester_phone), 'mission_escrow', p_amount, 'pending', trim(p_transaction_reference), p_payment_method);

  update public.cash_missions
  set status = 'payment_pending', updated_at = now()
  where id = p_mission_id
  returning * into mission_row;

  return to_jsonb(mission_row);
end;
$$;

revoke all on function public.cash_declare_mission_payment(uuid, text, text, text, numeric) from public;
grant execute on function public.cash_declare_mission_payment(uuid, text, text, text, numeric) to anon, authenticated;

-- Utiliser un credit ZEYDS Cash existant pour couvrir integralement une
-- mission en brouillon (pas de mélange credit + paiement manuel partiel,
-- pour rester simple et sans possibilité de manipulation du montant : le
-- montant est toujours derive server-side de reward_amount, jamais fourni
-- par l'appelant).
create or replace function public.cash_use_credit_for_mission(
  p_credit_id uuid,
  p_mission_id uuid,
  p_requester_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
  credit_row public.cash_credits%rowtype;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) <> public.bizzi_normalize_phone_digits(p_requester_phone) then
    raise exception 'Cette mission ne vous appartient pas';
  end if;
  if mission_row.status <> 'draft' then
    raise exception 'Cette mission ne peut plus être payée par crédit';
  end if;

  select * into credit_row from public.cash_credits where id = p_credit_id for update;
  if not found then
    raise exception 'Crédit introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(credit_row.user_phone) <> public.bizzi_normalize_phone_digits(p_requester_phone) then
    raise exception 'Ce crédit ne vous appartient pas';
  end if;
  if credit_row.status <> 'active' or credit_row.expires_at <= now() then
    raise exception 'Ce crédit n''est plus valide';
  end if;
  if credit_row.remaining_amount < mission_row.reward_amount then
    raise exception 'Crédit insuffisant pour couvrir cette prime (utilisez le paiement manuel pour le complément)';
  end if;

  update public.cash_credits
  set remaining_amount = remaining_amount - mission_row.reward_amount,
      status = case when remaining_amount - mission_row.reward_amount <= 0 then 'consumed' else status end
  where id = p_credit_id;

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status)
  values (p_mission_id, public.bizzi_normalize_phone_digits(p_requester_phone), 'credit_redeem', mission_row.reward_amount, 'confirmed');

  insert into public.cash_transactions (mission_id, user_phone, type, amount, status, raw_payload)
  values (p_mission_id, public.bizzi_normalize_phone_digits(p_requester_phone), 'mission_escrow', mission_row.reward_amount, 'confirmed', jsonb_build_object('source', 'credit', 'credit_id', p_credit_id));

  update public.cash_missions
  set status = 'published', secured = true, updated_at = now()
  where id = p_mission_id
  returning * into mission_row;

  return to_jsonb(mission_row);
end;
$$;

revoke all on function public.cash_use_credit_for_mission(uuid, uuid, text) from public;
grant execute on function public.cash_use_credit_for_mission(uuid, uuid, text) to anon, authenticated;

-- 2. Solutions --------------------------------------------------------------------

create or replace function public.cash_submit_solution(
  p_mission_id uuid,
  p_solver_phone text,
  p_solver_name text,
  p_description text,
  p_attachments jsonb,
  p_contact text,
  p_price_hint numeric,
  p_availability text
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
  if trim(coalesce(p_description, '')) = '' then
    raise exception 'Décris ta solution';
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
    raise exception 'Vous avez déjà une solution active sur cette mission';
  end if;

  insert into public.cash_solutions (mission_id, solver_phone, solver_name, description, attachments, contact, price_hint, availability)
  values (
    p_mission_id, public.bizzi_normalize_phone_digits(p_solver_phone), trim(p_solver_name), trim(p_description),
    coalesce(p_attachments, '[]'::jsonb), nullif(trim(coalesce(p_contact, '')), ''), p_price_hint, nullif(trim(coalesce(p_availability, '')), '')
  )
  returning * into result_row;

  perform public.cash_notify(mission_row.requester_phone, 'new_solution', p_mission_id,
    trim(p_solver_name) || ' a proposé une solution pour "' || mission_row.title || '"');

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.cash_submit_solution(uuid, text, text, text, jsonb, text, numeric, text) from public;
grant execute on function public.cash_submit_solution(uuid, text, text, text, jsonb, text, numeric, text) to anon, authenticated;

create or replace function public.cash_withdraw_solution(p_solution_id uuid, p_solver_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  solution_row public.cash_solutions%rowtype;
begin
  select * into solution_row from public.cash_solutions where id = p_solution_id for update;
  if not found then
    raise exception 'Solution introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(solution_row.solver_phone) <> public.bizzi_normalize_phone_digits(p_solver_phone) then
    raise exception 'Cette solution ne vous appartient pas';
  end if;
  if solution_row.status <> 'pending' then
    raise exception 'Cette solution ne peut plus être retirée';
  end if;

  update public.cash_solutions set status = 'withdrawn' where id = p_solution_id returning * into solution_row;
  return to_jsonb(solution_row);
end;
$$;

revoke all on function public.cash_withdraw_solution(uuid, text) from public;
grant execute on function public.cash_withdraw_solution(uuid, text) to anon, authenticated;

create or replace function public.cash_select_solution(p_mission_id uuid, p_requester_phone text, p_solution_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
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

  perform public.cash_notify(solution_row.solver_phone, 'solution_selected', p_mission_id,
    'Ta solution a été choisie pour "' || mission_row.title || '" !');
  perform public.cash_notify(s.solver_phone, 'solution_rejected', p_mission_id, 'Une autre solution a été retenue pour "' || mission_row.title || '"')
  from public.cash_solutions s where s.mission_id = p_mission_id and s.id <> p_solution_id and s.status = 'rejected';

  return to_jsonb(mission_row);
end;
$$;

revoke all on function public.cash_select_solution(uuid, text, uuid) from public;
grant execute on function public.cash_select_solution(uuid, text, uuid) to anon, authenticated;

-- 3. Finalisation / confirmation / notation --------------------------------------

create or replace function public.cash_solver_finalize_mission(p_mission_id uuid, p_solver_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if mission_row.status <> 'in_progress' then
    raise exception 'Cette mission n''est pas en cours';
  end if;

  select * into solution_row from public.cash_solutions where id = mission_row.selected_solution_id;
  if not found or public.bizzi_normalize_phone_digits(solution_row.solver_phone) <> public.bizzi_normalize_phone_digits(p_solver_phone) then
    raise exception 'Vous n''êtes pas le solveur retenu pour cette mission';
  end if;

  update public.cash_missions
  set status = 'completion_pending', completion_pending_at = now(), reminder_stage = 0, updated_at = now()
  where id = p_mission_id
  returning * into mission_row;

  perform public.cash_notify(mission_row.requester_phone, 'completion_pending', p_mission_id,
    solution_row.solver_name || ' indique avoir terminé "' || mission_row.title || '" — confirme la réception.');

  return to_jsonb(mission_row);
end;
$$;

revoke all on function public.cash_solver_finalize_mission(uuid, text) from public;
grant execute on function public.cash_solver_finalize_mission(uuid, text) to anon, authenticated;

create or replace function public.cash_confirm_completion(p_mission_id uuid, p_requester_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) <> public.bizzi_normalize_phone_digits(p_requester_phone) then
    raise exception 'Cette mission ne vous appartient pas';
  end if;
  if mission_row.status not in ('in_progress', 'completion_pending') then
    raise exception 'Cette mission ne peut pas être confirmée dans son état actuel';
  end if;

  update public.cash_missions set status = 'completed', updated_at = now() where id = p_mission_id returning * into mission_row;
  perform public.cash_distribute_reward(p_mission_id);

  return to_jsonb(mission_row);
end;
$$;

revoke all on function public.cash_confirm_completion(uuid, text) from public;
grant execute on function public.cash_confirm_completion(uuid, text) to anon, authenticated;

create or replace function public.cash_submit_review(
  p_mission_id uuid,
  p_reviewer_phone text,
  p_rating integer,
  p_speed_rating integer,
  p_reliability_rating integer,
  p_quality_rating integer,
  p_comment text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
  result_row public.cash_reviews%rowtype;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if public.bizzi_normalize_phone_digits(mission_row.requester_phone) <> public.bizzi_normalize_phone_digits(p_reviewer_phone) then
    raise exception 'Seul le demandeur peut noter cette mission';
  end if;
  if mission_row.status <> 'completed' then
    raise exception 'Cette mission n''est pas encore terminée';
  end if;

  select * into solution_row from public.cash_solutions where id = mission_row.selected_solution_id;
  if not found then
    raise exception 'Solveur introuvable pour cette mission';
  end if;

  insert into public.cash_reviews (mission_id, reviewer_phone, reviewed_phone, rating, speed_rating, reliability_rating, quality_rating, comment)
  values (
    p_mission_id, public.bizzi_normalize_phone_digits(p_reviewer_phone), public.bizzi_normalize_phone_digits(solution_row.solver_phone),
    greatest(least(p_rating, 5), 1), p_speed_rating, p_reliability_rating, p_quality_rating, nullif(trim(coalesce(p_comment, '')), '')
  )
  on conflict (mission_id, reviewer_phone) do update
  set rating = excluded.rating, speed_rating = excluded.speed_rating,
      reliability_rating = excluded.reliability_rating, quality_rating = excluded.quality_rating, comment = excluded.comment
  returning * into result_row;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.cash_submit_review(uuid, text, integer, integer, integer, integer, text) from public;
grant execute on function public.cash_submit_review(uuid, text, integer, integer, integer, integer, text) to anon, authenticated;

-- 4. Litiges ------------------------------------------------------------------------

create or replace function public.cash_open_dispute(
  p_mission_id uuid,
  p_opened_by_phone text,
  p_category text,
  p_description text,
  p_attachments jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
  result_row public.cash_disputes%rowtype;
  is_requester boolean;
  is_solver boolean;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if mission_row.status not in ('in_progress', 'completion_pending') then
    raise exception 'Un litige ne peut être ouvert que sur une mission en cours';
  end if;

  select * into solution_row from public.cash_solutions where id = mission_row.selected_solution_id;

  is_requester := public.bizzi_normalize_phone_digits(mission_row.requester_phone) = public.bizzi_normalize_phone_digits(p_opened_by_phone);
  is_solver := found and public.bizzi_normalize_phone_digits(solution_row.solver_phone) = public.bizzi_normalize_phone_digits(p_opened_by_phone);
  if not (is_requester or is_solver) then
    raise exception 'Vous n''êtes pas concerné par cette mission';
  end if;
  if exists (select 1 from public.cash_disputes where mission_id = p_mission_id and status in ('open', 'under_review')) then
    raise exception 'Un litige est déjà en cours pour cette mission';
  end if;

  insert into public.cash_disputes (mission_id, opened_by_phone, category, description, attachments)
  values (p_mission_id, public.bizzi_normalize_phone_digits(p_opened_by_phone), coalesce(nullif(trim(p_category), ''), 'autre'), trim(p_description), coalesce(p_attachments, '[]'::jsonb))
  returning * into result_row;

  update public.cash_missions set status = 'disputed', updated_at = now() where id = p_mission_id;

  perform public.cash_notify(mission_row.requester_phone, 'dispute_opened', p_mission_id, 'Litige ouvert sur "' || mission_row.title || '" — fonds bloqués en attendant l''examen ZEYDS.');
  if solution_row.solver_phone is not null then
    perform public.cash_notify(solution_row.solver_phone, 'dispute_opened', p_mission_id, 'Litige ouvert sur "' || mission_row.title || '" — fonds bloqués en attendant l''examen ZEYDS.');
  end if;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.cash_open_dispute(uuid, text, text, text, jsonb) from public;
grant execute on function public.cash_open_dispute(uuid, text, text, text, jsonb) to anon, authenticated;

-- 5. Lecture (les tables de base sont verrouillees : tout passe par ici) -----------

create or replace function public.cash_get_mission_detail(p_mission_id uuid, p_caller_phone text default '')
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
  caller_norm text := public.bizzi_normalize_phone_digits(p_caller_phone);
  is_owner boolean;
  solutions_json jsonb;
  dispute_json jsonb;
begin
  select * into mission_row from public.cash_missions where id = p_mission_id;
  if not found then
    return null;
  end if;
  is_owner := caller_norm is not null and caller_norm = public.bizzi_normalize_phone_digits(mission_row.requester_phone);

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'solver_name', s.solver_name,
      'solver_phone', case when is_owner or public.bizzi_normalize_phone_digits(s.solver_phone) = caller_norm then s.solver_phone else null end,
      'contact', case when is_owner or public.bizzi_normalize_phone_digits(s.solver_phone) = caller_norm then s.contact else null end,
      'description', s.description,
      'attachments', s.attachments,
      'price_hint', s.price_hint,
      'availability', s.availability,
      'status', s.status,
      'submitted_at', s.submitted_at,
      'is_mine', public.bizzi_normalize_phone_digits(s.solver_phone) = caller_norm,
      'solver_stats', (select to_jsonb(st) - 'user_phone' from public.cash_solver_stats st where st.user_phone = public.bizzi_normalize_phone_digits(s.solver_phone))
    )
    order by s.submitted_at asc
  ), '[]'::jsonb)
  into solutions_json
  from public.cash_solutions s
  where s.mission_id = p_mission_id
    and (is_owner or public.bizzi_normalize_phone_digits(s.solver_phone) = caller_norm or s.status = 'selected');

  select to_jsonb(d) into dispute_json from public.cash_disputes d
  where d.mission_id = p_mission_id order by d.created_at desc limit 1;

  -- Compte total independant de la visibilite (les propositions des autres
  -- solveurs sont masquees dans "solutions" par souci de confidentialite,
  -- mais le badge X/3 doit rester exact pour tout le monde).
  return to_jsonb(mission_row)
    || jsonb_build_object(
      'is_owner', is_owner,
      'solutions', solutions_json,
      'dispute', dispute_json,
      'active_solutions_count', (select count(*) from public.cash_solutions s2 where s2.mission_id = p_mission_id and s2.status = 'pending')
    )
    || jsonb_build_object('requester_phone', case when is_owner then mission_row.requester_phone else null end);
end;
$$;

revoke all on function public.cash_get_mission_detail(uuid, text) from public;
grant execute on function public.cash_get_mission_detail(uuid, text) to anon, authenticated;

create or replace function public.cash_list_my_missions(p_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    to_jsonb(m) || jsonb_build_object(
      'active_solutions_count', (select count(*) from public.cash_solutions s where s.mission_id = m.id and s.status = 'pending')
    )
    order by m.created_at desc
  ), '[]'::jsonb)
  from public.cash_missions m
  where public.bizzi_normalize_phone_digits(m.requester_phone) = public.bizzi_normalize_phone_digits(p_phone);
$$;

revoke all on function public.cash_list_my_missions(text) from public;
grant execute on function public.cash_list_my_missions(text) to anon, authenticated;

create or replace function public.cash_list_my_solutions(p_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    to_jsonb(s) || jsonb_build_object('mission_title', m.title, 'mission_status', m.status, 'mission_area', m.area)
    order by s.submitted_at desc
  ), '[]'::jsonb)
  from public.cash_solutions s
  join public.cash_missions m on m.id = s.mission_id
  where public.bizzi_normalize_phone_digits(s.solver_phone) = public.bizzi_normalize_phone_digits(p_phone);
$$;

revoke all on function public.cash_list_my_solutions(text) from public;
grant execute on function public.cash_list_my_solutions(text) to anon, authenticated;

create or replace function public.cash_wallet_summary(p_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'balance', coalesce((select balance from public.cash_wallets where user_phone = public.bizzi_normalize_phone_digits(p_phone)), 0),
    'transactions', coalesce((
      select jsonb_agg(to_jsonb(t) order by t.created_at desc)
      from public.cash_transactions t
      where t.user_phone = public.bizzi_normalize_phone_digits(p_phone)
      limit 200
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.cash_wallet_summary(text) from public;
grant execute on function public.cash_wallet_summary(text) to anon, authenticated;

create or replace function public.cash_list_my_credits(p_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at desc), '[]'::jsonb)
  from public.cash_credits c
  where public.bizzi_normalize_phone_digits(c.user_phone) = public.bizzi_normalize_phone_digits(p_phone);
$$;

revoke all on function public.cash_list_my_credits(text) from public;
grant execute on function public.cash_list_my_credits(text) to anon, authenticated;

create or replace function public.cash_list_my_notifications(p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  response jsonb;
begin
  select coalesce(jsonb_agg(to_jsonb(n) order by n.created_at desc), '[]'::jsonb) into response
  from public.cash_notifications n
  where public.bizzi_normalize_phone_digits(n.user_phone) = public.bizzi_normalize_phone_digits(p_phone)
  limit 50;

  update public.cash_notifications
  set read_at = now()
  where public.bizzi_normalize_phone_digits(user_phone) = public.bizzi_normalize_phone_digits(p_phone) and read_at is null;

  return response;
end;
$$;

revoke all on function public.cash_list_my_notifications(text) from public;
grant execute on function public.cash_list_my_notifications(text) to anon, authenticated;

create or replace function public.cash_get_solver_profile(p_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(to_jsonb(st), jsonb_build_object(
    'user_phone', public.bizzi_normalize_phone_digits(p_phone), 'average_rating', 0, 'review_count', 0,
    'missions_won', 0, 'missions_completed', 0, 'dispute_count', 0
  ))
  from public.cash_solver_stats st
  where st.user_phone = public.bizzi_normalize_phone_digits(p_phone);
$$;

revoke all on function public.cash_get_solver_profile(text) from public;
grant execute on function public.cash_get_solver_profile(text) to anon, authenticated;

-- Reglages publics (memes cles cash_% que platform_settings, meme moule que
-- public_get_feature_flags).
create or replace function public.public_get_cash_settings()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
  from public.platform_settings
  where key like 'cash_%';
$$;

revoke all on function public.public_get_cash_settings() from public;
grant execute on function public.public_get_cash_settings() to anon, authenticated;

-- 6. Balayage paresseux (expiration / relance) - pas de pg_cron sur ce projet,
-- meme convention que le reste de l'app (expiration calculee a l'usage,
-- cf. app.js refreshExpiredEventVisibility) mais ici cote serveur et
-- idempotent : n'importe quel client peut l'appeler sans risque en marge
-- de son propre chargement de page.

create or replace function public.cash_sweep_expired(p_limit integer default 50)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  autoresolve_hours numeric := public.cash_setting_numeric('cash_completion_autoresolve_hours', 72);
  expired_count integer := 0;
  autoresolved_count integer := 0;
  credits_expired_count integer := 0;
  mission_row record;
begin
  for mission_row in
    select id, requester_phone, reward_amount, title from public.cash_missions
    where status = 'published' and expires_at is not null and expires_at <= now()
    limit p_limit
  loop
    update public.cash_missions set status = 'expired', updated_at = now() where id = mission_row.id;
    perform public.cash_grant_credit(mission_row.id, mission_row.requester_phone, mission_row.reward_amount, 'Aucune solution validée avant l''échéance');
    perform public.cash_notify(mission_row.requester_phone, 'mission_expired', mission_row.id,
      '"' || mission_row.title || '" a expiré sans solution retenue — la prime devient un crédit ZEYDS Cash.');
    expired_count := expired_count + 1;
  end loop;

  for mission_row in
    select id from public.cash_missions
    where status = 'completion_pending' and completion_pending_at is not null
      and completion_pending_at <= now() - make_interval(hours => greatest(autoresolve_hours, 1)::int)
    limit p_limit
  loop
    update public.cash_missions set status = 'completed', updated_at = now() where id = mission_row.id;
    perform public.cash_distribute_reward(mission_row.id);
    autoresolved_count := autoresolved_count + 1;
  end loop;

  update public.cash_credits set status = 'expired'
  where status = 'active' and expires_at <= now();
  get diagnostics credits_expired_count = row_count;

  return jsonb_build_object(
    'expired_missions', expired_count,
    'autoresolved_missions', autoresolved_count,
    'credits_expired', credits_expired_count
  );
end;
$$;

revoke all on function public.cash_sweep_expired(integer) from public;
grant execute on function public.cash_sweep_expired(integer) to anon, authenticated;

-- 7. Actions admin (is_admin() - vraie session Supabase Auth) ----------------------

create or replace function public.cash_admin_approve_payment(p_mission_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
  updated_count integer;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if mission_row.status <> 'payment_pending' then
    raise exception 'Cette mission n''a pas de paiement en attente';
  end if;

  update public.cash_transactions
  set status = 'confirmed'
  where mission_id = p_mission_id and type = 'mission_escrow' and status = 'pending';
  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    raise exception 'Aucune transaction de paiement en attente trouvée';
  end if;

  update public.cash_missions set status = 'published', secured = true, updated_at = now()
  where id = p_mission_id returning * into mission_row;

  perform public.cash_notify(mission_row.requester_phone, 'payment_approved', p_mission_id,
    'Prime sécurisée ✓ — "' || mission_row.title || '" est maintenant publiée.');
  perform public.admin_log_action('cash_admin_approve_payment', p_mission_id::text, true, null, jsonb_build_object('mission_id', p_mission_id));

  return to_jsonb(mission_row);
end;
$$;

revoke all on function public.cash_admin_approve_payment(uuid) from public;
grant execute on function public.cash_admin_approve_payment(uuid) to authenticated;

create or replace function public.cash_admin_reject_payment(p_mission_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mission_row public.cash_missions%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select * into mission_row from public.cash_missions where id = p_mission_id for update;
  if not found then
    raise exception 'Mission introuvable';
  end if;
  if mission_row.status <> 'payment_pending' then
    raise exception 'Cette mission n''a pas de paiement en attente';
  end if;

  update public.cash_transactions
  set status = 'rejected'
  where mission_id = p_mission_id and type = 'mission_escrow' and status = 'pending';

  update public.cash_missions set status = 'draft', updated_at = now()
  where id = p_mission_id returning * into mission_row;

  perform public.cash_notify(mission_row.requester_phone, 'payment_rejected', p_mission_id,
    'Paiement refusé pour "' || mission_row.title || '" : ' || coalesce(p_reason, 'référence introuvable') || '. Merci de renvoyer une référence valide.');
  perform public.admin_log_action('cash_admin_reject_payment', p_mission_id::text, true, p_reason, '{}'::jsonb);

  return to_jsonb(mission_row);
end;
$$;

revoke all on function public.cash_admin_reject_payment(uuid, text) from public;
grant execute on function public.cash_admin_reject_payment(uuid, text) to authenticated;

create or replace function public.cash_admin_reject_solution(p_solution_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  solution_row public.cash_solutions%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select * into solution_row from public.cash_solutions where id = p_solution_id for update;
  if not found then
    raise exception 'Solution introuvable';
  end if;
  if solution_row.status <> 'pending' then
    raise exception 'Cette solution ne peut plus être modérée';
  end if;

  update public.cash_solutions set status = 'rejected' where id = p_solution_id returning * into solution_row;
  perform public.cash_notify(solution_row.solver_phone, 'solution_moderated', solution_row.mission_id,
    'Ta proposition a été retirée par la modération : ' || coalesce(p_reason, 'contenu non conforme'));
  perform public.admin_log_action('cash_admin_reject_solution', p_solution_id::text, true, p_reason, '{}'::jsonb);

  return to_jsonb(solution_row);
end;
$$;

revoke all on function public.cash_admin_reject_solution(uuid, text) from public;
grant execute on function public.cash_admin_reject_solution(uuid, text) to authenticated;

create or replace function public.cash_admin_resolve_dispute(
  p_dispute_id uuid,
  p_favor text,
  p_resolution text,
  p_solver_share_amount numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  dispute_row public.cash_disputes%rowtype;
  mission_row public.cash_missions%rowtype;
  solution_row public.cash_solutions%rowtype;
  commission_rate numeric := public.cash_setting_numeric('cash_commission_rate', 0.10);
  share numeric;
  commission_amount numeric;
  remainder numeric;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;
  if p_favor not in ('requester', 'solver', 'partial') then
    raise exception 'Décision invalide';
  end if;

  select * into dispute_row from public.cash_disputes where id = p_dispute_id for update;
  if not found then
    raise exception 'Litige introuvable';
  end if;
  if dispute_row.status not in ('open', 'under_review') then
    raise exception 'Ce litige est déjà résolu';
  end if;

  select * into mission_row from public.cash_missions where id = dispute_row.mission_id for update;
  select * into solution_row from public.cash_solutions where id = mission_row.selected_solution_id;

  if p_favor = 'solver' then
    update public.cash_missions set status = 'completed', updated_at = now() where id = mission_row.id;
    perform public.cash_distribute_reward(mission_row.id);
    update public.cash_disputes set status = 'resolved_solver', resolution = p_resolution, resolved_at = now() where id = p_dispute_id;

  elsif p_favor = 'requester' then
    update public.cash_missions set status = 'cancelled', updated_at = now() where id = mission_row.id;
    perform public.cash_grant_credit(mission_row.id, mission_row.requester_phone, mission_row.reward_amount, 'Litige résolu en votre faveur');
    update public.cash_disputes set status = 'resolved_requester', resolution = p_resolution, resolved_at = now() where id = p_dispute_id;

  else
    share := greatest(least(coalesce(p_solver_share_amount, 0), mission_row.reward_amount), 0);
    remainder := mission_row.reward_amount - share;
    if share > 0 and solution_row.id is not null then
      commission_amount := round(share * least(greatest(commission_rate, 0), 1));
      insert into public.cash_transactions (mission_id, user_phone, type, amount, status)
      values (mission_row.id, public.bizzi_normalize_phone_digits(solution_row.solver_phone), 'reward_payout', share - commission_amount, 'confirmed');
      insert into public.cash_transactions (mission_id, user_phone, type, amount, status)
      values (mission_row.id, null, 'commission', commission_amount, 'confirmed');
    end if;
    if remainder > 0 then
      perform public.cash_grant_credit(mission_row.id, mission_row.requester_phone, remainder, 'Litige résolu partiellement en votre faveur');
    end if;
    update public.cash_missions set status = 'completed', updated_at = now() where id = mission_row.id;
    update public.cash_disputes set status = 'partial_resolution', resolution = p_resolution, resolved_at = now() where id = p_dispute_id;
  end if;

  if solution_row.solver_phone is not null then
    update public.cash_solver_stats
    set dispute_count = dispute_count + 1, updated_at = now()
    where user_phone = public.bizzi_normalize_phone_digits(solution_row.solver_phone);
    insert into public.cash_solver_stats (user_phone, dispute_count)
    select public.bizzi_normalize_phone_digits(solution_row.solver_phone), 1
    where not exists (select 1 from public.cash_solver_stats where user_phone = public.bizzi_normalize_phone_digits(solution_row.solver_phone));
  end if;

  perform public.cash_notify(mission_row.requester_phone, 'dispute_resolved', mission_row.id, 'Litige résolu : ' || coalesce(p_resolution, ''));
  if solution_row.solver_phone is not null then
    perform public.cash_notify(solution_row.solver_phone, 'dispute_resolved', mission_row.id, 'Litige résolu : ' || coalesce(p_resolution, ''));
  end if;
  perform public.admin_log_action('cash_admin_resolve_dispute', p_dispute_id::text, true, p_resolution, jsonb_build_object('favor', p_favor));

  select * into dispute_row from public.cash_disputes where id = p_dispute_id;
  return to_jsonb(dispute_row);
end;
$$;

revoke all on function public.cash_admin_resolve_dispute(uuid, text, text, numeric) from public;
grant execute on function public.cash_admin_resolve_dispute(uuid, text, text, numeric) to authenticated;

create or replace function public.cash_admin_list_missions(p_status text default '', p_limit integer default 50)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  safe_limit integer := least(greatest(coalesce(p_limit, 50), 1), 200);
  response jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select coalesce(jsonb_agg(
    to_jsonb(m) || jsonb_build_object(
      'active_solutions_count', (select count(*) from public.cash_solutions s where s.mission_id = m.id and s.status = 'pending'),
      'escrow_reference', (select payment_reference from public.cash_transactions t where t.mission_id = m.id and t.type = 'mission_escrow' order by t.created_at desc limit 1)
    )
    order by m.created_at desc
  ), '[]'::jsonb) into response
  from (
    select * from public.cash_missions
    where (nullif(trim(p_status), '') is null or status = trim(p_status))
    order by created_at desc
    limit safe_limit
  ) m;

  return response;
end;
$$;

revoke all on function public.cash_admin_list_missions(text, integer) from public;
grant execute on function public.cash_admin_list_missions(text, integer) to authenticated;

create or replace function public.cash_admin_list_disputes(p_status text default '')
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  response jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select coalesce(jsonb_agg(
    to_jsonb(d) || jsonb_build_object('mission_title', m.title, 'mission_reward', m.reward_amount)
    order by d.created_at desc
  ), '[]'::jsonb) into response
  from public.cash_disputes d
  join public.cash_missions m on m.id = d.mission_id
  where nullif(trim(p_status), '') is null or d.status = trim(p_status);

  return response;
end;
$$;

revoke all on function public.cash_admin_list_disputes(text) from public;
grant execute on function public.cash_admin_list_disputes(text) to authenticated;

create or replace function public.cash_admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  response jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select jsonb_build_object(
    'missions_total', (select count(*) from public.cash_missions),
    'missions_active', (select count(*) from public.cash_missions where status in ('published', 'solution_selected', 'in_progress', 'completion_pending')),
    'missions_completed', (select count(*) from public.cash_missions where status = 'completed'),
    'missions_disputed', (select count(*) from public.cash_missions where status = 'disputed'),
    'missions_payment_pending', (select count(*) from public.cash_missions where status = 'payment_pending'),
    'total_reward_value', (select coalesce(sum(reward_amount), 0) from public.cash_missions where secured = true),
    'total_commission', (select coalesce(sum(amount), 0) from public.cash_transactions where type = 'commission' and status = 'confirmed'),
    'total_paid_to_solvers', (select coalesce(sum(amount), 0) from public.cash_transactions where type = 'reward_payout' and status = 'confirmed'),
    'active_credits_value', (select coalesce(sum(remaining_amount), 0) from public.cash_credits where status = 'active'),
    'open_disputes', (select count(*) from public.cash_disputes where status in ('open', 'under_review')),
    'reports_pending', (select count(*) from public.cash_solutions where status = 'pending')
  ) into response;

  return response;
end;
$$;

revoke all on function public.cash_admin_stats() from public;
grant execute on function public.cash_admin_stats() to authenticated;

notify pgrst, 'reload schema';

select 'Zeyds V305 Cash RPC installes' as statut;
