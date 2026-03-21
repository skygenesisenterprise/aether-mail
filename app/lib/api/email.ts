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
      console.log("[Email API] No valid token found in localStorage");
      return null;
    }
    console.log("[Email API] Token found, length:", token.length);
    return token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    console.log(
      "[Email API] Request to:",
      endpoint,
      "has token:",
      !!token,
      "token length:",
      token?.length
    );

    if (!token) {
      console.error("[Email API] No token available");
      throw new Error("Not authenticated");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("[Email API] Request failed:", err);
      throw err;
    }
  }

  async getFolders(accountId: string): Promise<FolderListResponse> {
    return this.request<FolderListResponse>(`/api/v1/mailboxes/${accountId}`);
  }

  async getEmails(
    accountId: string,
    options: {
      limit?: number;
      offset?: number;
      folderId?: string;
    } = {}
  ): Promise<EmailListResponse> {
    const params = new URLSearchParams();
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.offset) params.set("offset", options.offset.toString());
    if (options.folderId) params.set("folder", options.folderId);

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
    subject: string;
    body: string;
  }): Promise<{ success: boolean; data?: Email; error?: string }> {
    return this.request("/api/v1/emails/draft", {
      method: "POST",
      body: JSON.stringify(data),
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

  async markAsRead(
    accountId: string,
    emailIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/mark-read", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds }),
    });
  }

  async markAsUnread(
    accountId: string,
    emailIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/mark-unread", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds }),
    });
  }

  async deleteEmails(
    accountId: string,
    emailIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/emails/delete", {
      method: "POST",
      body: JSON.stringify({ accountId, emailIds }),
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
}

export const emailApi = new EmailApiService();
