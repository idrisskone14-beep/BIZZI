import { useEffect, useState } from "react";
import { FileImage, MessageCircle, Phone, PlayCircle, Search, ShieldOff, ShieldPlus, Star, Users } from "lucide-react";
import { audit, eq, like, privateFileUrl, rpc, select, selectCount } from "../api.js";
import {
  Avatar, Badge, Button, Drawer, Empty, ErrorBox, Field, Loading, PageHeader, Segmented,
  ago, dateFr, money, phoneLink, useAction, useLoad, whatsappLink,
} from "../ui.jsx";

export const VISIBILITY = {
  trial: ["Essai gratuit", "info"],
  active: ["Abonné", "success"],
  expired_blurred: ["Expiré", "warning"],
  hidden: ["Masqué", "neutral"],
};
const STATUS = {
  pending: ["En attente", "warning"],
  approved: ["Validé", "success"],
  suspended: ["Suspendu", "danger"],
  rejected: ["Refusé", "danger"],
};
const FILTERS = [
  { value: "", label: "Tous" },
  { value: "visibility_status=eq.active", label: "Abonnés" },
  { value: "visibility_status=eq.trial", label: "Essai" },
  { value: "visibility_status=eq.expired_blurred", label: "Expirés" },
  { value: "status=eq.suspended", label: "Suspendus" },
  { value: "status=eq.pending", label: "En attente" },
];
const PAGE = 30;
const FIELDS = "id,full_name,phone,whatsapp,email,photo_url,description,neighborhood,status,visibility_status,is_verified,verification_proof_url,trial_ends_at,subscription_ends_at,boost_ends_at,average_rating,review_count,call_count,created_at,requested_service_name,requested_category_name,cities(name),communes(name),provider_services(is_primary,services(name))";

export function serviceOf(provider) {
  const services = provider?.provider_services || [];
  const primary = services.find((item) => item.is_primary) || services[0];
  return primary?.services?.name || provider?.requested_service_name || "Métier à préciser";
}

export function accessEnd(provider) {
  return provider.visibility_status === "active" ? provider.subscription_ends_at : provider.trial_ends_at;
}

function ProviderStatus({ provider }) {
  if (provider.status !== "approved") {
    const [label, tone] = STATUS[provider.status] || [provider.status, "neutral"];
    return <Badge tone={tone}>{label}</Badge>;
  }
  const [label, tone] = VISIBILITY[provider.visibility_status] || [provider.visibility_status, "neutral"];
  return <Badge tone={tone}>{label}</Badge>;
}

export default function Providers({ onChange }) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const load = async (offset = 0) => {
    setState({ loading: true, error: null });
    try {
      const parts = [`select=${FIELDS}`, "order=created_at.desc", `limit=${PAGE}`, `offset=${offset}`];
      if (filter) parts.push(filter);
      if (search) {
        const value = like(search);
        parts.push(`or=(full_name.ilike.${encodeURIComponent(value)},phone.ilike.${encodeURIComponent(value)},email.ilike.${encodeURIComponent(value)},requested_service_name.ilike.${encodeURIComponent(value)})`);
      }
      const result = await selectCount(`providers?${parts.join("&")}`);
      setRows((previous) => (offset ? [...previous, ...result.rows] : result.rows));
      setTotal(result.total);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(0); }, [search, filter]);

  const refreshOne = (updated) => {
    if (!updated) return load(0);
    setRows((list) => list.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)));
    onChange?.();
    return null;
  };

  return (
    <>
      <PageHeader title="Prestataires" subtitle={total != null ? `${total} prestataire${total > 1 ? "s" : ""}` : "Annuaire complet"} />
      <div className="toolbar">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, téléphone, e-mail ou métier" aria-label="Rechercher un prestataire" />
        </label>
        <Segmented value={filter} onChange={setFilter} options={FILTERS} />
      </div>
      <ErrorBox error={state.error} onRetry={() => load(0)} />
      <div className="table-card">
        <table className="table">
          <thead>
            <tr><th>Prestataire</th><th className="hide-sm">Métier · ville</th><th>Statut</th><th className="hide-md">Fin d'accès</th><th className="hide-md">Note</th></tr>
          </thead>
          <tbody>
            {rows.map((provider) => (
              <tr key={provider.id} onClick={() => setOpenId(provider.id)} tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setOpenId(provider.id); }}>
                <td>
                  <div className="cell-person">
                    <Avatar name={provider.full_name} src={provider.photo_url} />
                    <div><strong>{provider.full_name || "Sans nom"}</strong><span>{provider.phone || "—"}</span></div>
                  </div>
                </td>
                <td className="hide-sm"><span className="cell-two"><strong>{serviceOf(provider)}</strong><span>{[provider.communes?.name, provider.cities?.name].filter(Boolean).join(", ") || "—"}</span></span></td>
                <td><ProviderStatus provider={provider} /></td>
                <td className="hide-md">{dateFr(accessEnd(provider))}</td>
                <td className="hide-md">{Number(provider.review_count) ? <span className="rating"><Star size={13} aria-hidden="true" />{Number(provider.average_rating || 0).toFixed(1)} ({provider.review_count})</span> : <span className="muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {state.loading ? <Loading /> : null}
        {!state.loading && !rows.length && !state.error ? <Empty icon={Users} title="Aucun prestataire trouvé">Essayez un autre nom ou retirez le filtre.</Empty> : null}
        {!state.loading && rows.length < (total || 0) ? (
          <div className="table-more"><Button onClick={() => load(rows.length)}>Afficher plus ({total - rows.length} restants)</Button></div>
        ) : null}
      </div>
      <ProviderDrawer id={openId} onClose={() => setOpenId(null)} onUpdated={refreshOne} />
    </>
  );
}

function ProofPreview({ path }) {
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
  if (!path) return <p className="muted">Aucun justificatif envoyé.</p>;
  if (state.error) return <p className="muted">{state.error}</p>;
  if (!state.url) return <Loading label="Ouverture du justificatif…" />;
  return (
    <a className="proof" href={state.url} target="_blank" rel="noreferrer">
      <img src={state.url} alt="Justificatif" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      <span><FileImage size={14} aria-hidden="true" />Ouvrir le justificatif</span>
    </a>
  );
}

async function loadProvider(id) {
  const [rows, payments, reviews, reports] = await Promise.all([
    select(`providers?select=${FIELDS}&id=${eq(id)}`),
    select(`payments?select=id,amount,currency,method,status,transaction_reference,created_at,subscription_plans(name)&provider_id=${eq(id)}&order=created_at.desc&limit=10`).catch(() => []),
    select(`provider_reviews?select=id,rating,message,status,created_at&provider_id=${eq(id)}&order=created_at.desc&limit=10`).catch(() => []),
    select(`reports?select=id,reason,message,status,created_at&provider_id=${eq(id)}&order=created_at.desc&limit=10`).catch(() => []),
  ]);
  if (!rows[0]) throw new Error("Prestataire introuvable.");
  return { provider: rows[0], payments, reviews, reports };
}

function ProviderDrawer({ id, onClose, onUpdated }) {
  const { data, error, loading, reload } = useLoad(() => (id ? loadProvider(id) : Promise.resolve(null)), [id]);
  const { busy, run } = useAction();
  const provider = data?.provider;

  const act = async (key, rpcName, args, message, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    const ok = await run(key, async () => {
      const result = await rpc(rpcName, args);
      audit(`console:${rpcName}`, id, { result });
    }, message);
    if (ok) {
      const fresh = await loadProvider(id).catch(() => null);
      reload();
      onUpdated(fresh?.provider || null);
    }
  };

  const hidden = provider && (provider.status === "suspended" || provider.visibility_status === "hidden");
  const footer = provider ? (
    <>
      {provider.status === "pending" ? (
        <Button variant="primary" icon={PlayCircle} busy={busy === "trial"}
          onClick={() => act("trial", "admin_activate_trial_provider", { provider_uuid: id }, "Essai gratuit activé : le prestataire est visible.")}>
          Activer l'essai gratuit
        </Button>
      ) : null}
      {hidden ? (
        <Button variant="primary" icon={ShieldPlus} busy={busy === "on"}
          onClick={() => act("on", "admin_reactivate_provider", { provider_uuid: id }, "Prestataire réactivé.")}>
          Réactiver
        </Button>
      ) : provider.status !== "pending" ? (
        <Button variant="danger" icon={ShieldOff} busy={busy === "off"}
          onClick={() => act("off", "admin_suspend_provider", { provider_uuid: id }, "Prestataire suspendu : il n'apparaît plus aux clients.",
            `Suspendre ${provider.full_name || "ce prestataire"} ? Il ne sera plus visible des clients.`)}>
          Suspendre
        </Button>
      ) : null}
    </>
  ) : null;

  return (
    <Drawer open={Boolean(id)} onClose={onClose} title={provider?.full_name || "Prestataire"}
      subtitle={provider ? `${serviceOf(provider)} · inscrit ${ago(provider.created_at)}` : ""} footer={footer}>
      <ErrorBox error={error} onRetry={reload} />
      {loading && !provider ? <Loading /> : null}
      {provider ? (
        <>
          <div className="profile-head">
            <Avatar name={provider.full_name} src={provider.photo_url} size={56} />
            <div className="profile-badges">
              <ProviderStatus provider={provider} />
              {provider.is_verified ? <Badge tone="success">Identité vérifiée</Badge> : null}
              {Number(provider.review_count) ? <Badge tone="neutral">{Number(provider.average_rating || 0).toFixed(1)} / 5 · {provider.review_count} avis</Badge> : null}
            </div>
          </div>
          <div className="quick-actions">
            {provider.phone ? <a className="btn btn-secondary" href={phoneLink(provider.phone)}><Phone size={15} aria-hidden="true" />Appeler</a> : null}
            {provider.whatsapp || provider.phone ? <a className="btn btn-secondary" href={whatsappLink(provider.whatsapp || provider.phone)} target="_blank" rel="noreferrer"><MessageCircle size={15} aria-hidden="true" />WhatsApp</a> : null}
          </div>
          <div className="fields">
            <Field label="Téléphone">{provider.phone}</Field>
            <Field label="E-mail">{provider.email}</Field>
            <Field label="Ville">{[provider.neighborhood, provider.communes?.name, provider.cities?.name].filter(Boolean).join(", ")}</Field>
            <Field label="Catégorie">{provider.requested_category_name}</Field>
            <Field label="Fin de l'essai">{dateFr(provider.trial_ends_at)}</Field>
            <Field label="Fin d'abonnement">{dateFr(provider.subscription_ends_at)}</Field>
            <Field label="Mise en avant jusqu'au">{dateFr(provider.boost_ends_at)}</Field>
            <Field label="Appels reçus">{String(provider.call_count ?? 0)}</Field>
          </div>
          {provider.description ? <><h3 className="section-title">Présentation</h3><p className="prose">{provider.description}</p></> : null}
          <h3 className="section-title">Justificatif d'identité</h3>
          <ProofPreview path={provider.verification_proof_url} />
          <h3 className="section-title">Paiements</h3>
          {data.payments.length ? (
            <ul className="mini-list compact">
              {data.payments.map((payment) => (
                <li key={payment.id}>
                  <div className="mini-main"><strong>{money(payment.amount, payment.currency)}</strong><span>{payment.subscription_plans?.name || "Abonnement"} · réf. {payment.transaction_reference || "—"}</span></div>
                  <div className="mini-side"><Badge tone={{ pending: "warning", approved: "success", rejected: "danger" }[payment.status]}>{{ pending: "En attente", approved: "Validé", rejected: "Refusé" }[payment.status] || payment.status}</Badge><span>{dateFr(payment.created_at)}</span></div>
                </li>
              ))}
            </ul>
          ) : <p className="muted">Aucun paiement.</p>}
          <h3 className="section-title">Avis clients</h3>
          {data.reviews.length ? (
            <ul className="mini-list compact">
              {data.reviews.map((review) => (
                <li key={review.id}>
                  <div className="mini-main"><strong>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong><span>{review.message || "Sans commentaire"}</span></div>
                  <div className="mini-side"><span>{dateFr(review.created_at)}</span></div>
                </li>
              ))}
            </ul>
          ) : <p className="muted">Aucun avis.</p>}
          {data.reports.length ? (
            <>
              <h3 className="section-title">Signalements</h3>
              <ul className="mini-list compact">
                {data.reports.map((report) => (
                  <li key={report.id}>
                    <div className="mini-main"><strong>{report.reason || "Signalement"}</strong><span>{report.message || ""}</span></div>
                    <div className="mini-side"><Badge tone={report.status === "open" ? "warning" : "neutral"}>{report.status === "open" ? "Ouvert" : "Traité"}</Badge></div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      ) : null}
    </Drawer>
  );
}
