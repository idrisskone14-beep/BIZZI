(function () {
  let recorder = null;
  let stream = null;
  let stopTimer = null;
  let serviceReady = false;
  let serviceProbe = null;

  function config() {
    return globalThis.BizziConfig?.aiVoice || {};
  }

  function supported() {
    return Boolean(
      config().enabled
      && config().endpoint
      && navigator.mediaDevices?.getUserMedia
      && globalThis.MediaRecorder
    );
  }

  function active() {
    return Boolean(recorder && recorder.state === "recording");
  }

  function ready() {
    return supported() && serviceReady;
  }

  function probe() {
    if (!supported()) return Promise.resolve(false);
    if (serviceProbe) return serviceProbe;
    const headers = {};
    const anonKey = globalThis.BizziConfig?.supabase?.anonKey || "";
    if (anonKey) {
      headers.apikey = anonKey;
      headers.Authorization = `Bearer ${anonKey}`;
    }
    serviceProbe = fetch(config().endpoint, { method: "OPTIONS", headers })
      .then((response) => {
        serviceReady = response.ok;
        return serviceReady;
      })
      .catch(() => false);
    return serviceProbe;
  }

  function cleanup() {
    if (stopTimer) globalThis.clearTimeout(stopTimer);
    stopTimer = null;
    stream?.getTracks?.().forEach((track) => track.stop());
    stream = null;
    recorder = null;
  }

  function stop() {
    if (!active()) return false;
    recorder.stop();
    return true;
  }

  function preferredMimeType() {
    return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]
      .find((type) => globalThis.MediaRecorder?.isTypeSupported?.(type)) || "";
  }

  async function transcribe(blob) {
    const settings = config();
    const form = new FormData();
    const extension = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
    form.append("audio", blob, `bizzi-voice.${extension}`);
    form.append("language", settings.language || "fr");
    form.append("locale", settings.locale || document.documentElement.lang || "fr-CI");
    form.append("city", document.querySelector("#citySelect")?.value || "");
    const headers = {};
    const anonKey = globalThis.BizziConfig?.supabase?.anonKey || "";
    if (anonKey) {
      headers.apikey = anonKey;
      headers.Authorization = `Bearer ${anonKey}`;
    }
    const response = await fetch(settings.endpoint, { method: "POST", headers, body: form });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Transcription indisponible (${response.status}).`);
    const text = String(payload.text || "").trim();
    if (!text) throw new Error("Aucune parole reconnue.");
    return text;
  }

  async function start(options = {}) {
    if (!supported()) throw new Error("Transcription IA indisponible.");
    if (active()) throw new Error("Une écoute est déjà en cours.");
    const chunks = [];
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
    });
    const mimeType = preferredMimeType();
    recorder = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 64000 } : undefined);
    const finished = new Promise((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onerror = (event) => reject(event.error || new Error("Enregistrement audio interrompu."));
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: recorder?.mimeType || mimeType || "audio/webm" });
        cleanup();
        if (blob.size < 800) return reject(new Error("Enregistrement trop court. Parlez après le signal."));
        options.onState?.("transcribing");
        try { resolve(await transcribe(blob)); } catch (error) { reject(error); }
      };
    });
    recorder.start(250);
    options.onState?.("recording");
    stopTimer = globalThis.setTimeout(stop, Math.min(30000, Math.max(5000, Number(options.maxMs || 15000))));
    return finished;
  }

  globalThis.BizziAIVoice = { supported, ready, probe, active, start, stop };
})();
