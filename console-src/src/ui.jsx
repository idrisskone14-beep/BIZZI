import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";

export const money = (value, currency = "FCFA") =>
  `${Math.round(Number(value || 0)).toLocaleString("fr-FR")} ${currency === "XOF" ? "FCFA" : currency || "FCFA"}`;

export function dateFr(value, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" });
}

export function ago(value) {
  if (!value) return "";
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  return dateFr(value);
}

export const initials = (name = "") =>
  String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "?";

export const phoneLink = (phone = "") => `tel:${String(phone).replace(/[^\d+]/g, "")}`;
export function whatsappLink(phone = "") {
  let digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) digits = `225${digits}`;
  return `https://wa.me/${digits}`;
}

export function Button({ variant = "secondary", busy = false, icon: Icon, children, className = "", ...props }) {
  return (
    <button type="button" className={`btn btn-${variant} ${className}`} disabled={busy || props.disabled} {...props}>
      {busy ? <Loader2 size={15} className="spin" aria-hidden="true" /> : Icon ? <Icon size={15} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Badge({ tone = "neutral", children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Avatar({ name, src, size = 32 }) {
  return src
    ? <img className="avatar" src={src} alt="" width={size} height={size} style={{ width: size, height: size }} loading="lazy" />
    : <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">{initials(name)}</span>;
}

export function Metric({ label, value, hint, tone, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} className={`metric ${tone ? `metric-${tone}` : ""}`} onClick={onClick}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value ?? "…"}</strong>
      {hint ? <span className="metric-hint">{hint}</span> : null}
    </Tag>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children ? <div className="page-actions">{children}</div> : null}
    </header>
  );
}

export function Segmented({ value, onChange, options }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((option) => (
        <button key={option.value} type="button" role="tab" aria-selected={value === option.value}
          className={value === option.value ? "on" : ""} onClick={() => onChange(option.value)}>
          {option.label}{option.count != null ? <span className="seg-count">{option.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon: Icon, title, children }) {
  return (
    <div className="empty">
      {Icon ? <Icon size={28} aria-hidden="true" /> : null}
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

export function Loading({ label = "Chargement…" }) {
  return <div className="loading"><Loader2 size={18} className="spin" aria-hidden="true" />{label}</div>;
}

export function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="error-box" role="alert">
      <span>{String(error.message || error)}</span>
      {onRetry ? <Button onClick={onRetry}>Réessayer</Button> : null}
    </div>
  );
}

export function Drawer({ open, title, subtitle, onClose, children, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="drawer-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <header className="drawer-head">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer ? <footer className="drawer-foot">{footer}</footer> : null}
      </aside>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="field-value">{children || "—"}</div>
    </div>
  );
}

/** Hook de chargement : { data, error, loading, reload }. */
export function useLoad(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    loader()
      .then((data) => { if (alive) setState({ data, error: null, loading: false }); })
      .catch((error) => { if (alive) setState({ data: null, error, loading: false }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((value) => value + 1), []);
  return { ...state, reload };
}

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setItems((list) => [...list, { id, message, tone }]);
    setTimeout(() => setItems((list) => list.filter((item) => item.id !== id)), 4200);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((item) => <div key={item.id} className={`toast toast-${item.tone}`}>{item.message}</div>)}
      </div>
    </ToastContext.Provider>
  );
}

/** Execute une action admin avec retour visuel ; renvoie true si elle a reussi. */
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState("");
  const run = useCallback(async (key, task, successMessage) => {
    setBusy(key);
    try {
      await task();
      if (successMessage) toast(successMessage);
      return true;
    } catch (error) {
      toast(String(error?.message || error), "danger");
      return false;
    } finally {
      setBusy("");
    }
  }, [toast]);
  return { busy, run };
}
