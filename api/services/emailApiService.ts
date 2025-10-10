// api/services/emailApiService.ts
import { apiService } from "./apiService";

export interface EmailApiResponse {
  id: string;
  subject: string;
  body: string;
  from: {
    name: string;
    email: string;
    verified?: boolean;
  };
  to: string;
  cc?: string;
  bcc?: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isEncrypted: boolean;
  hasAttachments: boolean;
  attachments?: Array<{
    id: string;
    filename: string;
    filetype: string;
    filesize: number;
  }>;
  labels?: string[];
}

export interface SendEmailRequest {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    contentType: string;
  }>;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
  error?: string;
}

export interface EmailFolder {
  id: string;
  name: string;
  count: number;
  unreadCount: number;
}

class EmailApiService {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
  }

  /**
   * Récupère les emails d'un dossier spécifique
   */
  async getEmails(
    folder: string = "inbox",
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
      sortBy?: "date" | "subject" | "sender";
      sortOrder?: "asc" | "desc";
    },
  ): Promise<EmailApiResponse[]> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    const params = new URLSearchParams({
      folder,
      limit: (options?.limit || 50).toString(),
      offset: (options?.offset || 0).toString(),
      ...(options?.search && { search: options.search }),
      ...(options?.sortBy && { sortBy: options.sortBy }),
      ...(options?.sortOrder && { sortOrder: options.sortOrder }),
    });

    return apiService.get<EmailApiResponse[]>(`/api/v1/emails?${params}`);
  }

  /**
   * Récupère un email spécifique par son ID
   */
  async getEmailById(emailId: string): Promise<EmailApiResponse> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    return apiService.get<EmailApiResponse>(`/api/v1/emails/${emailId}`);
  }

  /**
   * Envoie un email
   */
  async sendEmail(emailData: SendEmailRequest): Promise<SendEmailResponse> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    return apiService.post<SendEmailResponse>("/api/v1/emails/send", emailData);
  }

  /**
   * Marque un email comme lu/non lu
   */
  async markAsRead(
    emailId: string,
    read: boolean = true,
  ): Promise<{ success: boolean }> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    return apiService.patch<{ success: boolean }>(
      `/api/v1/emails/${emailId}/read`,
      { read },
    );
  }

  /**
   * Marque un email comme favori/non favori
   */
  async toggleStar(
    emailId: string,
    starred: boolean,
  ): Promise<{ success: boolean }> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    return apiService.patch<{ success: boolean }>(
      `/api/v1/emails/${emailId}/star`,
      { starred },
    );
  }

  /**
   * Supprime un email (ou le déplace vers la corbeille)
   */
  async deleteEmail(
    emailId: string,
    permanent: boolean = false,
  ): Promise<{ success: boolean }> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    return apiService.delete<{ success: boolean }>(
      `/api/v1/emails/${emailId}${permanent ? "?permanent=true" : ""}`,
    );
  }

  /**
   * Déplace un email vers un autre dossier
   */
  async moveEmail(
    emailId: string,
    folderId: string,
  ): Promise<{ success: boolean }> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    return apiService.patch<{ success: boolean }>(
      `/api/v1/emails/${emailId}/move`,
      { folderId },
    );
  }

  /**
   * Récupère la liste des dossiers
   */
  async getFolders(): Promise<EmailFolder[]> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    return apiService.get<EmailFolder[]>("/api/v1/folders");
  }

  /**
   * Recherche d'emails
   */
  async searchEmails(
    query: string,
    options?: {
      folder?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<EmailApiResponse[]> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    const params = new URLSearchParams({
      q: query,
      limit: (options?.limit || 50).toString(),
      offset: (options?.offset || 0).toString(),
      ...(options?.folder && { folder: options.folder }),
    });

    return apiService.get<EmailApiResponse[]>(
      `/api/v1/emails/search?${params}`,
    );
  }

  /**
   * Récupère les statistiques des emails
   */
  async getStats(): Promise<{
    totalEmails: number;
    unreadCount: number;
    folders: Record<string, { total: number; unread: number }>;
  }> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    return apiService.get("/api/v1/emails/stats");
  }

  /**
   * Télécharge une pièce jointe
   */
  async downloadAttachment(
    emailId: string,
    attachmentId: string,
  ): Promise<Buffer> {
    if (!this.isProduction) {
      throw new Error("Email API only available in production");
    }

    const response = await apiService.get(
      `/api/v1/emails/${emailId}/attachments/${attachmentId}`,
      {
        responseType: "arraybuffer",
      },
    );

    return Buffer.from(response as any);
  }

  /**
   * Vérifie si l'API email est disponible
   */
  isAvailable(): boolean {
    return apiService.isApiAvailable();
  }
}

// Instance singleton
export const emailApiService = new EmailApiService();
export default emailApiService;
