-- Bizzi - Priorite demandes express V44
-- Objectif : stocker le score de priorite calcule par l'application.
-- A executer apres 16-demandes-express-supabase.sql.

alter table express_requests
add column if not exists priority_score integer not null default 0,
add column if not exists priority_label text not null default 'Normal',
add column if not exists matched_count integer not null default 0;

create index if not exists idx_express_requests_priority
on express_requests(status, priority_score desc, created_at asc);

comment on column express_requests.priority_score is 'Score Bizzi de 0 a 100 pour prioriser le traitement admin.';
comment on column express_requests.priority_label is 'Libelle de priorite affiche cote admin.';
comment on column express_requests.matched_count is 'Nombre de prestataires proposes au moment de la demande.';
