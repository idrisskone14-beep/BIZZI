(function () {
  "use strict";

  function card(label, value, tone = "") {
    return `<div class="metric ${tone}"><strong>${value}</strong><span>${label}</span></div>`;
  }

  function riskLevel(snapshot = {}) {
    const blockers = Number(snapshot.openAlerts || 0) + Number(snapshot.fraud24h || 0);
    if (blockers >= 2) return { tone: "bad", label: "Risque élevé", action: "Traiter les alertes et doublons avant ouverture large." };
    if (snapshot.paidDeliveries && !snapshot.activeDispatchOffers) return { tone: "pending", label: "A surveiller", action: "Dispatcher les livraisons payées rapidement." };
    return { tone: "ok", label: "Stable", action: "Continuer les tests terrain et la conversion payante." };
  }

  function render(root, snapshot = {}) {
    if (!root) return;
    const risk = riskLevel(snapshot);
    root.innerHTML = `
      <div class="operations-head ${risk.tone}">
        <div>
          <strong>${risk.label}</strong>
          <p>${risk.action}</p>
        </div>
        <span>${snapshot.remoteReady ? "Backend prêt" : "Mode local"}</span>
      </div>
      <div class="metrics compact">
        ${card("Livraisons ouvertes", snapshot.openDeliveries || 0)}
        ${card("Payées à dispatcher", snapshot.paidDeliveries || 0, snapshot.paidDeliveries ? "pending" : "")}
        ${card("Livreurs live", snapshot.liveCouriers || 0, snapshot.liveCouriers ? "ok" : "")}
        ${card("Dispatch actifs", snapshot.activeDispatchOffers || 0)}
        ${card("Push en attente", snapshot.queuedPush || 0)}
        ${card("Fraude 24h", snapshot.fraud24h || 0, snapshot.fraud24h ? "bad" : "")}
        ${card("Alertes ouvertes", snapshot.openAlerts || 0, snapshot.openAlerts ? "bad" : "ok")}
      </div>
      <p class="muted">${snapshot.remoteReady ? "Centre opérationnel relié au backend." : "Vue locale prête. Le backend affichera les livreurs live, alertes et intégrations après SQL V174."}</p>
    `;
  }

  globalThis.BizziAdminDashboard = Object.freeze({ render });
})();
