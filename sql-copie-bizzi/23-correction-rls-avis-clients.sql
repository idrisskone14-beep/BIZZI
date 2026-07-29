-- Bizzi - Correction RLS avis clients V64
-- Objectif : permettre aux clients sans compte de laisser un avis
-- sur un prestataire approuve et visible, sans donner un acces direct
-- a la table providers.
--
-- A executer dans Supabase > SQL Editor > New query.

create or replace function public.bizzi_can_review_provider(provider_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.providers p
    where p.id = provider_uuid
      and p.status = 'approved'
      and p.visibility_status in ('trial', 'active')
  );
$$;

grant execute on function public.bizzi_can_review_provider(uuid) to anon, authenticated;

grant select, insert on public.provider_reviews to anon, authenticated;
grant update on public.provider_reviews to authenticated;

drop policy if exists "public submit provider review" on public.provider_reviews;
create policy "public submit provider review"
on public.provider_reviews for insert
to anon, authenticated
with check (
  rating between 1 and 5
  and status = 'published'
  and public.bizzi_can_review_provider(provider_id)
);

drop policy if exists "public read published provider reviews" on public.provider_reviews;
create policy "public read published provider reviews"
on public.provider_reviews for select
to anon, authenticated
using (
  status = 'published'
  and public.bizzi_can_review_provider(provider_id)
);

-- Test de lecture rapide : doit retourner 0 ligne si aucun avis,
-- mais ne doit pas retourner d'erreur.
select count(*) as published_reviews
from public.provider_reviews
where status = 'published';

