import { useState } from "react";
import { Eye, EyeOff, Flag, MessageSquareText, Star } from "lucide-react";
import { audit, eq, select, update } from "../api.js";
import { Badge, Button, Empty, ErrorBox, Loading, PageHeader, Segmented, ago, useAction, useLoad } from "../ui.jsx";

const REPORT_STATUS = { open: ["Ouvert", "warning"], reviewed: ["Examiné", "info"], closed: ["Clôturé", "neutral"] };
const REVIEW_STATUS = { published: ["Publié", "success"], hidden: ["Masqué", "neutral"], reviewed: ["Examiné", "info"] };

export default function Moderation({ onChange }) {
  const [tab, setTab] = useState("reports");
  return (
    <>
      <PageHeader title="Modération" subtitle="Signalements des clients et avis publiés sur les prestataires." />
      <div className="toolbar">
        <Segmented value={tab} onChange={setTab} options={[{ value: "reports", label: "Signalements" }, { value: "reviews", label: "Avis clients" }]} />
      </div>
      {tab === "reports" ? <Reports onChange={onChange} /> : <Reviews />}
    </>
  );
}

function Reports({ onChange }) {
  const [status, setStatus] = useState("open");
  const { data, error, loading, reload } = useLoad(
    () => select(`reports?select=id,reason,message,status,created_at,provider_id,providers(full_name,phone)&status=eq.${status}&order=created_at.desc&limit=100`),
    [status],
  );
  const { busy, run } = useAction();
  const setReport = (report, next) => run(`${report.id}-${next}`, async () => {
    await update("reports", `id=${eq(report.id)}`, { status: next });
    audit(`console:report:${next}`, report.id);
  }, next === "closed" ? "Signalement clôturé." : "Signalement marqué comme examiné.").then((ok) => { if (ok) { reload(); onChange?.(); } });

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">Signalements</h2>
        <Segmented value={status} onChange={setStatus} options={[{ value: "open", label: "Ouverts" }, { value: "reviewed", label: "Examinés" }, { value: "closed", label: "Clôturés" }]} />
      </div>
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : null}
      {data && !data.length ? <Empty icon={Flag} title="Aucun signalement">Les clients peuvent signaler un prestataire depuis sa fiche.</Empty> : null}
      <ul className="rows">
        {(data || []).map((report) => (
          <li key={report.id} className="row-item">
            <div className="row-main">
              <strong>{report.reason || "Signalement"} <Badge tone={REPORT_STATUS[report.status]?.[1]}>{REPORT_STATUS[report.status]?.[0] || report.status}</Badge></strong>
              <span>Prestataire : {report.providers?.full_name || "inconnu"}{report.providers?.phone ? ` (${report.providers.phone})` : ""} · {ago(report.created_at)}</span>
              {report.message ? <p className="prose">{report.message}</p> : null}
            </div>
            <div className="row-actions">
              {report.status === "open" ? <Button busy={busy === `${report.id}-reviewed`} onClick={() => setReport(report, "reviewed")}>Examiné</Button> : null}
              {report.status !== "closed" ? <Button variant="primary" busy={busy === `${report.id}-closed`} onClick={() => setReport(report, "closed")}>Clôturer</Button> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Reviews() {
  const [status, setStatus] = useState("published");
  const { data, error, loading, reload } = useLoad(
    () => select(`provider_reviews?select=id,rating,message,status,created_at,providers(full_name)&status=eq.${status}&order=created_at.desc&limit=100`),
    [status],
  );
  const { busy, run } = useAction();
  const setReview = (review, next) => run(review.id, async () => {
    await update("provider_reviews", `id=${eq(review.id)}`, { status: next });
    audit(`console:review:${next}`, review.id);
  }, next === "hidden" ? "Avis masqué." : "Avis republié.").then((ok) => ok && reload());

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">Avis clients</h2>
        <Segmented value={status} onChange={setStatus} options={[{ value: "published", label: "Publiés" }, { value: "hidden", label: "Masqués" }]} />
      </div>
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : null}
      {data && !data.length ? <Empty icon={MessageSquareText} title="Aucun avis ici" /> : null}
      <ul className="rows">
        {(data || []).map((review) => (
          <li key={review.id} className="row-item">
            <div className="row-main">
              <strong className="stars" aria-label={`${review.rating} sur 5`}>
                {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} className={index < review.rating ? "star-on" : "star-off"} aria-hidden="true" />)}
                <span>{review.providers?.full_name || "Prestataire"}</span>
              </strong>
              <span>{ago(review.created_at)} <Badge tone={REVIEW_STATUS[review.status]?.[1]}>{REVIEW_STATUS[review.status]?.[0] || review.status}</Badge></span>
              {review.message ? <p className="prose">{review.message}</p> : null}
            </div>
            <div className="row-actions">
              {review.status === "published"
                ? <Button icon={EyeOff} busy={busy === review.id} onClick={() => setReview(review, "hidden")}>Masquer</Button>
                : <Button icon={Eye} busy={busy === review.id} onClick={() => setReview(review, "published")}>Republier</Button>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
