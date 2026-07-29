-- Bizzi V178 - Diagnostic actions immediates robuste
-- Ce fichier ne supprime rien et ne modifie rien dans les tables metier.
-- Il evite les erreurs de colonne absente en verifiant le schema avant chaque controle.

drop table if exists pg_temp.bizzi_v178_diagnostic;

create temp table pg_temp.bizzi_v178_diagnostic (
  ordre integer,
  section text,
  total integer,
  details jsonb
);

do $$
declare
  has_delivery boolean := to_regclass('public.delivery_requests') is not null;
  has_status boolean := false;
  has_payment_status boolean := false;
  has_dispatch_status boolean := false;
  has_couriers boolean := to_regclass('public.courier_locations') is not null;
  has_push boolean := to_regclass('public.push_notifications') is not null;
  has_alerts boolean := to_regclass('public.server_alerts') is not null;
  delivery_where text;
  dispatch_expr text;
begin
  if to_regprocedure('public.bizzi_provider_duplicate_report()') is not null then
    execute $sql$
      insert into pg_temp.bizzi_v178_diagnostic(ordre, section, total, details)
      select
        10,
        'doublons_prestataires',
        (select count(*)::integer from public.bizzi_provider_duplicate_report()),
        (
          select coalesce(jsonb_agg(to_jsonb(r) order by r.duplicate_count desc), '[]'::jsonb)
          from (
            select *
            from public.bizzi_provider_duplicate_report()
            order by duplicate_count desc, phone_key
            limit 30
          ) r
        )
    $sql$;
  else
    insert into pg_temp.bizzi_v178_diagnostic
    values (
      10,
      'doublons_prestataires',
      0,
      jsonb_build_object(
        'statut', 'fonction_absente',
        'action', 'Executer sql-copie-bizzi/76-nettoyage-doublons-prestataires-v173.sql'
      )
    );
  end if;

  if has_delivery then
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'delivery_requests' and column_name = 'status'
    ) into has_status;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'delivery_requests' and column_name = 'payment_status'
    ) into has_payment_status;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'delivery_requests' and column_name = 'dispatch_status'
    ) into has_dispatch_status;

    if has_status and has_payment_status then
      dispatch_expr := case
        when has_dispatch_status then 'coalesce(dispatch_status, ''not_dispatched'')'
        else '''not_dispatched'''
      end;

      delivery_where := 'status = ''open'' and payment_status = ''approved'' and '
        || dispatch_expr || ' not in (''matched'', ''dispatching'', ''completed'')';

      execute format($sql$
        insert into pg_temp.bizzi_v178_diagnostic(ordre, section, total, details)
        select
          20,
          'livraisons_payees_sans_livreur',
          (select count(*)::integer from public.delivery_requests where %1$s),
          (
            select coalesce(jsonb_agg(to_jsonb(d) order by d.created_at desc), '[]'::jsonb)
            from (
              select *
              from public.delivery_requests
              where %1$s
              order by created_at desc
              limit 20
            ) d
          )
      $sql$, delivery_where);
    else
      insert into pg_temp.bizzi_v178_diagnostic
      values (
        20,
        'livraisons_payees_sans_livreur',
        0,
        jsonb_build_object(
          'statut', 'schema_livraison_incomplet',
          'action', 'Executer les scripts livraison 62 puis 64 ou 66 avant le diagnostic dispatch'
        )
      );
    end if;
  else
    insert into pg_temp.bizzi_v178_diagnostic
    values (
      20,
      'livraisons_payees_sans_livreur',
      0,
      jsonb_build_object(
        'statut', 'table_absente',
        'action', 'Executer sql-copie-bizzi/62-livraisons-bizzi-v145.sql'
      )
    );
  end if;

  if has_couriers then
    execute $sql$
      insert into pg_temp.bizzi_v178_diagnostic(ordre, section, total, details)
      select
        30,
        'livreurs_live_disponibles',
        (
          select count(*)::integer
          from public.courier_locations
          where is_available = true
            and last_seen_at >= now() - interval '15 minutes'
        ),
        (
          select coalesce(jsonb_agg(to_jsonb(c) order by c.last_seen_at desc), '[]'::jsonb)
          from (
            select *
            from public.courier_locations
            where is_available = true
              and last_seen_at >= now() - interval '15 minutes'
            order by last_seen_at desc
            limit 30
          ) c
        )
    $sql$;
  else
    insert into pg_temp.bizzi_v178_diagnostic
    values (
      30,
      'livreurs_live_disponibles',
      0,
      jsonb_build_object(
        'statut', 'table_absente',
        'action', 'Executer sql-copie-bizzi/73-live-dispatch-push-antifraude-v171.sql'
      )
    );
  end if;

  if has_push then
    execute $sql$
      insert into pg_temp.bizzi_v178_diagnostic(ordre, section, total, details)
      select
        40,
        'push_notifications_en_attente',
        (
          select count(*)::integer
          from public.push_notifications
          where status = 'queued'
        ),
        (
          select coalesce(jsonb_agg(to_jsonb(p) order by p.status), '[]'::jsonb)
          from (
            select status, count(*)::integer as total
            from public.push_notifications
            group by status
            order by status
          ) p
        )
    $sql$;
  else
    insert into pg_temp.bizzi_v178_diagnostic
    values (
      40,
      'push_notifications_en_attente',
      0,
      jsonb_build_object(
        'statut', 'table_absente',
        'action', 'Executer sql-copie-bizzi/73-live-dispatch-push-antifraude-v171.sql puis deployer push-subscribe/push-notify'
      )
    );
  end if;

  if has_alerts then
    execute $sql$
      insert into pg_temp.bizzi_v178_diagnostic(ordre, section, total, details)
      select
        50,
        'alertes_serveur_ouvertes',
        (
          select count(*)::integer
          from public.server_alerts
          where status = 'open'
        ),
        (
          select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at desc), '[]'::jsonb)
          from (
            select *
            from public.server_alerts
            where status = 'open'
            order by created_at desc
            limit 30
          ) a
        )
    $sql$;
  else
    insert into pg_temp.bizzi_v178_diagnostic
    values (
      50,
      'alertes_serveur_ouvertes',
      0,
      jsonb_build_object(
        'statut', 'table_absente',
        'action', 'Executer sql-copie-bizzi/73-live-dispatch-push-antifraude-v171.sql'
      )
    );
  end if;
end $$;

select
  section,
  total,
  details
from pg_temp.bizzi_v178_diagnostic
order by ordre;
