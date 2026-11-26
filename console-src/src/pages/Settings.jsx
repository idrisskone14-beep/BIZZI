import { useState } from "react";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { audit, rpc } from "../api.js";
import { Button, Empty, ErrorBox, Loading, PageHeader, ago, useAction, useLoad } from "../ui.jsx";

const LABELS = {
  cash_commission_rate: "Commission Zeyds Cash (0,1 = 10 %)",
  cash_completion_autoresolve_hours: "Validation automatique d'une mission terminée (heures)",
};

const show = (value) => (typeof value === "string" ? value : JSON.stringify(value));
function parse(text) {
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch { return trimmed; }
}

export default function SettingsPage() {
  const { data, error, loading, reload } = useLoad(() => rpc("admin_list_platform_settings"));
  const [drafts, setDrafts] = useState({});
  const { busy, run } = useAction();

  const save = (setting) => {
    const value = parse(drafts[setting.key]);
    run(setting.key, async () => {
      await rpc("admin_set_platform_setting", { p_key: setting.key, p_value: value });
      audit("console:set_platform_setting", setting.key, { value });
    }, "Réglage enregistré.").then((ok) => {
      if (ok) { setDrafts((all) => { const next = { ...all }; delete next[setting.key]; return next; }); reload(); }
    });
  };

  return (
    <>
      <PageHeader title="Réglages" subtitle="Paramètres sensibles de la plateforme. Chaque modification est tracée dans le journal." />
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : null}
      {data && !data.length ? <div className="card"><Empty icon={SettingsIcon} title="Aucun réglage" /></div> : null}
      <section className="card settings">
        {(data || []).map((setting) => {
          const draft = drafts[setting.key];
          const changed = draft !== undefined && draft !== show(setting.value);
          return (
            <div key={setting.key} className="setting-row">
              <div className="setting-label">
                <strong>{LABELS[setting.key] || setting.key}</strong>
                <span>{setting.key}{setting.updated_at ? ` · modifié ${ago(setting.updated_at)}${setting.updated_by_email ? ` par ${setting.updated_by_email}` : ""}` : ""}</span>
              </div>
              <input aria-label={setting.key} value={draft ?? show(setting.value)} onChange={(e) => setDrafts((all) => ({ ...all, [setting.key]: e.target.value }))} />
              <Button variant={changed ? "primary" : "secondary"} icon={Save} disabled={!changed} busy={busy === setting.key} onClick={() => save(setting)}>Enregistrer</Button>
            </div>
          );
        })}
      </section>
    </>
  );
}
