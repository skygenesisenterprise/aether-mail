const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class NotificationsApiService {
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

  async getNotifications(accountId: string, limit: number = 50, offset: number = 0): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/notifications?limit=${limit}&offset=${offset}`);
  }

  async markAsRead(accountId: string, notificationIds: string[]): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/notifications/mark-read", {
      method: "POST",
      body: JSON.stringify({ accountId, notificationIds }),
    });
  }

  async dismissNotification(accountId: string, notificationId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/notifications/${notificationId}/dismiss`, {
      method: "POST",
    });
  }
}

export const notificationsApi = new NotificationsApiService();