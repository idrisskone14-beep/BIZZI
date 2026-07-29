(function premiumHomeModule() {
  "use strict";

  const voiceStart = document.querySelector("#homeVoiceStart");
  const floatingVoice = document.querySelector("#globalVoiceFloating");
  const voiceTriggers = [voiceStart, floatingVoice].filter(Boolean);

  function startGlobalVoice(event) {
    const trigger = event?.currentTarget || voiceStart;
    const status = document.querySelector("#homeVoiceStatus") || document.querySelector("#globalVoiceStatus");
    if (typeof globalThis.startGlobalVoiceAssistant === "function") {
      globalThis.startGlobalVoiceAssistant(trigger);
      return;
    }
    if (status) {
      status.hidden = false;
      status.innerHTML = "<strong>Bizzi se prépare…</strong><p>Réessayez dans un instant.</p>";
    }
  }

  voiceTriggers.forEach((button) => button.addEventListener("click", startGlobalVoice));
  document.documentElement.dataset.premiumHomeReady = voiceTriggers.length ? "true" : "false";
}());
