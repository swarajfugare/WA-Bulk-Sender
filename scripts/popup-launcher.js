(function () {
  const elements = {
    activeRecipient: document.getElementById("active-recipient"),
    authStatusText: document.getElementById("auth-status-text"),
    bridgeStatusText: document.getElementById("bridge-status-text"),
    connectionMeta: document.getElementById("connection-meta"),
    doneCount: document.getElementById("done-count"),
    failureCount: document.getElementById("failure-count"),
    launcherStatusCopy: document.getElementById("launcher-status-copy"),
    openStudioBtn: document.getElementById("open-studio-btn"),
    openWaBtn: document.getElementById("open-wa-btn"),
    refreshStatusBtn: document.getElementById("refresh-status-btn"),
    runHint: document.getElementById("run-hint"),
    statusBadge: document.getElementById("status-badge"),
    streamStatusText: document.getElementById("stream-status-text"),
    successCount: document.getElementById("success-count"),
    totalCount: document.getElementById("total-count")
  };

  function sendRuntimeMessage(payload) {
    return new Promise(function (resolve, reject) {
      chrome.runtime.sendMessage(payload, function (response) {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response || null);
      });
    });
  }

  function formatStatus(status) {
    if (!status) {
      return "Idle";
    }
    return String(status).charAt(0).toUpperCase() + String(status).slice(1);
  }

  function renderStatusBadge(status) {
    elements.statusBadge.textContent = formatStatus(status || "idle");
    elements.statusBadge.className = "badge badge--" + (status || "idle");
  }

  function renderState(state) {
    const progress = state && state.progress ? state.progress : {};

    renderStatusBadge(state && state.status ? state.status : "idle");
    elements.totalCount.textContent = String(progress.total || 0);
    elements.doneCount.textContent = String(progress.completed || 0);
    elements.successCount.textContent = String(progress.successCount || 0);
    elements.failureCount.textContent = String(progress.failureCount || 0);

    if (progress.activePhone) {
      elements.activeRecipient.textContent = "Sending to " + progress.activePhone;
    } else if (state && state.lastError) {
      elements.activeRecipient.textContent = state.lastError;
    } else if (state && state.status === "finished") {
      elements.activeRecipient.textContent = "Last run finished.";
    } else {
      elements.activeRecipient.textContent = "No job running.";
    }

    const hintMap = {
      error: "The last run ended with an error.",
      finished: "Open the studio to export results or start another run.",
      idle: "Open the studio for imports, paste, and sending.",
      paused: "The current run is paused.",
      running: "A run is active in WhatsApp Web right now.",
      stopped: "The last run was stopped."
    };

    elements.runHint.textContent = hintMap[(state && state.status) || "idle"];
    elements.launcherStatusCopy.textContent =
      state && state.status === "running"
        ? "The studio is already sending. Keep WhatsApp Web open."
        : "Open the studio to work with the bigger campaign interface.";
  }

  function renderWaStatus(status) {
    const streamMode = status && status.stream && status.stream.mode ? status.stream.mode : "Unknown";
    elements.bridgeStatusText.textContent = status && status.wppReady ? "Ready" : "Waiting";
    elements.authStatusText.textContent = status && status.authenticated ? "Logged In" : "Not Ready";
    elements.streamStatusText.textContent = streamMode;
    elements.connectionMeta.textContent =
      status && status.wppReady
        ? "WhatsApp Web responded to the bridge."
        : "Waiting for WhatsApp Web.";
  }

  async function refresh() {
    const [stateResponse, statusResponse] = await Promise.all([
      sendRuntimeMessage({ type: "GET_STATE" }).catch(function () {
        return null;
      }),
      sendRuntimeMessage({ type: "GET_WA_STATUS" }).catch(function () {
        return null;
      })
    ]);

    renderState(stateResponse && stateResponse.state ? stateResponse.state : null);
    renderWaStatus(statusResponse && statusResponse.ok ? statusResponse.status : null);
  }

  function openStudio() {
    chrome.tabs.create({ url: chrome.runtime.getURL("studio.html") });
  }

  function bindEvents() {
    elements.openStudioBtn.addEventListener("click", openStudio);
    elements.openWaBtn.addEventListener("click", function () {
      sendRuntimeMessage({ type: "OPEN_WHATSAPP" }).then(refresh).catch(function () {
        return null;
      });
    });
    elements.refreshStatusBtn.addEventListener("click", function () {
      refresh().catch(function () {
        return null;
      });
    });

    chrome.storage.onChanged.addListener(function (changes, areaName) {
      if (areaName !== "local" || !changes.wa_sender_state) {
        return;
      }
      renderState(changes.wa_sender_state.newValue || null);
    });
  }

  bindEvents();
  refresh().catch(function () {
    renderState(null);
    renderWaStatus(null);
  });
})();
