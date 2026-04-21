(function () {
  const textDecoder = new TextDecoder();

  function sanitizeHeader(value, index) {
    const label = String(value || "").trim();
    return label || "Column " + (index + 1);
  }

  function normalizePhone(rawValue) {
    const raw = String(rawValue || "").trim();
    if (!raw) {
      return null;
    }

    let cleaned = raw.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("00")) {
      cleaned = "+" + cleaned.slice(2);
    }

    const digits = cleaned.replace(/\D/g, "");
    if (digits.length < 7) {
      return null;
    }

    return {
      display: "+" + digits,
      digits: digits
    };
  }

  function splitCsvLine(text, delimiter) {
    const row = [];
    let current = "";
    let insideQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"') {
        if (insideQuotes && next === '"') {
          current += '"';
          index += 1;
          continue;
        }
        insideQuotes = !insideQuotes;
        continue;
      }

      if (char === delimiter && !insideQuotes) {
        row.push(current);
        current = "";
        continue;
      }

      current += char;
    }

    row.push(current);
    return row;
  }

  function parseDelimitedText(text) {
    const normalized = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const nonEmptyLines = normalized.split("\n").filter(function (line) {
      return line.trim().length > 0;
    });

    if (!nonEmptyLines.length) {
      return [];
    }

    const commaCount = (nonEmptyLines[0].match(/,/g) || []).length;
    const semicolonCount = (nonEmptyLines[0].match(/;/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ";" : ",";

    return nonEmptyLines.map(function (line) {
      return splitCsvLine(line, delimiter).map(function (cell) {
        return cell.trim();
      });
    });
  }

  function columnToIndex(reference) {
    const match = /^([A-Z]+)/i.exec(reference || "");
    if (!match) {
      return -1;
    }

    let value = 0;
    const letters = match[1].toUpperCase();
    for (let index = 0; index < letters.length; index += 1) {
      value = value * 26 + (letters.charCodeAt(index) - 64);
    }

    return value - 1;
  }

  function sharedStringsFromXml(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagName("si")).map(function (item) {
      const pieces = Array.from(item.getElementsByTagName("t")).map(function (node) {
        return node.textContent || "";
      });
      return pieces.join("");
    });
  }

  function rowsFromSheetXml(xml, sharedStrings) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const rows = [];

    Array.from(doc.getElementsByTagName("row")).forEach(function (rowNode) {
      const row = [];

      Array.from(rowNode.getElementsByTagName("c")).forEach(function (cellNode) {
        const ref = cellNode.getAttribute("r") || "";
        const index = columnToIndex(ref);
        const type = cellNode.getAttribute("t");
        let value = "";

        if (type === "inlineStr") {
          const inlineText = cellNode.getElementsByTagName("t")[0];
          value = inlineText ? inlineText.textContent || "" : "";
        } else {
          const rawNode = cellNode.getElementsByTagName("v")[0];
          const rawValue = rawNode ? rawNode.textContent || "" : "";

          if (type === "s") {
            value = sharedStrings[Number(rawValue)] || "";
          } else {
            value = rawValue;
          }
        }

        row[index] = String(value || "").trim();
      });

      rows.push(row);
    });

    return rows;
  }

  function readUint16(view, offset) {
    return view.getUint16(offset, true);
  }

  function readUint32(view, offset) {
    return view.getUint32(offset, true);
  }

  function findEndOfCentralDirectory(view) {
    for (let index = view.byteLength - 22; index >= Math.max(0, view.byteLength - 65557); index -= 1) {
      if (readUint32(view, index) === 0x06054b50) {
        return index;
      }
    }
    return -1;
  }

  async function inflateDeflateRaw(bytes) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("Your Chrome version does not support XLSX decompression.");
    }

    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    const buffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(buffer);
  }

  async function unzipTextFiles(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const endOffset = findEndOfCentralDirectory(view);

    if (endOffset === -1) {
      throw new Error("Invalid XLSX file.");
    }

    const totalEntries = readUint16(view, endOffset + 10);
    const centralDirectoryOffset = readUint32(view, endOffset + 16);
    const files = {};
    let pointer = centralDirectoryOffset;

    for (let entryIndex = 0; entryIndex < totalEntries; entryIndex += 1) {
      if (readUint32(view, pointer) !== 0x02014b50) {
        break;
      }

      const compressionMethod = readUint16(view, pointer + 10);
      const compressedSize = readUint32(view, pointer + 20);
      const fileNameLength = readUint16(view, pointer + 28);
      const extraLength = readUint16(view, pointer + 30);
      const commentLength = readUint16(view, pointer + 32);
      const localHeaderOffset = readUint32(view, pointer + 42);
      const fileNameBytes = new Uint8Array(arrayBuffer, pointer + 46, fileNameLength);
      const fileName = textDecoder.decode(fileNameBytes);

      const localFileNameLength = readUint16(view, localHeaderOffset + 26);
      const localExtraLength = readUint16(view, localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
      const data = new Uint8Array(arrayBuffer.slice(dataStart, dataStart + compressedSize));

      let uncompressed;
      if (compressionMethod === 0) {
        uncompressed = data;
      } else if (compressionMethod === 8) {
        uncompressed = await inflateDeflateRaw(data);
      } else {
        throw new Error("Unsupported XLSX compression method.");
      }

      files[fileName] = textDecoder.decode(uncompressed);
      pointer += 46 + fileNameLength + extraLength + commentLength;
    }

    return files;
  }

  async function parseXlsxFile(file) {
    const files = await unzipTextFiles(await file.arrayBuffer());
    const sharedStringsXml = files["xl/sharedStrings.xml"] || "<sst></sst>";
    const sharedStrings = sharedStringsFromXml(sharedStringsXml);
    const sheetName = Object.keys(files).find(function (key) {
      return /^xl\/worksheets\/sheet\d+\.xml$/i.test(key);
    });

    if (!sheetName) {
      throw new Error("No worksheet found in the XLSX file.");
    }

    return rowsFromSheetXml(files[sheetName], sharedStrings);
  }

  function rowsToRecipients(rows) {
    const filteredRows = rows.filter(function (row) {
      return row.some(function (cell) {
        return String(cell || "").trim().length > 0;
      });
    });

    if (!filteredRows.length) {
      return { recipients: [], variables: [] };
    }

    let headerIndex = filteredRows.findIndex(function (row) {
      return row.some(function (cell) {
        return /whatsapp number|phone|mobile/i.test(String(cell || ""));
      });
    });

    let headers = [];
    let startIndex = 0;

    if (headerIndex >= 0) {
      headers = filteredRows[headerIndex].map(sanitizeHeader);
      startIndex = headerIndex + 1;
    } else {
      headers = ["WhatsApp Number"];
      startIndex = 0;
    }

    const phoneHeaderIndex = headers.findIndex(function (header) {
      return /whatsapp number|phone|mobile/i.test(header);
    });
    const recipients = [];

    for (let rowIndex = startIndex; rowIndex < filteredRows.length; rowIndex += 1) {
      const row = filteredRows[rowIndex];
      const phoneCandidate = row[phoneHeaderIndex >= 0 ? phoneHeaderIndex : 0];
      const normalized = normalizePhone(phoneCandidate);
      if (!normalized) {
        continue;
      }

      const fields = {};
      headers.forEach(function (header, columnIndex) {
        fields[header] = String(row[columnIndex] || "").trim();
      });

      const firstName = fields.FirstName || fields["First Name"] || "";
      const lastName = fields.LastName || fields["Last Name"] || "";
      const name = [firstName, lastName].filter(Boolean).join(" ").trim() || fields.Name || "";

      recipients.push({
        phone: normalized.display,
        phoneDigits: normalized.digits,
        name: name,
        fields: fields
      });
    }

    const variables = Array.from(
      recipients.reduce(function (set, recipient) {
        Object.keys(recipient.fields || {}).forEach(function (key) {
          if (!/whatsapp number|phone|mobile/i.test(key)) {
            set.add(key);
          }
        });
        return set;
      }, new Set())
    );

    return { recipients: recipients, variables: variables };
  }

  function manualTextToRecipients(text) {
    const rawEntries = String(text || "")
      .split(/[\n,]/g)
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);

    const recipients = rawEntries
      .map(function (entry) {
        const normalized = normalizePhone(entry);
        if (!normalized) {
          return null;
        }

        return {
          phone: normalized.display,
          phoneDigits: normalized.digits,
          name: "",
          fields: {
            "WhatsApp Number": normalized.display
          }
        };
      })
      .filter(Boolean);

    return dedupeRecipients(recipients);
  }

  function dedupeRecipients(recipients) {
    const byDigits = new Map();

    recipients.forEach(function (recipient) {
      const existing = byDigits.get(recipient.phoneDigits);
      if (!existing) {
        byDigits.set(recipient.phoneDigits, recipient);
        return;
      }

      byDigits.set(recipient.phoneDigits, {
        ...existing,
        ...recipient,
        name: recipient.name || existing.name,
        fields: {
          ...existing.fields,
          ...recipient.fields
        }
      });
    });

    return Array.from(byDigits.values());
  }

  async function parseRecipientsFile(file) {
    const lowerName = file.name.toLowerCase();
    let rows;

    if (lowerName.endsWith(".xlsx")) {
      rows = await parseXlsxFile(file);
    } else {
      rows = parseDelimitedText(await file.text());
    }

    return rowsToRecipients(rows);
  }

  function renderMessage(template, recipient, includeTimestamp) {
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
      const stamp = new Date().toLocaleString();
      output += (output ? "\n\n" : "") + stamp;
    }

    return output.trim();
  }

  function downloadTextFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function resultsToCsv(results) {
    const headers = ["Campaign", "WhatsApp Number", "Name", "Source", "Status", "Error", "Sent At"];
    const rows = results.map(function (item) {
      return [
        item.campaignName || "",
        item.phone || "",
        item.name || "",
        item.source || "",
        item.status || "",
        item.error || "",
        item.sentAt || ""
      ];
    });

    return [headers].concat(rows).map(function (row) {
      return row.map(function (cell) {
        const value = String(cell || "").replace(/"/g, '""');
        return '"' + value + '"';
      }).join(",");
    }).join("\n");
  }

  function downloadTemplate() {
    const csv = [
      ["WhatsApp Number", "FirstName", "LastName", "CustomField"].join(","),
      ['"+15551234567"', '"Alex"', '"Rivera"', '"Spring Offer"'].join(",")
    ].join("\n");
    downloadTextFile("wa-bulk-template.csv", csv, "text/csv;charset=utf-8");
  }

  function toDirectRecipient(phoneValue, extra) {
    const normalized = normalizePhone(phoneValue);
    if (!normalized) {
      return null;
    }

    const payload = extra || {};
    return {
      chatId: normalized.digits + "@c.us",
      fields: payload.fields || {
        "WhatsApp Number": normalized.display
      },
      name: payload.name || "",
      phone: normalized.display,
      phoneDigits: normalized.digits,
      source: payload.source || "numbers"
    };
  }

  async function readJsonResource(pathname) {
    const response = await fetch(pathname);
    if (!response.ok) {
      throw new Error("Could not load " + pathname);
    }
    return response.json();
  }

  window.WAFileTools = {
    dedupeRecipients: dedupeRecipients,
    downloadTemplate: downloadTemplate,
    downloadTextFile: downloadTextFile,
    manualTextToRecipients: manualTextToRecipients,
    parseRecipientsFile: parseRecipientsFile,
    readJsonResource: readJsonResource,
    renderMessage: renderMessage,
    resultsToCsv: resultsToCsv,
    toDirectRecipient: toDirectRecipient
  };
})();
