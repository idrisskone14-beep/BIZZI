import { useState } from "react";
import { KeyRound, LogIn, Mail } from "lucide-react";
import { requestPasswordCode, resetPassword, signIn } from "../api.js";
import { Button } from "../ui.jsx";

export default function Login({ notice, onSignedIn }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(notice ? { tone: "danger", text: notice } : null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "login") {
        await signIn(email.trim(), password);
        await onSignedIn();
        return;
      }
      if (mode === "request") {
        await requestPasswordCode(email.trim());
        setMode("reset");
        setMessage({ tone: "success", text: "Code envoyé : regardez votre boîte e-mail (et les indésirables)." });
        return;
      }
      if (password.length < 8) throw new Error("Mot de passe trop court (8 caractères minimum).");
      await resetPassword(email.trim(), code.trim(), password);
      await signIn(email.trim(), password);
      await onSignedIn();
    } catch (error) {
      setMessage({ tone: "danger", text: String(error?.message || error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <img src="/assets/icon-192-v305.png" alt="" width="44" height="44" />
          <div><strong>Zeyds</strong><span>Console admin</span></div>
        </div>
        <h1>{mode === "login" ? "Connexion" : mode === "request" ? "Recevoir un code" : "Nouveau mot de passe"}</h1>
        <p className="login-help">
          {mode === "login" ? "Réservé aux administrateurs Zeyds."
            : mode === "request" ? "Première connexion ou mot de passe oublié : un code à 6 chiffres vous est envoyé par e-mail."
              : "Saisissez le code reçu et choisissez votre mot de passe."}
        </p>
        <label className="input-label">E-mail
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
        </label>
        {mode === "reset" ? (
          <label className="input-label">Code reçu par e-mail
            <input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
          </label>
        ) : null}
        {mode !== "request" ? (
          <label className="input-label">{mode === "reset" ? "Nouveau mot de passe" : "Mot de passe"}
            <input type="password" autoComplete={mode === "reset" ? "new-password" : "current-password"} required minLength={mode === "reset" ? 8 : undefined}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        ) : null}
        {message ? <div className={`notice notice-${message.tone}`} role="status">{message.text}</div> : null}
        <Button type="submit" variant="primary" busy={busy} icon={mode === "login" ? LogIn : mode === "request" ? Mail : KeyRound} className="wide">
          {mode === "login" ? "Se connecter" : mode === "request" ? "Envoyer le code" : "Enregistrer et se connecter"}
        </Button>
        <button type="button" className="link-btn" onClick={() => { setMode(mode === "login" ? "request" : "login"); setMessage(null); }}>
          {mode === "login" ? "Première connexion ou mot de passe oublié" : "Retour à la connexion"}
        </button>
      </form>
    </div>
  );
}
