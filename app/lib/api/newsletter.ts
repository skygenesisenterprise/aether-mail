const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class NewsletterApiService {
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

  async getNewsletters(accountId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/newsletters`);
  }

  async getNewsletter(accountId: string, newsletterId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/newsletters/${newsletterId}`);
  }

  async createNewsletter(data: {
    accountId: string;
    name: string;
    description?: string;
    fromEmail: string;
    fromName: string;
    subject?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/newsletters", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateNewsletter(id: string, data: {
    name?: string;
    description?: string;
    fromEmail?: string;
    fromName?: string;
    subject?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/newsletters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteNewsletter(accountId: string, newsletterId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/newsletters/${newsletterId}`, {
      method: "DELETE",
    });
  }

  async subscribe(newsletterId: string, email: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/newsletters/${newsletterId}/subscribe`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async unsubscribe(newsletterId: string, email: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/newsletters/${newsletterId}/unsubscribe`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }
}

export const newsletterApi = new NewsletterApiService();