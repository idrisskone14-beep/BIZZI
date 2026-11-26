import { useState } from "react";
import { Bolt, CheckCheck, MessageCircle, Phone, PhoneCall } from "lucide-react";
import { audit, eq, selectCount, update } from "../api.js";
import { Badge, Button, Drawer, Empty, ErrorBox, Field, Loading, PageHeader, Segmented, ago, dateFr, money, phoneLink, useAction, useLoad, whatsappLink } from "../ui.jsx";

const URGENCY = { today: ["Aujourd'hui", "danger"], "24h": ["Sous 24 h", "warning"], week: ["Cette semaine", "info"], quote: ["Devis", "neutral"] };
const STATUS = { open: ["Ouverte", "warning"], contacted: ["Contactée", "info"], closed: ["Clôturée", "success"], archived: ["Archivée", "neutral"] };
const FIELDS = "id,service_name,city_name,area,urgency,message,customer_phone,customer_name,client_name,budget,budget_amount,photo_url,status,admin_note,created_at,closed_at,matched_count,priority_label,location_label,desired_at,people_count";

export default function Requests({ onChange }) {
  const [status, setStatus] = useState("open");
  const [openId, setOpenId] = useState(null);
  const { data, error, loading, reload } = useLoad(
    () => selectCount(`express_requests?select=${FIELDS}&status=eq.${status}&order=created_at.desc&limit=100`),
    [status],
  );
  const rows = data?.rows || [];
  const open = rows.find((row) => row.id === openId);

  return (
    <>
      <PageHeader title="Demandes express" subtitle="Besoins publiés par les clients, à mettre en relation avec un prestataire." />
      <div className="toolbar">
        <Segmented value={status} onChange={setStatus} options={[
          { value: "open", label: "Ouvertes" }, { value: "contacted", label: "Contactées" }, { value: "closed", label: "Clôturées" },
        ]} />
      </div>
      <ErrorBox error={error} onRetry={reload} />
      <div className="table-card">
        <table className="table">
          <thead><tr><th>Besoin</th><th className="hide-sm">Lieu</th><th>Urgence</th><th className="hide-md">Prestataires trouvés</th><th className="hide-md">Reçue</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} onClick={() => setOpenId(row.id)} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpenId(row.id); }}>
                <td><span className="cell-two"><strong>{row.service_name || "Service"}</strong><span className="clamp-1">{row.message || "—"}</span></span></td>
                <td className="hide-sm">{[row.area, row.city_name].filter(Boolean).join(", ") || "—"}</td>
                <td><Badge tone={URGENCY[row.urgency]?.[1]}>{URGENCY[row.urgency]?.[0] || row.urgency}</Badge></td>
                <td className="hide-md">{row.matched_count ?? "—"}</td>
                <td className="hide-md">{ago(row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? <Loading /> : null}
        {!loading && !rows.length && !error ? <Empty icon={Bolt} title="Aucune demande ici">Les demandes des clients arrivent dans « Ouvertes ».</Empty> : null}
      </div>
      <RequestDrawer request={open} onClose={() => setOpenId(null)} onDone={() => { setOpenId(null); reload(); onChange?.(); }} />
    </>
  );
}

function RequestDrawer({ request, onClose, onDone }) {
  const { busy, run } = useAction();
  if (!request) return <Drawer open={false} onClose={onClose} />;

  const setStatus = (next) => run(next, async () => {
    const values = next === "closed" ? { status: "closed", closed_at: new Date().toISOString() } : { status: next };
    await update("express_requests", `id=${eq(request.id)}`, values);
    audit(`console:express_request:${next}`, request.id);
  }, next === "closed" ? "Demande clôturée." : "Demande marquée comme contactée.").then((ok) => ok && onDone());

  const name = request.customer_name || request.client_name;
  return (
    <Drawer open onClose={onClose} title={request.service_name || "Demande"} subtitle={`${[request.area, request.city_name].filter(Boolean).join(", ")} · ${ago(request.created_at)}`}
      footer={(
        <>
          {request.status === "open" ? <Button icon={PhoneCall} busy={busy === "contacted"} onClick={() => setStatus("contacted")}>Marquer contactée</Button> : null}
          {request.status !== "closed" ? <Button variant="primary" icon={CheckCheck} busy={busy === "closed"} onClick={() => setStatus("closed")}>Clôturer</Button> : null}
        </>
      )}>
      <div className="profile-badges">
        <Badge tone={STATUS[request.status]?.[1]}>{STATUS[request.status]?.[0] || request.status}</Badge>
        <Badge tone={URGENCY[request.urgency]?.[1]}>{URGENCY[request.urgency]?.[0] || request.urgency}</Badge>
        {request.priority_label ? <Badge tone="neutral">{request.priority_label}</Badge> : null}
      </div>
      {request.message ? <p className="prose quote">{request.message}</p> : null}
      {request.photo_url ? <a className="proof" href={request.photo_url} target="_blank" rel="noreferrer"><img src={request.photo_url} alt="Photo jointe par le client" /></a> : null}
      <div className="fields">
        <Field label="Client">{name}</Field>
        <Field label="Téléphone">{request.customer_phone}</Field>
        <Field label="Budget">{request.budget_amount ? money(request.budget_amount) : request.budget}</Field>
        <Field label="Souhaité le">{request.desired_at ? dateFr(request.desired_at, true) : ""}</Field>
        <Field label="Adresse">{request.location_label}</Field>
        <Field label="Prestataires trouvés">{request.matched_count != null ? String(request.matched_count) : ""}</Field>
        {request.closed_at ? <Field label="Clôturée le">{dateFr(request.closed_at, true)}</Field> : null}
      </div>
      {request.customer_phone ? (
        <div className="quick-actions">
          <a className="btn btn-secondary" href={phoneLink(request.customer_phone)}><Phone size={15} aria-hidden="true" />Appeler le client</a>
          <a className="btn btn-secondary" href={whatsappLink(request.customer_phone)} target="_blank" rel="noreferrer"><MessageCircle size={15} aria-hidden="true" />WhatsApp</a>
        </div>
      ) : null}
    </Drawer>
  );
}
