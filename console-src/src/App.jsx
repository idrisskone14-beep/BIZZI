import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck, Bolt, Coins, ExternalLink, Flag, LayoutDashboard, LogOut, Megaphone, Menu,
  Receipt, Settings, ShieldCheck, Users, X,
} from "lucide-react";
import { accessToken, claims, count, rpc, signOut } from "./api.js";
import { Loading } from "./ui.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Providers from "./pages/Providers.jsx";
import Payments from "./pages/Payments.jsx";
import Publications from "./pages/Publications.jsx";
import Requests from "./pages/Requests.jsx";
import Cash from "./pages/Cash.jsx";
import Moderation from "./pages/Moderation.jsx";
import Admins from "./pages/Admins.jsx";
import SettingsPage from "./pages/Settings.jsx";

const PAGES = [
  { id: "tableau", label: "Tableau de bord", icon: LayoutDashboard, component: Dashboard },
  { id: "prestataires", label: "Prestataires", icon: Users, component: Providers },
  { id: "paiements", label: "Paiements", icon: Receipt, component: Payments, badge: "payments" },
  { id: "publications", label: "Publications", icon: Megaphone, component: Publications, badge: "publications" },
  { id: "demandes", label: "Demandes", icon: Bolt, component: Requests, badge: "requests" },
  { id: "cash", label: "Zeyds Cash", icon: Coins, component: Cash, badge: "cash" },
  { id: "moderation", label: "Modération", icon: Flag, component: Moderation, badge: "reports" },
  { id: "admins", label: "Admins et journal", icon: ShieldCheck, component: Admins, superOnly: true },
  { id: "reglages", label: "Réglages", icon: Settings, component: SettingsPage, superOnly: true },
];

const OLD_ADMIN = "/index.html?admin=1&entry=admin-access&open=admin";

function currentRoute() {
  const id = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return PAGES.some((page) => page.id === id) ? id : "tableau";
}

async function loadBadges() {
  const safe = (promise) => promise.catch(() => 0);
  const [payments, jobs, events, foods, places, requests, reports, cash] = await Promise.all([
    safe(count("payments", "status=eq.pending")),
    safe(count("job_offers", "status=eq.pending")),
    safe(count("event_promotions", "status=eq.pending")),
    safe(count("food_places", "status=eq.pending")),
    safe(count("exception_places", "status=eq.pending")),
    safe(count("express_requests", "status=eq.open")),
    safe(count("reports", "status=eq.open")),
    rpc("cash_admin_stats").then((stats) => Number(stats?.missions_payment_pending || 0) + Number(stats?.open_disputes || 0)).catch(() => 0),
  ]);
  return { payments, publications: jobs + events + foods + places, requests, reports, cash };
}

export default function App() {
  const [session, setSession] = useState({ status: "loading" });
  const [route, setRoute] = useState(currentRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [badges, setBadges] = useState({});

  const checkSession = useCallback(async () => {
    const token = await accessToken({ force: true });
    if (!token) return setSession({ status: "signedOut" });
    const info = claims(token);
    let isAdmin = false;
    let isSuper = false;
    try {
      [isAdmin, isSuper] = await Promise.all([rpc("is_admin"), rpc("is_super_admin").catch(() => false)]);
    } catch (error) {
      // Erreur technique (reseau, jeton) : on garde la session et on affiche la vraie cause.
      console.warn("[console] is_admin", error);
      return setSession({ status: "signedOut", notice: `Vérification admin impossible : ${error.message}` });
    }
    if (isAdmin !== true) {
      await signOut();
      return setSession({ status: "signedOut", notice: `Le compte ${info.email || ""} n'est pas administrateur Zeyds.` });
    }
    return setSession({ status: "signedIn", email: info.email || "", name: info.name || "", isSuper: Boolean(isSuper) });
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  useEffect(() => {
    const onHash = () => { setRoute(currentRoute()); setMenuOpen(false); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const refreshBadges = useCallback(() => { loadBadges().then(setBadges).catch(() => null); }, []);
  useEffect(() => { if (session.status === "signedIn") refreshBadges(); }, [session.status, route, refreshBadges]);

  const pages = useMemo(() => PAGES.filter((page) => !page.superOnly || session.isSuper), [session.isSuper]);
  const active = pages.find((page) => page.id === route) || pages[0];

  if (session.status === "loading") return <div className="boot"><Loading label="Ouverture de la console…" /></div>;
  if (session.status === "signedOut") return <Login notice={session.notice} onSignedIn={checkSession} />;

  const Page = active.component;
  const logout = async () => { await signOut(); setSession({ status: "signedOut" }); };

  return (
    <div className={`shell ${menuOpen ? "menu-open" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <img src="/assets/icon-192-v305.png" alt="" width="30" height="30" />
          <div><strong>Zeyds</strong><span>Console admin</span></div>
          <button type="button" className="icon-btn only-mobile" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu"><X size={18} /></button>
        </div>
        <nav aria-label="Navigation admin">
          {pages.map((page) => {
            const Icon = page.icon;
            const value = page.badge ? badges[page.badge] : 0;
            return (
              <a key={page.id} href={`#/${page.id}`} className={page.id === active.id ? "on" : ""} aria-current={page.id === active.id ? "page" : undefined}>
                <Icon size={17} aria-hidden="true" />
                <span>{page.label}</span>
                {value ? <span className="nav-badge">{value}</span> : null}
              </a>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <a href={OLD_ADMIN} className="old-admin"><ExternalLink size={15} aria-hidden="true" />Ancien admin</a>
          <div className="me">
            <BadgeCheck size={16} aria-hidden="true" />
            <div><strong>{session.name || "Admin"}</strong><span>{session.isSuper ? "Super admin" : "Admin"} · {session.email}</span></div>
          </div>
          <button type="button" className="btn btn-ghost logout" onClick={logout}><LogOut size={15} aria-hidden="true" />Se déconnecter</button>
        </div>
      </aside>
      <div className="scrim only-mobile" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      <div className="main">
        <div className="topbar only-mobile">
          <button type="button" className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu"><Menu size={20} /></button>
          <strong>{active.label}</strong>
          <img src="/assets/icon-192-v305.png" alt="" width="26" height="26" />
        </div>
        <main className="content">
          <Page session={session} onChange={refreshBadges} badges={badges} />
        </main>
      </div>
    </div>
  );
}
