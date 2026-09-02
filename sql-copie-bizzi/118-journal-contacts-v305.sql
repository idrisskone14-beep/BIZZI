-- Zeyds V305 - Module Messages : journal de contacts (Services + Emplois +
-- Zeyds Cash).
--
-- A executer sur NEON (comme 116-favoris-v305.sql), meme raisonnement :
-- donnee utilisateur ordinaire, pas financiere, identifiee par telephone
-- normalise via des RPC security definer plutot que RLS/auth.uid().
--
-- Alternative scopee a la vraie messagerie in-app (hors perimetre pour
-- l'instant) : au lieu de fils de discussion en temps reel, on trace
-- simplement les moments ou l'utilisateur a reellement contacte quelqu'un
-- (clic WhatsApp/appel), avec la date du DERNIER contact par element
-- (upsert), pour lui permettre de retrouver facilement "qui j'ai contacte
-- recemment". Les vraies conversations restent sur WhatsApp/telephone.

create table if not exists public.contact_log (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  item_id text not null,
  item_type text not null check (item_type = any(array['service', 'job', 'cash'])),
  contact_method text not null default 'whatsapp' check (contact_method = any(array['whatsapp', 'call'])),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_phone, item_id, item_type)
);

create index if not exists idx_contact_log_user on public.contact_log(user_phone, updated_at desc);

alter table public.contact_log enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.contact_log to anon, authenticated;

create or replace function public.contact_log_touch(
  p_user_phone text,
  p_item_id text,
  p_item_type text,
  p_contact_method text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result_row public.contact_log%rowtype;
begin
  if trim(coalesce(p_user_phone, '')) = '' or trim(coalesce(p_item_id, '')) = '' then
    return null;
  end if;
  if p_item_type not in ('service', 'job', 'cash') then
    return null;
  end if;

  insert into public.contact_log (user_phone, item_id, item_type, contact_method)
  values (
    public.bizzi_normalize_phone_digits(p_user_phone), trim(p_item_id), p_item_type,
    case when p_contact_method = 'call' then 'call' else 'whatsapp' end
  )
  on conflict (user_phone, item_id, item_type) do update
  set contact_method = excluded.contact_method,
      updated_at = now()
  returning * into result_row;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.contact_log_touch(text, text, text, text) from public;
grant execute on function public.contact_log_touch(text, text, text, text) to anon, authenticated;

create or replace function public.contact_log_list(p_user_phone text, p_limit integer default 50)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', c.id, 'item_id', c.item_id, 'item_type', c.item_type,
      'contact_method', c.contact_method, 'created_at', c.created_at, 'updated_at', c.updated_at
    )
    order by c.updated_at desc
  ), '[]'::jsonb)
  from (
    select * from public.contact_log
    where user_phone = public.bizzi_normalize_phone_digits(p_user_phone)
    order by updated_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200)
  ) c;
$$;

revoke all on function public.contact_log_list(text, integer) from public;
grant execute on function public.contact_log_list(text, integer) to anon, authenticated;

notify pgrst, 'reload schema';

select 'Zeyds V305 journal de contacts installe (Neon)' as statut;
