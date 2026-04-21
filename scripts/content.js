(function () {
  const BRIDGE_NAMESPACE = "WA_SENDER_PAGE_BRIDGE";
  const BRIDGE_READY_TIMEOUT_MS = 45000;
  const PAGE_REQUEST_TIMEOUT_MS = 60000;

  const pageRequests = new Map();
  let bridgeReadyPromise = null;
  let requestCounter = 0;

  const runner = {
    job: null,
    progress: null,
    runningPromise: null,
    status: "idle",
    lastError: ""
  };

  const overlay = {
    host: null,
    minimized: false,
    elements: null
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function wait(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getRiskLabel(percent) {
    if (percent >= 65) {
      return "High";
    }
    if (percent >= 40) {
      return "Elevated";
    }
    if (percent >= 20) {
      return "Guarded";
    }
    return "Low";
  }

  function estimateOverlayRestrictionRisk(job, progress) {
    const settings = job && job.settings ? job.settings : {};
    const riskProfile = job && job.riskProfile ? job.riskProfile : {};
    const plannedRecipients = Math.max(
      0,
      Number(riskProfile.plannedRecipients || (job && job.recipients ? job.recipients.length : 0) || 0)
    );
    const completed = Math.max(0, Number(progress && progress.completed || 0));
    const failures = Math.max(0, Number(progress && progress.failureCount || 0));
    const consecutiveFailures = Math.max(0, Number(progress && progress.consecutiveFailureCount || 0));
    const knownBlocks = clamp(Math.max(0, Number(settings.manualKnownBlocks || 0)), 0, 50);
    const knownReports = clamp(Math.max(0, Number(settings.manualKnownReports || 0)), 0, 50);
    const historyFailureRate = clamp(Math.max(0, Number(riskProfile.historyFailureRate || 0)), 0, 100);
    const currentFailureRate = completed ? (failures / completed) * 100 : 0;
    const effectiveFailureRate = Math.max(currentFailureRate, historyFailureRate);
    const todayCount = Math.max(0, Number(riskProfile.todayCountAtStart || 0));
    const projectedToday = todayCount + plannedRecipients;
    const positiveConsentCount = Math.max(0, Number(riskProfile.positiveConsentCount || 0));
    const unknownConsentCount = Math.max(0, Number(riskProfile.unknownConsentCount || 0));
    const consentTotal = positiveConsentCount + unknownConsentCount;
    const unknownConsentShare = consentTotal ? unknownConsentCount / consentTotal : 1;
    const hasVariables = Boolean(riskProfile.hasVariables);
    const urlCount = Math.max(0, Number(riskProfile.urlCount || 0));
    const attachmentCount = Math.max(0, Number(riskProfile.attachmentCount || 0));
    const reasons = [];
    let score = 6;

    function add(points, reason) {
      if (!points) {
        return;
      }
      score += points;
      reasons.push({ points: points, reason: reason });
    }

    add(clamp((projectedToday - 20) * 0.18, 0, 14), "Projected sends today are above a conservative range.");
    add(clamp((plannedRecipients - 15) * 0.22, 0, 12), "This run is larger than a cautious warm-up batch.");
    add(clamp(effectiveFailureRate * 0.6, 0, 24), "Failure rate is pushing the estimate upward.");
    add(clamp(consecutiveFailures * 4, 0, 12), "Back-to-back failures raise the estimate quickly.");
    add(clamp(knownBlocks * 7, 0, 21), "Known user blocks raise the estimate.");
    add(clamp(knownReports * 14, 0, 35), "Known user reports are heavily weighted.");
    add(clamp(unknownConsentShare * 15, 0, 15), "Missing consent coverage raises the estimate.");

    if (Number(settings.delayMinSeconds || 0) < 10) {
      add(clamp((10 - Number(settings.delayMinSeconds || 0)) * 1.4, 0, 10), "Minimum delay is aggressive.");
    }
    if (Number(settings.batchSize || 0) > 10) {
      add(clamp((Number(settings.batchSize || 0) - 10) * 0.7, 0, 10), "Batch size is larger than a cautious setting.");
    }
    if (Number(settings.batchSize || 0) > 0 && Number(settings.batchPauseSeconds || 0) < 120) {
      add(
        clamp((120 - Number(settings.batchPauseSeconds || 0)) / 12, 0, 10),
        "Batch pauses are shorter than the safer pacing range."
      );
    }
    if (!hasVariables && plannedRecipients > 20) {
      add(6, "This message has no personalization variables.");
    }
    if (urlCount > 0 && plannedRecipients > 10) {
      add(4, "Links in outreach campaigns can raise sensitivity.");
    }
    if (attachmentCount > 0 && plannedRecipients > 20) {
      add(4, "Attachment-heavy runs are best kept small.");
    }
    if ((settings.warmupProfile || "custom") === "careful") {
      add(-4, "Careful warm-up profile lowers the estimate.");
    } else if ((settings.warmupProfile || "custom") === "balanced") {
      add(-1, "Balanced pacing lowers the estimate slightly.");
    }
    if (Number(settings.delayMinSeconds || 0) >= 15) {
      add(-3, "Longer minimum delay lowers the estimate.");
    }
    if (Number(settings.batchSize || 0) <= 5 && Number(settings.batchPauseSeconds || 0) >= 180) {
      add(-4, "Small batches with longer pauses lower the estimate.");
    }
    if (Number(settings.maxRecipientsPerRun || 0) <= 20) {
      add(-3, "A smaller per-run cap lowers the estimate.");
    }
    if (settings.requirePositiveConsentData && positiveConsentCount > 0) {
      add(-6, "Positive-consent-only mode lowers the estimate.");
    }

    const percent = clamp(Math.round(score), 1, 99);
    const label = getRiskLabel(percent);
    const topReason = reasons
      .slice()
      .sort(function (first, second) {
        return Math.abs(second.points) - Math.abs(first.points);
      })
      .map(function (item) {
        return item.reason;
      })[0] || "Local estimate based on pace, failures, consent coverage, and manual feedback counts.";

    return {
      label: label,
      percent: percent,
      topReason: topReason
    };
  }

  function readSessionValue(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeSessionValue(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      return null;
    }
  }

  function ensureOverlay() {
    if (overlay.host && overlay.elements) {
      return overlay;
    }

    overlay.minimized = readSessionValue("wa_sender_overlay_minimized") === "1";

    const host = document.createElement("div");
    host.id = "wa-sender-monitor-host";
    host.style.position = "fixed";
    host.style.top = "18px";
    host.style.right = "18px";
    host.style.zIndex = "2147483647";
    host.style.display = "none";

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = [
      "<style>",
      ":host { all: initial; }",
      ".panel { width: 328px; border-radius: 22px; background: rgba(20, 28, 25, 0.94); color: #f6efe5; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28); border: 1px solid rgba(255,255,255,0.08); overflow: hidden; font-family: 'Avenir Next', 'Trebuchet MS', 'Segoe UI', sans-serif; }",
      ".panel--minimized { width: 218px; }",
      ".top { padding: 14px 16px; background: linear-gradient(135deg, rgba(19, 103, 87, 0.95), rgba(9, 55, 47, 0.95)); display: flex; align-items: center; justify-content: space-between; gap: 12px; }",
      ".title { display: flex; flex-direction: column; gap: 3px; min-width: 0; }",
      ".eyebrow { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.75; }",
      ".status { font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }",
      ".top-actions { display: flex; gap: 8px; }",
      ".icon-button { appearance: none; border: 0; width: 30px; height: 30px; border-radius: 999px; background: rgba(255, 255, 255, 0.14); color: #fff; cursor: pointer; font-size: 15px; font-weight: 700; }",
      ".content { padding: 16px; display: flex; flex-direction: column; gap: 14px; }",
      ".hidden { display: none !important; }",
      ".metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }",
      ".metric { padding: 10px; border-radius: 16px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255,255,255,0.06); }",
      ".metric-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.72; }",
      ".metric-value { display: block; margin-top: 6px; font-size: 18px; font-weight: 800; }",
      ".progress-track { height: 10px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,0.12); }",
      ".progress-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #d98f41, #21a88c); transition: width 180ms ease; }",
      ".risk-row { display: grid; grid-template-columns: 86px minmax(0, 1fr); gap: 12px; align-items: center; }",
      ".risk-gauge { --risk-angle: 18deg; --risk-color: #21a88c; width: 86px; height: 86px; padding: 7px; border-radius: 50%; background: conic-gradient(var(--risk-color) 0deg var(--risk-angle), rgba(255,255,255,0.08) var(--risk-angle) 360deg); }",
      ".risk-gauge--guarded { --risk-color: #d2a44b; }",
      ".risk-gauge--elevated { --risk-color: #d98f41; }",
      ".risk-gauge--high { --risk-color: #d76b58; }",
      ".risk-gauge__inner { width: 100%; height: 100%; border-radius: 50%; background: rgba(20, 28, 25, 0.95); border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }",
      ".risk-gauge__percent { font-size: 20px; font-weight: 800; line-height: 1; }",
      ".risk-gauge__caption { margin-top: 3px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.14em; opacity: 0.7; }",
      ".focus-box { padding: 12px; border-radius: 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06); }",
      ".focus-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.72; }",
      ".focus-value { margin-top: 8px; font-size: 13px; line-height: 1.45; word-break: break-word; }",
      ".actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }",
      ".button { appearance: none; border: 0; border-radius: 14px; padding: 11px 12px; cursor: pointer; font-size: 13px; font-weight: 700; }",
      ".button:disabled { opacity: 0.45; cursor: not-allowed; }",
      ".button--pause { background: rgba(255,255,255,0.1); color: #fff; }",
      ".button--resume { background: rgba(217,143,65,0.18); color: #ffd7a6; }",
      ".button--stop { background: rgba(168,63,44,0.18); color: #ffc3b6; }",
      ".footer { font-size: 12px; color: rgba(246, 239, 229, 0.82); line-height: 1.45; }",
      "</style>",
      "<div class='panel'>",
      "  <div class='top'>",
      "    <div class='title'>",
      "      <span class='eyebrow'>WA Sender Monitor</span>",
      "      <strong class='status' id='status-text'>Idle</strong>",
      "    </div>",
      "    <div class='top-actions'>",
      "      <button class='icon-button' id='toggle-btn' type='button' title='Minimize'>−</button>",
      "    </div>",
      "  </div>",
      "  <div class='content' id='content'>",
      "    <div class='metrics'>",
      "      <div class='metric'><span class='metric-label'>Total</span><strong class='metric-value' id='metric-total'>0</strong></div>",
      "      <div class='metric'><span class='metric-label'>Done</span><strong class='metric-value' id='metric-done'>0</strong></div>",
      "      <div class='metric'><span class='metric-label'>Success</span><strong class='metric-value' id='metric-success'>0</strong></div>",
      "      <div class='metric'><span class='metric-label'>Failed</span><strong class='metric-value' id='metric-failed'>0</strong></div>",
      "    </div>",
      "    <div class='risk-row'>",
      "      <div class='risk-gauge' id='risk-gauge'><div class='risk-gauge__inner'><strong class='risk-gauge__percent' id='risk-percent'>8%</strong><span class='risk-gauge__caption'>Estimate</span></div></div>",
      "      <div class='focus-box'>",
      "        <div class='focus-label'>Restriction Risk</div>",
      "        <div class='focus-value' id='risk-text'>Local estimate based on pace, failures, consent coverage, and manual feedback counts.</div>",
      "      </div>",
      "    </div>",
      "    <div class='progress-track'><div class='progress-fill' id='progress-fill'></div></div>",
      "    <div class='focus-box'>",
      "      <div class='focus-label'>Current Status</div>",
      "      <div class='focus-value' id='focus-text'>No active campaign.</div>",
      "    </div>",
      "    <div class='actions'>",
      "      <button class='button button--pause' id='pause-btn' type='button'>Pause</button>",
      "      <button class='button button--resume' id='resume-btn' type='button'>Resume</button>",
      "      <button class='button button--stop' id='stop-btn' type='button'>Stop</button>",
      "    </div>",
      "    <div class='footer' id='footer-text'>Keep WhatsApp Web open while the campaign runs.</div>",
      "  </div>",
      "</div>"
    ].join("");

    overlay.host = host;
    overlay.elements = {
      content: shadow.getElementById("content"),
      focusText: shadow.getElementById("focus-text"),
      footerText: shadow.getElementById("footer-text"),
      metricDone: shadow.getElementById("metric-done"),
      metricFailed: shadow.getElementById("metric-failed"),
      metricSuccess: shadow.getElementById("metric-success"),
      metricTotal: shadow.getElementById("metric-total"),
      pauseBtn: shadow.getElementById("pause-btn"),
      panel: shadow.querySelector(".panel"),
      progressFill: shadow.getElementById("progress-fill"),
      riskGauge: shadow.getElementById("risk-gauge"),
      riskPercent: shadow.getElementById("risk-percent"),
      riskText: shadow.getElementById("risk-text"),
      resumeBtn: shadow.getElementById("resume-btn"),
      statusText: shadow.getElementById("status-text"),
      stopBtn: shadow.getElementById("stop-btn"),
      toggleBtn: shadow.getElementById("toggle-btn")
    };

    overlay.elements.toggleBtn.addEventListener("click", function () {
      overlay.minimized = !overlay.minimized;
      writeSessionValue("wa_sender_overlay_minimized", overlay.minimized ? "1" : "0");
      renderOverlay();
    });
    overlay.elements.pauseBtn.addEventListener("click", function () {
      requestOverlayControl("paused");
    });
    overlay.elements.resumeBtn.addEventListener("click", function () {
      requestOverlayControl("running");
    });
    overlay.elements.stopBtn.addEventListener("click", function () {
      requestOverlayControl("stopped");
    });

    (document.body || document.documentElement).appendChild(host);
    return overlay;
  }

  function resetRunner() {
    runner.job = null;
    runner.progress = createEmptyProgress(0);
    runner.runningPromise = null;
    runner.status = "idle";
    runner.lastError = "";
  }

  async function requestOverlayControl(nextStatus) {
    if (!overlay.elements) {
      return;
    }

    overlay.elements.pauseBtn.disabled = true;
    overlay.elements.resumeBtn.disabled = true;
    overlay.elements.stopBtn.disabled = true;

    const response = await sendRuntimeMessage({
      type: "CONTROL_JOB",
      status: nextStatus
    });

    if (response && response.state) {
      absorbState(response.state);
    } else {
      runner.status = nextStatus;
      await reportProgress(nextStatus);
    }

    renderOverlay();
  }

  function renderOverlay() {
    ensureOverlay();

    const shouldShow = Boolean(runner.job && runner.status && runner.status !== "idle");
    overlay.host.style.display = shouldShow ? "block" : "none";

    if (!shouldShow) {
      return;
    }

    const progress = runner.progress || createEmptyProgress(0);
    const total = Number(progress.total || 0);
    const completed = Number(progress.completed || 0);
    const percentage = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;
    const risk = estimateOverlayRestrictionRisk(runner.job, progress);
    const focusText = progress.activePhone
      ? "Sending to " + progress.activePhone
      : runner.lastError
      ? runner.lastError
      : runner.status === "finished"
      ? "Campaign finished. You can export results from the studio."
      : runner.status === "paused"
      ? "Campaign paused. Resume when you are ready."
      : runner.status === "stopped"
      ? "Campaign stopped."
      : "Campaign is getting ready.";

    overlay.elements.panel.classList.toggle("panel--minimized", overlay.minimized);
    overlay.elements.content.classList.toggle("hidden", overlay.minimized);
    overlay.elements.toggleBtn.textContent = overlay.minimized ? "+" : "−";
    overlay.elements.toggleBtn.title = overlay.minimized ? "Expand" : "Minimize";
    overlay.elements.statusText.textContent = String(runner.status || "idle").replace(/\b\w/g, function (match) {
      return match.toUpperCase();
    });
    overlay.elements.metricTotal.textContent = String(total);
    overlay.elements.metricDone.textContent = String(completed);
    overlay.elements.metricSuccess.textContent = String(progress.successCount || 0);
    overlay.elements.metricFailed.textContent = String(progress.failureCount || 0);
    overlay.elements.progressFill.style.width = percentage + "%";
    overlay.elements.riskGauge.className =
      "risk-gauge " +
      (risk.percent >= 65 ? "risk-gauge--high" : risk.percent >= 40 ? "risk-gauge--elevated" : risk.percent >= 20 ? "risk-gauge--guarded" : "");
    overlay.elements.riskGauge.style.setProperty("--risk-angle", Math.round((risk.percent / 100) * 360) + "deg");
    overlay.elements.riskPercent.textContent = risk.percent + "%";
    overlay.elements.riskText.textContent = risk.label + " estimate. " + risk.topReason;
    overlay.elements.focusText.textContent = focusText;
    overlay.elements.footerText.textContent =
      runner.status === "running"
        ? "Campaign is live. Keep this WhatsApp tab open. This risk number is only a local estimate."
        : runner.status === "paused"
        ? "Paused here in WhatsApp. You can resume from this monitor or the studio."
        : "Use the studio for audience changes and result export.";

    overlay.elements.pauseBtn.disabled = runner.status !== "running";
    overlay.elements.resumeBtn.disabled = runner.status !== "paused";
    overlay.elements.stopBtn.disabled = !(runner.status === "running" || runner.status === "paused");
  }

  function createEmptyProgress(total) {
    return {
      total: total || 0,
      completed: 0,
      consecutiveFailureCount: 0,
      successCount: 0,
      failureCount: 0,
      currentIndex: 0,
      activePhone: "",
      results: [],
      startedAt: new Date().toISOString(),
      finishedAt: null,
      lastUpdatedAt: new Date().toISOString()
    };
  }

  function sendRuntimeMessage(payload) {
    return new Promise(function (resolve) {
      try {
        chrome.runtime.sendMessage(payload, function (response) {
          if (chrome.runtime.lastError) {
            resolve(null);
            return;
          }
          resolve(response || null);
        });
      } catch (error) {
        resolve(null);
      }
    });
  }

  function injectPageScript(pathname) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL(pathname);
      script.async = false;
      script.onload = function () {
        script.remove();
        resolve();
      };
      script.onerror = function () {
        script.remove();
        reject(new Error("Could not inject " + pathname));
      };
      (document.head || document.documentElement).appendChild(script);
    });
  }

  function ensureBridgeInjected() {
    if (bridgeReadyPromise) {
      return bridgeReadyPromise;
    }

    bridgeReadyPromise = new Promise(function (resolve, reject) {
      let settled = false;
      const timeoutId = window.setTimeout(function () {
        if (settled) {
          return;
        }
        settled = true;
        reject(new Error("WhatsApp page bridge did not become ready in time."));
      }, BRIDGE_READY_TIMEOUT_MS);

      function handleMessage(event) {
        const data = event.data;
        if (event.source !== window || !data || data.namespace !== BRIDGE_NAMESPACE || data.type !== "ready") {
          return;
        }

        window.removeEventListener("message", handleMessage);
        window.clearTimeout(timeoutId);
        settled = true;

        if (data.payload && data.payload.ok) {
          resolve(true);
          return;
        }

        reject(new Error((data.payload && data.payload.error) || "WhatsApp page bridge failed to initialize."));
      }

      window.addEventListener("message", handleMessage);

      injectPageScript("third_party/wppconnect/wppconnect-wa.js")
        .then(function () {
          return injectPageScript("scripts/page-bridge.js");
        })
        .catch(function (error) {
          window.removeEventListener("message", handleMessage);
          window.clearTimeout(timeoutId);
          if (!settled) {
            settled = true;
            reject(error);
          }
        });
    });

    return bridgeReadyPromise;
  }

  function requestPageAction(type, payload, timeoutMs) {
    return ensureBridgeInjected().then(function () {
      return new Promise(function (resolve, reject) {
        const id = "page_req_" + Date.now() + "_" + (++requestCounter);
        const timeoutId = window.setTimeout(function () {
          pageRequests.delete(id);
          reject(new Error("Page bridge request timed out: " + type));
        }, timeoutMs || PAGE_REQUEST_TIMEOUT_MS);

        pageRequests.set(id, {
          reject: reject,
          resolve: resolve,
          timeoutId: timeoutId
        });

        window.postMessage(
          {
            direction: "to-page",
            id: id,
            namespace: BRIDGE_NAMESPACE,
            payload: payload || {},
            type: type
          },
          "*"
        );
      });
    });
  }

  window.addEventListener("message", function (event) {
    const data = event.data;
    if (event.source !== window || !data || data.namespace !== BRIDGE_NAMESPACE || data.type !== "response") {
      return;
    }

    const pending = pageRequests.get(data.payload && data.payload.id);
    if (!pending) {
      return;
    }

    pageRequests.delete(data.payload.id);
    window.clearTimeout(pending.timeoutId);

    if (data.payload.ok) {
      pending.resolve(data.payload.result);
      return;
    }

    pending.reject(new Error(data.payload.error || "Unknown page bridge error."));
  });

  function renderTemplate(template, recipient, includeTimestamp) {
    let output = String(template || "");
    const fields = recipient.fields || {};

    output = output.replace(/\{\{([^}]+)\}\}/g, function (_, rawKey) {
      const key = String(rawKey || "").trim();
      if (key === "WhatsApp Number") {
        return recipient.phone || "";
      }
      return fields[key] != null ? String(fields[key]) : "";
    });

    if (includeTimestamp) {
      output += (output ? "\n\n" : "") + new Date().toLocaleString();
    }

    return output.trim();
  }

  async function reportProgress(statusOverride) {
    if (!runner.progress) {
      return;
    }

    runner.progress.lastUpdatedAt = new Date().toISOString();
    renderOverlay();
    await sendRuntimeMessage({
      type: "RESULT_UPDATE",
      status: statusOverride || runner.status,
      progress: clone(runner.progress),
      lastError: runner.lastError
    });
  }

  async function waitForRunnable() {
    while (runner.status === "paused") {
      await reportProgress("paused");
      await wait(500);
    }
  }

  async function delayWithControls(seconds) {
    const duration = Math.max(0, Number(seconds) || 0) * 1000;
    const startedAt = Date.now();

    while (Date.now() - startedAt < duration) {
      if (runner.status === "stopped") {
        return;
      }
      if (runner.status === "paused") {
        await waitForRunnable();
      }
      await wait(250);
    }
  }

  async function sendToRecipient(recipient) {
    const settings = runner.job.settings || {};
    const attachments = Array.isArray(runner.job.attachments) ? runner.job.attachments : [];
    const text = renderTemplate(
      runner.job.messageTemplate,
      recipient,
      Boolean(settings.includeTimestamp)
    );

    if (!recipient.chatId) {
      throw new Error("Recipient is missing a WhatsApp chat id.");
    }

    await requestPageAction("SEND_MESSAGE", {
      attachments: attachments,
      chatId: recipient.chatId,
      name: recipient.name,
      phone: recipient.phone,
      source: recipient.source,
      settings: settings,
      text: text
    }, 120000);
  }

  function appendResult(recipient, status, errorMessage) {
    runner.progress.results.push({
      campaignName: runner.job && runner.job.campaignName ? runner.job.campaignName : "",
      error: errorMessage || "",
      name: recipient.name || "",
      phone: recipient.phone || "",
      sentAt: new Date().toISOString(),
      source: recipient.source || "",
      status: status
    });

    runner.progress.completed += 1;
    runner.progress.currentIndex += 1;
    runner.progress.activePhone = "";

    if (status === "success") {
      runner.progress.consecutiveFailureCount = 0;
      runner.progress.successCount += 1;
    } else {
      runner.progress.consecutiveFailureCount += 1;
      runner.progress.failureCount += 1;
    }
  }

  function nextDelaySeconds() {
    const settings = runner.job.settings || {};
    const min = Math.max(1, Number(settings.delayMinSeconds || 1));
    const max = Math.max(min, Number(settings.delayMaxSeconds || min));

    if (min === max) {
      return min;
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async function waitBetweenRecipients() {
    const settings = runner.job.settings || {};
    const batchSize = Math.max(0, Number(settings.batchSize || 0));
    const batchPauseSeconds = Math.max(0, Number(settings.batchPauseSeconds || 0));

    if (runner.progress.completed >= runner.progress.total) {
      return;
    }

    await delayWithControls(nextDelaySeconds());

    if (
      batchSize > 0 &&
      batchPauseSeconds > 0 &&
      runner.progress.completed > 0 &&
      runner.progress.completed % batchSize === 0
    ) {
      await delayWithControls(batchPauseSeconds);
    }
  }

  async function finishJob(finalStatus, errorMessage) {
    runner.status = finalStatus;
    runner.lastError = errorMessage || "";
    runner.progress.activePhone = "";
    runner.progress.finishedAt = new Date().toISOString();
    renderOverlay();
    await reportProgress(finalStatus);
  }

  async function runJobLoop() {
    if (!runner.job) {
      return;
    }

    while (runner.progress.currentIndex < runner.job.recipients.length) {
      if (runner.status === "stopped") {
        await finishJob("stopped");
        return;
      }

      if (runner.status === "paused") {
        await waitForRunnable();
      }

      const recipient = runner.job.recipients[runner.progress.currentIndex];
      runner.progress.activePhone = recipient.phone || recipient.name || recipient.chatId;
      runner.lastError = "";
      await reportProgress(runner.status);

      try {
        await sendToRecipient(recipient);
        appendResult(recipient, "success", "");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown send error.";
        appendResult(recipient, "failed", message);
        runner.lastError = message;

        const failureLimit = Math.max(0, Number((runner.job.settings || {}).stopAfterFailures || 0));
        if (failureLimit > 0 && runner.progress.failureCount >= failureLimit) {
          await finishJob("error", "Stopped after reaching the configured failure limit.");
          return;
        }

        const consecutiveFailureLimit = Math.max(
          0,
          Number((runner.job.settings || {}).stopAfterConsecutiveFailures || 0)
        );
        if (
          consecutiveFailureLimit > 0 &&
          Number(runner.progress.consecutiveFailureCount || 0) >= consecutiveFailureLimit
        ) {
          await finishJob("error", "Stopped after reaching the consecutive failure limit.");
          return;
        }
      }

      const failureRateThreshold = Math.max(
        0,
        Number((runner.job.settings || {}).failureRateThresholdPercent || 0)
      );
      const failureRateCheckAfter = Math.max(
        1,
        Number((runner.job.settings || {}).failureRateMinSample || 1)
      );
      const completed = Number(runner.progress.completed || 0);
      const failureCount = Number(runner.progress.failureCount || 0);
      const failureRate = completed ? (failureCount / completed) * 100 : 0;

      if (
        failureRateThreshold > 0 &&
        completed >= failureRateCheckAfter &&
        failureRate >= failureRateThreshold
      ) {
        await finishJob(
          "error",
          "Stopped after the campaign hit the configured failure-rate threshold."
        );
        return;
      }

      await reportProgress(runner.status);

      if (runner.status === "stopped") {
        await finishJob("stopped");
        return;
      }

      await waitBetweenRecipients();
    }

    await finishJob("finished");
  }

  async function beginRunnerIfNeeded() {
    if (!runner.job || runner.runningPromise || (runner.status !== "running" && runner.status !== "paused")) {
      return;
    }

    runner.runningPromise = runJobLoop()
      .catch(async function (error) {
        const message = error instanceof Error ? error.message : "Unknown WhatsApp Web error.";
        await finishJob("error", message);
      })
      .finally(function () {
        runner.runningPromise = null;
      });
  }

  function absorbState(state) {
    if (!state || !state.job) {
      resetRunner();
      renderOverlay();
      return;
    }

    runner.job = state.job;
    runner.progress = state.progress ? state.progress : createEmptyProgress(state.job.recipients.length);
    runner.status = state.status || "idle";
    runner.lastError = state.lastError || "";
    renderOverlay();
  }

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    (async function () {
      if (message.type === "SYNC_STATE") {
        absorbState(message.state);
        await beginRunnerIfNeeded();
        sendResponse({ ok: true });
        return;
      }

      if (message.type === "CONTROL_JOB") {
        runner.status = message.status || runner.status;
        renderOverlay();
        if (runner.status === "running") {
          await beginRunnerIfNeeded();
        } else {
          await reportProgress(runner.status);
        }
        sendResponse({ ok: true });
        return;
      }

      if (message.type === "GET_WA_STATUS") {
        const status = await requestPageAction("GET_STATUS", {});
        sendResponse({ ok: true, status: status });
        return;
      }

      if (message.type === "GET_DISCOVERY_DATA") {
        const discovery = await requestPageAction("GET_DISCOVERY_DATA", {}, 120000);
        sendResponse({ ok: true, discovery: discovery });
        return;
      }

      if (message.type === "RESOLVE_TARGETS") {
        const recipients = await requestPageAction("RESOLVE_TARGETS", message.payload || {}, 120000);
        sendResponse({ ok: true, recipients: recipients });
        return;
      }

      sendResponse({ ok: false, error: "Unknown content message." });
    })().catch(function (error) {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    });

    return true;
  });

  ensureOverlay();

  ensureBridgeInjected().catch(function () {
    return null;
  });

  sendRuntimeMessage({ type: "CONTENT_READY" });
})();
