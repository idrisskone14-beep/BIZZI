// POST /api/sms-notify { event: "new_opportunity", request_id } : SMS LeTexto aux prestataires
// retenus pour une demande express. Garde-fous et logique : api/_lib/sms-notify.js.
// Variables Vercel : LETEXTO_API_KEY, LETEXTO_SENDER (defaut ZEYDS), SMS_DAILY_LIMIT (defaut 200),
// SMS_PER_PROVIDER_DAILY (defaut 3), DATABASE_URL. Table : sql-copie-bizzi/121-sms-log-v306.sql.
import { sql } from "./_lib/http.js";
import { handleSmsNotify } from "./_lib/sms-notify.js";

export function POST(request) {
  return handleSmsNotify(request, {
    env: process.env,
    fetch,
    async getRequest(id) {
      const rows = await sql()`select r.id, r.created_at, r.matched_provider_ids,
          coalesce(s.name, '') as service, coalesce(c.name, '') as city
        from public.express_requests r
        left join public.services s on s.id = r.service_id
        left join public.cities c on c.id = r.city_id
        where r.id = ${id}::uuid limit 1`;
      return rows[0] || null;
    },
    async listProviders(ids) {
      return sql()`select id::text, phone from public.public_provider_directory where id = any(${ids}::uuid[])`;
    },
    async alreadyNotified(requestId) {
      const rows = await sql()`select 1 from public.sms_log where request_id = ${requestId}::uuid limit 1`;
      return rows.length > 0;
    },
    async countSent({ since, providerId }) {
      const rows = providerId
        ? await sql()`select count(*)::int as n from public.sms_log where created_at >= ${since}::timestamptz and provider_id = ${providerId}`
        : await sql()`select count(*)::int as n from public.sms_log where created_at >= ${since}::timestamptz`;
      return rows[0]?.n ?? 0;
    },
    async record(row) {
      await sql()`insert into public.sms_log (event, request_id, provider_id, phone, status, letexto_id, error)
        values (${row.event}, ${row.request_id}::uuid, ${row.provider_id}, ${row.phone}, ${row.status}, ${row.letexto_id}, ${row.error})`;
    },
  });
}
