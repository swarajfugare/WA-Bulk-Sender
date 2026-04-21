(function () {
  const AUDIENCE_PRESET_KEY = "wa_sender_audience_presets";
  const CAMPAIGN_HISTORY_KEY = "wa_sender_campaign_history";
  const TEMPLATE_KEY = "wa_sender_templates";
  const STATE_KEY = "wa_sender_state";

  const elements = {
    activeRecipient: document.getElementById("active-recipient"),
    attachmentInput: document.getElementById("attachment-input"),
    attachmentList: document.getElementById("attachment-list"),
    attachmentCaptionCheckbox: document.getElementById("attachment-caption-checkbox"),
    attachmentSummary: document.getElementById("attachment-summary"),
    audiencePresetNameInput: document.getElementById("audience-preset-name-input"),
    audiencePresetSelect: document.getElementById("audience-preset-select"),
    audiencePresetSummary: document.getElementById("audience-preset-summary"),
    audienceSummary: document.getElementById("audience-summary"),
    authStatusText: document.getElementById("auth-status-text"),
    batchPauseInput: document.getElementById("batch-pause-input"),
    batchSizeInput: document.getElementById("batch-size-input"),
    bridgeStatusText: document.getElementById("bridge-status-text"),
    clearAttachmentsBtn: document.getElementById("clear-attachments-btn"),
    clearManualNumbersBtn: document.getElementById("clear-manual-numbers-btn"),
    clearResultsBtn: document.getElementById("clear-results-btn"),
    clearSelectionBtn: document.getElementById("clear-selection-btn"),
    campaignNameInput: document.getElementById("campaign-name-input"),
    confirmOptInCheckbox: document.getElementById("confirm-opt-in-checkbox"),
    connectionMeta: document.getElementById("connection-meta"),
    discoveryList: document.getElementById("discovery-list"),
    discoveryPanel: document.getElementById("discovery-panel"),
    discoverySearchInput: document.getElementById("discovery-search-input"),
    doneCount: document.getElementById("done-count"),
    downloadFailedBtn: document.getElementById("download-failed-btn"),
    downloadResultsBtn: document.getElementById("download-results-btn"),
    downloadTemplateBtn: document.getElementById("download-template-btn"),
    estimatedRecipients: document.getElementById("estimated-recipients"),
    excludeNumbersInput: document.getElementById("exclude-numbers-input"),
    excludeSummary: document.getElementById("exclude-summary"),
    feedbackSummary: document.getElementById("feedback-summary"),
    failureCount: document.getElementById("failure-count"),
    includeAdminsCheckbox: document.getElementById("include-admins-checkbox"),
    includeAdminsRow: document.getElementById("include-admins-row"),
    loadedChatsCount: document.getElementById("loaded-chats-count"),
    loadedContactsCount: document.getElementById("loaded-contacts-count"),
    loadedCountriesCount: document.getElementById("loaded-countries-count"),
    loadedGroupsCount: document.getElementById("loaded-groups-count"),
    loadedLabelsCount: document.getElementById("loaded-labels-count"),
    knownBlocksInput: document.getElementById("known-blocks-input"),
    knownReportsInput: document.getElementById("known-reports-input"),
    maxDelayInput: document.getElementById("max-delay-input"),
    loadAudiencePresetBtn: document.getElementById("load-audience-preset-btn"),
    messageInput: document.getElementById("message-input"),
    messageCharCount: document.getElementById("message-char-count"),
    messageLineCount: document.getElementById("message-line-count"),
    minDelayInput: document.getElementById("min-delay-input"),
    numbersInput: document.getElementById("numbers-input"),
    numbersPanel: document.getElementById("numbers-panel"),
    openWaBtn: document.getElementById("open-wa-btn"),
    overviewAudienceStatus: document.getElementById("overview-audience-status"),
    overviewComposeStatus: document.getElementById("overview-compose-status"),
    overviewConnectionStatus: document.getElementById("overview-connection-status"),
    overviewRunStatus: document.getElementById("overview-run-status"),
    pagePanels: Array.from(document.querySelectorAll("[data-page-panel]")),
    pageTabs: Array.from(document.querySelectorAll("[data-page-tab]")),
    pauseBtn: document.getElementById("pause-btn"),
    pasteMessageBtn: document.getElementById("paste-message-btn"),
    pasteNumbersBtn: document.getElementById("paste-numbers-btn"),
    preflightAttachments: document.getElementById("preflight-attachments"),
    preflightAudience: document.getElementById("preflight-audience"),
    preflightConnection: document.getElementById("preflight-connection"),
    preflightEstimate: document.getElementById("preflight-estimate"),
    preflightExclusions: document.getElementById("preflight-exclusions"),
    preflightMessage: document.getElementById("preflight-message"),
    preflightSource: document.getElementById("preflight-source"),
    previewRecipientLabel: document.getElementById("preview-recipient-label"),
    previewText: document.getElementById("preview-text"),
    progressFill: document.getElementById("progress-fill"),
    resultsLastError: document.getElementById("results-last-error"),
    recipientFileInput: document.getElementById("recipient-file-input"),
    recipientSummary: document.getElementById("recipient-summary"),
    refreshWaBtn: document.getElementById("refresh-wa-btn"),
    retryFailedBtn: document.getElementById("retry-failed-btn"),
    resultsList: document.getElementById("results-list"),
    resultsStatusSummary: document.getElementById("results-status-summary"),
    resultsSuccessRate: document.getElementById("results-success-rate"),
    resumeBtn: document.getElementById("resume-btn"),
    runHint: document.getElementById("run-hint"),
    saveTemplateBtn: document.getElementById("save-template-btn"),
    saveAudiencePresetBtn: document.getElementById("save-audience-preset-btn"),
    selectedEstimateCount: document.getElementById("selected-estimate-count"),
    selectedGroupMembersCount: document.getElementById("selected-group-members-count"),
    selectedSearchCount: document.getElementById("selected-search-count"),
    selectedSourceCount: document.getElementById("selected-source-count"),
    selectionBreakdown: document.getElementById("selection-breakdown"),
    selectionSummary: document.getElementById("selection-summary"),
    selectVisibleBtn: document.getElementById("select-visible-btn"),
    sourceTabs: Array.from(document.querySelectorAll("[data-source-tab]")),
    startBtn: document.getElementById("start-btn"),
    statusBadge: document.getElementById("status-badge"),
    stopBtn: document.getElementById("stop-btn"),
    streamStatusText: document.getElementById("stream-status-text"),
    successCount: document.getElementById("success-count"),
    templateSelect: document.getElementById("template-select"),
    timestampCheckbox: document.getElementById("timestamp-checkbox"),
    totalCount: document.getElementById("total-count"),
    composeAttachmentCount: document.getElementById("compose-attachment-count"),
    composeVariableCount: document.getElementById("compose-variable-count"),
    variablesList: document.getElementById("variables-list"),
    voiceNoteCheckbox: document.getElementById("voice-note-checkbox"),
    warmupProfileSelect: document.getElementById("warmup-profile-select"),
    maxRecipientsInput: document.getElementById("max-recipients-input"),
    stopAfterFailuresInput: document.getElementById("stop-after-failures-input"),
    deleteAudiencePresetBtn: document.getElementById("delete-audience-preset-btn"),
    dailySendCapInput: document.getElementById("daily-send-cap-input"),
    failureRateMinSampleInput: document.getElementById("failure-rate-min-sample-input"),
    failureRateThresholdInput: document.getElementById("failure-rate-threshold-input"),
    positiveConsentOnlyCheckbox: document.getElementById("positive-consent-only-checkbox"),
    preflightConsent: document.getElementById("preflight-consent"),
    preflightDailyCap: document.getElementById("preflight-daily-cap"),
    preflightRisk: document.getElementById("preflight-risk"),
    preflightRiskNotes: document.getElementById("preflight-risk-notes"),
    restrictionRiskGauge: document.getElementById("restriction-risk-gauge"),
    restrictionRiskLabel: document.getElementById("restriction-risk-label"),
    restrictionRiskNote: document.getElementById("restriction-risk-note"),
    restrictionRiskPercent: document.getElementById("restriction-risk-percent"),
    restrictionRiskSummary: document.getElementById("restriction-risk-summary"),
    safetySummary: document.getElementById("safety-summary"),
    stopAfterConsecutiveFailuresInput: document.getElementById("stop-after-consecutive-failures-input")
  };

  const state = {
    attachments: [],
    audiencePresets: [],
    campaignHistory: [],
    discovery: {
      chats: [],
      contacts: [],
      countries: [],
      groups: [],
      labels: [],
      refreshedAt: "",
      status: null
    },
    importedRecipients: [],
    importedVariables: [],
    rawCountries: [],
    activePage: "home",
    runtimeState: null,
    searchTerm: "",
    selections: {
      chats: new Set(),
      contacts: new Set(),
      countries: new Set(),
      groups: new Set(),
      labels: new Set()
    },
    source: "numbers",
    templates: [],
    waStatus: {
      authenticated: false,
      stream: null,
      wppReady: false
    }
  };

  function sendRuntimeMessage(payload) {
    return new Promise(function (resolve, reject) {
      chrome.runtime.sendMessage(payload, function (response) {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(response || null);
      });
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(new Error("Could not read attachment."));
      };
      reader.readAsDataURL(file);
    });
  }

  function readFromStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeToStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      return null;
    }
  }

  async function ensureClipboardPermission() {
    if (!chrome.permissions || typeof chrome.permissions.contains !== "function") {
      return true;
    }

    const permissionRequest = {
      permissions: ["clipboardRead"]
    };
    const hasPermission = await chrome.permissions.contains(permissionRequest);
    if (hasPermission) {
      return true;
    }

    return chrome.permissions.request(permissionRequest);
  }

  async function readClipboardText() {
    const granted = await ensureClipboardPermission();
    if (!granted) {
      throw new Error("Clipboard access was not granted.");
    }

    if (!navigator.clipboard || typeof navigator.clipboard.readText !== "function") {
      throw new Error("Clipboard reading is not available in this browser.");
    }

    return navigator.clipboard.readText();
  }

  function insertTextAtCursor(element, text) {
    if (!element) {
      return;
    }

    const value = String(text || "");
    const start = typeof element.selectionStart === "number" ? element.selectionStart : element.value.length;
    const end = typeof element.selectionEnd === "number" ? element.selectionEnd : element.value.length;

    element.focus();

    if (typeof element.setRangeText === "function") {
      element.setRangeText(value, start, end, "end");
    } else {
      const original = String(element.value || "");
      element.value = original.slice(0, start) + value + original.slice(end);
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
  }

  async function pasteIntoField(element, label) {
    const clipboardText = await readClipboardText();
    if (!clipboardText) {
      setRunHint("Clipboard is empty.");
      return;
    }

    insertTextAtCursor(element, clipboardText);
    setRunHint("Pasted " + label + " from the clipboard.");
  }

  function bindClipboardShortcut(element, label) {
    if (!element) {
      return;
    }

    element.addEventListener("paste", function (event) {
      if (event.clipboardData && typeof event.clipboardData.getData === "function") {
        return;
      }

      event.preventDefault();
      pasteIntoField(element, label).catch(function () {
        setRunHint("Paste was blocked. Use the paste button if Chrome asks for permission.");
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

  function setRunHint(message) {
    elements.runHint.textContent = message;
  }

  function renderPageState() {
    elements.pageTabs.forEach(function (button) {
      button.classList.toggle("page-tab--active", button.dataset.pageTab === state.activePage);
    });

    elements.pagePanels.forEach(function (panel) {
      panel.classList.toggle("page-panel--active", panel.dataset.pagePanel === state.activePage);
    });
  }

  function setActivePage(pageName) {
    state.activePage = pageName || "home";
    writeToStorage("wa_sender_active_page", state.activePage);
    renderPageState();
  }

  function setText(element, value) {
    if (element) {
      element.textContent = value;
    }
  }

  function capitalize(value) {
    return String(value || "")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, function (match) {
        return match.toUpperCase();
      });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getExcludedRecipients() {
    return window.WAFileTools.manualTextToRecipients(elements.excludeNumbersInput.value || "");
  }

  function getExcludedPhoneDigitsSet() {
    return new Set(
      getExcludedRecipients()
        .map(function (recipient) {
          return recipient.phoneDigits || String(recipient.phone || "").replace(/\D/g, "");
        })
        .filter(Boolean)
    );
  }

  function snapshotSelections() {
    return {
      chats: Array.from(state.selections.chats),
      contacts: Array.from(state.selections.contacts),
      countries: Array.from(state.selections.countries),
      groups: Array.from(state.selections.groups),
      labels: Array.from(state.selections.labels)
    };
  }

  function restoreSelections(snapshot) {
    const next = snapshot || {};
    state.selections.chats = new Set(Array.isArray(next.chats) ? next.chats : []);
    state.selections.contacts = new Set(Array.isArray(next.contacts) ? next.contacts : []);
    state.selections.countries = new Set(Array.isArray(next.countries) ? next.countries : []);
    state.selections.groups = new Set(Array.isArray(next.groups) ? next.groups : []);
    state.selections.labels = new Set(Array.isArray(next.labels) ? next.labels : []);
  }

  function dedupeRecipientsByChatId(recipients) {
    const map = new Map();

    recipients.forEach(function (recipient) {
      if (!recipient || !recipient.chatId) {
        return;
      }

      const existing = map.get(recipient.chatId);
      if (!existing) {
        map.set(recipient.chatId, recipient);
        return;
      }

      map.set(recipient.chatId, {
        ...existing,
        ...recipient,
        fields: {
          ...(existing.fields || {}),
          ...(recipient.fields || {})
        },
        name: recipient.name || existing.name,
        phone: recipient.phone || existing.phone,
        source: recipient.source || existing.source
      });
    });

    return Array.from(map.values());
  }

  function isSameLocalDay(firstIso, secondDate) {
    if (!firstIso) {
      return false;
    }

    const firstDate = new Date(firstIso);
    const compareDate = secondDate instanceof Date ? secondDate : new Date(secondDate);
    if (Number.isNaN(firstDate.getTime()) || Number.isNaN(compareDate.getTime())) {
      return false;
    }

    return (
      firstDate.getFullYear() === compareDate.getFullYear() &&
      firstDate.getMonth() === compareDate.getMonth() &&
      firstDate.getDate() === compareDate.getDate()
    );
  }

  function getTodayAttemptCount() {
    const now = new Date();
    return state.campaignHistory.reduce(function (total, entry) {
      if (!entry || !isSameLocalDay(entry.finishedAt || entry.startedAt, now)) {
        return total;
      }
      return total + Math.max(0, Number(entry.completed || 0));
    }, 0);
  }

  function normalizeConsentValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getRecipientConsentStatus(recipient) {
    const fields = recipient && recipient.fields ? recipient.fields : {};
    const consentHeaderPattern = /(consent|opt[\s_-]?in|permission|subscribed)/i;
    const consentDatePattern = /(consent|opt[\s_-]?in|permission).*(date|time|at)|subscribed.*(date|time|at)/i;
    const positivePattern = /^(1|y|yes|true|opted in|opt in|subscribed|consented|allowed|approved)$/i;
    const negativePattern = /^(0|n|no|false|opted out|opt out|unsubscribed|blocked|revoked|denied|stop|stopped)$/i;
    let hasRelevantField = false;
    let hasPositiveMarker = false;

    return Object.keys(fields).reduce(function (status, key) {
      if (status === "negative") {
        return status;
      }

      const value = normalizeConsentValue(fields[key]);
      if (!value) {
        return status;
      }

      if (consentHeaderPattern.test(key)) {
        hasRelevantField = true;
        if (negativePattern.test(value)) {
          return "negative";
        }
        if (positivePattern.test(value)) {
          hasPositiveMarker = true;
          return "positive";
        }
        return status;
      }

      if (consentDatePattern.test(key) && value) {
        hasPositiveMarker = true;
      }

      return status;
    }, "unknown") === "negative"
      ? "negative"
      : hasPositiveMarker
      ? "positive"
      : hasRelevantField
      ? "unknown"
      : "unknown";
  }

  async function loadCampaignHistory() {
    const stored = await chrome.storage.local.get(CAMPAIGN_HISTORY_KEY);
    state.campaignHistory = Array.isArray(stored[CAMPAIGN_HISTORY_KEY]) ? stored[CAMPAIGN_HISTORY_KEY] : [];
  }

  function getMessageVariableCount(messageTemplate) {
    return new Set(
      (String(messageTemplate || "").match(/\{\{[^}]+\}\}/g) || []).map(function (item) {
        return item.trim();
      })
    ).size;
  }

  function getMessageUrlCount(messageTemplate) {
    return (String(messageTemplate || "").match(/(?:https?:\/\/|www\.)\S+/gi) || []).length;
  }

  function getRecentHistoryMetrics() {
    return state.campaignHistory.slice(0, 12).reduce(function (summary, entry) {
      const completed = Math.max(0, Number(entry && entry.completed || 0));
      const failures = Math.max(0, Number(entry && entry.failureCount || 0));
      summary.completed += completed;
      summary.failures += failures;
      return summary;
    }, { completed: 0, failures: 0 });
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

  function getRiskGaugeClass(percent) {
    if (percent >= 65) {
      return "risk-gauge risk-gauge--high";
    }
    if (percent >= 40) {
      return "risk-gauge risk-gauge--elevated";
    }
    if (percent >= 20) {
      return "risk-gauge risk-gauge--guarded";
    }
    return "risk-gauge risk-gauge--low";
  }

  function estimateRestrictionRisk(context) {
    const settings = context && context.settings ? context.settings : {};
    const plannedRecipients = Math.max(0, Number(context && context.plannedRecipients || 0));
    const completed = Math.max(0, Number(context && context.completed || 0));
    const failures = Math.max(0, Number(context && context.failures || 0));
    const consecutiveFailures = Math.max(0, Number(context && context.consecutiveFailures || 0));
    const todayCount = Math.max(0, Number(context && context.todayCount || 0));
    const positiveConsentCount = Math.max(0, Number(context && context.positiveConsentCount || 0));
    const unknownConsentCount = Math.max(0, Number(context && context.unknownConsentCount || 0));
    const knownBlocks = clamp(Math.max(0, Number(settings.manualKnownBlocks || 0)), 0, 50);
    const knownReports = clamp(Math.max(0, Number(settings.manualKnownReports || 0)), 0, 50);
    const historyFailureRate = clamp(Math.max(0, Number(context && context.historyFailureRate || 0)), 0, 100);
    const currentFailureRate = completed ? (failures / completed) * 100 : 0;
    const effectiveFailureRate = Math.max(currentFailureRate, historyFailureRate);
    const projectedToday = todayCount + plannedRecipients;
    const consentTotal = positiveConsentCount + unknownConsentCount;
    const unknownConsentShare = consentTotal ? unknownConsentCount / consentTotal : 1;
    const hasVariables = Boolean(context && context.hasVariables);
    const urlCount = Math.max(0, Number(context && context.urlCount || 0));
    const attachmentCount = Math.max(0, Number(context && context.attachmentCount || 0));
    const contributions = [];
    let score = 6;

    function add(points, reason) {
      if (!points) {
        return;
      }
      score += points;
      contributions.push({ points: points, reason: reason });
    }

    add(clamp((projectedToday - 20) * 0.18, 0, 14), "Projected sends today are above a conservative volume range.");
    add(clamp((plannedRecipients - 15) * 0.22, 0, 12), "This campaign size is larger than a cautious warm-up batch.");
    add(clamp(effectiveFailureRate * 0.6, 0, 24), "Failure rate is increasing the restriction risk estimate.");
    add(clamp(consecutiveFailures * 4, 0, 12), "Back-to-back failures are a strong warning signal.");
    add(clamp(knownBlocks * 7, 0, 21), "Known user blocks increase the risk estimate sharply.");
    add(clamp(knownReports * 14, 0, 35), "Known user reports are heavily weighted in the risk estimate.");
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
      add(6, "The message has no personalization variables for a medium or larger batch.");
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
      add(-1, "Balanced pacing reduces the estimate slightly.");
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
    const topReasons = contributions
      .slice()
      .sort(function (first, second) {
        return Math.abs(second.points) - Math.abs(first.points);
      })
      .slice(0, 3)
      .map(function (item) {
        return item.reason;
      });

    return {
      contributions: contributions,
      currentFailureRate: Math.round(currentFailureRate),
      historyFailureRate: Math.round(historyFailureRate),
      label: label,
      percent: percent,
      projectedToday: projectedToday,
      topReasons: topReasons
    };
  }

  function renderRestrictionRiskGauge() {
    const settings = collectSettings();
    const runtimeProgress = state.runtimeState && state.runtimeState.progress ? state.runtimeState.progress : {};
    const preflightRecipients = getPreflightRecipientCandidates();
    const prepared = prepareRecipientsForRun(preflightRecipients, settings);
    const audienceEstimate = getAudienceEstimateStats();
    const recentHistory = getRecentHistoryMetrics();
    const risk = estimateRestrictionRisk({
      attachmentCount: state.attachments.length,
      completed: Number(runtimeProgress.completed || 0),
      consecutiveFailures: Number(runtimeProgress.consecutiveFailureCount || 0),
      failures: Number(runtimeProgress.failureCount || 0),
      hasVariables: getMessageVariableCount(elements.messageInput.value || "") > 0,
      historyFailureRate: recentHistory.completed ? (recentHistory.failures / recentHistory.completed) * 100 : 0,
      plannedRecipients: prepared.summary.finalCount || Number(audienceEstimate.estimate || 0),
      positiveConsentCount: prepared.summary.positiveConsentCount,
      settings: settings,
      todayCount: prepared.summary.todayCount,
      unknownConsentCount: prepared.summary.unknownConsentCount,
      urlCount: getMessageUrlCount(elements.messageInput.value || "")
    });

    if (elements.restrictionRiskGauge) {
      elements.restrictionRiskGauge.className = getRiskGaugeClass(risk.percent);
      elements.restrictionRiskGauge.style.setProperty("--risk-angle", Math.round((risk.percent / 100) * 360) + "deg");
    }

    setText(elements.restrictionRiskPercent, risk.percent + "%");
    setText(elements.restrictionRiskLabel, risk.label);
    setText(
      elements.restrictionRiskSummary,
      risk.topReasons[0] || "Estimate uses local pace, failures, consent coverage, and manual feedback counts."
    );
    setText(
      elements.restrictionRiskNote,
      "Local estimate only. WhatsApp does not expose real block/report counts here, so enter those manually if known."
    );

    return risk;
  }

  function prepareRecipientsForRun(recipients, settings) {
    const excludedDigits = getExcludedPhoneDigitsSet();
    const dedupedRecipients = dedupeRecipientsByChatId(recipients || []);
    const todayCount = getTodayAttemptCount();
    const dailyCap = Math.max(1, Number(settings.dailySendCap || 1));
    const filtered = [];
    const summary = {
      cappedByDaily: 0,
      cappedByMax: 0,
      dailyCap: dailyCap,
      dailyRemaining: Math.max(0, dailyCap - todayCount),
      excludedByNegativeConsent: 0,
      excludedByNumber: 0,
      excludedByPositiveConsentOnly: 0,
      finalCount: 0,
      negativeConsentCount: 0,
      positiveConsentCount: 0,
      todayCount: todayCount,
      unknownConsentCount: 0
    };

    dedupedRecipients.forEach(function (recipient) {
      const digits = String(recipient.phoneDigits || recipient.phone || "").replace(/\D/g, "");
      if (digits && excludedDigits.has(digits)) {
        summary.excludedByNumber += 1;
        return;
      }

      const consentStatus = getRecipientConsentStatus(recipient);
      if (consentStatus === "negative") {
        summary.negativeConsentCount += 1;
        summary.excludedByNegativeConsent += 1;
        return;
      }

      if (consentStatus === "positive") {
        summary.positiveConsentCount += 1;
      } else {
        summary.unknownConsentCount += 1;
      }

      if (settings.requirePositiveConsentData && consentStatus !== "positive") {
        summary.excludedByPositiveConsentOnly += 1;
        return;
      }

      filtered.push(recipient);
    });

    const maxRecipients = Math.max(1, Number(settings.maxRecipientsPerRun || filtered.length || 1));
    let finalRecipients = filtered.slice(0, maxRecipients);
    summary.cappedByMax = Math.max(0, filtered.length - finalRecipients.length);

    if (finalRecipients.length > summary.dailyRemaining) {
      summary.cappedByDaily = Math.max(0, finalRecipients.length - summary.dailyRemaining);
      finalRecipients = finalRecipients.slice(0, summary.dailyRemaining);
    }

    summary.finalCount = finalRecipients.length;
    return {
      recipients: finalRecipients,
      summary: summary
    };
  }

  function buildSafetyReport(recipientCandidates, settings, messageTemplate, attachments, options) {
    const preparation = prepareRecipientsForRun(recipientCandidates, settings);
    const warnings = [];
    const blockers = [];
    const messageVariables = getMessageVariableCount(messageTemplate);
    const urlCount = getMessageUrlCount(messageTemplate);
    const finalCount = preparation.summary.finalCount;
    const recipientEstimate = options && Number(options.recipientEstimate || 0) > 0
      ? Number(options.recipientEstimate || 0)
      : finalCount;
    let score = 0;

    if (preparation.summary.dailyRemaining <= 0) {
      blockers.push("Today's local send cap is already reached. Wait until tomorrow or lower today's usage.");
    }

    if (settings.requirePositiveConsentData && finalCount === 0) {
      blockers.push("No recipients with positive consent data remain after the current safety filters.");
    }

    if (preparation.summary.excludedByNegativeConsent > 0) {
      warnings.push(
        preparation.summary.excludedByNegativeConsent +
          " recipients with negative or opted-out consent markers will be skipped automatically."
      );
      score += 1;
    }

    if (!settings.requirePositiveConsentData && preparation.summary.unknownConsentCount > 0) {
      warnings.push(
        preparation.summary.unknownConsentCount +
          " recipients do not have clear consent fields. Review them carefully before sending."
      );
      score += preparation.summary.unknownConsentCount > 10 ? 2 : 1;
    }

    if (preparation.summary.excludedByPositiveConsentOnly > 0) {
      warnings.push(
        preparation.summary.excludedByPositiveConsentOnly +
          " recipients were left out because positive-consent-only mode is enabled."
      );
    }

    if (recipientEstimate > 30) {
      warnings.push("This run is larger than the safest starting range. Smaller, reviewed batches are safer.");
      score += recipientEstimate > 75 ? 2 : 1;
    }

    if (Number(settings.delayMinSeconds || 0) < 10) {
      warnings.push("Minimum delay is under 10 seconds. Slower pacing is safer for review-driven follow-up.");
      score += Number(settings.delayMinSeconds || 0) < 6 ? 2 : 1;
    }

    if (Number(settings.batchSize || 0) > 10) {
      warnings.push("Batch size is above 10. Smaller batches reduce the chance of a low-quality run.");
      score += Number(settings.batchSize || 0) > 18 ? 2 : 1;
    }

    if (Number(settings.batchSize || 0) > 0 && Number(settings.batchPauseSeconds || 0) < 120) {
      warnings.push("Batch pauses below 120 seconds are still aggressive for warm-up sending.");
      score += Number(settings.batchPauseSeconds || 0) < 60 ? 2 : 1;
    }

    if (recipientEstimate > 20 && messageVariables === 0) {
      warnings.push("The message has no personalization variables. Repeated first-contact text performs worse.");
      score += 1;
    }

    if (recipientEstimate > 20 && urlCount > 0) {
      warnings.push("This message includes a link. Keep link-heavy runs small and review consent carefully.");
      score += 1;
    }

    if (recipientEstimate > 20 && Array.isArray(attachments) && attachments.length > 0) {
      warnings.push("Attachment-heavy runs should stay small and carefully paced.");
      score += 1;
    }

    if ((settings.warmupProfile || "custom") !== "careful" && recipientEstimate > 25) {
      warnings.push("Switch to the Careful warm-up profile for runs above 25 recipients.");
      score += 1;
    }

    if (Number(settings.stopAfterFailures || 0) > 8) {
      warnings.push("Stop-after-failures is loose. A smaller stop limit is safer.");
      score += 1;
    }

    if (Number(settings.stopAfterConsecutiveFailures || 0) > 3) {
      warnings.push("Consecutive failure protection is loose. Tightening it reduces runaway failure loops.");
      score += 1;
    }

    if (Number(settings.failureRateThresholdPercent || 0) > 35) {
      warnings.push("Failure-rate stop threshold is loose. Review-oriented campaigns should stop sooner.");
      score += 1;
    }

    return {
      blockers: blockers,
      consentText: preparation.summary.positiveConsentCount
        ? preparation.summary.positiveConsentCount + " positive consent record(s) ready"
        : preparation.summary.unknownConsentCount
        ? preparation.summary.unknownConsentCount + " recipient(s) without clear consent data"
        : "No consent-tagged recipients in this audience",
      dailyCapText:
        preparation.summary.todayCount +
        " used today, " +
        preparation.summary.dailyRemaining +
        " remaining under the current cap",
      preparation: preparation,
      riskLevel: blockers.length ? "blocked" : score >= 7 ? "high" : score >= 3 ? "medium" : "low",
      warnings: warnings
    };
  }

  function getPreflightRecipientCandidates() {
    if (state.source === "numbers") {
      const manualRecipients = window.WAFileTools.manualTextToRecipients(elements.numbersInput.value)
        .map(function (recipient) {
          return window.WAFileTools.toDirectRecipient(recipient.phone, {
            fields: recipient.fields,
            name: recipient.name,
            source: "numbers"
          });
        })
        .filter(Boolean);

      const importedRecipients = state.importedRecipients.map(function (recipient) {
        return window.WAFileTools.toDirectRecipient(recipient.phone, {
          fields: recipient.fields,
          name: recipient.name,
          source: "numbers"
        });
      }).filter(Boolean);

      return dedupeRecipientsByChatId([].concat(importedRecipients, manualRecipients));
    }

    if (state.source === "chats") {
      return mapDiscoveryItemsToRecipients(getSelectedDiscoveryItems("chats"), "chat");
    }

    if (state.source === "contacts") {
      return mapDiscoveryItemsToRecipients(getSelectedDiscoveryItems("contacts"), "contact");
    }

    return [];
  }

  async function loadTemplates() {
    const stored = await chrome.storage.local.get(TEMPLATE_KEY);
    state.templates = Array.isArray(stored[TEMPLATE_KEY]) ? stored[TEMPLATE_KEY] : [];
    renderTemplateSelect();
  }

  async function loadAudiencePresets() {
    const stored = await chrome.storage.local.get(AUDIENCE_PRESET_KEY);
    state.audiencePresets = Array.isArray(stored[AUDIENCE_PRESET_KEY]) ? stored[AUDIENCE_PRESET_KEY] : [];
    renderAudiencePresetSelect();
  }

  async function loadCountryData() {
    state.rawCountries = await window.WAFileTools.readJsonResource(chrome.runtime.getURL("data/countries.json"));
    deriveCountries();
  }

  function renderTemplateSelect() {
    elements.templateSelect.innerHTML = '<option value="">Select a saved template</option>';
    state.templates.forEach(function (template) {
      const option = document.createElement("option");
      option.value = template.id;
      option.textContent = template.name;
      elements.templateSelect.appendChild(option);
    });
  }

  function renderAudiencePresetSelect() {
    elements.audiencePresetSelect.innerHTML = '<option value="">Select a saved audience preset</option>';
    state.audiencePresets.forEach(function (preset) {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.name;
      elements.audiencePresetSelect.appendChild(option);
    });

    elements.audiencePresetSummary.textContent = state.audiencePresets.length
      ? state.audiencePresets.length + " saved audience preset(s) available."
      : "No saved audience presets yet.";
  }

  function renderVariables() {
    elements.variablesList.innerHTML = "";

    if (!state.importedVariables.length) {
      const span = document.createElement("span");
      span.className = "muted";
      span.textContent = "Import a file to enable placeholders.";
      elements.variablesList.appendChild(span);
      return;
    }

    state.importedVariables.forEach(function (variable) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = "{{" + variable + "}}";
      elements.variablesList.appendChild(chip);
    });

    renderMessageInsights();
  }

  function renderRecipientSummary() {
    const importedCount = state.importedRecipients.length;
    const manualCount = window.WAFileTools.manualTextToRecipients(elements.numbersInput.value).length;

    if (!importedCount && !manualCount) {
      elements.recipientSummary.textContent = "No imported or manual recipients yet.";
      return;
    }

    const preview = state.importedRecipients
      .slice(0, 3)
      .map(function (recipient) {
        return recipient.phone;
      })
      .join(", ");

    elements.recipientSummary.textContent =
      importedCount +
      " imported, " +
      manualCount +
      " manual. " +
      (preview ? "Preview: " + preview + (importedCount > 3 ? " ..." : "") : "Manual numbers are ready.");

    renderOverviewCards();
    renderPreflightSummary();
  }

  function renderAttachments() {
    elements.attachmentList.innerHTML = "";

    if (!state.attachments.length) {
      const span = document.createElement("span");
      span.className = "muted";
      span.textContent = "No files selected.";
      elements.attachmentList.appendChild(span);
      elements.attachmentSummary.textContent = "No files selected.";
      renderMessageInsights();
      renderPreflightSummary();
      renderOverviewCards();
      return;
    }

    let totalBytes = 0;
    state.attachments.forEach(function (file) {
      const pill = document.createElement("span");
      pill.className = "file-pill";
      pill.textContent = file.name;
      elements.attachmentList.appendChild(pill);
      totalBytes += Number(file.size || 0);
    });

    const totalMb = (totalBytes / (1024 * 1024)).toFixed(totalBytes > 1024 * 1024 ? 1 : 2);
    elements.attachmentSummary.textContent =
      state.attachments.length + " file(s) selected, about " + totalMb + " MB total.";

    renderMessageInsights();
    renderPreflightSummary();
    renderOverviewCards();
  }

  function renderExcludeSummary() {
    const excluded = getExcludedRecipients();
    elements.excludeSummary.textContent = excluded.length
      ? excluded.length + " numbers will be skipped during recipient preparation."
      : "No exclusions added yet.";
    renderPreflightSummary();
    renderOverviewCards();
  }

  function renderConnectionStatus() {
    const status = state.waStatus || {};
    const streamMode = status.stream && status.stream.mode ? status.stream.mode : "Unknown";
    const refreshedAt = state.discovery.refreshedAt
      ? new Date(state.discovery.refreshedAt).toLocaleTimeString()
      : "";

    elements.bridgeStatusText.textContent = status.wppReady ? "Ready" : "Waiting";
    elements.authStatusText.textContent = status.authenticated ? "Logged In" : "Not Ready";
    elements.streamStatusText.textContent = streamMode;
    elements.connectionMeta.textContent = refreshedAt
      ? "Last WhatsApp refresh at " + refreshedAt
      : "Waiting for WhatsApp Web.";

    renderOverviewCards();
    renderPreflightSummary();
  }

  function deriveCountries() {
    if (!state.rawCountries.length) {
      state.discovery.countries = [];
      return;
    }

    const seenPhones = new Set();
    const targets = []
      .concat(state.discovery.contacts || [])
      .concat(state.discovery.chats || [])
      .filter(function (item) {
        return item && item.phone;
      })
      .filter(function (item) {
        if (seenPhones.has(item.phone)) {
          return false;
        }
        seenPhones.add(item.phone);
        return true;
      });

    state.discovery.countries = state.rawCountries
      .map(function (entry) {
        const name = entry[0];
        const flag = entry[1];
        const code = String(entry[2] || "").replace(/\D/g, "");
        const count = targets.filter(function (target) {
          return String(target.phone || "").replace(/\D/g, "").startsWith(code);
        }).length;

        return {
          code: code,
          count: count,
          flag: flag,
          id: flag + ":" + code + ":" + name,
          name: name
        };
      })
      .filter(function (item) {
        return item.count > 0;
      })
      .sort(function (left, right) {
        return right.count - left.count || left.name.localeCompare(right.name);
      });
  }

  function getSelectionSet(source) {
    return state.selections[source];
  }

  function getCurrentDiscoveryItems() {
    switch (state.source) {
      case "chats":
        return state.discovery.chats || [];
      case "contacts":
        return state.discovery.contacts || [];
      case "groups":
        return state.discovery.groups || [];
      case "labels":
        return state.discovery.labels || [];
      case "countries":
        return state.discovery.countries || [];
      default:
        return [];
    }
  }

  function getFilteredDiscoveryItems() {
    const items = getCurrentDiscoveryItems();
    const searchTerm = state.searchTerm.trim().toLowerCase();

    return items.filter(function (item) {
      if (!searchTerm) {
        return true;
      }

      return (
        String(item.name || "").toLowerCase().includes(searchTerm) ||
        String(item.phone || "").toLowerCase().includes(searchTerm) ||
        String(item.code || "").toLowerCase().includes(searchTerm) ||
        String(item.id || "").toLowerCase().includes(searchTerm)
      );
    });
  }

  function getAudienceEstimateStats() {
    const excludedDigits = getExcludedPhoneDigitsSet();

    if (state.source === "numbers") {
      const manualRecipients = window.WAFileTools.manualTextToRecipients(elements.numbersInput.value)
        .map(function (recipient) {
          return window.WAFileTools.toDirectRecipient(recipient.phone);
        })
        .filter(Boolean);
      const importedRecipients = state.importedRecipients
        .map(function (recipient) {
          return window.WAFileTools.toDirectRecipient(recipient.phone);
        })
        .filter(Boolean);
      const uniqueRecipients = dedupeRecipientsByChatId(importedRecipients.concat(manualRecipients))
        .filter(function (recipient) {
          const digits = String(recipient.phoneDigits || recipient.phone || "").replace(/\D/g, "");
          return !excludedDigits.has(digits);
        });

      return {
        breakdown: uniqueRecipients.length
          ? uniqueRecipients.length + " direct recipients are ready from manual and imported numbers."
          : "No direct recipients are ready yet.",
        estimate: uniqueRecipients.length,
        groupMembers: 0,
        selectedCount: uniqueRecipients.length,
        visibleCount: uniqueRecipients.length
      };
    }

    const selectedItems = getSelectedDiscoveryItems(state.source);
    const visibleCount = getFilteredDiscoveryItems().length;

    if (!selectedItems.length) {
      return {
        breakdown: "Select audience items to see a better breakdown here.",
        estimate: 0,
        groupMembers: 0,
        selectedCount: 0,
        visibleCount: visibleCount
      };
    }

    if (state.source === "chats" || state.source === "contacts") {
      return {
        breakdown: selectedItems.length + " direct WhatsApp recipients are selected from " + state.source + ".",
        estimate: selectedItems.length,
        groupMembers: 0,
        selectedCount: selectedItems.length,
        visibleCount: visibleCount
      };
    }

    if (state.source === "groups") {
      const memberTotal = selectedItems.reduce(function (sum, item) {
        return sum + Number(item.participantCount || 0);
      }, 0);
      return {
        breakdown:
          selectedItems.length +
          " groups selected with about " +
          memberTotal +
          " members before expansion and de-duplication.",
        estimate: memberTotal,
        groupMembers: memberTotal,
        selectedCount: selectedItems.length,
        visibleCount: visibleCount
      };
    }

    const aggregateCount = selectedItems.reduce(function (sum, item) {
      return sum + Number(item.count || 0);
    }, 0);

    return {
      breakdown:
        selectedItems.length +
        " " +
        state.source +
        " selected with about " +
        aggregateCount +
        " matching recipients before de-duplication.",
      estimate: aggregateCount,
      groupMembers: 0,
      selectedCount: selectedItems.length,
      visibleCount: visibleCount
    };
  }

  function describeSelectionItem(item) {
    if (state.source === "chats") {
      return [item.phone || "No phone", item.unreadCount ? item.unreadCount + " unread" : ""]
        .filter(Boolean)
        .join(" • ");
    }

    if (state.source === "contacts") {
      return [item.phone || "No phone", item.isBusiness ? "Business" : ""]
        .filter(Boolean)
        .join(" • ");
    }

    if (state.source === "groups") {
      return [
        item.participantCount ? item.participantCount + " members" : "",
        "messages go to members directly"
      ]
        .filter(Boolean)
        .join(" • ");
    }

    if (state.source === "labels") {
      return [item.count ? item.count + " tagged chats" : "", item.hexColor || ""]
        .filter(Boolean)
        .join(" • ");
    }

    if (state.source === "countries") {
      return ["+" + item.code, item.count + " matching contacts/chats"].join(" • ");
    }

    return "";
  }

  function renderAudienceSummary() {
    const labels = {
      chats: "Recent WhatsApp chats",
      contacts: "Saved WhatsApp contacts",
      countries: "Recipients filtered by dial code",
      groups: "Group members from selected groups",
      labels: "Business labels",
      numbers: "Manual or imported numbers"
    };
    elements.audienceSummary.textContent = labels[state.source];
  }

  function getPreviewRecipient() {
    if (state.importedRecipients.length) {
      return state.importedRecipients[0];
    }

    const manualRecipients = window.WAFileTools.manualTextToRecipients(elements.numbersInput.value);
    if (manualRecipients.length) {
      return manualRecipients[0];
    }

    const selectedItems = state.source === "numbers" ? [] : getSelectedDiscoveryItems(state.source);
    if (selectedItems.length) {
      const firstItem = selectedItems[0];
      return {
        fields: {
          Name: firstItem.name || "",
          "WhatsApp Number": firstItem.phone || "",
          Group: firstItem.name || ""
        },
        name: firstItem.name || "Selected Recipient",
        phone: firstItem.phone || "+15551234567"
      };
    }

    return {
      fields: {
        CustomField: "Spring Offer",
        FirstName: "Alex",
        Name: "Alex Rivera",
        "WhatsApp Number": "+15551234567"
      },
      name: "Alex Rivera",
      phone: "+15551234567"
    };
  }

  function renderLoadedDataInsights() {
    setText(elements.loadedChatsCount, String((state.discovery.chats || []).length));
    setText(elements.loadedContactsCount, String((state.discovery.contacts || []).length));
    setText(elements.loadedGroupsCount, String((state.discovery.groups || []).length));
    setText(elements.loadedLabelsCount, String((state.discovery.labels || []).length));
    setText(elements.loadedCountriesCount, String((state.discovery.countries || []).length));
  }

  function renderSelectionInsights() {
    const stats = getAudienceEstimateStats();
    setText(elements.selectedSourceCount, String(stats.selectedCount));
    setText(elements.selectedEstimateCount, String(stats.estimate));
    setText(elements.selectedGroupMembersCount, String(stats.groupMembers));
    setText(elements.selectedSearchCount, String(stats.visibleCount));
    setText(elements.selectionBreakdown, stats.breakdown);
  }

  function renderMessageInsights() {
    const messageTemplate = String(elements.messageInput.value || "");
    const previewRecipient = getPreviewRecipient();
    const previewText = window.WAFileTools.renderMessage(
      messageTemplate,
      previewRecipient,
      elements.timestampCheckbox.checked
    );
    const lineCount = messageTemplate ? messageTemplate.split(/\r?\n/).length : 0;

    setText(elements.messageCharCount, String(messageTemplate.length));
    setText(elements.messageLineCount, String(lineCount));
    setText(elements.composeVariableCount, String(state.importedVariables.length));
    setText(elements.composeAttachmentCount, String(state.attachments.length));
    setText(
      elements.previewRecipientLabel,
      previewRecipient.name
        ? "Preview using " + previewRecipient.name + "."
        : "Preview using sample data."
    );
    setText(
      elements.previewText,
      previewText || "Your message preview will appear here."
    );
  }

  function renderOverviewCards() {
    const waReady = state.waStatus && state.waStatus.wppReady && state.waStatus.authenticated;
    const audienceStats = getAudienceEstimateStats();
    const messageLength = String(elements.messageInput.value || "").trim().length;
    const attachmentCount = state.attachments.length;
    const excludedCount = getExcludedRecipients().length;
    const runtimeStatus = state.runtimeState && state.runtimeState.status ? state.runtimeState.status : "idle";
    const risk = renderRestrictionRiskGauge();

    setText(
      elements.overviewConnectionStatus,
      waReady ? "WhatsApp is ready" : "Waiting for login"
    );
    setText(
      elements.overviewAudienceStatus,
      audienceStats.estimate
        ? audienceStats.estimate + " recipients ready" + (excludedCount ? ", " + excludedCount + " excluded" : "")
        : "No recipients ready"
    );
    setText(
      elements.overviewComposeStatus,
      messageLength || attachmentCount
        ? messageLength + " chars, " + attachmentCount + " files"
        : "Message not ready"
    );
    setText(elements.overviewRunStatus, capitalize(runtimeStatus) + " • " + risk.percent + "% risk");
  }

  function renderPreflightSummary() {
    const waReady = state.waStatus && state.waStatus.wppReady && state.waStatus.authenticated;
    const audienceStats = getAudienceEstimateStats();
    const messageLength = String(elements.messageInput.value || "").trim().length;
    const attachmentCount = state.attachments.length;
    const excludedCount = getExcludedRecipients().length;
    const preflightRecipients = getPreflightRecipientCandidates();
    const report = buildSafetyReport(
      preflightRecipients,
      collectSettings(),
      elements.messageInput.value || "",
      state.attachments,
      { recipientEstimate: audienceStats.estimate }
    );
    const risk = renderRestrictionRiskGauge();
    const riskNotes = report.blockers.concat(report.warnings);

    setText(
      elements.preflightConnection,
      waReady ? "Connected and authenticated" : "Open WhatsApp Web and log in"
    );
    setText(
      elements.preflightAudience,
      audienceStats.estimate
        ? audienceStats.estimate + " recipients ready"
        : "No recipients selected"
    );
    setText(
      elements.preflightMessage,
      messageLength
        ? messageLength + " characters prepared"
        : "No message yet"
    );
    setText(
      elements.preflightAttachments,
      attachmentCount
        ? attachmentCount + " file(s) attached"
        : "No attachments"
    );
    setText(elements.preflightSource, capitalize(state.source));
    setText(elements.preflightEstimate, audienceStats.estimate + " recipients");
    setText(elements.preflightExclusions, excludedCount + " numbers");
    setText(elements.preflightConsent, report.consentText);
    setText(elements.preflightDailyCap, report.dailyCapText);
    setText(elements.preflightRisk, risk.percent + "% • " + risk.label);
    setText(
      elements.feedbackSummary,
      "Known blocks: " +
        Number(collectSettings().manualKnownBlocks || 0) +
        " • Known reports: " +
        Number(collectSettings().manualKnownReports || 0) +
        ". Enter your own counts here because WhatsApp Web does not expose them."
    );
    setText(
      elements.safetySummary,
      report.dailyCapText +
        ". " +
        report.consentText +
        ". Estimated restriction risk: " +
        risk.percent +
        "%." +
        (report.preparation.summary.excludedByNegativeConsent
          ? ". " + report.preparation.summary.excludedByNegativeConsent + " opted-out recipient(s) will be skipped."
          : "")
    );
    setText(
      elements.preflightRiskNotes,
      riskNotes.length
        ? riskNotes[0]
        : (risk.topReasons[0] || "This setup looks conservative. Keep lists small, recent, and clearly opted in.")
    );
    elements.preflightRiskNotes.className =
      "summary " +
      (report.blockers.length || risk.percent >= 65
        ? "summary--danger"
        : risk.percent >= 40
        ? "summary--warning"
        : "summary--muted");
  }

  function renderResultsSummary(runtimeState) {
    const progress = runtimeState && runtimeState.progress ? runtimeState.progress : {};
    const completed = Number(progress.completed || 0);
    const successCount = Number(progress.successCount || 0);
    const results = Array.isArray(progress.results) ? progress.results : [];
    const lastFailed = results.slice().reverse().find(function (item) {
      return item && item.status === "failed";
    });
    const rate = completed ? Math.round((successCount / completed) * 100) : 0;

    setText(
      elements.resultsStatusSummary,
      capitalize((runtimeState && runtimeState.status) || "idle")
    );
    setText(elements.resultsSuccessRate, rate + "%");
    setText(
      elements.resultsLastError,
      lastFailed && lastFailed.error ? lastFailed.error : "No failures logged."
    );
  }

  function renderAudienceEstimate() {
    const stats = getAudienceEstimateStats();
    elements.estimatedRecipients.textContent =
      stats.estimate
        ? "Estimated " + stats.estimate + " recipients after expansion and de-duplication."
        : "No audience selected yet.";
  }

  function renderDiscoveryList() {
    const items = getCurrentDiscoveryItems();
    const selectionSet = getSelectionSet(state.source);

    elements.discoveryList.innerHTML = "";
    elements.includeAdminsRow.classList.toggle("hidden", state.source !== "groups");

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent =
        state.source === "numbers"
          ? ""
          : "No items loaded for this audience yet. Refresh WhatsApp data first.";
      elements.discoveryList.appendChild(empty);
      elements.selectionSummary.textContent = "Refresh WhatsApp data to load this audience list.";
      renderAudienceEstimate();
      renderSelectionInsights();
      return;
    }

    const filteredItems = getFilteredDiscoveryItems();

    if (!filteredItems.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "No audience items match your search.";
      elements.discoveryList.appendChild(empty);
      const filteredStats = getAudienceEstimateStats();
      elements.selectionSummary.textContent =
        selectionSet.size +
        " selected across " +
        items.length +
        " available items. " +
        (filteredStats.groupMembers
          ? filteredStats.groupMembers + " group members are represented."
          : "");
      renderAudienceEstimate();
      renderSelectionInsights();
      return;
    }

    const template = document.getElementById("selection-item-template");

    filteredItems.forEach(function (item) {
      const fragment = template.content.cloneNode(true);
      const checkbox = fragment.querySelector(".selection-item__checkbox");
      const title = fragment.querySelector(".selection-item__title");
      const meta = fragment.querySelector(".selection-item__meta");

      checkbox.dataset.id = item.id;
      checkbox.checked = selectionSet.has(item.id);
      title.textContent = item.name;
      meta.textContent = describeSelectionItem(item);
      elements.discoveryList.appendChild(fragment);
    });

    const selectionStats = getAudienceEstimateStats();
    elements.selectionSummary.textContent =
      selectionSet.size +
      " selected across " +
      items.length +
      " available items." +
      (selectionStats.groupMembers
        ? " Selected groups contain about " + selectionStats.groupMembers + " members."
        : "");
    renderAudienceEstimate();
    renderSelectionInsights();
  }

  function renderSourceState() {
    elements.numbersPanel.classList.toggle("hidden", state.source !== "numbers");
    elements.discoveryPanel.classList.toggle("hidden", state.source === "numbers");

    elements.sourceTabs.forEach(function (button) {
      button.classList.toggle("source-tab--active", button.dataset.sourceTab === state.source);
    });

    renderAudienceSummary();
    renderLoadedDataInsights();
    renderSelectionInsights();
    if (state.source !== "numbers") {
      renderDiscoveryList();
      renderOverviewCards();
      renderPreflightSummary();
      return;
    }

    renderAudienceEstimate();
    renderOverviewCards();
    renderPreflightSummary();
  }

  function setButtonStates(runtimeState) {
    const status = runtimeState && runtimeState.status ? runtimeState.status : "idle";
    const isRunning = status === "running";
    const isPaused = status === "paused";

    elements.startBtn.disabled = isRunning || isPaused;
    elements.pauseBtn.disabled = !isRunning;
    elements.resumeBtn.disabled = !isPaused;
    elements.stopBtn.disabled = !(isRunning || isPaused);
  }

  function renderResults(runtimeState) {
    const results = runtimeState && runtimeState.progress ? runtimeState.progress.results || [] : [];
    elements.resultsList.innerHTML = "";

    if (!results.length) {
      const muted = document.createElement("div");
      muted.className = "muted";
      muted.textContent = "No results yet.";
      elements.resultsList.appendChild(muted);
      return;
    }

    const template = document.getElementById("result-item-template");
    results.slice().reverse().slice(0, 80).forEach(function (result) {
      const fragment = template.content.cloneNode(true);
      fragment.querySelector(".result-item__phone").textContent = result.phone || result.name || "Unknown";
      fragment.querySelector(".result-item__status").textContent = result.status || "unknown";
      fragment.querySelector(".result-item__status").style.color =
        result.status === "success" ? "#136757" : "#a83f2c";
      fragment.querySelector(".result-item__meta").textContent =
        [result.name, result.source, result.error || ("Sent at " + (result.sentAt || "unknown time"))]
          .filter(Boolean)
          .join(" • ");
      elements.resultsList.appendChild(fragment);
    });
  }

  function renderRuntimeState(runtimeState) {
    state.runtimeState = runtimeState;
    const progress = runtimeState && runtimeState.progress ? runtimeState.progress : {};
    const total = progress.total || 0;
    const completed = progress.completed || 0;
    const successCount = progress.successCount || 0;
    const failureCount = progress.failureCount || 0;
    const percentage = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;

    renderStatusBadge(runtimeState ? runtimeState.status : "idle");
    setButtonStates(runtimeState);
    renderResults(runtimeState);
    renderResultsSummary(runtimeState);

    elements.totalCount.textContent = String(total);
    elements.doneCount.textContent = String(completed);
    elements.successCount.textContent = String(successCount);
    elements.failureCount.textContent = String(failureCount);
    elements.progressFill.style.width = percentage + "%";

    if (progress.activePhone) {
      elements.activeRecipient.textContent = "Sending to " + progress.activePhone;
    } else if (runtimeState && runtimeState.lastError) {
      elements.activeRecipient.textContent = runtimeState.lastError;
    } else if (runtimeState && runtimeState.status === "finished") {
      elements.activeRecipient.textContent = "Job finished. Export the result log below.";
    } else if (runtimeState && runtimeState.status === "paused") {
      elements.activeRecipient.textContent = "Job paused. Resume whenever you're ready.";
    } else if (runtimeState && runtimeState.status === "stopped") {
      elements.activeRecipient.textContent = "Job stopped.";
    } else {
      elements.activeRecipient.textContent = "No job running.";
    }

    const hintMap = {
      error: "Something went wrong while sending. Check the result log for details.",
      finished: "Finished. Export the result CSV or start another run.",
      idle: "Ready when you are.",
      paused: "Paused. WhatsApp keeps the current job state in the active tab.",
      running: "Keep WhatsApp Web open and logged in while the run continues.",
      stopped: "Stopped. You can clear the log or start a fresh job."
    };
    setRunHint(hintMap[(runtimeState && runtimeState.status) || "idle"]);

    if (runtimeState && runtimeState.status === "running") {
      setActivePage("campaign");
    } else if (runtimeState && (runtimeState.status === "finished" || runtimeState.status === "error")) {
      setActivePage("results");
    }

    renderOverviewCards();
  }

  function collectSettings() {
    const minDelay = Math.max(1, Number(elements.minDelayInput.value || 1));
    const maxDelay = Math.max(minDelay, Number(elements.maxDelayInput.value || minDelay));
    const batchSize = Math.min(50, Math.max(0, Number(elements.batchSizeInput.value || 0)));
    const batchPause = Math.max(0, Number(elements.batchPauseInput.value || 0));
    const maxRecipients = Math.min(250, Math.max(1, Number(elements.maxRecipientsInput.value || 1)));
    const stopAfterFailures = Math.min(20, Math.max(0, Number(elements.stopAfterFailuresInput.value || 0)));
    const dailySendCap = Math.min(300, Math.max(1, Number(elements.dailySendCapInput.value || 1)));
    const manualKnownBlocks = clamp(Math.max(0, Number(elements.knownBlocksInput.value || 0)), 0, 50);
    const manualKnownReports = clamp(Math.max(0, Number(elements.knownReportsInput.value || 0)), 0, 50);
    const stopAfterConsecutiveFailures = Math.min(
      10,
      Math.max(
        0,
        Number(elements.stopAfterConsecutiveFailuresInput.value || 0)
      )
    );
    const failureRateThresholdPercent = Math.min(
      100,
      Math.max(0, Number(elements.failureRateThresholdInput.value || 0))
    );
    const failureRateMinSample = Math.min(50, Math.max(1, Number(elements.failureRateMinSampleInput.value || 1)));

    return {
      batchPauseSeconds: batchPause,
      batchSize: batchSize,
      dailySendCap: dailySendCap,
      delayMaxSeconds: maxDelay,
      delayMinSeconds: minDelay,
      failureRateMinSample: failureRateMinSample,
      failureRateThresholdPercent: failureRateThresholdPercent,
      includeTimestamp: elements.timestampCheckbox.checked,
      manualKnownBlocks: manualKnownBlocks,
      manualKnownReports: manualKnownReports,
      maxRecipientsPerRun: maxRecipients,
      requirePositiveConsentData: elements.positiveConsentOnlyCheckbox.checked,
      sendAudioAsVoiceNote: elements.voiceNoteCheckbox.checked,
      stopAfterConsecutiveFailures: stopAfterConsecutiveFailures,
      stopAfterFailures: stopAfterFailures,
      warmupProfile: elements.warmupProfileSelect.value || "custom",
      useCaptionOnFirstAttachment: elements.attachmentCaptionCheckbox.checked
    };
  }

  function mapDiscoveryItemsToRecipients(items, source) {
    return dedupeRecipientsByChatId(
      (items || []).map(function (item) {
        return {
          chatId: item.id,
          fields: {
            Name: item.name
          },
          name: item.name,
          phone: item.phone || "",
          source: source
        };
      })
    );
  }

  function getSelectedDiscoveryItems(source) {
    const selectionSet = getSelectionSet(source);
    const items = source === "chats"
      ? state.discovery.chats
      : source === "contacts"
      ? state.discovery.contacts
      : source === "groups"
      ? state.discovery.groups
      : source === "labels"
      ? state.discovery.labels
      : state.discovery.countries;

    return (items || []).filter(function (item) {
      return selectionSet.has(item.id);
    });
  }

  async function resolveRecipientsForCurrentSource() {
    if (state.source === "numbers") {
      const manualRecipients = window.WAFileTools.manualTextToRecipients(elements.numbersInput.value)
        .map(function (recipient) {
          return window.WAFileTools.toDirectRecipient(recipient.phone, {
            fields: recipient.fields,
            name: recipient.name,
            source: "numbers"
          });
        })
        .filter(Boolean);

      const importedRecipients = state.importedRecipients.map(function (recipient) {
        return window.WAFileTools.toDirectRecipient(recipient.phone, {
          fields: recipient.fields,
          name: recipient.name,
          source: "numbers"
        });
      }).filter(Boolean);

      return dedupeRecipientsByChatId([].concat(importedRecipients, manualRecipients));
    }

    if (state.source === "chats") {
      return mapDiscoveryItemsToRecipients(getSelectedDiscoveryItems("chats"), "chat");
    }

    if (state.source === "contacts") {
      return mapDiscoveryItemsToRecipients(getSelectedDiscoveryItems("contacts"), "contact");
    }

    if (state.source === "groups") {
      const groupIds = getSelectedDiscoveryItems("groups").map(function (item) {
        return item.id;
      });

      const response = await sendRuntimeMessage({
        type: "RESOLVE_TARGETS",
        payload: {
          groupIds: groupIds,
          includeAdmins: elements.includeAdminsCheckbox.checked,
          source: "groups"
        }
      });

      if (!response || !response.ok) {
        throw new Error((response && response.error) || "Could not expand selected groups.");
      }

      return dedupeRecipientsByChatId(response.recipients || []);
    }

    if (state.source === "labels") {
      const labelIds = getSelectedDiscoveryItems("labels").map(function (item) {
        return item.id;
      });

      const response = await sendRuntimeMessage({
        type: "RESOLVE_TARGETS",
        payload: {
          labelIds: labelIds,
          source: "labels"
        }
      });

      if (!response || !response.ok) {
        throw new Error((response && response.error) || "Could not resolve label recipients.");
      }

      return dedupeRecipientsByChatId(response.recipients || []);
    }

    if (state.source === "countries") {
      const countryCodes = getSelectedDiscoveryItems("countries").map(function (item) {
        return item.code;
      });

      const response = await sendRuntimeMessage({
        type: "RESOLVE_TARGETS",
        payload: {
          countryCodes: countryCodes,
          source: "countries"
        }
      });

      if (!response || !response.ok) {
        throw new Error((response && response.error) || "Could not resolve country recipients.");
      }

      return dedupeRecipientsByChatId(response.recipients || []);
    }

    return [];
  }

  function applyRecipientGuards(recipients, settings) {
    return prepareRecipientsForRun(recipients, settings).recipients;
  }

  async function startJob() {
    if (state.runtimeState && (state.runtimeState.status === "running" || state.runtimeState.status === "paused")) {
      setRunHint("Finish, pause, or stop the current campaign before starting another one.");
      setActivePage("campaign");
      return;
    }

    await refreshWaStatus();

    if (!state.waStatus || !state.waStatus.wppReady || !state.waStatus.authenticated) {
      setRunHint("Open WhatsApp Web and wait until it is logged in before starting a run.");
      setActivePage("home");
      return;
    }

    const settings = collectSettings();
    const resolvedRecipients = await resolveRecipientsForCurrentSource();
    const attachments = state.attachments.slice();
    const messageTemplate = elements.messageInput.value.trim();
    const safetyReport = buildSafetyReport(resolvedRecipients, settings, messageTemplate, attachments);
    const recipients = safetyReport.preparation.recipients;

    if (!elements.confirmOptInCheckbox.checked) {
      setRunHint("Confirm that all recipients opted in before starting a campaign.");
      setActivePage("campaign");
      return;
    }

    if (!recipients.length) {
      setRunHint("Add or select at least one recipient first.");
      return;
    }

    if (!messageTemplate && !attachments.length) {
      setRunHint("Add a message or at least one attachment before starting.");
      return;
    }

    if (safetyReport.blockers.length) {
      setRunHint(safetyReport.blockers[0]);
      setActivePage("campaign");
      return;
    }

    if (safetyReport.warnings.length) {
      setRunHint(safetyReport.warnings[0]);
    }

    const recentHistory = getRecentHistoryMetrics();
    const riskProfile = {
      attachmentCount: attachments.length,
      hasVariables: getMessageVariableCount(messageTemplate) > 0,
      historyFailureRate: recentHistory.completed ? (recentHistory.failures / recentHistory.completed) * 100 : 0,
      plannedRecipients: safetyReport.preparation.summary.finalCount,
      positiveConsentCount: safetyReport.preparation.summary.positiveConsentCount,
      todayCountAtStart: safetyReport.preparation.summary.todayCount,
      unknownConsentCount: safetyReport.preparation.summary.unknownConsentCount,
      urlCount: getMessageUrlCount(messageTemplate)
    };
    const liveRisk = estimateRestrictionRisk({
      attachmentCount: riskProfile.attachmentCount,
      completed: 0,
      consecutiveFailures: 0,
      failures: 0,
      hasVariables: riskProfile.hasVariables,
      historyFailureRate: riskProfile.historyFailureRate,
      plannedRecipients: riskProfile.plannedRecipients,
      positiveConsentCount: riskProfile.positiveConsentCount,
      settings: settings,
      todayCount: riskProfile.todayCountAtStart,
      unknownConsentCount: riskProfile.unknownConsentCount,
      urlCount: riskProfile.urlCount
    });
    riskProfile.initialPercent = liveRisk.percent;
    riskProfile.initialLabel = liveRisk.label;
    riskProfile.initialTopReasons = liveRisk.topReasons;

    const job = {
      attachments: attachments,
      campaignName: String(elements.campaignNameInput.value || "").trim(),
      createdAt: new Date().toISOString(),
      id: "job_" + Date.now(),
      messageTemplate: messageTemplate,
      recipients: recipients,
      riskProfile: riskProfile,
      settings: settings,
      source: state.source
    };

    const response = await sendRuntimeMessage({
      type: "START_JOB",
      job: job
    });

    if (!response || !response.ok) {
      throw new Error((response && response.error) || "Could not start the campaign.");
    }

    if (response && response.state) {
      renderRuntimeState(response.state);
    }
  }

  async function controlJob(status) {
    const response = await sendRuntimeMessage({
      type: "CONTROL_JOB",
      status: status
    });
    if (response && response.state) {
      renderRuntimeState(response.state);
    }
  }

  async function handleRecipientFileChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      const parsed = await window.WAFileTools.parseRecipientsFile(file);
      state.importedRecipients = window.WAFileTools.dedupeRecipients(parsed.recipients || []);
      state.importedVariables = parsed.variables || [];
      renderVariables();
      renderRecipientSummary();
      renderAudienceEstimate();
      setRunHint("Imported " + state.importedRecipients.length + " recipients from " + file.name + ".");
    } catch (error) {
      state.importedRecipients = [];
      state.importedVariables = [];
      renderVariables();
      renderRecipientSummary();
      renderAudienceEstimate();
      setRunHint(error instanceof Error ? error.message : "Could not parse the imported file.");
    }
  }

  async function handleAttachmentChange(event) {
    const files = Array.from(event.target.files || []);
    state.attachments = await Promise.all(
      files.map(async function (file) {
        return {
          dataUrl: await readFileAsDataUrl(file),
          isPtt: false,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream"
        };
      })
    );
    renderAttachments();
  }

  function clearAttachments() {
    state.attachments = [];
    elements.attachmentInput.value = "";
    renderAttachments();
    setRunHint("Cleared selected attachments.");
  }

  function clearManualNumbers() {
    elements.numbersInput.value = "";
    renderRecipientSummary();
    renderAudienceEstimate();
    setRunHint("Cleared the manual number list.");
  }

  function applyWarmupProfile(profile) {
    if (profile === "careful") {
      elements.minDelayInput.value = "15";
      elements.maxDelayInput.value = "30";
      elements.batchSizeInput.value = "5";
      elements.batchPauseInput.value = "240";
      elements.maxRecipientsInput.value = "20";
      elements.dailySendCapInput.value = "40";
      elements.stopAfterFailuresInput.value = "3";
      elements.stopAfterConsecutiveFailuresInput.value = "2";
      elements.failureRateThresholdInput.value = "25";
      elements.failureRateMinSampleInput.value = "8";
      setRunHint("Applied the Careful warm-up profile.");
      return;
    }

    if (profile === "balanced") {
      elements.minDelayInput.value = "10";
      elements.maxDelayInput.value = "18";
      elements.batchSizeInput.value = "8";
      elements.batchPauseInput.value = "180";
      elements.maxRecipientsInput.value = "35";
      elements.dailySendCapInput.value = "75";
      elements.stopAfterFailuresInput.value = "4";
      elements.stopAfterConsecutiveFailuresInput.value = "2";
      elements.failureRateThresholdInput.value = "30";
      elements.failureRateMinSampleInput.value = "10";
      setRunHint("Applied the Balanced warm-up profile.");
      return;
    }

    setRunHint("Custom timing profile selected.");
  }

  async function saveAudiencePreset() {
    const defaultName = "Audience " + (state.audiencePresets.length + 1);
    const name = String(elements.audiencePresetNameInput.value || "").trim() || defaultName;

    const preset = {
      createdAt: new Date().toISOString(),
      excludeNumbersText: elements.excludeNumbersInput.value || "",
      id: "aud_" + Date.now(),
      importedRecipients: state.importedRecipients,
      importedVariables: state.importedVariables,
      includeAdmins: Boolean(elements.includeAdminsCheckbox.checked),
      manualNumbersText: elements.numbersInput.value || "",
      name: name,
      source: state.source,
      selections: snapshotSelections()
    };

    state.audiencePresets = [preset].concat(state.audiencePresets).slice(0, 25);
    await chrome.storage.local.set({ [AUDIENCE_PRESET_KEY]: state.audiencePresets });
    renderAudiencePresetSelect();
    elements.audiencePresetNameInput.value = "";
    elements.audiencePresetSelect.value = preset.id;
    setRunHint('Saved audience preset "' + name + '".');
  }

  function applyAudiencePreset(presetId) {
    if (!presetId) {
      setRunHint("Choose a saved audience preset first.");
      return;
    }

    const preset = state.audiencePresets.find(function (item) {
      return item.id === presetId;
    });

    if (!preset) {
      return;
    }

    elements.excludeNumbersInput.value = preset.excludeNumbersText || "";
    elements.audiencePresetNameInput.value = preset.name || "";
    elements.includeAdminsCheckbox.checked = Boolean(preset.includeAdmins);
    elements.numbersInput.value = preset.manualNumbersText || "";
    state.importedRecipients = Array.isArray(preset.importedRecipients) ? preset.importedRecipients : [];
    state.importedVariables = Array.isArray(preset.importedVariables) ? preset.importedVariables : [];
    restoreSelections(preset.selections);
    handleSourceChange(preset.source || "numbers");
    renderVariables();
    renderRecipientSummary();
    renderExcludeSummary();
    renderAudienceEstimate();
    renderSelectionInsights();
    setRunHint('Loaded audience preset "' + preset.name + '".');
  }

  async function deleteAudiencePreset() {
    const presetId = elements.audiencePresetSelect.value;
    if (!presetId) {
      setRunHint("Choose a saved audience preset first.");
      return;
    }

    const preset = state.audiencePresets.find(function (item) {
      return item.id === presetId;
    });
    state.audiencePresets = state.audiencePresets.filter(function (item) {
      return item.id !== presetId;
    });
    await chrome.storage.local.set({ [AUDIENCE_PRESET_KEY]: state.audiencePresets });
    renderAudiencePresetSelect();
    elements.audiencePresetSelect.value = "";
    setRunHint(
      preset ? 'Deleted audience preset "' + preset.name + '".' : "Deleted the audience preset."
    );
  }

  async function saveTemplate() {
    const messageTemplate = elements.messageInput.value.trim();
    if (!messageTemplate) {
      setRunHint("Write a template message before saving it.");
      return;
    }

    const defaultName = "Template " + (state.templates.length + 1);
    const name = window.prompt("Template name", defaultName);
    if (!name) {
      return;
    }

    const template = {
      id: "tpl_" + Date.now(),
      messageTemplate: messageTemplate,
      name: name,
      settings: collectSettings()
    };

    state.templates = [template].concat(state.templates);
    await chrome.storage.local.set({ [TEMPLATE_KEY]: state.templates });
    renderTemplateSelect();
    setRunHint('Saved template "' + name + '".');
  }

  function applyTemplate(templateId) {
    const template = state.templates.find(function (item) {
      return item.id === templateId;
    });

    if (!template) {
      return;
    }

    elements.messageInput.value = template.messageTemplate || "";
    elements.timestampCheckbox.checked = Boolean(template.settings && template.settings.includeTimestamp);
    elements.minDelayInput.value = String((template.settings && template.settings.delayMinSeconds) || 10);
    elements.maxDelayInput.value = String((template.settings && template.settings.delayMaxSeconds) || 18);
    elements.batchSizeInput.value = String((template.settings && template.settings.batchSize) || 8);
    elements.batchPauseInput.value = String((template.settings && template.settings.batchPauseSeconds) || 180);
    elements.maxRecipientsInput.value = String((template.settings && template.settings.maxRecipientsPerRun) || 30);
    elements.dailySendCapInput.value = String((template.settings && template.settings.dailySendCap) || 60);
    elements.knownBlocksInput.value = String((template.settings && template.settings.manualKnownBlocks) || 0);
    elements.knownReportsInput.value = String((template.settings && template.settings.manualKnownReports) || 0);
    elements.stopAfterFailuresInput.value = String((template.settings && template.settings.stopAfterFailures) || 4);
    elements.stopAfterConsecutiveFailuresInput.value = String(
      (template.settings && template.settings.stopAfterConsecutiveFailures) || 2
    );
    elements.failureRateThresholdInput.value = String(
      (template.settings && template.settings.failureRateThresholdPercent) || 30
    );
    elements.failureRateMinSampleInput.value = String(
      (template.settings && template.settings.failureRateMinSample) || 8
    );
    elements.warmupProfileSelect.value = (template.settings && template.settings.warmupProfile) || "custom";
    elements.attachmentCaptionCheckbox.checked = Boolean(
      !template.settings || template.settings.useCaptionOnFirstAttachment !== false
    );
    elements.voiceNoteCheckbox.checked = Boolean(template.settings && template.settings.sendAudioAsVoiceNote);
    elements.positiveConsentOnlyCheckbox.checked = Boolean(
      template.settings && template.settings.requirePositiveConsentData
    );
    setRunHint('Loaded template "' + template.name + '".');
    renderMessageInsights();
    renderPreflightSummary();
    renderOverviewCards();
  }

  async function openWhatsApp() {
    await sendRuntimeMessage({ type: "OPEN_WHATSAPP" });
    setRunHint("WhatsApp Web opened in a browser tab.");
  }

  function downloadResults() {
    const results = state.runtimeState && state.runtimeState.progress ? state.runtimeState.progress.results || [] : [];
    if (!results.length) {
      setRunHint("There are no results to export yet.");
      return;
    }
    const csv = window.WAFileTools.resultsToCsv(results);
    window.WAFileTools.downloadTextFile("wa-bulk-results.csv", csv, "text/csv;charset=utf-8");
  }

  function downloadFailedResults() {
    const results = state.runtimeState && state.runtimeState.progress ? state.runtimeState.progress.results || [] : [];
    const failed = results.filter(function (item) {
      return item && item.status === "failed";
    });

    if (!failed.length) {
      setRunHint("There are no failed results to export.");
      return;
    }

    const csv = window.WAFileTools.resultsToCsv(failed);
    window.WAFileTools.downloadTextFile("wa-bulk-failed-results.csv", csv, "text/csv;charset=utf-8");
  }

  function loadFailedAsAudience() {
    const results = state.runtimeState && state.runtimeState.progress ? state.runtimeState.progress.results || [] : [];
    const failedRecipients = window.WAFileTools.dedupeRecipients(
      results
        .filter(function (item) {
          return item && item.status === "failed" && item.phone;
        })
        .map(function (item) {
          return {
            fields: {
              Name: item.name || "",
              "WhatsApp Number": item.phone || ""
            },
            name: item.name || "",
            phone: item.phone || ""
          };
        })
    );

    if (!failedRecipients.length) {
      setRunHint("There are no failed recipients to load.");
      return;
    }

    state.source = "numbers";
    state.importedRecipients = failedRecipients;
    state.importedVariables = ["Name"];
    elements.numbersInput.value = "";
    renderVariables();
    renderRecipientSummary();
    renderAudienceEstimate();
    renderSelectionInsights();
    renderSourceState();
    setActivePage("audience");
    setRunHint("Loaded failed recipients back into the Numbers audience for review.");
  }

  async function clearResults() {
    if (state.runtimeState && (state.runtimeState.status === "running" || state.runtimeState.status === "paused")) {
      setRunHint("Stop the current run before clearing the result log.");
      return;
    }

    const response = await sendRuntimeMessage({ type: "RESET_JOB" });
    if (response && response.state) {
      renderRuntimeState(response.state);
    }
  }

  async function loadRuntimeState() {
    const response = await sendRuntimeMessage({ type: "GET_STATE" });
    renderRuntimeState(response && response.state ? response.state : null);
  }

  async function refreshWaStatus() {
    const response = await sendRuntimeMessage({ type: "GET_WA_STATUS" });
    if (response && response.ok && response.status) {
      state.waStatus = response.status;
      renderConnectionStatus();
      return;
    }

    state.waStatus = {
      authenticated: false,
      stream: null,
      wppReady: false
    };
    renderConnectionStatus();
  }

  async function refreshDiscovery() {
    setRunHint("Loading WhatsApp chats, contacts, groups, labels, and countries...");
    const response = await sendRuntimeMessage({ type: "GET_DISCOVERY_DATA" });

    if (!response || !response.ok || !response.discovery) {
      throw new Error((response && response.error) || "Could not load WhatsApp discovery data.");
    }

    state.discovery = {
      chats: response.discovery.chats || [],
      contacts: response.discovery.contacts || [],
      countries: state.discovery.countries,
      groups: response.discovery.groups || [],
      labels: response.discovery.labels || [],
      refreshedAt: response.discovery.refreshedAt || "",
      status: response.discovery.status || null
    };

    if (response.discovery.status) {
      state.waStatus = response.discovery.status;
    }

    deriveCountries();
    renderConnectionStatus();
    renderLoadedDataInsights();
    renderSelectionInsights();
    renderDiscoveryList();
    renderOverviewCards();
    renderPreflightSummary();
    setRunHint(
      "Loaded " +
        state.discovery.chats.length +
        " chats, " +
        state.discovery.contacts.length +
        " contacts, " +
        state.discovery.groups.length +
        " groups, and " +
        state.discovery.labels.length +
        " labels."
    );
  }

  function handleSourceChange(source) {
    state.source = source;
    state.searchTerm = "";
    elements.discoverySearchInput.value = "";
    renderSourceState();
  }

  function selectVisibleDiscoveryItems() {
    if (state.source === "numbers") {
      return;
    }

    const selectionSet = getSelectionSet(state.source);
    getFilteredDiscoveryItems().forEach(function (item) {
      selectionSet.add(item.id);
    });
    renderDiscoveryList();
  }

  function clearSelectionForCurrentSource() {
    if (state.source === "numbers") {
      return;
    }

    getSelectionSet(state.source).clear();
    renderDiscoveryList();
  }

  function toggleSelection(source, id, checked) {
    const selectionSet = getSelectionSet(source);
    if (!selectionSet) {
      return;
    }

    if (checked) {
      selectionSet.add(id);
    } else {
      selectionSet.delete(id);
    }

    renderDiscoveryList();
  }

  function bindEvents() {
    elements.attachmentInput.addEventListener("change", handleAttachmentChange);
    elements.attachmentCaptionCheckbox.addEventListener("change", function () {
      setRunHint(
        elements.attachmentCaptionCheckbox.checked
          ? "The first attachment will carry the message as its caption when supported."
          : "Text will be sent separately from attachments."
      );
    });
    elements.clearAttachmentsBtn.addEventListener("click", clearAttachments);
    elements.clearManualNumbersBtn.addEventListener("click", clearManualNumbers);
    elements.clearResultsBtn.addEventListener("click", clearResults);
    elements.clearSelectionBtn.addEventListener("click", clearSelectionForCurrentSource);
    elements.campaignNameInput.addEventListener("input", function () {
      renderPreflightSummary();
      renderOverviewCards();
    });
    elements.confirmOptInCheckbox.addEventListener("change", function () {
      renderPreflightSummary();
      renderOverviewCards();
    });
    elements.dailySendCapInput.addEventListener("input", renderPreflightSummary);
    elements.discoveryList.addEventListener("change", function (event) {
      if (!event.target.classList.contains("selection-item__checkbox")) {
        return;
      }
      toggleSelection(state.source, event.target.dataset.id, event.target.checked);
    });
    elements.discoverySearchInput.addEventListener("input", function (event) {
      state.searchTerm = event.target.value || "";
      renderDiscoveryList();
    });
    elements.includeAdminsCheckbox.addEventListener("change", renderAudienceEstimate);
    elements.downloadFailedBtn.addEventListener("click", downloadFailedResults);
    elements.downloadResultsBtn.addEventListener("click", downloadResults);
    elements.downloadTemplateBtn.addEventListener("click", function () {
      window.WAFileTools.downloadTemplate();
    });
    elements.excludeNumbersInput.addEventListener("input", function () {
      renderExcludeSummary();
      renderAudienceEstimate();
      renderSelectionInsights();
    });
    elements.loadAudiencePresetBtn.addEventListener("click", function () {
      applyAudiencePreset(elements.audiencePresetSelect.value);
    });
    elements.messageInput.addEventListener("input", function () {
      renderMessageInsights();
      renderPreflightSummary();
      renderOverviewCards();
    });
    elements.minDelayInput.addEventListener("input", renderPreflightSummary);
    elements.maxDelayInput.addEventListener("input", renderPreflightSummary);
    elements.batchSizeInput.addEventListener("input", renderPreflightSummary);
    elements.batchPauseInput.addEventListener("input", renderPreflightSummary);
    elements.knownBlocksInput.addEventListener("input", renderPreflightSummary);
    elements.knownReportsInput.addEventListener("input", renderPreflightSummary);
    elements.numbersInput.addEventListener("input", function () {
      renderRecipientSummary();
      renderAudienceEstimate();
      renderSelectionInsights();
      renderPreflightSummary();
    });
    elements.pageTabs.forEach(function (button) {
      button.addEventListener("click", function () {
        setActivePage(button.dataset.pageTab);
      });
    });
    elements.pasteMessageBtn.addEventListener("click", function () {
      pasteIntoField(elements.messageInput, "the message").catch(function (error) {
        setRunHint(error instanceof Error ? error.message : "Could not paste the message.");
      });
    });
    elements.pasteNumbersBtn.addEventListener("click", function () {
      pasteIntoField(elements.numbersInput, "numbers").catch(function (error) {
        setRunHint(error instanceof Error ? error.message : "Could not paste the number list.");
      });
    });
    elements.openWaBtn.addEventListener("click", function () {
      openWhatsApp().catch(function (error) {
        setRunHint(error instanceof Error ? error.message : "Could not open WhatsApp Web.");
      });
    });
    elements.pauseBtn.addEventListener("click", function () {
      controlJob("paused");
    });
    elements.recipientFileInput.addEventListener("change", handleRecipientFileChange);
    elements.refreshWaBtn.addEventListener("click", function () {
      refreshDiscovery().catch(function (error) {
        setRunHint(error instanceof Error ? error.message : "Could not refresh WhatsApp data.");
      });
    });
    elements.retryFailedBtn.addEventListener("click", loadFailedAsAudience);
    elements.resumeBtn.addEventListener("click", function () {
      controlJob("running");
    });
    elements.saveAudiencePresetBtn.addEventListener("click", function () {
      saveAudiencePreset().catch(function (error) {
        setRunHint(error instanceof Error ? error.message : "Could not save the audience preset.");
      });
    });
    elements.saveTemplateBtn.addEventListener("click", saveTemplate);
    elements.selectVisibleBtn.addEventListener("click", selectVisibleDiscoveryItems);
    elements.startBtn.addEventListener("click", function () {
      startJob().catch(function (error) {
        setRunHint(error instanceof Error ? error.message : "Could not start the job.");
      });
    });
    elements.stopBtn.addEventListener("click", function () {
      controlJob("stopped");
    });
    elements.deleteAudiencePresetBtn.addEventListener("click", function () {
      deleteAudiencePreset().catch(function (error) {
        setRunHint(error instanceof Error ? error.message : "Could not delete the audience preset.");
      });
    });
    elements.templateSelect.addEventListener("change", function (event) {
      applyTemplate(event.target.value);
    });
    elements.timestampCheckbox.addEventListener("change", function () {
      renderMessageInsights();
      renderPreflightSummary();
    });
    elements.voiceNoteCheckbox.addEventListener("change", renderPreflightSummary);
    elements.maxRecipientsInput.addEventListener("input", function () {
      renderPreflightSummary();
      renderOverviewCards();
    });
    elements.failureRateMinSampleInput.addEventListener("input", renderPreflightSummary);
    elements.failureRateThresholdInput.addEventListener("input", renderPreflightSummary);
    elements.positiveConsentOnlyCheckbox.addEventListener("change", renderPreflightSummary);
    elements.stopAfterConsecutiveFailuresInput.addEventListener("input", renderPreflightSummary);
    elements.stopAfterFailuresInput.addEventListener("input", renderPreflightSummary);
    elements.warmupProfileSelect.addEventListener("change", function () {
      applyWarmupProfile(elements.warmupProfileSelect.value);
      renderPreflightSummary();
      renderOverviewCards();
    });

    elements.sourceTabs.forEach(function (button) {
      button.addEventListener("click", function () {
        handleSourceChange(button.dataset.sourceTab);
      });
    });

    bindClipboardShortcut(elements.messageInput, "the message");
    bindClipboardShortcut(elements.numbersInput, "numbers");

    chrome.storage.onChanged.addListener(function (changes, areaName) {
      if (areaName !== "local") {
        return;
      }

      if (changes[STATE_KEY]) {
        renderRuntimeState(changes[STATE_KEY].newValue || null);
      }

      if (changes[TEMPLATE_KEY]) {
        state.templates = Array.isArray(changes[TEMPLATE_KEY].newValue)
          ? changes[TEMPLATE_KEY].newValue
          : [];
        renderTemplateSelect();
      }

      if (changes[AUDIENCE_PRESET_KEY]) {
        state.audiencePresets = Array.isArray(changes[AUDIENCE_PRESET_KEY].newValue)
          ? changes[AUDIENCE_PRESET_KEY].newValue
          : [];
        renderAudiencePresetSelect();
      }

      if (changes[CAMPAIGN_HISTORY_KEY]) {
        state.campaignHistory = Array.isArray(changes[CAMPAIGN_HISTORY_KEY].newValue)
          ? changes[CAMPAIGN_HISTORY_KEY].newValue
          : [];
        renderPreflightSummary();
      }
    });
  }

  async function init() {
    state.activePage = readFromStorage("wa_sender_active_page") || "home";
    bindEvents();
    renderAttachments();
    renderVariables();
    renderRecipientSummary();
    renderStatusBadge("idle");
    renderPageState();
    renderSourceState();
    renderMessageInsights();
    renderLoadedDataInsights();
    renderSelectionInsights();
    renderExcludeSummary();
    renderPreflightSummary();
    renderResultsSummary(null);
    renderOverviewCards();
    setButtonStates({ status: "idle" });
    setRunHint("Ready when you are.");
    await Promise.all([
      loadCampaignHistory(),
      loadCountryData(),
      loadTemplates(),
      loadAudiencePresets(),
      loadRuntimeState(),
      refreshWaStatus()
    ]);
    renderPreflightSummary();
    renderSourceState();
    if (state.waStatus && state.waStatus.wppReady && state.waStatus.authenticated) {
      refreshDiscovery().catch(function () {
        return null;
      });
    }
  }

  init().catch(function (error) {
    setRunHint(error instanceof Error ? error.message : "Extension popup failed to load.");
  });
})();
