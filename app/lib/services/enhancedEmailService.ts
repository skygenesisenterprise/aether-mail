import {
  MimeProcessor,
  type ProcessedEmail,
  type EmailAttachment,
  type EmailImage,
} from "./mimeProcessor";

// Interface pour l'email brut (venant de l'API ou du stockage)
export interface RawEmail {
  id: string;
  rawMime?: string;
  from?: string;
  fromEmail?: string;
  to?: string;
  subject?: string;
  body?: string;
  date?: string;
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachment?: boolean;
  folder?: string;
  preview?: string;
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
  }>;
  cc?: string;
  bcc?: string;
}

// Interface pour l'email traité (prêt pour l'affichage)
export interface EnhancedEmail extends RawEmail {
  processedContent?: {
    subject: string;
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    text: string;
    html: string;
    images: EmailImage[];
    attachments: EmailAttachment[];
    warnings: string[];
  };
  displayBody: string;
  displaySubject: string;
  displayFrom: string;
  displayTo: string;
  hasExternalImages: boolean;
  securityWarnings: string[];
}

/**
 * Service amélioré pour le traitement des emails
 */
export class EnhancedEmailService {
  private static processedEmailsCache = new Map<string, ProcessedEmail>();

  /**
   * Traite un email brut pour l'affichage
   */
  static async processEmailForDisplay(
    rawEmail: RawEmail,
  ): Promise<EnhancedEmail> {
    try {
      let processedContent: ProcessedEmail | undefined;

      // Si on a du MIME brut, utiliser le processeur MIME
      if (rawEmail.rawMime) {
        const cacheKey = `${rawEmail.id}_${rawEmail.rawMime.length}`;

        if (!EnhancedEmailService.processedEmailsCache.has(cacheKey)) {
          processedContent = await MimeProcessor.processMimeEmail(
            rawEmail.rawMime,
          );
          EnhancedEmailService.processedEmailsCache.set(cacheKey, processedContent);
        } else {
          processedContent = EnhancedEmailService.processedEmailsCache.get(cacheKey)!;
        }
      } else {
        // Fallback: traiter le contenu existant
        processedContent = EnhancedEmailService.processLegacyContent(rawEmail);
      }

      // Déterminer le corps à afficher
      const displayBody = EnhancedEmailService.selectBestDisplayBody(
        processedContent,
        rawEmail,
      );

      // Nettoyer les headers pour l'affichage
      const displaySubject = EnhancedEmailService.cleanHeaderText(
        processedContent.subject || rawEmail.subject || "",
      );
      const displayFrom = EnhancedEmailService.cleanHeaderText(
        processedContent.from || rawEmail.from || "",
      );
      const displayTo = EnhancedEmailService.cleanHeaderText(
        processedContent.to || rawEmail.to || "",
      );

      // Détecter les images externes
      const hasExternalImages = EnhancedEmailService.detectExternalImages(displayBody);

      // Générer les avertissements de sécurité
      const securityWarnings = [
        ...processedContent.warnings,
        ...(hasExternalImages
          ? ["Cet email contient des images externes qui ont été bloquées"]
          : []),
      ];

      return {
        ...rawEmail,
        processedContent,
        displayBody,
        displaySubject,
        displayFrom,
        displayTo,
        hasExternalImages,
        securityWarnings,
        cc: processedContent.cc || rawEmail.cc,
        bcc: processedContent.bcc || rawEmail.bcc,
      };
    } catch (error) {
      console.error("Erreur lors du traitement de l'email:", error);

      // Fallback en cas d'erreur
      return {
        ...rawEmail,
        displayBody: EnhancedEmailService.fallbackProcessing(rawEmail),
        displaySubject: rawEmail.subject || "Sans objet",
        displayFrom: rawEmail.from || "Expéditeur inconnu",
        displayTo: rawEmail.to || "Destinataire inconnu",
        hasExternalImages: false,
        securityWarnings: ["Erreur lors du traitement de l'email"],
      };
    }
  }

  /**
   * Traite le contenu legacy (non-MIME)
   */
  private static processLegacyContent(rawEmail: RawEmail): ProcessedEmail {
    const body = rawEmail.body || rawEmail.preview || "";
    const isHtml = body.includes("<") && body.includes(">");

    let text = body;
    let html = body;

    if (isHtml) {
      text = EnhancedEmailService.htmlToText(body);
    } else {
      html = EnhancedEmailService.textToHtml(body);
    }

    return {
      subject: rawEmail.subject || "",
      from: rawEmail.from || "",
      to: rawEmail.to || "",
      cc: rawEmail.cc,
      bcc: rawEmail.bcc,
      date: rawEmail.date || new Date().toISOString(),
      text,
      html,
      images: [],
      attachments:
        rawEmail.attachments?.map((att) => ({
          name: att.name,
          size: parseFloat(att.size) * 1024 * 1024, // Convertir MB en bytes
          type: att.type,
        })) || [],
      warnings: [],
      headers: {},
    };
  }

  /**
   * Sélectionne le meilleur corps pour l'affichage
   */
  private static selectBestDisplayBody(
    processedContent: ProcessedEmail,
    rawEmail: RawEmail,
  ): string {
    // Priorité: HTML traité > texte brut > preview > body original
    if (processedContent.html && processedContent.html.trim() !== "") {
      return processedContent.html;
    }

    if (processedContent.text && processedContent.text.trim() !== "") {
      return EnhancedEmailService.textToHtml(processedContent.text);
    }

    if (rawEmail.preview && rawEmail.preview.trim() !== "") {
      return EnhancedEmailService.textToHtml(rawEmail.preview);
    }

    if (rawEmail.body && rawEmail.body.trim() !== "") {
      // Vérifier si c'est du HTML
      if (rawEmail.body.includes("<") && rawEmail.body.includes(">")) {
        return rawEmail.body;
      } else {
        return EnhancedEmailService.textToHtml(rawEmail.body);
      }
    }

    return "<p>Cet email ne contient pas de contenu.</p>";
  }

  /**
   * Nettoie le texte des headers (résout les problèmes d'encodage)
   */
  private static cleanHeaderText(text: string): string {
    if (!text) return "";

    // Corriger les problèmes d'encodage courants
    return text
      .replace(/RÃ¥/g, "Rå")
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
      .replace(/=\?[^?]+\?[BQ]\?[^?]+\?=/gi, (match) => {
        // Tenter de décoder les encoded words restants
        try {
          return EnhancedEmailService.decodeEncodedWord(match);
        } catch {
          return match;
        }
      });
  }

  /**
   * Décode un mot encodé MIME simple
   */
  private static decodeEncodedWord(encodedWord: string): string {
    const match = encodedWord.match(/=\?([^?]+)\?([bq])\?([^?]+)\?=/i);
    if (!match) return encodedWord;

    const [, charset, encoding, encodedText] = match;

    try {
      let decoded: string;

      if (encoding.toLowerCase() === "b") {
        decoded = Buffer.from(encodedText, "base64").toString("binary");
      } else {
        decoded = encodedText
          .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16)),
          )
          .replace(/=\r?\n/g, "");
      }

      // Convertir vers UTF-8
      const bytes = new Uint8Array(Array.from(decoded, (c) => c.charCodeAt(0)));
      const decoder = new TextDecoder(charset, { fatal: false });
      return decoder.decode(bytes);
    } catch {
      return encodedWord;
    }
  }

  /**
   * Détecte les images externes dans le HTML
   */
  private static detectExternalImages(html: string): boolean {
    const imgRegex = /<img[^>]+src\s*=\s*["']https?:\/\/[^"']*["']/gi;
    return imgRegex.test(html);
  }

  /**
   * Convertit HTML en texte brut
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
   * Convertit texte en HTML simple
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
   * Traitement de fallback en cas d'erreur
   */
  private static fallbackProcessing(rawEmail: RawEmail): string {
    const content =
      rawEmail.body || rawEmail.preview || "Contenu non disponible";

    // Nettoyer et afficher le contenu de base
    const cleaned = EnhancedEmailService.cleanHeaderText(content);

    if (cleaned.includes("<") && cleaned.includes(">")) {
      return cleaned; // C'est probablement du HTML
    } else {
      return EnhancedEmailService.textToHtml(cleaned);
    }
  }

  /**
   * Vide le cache des emails traités
   */
  static clearCache(): void {
    EnhancedEmailService.processedEmailsCache.clear();
  }

  /**
   * Retourne les statistiques de traitement
   */
  static getProcessingStats(): { cacheSize: number } {
    return {
      cacheSize: EnhancedEmailService.processedEmailsCache.size,
    };
  }
}
