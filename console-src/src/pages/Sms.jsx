import { useState } from "react";
import { CheckCircle2, MessageSquareText, RefreshCw, Send, XCircle } from "lucide-react";
import { adminApi, audit } from "../api.js";
import { Badge, Button, Empty, ErrorBox, Loading, Metric, PageHeader, ago, useAction, useLoad } from "../ui.jsx";

const EVENTS = { new_opportunity: "Nouvelle demande", test: "Test" };
const DELIVERY = {
  DELIVERED: ["Reçu", "success"],
  SENT: ["Envoyé à l'opérateur", "info"],
  PENDING: ["En cours", "warning"],
  FAILED: ["Non distribué", "danger"],
};

const maskPhone = (phone = "") => String(phone).replace(/^(\d{5})\d+(\d{2})$/, "$1 •• •• $2");

function balanceText(balance) {
  if (!balance) return "—";
  if (!balance.ok) return "Indisponible";
  const value = balance.balance;
  if (typeof value === "number" || typeof value === "string") return String(value);
  const found = ["balance", "solde", "credit", "credits", "sms", "amount"].map((key) => value?.[key] ?? value?.data?.[key]).find((item) => item != null);
  return found != null ? String(found) : JSON.stringify(value).slice(0, 40);
}

export default function Sms() {
  const { data, error, loading, reload } = useLoad(() => adminApi("sms-admin"));
  const { busy, run } = useAction();
  const [phone, setPhone] = useState("");
  const [sender, setSender] = useState("ZEYDS");

  const sendTest = (event) => {
    event.preventDefault();
    run("test", async () => {
      const result = await adminApi("sms-admin", { method: "POST", body: { action: "test", to: phone } });
      audit("console:sms_test", result.id || null);
    }, "SMS de test envoyé. Il doit arriver d'ici une minute.").then((ok) => ok && reload());
  };

  const requestSender = (event) => {
    event.preventDefault();
    run("sender", async () => {
      await adminApi("sms-admin", { method: "POST", body: { action: "sender", name: sender.trim() } });
      audit("console:sms_sender", sender.trim());
    }, "Demande envoyée à LeTexto : le nom sera utilisable après leur validation.");
  };

  const stats = data?.last24h || {};
  return (
    <>
      <PageHeader title="SMS" subtitle="Envois LeTexto : prestataires prévenus d'une nouvelle demande.">
        <Button icon={RefreshCw} onClick={reload} busy={loading && Boolean(data)}>Actualiser</Button>
      </PageHeader>
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : null}
      {data ? (
        <>
          <section className="card sms-status">
            {data.configured ? (
              <div className="status-line ok"><CheckCircle2 size={20} aria-hidden="true" /><div><strong>LeTexto est branché</strong><span>Expéditeur : {data.sender} · solde : {balanceText(data.balance)}{data.balance && !data.balance.ok ? ` (${data.balance.error})` : ""}</span></div></div>
            ) : (
              <div className="status-line ko"><XCircle size={20} aria-hidden="true" /><div><strong>Clé LeTexto absente</strong><span>Ajoutez la variable LETEXTO_API_KEY dans Vercel (projet bizzi, Settings → Environment Variables, type Sensitive), puis redéployez.</span></div></div>
            )}
            <p className="hint">Garde-fous : {data.limits.perProvider} SMS par prestataire et {data.limits.daily} au total sur 24 h, 5 destinataires maximum par demande, une seule salve par demande.</p>
          </section>

          <section className="metrics">
            <Metric label="Envoyés (24 h)" value={stats.sent ?? 0} hint={`${stats.parts ?? 0} SMS facturés`} />
            <Metric label="Reçus confirmés" value={stats.delivered ?? 0} hint="Accusés de réception LeTexto" />
            <Metric label="Échecs (24 h)" value={stats.failed ?? 0} hint="Numéro invalide, solde, expéditeur" />
            <Metric label="Plafond quotidien" value={data.limits.daily} hint="Tous prestataires confondus" />
          </section>

          <div className="grid-2">
            <form className="card form-card" onSubmit={sendTest}>
              <h2 className="card-title">Envoyer un SMS de test</h2>
              <p className="muted">À votre propre numéro, pour vérifier que tout fonctionne ({data.limits.tests} par jour).</p>
              <label className="input-label">Numéro
                <input type="tel" inputMode="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07 00 00 00 00" />
              </label>
              <Button type="submit" variant="primary" icon={Send} busy={busy === "test"} disabled={!data.configured}>Envoyer le test</Button>
            </form>
            <form className="card form-card" onSubmit={requestSender}>
              <h2 className="card-title">Nom d'expéditeur</h2>
              <p className="muted">Le nom affiché à la place d'un numéro. LeTexto doit le valider avant le premier envoi (11 caractères maximum).</p>
              <label className="input-label">Nom demandé
                <input required maxLength={11} value={sender} onChange={(e) => setSender(e.target.value.toUpperCase())} />
              </label>
              <Button type="submit" icon={Send} busy={busy === "sender"} disabled={!data.configured}>Demander la validation</Button>
            </form>
          </div>

          <section className="card">
            <h2 className="card-title">Derniers envois</h2>
            {data.recent.length ? (
              <div className="table-scroll">
                <table className="table plain">
                  <thead><tr><th>Quand</th><th>Type</th><th>Destinataire</th><th>Statut</th></tr></thead>
                  <tbody>
                    {data.recent.map((row) => {
                      const delivery = row.delivery_status ? DELIVERY[row.delivery_status] : null;
                      return (
                        <tr key={row.id}>
                          <td>{ago(row.created_at)}</td>
                          <td>{EVENTS[row.event] || row.event}</td>
                          <td><span className="cell-two"><strong>{row.provider_name || (row.event === "test" ? "Test admin" : "Prestataire")}</strong><span className="mono">{maskPhone(row.phone)}</span></span></td>
                          <td>
                            {row.status === "failed" ? <><Badge tone="danger">Échec</Badge><span className="cell-error">{row.error}</span></>
                              : delivery ? <Badge tone={delivery[1]}>{delivery[0]}</Badge> : <Badge tone="info">Envoyé</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <Empty icon={MessageSquareText} title="Aucun SMS envoyé pour l'instant">Les envois apparaîtront ici avec leur statut de réception.</Empty>}
          </section>
        </>
      ) : null}
    </>
  );
}
