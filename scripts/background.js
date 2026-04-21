(function () {
  const HISTORY_KEY = "wa_sender_campaign_history";
  const MAX_HISTORY_ITEMS = 80;
  const STATE_KEY = "wa_sender_state";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createEmptyProgress() {
    return {
      total: 0,
      completed: 0,
      consecutiveFailureCount: 0,
      successCount: 0,
      failureCount: 0,
      currentIndex: 0,
      activePhone: "",
      results: [],
      startedAt: null,
      finishedAt: null,
      lastUpdatedAt: null
    };
  }

  function createDefaultState() {
    return {
      historyRecorded: false,
      status: "idle",
      whatsappTabId: null,
      job: null,
      progress: createEmptyProgress(),
      lastError: "",
      updatedAt: Date.now()
    };
  }

  async function getStoredState() {
    const stored = await chrome.storage.local.get(STATE_KEY);
    return stored[STATE_KEY] ? stored[STATE_KEY] : createDefaultState();
  }

  async function saveState(nextState) {
    const state = {
      ...createDefaultState(),
      ...nextState,
      updatedAt: Date.now()
    };
    await chrome.storage.local.set({ [STATE_KEY]: state });
    return state;
  }

  async function appendCampaignHistory(state) {
    const jobId = state && state.job ? state.job.id : "";
    if (!jobId) {
      return;
    }

    const stored = await chrome.storage.local.get(HISTORY_KEY);
    const history = Array.isArray(stored[HISTORY_KEY]) ? stored[HISTORY_KEY] : [];

    if (history.some(function (entry) {
      return entry && entry.jobId === jobId;
    })) {
      return;
    }

    const progress = state.progress || createEmptyProgress();
    const entry = {
      campaignName: state.job && state.job.campaignName ? state.job.campaignName : "",
      completed: Number(progress.completed || 0),
      failureCount: Number(progress.failureCount || 0),
      finishedAt: progress.finishedAt || new Date().toISOString(),
      jobId: jobId,
      maxRecipientsPerRun: state.job && state.job.settings ? Number(state.job.settings.maxRecipientsPerRun || 0) : 0,
      source: state.job && state.job.source ? state.job.source : "",
      startedAt: progress.startedAt || new Date().toISOString(),
      status: state.status || "finished",
      successCount: Number(progress.successCount || 0),
      total: Number(progress.total || 0)
    };

    await chrome.storage.local.set({
      [HISTORY_KEY]: [entry].concat(history).slice(0, MAX_HISTORY_ITEMS)
    });
  }

  async function patchState(patch) {
    const current = await getStoredState();
    const next = {
      ...current
    };

    Object.keys(patch || {}).forEach(function (key) {
      if (typeof patch[key] !== "undefined" && key !== "progress") {
        next[key] = patch[key];
      }
    });

    if (typeof patch.progress !== "undefined") {
      next.progress = {
        ...current.progress,
        ...patch.progress
      };
    }

    return saveState(next);
  }

  async function ensureWhatsAppTab(options) {
    const settings = {
      createIfMissing: true,
      focus: false,
      ...options
    };

    const existingTabs = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
    let tab = existingTabs[0];

    if (!tab && settings.createIfMissing) {
      tab = await chrome.tabs.create({ url: "https://web.whatsapp.com/" });
    }

    if (!tab) {
      return null;
    }

    if (settings.focus) {
      await chrome.tabs.update(tab.id, { active: true });
      if (typeof tab.windowId === "number") {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
    }

    await patchState({ whatsappTabId: tab.id });
    return tab;
  }

  async function sendMessageToTab(tabId, payload) {
    if (typeof tabId !== "number") {
      return null;
    }

    try {
      return await chrome.tabs.sendMessage(tabId, payload);
    } catch (error) {
      return null;
    }
  }

  async function syncCurrentStateToTab(tabId) {
    const state = await getStoredState();
    await sendMessageToTab(tabId, { type: "SYNC_STATE", state: clone(state) });
  }

  async function forwardToWhatsAppTab(message, options) {
    const settings = {
      createIfMissing: false,
      focus: false,
      ...options
    };
    const tab = await ensureWhatsAppTab(settings);
    if (!tab || typeof tab.id !== "number") {
      return {
        ok: false,
        error: "WhatsApp Web is not open."
      };
    }

    const response = await sendMessageToTab(tab.id, message);
    if (!response) {
      return {
        ok: false,
        error: "WhatsApp Web did not respond. Try refreshing the tab."
      };
    }

    return response;
  }

  async function startJob(job) {
    const current = await getStoredState();
    if (current.status === "running" || current.status === "paused") {
      throw new Error("A campaign is already active. Pause, stop, or finish it before starting a new run.");
    }

    const tab = await ensureWhatsAppTab({ createIfMissing: true, focus: true });
    const initialProgress = {
      ...createEmptyProgress(),
      total: Array.isArray(job.recipients) ? job.recipients.length : 0,
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    };

    const state = await saveState({
      status: "running",
      whatsappTabId: tab ? tab.id : null,
      job: job,
      progress: initialProgress,
      historyRecorded: false,
      lastError: ""
    });

    if (tab && typeof tab.id === "number") {
      await sendMessageToTab(tab.id, {
        type: "SYNC_STATE",
        state: clone(state)
      });
    }

    return state;
  }

  async function controlJob(nextStatus) {
    const state = await patchState({ status: nextStatus });
    if (typeof state.whatsappTabId === "number") {
      await sendMessageToTab(state.whatsappTabId, {
        type: "CONTROL_JOB",
        status: nextStatus
      });
    }
    return state;
  }

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    (async function () {
      switch (message.type) {
        case "GET_STATE": {
          sendResponse({ ok: true, state: await getStoredState() });
          break;
        }
        case "OPEN_WHATSAPP": {
          const tab = await ensureWhatsAppTab({ createIfMissing: true, focus: true });
          sendResponse({ ok: Boolean(tab), tab: tab || null });
          break;
        }
        case "GET_WA_STATUS": {
          sendResponse(await forwardToWhatsAppTab({ type: "GET_WA_STATUS" }));
          break;
        }
        case "GET_DISCOVERY_DATA": {
          sendResponse(await forwardToWhatsAppTab({ type: "GET_DISCOVERY_DATA" }));
          break;
        }
        case "RESOLVE_TARGETS": {
          sendResponse(await forwardToWhatsAppTab({
            type: "RESOLVE_TARGETS",
            payload: message.payload || {}
          }));
          break;
        }
        case "START_JOB": {
          try {
            const state = await startJob(message.job);
            sendResponse({ ok: true, state: state });
          } catch (error) {
            sendResponse({
              ok: false,
              error: error instanceof Error ? error.message : String(error)
            });
          }
          break;
        }
        case "CONTROL_JOB": {
          const state = await controlJob(message.status);
          sendResponse({ ok: true, state: state });
          break;
        }
        case "RESULT_UPDATE": {
          const current = await getStoredState();
          let state = await patchState({
            lastError: message.lastError || "",
            progress: message.progress || undefined,
            status: message.status || undefined
          });
          if (
            !current.historyRecorded &&
            (state.status === "finished" || state.status === "error" || state.status === "stopped")
          ) {
            await appendCampaignHistory(state);
            state = await patchState({ historyRecorded: true });
          }
          sendResponse({ ok: true, state: state });
          break;
        }
        case "RESET_JOB": {
          const state = await saveState(createDefaultState());
          sendResponse({ ok: true, state: state });
          break;
        }
        case "CONTENT_READY": {
          if (sender.tab && typeof sender.tab.id === "number") {
            await patchState({ whatsappTabId: sender.tab.id });
            await syncCurrentStateToTab(sender.tab.id);
          }
          sendResponse({ ok: true });
          break;
        }
        default: {
          sendResponse({ ok: false, error: "Unknown message type." });
        }
      }
    })().catch(function (error) {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    });

    return true;
  });

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status !== "complete" || !tab.url || !tab.url.startsWith("https://web.whatsapp.com/")) {
      return;
    }

    syncCurrentStateToTab(tabId);
  });

  chrome.tabs.onRemoved.addListener(function (tabId) {
    (async function () {
      const state = await getStoredState();
      if (state.whatsappTabId !== tabId) {
        return;
      }

      await patchState({
        lastError: state.status === "running" || state.status === "paused"
          ? "WhatsApp Web tab was closed during the job."
          : state.lastError,
        status: state.status === "running" || state.status === "paused" ? "error" : state.status,
        whatsappTabId: null
      });
    })().catch(function () {
      return null;
    });
  });
})();
