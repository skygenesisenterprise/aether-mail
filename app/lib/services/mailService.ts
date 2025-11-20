import { Email } from "../../hooks/useEmails";

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

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  // Configuration du serveur mail
  async configureMail(config: MailConfig): Promise<MailServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/mail/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      if (response.ok) {
        this.config = config;
        return {
          success: true,
          data: result,
          message: "Configuration réussie",
        };
      } else {
        return {
          success: false,
          error: result.error || "Erreur de configuration",
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
          headers: {
            "Content-Type": "application/json",
          },
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
        const emails: Email[] = (result.emails || []).map((email: any) => ({
          id: email.id || email.messageId,
          from:
            email.from || email.fromAddress?.split("<")[0]?.trim() || "Inconnu",
          fromEmail:
            email.fromEmail || email.fromAddress || "inconnu@example.com",
          to: email.to || email.toAddress || "Moi",
          subject: email.subject || "Sans sujet",
          body: email.body || email.text || email.html || "",
          preview:
            email.preview ||
            (email.text || email.html || "").substring(0, 100) + "...",
          date: this.formatDate(email.date || email.receivedDate || new Date()),
          isRead: email.isRead || email.seen || false,
          isStarred: email.isStarred || email.flagged || false,
          hasAttachment:
            email.hasAttachment ||
            (email.attachments && email.attachments.length > 0) ||
            false,
          folder: email.folder || folder,
          attachments: email.attachments || [],
        }));

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
          headers: {
            "Content-Type": "application/json",
          },
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
          headers: {
            "Content-Type": "application/json",
          },
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
          headers: {
            "Content-Type": "application/json",
          },
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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
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
  private formatDate(dateString: string | number | Date): string {
    const date = new Date(dateString);
    const now = new Date();
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
