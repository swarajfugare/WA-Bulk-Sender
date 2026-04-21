(function () {
  const BRIDGE_NAMESPACE = "WA_SENDER_PAGE_BRIDGE";
  const READY_TIMEOUT_MS = 30000;

  function postMessage(type, payload) {
    window.postMessage(
      {
        namespace: BRIDGE_NAMESPACE,
        payload: payload || {},
        type: type
      },
      "*"
    );
  }

  function getWpp() {
    return window.WPP || window.WPP_CA9BDB871D50 || null;
  }

  function isWebpackReady(WPP) {
    if (!WPP || !WPP.webpack) {
      return false;
    }

    if (typeof WPP.webpack.isReady === "function") {
      return Boolean(WPP.webpack.isReady());
    }

    return Boolean(WPP.webpack.isReady);
  }

  function waitForWppReady() {
    return new Promise(function (resolve, reject) {
      const startedAt = Date.now();

      function tryResolve() {
        const WPP = getWpp();
        if (!WPP) {
          if (Date.now() - startedAt > READY_TIMEOUT_MS) {
            reject(new Error("WA bridge script was not injected."));
            return;
          }
          window.setTimeout(tryResolve, 250);
          return;
        }

        if (isWebpackReady(WPP)) {
          resolve(WPP);
          return;
        }

        if (WPP.webpack && typeof WPP.webpack.onReady === "function") {
          let finished = false;
          const timeoutId = window.setTimeout(function () {
            if (finished) {
              return;
            }
            finished = true;
            reject(new Error("WhatsApp Web is taking too long to get ready."));
          }, READY_TIMEOUT_MS);

          WPP.webpack.onReady(function () {
            if (finished) {
              return;
            }
            finished = true;
            window.clearTimeout(timeoutId);
            resolve(getWpp());
          });
          return;
        }

        resolve(WPP);
      }

      tryResolve();
    });
  }

  function isUserId(id) {
    return /@(c\.us|lid)$/.test(id || "");
  }

  function isGroupId(id) {
    return /@g\.us$/.test(id || "");
  }

  function normalizeId(idValue) {
    if (!idValue) {
      return "";
    }

    if (typeof idValue === "string") {
      return idValue;
    }

    if (typeof idValue._serialized === "string") {
      return idValue._serialized;
    }

    if (idValue.id) {
      return normalizeId(idValue.id);
    }

    if (typeof idValue.toString === "function" && idValue.toString !== Object.prototype.toString) {
      const stringValue = idValue.toString();
      if (stringValue && stringValue !== "[object Object]") {
        return stringValue;
      }
    }

    if (idValue.user && idValue.server) {
      return String(idValue.user) + "@" + String(idValue.server);
    }

    return "";
  }

  function extractPhone(idValue) {
    const id = normalizeId(idValue);
    const userPart = id.split("@")[0];
    return /^\d+$/.test(userPart) ? "+" + userPart : "";
  }

  function firstNonEmpty(values) {
    for (let index = 0; index < values.length; index += 1) {
      const value = values[index];
      if (value != null && String(value).trim()) {
        return String(value).trim();
      }
    }
    return "";
  }

  function normalizeLabels(entity) {
    const labelIds = new Set();
    const candidates = [];

    if (entity && Array.isArray(entity.labelIds)) {
      candidates.push.apply(candidates, entity.labelIds);
    }

    if (entity && Array.isArray(entity.labels)) {
      candidates.push.apply(candidates, entity.labels);
    }

    if (entity && entity.labels && Array.isArray(entity.labels.models)) {
      candidates.push.apply(candidates, entity.labels.models);
    }

    candidates.forEach(function (item) {
      if (!item) {
        return;
      }

      if (typeof item === "string") {
        labelIds.add(item);
        return;
      }

      if (typeof item.id === "string") {
        labelIds.add(item.id);
      } else if (item.id && typeof item.id.id === "string") {
        labelIds.add(item.id.id);
      } else if (item.id && typeof item.id._serialized === "string") {
        labelIds.add(item.id._serialized);
      }
    });

    return Array.from(labelIds);
  }

  function normalizeChat(chat) {
    if (!chat) {
      return null;
    }

    const id = normalizeId(chat.id || chat);
    if (!id) {
      return null;
    }

    return {
      id: id,
      isArchived: Boolean(chat.archive || chat.isArchived),
      isGroup: Boolean(chat.isGroup || isGroupId(id)),
      labels: normalizeLabels(chat),
      name: firstNonEmpty([
        chat.formattedTitle,
        chat.formattedName,
        chat.name,
        chat.displayName,
        chat.displayNameOrPnForLid,
        chat.contact && chat.contact.formattedName,
        chat.contact && chat.contact.pushname,
        chat.contact && chat.contact.name,
        chat.groupMetadata && chat.groupMetadata.subject,
        chat.formattedPhone,
        extractPhone(id),
        id
      ]),
      phone: extractPhone(id),
      unreadCount: Number(chat.unreadCount || 0)
    };
  }

  function normalizeContact(contact) {
    if (!contact) {
      return null;
    }

    const id = normalizeId(contact.id || contact);
    if (!id || !isUserId(id)) {
      return null;
    }

    return {
      id: id,
      isBusiness: Boolean(contact.isBusiness),
      labels: normalizeLabels(contact),
      name: firstNonEmpty([
        contact.formattedName,
        contact.name,
        contact.displayName,
        contact.displayNameOrPnForLid,
        contact.pushname,
        contact.shortName,
        contact.formattedPhone,
        extractPhone(id),
        id
      ]),
      phone: extractPhone(id)
    };
  }

  function normalizeGroup(group) {
    const normalized = normalizeChat(group);
    if (!normalized || !isGroupId(normalized.id)) {
      return null;
    }

    return {
      id: normalized.id,
      name: normalized.name,
      participantCount: Number(group.groupSize || group.size || group.participantsLength || 0)
    };
  }

  function normalizeLabel(label) {
    if (!label || !label.id) {
      return null;
    }

    return {
      count: Number(label.count || 0),
      hexColor: label.hexColor || "",
      id: String(label.id),
      name: label.name || String(label.id)
    };
  }

  function uniqueById(items) {
    const map = new Map();
    items.forEach(function (item) {
      if (item && item.id) {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  }

  function uniqueValues(items) {
    return Array.from(new Set((items || []).filter(Boolean)));
  }

  function mergeRecipients(recipientLists) {
    return uniqueById(
      recipientLists
        .flat()
        .filter(Boolean)
        .map(function (item) {
          return {
            id: item.chatId,
            ...item
          };
        })
    ).map(function (item) {
      delete item.id;
      return item;
    });
  }

  function normalizeParticipantEntry(entry) {
    if (!entry) {
      return null;
    }

    const base = entry.contact || entry;
    const chatId = normalizeId(base.id || entry.id || entry);
    if (!chatId || !isUserId(chatId)) {
      return null;
    }

    return {
      chatId: chatId,
      isAdmin: Boolean(
        entry.isAdmin ||
        entry.isSuperAdmin ||
        entry.isGroupAdmin ||
        entry.isSuperUser ||
        base.isAdmin ||
        base.isSuperAdmin
      ),
      name: firstNonEmpty([
        base.formattedName,
        base.name,
        base.displayName,
        base.displayNameOrPnForLid,
        base.pushname,
        base.shortName,
        extractPhone(chatId),
        chatId
      ]),
      phone: extractPhone(chatId)
    };
  }

  async function getStatus() {
    const WPP = await waitForWppReady();
    const streamData = WPP.conn && typeof WPP.conn.getStreamData === "function"
      ? WPP.conn.getStreamData()
      : null;

    return {
      authenticated: Boolean(WPP.conn && typeof WPP.conn.isAuthenticated === "function" && WPP.conn.isAuthenticated()),
      stream: streamData || null,
      wppReady: true
    };
  }

  async function getDiscoveryData() {
    const WPP = await waitForWppReady();

    const [status, chats, contacts, groups, labels] = await Promise.all([
      getStatus(),
      WPP.chat.list({ onlyUsers: true }).then(function (items) {
        return uniqueById((items || []).map(normalizeChat).filter(Boolean));
      }).catch(function () {
        return [];
      }),
      WPP.contact.list({ onlyMyContacts: true }).then(function (items) {
        return uniqueById((items || []).map(normalizeContact).filter(Boolean));
      }).catch(function () {
        return [];
      }),
      WPP.group.getAllGroups().then(function (items) {
        return uniqueById((items || []).map(normalizeGroup).filter(Boolean));
      }).catch(function () {
        return [];
      }),
      (WPP.labels && typeof WPP.labels.getAllLabels === "function"
        ? WPP.labels.getAllLabels()
        : Promise.resolve([])
      ).then(function (items) {
        return uniqueById((items || []).map(normalizeLabel).filter(Boolean));
      }).catch(function () {
        return [];
      })
    ]);

    return {
      chats: chats,
      contacts: contacts,
      groups: groups,
      labels: labels,
      refreshedAt: new Date().toISOString(),
      status: status
    };
  }

  function mapContactsToRecipients(contacts, source) {
    return uniqueById(
      (contacts || []).map(function (contact) {
        const normalized = normalizeContact(contact);
        if (!normalized) {
          return null;
        }
        return {
          chatId: normalized.id,
          fields: {
            Name: normalized.name,
            "WhatsApp Number": normalized.phone
          },
          name: normalized.name,
          phone: normalized.phone,
          source: source || "contact"
        };
      }).filter(Boolean).map(function (item) {
        return {
          id: item.chatId,
          ...item
        };
      })
    ).map(function (item) {
      delete item.id;
      return item;
    });
  }

  function mapChatsToRecipients(chats, source) {
    return uniqueById(
      (chats || []).map(function (chat) {
        const normalized = normalizeChat(chat);
        if (!normalized || !isUserId(normalized.id)) {
          return null;
        }

        return {
          chatId: normalized.id,
          fields: {
            Name: normalized.name,
            "WhatsApp Number": normalized.phone
          },
          name: normalized.name,
          phone: normalized.phone,
          source: source || "chat"
        };
      }).filter(Boolean).map(function (item) {
        return {
          id: item.chatId,
          ...item
        };
      })
    ).map(function (item) {
      delete item.id;
      return item;
    });
  }

  async function resolveTargets(payload) {
    const WPP = await waitForWppReady();
    const source = payload && payload.source;

    if (source === "groups") {
      const selectedGroupIds = Array.isArray(payload.groupIds) ? payload.groupIds : [];
      const includeAdmins = Boolean(payload.includeAdmins);
      const groups = await WPP.group.getAllGroups();
      const groupsById = new Map(
        (groups || []).map(function (group) {
          const normalized = normalizeGroup(group);
          return normalized ? [normalized.id, normalized] : null;
        }).filter(Boolean)
      );

      const recipients = [];

      for (let index = 0; index < selectedGroupIds.length; index += 1) {
        const groupId = selectedGroupIds[index];
        const groupInfo = groupsById.get(groupId);
        let participants = [];
        let admins = [];

        if (WPP.whatsapp && WPP.whatsapp.functions && typeof WPP.whatsapp.functions.getParticipants === "function") {
          const participantInfo = await WPP.whatsapp.functions.getParticipants(groupId).catch(function () {
            return null;
          });
          participants = participantInfo && Array.isArray(participantInfo.participants)
            ? participantInfo.participants.map(normalizeParticipantEntry).filter(Boolean)
            : [];
          admins = participantInfo && Array.isArray(participantInfo.admins)
            ? participantInfo.admins
                .map(function (item) {
                  const normalized = normalizeParticipantEntry(item);
                  return normalized ? normalized.chatId : normalizeId(item);
                })
                .filter(Boolean)
            : [];
        }

        if (!participants.length) {
          const participantModels = await WPP.group.getParticipants(groupId).catch(function () {
            return [];
          });
          participants = participantModels.map(normalizeParticipantEntry).filter(Boolean);
          admins = participantModels
            .filter(function (item) {
              return Boolean(
                item && (
                  item.isAdmin ||
                  item.isSuperAdmin ||
                  item.isGroupAdmin ||
                  item.isSuperUser
                )
              );
            })
            .map(function (item) {
              const normalized = normalizeParticipantEntry(item);
              return normalized ? normalized.chatId : normalizeId(item.id || item);
            })
            .filter(Boolean);
        }

        const adminSet = new Set(admins);
        const filteredParticipants = participants.filter(function (participantId) {
          if (!participantId || !isUserId(participantId.chatId)) {
            return false;
          }

          if (includeAdmins) {
            return true;
          }

          return !adminSet.has(participantId.chatId);
        });

        filteredParticipants.forEach(function (participant) {
          recipients.push({
            chatId: participant.chatId,
            fields: {
              Group: groupInfo ? groupInfo.name : groupId,
              Name: participant.name || "",
              "WhatsApp Number": participant.phone || ""
            },
            name: participant.name || "",
            phone: participant.phone || "",
            source: "group:" + (groupInfo ? groupInfo.name : groupId)
          });
        });
      }

      return mergeRecipients([recipients]);
    }

    if (source === "labels") {
      const selectedLabelIds = Array.isArray(payload.labelIds) ? payload.labelIds : [];
      const selectedLabelSet = new Set(selectedLabelIds.map(String));
      const [contacts, chats] = await Promise.all([
        WPP.contact.list({ onlyMyContacts: true }).catch(function () {
          return [];
        }),
        WPP.chat.list({ onlyUsers: true }).catch(function () {
          return [];
        })
      ]);

      return mergeRecipients([
        mapContactsToRecipients(
          contacts.filter(function (contact) {
            return normalizeLabels(contact).some(function (labelId) {
              return selectedLabelSet.has(String(labelId));
            });
          }),
          "label"
        ),
        mapChatsToRecipients(
          chats.filter(function (chat) {
            return normalizeLabels(chat).some(function (labelId) {
              return selectedLabelSet.has(String(labelId));
            });
          }),
          "label"
        )
      ]);
    }

    if (source === "countries") {
      const selectedCodes = new Set(
        (Array.isArray(payload.countryCodes) ? payload.countryCodes : []).map(function (code) {
          return String(code || "").replace(/\D/g, "");
        }).filter(Boolean)
      );

      const [contacts, chats] = await Promise.all([
        WPP.contact.list({ onlyMyContacts: true }).catch(function () {
          return [];
        }),
        WPP.chat.list({ onlyUsers: true }).catch(function () {
          return [];
        })
      ]);

      return mergeRecipients([
        mapContactsToRecipients(contacts, "country"),
        mapChatsToRecipients(chats, "country")
      ]).filter(function (recipient) {
        const digits = String(recipient.phone || "").replace(/\D/g, "");
        for (const code of selectedCodes) {
          if (digits.startsWith(code)) {
            return true;
          }
        }
        return false;
      });
    }

    return [];
  }

  function detectAttachmentType(attachment) {
    const mimeType = String((attachment && attachment.type) || "").toLowerCase();
    const fileName = String((attachment && attachment.name) || "").toLowerCase();

    if (mimeType.startsWith("image/")) {
      return fileName.endsWith(".webp") ? "sticker" : "image";
    }
    if (mimeType.startsWith("video/")) {
      return "video";
    }
    if (mimeType.startsWith("audio/")) {
      return "audio";
    }
    return "document";
  }

  async function resolveDestinationChatId(WPP, payload) {
    const phoneDigits = String((payload && payload.phone) || "").replace(/\D/g, "");
    const rawChatId = normalizeId(payload && payload.chatId);
    const source = String((payload && payload.source) || "");
    const candidates = uniqueValues([
      rawChatId,
      phoneDigits ? phoneDigits + "@c.us" : ""
    ]);

    if (!candidates.length) {
      throw new Error("Recipient is missing a WhatsApp destination.");
    }

    const canQueryExists = Boolean(WPP.contact && typeof WPP.contact.queryExists === "function");
    let lastQueryError = "";

    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      if (!candidate) {
        continue;
      }

      if (isGroupId(candidate)) {
        return candidate;
      }

      if (!isUserId(candidate)) {
        continue;
      }

      if (!canQueryExists) {
        return candidate;
      }

      const queryResult = await WPP.contact.queryExists(candidate).catch(function (error) {
        lastQueryError = error instanceof Error ? error.message : String(error);
        return null;
      });

      const resolvedId = normalizeId(queryResult && (queryResult.wid || queryResult.id || queryResult));
      if (resolvedId && isUserId(resolvedId)) {
        return resolvedId;
      }

      if (rawChatId && source && source !== "numbers" && candidate === rawChatId) {
        return rawChatId;
      }

      if (candidate === rawChatId && /@lid$/.test(candidate)) {
        return candidate;
      }

      if (candidate === rawChatId && !phoneDigits) {
        return candidate;
      }
    }

    if (phoneDigits) {
      throw new Error("This number does not appear to be registered on WhatsApp.");
    }

    throw new Error(lastQueryError || "Could not resolve a valid WhatsApp chat for this recipient.");
  }

  async function safeSendTextMessage(WPP, chatId, text) {
    try {
      return await WPP.chat.sendTextMessage(chatId, text, {
        delay: 0,
        markIsRead: true,
        waitForAck: true
      });
    } catch (primaryError) {
      return WPP.chat.sendTextMessage(chatId, text);
    }
  }

  async function safeSendFileMessage(WPP, chatId, attachment, options) {
    try {
      return await WPP.chat.sendFileMessage(chatId, attachment.dataUrl, {
        ...options,
        waitForAck: true
      });
    } catch (primaryError) {
      return WPP.chat.sendFileMessage(chatId, attachment.dataUrl, options);
    }
  }

  async function sendMessage(payload) {
    const WPP = await waitForWppReady();
    const chatId = await resolveDestinationChatId(WPP, payload || {});
    const settings = payload && payload.settings ? payload.settings : {};
    const text = String((payload && payload.text) || "").trim();
    const attachments = Array.isArray(payload && payload.attachments) ? payload.attachments : [];
    const sendAudioAsVoiceNote = Boolean(settings.sendAudioAsVoiceNote);
    const useCaptionOnFirstAttachment = Boolean(settings.useCaptionOnFirstAttachment);

    let sendTextSeparately = Boolean(text);

    if (attachments.length && text && useCaptionOnFirstAttachment) {
      const firstAttachmentType = detectAttachmentType(attachments[0]);
      sendTextSeparately = firstAttachmentType === "sticker" || (firstAttachmentType === "audio" && sendAudioAsVoiceNote);
    }

    if (text && sendTextSeparately) {
      await safeSendTextMessage(WPP, chatId, text);
    }

    for (let index = 0; index < attachments.length; index += 1) {
      const attachment = attachments[index];
      const attachmentType = detectAttachmentType(attachment);
      await safeSendFileMessage(WPP, chatId, attachment, {
        caption: index === 0 && text && !sendTextSeparately ? text : "",
        filename: attachment.name,
        markIsRead: true,
        mimetype: attachment.type,
        type: attachmentType,
        isPtt: attachmentType === "audio" && sendAudioAsVoiceNote
      });
    }

    return {
      chatId: chatId,
      sentAttachments: attachments.length,
      sentText: Boolean(text)
    };
  }

  const handlers = {
    GET_DISCOVERY_DATA: getDiscoveryData,
    GET_STATUS: getStatus,
    RESOLVE_TARGETS: resolveTargets,
    SEND_MESSAGE: sendMessage
  };

  window.addEventListener("message", function (event) {
    const data = event.data;
    if (event.source !== window || !data || data.namespace !== BRIDGE_NAMESPACE || data.direction !== "to-page") {
      return;
    }

    const handler = handlers[data.type];
    if (!handler) {
      postMessage("response", {
        id: data.id,
        ok: false,
        error: "Unknown page bridge action."
      });
      return;
    }

    Promise.resolve(handler(data.payload || {}))
      .then(function (result) {
        postMessage("response", {
          id: data.id,
          ok: true,
          result: result
        });
      })
      .catch(function (error) {
        postMessage("response", {
          id: data.id,
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        });
      });
  });

  waitForWppReady()
    .then(function () {
      postMessage("ready", {
        ok: true
      });
    })
    .catch(function (error) {
      postMessage("ready", {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    });
})();
