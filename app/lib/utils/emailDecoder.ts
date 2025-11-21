/**
 * Utilitaire de décodage complet pour les emails
 * Supporte tous les types d'encodage : UTF-8, ISO-8859-1, Windows-1252, etc.
 * Gère : Base64, Quoted-Printable, 7-bit, 8-bit, Binary
 */

// Types d'encodage supportés
export type EncodingType =
  | "7bit"
  | "8bit"
  | "binary"
  | "quoted-printable"
  | "base64"
  | "utf-8"
  | "utf-16"
  | "utf-32"
  | "iso-8859-1"
  | "iso-8859-2"
  | "iso-8859-3"
  | "iso-8859-4"
  | "iso-8859-5"
  | "iso-8859-6"
  | "iso-8859-7"
  | "iso-8859-8"
  | "iso-8859-9"
  | "iso-8859-10"
  | "iso-8859-11"
  | "iso-8859-13"
  | "iso-8859-14"
  | "iso-8859-15"
  | "iso-8859-16"
  | "windows-1250"
  | "windows-1251"
  | "windows-1252"
  | "windows-1253"
  | "windows-1254"
  | "windows-1255"
  | "windows-1256"
  | "windows-1257"
  | "windows-1258"
  | "koi8-r"
  | "koi8-u"
  | "big5"
  | "gb2312"
  | "gbk"
  | "gb18030"
  | "euc-jp"
  | "euc-kr"
  | "shift_jis"
  | "iso-2022-jp"
  | "iso-2022-kr";

interface DecodingOptions {
  fallbackCharset?: string;
  strictMode?: boolean;
  preserveOriginal?: boolean;
}

interface DecodingResult {
  text: string;
  originalEncoding?: string;
  detectedCharset?: string;
  confidence: number;
  warnings: string[];
}

/**
 * Classe principale pour le décodage d'emails
 */
export class EmailDecoder {
  private static readonly CHARSET_ALIASES: Record<string, string> = {
    // UTF aliases
    utf8: "utf-8",
    utf16: "utf-16",
    utf16le: "utf-16le",
    utf16be: "utf-16be",
    utf32: "utf-32",
    utf32le: "utf-32le",
    utf32be: "utf-32be",

    // ISO aliases
    latin1: "iso-8859-1",
    latin2: "iso-8859-2",
    latin3: "iso-8859-3",
    latin4: "iso-8859-4",
    latin5: "iso-8859-9",
    latin6: "iso-8859-10",
    latin7: "iso-8859-13",
    latin8: "iso-8859-14",
    latin9: "iso-8859-15",
    latin10: "iso-8859-16",
    cyrillic: "iso-8859-5",
    arabic: "iso-8859-6",
    greek: "iso-8859-7",
    hebrew: "iso-8859-8",

    // Windows aliases
    cp1250: "windows-1250",
    cp1251: "windows-1251",
    cp1252: "windows-1252",
    cp1253: "windows-1253",
    cp1254: "windows-1254",
    cp1255: "windows-1255",
    cp1256: "windows-1256",
    cp1257: "windows-1257",
    cp1258: "windows-1258",

    // Other aliases
    csbig5: "big5",
    csgb2312: "gb2312",
    csgbk: "gbk",
    csiso2022jp: "iso-2022-jp",
    csiso2022kr: "iso-2022-kr",
    csshiftjis: "shift_jis",
    cseuckr: "euc-kr",
    cseucjp: "euc-jp",
    cseucpkdfmtjapanese: "euc-jp",
    csgb18030: "gb18030",
  };

  private static readonly CHARSET_PATTERNS: Array<{
    pattern: RegExp;
    charset: string;
    confidence: number;
  }> = [
    // High confidence patterns
    { pattern: /charset=["']?utf-8["']?/i, charset: "utf-8", confidence: 0.95 },
    {
      pattern: /charset=["']?iso-8859-1["']?/i,
      charset: "iso-8859-1",
      confidence: 0.9,
    },
    {
      pattern: /charset=["']?windows-1252["']?/i,
      charset: "windows-1252",
      confidence: 0.9,
    },

    // Medium confidence patterns
    {
      pattern: /charset=["']?utf-16["']?/i,
      charset: "utf-16",
      confidence: 0.8,
    },
    {
      pattern: /charset=["']?windows-125[0-8]["']?/i,
      charset: "windows-1252",
      confidence: 0.7,
    },
    {
      pattern: /charset=["']?iso-8859-[0-9]+["']?/i,
      charset: "iso-8859-1",
      confidence: 0.7,
    },

    // Lower confidence patterns
    {
      pattern: /charset=["']?([a-z0-9-]+)["']?/i,
      charset: "utf-8",
      confidence: 0.5,
    },
  ];

  /**
   * Décode le contenu d'un email avec tous les niveaux d'encodage
   */
  static decodeEmailContent(
    content: string,
    contentType: string = "text/plain",
    contentTransferEncoding?: string,
    declaredCharset?: string,
    options: DecodingOptions = {},
  ): DecodingResult {
    const warnings: string[] = [];
    let confidence = 1.0;
    let detectedCharset = declaredCharset;
    const originalEncoding = contentTransferEncoding;

    try {
      // Étape 1: Détection du charset
      if (!detectedCharset) {
        const charsetDetection = EmailDecoder.detectCharset(content, contentType);
        detectedCharset = charsetDetection.charset;
        confidence *= charsetDetection.confidence;

        if (charsetDetection.warnings.length > 0) {
          warnings.push(...charsetDetection.warnings);
        }
      }

      // Étape 2: Normalisation du charset
      const normalizedCharset = EmailDecoder.normalizeCharset(detectedCharset);
      if (normalizedCharset !== detectedCharset) {
        warnings.push(
          `Charset normalisé: ${detectedCharset} → ${normalizedCharset}`,
        );
      }

      // Étape 3: Décodage du Content-Transfer-Encoding
      let decodedContent = EmailDecoder.decodeTransferEncoding(
        content,
        contentTransferEncoding,
      );
      if (
        contentTransferEncoding &&
        contentTransferEncoding !== "7bit" &&
        contentTransferEncoding !== "8bit"
      ) {
        warnings.push(
          `Content-Transfer-Encoding décodé: ${contentTransferEncoding}`,
        );
      }

      // Étape 4: Décodage des encoded-words dans les headers
      if (contentType.includes("text") || !contentType) {
        decodedContent = EmailDecoder.decodeEncodedWords(decodedContent);
      }

      // Étape 5: Conversion du charset
      const finalContent = EmailDecoder.convertCharset(
        decodedContent,
        normalizedCharset,
        options,
      );

      // Étape 6: Nettoyage final
      const cleanedContent = EmailDecoder.cleanDecodedContent(finalContent);

      return {
        text: cleanedContent,
        originalEncoding,
        detectedCharset: normalizedCharset,
        confidence,
        warnings,
      };
    } catch (error) {
      warnings.push(
        `Erreur lors du décodage: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      );

      // Fallback: essayer avec UTF-8
      try {
        const fallbackContent = EmailDecoder.fallbackDecode(content);
        return {
          text: fallbackContent,
          originalEncoding,
          detectedCharset: options.fallbackCharset || "utf-8",
          confidence: 0.3,
          warnings,
        };
      } catch (fallbackError) {
        return {
          text: content, // Retourner le contenu original
          originalEncoding,
          detectedCharset: "unknown",
          confidence: 0.1,
          warnings: [
            ...warnings,
            "Échec du décodage, contenu original retourné",
          ],
        };
      }
    }
  }

  /**
   * Décode le Content-Transfer-Encoding
   */
  private static decodeTransferEncoding(
    content: string,
    encoding?: string,
  ): string {
    if (
      !encoding ||
      encoding === "7bit" ||
      encoding === "8bit" ||
      encoding === "binary"
    ) {
      return content;
    }

    switch (encoding.toLowerCase()) {
      case "quoted-printable":
        return EmailDecoder.decodeQuotedPrintable(content);

      case "base64":
        return EmailDecoder.decodeBase64(content);

      default:
        // Essayer de deviner l'encodage
        if (EmailDecoder.looksLikeBase64(content)) {
          return EmailDecoder.decodeBase64(content);
        } else if (EmailDecoder.looksLikeQuotedPrintable(content)) {
          return EmailDecoder.decodeQuotedPrintable(content);
        }
        return content;
    }
  }

  /**
   * Décode Quoted-Printable avancé
   */
  private static decodeQuotedPrintable(content: string): string {
    return (
      content
        // Gérer les lignes continues (soft line breaks)
        .replace(/=\r?\n/g, "")
        // Décoder les séquences hexadécimales
        .replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        })
        // Gérer les espaces en fin de ligne
        .replace(/ \r?\n/g, "\r\n")
        // Nettoyer les retours à la ligne
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
    );
  }

  /**
   * Décode Base64 avec validation
   */
  private static decodeBase64(content: string): string {
    // Nettoyer le contenu base64
    const cleanContent = content
      .replace(/\s+/g, "")
      .replace(/[^A-Za-z0-9+/=]/g, "");

    try {
      // Utiliser TextDecoder pour une meilleure gestion des charsets
      const binaryString = atob(cleanContent);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    } catch (error) {
      // Fallback: décodage base64 standard
      try {
        return atob(cleanContent);
      } catch (fallbackError) {
        throw new Error(
          `Échec du décodage Base64: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        );
      }
    }
  }

  /**
   * Décode les encoded-words (RFC 2047)
   */
  private static decodeEncodedWords(content: string): string {
    // Pattern pour les encoded-words: =?charset?encoding?encoded-text?=
    const encodedWordPattern = /=\?([^?]+)\?([bqBQ])\?([^?]*)\?=/g;

    return content.replace(
      encodedWordPattern,
      (match, charset, encoding, encodedText) => {
        try {
          // Normaliser le charset
          const normalizedCharset = EmailDecoder.normalizeCharset(charset);

          // Décoder le texte
          let decodedText: string;

          if (encoding.toLowerCase() === "b") {
            // Base64
            decodedText = EmailDecoder.decodeBase64(encodedText);
          } else {
            // Quoted-Printable
            decodedText = EmailDecoder.decodeQuotedPrintable(encodedText);
          }

          // Convertir le charset si nécessaire
          if (normalizedCharset && normalizedCharset !== "utf-8") {
            return EmailDecoder.convertCharset(decodedText, normalizedCharset);
          }

          return decodedText;
        } catch (error) {
          // En cas d'erreur, retourner le texte original
          return match;
        }
      },
    );
  }

  /**
   * Détecte le charset du contenu
   */
  private static detectCharset(
    content: string,
    contentType: string,
  ): { charset: string; confidence: number; warnings: string[] } {
    const warnings: string[] = [];
    let bestMatch = {
      charset: "utf-8",
      confidence: 0.5,
      warnings: [] as string[],
    };

    // 1. Chercher dans les headers Content-Type
    for (const { pattern, charset, confidence } of EmailDecoder.CHARSET_PATTERNS) {
      if (pattern.test(content)) {
        return { charset, confidence, warnings: [] };
      }
    }

    // 2. Analyse heuristique du contenu
    const heuristics = EmailDecoder.analyzeContentHeuristics(content);
    if (heuristics.confidence > bestMatch.confidence) {
      bestMatch = {
        charset: heuristics.charset,
        confidence: heuristics.confidence,
        warnings: [],
      };
    }

    // 3. Détection par BOM (Byte Order Mark)
    const bomDetection = EmailDecoder.detectBOM(content);
    if (bomDetection.confidence > bestMatch.confidence) {
      bestMatch = {
        charset: bomDetection.charset,
        confidence: bomDetection.confidence,
        warnings: [],
      };
    }

    return bestMatch;
  }

  /**
   * Analyse heuristique du contenu pour détecter le charset
   */
  private static analyzeContentHeuristics(content: string): {
    charset: string;
    confidence: number;
  } {
    // Compter les caractères non-ASCII
    const nonAsciiCount = (content.match(/[^\x00-\x7F]/g) || []).length;
    const totalChars = content.length;
    const nonAsciiRatio = nonAsciiCount / totalChars;

    // Si peu de caractères non-ASCII, probablement UTF-8 ou ISO-8859-1
    if (nonAsciiRatio < 0.01) {
      return { charset: "utf-8", confidence: 0.7 };
    }

    // Chercher des patterns spécifiques
    if (
      content.includes("Ã©") ||
      content.includes("Ã¨") ||
      content.includes("Ã ")
    ) {
      return { charset: "iso-8859-1", confidence: 0.8 }; // Double-encoded UTF-8
    }

    if (
      content.includes("€") ||
      content.includes("'") ||
      content.includes('"')
    ) {
      return { charset: "windows-1252", confidence: 0.7 };
    }

    // Détection de caractères cyrilliques
    if (/[а-яё]/i.test(content)) {
      return { charset: "windows-1251", confidence: 0.6 };
    }

    // Détection de caractères arabes
    if (/[\u0600-\u06FF]/.test(content)) {
      return { charset: "windows-1256", confidence: 0.6 };
    }

    // Détection de caractères asiatiques
    if (/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/.test(content)) {
      return { charset: "utf-8", confidence: 0.8 };
    }

    return { charset: "utf-8", confidence: 0.5 };
  }

  /**
   * Détecte le BOM (Byte Order Mark)
   */
  private static detectBOM(content: string): {
    charset: string;
    confidence: number;
  } {
    if (content.startsWith("\xEF\xBB\xBF")) {
      return { charset: "utf-8", confidence: 0.95 };
    }

    if (content.startsWith("\xFF\xFE")) {
      return { charset: "utf-16le", confidence: 0.95 };
    }

    if (content.startsWith("\xFE\xFF")) {
      return { charset: "utf-16be", confidence: 0.95 };
    }

    return { charset: "utf-8", confidence: 0 };
  }

  /**
   * Normalise le nom du charset
   */
  private static normalizeCharset(charset?: string): string {
    if (!charset) return "utf-8";

    const normalized = charset.toLowerCase().trim();
    return EmailDecoder.CHARSET_ALIASES[normalized] || normalized;
  }

  /**
   * Convertit le charset si nécessaire
   */
  private static convertCharset(
    content: string,
    fromCharset: string,
    options: DecodingOptions = {},
  ): string {
    if (fromCharset === "utf-8" || fromCharset === "utf8") {
      return content;
    }

    try {
      // Utiliser TextDecoder/TextEncoder API si disponible
      if (typeof TextDecoder !== "undefined") {
        // Convertir en bytes puis décoder avec UTF-8
        const encoder = new TextEncoder();
        const bytes = encoder.encode(content);

        // Essayer de décoder avec le charset source
        try {
          const decoder = new TextDecoder(fromCharset, {
            fatal: !options.strictMode,
          });
          return decoder.decode(bytes);
        } catch (error) {
          // Si le décodage échoue, essayer avec des alternatives
          const alternatives = EmailDecoder.getCharsetAlternatives(fromCharset);
          for (const altCharset of alternatives) {
            try {
              const decoder = new TextDecoder(altCharset, { fatal: false });
              return decoder.decode(bytes);
            } catch (altError) {
            }
          }
          throw error;
        }
      }
    } catch (error) {
      // Fallback: retourner le contenu original
      console.warn(`Échec de la conversion de charset ${fromCharset}:`, error);
    }

    return content;
  }

  /**
   * Obtient des alternatives de charset
   */
  private static getCharsetAlternatives(charset: string): string[] {
    const alternatives: string[] = [];

    // Mapping des alternatives
    const alternativeMap: Record<string, string[]> = {
      "iso-8859-1": ["windows-1252", "cp1252"],
      "windows-1252": ["iso-8859-1", "cp1252"],
      "iso-8859-15": ["iso-8859-1", "windows-1252"],
      "windows-1251": ["iso-8859-5", "koi8-r"],
      "koi8-r": ["windows-1251", "iso-8859-5"],
      shift_jis: ["euc-jp", "iso-2022-jp"],
      "euc-jp": ["shift_jis", "iso-2022-jp"],
    };

    return alternativeMap[charset] || ["utf-8"];
  }

  /**
   * Nettoie le contenu décodé
   */
  private static cleanDecodedContent(content: string): string {
    return (
      content
        // Nettoyer les caractères de contrôle
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        // Normaliser les espaces
        .replace(/\s+/g, " ")
        // Nettoyer les lignes vides multiples
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim()
    );
  }

  /**
   * Vérifie si le contenu ressemble à du Base64
   */
  private static looksLikeBase64(content: string): boolean {
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    const lines = content.split("\n").filter((line) => line.trim().length > 0);

    if (lines.length === 0) return false;

    // Vérifier si la majorité des lignes ressemblent à du base64
    const base64Lines = lines.filter((line) => base64Pattern.test(line.trim()));
    return base64Lines.length / lines.length > 0.7;
  }

  /**
   * Vérifie si le contenu ressemble à du Quoted-Printable
   */
  private static looksLikeQuotedPrintable(content: string): boolean {
    const qpPattern = /=([0-9A-Fa-f]{2})|=\r?\n/;
    return qpPattern.test(content);
  }

  /**
   * Décode de secours en cas d'échec
   */
  private static fallbackDecode(content: string): string {
    try {
      // Essayer de décoder avec TextDecoder
      if (typeof TextDecoder !== "undefined") {
        const bytes = new Uint8Array(content.length);
        for (let i = 0; i < content.length; i++) {
          bytes[i] = content.charCodeAt(i);
        }
        const decoder = new TextDecoder("utf-8", { fatal: false });
        return decoder.decode(bytes);
      }
    } catch {
      // Continuer avec les autres méthodes
    }

    try {
      // Essayer une conversion simple
      return content;
    } catch {
      // Dernier recours: retourner le contenu tel quel
      return content;
    }
  }

  /**
   * Décode un header email complet
   */
  static decodeEmailHeader(header: string): DecodingResult {
    return EmailDecoder.decodeEmailContent(header, "text/plain", undefined, undefined, {
      strictMode: false,
      preserveOriginal: true,
    });
  }

  /**
   * Décode le sujet d'un email
   */
  static decodeEmailSubject(subject: string): string {
    const result = EmailDecoder.decodeEmailHeader(subject);
    return result.text;
  }

  /**
   * Décode les adresses email
   */
  static decodeEmailAddresses(addresses: string): string {
    const result = EmailDecoder.decodeEmailHeader(addresses);
    return result.text;
  }
}

// Export types for external use
export type { DecodingOptions, DecodingResult };

export default EmailDecoder;
