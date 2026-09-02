-- Zeyds V305 - Module Favoris (Services + Emplois + Zeyds Cash)
--
-- A executer sur NEON (gateway PostgREST auto-heberge), PAS sur Supabase.
-- Les favoris sont une donnee utilisateur ordinaire (pas financiere), meme
-- categorie que service_requests/express_requests qui vivent deja sur Neon
-- (105-propositions-services-v304.sql). Meme pattern eprouve : les
-- utilisateurs n'ont pas de vraie session Supabase Auth, donc RLS base sur
-- auth.uid() ne fonctionne jamais pour eux (voir 109-corriger-transitions-
-- missions-v304.sql) - l'acces passe uniquement par des RPC security
-- definer identifiees par telephone normalise. Comme Neon n'accorde aucun
-- droit par defaut sur une table neuve, des GRANT explicites sont
-- necessaires en plus des policies.
--
-- La table ne stocke qu'un pointeur (user_phone, item_id, item_type) : les
-- details (titre, prix, statut...) sont resolus cote frontend contre la
-- bonne source (Neon pour service/job, Supabase pour cash - voir
-- 117-zeyds-cash-favoris-lookup-v305.sql).

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  item_id text not null,
  item_type text not null check (item_type = any(array['service', 'job', 'cash'])),
  created_at timestamptz not null default now(),
  unique (user_phone, item_id, item_type)
);

create index if not exists idx_favorites_user on public.favorites(user_phone, item_type, created_at desc);
create index if not exists idx_favorites_item on public.favorites(item_type, item_id);

alter table public.favorites enable row level security;

-- Pas de policy d'ecriture directe : tout passe par les RPC ci-dessous
-- (security definer), donc pas besoin de policy insert/delete evaluee.
-- Le grant reste necessaire (Neon bloque avant meme d'evaluer RLS sinon).
grant usage on schema public to anon, authenticated;
grant select, insert, delete on public.favorites to anon, authenticated;

create or replace function public.favorite_add(
  p_user_phone text,
  p_item_id text,
  p_item_type text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result_row public.favorites%rowtype;
begin
  if trim(coalesce(p_user_phone, '')) = '' then
    raise exception 'Telephone requis';
  end if;
  if p_item_type not in ('service', 'job', 'cash') then
    raise exception 'Type de favori invalide';
  end if;
  if trim(coalesce(p_item_id, '')) = '' then
    raise exception 'Element invalide';
  end if;

  insert into public.favorites (user_phone, item_id, item_type)
  values (public.bizzi_normalize_phone_digits(p_user_phone), trim(p_item_id), p_item_type)
  on conflict (user_phone, item_id, item_type) do nothing
  returning * into result_row;

  if result_row.id is null then
    select * into result_row from public.favorites
    where user_phone = public.bizzi_normalize_phone_digits(p_user_phone)
      and item_id = trim(p_item_id) and item_type = p_item_type;
  end if;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.favorite_add(text, text, text) from public;
grant execute on function public.favorite_add(text, text, text) to anon, authenticated;

create or replace function public.favorite_remove(
  p_user_phone text,
  p_item_id text,
  p_item_type text
)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.favorites
  where user_phone = public.bizzi_normalize_phone_digits(p_user_phone)
    and item_id = trim(p_item_id)
    and item_type = p_item_type;
$$;

revoke all on function public.favorite_remove(text, text, text) from public;
grant execute on function public.favorite_remove(text, text, text) to anon, authenticated;

create or replace function public.favorite_list(p_user_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object('id', f.id, 'item_id', f.item_id, 'item_type', f.item_type, 'created_at', f.created_at)
    order by f.created_at desc
  ), '[]'::jsonb)
  from public.favorites f
  where f.user_phone = public.bizzi_normalize_phone_digits(p_user_phone);
$$;

revoke all on function public.favorite_list(text) from public;
grant execute on function public.favorite_list(text) to anon, authenticated;

notify pgrst, 'reload schema';

select 'Zeyds V305 Favoris installes (Neon)' as statut;
