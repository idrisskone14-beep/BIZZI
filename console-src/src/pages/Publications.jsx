import { useState } from "react";
import { Briefcase, CalendarDays, Check, Gem, MessageCircle, UtensilsCrossed, X } from "lucide-react";
import { audit, count, eq, rpc, select, update } from "../api.js";
import { Badge, Button, Empty, ErrorBox, Loading, PageHeader, Segmented, ago, dateFr, money, useAction, useLoad, whatsappLink } from "../ui.jsx";
import { ProofLink } from "./Payments.jsx";

const TYPES = {
  jobs: {
    label: "Emplois", icon: Briefcase, table: "job_offers",
    fields: "id,title,company_name,company_type,contact_phone,contact_email,service_name,city_name,area,contract_type,salary_range,description,plan_name,amount,currency,payment_method,transaction_reference,payment_status,proof_url,is_boosted,status,created_at",
    title: (r) => r.title, sub: (r) => [r.company_name, r.service_name, r.city_name].filter(Boolean).join(" · "),
    phone: (r) => r.contact_phone,
    extra: (r) => [r.contract_type, r.salary_range].filter(Boolean).join(" · "),
    publish: (r) => rpc("admin_publish_job_offer", { job_uuid: r.id }),
    reject: (r) => rpc("admin_archive_job_offer", { job_uuid: r.id }),
    rejectLabel: "Archiver",
  },
  events: {
    label: "Événements", icon: CalendarDays, table: "event_promotions",
    fields: "id,title,description,event_datetime,end_datetime,venue,area,city_name,category,poster_url,ticket_price,contact_phone,organizer_name,plan_name,amount,currency,payment_method,transaction_reference,payment_status,is_sponsored,is_premium,status,created_at",
    title: (r) => r.title, sub: (r) => [r.organizer_name, r.venue, r.city_name].filter(Boolean).join(" · "),
    phone: (r) => r.contact_phone, image: (r) => r.poster_url,
    extra: (r) => `Le ${dateFr(r.event_datetime, true)}${r.ticket_price ? ` · billet ${r.ticket_price}` : ""}`,
    publish: (r) => rpc("admin_publish_event_promotion", { event_uuid: r.id }),
    reject: (r) => rpc("admin_reject_event_promotion", { event_uuid: r.id }),
  },
  food: {
    label: "Food", icon: UtensilsCrossed, table: "food_places",
    fields: "id,name,owner_name,contact_phone,place_type,main_specialty,city_name,area,address,average_budget,opening_hours,delivery_available,description,photo_url,status,created_at",
    title: (r) => r.name, sub: (r) => [r.place_type, r.main_specialty, r.area, r.city_name].filter(Boolean).join(" · "),
    phone: (r) => r.contact_phone, image: (r) => r.photo_url,
    extra: (r) => [r.average_budget && `Budget ${r.average_budget}`, r.opening_hours, r.delivery_available ? "Livraison" : ""].filter(Boolean).join(" · "),
    publish: (r) => rpc("admin_publish_food_place", { food_uuid: r.id }),
    reject: (r) => rpc("admin_reject_food_place", { food_uuid: r.id }),
  },
  places: {
    label: "Lieux d'exception", icon: Gem, table: "exception_places",
    fields: "id,name,owner_name,contact_phone,city_name,area,address,description,photo_url,plan_id,plan_name,amount,currency,payment_method,payment_reference,payment_status,status,created_at",
    title: (r) => r.name, sub: (r) => [r.owner_name, r.area, r.city_name].filter(Boolean).join(" · "),
    phone: (r) => r.contact_phone, image: (r) => r.photo_url,
    extra: (r) => r.address || "",
    publish: (r) => rpc("admin_publish_exception_place", { place_uuid: r.id }),
    reject: (r) => update("exception_places", `id=${eq(r.id)}`, { status: "rejected" }),
  },
};

const PAYMENT = { pending: ["Paiement à vérifier", "warning"], approved: ["Payé", "success"], rejected: ["Paiement refusé", "danger"] };

async function loadAll(type, status) {
  const config = TYPES[type];
  const [rows, ...counts] = await Promise.all([
    select(`${config.table}?select=${config.fields}&status=eq.${status}&order=created_at.desc&limit=60`),
    ...Object.values(TYPES).map((item) => count(item.table, "status=eq.pending").catch(() => 0)),
  ]);
  return { rows, counts: Object.fromEntries(Object.keys(TYPES).map((key, index) => [key, counts[index]])) };
}

export default function Publications({ onChange }) {
  const [type, setType] = useState("jobs");
  const [status, setStatus] = useState("pending");
  const { data, error, loading, reload } = useLoad(() => loadAll(type, status), [type, status]);
  const { busy, run } = useAction();
  const config = TYPES[type];

  const act = (row, action) => {
    const isPublish = action === "publish";
    if (!isPublish && !window.confirm(`${config.rejectLabel || "Refuser"} « ${config.title(row)} » ?`)) return;
    run(`${action}-${row.id}`, async () => {
      const result = await config[action](row);
      audit(`console:${config.table}:${action}`, row.id, { result: result ?? null });
    }, isPublish ? "Publication en ligne." : "Publication retirée.").then((ok) => { if (ok) { reload(); onChange?.(); } });
  };

  return (
    <>
      <PageHeader title="Publications" subtitle="Annonces envoyées par les entreprises, organisateurs et établissements." />
      <div className="toolbar">
        <Segmented value={type} onChange={setType} options={Object.entries(TYPES).map(([value, item]) => ({ value, label: item.label, count: data?.counts?.[value] || null }))} />
        <Segmented value={status} onChange={setStatus} options={[{ value: "pending", label: "En attente" }, { value: "published", label: "En ligne" }, { value: "rejected", label: "Refusées" }]} />
      </div>
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : null}
      {data && !data.rows.length ? (
        <div className="card"><Empty icon={config.icon} title={status === "pending" ? `Aucune publication « ${config.label} » en attente` : "Rien à afficher"}>Les nouvelles annonces apparaîtront ici dès leur envoi.</Empty></div>
      ) : null}
      <div className="cards">
        {(data?.rows || []).map((row) => {
          const image = config.image?.(row);
          const phone = config.phone(row);
          const paid = row.payment_status ? PAYMENT[row.payment_status] : null;
          return (
            <article className="pub-card" key={row.id}>
              {image ? <img className="pub-img" src={image} alt="" loading="lazy" /> : <div className="pub-img pub-img-empty"><config.icon size={26} aria-hidden="true" /></div>}
              <div className="pub-body">
                <div className="pub-top">
                  <h3>{config.title(row) || "Sans titre"}</h3>
                  <span className="muted small">{ago(row.created_at)}</span>
                </div>
                <p className="pub-sub">{config.sub(row)}</p>
                {config.extra(row) ? <p className="pub-extra">{config.extra(row)}</p> : null}
                {row.description ? <p className="pub-desc">{row.description}</p> : null}
                <div className="pub-tags">
                  {row.plan_name ? <Badge tone="info">{row.plan_name}</Badge> : null}
                  {Number(row.amount) ? <Badge tone="neutral">{money(row.amount, row.currency)}</Badge> : null}
                  {paid ? <Badge tone={paid[1]}>{paid[0]}</Badge> : null}
                  {row.transaction_reference || row.payment_reference ? <span className="mono small">Réf. {row.transaction_reference || row.payment_reference}</span> : null}
                </div>
                {row.proof_url ? <ProofLink path={row.proof_url} /> : null}
                <div className="pub-actions">
                  {phone ? <a className="btn btn-ghost" href={whatsappLink(phone)} target="_blank" rel="noreferrer"><MessageCircle size={15} aria-hidden="true" />Contacter</a> : null}
                  {status !== "published" ? <Button variant="primary" icon={Check} busy={busy === `publish-${row.id}`} onClick={() => act(row, "publish")}>Publier</Button> : null}
                  {status !== "rejected" ? <Button variant="danger" icon={X} busy={busy === `reject-${row.id}`} onClick={() => act(row, "reject")}>{config.rejectLabel || "Refuser"}</Button> : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
