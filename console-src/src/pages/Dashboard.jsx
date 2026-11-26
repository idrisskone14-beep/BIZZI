import { ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { count, rpc, select } from "../api.js";
import { Avatar, Badge, Button, ErrorBox, Loading, Metric, PageHeader, ago, money, useLoad } from "../ui.jsx";
import { VISIBILITY } from "./Providers.jsx";

const iso = (date) => encodeURIComponent(date.toISOString());

async function loadDashboard() {
  const now = new Date();
  const inWeek = new Date(now.getTime() + 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const safe = (promise, fallback = 0) => promise.catch(() => fallback);
  const [
    total, active, trial, hidden, suspended, expiring, payments, requests, reports,
    jobs, events, foods, places, monthPayments, recentProviders, recentPayments, cash,
  ] = await Promise.all([
    count("providers"),
    safe(count("providers", "visibility_status=eq.active")),
    safe(count("providers", "visibility_status=eq.trial")),
    safe(count("providers", "visibility_status=in.(hidden,expired_blurred)")),
    safe(count("providers", "status=eq.suspended")),
    safe(count("providers", `or=(and(trial_ends_at.gte.${iso(now)},trial_ends_at.lte.${iso(inWeek)}),and(subscription_ends_at.gte.${iso(now)},subscription_ends_at.lte.${iso(inWeek)}))`)),
    safe(count("payments", "status=eq.pending")),
    safe(count("express_requests", "status=eq.open")),
    safe(count("reports", "status=eq.open")),
    safe(count("job_offers", "status=eq.pending")),
    safe(count("event_promotions", "status=eq.pending")),
    safe(count("food_places", "status=eq.pending")),
    safe(count("exception_places", "status=eq.pending")),
    safe(select(`payments?select=amount&status=eq.approved&approved_at=gte.${iso(monthStart)}`), []),
    safe(select("providers?select=id,full_name,photo_url,visibility_status,created_at,requested_service_name,cities(name)&order=created_at.desc&limit=6"), []),
    safe(select("payments?select=id,amount,currency,method,status,created_at,providers(full_name)&order=created_at.desc&limit=6"), []),
    safe(rpc("cash_admin_stats"), null),
  ]);
  return {
    total, active, trial, hidden, suspended, expiring, payments, requests, reports,
    publications: jobs + events + foods + places,
    monthRevenue: monthPayments.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    recentProviders, recentPayments, cash,
  };
}

const METHODS = { wave: "Wave", orange_money: "Orange Money", mtn_money: "MTN Money" };
const PAY_STATUS = { pending: ["En attente", "warning"], approved: ["Validé", "success"], rejected: ["Refusé", "danger"] };

export default function Dashboard() {
  const { data, error, loading, reload } = useLoad(loadDashboard);
  const go = (route) => { window.location.hash = `#/${route}`; };

  const todo = data ? [
    { n: data.payments, label: "paiement(s) d'abonnement à vérifier", route: "paiements" },
    { n: data.publications, label: "publication(s) en attente (emplois, événements, food, lieux)", route: "publications" },
    { n: data.requests, label: "demande(s) express ouverte(s)", route: "demandes" },
    { n: data.reports, label: "signalement(s) client à traiter", route: "moderation" },
    { n: Number(data.cash?.missions_payment_pending || 0) + Number(data.cash?.open_disputes || 0), label: "action(s) Zeyds Cash (paiements, litiges)", route: "cash" },
    { n: data.expiring, label: "prestataire(s) dont l'accès expire sous 7 jours", route: "prestataires" },
  ].filter((item) => item.n > 0) : [];

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de Zeyds en temps réel.">
        <Button icon={RefreshCw} onClick={reload} busy={loading && Boolean(data)}>Actualiser</Button>
      </PageHeader>
      <ErrorBox error={error} onRetry={reload} />
      {!data && loading ? <Loading /> : null}
      {data ? (
        <>
          <section className="metrics">
            <Metric label="Prestataires" value={data.total} hint={`${data.active} abonnés · ${data.trial} en essai`} onClick={() => go("prestataires")} />
            <Metric label="Revenus du mois" value={money(data.monthRevenue)} hint="Abonnements validés" tone="brand" onClick={() => go("paiements")} />
            <Metric label="Commissions Zeyds Cash" value={money(data.cash?.total_commission)} hint={`${data.cash?.missions_total ?? 0} missions au total`} onClick={() => go("cash")} />
            <Metric label="Masqués ou suspendus" value={data.hidden + data.suspended} hint="Non visibles des clients" onClick={() => go("prestataires")} />
          </section>

          <div className="grid-2">
            <section className="card">
              <h2 className="card-title">À traiter</h2>
              {todo.length ? (
                <ul className="todo">
                  {todo.map((item) => (
                    <li key={item.route + item.label}>
                      <button type="button" onClick={() => go(item.route)}>
                        <strong>{item.n}</strong><span>{item.label}</span><ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="all-clear"><CheckCircle2 size={22} aria-hidden="true" /><span>Tout est à jour. Rien n'attend de validation.</span></div>
              )}
            </section>

            <section className="card">
              <h2 className="card-title">Derniers prestataires inscrits</h2>
              <ul className="mini-list">
                {data.recentProviders.map((provider) => (
                  <li key={provider.id}>
                    <Avatar name={provider.full_name} src={provider.photo_url} size={30} />
                    <div className="mini-main">
                      <strong>{provider.full_name || "Sans nom"}</strong>
                      <span>{provider.requested_service_name || "Métier à préciser"} · {provider.cities?.name || "Ville ?"}</span>
                    </div>
                    <div className="mini-side">
                      <Badge tone={VISIBILITY[provider.visibility_status]?.[1] || "neutral"}>{VISIBILITY[provider.visibility_status]?.[0] || provider.visibility_status}</Badge>
                      <span>{ago(provider.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="card">
            <h2 className="card-title">Derniers paiements</h2>
            {data.recentPayments.length ? (
              <ul className="mini-list">
                {data.recentPayments.map((payment) => (
                  <li key={payment.id}>
                    <Avatar name={payment.providers?.full_name} size={30} />
                    <div className="mini-main">
                      <strong>{payment.providers?.full_name || "Prestataire"}</strong>
                      <span>{money(payment.amount, payment.currency)} · {METHODS[payment.method] || payment.method}</span>
                    </div>
                    <div className="mini-side">
                      <Badge tone={PAY_STATUS[payment.status]?.[1]}>{PAY_STATUS[payment.status]?.[0] || payment.status}</Badge>
                      <span>{ago(payment.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">Aucun paiement pour le moment.</p>}
          </section>
        </>
      ) : null}
    </>
  );
}
