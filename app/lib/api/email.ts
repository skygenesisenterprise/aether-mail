import type { Email, EmailListResponse, Folder, FolderListResponse } from "./email-types";
export type {
  Email,
  Attachment,
  Folder,
  EmailListResponse,
  FolderListResponse,
} from "./email-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class EmailApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("accessToken");
    if (!token || token === "undefined" || token === "null") {
      return null;
    }
    return token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    if (!token) {
      throw new Error("Not authenticated");
    }

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async getFolders(accountId: string): Promise<FolderListResponse> {
    return this.request<FolderListResponse>(`/api/v1/accounts/${accountId}/mailboxes`);
  }

  async getFolder(accountId: string, mailboxId: string): Promise<{ success: boolean; data?: Folder; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/mailboxes/${mailboxId}`);
  }

  async createFolder(data: { accountId: string; name: string; parentId?: string }): Promise<{ success: boolean; data?: Folder; error?: string }> {
    return this.request("/api/v1/mailboxes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async renameFolder(mailboxId: string, data: { name: string }): Promise<{ success: boolean; data?: Folder; error?: string }> {
    return this.request(`/api/v1/mailboxes/${mailboxId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteFolder(accountId: string, mailboxId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/mailboxes/${mailboxId}`, {
      method: "DELETE",
    });
  }

  async subscribeFolder(accountId: string, mailboxId: string, subscribe: boolean): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/mailboxes/subscribe", {
      method: "POST",
      body: JSON.stringify({ accountId, mailboxId, subscribe }),
    });
  }

  async getEmails(
    accountId: string,
    options: {
      limit?: number;
      offset?: number;
      folderId?: string;
      isRead?: boolean;
      isStarred?: boolean;
    } = {}
  ): Promise<EmailListResponse> {
    const params = new URLSearchParams();
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.offset) params.set("offset", options.offset.toString());
    if (options.folderId) params.set("folder", options.folderId);
    if (options.isRead !== undefined) params.set("isRead", options.isRead.toString());
    if (options.isStarred !== undefined) params.set("isStarred", options.isStarred.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/emails/${accountId}${queryString ? `?${queryString}` : ""}`;

    return this.request<EmailListResponse>(endpoint);
  }

  async getEmail(
    accountId: string,
    emailId: string
  ): Promise<{ success: boolean; data?: Email; error?: string }> {
    return this.request(`/api/v1/emails/${accountId}/${emailId}`);
  }

  async getEmailRaw(
    accountId: string,
    emailId: string
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    return this.request(`/api/v1/emails/${accountId}/${emailId}/raw`);
  }

  async getThread(accountId: string, threadId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/threads/${threadId}`);
  }

  async sendEmail(data: {
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
    attachments?: { filename: string; content: string; contentType: string }[];
  }): Promise<{ success: boolean; data?: Email; error?: string }> {
    return this.request("/api/v1/emails/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createDraft(data: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
  }): Promise<{ success: boolean; data?: Email; error?: string }> {
    return this.request("/api/v1/emails/draft", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDraft(accountId: string, draftId: string, data: {
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    body?: string;
    isHtml?: boolean;
  }): Promise<{ success: boolean; data?: Email; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/emails/${draftId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteDraft(accountId: string, draftId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/emails/${draftId}`, {
      method: "DELETE",
    });
  }

  async moveEmails(
    accountId: string,
    emailIds: string[],
    toFolderId: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/move", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds, toFolderId }),
    });
  }

  async markEmailsAsRead(
    accountId: string,
    emailIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/action", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds, operation: "markRead" }),
    });
  }

  async markEmailsAsUnread(
    accountId: string,
    emailIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/action", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds, operation: "markUnread" }),
    });
  }

  async starEmails(
    accountId: string,
    emailIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/action", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds, operation: "markStarred" }),
    });
  }

  async unstarEmails(
    accountId: string,
    emailIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/action", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds, operation: "unstar" }),
    });
  }

  async deleteEmails(
    accountId: string,
    emailIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/action", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds, operation: "delete" }),
    });
  }

  async archiveEmails(
    accountId: string,
    emailIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/action", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds, operation: "archive" }),
    });
  }

  async setLabels(
    accountId: string,
    emailIds: string[],
    labels: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/labels", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds, labels }),
    });
  }

  async searchEmails(
    accountId: string,
    query: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<EmailListResponse> {
    return this.request("/api/v1/emails/search", {
      method: "POST",
      body: JSON.stringify({
        accountId,
        query,
        ...options,
      }),
    });
  }

  async quickSearch(accountId: string, query: string, limit: number = 10): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/search/quick", {
      method: "POST",
      body: JSON.stringify({ accountId, query, limit }),
    });
  }

  async getAttachments(accountId: string, emailId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/emails/${emailId}/attachments`);
  }

  async getAttachmentContent(accountId: string, emailId: string, attachmentId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/emails/${emailId}/attachments/${attachmentId}/content`);
  }

  async downloadAttachment(accountId: string, emailId: string, attachmentId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/emails/${emailId}/attachments/${attachmentId}/download`, {
      method: "POST",
    });
  }

  async getIdentities(accountId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/identities`);
  }

  async getSignatures(accountId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/signatures`);
  }

  async createSignature(data: { accountId: string; name: string; content: string; isDefault?: boolean }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/signatures", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSignature(id: string, data: { name?: string; content?: boolean; isDefault?: boolean }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/signatures/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSignature(accountId: string, id: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/signatures/${id}`, {
      method: "DELETE",
    });
  }
}

export const emailApi = new EmailApiService();