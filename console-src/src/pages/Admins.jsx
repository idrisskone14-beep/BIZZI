import { useState } from "react";
import { History, ShieldCheck } from "lucide-react";
import { audit, rpc, select } from "../api.js";
import { Avatar, Badge, Button, Empty, ErrorBox, Loading, PageHeader, Segmented, ago, dateFr, useAction, useLoad } from "../ui.jsx";

const ACTION_LABELS = {
  admin_approve_payment: "Paiement validé",
  reject_payment: "Paiement refusé",
  admin_activate_trial_provider: "Essai activé",
  admin_suspend_provider: "Prestataire suspendu",
  admin_reactivate_provider: "Prestataire réactivé",
  cash_admin_approve_payment: "Paiement Zeyds Cash approuvé",
  cash_admin_reject_payment: "Paiement Zeyds Cash rejeté",
  cash_admin_resolve_dispute: "Litige résolu",
  set_admin_active: "Accès admin modifié",
  set_platform_setting: "Réglage modifié",
};

function actionLabel(action = "") {
  const key = action.replace(/^console:/, "");
  if (ACTION_LABELS[key]) return ACTION_LABELS[key];
  const [table, verb] = key.split(":").slice(-2);
  if (verb === "publish") return `Publication (${table}) en ligne`;
  if (verb === "reject") return `Publication (${table}) retirée`;
  return key.replace(/_/g, " ");
}

export default function Admins({ session }) {
  const [tab, setTab] = useState("admins");
  return (
    <>
      <PageHeader title="Admins et journal" subtitle="Qui a accès à la console, et l'historique de toutes les actions." />
      <div className="toolbar">
        <Segmented value={tab} onChange={setTab} options={[{ value: "admins", label: "Administrateurs" }, { value: "journal", label: "Journal d'audit" }]} />
      </div>
      {tab === "admins" ? <AdminList session={session} /> : <Journal />}
    </>
  );
}

function AdminList({ session }) {
  const { data, error, loading, reload } = useLoad(() => rpc("admin_list_admins"));
  const { busy, run } = useAction();

  const toggle = (admin) => {
    const next = !admin.is_active;
    if (!next && admin.email === session.email) { window.alert("Vous ne pouvez pas retirer votre propre accès."); return; }
    if (!window.confirm(`${next ? "Rétablir" : "Retirer"} l'accès admin de ${admin.full_name || admin.email} ?`)) return;
    run(admin.auth_user_id, async () => {
      await rpc("admin_set_admin_active", { target_auth_user_id: admin.auth_user_id, p_is_active: next });
      audit("console:set_admin_active", admin.auth_user_id, { is_active: next });
    }, next ? "Accès rétabli." : "Accès retiré.").then((ok) => ok && reload());
  };

  return (
    <section className="card">
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : null}
      {data && !data.length ? <Empty icon={ShieldCheck} title="Aucun administrateur" /> : null}
      <ul className="rows">
        {(data || []).map((admin) => (
          <li key={admin.id} className="row-item">
            <Avatar name={admin.full_name || admin.email} size={36} />
            <div className="row-main">
              <strong>{admin.full_name || "Sans nom"} {admin.email === session.email ? <Badge tone="info">Vous</Badge> : null}</strong>
              <span>{admin.email || "E-mail inconnu"} · depuis le {dateFr(admin.created_at)}</span>
            </div>
            <div className="row-actions">
              <Badge tone={admin.role === "super_admin" ? "brand" : "neutral"}>{admin.role === "super_admin" ? "Super admin" : "Admin"}</Badge>
              <Badge tone={admin.is_active ? "success" : "danger"}>{admin.is_active ? "Actif" : "Désactivé"}</Badge>
              <Button busy={busy === admin.auth_user_id} onClick={() => toggle(admin)}>{admin.is_active ? "Retirer l'accès" : "Rétablir"}</Button>
            </div>
          </li>
        ))}
      </ul>
      <p className="hint">Un nouvel admin se connecte une première fois avec « Première connexion ou mot de passe oublié » : il reçoit un code par e-mail et choisit son mot de passe.</p>
    </section>
  );
}

function Journal() {
  const { data, error, loading, reload } = useLoad(() => select("admin_audit_events?select=id,action,target_id,success,error_message,created_at,actor_email&order=created_at.desc&limit=150"));
  return (
    <section className="card">
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : null}
      {data && !data.length ? <Empty icon={History} title="Journal vide">Chaque action faite dans la console sera tracée ici.</Empty> : null}
      <ul className="timeline">
        {(data || []).map((event) => (
          <li key={event.id}>
            <span className={`dot ${event.success ? "dot-ok" : "dot-ko"}`} aria-hidden="true" />
            <div>
              <strong>{actionLabel(event.action)}</strong>
              <span>{event.actor_email || "Admin"} · {ago(event.created_at)}{event.error_message ? ` · ${event.error_message}` : ""}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
