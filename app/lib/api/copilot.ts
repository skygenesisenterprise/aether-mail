const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class CopilotApiService {
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

  async chat(message: string, context?: {
    emailIds?: string[];
    threadId?: string;
  }): Promise<{ success: boolean; data?: { response: string; messageId: string }; error?: string }> {
    return this.request("/api/v1/copilot/chat", {
      method: "POST",
      body: JSON.stringify({ message, context }),
    });
  }

  async getHistory(conversationId?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const params = conversationId ? `?conversationId=${conversationId}` : "";
    return this.request(`/api/v1/copilot/history${params}`);
  }

  async summarizeEmails(emailIds: string[]): Promise<{ success: boolean; data?: { summary: string }; error?: string }> {
    return this.request("/api/v1/copilot/summarize", {
      method: "POST",
      body: JSON.stringify({ emailIds }),
    });
  }

  async composeEmail(data: {
    to: string[];
    subject?: string;
    context?: string;
    tone?: "formal" | "casual" | "friendly";
    length?: "short" | "medium" | "long";
  }): Promise<{ success: boolean; data?: { body: string; subject: string }; error?: string }> {
    return this.request("/api/v1/copilot/compose", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async generateReply(emailId: string, data: {
    tone?: "formal" | "casual" | "friendly";
    length?: "short" | "medium" | "long";
    includeQuotedText?: boolean;
  }): Promise<{ success: boolean; data?: { body: string }; error?: string }> {
    return this.request("/api/v1/copilot/reply", {
      method: "POST",
      body: JSON.stringify({ emailId, ...data }),
    });
  }
}

export const copilotApi = new CopilotApiService();