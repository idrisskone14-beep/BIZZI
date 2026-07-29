-- Bizzi - Fonction publique securisee pour les avis clients V65
-- Objectif : permettre a l'application d'envoyer un avis via RPC,
-- sans exposer l'insertion directe comme point fragile cote navigateur.
--
-- A executer dans Supabase > SQL Editor > New query.

create or replace function public.bizzi_submit_review(
  p_provider_uuid uuid,
  p_provider_phone text,
  p_rating integer,
  p_message text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_provider_id uuid;
  new_review_id uuid;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'La note doit etre comprise entre 1 et 5';
  end if;

  if p_provider_uuid is not null then
    select p.id
    into target_provider_id
    from providers p
    where p.id = p_provider_uuid
      and p.status = 'approved'
      and p.visibility_status in ('trial', 'active')
    limit 1;
  end if;

  if target_provider_id is null and p_provider_phone is not null and length(trim(p_provider_phone)) > 0 then
    select p.id
    into target_provider_id
    from providers p
    where p.phone = p_provider_phone
      and p.status = 'approved'
      and p.visibility_status in ('trial', 'active')
    limit 1;
  end if;

  if target_provider_id is null then
    raise exception 'Prestataire non visible ou introuvable pour cet avis';
  end if;

  insert into provider_reviews (provider_id, rating, message, status)
  values (
    target_provider_id,
    p_rating,
    left(coalesce(p_message, ''), 500),
    'published'
  )
  returning id into new_review_id;

  return jsonb_build_object(
    'review_id', new_review_id,
    'provider_id', target_provider_id,
    'rating', p_rating,
    'status', 'published'
  );
end;
$$;

grant execute on function public.bizzi_submit_review(uuid, text, integer, text) to anon, authenticated;

