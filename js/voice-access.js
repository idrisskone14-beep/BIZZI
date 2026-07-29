(function () {
  function recognition() {
    return globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition || null;
  }

  function supported() {
    return Boolean(recognition());
  }

  function secureContext() {
    const location = globalThis.location || {};
    return location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname || "");
  }

  function warning() {
    const location = globalThis.location || {};
    if (location.protocol === "file:") return "Test HTTPS requis.";
    return location.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(location.hostname || "") ? "HTTPS requis." : "";
  }

  function message(code = "") {
    return {
      "not-allowed": "Autorisez le micro dans le téléphone.",
      "permission-denied": "Autorisez le micro dans le téléphone.",
      NotAllowedError: "Autorisez le micro dans le téléphone.",
      "service-not-allowed": "Autorisez le micro dans le téléphone.",
      "audio-capture": "Micro introuvable.",
      NotFoundError: "Micro introuvable.",
      "no-speech": "Rien entendu.",
      network: "Réseau instable.",
      aborted: "Écoute arrêtée.",
      "not-supported": "Ce navigateur ne supporte pas la reconnaissance vocale intégrée.",
      "bad-grammar": "Phrase non reconnue. Réessayez avec une phrase simple.",
      language: "Langue vocale non disponible. Réessayez en français simple.",
    }[String(code)] || "Micro bloqué. Vérifiez l'autorisation.";
  }

  async function permissionState() {
    try {
      if (!navigator.permissions?.query) return "unknown";
      const status = await navigator.permissions.query({ name: "microphone" });
      return status.state || "unknown";
    } catch {
      return "unknown";
    }
  }

  async function requestMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) return { ok: true, skipped: true };
    if (!secureContext()) throw new Error("HTTPS requis.");
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    stream.getTracks().forEach((track) => track.stop());
    return { ok: true };
  }

  async function microphoneReadiness() {
    if (!secureContext()) return { ready: false, reason: "insecure" };
    const permission = await permissionState();
    if (permission === "denied") return { ready: false, reason: "denied", permission };
    return { ready: true, permission };
  }

  function focusTextFallback(input, statusCallback) {
    if (input) {
      input.focus();
      input.select?.();
      input.placeholder = "Dictez avec le micro du clavier, puis appuyez sur Trouver";
    }
    statusCallback?.("<strong>Micro du navigateur indisponible</strong><p>Utilisez le micro du clavier de votre téléphone dans le champ texte, puis validez.</p>");
  }

  globalThis.BizziVoice = {
    recognition,
    supported,
    secureContext,
    warning,
    message,
    permissionState,
    requestMicrophone,
    microphoneReadiness,
    focusTextFallback,
  };
})();
