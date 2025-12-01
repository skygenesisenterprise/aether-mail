import { Buffer } from "buffer";

// Types pour le traitement MIME
export interface ProcessedEmail {
  subject: string;
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  date: string;
  text: string;
  html: string;
  images: EmailImage[];
  attachments: EmailAttachment[];
  warnings: string[];
  headers: Record<string, string>;
}

export interface EmailImage {
  cid?: string;
  src: string;
  alt?: string;
  isEmbedded: boolean;
  size?: number;
  type?: string;
}

export interface EmailAttachment {
  name: string;
  size: number;
  type: string;
  content?: string; // base64
  cid?: string;
}

export interface EmailHeader {
  key: string;
  value: string;
}

/**
 * Service complet de traitement MIME pour Aether Mail
 */
export class MimeProcessor {
  private static readonly COMMON_CHARSETS = [
    "utf-8",
    "iso-8859-1",
    "iso-8859-15",
    "windows-1252",
    "windows-1251",
    "ascii",
  ];

  private static readonly UNSAFE_TAGS = [
    "script",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "textarea",
    "button",
    "link",
    "meta",
    "style",
  ];

  private static readonly UNSAFE_ATTRIBUTES = [
    "onload",
    "onerror",
    "onclick",
    "onmouseover",
    "onmouseout",
    "onfocus",
    "onblur",
    "onchange",
    "onsubmit",
    "javascript:",
    "vbscript:",
    "data:",
  ];

  /**
   * Traite un email MIME brut et retourne une structure prête pour l'affichage
   */
  static async processMimeEmail(rawMime: string): Promise<ProcessedEmail> {
    try {
      // Parser les headers
      const { headers, bodyStart } = MimeProcessor.parseHeaders(rawMime);

      // Extraire le contenu principal
      const contentType = headers["content-type"] || "text/plain";
      const contentTransferEncoding =
        headers["content-transfer-encoding"] || "";
      const charset = MimeProcessor.extractCharset(contentType);

      // Parser le corps du message
      const body = rawMime.substring(bodyStart);
      const parsedContent = MimeProcessor.parseMultipartBody(
        body,
        contentType,
        contentTransferEncoding,
        charset,
      );

      // Nettoyer et sécuriser le HTML
      const sanitizedHtml = MimeProcessor.sanitizeHtml(parsedContent.html);

      // Extraire les images et pièces jointes
      const { images, attachments } = MimeProcessor.extractMediaAndAttachments(
        body,
        headers,
      );

      // Générer les avertissements de sécurité
      const warnings = MimeProcessor.generateSecurityWarnings(
        headers,
        parsedContent.html,
      );

      return {
        subject: MimeProcessor.decodeHeader(headers.subject || ""),
        from: MimeProcessor.decodeHeader(headers.from || ""),
        to: MimeProcessor.decodeHeader(headers.to || ""),
        cc: headers.cc ? MimeProcessor.decodeHeader(headers.cc) : undefined,
        bcc: headers.bcc ? MimeProcessor.decodeHeader(headers.bcc) : undefined,
        date: headers.date || new Date().toISOString(),
        text: parsedContent.text,
        html: sanitizedHtml,
        images,
        attachments,
        warnings,
        headers,
      };
    } catch (error) {
      console.error("Erreur lors du traitement MIME:", error);
      throw new Error(
        `Échec du traitement MIME: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      );
    }
  }

  /**
   * Parse les headers MIME
   */
  private static parseHeaders(rawMime: string): {
    headers: Record<string, string>;
    bodyStart: number;
  } {
    const lines = rawMime.split("\n");
    const headers: Record<string, string> = {};
    let bodyStart = 0;
    let currentHeader = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Fin des headers
      if (line.trim() === "") {
        bodyStart = i + 1;
        break;
      }

      // Header continué (ligne commençant par des espaces)
      if (line.startsWith(" ") || line.startsWith("\t")) {
        if (currentHeader) {
          headers[currentHeader] += " " + line.trim();
        }
        continue;
      }

      // Nouveau header
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        currentHeader = line.substring(0, colonIndex).toLowerCase().trim();
        const value = line.substring(colonIndex + 1).trim();
        headers[currentHeader] = value;
      }
    }

    return { headers, bodyStart };
  }

  /**
   * Extrait le charset depuis le Content-Type
   */
  private static extractCharset(contentType: string): string {
    const charsetMatch = contentType.match(/charset=([^;]+)/i);
    if (charsetMatch) {
      return charsetMatch[1].trim().toLowerCase().replace(/['"]/g, "");
    }
    return "utf-8"; // Par défaut
  }

  /**
   * Décode un header MIME (gère les encoded words)
   */
  private static decodeHeader(header: string): string {
    if (!header) return "";

    // Gérer les encoded words: =?charset?encoding?encoded-text?=
    return header.replace(
      /=\?([^?]+)\?([bq])\?([^?]+)\?=/gi,
      (match, charset, encoding, encodedText) => {
        try {
          let decoded: string;

          if (encoding.toLowerCase() === "b") {
            // Base64
            decoded = Buffer.from(encodedText, "base64").toString("binary");
          } else {
            // Quoted-printable
            decoded = MimeProcessor.decodeQuotedPrintable(encodedText);
          }

          // Convertir vers le charset correct puis UTF-8
          return MimeProcessor.convertToUtf8(decoded, charset);
        } catch (error) {
          console.warn(`Erreur de décodage du header: ${match}`, error);
          return match; // Retourner l'original en cas d'erreur
        }
      },
    );
  }

  /**
   * Parse le corps du message (gère multipart)
   */
  private static parseMultipartBody(
    body: string,
    contentType: string,
    transferEncoding: string,
    charset: string,
  ): { text: string; html: string } {
    // Vérifier si c'est un multipart
    if (contentType.includes("multipart/")) {
      return MimeProcessor.parseMultipartContent(body, contentType);
    }

    // Contenu simple
    const decodedContent = MimeProcessor.decodeContent(body, transferEncoding, charset);

    if (contentType.includes("text/html")) {
      return {
        text: MimeProcessor.htmlToText(decodedContent),
        html: decodedContent,
      };
    } else {
      // text/plain
      return {
        text: decodedContent,
        html: MimeProcessor.textToHtml(decodedContent),
      };
    }
  }

  /**
   * Parse le contenu multipart
   */
  private static parseMultipartContent(
    body: string,
    contentType: string,
  ): { text: string; html: string } {
    const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
    if (!boundaryMatch) {
      throw new Error("Boundary multipart non trouvé");
    }

    const boundary = boundaryMatch[1].replace(/['"]/g, "");
    const parts = MimeProcessor.splitMultipartParts(body, boundary);

    let textContent = "";
    let htmlContent = "";

    for (const part of parts) {
      const { headers, content } = MimeProcessor.parsePart(part);
      const partContentType = headers["content-type"] || "text/plain";
      const partEncoding = headers["content-transfer-encoding"] || "";
      const partCharset = MimeProcessor.extractCharset(partContentType);

      const decodedContent = MimeProcessor.decodeContent(
        content,
        partEncoding,
        partCharset,
      );

      if (partContentType.includes("text/plain")) {
        textContent += decodedContent;
      } else if (partContentType.includes("text/html")) {
        htmlContent += decodedContent;
      }
    }

    // Si pas de HTML, générer depuis le texte
    if (!htmlContent && textContent) {
      htmlContent = MimeProcessor.textToHtml(textContent);
    }

    // Si pas de texte, générer depuis le HTML
    if (!textContent && htmlContent) {
      textContent = MimeProcessor.htmlToText(htmlContent);
    }

    return { text: textContent, html: htmlContent };
  }

  /**
   * Sépare les parties d'un message multipart
   */
  private static splitMultipartParts(body: string, boundary: string): string[] {
    const parts: string[] = [];
    const boundaryLine = `--${boundary}`;
    const endBoundaryLine = `--${boundary}--`;

    const lines = body.split("\n");
    let currentPart: string[] = [];
    let inPart = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith(boundaryLine)) {
        if (inPart) {
          // Sauvegarder la partie précédente
          const partContent = currentPart.join("\n").trim();
          if (partContent && !line.startsWith(endBoundaryLine)) {
            parts.push(partContent);
          }
        }
        currentPart = [];
        inPart = true;
        continue;
      }

      if (inPart) {
        currentPart.push(line);
      }
    }

    return parts;
  }

  /**
   * Parse une partie individuelle
   */
  private static parsePart(part: string): {
    headers: Record<string, string>;
    content: string;
  } {
    const lines = part.split("\n");
    const headers: Record<string, string> = {};
    let contentStart = 0;

    // Parser les headers de la partie
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim() === "") {
        contentStart = i + 1;
        break;
      }

      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).toLowerCase().trim();
        const value = line.substring(colonIndex + 1).trim();
        headers[key] = value;
      }
    }

    const content = lines.slice(contentStart).join("\n");
    return { headers, content };
  }

  /**
   * Décode le contenu selon l'encodage
   */
  private static decodeContent(
    content: string,
    encoding: string,
    charset: string,
  ): string {
    let decoded = content;

    // Appliquer le décodage de transfert
    switch (encoding.toLowerCase()) {
      case "base64":
        try {
          decoded = Buffer.from(content, "base64").toString("binary");
        } catch (error) {
          console.warn("Erreur de décodage base64:", error);
        }
        break;
      case "quoted-printable":
        decoded = MimeProcessor.decodeQuotedPrintable(content);
        break;
    }

    // Convertir vers UTF-8
    return MimeProcessor.convertToUtf8(decoded, charset);
  }

  /**
   * Décode le quoted-printable
   */
  private static decodeQuotedPrintable(str: string): string {
    return str
      .replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      })
      .replace(/=\r?\n/g, ""); // Soft line breaks
  }

  /**
   * Convertit le texte vers UTF-8 en gérant différents charsets
   */
  private static convertToUtf8(text: string, fromCharset: string): string {
    if (!text) return "";

    try {
      // Déjà UTF-8 ou ASCII
      if (
        fromCharset.toLowerCase() === "utf-8" ||
        fromCharset.toLowerCase() === "ascii"
      ) {
        return text;
      }

      // Utiliser TextDecoder pour la conversion
      const decoder = new TextDecoder(fromCharset, { fatal: false });
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      return decoder.decode(bytes);
    } catch (error) {
      console.warn(`Erreur de conversion ${fromCharset} vers UTF-8:`, error);

      // Essayer les charsets courants comme fallback
      for (const charset of MimeProcessor.COMMON_CHARSETS) {
        try {
          const decoder = new TextDecoder(charset, { fatal: false });
          const encoder = new TextEncoder();
          const bytes = encoder.encode(text);
          const decoded = decoder.decode(bytes);
          if (decoded && !decoded.includes("�")) {
            return decoded;
          }
        } catch (e) {
        }
      }

      // Dernier recours: nettoyer les caractères problématiques
      return MimeProcessor.cleanCorruptedText(text);
    }
  }

  /**
   * Nettoie le texte corrompu (ex: RÃ¥dhusgata → Rådhusgata)
   */
  private static cleanCorruptedText(text: string): string {
    try {
      // Convertir en bytes puis décoder comme UTF-8
      const bytes = new Uint8Array(Array.from(text, (c) => c.charCodeAt(0)));
      const decoder = new TextDecoder("utf-8", { fatal: false });
      return decoder.decode(bytes);
    } catch (error) {
      // Si tout échoue, remplacer les caractères problématiques
      return text
        .replace(/Ã¥/g, "å")
        .replace(/Ã¤/g, "ä")
        .replace(/Ã¶/g, "ö")
        .replace(/Ã…/g, "Å")
        .replace(/Ã„/g, "Ä")
        .replace(/Ã–/g, "Ö")
        .replace(/Ã©/g, "é")
        .replace(/Ã¨/g, "è")
        .replace(/Ãª/g, "ê")
        .replace(/Ã«/g, "ë")
        .replace(/Ã /g, "à")
        .replace(/Ã§/g, "ç")
        .replace(/Ã¹/g, "ù")
        .replace(/Ã»/g, "û")
        .replace(/Â /g, " ")
        .replace(/[^\x20-\x7E\u00A0-\u017F\u0400-\u04FF]/g, ""); // Garder ASCII, Latin-1, Cyrillic
    }
  }

  /**
   * Convertit le HTML en texte brut
   */
  private static htmlToText(html: string): string {
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<style[^>]*>.*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&\w+;/g, (match) => {
        // Gérer les entités HTML courantes
        const entities: Record<string, string> = {
          "&aring;": "å",
          "&auml;": "ä",
          "&ouml;": "ö",
          "&Aring;": "Å",
          "&Auml;": "Ä",
          "&Ouml;": "Ö",
          "&eacute;": "é",
          "&egrave;": "è",
          "&ecirc;": "ê",
          "&euml;": "ë",
          "&agrave;": "à",
          "&ccedil;": "ç",
          "&ugrave;": "ù",
          "&ucirc;": "û",
          "&uuml;": "ü",
        };
        return entities[match] || match;
      })
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Convertit le texte brut en HTML simple
   */
  private static textToHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/\n/g, "<br>")
      .replace(/ {2}/g, " &nbsp;");
  }

  /**
   * Nettoie et sécurise le HTML
   */
  private static sanitizeHtml(html: string): string {
    if (!html) return "";

    let sanitized = html;

    // Supprimer les tags dangereux
    MimeProcessor.UNSAFE_TAGS.forEach((tag) => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, "gi");
      sanitized = sanitized.replace(regex, "");

      // Aussi supprimer les tags auto-fermants
      const selfClosingRegex = new RegExp(`<${tag}[^>]*/?>`, "gi");
      sanitized = sanitized.replace(selfClosingRegex, "");
    });

    // Supprimer les attributs dangereux
    MimeProcessor.UNSAFE_ATTRIBUTES.forEach((attr) => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, "gi");
      sanitized = sanitized.replace(regex, "");
    });

    // Supprimer les URLs javascript: et data:
    sanitized = sanitized.replace(
      /(href|src)\s*=\s*["']?(javascript:|data:)/gi,
      '$1="#"',
    );

    // Ajouter des attributs de sécurité aux images externes
    sanitized = sanitized.replace(
      /<img([^>]+)src\s*=\s*["']http[^"']*["']/gi,
      (match, attrs) => {
        return `<img${attrs}src="#" data-external-src="true" data-security-warning="Image externe bloquée"`;
      },
    );

    return sanitized;
  }

  /**
   * Extrait les images et pièces jointes
   */
  private static extractMediaAndAttachments(
    body: string,
    headers: Record<string, string>,
  ): {
    images: EmailImage[];
    attachments: EmailAttachment[];
  } {
    const images: EmailImage[] = [];
    const attachments: EmailAttachment[] = [];

    // Pour l'instant, implémentation simple
    // TODO: Parser complètement les parties multipart pour extraire les médias

    return { images, attachments };
  }

  /**
   * Génère les avertissements de sécurité
   */
  private static generateSecurityWarnings(
    headers: Record<string, string>,
    html: string,
  ): string[] {
    const warnings: string[] = [];

    // Vérifier les headers suspects
    if (headers["x-spam-flag"] === "YES") {
      warnings.push("Cet email a été marqué comme spam");
    }

    if (headers["x-phishing-warning"]) {
      warnings.push("Avertissement de phishing détecté");
    }

    // Vérifier le contenu HTML suspect
    if (html.includes("javascript:") || html.includes("data:")) {
      warnings.push(
        "Le contenu contient des éléments potentiellement dangereux",
      );
    }

    // Vérifier les liens de tracking
    const linkMatches = html.match(
      /<a[^>]+href=["'][^"']*track[^"']*["'][^>]*>/gi,
    );
    if (linkMatches && linkMatches.length > 0) {
      warnings.push("Cet email contient des liens de tracking");
    }

    return warnings;
  }
}
