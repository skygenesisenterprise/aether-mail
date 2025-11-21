import type { Email } from "../../hooks/useEmails";
import { authService } from "./backend-auth-service";

export interface MailConfig {
  imapHost: string;
  imapPort: number;
  imapTls: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  username: string;
  password: string;
}

export interface MailServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class MailService {
  private baseUrl: string;
  private config: MailConfig | null = null;

  constructor(baseUrl: string = "http://localhost:8080/api/v1") {
    this.baseUrl = baseUrl;
  }

  // Obtenir les headers d'authentification
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Récupérer les informations d'authentification depuis localStorage
    const mailEmail = localStorage.getItem("mailEmail");
    const mailUserId = localStorage.getItem("mailUserId");
    const authToken = localStorage.getItem("authToken");

    // Utiliser les informations stockées après connexion
    if (mailEmail && mailUserId) {
      headers["x-user-id"] = mailUserId;
      headers["x-user-email"] = mailEmail;

      // Ajouter le token d'authentification si disponible
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
    } else {
      // Fallback : essayer avec authService
      const user = authService.getUser();
      if (user?.email) {
        const userId = Buffer.from(user.email)
          .toString("base64")
          .replace(/=/g, "");
        headers["x-user-id"] = userId;
        headers["x-user-email"] = user.email;

        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }
      }
    }

    return headers;
  }

  // Connecter au serveur mail
  async connectMail(
    email: string,
    password: string,
  ): Promise<MailServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/mail/connect`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: result,
          message: "Connexion réussie",
        };
      } else {
        return {
          success: false,
          error: result.error || "Erreur de connexion",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau",
      };
    }
  }

  // Récupérer les emails depuis un dossier
  async fetchEmails(
    folder: string = "inbox",
    limit: number = 50,
  ): Promise<MailServiceResponse<Email[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/mail/emails?folder=${folder}&limit=${limit}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        },
      );

      // Vérifier si la réponse est du JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        if (text.includes("<!DOCTYPE") || text.includes("<html")) {
          return {
            success: false,
            error:
              "Le serveur retourne du HTML au lieu de JSON. Le backend est-il démarré ?",
          };
        }
        return {
          success: false,
          error: `Réponse invalide du serveur: ${text.substring(0, 100)}...`,
        };
      }

      const result = await response.json();

      if (response.ok) {
        // Transformer les données du serveur en format Email
        const emails: Email[] = (result.emails || []).map(
          (email: any, index: number) => {
            // Utiliser uid comme ID unique car le backend ne fournit pas id/messageId
            const emailId = email.uid || `email_${index}_${Date.now()}`;

            // Extraire les informations depuis headers (structure du backend)
            const headers = email.headers || {};
            const attributes = email.attributes || {};

            // Parser l'expéditeur depuis headers.from ou envelope
            let fromName = "Inconnu";
            let fromEmailAddress = "inconnu@example.com";

            // Essayer d'abord depuis l'envelope (plus fiable)
            if (email.envelope?.from && email.envelope.from.length > 0) {
              const from = email.envelope.from[0];
              fromName = from.name || from.mailbox || "Inconnu";
              fromEmailAddress = from.host
                ? `${from.mailbox}@${from.host}`
                : from.mailbox || "inconnu@example.com";
            }
            // Fallback sur headers.from
            else if (headers.from) {
              const fromString = Array.isArray(headers.from)
                ? headers.from[0]
                : headers.from;
              if (typeof fromString === "string") {
                const fromMatch = fromString.match(/^(.+?)\s*<(.+?)>$/);
                if (fromMatch) {
                  fromName = fromMatch[1].trim().replace(/"/g, "");
                  fromEmailAddress = fromMatch[2];
                } else if (fromString.includes("<")) {
                  fromEmailAddress =
                    fromString.match(/<(.+?)>/)?.[1] || fromString;
                  fromName = fromEmailAddress.split("@")[0];
                } else {
                  fromName = fromString;
                  fromEmailAddress = fromString.includes("@")
                    ? fromString
                    : `${fromString}@example.com`;
                }
              }
            }

            // Parser le sujet depuis headers.subject ou envelope
            let subject = "Sans sujet";
            if (headers.subject) {
              const subjectArray = Array.isArray(headers.subject)
                ? headers.subject
                : [headers.subject];
              subject = subjectArray[0] || "Sans sujet";
            } else if (email.envelope?.subject) {
              subject = email.envelope.subject;
            }

            // Parser le destinataire depuis headers.to ou envelope
            let to = "Moi";
            if (email.envelope?.to && email.envelope.to.length > 0) {
              const recipient = email.envelope.to[0];
              to = recipient.host
                ? `${recipient.mailbox}@${recipient.host}`
                : recipient.mailbox || "Moi";
            } else if (headers.to) {
              const toString = Array.isArray(headers.to)
                ? headers.to[0]
                : headers.to;
              to = typeof toString === "string" ? toString : "Moi";
            }

            // Déterminer les flags depuis le tableau flags
            const flags = Array.isArray(email.flags) ? email.flags : [];
            const isRead = flags.includes("\\Seen") || email.seen || false;
            const isStarred =
              flags.includes("\\Flagged") || email.flagged || false;
            const hasAttachment =
              flags.includes("\\Attachment") ||
              (email.attachments && email.attachments.length > 0) ||
              false;

            // Utiliser preview du backend ou générer un aperçu
            let preview = email.preview || "";
            if (preview) {
              // Décoder le quoted-printable si nécessaire
              if (preview.includes("=")) {
                try {
                  // Simple quoted-printable decode pour les caractères de base
                  preview = preview.replace(
                    /=([0-9A-F]{2})/g,
                    (match: string, hex: string) => {
                      return String.fromCharCode(parseInt(hex, 16));
                    },
                  );
                  // Nettoyer les caractères spéciaux
                  preview = preview
                    .replace(/=C3=A9/g, "é")
                    .replace(/=C3=A8/g, "è")
                    .replace(/=C3=A7/g, "ç")
                    .replace(/=C3=B4/g, "ô")
                    .replace(/=C3=AA/g, "ê")
                    .replace(/=C3=AE/g, "®")
                    .replace(/=E2=80=99/g, "'")
                    .replace(/=E2=80=9C/g, "")
                    .replace(/=E2=80=9D/g, "")
                    .replace(/=C2=A0/g, " ");
                } catch (e) {
                  console.warn("Erreur lors du décodage du preview:", e);
                }
              }
            } else {
              preview = "Aperçu non disponible";
            }

            // Obtenir une date valide pour le tri
            let validDate = new Date();
            try {
              // Priorité 1: email.date (le plus fiable)
              if (email.date) {
                const parsedDate = new Date(email.date);
                if (!isNaN(parsedDate.getTime())) {
                  validDate = parsedDate;
                }
              }
              // Priorité 2: attributes.date
              else if (attributes.date) {
                const parsedDate = new Date(attributes.date);
                if (!isNaN(parsedDate.getTime())) {
                  validDate = parsedDate;
                }
              }
            } catch (e) {
              console.warn("Date invalide:", email.date, attributes.date);
              validDate = new Date();
            }

            return {
              id: emailId,
              from: fromName,
              fromEmail: fromEmailAddress,
              to: to,
              subject: subject,
              body: email.text || email.html || "",
              preview: preview,
              date: this.formatDate(validDate),
              isRead: isRead,
              isStarred: isStarred,
              hasAttachment: hasAttachment,
              folder: email.folder || folder,
              attachments: email.attachments || [],
              // Ajouter la date brute pour le tri
              _rawDate: validDate,
            };
          },
        );

        // Trier les emails par date décroissante (plus récents en premier)
        emails.sort((a, b) => {
          // Utiliser la date brute stockée dans _rawDate pour le tri
          const dateA = (a as any)._rawDate || new Date(a.date || 0);
          const dateB = (b as any)._rawDate || new Date(b.date || 0);

          // Tri par date décroissante (plus récents en premier)
          return dateB.getTime() - dateA.getTime();
        });

        return { success: true, data: emails };
      } else {
        return {
          success: false,
          error: result.error || "Erreur lors de la récupération des emails",
        };
      }
    } catch (error) {
      // Vérifier si c'est une erreur de parsing JSON
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return {
          success: false,
          error:
            "Le serveur a retourné une réponse non-JSON. Vérifiez que l'API backend fonctionne correctement.",
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau",
      };
    }
  }

  // Marquer un email comme lu/non lu
  async markEmailAsRead(
    emailId: string,
    isRead: boolean,
  ): Promise<MailServiceResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/mail/emails/${emailId}/read`,
        {
          method: "PATCH",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ isRead }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return {
          success: false,
          error: result.error || "Erreur lors du marquage",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau",
      };
    }
  }

  // Basculer l'étoile d'un email
  async toggleEmailStar(
    emailId: string,
    isStarred: boolean,
  ): Promise<MailServiceResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/mail/emails/${emailId}/star`,
        {
          method: "PATCH",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ isStarred }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return {
          success: false,
          error: result.error || "Erreur lors du basculement de l'étoile",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau",
      };
    }
  }

  // Supprimer un email
  async deleteEmail(emailId: string): Promise<MailServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/mail/emails/${emailId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return {
          success: false,
          error: result.error || "Erreur lors de la suppression",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau",
      };
    }
  }

  // Archiver un email
  async archiveEmail(
    emailId: string,
    folder: string = "archive",
  ): Promise<MailServiceResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/mail/emails/${emailId}/move`,
        {
          method: "PATCH",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ folder }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return {
          success: false,
          error: result.error || "Erreur lors de l'archivage",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau",
      };
    }
  }

  // Envoyer un email
  async sendEmail(email: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
    attachments?: Array<{
      name: string;
      content: string;
      type: string;
    }>;
  }): Promise<MailServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(email),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: result,
          message: "Email envoyé avec succès",
        };
      } else {
        return {
          success: false,
          error: result.error || "Erreur lors de l'envoi",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau",
      };
    }
  }

  // Obtenir les dossiers disponibles
  async getFolders(): Promise<MailServiceResponse<string[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/mail/folders`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: result.folders || [
            "inbox",
            "sent",
            "drafts",
            "archive",
            "trash",
          ],
        };
      } else {
        return {
          success: false,
          error: result.error || "Erreur lors de la récupération des dossiers",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau",
      };
    }
  }

  // Utilitaire pour formater les dates
  private formatDate(dateInput: string | number | Date): string {
    let date: Date;

    try {
      date = new Date(dateInput);

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn("Date invalide:", dateInput);
        return "Date invalide";
      }
    } catch (e) {
      console.warn("Erreur de formatage de date:", dateInput, e);
      return "Date invalide";
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const emailDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    // Si c'est aujourd'hui, afficher l'heure
    if (today.toDateString() === emailDay.toDateString()) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return "Il y a quelques minutes";
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  }

  // Obtenir la configuration actuelle
  getConfig(): MailConfig | null {
    return this.config;
  }

  // Vérifier si le service est configuré
  isConfigured(): boolean {
    return this.config !== null;
  }
}

export const mailService = new MailService();
export default MailService;
