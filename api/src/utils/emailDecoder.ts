import { simpleParser } from "mailparser";

/**
 * Utilitaire de décodage d'emails pour le backend
 * Gère l'encodage des headers, sujets, et contenus
 */
export class EmailDecoder {
  /**
   * Décode un header email (sujet, from, to, etc.)
   */
  static decodeHeader(header: any): string {
    if (!header) return "";

    // Si c'est déjà une chaîne
    if (typeof header === "string") {
      return EmailDecoder.decodeEncodedWords(header);
    }

    // Si c'est un tableau
    if (Array.isArray(header)) {
      return header.map((h) => EmailDecoder.decodeHeader(h)).join(", ");
    }

    // Si c'est un objet (ex: { address: 'email@example.com', name: 'Name' })
    if (typeof header === "object" && header !== null) {
      if (header.name && header.address) {
        return `${EmailDecoder.decodeEncodedWords(header.name)} <${header.address}>`;
      }
      if (header.address) {
        return header.address;
      }
      if (header.name) {
        return EmailDecoder.decodeEncodedWords(header.name);
      }
    }

    return String(header);
  }

  /**
   * Décode les encoded-words RFC 2047: =?charset?encoding?encoded-text?=
   */
  static decodeEncodedWords(text: string): string {
    if (!text) return "";

    // Pattern pour les encoded-words
    const encodedWordPattern = /=\?([^?]+)\?([bqBQ])\?([^?]*)\?=/g;

    return text.replace(
      encodedWordPattern,
      (match, charset, encoding, encodedText) => {
        try {
          // Normaliser le charset
          const normalizedCharset = EmailDecoder.normalizeCharset(charset);

          // Décoder le texte
          let decodedText: string;

          if (encoding.toLowerCase() === "b") {
            // Base64
            decodedText = Buffer.from(encodedText, "base64").toString("latin1");
          } else {
            // Quoted-Printable
            decodedText = EmailDecoder.decodeQuotedPrintable(encodedText);
          }

          // Convertir le charset si nécessaire
          if (normalizedCharset && normalizedCharset !== "utf-8") {
            try {
              // Convertir en buffer puis décoder avec le bon charset
              const buffer = Buffer.from(decodedText, "latin1");
              return buffer.toString(normalizedCharset as BufferEncoding);
            } catch (error) {
              console.warn(
                `Erreur de conversion de charset ${normalizedCharset}:`,
                error,
              );
              return decodedText;
            }
          }

          return decodedText;
        } catch (error) {
          console.warn(`Erreur de décodage de ${match}:`, error);
          return match; // Retourner l'original en cas d'erreur
        }
      },
    );
  }

  /**
   * Décode Quoted-Printable
   */
  static decodeQuotedPrintable(text: string): string {
    return (
      text
        // Gérer les lignes continues (soft line breaks)
        .replace(/=\r?\n/g, "")
        // Décoder les séquences hexadécimales
        .replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        })
        // Gérer les espaces en fin de ligne
        .replace(/ \r?\n/g, "\r\n")
    );
  }

  /**
   * Normalise le nom du charset
   */
  static normalizeCharset(charset: string): string {
    if (!charset) return "utf-8";

    const normalized = charset.toLowerCase().trim();
    const aliases: Record<string, string> = {
      utf8: "utf-8",
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
      cp1252: "windows-1252",
      cp1251: "windows-1251",
      cswindows1252: "windows-1252",
      cswindows1251: "windows-1251",
    };

    return aliases[normalized] || normalized;
  }

  /**
   * Décode le contenu complet d'un email
   */
  static async decodeEmailContent(
    imap: any,
    uid: number,
    folder: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // Ouvrir la boîte de réception
      imap.openBox(folder, false, (err: any, box: any) => {
        if (err) {
          reject(err);
          return;
        }

        // Récupérer le message complet
        const fetch = imap.fetch(uid, {
          bodies: "",
          struct: true,
          envelope: true,
        });

        fetch.on("message", (msg: any, seqno: any) => {
          const email: any = { uid, folder, seqno };

          msg.on("body", async (stream: any, info: any) => {
            if (info.which === "") {
              try {
                // Collecter les données du message
                let buffer = Buffer.alloc(0);
                stream.on("data", (chunk: any) => {
                  buffer = Buffer.concat([buffer, chunk]);
                });

                stream.once("end", async () => {
                  try {
                    // Parser le message avec mailparser
                    const parsed = await simpleParser(buffer);

                    // Extraire les informations décodées
                    email.subject = EmailDecoder.decodeHeader(parsed.subject);
                    email.from = EmailDecoder.decodeHeader(parsed.from);
                    email.to = EmailDecoder.decodeHeader(parsed.to);
                    email.cc = EmailDecoder.decodeHeader(parsed.cc);
                    email.bcc = EmailDecoder.decodeHeader(parsed.bcc);
                    email.date = parsed.date || new Date();
                    email.messageId = parsed.messageId;

                    // Contenu textuel
                    email.text = parsed.text || "";
                    email.html = parsed.html || "";

                    // Créer un preview
                    const textContent = parsed.text || parsed.html || "";
                    email.preview = textContent
                      .replace(/\s+/g, " ")
                      .substring(0, 200)
                      .trim();
                    if (textContent.length > 200) email.preview += "...";

                    // Pièces jointes
                    email.attachments = parsed.attachments || [];
                    email.hasAttachment = email.attachments.length > 0;

                    resolve(email);
                  } catch (parseError) {
                    console.error(
                      "Erreur lors du parsing de l'email:",
                      parseError,
                    );
                    // Fallback: parsing manuel
                    EmailDecoder.fallbackParsing(buffer, email);
                    resolve(email);
                  }
                });
              } catch (error) {
                console.error("Erreur lors du décodage de l'email:", error);
                reject(error);
              }
            }
          });

          msg.once("attributes", (attrs: any) => {
            email.attributes = attrs;
            email.flags = attrs.flags || [];
            email.size = attrs.size;
          });

          msg.once("envelope", (envelope: any) => {
            email.envelope = envelope;
          });
        });

        fetch.once("error", reject);
      });
    });
  }

  /**
   * Parsing manuel en fallback si mailparser échoue
   */
  private static fallbackParsing(buffer: Buffer, email: any): void {
    try {
      const message = buffer.toString("latin1");

      // Parser les headers manuellement
      const lines = message.split("\r\n");
      let bodyStart = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line === "" && bodyStart === 0) {
          bodyStart = i + 1;
          break;
        }

        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const headerName = line.substring(0, colonIndex).trim().toLowerCase();
          const headerValue = line.substring(colonIndex + 1).trim();

          switch (headerName) {
            case "subject":
              email.subject = EmailDecoder.decodeHeader(headerValue);
              break;
            case "from":
              email.from = EmailDecoder.decodeHeader(headerValue);
              break;
            case "to":
              email.to = EmailDecoder.decodeHeader(headerValue);
              break;
            case "date":
              email.date = new Date(headerValue);
              break;
            case "message-id":
              email.messageId = headerValue;
              break;
          }
        }
      }

      // Extraire le corps du message
      const body = lines.slice(bodyStart).join("\r\n");
      email.text = body;
      email.preview = body.replace(/\s+/g, " ").substring(0, 200).trim();
      if (body.length > 200) email.preview += "...";
    } catch (error) {
      console.error("Erreur lors du parsing manuel:", error);
      // Valeurs par défaut
      email.subject = email.subject || "Sujet indisponible";
      email.from = email.from || "Expéditeur inconnu";
      email.text = email.text || "";
      email.preview = email.preview || "Aperçu non disponible";
    }
  }
}
