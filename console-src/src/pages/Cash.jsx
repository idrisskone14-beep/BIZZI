import { useState } from "react";
import { Check, Coins, Scale, X } from "lucide-react";
import { audit, rpc } from "../api.js";
import { Badge, Button, Empty, ErrorBox, Loading, Metric, PageHeader, ago, money, useAction, useLoad } from "../ui.jsx";

async function loadCash() {
  const [stats, missions, disputes] = await Promise.all([
    rpc("cash_admin_stats"),
    rpc("cash_admin_list_missions", { p_status: "payment_pending", p_limit: 50 }),
    rpc("cash_admin_list_disputes", { p_status: "open" }),
  ]);
  return { stats: stats || {}, missions: missions || [], disputes: disputes || [] };
}

export default function Cash({ onChange }) {
  const { data, error, loading, reload } = useLoad(loadCash);
  const { busy, run } = useAction();
  const [resolving, setResolving] = useState(null);

  const done = (ok) => { if (ok) { reload(); onChange?.(); } };

  const approve = (mission) => run(`ok-${mission.id}`, async () => {
    await rpc("cash_admin_approve_payment", { p_mission_id: mission.id });
    audit("console:cash_admin_approve_payment", mission.id);
  }, "Paiement approuvé : la mission est publiée.").then(done);

  const reject = (mission) => {
    const reason = window.prompt("Motif du rejet (envoyé au demandeur) :", "Paiement non reçu");
    if (reason === null) return;
    run(`no-${mission.id}`, async () => {
      await rpc("cash_admin_reject_payment", { p_mission_id: mission.id, p_reason: reason });
      audit("console:cash_admin_reject_payment", mission.id, { reason });
    }, "Paiement rejeté.").then(done);
  };

  const resolve = (dispute, favor) => {
    const resolution = window.prompt("Résolution (visible par les deux parties) :", "");
    if (resolution === null) return;
    setResolving(dispute.id);
    run(`d-${dispute.id}-${favor}`, async () => {
      await rpc("cash_admin_resolve_dispute", { p_dispute_id: dispute.id, p_favor: favor, p_resolution: resolution, p_solver_share_amount: null });
      audit("console:cash_admin_resolve_dispute", dispute.id, { favor });
    }, "Litige résolu.").then((ok) => { setResolving(null); done(ok); });
  };

  const stats = data?.stats || {};
  return (
    <>
      <PageHeader title="Zeyds Cash" subtitle="Missions rémunérées entre particuliers : paiements à vérifier et litiges." />
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : null}
      {data ? (
        <>
          <section className="metrics">
            <Metric label="Missions actives" value={stats.missions_active ?? 0} hint={`${stats.missions_total ?? 0} au total`} />
            <Metric label="Terminées" value={stats.missions_completed ?? 0} />
            <Metric label="Commissions" value={money(stats.total_commission)} tone="brand" />
            <Metric label="Versé aux solveurs" value={money(stats.total_paid_to_solvers)} />
          </section>

          <section className="card">
            <h2 className="card-title">Paiements à vérifier <Badge tone={data.missions.length ? "warning" : "neutral"}>{data.missions.length}</Badge></h2>
            {data.missions.length ? (
              <ul className="rows">
                {data.missions.map((mission) => (
                  <li key={mission.id} className="row-item">
                    <div className="row-main">
                      <strong>{mission.title}</strong>
                      <span>{[mission.category, mission.requester_name, mission.area].filter(Boolean).join(" · ")} · {ago(mission.created_at)}</span>
                      {mission.escrow_reference ? <span className="mono small">Réf. paiement : {mission.escrow_reference}</span> : null}
                    </div>
                    <strong className="row-amount">{money(mission.reward_amount)}</strong>
                    <div className="row-actions">
                      <Button variant="primary" icon={Check} busy={busy === `ok-${mission.id}`} onClick={() => approve(mission)}>Approuver</Button>
                      <Button variant="danger" icon={X} busy={busy === `no-${mission.id}`} onClick={() => reject(mission)}>Rejeter</Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <Empty icon={Coins} title="Aucun paiement en attente" />}
          </section>

          <section className="card">
            <h2 className="card-title">Litiges ouverts <Badge tone={data.disputes.length ? "danger" : "neutral"}>{data.disputes.length}</Badge></h2>
            {data.disputes.length ? (
              <ul className="rows">
                {data.disputes.map((dispute) => (
                  <li key={dispute.id} className="row-item">
                    <div className="row-main">
                      <strong>{dispute.mission_title}</strong>
                      <span>{dispute.category} · {ago(dispute.created_at)}</span>
                      {dispute.description ? <p className="prose">{dispute.description}</p> : null}
                    </div>
                    <strong className="row-amount">{money(dispute.mission_reward)}</strong>
                    <div className="row-actions">
                      <Button disabled={resolving === dispute.id} busy={busy === `d-${dispute.id}-solver`} onClick={() => resolve(dispute, "solver")}>Pour le solveur</Button>
                      <Button disabled={resolving === dispute.id} busy={busy === `d-${dispute.id}-requester`} onClick={() => resolve(dispute, "requester")}>Pour le demandeur</Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <Empty icon={Scale} title="Aucun litige ouvert" />}
          </section>
        </>
      ) : null}
    </>
  );
}
