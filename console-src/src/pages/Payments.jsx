import { useEffect, useState } from "react";
import { Check, FileImage, MessageCircle, Receipt, X } from "lucide-react";
import { audit, eq, privateFileUrl, rpc, selectCount, update } from "../api.js";
import {
  Avatar, Badge, Button, Drawer, Empty, ErrorBox, Field, Loading, PageHeader, Segmented,
  ago, dateFr, money, useAction, useLoad, whatsappLink,
} from "../ui.jsx";

export const METHODS = { wave: "Wave", orange_money: "Orange Money", mtn_money: "MTN Money" };
const STATUS = { pending: ["En attente", "warning"], approved: ["Validé", "success"], rejected: ["Refusé", "danger"] };
const FIELDS = "id,amount,currency,method,transaction_reference,proof_url,status,admin_note,created_at,approved_at,provider_id,providers(full_name,phone,whatsapp,photo_url),subscription_plans(name,duration_months)";

export function ProofLink({ path, label = "Voir la preuve de paiement" }) {
  const [state, setState] = useState({ url: "", error: "" });
  useEffect(() => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path)) { setState({ url: path, error: "" }); return undefined; }
    let alive = true;
    let objectUrl = "";
    privateFileUrl(path)
      .then((url) => { objectUrl = url; if (alive) setState({ url, error: "" }); })
      .catch((error) => { if (alive) setState({ url: "", error: error.message }); });
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path]);
  if (!path) return <p className="muted">Aucune capture envoyée : vérifiez la référence dans votre application Mobile Money.</p>;
  if (state.error) return <p className="muted">{state.error}</p>;
  if (!state.url) return <Loading label="Ouverture de la preuve…" />;
  return (
    <a className="proof" href={state.url} target="_blank" rel="noreferrer">
      <img src={state.url} alt="Preuve de paiement" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      <span><FileImage size={14} aria-hidden="true" />{label}</span>
    </a>
  );
}

export default function Payments({ onChange }) {
  const [status, setStatus] = useState("pending");
  const [openId, setOpenId] = useState(null);
  const { data, error, loading, reload } = useLoad(
    () => selectCount(`payments?select=${FIELDS}${status ? `&status=eq.${status}` : ""}&order=created_at.desc&limit=100`),
    [status],
  );
  const rows = data?.rows || [];
  const open = rows.find((row) => row.id === openId);

  return (
    <>
      <PageHeader title="Paiements" subtitle="Abonnements payés par Wave, Orange Money ou MTN Money." />
      <div className="toolbar">
        <Segmented value={status} onChange={setStatus} options={[
          { value: "pending", label: "À vérifier" },
          { value: "approved", label: "Validés" },
          { value: "rejected", label: "Refusés" },
          { value: "", label: "Tous" },
        ]} />
      </div>
      <ErrorBox error={error} onRetry={reload} />
      <div className="table-card">
        <table className="table">
          <thead><tr><th>Prestataire</th><th>Montant</th><th className="hide-sm">Formule</th><th className="hide-md">Référence</th><th>Statut</th></tr></thead>
          <tbody>
            {rows.map((payment) => (
              <tr key={payment.id} onClick={() => setOpenId(payment.id)} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpenId(payment.id); }}>
                <td><div className="cell-person"><Avatar name={payment.providers?.full_name} src={payment.providers?.photo_url} /><div><strong>{payment.providers?.full_name || "Prestataire"}</strong><span>{ago(payment.created_at)}</span></div></div></td>
                <td><span className="cell-two"><strong>{money(payment.amount, payment.currency)}</strong><span>{METHODS[payment.method] || payment.method}</span></span></td>
                <td className="hide-sm">{payment.subscription_plans?.name || "—"}</td>
                <td className="hide-md mono">{payment.transaction_reference || "—"}</td>
                <td><Badge tone={STATUS[payment.status]?.[1]}>{STATUS[payment.status]?.[0] || payment.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? <Loading /> : null}
        {!loading && !rows.length && !error ? (
          <Empty icon={Receipt} title={status === "pending" ? "Aucun paiement à vérifier" : "Aucun paiement"}>
            {status === "pending" ? "Les nouveaux paiements d'abonnement apparaîtront ici." : null}
          </Empty>
        ) : null}
      </div>
      <PaymentDrawer payment={open} onClose={() => setOpenId(null)} onDone={() => { setOpenId(null); reload(); onChange?.(); }} />
    </>
  );
}

function PaymentDrawer({ payment, onClose, onDone }) {
  const { busy, run } = useAction();
  if (!payment) return <Drawer open={false} onClose={onClose} />;

  const approve = () => run("approve", async () => {
    const result = await rpc("admin_approve_payment", { payment_uuid: payment.id });
    audit("console:admin_approve_payment", payment.id, { result });
  }, "Paiement validé : l'abonnement est activé.").then((ok) => ok && onDone());

  const reject = () => {
    const note = window.prompt("Motif du refus (gardé dans l'historique) :", "Paiement introuvable sur le compte Mobile Money");
    if (note === null) return;
    run("reject", async () => {
      await update("payments", `id=${eq(payment.id)}`, { status: "rejected", admin_note: note.trim() || null });
      audit("console:reject_payment", payment.id, { note });
    }, "Paiement refusé.").then((ok) => ok && onDone());
  };

  const phone = payment.providers?.whatsapp || payment.providers?.phone;
  return (
    <Drawer open onClose={onClose} title={money(payment.amount, payment.currency)}
      subtitle={`${payment.providers?.full_name || "Prestataire"} · ${METHODS[payment.method] || payment.method}`}
      footer={payment.status === "pending" ? (
        <>
          <Button variant="primary" icon={Check} busy={busy === "approve"} onClick={approve}>Valider le paiement</Button>
          <Button variant="danger" icon={X} busy={busy === "reject"} onClick={reject}>Refuser</Button>
        </>
      ) : null}>
      <div className="fields">
        <Field label="Statut"><Badge tone={STATUS[payment.status]?.[1]}>{STATUS[payment.status]?.[0] || payment.status}</Badge></Field>
        <Field label="Formule">{payment.subscription_plans?.name ? `${payment.subscription_plans.name} (${payment.subscription_plans.duration_months} mois)` : ""}</Field>
        <Field label="Référence de transaction"><span className="mono">{payment.transaction_reference}</span></Field>
        <Field label="Envoyé le">{dateFr(payment.created_at, true)}</Field>
        {payment.approved_at ? <Field label="Validé le">{dateFr(payment.approved_at, true)}</Field> : null}
        {payment.admin_note ? <Field label="Note admin">{payment.admin_note}</Field> : null}
      </div>
      {phone ? <div className="quick-actions"><a className="btn btn-secondary" href={whatsappLink(phone)} target="_blank" rel="noreferrer"><MessageCircle size={15} aria-hidden="true" />Écrire au prestataire</a></div> : null}
      <h3 className="section-title">Preuve de paiement</h3>
      <ProofLink path={payment.proof_url} />
      {payment.status === "pending" ? (
        <p className="hint">Avant de valider, vérifiez que la référence et le montant apparaissent bien sur votre compte {METHODS[payment.method] || "Mobile Money"}.</p>
      ) : null}
    </Drawer>
  );
}
