// Shared email text cleaning utilities

function decodeQuotedPrintableFallback(text: string): string {
  if (!text.includes("=")) return text;

  return text
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return "=" + hex;
      }
    })
    .replace(/=\r?\n/g, "");
}

function decodeHtmlEntities(text: string): string {
  const named: Record<string, string> = {
    "&zwnj;": "\u200C",
    "&zwj;": "\u200D",
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&#39;": "'",
    "&#x27;": "'",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "…",
    "&rsquo;": "'",
    "&lsquo;": "'",
    "&rdquo;": '"',
    "&ldquo;": '"',
    "&bull;": "•",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&shy;": "",
    "&ensp;": " ",
    "&emsp;": " ",
  };

  let decoded = text;
  for (const [entity, ch] of Object.entries(named)) {
    const re = new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    decoded = decoded.replace(re, ch);
  }

  decoded = decoded.replace(/&#(\d+);/g, (_, code) => {
    const num = parseInt(code, 10);
    return num > 0 && num < 0x110000 ? String.fromCharCode(num) : _;
  });

  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    const num = parseInt(hex, 16);
    return num > 0 && num < 0x110000 ? String.fromCharCode(num) : _;
  });

  return decoded;
}

function isBase64Line(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 20) return false;
  if (trimmed.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed);
}

function tryDecodeBase64Lines(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let base64Buffer: string[] = [];

  const flushBuffer = () => {
    if (base64Buffer.length === 0) return;
    const joined = base64Buffer.join("");
    try {
      const decoded = atob(joined);
      const printable = decoded.split("").filter((c) => {
        const code = c.charCodeAt(0);
        return (code >= 32 && code < 127) || code === 9 || code === 10 || code === 13;
      }).length;
      if (printable / decoded.length > 0.9) {
        result.push(decoded);
      } else {
        result.push(...base64Buffer);
      }
    } catch {
      result.push(...base64Buffer);
    }
    base64Buffer = [];
  };

  for (const line of lines) {
    if (isBase64Line(line)) {
      base64Buffer.push(line.trim());
    } else {
      flushBuffer();
      result.push(line);
    }
  }
  flushBuffer();

  return result.join("\n");
}

export function cleanEmailText(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // Attempt to decode contiguous base64 blocks left undecoded by the server
  cleaned = tryDecodeBase64Lines(cleaned);

  // Decode quoted-printable if still present (server fallback)
  if (/=[0-9A-Fa-f]{2}/.test(cleaned) && cleaned.includes("=")) {
    cleaned = decodeQuotedPrintableFallback(cleaned);
  }

  // Decode HTML entities (e.g. &zwnj;, &nbsp;, &amp;)
  cleaned = decodeHtmlEntities(cleaned);

  // Remove invisible / zero-width Unicode characters that create visual gaps
  cleaned = cleaned.replace(/[\u00AD\u034F\u200B-\u200F\u2060\uFE0F\uFEFF]/g, "");

  // Remove MIME boundaries and stray headers
  cleaned = cleaned
    .replace(/\r?\n?-{2,}=_Part_[^\r\n]*/g, "\n")
    .replace(/\r?\n?-{2,}=_NmP[^\r\n]*/g, "\n")
    .replace(/\r?\n?-{2,}----_[^\r\n]*/g, "\n")
    .replace(/\r?\n?Content-[A-Za-z-]+:[^\r\n]*/g, "\n")
    .replace(/\r?\n?MIME-Version:[^\r\n]*/g, "\n")
    .replace(/\r?\n?X-[A-Za-z-]+:[^\r\n]*/g, "\n")
    .replace(/\r?\n?Received:[^\r\n]*/g, "\n")
    .replace(/\r?\n?DKIM-[A-Za-z-]+:[^\r\n]*/g, "\n");

  // Normalize line endings
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Collapse more than 2 consecutive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Collapse multiple consecutive spaces into a single space
  cleaned = cleaned.replace(/ {2,}/g, " ");

  return cleaned.trim();
}

export function linkifyText(text: string): string {
  if (!text) return "";
  const urlRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline break-all">${url}</a>`);
}

export function looksLikeMarkdown(text: string): boolean {
  const patterns = [
    /\*\*.+\*\*/, /\*.+\*/, /\[.+\]\(.+\)/, /`[^`]+`/,
    /^#{1,6}\s/m, /^>\s/m, /^[-*+]\s/m, /^\d+\.\s/m,
    /```[\s\S]*?```/, /~~.+~~/, /\|.+\|/,
  ];
  return patterns.some((re) => re.test(text));
}
