import { useState } from "react";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { audit, rpc } from "../api.js";
import { Button, Empty, ErrorBox, Loading, PageHeader, ago, useAction, useLoad } from "../ui.jsx";

const LABELS = {
  production_unlocked: ["Ouverture publique de la plateforme", "Quand c'est désactivé, l'app reste en pré-lancement."],
  tab_search: ["Onglet Recherche", "Visible dans le menu de l'application."],
  tab_provider: ["Onglet Prestataires", "Visible dans le menu de l'application."],
  tab_delivery: ["Onglet Livraison", "Visible dans le menu de l'application."],
  tab_jobs: ["Onglet Emplois", "Visible dans le menu de l'application."],
  tab_events: ["Onglet Événements", "Visible dans le menu de l'application."],
  tab_food: ["Onglet Food", "Visible dans le menu de l'application."],
  tab_exception_places: ["Onglet Lieux d'exception", "Visible dans le menu de l'application."],
  tab_life: ["Onglet Vie pratique", "Visible dans le menu de l'application."],
  cash_commission_rate: ["Commission Zeyds Cash", "0,1 = 10 % prélevés sur chaque mission."],
  cash_min_reward: ["Récompense minimum (FCFA)", "Montant le plus bas qu'un demandeur peut proposer."],
  cash_max_reward: ["Récompense maximum (FCFA)", "Montant le plus haut qu'un demandeur peut proposer."],
  cash_max_active_solutions: ["Solutions actives par mission", "Nombre de solveurs qui peuvent répondre en même temps."],
  cash_completion_reminder_hours: ["Rappel de validation (heures)", "Délai avant de rappeler au demandeur de valider la mission."],
  cash_completion_autoresolve_hours: ["Validation automatique (heures)", "Délai après lequel une mission terminée est validée d'office."],
  cash_credit_validity_days: ["Validité des crédits (jours)", "Durée d'utilisation d'un crédit Zeyds Cash."],
};

const ORDER = (key) => (key === "production_unlocked" ? 0 : key.startsWith("tab_") ? 1 : 2);
const show = (value) => (typeof value === "string" ? value : JSON.stringify(value));
function parse(text) {
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch { return trimmed; }
}

export default function SettingsPage() {
  const { data, error, loading, reload } = useLoad(() => rpc("admin_list_platform_settings"));
  const [drafts, setDrafts] = useState({});
  const { busy, run } = useAction();

  const save = (setting, value) => run(setting.key, async () => {
    await rpc("admin_set_platform_setting", { p_key: setting.key, p_value: value });
    audit("console:set_platform_setting", setting.key, { value });
  }, "Réglage enregistré.").then((ok) => {
    if (ok) { setDrafts((all) => { const next = { ...all }; delete next[setting.key]; return next; }); reload(); }
  });

  const toggle = (setting) => {
    const next = !setting.value;
    const [label] = LABELS[setting.key] || [setting.key];
    if (!window.confirm(`${next ? "Activer" : "Désactiver"} « ${label} » ? Le changement s'applique tout de suite pour tous les utilisateurs.`)) return;
    save(setting, next);
  };

  const sorted = [...(data || [])].sort((a, b) => ORDER(a.key) - ORDER(b.key) || a.key.localeCompare(b.key));
  return (
    <>
      <PageHeader title="Réglages" subtitle="Paramètres sensibles de la plateforme. Chaque modification est tracée dans le journal." />
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : null}
      {data && !data.length ? <div className="card"><Empty icon={SettingsIcon} title="Aucun réglage" /></div> : null}
      {sorted.length ? (
        <section className="card settings">
          {sorted.map((setting) => {
            const [label, help] = LABELS[setting.key] || [setting.key, ""];
            const meta = setting.updated_at ? `modifié ${ago(setting.updated_at)}${setting.updated_by_email ? ` par ${setting.updated_by_email}` : ""}` : "";
            if (typeof setting.value === "boolean") {
              return (
                <div key={setting.key} className="setting-row setting-bool">
                  <div className="setting-label"><strong>{label}</strong><span>{[help, meta].filter(Boolean).join(" · ")}</span></div>
                  <button type="button" role="switch" aria-checked={setting.value} aria-label={label}
                    className={`switch ${setting.value ? "on" : ""}`} disabled={busy === setting.key} onClick={() => toggle(setting)}>
                    <span />
                  </button>
                </div>
              );
            }
            const draft = drafts[setting.key];
            const changed = draft !== undefined && draft !== show(setting.value);
            return (
              <div key={setting.key} className="setting-row">
                <div className="setting-label"><strong>{label}</strong><span>{[help, meta].filter(Boolean).join(" · ")}</span></div>
                <input aria-label={label} value={draft ?? show(setting.value)} onChange={(e) => setDrafts((all) => ({ ...all, [setting.key]: e.target.value }))} />
                <Button variant={changed ? "primary" : "secondary"} icon={Save} disabled={!changed} busy={busy === setting.key}
                  onClick={() => save(setting, parse(drafts[setting.key]))}>Enregistrer</Button>
              </div>
            );
          })}
        </section>
      ) : null}
    </>
  );
}
